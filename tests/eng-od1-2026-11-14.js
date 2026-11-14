#!/usr/bin/env node
// 2026-11-14 (package ENG-OD1, SKW1's flag): an On Death "+N Health on itself" played as a free Revive: the Buff raised the dying unit
// above 0 inside the death pass, so the row filter kept it on the board (while its card also went to the graveyard). A unit at 0 Health
// is dead: Buff / Buff Health skip it, as Heal and Shield already did. Actions on others still resolve.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.resolve(__dirname, '..'), rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs());
const add = (id, effects, o)=> { defs[id] = Object.assign({id, name:id, attack:0, health:3, wait:0, cost:0, effects: effects || {}}, o || {}); };
add('od-hp2', {triggers:[{on:'onDeath', do:'buff', amount2:2, who:'self'}]});
add('od-hp4', {triggers:[{on:'onDeath', do:'buff', amount:1, amount2:4, who:'self'}]});
add('od-legacy', {triggers:[{on:'onDeath', do:'buffHealth', amount:3}]});
add('od-heal', {triggers:[{on:'onDeath', do:'heal', amount:2, who:'self'}]});
add('od-shield', {triggers:[{on:'onDeath', do:'shield', amount:2, who:'self'}]});
add('od-giver', {triggers:[{on:'onDeath', do:'buff', amount:1, amount2:2, who:'ally', sub:'random'}]});
add('od-mourner', {triggers:[{on:'onDeath', do:'buff', amount2:2, who:'self'}, {on:'onAllyDie', do:'gainLumber', amount:5, whileWaiting:true}]});
add('od-undead', {undead:true, triggers:[{on:'onDeath', do:'buff', amount:2, amount2:2, who:'self'}]}, {attack:1});
add('od-plain', {});
add('od-hitter', {}, {attack:5, health:50});

const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function sweep(ids, kill){
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'gravity'}), P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}, ev = [];
  ids.forEach(id=> e.debugSpawnCard(P, so, 1, id, 'left', {}, ev));
  const units = all(P[1]); units.forEach(c=>{ if(kill.includes(c.defId)) c.hp = 0; });
  const l0 = P[1].lumber; ev.length = 0; e.removeDeadCards(P, so, {}, {}, ev);
  return {P, ev, units, board: all(P[1]), grave: P[1].graveyard.map(g=> g.defId), deaths: ev.filter(x=> x.type === 'death').map(x=> x.defId), lumber: P[1].lumber - l0};
}

// ---- 1. a dying unit's own On Death self Buff does not bring it back (+2, +4 with Attack, the legacy Buff Health)
for(const id of ['od-hp2', 'od-hp4', 'od-legacy']){ const r = sweep([id], [id]);
  ok(r.board.length === 0, `${id}: gone from the board (left: ${r.board.map(c=> c.defId + ':' + c.hp).join(' ') || 'none'})`);
  ok(r.grave.length === 1 && r.grave[0] === id && r.deaths.length === 1, `${id}: one death, one card in the graveyard (${r.deaths.length} / ${r.grave.join(',')})`);
  ok(!r.ev.some(x=> x.type === 'namedBuff'), `${id}: no Buff is logged on the dead unit`); }
// ---- 2. Heal and Shield on itself already did nothing (pinned)
for(const id of ['od-heal', 'od-shield']){ const r = sweep([id], [id]);
  ok(r.board.length === 0 && r.grave.length === 1 && r.deaths.length === 1, `${id}: gone, one death`); }
// ---- 3. an On Death action on another unit still resolves
{ const r = sweep(['od-giver', 'od-plain'], ['od-giver']); const ally = r.board.find(c=> c.defId === 'od-plain');
  ok(r.board.length === 1 && ally && ally.hp === 5 && ally.atk === 1, `On Death Buff on an ally: the ally gets +1/+2 (${ally ? ally.atk + '/' + ally.hp : 'none'})`); }
// ---- 4. the same-pass hole: a self-buffed dying unit no longer counts as a survivor for the next death in that pass
for(const ids of [['od-mourner', 'od-plain'], ['od-plain', 'od-mourner']]){ const r = sweep(ids, ids); // both board orders
  ok(r.board.length === 0 && r.deaths.length === 2, `two deaths in one pass (${ids}): both gone (${r.board.length} left)`);
  ok(r.lumber === 0, `the dying mourner fires no On Ally Die for the unit dying beside it (${ids}: +${r.lumber} Lumber)`); }
{ const r = sweep(['od-mourner', 'od-plain'], ['od-plain']);
  ok(r.lumber === 5, `a living mourner still fires On Ally Die (+${r.lumber} Lumber)`); }
// ---- 5. Undead: the death is true; it returns at 1 Health with its printed Attack, the On Death self Buff does nothing
{ const r = sweep(['od-undead'], ['od-undead']); const u = r.board.find(c=> c.defId === 'od-undead');
  ok(u && u.hp === 1 && u.atk === 1 && r.deaths.length === 1, `Undead + On Death self Buff: back once at 1/1 (${u ? u.atk + '/' + u.hp : 'none'})`); }
// ---- 6. in a fight: the carrier dies once and stays dead
{ const out = H.runBoard({seed:3, rounds:4, defs, hqHp:{A:30, B:30}, A:[{id:'od-hp2'}], B:[{id:'od-hitter'}]});
  const evs = out.events || [], deaths = evs.filter(x=> x.type === 'death' && x.defId === 'od-hp2').length;
  ok(deaths === 1, `fight: the carrier dies once (${deaths} deaths)`);
  ok(!evs.some(x=> x.type === 'namedBuff' && x.targetDefId === 'od-hp2'), 'fight: no self Buff lands on the dead carrier'); }
// ---- docs
ok(/ENG-OD1/.test(rd('bramblewood-engine.js')), 'engine comment');
ok(/^## 2026-11-14[^\n]*ENG-OD1/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/eng-od1-2026-11-14\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
console.log(`eng-od1: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
