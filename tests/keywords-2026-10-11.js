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
  'kw-sweep': {id:'kw-sweep', name:'Sw', attack:5, health:50, wait:0, cost:0, effects:{sweep:2}},
  'kw-fork': {id:'kw-fork', name:'Fk', attack:3, health:50, wait:0, cost:0, effects:{fork:true}},
  'kw-swipe': {id:'kw-swipe', name:'Sp', attack:1, health:50, wait:0, cost:0, effects:{swipe:2}},
  'kw-twin': {id:'kw-twin', name:'Tw', attack:2, health:50, wait:0, cost:0, effects:{twinStrike:true}},
  'kw-conv': {id:'kw-conv', name:'Cv', attack:0, health:50, wait:1, cost:0, effects:{converge:'enemy'}},
  'kw-dummy': {id:'kw-dummy', name:'Du', attack:0, health:500, wait:0, cost:0, archetypes:['Beast'], effects:{}},
  'kw-defy': {id:'kw-defy', name:'Df', attack:1, health:50, wait:0, cost:0, effects:{defiance:['Beast'], defianceN:2}},
  'kw-swarm3': {id:'kw-swarm3', name:'S3', attack:1, health:50, wait:0, cost:0, archetypes:['Beast'], effects:{swarm:3}},
  'kw-pack': {id:'kw-pack', name:'Pk', attack:1, health:10, wait:0, cost:0, archetypes:['Beast'], effects:{pack:2}},
  'kw-ff': {id:'kw-ff', name:'FF', attack:2, health:50, wait:1, cost:0, effects:{fastForward:3}},
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
// Actions per turn: 2 plays a turn; the side playing second gets +1 Shield on its bramble (EN, 2026-10-23; was 2 cards and 1 Health)
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {battleMode:'open', rules:{actions:2}}); const P = {1:e.newPlayer(1,{'kw-hit':10}), 2:e.newPlayer(2,{'kw-hit':10})}; const st = {};
  e.draw(P[1], 3, 'A', st, []); const h = P[1].hand.slice();
  ok(e.placeCard(P, so, 1, h[0].uid, 'left', st, []) && !P[1].playedThisTurn, 'first of two plays leaves one');
  ok(e.placeCard(P, so, 1, h[1].uid, 'right', st, []) && P[1].playedThisTurn, 'second play uses the turn');
  ok(!e.placeCard(P, so, 1, h[2].uid, 'right', st, []), 'no third play');
  // 2026-10-23 (package EN, owner D24: "2nd player has no benefit except +1 Shield to Bramble."): was +2 cards, +1 Health (3 actions: 3 cards, 2 Health, 1 Lumber)
  const hp = P[2].hq.maxHp, n = P[2].hand.length; e.applySecondPlayerBonus(P[2], 'B', st, []); ok(P[2].hand.length === n && P[2].hq.maxHp === hp && P[2].hq.shield === 1, 'second player: +1 Shield on its bramble, nothing else');
  const b3 = e.secondPlayerBonus(3); ok(b3.cards === 0 && b3.life === 0 && b3.lumber === 0 && b3.shield === 1, '3 actions: still only the Shield'); }
// Spell: Tailwind takes the turn and every unit of yours loses 1 Wait
{ const e = E.makeSimEngine(defs, E.mulberry32(4), {battleMode:'open'}); const P = {1:e.newPlayer(1,{'tailwind':5}), 2:e.newPlayer(2,{})}; const st = {};
  e.debugSpawnCard(P, so, 1, 'thornwood-palisade', 'left', {}, []); const u = e.allBoardCards(P[1])[0]; u.wait = 2; P[1].lumber = 3;
  e.draw(P[1], 1, 'A', st, []); const ok1 = e.placeCard(P, so, 1, P[1].hand[0].uid, 'left', st, []);
  ok(ok1 && u.wait === 1 && P[1].playedThisTurn && e.allBoardCards(P[1]).length === 1, 'Tailwind: no unit, -1 Wait, uses the play'); }
// Fast Forward 3 (2026-10-12, D22): Wait 1 counts down on the first counter, then two extra swings, then its normal turn
{ const e = E.makeSimEngine(defs, E.mulberry32(6), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; const st = {};
  e.debugSpawnCard(P, so, 1, 'kw-ff', 'left', {}, []); const u = e.allBoardCards(P[1])[0]; const hq = P[2].hq.hp; const ev = [];
  ok(u.ffCounters === 3, 'Fast Forward 3 arrives with 3 counters');
  e.resolveCombat(P, so, st, ev, 1);
  ok(u.ffCounters === 0 && u.wait === 0, 'the counters are spent and its Wait ran out');
  ok(hq - P[2].hq.hp === 6, `two fast-forward swings plus its normal turn hit the castle 3 times (took ${hq - P[2].hq.hp}, want 6)`);
  ok(ev.some(x=> x.type === 'fastForward'), 'a fastForward event is recorded');
  const hq2 = P[2].hq.hp; e.resolveCombat(P, so, st, [], 1); ok(hq2 - P[2].hq.hp === 2, 'next round it attacks once, as normal'); }
// 2026-10-12 skills
function board(a, bs){ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, a, 'center', {}, []); bs.forEach(([id, sd])=> e.debugSpawnCard(P, so, 2, id, sd, {}, [])); return {e, P, A:e.allBoardCards(P[1])[0]}; }
{ const {e, P, A} = board('kw-sweep', [['kw-dummy','center'], ['kw-dummy','left']]); const ev = []; const hq = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, ev);
  const kinds = ev.filter(x=> x.type==='hit' || x.type==='sweepWhiff').map(x=> x.type==='sweepWhiff' ? 'whiff-'+x.dir : (x.sweep ? 'side-'+x.sweepDir : 'centre'));
  ok(JSON.stringify(kinds) === JSON.stringify(['side-left','centre','whiff-right']), `Sweep goes left, centre, right; an empty side whiffs (${kinds})`);
  ok(P[2].hq.hp === hq, 'Sweep never sends an empty side to the castle'); }
{ const {e, P, A} = board('kw-sweep', []); const hq = P[2].hq.hp; const ev = []; e.debugAttack(P, so, A.uid, {}, ev); ok(P[2].hq.hp === hq - 5 && !ev.some(x=> x.type==='sweepWhiff'), 'Sweep with nothing in front just hits the castle'); }
// 2026-10-15 rework (user: "attack the nearest 2/3/4 enemies within 1/1/2 range"): Fork no longer sends an empty side to the castle.
{ const {e, P, A} = board('kw-fork', [['kw-dummy','center']]); const hq = P[2].hq.hp; const d = e.allBoardCards(P[2])[0], h0 = d.hp; e.debugAttack(P, so, A.uid, {}, []); ok(P[2].hq.hp === hq && d.hp < h0, `Fork with one unit in range: it hits that unit, never the castle (castle took ${hq - P[2].hq.hp})`); }
{ const {e, P, A} = board('kw-swipe', []); P[2].lumber = 3; P[1].lumber = 0; e.debugAttack(P, so, A.uid, {}, []); ok(P[2].lumber === 1 && P[1].lumber === 2, 'Swipe 2 steals 2 Lumber on a landed swing'); }
{ const {e, P, A} = board('kw-twin', []); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(hq - P[2].hq.hp === 4, `Twin Strike swings twice (${hq - P[2].hq.hp})`); }
{ const {e, P, A} = board('kw-defy', [['kw-dummy','center'], ['kw-dummy','left']]); const B = e.allBoardCards(P[2]).find(c=> c.slot===0); const hp = B.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hp - B.hp === 5, `Defiance (Beast) 2: +2 per enemy Beast (took ${hp - B.hp}, want 5)`); }
{ const e = E.makeSimEngine(defs, E.mulberry32(12), {battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'kw-swarm3', 'center', {}, []); e.debugSpawnCard(P, so, 1, 'kw-dummy', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kw-pack', 'right', {}, []);
  ok(e.swarmBonusOf(P, e.allBoardCards(P[1]).find(c=> c.defId==='kw-swarm3')) === 6, 'Swarm 3: +3 per ally sharing a type');
  // 2026-10-14 (user: "Pack not so much. Packs try to be adjacent to each other ..."): the old arrival bonus is gone; allies of its
  // type that have no Pack make no chain (the new rule is tested in keywords-2026-10-14c.js).
  const pk = e.allBoardCards(P[1]).find(c=> c.defId==='kw-pack'); ok(pk.maxHp === 10, `Pack 2 next to non-Pack allies: no chain, no bonus (${pk.maxHp})`); }
{ const e = E.makeSimEngine(defs, E.mulberry32(13), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'kw-conv', 'center', {}, []);
  ['center','left','left','left'].forEach(sd=> e.debugSpawnCard(P, so, 2, 'kw-dummy', sd, {}, []));
  const enemy = e.allBoardCards(P[2]); enemy.find(c=> c.slot===-1).hp = 0; const ev = []; e.resolveCombat(P, so, {}, ev, 1); // the gap at -1 is a dead unit, removed this round; Converge readies at the round's end
  const slots = e.allBoardCards(P[2]).filter(c=> c.hp>0).map(c=> c.slot).sort((a,b)=> a-b);
  ok(ev.some(x=> x.type==='converge') && JSON.stringify(slots) === JSON.stringify([-2,-1,0]), `Converge pulls the enemy board together (${slots})`); }
console.log(`keywords-2026-10-11: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
