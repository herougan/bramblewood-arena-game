#!/usr/bin/env node
// Package UI4 (2026-10-23, owner notes 01:03 / 01:09 / 01:57). Headless checks; the browser half is tests/e2e/ui4_2026_10_23.py.
//   1. engine.previewPlayStats (the hand's blue numbers, 01:57 #11): what it says equals what the card really swings for / has once it is
//      played (Swarm, War Banner, Formation), it returns null for spells, and it changes nothing (a seeded fight with previews every turn
//      plays out exactly like one without: same events, same next uid, no derived defs left behind)
//   2. placeCard still makes the same unit (its arrival bonuses moved into arrivalBoardCard): Vanguard, the first-unit bonus
//   3. the app: deck slots (1 to start, prices, map gates, the grandfathering), the several-swap window, the board kept under the
//      results, the icon-only top row, the Environment fan, the results' item tip, the panel's enemy level, the pack's badge and ring
//   4. texts: every UI4 key in the TEXT table and in the 12 packs, the old "first 3 Conquest wins" text gone everywhere
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'); const E = H.Engine;
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'u4-ant':    {id:'u4-ant', name:'U4 Ant', attack:1, health:5, wait:0, cost:0, archetypes:['Ants'], effects:{swarm:true}},
  'u4-mate':   {id:'u4-mate', name:'U4 Mate', attack:1, health:9, wait:0, cost:0, archetypes:['Ants'], effects:{}},
  'u4-banner': {id:'u4-banner', name:'U4 Banner', attack:0, health:9, wait:0, cost:0, archetypes:['Bird'], effects:{banner:2}},
  'u4-plain':  {id:'u4-plain', name:'U4 Plain', attack:1, health:5, wait:0, cost:0, archetypes:['Fish'], effects:{}},
  'u4-form':   {id:'u4-form', name:'U4 Form', attack:1, health:5, wait:0, cost:0, archetypes:['Fish'], effects:{formation:1}},
  'u4-van':    {id:'u4-van', name:'U4 Van', attack:1, health:5, wait:0, cost:0, archetypes:['Fish'], effects:{vanguard:2}},
  'u4-wall':   {id:'u4-wall', name:'U4 Wall', attack:0, health:999, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function setup(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 1), {recordEvents:true, battleMode:'open'}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}; P[1].lumber = 10; return {e, P}; }
// play the hand card for real and measure: its swing on a 999-Health wall (no Armor), and its Health
function playAndMeasure(e, P, uid){
  const ok1 = e.placeCard(P, so, 1, uid, 'right', {}, []); if(!ok1) return null;
  const c = all(P[1]).find(x=> x.uid === Math.max(...all(P[1]).map(y=> y.uid)));
  e.roundStart && 0; e.syncPhaseStats(P, so, []);
  const ev = []; e.debugAttack(P, so, c.uid, {}, ev); const hit = ev.find(x=> x.type === 'hit' || x.type === 'hitHQ');
  return {atk: hit ? hit.dmg : null, hp: c.hp};
}
// ---- 1. the preview is the real thing
for(const [name, board, hand] of [
  ['Swarm: an Ant with 3 Ants out swings 1 + 3', ['u4-mate', 'u4-mate', 'u4-ant'], 'u4-ant'],
  ['War Banner 2 on the board: a 1-Attack card swings 3', ['u4-banner'], 'u4-plain'],
  ['Formation next to an ally', ['u4-plain'], 'u4-form'],
  ['nothing on the board: the printed numbers', [], 'u4-plain'],
]){
  const {e, P} = setup(3); board.forEach((id, i)=> e.debugSpawnCard(P, so, 1, id, i % 2 ? 'left' : 'right', {}, [])); e.debugSpawnCard(P, so, 2, 'u4-wall', 'left', {}, []);
  P[1].hand.push({uid: 5000, defId: hand}); P[1].cardsPlayedEver = 3;
  const pv = e.previewPlayStats(P, 1, 5000); const real = playAndMeasure(e, P, 5000);
  ok(pv && real && pv.atk === real.atk && pv.hp === real.hp, `1. ${name}: preview ${JSON.stringify(pv)} = played ${JSON.stringify(real)}`);
}
{ const {e, P} = setup(3); e.debugSpawnCard(P, so, 1, 'u4-mate', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'u4-mate', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'u4-mate', 'right', {}, []);
  P[1].hand.push({uid: 5001, defId: 'u4-ant'}); const pv = e.previewPlayStats(P, 1, 5001);
  ok(pv && pv.atk === 4, `1. the owner's example: an Ant Scout-like 1-Attack Swarm card with 3 Ants out previews 1 + 3 = 4 (got ${pv && pv.atk}; UI4-2 asks whether it should be 5)`); }
{ const spell = Object.keys(base).find(id=> base[id].cardType === 'spell'); const {e, P} = setup(3);
  if(spell){ P[1].hand.push({uid: 5002, defId: spell}); ok(e.previewPlayStats(P, 1, 5002) === null, '1. a spell has no preview'); } }
// no leak: two seeded fights, one with previews before every play
function fight(withPreview){
  const {e, P} = setup(11); const evs = []; e.debugSpawnCard(P, so, 2, 'u4-wall', 'left', {}, evs);
  const ids = ['u4-ant', 'u4-mate', 'u4-banner', 'u4-form', 'u4-ant', 'u4-plain'];
  ids.forEach((id, i)=>{ P[1].hand.push({uid: 6000 + i, defId: id}); });
  ids.forEach((id, i)=>{
    if(withPreview) P[1].hand.forEach(h=> e.previewPlayStats(P, 1, h.uid));
    P[1].playedThisTurn = false; P[1].lumber = 10; e.placeCard(P, so, 1, 6000 + i, i % 2 ? 'left' : 'right', {}, evs);
    e.resolveCombat(P, so, {}, evs, 1);
  });
  const probe = e.makeBoardCard('u4-plain');
  return {events: JSON.stringify(evs), next: probe.uid, derived: Object.keys(e.derivedDefs || {}).length, board: JSON.stringify(all(P[1]).map(c=> [c.defId, c.atk, c.hp]))};
}
{ const a = fight(false), b = fight(true);
  ok(a.events === b.events, '1. previews leave the fight untouched: the same events');
  ok(a.next === b.next, `1. ... the same next uid (${a.next} / ${b.next})`);
  ok(a.board === b.board && a.derived === b.derived, '1. ... the same board and derived defs'); }
// ---- 2. placeCard's arrival is unchanged in effect
{ const {e, P} = setup(4); P[1].hand.push({uid: 7000, defId: 'u4-van'}); const pv = e.previewPlayStats(P, 1, 7000);
  e.placeCard(P, so, 1, 7000, 'right', {}, []); const c = all(P[1])[0];
  ok(c.atk === 3 && c.maxHp === 7 && c.vanguardUp === 2 && pv && pv.atk === 3 && pv.hp === 7, `2. Vanguard 2 on the first card: 3/7 (played ${c.atk}/${c.maxHp}, preview ${pv && pv.atk}/${pv && pv.hp})`); }
{ const {e, P} = setup(4); P[1].firstUnitAtkBonus = 2; P[1].hand.push({uid: 7001, defId: 'u4-plain'}); P[1].hand.push({uid: 7002, defId: 'u4-plain'});
  const pv = e.previewPlayStats(P, 1, 7001); ok(!P[1].firstUnitBonusUsed, '2. a preview does not use up the first-unit bonus');
  e.placeCard(P, so, 1, 7001, 'right', {}, []); P[1].playedThisTurn = false; e.placeCard(P, so, 1, 7002, 'left', {}, []);
  const [x, y] = all(P[1]).sort((p, q)=> p.uid - q.uid);
  ok(pv && pv.atk === 3 && x.atk === 3 && y.atk === 1, `2. the first-unit bonus: preview 3, first played 3, second 1 (${pv && pv.atk}, ${x.atk}, ${y.atk})`); }
// ---- 3. the app
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'), fxd = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-d.js'), 'utf8');
{ const m = app.match(/const DECK_SLOT_STEPS = (\[[\s\S]*?\n\]);/); let steps = null; try{ steps = eval(m[1]); }catch(e){}
  ok(steps && steps.length === 6 && steps[0].slot === 2 && steps[0].cost.dust === 150 && steps[0].cost.gold === 150 && steps[1].cost.dust === 300 && !steps[0].map && !steps[1].map, '3. deck slots 2-3: Dust and Maple Leaves, no map gate');
  ok(steps && [15, 21, 27, 33].every((mp, i)=> steps[2 + i].map === mp && Object.keys(steps[2 + i].cost.mats || {}).length > 0), '3. slots 4-7 need Maps 15 / 21 / 27 / 33 and a Materia');
  ok(/n < Math\.max\(1, have\)/.test(app) && /grandfathered/.test(app), '3. a save keeps the decks it has (slots start at its deck count)');
  ok((app.match(/deckSlotDenied\(/g) || []).length >= 4, '3. New deck (list, editor chip) and Import ask for a free slot');
  ok(/deckSlotPanelHTML\('tavern'\)/.test(app) && /deckSlotPanelHTML\('camp'\)/.test(app), '3. the slots are bought in the Camp and the Tavern'); }
ok(/queueMultiDeckSwap\(results\.map\(r=> r\.id\), 'factionPack'\)/.test(app) && /function openMultiDeckSwap/.test(app), '3. a faction pack queues one several-swap window');
ok(/function ds2CrossSwap/.test(app) && /ds2CrossSwap\(ov\);/.test(app), '3. the one-card swap crosses the cards over');
ok(/keptRows\.forEach\(old=>/.test(app) && /el\.__bwMatch === m/.test(app), '3. the results keep the board rows (no redraw under them)');
ok(/function fitTopRowControls/.test(app) && /\.top-row-controls\.is-compact \.trc-lbl/.test(tpl) && /👑<span class="trc-lbl"> Auto-win<\/span>/.test(app), '3. the top row goes icon-only when short; Auto-win / Auto-play have labels to drop');
ok(/--env-tight:calc\(1 \+ \.8 \* min\(1, max\(0, \(var\(--n, 1\) - 2\) \/ 4\)\)\)/.test(tpl), '3. the Environment fan tightens up to 1.8x');
ok(/data-tip="\$\{escapeAttr\(kd\.name \+ ': ' \+ kd\.desc\)\}"/.test(app), "3. the results' item chip says what the item does (RW4, 2026-10-23: its name, then what it does; the chip is the icon alone)");
ok(/const fit = L=> early != null \? Math\.max\(0, L\) : Math\.max\(base, L\);/.test(app), "3. the map panel's enemy tiles follow the fight's level (EB's Level 0 too)");
ok(/is-desk-centre/.test(app) && /html\.is-desk-centre #appWrap\.in-match\{padding-top:var\(--fs-shift/.test(tpl), '3. a desktop window centres the field outside full screen too');
ok(/\.fxd-seal\{position:absolute; left:50%; top:calc\(50\.5% - 19px\)/.test(fxd) && /\.po2-label \.po2-ico\{position:absolute; top:0; left:50%; margin:0;/.test(tpl), "3. the pack's seal and badge stay off its name");
ok(/\.po2-strip:not\(\.is-kbd\):focus-visible/.test(tpl), '3. no focus ring on the strip unless the keyboard is used');
ok(/applyHandPreviewStats\(m, me, strip\)/.test(app) && /previewPlayStats/.test(app), '3. the hand asks the engine for its would-be numbers');
// ---- 4. texts
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const KEYS = Object.keys(T).filter(k=> /\.ui4-/.test(k));
ok(KEYS.length >= 25, `4. the UI4 keys are in the TEXT table (${KEYS.length})`);
KEYS.forEach(k=> ok(app.includes(`'${k}'`), `4. ${k} is used by the game`));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const p = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')));
  const miss = KEYS.filter(k=> !p[T[k]]); ok(!miss.length, `4. ${c}: every UI4 text is translated (${miss.join(', ')})`);
  ok(!Object.keys(p).some(k=> /Conquest wins each day bring an item/.test(k)), `4. ${c}: the old "first 3 Conquest wins" row is gone`); });
ok(!Object.values(T).some(v=> /Conquest wins each day bring an item/.test(v)) && !/first \{of\} Conquest wins/.test(app), '4. the old "first 3 Conquest wins" text is gone from the game');
console.log(fail ? `ui4-2026-10-23: ${fail} of ${n} checks failed` : `ui4-2026-10-23: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
