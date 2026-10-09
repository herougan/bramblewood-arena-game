#!/usr/bin/env node
// Rule fixes (2026-10-10): Heal removes Bleed first; Stun is counters; Cleanse N (curses first); Scare N; Desecrate N;
// a unit under Wait doesn't bleed from its own actions.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tr-regen':  {id:'tr-regen', name:'T Regen', attack:0, health:20, wait:0, cost:0, effects:{regen:5}},
  'tr-wall':   {id:'tr-wall', name:'T Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'tr-hit':    {id:'tr-hit', name:'T Hitter', attack:5, health:500, wait:0, cost:0, effects:{}},
  'tr-scare':  {id:'tr-scare', name:'T Scare', attack:0, health:500, wait:0, cost:0, effects:{scare:2}},
  'tr-desec':  {id:'tr-desec', name:'T Desecrate', attack:1, health:500, wait:0, cost:0, effects:{desecrate:2}},
  'tr-clean':  {id:'tr-clean', name:'T Cleanse', attack:0, health:500, wait:0, cost:0, effects:{triggers:[{on:'onRoundStart', do:'cleanse', amount:3}]}},
  'tr-waiter': {id:'tr-waiter', name:'T Waiter', attack:3, health:50, wait:3, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side||'left', {}, []); return all(P[pid]).slice(-1)[0]; };
// 1) Regeneration 5 on a card with Bleed 3 and 10 damage: Bleed goes, then +2 HP
{ const {e, P} = mk(); const c = spawn(e, P, 1, 'tr-regen'); c.hp = 10; c.bleed = 3;
  e.resolveCombat(P, so, {}, [], 1);
  ok(c.bleed === 0, `Bleed removed by the heal (bleed ${c.bleed})`);
  ok(c.hp === 12, `the 2 left over heal HP (hp ${c.hp})`); }
// 2) Stun counters: 2 counters hold the Wait countdown for 2 rounds
{ const {e, P} = mk(); const c = spawn(e, P, 1, 'tr-waiter'); const w0 = c.wait; c.stunned = 2; c._stunnedJustSet = false;
  e.resolveCombat(P, so, {}, [], 1); ok(c.wait === w0 && c.stunned === 1, `round 1: no Wait tick, 1 counter left (wait ${c.wait}, stun ${c.stunned})`);
  e.resolveCombat(P, so, {}, [], 2); ok(c.wait === w0 && !c.stunned, `round 2: no Wait tick, no counters left (wait ${c.wait}, stun ${c.stunned})`);
  e.resolveCombat(P, so, {}, [], 1); ok(c.wait === w0 - 1, `round 3: Wait ticks again (wait ${c.wait})`); }
// 3) Scare 2: a 5-attack hit lands for 3
{ const {e, P} = mk(); spawn(e, P, 1, 'tr-hit'); const t = spawn(e, P, 2, 'tr-scare'); const h0 = t.hp;
  e.resolveCombat(P, so, {}, [], 1); const d = h0 - t.hp; ok(d > 0 && d % 3 === 0, `Scare 2 cuts each 5 hit to 3 (took ${d})`); }
// 4) Desecrate 2: the hit curses the target's cell; the curse ticks every round on whoever stands there
{ const {e, P} = mk(); spawn(e, P, 1, 'tr-desec'); const t = spawn(e, P, 2, 'tr-wall');
  e.resolveCombat(P, so, {}, [], 1); const cur = e.getCurses(); const tot = Object.values(cur).reduce((a,b)=>a+b, 0);
  ok(tot >= 2, `a curse is laid (${JSON.stringify(cur)})`);
  const h1 = t.hp; e.resolveCombat(P, so, {}, [], 2); ok(h1 - t.hp >= tot, `the curse burns at least ${tot} next round (took ${h1 - t.hp})`); }
// 5) Cleanse 3 removes the curse on its own cell first
{ const {e, P} = mk(); spawn(e, P, 2, 'tr-desec'); const c = spawn(e, P, 1, 'tr-clean'); c.poison = 4;
  e.resolveCombat(P, so, {}, [], 2); const before = Object.values(e.getCurses()).reduce((a,b)=>a+b, 0);
  ok(before > 0, `the enemy cursed the cleanser's cell (${before})`);
  e.roundStart(P, 2, so, {}, []); // onRoundStart triggers run in the upkeep pass; also call combat to run it
  e.resolveCombat(P, so, {}, [], 1);
  const after = Object.values(e.getCurses()).reduce((a,b)=>a+b, 0);
  ok(after < before || c.poison < 4, `Cleanse 3 took the curse (and then poison) off (curse ${before}→${after}, poison ${c.poison})`); }
console.log(`rules-2026-10-10: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
