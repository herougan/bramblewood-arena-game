#!/usr/bin/env node
// 2026-10-10: Nocturnal N/M (stats while it's night), a 1-round day/night cycle, Bleed/Poison wearing down by 1 per
// tick, and Festering holding them.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tp-were': {id:'tp-were', name:'T Were', attack:2, health:5, wait:0, cost:0, effects:{nocturnal:5, nocturnalHp:6}},
  'tp-wall': {id:'tp-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'tp-fester': {id:'tp-fester', name:'T Fester', attack:0, health:500, wait:0, cost:0, effects:{festering:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
// 1) Nocturnal +5/+6 at night, gone by day; phaseLen 1 flips every round
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open', rules:{phase:'cycle', phaseLen:1}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'tp-were', 'left', {}, []);
  const w = all(P[1])[0];
  const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(e.getPhase()==='night', `round 2 should be night with phaseLen 1 (got ${e.getPhase()})`);
  ok(w.phaseAtk===5 && w.maxHp===11 && w.hp===11, `night: +5/+6 (atk bonus ${w.phaseAtk}, hp ${w.hp}/${w.maxHp})`);
  ok(ev.some(x=> x.type==='statusFx' && x.kind==='phaseGrow'), 'night should report phaseGrow');
  e.roundStart(P, 3, so, {}, []);
  ok(e.getPhase()==='day' && !w.phaseAtk && w.maxHp===5, `day: back to 2/5 (atk bonus ${w.phaseAtk}, max ${w.maxHp})`); }
// 2) Poison wears down 1 per tick; Festering holds it
function poisonRun(withFester){
  const e = E.makeSimEngine(defs, E.mulberry32(2), {recordEvents:true, battleMode:'open'});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'tp-wall', 'left', {}, []);
  if(withFester) e.debugSpawnCard(P, so, 2, 'tp-fester', 'left', {}, []);
  const c = all(P[1])[0]; c.poison = 3;
  e.resolveCombat(P, so, {}, [], 1);
  return c.poison;
}
const a = poisonRun(false), b = poisonRun(true);
ok(a === 2, `poison 3 should tick down to 2 (got ${a})`);
ok(b === 3, `Festering should hold poison at 3 (got ${b})`);
console.log(`phase-status: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
