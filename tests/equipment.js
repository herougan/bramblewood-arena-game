#!/usr/bin/env node
// 2026-10-11: Equipment (drag onto a unit: +stats and granted skills; never on the board; falls with its unit), materia
// can't be played, and Demolisher N adds N damage against Structures.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'te-unit': {id:'te-unit', name:'T Unit', attack:2, health:6, wait:0, cost:0, effects:{}},
  'te-wall': {id:'te-wall', name:'T Wall', attack:0, health:40, wait:0, cost:0, archetypes:['Structure'], effects:{}},
  'te-sap': {id:'te-sap', name:'T Sapper', attack:3, health:30, wait:0, cost:0, effects:{demolisher:4}},
  'te-sword': {id:'te-sword', name:'T Sword', cardType:'equipment', attack:3, health:2, wait:0, cost:1, effects:{}, equip:{grant:{reach:true}}},
  'te-ore': {id:'te-ore', name:'T Ore', cardType:'materia', attack:0, health:1, wait:0, cost:0, effects:{}},
});
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open'});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'te-unit', 'left', {}, []);
  const u = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right][0];
  P[1].hand.push({uid: 9001, defId:'te-sword'}, {uid: 9002, defId:'te-ore'});
  ok(!e.canPlay(P[1], 'te-sword', 9001), 'equipment cannot be placed on the board');
  ok(!e.canPlay(P[1], 'te-ore', 9002), 'materia cannot be played');
  P[1].lumber = 0; ok(!e.canEquip(P[1], 9001, u.uid), 'equipping needs its Lumber');
  P[1].lumber = 1; const ev = [];
  ok(e.equip(P, so, 1, u.uid, 9001, {}, ev), 'equip succeeds with Lumber');
  ok(u.atk === 5 && u.maxHp === 8 && u.hp === 8, `unit gains +3/+2 (got ${u.atk}/${u.hp}/${u.maxHp})`);
  ok(u.defId !== 'te-unit', 'unit now carries a derived def (for the granted skill)');
  ok(P[1].lumber === 0 && P[1].playedThisTurn, 'pays Lumber and uses the play');
  ok(ev.some(x=> x.type==='equip'), 'equip event');
  ok(!P[1].hand.some(h=> h.uid===9001), 'equipment leaves the hand');
  const all = [...e.allBoardCards(P[1]), ...e.allBoardCards(P[2])];
  ok(!all.some(c=> c.defId==='te-sword'), 'equipment never takes a board slot');
  u.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  ok(P[1].graveyard.some(g=> g.defId==='te-sword'), 'equipment falls into the graveyard with its unit'); }
{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open'});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'te-sap', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'te-wall', 'left', {}, []);
  const sap = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right][0], wall = [...P[2].row.left, ...P[2].row.center, ...P[2].row.right][0];
  const r = e.damageCard(wall, sap.atk, 'physical', sap);
  ok(r.dmg === 7, `Demolisher 4 adds 4 against a Structure (3 + 4, got ${r.dmg})`); }
console.log(`equipment: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
