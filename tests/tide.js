#!/usr/bin/env node
// Tide and Wash (2026-10-09, second archetype): from round 2 the water alternates Flow / Ebb each round. On Flow,
// Tide units hit +1 and Wash units push the enemy card facing them back 1 Wait (once per enemy card); on Ebb,
// Tide units take 1 less from each hit (never below 1).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'tt-tide':  {id:'tt-tide', name:'T Tide', attack:2, health:500, wait:0, cost:0, effects:{tide:true}},
  'tt-plain': {id:'tt-plain', name:'T Plain', attack:2, health:500, wait:0, cost:0, effects:{}},
  'tt-wall':  {id:'tt-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'tt-twall': {id:'tt-twall', name:'T Tide Wall', attack:0, health:500, wait:0, cost:0, effects:{tide:true}},
  'tt-hit':   {id:'tt-hit', name:'T Hitter', attack:5, health:500, wait:0, cost:0, effects:{}},
  'tt-wash':  {id:'tt-wash', name:'T Wash', attack:0, health:500, wait:0, cost:0, effects:{tide:true, wash:true}},
});
function setup(rounds){
  const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  for(let r=2; r<=rounds; r++) e.roundStart(P, r, so, {}, []);
  return {e, P};
}
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const hpSum = pl=> all(pl).reduce((t, c)=> t + c.hp, 0);
function dealt(att, def, rounds){
  const {e, P} = setup(rounds);
  e.debugSpawnCard(P, so, 1, att, 'left', {}, []); e.debugSpawnCard(P, so, 2, def, 'left', {}, []);
  const before = hpSum(P[2]); e.resolveCombat(P, so, {}, [], 1); return before - hpSum(P[2]);
}
// 1) the cycle
{ const {e} = setup(1); ok(e.getTide() === null, `round 1 has no tide (got ${e.getTide()})`); }
{ const {e} = setup(2); ok(e.getTide() === 'flow', `round 2 is Flow (got ${e.getTide()})`); }
{ const {e} = setup(3); ok(e.getTide() === 'ebb', `round 3 is Ebb (got ${e.getTide()})`); }
// 2) Flow: a Tide unit hits +1 (2 -> 3)
{ const p = dealt('tt-plain', 'tt-wall', 2), t = dealt('tt-tide', 'tt-wall', 2);
  ok(p > 0 && t * 2 === p * 3, `on Flow a 2-attack Tide unit should deal 3 per hit (plain ${p}, tide ${t})`); }
// 3) Ebb: no attack bonus, and a Tide unit takes 1 less per hit (5 -> 4)
{ const p = dealt('tt-plain', 'tt-wall', 3), t = dealt('tt-tide', 'tt-wall', 3); ok(p === t, `on Ebb Tide gives no attack bonus (plain ${p}, tide ${t})`); }
{ const p = dealt('tt-hit', 'tt-wall', 3), t = dealt('tt-hit', 'tt-twall', 3);
  ok(p > 0 && t * 5 === p * 4, `on Ebb a Tide unit should take 4 from a 5 hit (plain ${p}, tide ${t})`); }
// 4) Wash: +1 Wait to the facing enemy on Flow, once per enemy card
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open'});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'tt-wash', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'tt-wall', 'left', {}, []);
  const foe = all(P[2])[0], w0 = foe.wait || 0; const ev = [];
  e.roundStart(P, 2, so, {}, ev);
  ok((foe.wait||0) === w0 + 1, `Flow: the facing enemy gets +1 Wait (${w0} → ${foe.wait})`);
  ok(ev.some(x=> x.type==='wash'), 'a wash event is recorded');
  e.roundStart(P, 3, so, {}, []); e.roundStart(P, 4, so, {}, []);
  ok((foe.wait||0) === w0 + 1, `a card is washed back only once (wait ${foe.wait})`); }
console.log(`tide: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
