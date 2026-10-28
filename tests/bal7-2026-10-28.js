#!/usr/bin/env node
// Package BAL7 (2026-10-28): the batch's balance package.
//   ENG12-2 A unit woken by a hit loses the rest of that round: no swing, no counter, no trigger (it wakes groggy); it acts from the next round.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-sleeper': U('x-sleeper', {}, {attack:5, health:100, wait:0}),
  'x-hitter': U('x-hitter', {quick:true}, {attack:2, health:100, wait:0}),
  'x-counter': U('x-counter', {counterattack:true}, {attack:4, health:100, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules:{}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:200, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, slot, {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const hitsBy = (ev, uid)=> ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === uid);

// ---- ENG12-2: woken by a hit, no swing that round ------------------------------------------------------------------------------
{ const {e, P} = mk(31); const s = put(e, P, 1, 'x-sleeper', 0); const h = put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); s.asleep = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(s.hp < 100 && !(s.asleep > 0), `ENG12-2 the Quick hit wakes the sleeper (Health ${s.hp}, Asleep ${s.asleep})`);
  ok(hitsBy(ev, s.uid).length === 0 && h.hp === 100, `ENG12-2 ... and the woken unit does not swing that round (${hitsBy(ev, s.uid).length} hits, foe Health ${h.hp})`);
  e.endOfRoundUpkeep(P, so, {}, []); e.roundStart(P, 2, so, {}, []);
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 2);
  ok(hitsBy(ev2, s.uid).length >= 1, `ENG12-2 ... it swings again the next round (${hitsBy(ev2, s.uid).length} hits)`); }
// control: the same unit, never asleep, swings in round 1
{ const {e, P} = mk(31); const s = put(e, P, 1, 'x-sleeper', 0); put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(hitsBy(ev, s.uid).length >= 1, `ENG12-2 control: an awake unit swings in that round (${hitsBy(ev, s.uid).length} hits)`); }
// a Counterattack unit woken by a hit does not strike back that round, and does the next
{ const {e, P} = mk(32); const c = put(e, P, 1, 'x-counter', 0); const h = put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); c.asleep = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(!(c.asleep > 0) && h.hp === 100, `ENG12-2 a sleeping Counterattack unit, woken by the hit, does not counter that round (foe Health ${h.hp})`);
  e.endOfRoundUpkeep(P, so, {}, []); e.roundStart(P, 2, so, {}, []);
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 2);
  ok(h.hp < 100, `ENG12-2 ... and counters the next round (foe Health ${h.hp})`); }
// the engine source: one helper gates every action check
{ const src = require('fs').readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/function dozing\(c\)\{[^\n]*_wokeRound === turnNo/.test(src) && /card\._wokeRound = turnNo/.test(src), 'ENG12-2 the wake marks the round (_wokeRound) and dozing() reads it'); }

console.log(`\nbal7: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
