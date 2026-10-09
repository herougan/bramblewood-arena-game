#!/usr/bin/env node
// Swarm and Hive Mind (2026-10-09): Swarm N adds +1 damage per N other Swarm allies; when a Hive Mind
// card dies, the newest Swarm ally gains +1/+1.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
function setup(defs){
  const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}; return {e, P};
}
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'ts-swarm': {id:'ts-swarm', name:'T Swarm', attack:2, health:50, wait:0, cost:0, effects:{swarm:3}},
  'ts-hive':  {id:'ts-hive', name:'T Hive', attack:0, health:1, wait:0, cost:0, effects:{swarm:3, hiveMind:true}},
  'ts-wall':  {id:'ts-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'ts-hitter':{id:'ts-hitter', name:'T Hitter', attack:5, health:500, wait:0, cost:0, effects:{}},
});
const so = id=> id===1 ? 'A' : 'B';
// 1) one Swarm attacker plus three Swarm allies -> +1 damage
{ const {e, P} = setup(defs);
  ['left','left','right','right'].forEach((side, i)=> e.debugSpawnCard(P, so, 1, 'ts-swarm', side, {}, []));
  e.debugSpawnCard(P, so, 2, 'ts-wall', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ts-wall', 'right', {}, []);
  const walls = [...P[2].row.left, ...P[2].row.center, ...P[2].row.right];
  const before = walls.reduce((t, c)=> t + c.hp, 0);
  e.resolveCombat(P, so, {}, [], 1);
  const dealt = before - [...P[2].row.left, ...P[2].row.center, ...P[2].row.right].reduce((t, c)=> t + c.hp, 0);
  const attackers = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].length;
  ok(dealt > 0 && dealt % 3 === 0, `with three other Swarm allies each hit should be 2+1 = 3 (dealt ${dealt} with ${attackers} on board)`); }
// 2) Hive Mind death buffs the newest Swarm ally
{ const {e, P} = setup(defs);
  e.debugSpawnCard(P, so, 1, 'ts-hive', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'ts-swarm', 'right', {}, []);
  e.debugSpawnCard(P, so, 2, 'ts-hitter', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ts-hitter', 'right', {}, []);
  const heir = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].find(c=> c.defId==='ts-swarm');
  const atk0 = heir.atk, max0 = heir.maxHp;
  e.resolveCombat(P, so, {}, [], 2);
  const hiveAlive = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].some(c=> c.defId==='ts-hive');
  ok(!hiveAlive, 'the Hive Mind card should have died');
  ok(heir.atk === atk0 + 1 && heir.maxHp === max0 + 1, `the Swarm ally should gain +1/+1 (atk ${atk0}→${heir.atk}, max HP ${max0}→${heir.maxHp})`); }
console.log(`swarm: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
