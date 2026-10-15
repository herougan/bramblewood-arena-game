#!/usr/bin/env node
// 2026-10-15 (effects pass, batch C): death events carry nullified / exiled for the replay's death look; the engine now logs when a status runs out ({type:'statusEnd', status}) and when a sleeper is
// woken by damage ({type:'statusEnd', status:'asleep', woke:true}), so the replay can show it. These are log-only events: the
// rules don't change (the statuses still tick exactly as before, checked here too).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'se-a': {id:'se-a', name:'A', attack:2, health:500, wait:0, cost:0, effects:{}},
  'se-wall': {id:'se-wall', name:'W', attack:0, health:5000, wait:0, cost:0, effects:{}},
  'se-null': {id:'se-null', name:'N', attack:50, health:500, wait:0, cost:0, effects:{nullify:true}},
  'se-big': {id:'se-big', name:'B', attack:50, health:500, wait:0, cost:0, effects:{}},
  'se-weak': {id:'se-weak', name:'K', attack:0, health:5, wait:0, cost:0, effects:{}},
});
function trial(seed, setup){ const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; return setup(e, P); }
const ends = (ev, k, uid)=> ev.filter(x=> x.type === 'statusEnd' && x.status === k && (uid == null || x.uid === uid));
// Poison: the last stack ticks away during the round -> one statusEnd poison (and none while stacks remain)
trial(1, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-wall', 'left', {}, []); const c = e.allBoardCards(P[1])[0]; c.poison = 2;
  const ev1 = []; e.resolveCombat(P, so, {}, ev1, 1); ok(c.poison === 1, 'poison still ticks down one stack a round'); ok(ends(ev1, 'poison', c.uid).length === 0, 'no wear-off while a stack is left');
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 1); ok(c.poison === 0, 'the last stack ticks away'); ok(ends(ev2, 'poison', c.uid).length === 1, 'poison wearing off is logged once');
  const ev3 = []; e.resolveCombat(P, so, {}, ev3, 1); ok(ends(ev3, 'poison', c.uid).length === 0, 'not logged again'); });
// Frozen / Blind / Stun: counters melt at upkeep -> statusEnd for each, carrying side, uid and defId
trial(2, (e, P)=>{ e.debugSpawnCard(P, so, 2, 'se-wall', 'left', {}, []); const c = e.allBoardCards(P[2])[0]; c.frozen = 1; c.blind = 1; c.stunned = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(c.frozen === 0 && c.blind === 0 && !c.stunned, 'the statuses count down as before');
  const f = ends(ev, 'frozen', c.uid)[0]; ok(!!f, 'Frozen wearing off is logged'); ok(f && f.side === 'B' && f.defId === 'se-wall', 'the event names the side and the card');
  ok(ends(ev, 'blind', c.uid).length === 1, 'Blind wearing off is logged'); ok(ends(ev, 'stunned', c.uid).length === 1, 'Stun wearing off is logged'); });
// Asleep, woken by a hit: statusEnd {woke:true} before the hit; the sleeper is awake
trial(3, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-a', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'se-wall', 'left', {}, []);
  const a = e.allBoardCards(P[1])[0], w = e.allBoardCards(P[2])[0]; w.asleep = 3; const ev = []; e.debugAttack(P, so, a.uid, {}, ev);
  ok(w.asleep === 0, 'a hit still wakes it'); const k = ev.findIndex(x=> x.type === 'statusEnd' && x.woke && x.uid === w.uid), h = ev.findIndex(x=> x.type === 'hit' && x.targetUid === w.uid);
  ok(k >= 0, 'waking up is logged'); ok(k >= 0 && h >= 0 && k < h, 'the wake-up comes just before the hit that caused it'); });
// Petrification wears off at the next round start
trial(4, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-wall', 'left', {}, []); const c = e.allBoardCards(P[1])[0]; c.petrified = true;
  const ev = []; e.roundStart(P, 2, so, {}, ev); ok(!c.petrified, 'stone still wears off at round start'); ok(ends(ev, 'petrified', c.uid).length === 1, 'petrification wearing off is logged'); });
// A unit that dies with a status on it doesn't get a wear-off
trial(5, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-a', 'left', {}, []); const c = e.allBoardCards(P[1])[0]; c.hp = 1; c.poison = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(ends(ev, 'poison', c.uid).length === 0, 'no wear-off for a unit that died of it'); });
// Death events say how it died for the replay's death look (2026-10-15): a Nullify kill is flagged and goes to the Removal Zone
trial(7, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-null', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'se-weak', 'left', {}, []);
  const n = e.allBoardCards(P[1])[0], k = e.allBoardCards(P[2])[0]; const ev = []; e.debugAttack(P, so, n.uid, {}, ev);
  const d = ev.find(x=> x.type === 'death' && x.uid === k.uid); ok(!!d, 'the Nullify kill logs a death'); ok(d && d.nullified === true && d.exiled === true, 'flagged nullified and exiled');
  ok(P[2].exile.some(x=> x.defId === 'se-weak') && !P[2].graveyard.some(x=> x.defId === 'se-weak'), 'it still goes to the Removal Zone'); });
trial(8, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'se-big', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'se-weak', 'left', {}, []);
  const n = e.allBoardCards(P[1])[0], k = e.allBoardCards(P[2])[0]; const ev = []; e.debugAttack(P, so, n.uid, {}, ev);
  const d = ev.find(x=> x.type === 'death' && x.uid === k.uid); ok(!!d && !d.nullified && !d.exiled, 'an ordinary kill carries no flags');
  ok(P[2].graveyard.some(x=> x.defId === 'se-weak'), 'and goes to the graveyard'); });
// Without recordEvents nothing is logged and nothing breaks
{ const e = E.makeSimEngine(defs, E.mulberry32(6), {battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; e.debugSpawnCard(P, so, 1, 'se-wall', 'left', {}, null);
  const c = e.allBoardCards(P[1])[0]; c.poison = 1; let threw = false; try{ e.resolveCombat(P, so, {}, null, 1); }catch(err){ threw = true; } ok(!threw && c.poison === 0, 'runs without an event log'); }
console.log(`keywords-2026-10-15d: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
