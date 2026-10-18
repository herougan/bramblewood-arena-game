#!/usr/bin/env node
// 2026-10-18 (package U, UI polish). The owner's notes (10:27-10:31):
//    3. 'The "Already played this turn" label does not fade out after hover out if you played a card with the same name'
//    6. "Reduce the size of card shadows by 10%."
//    8. "I think Quarry mole's effects are "?" until Map 0 is complete."
//    9. "Put the title rewards in-line/in-group with skirmish unlocks."
//   10. "In the swap window, place the left cards UI and the right to-swap UI abit further apart."
//   11. "Psychic Dampener is ? until you win Map 41+."
//   16. "New skills: Creative - not sure what it does yet, but it gives Creativity counters to cards somehow"
//   +   "Once my deck is above a certain rarity, don't show me "Put it in my deck" options in the reward menu."
//   +   "Shouldn't Cocoon be a card reward under the baby/egg category? The text should say "An egg! You'll need a place to hatch it.""
//   +   "The Swap UI popping up after 0-2 should wait for my pack opening animation first"
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const shaders = fs.readFileSync(path.join(ROOT, 'bramblewood-shaders.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };

// ---- 3. the why-not label follows the hover, not a mouse click's focus
{ const rule = (tpl.match(/\n\s*\.hand-strip \.card-tile\.unplayable:hover \.whynot-tag[^\n]*/) || [''])[0];
  ok(/:hover \.whynot-tag/.test(rule) && /:focus-visible \.whynot-tag/.test(rule), '3. the label shows on hover and on keyboard focus');
  ok(!/focus-within \.whynot-tag/.test(tpl) && !/\.unplayable\.armed \.whynot-tag\{opacity:1;\}/.test(rule), '3. no :focus-within / plain .armed rule keeps it up after the pointer leaves');
  ok(/@media \(hover:none\)\{ \.hand-strip \.card-tile\.unplayable\.armed \.whynot-tag\{opacity:1;\} \}/.test(tpl), '3. an armed card on a touch screen still shows why'); }

// ---- 6. the board's card shadows reach 10% less far
ok(/\* 0\.0234 \+ vec2\(0\.0, 0\.0144\)/.test(shaders) && /smoothstep\(0\.045, -0\.009, d\)/.test(shaders) && !/\* 0\.026 \+ vec2\(0\.0, 0\.016\)/.test(shaders), '6. shader card shadow: throw and soft edge x0.9');

// ---- 8 / 11. revealAfter: Quarry Mole until Map 0 is cleared, Psychic Dampener until a Map 41+ win
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const mole = cards.find(c=> c.id === 'quarry-mole');
ok(mole && JSON.stringify(mole.revealAfter) === JSON.stringify({map:'m1'}), '8. canonical Quarry Mole carries revealAfter {map:"m1"} (Map 0)');
ok(/psychicDampener:\{icon:'🧠', name:'Psychic Dampener', editor:'psychicdampener', revealAfter:\{mapNum:41\}/.test(src), '11. FIELD2 Psychic Dampener carries revealAfter {mapNum:41}');
{ const a = src.indexOf('[SKILL_REVEAL_BEGIN]'), b = src.indexOf('/* [SKILL_REVEAL_END] */');
  const block = src.slice(src.lastIndexOf('/*', a), b);
  const store = {}; let completed = [], cleared = new Set();
  const MAPNUM = {m1:0, mo:0, mf:1, m40:40, m41:41, m42:42};
  const ctx = {localStorage:{getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }},
    loadConquestProgress: ()=> ({completed}), mapNumberOf: id=> (id in MAPNUM ? MAPNUM[id] : null), conquestMapCleared: id=> cleared.has(id),
    CARD_DEFS_BASELINE: {'quarry-mole': mole}, escapeAttr: s=> String(s), adminModeEnabled: false, Date, JSON, Number, Object, Array, Set, String};
  vm.createContext(ctx);
  vm.runInContext(block + '\n;this.R = {revealAfterMet, maskHiddenSkills, cardRevealAfter};', ctx);
  const R = ctx.R;
  const m0 = R.maskHiddenSkills(mole);
  ok(m0 !== mole && m0.name === 'Quarry Mole' && !Object.keys(m0.effects).length && m0._hiddenSkills === Object.keys(mole.effects).length, '8. before Map 0 is cleared: the name stays, every skill is the one "?"');
  const cloud = Object.assign({}, mole); delete cloud.revealAfter;
  ok(R.maskHiddenSkills(cloud) !== cloud, '8. a cloud edit saved without the field keeps the shipped gate');
  ok(R.maskHiddenSkills({id:'other', effects:{quick:true}}).effects.quick === true, '8. other cards are untouched');
  cleared.add('m1'); ok(R.maskHiddenSkills(mole) === mole, '8. Map 0 cleared: the mole reads in full');
  cleared.clear(); ctx.adminModeEnabled = true; ok(R.maskHiddenSkills(mole) === mole, '8. Admin Mode sees it all'); ctx.adminModeEnabled = false;
  ok(!R.revealAfterMet({mapNum:41}), '11. no fights won: Map 41+ not met');
  completed = ['m40:40-1']; ok(!R.revealAfterMet({mapNum:41}), '11. a Map 40 win is not enough');
  completed = ['m40:40-1', 'm42:42-3']; ok(R.revealAfterMet({mapNum:41}), '11. a win on Map 42 meets "Map 41+"'); }
ok(/function fieldRowState\(key\)\{ if\(fieldRowGated\(key\)\) return 'unknown';/.test(src) && /function fieldRowGated\(key\)\{[^\n]*FIELD2\[key\][^\n]*revealAfterMet\(f\.revealAfter\)/.test(src), '11. a gated field row stays "?" (fieldRowState), everywhere it is read');
ok(/function fieldRowHidden\(key\)\{ return fieldRowState\(key\) === 'unknown' && !\(typeof adminModeEnabled/.test(src), '11. ...and admins still read it');
ok(/function describeEffects\(def, liveCard\)\{\n  def = maskHiddenSkills\(def\);/.test(src) && /function abilityBadges\(d, bopts\)\{\n  d = maskHiddenSkills\(d\);/.test(src), '8. card text and skill strip go through the mask (hand, board, Codex, popover)');

// ---- 9. titles and new fights share one row
{ const rp = fnSrc('rewardsPanelHTML');
  ok(/<div class="rw-row rw-open-row">\$\{openRows\.join\(''\)\}\$\{fightRow\}<\/div>/.test(rp) && !/rw-fight-row/.test(rp), '9. one row: titles, characters, maps and the new fights');
  ok(/\.rw-seen \.rw-open-row \.rw-act\{height:44px;[^}]*background:#f4ecd8; border:3px solid #c9a46a;/.test(tpl), '9. ...in the fights\' chip look'); }

// ---- 10. the swap window's two sides are further apart
ok(/\.ds2-stage\{position:relative; display:flex; justify-content:center; align-items:flex-start; gap:54px;\}/.test(tpl) && /\n    \.ds2-stage\{gap:30px;\}/.test(tpl), '10. swap window gap 34 -> 54px (phones 18 -> 30px)');

// ---- deck rarity floor: no "Put it in my deck" for a downgrade
{ const RT = ['starter','common','uncommon','quest','rare','veryrare','superrare','epic'];
  const defs = {c:{id:'c', rarity:'common'}, u:{id:'u', rarity:'uncommon'}, r:{id:'r', rarity:'rare'}, v:{id:'v', rarity:'veryrare'}, s:{id:'s', rarity:'starter'},
    'egg-bug':{id:'egg-bug', rarity:'uncommon', hatchInto:{species:['Insect']}, source:{kind:'nest', egg:'bug'}}};
  const ctx = {getCardDefs: ()=> defs, RARITY_TIER_BANDS: RT, myDecks: [], mainDeckId: null, getActiveDeck: ()=> null, myDeckCounts: {}, Math, Object};
  vm.createContext(ctx);
  vm.runInContext(fnSrc('deckRarityFloor') + fnSrc('rewardWorthDeckPrompt') + fnSrc('isEggRewardCard') + '\nthis.F = {deckRarityFloor, rewardWorthDeckPrompt, isEggRewardCard};', ctx);
  const F = ctx.F, rares = {r:12, c:8}, mixed = {r:6, c:14}, empty = {};
  ok(F.deckRarityFloor(rares) === RT.indexOf('rare') && F.deckRarityFloor(mixed) === RT.indexOf('common') && F.deckRarityFloor(empty) === -1, 'floor: the tier at least half the deck is at or above');
  ok(!F.rewardWorthDeckPrompt('u', rares) && !F.rewardWorthDeckPrompt('c', rares), 'a deck of mostly rares: no deck offer for an uncommon or a common');
  ok(F.rewardWorthDeckPrompt('r', rares) && F.rewardWorthDeckPrompt('v', rares), '...a rare or better still gets it');
  ok(F.rewardWorthDeckPrompt('u', mixed) && F.rewardWorthDeckPrompt('c', mixed) && !F.rewardWorthDeckPrompt('s', mixed), 'a mostly-common deck: commons and up are offered, a Starter card is not');
  ok(F.rewardWorthDeckPrompt('c', empty), 'an empty deck: everything is offered');
  ok(!F.rewardWorthDeckPrompt('egg-bug', empty) && F.isEggRewardCard(defs['egg-bug']) && !F.isEggRewardCard(defs.u), 'an egg card is never offered for the deck'); }
{ const rp = fnSrc('rewardsPanelHTML');
  ok(/const deckable = cards\.filter\(id=> rewardWorthDeckPrompt\(id\)\)/.test(rp) && /tabOpen\('deck'\) && deckable\.length \? `<button type="button" class="btn small rw-to-deck" id="wlToDeckBtn"/.test(rp), 'the results button only appears for cards worth it (and counts only those)'); }

// ---- egg cards are egg rewards
ok(TEXT['results.egg-card-hatch'] === "An egg! You'll need a place to hatch it.", 'the egg line, as the owner wrote it (TX results.egg-card-hatch)');
{ const rp = fnSrc('rewardsPanelHTML');
  ok(/const eggCards = wonIds\.filter\(id=> isEggRewardCard\(getCardDefs\(\)\[id\]\)\)/.test(rp) && /const cards = wonIds\.filter\(id=> !eggCards\.includes\(id\)\)/.test(rp), 'won egg cards leave the Cards won list');
  ok(/eggCards\.forEach\(id=>\{[^\n]*\n[^\n]*rw-act rw-egg rw-egg-card[^\n]*eggCardRewardNote\(\)/.test(rp), '...and sit with the egg and the baby in the Rewards block, with the egg line');
  ok(/const eggNote = eggCards\.length \? eggCardRewardNote\(\)/.test(rp), '...and the line under the Rewards'); }
ok(/function swapEligibleDef\(d\)\{ return !!\(d && [^\n]*!isEggRewardCard\(d\)/.test(src), 'an egg card is never offered as a deck swap');
{ const egg = cards.filter(c=> /^egg-/.test(c.id)); ok(egg.length >= 7 && egg.every(c=> c.hatchInto), 'every egg-* card has hatchInto (isEggRewardCard finds them all, Cocoon included)'); }

// ---- the swap waits for the pack opening
{ const mo = fnSrc('maybeOfferDeckSwap');
  ok(/if\(packRevealBusy\(\)\) return;/.test(mo), 'the swap check waits while a pack is queued, floating up, or open');
  ok(/packRevealInFlight = true;/.test(src) && /onClose: \(\)=>\{ packRevealInFlight = false; schedulePackReveals\(\); if\(!packRevealQueue\.length\) setTimeout\(\(\)=>\{ try\{ maybeOfferDeckSwap\(\); \}catch\(e\)\{\} \}, 400\); \}/.test(src), 'a reveal is in flight from the queue until its opener closes, which then offers the swap');
  ok(/if\(packRevealBusy\(\)\) return false; \/\/ 2026-10-18/.test(fnSrc('scaleTrailScreenFree')), 'the Scale Trail finale waits for the packs too');
  ok(/setTimeout\(maybeOfferDeckSwap, 600\)/.test(fnSrc('renderConquestSubTab')), 'with no pack, the map still offers the swap');
  const ov = {hidden:true}; const ctx = {document:{getElementById: ()=> ov}, packRevealQueue: [], packRevealInFlight: false};
  vm.createContext(ctx); vm.runInContext(fnSrc('packRevealBusy') + '\nthis.f = packRevealBusy;', ctx);
  ok(!ctx.f(), 'idle: not busy');
  ctx.packRevealInFlight = true; ok(ctx.f(), 'floating up (queue already emptied, no opener yet): busy'); ctx.packRevealInFlight = false;
  ov.hidden = false; ok(ctx.f(), 'opener up: busy'); ov.hidden = true;
  ctx.packRevealQueue.push(1); ok(ctx.f(), 'a pack waiting: busy'); }

// ---- 16. Creative N
{ const E = H.Engine, base = H.loadCardDefs(), so = id=> id===1 ? 'A' : 'B';
  const U = (id, effects)=> ({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}});
  const defs = Object.assign({}, base, {'cr-2': U('cr-2', {creative:2}), 'cr-t': U('cr-t', {creative:true}), 'cr-mate': U('cr-mate'), 'cr-foe': U('cr-foe')});
  const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; };
  const put = (e, P, pid, id)=>{ e.debugSpawnCard(P, so, pid, id, 'left', {}, []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); };
  { const {e, P} = mk(); const C = put(e, P, 1, 'cr-2'), M = put(e, P, 1, 'cr-mate'), F = put(e, P, 2, 'cr-foe'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
    ok(M.creativity === 2 && !C.creativity && !F.creativity, `Creative 2: its one ally gets 2 Creativity, not itself, not a foe (${M.creativity}, ${C.creativity}, ${F.creativity})`);
    const x = ev.find(v=> v.type === 'statusFx' && v.kind === 'creativity'); ok(x && x.attUid === C.uid && x.targetUid === M.uid && x.amount === 2 && x.total === 2 && x.side === 'A', 'the event: statusFx creativity with source, target, amount and total');
    e.resolveCombat(P, so, {}, [], 1); ok(M.creativity === 4, `every upkeep while Ready (${M.creativity})`); }
  { const {e, P} = mk(); const C = put(e, P, 1, 'cr-t'); const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(!C.creativity && !ev.some(v=> v.kind === 'creativity'), 'alone: nobody to give it to, nothing happens'); }
  { const {e, P} = mk(); put(e, P, 1, 'cr-t'); const M = put(e, P, 1, 'cr-mate'); e.resolveCombat(P, so, {}, [], 1); ok(M.creativity === 1, `Creative stored as true: 1 (${M.creativity})`); }
  { const {e, P} = mk(); const C = put(e, P, 1, 'cr-2'); C.wait = 2; const M = put(e, P, 1, 'cr-mate'); e.resolveCombat(P, so, {}, [], 1); const a = M.creativity||0; e.resolveCombat(P, so, {}, [], 1);
    ok(a === 0 && M.creativity === 2, `on Wait 2 it waits, then gives from the upkeep its Wait runs out, as Rebuild (${a}, ${M.creativity})`); } }
ok(/\{key:'creative', category:'passive', label:'Creative', kind:'number', min:1, defaultValue:1, desc:v=> TX\('ui\.creative-desc'/.test(src) && /codexNote:TX\('ui\.creative-codex-note'\)/.test(src), '16. PASSIVE_DEFS: Creative (the skill editor), with its Codex note');
ok(/effect to come/i.test(TEXT['ui.creative-codex-note'] || ''), '16. the Codex says the effect is to come');
ok(/SKILL_ICON\.creative = '🎨';/.test(src) && /creative: v=> TX\('ui\.creative-text'/.test(src) && /'shatter', 'creative', 'rebuild'\]/.test(src), '16. icon, card text, chip on the skill strip');
ok(/creative:0 \/\* 2026-10-18/.test(src), '16. stat budget: costs 0');
ok((src.match(/if\(c\.creativity>0\) badges\.push\(`<span class="abadge creativity" title="\$\{escapeAttr\(creativityTip\(c\.creativity\)\)\}">🎨\$\{c\.creativity\}<\/span>`\)/g) || []).length === 2, '16. the 🎨 N badge on the board (both status renderers)');
ok(/no effect yet/.test(TEXT['ui.creativity-tip'] || '') && /reserved/.test(TEXT['ui.creativity-tip'] || ''), '16. its tooltip: no effect yet, reserved');
ok(/else if\(ev\.kind==='creativity'\)\{[^\n]*rc\.creativity = /.test(src) && /creativity:rc\.creativity\|\|0/.test(src) && /creativity:c\.creativity\|\|0/.test(src), '16. the replay keeps the counters (event, copies)');
ok(!cards.some(c=> c.effects && c.effects.creative), '16. on no card yet');

console.log(`ui-2026-10-18: ${n} checks, ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
