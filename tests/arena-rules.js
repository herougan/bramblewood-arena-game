#!/usr/bin/env node
// Arena rules (2026-10-10): phase modes (cycle / nightFirst / day / night) and Lumber every N rounds.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = H.loadCardDefs();
function phases(rules, n){ const e = E.makeSimEngine(defs, E.mulberry32(1), {battleMode:'open', rules}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; const out = [e.getPhase()];
  for(let r=2; r<=n; r++){ e.roundStart(P, r, so, {}, []); out.push(e.getPhase()); } return {out, P}; }
const cyc = phases({phase:'cycle'}, 7).out.join(',');
ok(cyc === 'day,day,day,night,night,night,day', `cycle: ${cyc}`);
const nf = phases({phase:'nightFirst'}, 7).out.join(',');
ok(nf === 'night,night,night,day,day,day,night', `nightFirst: ${nf}`);
ok(phases({phase:'night'}, 7).out.every(p=> p==='night'), 'always night');
ok(phases({phase:'day'}, 7).out.every(p=> p==='day'), 'always day');
{ const {P} = phases({phase:'cycle', lumberEvery:3}, 7); ok(P[1].lumber === 2 && P[2].lumber === 2, `Lumber every 3 rounds: +1 at rounds 4 and 7 (got ${P[1].lumber}/${P[2].lumber})`); }
// an always-night arena gives Nocturnal +1 from round 1
{ const d = Object.assign({}, defs, {'ar-owl':{id:'ar-owl', name:'Owl', attack:2, health:50, wait:0, cost:0, effects:{nocturnal:true}}, 'ar-wall':{id:'ar-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}}});
  const e = E.makeSimEngine(d, E.mulberry32(1), {battleMode:'open', rules:{phase:'night'}}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'ar-owl', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ar-wall', 'left', {}, []);
  const w = [...P[2].row.left, ...P[2].row.center, ...P[2].row.right][0], h0 = w.hp; e.resolveCombat(P, so, {}, [], 1);
  ok((h0 - w.hp) % 3 === 0 && h0 > w.hp, `round 1 of a Long Night: Nocturnal 2-attack hits for 3 (took ${h0 - w.hp})`); }
console.log(`arena-rules: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
