#!/usr/bin/env node
// 2026-10-17 (user: "Arrows etc, and all these kind of skills happen at Speed = 1. Quick happens at Speed = 2." and "Settle death
// effects after a skill or attack finishes"): one Speed order for the whole round. Quick swings at Speed 2, every shooter's Arrows /
// Bolts / Snipe at Speed 1, a Boomerang throw at Speed 0 since EN2 (was 1), everyone else at Speed 0 (Speed / Haste add on top). The dead are cleared
// after each action, and a unit an arrival kills (Pounce) dies as the arrival ends.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'co-plain':  U('co-plain'),
  'co-quick':  U('co-quick', {quick:true}),
  'co-qfast':  U('co-qfast', {quick:true, speed:1}),
  'co-fast3':  U('co-fast3', {speed:3}),
  'co-archer': U('co-archer', {arrow:1}, {attack:0}),
  'co-bolt':   U('co-bolt', {fireBolt:1}, {attack:0}),
  'co-boom':   U('co-boom', {boomerang:true}),
  'co-wall':   U('co-wall', {}, {attack:0, health:500}),
  'co-frail':  U('co-frail', {}, {attack:0, health:1}),
  'co-pounce': U('co-pounce', {pounce:3}, {attack:0, wait:3}),
  'co-volley': U('co-volley', {volley:2}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||9), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
const idx = (ev, f)=> ev.findIndex(f);
const swingOf = (ev, uid)=> idx(ev, x=> (x.type==='hit' || x.type==='hitHQ') && x.attUid===uid && !x.ranged && x.type!=='arrow');
const shotOf = (ev, uid)=> idx(ev, x=> (x.type==='arrow' || x.type==='bolt') && x.uid===uid);

// 1. Quick (Speed 2) swings before an Arrow (Speed 1), even from the side without initiative
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-archer', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-quick', 'center', {}, []);
  const A = byDef(P[1], 'co-archer'), Q = byDef(P[2], 'co-quick'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const q = swingOf(ev, Q.uid), a = shotOf(ev, A.uid);
  ok(q >= 0 && a >= 0 && q < a, `1. Quick swings before the arrow (quick at ${q}, arrow at ${a})`); }
// 2. Arrows and Bolts (Speed 1) go before a plain swing (Speed 0), even when the plain unit's side has initiative
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-plain', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-bolt', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'co-archer', 'right', {}, []);
  const pl = byDef(P[1], 'co-plain'), B = byDef(P[2], 'co-bolt'), A = byDef(P[2], 'co-archer'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const s = swingOf(ev, pl.uid), b = shotOf(ev, B.uid), a = shotOf(ev, A.uid);
  ok(b >= 0 && a >= 0 && s > b && s > a, `2. shots before the Speed 0 swing (bolt ${b}, arrow ${a}, swing ${s})`); }
// 3. Speed 3 beats Quick + Speed 1 (= 3, tie: initiative), which beats plain Quick (2)
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-quick', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'co-qfast', 'right', {}, []); e.debugSpawnCard(P, so, 2, 'co-fast3', 'center', {}, []);
  const q = byDef(P[1], 'co-quick'), qf = byDef(P[1], 'co-qfast'), f3 = byDef(P[2], 'co-fast3'); const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  const iq = swingOf(ev, q.uid), iqf = swingOf(ev, qf.uid), if3 = swingOf(ev, f3.uid);
  ok(if3 < iqf && iqf < iq, `3. Speed 3 (initiative) ${if3}, Quick+1 ${iqf}, Quick ${iq}`); }
// 4. A Boomerang throw goes at Speed 0 since EN2 (2026-10-23, owner 13:16 #9; it was Speed 1): the plain swing from the side with
//    initiative goes first
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-plain', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-boom', 'center', {}, []);
  const pl = byDef(P[1], 'co-plain'), bm = byDef(P[2], 'co-boom'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const s = swingOf(ev, pl.uid), t = swingOf(ev, bm.uid);
  ok(t >= 0 && s >= 0 && s < t, `4. the Boomerang throw (${t}) after the initiative's plain swing (${s}): both Speed 0 (EN2)`); }
// 5. An arrow kill dies before the next action (not after the round's other swings)
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-archer', 'center', {}, []); e.debugSpawnCard(P, so, 1, 'co-plain', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'co-frail', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-wall', 'left', {}, []);
  const A = byDef(P[1], 'co-archer'), pl = byDef(P[1], 'co-plain'), fr = byDef(P[2], 'co-frail'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const a = shotOf(ev, A.uid), d = idx(ev, x=> x.type==='death' && x.uid===fr.uid), s = swingOf(ev, pl.uid);
  ok(a >= 0 && d > a && (s < 0 || d < s), `5. the arrow kill's death (${d}) comes after the shot (${a}) and before the next swing (${s})`); }
// 6. A Volley's kill is settled once that shooter's shots are done, before anyone else acts
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-volley', 'center', {}, []); e.debugSpawnCard(P, so, 1, 'co-plain', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'co-frail', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-wall', 'left', {}, []);
  const pl = byDef(P[1], 'co-plain'), fr = byDef(P[2], 'co-frail'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const d = idx(ev, x=> x.type==='death' && x.uid===fr.uid), s = swingOf(ev, pl.uid);
  ok(d >= 0 && s > d, `6. the Volley kill dies (${d}) before the next swing (${s})`); }
// 7. Pounce: the unit it kills dies as the pouncer lands, not at the next round's first clean-up
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'co-frail', 'center', {}, []); const fr = byDef(P[2], 'co-frail');
  const ev = []; e.debugSpawnCard(P, so, 1, 'co-pounce', 'center', {}, ev);
  const h = idx(ev, x=> x.type==='hit' && x.targetUid===fr.uid), d = idx(ev, x=> x.type==='death' && x.uid===fr.uid);
  ok(h >= 0 && d > h, `7. the pounced unit dies in the arrival's own events (hit ${h}, death ${d})`);
  ok(!all(P[2]).includes(fr), '7. and it is off the board before combat'); }
// 8. A Quick unit can kill an archer before it shoots: the dead archer never fires
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'co-quick', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'co-archer', 'center', {}, []);
  const Q = byDef(P[1], 'co-quick'), A = byDef(P[2], 'co-archer'); A.hp = 1; const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(swingOf(ev, Q.uid) >= 0 && shotOf(ev, A.uid) < 0, `8. the Quick kill comes first and the archer never shoots`); }
console.log(`combat-order-2026-10-17: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
