#!/usr/bin/env node
// The active Exile zone (2026-10-09): every card sent to a player's Removal Zone gives 1 Echo; a Remember N
// card in the zone returns to the board at the start of a round once its owner has N Echoes (spent); the
// exileGrave action moves graveyard cards to the zone.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tx-wisp':   {id:'tx-wisp', name:'T Wisp', attack:1, health:1, wait:0, cost:0, effects:{remember:2, triggers:[{on:'onDeath', do:'exileSelf'}]}},
  'tx-keeper': {id:'tx-keeper', name:'T Keeper', attack:0, health:5, wait:0, cost:0, effects:{triggers:[{on:'onSpawn', do:'exileGrave', count:2}]}},
  'tx-hit':    {id:'tx-hit', name:'T Hitter', attack:9, health:500, wait:0, cost:0, effects:{}},
  'tx-plain':  {id:'tx-plain', name:'T Plain', attack:0, health:5, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
// 1) exileGrave: two graveyard cards -> Exile, +2 Echoes
{ const {e, P} = mk(); P[1].graveyard.push({defId:'tx-plain'}, {defId:'tx-plain'}, {defId:'tx-plain'});
  e.debugSpawnCard(P, so, 1, 'tx-keeper', 'left', {}, []);
  ok(P[1].graveyard.length === 1 && P[1].exile.length === 2, `exileGrave moves 2 (grave ${P[1].graveyard.length}, exile ${P[1].exile.length})`);
  ok(P[1].echoes === 2, `+2 Echoes (got ${P[1].echoes})`); }
// 2) a Remember card dies into Exile (+1 Echo) and waits for 2 Echoes
{ const {e, P} = mk();
  e.debugSpawnCard(P, so, 1, 'tx-wisp', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'tx-hit', 'left', {}, []);
  for(let r=1; r<=3 && all(P[1]).length; r++) e.resolveCombat(P, so, {}, [], r%2 ? 2 : 1);
  ok(!all(P[1]).some(c=> c.defId==='tx-wisp') && P[1].exile.some(x=> x.defId==='tx-wisp'), 'the wisp died into Exile');
  ok(P[1].echoes === 1, `1 Echo from its own exile (got ${P[1].echoes})`);
  e.roundStart(P, 2, so, {}, []);
  ok(P[1].exile.some(x=> x.defId==='tx-wisp'), 'with 1 Echo it stays in Exile');
  P[1].echoes = 2; const ev = [];
  e.roundStart(P, 3, so, {}, ev);
  ok(all(P[1]).some(c=> c.defId==='tx-wisp'), 'with 2 Echoes it returns to the board');
  ok(!P[1].exile.some(x=> x.defId==='tx-wisp') && P[1].echoes === 0, `Echoes spent, gone from Exile (echoes ${P[1].echoes})`);
  ok(ev.some(x=> x.type==='remember'), 'a remember event is recorded'); }
console.log(`exile-zone: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
