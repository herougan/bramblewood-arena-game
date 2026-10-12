#!/usr/bin/env node
// Earthquake (2026-10-12, user: "This skill should also hit allied non-flying as well"): on play it hits every grounded unit
// on the field, the enemy's and yours, but never the caster itself or a Flying unit. Each hit is tagged `quake` so the
// replay can space them 0.1 s apart.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'eq-caster': {id:'eq-caster', name:'C', attack:0, health:10, wait:2, cost:0, effects:{earthquake:3}},
  'eq-ground': {id:'eq-ground', name:'G', attack:0, health:20, wait:0, cost:0, effects:{}},
  'eq-flyer':  {id:'eq-flyer', name:'F', attack:0, health:20, wait:0, cost:0, effects:{flying:true}},
});
const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
e.debugSpawnCard(P, so, 2, 'eq-ground', 'center', {}, []);
e.debugSpawnCard(P, so, 2, 'eq-flyer', 'right', {}, []);
e.debugSpawnCard(P, so, 1, 'eq-ground', 'center', {}, []);
e.debugSpawnCard(P, so, 1, 'eq-flyer', 'right', {}, []);
const foeG = P[2].row.center[0], foeF = P[2].row.right[0], myG = P[1].row.center[0], myF = P[1].row.right[0];
const ev = [];
e.debugSpawnCard(P, so, 1, 'eq-caster', 'left', {}, ev);
const caster = P[1].row.left[0];
ok(foeG.hp === 17, `enemy grounded unit has ${foeG.hp} (want 17)`);
ok(myG.hp === 17, `your grounded unit has ${myG.hp} (want 17): the quake hits allies too`);
ok(foeF.hp === 20 && myF.hp === 20, 'flyers on both sides are untouched');
ok(caster && caster.hp === 10, 'the caster does not hit itself');
const hits = ev.filter(x=> x.type==='hit');
ok(hits.length === 2 && hits.every(x=> x.quake), `two quake-tagged hits (got ${hits.length})`);
ok(hits.some(x=> x.friendly && x.targetSide==='A'), 'the hit on your own unit is marked friendly');
console.log(`earthquake: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
