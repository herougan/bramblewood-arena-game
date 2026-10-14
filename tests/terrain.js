#!/usr/bin/env node
// Terrain and Immune (2026-10-12). Home ground (natives +atk/+hp and a granted skill) was retired 2026-10-14; rules.terrain
// is only the biome's name now. effects.immune: a matching hit (damage type here) deals 0.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tr-native': {id:'tr-native', name:'N', attack:2, health:5, wait:0, cost:0, archetypes:['Swamp'], effects:{}},
  'tr-native-own': {id:'tr-native-own', name:'O', attack:2, health:5, wait:0, cost:0, archetypes:['Swamp'], effects:{poison:3}},
  'tr-other': {id:'tr-other', name:'X', attack:2, health:5, wait:0, cost:0, archetypes:['Village'], effects:{}},
  'tr-immune': {id:'tr-immune', name:'I', attack:0, health:10, wait:0, cost:0, effects:{immune:['Volcanic']}},
  'tr-burner': {id:'tr-burner', name:'B', attack:0, health:10, wait:3, cost:0, archetypes:['Volcanic'], effects:{pounce:4}},
});
// 2026-10-14 (user: "Remove the Home ground explanation. Remove the home ground effect."): rules.terrain no longer changes anyone.
const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, rules:{terrain:{types:['Swamp'], atk:1, hp:2, grant:{poison:1}}}});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
e.debugSpawnCard(P, so, 1, 'tr-native', 'center', {}, []);
e.debugSpawnCard(P, so, 2, 'tr-native', 'center', {}, []);
e.debugSpawnCard(P, so, 2, 'tr-other', 'left', {}, []);
const mine = P[1].row.center[0], theirs = P[2].row.center[0], other = P[2].row.left[0];
ok(mine.atk === 2 && mine.hp === 5 && mine.maxHp === 5, `a native is plain ${mine.atk}/${mine.hp} (want 2/5): no home ground`);
ok(theirs.atk === 2 && theirs.hp === 5, `their native is plain ${theirs.atk}/${theirs.hp} (want 2/5)`);
ok(other.atk === 2 && other.hp === 5, `a non-native stays ${other.atk}/${other.hp} (want 2/5)`);
ok(!(e.effectsOf(mine) || {}).poison, 'a native gets no granted skill (no Poison 1)');
// Immune: a pounce from a Volcanic attacker on a unit immune to Volcanic does nothing
const e3 = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true});
const P3 = {1: e3.newPlayer(1, {}), 2: e3.newPlayer(2, {})};
e3.debugSpawnCard(P3, so, 2, 'tr-immune', 'center', {}, []);
const imm = P3[2].row.center[0];
e3.debugSpawnCard(P3, so, 1, 'tr-burner', 'left', {}, []);
ok(imm.hp === 10, `a unit immune to Volcanic attackers took ${10 - imm.hp} (want 0)`);
console.log(`terrain: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
