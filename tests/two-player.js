#!/usr/bin/env node
// Two-player interaction tests, engine level (2026-10-03).
//
//   node tests/two-player.js
//
// Each seat is driven by its own scripted policy (not the shared engine AI), the way two humans
// would play: both plan, then one combat resolves both plans together — the same "both act,
// then resolve" order Pass & Play, Live Ranked and friend invites use. Checks:
//   • every policy pairing finishes, with invariants holding after every round;
//   • SEAT FAIRNESS — identical decks and policies, seats swapped: seat 1 and seat 2 must win
//     about equally often (a lopsided result means turn order or tie-breaks favour a seat);
//   • REPLAY — re-running a match from the recorded per-round actions on a fresh engine gives the
//     same end state (what Live Ranked relies on: the host replays the peer's intents);
//   • one play per turn and hand limit of 5 are respected by whatever the policies try.
'use strict';
const H = require('./lib/harness.js');
const defs = H.loadCardDefs();
const ids = H.fieldableIds(defs);
const failures = [];

const POLICIES = {
  // biggest body it can afford, alternating flanks
  greedy(pl, rnd){ const a = pl.hand.filter(h=> pl.__canPlay(h)); if(!a.length) return pl.hand.length ? {type:'discard', uid: pl.hand[0].uid} : {type:'skip'}; a.sort((x,y)=> (defs[y.defId].attack+defs[y.defId].health)-(defs[x.defId].attack+defs[x.defId].health)); return {type:'play', uid:a[0].uid, side: pl.__turn%2 ? 'left':'right'}; },
  // fastest card first (lowest Wait), always the left flank
  tempo(pl){ const a = pl.hand.filter(h=> pl.__canPlay(h)); if(!a.length) return pl.hand.length ? {type:'discard', uid: pl.hand[pl.hand.length-1].uid} : {type:'skip'}; a.sort((x,y)=> (defs[x.defId].wait||0)-(defs[y.defId].wait||0)); return {type:'play', uid:a[0].uid, side:'left'}; },
  // any legal action at random, including skipping
  random(pl, rnd){ const a = pl.hand.filter(h=> pl.__canPlay(h)); const r = rnd(); if(a.length && r<0.7) return {type:'play', uid:a[Math.floor(rnd()*a.length)].uid, side: rnd()<0.5?'left':'right'}; if(pl.hand.length && r<0.9) return {type:'discard', uid: pl.hand[Math.floor(rnd()*pl.hand.length)].uid}; return {type:'skip'}; },
  // tries to cheat: plays twice and discards twice in one turn (must be refused)
  greedyCheater(pl, rnd){ return Object.assign(POLICIES.greedy(pl, rnd), {cheat:true}); },
};

function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n<20){ const id = ids[Math.floor(r()*ids.length)]; if((d[id]||0)>=3) continue; d[id] = (d[id]||0)+1; n++; } return d; }

// Apply one seat's action with the same rules the app enforces (one play per turn, one discard
// per turn for +1 Lumber, hand limit handled by draw). Returns a log entry for replay.
function apply(engine, players, pid, act, stats, events){
  const pl = players[pid];
  if(act.type==='play'){
    const h = pl.hand.find(x=> x.uid===act.uid);
    if(!h || pl.playedThisTurn || !engine.canPlay(pl, h.defId, h.uid)) return {pid, type:'refused'};
    engine.placeCard(players, H.sideOf, pid, act.uid, act.side, stats, events);
    if(act.cheat){ const h2 = pl.hand.find(x=> engine.canPlay(pl, x.defId, x.uid)); if(h2){ const before = H.boardCards(pl).length; engine.placeCard(players, H.sideOf, pid, h2.uid, 'left', stats, events); if(H.boardCards(pl).length>before) failures.push('second play in one turn was accepted'); } }
    return {pid, type:'play', uid:act.uid, side:act.side};
  }
  if(act.type==='discard'){
    if(pl.discardUsedThisTurn) return {pid, type:'refused'};
    const i = pl.hand.findIndex(x=> x.uid===act.uid); if(i<0) return {pid, type:'refused'};
    const [dc] = pl.hand.splice(i,1); pl.graveyard.push({defId:dc.defId}); pl.lumber += 1; pl.discardUsedThisTurn = true;
    return {pid, type:'discard', uid:act.uid};
  }
  return {pid, type:'skip'};
}

function playMatch(deck1, deck2, pol1, pol2, seed, script){
  const rnd = H.seededRng(seed);
  const engine = H.Engine.makeSimEngine(defs, rnd, {recordEvents:true});
  const players = {1: engine.newPlayer(1, deck1), 2: engine.newPlayer(2, deck2)};
  const stats = {}, events = [], log = [];
  engine.draw(players[1], 3, 'A', stats, events); engine.draw(players[2], 3, 'B', stats, events);
  const polRnd = {1: H.seededRng(seed ^ 0x1111), 2: H.seededRng(seed ^ 0x2222)};
  let round = 1, over = false, step = 0;
  let lastSig = null, stalled = 0, drawn = false;
  for(; round<=H.Engine.DRAW_ROUND_CAP && !over && !drawn; round++){
    engine.setSuddenDeath(round >= H.Engine.SUDDEN_DEATH_ROUND);
    [1,2].forEach(pid=>{ const pl = players[pid]; pl.playedThisTurn = false; pl.discardUsedThisTurn = false; pl.__turn = round; pl.__canPlay = h=> engine.canPlay(pl, h.defId, h.uid); });
    [1,2].forEach(pid=>{
      const act = script ? script[step++] : POLICIES[pid===1?pol1:pol2](players[pid], polRnd[pid]);
      const entry = script ? apply(engine, players, pid, act, stats, events) : apply(engine, players, pid, act, stats, events);
      if(!script) log.push(Object.assign({}, act, {cheat:false}));
      if(entry.type==='refused' && !script && act.type==='play') { /* policy asked for something illegal: fine, it's refused */ }
    });
    over = engine.resolveCombat(players, H.sideOf, stats, events, round%2===0 ? 1 : 2);
    const inv = H.checkInvariants(players, `round ${round}`);
    [1,2].forEach(pid=>{ if(players[pid].hand.length>5) inv.push(`round ${round}: P${pid} hand has ${players[pid].hand.length} cards`); });
    if(inv.length){ failures.push(`${pol1} vs ${pol2} seed ${seed}: ${inv[0]}`); break; }
    if(!over){ const sig = H.Engine.boardSignature(players); stalled = (sig===lastSig && H.Engine.noActionsLeft(players)) ? stalled+1 : 0; lastSig = sig; if(stalled >= H.Engine.STALL_ROUNDS_FOR_DRAW){ drawn = true; break; } }
    if(!over){ engine.draw(players[1], 1, 'A', stats, events); engine.draw(players[2], 1, 'B', stats, events); }
  }
  const a = players[1].hq.hp<=0, b = players[2].hq.hp<=0;
  const winner = over ? (a&&b ? 0 : a ? 2 : 1) : 0; // not over = auto-draw (stalled board or round cap)
  return {winner, rounds: round-1, hp:[players[1].hq.hp, players[2].hq.hp], log};
}

// 1) Every policy pairing, 30 seeds each.
const names = Object.keys(POLICIES);
let matches = 0;
names.forEach(p1=> names.forEach(p2=>{ for(let s=0;s<30;s++){ playMatch(deckFrom(1000+s), deckFrom(2000+s), p1, p2, 7000+s); matches++; } }));

// 2) Seat fairness: mirrored decks and policies, many seeds.
const fair = {1:0, 2:0, 0:0};
const N = 400;
for(let s=0;s<N;s++){ const d = deckFrom(3000+s); fair[playMatch(d, d, 'greedy', 'greedy', 9000+s).winner]++; }
const share = fair[1] / Math.max(1, fair[1]+fair[2]);
if(share < 0.42 || share > 0.58) failures.push(`seat fairness: seat 1 won ${(share*100).toFixed(1)}% of decided mirror matches (want 42–58%)`);

// 3) Replay: re-run from the recorded actions on a fresh engine — must match exactly.
for(let s=0;s<40;s++){
  const d1 = deckFrom(4000+s), d2 = deckFrom(5000+s);
  const live = playMatch(d1, d2, 'random', 'greedy', 11000+s);
  const replay = playMatch(d1, d2, 'random', 'greedy', 11000+s, live.log);
  if(JSON.stringify([live.winner, live.rounds, live.hp]) !== JSON.stringify([replay.winner, replay.rounds, replay.hp])) failures.push(`replay mismatch seed ${11000+s}: live ${JSON.stringify(live.hp)} vs replay ${JSON.stringify(replay.hp)}`);
}

console.log(`two-player: ${matches} policy matches, ${N} mirror matches, 40 replays`);
console.log(`  seat fairness: seat 1 ${fair[1]} · seat 2 ${fair[2]} · draws ${fair[0]} (seat 1 share ${(share*100).toFixed(1)}%)`);
console.log(`  failures: ${failures.length}`);
[...new Set(failures)].slice(0,20).forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
