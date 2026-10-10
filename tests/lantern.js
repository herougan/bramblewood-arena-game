#!/usr/bin/env node
// 2026-10-11: Lantern (Lantern Bearer). While one is on your board at Night, your Diurnal units keep their day bonus;
// the enemy's Diurnal units don't; without a Lantern the bonus fades as before.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tl-day': {id:'tl-day', name:'T Day', attack:2, health:5, wait:0, cost:0, effects:{diurnal:2, diurnalHp:3}},
  'tl-lamp': {id:'tl-lamp', name:'T Lamp', attack:1, health:5, wait:0, cost:0, effects:{lantern:true, flying:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open', rules:{phase:'cycle', phaseLen:1}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'tl-day', 'left', {}, []);
  e.debugSpawnCard(P, so, 1, 'tl-lamp', 'right', {}, []);
  e.debugSpawnCard(P, so, 2, 'tl-day', 'left', {}, []);
  const mine = all(P[1]).find(c=> c.defId==='tl-day'), theirs = all(P[2]).find(c=> c.defId==='tl-day');
  e.roundStart(P, 2, so, {}, []); // night
  ok(e.getPhase()==='night', `round 2 is night (got ${e.getPhase()})`);
  ok(mine.phaseAtk===2 && mine.maxHp===8, `my Diurnal unit keeps +2/+3 at night with a Lantern (atk ${mine.phaseAtk}, max ${mine.maxHp})`);
  ok(!theirs.phaseAtk && theirs.maxHp===5, `the enemy's Diurnal unit loses its bonus (atk ${theirs.phaseAtk}, max ${theirs.maxHp})`);
  const lamp = all(P[1]).find(c=> c.defId==='tl-lamp'); lamp.hp = 0; P[1].row.right = P[1].row.right.filter(c=> c !== lamp);
  e.roundStart(P, 3, so, {}, []); e.roundStart(P, 4, so, {}, []); // day, then night again without the lantern
  ok(e.getPhase()==='night' && !mine.phaseAtk && mine.maxHp===5, `without the Lantern the bonus fades at night (atk ${mine.phaseAtk}, max ${mine.maxHp})`); }
console.log(`lantern: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
