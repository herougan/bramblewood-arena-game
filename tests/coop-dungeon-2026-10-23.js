#!/usr/bin/env node
// The group dungeon, table level (2026-10-23, package AR3; rewritten 2026-10-28, package COOP2).
//
//   node tests/coop-dungeon-2026-10-23.js
//
// 2026-10-28 (COOP2, owner K12: "It should be a normal game, but like, raid"): AR3's board (seats A-D on a 7-column co-op board, a shared
// centre, plans locked together, cave-ins / curse / marked column, a pick of three) is gone, and its checks with it. This file now checks
// what the new table keeps from the engine and the vault:
//   1. the engine hooks the table plays through (AR3's, kept): slotCols bounds an Open board, freeSlot places into a free cell of the
//      front or a reserve row, legalSlots stays inside the columns; without slotCols every other fight is as before;
//   2. the floors are live cards; the Tidewarden is a fight-only copy of her base card (scaled with the party), spawned in the centre
//      of the vault's row on the last floor;
//   3. the CPU ally plays its own row only (as a raid ally), pitches its dearest card when nothing is affordable, and passes otherwise;
//   4. a whole floor plays headless to a result (won / lost / time) within the 20-turn clock;
//   5. the Dungeons tab entrance and the module in the build.
// The room, the race and rewards: tests/coop2-2026-10-28.js; the room over the mock relay: tests/coop-lobby-2026-10-23.js.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs();
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }

// ---- 1. the engine hooks
{
  const E = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open', reserveRows: 1, reserveActs: true, slotCols: [-3, -2, -1, 0]});
  const P = {1: E.newPlayer(1, {'quarry-mole': 10, 'cave-olm': 10}), 2: E.newPlayer(2, {'quarry-mole': 20})};
  P[1].lumber = 20; E.draw(P[1], 5, 'A', {}, []);
  const u = P[1].hand[0].uid; ok(E.placeCard(P, H.sideOf, 1, u, -3, {}, [], {freeSlot: true}) && E.allBoardCards(P[1]).some(c=> c.slot === -3), 'engine freeSlot: a unit goes to a free cell with nothing beside it');
  P[1].playedThisTurn = false; P[1].playsThisTurn = 0;
  const u2 = P[1].hand[0].uid; ok(!E.placeCard(P, H.sideOf, 1, u2, 2, {}, [], {freeSlot: true}), 'engine slotCols: no play outside the columns');
  ok(E.placeCard(P, H.sideOf, 1, u2, -1, {}, [], {reserve: 1, freeSlot: true}) && P[1].reserve[0][-1], 'engine freeSlot: a reserve row takes a card with no unit in front of it');
  ok(!E.legalSlots(P[1]).some(sl=> sl > 0), 'engine slotCols: legalSlots stays inside the columns');
  const E0 = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open'}); const P0 = {1: E0.newPlayer(1, {'quarry-mole': 20}), 2: E0.newPlayer(2, {'quarry-mole': 20})};
  E0.debugSpawnCard(P0, H.sideOf, 1, 'quarry-mole', 0, {}, []); ok(E0.legalSlots(P0[1]).join() === '-1,1', 'engine: without slotCols the board is as before');
}

// ---- 2. the floors and the boss
const dg = C.DUNGEONS.hollow;
dg.floors.forEach(f=> ok(Object.keys(f.deck).every(id=> defs[id]), `floor ${f.key}: every card is a live card`));
{
  const ov = C.floorOverlay('hollow', 3, defs), id = C.bossIdOf('hollow', 3), b = ov[id], src = defs['cave-warlord'];
  ok(b && b.gdBoss && b.nameKey === 'ui.ar3-boss-name' && b.health === Math.round(src.health * 1.25 * dg.healthScale[1]), 'boss: the Tidewarden, a copy of her base card, her Health x1.25 x the 2-player scale');
  ok(!Object.keys(C.floorOverlay('hollow', 0, defs)).length && C.bossIdOf('hollow', 0) === null, 'boss: only on the last floor');
  const T = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 3, typeId: 'hollow', floorIdx: 3, seats: [{deck: {'cave-cricket': 20}}, {cpu: true}]});
  const on = T.E.allBoardCards(T.players[2]).find(c=> String(c.defId).startsWith(id)); // (a derived copy id, e.g. ~dv1, when a skill made one)
  ok(on && on.slot === 0, 'boss: she stands in the centre of the vault\'s front row from the start');
  ok(T.seats[1].cpu && Object.keys(T.seats[1].deck).length, 'CPU seat: plays a copy of the first player\'s deck');
}

// ---- 3. the CPU ally
{
  const T = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 8, typeId: 'hollow', floorIdx: 0, seats: [{deck: {'cave-cricket': 20}}, {deck: {'baby-bat': 20}}]});
  const acts = C.cpuActs(T, 1);
  ok(acts.length === 1 && acts[0].kind === 'play' && acts[0].row === 1, 'CPU: plays one card, into its own row (the middle)');
  ok(C.cpuActs(T, 1).length === 0, 'CPU: done for the turn');
  const T2 = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 8, typeId: 'hollow', floorIdx: 0, seats: [{deck: {'cave-cricket': 20}}, {deck: {'deep-cave-troll': 20}}]});
  const a2 = C.cpuActs(T2, 1);
  ok(a2[0] && a2[0].kind === 'pitch' && a2[a2.length - 1].kind === 'pass', `CPU: nothing affordable -> it pitches, then passes (${a2.map(a=> a.kind).join(',')})`);
}

// ---- 4. a whole floor, headless
{
  const res = {};
  for(let k = 0; k < 4; k++){
    const T = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 50 + k, typeId: 'hollow', floorIdx: k, seats: [{deck: {'cave-cricket': 8, 'quarry-mole': 6, 'baby-bat': 6}, castleHp: 15}, {cpu: true}], recordEvents: false});
    let r = {}; for(let i = 0; i < 30 && !r.over; i++){ C.cpuActs(T, 0); C.cpuActs(T, 1); r = C.headlessRound(T); }
    res[k] = T.over + ':' + T.reason + '@' + T.round;
    ok(!!T.over && T.round <= 20, `floor ${k + 1}: the fight ends within the 20-turn clock (${res[k]})`);
  }
  console.log('  floors headless:', JSON.stringify(res));
}

// ---- 5. the page
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/const GD_OPEN_AFTER_MAP = 16;/.test(app) && /function groupDungeonCardHTML/.test(app) && /groupDungeonCardHTML\(\)/.test(app), 'page: the Dungeons tab entrance (Map 16) and the card');
ok(/\.\/bramblewood-coop\.js|bramblewood-coop\.js/.test(fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8')), 'build: the module is inlined by assemble_arena.py');
const texts = require(path.join(ROOT, 'bramblewood-texts.js')); const T0 = texts.TEXT || texts;
ok(C.TEXT_KEYS.every(k=> T0[k]), 'texts: the vault\'s names are TX keys');

console.log(`coop-dungeon: ${pass} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
