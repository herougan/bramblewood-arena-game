#!/usr/bin/env node
// Boomerang (2026-10-12, was Anti-Air N): never misses a Flying unit; after a swing the boomerang is out and comes back at
// the start of the next combat as that unit's (priority) attack for the round.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const defs = Object.assign({}, H.loadCardDefs(), {
  'ta-aa':   {id:'ta-aa', name:'T Boom', attack:2, health:50, wait:0, cost:0, effects:{boomerang:true}},
  'ta-bird': {id:'ta-bird', name:'T Bird', attack:0, health:500, wait:0, cost:0, effects:{flying:true}},
  'ta-wall': {id:'ta-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'ta-quick': {id:'ta-quick', name:'T Quick', attack:1, health:500, wait:0, cost:0, effects:{swift:true}},
});
const so = id=> id===1 ? 'A' : 'B';
function setup(target, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'ta-aa', 'left', {}, []); e.debugSpawnCard(P, so, 2, target, 'left', {}, []);
  return {e, P, aa: e.allBoardCards(P[1])[0]};
}
let landed = 0;
for(let s = 1; s <= 40; s++){ const {e, P, aa} = setup('ta-bird', s); const ev = []; e.debugAttack(P, so, aa.uid, {}, ev); const h = ev.find(x=> x.type==='hit'); if(h && h.dmg === 2) landed++; }
ok(landed === 40, `every swing at a flier lands (${landed}/40)`);
{ const {e, P, aa} = setup('ta-wall', 7); const st = {}; const ev1 = []; e.resolveCombat(P, so, st, ev1, 1);
  ok(aa.boomerangOut === true, 'after its swing the boomerang is out');
  const ev2 = []; e.resolveCombat(P, so, st, ev2, 2);
  const ret = ev2.findIndex(x=> x.type==='boomerangReturn'), hits = ev2.filter(x=> x.type==='hit' && x.attUid===aa.uid);
  ok(ret === 0 || (ret >= 0 && !ev2.slice(0, ret).some(x=> x.type==='hit')), 'the return comes first in the next combat');
  ok(hits.length === 1, `the return is its only attack that round (${hits.length})`);
  ok(aa.boomerangOut === false, 'caught: it throws again next round');
  const ev3 = []; e.resolveCombat(P, so, st, ev3, 1); ok(ev3.filter(x=> x.type==='hit' && x.attUid===aa.uid).length === 1 && aa.boomerangOut === true, 'the round after, it throws normally'); }
console.log(`anti-air: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
