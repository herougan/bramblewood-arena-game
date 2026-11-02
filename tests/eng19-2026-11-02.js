#!/usr/bin/env node
// 2026-11-02 (package ENG19): the owner's 11-02 22:15 notes #5, #6, #12, #13, #14, #15 and 22:26 (Bloom's tooltip).
//   #5   Pearl N is On Ready, once; Pearl Bed N pays every turn while Ready (was On Ready, once).
//   #6   Swarm counts an allied Structure that shares a Type; its texts no longer say Structures don't count.
//   #12  On Attack triggers go off right after the swing (a draw lands after the hit); Fire on hit still loads the swing.
//   #13  Majesty N: the enemy units facing it swing at -N Attack while it is Ready; on no card; priced.
//   #14  Shell's temporary Health soaking a blow has its own event (the 💠 number steps down mid-round).
//   #15  Grant Shield: itself / adjacent / surrounding / every ally, priced per group; on no card.
//   22:26 Bloom's chip and skill line say what fills it.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-pearl':   {id:'x-pearl', name:'Pearl', attack:0, health:50, wait:1, cost:0, effects:{pearl:1}},
  'x-pbed':    {id:'x-pbed', name:'PBed', attack:0, health:50, wait:1, cost:0, effects:{pearlBed:2}},
  'x-wall':    {id:'x-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'x-wallw':   {id:'x-wallw', name:'WallW', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-swarm':   {id:'x-swarm', name:'Swarmer', attack:1, health:50, wait:0, cost:0, archetypes:['Insect'], effects:{swarm:true}},
  'x-hive':    {id:'x-hive', name:'Hive', attack:0, health:50, wait:9, cost:0, archetypes:['Structure', 'Insect'], effects:{}},
  'x-drawer':  {id:'x-drawer', name:'Drawer', attack:2, health:50, wait:0, cost:0, effects:{triggers:[{on:'onAttack', do:'drawCard', count:1}]}},
  'x-firer':   {id:'x-firer', name:'Firer', attack:2, health:50, wait:0, cost:0, effects:{triggers:[{on:'onAttack', do:'fireHit', amount:3}]}},
  'x-thorny':  {id:'x-thorny', name:'Thorny', attack:0, health:500, wait:9, cost:0, effects:{thorns:60}},
  'x-healer':  {id:'x-healer', name:'Healer', attack:2, health:50, wait:0, cost:0, effects:{triggers:[{on:'onAttack', do:'heal', amount:5}, {on:'onAttack', do:'drawCard', count:1}]}},
  'x-king':    {id:'x-king', name:'King', attack:0, health:500, wait:0, cost:0, effects:{majesty:2}},
  'x-kingw':   {id:'x-kingw', name:'KingW', attack:0, health:500, wait:5, cost:0, effects:{majesty:2}},
  'x-hit5':    {id:'x-hit5', name:'Hit5', attack:5, health:500, wait:0, cost:0, effects:{}},
  'x-shell':   {id:'x-shell', name:'Shell', attack:0, health:50, wait:9, cost:0, effects:{shell:4}},
  'x-gs-all':  {id:'x-gs-all', name:'GsAll', attack:0, health:50, wait:0, cost:0, effects:{triggers:[{on:'onSpawn', do:'grantShield', allies:3}]}},
  'x-gs-adj':  {id:'x-gs-adj', name:'GsAdj', attack:0, health:50, wait:0, cost:0, effects:{triggers:[{on:'onSpawn', do:'grantShield', amount:1, adjacent:2}]}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const tag = '__eng19';
const spawn = (e, P, pid, id, side, ev)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, ev || []); return all(P[pid]).find(c=> c.defId === id && !c[tag] && (c[tag] = true)); };
const round = (e, P, r, first)=>{ const ev = []; e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = R('arena_app.js'), eng = R('bramblewood-engine.js');

// ---- #5 Pearl / Pearl Bed ------------------------------------------------------------------------------------------------
{ const {e, P} = mk(1); spawn(e, P, 1, 'x-pearl'); spawn(e, P, 2, 'x-wallw'); const got = [];
  for(let r = 1; r <= 5; r++){ round(e, P, r); got.push(P[1].pearls || 0); }
  ok(got[got.length - 1] === 1, `#5: Pearl 1 pays one Pearl once over 5 rounds (${got})`); }
{ const {e, P} = mk(1); spawn(e, P, 1, 'x-pbed'); spawn(e, P, 2, 'x-wallw'); const got = [];
  for(let r = 1; r <= 5; r++){ round(e, P, r); got.push(P[1].pearls || 0); }
  ok(got[got.length - 1] >= 6 && got[0] === 0, `#5: Pearl Bed 2 pays 2 Pearls every Ready turn, nothing while Waiting (${got})`); }
ok(/if\(e\.pearlBed\) out\.push\(\{on:'perTurn'/.test(eng) && /if\(e\.pearl\) out\.push\(\{on: waits \? 'onReady' : 'onSpawn'/.test(eng), '#5: the engine: Pearl On Ready (On Play at Wait 0), Pearl Bed On Turn Start');
ok(TXT['ui.eng19-pearl'] === 'When it becomes Ready, you gain {n} Pearl. A Pearl pays for 1 Lumber or 1 Stone.' && /^Every turn while it is Ready/.test(TXT['ui.en8-pearl-bed']), '#5: the texts: Pearl On Ready, Pearl Bed every turn');
ok(/key:'pearl', category:'passive'/.test(app), '#5: Pearl is a skill in the editor and codex');

// ---- #6 Swarm counts Structures ------------------------------------------------------------------------------------------
{ const {e, P} = mk(2); const s = spawn(e, P, 1, 'x-swarm'); spawn(e, P, 1, 'x-hive', 'right'); spawn(e, P, 2, 'x-wallw');
  ok(e.swarmBonusOf(P, s) === 1, `#6: a Structure that shares the Type counts for Swarm (${e.swarmBonusOf(P, s)})`); }
ok(!/Structures don't count/.test(app) && !/Structures don't count/.test(JSON.stringify(TXT)), "#6: no text says Structures don't count");
ok(!/!isStructureCard\(c\) && shares\(c\)/.test(eng), '#6: swarmBonus has no Structure filter');

// ---- #12 On Attack after the swing ---------------------------------------------------------------------------------------
{ const {e, P} = mk(3); P[1].deck = ['x-wall', 'x-wall', 'x-wall']; const d = spawn(e, P, 1, 'x-drawer'); spawn(e, P, 2, 'x-wallw');
  const h0 = P[1].hand.length, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const hi = ev.findIndex(x=> x.type === 'hit' && x.attUid === d.uid), di = ev.findIndex(x=> x.type === 'draw' && x.side === 'A');
  ok(hi >= 0 && di > hi, `#12: the On Attack draw comes after the hit (hit ${hi}, draw ${di})`);
  ok(di >= 0 && ev[di].uid != null && P[1].hand.some(h=> h.uid === ev[di].uid) && P[1].hand.length === h0 + 1, '#12: the draw event names the drawn card (uid) and it is in the hand at once'); }
{ const {e, P} = mk(4); const f = spawn(e, P, 1, 'x-firer'); spawn(e, P, 2, 'x-wallw'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const h = ev.filter(x=> (x.type === 'hit' || x.type === 'fireHit' || x.dmgType === 'heat' || x.dmgType === 'fire') && x.attUid === f.uid), tot = h.reduce((a, x)=> a + (x.dmg || 0), 0);
  ok(tot >= 5, `#12: Fire on hit still loads the swing it goes off on (${tot} damage from a 2-Attack swing + 3 fire)`); }
{ // dies in its own swing to Thorns: still draws, does not heal itself
  const {e, P} = mk(5); P[1].deck = ['x-wall', 'x-wall']; const hl = spawn(e, P, 1, 'x-healer'); spawn(e, P, 2, 'x-thorny'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const healed = ev.some(x=> (x.type === 'heal' || (x.type === 'statusFx' && x.kind === 'heal')) && (x.uid === hl.uid || x.targetUid === hl.uid));
  ok(hl.hp <= 0 && !healed && ev.some(x=> x.type === 'draw' && x.side === 'A'), `#12: a unit killed by Thorns in its own swing still draws, but does not heal itself (hp ${hl.hp}, healed ${healed})`); }
ok(/runOnAttackPost\(players, sideOf, a, attDef, stats, events\); \/\/ ENG19/.test(eng) && /function eng19DrawShown\(ev\)/.test(app) && /!eng19HandHeld\(m, hc\.uid\)/.test(app), '#12: the engine fires On Attack after the swing; the page shows a drawn card as its draw plays');

// ---- #13 Majesty -----------------------------------------------------------------------------------------------------------
function hitBy(kingId){ const {e, P} = mk(6); const a = spawn(e, P, 1, 'x-hit5'); if(kingId) spawn(e, P, 2, kingId); else spawn(e, P, 2, 'x-wallw');
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const h = ev.find(x=> x.type === 'hit' && x.attUid === a.uid); return h ? h.dmg : null; }
ok(hitBy(null) === 5 && hitBy('x-king') === 3, `#13: a 5-Attack swing facing a Ready Majesty 2 unit hits for 3 (${hitBy('x-king')}; without it ${hitBy(null)})`);
ok(hitBy('x-kingw') === 5, `#13: a Waiting Majesty unit does nothing (${hitBy('x-kingw')})`);
{ const SC = require(path.join(ROOT, 'tools/skill_costs.js')).make(J('canonical/skill-costs.json'));
  ok(SC.cardS({majesty:1}).S === 3.4 && SC.cardS({pearl:1}).S === 0.9, '#13 / #5: Majesty 3.4 and Pearl 0.9 a point in the budget');
  ok(SC.cardS({triggers:[{on:'onSpawn', do:'grantShield', allies:3}]}).S === 3.78 && !SC.cardS({triggers:[{on:'onSpawn', do:'grantShield', adjacent:1}]}).missing.length, '#15: On Play +3 Shield to every ally prices at 3.78; every group has a price'); }
{ const cards = J('canonical/cards.json'), list = Array.isArray(cards) ? cards : (cards.cards || Object.values(cards)); const s = JSON.stringify(list.map(c=> c.effects || {}));
  ok(!/"majesty"/.test(s) && !/grantShield/.test(s), '#13 / #15: Majesty and Grant Shield are on no card'); }

// ---- #14 the 💠 number ----------------------------------------------------------------------------------------------------
{ const {e, P} = mk(7); const sh = spawn(e, P, 2, 'x-shell'); spawn(e, P, 1, 'x-hit5'); const ev = []; e.resolveCombat(P, so, {}, ev, 1); e.resolveCombat(P, so, {}, ev, 1);
  const ts = ev.filter(x=> x.type === 'tempSoak' && x.pool === 'shell' && x.uid === sh.uid);
  ok(ts.length >= 1 && ts.every(x=> x.left >= 0 && x.soaked > 0), `#14: Shell's temporary Health soaking a blow has a tempSoak {pool:'shell'} event (${ts.map(x=> x.soaked + '/' + x.left)})`); }
ok(/if\(ev\.pool === 'shell'\) rc\.tempHp = ev\.left;/.test(app), "#14: the replay steps the 💠 number down on Shell's soak");

// ---- #15 Grant Shield ------------------------------------------------------------------------------------------------------
ok(E.ACTION_KEYS.includes('grantShield'), "#15: 'grantShield' is an action key");
{ const {e, P} = mk(8); const a = spawn(e, P, 1, 'x-wall', 'left'), b = spawn(e, P, 1, 'x-wall', 'right'); const g = spawn(e, P, 1, 'x-gs-all', 'right');
  ok([a, b, g].every(c=> c.shield === 3), `#15: On Play allies 3: every ally and itself get 3 Shield (${[a, b, g].map(c=> c.shield)})`); }
{ const {e, P} = mk(9); const a = spawn(e, P, 1, 'x-wall', 'left'); spawn(e, P, 1, 'x-wall', 'right'); const g = spawn(e, P, 1, 'x-gs-adj', 'right');
  const row = P[1].row.left.concat(P[1].row.center, P[1].row.right), i = row.indexOf(g), nb = [row[i - 1], row[i + 1]].filter(Boolean), far = row.filter(c=> c !== g && !nb.includes(c));
  ok(g.shield === 1 && nb.length && nb.every(c=> c.shield === 2) && far.every(c=> !(c.shield > 0)), `#15: amount 1 + adjacent 2: itself 1, its neighbours 2, the rest none (${row.map(c=> c.shield || 0)})`); }
ok(TXT['ui.eng19-gs-allies'] && /key:'grantShield'/.test(app) && /function eng19GrantShieldText/.test(app), '#15: Grant Shield has its editor entry and texts');

// ---- 22:26 Bloom's tooltip -------------------------------------------------------------------------------------------------
['tide', 'ebb', 'night', 'day', 'twilight', 'wind', 'wet', 'dark', 'heat', 'frost', 'fullmoon', 'rain', 'sunny', 'kill'].forEach(k=> ok(TXT['ui.eng19-bc-' + k], `Bloom: condition ${k} has its line`));
ok(/eng19BloomFillText\(e\.bloomCopy\)/.test(app) && /\+ ' ' \+ eng19BloomFillText\(bc\)/.test(app), "Bloom: the 🌸 chip's tooltip and the skill line say what fills it");

// ---- texts in 12 packs -----------------------------------------------------------------------------------------------------
{ const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const keys = Object.keys(TXT).filter(k=> /^ui\.eng19-|^ui\.skn-(pearl|majesty)$/.test(k)).concat(['ui.en8-pearl-bed']);
  CODES.forEach(c=>{ const L = J(`lang/${c}.json`); const miss = keys.filter(k=> !L[TXT[k]]); ok(!miss.length, `12 packs: ${c} has every ENG19 text (missing: ${miss.join(', ')})`);
    const U = J(`lang/ui/${c}.json`); ok(U['+{v1} Attack for every ally that shares a type with it.'] && !Object.keys(U).some(k=> /Structures don't count/.test(k)), `12 packs: ${c} has the new Swarm line, not the old`); }); }

console.log(fail ? `eng19: ${fail} of ${n} FAILED` : `eng19: all ${n} passed`);
process.exit(fail ? 1 : 0);
