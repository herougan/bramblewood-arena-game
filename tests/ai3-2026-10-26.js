#!/usr/bin/env node
// 2026-10-26 (package AI3): the CPU's turn planner (A1) and its Lumber reserve (A2), on the engine's own aiTakeTurn.
//   A2 (owner #33 / EN6-3: "they need to try to maintain at least 2.0-1.0 = 1.0 lumber ... If the value of a card in their hand is really high,
//      they will prioritise gathering resources to play that card"; "if the deck has low lumber cost cards, they shouldn't be rapidly pitching"):
//      1. a cheap deck (reserve 0) holding a costly card out of reach does not pitch, it plays (EN8 pitched here);
//      2. a high-value card within reach: it pitches for it and plays it this turn;
//      3. the reserve: a deck averaging 1.75 Lumber pitches to keep 0.75 when its play would leave less;
//      4. nothing to play and nothing the Lumber is for: it holds its cards (no pitch);
//      5. a cheap deck over eight turns pitches seldom; a costly deck still pitches (it needs the Lumber).
//   A1 (owner #26: "Play card A, B, C or just pitch and then for each decision - where. Then which is the best decision"; "Does the AI
//      consider triggering bloom?"):
//      6. Bloom: a Bloom card whose conditions hold goes to the slot with a free neighbour (the smart and smartest CPUs, every seed);
//      7. it keeps the last free slot beside its own unbloomed Bloom unit open when another slot is as good;
//      8. card x slot together: of two cards, the one that kills what faces it from a legal slot is played there, though the other is worth
//         a little more in hand;
//      9. the basic CPU keeps its card-then-slot pick (the planner is the smart and smartest CPUs' only); the planner is fast.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-free': U('x-free', {}, {attack:1, health:3}), 'x-free2': U('x-free2', {}, {attack:2, health:4}), 'x-one': U('x-one', {}, {attack:2, health:3, cost:1}),
  'x-c2': U('x-c2', {}, {attack:3, health:8, cost:2}), 'x-c3': U('x-c3', {}, {attack:4, health:10, cost:3}), 'x-c5': U('x-c5', {}, {attack:6, health:14, cost:5}),
  'x-spell0': {id:'x-spell0', name:'x-spell0', cardType:'spell', cost:0, attack:0, health:0, wait:0, spell:{do:'mend', amount:2}, effects:{}},
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-bloom': U('x-bloom', {bloomCopy:{when:['wet']}}, {attack:2, health:4}),
  'x-plain': U('x-plain', {}, {attack:2, health:4}), 'x-v22': U('x-v22', {}, {attack:2, health:2, wait:9}),
  'x-k3': U('x-k3', {}, {attack:3, health:5}), 'x-tank': U('x-tank', {}, {attack:1, health:12}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts, deck){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, deck || {}, {id:'st-hq', health:60, effects:{}})}}; }
function put(e, P, pid, id, slot, extra){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot; Object.assign(c, extra || {});
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
let huid = 91000; const hand = (P, pid, ids)=>{ P[pid].hand = ids.map(defId=> ({uid: huid++, defId})); };
const fresh = P=> [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; P[p].playsThisTurn = 0; });
const CHEAP = {'x-free': 10, 'x-free2': 6, 'x-one': 4}, COSTLY = {'x-c2': 8, 'x-c3': 7, 'x-free': 5};
const turn = (e, P)=>{ const ev = []; fresh(P); e.aiTakeTurn(P, so, 2, {}, ev); return {d: ev.find(x=> x.type === 'discard'), play: ev.find(x=> x.type === 'play'), ev}; };

// ---- A2: the reserve ----------------------------------------------------------------------------------------------------------------
for(const lv of [0, 1, 2]){
  { const {e, P} = mk(21, {aiAim:true, aiLevel:lv}, CHEAP); hand(P, 2, ['x-free', 'x-free2', 'x-c5']); P[2].lumber = 0; const r = turn(e, P);
    ok(!r.d && r.play && r.play.defId === 'x-free2', `level ${lv}: a cheap deck (reserve 0) with a 5-cost card out of reach plays and keeps its cards (pitched ${r.d && r.d.defId}, played ${r.play && r.play.defId})`); }
  { const {e, P} = mk(22, {aiAim:true, aiLevel:lv}, CHEAP); hand(P, 2, ['x-free', 'x-free2', 'x-c2']); P[2].lumber = 1; const r = turn(e, P);
    ok(r.d && r.d.defId === 'x-free' && r.play && r.play.defId === 'x-c2', `level ${lv}: a high-value card one Lumber away: it pitches the spare and plays it this turn (pitched ${r.d && r.d.defId}, played ${r.play && r.play.defId})`); }
  { const {e, P} = mk(23, {aiAim:true, aiLevel:lv}, COSTLY); hand(P, 2, ['x-free', 'x-free2', 'x-wall']); P[2].lumber = 0; const r = turn(e, P);
    ok(r.d && r.play, `level ${lv}: a deck averaging ${(46 / 20).toFixed(2)} Lumber keeps a reserve: with 0 Lumber it pitches and still plays (pitched ${r.d && r.d.defId}, played ${r.play && r.play.defId})`); }
  { const {e, P} = mk(24, {aiAim:true, aiLevel:lv}, COSTLY); hand(P, 2, ['x-free', 'x-free2', 'x-wall']); P[2].lumber = 2; const r = turn(e, P);
    ok(!r.d && r.play, `level ${lv}: with its reserve in hand (2 Lumber) it does not pitch (pitched ${r.d && r.d.defId})`); }
  { const {e, P} = mk(25, {aiAim:true, aiLevel:lv}, CHEAP); hand(P, 2, ['x-spell0', 'x-spell0']); P[2].lumber = 0; const r = turn(e, P);
    ok(!r.d, `level ${lv}: nothing to play and nothing the Lumber is for: it holds its cards (pitched ${r.d && r.d.defId})`); }
}
{ // over eight turns: a cheap deck pitches seldom, a costly deck still gathers what it needs
  const pitches = (deck, lv)=>{ let k = 0, plays = 0; for(let s = 1; s <= 20; s++){ const e = E.makeSimEngine(defs, E.mulberry32(s), {recordEvents:true, battleMode:'open', aiAim:true, aiLevel:lv, rules:{}});
    const P = {1: e.newPlayer(1, {'x-wall': 20}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, deck, {id:'st-hq', health:60, effects:{}})};
    e.draw(P[2], 3, 'B', {}, null);
    for(let r = 1; r <= 8; r++){ fresh(P); if(r > 1) e.roundStart(P, r, so, {}, null); const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); k += ev.filter(x=> x.type === 'discard').length; plays += ev.filter(x=> x.type === 'play').length; e.draw(P[2], 1, 'B', {}, null); } }
    return {k: k / 20, plays: plays / 20}; };
  for(const lv of [0, 1]){ const c = pitches(CHEAP, lv), x = pitches(COSTLY, lv);
    ok(c.k <= 1.5 && c.plays >= 6, `level ${lv}: a cheap deck pitches ${c.k.toFixed(2)} times in 8 turns (at most 1.5) and plays ${c.plays.toFixed(1)} cards`);
    ok(x.k >= 2 && x.k > c.k, `level ${lv}: a costly deck still pitches for its Lumber (${x.k.toFixed(2)} times in 8 turns)`); }
}

// ---- A1: the planner ----------------------------------------------------------------------------------------------------------------
for(const lv of [1, 2]){
  { let room = 0; const N = 20;
    for(let s = 1; s <= N; s++){ const {e, P} = mk(100 + s, {aiAim:true, aiLevel:lv, rules:{wet:true}}); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 2);
      hand(P, 2, ['x-bloom']); P[2].lumber = 0; turn(e, P); const b = all(P[2]).find(c=> c.defId === 'x-bloom'); if(b && (b.slot === -1 || b.slot === 3)) room++; }
    ok(room === N, `level ${lv}: a Bloom card whose conditions hold goes where its copy has room (slot -1 or 3, never the boxed-in 1): ${room}/${N}`); }
  { let kept = 0; const N = 20;
    for(let s = 1; s <= N; s++){ const {e, P} = mk(200 + s, {aiAim:true, aiLevel:lv, rules:{wet:true}}); put(e, P, 2, 'x-bloom', 0, {wait:0}); put(e, P, 2, 'x-wall', 1);
      hand(P, 2, ['x-plain']); P[2].lumber = 0; turn(e, P); const c = all(P[2]).find(x=> x.defId === 'x-plain'); if(c && c.slot === 2) kept++; }
    ok(kept === N, `level ${lv}: it leaves the last free slot beside its unbloomed Bloom unit open (plays at 2, not -1): ${kept}/${N}`); }
  { let k = 0; const N = 20;
    for(let s = 1; s <= N; s++){ const {e, P} = mk(300 + s, {aiAim:true, aiLevel:lv}); put(e, P, 2, 'x-wall', 0); put(e, P, 1, 'x-v22', 1);
      hand(P, 2, ['x-k3', 'x-tank']); P[2].lumber = 0; turn(e, P); const c = all(P[2]).find(x=> x.defId === 'x-k3'); if(c && c.slot === 1) k++; }
    ok(k >= N - 2, `level ${lv}: card and slot together: the 3-Attack unit goes across the 2/2 it kills (${k}/${N}), not the 1/12 worth a little more in hand`); }
}
{ // the basic CPU: no planner (its card-then-slot pick, with its dice: the boxed-in slot is taken some of the time)
  let room = 0; const N = 40;
  for(let s = 1; s <= N; s++){ const {e, P} = mk(400 + s, {aiAim:true, aiLevel:0, rules:{wet:true}}); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 2);
    hand(P, 2, ['x-bloom']); P[2].lumber = 0; turn(e, P); const b = all(P[2]).find(c=> c.defId === 'x-bloom'); if(b && b.slot === -1) room++; }
  ok(room < N, `the basic CPU keeps its own pick (no Bloom planning): slot -1 ${room}/${N}`);
  const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/const planOn = aiSmart\(\) && slotMode;/.test(src), 'the planner runs for the smart and smartest CPUs only (aiSmart)');
}
{ // fast: a full hand on a busy board, many turns
  const {e, P} = mk(500, {aiAim:true, aiLevel:2}); [-2, 0, 2].forEach(sl=> put(e, P, 2, 'x-wall', sl)); [-3, -1, 1, 3].forEach(sl=> put(e, P, 1, 'x-k3', sl));
  const t0 = Date.now(); for(let i = 0; i < 300; i++){ hand(P, 2, ['x-k3', 'x-tank', 'x-plain', 'x-bloom', 'x-free']); P[2].lumber = 3; fresh(P);
    const cs = all(P[2]).filter(c=> !['x-wall'].includes(c.defId)); cs.forEach(c=>{ c.hp = 0; }); e.removeDeadCards(P, so, {}, {}, []); e.aiTakeTurn(P, so, 2, {}, null); }
  const ms = (Date.now() - t0) / 300; ok(ms < 5, `the planner is fast: ${ms.toFixed(2)} ms a turn with five cards in hand`);
}
console.log(`ai3-2026-10-26: ${fail ? fail + ' of ' + n + ' FAILED' : 'all ' + n + ' passed'}`);
process.exit(fail ? 1 : 0);
