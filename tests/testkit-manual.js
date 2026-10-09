#!/usr/bin/env node
// Test Kit manual controls (2026-10-10): debugAttack swings once with on-hit effects and no upkeep; debugDamage fires
// On Attacked; debugHeal heals; debugFireTrigger runs one hook.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tm-poison': {id:'tm-poison', name:'P', attack:2, health:20, wait:0, cost:0, effects:{poisonOnHit:2, triggers:[{on:'onAttacked', do:'gain', resource:'lumber', amount:1},{on:'onRoundStart', do:'gain', resource:'lumber', amount:5}]}},
  'tm-wall': {id:'tm-wall', name:'W', attack:0, health:30, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const e = E.makeSimEngine(defs, E.mulberry32(4), {recordEvents:true});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
e.debugSpawnCard(P, so, 1, 'tm-poison', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'tm-wall', 'left', {}, []);
const me = all(P[1])[0], foe = all(P[2])[0];
const ev = []; e.debugAttack(P, so, me.uid, {}, ev);
ok(foe.hp === 28, `one swing for 2 (wall ${foe.hp})`);
ok(ev.filter(x=> x.type==='hit').length === 1, 'exactly one hit, no counter-attack from the wall');
ok(!ev.some(x=> x.type==='waitTick' || x.type==='poisonTick'), 'no upkeep in a manual attack');
const l0 = P[1].lumber||0; e.debugDamage(P, so, me.uid, 3, {}, []);
ok(me.hp === 17 && (P[1].lumber||0) === l0 + 1, `damage 3 lands and fires On Attacked (hp ${me.hp}, lumber +${(P[1].lumber||0)-l0})`);
e.debugHeal(P, so, me.uid, 2, {}, []); ok(me.hp === 19, `heal 2 (hp ${me.hp})`);
const l1 = P[1].lumber||0; e.debugFireTrigger(P, so, me.uid, 'onRoundStart', {}, []); ok((P[1].lumber||0) === l1 + 5, 'firing On Round Start runs that trigger');
e.debugDamage(P, so, foe.uid, 999, {}, []); ok(!all(P[2]).length, 'kill removes the card');
console.log(`testkit-manual: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
