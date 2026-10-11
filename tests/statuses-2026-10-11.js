#!/usr/bin/env node
// 2026-10-11: Blind misses about half the time; Tipsy drifts left/ahead/right (and misses on an empty column); Confused
// fizzles triggers about half the time; Drunk / Purblind / Scatterbrained keep their status on for good.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'ts-a': {id:'ts-a', name:'A', attack:2, health:500, wait:0, cost:0, effects:{}},
  'ts-wall': {id:'ts-wall', name:'W', attack:0, health:5000, wait:0, cost:0, effects:{}},
  'ts-drunk': {id:'ts-drunk', name:'D', attack:2, health:500, wait:0, cost:0, effects:{drunk:true}},
  'ts-pb': {id:'ts-pb', name:'P', attack:2, health:500, wait:0, cost:0, effects:{purblind:true}},
  'ts-sb': {id:'ts-sb', name:'S', attack:1, health:500, wait:0, cost:0, effects:{scatterbrained:true, triggers:[{on:'onAttacked', do:'buff', who:'self', amount:1}]}},
});
function trial(seed, setup){ const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; return setup(e, P); }
// Blind: about half of 200 swings miss
{ let miss = 0; for(let k=0;k<200;k++) trial(100+k, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'ts-a', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ts-wall', 'left', {}, []); const a = e.allBoardCards(P[1])[0]; a.blind = 3; const ev = []; e.debugAttack(P, so, a.uid, {}, ev); if(ev.some(x=> x.type==='blindMiss')) miss++; });
  ok(miss > 70 && miss < 130, `Blind misses about half the time (${miss}/200)`); }
// Drunk: is Tipsy on arrival; Purblind: Blind; Scatterbrained: Confused
trial(7, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'ts-drunk', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'ts-pb', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'ts-sb', 'right', {}, []);
  const [d, p, s] = ['ts-drunk','ts-pb','ts-sb'].map(id=> e.allBoardCards(P[1]).find(c=> c.defId===id));
  ok(d.tipsy > 0, 'Drunk arrives Tipsy'); ok(p.blind > 0, 'Purblind arrives Blind'); ok(s.confused > 0, 'Scatterbrained arrives Confused'); });
// Tipsy: over many swings some drift events happen, and drifting onto an empty column misses
{ let drift = 0, miss = 0; for(let k=0;k<120;k++) trial(300+k, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'ts-drunk', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ts-wall', 'left', {}, []); const a = e.allBoardCards(P[1])[0]; const ev = []; e.debugAttack(P, so, a.uid, {}, ev); const t = ev.find(x=> x.type==='tipsySwing'); if(t){ drift++; if(t.miss) miss++; } });
  ok(drift > 50 && drift < 110, `Tipsy drifts about two times in three (${drift}/120)`); ok(miss > 0, 'a drift onto an empty column misses'); }
// Confused: its own triggers fizzle about half the time
{ let fired = 0; for(let k=0;k<200;k++) trial(600+k, (e, P)=>{ e.debugSpawnCard(P, so, 1, 'ts-sb', 'left', {}, []); const c = e.allBoardCards(P[1])[0]; e.debugFireTrigger(P, so, c.uid, 'onAttacked', {}, []); if(c.atk > 1) fired++; });
  ok(fired > 70 && fired < 130, `Confused triggers fire about half the time (${fired}/200)`); }
// Day/night is off unless a fight asks for it (2026-10-11): no phase by default, a phase with rules.phase.
{ const st = {}; const e0 = E.makeSimEngine(defs, E.mulberry32(1), {battleMode:'open'}); const P = {1:e0.newPlayer(1,{}), 2:e0.newPlayer(2,{})};
  for(let r=2; r<=8; r++) e0.roundStart(P, r, so, st, []); ok(e0.getPhase() === null, 'no day or night by default');
  const e1 = E.makeSimEngine(defs, E.mulberry32(1), {battleMode:'open', rules:{phase:'cycle', phaseLen:2}}); const Q = {1:e1.newPlayer(1,{}), 2:e1.newPlayer(2,{})}; const seen = new Set();
  for(let r=2; r<=8; r++){ e1.roundStart(Q, r, so, st, []); seen.add(e1.getPhase()); } ok(seen.has('day') && seen.has('night'), 'a cycle rule turns day and night on'); }
console.log(`statuses-2026-10-11: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
