#!/usr/bin/env node
// 2026-11-02 (package FIX4, QA1 health check): behavioural regression checks for the engine bugs QA1 found.
//   FIX4-3: the CPU whose only card is the one it saves for no longer throws in its pitch (pitchPick([]) "Reduce of empty array").
//   FIX4-4: War Banner and Herald reach every row in a raid / group dungeon (3 rows a side), as Amplifier does (package RR's rule).
// The app-side fixes (PvP stranger plays, Live Ranked not frozen by a lesson, reward reveal padlocks) are in the browser run
// tests/e2e/fix4_2026_11_02.py; this file also checks their source shape where a browser is not at hand.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'fx4-big': U('fx4-big', {}, {attack:6, health:6, cost:9}),
  'fx4-plain': U('fx4-plain', {}, {attack:8}), 'fx4-wall': U('fx4-wall', {}),
  'fx4-banner': U('fx4-banner', {banner:2}), 'fx4-herald': U('fx4-herald', {herald:3}),
  'fx4-leader': U('fx4-leader', {leader:true}, {attack:4, health:20}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];

// ---- FIX4-3: the CPU's only card is the one it saves for (aiAim on, the save plan this turn), it can't afford it, it must not throw
[1, 2, 3, 4, 5].forEach(seed=>{
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open', aiAim:true, aiLevel:2});
  const P = {1: e.newPlayer(1, {'fx4-wall':5}, {health:50}), 2: e.newPlayer(2, {'fx4-big':1}, {health:50})};
  e.draw(P[2], 1, 'B', {}, []);
  const ai = P[2]; ai.lumber = 0;
  ok(ai.hand.length === 1, `[seed ${seed}] the CPU holds one card (${ai.hand.length})`);
  ai._aiSave = {uid: ai.hand[0].uid, turns: 1, last: e.turnNo()};
  let err = null; try{ e.aiTakeTurn(P, so, 2, {}, []); }catch(x){ err = x; }
  ok(!err, `[seed ${seed}] the CPU's turn with only its saved card does not throw (${err && err.message})`);
  ok(ai.hand.some(h=> h.defId === 'fx4-big'), `[seed ${seed}] the card it saves for is kept`);
});

// ---- FIX4-4: War Banner / Herald from any row reach units in every row (raid: reserveRows 2 + reserveActs)
function mk(){ const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true});
  return {e, P:{1: e.newPlayer(1, {}, {health:200}), 2: e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);
const ROWS = ['front', 'middle', 'back'];
[0, 1, 2].forEach(br=> [0, 1, 2].forEach(ur=>{
  const {e, P} = mk(); place(e, P, 1, br, 'fx4-banner', 3); const u = place(e, P, 1, ur, 'fx4-plain', 0);
  e.sk3Sync(P);
  ok(u.atk === 10, `War Banner 2 in the ${ROWS[br]} row gives a ${ROWS[ur]}-row unit +2 Attack (atk ${u.atk}, want 10)`);
}));
[0, 2].forEach(hr=> [0, 2].forEach(lr=>{
  const {e, P} = mk(); place(e, P, 1, hr, 'fx4-herald', 3); const l = place(e, P, 1, lr, 'fx4-leader', 0);
  e.sk3Sync(P);
  ok(l.atk === 7 && l.maxHp === 23, `Herald 3 in the ${ROWS[hr]} row gives the ${ROWS[lr]}-row leader +3/+3 (${l.atk}/${l.maxHp}, want 7/23)`);
}));
// no doubling: a second sync changes nothing
{ const {e, P} = mk(); place(e, P, 1, 2, 'fx4-banner', 3); const u = place(e, P, 1, 1, 'fx4-plain', 0); e.sk3Sync(P); e.sk3Sync(P);
  ok(u.atk === 10, `a second sync keeps the Banner at +2 (atk ${u.atk})`); }
// a solo (one-row) board is unchanged: the Banner beside the unit gives +2, the Banner's own Attack stays
{ const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open'}); const P = {1: e.newPlayer(1, {}, {health:200}), 2: e.newPlayer(2, {}, {health:200})};
  const b = put(e, P, 1, 'fx4-banner', 1), u = put(e, P, 1, 'fx4-plain', 0); e.sk3Sync(P);
  ok(u.atk === 10 && b.atk === 0, `solo board: Banner +2 to the other unit only (${u.atk}, banner ${b.atk})`); }

// ---- source checks for the app fixes (the browser run plays them)
const app = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8');
{ const i = app.indexOf('function startMatchInner('), body = app.slice(i, app.indexOf('\nfunction ', i + 10));
  const lv = body.indexOf('pvpLevelStranger('), en = body.indexOf('makeSimEngine(');
  ok(lv > 0 && en > lv, 'FIX4-1: startMatchInner levels the PvP stranger before it builds the engine'); }

console.log(fail ? `fix4-2026-11-02: ${fail} failed, ${pass} passed` : `fix4-2026-11-02: all ${pass} passed`);
process.exit(fail ? 1 : 0);
