#!/usr/bin/env node
// On Turn Start (perTurn) whose-turn parameter (2026-10-10): both = every round; self = rounds the owner strikes
// first; enemy = rounds the opponent strikes first.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const mk = turnOf=> ({id:'ts-'+(turnOf||'both'), name:'T', attack:0, health:50, wait:0, cost:0, effects:{triggers:[Object.assign({on:'perTurn', do:'gainLumber', amount:1}, turnOf ? {turnOf} : {})]}});
const defs = Object.assign({}, H.loadCardDefs(), {'ts-both': mk(), 'ts-self': mk('self'), 'ts-enemy': mk('enemy')});
['both','self','enemy'].forEach(k=>{
  const e = E.makeSimEngine(defs, E.mulberry32(3), {});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'ts-'+k, 'right', {}, []);
  const got = [];
  [1,2,1,2].forEach(first=>{ const l0 = P[1].lumber||0; e.resolveCombat(P, so, {}, [], first); got.push((P[1].lumber||0) - l0); });
  const want = {both:'1,1,1,1', self:'1,0,1,0', enemy:'0,1,0,1'}[k];
  ok(got.join(',') === want, `${k}: lumber per round ${got.join(',')} (want ${want})`);
});
console.log(`turn-start: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
