#!/usr/bin/env node
// Anti-Air N (2026-10-10): never misses a Flying unit, and hits Flying units for N more. Ground targets are unchanged.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const defs = Object.assign({}, H.loadCardDefs(), {
  'ta-aa':   {id:'ta-aa', name:'T AA', attack:2, health:50, wait:0, cost:0, effects:{antiAir:1}},
  'ta-bird': {id:'ta-bird', name:'T Bird', attack:0, health:500, wait:0, cost:0, effects:{flying:true}},
  'ta-wall': {id:'ta-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
});
const so = id=> id===1 ? 'A' : 'B';
function swing(target, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'ta-aa', 'left', {}, []); e.debugSpawnCard(P, so, 2, target, 'left', {}, []);
  const aa = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right][0];
  const ev = []; e.debugAttack(P, so, aa.uid, {}, ev);
  return ev.find(x=> x.type==='hit' || x.type==='hitHQ');
}
let landed = 0;
for(let s = 1; s <= 40; s++){ const h = swing('ta-bird', s); if(h && h.dmg === 3) landed++; }
ok(landed === 40, `every swing at a flier should land for 2 + 1 = 3 (${landed}/40 did)`);
const g = swing('ta-wall', 7);
ok(g && g.dmg === 2, `a ground target takes the plain 2 (took ${g && g.dmg})`);
console.log(`anti-air: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
