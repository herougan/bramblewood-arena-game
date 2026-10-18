#!/usr/bin/env node
// 2026-10-18 (the owner's raid notes 13 and 14, 10:27): the engine and logic side of the raid fixes.
//   - every unit acts, whatever its row: with reserveActs the middle and back rows strike in the round's own combat, both sides,
//     column by column left to right and, in each column, the front row first, then the middle, then the back;
//   - back rows really hit (the unit facing them, or the castle with that column empty), Waiting ones count down first;
//   - a raid can end with your castle above 0 only on its clock, and that is now on screen (the ribbon's clock, a last-turn banner,
//     "THE TIDE TURNS"), and the castle bars are synced to the real Health once a round's replay is over;
//   - a castle can't be shocked: lightning (shock) damage aimed at a castle is grounded, in every mode;
//   - the merged raid castle wears your castle's art and name + " & Co."; the raid's camera keeps one framing.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const R = require('../bramblewood-raid.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:4, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'rf-hit': U('rf-hit', {}, {attack:4}), 'rf-wall': U('rf-wall', {}, {attack:0}), 'rf-slow': U('rf-slow', {}, {attack:6, wait:1}),
  'rf-zap': U('rf-zap', {lightning:5}, {attack:0}), 'rf-shockbolt': U('rf-shockbolt', {shockBolt:3}, {attack:0}), 'rf-firebolt': U('rf-firebolt', {fireBolt:3}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts){ const e = E.makeSimEngine(defs, E.mulberry32(11), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2}, opts || {})); return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');

// ---- The order: column by column (left to right), and in each column the front row, then the middle, then the back
{ const {e, P} = mk({reserveActs:true});
  const f1 = put(e, P, 1, 'rf-hit', -1), f2 = put(e, P, 1, 'rf-hit', 1);
  const m1 = e.fillReserve(P[1], 1, -1, 'rf-hit'), b1 = e.fillReserve(P[1], 2, -1, 'rf-hit'), m2 = e.fillReserve(P[1], 1, 1, 'rf-hit');
  put(e, P, 2, 'rf-wall', -1); put(e, P, 2, 'rf-wall', 1);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const order = ev.map(x=> x.type === 'hit' || x.type === 'hitHQ' ? x.attUid : (x.type === 'fieldTick' && (x.field === 'volleyHit' || x.field === 'volleyCastle')) ? x.fromUid : null).filter(u=> u != null);
  const want = [f1.uid, m1.uid, b1.uid, f2.uid, m2.uid];
  ok(JSON.stringify(order) === JSON.stringify(want), `column -1 front, middle, back, then column 1 front, middle (${order.join()} vs ${want.join()})`);
  ok(!ev.some(x=> x.type === 'fieldTick' && x.field === 'volley'), 'no round-start volley header inside combat'); }

// ---- Both sides' back rows strike, at the unit facing them or the castle with that column empty
{ const {e, P} = mk({reserveActs:true});
  const mine = put(e, P, 1, 'rf-wall', 0); e.fillReserve(P[1], 1, 0, 'rf-hit');
  const theirs = put(e, P, 2, 'rf-wall', 0); e.fillReserve(P[2], 2, 0, 'rf-hit'); put(e, P, 2, 'rf-wall', 2); e.fillReserve(P[2], 1, 2, 'rf-hit');
  const h1 = P[1].hq.hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(theirs.hp === 498, `your middle row hits the boss unit facing it for half Attack (${500 - theirs.hp})`);
  ok(mine.hp === 498, `the boss's back row hits your unit facing it (${500 - mine.hp})`);
  ok(P[1].hq.hp === h1 - 2, `a boss middle-row unit with nobody in front of it hits your castle (${h1 - P[1].hq.hp})`);
  ok(ev.some(x=> x.field === 'volleyCastle' && x.side === 'A' && x.fromSide === 'B'), 'the castle strike is logged with the side that struck'); }

// ---- A Waiting reserve unit counts down in combat (one round), then strikes; without reserveActs reserves don't act in combat
{ const {e, P} = mk({reserveActs:true}); put(e, P, 1, 'rf-wall', 0); const s = e.fillReserve(P[1], 1, 0, 'rf-slow'); const t = put(e, P, 2, 'rf-wall', 0);
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 500 && s.wait === 0, `Wait 1: round 1 counts down, no strike (${500 - t.hp}, wait ${s.wait})`);
  e.resolveCombat(P, so, {}, [], 2); ok(t.hp === 497, `round 2: it strikes for half its 6 (${500 - t.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rf-wall', 0); e.fillReserve(P[1], 1, 0, 'rf-hit'); const t = put(e, P, 2, 'rf-wall', 0);
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 500, 'no reserveActs: reserves stay out of combat (the old volley is still there for callers)');
  e.reserveVolley(P, so, 1, {}, []); ok(t.hp === 498, 'reserveVolley still strikes on request'); }

// ---- A back-row strike can end the fight: resolveCombat reports it
{ const {e, P} = mk({reserveActs:true}); P[2].hq.hp = 2; put(e, P, 1, 'rf-wall', 0); e.fillReserve(P[1], 1, 0, 'rf-hit');
  const over = e.resolveCombat(P, so, {}, [], 1); ok(over === true && P[2].hq.hp === 0, `a middle-row strike that takes the last Health ends the match (${over}, ${P[2].hq.hp})`); }

// ---- A castle can't be shocked: the Lightning skill and a Shock Bolt with no unit to hit are grounded; a Fire Bolt still lands
{ const {e, P} = mk(); const h = P[2].hq.hp, ev = []; e.debugSpawnCard(P, so, 1, 'rf-zap', 0, {}, ev);
  ok(P[2].hq.hp === h, `Lightning 5 with no enemy unit: the castle takes nothing (${h - P[2].hq.hp})`);
  ok(ev.some(x=> x.type === 'grounded' && x.targetSide === 'B'), 'a grounded event says so'); }
{ const {e, P} = mk(); put(e, P, 1, 'rf-shockbolt', 0); const h = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp === h, `a Shock Bolt at the castle: grounded (${h - P[2].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rf-firebolt', 0); const h = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp < h, `a Fire Bolt at the castle still lands (${h - P[2].hq.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'rf-wall', 0); e.debugSpawnCard(P, so, 1, 'rf-zap', 0, {}, []);
  ok(t.hp === 495, `Lightning on a unit still strikes it (${500 - t.hp})`); }
ok(!/the (?:castle|bramble) if there are none\) for \$\{v\} lightning/.test(src) && /a bramble can't be shocked/.test(src), 'the Lightning text no longer promises a castle hit');

// ---- The raid in the page: rows act in combat (no round-start volley for your rows), the clock, the end, the castle name, the camera
ok(/reserveRows:2, reserveActs:true/.test(src), 'the raid engine runs with reserveActs');
ok(!/m\.engine\.reserveVolley\(m\.players, m\.sideOf, 1, m\.stats, drawEvents\)/.test(src), 'no round-start volley for your rows any more');
ok(/function raidClockPillHTML\(m\)/.test(src) && /m\.raidRoundCap && !m\.over \? raidClockPillHTML\(m\)/.test(src), 'the raid clock sits on the boss\'s HP ribbon');
ok(/m\.round === m\.raidRoundCap && !m\.raidLastTurnShown/.test(src) && /function raidLastTurnBanner\(m\)/.test(src), 'the last turn is announced');
ok(/m\.endReason === 'raidTime'\) text = 'THE TIDE TURNS'/.test(src), 'a raid out of turns ends on "THE TIDE TURNS", not "DRAW"');
ok(/m\.displayHqHp\.A = Math\.max\(0, m\.players\[1\]\.hq\.hp\)/.test(src), 'the castle bars are synced to the real Health after the replay');
ok(/ev\.field==='volleyCastle'\)\) && m\.displayHqHp/.test(src) && /displayHqDamage\(m, ev\.side, ev\.dmg\)/.test(src), 'a back-row strike on a castle steps the bar down and can end the replay');
{ const i = src.indexOf('function mergeRaidCastles('); const body = src.slice(i, src.indexOf('\n}', i) + 2);
  const fn = new Function(body + '; return mergeRaidCastles;')();
  const mc = fn([{id:'fortified-nest', name:'Fortified Nest', icon:'🪺', art:'art/castles/nest.png', health:40, effects:{a:1}}, {id:'x', name:'X', health:30, effects:{a:2}}, {id:'y', name:'Y', health:30, effects:{b:true}}]);
  ok(mc.name === 'Fortified Nest & Co.' && mc.art === 'art/castles/nest.png' && mc.id === 'fortified-nest' && mc.raidMerged, `the merged castle is yours "& Co." with your art (${mc.name}, ${mc.art})`);
  ok(mc.health === 100 && mc.effects.a === 3 && mc.effects.b === true, 'its Health and passives are still all three added up'); }
ok(/def\.raidMerged \? ' raid-castles'/.test(src), 'the merged castle keeps the raid-castles tile class');
ok(/m\.raidFull \? 3 : 0\)/.test(src) && /if\(raid && mm\._raidFrameKey === raidFrameKey\(mm\)\) return;/.test(src), 'the raid board is seven columns from the start and keeps one framing');
ok(/const lean = raidCols \? null/.test(src), 'the raid camera doesn\'t lean');
ok(/\.board-row\.reserve-row > \.board-card\{transform:scale\(\.84\)/.test(tpl), 'back-row cards are 20% larger (.84 of a front card, were .7)');
ok(/extra time as each round starts/.test(R.describeStage({name:'Enraged', rules:{extraVolley:1}}, {})), 'a stage\'s extra volley reads as extra');

if(fail){ console.log(`raid-fixes-2026-10-18: ${fail} failed`); process.exit(1); }
console.log('raid-fixes-2026-10-18: ok');
