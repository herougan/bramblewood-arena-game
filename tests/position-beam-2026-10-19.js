#!/usr/bin/env node
// Position Beam (2026-10-19, package EE, owner 09:52: the Galactic Condor's charged beam): its path depends on where the firer stands.
//   centre (column 0): the unit directly across AND the enemy bramble
//   a side (1-4 out):  the units diagonally across toward the far side (one step inward of the one opposite, in to the centre line)
//   the edge (5 out):  the whole row inward of the one opposite ("hits the entire row except its opposing onwards")
// Checked in slot battles (fixed slots, so every position is exact) and in a gravity row's centre, then the real card's Charge.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const BEAM = {on:'onCharge', do:'positionBeam', amount:3};
const defs = Object.assign({}, H.loadCardDefs(), {
  'pb-beam': {id:'pb-beam', name:'Beam', attack:0, health:50, wait:0, cost:0, effects:{triggers:[BEAM]}},
  'pb-wall': {id:'pb-wall', name:'Wall', attack:0, health:50, wait:0, cost:0, effects:{}},
});
ok(E.ACTION_KEYS.includes('positionBeam'), "ACTION_KEYS has 'positionBeam'");
const so = id=> id===1 ? 'A' : 'B';
// Open (slot) battle: the beamer at slot `at`, enemy walls at `walls`; fires once. Returns {hit: [slots hit], hq, lane}.
function fireAt(at, walls){
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  const put = (pid, id, slot)=>{ const c = e.makeBoardCard(id); c.slot = slot; P[pid].row[slot === 0 ? 'center' : slot < 0 ? 'left' : 'right'].push(c); return c; };
  const me = put(1, 'pb-beam', at); walls.forEach(s=> put(2, 'pb-wall', s)); e.syncSlots(P[1]); e.syncSlots(P[2]);
  const hq0 = P[2].hq.hp, ev = [];
  e.debugFireTrigger(P, so, me.uid, 'onCharge', {}, ev);
  const bySlot = {}; e.allBoardCards(P[2]).forEach(c=> bySlot[c.uid] = c.slot);
  const hit = ev.filter(x=> x.type==='hit' && x.positionBeam).map(x=> bySlot[x.targetUid]).sort((a, b)=> a - b);
  const pb = ev.find(x=> x.type==='positionBeam');
  return {hit, hq: hq0 - P[2].hq.hp, lane: pb && pb.lane, tagged: ev.filter(x=> (x.type==='hit' || x.type==='hitHQ') && x.attUid===me.uid).every(x=> x.positionBeam)};
}
const ROW = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);
// 1. centre: the unit across and the bramble, nothing else
let r = fireAt(0, ROW);
ok(r.lane === 'centre', `centre lane (got ${r.lane})`);
ok(same(r.hit, [0]), `centre hits only the unit across (got ${r.hit})`);
ok(r.hq === 3, `centre also hits the enemy bramble for 3 (got ${r.hq})`);
ok(r.tagged, 'every beam hit is tagged positionBeam');
r = fireAt(0, [-1, 1]);
ok(same(r.hit, []) && r.hq === 3, `centre with nobody across: just the bramble (hit ${r.hit}, bramble ${r.hq})`);
// 2. a side: diagonally across toward the far side, as deep as it stands out
r = fireAt(2, ROW);
ok(r.lane === 'side', `slot 2 is a side lane (got ${r.lane})`);
ok(same(r.hit, [0, 1]) && r.hq === 0, `slot 2 hits slots 1 and 0, not across, not beyond, not the bramble (got ${r.hit}, bramble ${r.hq})`);
r = fireAt(-1, ROW);
ok(same(r.hit, [0]), `slot -1 angles right: hits slot 0 only (got ${r.hit})`);
r = fireAt(4, ROW);
ok(same(r.hit, [0, 1, 2, 3]), `slot 4 hits slots 3 to 0 (got ${r.hit})`);
r = fireAt(3, [3, 4, -2]);
ok(same(r.hit, []) && r.hq === 3, `a side beam with nobody on its path goes into the bramble (hit ${r.hit}, bramble ${r.hq})`);
// 3. the edge (+5): the whole row inward of the one across; across and onward are spared
r = fireAt(5, ROW);
ok(r.lane === 'edge', `slot 5 is the edge (got ${r.lane})`);
ok(same(r.hit, [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]) && r.hq === 0, `the edge hits slots 4 to -5, sparing 5 and 6 (got ${r.hit}, bramble ${r.hq})`);
r = fireAt(-5, ROW);
ok(same(r.hit, [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]), `the left edge sweeps rightward, sparing -5 (got ${r.hit})`);
// 4. gravity (the classic packed row): the centre card is column 0
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'gravity'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'pb-beam', 'center', {}, []);
  ['center', 'left', 'right'].forEach(s=> e.debugSpawnCard(P, so, 2, 'pb-wall', s, {}, []));
  const me = e.allBoardCards(P[1])[0], mid = P[2].row.center[0], hq0 = P[2].hq.hp, ev = [];
  e.debugFireTrigger(P, so, me.uid, 'onCharge', {}, ev);
  const hits = ev.filter(x=> x.type==='hit' && x.positionBeam);
  ok(hits.length === 1 && hits[0].targetUid === mid.uid && hq0 - P[2].hq.hp === 3, `gravity centre: the unit across and the bramble (hits ${hits.length}, bramble ${hq0 - P[2].hq.hp})`); }
// 5. the real card: Galactic Condor's Charge fires the beam
const gc = defs['galactic-condor'];
ok(gc && gc.effects && gc.effects.charge && (gc.effects.charge.do || {}).do === 'positionBeam', 'Galactic Condor charges a positionBeam');
if(gc){
  const res = H.runBoard({defs, seed:9, rounds:6, noSuddenDeath:true, hqHp:{A:500, B:500}, A:[{id:'galactic-condor', side:'center', wait:0}], B:[{id:'pb-wall', side:'center', hp:500}]});
  const beams = res.events.filter(x=> x.type==='positionBeam');
  ok(beams.length >= 2 && beams.every(b=> b.lane === 'centre'), `the Condor's beam fires on its charge, repeatedly, from the centre (fired ${beams.length} times in 6 rounds)`);
}
console.log(`position-beam: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
