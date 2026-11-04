#!/usr/bin/env node
// ENG24 (2026-11-04, decision ENG22-5 a, owner 11-04 22:34: "a."): Carnage's uptime re-measured for its ENG22 rule (owner 11-03 21:13: "the card
// must 'see' the creatures dying"): a unit counts only the enemy deaths since it came onto the board. tools/prop1_threshold_uptime_2026_10_26.js
// counted every enemy death of the fight (foeDead), which is THR_UPTIME.carnage's old list. Same fights as PROP1 (seeded CPU-vs-CPU, random live
// band decks, brambles 35, aiLevel 1, open board, day/night cycle), counted over every unit-round of side 1's units as combat starts: for each
// unit, the enemy units that died since it was first seen on the board. Index i of the list = the share of unit-rounds with i or more.
// Measurement only: bramblewood-budget.js THR_UPTIME.carnage takes the list by hand.
//   node tools/eng24_carnage_uptime_2026_11_04.js [--games 1500] [--seed 1] [--dry]   writes docs/balance/eng24-carnage-uptime-2026-11-04.json
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
const seenH = new Array(MAXK + 1).fill(0), allH = new Array(MAXK + 1).fill(0); let ur = 0;
for(let g = 0; g < G; g++){
  const seed = H.hashStr('prop1-threshold|' + SEED + '|' + g), rng = H.seededRng(seed); // PROP1's seeds: the same fights
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules: {phase: 'cycle'}, aiAim: true, aiLevel: 1});
  const P = {1: engine.newPlayer(1, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  const foeSeen = new Set(); let foeGone = 0; const arrived = new Map(); // side 1 uid -> foeGone when it arrived
  const sweep = ()=>{ const now2 = new Set(live(engine, P[2]).map(c=> c.uid)); foeSeen.forEach(u=>{ if(!now2.has(u)){ foeSeen.delete(u); foeGone++; } }); now2.forEach(u=> foeSeen.add(u));
    const now1 = new Set(live(engine, P[1]).map(c=> c.uid)); [...arrived.keys()].forEach(u=>{ if(!now1.has(u)) arrived.delete(u); }); now1.forEach(u=>{ if(!arrived.has(u)) arrived.set(u, foeGone); }); };
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    sweep();
    arrived.forEach(at=>{ ur++; seenH[Math.min(MAXK, foeGone - at)]++; allH[Math.min(MAXK, foeGone)]++; });
    const over = engine.resolveCombat(P, H.sideOf, stats, null, r % 2 === 0 ? 1 : 2);
    sweep();
    if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
}
const r3 = v=> Math.round(v * 1000) / 1000, atLeast = h=> h.map((_, i)=> r3(h.slice(i).reduce((s, x)=> s + x, 0) / Math.max(1, ur)));
const out = {_about: 'tools/eng24_carnage_uptime_2026_11_04.js (ENG24, ENG22-5 a): the share of side 1\'s unit-rounds where the unit has seen i or more enemy deaths since it came onto the board (seen, Carnage\'s ENG22 rule) and where i or more enemy units died this fight (fight, the old rule, PROP1\'s foeDead). Index i = i or more.',
  generated: '2026-11-04', seed: SEED, games: G, band: band.length, unitRounds: ur, atLeast: {seen: atLeast(seenH), fight: atLeast(allH)}};
if(WRITE) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng24-carnage-uptime-2026-11-04.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.atLeast));
