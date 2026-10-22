#!/usr/bin/env node
// 2026-10-23 (package PG, owner report of 01:03, items 6, 8, 9, 10, 13): static and evaluated checks that
//   1. the deck copy ladder is Common 5, Uncommon 4, Rare 3, Very Rare 2, every rarity above 1 (Starter as Common, special rarities as their
//      tier), the same in bramblewood-ghosts.js; the top-rank caps (DR) still apply on top;
//   2. Base / starter / tutorial-reward cards are no longer free and unlimited: the deck builder's pool holds only cards you have, a deck holds
//      only the copies you own (click, drag, swap, import, the fight gate), and the starting deck is one copy of each card, 20 with the
//      tutorial's rewards; a tutorial reward is never held for pitching (it made a second copy arrive at 0-1);
//   3. a signpost to a locked map leaves you where you are and says what opens it; the locked notice names it and offers the way back; the
//      fight that clears a map takes you to the next one;
//   4. the new texts are TX keys, translated in the 12 packs.
// The flows were played headlessly (fresh account through T-1, T-2, 0-1 … 0-4, 1-1 … 1-5); screenshots in docs/screens/PG/.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const ghosts = fs.readFileSync(path.join(ROOT, 'bramblewood-ghosts.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const between = (s, a, b)=>{ const i = s.indexOf(a); return i < 0 ? '' : s.slice(i, s.indexOf(b, i) + b.length); };

// --- 1. the ladder
const MAXC = vm.runInNewContext(between(src, 'const RARITY_MAX_COPIES = {', '};') + '; RARITY_MAX_COPIES');
const want = {common:5, uncommon:4, rare:3, veryrare:2, superrare:1, epic:1, heroic:1, unique:1, legendary:1, mythic:1, ancient:1, divine:1, void:1, daemonic:1, starter:5, quest:4, questunique:1, special:3, devlegendary:1, devancient:1, eventlegendary:1, eventrare:3};
ok(JSON.stringify(MAXC) === JSON.stringify(want), '1. RARITY_MAX_COPIES is 5 / 4 / 3 / 2 / 1 … (Starter = Common, special rarities as their tier): ' + JSON.stringify(MAXC));
const GMAXC = vm.runInNewContext(between(ghosts, 'const RARITY_MAX_COPIES = {', '};') + '; RARITY_MAX_COPIES');
ok(JSON.stringify(GMAXC) === JSON.stringify(want), '1. bramblewood-ghosts.js has the same table');
ok(/RARITY_MAX_COPIES\.common; \}/.test(fnSrc('maxCopiesForRarity')), '1. an unknown rarity falls back to the Common limit (was 10)');
ok(/deckRankBlockFor\(counts, id, getCardDefs\(\), deckLeaderIds\(\)\)/.test(fnSrc('deckCardClick')), '1. the top-rank caps (DR) still hold in the deck builder');

// --- 2. owned copies only
ok(!/Infinity/.test(fnSrc('ownedCopiesOf')) && !/d\.basic \|\| d\.rarity==='starter'/.test(fnSrc('ownedForDeck')), '2. no card is free and unlimited any more (ownedCopiesOf / ownedForDeck)');
ok(/function isUnlimitedCard\(id\)\{ return false; \}/.test(src), '2. isUnlimitedCard is false for every card');
{ // ownedCopiesOf / deckCopyLimit / clampDeckToLimits evaluated
  const defs = {a:{id:'a', rarity:'common'}, b:{id:'b', rarity:'starter', basic:true}, c:{id:'c', rarity:'rare'}, l:{id:'l', rarity:'legendary'}};
  const copies = {a:[{}, {}, {}, {}, {}, {}, {}], b:[{}], c:[{}, {}, {}, {}]};
  const ctx = {getCardDefs: ()=> defs, myCardCopies: copies, myUnlockedCardIds: new Set(['l']), HERO_ID: 'hero', maxCopiesForRarity: r=> MAXC[r] || 5, editionRootId: d=> d.id, Math, Number, Object};
  const f = new Function(...Object.keys(ctx), [fnSrc('ownedCopiesOf'), fnSrc('deckCopyLimit'), fnSrc('clampDeckToLimits'), 'return {ownedCopiesOf, deckCopyLimit, clampDeckToLimits};'].join('\n'))(...Object.values(ctx));
  ok(f.ownedCopiesOf('b') === 1, '2. a Base / starter card counts the copies you hold (1), not Infinity');
  ok(f.deckCopyLimit('a') === 5 && f.deckCopyLimit('b') === 1 && f.deckCopyLimit('c') === 3 && f.deckCopyLimit('l') === 1, '2. deckCopyLimit = the rarity limit or the copies owned, whichever is lower');
  const r = f.clampDeckToLimits({a:9, b:3, c:2, l:1, zz:2}, 'l');
  ok(JSON.stringify(r.counts) === JSON.stringify({a:5, b:1, c:2}) && r.cut.length === 3, '2. an imported deck is cut to the limits, the leader taken out, unknown cards dropped: ' + JSON.stringify(r));
}
ok(/\(myDeckCounts\[defId\]\|\|0\) >= ownedCopiesOf\(defId\)/.test(src), '2. dragging a card into the deck checks the copies you own too');
ok(/const owned = ownedCopiesOf\(id\);\s*\n\s*if\(owned !== Infinity && \(counts\[id\]\|\|0\) >= owned\)/.test(fnSrc('deckCardClick')), '2. a click never adds past the copies you own');
ok(/deckCopyProblem\(myDeckCounts\)/.test(fnSrc('deckSizeOkOrWarn')), '2. a fight refuses a deck over a copy limit, naming the card');
ok(/clampDeckToLimits\(result\.deck\.counts, result\.deck\.leaderId\)/.test(src), '2. deck import is cut to the limits');
ok(/deckCopyLimit\(newId, defs\)/.test(fnSrc('swapOutAllowed')), '2. a swap offer never goes past the limits');
ok(/deckLimitChipHTML\(id, used\)/.test(fnSrc('renderMyDeckPanels')) && /pg-limit/.test(fnSrc('deckLimitChipHTML')), '2. the Camp pool shows "in deck / limit" on each card');
{ const rp = fnSrc('renderMyDeckPanels'), at = rp.indexOf("document.querySelectorAll('#myDeckPool .card-tile:not(.locked):not(.is-look-tile)')"), def = rp.indexOf('const fast = id=>');
  // the pool click must sit inside the block that declares fast(): count the braces opened between the two
  const seg = at > def && def > 0 ? rp.slice(def, at) : ''; let d = 0; for(const ch of seg){ if(ch === '{') d++; else if(ch === '}') d--; }
  ok(def > 0 && at > def && d >= 0 && /fast\(id\), true\); \}\)\); \}/.test(rp), '2. a click on a Camp pool card adds it (the listener sits where fast() exists; it threw "fast is not defined" since package ED)'); }
ok(/!isTutorialCopySource\(source\) && !pitchingUnlocked\(\)/.test(fnSrc('unlockCardForPlayer')), '2. a tutorial reward is never held for pitching (no second copy at 0-1)');
ok(/isBaseSourceCard\(id\)/.test(fnSrc('grandfatherBaseCopies')) && /loadTutorialDone\(\)/.test(fnSrc('grandfatherBaseCopies')), '2. saves from before: Base cards in old decks get real copies once (not for a new account)');
{ // the starting deck: one copy each, 20 with the rewards
  const cfgSrc = between(src, 'const STARTER_CFG_DEFAULT = {', '\n};');
  const STARTER_CFG_DEFAULT = vm.runInNewContext('(' + cfgSrc.replace('const STARTER_CFG_DEFAULT = ', '').replace(/;$/, '') + ')');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')); const defs = {}; cards.forEach(c=> defs[c.id] = c);
  const mk = (rewards, rewards2)=> new Function('getCardDefs', 'tutorialCfg', 'STARTER_CFG_DEFAULT', 'STARTER_SHOWN', 'DECK_SIZE', 'tutorialRewardIds', 'tutorialRewards2',
    [fnSrc('starterDeckTarget'), fnSrc('starterDeckParts'), 'return starterDeckParts;'].join('\n'))(()=> defs, null, STARTER_CFG_DEFAULT, 8, 20, ()=> rewards, ()=> rewards2);
  for(const pick of ['otters', 'hummingbirds', 'both']){
    const p = mk([], ['x', 'y'])(pick), n = Object.values(p.all);
    ok(n.every(k=> k === 1) && n.length === 18, `2. ${pick}: the starting deck is 18 different cards, one copy each (+ T-2's two rewards = 20): ${n.length}`);
    ok(Object.keys(p.shown).length === 8 && Object.keys(p.shown).every(id=> p.all[id]), `2. ${pick}: Part I shows the first 8`);
    const other = pick === 'otters' ? 'hummingbirds' : pick === 'hummingbirds' ? 'otters' : null;
    ok(!other || Object.keys(p.all).every(id=> defs[id].faction !== other), `2. ${pick}: no card of the other side`);
  }
  ok(Object.keys(mk(['q'], ['x', 'y'])('otters').all).length === 17, '2. a T-1 reward takes one more place (17 + 1 + 2 = 20)');
}
ok(/id === HERO_ID\) \|\| id === 'wandering-traveller'\) return;/.test(fnSrc('tutorialStarterCopiesLevel0')) && !/isUnlimitedCard/.test(fnSrc('tutorialStarterCopiesLevel0')), '2. every card of the starting deck gets its copy (whatever its source)');

// --- 3. maps
const act = fnSrc('performDialogueAct');
ok(/isMapUnlocked\(tm, loadConquestProgress\(\)\)/.test(act) && /mapLockReason\(tm\)/.test(act), '3. a signpost to a locked map stays put and says why');
ok(/text:'Thistlewood is the next one along\. Want to see where it sits\?', options:\[\{label:'Show me the road\.', goto:'go', act:'map:mf'\}/.test(src) && !/act:'map:mq'/.test(src), '3. Map 0\'s signpost points at Thistlewood, the real next map (it named Clovermead, a side map that waits on Map 12)');
ok(!/This map is locked — clear the previous map/.test(src) && /id="pgLockedBack"/.test(src), '3. the locked notice names what opens the map and offers the way back');
ok(/conquestAutoAdvanceTo = nx\.id/.test(fnSrc('completeConquestNode')) && /conquestAutoAdvanceTo && !matchState/.test(fnSrc('renderConquestSubTab')), '3. the fight that clears a map takes you to the next one');
{ // mapLockReason with a small map table
  const maps = [{id:'m1', nodes:[{key:'0-1', kind:'skirmish'}, {key:'0-2', kind:'skirmish'}]}, {id:'mf', unlockAfter:'m1', nodes:[{key:'1-1', kind:'skirmish'}]},
    {id:'mq', sub:true, parent:'mf', entry:{after:'1-1'}, nodes:[{key:'1-A-1', kind:'skirmish'}]}];
  maps.forEach(m=> m.name = m.id.toUpperCase());
  const prog = {completed:['m1:0-1']};
  const TXs = (k, p)=> k + ':' + JSON.stringify(p || {});
  const ctx = {CONQUEST_MAPS: maps, loadConquestProgress: ()=> prog, TX: TXs, mapNumberOf: id=> ({m1:0, mf:1})[id], isMapUnlocked: (m, p)=> !m.unlockAfter && !m.sub || (m.id === 'mf' && p.completed.includes('m1:0-2')),
    loadDialogueFlags: ()=> ({}), conquestMapCleared: ()=> false, conquestNodeId: (a, b)=> a + ':' + b, skirmishCode: (a, b)=> b, baseKind: k=> k};
  const why = new Function(...Object.keys(ctx), fnSrc('mapLockReason') + '\nreturn mapLockReason;')(...Object.values(ctx));
  ok(/ui\.pg-lock-main/.test(why(maps[1])) && /"codes":"0-2"/.test(why(maps[1])), '3. a main map: the fights of the map before still to win: ' + why(maps[1]));
  ok(/ui\.pg-lock-parent/.test(why(maps[2])), '3. a side map whose parent is locked says to reach the parent first');
}

// --- 4. texts
const CODES = ['de','es','fr','id','it','ja','ko','pt','ta','tl','zh-Hans','zh-Hant'];
const packs = Object.fromEntries(CODES.map(c=> [c, Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')))]));
const KEYS = ['ui.pg-limit-tip', 'toast.pg-deck-over-copy-limit', 'toast.pg-deck-over-owned', 'toast.pg-import-cut', 'ui.pg-map-n', 'ui.pg-lock-soon', 'ui.pg-lock-parent', 'ui.pg-lock-quest', 'ui.pg-lock-clear-map', 'ui.pg-lock-fight', 'ui.pg-lock-main', 'ui.pg-lock-later', 'ui.pg-lock-back'];
for(const k of KEYS){ ok(TEXT[k], `4. ${k} is a TX key`); if(TEXT[k]) for(const c of CODES) ok(packs[c][TEXT[k]], `4. ${c} translates "${TEXT[k]}"`); }
for(const k of KEYS) ok(src.includes(`'${k}'`), `4. ${k} is used`);

console.log(`pg-2026-10-23: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
