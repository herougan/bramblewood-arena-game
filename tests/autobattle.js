#!/usr/bin/env node
// Autobattler draft-run tests (2026-10-03). Same module the game ships (bramblewood-autobattle.js),
// real engine, real cards. Auto-setup: synthetic players draft and play whole runs headlessly.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const A = require(path.join(H.ROOT, 'bramblewood-autobattle.js'));
const defs = H.loadCardDefs();
const characters = {}; require(path.join(H.ROOT, 'canonical', 'characters.json')).forEach(c=> characters[c.id] = c);
const NOW = Date.UTC(2026, 9, 3, 12);
const failures = [];
const check = (ok, msg)=>{ if(!ok) failures.push(msg); };
const defsBefore = JSON.stringify(defs);

function autoDraft(run, greedy){
  while(run.phase==='draft'){
    const off = A.draftOffers(defs, characters, run);
    check(off.options.length===3 || off.kind==='castle', `draft step ${run.step} offered ${off.options.length} options`);
    const choice = greedy && off.kind!=='castle' ? off.options.slice().sort((a,b)=> A.power(defs[b])-A.power(defs[a]))[0] : off.options[0];
    A.applyDraftPick(run, choice);
  }
  return run;
}

// 1. Draft shape + determinism
{
  const r1 = autoDraft(A.newRun(123, NOW)), r2 = autoDraft(A.newRun(123, NOW));
  check(JSON.stringify(r1)===JSON.stringify(r2), 'same seed gave a different draft');
  check(characters[r1.castle], 'no castle drafted');
  check(defs[r1.leader] && defs[r1.subLeader] && r1.leader!==r1.subLeader, 'leaders missing or identical');
  const n = Object.values(r1.deck).reduce((a,b)=>a+b,0);
  check(n === A.AB.PICKS*A.AB.COPIES_PER_PICK, `drafted deck has ${n} cards`);
  check(r1.phase==='prep' && r1.hp===5, 'run should start prep with 5 health');
}

// 2. Health rules: 1 per loss in the first 3 fights, 2 after
{
  const lose = {winner:2, rounds:5};
  const run = autoDraft(A.newRun(7, NOW));
  const hp = [];
  for(let i=0;i<5 && !run.over;i++){ A.afterFight(run, lose, 'x'); hp.push(run.hp); if(run.phase==='boon') run.phase = 'prep'; }
  check(JSON.stringify(hp)===JSON.stringify([4,3,2,0]), `losses should take health 5→4→3→2→0, got ${JSON.stringify(hp)}`);
  check(run.over && run.overReason==='out-of-health', 'run should end at 0 health');
  const r2 = autoDraft(A.newRun(8, NOW));
  for(let i=0;i<10;i++){ A.afterFight(r2, {winner:1, rounds:3}); if(r2.phase==='boon') r2.phase='prep'; }
  check(r2.phase==='goal' && r2.wins===10, `10 wins should reach the goal screen (phase ${r2.phase})`);
  A.goEndless(r2);
  check(r2.endless && r2.phase==='boon', 'Endless should continue the run');
  r2.hp = 1e9; let guard = 0;
  while(!r2.over && guard++<200){ A.afterFight(r2, {winner: guard%2?1:2, rounds:3}); if(r2.phase==='boon') r2.phase='prep'; }
  check(r2.over && r2.overReason==='hard-stop' && r2.fights===A.AB.HARD_STOP, `endless should hard-stop at fight ${A.AB.HARD_STOP} (stopped at ${r2.fights}, ${r2.overReason})`);
}

// 3. Boons: dup / buff / passive land on a run-specific copy; real cards untouched
{
  const run = autoDraft(A.newRun(99, NOW));
  const offs = A.boonOffers(defs, run);
  check(offs.length===3 && new Set(offs.map(o=>o.type)).size===3, 'boon offers should be three different kinds');
  const dup = offs.find(o=> o.type==='dup'), before = run.deck[dup.card];
  A.applyBoon(run, dup); check(run.deck[dup.card]===before+1, 'duplicate boon did not add a copy');
  const target = Object.keys(run.deck)[0];
  A.applyBoon(run, {type:'buff', card:target, atk:1, hp:1});
  A.applyBoon(run, {type:'passive', card:target, key:'armor', value:2});
  const side = A.sideDefs(defs, 'a', run.patches);
  const d = side.extra[side.idFor(target)];
  check(d && d.attack===defs[target].attack+1 && d.health===defs[target].health+1 && d.effects.armor===2, 'buff/passive not applied to the derived card');
  check(!(defs[target].effects||{}).armor || defs[target].effects.armor===JSON.parse(defsBefore)[target].effects.armor, 'real card was mutated by a boon');
}

// 4. Fights: deterministic, leaders on board, sub-leader joins on round 4, buffs matter
{
  const me = autoDraft(A.newRun(1, NOW), true), opp = autoDraft(A.newRun(2, NOW));
  const f1 = A.simulateFight(H.Engine, defs, characters, me, opp, 42), f2 = A.simulateFight(H.Engine, defs, characters, me, opp, 42);
  check(f1.winner===f2.winner && f1.rounds===f2.rounds && f1.hp.join()===f2.hp.join(), 'fight is not deterministic');
  const plays = f1.events.filter(e=> e.type==='play');
  check(plays.some(e=> A.baseId(e.defId)===me.leader && e.side==='A'), 'main leader never entered the fight');
  if(f1.rounds >= A.AB.SUB_LEADER_ROUND){
    let round = 0, subRound = null;
    f1.events.forEach(e=>{ if(e.type==='roundStart') round = e.round; if(e.type==='play' && e.side==='A' && A.baseId(e.defId)===me.subLeader && subRound===null) subRound = round; });
    check(subRound===A.AB.SUB_LEADER_ROUND - 1 || subRound===A.AB.SUB_LEADER_ROUND, `sub-leader joined on round ${subRound}, expected ${A.AB.SUB_LEADER_ROUND}`);
  }
  // A heavily boosted deck should beat the same deck unboosted most of the time.
  const strong = JSON.parse(JSON.stringify(me));
  Object.keys(strong.deck).concat([strong.leader, strong.subLeader]).forEach(id=> strong.patches[id] = {atk:3, hp:6, add:{}});
  let wins = 0, n = 0;
  for(let s=0;s<40;s++){ const f = A.simulateFight(H.Engine, defs, characters, strong, me, 1000+s); if(f.winner){ n++; if(f.winner===1) wins++; } }
  check(wins/n >= 0.75, `+3/+6 on every card won only ${(100*wins/n).toFixed(0)}% vs the same deck`);
}

// 5. Ghost pools: every stage (incl. Endless) has ≥ 12 valid opponents, getting stronger
{
  const winRate = [];
  for(let s=0; s<=14; s++){
    const p = A.opponentPool(defs, characters, s, [], NOW);
    check(p.decks.length >= A.AB.MIN_ACTIVE_PER_STAGE, `stage ${s}: ${p.decks.length} opponents`);
    p.decks.forEach(g=> check(A.validSnapshot(defs, characters, g), `stage ${s}: invalid ghost ${g.owner}`));
  }
  const lo = A.opponentPool(defs, characters, 0, [], NOW).decks, hi = A.opponentPool(defs, characters, 12, [], NOW).decks;
  let w = 0, n = 0;
  for(let i=0;i<lo.length;i++) for(let j=0;j<3;j++){ const f = A.simulateFight(H.Engine, defs, characters, hi[(i+j)%hi.length], lo[i], 500+i*3+j); if(f.winner){ n++; if(f.winner===1) w++; } }
  check(w/n >= 0.65, `stage-12 ghosts beat stage-0 ghosts only ${(100*w/n).toFixed(0)}%`);
  console.log(`  ghosts: stage-12 beat stage-0 ${(100*w/n).toFixed(0)}% (${n} fights)`);
}

// 6. Population: synthetic players play whole runs; their snapshots fill the stage pools
{
  let recorded = [], fights = 0, t0 = Date.now(), perfect = 0, endedEarly = 0;
  const RUNS = 30;
  for(let p=0; p<RUNS; p++){
    const run = autoDraft(A.newRun(9000+p, NOW), p%2===0);
    const faced = [];
    let guard = 0;
    while(!run.over && guard++ < 120){
      if(run.phase==='goal'){ if(p%3===0) A.goEndless(run); else { A.cashOut(run); break; } }
      if(run.phase==='boon'){ const o = A.boonOffers(defs, run); A.applyBoon(run, o[p % 3]); run.phase = 'prep'; }
      if(run.phase!=='prep') continue;
      if(A.canSwapSubLeader(run) && run.fights%4===3){ const opts = A.subLeaderOffers(defs, run); A.swapSubLeader(run, opts[0]); }
      const poolObj = A.opponentPool(defs, characters, run.wins, recorded.filter(g=> g.owner!=='p'+p), NOW);
      const opp = A.pickOpponent(poolObj, A.hashStr(`ab:${p}:${run.fights}`), faced);
      faced.push(opp.owner);
      recorded = A.recordGhost(recorded, A.snapshotOf(run, 'p'+p, 'P'+p, null, NOW));
      const f = A.simulateFight(H.Engine, defs, characters, run, opp, A.hashStr(`abf:${p}:${run.fights}`)); fights++;
      A.afterFight(run, f, opp.name);
    }
    check(run.over, `player ${p}: run never ended (phase ${run.phase}, ${run.wins}W ${run.losses}L)`);
    if(run.wins >= A.AB.WIN_GOAL) perfect++; else endedEarly++;
    const rw = A.runRewards(run); check(rw.gold >= 0 && Number.isFinite(rw.gold), 'bad rewards');
  }
  const secs = (Date.now()-t0)/1000;
  const cover = []; for(let s=0;s<=10;s++){ const pl = A.opponentPool(defs, characters, s, recorded, NOW); cover.push(`${s}:${pl.real}+${pl.seeded}`); }
  console.log(`  population: ${RUNS} runs, ${fights} fights in ${secs.toFixed(1)}s (${(fights/secs).toFixed(0)}/s) — reached 10 wins: ${perfect}, out early: ${endedEarly}`);
  console.log(`  stage pools (real+seeded): ${cover.join('  ')}`);
  check(fights/secs > 20, `fights are too slow (${(fights/secs).toFixed(1)}/s)`);
}

check(JSON.stringify(defs)===defsBefore, 'real card definitions were mutated during the run');
console.log(`autobattle: ${failures.length} failure(s)`);
[...new Set(failures)].slice(0,25).forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
