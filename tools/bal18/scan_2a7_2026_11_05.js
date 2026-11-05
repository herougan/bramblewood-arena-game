#!/usr/bin/env node
// 2026-11-05 (package BAL18, item 2): the local search (tune_2a7_2026_11_05.js) stopped at 95% after one move, so this scans 2-A-7's whole legal
// space under the same rules. K14 leaves 4 cards that may take more than 1 copy (map-unique: Lodge Engineer, Old Sturgeon, Riverworks Bastion,
// Victoria Regia) and 6 at 1 copy each (Box Turtle, Duckling, Muskrat Reedgatherer, Pond Algae, Water Shrew, Water Vole; at most 6 in all).
// Size 14, Riverworks Bastion (first-clear) at least 1, 5-9 different cards, copy caps.
//   pass 1: every split of the map-unique copies (each composition), the 1-copy cards filled in a fixed order (Box Turtle, Water Shrew, Muskrat
//           Reedgatherer, Pond Algae, Water Vole, Duckling), 40 games on the tune seeds (7300 + 37g);
//   pass 2: the 6 best of pass 1 with every choice of their 1-copy cards (same count);
//   then the best 5 overall read on the road measure's seeds (9100 + 37g) at 40 and 200 games.
//   node tools/bal18/scan_2a7_2026_11_05.js  -> docs/balance/bal18/scan-2a7-2026-11-05.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const B = require('../lib_bramble.js'), G = B.G, K = require('../bal7_k14_decks_2026_10_28.js');
const MAP = 'mp', KEY = '2-A-7', m = G.CONQUEST_MAPS.find(x => x.id === MAP), node0 = m.nodes.find(n => n.key === KEY), f = K.fights().find(x => x.map === MAP && x.key === KEY);
const UNI = [['lodge-engineer', 0, 4], ['old-sturgeon', 0, 4], ['riverworks-bastion', 1, 5], ['victoria-regia', 0, 4]];
const ONE = ['box-turtle', 'water-shrew', 'muskrat-reedgatherer', 'pond-algae', 'water-vole', 'duckling'];
const band = G.skirmishTargetBand(MAP, node0), want = band.t * 100;
const legal = d => Object.values(d).reduce((t, k) => t + k, 0) === 14 && Object.keys(d).length >= 5 && Object.keys(d).length <= 9 && K.violations(f, d).length === 0 && d['riverworks-bastion'] >= 1;
function measure(deck, games, seed0) { const nn = Object.assign({}, node0, { deck }); G.NODE_MAP_HINT.set(nn, MAP); const r = G.simulateReferenceFight(MAP, nn, games, { seed0 });
  return { win: Math.round(r.wins / games * 1000) / 10, hpLost: Math.round(r.hpLost * 1000) / 10 }; }
const P = r => Math.abs(r.win - want) + 10 * (r.win > want ? 1 - r.hpLost / 100 : r.hpLost / 100);
const rows = [], seen = new Set(), key = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const run = d => { const k = key(d); if (seen.has(k) || !legal(d)) return; seen.add(k); const r = measure(d, 40, 7300); rows.push({ deck: d, tune: r.win, hpLost: r.hpLost, P: P(r) }); };
for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 1; c <= 5; c++) for (let v = 0; v <= 4; v++) { const s = a + b + c + v, rest = 14 - s; if (rest < 0 || rest > 6) continue;
  const d = {}; [a, b, c, v].forEach((k, i) => { if (k) d[UNI[i][0]] = k; }); ONE.slice(0, rest).forEach(id => { d[id] = 1; }); run(d); }
console.log('pass 1', rows.length, 'decks; best', rows.slice().sort((x, y) => x.P - y.P).slice(0, 3).map(r => r.tune).join(' '));
const top = rows.slice().sort((x, y) => x.P - y.P).slice(0, 6);
for (const t of top) { const uni = Object.fromEntries(Object.entries(t.deck).filter(([id]) => !ONE.includes(id))), n = ONE.filter(id => t.deck[id]).length;
  for (let mask = 0; mask < 64; mask++) { const pick = ONE.filter((id, i) => mask & (1 << i)); if (pick.length !== n) continue; const d = Object.assign({}, uni); pick.forEach(id => { d[id] = 1; }); run(d); } }
const best = rows.slice().sort((x, y) => x.P - y.P).slice(0, 5).map(r => Object.assign(r, { measure40: measure(r.deck, 40, 9100).win, measure200: measure(r.deck, 200, 9100).win }));
const before = { deck: node0.deck, tune: measure(node0.deck, 40, 7300).win, measure40: measure(node0.deck, 40, 9100).win, measure200: measure(node0.deck, 200, 9100).win };
const out = path.join(ROOT, 'docs', 'balance', 'bal18', 'scan-2a7-2026-11-05.json');
fs.writeFileSync(out, JSON.stringify({ about: 'BAL18 item 2: every legal 2-A-7 deck under K14 (tools/bal18/scan_2a7_2026_11_05.js)', band: { lo: band.lo * 100, hi: band.hi * 100, target: want }, decks: rows.length, before, best,
  lowest: rows.slice().sort((x, y) => x.tune - y.tune).slice(0, 10), all: rows.map(r => ({ deck: r.deck, tune: r.tune, hpLost: r.hpLost })) }, null, 1) + '\n');
console.log('before', JSON.stringify(before)); best.forEach(r => console.log(JSON.stringify(r)));
console.log('lowest tune', rows.slice().sort((x, y) => x.tune - y.tune).slice(0, 5).map(r => r.tune + ' ' + JSON.stringify(r.deck)).join('\n'));
