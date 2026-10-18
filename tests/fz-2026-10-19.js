#!/usr/bin/env node
// 2026-10-19 (package FZ, owner 23:32):
//   1. "When a card is frozen before its turn arrives — it fails to take an action." A unit frozen earlier in the round (before its
//      own place in the order) skips that action, and the freeze is spent: it acts again the next round (Freeze 1 = one lost action).
//      Frozen after it acted (the opponent's later hit): it skips its next round instead, as before.
//   2. "Confuse — 1/2 chance that its triggers, skills and actions fail to activate." Over many seeded trials: its triggers, its
//      on-hit skills, its swing, its shots and its counter each go off about half the time; the fumble is logged ({type:'confusedWhiff'})
//      and the log line is "😵 X is confused and fumbles.". Seeded: the same seed gives the same fight. A unit that isn't Confused
//      draws no number (an unconfused fight is unchanged).
//   3. The CPU: a Confused unit facing a slot counts as a half threat (aiSwingOdds).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const {TX} = require('../bramblewood-texts.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:2, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'fz-freezer': U('fz-freezer', {freeze:{chance:100, duration:1}}, {attack:1}),
  'fz-freezer2': U('fz-freezer2', {freeze:{chance:100, duration:2}}, {attack:1}),
  'fz-victim': U('fz-victim', {}, {attack:2}),
  'fz-wall': U('fz-wall', {}, {attack:0, health:5000}),
  'fz-trig': U('fz-trig', {triggers:[{on:'onAttacked', do:'buff', who:'self', amount:1}]}, {attack:1}),
  'fz-tipsy': U('fz-tipsy', {tipsy:{chance:100, duration:1}}, {attack:1}),
  'fz-archer': U('fz-archer', {arrow:2}, {attack:0}),
  'fz-counter': U('fz-counter', {counterattack:true}, {attack:2}),
  'fz-scatter': U('fz-scatter', {scatterbrained:true}, {attack:3, health:12, cost:1}),
  'fz-plain': U('fz-plain', {}, {attack:3, health:12, cost:1}),
});
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function spawn(e, P, pid, id, lane){ e.debugSpawnCard(P, so, pid, id, lane || 'left', {}, []); const all = e.allBoardCards(P[pid]); return all.find(c=> c.defId === id && !c.__t) && Object.assign(all.filter(c=> c.defId === id).pop(), {}); }
const swung = (ev, c)=> ev.some(x=> x.type === 'hit' && x.attUid === c.uid);
const skippedFrozen = (ev, c)=> ev.some(x=> x.type === 'skipTurn' && x.reason === 'frozen' && x.uid === c.uid);

// ---- 1a. Frozen before its turn: the freezer (side 1, wins the tie) acts first and freezes the victim; the victim skips this round,
//          the freeze is spent at this round's end, and it swings the next round.
{ const {e, P} = mk(11); const F = spawn(e, P, 1, 'fz-freezer'); const V = spawn(e, P, 2, 'fz-victim');
  const ev1 = []; e.resolveCombat(P, so, {}, ev1, 1);
  ok(ev1.some(x=> x.type === 'statusFx' && x.kind === 'freeze' && x.targetUid === V.uid), '1a: the freezer froze the victim this round');
  ok(!swung(ev1, V), '1a: frozen before its turn, the victim does not swing this round');
  ok(skippedFrozen(ev1, V), '1a: its skip is logged (skipTurn frozen)');
  ok(ev1.filter(x=> x.type === 'skipTurn' && x.uid === V.uid).length === 1, '1a: one skip line, not one per look');
  ok(!(V.frozen > 0), `1a: the freeze is spent at this round's end (frozen ${V.frozen})`);
  const ev2 = []; F.hp = 500; e.resolveCombat(P, so, {}, ev2, 2); // the victim wins the tie now: it swings before it can be frozen again
  ok(swung(ev2, V), '1a: next round it acts again (Freeze 1 = one lost action)'); }
// ---- 1b. Frozen after it acted (the opponent's hit came later in the round): it still loses its next round, then thaws.
{ const {e, P} = mk(12); spawn(e, P, 1, 'fz-freezer'); const V = spawn(e, P, 2, 'fz-victim');
  const ev1 = []; e.resolveCombat(P, so, {}, ev1, 2); // the victim wins the tie: it swings first, then is frozen
  ok(swung(ev1, V), '1b: the victim acted before it was frozen');
  ok(V.frozen > 0, '1b: the freeze laid after its action survives the round');
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 1);
  ok(!swung(ev2, V) && skippedFrozen(ev2, V), '1b: it skips its next round'); }
// ---- 1c. Freeze 2 laid before its turn: two lost actions, not three.
{ const {e, P} = mk(13); spawn(e, P, 1, 'fz-freezer2'); const V = spawn(e, P, 2, 'fz-victim');
  let acts = 0; for(let r = 0; r < 3; r++){ const ev = []; e.resolveCombat(P, so, {}, ev, 1); if(swung(ev, V)) acts++; if(r === 0) e.allBoardCards(P[1]).forEach(c=> c.atk = 0); } // no second freeze
  ok(acts === 1, `1c: Freeze 2 before its turn costs 2 actions of 3 (acted ${acts}/3)`); }
// ---- 1d. Frozen before the round (the opponent's turn: an arrival freeze) skips the round's action, as before.
{ const {e, P} = mk(14); spawn(e, P, 1, 'fz-wall'); const V = spawn(e, P, 2, 'fz-victim'); V.frozen = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 2); ok(!swung(ev, V) && skippedFrozen(ev, V), '1d: frozen before the round, it does not act'); }

// ---- 2. Confused: 1 in 2 for triggers, skills and actions (seeded trials)
const N = 400, near = (k, p)=> Math.abs(k - N * p) < N * 0.1;
{ let fired = 0; for(let k = 0; k < N; k++){ const {e, P} = mk(1000 + k); const c = spawn(e, P, 1, 'fz-trig'); c.confused = 3; e.debugFireTrigger(P, so, c.uid, 'onAttacked', {}, []); if(c.atk > 1) fired++; }
  ok(near(fired, 0.5), `2: a Confused unit's trigger goes off about half the time (${fired}/${N})`); }
{ let swings = 0, landed = 0, fumbleEv = 0; for(let k = 0; k < N; k++){ const {e, P} = mk(2000 + k); const c = spawn(e, P, 1, 'fz-tipsy'); spawn(e, P, 2, 'fz-wall'); c.confused = 3;
    const ev = []; e.debugAttack(P, so, c.uid, {}, ev); if(swung(ev, c)) swings++; if(ev.some(x=> x.type === 'statusFx' && x.kind === 'tipsy')) landed++;
    if(ev.some(x=> x.type === 'confusedWhiff' && x.what === 'attack')) fumbleEv++; }
  ok(near(swings, 0.5), `2: a Confused unit's swing (an action) goes off about half the time (${swings}/${N})`);
  ok(swings + fumbleEv === N, `2: every fumbled swing is logged (${fumbleEv} + ${swings} = ${N})`);
  ok(Math.abs(landed - swings / 2) < N * 0.08, `2: a sure on-hit skill (a skill) lands on about half the swings that go off (${landed}/${swings})`); }
{ let shots = 0; for(let k = 0; k < N; k++){ const {e, P} = mk(3000 + k); const c = spawn(e, P, 1, 'fz-archer'); spawn(e, P, 2, 'fz-wall'); c.confused = 3;
    const ev = []; e.debugAttack(P, so, c.uid, {}, ev); if(ev.some(x=> x.type === 'arrow' && x.uid === c.uid)) shots++; }
  ok(near(shots, 0.5), `2: a Confused unit's Arrow (a skill action) goes off about half the time (${shots}/${N})`); }
{ let counters = 0; for(let k = 0; k < N; k++){ const {e, P} = mk(4000 + k); const a = spawn(e, P, 1, 'fz-victim'); const c = spawn(e, P, 2, 'fz-counter'); c.confused = 3;
    const ev = []; e.debugAttack(P, so, a.uid, {}, ev); if(ev.some(x=> x.type === 'hit' && x.counter && x.attUid === c.uid)) counters++; }
  ok(near(counters, 0.5), `2: a Confused unit's Counterattack goes off about half the time (${counters}/${N})`); }
{ let swings = 0; for(let k = 0; k < 60; k++){ const {e, P} = mk(5000 + k); const c = spawn(e, P, 1, 'fz-victim'); spawn(e, P, 2, 'fz-wall');
    const ev = []; e.debugAttack(P, so, c.uid, {}, ev); if(swung(ev, c)) swings++; ok(!ev.some(x=> x.type === 'confusedWhiff'), '2: no fumble when not Confused'); }
  ok(swings === 60, `2: an unconfused unit always swings (${swings}/60)`); }
ok(TX('ui.log-confused-fumbles', {name:'Pika'}) === '😵 Pika is confused and fumbles.', '2: the log line');
ok(TX('ui.status-confused').split(/\s+/).length < 20 && /triggers, skills and actions/.test(TX('ui.status-confused')), '2: the Confused gloss is terse and names triggers, skills and actions');

// ---- 2b. Determinism: the same seed gives the identical fight (whole matches with an always-Confused unit), another seed differs.
{ const run = seed=> E.simulateOneMatch(defs, {'fz-scatter':8, 'fz-plain':4}, {'fz-plain':12}, {rnd:E.mulberry32(seed), recordEvents:true, maxRounds:40});
  const sig = r=> JSON.stringify(r.events.filter(x=> x.type !== 'render')).length + ':' + r.winner + ':' + r.rounds + ':' + JSON.stringify(r.events.filter(x=> x.type === 'confusedWhiff').map(x=> x.uid + x.what));
  const a = run(77), b = run(77), c = run(78);
  ok(a.events.some(x=> x.type === 'confusedWhiff'), '2b: the always-Confused unit fumbles in a whole match');
  ok(sig(a) === sig(b) && JSON.stringify(a.events) === JSON.stringify(b.events), '2b: the same seed replays the identical match');
  ok(sig(a) !== sig(c), '2b: another seed plays differently'); }

// ---- 3. The CPU (smartest): a Confused unit facing a slot is a half threat. (Engine state read through placeCard's slot choice is
//         covered by engine-parity; here: the score helper's effect, a Confused killer vs a sure killer.)
{ const {e, P} = mk(5); const c = spawn(e, P, 1, 'fz-victim'); ok(e.aiSwingOdds(c) === 1, '3: an unconfused ready unit is a sure swing');
  c.confused = 2; ok(e.aiSwingOdds(c) === 0.5, '3: a Confused unit is a half threat to the CPU (1 in 2 it fumbles)');
  c.frozen = 1; ok(e.aiSwingOdds(c) === 0, '3: a Frozen unit is no swing'); }

console.log(`fz-2026-10-19: ${n - fail}/${n} passed, ${fail} failure(s)`); process.exit(fail ? 1 : 0);
