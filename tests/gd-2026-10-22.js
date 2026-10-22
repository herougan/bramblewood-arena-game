#!/usr/bin/env node
// 2026-10-22 (package GD, owner N22-12: "Guardian now blocks for all adjacent allies in the 4 cardinal directions"):
//   - on the raid board (3 rows, reserveActs) a Guardian directly behind / in front of the target (same column) takes the hit;
//   - several Guardians: left, right, in front, behind (first that is alive takes it);
//   - a Guardian never guards itself; a waiting reserve (rows that don't fight) neither guards nor is guarded;
//   - a real swing at a front-row unit lands on the Guardian behind it, and a swing at a middle-row unit (its column's front empty)
//     lands on the Guardian behind it in the back row.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'gd-hit': U('gd-hit', {}, {attack:4}), 'gd-wall': U('gd-wall', {}), 'gd-guard': U('gd-guard', {guardian:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);

// ---- direct: who steps in for a target in each row
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 1, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'front target: the Guardian behind it (middle row, same column) steps in'); }
{ const {e, P} = mk(); const g = place(e, P, 2, 0, 'gd-guard', 0), t = place(e, P, 2, 1, 'gd-wall', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'middle target: the Guardian in front of it (front row) steps in'); }
{ const {e, P} = mk(); const t = place(e, P, 2, 1, 'gd-wall', 0), g = place(e, P, 2, 2, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'middle target: the Guardian behind it (back row) steps in'); }
{ const {e, P} = mk(); const g = place(e, P, 2, 1, 'gd-guard', 0), t = place(e, P, 2, 2, 'gd-wall', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'back target: the Guardian in front of it (middle row) steps in'); }
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0); place(e, P, 2, 1, 'gd-guard', 1); place(e, P, 2, 2, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === t, 'not adjacent (diagonal, two rows back): nobody steps in'); }
// order: left, right, in front, behind
{ const {e, P} = mk(); const t = place(e, P, 2, 1, 'gd-wall', 0), f = place(e, P, 2, 0, 'gd-guard', 0), b = place(e, P, 2, 2, 'gd-guard', 0), r = place(e, P, 2, 1, 'gd-guard', 1);
  ok(e.redirectToGuardian(P[2], t) === r, 'right beats in front and behind');
  r.hp = 0; ok(e.redirectToGuardian(P[2], t) === f, 'in front beats behind'); f.hp = 0; ok(e.redirectToGuardian(P[2], t) === b, 'behind when the others are down');
  const l = place(e, P, 2, 1, 'gd-guard', -1); r.hp = 500; ok(e.redirectToGuardian(P[2], t) === l, 'left beats right'); }
// a Guardian is not its own guard; a Guardian target is guarded by a neighbouring Guardian
{ const {e, P} = mk(); const g = place(e, P, 2, 0, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], g) === g, 'a lone Guardian takes its own hit (no self-guard)');
  const g2 = place(e, P, 2, 1, 'gd-guard', 0); ok(e.redirectToGuardian(P[2], g) === g2, 'a Guardian target: the Guardian behind it steps in'); }
// reserve rows that don't fight: no front / behind
{ const {e, P} = mk({reserveActs:false}); const t = place(e, P, 2, 0, 'gd-wall', 0); place(e, P, 2, 1, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === t, 'a waiting reserve (no reserveActs) does not guard the unit in front of it'); }
// left / right still work in the front row
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 0, 'gd-guard', 1);
  ok(e.redirectToGuardian(P[2], t) === g, 'front row: the Guardian to its right steps in (unchanged)'); }

// ---- real swings
{ const {e, P} = mk(); const a = place(e, P, 1, 0, 'gd-hit', 0), t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 1, 'gd-guard', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp === 500 && g.hp === 496, `swing at a front unit lands on the Guardian behind it (target -${500 - t.hp}, guard -${500 - g.hp})`);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === g.uid && x.guardianRedirect), 'the hit event names the Guardian and carries guardianRedirect'); }
{ const {e, P} = mk(); place(e, P, 1, 0, 'gd-hit', 0); const t = place(e, P, 2, 1, 'gd-wall', 0), g = place(e, P, 2, 2, 'gd-guard', 0);
  e.resolveCombat(P, so, {}, [], 1);
  ok(t.hp === 500 && g.hp === 496, `swing at a middle unit (front empty) lands on the Guardian behind it (target -${500 - t.hp}, guard -${500 - g.hp})`); }

console.log(`gd-2026-10-22: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
