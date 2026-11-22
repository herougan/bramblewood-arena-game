#!/usr/bin/env node
// MP1 phase 1 (2026-11-23, owner 2026-11-22 23:08: "multiplayer features balancing"): PvP seat fairness, faction pairs and leader worth,
// headless, both seats the CPU (skill 1), every card at Level 1 (Standard). The game is tools/pvp1/lib.js's (its game(), decks, leaders,
// validateDeck); only the seat set-up varies, because the modes differ (arena_app.js):
//   pvp     Standard / Collection PvP vs a stranger: the stranger (seat 2) strikes first EVERY round (resolveRound: m.mode==='pvp' ? 2) and
//           you (seat 1) get the +1 Shield (startArenaMatch: "the PvP stranger always plays first, so you're second there"); leaders dealt.
//   live    Ranked 1v1 (Live): the first striker alternates by round (round 1: seat 2), no second-seat bonus, no leaders (leaderDefId null).
//   lib     tools/pvp1/lib.js's own set-up (the PvP test decks were tuned on it): alternating strikes, the +1 Shield to seat 2, leaders.
//   none    alternating strikes, no bonus, leaders: the baseline that isolates the Shield.
//   alt1 / live1 / liveAlt  candidates (below).
// Seat 1 always acts first in the round (aiTakeTurn 1 then 2), as the page's player does before the CPU answers.
//   node tools/mp1_pvp.js mirror [--n 40] [--cfg pvp,live,lib,none]     each of the 30 PvP test decks against itself: seat 1's score
//   node tools/mp1_pvp.js faction [--n 100] [--cfg pvp]                 Rivergate Otters vs Sunfeather Tribes faction decks (early / full)
//   node tools/mp1_pvp.js leader [--n 12]                               each test deck with its leader vs the same deck without (seats swapped)
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./pvp1/lib.js');
const ROOT = L.ROOT, arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const TEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/pvp-test-decks.json'), 'utf8')).decks;
const CFG = {pvp: {strike: ()=> 2, bonus: 1, leaders: true}, live: {strike: r=> r % 2 === 0 ? 1 : 2, bonus: 0, leaders: false, rules: {}},
  lib: {strike: r=> r % 2 === 0 ? 1 : 2, bonus: 2, leaders: true}, none: {strike: r=> r % 2 === 0 ? 1 : 2, bonus: 0, leaders: true},
  // candidates: PvP with the strikes alternating and the +1 Shield kept on you (seat 1); Live Ranked with the +1 Shield on seat 1 (D24's
  // "second player" = the side that does not strike first in round 1)
  alt1: {strike: r=> r % 2 === 0 ? 1 : 2, bonus: 1, leaders: true}, live1: {strike: r=> r % 2 === 0 ? 1 : 2, bonus: 1, leaders: false, rules: {}},
  // Live Ranked with the turn order alternating too: the seat that strikes first in a round also acts first in it (seat 2 in odd rounds)
  liveAlt: {strike: r=> r % 2 === 0 ? 1 : 2, order: r=> r % 2 === 0 ? [1, 2] : [2, 1], bonus: 0, leaders: false, rules: {}}};
let CASTLE = null;
// one game: seat 1 = s1, seat 2 = s2; returns seat 1's score (1 / 0.5 / 0)
function play(s1, s2, cfg, seedKey, g){
  const gm = L.game(), E = gm.E, G = gm.G, D = L.defs(), O = L.O;
  if(!CASTLE) CASTLE = new Function(['BRAMBLE_SCALE', 'brambleHp', 'brambleChar'].map(n=> gm.B.grab(n)).join('\n') + '\nreturn brambleChar;')()(gm.B.CHARACTER_DEFS.castle);
  const engine = E.makeSimEngine(D, gm.seededRng((L.fnv(seedKey) + Math.imul(g + 1, 2654435761)) >>> 0), {recordEvents: false, battleMode: G.CONQUEST_DEFAULT_MODE || 'open', rules: cfg.rules || {phase: 'cycle'}, aiAim: true, aiLevel: 1});
  const sideOf = id=> id === 1 ? 'A' : 'B', st = {};
  const P = {1: engine.newPlayer(1, O.mineFor(gm, D, s1.deck, L.LEVEL), CASTLE), 2: engine.newPlayer(2, O.mineFor(gm, D, s2.deck, L.LEVEL), CASTLE)};
  P[1].loopCards = []; P[2].loopCards = [];
  if(cfg.leaders){ if(s1.leader) G.dealPlayerLeader(P[1], s1.leader, D); if(s2.leader) G.dealPlayerLeader(P[2], s2.leader, D); }
  engine.draw(P[1], 3, 'A', st, null); engine.draw(P[2], 3, 'B', st, null);
  if(cfg.bonus) engine.applySecondPlayerBonus(P[cfg.bonus], cfg.bonus === 1 ? 'A' : 'B', st, null);
  let over = false, lastSig = null, stalled = 0, r = 1;
  for(; r <= E.DRAW_ROUND_CAP && !over; r++){
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, sideOf, st, null);
    (cfg.order ? cfg.order(r) : [1, 2]).forEach(p=> engine.aiTakeTurn(P, sideOf, p, st, null));
    over = engine.resolveCombat(P, sideOf, st, null, cfg.strike(r)); if(over) break;
    const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if(stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', st, null); engine.draw(P[2], 1, 'B', st, null);
  }
  const d1 = P[1].hq.hp <= 0, d2 = P[2].hq.hp <= 0; ROUNDS.push(r);
  return d1 && !d2 ? 0 : d2 && !d1 ? 1 : 0.5;
}
const ROUNDS = [];
const ci = (p, n)=> Math.round(392 * Math.sqrt(Math.max(p * (1 - p), 0.0001) / n)) / 2; // +- half-width in points (95%), to the half point
const deckOf = d=> ({deck: d.cards, leader: d.leader, name: d.name});

function mirror(){
  const n = Number(arg('n', 40)), cfgs = String(arg('cfg', 'pvp,live,lib,none')).split(','), out = {};
  for(const c of cfgs){
    let tot = 0, games = 0; const per = []; ROUNDS.length = 0;
    TEST.forEach(d=>{ const a = deckOf(d); let s = 0; for(let g = 0; g < n; g++) s += play(a, a, CFG[c], 'mp1-mirror-' + d.id, g); per.push({id: d.id, leader: d.leader, seat1: Math.round(s / n * 100)}); tot += s; games += n; });
    const p = tot / games, sorted = per.map(x=> x.seat1).sort((a, b)=> a - b);
    out[c] = {games, seat1Pct: Math.round(p * 1000) / 10, ci95: ci(p, games), deckMin: sorted[0], deckMedian: sorted[Math.floor(sorted.length / 2)], deckMax: sorted[sorted.length - 1], avgRounds: +(ROUNDS.reduce((a, b)=> a + b, 0) / ROUNDS.length).toFixed(1), per};
    console.log(`${c.padEnd(5)} seat 1 scores ${out[c].seat1Pct}% +-${out[c].ci95} over ${games} mirror games (per deck: min ${out[c].deckMin}, median ${out[c].deckMedian}, max ${out[c].deckMax}); ${out[c].avgRounds} rounds`);
  }
  return out;
}
// the faction decks: each faction's own cards (Factions pool, tier 11: Otters without a side, the Tribes side 'tribes'), the strongest by
// the ghosts' cardPower, up to 3 copies within the rarity caps; "early" keeps Commons / Starters / Uncommons and no leader, "full" every
// rarity with the faction's Heroic as leader (Rivergate Tribune / Sunspire Sky-Sovereign). Checked by validateDeck.
function factionDeck(side, full){
  const D = L.defs(), Gh = L.Ghosts, cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
  const leader = full ? (side === 'otters' ? 'rivergate-tribune' : 'sunspire-sky-sovereign') : null;
  const ids = cards.filter(c=> c.source && c.source.tier === 11 && (side === 'tribes' ? c.source.side === 'tribes' : !c.source.side) && D[c.id] && c.id !== leader
    && (full || ['common', 'starter', 'uncommon'].includes(c.rarity))).map(c=> c.id).sort((a, b)=> Gh.cardPower(D[b]) - Gh.cardPower(D[a]) || (a < b ? -1 : 1));
  const deck = {}; let total = 0;
  for(const id of ids){ while(total < 20 && (deck[id] || 0) < Math.min(3, Gh.capOf(D[id])) && !Gh.rankBlocks(D, Object.assign({}, deck, leader ? {[leader]: 1} : {}), id)){ deck[id] = (deck[id] || 0) + 1; total++; } if(total >= 20) break; }
  const errs = L.validate(deck, leader); if(errs.length) throw new Error(side + (full ? ' full: ' : ' early: ') + errs.join('; '));
  return {deck, leader, name: side + (full ? '-full' : '-early')};
}
function faction(){
  const n = Number(arg('n', 100)), c = arg('cfg', 'pvp'), out = {decks: {}, pairs: []};
  for(const full of [false, true]){
    const o = factionDeck('otters', full), t = factionDeck('tribes', full); out.decks[o.name] = o; out.decks[t.name] = t;
    for(const [a, b] of [[o, t], [t, o], [o, o], [t, t]]){
      let s = 0; for(let g = 0; g < n; g++) s += play(a, b, CFG[c], 'mp1-fac-' + a.name + b.name, g);
      const p = s / n; out.pairs.push({seat1: a.name, seat2: b.name, cfg: c, n, seat1Pct: Math.round(p * 100), ci95: ci(p, n)});
      console.log(`${c}: ${a.name} (seat 1) vs ${b.name} (seat 2): seat 1 ${Math.round(p * 100)}% +-${ci(p, n)} (${n} games)`);
    }
  }
  return out;
}
function leader(){
  const n = Number(arg('n', 12)), out = [];
  TEST.forEach(d=>{ const a = deckOf(d), b = Object.assign({}, a, {leader: null}); let s = 0;
    for(let g = 0; g < n; g++) s += g % 2 === 0 ? play(a, b, CFG.none, 'mp1-lead-' + d.id, g) : 1 - play(b, a, CFG.none, 'mp1-lead-' + d.id, g);
    out.push({id: d.id, leader: d.leader, withLeaderPct: Math.round(s / n * 100)}); });
  const by = {}; out.forEach(x=>{ (by[x.leader] = by[x.leader] || []).push(x.withLeaderPct); });
  Object.keys(by).forEach(k=> console.log(`${k.padEnd(26)} ${by[k].length} decks: with the leader vs without ${Math.round(by[k].reduce((a, b)=> a + b, 0) / by[k].length)}% (${by[k].join(' ')})`));
  return out;
}
const cmd = process.argv[2] || 'mirror', res = {mirror, faction, leader}[cmd]();
const j = arg('json', null); if(j) fs.writeFileSync(path.resolve(j), JSON.stringify({tool: 'tools/mp1_pvp.js ' + cmd, date: '2026-11-23', res}, null, 1));
