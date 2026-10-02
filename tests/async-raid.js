#!/usr/bin/env node
// Multi-player (offline) tests: Async Arena ghost pools and offline Raid (2026-10-03).
//
//   node tests/async-raid.js
//
// Uses the same bramblewood-ghosts.js the game ships, with the real engine and card data.
// AUTO-SETUP: a synthetic population of players runs Async Arena runs headlessly and records
// their winning decks, exactly as real players would, so every win stage gets a real pool.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const G = require(path.join(H.ROOT, 'bramblewood-ghosts.js'));
const BOSSES = require(path.join(H.ROOT, 'canonical', 'raid-bosses.json'));
const defs = H.loadCardDefs();
const DAY = 24*3600*1000;
const NOW = Date.UTC(2026, 9, 3, 12);
const failures = [];
const check = (ok, msg)=>{ if(!ok) failures.push(msg); };
const STAGES = G.ASYNC.MAX_WINS;

function fight(deckA, deckB, seed){ const m = H.runMatch(deckA, deckB, {seed, maxRounds:120}); return m.winner; }

// ---- 1. Seeded pools: every stage has ≥ MIN active, all decks legal, stages get stronger ----
const powers = [];
for(let s=0; s<STAGES; s++){
  const pool = G.buildStagePool(defs, s, [], NOW);
  check(pool.active >= G.ASYNC.MIN_ACTIVE_PER_STAGE, `stage ${s}: only ${pool.active} active decks`);
  check(pool.active >= 10, `stage ${s}: fewer than 10 decks`);
  pool.decks.forEach(g=>{ const e = G.validateDeck(defs, g.deck); check(!e.length, `stage ${s} ghost ${g.id}: ${e[0]}`); });
  check(new Set(pool.decks.map(g=> g.owner)).size === pool.decks.length, `stage ${s}: duplicate ghost owners`);
  powers.push(pool.decks.reduce((t,g)=> t + G.deckPower(defs, g.deck), 0) / pool.decks.length);
}
for(let s=1; s<STAGES; s++) check(powers[s] > powers[s-1], `stage ${s} ghosts (power ${powers[s].toFixed(2)}) are not stronger than stage ${s-1} (${powers[s-1].toFixed(2)})`);

// Difficulty curve in real fights: top-stage ghosts must beat bottom-stage ghosts most of the time.
{
  const lo = G.buildStagePool(defs, 0, [], NOW).decks, hi = G.buildStagePool(defs, STAGES-1, [], NOW).decks;
  let hiWins = 0, n = 0;
  for(let i=0;i<lo.length;i++) for(let j=0;j<4;j++){ const w = fight(hi[(i+j)%hi.length].deck, lo[i].deck, 100+i*7+j); if(w) { n++; if(w===1) hiWins++; } }
  check(hiWins/n >= 0.65, `stage ${STAGES-1} ghosts beat stage 0 ghosts only ${(100*hiWins/n).toFixed(0)}% of the time (want ≥ 65%)`);
  console.log(`  difficulty: top-stage ghosts beat bottom-stage ghosts ${(100*hiWins/n).toFixed(0)}% (${n} fights)`);
}

// ---- 2. Recorded decks: active window, legality, newest-per-owner, top-up ----
{
  const good = G.buildStagePool(defs, 2, [], NOW).decks[0].deck;
  const rec = [];
  for(let i=0;i<15;i++) rec.push({owner:'p'+i, name:'P'+i, deck: good, stage:2, at: NOW - i*DAY/2});
  rec.push({owner:'stale', deck: good, stage:2, at: NOW - 30*DAY});
  rec.push({owner:'cheater', deck: {'yeti':20}, stage:2, at: NOW});
  rec.push({owner:'p0', deck: good, stage:2, at: NOW - 5*DAY}); // older duplicate of p0
  rec.push({owner:'other-stage', deck: good, stage:3, at: NOW});
  const pool = G.buildStagePool(defs, 2, rec, NOW);
  check(pool.real === 15 && pool.seeded === 0, `recorded pool: want 15 real / 0 seeded, got ${pool.real}/${pool.seeded}`);
  check(!pool.decks.some(g=> g.owner==='stale' || g.owner==='cheater' || g.owner==='other-stage'), 'stale, illegal or other-stage decks leaked into the pool');
  const thin = G.buildStagePool(defs, 2, rec.slice(0,3), NOW);
  check(thin.real === 3 && thin.active === G.ASYNC.MIN_ACTIVE_PER_STAGE, `thin pool not topped up: ${thin.real} real, ${thin.active} active`);
  const opp = G.pickOpponent(pool, 42, ['p0','p1','p2']);
  check(opp && !['p0','p1','p2'].includes(opp.owner), 'pickOpponent returned an already-faced owner');
}

// ---- 3. Population run: synthetic players play full Async runs and seed the pools ----
let recorded = [];
const runStats = {runs:0, perfect:0, wins:0, losses:0};
const PLAYERS = 40;
for(let p=0; p<PLAYERS; p++){
  const myDeck = G.generateGhostDeck(defs, p % STAGES, 7000+p);
  for(let runNo=0; runNo<2; runNo++){
    const run = G.newAsyncRun(NOW);
    let guard = 0;
    while(!G.asyncRunOver(run) && guard++ < 20){
      const stage = run.wins;
      const pool = G.buildStagePool(defs, stage, recorded.filter(g=> g.owner!=='player'+p), NOW);
      const opp = G.pickOpponent(pool, G.hashStr(`opp:${p}:${runNo}:${guard}`), run.faced);
      check(opp && !G.validateDeck(defs, opp.deck).length, `player ${p}: got an illegal or missing opponent at stage ${stage}`);
      if(run.faced.includes(opp.owner) && pool.decks.length > run.faced.length) failures.push(`player ${p}: met ${opp.owner} twice in one run`);
      run.faced.push(opp.owner);
      const w = fight(myDeck, opp.deck, G.hashStr(`f:${p}:${runNo}:${guard}`));
      if(w===1){ recorded = G.recordAsyncGhost(recorded, {owner:'player'+p, name:'Player '+p, deck: myDeck, stage, at: NOW - (p%10)*DAY}, 2000); run.wins++; runStats.wins++; }
      else { run.losses++; runStats.losses++; }
    }
    check(G.asyncRunOver(run), `player ${p}: run never ended (${run.wins}W ${run.losses}L)`);
    check(run.wins <= G.ASYNC.MAX_WINS && run.losses <= G.ASYNC.MAX_LOSSES, `player ${p}: run overshot (${run.wins}W ${run.losses}L)`);
    runStats.runs++; if(run.wins===G.ASYNC.MAX_WINS) runStats.perfect++;
  }
}
const coverage = [];
for(let s=0; s<STAGES; s++){
  const pool = G.buildStagePool(defs, s, recorded, NOW);
  coverage.push(`${s}:${pool.real}+${pool.seeded}`);
  check(pool.active >= 10, `after population run, stage ${s} has only ${pool.active} active decks`);
}
console.log(`  population: ${PLAYERS} players, ${runStats.runs} runs (${runStats.perfect} perfect), ${runStats.wins}W/${runStats.losses}L`);
console.log(`  stage pools (real+seeded): ${coverage.join('  ')}`);

// ---- 4. Raid: featured boss rotation, previous decks, shared pool ----
{
  const b1 = G.featuredRaidBoss(BOSSES, NOW), b2 = G.featuredRaidBoss(BOSSES, NOW + 7*DAY), b0 = G.featuredRaidBoss(BOSSES, NOW + DAY);
  check(b1 && b2 && b1.id !== b2.id, 'featured raid boss does not rotate weekly');
  check(b0.id === b1.id || G.raidCycle(NOW) !== G.raidCycle(NOW+DAY), 'featured boss changed within a week');
  BOSSES.forEach(boss=> Object.keys(boss.deck).forEach(id=> check(!!defs[id], `raid boss ${boss.id} uses unknown card ${id}`)));
  const boss = BOSSES[3];
  const s0 = G.raidState(H.Engine, defs, boss, [], NOW);
  const s0b = G.raidState(H.Engine, defs, boss, [], NOW);
  check(JSON.stringify(s0.party.map(x=>x.damage)) === JSON.stringify(s0b.party.map(x=>x.damage)), 'raid state is not deterministic');
  check(s0.party.length === G.RAID.MIN_RAIDERS || s0.defeated, `empty raid should load ${G.RAID.MIN_RAIDERS} seeded raiders, got ${s0.party.length}`);
  const dealt = s0.party.reduce((t,x)=> t + x.damage, 0);
  check(s0.remaining === Math.max(0, s0.max - dealt), `pool math: max ${s0.max} − dealt ${dealt} ≠ remaining ${s0.remaining}`);
  check(s0.remaining >= 0 && s0.nextCastleHp <= boss.hqHp, 'pool went negative or next castle above the boss HP');
  const cycle = G.raidCycle(NOW);
  const myDeck = G.generateGhostDeck(defs, 4, 99);
  const attempts = [
    {bossId: boss.id, cycle, owner:'me', name:'Me', deck: myDeck, damage: 40, won:false, at: NOW-1000},
    {bossId: boss.id, cycle: cycle-1, owner:'old', name:'Old', deck: myDeck, damage: 999, won:true, at: NOW-8*DAY},
    {bossId: 'other-boss', cycle, owner:'x', name:'X', deck: myDeck, damage: 999, won:true, at: NOW},
  ];
  const s1 = G.raidState(H.Engine, defs, boss, attempts, NOW);
  check(s1.party.some(x=> x.owner==='me') && !s1.party.some(x=> x.owner==='old' || x.owner==='x'), 'raid party should hold this week\'s decks for this boss only');
  check(s1.party.length === G.RAID.MIN_RAIDERS + 1, `stand-ins + 1 real raider should make ${G.RAID.MIN_RAIDERS+1}, got ${s1.party.length}`);
  check(s1.remaining === Math.max(0, s0.remaining - 40), `a real attempt must lower the pool by exactly its damage: ${s0.remaining} − 40 ≠ ${s1.remaining}`);
  // Monotonic: adding real attempts one by one never raises the remaining HP.
  let prev = s0.remaining; const acc = [];
  for(let i=0;i<12;i++){ acc.push({bossId: boss.id, cycle, owner:'r'+i, name:'R'+i, deck: myDeck, damage: 25+i*7, won:false, at: NOW-i*1000}); const st = G.raidState(H.Engine, defs, boss, acc, NOW); check(st.remaining <= prev, `pool went UP from ${prev} to ${st.remaining} after attempt ${i}`); prev = st.remaining; }
  // Stand-ins can never finish a boss on their own.
  BOSSES.forEach(bs=>{ const st = G.raidState(H.Engine, defs, bs, [], NOW); check(st.remaining >= st.max*(1-G.RAID.SEED_SHARE) - 1, `${bs.id}: stand-ins took more than ${G.RAID.SEED_SHARE*100}% of the pool`); });
  console.log(`  raid: ${boss.name} pool ${s0.max} → ${s0.remaining} after ${s0.party.length} seeded raiders; next castle ${s0.nextCastleHp} HP`);
}

console.log(`async-raid: ${failures.length} failure(s)`);
[...new Set(failures)].slice(0,25).forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
