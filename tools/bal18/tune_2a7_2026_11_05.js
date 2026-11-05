#!/usr/bin/env node
// 2026-11-05 (package BAL18, item 2): 2-A-7 The Lodge Matriarch (Lilypad Reach, mp) plays at 98-100% for the Map reference after CONTENT11's
// Lodge Repairs gimmick (band 30-49, target 40). A wider search than skirmish_pass.js curve (whose 2-copy steps stop when a step closes the gap
// by under 2 points: at 100% every step reads 100): a local search on the enemy deck with the fight's own rules:
//   - a card coming in is on the fight's own list (tools/lib_map_pools.js fightPool: mb's submap list for mp + SPECIAL, as curve --strict),
//     within the road's rarity cap and the map's theme (thematic pass), not another fight's reward card; or already in the deck;
//   - the deck's size (14), its leader (rules: leaders, unchanged) and its first-clear cards are kept; copies within the rarity's copy cap
//     (and 4); a boss keeps 5 to max(8, its count) different cards (curve --distinct);
//   - K14 (tools/bal7_k14_decks_2026_10_28.js violations) may not get worse.
// Moves: 1 to 4 copies of a deck card to a list card (or to another deck card), best of all moves each step; progress = gap to the target plus
// 10 x your bramble's Health left (as curveTune's P, so a 100% fight still has a way down). Trials: 40 games on the tune seeds (7300 + 37g);
// the result is then read on the road measure's seeds (9100 + 37g) at 40 and 200 games.
//   node tools/bal18/tune_2a7_2026_11_05.js [--games 40] [--steps 12] [--out docs/balance/bal18/tune-2a7-2026-11-05.json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const B = require('../lib_bramble.js'), G = B.G, D = B.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js'), K = require('../bal7_k14_decks_2026_10_28.js');
let TH = null; try { TH = require('../thematic_pass_2026_10_19.js'); } catch (e) {}
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 40), STEPS = +arg('--steps', 12), OUT = path.join(ROOT, arg('--out', 'docs/balance/bal18/tune-2a7-2026-11-05.json'));
const MAP = 'mp', KEY = '2-A-7';
const m = G.CONQUEST_MAPS.find(x => x.id === MAP), node0 = m.nodes.find(n => n.key === KEY);
const f = K.fights().find(x => x.map === MAP && x.key === KEY);
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const list = LP.fightPool(pools, MAP, m.parent), first = new Set((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, KEY) || []);
const mapNo = G.mapNumberOf(MAP), size = d => Object.values(d).reduce((t, k) => t + k, 0), n0 = Object.keys(node0.deck).length, S0 = size(node0.deck);
const cap = id => Math.min(4, G.maxCopiesForRarity(D[id].rarity));
const otherReward = id => { const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === KEY)); };
const inOk = id => D[id] && !D[id].token && D[id].kind !== 'baby' && !/^egg-/.test(id) && !(D[id].effects || {}).leader && G.roadRarityOk(D[id].rarity, mapNo, node0.kind)
  && !otherReward(id) && !(TH && TH.offThemeFor(MAP, node0, id));
const ins = [...new Set([...list].filter(inOk).concat(Object.keys(node0.deck)))].sort();
const k14 = d => K.violations(f, d).length, K0 = k14(node0.deck);
const legal = d => size(d) === S0 && Object.keys(d).length >= Math.min(5, n0) && Object.keys(d).length <= Math.max(8, n0) && Object.entries(d).every(([id, k]) => k >= 1 && k <= cap(id))
  && [...first].every(id => !node0.deck[id] || d[id]) && k14(d) <= K0;
const band = G.skirmishTargetBand(MAP, node0), want = band.t * 100, lo = band.lo * 100, hi = band.hi * 100;
function measure(deck, games, seed0) { const nn = Object.assign({}, node0, { deck }); G.NODE_MAP_HINT.set(nn, MAP); const r = G.simulateReferenceFight(MAP, nn, games, { seed0 });
  return { win: Math.round(r.wins / games * 1000) / 10, hpLost: Math.round(r.hpLost * 1000) / 10 }; }
const P = r => Math.abs(r.win - want) + 10 * (r.win > want ? 1 - r.hpLost / 100 : r.hpLost / 100);
const key = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const seen = new Map(); const T = d => { const k = key(d); if (!seen.has(k)) seen.set(k, measure(d, GAMES, 7300)); return seen.get(k); };
let cur = Object.assign({}, node0.deck), r = T(cur); const trail = [{ deck: cur, win: r.win, hpLost: r.hpLost }];
console.log('list', ins.join(' '), '| first-clear', [...first].join(' ') || '-', '| K14', K0, '| band', lo, '-', hi, '| start', r.win, r.hpLost);
for (let step = 0; step < STEPS; step++) {
  let best = null;
  for (const out of Object.keys(cur)) for (const inn of ins) { if (inn === out) continue;
    for (let k = 1; k <= Math.min(4, cur[out]); k++) { const d = Object.assign({}, cur); d[out] -= k; if (!d[out]) delete d[out]; d[inn] = (d[inn] || 0) + k; if (!legal(d)) continue;
      const x = T(d); if (!best || P(x) < P(best.r)) best = { d, r: x, mv: `${out} -${k} -> ${inn}` }; } }
  if (!best || P(best.r) > P(r) - 1) break; cur = best.d; r = best.r; trail.push({ move: best.mv, deck: cur, win: r.win, hpLost: r.hpLost }); console.log(step + 1, best.mv, r.win, r.hpLost);
  if (Math.abs(r.win - want) <= 4) break;
}
// the best few decks in band (or nearest) on the tune seeds, read on the measure seeds
const ranked = [...seen.entries()].map(([k, x]) => ({ k, x })).sort((p, q) => P(p.x) - P(q.x)).slice(0, 8).map(({ k, x }) => {
  const d = Object.fromEntries(k.split(',').map(s => { const mm = /^(.*?)(\d+)$/.exec(s); return [mm[1], +mm[2]]; })), m40 = measure(d, 40, 9100);
  return { deck: d, tune: x.win, measure40: m40.win }; });
const pick = ranked.slice().sort((p, q) => Math.abs((p.tune + p.measure40) / 2 - want) - Math.abs((q.tune + q.measure40) / 2 - want))[0];
pick.measure200 = measure(pick.deck, 200, 9100).win;
const res = { about: 'BAL18 item 2: 2-A-7 The Lodge Matriarch retune (tools/bal18/tune_2a7_2026_11_05.js)', band: { lo, hi, target: want }, list: ins, firstClear: [...first], k14Before: K0,
  before: { deck: node0.deck, tune: trail[0].win, measure40: measure(node0.deck, 40, 9100).win }, trail, trials: seen.size, top: ranked, pick, k14After: k14(pick.deck) };
fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
console.log('pick', JSON.stringify(pick.deck), 'tune', pick.tune, 'measure40', pick.measure40, 'measure200', pick.measure200, 'K14', res.k14After, 'trials', seen.size);
