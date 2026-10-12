#!/usr/bin/env node
// Action targets (2026-10-12, 23:12 list): Heal takes a target; who:'any'; several distinct targets per firing.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const T = (id, trig)=> ({id, name:id, attack:0, health:20, wait:0, cost:0, effects:{triggers:[Object.assign({on:'onRoundStart'}, trig)]}});
const defs = Object.assign({}, H.loadCardDefs(), {
  'at-healer': T('at-healer', {do:'heal', amount:3, who:'ally', sub:'random', targets:2}),
  'at-zap': T('at-zap', {do:'damage', amount:2, who:'enemy', sub:'random', targets:3}),
  'at-any': T('at-any', {do:'poison', amount:1, who:'any', sub:'random', targets:4}),
  'at-wall': {id:'at-wall', name:'W', attack:0, health:20, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const fresh = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
{ const {e, P} = fresh();
  e.debugSpawnCard(P, so, 1, 'at-healer', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'at-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'at-wall', 'right', {}, []);
  const h = all(P[1]).find(c=> c.defId==='at-healer'), walls = all(P[1]).filter(c=> c !== h); walls.forEach(w=> e.debugDamage(P, so, w.uid, 10, {}, []));
  e.debugFireTrigger(P, so, h.uid, 'onRoundStart', {}, []);
  ok(walls.every(w=> w.hp === 13), `Heal → 2 allies healed once each (${walls.map(w=>w.hp)})`); }
{ const {e, P} = fresh();
  e.debugSpawnCard(P, so, 1, 'at-zap', 'left', {}, []); ['left','right','left'].forEach(l=> e.debugSpawnCard(P, so, 2, 'at-wall', l, {}, []));
  const z = all(P[1]).find(c=> c.defId==='at-zap'); const hq0 = P[2].hq.hp; e.debugFireTrigger(P, so, z.uid, 'onRoundStart', {}, []);
  const hp = all(P[2]).map(c=> c.hp); const lost = hp.reduce((n, v)=> n + 20 - v, 0) + (hq0 - P[2].hq.hp);
  ok(lost === 6 && hp.every(v=> v >= 18), `3 hits of 2, never the same unit twice (units ${hp}, castle -${hq0 - P[2].hp})`); }
{ const {e, P} = fresh();
  e.debugSpawnCard(P, so, 1, 'at-any', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'at-wall', 'right', {}, []); ['left','right'].forEach(l=> e.debugSpawnCard(P, so, 2, 'at-wall', l, {}, []));
  const a = all(P[1]).find(c=> c.defId==='at-any'); e.debugFireTrigger(P, so, a.uid, 'onRoundStart', {}, []);
  const others = [...all(P[1]), ...all(P[2])].filter(c=> c.uid !== a.uid);
  ok(others.every(c=> c.poison === 1) && !a.poison, `Any → 3 other units poisoned once each (${others.map(c=>c.poison)})`); }
console.log(`action-targets: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
