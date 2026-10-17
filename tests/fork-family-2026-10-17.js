#!/usr/bin/env node
// 2026-10-17 (user, 23:08-23:10): the fork family made one attack along 2 / 3 / 4 lines, and the crabs' Crab Claws.
//   "for all crabs with fork - change them to crab claws. N for crab claw is 0. Crab claws effect is: normal attacks always attack L or R,
//    50%, random."
//   "Fork cannot hit C and L at the same time. It's either L/R or just C. ... Trident's L and R hits for 1/2 damage. Pitch fork's all 4
//    prongs hit for 1/2. Trident always aims forward. As Pitchfork is even, it either aims left or right. If left, it hits LL/L/C/R,
//    L/C/R/RR otherwise. ... It's a single attack. 2, 3, or 4 attack lines."
// Half = half the Attack, rounded down, at least 1. The Illuminate change has its own test (nightblind-illuminate-2026-10-16.js) and
// Landslide's three columns are in field-effects-2026-10-16.js.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:4, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'ff-wall': U('ff-wall', {}, {attack:0}), 'ff-taunt': U('ff-taunt', {taunt:true}, {attack:0}),
  'ff-fork': U('ff-fork', {fork:true}), 'ff-swipe': U('ff-swipe', {swipe:true}), 'ff-tri': U('ff-tri', {trident:true}), 'ff-pitch': U('ff-pitch', {pitchfork:true}),
  'ff-tri1': U('ff-tri1', {trident:true}, {attack:1}), 'ff-pitch5': U('ff-pitch5', {pitchfork:true}, {attack:5}),
  'ff-forkR': U('ff-forkR', {fork:true, recoil:1}), 'ff-pitchR': U('ff-pitchR', {pitchfork:true, recoil:1}),
  'ff-crab': U('ff-crab', {crabClaws:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
// one swing of attacker `id` (at slot 0) into walls at `slots`; returns the damage each wall took, the castle's loss and the events
function swing(id, slots, seed, foeId){
  const {e, P} = mk(seed); const ws = slots.map(s=> put(e, P, 2, foeId && foeId[s] || 'ff-wall', s)); const A = put(e, P, 1, id, 0); const hq = P[2].hq.hp; const ev = [];
  e.debugAttack(P, so, A.uid, {}, ev);
  const d = {}; ws.forEach(w=> d[w.slot] = 500 - w.hp); return {d, castle: hq - P[2].hq.hp, ev, A};
}
const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);

// ---- Fork: L and R, or just C, never C with a side
{ const r = swing('ff-fork', [-1, 0, 1]); ok(same(r.d, {'-1':4, '0':0, '1':4}) && r.castle === 0, `Fork, all three filled: L and R at full, C untouched (${JSON.stringify(r.d)})`); }
{ const r = swing('ff-fork', [-1, 1]); ok(same(r.d, {'-1':4, '1':4}) && r.castle === 0, `Fork, nobody in front: L and R (${JSON.stringify(r.d)})`); }
{ const r = swing('ff-fork', [0, 1]); ok(same(r.d, {'0':4, '1':0}) && r.castle === 0, `Fork, C and one side: only C (${JSON.stringify(r.d)})`);
  const fs2 = r.ev.find(x=> x.type === 'forkSwing'); ok(fs2 && fs2.prong === 'right' && fs2.lines.length === 1 && fs2.lines[0].off === 0, 'Fork striking C alone: its right prong takes it, the left one goes into the empty column'); }
{ const r = swing('ff-fork', [-1, 0]); const fs2 = r.ev.find(x=> x.type === 'forkSwing'); ok(r.d['0'] === 4 && r.d['-1'] === 0 && fs2 && fs2.prong === 'left', 'Fork, C and its left: only C, with the left prong (the right one into the empty column)'); }
{ let L = 0, R = 0; for(let s = 1; s <= 40; s++){ const r = swing('ff-fork', [0], s); const fs2 = r.ev.find(x=> x.type === 'forkSwing'); if(fs2.prong === 'left') L++; else if(fs2.prong === 'right') R++; }
  ok(L > 8 && R > 8 && L + R === 40, `Fork, C alone with both sides empty: either prong, at random (${L}/${R})`); }
{ const r = swing('ff-fork', [-1]); ok(same(r.d, {'-1':4}) && r.castle === 0, 'Fork, one unit beside it and nobody in front: that one'); }
{ const r = swing('ff-fork', [2]); ok(r.d['2'] === 0 && r.castle === 4, 'Fork, nobody in its three columns: the castle, full'); }
{ const r = swing('ff-swipe', [-1, 0, 1]); ok(same(r.d, {'-1':4, '0':0, '1':4}), 'an old swipe:true is still Fork'); }
{ const r = swing('ff-fork', [-1, 0], 7, {'-1':'ff-taunt'}); ok(r.d['-1'] === 4 && r.d['0'] === 0, `Fork: a Taunt unit beside it that draws the swing is struck, not C (${JSON.stringify(r.d)})`); }

// ---- Trident: always forward, C full, L / R half
{ const r = swing('ff-tri', [-2, -1, 0, 1, 2]); ok(same(r.d, {'-2':0, '-1':2, '0':4, '1':2, '2':0}) && r.castle === 0, `Trident: C 4, L and R 2 (${JSON.stringify(r.d)})`); }
{ const r = swing('ff-tri', [-1, 1]); ok(same(r.d, {'-1':2, '1':2}) && r.castle === 4, `Trident, nobody in front: its middle prong hits the castle at full, the sides half (${JSON.stringify(r.d)}, castle ${r.castle})`); }
{ const r = swing('ff-tri1', [-1, 0, 1]); ok(same(r.d, {'-1':1, '0':1, '1':1}), 'Trident with 1 Attack: half rounds down but is at least 1'); }
{ const r = swing('ff-tri', [2]); ok(r.d['2'] === 0 && r.castle === 4, 'Trident never reaches two columns out'); }

// ---- Pitchfork: aims left or right at random; LL/L/C/R or L/C/R/RR; every prong half
{ let left = 0, right = 0, bad = 0;
  for(let s = 1; s <= 40; s++){ const r = swing('ff-pitch', [-2, -1, 0, 1, 2], s); const fs2 = r.ev.find(x=> x.type === 'forkSwing');
    const want = fs2.aim === 'left' ? {'-2':2, '-1':2, '0':2, '1':2, '2':0} : {'-2':0, '-1':2, '0':2, '1':2, '2':2};
    if(fs2.aim === 'left') left++; else right++;
    if(!same(r.d, want) || r.castle !== 0 || !same(fs2.lines.map(l=> l.off), fs2.aim === 'left' ? [-2, -1, 0, 1] : [-1, 0, 1, 2]) || !fs2.lines.every(l=> l.half)) bad++; }
  ok(!bad, `Pitchfork: LL/L/C/R aimed left, L/C/R/RR aimed right, half on every prong (${bad} bad of 40)`); ok(left > 8 && right > 8, `Pitchfork: aims left and right at random (${left}/${right})`); }
{ const r = swing('ff-pitch5', [0]); ok(r.d['0'] === 2, 'Pitchfork with 5 Attack: 2 a prong (half, rounded down)'); }
{ let ok2 = 0; for(let s = 1; s <= 20; s++){ const r = swing('ff-pitch', [-1, 1], s); if(r.castle === 2 && r.d['-1'] === 2 && r.d['1'] === 2) ok2++; }
  ok(ok2 === 20, `Pitchfork, nobody in front: the middle prong hits the castle for half, the sides half (${ok2}/20)`); }

// ---- one attack: one swing event, the onAttack side effects once, the lines' events tagged with the swing
{ const r = swing('ff-forkR', [-1, 0, 1]); ok(r.A.hp === 499, `Fork striking two units: Recoil once (${r.A.hp})`);
  ok(r.ev.filter(x=> x.type === 'forkSwing').length === 1, 'one forkSwing event');
  const hits = r.ev.filter(x=> x.type === 'hit'); ok(hits.length === 2 && hits.every(h=> h.fork && h.forkSwing === r.ev.find(x=> x.type === 'forkSwing').swing), 'both lines\' hits name the swing'); }
{ const r = swing('ff-pitchR', [-2, -1, 0, 1, 2]); ok(r.A.hp === 499, 'Pitchfork striking four units: Recoil once');
  const fs2 = r.ev.find(x=> x.type === 'forkSwing'); ok(fs2 && fs2.lines.length === 4 && fs2.lines.filter(l=> l.main).length === 1 && fs2.lines.find(l=> l.main).off === 0, 'the swing lists its 4 lines, C the swing proper'); }
{ let one = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const ws = [-1, 0, 1].map(x=> put(e, P, 2, 'ff-wall', x)); const F = put(e, P, 1, 'ff-fork', 0); F.blind = 5;
    e.debugAttack(P, so, F.uid, {}, []); if(ws.filter(w=> w.hp < 500).length === 1) one++; }
  ok(one > 0, `each line rolls its own Blind miss (one of two landed ${one}/40 times)`); }

// ---- Crab Claws
{ const crabs = Object.values(base).filter(d=> (d.species||[]).includes('Crustacean') || /crab/i.test(d.name||''));
  ok(!crabs.some(d=> d.effects && (d.effects.fork || d.effects.swipe === true)), 'no crab Forks any more');
  ['sulfur-vent-crab', 'fiddler-crab-swarm', 'open-ocean-hermit-crab'].forEach(id=> ok(base[id].effects.crabClaws === true && !base[id].effects.fork, `${id}: Crab Claws (no number) instead of Fork`)); }
{ let L = 0, R = 0, C = 0; for(let s = 1; s <= 60; s++){ const r = swing('ff-crab', [-1, 0, 1], s); if(r.d['-1']) L++; if(r.d['1']) R++; if(r.d['0']) C++; }
  ok(C === 0 && L + R === 60 && L > 15 && R > 15, `Crab Claws: left or right, 50/50, never in front (${L}/${R}/${C})`); }
{ let ok2 = 0; for(let s = 1; s <= 20; s++){ const r = swing('ff-crab', [0, 1], s); if(r.d['1'] === 4 && r.d['0'] === 0) ok2++; } ok(ok2 === 20, 'Crab Claws: the chosen side empty, it takes the other'); }
{ const r = swing('ff-crab', [0]); ok(r.d['0'] === 0 && r.castle === 4, 'Crab Claws: nobody on either side, the castle'); }

// ---- texts and the budget
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
ok(/fork: \(\)=> `One two-pronged swing: full Attack on the units to its left and right when both are there, or else just the one in front\.`/.test(src), 'Fork card line');
ok(/trident: \(\)=> `One three-pronged swing straight ahead: full Attack in front, half to the units on its left and right\.`/.test(src), 'Trident card line');
ok(/pitchfork: \(\)=> `One four-pronged swing, aimed left or right at random: half Attack on each of 4 neighbouring columns\.`/.test(src), 'Pitchfork card line');
ok(/\{key:'trident'[^\n]*half \(rounded down, at least 1\)/.test(src) && /\{key:'pitchfork'[^\n]*half its Attack/.test(src) && /\{key:'fork'[^\n]*never the one in front and a side together/.test(src), 'the editor texts');
ok(/arrows:'v', crabClaws:0\}/.test(src), 'the stat budget: Crab Claws costs 0');
ok(/function forkSwingVfx\(ev\)/.test(src) && /function groupForkLines\(events\)/.test(src), 'the replay plays one swing (forkSwingVfx, groupForkLines)');
ok(/function forkSwing\(attacker, points, o\)/.test(fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8')), 'SkillFX.forkSwing draws every prong at once');

console.log(fail ? `fork-family-2026-10-17: ${fail} failure(s) of ${n}` : `fork-family-2026-10-17: all passed (${n} checks)`); process.exit(fail ? 1 : 0);
