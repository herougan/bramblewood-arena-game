#!/usr/bin/env node
// ENG10 (2026-10-26, owner on ENG9-9: "Cut to new armor formula. (Armor should be slightly exponential as 5 armor nullifies most damage - ~>10)."):
// the real damage distribution Armor meets. Seeded CPU-vs-CPU fights between decks of 20 random live band cards (brambles 35, open board,
// day / night cycle, CPU skill 1). Every hit that lands on a unit (a swing, a counter, a prong, an arrow or a spit; the ranged hits too, which
// Armor stops since ENG9-6) is read before Armor: dmg + armorSoaked. Magic and true hits are left out (Armor never sees them); status ticks are
// not hits. Output, per Armor N = 1..8: the share of hits it cancels outright (hit <= N), the share of damage it takes off (E[min(N, d)] / E[d]),
// and the effective-Health factor 1 / (1 - that share) the price is fitted to (tools/eng10_skill_costs_2026_10_26.py).
//   node tools/eng10_armor_hits_2026_10_26.js [--games 1000] [--seed 1]   writes docs/balance/eng10-armor-hits-2026-10-26.json
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const G = Math.max(10, +opt('games', 1000) || 1000), SEED = +opt('seed', 1) || 1, WRITE = !argv.includes('--dry');
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const MAGIC = new Set(['magic', 'dark', 'holy', 'true']);
function deckOf(rng){ const d = {}; for(let n = 0; n < 20; n++){ const c = band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; } return d; }
const hist = {}, byKind = {melee: 0, ranged: 0}; let hits = 0;
for(let g = 0; g < G; g++){
  const seed = H.hashStr('eng10-armor|' + SEED + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules: {phase: 'cycle'}, aiAim: true, aiLevel: 1, recordEvents: true});
  const P = {1: engine.newPlayer(1, deckOf(rng), {id: 'st-hq', health: 35, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: 35, effects: {}})}, stats = {};
  const ev = []; engine.draw(P[1], 3, 'A', stats, ev); engine.draw(P[2], 3, 'B', stats, ev);
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, ev);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, ev); engine.aiTakeTurn(P, H.sideOf, 2, stats, ev);
    const over = engine.resolveCombat(P, H.sideOf, stats, ev, r % 2 === 0 ? 1 : 2);
    if(over) break;
    engine.draw(P[1], 1, 'A', stats, ev); engine.draw(P[2], 1, 'B', stats, ev);
  }
  ev.forEach(e=>{ if(e.type !== 'hit' || MAGIC.has(e.dmgType)) return; const d = Math.round((+e.dmg || 0) + (+e.armorSoaked || 0)); if(!(d > 0)) return;
    hist[d] = (hist[d] || 0) + 1; hits++; byKind[e.ranged ? 'ranged' : 'melee']++; });
}
const r3 = v=> Math.round(v * 1000) / 1000, ds = Object.keys(hist).map(Number).sort((a, b)=> a - b), mean = ds.reduce((s, d)=> s + d * hist[d], 0) / Math.max(1, hits);
const perN = {};
for(let N = 1; N <= 8; N++){ let full = 0, cut = 0; ds.forEach(d=>{ if(d <= N) full += hist[d]; cut += Math.min(N, d) * hist[d]; });
  const share = cut / Math.max(1e-9, mean * hits); perN[N] = {cancelled: r3(full / hits), damageShare: r3(share), ehp: r3(1 / Math.max(0.02, 1 - share))}; }
const out = {_about: 'tools/eng10_armor_hits_2026_10_26.js: the landed hits on units (swings, counters, prongs, arrows, spits) before Armor, magic and true left out; random live band decks, CPU vs CPU (aiLevel 1, open board, day / night cycle). perN[N]: cancelled = the share of hits Armor N stops outright (hit <= N); damageShare = E[min(N, hit)] / E[hit]; ehp = 1 / (1 - damageShare).',
  generated: '2026-10-26', seed: SEED, games: G, band: band.length, hits, byKind, meanHit: r3(mean), hist: Object.fromEntries(ds.map(d=> [d, r3(hist[d] / hits)])), perN};
if(WRITE) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng10-armor-hits-2026-10-26.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out, null, 1));
