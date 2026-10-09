#!/usr/bin/env node
// Devilry (2026-10-10): Dark Summon, Devour (with a granted skill), Ritual, Pitchfork, Sacrifice N, Beware N (cast from
// exile), Mind Control, Player Stun; perished units give Darkness.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'td-imp':   {id:'td-imp', name:'Imp', attack:1, health:3, wait:0, cost:0, darkSummon:true, effects:{sacrifice:2}},
  'td-big':   {id:'td-big', name:'Big Devil', attack:5, health:9, wait:0, cost:0, devilryCost:2, darkSummon:true, effects:{}},
  'td-plain': {id:'td-plain', name:'Plain', attack:1, health:5, wait:0, cost:0, effects:{}},
  'td-glut':  {id:'td-glut', name:'Glutton', attack:2, health:8, wait:0, cost:0, effects:{devour:{attack:3, health:3, grant:{arrow:2}}}},
  'td-six':   {id:'td-six', name:'Sixfold', attack:6, health:16, wait:0, cost:0, effects:{ritual:{perished:1, drawn:2, castleDamage:0}}},
  'td-fork':  {id:'td-fork', name:'Fork', attack:2, health:50, wait:0, cost:0, effects:{pitchfork:true}},
  'td-wall':  {id:'td-wall', name:'Wall', attack:0, health:100, wait:0, cost:0, effects:{}},
  'td-dread': {id:'td-dread', name:'Dread', attack:3, health:5, wait:0, cost:0, effects:{beware:3}},
  'td-pup':   {id:'td-pup', name:'Puppeteer', attack:0, health:5, wait:0, cost:0, effects:{triggers:[{on:'onSpawn', do:'mindControl', sub:'random'}]}},
  'td-bell':  {id:'td-bell', name:'Bell', attack:0, health:5, wait:0, cost:0, effects:{triggers:[{on:'onSpawn', do:'stunPlayer', count:1}]}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
const give = (P, pid, id)=>{ const h = {uid: 90000 + Math.floor(Math.random()*9999), defId:id}; P[pid].hand.push(h); return h; };
// 1) Dark Summon is its own allowance: a normal play and a dark summon in the same turn, but not two dark summons
{ const {e, P} = mk(); const a = give(P, 1, 'td-plain'), b = give(P, 1, 'td-imp'), c = give(P, 1, 'td-imp');
  ok(e.placeCard(P, so, 1, a.uid, 'left', {}, []), 'normal play');
  ok(e.placeCard(P, so, 1, b.uid, 'right', {}, []), 'dark summon after the normal play');
  ok(!e.placeCard(P, so, 1, c.uid, 'right', {}, []), 'a second dark summon is refused');
  e.resolveCombat(P, so, {}, [], 1); P[1].playedThisTurn = false;
  ok(e.placeCard(P, so, 1, c.uid, 'right', {}, []), 'the allowance resets next turn'); }
// 2) Sacrifice 2: Big Devil (2 Darkness) onto the Imp costs nothing; the Imp dies (+1 Darkness)
{ const {e, P} = mk(); const imp = give(P, 1, 'td-imp'); e.placeCard(P, so, 1, imp.uid, 'left', {}, []); e.resolveCombat(P, so, {}, [], 1);
  const fod = all(P[1])[0]; const big = give(P, 1, 'td-big'); P[1].devilry = 0;
  ok(!e.canPlay(P[1], 'td-big', big.uid), 'without Darkness the Big Devil is unaffordable');
  ok(e.sacrificeSummon(P, so, 1, big.uid, fod.uid, {}, []), 'sacrifice-summon works');
  ok(all(P[1]).length === 1 && all(P[1])[0].defId === 'td-big', 'the Imp is gone and the Big Devil stands in its place');
  ok(P[1].devilry === 1, `the sacrificed Imp gave 1 Darkness and nothing was spent (devilry ${P[1].devilry})`); }
// 3) Devour: +3/+3 and Arrow 2 (a derived card), uses the turn's play
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'td-glut', 'left', {}, []); const g = all(P[1])[0]; const food = give(P, 1, 'td-plain');
  ok(e.devour(P, so, 1, g.uid, food.uid, {}, []), 'devour works');
  ok(g.atk === 5 && g.maxHp === 11, `+3/+3 (now ${g.atk}/${g.maxHp})`);
  ok(defs[g.defId] && defs[g.defId].effects.arrow === 2 && e.derivedDefs[g.defId], `granted Arrow 2 through a derived card (${g.defId})`);
  ok(P[1].playedThisTurn && P[1].graveyard.some(x=> x.defId==='td-plain'), 'the eaten card is in the graveyard and the play is used'); }
// 4) Ritual: can't act until 1 unit perished and 2 cards drawn
{ const {e, P} = mk(); P[1].deck = ['td-plain','td-plain','td-plain'];
  e.debugSpawnCard(P, so, 1, 'td-six', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'td-wall', 'left', {}, []);
  const w = all(P[2])[0]; let h0 = w.hp; e.resolveCombat(P, so, {}, [], 1); ok(w.hp === h0, 'Ritual unmet: no attack');
  e.draw(P[1], 2, 'A', {}, []); e.debugSpawnCard(P, so, 2, 'td-plain', 'right', {}, []); const v = all(P[2]).find(c=> c.defId==='td-plain'); v.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  h0 = w.hp; e.resolveCombat(P, so, {}, [], 1); ok(w.hp < h0, `Ritual met: it attacks (wall ${h0}→${w.hp})`); }
// 5) Pitchfork: hits one of the three facing units and the units beside it
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'td-fork', 'left', {}, []);
  ['left','right','left'].forEach(s=> e.debugSpawnCard(P, so, 2, 'td-wall', s, {}, []));
  const before = all(P[2]).map(c=> c.hp); e.resolveCombat(P, so, {}, [], 1); const hit = all(P[2]).filter((c, i)=> c.hp < before[i]).length;
  ok(hit >= 2, `Pitchfork hits the target and at least one neighbour (hit ${hit}); castle ${P[2].hq.hp}/${P[2].hq.maxHp}`);
  ok(P[2].hq.hp === P[2].hq.maxHp, 'Pitchfork never hits the castle when units face it'); }
// 6) Beware 3: castable from exile only at 3+ Darkness
{ const {e, P} = mk(); P[1].exile.push({defId:'td-dread'}); P[1].devilry = 2;
  ok(!e.canCastFromExile(P[1], 'td-dread'), 'not at 2 Darkness'); P[1].devilry = 3;
  ok(e.castFromExile(P, so, 1, 0, 'left', {}, []), 'cast at 3 Darkness'); ok(all(P[1]).some(c=> c.defId==='td-dread') && !P[1].exile.length, 'it left the exile for the board'); }
// 7) Mind Control: an enemy unit changes sides
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'td-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'td-pup', 'left', {}, []);
  ok(!all(P[2]).length && all(P[1]).some(c=> c.defId==='td-wall'), 'the wall now fights for player 1'); }
// 8) Player Stun: the enemy can't play next turn; then can
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'td-bell', 'left', {}, []); const h = give(P, 2, 'td-plain');
  ok(!e.canPlay(P[2], 'td-plain', h.uid), 'stunned player cannot play this turn');
  e.resolveCombat(P, so, {}, [], 1); ok(e.canPlay(P[2], 'td-plain', h.uid), 'after combat the stun has run its course'); }
console.log(`devilry: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
