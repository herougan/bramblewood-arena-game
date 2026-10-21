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

// ---- A castle and lightning (2026-10-18, owner 15:05 "No Shocked status on Brambles." reverts the morning's grounding): the
// Lightning skill and a Shock Bolt with no unit to hit strike the castle for their damage again, but the castle is never Shocked
{ const {e, P} = mk(); const h = P[2].hq.hp, ev = []; e.debugSpawnCard(P, so, 1, 'rf-zap', 0, {}, ev);
  ok(h - P[2].hq.hp === 5, `Lightning 5 with no enemy unit: the castle takes 5 (${h - P[2].hq.hp})`);
  ok(!ev.some(x=> x.type === 'grounded') && !(P[2].hq.shocked > 0), 'no grounded event, the castle is not Shocked'); }
{ const {e, P} = mk(); put(e, P, 1, 'rf-shockbolt', 0); const h = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp < h && !(P[2].hq.shocked > 0), `a Shock Bolt at the castle lands, no Shocked (${h - P[2].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rf-firebolt', 0); const h = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp < h, `a Fire Bolt at the castle still lands (${h - P[2].hq.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'rf-wall', 0); e.debugSpawnCard(P, so, 1, 'rf-zap', 0, {}, []);
  ok(t.hp === 495, `Lightning on a unit still strikes it (${500 - t.hp})`); }
// 2026-10-21 (package TT): 'grounded' is now package SK3's Magnet status (Grounded, 2026-10-19), so the check names the old lightning
// event itself: no 'grounded' log line or "⚡ Grounded" float in the app, no {type:'grounded'} event from the engine
{ const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
  ok(/With no enemy unit it strikes the bramble, which is never Shocked/.test(src) && !/ev\.type === 'grounded'/.test(src) && !/⚡ Grounded/.test(src) && !/type:'grounded'/.test(eng), 'the Lightning text: the bramble is struck, never Shocked; no grounded log/float (2026-10-18 owner 15:05)'); }

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

// ---- 2026-10-18 (owner 11:46, package W): 20-turn raids, the super whales' bonus Health
{ const RAIDS = require('../canonical/raids.json'), g = RAIDS.find(r=> r.id === 'goliath'), g0 = Object.assign({}, g, {standIns:{perDayPct:0}});
  ok(g.fightRounds === 20 && g.parts.every(p=> !(p.fight && p.fight.rounds) || p.fight.rounds === 20), 'the Goliath: 20 turns a fight');
  ok(R.FIGHT_ROUNDS_DEFAULT === 20 && R.fightRounds({}) === 20 && R.fightRounds({fightRounds:8}) === 8 && R.fightRounds({}, {fight:{rounds:5}}) === 5, "fightRounds: 20 by default, the raid's or the part's own when set");
  const now = 2900 * R.CYCLE_MS, fresh = R.raidState(g0, [], now, {cycle:2900});
  // 2026-10-19 (package RB, owner 12:23: "Elder should be rebalanced to start at 50 HP at max."): the ceiling is 50 now (was 100)
  // 2026-10-19 (package RB2, owner 16:28: "make the raid very slightly harder"): 55
  ok(g.bossHpBonusMax === 55 && R.bossHpBonus(g, fresh).bonus === 55 && R.bossHpBonus(g, fresh).fraction === 1, `a fresh raid: +55 (${JSON.stringify(R.bossHpBonus(g, fresh))})`);
  const hit = Math.round(fresh.total * 0.15), half = R.raidState(g0, [{raidId:g.id, part:'left', cycle:2900, owner:'a', contribution: hit}], now, {cycle:2900});
  const want = Math.round(55 * half.remaining / half.total);
  ok(R.bossHpBonus(g, half).bonus === want && want < 55 && want > 35, `a raid down to ${Math.round(half.fraction * 100)}%: +${R.bossHpBonus(g, half).bonus}`);
  ok(R.bossHpBonus(g, {total:100, remaining:2}).bonus === 1 && R.bossHpBonus(g, {total:100, remaining:0}).bonus === 0 && R.bossHpBonus(g, {total:100, remaining:500}).bonus === 55, 'nearly dead: about +0; never below 0 or above the max');
  ok(R.bossHpBonus({}, fresh).bonus === 0 && R.bossHpBonus({bossHpBonusMax:5000}, fresh).bonus === 1000 && R.bossHpBonus({bossHpBonusMax:-5}, fresh).bonus === 0, 'no bossHpBonusMax: no bonus; clamped to 0–1000'); }
// 2026-10-19 (package RV2): the bonus takes the unit's basic Health now (100 fresh, down to basic), see tests/raid-rv2-2026-10-19.js
ok(/const bossHpBonus = \(bossUnitId && RaidM\.bossHpBonus\) \? RaidM\.bossHpBonus\(raidDefScaled\(def\), st, defs\[bossUnitId\]\.health\)\.bonus : 0;/.test(src) /* 2026-10-21 (BF5): the raid at BRAMBLE_SCALE */ && /raidBossHpBonus: bossHpBonus/.test(src), 'the fight is built with the bonus from the raid state (cloud, or this device offline)');
ok(/const bonus = Math\.max\(0, m\.raidBossHpBonus \| 0\); if\(bonus\)\{ c\.hp \+= bonus; c\.maxHp = /.test(src) && /c\.bossHpBonus = bonus/.test(src), 'each boss unit comes in with the bonus on its Health and max Health');
ok(/!irr && !lc\.bossHpBonus\) return/.test(src), 'the card details show the bonus as a bonus (base + N)');
ok(/TX\('ui\.raid-might', \{name: def\.name \|\| 'The boss', hp: bh\.max, pct: Math\.ceil\(bh\.fraction \* 100\)\}\)/.test(src), "the raid tab names the elders' fresh Health and the raid's share (2026-10-19, RV2: a TX line)");
ok(/RAID_BOSS_UNIT_ROUNDS = new Set\(\[3, 7, 11, 15, 19\]\)/.test(src), 'boss units on rounds 3, 7, 11, 15 and 19');
ok(/raidRoundCap: f\.rounds \|\| cfg\.rounds/.test(src) && /TX\('ui\.rb-fight-note', \{turns: RaidM\.fightRounds\(def\)\}\)/.test(src) /* 2026-10-19 (package RB): a TX line */, 'the fight and the raid tab take the 20-turn clock from the data');
ok(/m\.round >= SUDDEN_DEATH_ROUND && !\(m\.raidRoundCap && m\.raidRoundCap <= SUDDEN_DEATH_ROUND\)/.test(src), 'a raid that ends by turn 20 never goes into sudden death');
{ const i = src.indexOf('const RAID_NEW_KEYS'), j = src.indexOf('\n', src.indexOf('function allRaidDefs('));
  const all = (base, edits)=> new Function('RAID_DEFS_BASE', 'raidDefEdits', src.slice(i, j) + '\nreturn allRaidDefs();')(base, edits);
  const base = [{id:'g', fightRounds:20, bossHpBonusMax:100}];
  ok(all(base, {g:{id:'g', fightRounds:12}})[0].fightRounds === 20 && all(base, {g:{id:'g', fightRounds:12}})[0].bossHpBonusMax === 100, 'an old edit on 12 turns: 20 now, and the bonus');
  ok(all(base, {g:{id:'g', fightRounds:12, roundsV:2}})[0].fightRounds === 12 && all(base, {g:{id:'g', fightRounds:15}})[0].fightRounds === 15 && all(base, {g:{id:'g', bossHpBonusMax:0}})[0].bossHpBonusMax === 0, 'a turn count or bonus picked since stays'); }

if(fail){ console.log(`raid-fixes-2026-10-18: ${fail} failed`); process.exit(1); }
console.log('raid-fixes-2026-10-18: ok');
