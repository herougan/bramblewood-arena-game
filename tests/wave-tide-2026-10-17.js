#!/usr/bin/env node
// 2026-10-17 (wave, tide, boomerang; the user's notes 10, 11, 14 and 22 at 22:48):
//   Wave / Awash pushes: "there's always a slight bias towards awashing inwards - very slight. If it's awash 1 and there's another unit
//   in the way, push the other way instead. If you're blocked on both sides, the unit just bobs up then down"; the fixed ways (left,
//   right, alternate) unchanged; the Awash field ("Awash 1-3 every turn to a random card"); the app wiring (field card, Edit skirmish,
//   Effects library, Effects Lab), the boomerang's single return flight, the tide's sway and the hover heights.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'wt-wall': U('wt-wall', {}, {attack:0}),
  'wt-waveL': U('wt-waveL', {wave:'left'}), 'wt-waveR': U('wt-waveR', {wave:'right'}), 'wt-waveA': U('wt-waveA', {wave:'alternate'}), 'wt-waveT': U('wt-waveT', {wave:true}),
  'wt-waveL2': U('wt-waveL2', {wave:'left', waveN:2}), 'wt-wave2': U('wt-wave2', {wave:2}), // Wave N (2026-10-18)
  'wt-waveRK': U('wt-waveRK', {wave:'right', triggers:[{on:'onKill', do:'gainLumber', amount:2}]}), // 2026-10-18 (audit 4): crash kills are the Wave unit's
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
// one Wave push from a P1 unit (in the middle column, so it doesn't widen the board's edge) onto a P2 unit
const push = (e, P, waveId, T)=>{ const W = put(e, P, 1, waveId, 0); const ev = []; const w = e.waveHit(P, so, 1, W, T, ev, {}); return {w, ev}; };

// ---- 1. Fixed ways (2026-10-18, Wave N: "If crash into another unit, both take N damage"; no more swapping)
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), N = put(e, P, 2, 'wt-wall', -1); put(e, P, 2, 'wt-wall', 3);
  const {w, ev} = push(e, P, 'wt-waveL', T); const cr = ev.find(x=> x.type === 'washCrash');
  ok(T.slot === 0 && N.slot === -1 && w.swapUid == null && w.crashUid === N.uid && w.cols === 0 && !w.blocked && !w.bob, `Wave left into a unit: it crashes, nobody swaps (${T.slot}, ${N.slot})`);
  ok(cr && cr.n === 1 && T.hp === 499 && N.hp === 499, `...and both take 1 (${T.hp}, ${N.hp})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', -3);
  const {w, ev} = push(e, P, 'wt-waveR', T); ok(T.slot === 1 && w.dir === 'right' && !w.blocked && !ev.some(x=> x.type === 'washCrash'), `Wave right: one column right (${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', -2); put(e, P, 2, 'wt-wall', 2);
  const {w} = push(e, P, 'wt-waveL', T); ok(T.slot === -2 && w.blocked && !w.bob && T.hp === 500, 'Wave left at the edge: blocked, no bounce the other way, no damage'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', -3); put(e, P, 2, 'wt-wall', 3); const W = put(e, P, 1, 'wt-waveA', 4);
  e.waveHit(P, so, 1, W, T, [], {}); const s1 = T.slot; e.waveHit(P, so, 1, W, T, [], {}); ok(s1 === -1 && T.slot === 0, `Wave alternate: left, then right (${s1}, ${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', -3); put(e, P, 2, 'wt-wall', 3);
  const {w} = push(e, P, 'wt-waveL2', T); ok(T.slot === -2 && w.cols === 2 && w.n === 2 && T.hp === 500, `Wave left 2 (effects.waveN): two free columns (${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), N = put(e, P, 2, 'wt-wall', -2); put(e, P, 2, 'wt-wall', 3);
  const {w, ev} = push(e, P, 'wt-waveL2', T); const cr = ev.find(x=> x.type === 'washCrash');
  ok(T.slot === -1 && w.cols === 1 && w.crashUid === N.uid && cr && cr.n === 2 && T.hp === 498 && N.hp === 498 && N.slot === -2, `Wave left 2 with a unit two columns over: it rides one and crashes, both take 2 (${T.slot}, ${T.hp}, ${N.hp})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), N = put(e, P, 2, 'wt-wall', -1); N.pinned = true; put(e, P, 2, 'wt-wall', 3);
  const {w} = push(e, P, 'wt-waveL', T); ok(T.slot === 0 && N.slot === -1 && w.crashUid === N.uid && T.hp === 499 && N.hp === 499, 'a pinned unit in the way: it is crashed into too, both hurt, nobody moves'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0); T.pinned = true; put(e, P, 2, 'wt-wall', -1); put(e, P, 2, 'wt-wall', 3);
  const {w} = push(e, P, 'wt-waveL', T); ok(!w && T.slot === 0 && T.hp === 500, 'a pinned unit is not pushed at all (no crash either)'); }
{ let bad = 0; for(let s = 1; s <= 60; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', -3); put(e, P, 2, 'wt-wall', 3);
    const {w} = push(e, P, 'wt-wave2', T); if(!w || w.n !== 2 || Math.abs(T.slot) !== 2) bad++; }
  ok(!bad, `a bare number (wave: 2) is Wave 2 with no fixed way (${bad} wrong)`); }

// ---- 2. No fixed way (Wave true): 55/45 inward; a unit in the way is crashed into; only the edge turns it back
{ let inward = 0, outward = 0, other = 0; const N = 2000;
  for(let s = 1; s <= N; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', -1); put(e, P, 2, 'wt-wall', 3); put(e, P, 2, 'wt-wall', -3);
    const {w} = push(e, P, 'wt-waveT', T); if(T.slot === 0) inward++; else if(T.slot === -2) outward++; else other++; if(w.swapUid != null || w.crashUid != null) other++; }
  const r = inward / N; ok(!other, `Wave (no fixed way) moves one free column, no swap, no crash (${other} odd)`);
  ok(r > .52 && r < .58, `a slight lean inward: ${(r*100).toFixed(1)}% toward the middle (want about 55%)`); }
{ let l = 0; const N = 600; for(let s = 1; s <= N; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', 3); put(e, P, 2, 'wt-wall', -3);
    push(e, P, 'wt-waveT', T); if(T.slot === -1) l++; }
  ok(l / N > .44 && l / N < .56, `from the middle column it is a coin flip (${(l / N*100).toFixed(1)}% left)`); }
{ let bad = 0, crashed = 0; for(let s = 1; s <= 200; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', 0), N1 = put(e, P, 2, 'wt-wall', 1); put(e, P, 2, 'wt-wall', -3);
    const {w} = push(e, P, 'wt-waveT', T); if(N1.slot !== 1 || w.swapUid != null || w.bounced) bad++;
    if(w.crashUid != null){ crashed++; if(T.slot !== 0 || T.hp !== 499 || N1.hp !== 499 || w.dir !== 'right') bad++; } else if(T.slot !== -1 || T.hp !== 500 || N1.hp !== 500) bad++; }
  ok(!bad, `a unit in the way: it crashes into it (both take 1) instead of turning back, no swap (${bad} wrong)`); ok(crashed > 50 && crashed < 150, `...when it picked that side (${crashed}/200)`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', -1), B = put(e, P, 2, 'wt-wall', 1);
  const {w, ev} = push(e, P, 'wt-waveT', T); const hit = [A, B].find(x=> x.uid === w.crashUid);
  ok(T.slot === 0 && A.slot === -1 && B.slot === 1, 'boxed in on both sides: nobody moves');
  ok(!w.bob && hit && T.hp === 499 && hit.hp === 499 && [A, B].filter(x=> x.hp === 500).length === 1, 'it crashes into one of them, both take 1 (no bob)');
  ok(ev.filter(x=> x.type === 'wave').length === 1 && ev.filter(x=> x.type === 'washCrash').length === 1, 'one wave event, one washCrash'); }
{ let bad = 0, bounced = 0; for(let s = 1; s <= 100; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', -2), A = put(e, P, 2, 'wt-wall', -1); put(e, P, 2, 'wt-wall', 2);
    const {w} = push(e, P, 'wt-waveT', T); if(T.slot !== -2 || w.crashUid !== A.uid || A.hp !== 499) bad++; if(w.bounced) bounced++; }
  ok(!bad, `the edge on one side and a unit on the other: the edge turns it back, into the unit (${bad} wrong)`); ok(bounced > 20 && bounced < 80, `...marked bounced when it had picked the edge (${bounced}/100)`); }
{ let crashes = 0, moves = 0, bad = 0; for(let s = 1; s <= 100; s++){ const {e, P} = mk({}, s); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', -1); A.webbed = 3; put(e, P, 2, 'wt-wall', 3);
    push(e, P, 'wt-waveT', T); if(T.slot === 1) moves++; else if(T.slot === 0 && A.slot === -1 && A.hp === 499 && T.hp === 499) crashes++; else bad++; }
  ok(!bad && crashes && moves, `a Webbed unit beside it is crashed into (it stays put); the other way it rides (${crashes} crashes, ${moves} rides, ${bad} wrong)`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0); T.webbed = 2; put(e, P, 2, 'wt-wall', 3);
  const {w} = push(e, P, 'wt-waveT', T); ok(T.slot === 0 && !w, 'a Webbed unit is not pushed at all'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', 1); put(e, P, 2, 'wt-wall', -3); A.hp = 1;
  const W = put(e, P, 1, 'wt-waveR', 0), ev = []; e.waveHit(P, so, 1, W, T, ev, {}); ok(!e.allBoardCards(P[2]).some(c=> c === A) && T.hp === 499, 'a crash can kill: the dead unit leaves the board'); }
// 2026-10-18 (audit 4): a crash kill is the Wave unit's kill (kill stat, On Kill); from a swing the dead are swept with the swing
const kills = (stats, side, id)=> (stats[side + '|' + id] || {}).kills || 0;
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', 1); put(e, P, 2, 'wt-wall', -3); A.hp = 1;
  const W = put(e, P, 1, 'wt-waveRK', 0), stats = {}, l0 = P[1].lumber; e.waveHit(P, so, 1, W, T, [], stats);
  ok(!e.allBoardCards(P[2]).includes(A) && kills(stats, 'A', 'wt-waveRK') === 1 && P[1].lumber - l0 === 2, `a crash kill on its own is credited to the Wave unit (kills ${kills(stats, 'A', 'wt-waveRK')}, +${P[1].lumber - l0} Lumber)`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', 1); put(e, P, 2, 'wt-wall', -3); A.hp = 1;
  const W = put(e, P, 1, 'wt-waveRK', 0), stats = {}, ev = [], l0 = P[1].lumber; e.debugAttack(P, so, W.uid, stats, ev);
  const iCrash = ev.findIndex(x=> x.type === 'washCrash'), deaths = ev.filter(x=> x.type === 'death' && x.uid === A.uid);
  ok(!e.allBoardCards(P[2]).includes(A) && T.hp === 498 && deaths.length === 1, `a swing's crash kill: the unit dies once (${deaths.length}), the target took the hit and the crash (${T.hp})`);
  ok(kills(stats, 'A', 'wt-waveRK') === 1 && P[1].lumber - l0 === 2, `...and it is the Wave unit's kill, On Kill once (kills ${kills(stats, 'A', 'wt-waveRK')}, +${P[1].lumber - l0})`);
  ok(iCrash >= 0 && ev.findIndex(x=> x.type === 'death' && x.uid === A.uid) > iCrash, 'the death comes after the crash'); }
{ let bad = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk({awash:1}, s); const T = put(e, P, 2, 'wt-wall', 0), A = put(e, P, 2, 'wt-wall', -1), B = put(e, P, 2, 'wt-wall', 1);
    A.pinned = B.pinned = true; A.hp = B.hp = 1; put(e, P, 1, 'wt-waveRK', 0).pinned = true; const stats = {}; e.roundStart(P, 1, so, stats, []); e.roundStart(P, 2, so, stats, []);
    if(Object.values(stats).some(x=> x.kills > 0)) bad++; }
  ok(!bad, `the Wave field's crash kills are nobody's (${bad} credited)`); }

// ---- 3. Packed rows (no free columns): it crashes into its neighbour that way
{ const {e, P} = mk({}, 3, 'gravity'); ['wt-wall', 'wt-wall', 'wt-wall'].forEach(id=> e.debugSpawnCard(P, so, 2, id, 'left', {}, [])); e.debugSpawnCard(P, so, 1, 'wt-waveT', 'left', {}, []);
  const order = ()=> [...P[2].row.left].reverse().concat(P[2].row.center, P[2].row.right);
  const ends = order(), T = ends[0], W = all(P[1])[0], ev = []; const w = e.waveHit(P, so, 1, W, T, ev, {});
  ok(w && !w.blocked && order().indexOf(T) === 0 && w.crashUid === ends[1].uid && T.hp === 499 && ends[1].hp === 499, `packed row, at the end: it crashes into its only neighbour, nobody moves (${order().indexOf(T)})`); }
{ const {e, P} = mk({}, 3, 'gravity'); e.debugSpawnCard(P, so, 2, 'wt-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'wt-waveT', 'left', {}, []);
  const T = all(P[2])[0], w = e.waveHit(P, so, 1, all(P[1])[0], T, [], {}); ok(w && w.blocked && w.bob, 'packed row, alone: it bobs'); }

// ---- 4. The Wave field (rules.awash; "Wave" on screen since 2026-10-18)
{ const ns = new Set(); let moved = 0, bobbed = 0, bad = 0;
  for(let s = 1; s <= 300; s++){ const {e, P} = mk({awash:true}, s);
    const T = put(e, P, 2, 'wt-wall', 0), L = put(e, P, 2, 'wt-wall', -3), R = put(e, P, 2, 'wt-wall', 2); L.pinned = true; R.pinned = true; // only T can be washed
    e.roundStart(P, 1, so, {}, []); ok(T.slot === 0 || s > 1, 'no Awash in round 1');
    const ev = []; e.roundStart(P, 2, so, {}, ev); const ft = ev.find(x=> x.type === 'fieldTick' && x.field === 'awash'), w = ev.find(x=> x.type === 'wave' && x.awash);
    if(!ft || !w || ft.uid !== T.uid){ bad++; continue; } ns.add(ft.n);
    // left: -1, -2 free (-3 is a unit), right: 1 free (2 is a unit)
    const want = w.dir === 'left' ? -Math.min(ft.n, 2) : Math.min(ft.n, 1);
    if(T.slot !== want || T.slot === -3 || T.slot === 2) bad++; else moved++;
    // 2026-10-18 (Awash N: "If crash into another unit, both take N damage"): left n=3 hits L, right n>=2 hits R
    const crashWant = w.dir === 'left' ? (ft.n === 3 ? L : null) : (ft.n >= 2 ? R : null), cr = ev.find(x=> x.type === 'washCrash');
    if(crashWant ? !(cr && cr.otherUid === crashWant.uid && cr.n === ft.n && T.hp === 500 - ft.n && crashWant.hp === 500 - ft.n) : (cr || T.hp !== 500)) bad++;
    if(w.bob) bobbed++; }
  ok(!bad, `Awash: one fieldTick and one wave a round, it rides n columns, and a unit in the way is crashed into for n each (${bad} wrong)`);
  ok(ns.size === 3 && [...ns].every(n=> n >= 1 && n <= 3), `Awash rolls 1–3 (${[...ns].sort()})`); ok(!bobbed && moved === 300, 'with room it always moves'); }
{ const {e, P} = mk({awash:true}, 5); const T = put(e, P, 1, 'wt-wall', 0), A = put(e, P, 1, 'wt-wall', -1), B = put(e, P, 1, 'wt-wall', 1); A.pinned = true; B.pinned = true;
  e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev); const w = ev.find(x=> x.type === 'wave');
  const cr = ev.find(x=> x.type === 'washCrash'), ft = ev.find(x=> x.field === 'awash');
  ok(w && w.awash && !w.bob && T.slot === 0 && w.targetSide === 'A' && cr && [A.uid, B.uid].includes(cr.otherUid), 'Awash on a boxed-in unit: it rams the unit beside it (2026-10-18)');
  ok(cr && T.hp === 500 - ft.n && [A, B].find(x=> x.uid === cr.otherUid).hp === 500 - ft.n, '...and both take N'); }
{ const {e, P} = mk({awash:true}, 5); const T = put(e, P, 1, 'wt-wall', -2), A = put(e, P, 1, 'wt-wall', 2); A.pinned = true;
  e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev); const w = ev.find(x=> x.type === 'wave');
  ok(w && T.slot > -2 && !ev.some(x=> x.type === 'washCrash' && w.dir === 'left'), 'at the edge it turns back the other way (only the edge bounces it)'); }
{ const {e, P} = mk({awash:1}, 9); const T = put(e, P, 2, 'wt-wall', 0); put(e, P, 2, 'wt-wall', 3).pinned = true; e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const ft = ev.find(x=> x.field === 'awash'); ok(ft && ft.n === 1 && Math.abs(T.slot) === 1, 'rules.awash: 1 caps the roll at 1'); }
{ const {e, P} = mk({awash:true}, 9); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(ev.some(x=> x.field === 'awash' && x.none), 'Awash on an empty field logs nothing to wash'); }
{ const {e, P} = mk({}, 9); const T = put(e, P, 2, 'wt-wall', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(!ev.some(x=> x.field === 'awash' || x.type === 'wave') && T.slot === 0, 'no Awash without the rule'); }

// ---- 5. App wiring
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const sfx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8');
const fxa = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-a.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
{ const m = src.match(/const FIELD2 = \{([\s\S]*?)\n\};/); ok(m && /\n  awash:\s*\{icon:'〰️', name:'Wave', editor:'awash'/.test('\n' + m[1]), 'FIELD2 has the Wave field, named Wave (the field card, Edit skirmish and the Environment row come from it)'); }
ok(/\['awash', \{awash:true\}/.test(src), 'the Effects library stages Awash');
// 2026-10-18 (user: "We can call all of them wave for now. "Awashed" will be for something else - reserved."): nothing on screen says Awash
ok(!/〰️ Awash|name:'Awash'|`Awash /.test(src), 'no player-facing "Awash" left (the log, the float, the field card say Wave)');
ok(/`〰️ Wave \$\{ev\.n\}: the water takes/.test(src), 'the field\'s log line: "Wave N: the water takes X"');
ok(/key:'wave', category:'passive', label:'Wave', kind:'selectNumber'/.test(src) && /if\(n > 1\) e\.waveN = n; else delete e\.waveN;/.test(src), 'the skill editor: Wave picks a way and an N (effects.waveN)');
ok(/wave: \(v, n, e\)=>\{ const w = waveParts\(v, e\)/.test(src) && /If it crashes into a unit, it stops and both take \$\{w\.n\}/.test(src), 'the Wave skill text describes the crash');
{ const m = src.match(/function waveParts\(v, e\)\{[\s\S]*?\n\}/), wp = m ? eval('(' + m[0] + ')') : null;
  ok(wp && wp(['left', 2]).n === 2 && wp(undefined, {wave:'right', waveN:3}).n === 3 && wp(undefined, {wave:2}).way === 'either' && wp(undefined, {wave:2}).n === 2 && wp(undefined, {wave:true}).n === 1, 'waveParts reads [way, N], effects.waveN and a bare number'); }
ok(/\['sulphurFumes', 'ashRain', 'arrowSlits', 'awash'\]\.includes\(ev\.field\)\) hit = markFieldRow\(ev\.field\)/.test(src), 'the Awash row is learned when it first washes');
ok(/case 'awash': return \{cls:'', text:/.test(src) && /'arrowSlitHit', 'awash'[,\]]/.test(src), 'Awash has a battle-log line and its own tick handling');
ok(/awash:\{art:'art\/fields\/(rapids|awash)\.png'\}/.test(src), 'Awash has an art key');
ok(/else if\(ev\.type==='wave'\) base = ev\.blocked \? 640 : 820;/.test(src), 'the replay waits for the ride before the next event');
ok(/SkillFX\.waveRide\(e2, \{from:fromRect/.test(src) && /SkillFX\.waveBob\(el, /.test(src) && !/e2\.classList\.add\('wave-pushed'\)/.test(src), 'the wave handler rides the card (no .wave-pushed teleport)');
ok(/function waveRide\(el, o\)/.test(sfx) && /function waveBob\(el, o\)/.test(sfx) && /function tideSway\(cards, o\)/.test(sfx) && /Object\.assign\(root\.SkillFX, \{waveRide, waveBob, tideSway\}\)/.test(sfx), 'SkillFX has waveRide, waveBob, tideSway');
ok(/case 'wave': \{ const F = S\(\); if\(F && F\.waveRide\) break;/.test(fxa), 'FX.A no longer draws its own crest over the ride');
// the boomerang: one return flight
ok(/case 'boomerangReturn': break;/.test(fxa) && !/case 'boomerangReturn': \{ const a = el\(ev\.uid\); if\(a\) M\.boomerangInbound/.test(fxa), 'FX.A no longer flies a second boomerang on boomerangReturn');
ok(/case 'boomerangCaught': \{ const a = el\(ev\.uid\), F = S\(\); if\(a && !\(F && F\.boomerangInFlight/.test(fxa), 'the catch look skips while the return flight is in the air');
ok(/boomNote\(o\.key, \{ux:dx\/L, uy:dy\/L/.test(sfx) && /function boomerangInFlight\(key\)/.test(sfx) && /boomerangReturn, boomerangInFlight, shieldDrop/.test(sfx), 'the throw is remembered and the return retraces it');
ok(/SkillFX\.boomerangReturn\(el, null, \{flight:420, key, whiff:true\}\)/.test(src) && /\(SkillFX\.boomerangThrow \|\| SkillFX\.boomerang\)\(a, t, \{flight:420, key\}\)/.test(src), 'the game passes the throw key (and flies the whiff home)');
// the tide and the hover heights
// 2026-10-18 (owner: "lifts up cards by too much ... really laggy ... from the left to right, 0.1s apart"): a CSS lift per column replaced the GSAP sway
ok(/function tideLiftCards\(bf, kind\)/.test(src) && /tideLiftCards\(bf, kind\)/.test(src) && /\.board-card\.tide-lift \.card-tile\{animation:tideLift/.test(tpl), 'the tide lifts every board card a little, column by column');
ok(/@keyframes flySoar\{0%,100%\{translate:calc\(5px\*var\(--fly-amp\)\) calc\(-10\.4px\*var\(--fly-amp\)\);/.test(tpl) && /is-flying \.fly-body\{translate:calc\(5px\*var\(--fly-amp\)\) calc\(-10\.4px\*var\(--fly-amp\)\);/.test(tpl), 'flyers hover 15% higher (10.4px; halved while chilled, 2026-10-18)');
ok(/@keyframes tideFloat\{0%,100%\{translate:0 calc\(-5\.2px\*var\(--fly-amp\)\);/.test(tpl) && /\.is-floating \.fly-shadow\{display:block;/.test(tpl), 'Tide units and Swimmers float at half that, with a shadow');
ok(/floats\?'<span class="fly-shadow is-float" aria-hidden="true"><\/span><div class="fly-body float-body">'/.test(src), 'floating cards get their shadow element');
// the Effects Lab: every entry it registers is in the inventory
{ const inv = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'effects-inventory-2026-10-15.json'), 'utf8')), ids = new Set(inv.filter(x=> x.status !== 'retired').map(x=> x.id));
  const man = fs.readFileSync(path.join(__dirname, '..', 'tools', 'effects-lab', 'manifest', 'wave17.js'), 'utf8'), reg = [...man.matchAll(/R\(\{id:'([^']+)'/g)].map(x=> x[1]);
  ok(reg.length >= 7 && reg.every(id=> ids.has(id)), `the lab's wave17 entries are all in the inventory (${reg.filter(id=> !ids.has(id))})`);
  ok(['fld2-awash', 'sk-wave-bob', 'st-hover-height'].every(id=> ids.has(id)), 'the new inventory entries exist'); }

console.log(fail ? `wave-tide-2026-10-17: ${fail} failure(s)` : 'wave-tide-2026-10-17: all passed');
process.exit(fail ? 1 : 0);
