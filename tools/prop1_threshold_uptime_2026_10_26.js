#!/usr/bin/env node
// PROP1 (2026-10-26, owner 10-25 23:58: "Propose new skill(s) that depends on threshold of dead units or number of units on field. E.g. Default
// is +2/+2."): how often each threshold holds, for pricing the threshold skills by the 4-round rule x uptime (the EN6 state-uptime approach,
// tools/en6_state_uptime_2026_10_24.js part 1). Seeded CPU-vs-CPU fights between decks of 20 random live band cards (brambles 35), counted over
// every unit-round on side 1's board at the moment combat starts: units that died this fight so far (both sides / side 1's / side 2's; a death
// is a unit seen on a board earlier that is no longer alive there), side 1's live units, side 2's, and the field's total. Also each unit's life
// in rounds (to check the 4-round rule's "typical life"). Proposal measurement only: no game code reads this.
//   node tools/prop1_threshold_uptime_2026_10_26.js [--games 1500] [--seed 1]   writes docs/balance/prop1-threshold-uptime-2026-10-26.json
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const G = Math.max(10, +opt('games', 1500) || 1500), SEED = +opt('seed', 1) || 1, WRITE = !argv.includes('--dry');
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const BRAMBLE = 35, MAXK = 12;
function deckOf(rng){ const d = {}; for(let n = 0; n < 20; n++){ const c = band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; } return d; }
const live = (engine, pl)=> engine.allBoardCards(pl).filter(c=> c && c.hp > 0 && !c.gap);
const hist = ()=> new Array(MAXK + 1).fill(0);
const T = {ur: 0, dead: hist(), ownDead: hist(), foeDead: hist(), own: hist(), foe: hist(), field: hist(), rounds: 0, games: 0, lifeSum: 0, lifeN: 0, lifeHist: hist(), byRound: {}};
for(let g = 0; g < G; g++){
  const seed = H.hashStr('prop1-threshold|' + SEED + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules: {phase: 'cycle'}, aiAim: true, aiLevel: 1});
  const P = {1: engine.newPlayer(1, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  const seen = {1: new Map(), 2: new Map()}, gone = {1: 0, 2: 0}; // uid -> the round it was first seen
  const sweep = (r)=>{ [1, 2].forEach(p=>{ const now = new Set(live(engine, P[p]).map(c=> c.uid));
    seen[p].forEach((r0, uid)=>{ if(!now.has(uid)){ seen[p].delete(uid); gone[p]++; if(p === 1){ const L = Math.max(1, r - r0); T.lifeSum += L; T.lifeN++; T.lifeHist[Math.min(MAXK, L)]++; } } });
    now.forEach(uid=>{ if(!seen[p].has(uid)) seen[p].set(uid, r); }); }); };
  T.games++;
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    sweep(r);
    const a = live(engine, P[1]).length, b = live(engine, P[2]).length, n = a; T.rounds++; T.ur += n;
    const d = gone[1] + gone[2], k = x=> Math.min(MAXK, x);
    T.dead[k(d)] += n; T.ownDead[k(gone[1])] += n; T.foeDead[k(gone[2])] += n; T.own[k(a)] += n; T.foe[k(b)] += n; T.field[k(a + b)] += n;
    const br = T.byRound[r] || (T.byRound[r] = {ur: 0, dead: 0, field: 0}); br.ur += n; br.dead += n * d; br.field += n * (a + b);
    const over = engine.resolveCombat(P, H.sideOf, stats, null, r % 2 === 0 ? 1 : 2);
    sweep(r + 1); // a unit felled in combat counts from the next round's look
    if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
}
const r3 = v=> Math.round(v * 1000) / 1000;
const atLeast = h=> h.map((_, i)=> r3(h.slice(i).reduce((s, x)=> s + x, 0) / Math.max(1, T.ur))); // the share of unit-rounds with i or more
const out = {_about: 'tools/prop1_threshold_uptime_2026_10_26.js: the share of unit-rounds (side 1\'s units on the board as combat starts) where each threshold holds; index i of each list = the share with i or more. Random live band decks, CPU vs CPU (aiLevel 1, open board, day/night cycle). dead = units that died this fight so far, both sides; ownDead / foeDead by side (seen from side 1); own / foe / field = live units now. life = rounds a side-1 unit stayed on the board.',
  generated: '2026-10-26', seed: SEED, band: band.length, games: T.games, unitRounds: T.ur, meanRounds: r3(T.rounds / T.games),
  atLeast: {dead: atLeast(T.dead), ownDead: atLeast(T.ownDead), foeDead: atLeast(T.foeDead), own: atLeast(T.own), foe: atLeast(T.foe), field: atLeast(T.field)},
  life: {mean: r3(T.lifeSum / Math.max(1, T.lifeN)), units: T.lifeN, hist: T.lifeHist.map(x=> r3(x / Math.max(1, T.lifeN)))},
  byRound: Object.fromEntries(Object.entries(T.byRound).filter(([r])=> +r <= 12).map(([r, v])=> [r, {share: r3(v.ur / T.ur), meanDead: r3(v.dead / Math.max(1, v.ur)), meanField: r3(v.field / Math.max(1, v.ur))}]))};
if(WRITE) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'prop1-threshold-uptime-2026-10-26.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out));
