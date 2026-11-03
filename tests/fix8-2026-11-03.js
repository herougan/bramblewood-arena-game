#!/usr/bin/env node
// 2026-11-03 (package FIX8, QA2 docs/qa2-2026-11-03.md): checks, without a browser:
//   M1  the Camp opens by itself once 0-1 and 0-2 are won (fix8AutoCamp), waits for a fight / pack / swap, and is called from the map draw
//   M2  a reward pack with no new card left hands out the least-owned cards and no repeat inside a pack; a faction pack's cards are new first;
//       the tutorial rewards come from your own side (and the shared cards)
//   M4  road wins count on the match ledger; the two Forge achievements wait for the Forge
//   M5  Spanish (all 12 packs): "Next: Goat Ledge" keeps the map name whole, the rows QA2 found untranslated, the templates still match
//   M6  a fight's "@lv" / "@p" overlay copies are never in a pack's pool
//   minors 1, 3, 7, 8, 9, 12, 13 (source checks)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const fn = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unbalanced ' + name); };

// ------------------------------------------------------------ M1 the Camp opens by itself
{
  const log = {toasts: [], dialogues: [], timers: [], unlocked: false};
  const ctx = {
    FEATURE_SPOTS: [{key: 'deck', icon: '⛺', name: 'Camp', dialogue: 'unlock_deck'}],
    featureUnlocked: k=> log.unlocked, loadTutorialDone: ()=> true, loadConquestProgress: ()=> ({}), spotAvailable: ()=> ctx.__avail,
    packRevealBusy: ()=> ctx.__busy, document: {getElementById: ()=> null, querySelector: ()=> null}, tutorialRewardPopPending: false,
    unlockFeature: k=>{ log.unlocked = true; }, SoundKit: {}, showToast: t=> log.toasts.push(t), releaseHeldPacks: ()=> 0, fxHook(){},
    playDialogue: (id, o)=>{ log.dialogues.push([id, o]); }, setTimeout: (f, ms)=> log.timers.push([f, ms]), __avail: true, __busy: false,
  };
  vm.runInNewContext(fn('fix8AutoCamp') + '\nthis.go = fix8AutoCamp;', ctx);
  ctx.__avail = false; ok(ctx.go() === false && !log.unlocked, 'M1: the Camp stays shut before 0-1 and 0-2 are won');
  ctx.__avail = true; ctx.__busy = true; ok(ctx.go() === false && !log.unlocked && log.timers.length === 1, 'M1: with a pack on screen it waits and tries again');
  ctx.__busy = false; ok(ctx.go() === true && log.unlocked, 'M1: once 0-1 and 0-2 are won (and nothing is in the way) the Camp unlocks by itself');
  ok(log.toasts.length === 1 && /Camp/.test(log.toasts[0]), 'M1: with a toast that names it');
  ok(log.dialogues.length === 1 && log.dialogues[0][0] === 'unlock_deck' && log.dialogues[0][1].once, 'M1: and its conversation plays once');
  ok(ctx.go() === false && log.dialogues.length === 1, 'M1: an open Camp is left alone');
  ok(/setTimeout\(fix8AutoCamp, 900\)/.test(fn('renderConquestSubTab')), 'M1: the map draw calls it');
  ok(/'deck'.*tabs:\['deck'\]/.test(src) && /big\('deck','⛺','Camp'\)/.test(src), 'M1: Home keeps a Camp tile (it shows once the Camp is open, so the way back is always there)');
}

// ------------------------------------------------------------ M6 / M2 packs
{
  const defs = {};
  const card = (id, extra)=> { defs[id] = Object.assign({id, name: id, rarity: 'common', attack: 1, health: 1}, extra || {}); };
  ['house-cat', 'pond-duck', 'mole', 'field-mouse', 'sparrow'].forEach(id=> card(id));
  card('bramble-sprout@lv1', {derivedFrom: 'bramble-sprout'}); card('house-cat@p3', {derivedFrom: 'house-cat'});
  const owned = {'house-cat': 6, 'pond-duck': 1, 'mole': 1, 'field-mouse': 1, 'sparrow': 1};
  const ctx = {getCardDefs: ()=> defs, BASIC_PACK_POOLS: [1], BASIC_PACK_TIERS: [1], pitchingUnlocked: ()=> true, adminModeEnabled: false, trackMapReached: ()=> 2,
    isUnattainable: ()=> false, isEasterEgg: ()=> false, hofBlocked: ()=> false, SPELLS_SHELVED: false, isEquipmentDef: ()=> false, packCardReached: ()=> true, packPoolOf: ()=> 1,
    PACK_RARITY_WEIGHT: {common: 6}, packRarityShares: ()=> null, copiesOwned: id=> owned[id] || 0, myUnlockedCardIds: new Set(Object.keys(owned)), Math};
  vm.runInNewContext([fn('packCardPool'), fn('rollPackCards'), 'this.pool = packCardPool; this.roll = rollPackCards;'].join('\n'), ctx);
  const pool = ctx.pool(null, 1, false, true);
  ok(!pool.some(id=> /@/.test(id)), 'M6: no overlay copy ("@lv1", "@p3") is in a pack pool while a fight\'s overlay is live: ' + pool.join(','));
  ok(pool.length === 5, 'M6: the real cards are all still there (' + pool.length + ')');
  // M2: forty one-card level packs with every card already owned
  const got = {};
  for(let i = 0; i < 40; i++){ const r = ctx.roll({id: 'x', cards: 1, pool: 1}, {newFirst: true, gated: true}); r.forEach(id=>{ got[id] = (got[id] || 0) + 1; owned[id] = (owned[id] || 0) + 1; }); }
  const counts = Object.values(got);
  ok(Object.keys(got).length >= 4, 'M2: forty one-card reward packs spread over the pool, not all House Cat: ' + JSON.stringify(got));
  ok((got['house-cat'] || 0) <= 4, 'M2: the card you hold six of is not the one handed out again (' + (got['house-cat'] || 0) + ')');
  const three = ctx.roll({id: 'y', cards: 3, pool: 1}, {newFirst: true, gated: true});
  ok(new Set(three).size === 3, 'M2: no card twice inside one pack while the pool has more: ' + three.join(','));
  ok(/FIX8, QA2 M2/.test(fn('rollFactionPackCards')) && /FIX8, QA2 M2/.test(fn('factionPackPoolPick')), 'M2: the faction pack\'s own and general cards pick new ones first');
  ok(/factionDrawSet\(TUTORIAL_FACTION_REWARDS\[stage - 1\], null, loadFactionChoice\(\) !== 'both'\)/.test(src) && /factionSideOf\(defs\[id\]\) === 'other'/.test(fn('factionSetPick')), 'M2: the tutorial reward cards are drawn from your own side and the shared cards (not for a "both" pick)');
}

// ------------------------------------------------------------ M4 road wins and the Forge achievements
{
  ok(!/m\.mode!=='conquest' && m\.mode!=='sandbox' && m\.mode!=='tutorial' && m\.mode!=='coop'\) recordMatchResult/.test(src), 'M4: the match ledger no longer skips road fights');
  ok(/recordMatchResult\(m\.winner, m\.mode\)/.test(src) && /!\(m\.mode==='conquest' && \(m\.adminTest \|\| m\.proFight\)\)/.test(src), 'M4: ... except an admin test or a reference preview');
  const rm = fn('recordMatchResult');
  ok(/if\(!mode \|\| mode === 'ai'\)\{ grantCurrency\('gold'/.test(rm), 'M4: and a road win pays nothing extra through it (gold and dust only for quick battles)');
  const line = id=> new RegExp(`\\{id:'${id}'[^\\n]*`).exec(src)[0];
  const prog = id=> { const m = /progress:(ctx=>[^,]*?(?:\?[^,]*)?)(?:, reward)/.exec(line(id)); return vm.runInNewContext('(' + m[1] + ')'); };
  const l1 = prog('leveler_1'), l10 = prog('leveler_10');
  ok(l1({forgeOpen: false, leveledCards: 5}) === 0 && l1({forgeOpen: true, leveledCards: 5}) === 1, 'M4: First Steps in the Forge waits for the Forge');
  ok(l10({forgeOpen: false, leveledCards: 12}) === 0 && l10({forgeOpen: true, leveledCards: 12}) === 12, 'M4: Forge Regular waits for the Forge');
  ok(/forgeOpen: featureUnlockedSafe\('forge'\)/.test(fn('achievementContext')), 'M4: the context reads whether the Forge is open');
}

// ------------------------------------------------------------ M5 Spanish names and the untranslated rows
{
  const {createTranslator} = require(path.join(ROOT, 'bramblewood-i18n.js'));
  const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const rd = rel=> JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  CODES.forEach(c=>{
    const main = rd('lang/' + c + '.json'), ui = rd('lang/ui/' + c + '.json'), pack = Object.assign({}, ui, main), t = createTranslator(pack), goat = pack['Goat Ledge'];
    ['The sound of each place: birds, wind, water, drips.', 'A slow, quiet piano on the map and in menus.'].forEach(k=> ok(typeof main[k] === 'string' && main[k] !== k, `${c}: Settings hint "${k.slice(0, 24)}..." is translated`));
    if(goat){ const r = t('Next: Goat Ledge'); ok(r && r.includes(goat), `${c}: "Next: Goat Ledge" keeps the map name whole (${r})`); }
    ok(t('Next: Thistlewood at Gate') != null, `${c}: "Next: {v1} at {v2}" still matches a name with " at " in it`);
    const cl = t('Thistlewood 4/5 cleared'); ok(cl && !/cleared/.test(cl) && /4\/5|4\/5/.test(cl), `${c}: "Thistlewood 4/5 cleared" is translated (${cl})`);
    const cc = t('48 cards collected'); ok(cc && !/collected/.test(cc) && cc.includes('48'), `${c}: "48 cards collected" is translated (${cc})`);
    const sp = t('Clear Sable Swampmire / The Morel Hollow'); ok(sp && !/^Clear /.test(sp), `${c}: the side-map pointer "Clear A / B" is translated (${sp})`);
    ok(t('Cleared') && t('Cleared') !== 'Cleared', `${c}: "Cleared"`);
  });
  const es = createTranslator(Object.assign({}, rd('lang/ui/es.json'), rd('lang/es.json')));
  ok(es('Next: Goat Ledge') === 'Siguiente: Saliente de las cabras', 'M5: Spanish Home says "Siguiente: Saliente de las cabras" (was "Go a Ledge")');
  ok(/\\\\s\+\|\(\?<!/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-i18n.js'), 'utf8')) || /\(\?<!\[\\\\p\{L\}/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-i18n.js'), 'utf8')), 'M5: the optional space next to a literal word needs a non-letter on the other side');
  ok(fs.existsSync(path.join(ROOT, 'tools/i18n_2026_11_03_fix8.py')), 'M5: the rows come from tools/i18n_2026_11_03_fix8.py');
}

// ------------------------------------------------------------ minors
{
  ok(/FIX8, QA2 minor 1\): "1 cards" fixed/.test(src) && /o\.results\.length === 1 \? '1 card'/.test(src), 'minor 1: "1 card", and no "1/2" on the pack beside "Pack 1 of 2"');
  ok(/body > \.speech-bubble/.test(fn('endMatch')), 'minor 3: leaving a fight clears its last speech bubble');
  ok(/waited < 5000/.test(fn('wireWinLossRewardAnim')), 'minor 7: the reward count starts after 5 s at most');
  ok(/mapLockReason\(firstLocked, progress\)/.test(src), 'minor 8: the locked map\'s tip names the fights still to win');
  ok(/playMap = map\.id/.test(fn('homeTileDetails')) && /data-fix8map/.test(src) && /conquestSelectedMap = pm\.id/.test(src), 'minor 9: Home\'s Play opens the map its "Next" fight is on');
  ok(/isMapUnlocked\(map, loadConquestProgress\(\)\)\) \)?;? ?\}catch|!map\.reserved && isMapUnlocked/.test(src), 'minor 12: the Battlefield list holds only maps you can open (no Reserved ones)');
  ok(/@media \(max-width:520px\)\{ \.tip-ticker\{min-height:5\.8em;\} \}/.test(css), 'minor 13: the tip ticker has room for three lines at 390');
}

console.log(fail ? `FAIL ${fail} (${pass} passed)` : `OK ${pass} checks`);
process.exit(fail ? 1 : 0);
