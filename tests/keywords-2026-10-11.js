#!/usr/bin/env node
// 2026-10-11: Puncture (was Pierce), Pierce (was Rend, now ignores N Armor), Perforate N, Counterattack, Spiteful N.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'kw-hit': {id:'kw-hit', name:'Hit', attack:5, health:50, wait:0, cost:0, effects:{}},
  'kw-punct': {id:'kw-punct', name:'Pu', attack:2, health:50, wait:0, cost:0, effects:{puncture:2}},
  'kw-pierce': {id:'kw-pierce', name:'Pi', attack:5, health:50, wait:0, cost:0, effects:{pierce:2}},
  'kw-perf': {id:'kw-perf', name:'Pf', attack:5, health:50, wait:0, cost:0, effects:{perforate:1}},
  'kw-armor': {id:'kw-armor', name:'Ar', attack:0, health:500, wait:0, cost:0, effects:{armor:3}},
  'kw-counter': {id:'kw-counter', name:'Co', attack:4, health:500, wait:0, cost:0, effects:{counterattack:true}},
  'kw-spite': {id:'kw-spite', name:'Sp', attack:0, health:500, wait:0, cost:0, effects:{spiteful:3}},
});
function setup(a, b){ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, a, 'left', {}, []); e.debugSpawnCard(P, so, 2, b, 'left', {}, []); return {e, P, A:e.allBoardCards(P[1])[0], B:e.allBoardCards(P[2])[0]}; }
{ const {e, P, A} = setup('kw-punct', 'kw-armor'); const hq = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []); ok(P[2].hq.hp === hq - 2, 'Puncture 2 deals 2 to the castle'); }
{ const {e, P, A, B} = setup('kw-pierce', 'kw-armor'); const hp = B.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hp - B.hp === 4, `Pierce 2 ignores 2 of 3 Armor (took ${hp - B.hp}, want 4)`); }
{ const {e, P, A, B} = setup('kw-perf', 'kw-armor'); const hq = P[2].hq.hp, hp = B.hp; e.debugAttack(P, so, A.uid, {}, []);
  ok(hp - B.hp === 3, `Perforate 1 ignores 1 Armor (took ${hp - B.hp}, want 3)`); ok(B.bleed === 1, 'Perforate 1 adds 1 Bleed'); ok(B.armorLoss === 1, 'Perforate 1 strips 1 Armor'); ok(P[2].hq.hp === hq - 1, 'Perforate 1 deals 1 to the castle');
  const hp2 = B.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hp2 - B.hp === 4, `second hit: 2 Armor left, Pierce 1 ignores 1 (took ${hp2 - B.hp}, want 4)`); }
{ const {e, P, A, B} = setup('kw-hit', 'kw-counter'); const hp = A.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hp - A.hp === 4, `Counterattack strikes back for its Attack (${hp - A.hp})`); }
{ const {e, P, A, B} = setup('kw-hit', 'kw-spite'); const hp = A.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hp - A.hp === 3, `Spiteful 3 hurts the attacker (${hp - A.hp})`); }
// Counterattack units never take a turn of their own
{ const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; const st = {};
  e.debugSpawnCard(P, so, 1, 'kw-counter', 'left', {}, []); const hq = P[2].hq.hp; const ev = []; e.resolveCombat(P, so, st, ev, 1);
  ok(P[2].hq.hp === hq, 'a Counterattack unit with nobody hitting it never attacks'); }
// Actions per turn: 2 plays a turn; the side playing second gets 2 cards and 1 Health (3 actions: 3 cards, 2 Health, 1 Lumber)
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {battleMode:'open', rules:{actions:2}}); const P = {1:e.newPlayer(1,{'kw-hit':10}), 2:e.newPlayer(2,{'kw-hit':10})}; const st = {};
  e.draw(P[1], 3, 'A', st, []); const h = P[1].hand.slice();
  ok(e.placeCard(P, so, 1, h[0].uid, 'left', st, []) && !P[1].playedThisTurn, 'first of two plays leaves one');
  ok(e.placeCard(P, so, 1, h[1].uid, 'right', st, []) && P[1].playedThisTurn, 'second play uses the turn');
  ok(!e.placeCard(P, so, 1, h[2].uid, 'right', st, []), 'no third play');
  const hp = P[2].hq.maxHp, n = P[2].hand.length; e.applySecondPlayerBonus(P[2], 'B', st, []); ok(P[2].hand.length === n + 2 && P[2].hq.maxHp === hp + 1, 'second player: +2 cards, +1 Health');
  const b3 = e.secondPlayerBonus(3); ok(b3.cards === 3 && b3.life === 2 && b3.lumber === 1, '3 actions: 3 cards, 2 Health, 1 Lumber'); }
// Spell: Tailwind takes the turn and every unit of yours loses 1 Wait
{ const e = E.makeSimEngine(defs, E.mulberry32(4), {battleMode:'open'}); const P = {1:e.newPlayer(1,{'tailwind':5}), 2:e.newPlayer(2,{})}; const st = {};
  e.debugSpawnCard(P, so, 1, 'thornwood-palisade', 'left', {}, []); const u = e.allBoardCards(P[1])[0]; u.wait = 2; P[1].lumber = 3;
  e.draw(P[1], 1, 'A', st, []); const ok1 = e.placeCard(P, so, 1, P[1].hand[0].uid, 'left', st, []);
  ok(ok1 && u.wait === 1 && P[1].playedThisTurn && e.allBoardCards(P[1]).length === 1, 'Tailwind: no unit, -1 Wait, uses the play'); }
console.log(`keywords-2026-10-11: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
