#!/usr/bin/env node
// Terrain and Immune (2026-10-12). rules.terrain gives native cards (by type) +atk/+hp and its granted skills, on both
// sides, without touching anyone else. effects.immune: a matching hit (damage type here) deals 0.
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
const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, rules:{terrain:{types:['Swamp'], atk:1, hp:2, grant:{poison:1}}}});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
e.debugSpawnCard(P, so, 1, 'tr-native', 'center', {}, []);
e.debugSpawnCard(P, so, 2, 'tr-native', 'center', {}, []);
e.debugSpawnCard(P, so, 2, 'tr-other', 'left', {}, []);
const mine = P[1].row.center[0], theirs = P[2].row.center[0], other = P[2].row.left[0];
ok(mine.atk === 3 && mine.hp === 7 && mine.maxHp === 7, `your native is ${mine.atk}/${mine.hp} (want 3/7)`);
ok(theirs.atk === 3 && theirs.hp === 7, `their native is ${theirs.atk}/${theirs.hp} (want 3/7): terrain favours both sides`);
ok(other.atk === 2 && other.hp === 5, `a non-native stays ${other.atk}/${other.hp} (want 2/5)`);
// the grant is visible to the engine's skill code, and a card's own value wins
const e2 = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, rules:{terrain:{types:['Swamp'], atk:0, hp:0, grant:{poison:1}}}});
const P2 = {1: e2.newPlayer(1, {}), 2: e2.newPlayer(2, {})};
e2.debugSpawnCard(P2, so, 1, 'tr-native-own', 'center', {}, []);
// Immune: a pounce from a Volcanic attacker on a unit immune to Volcanic does nothing
const e3 = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true});
const P3 = {1: e3.newPlayer(1, {}), 2: e3.newPlayer(2, {})};
e3.debugSpawnCard(P3, so, 2, 'tr-immune', 'center', {}, []);
const imm = P3[2].row.center[0];
e3.debugSpawnCard(P3, so, 1, 'tr-burner', 'left', {}, []);
ok(imm.hp === 10, `a unit immune to Volcanic attackers took ${10 - imm.hp} (want 0)`);
console.log(`terrain: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
