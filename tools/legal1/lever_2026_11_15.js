#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): reference win % of one fight with node-field variants (deck / shieldOverride / hqHp), as SIDE4P's lever tool,
// on tune seeds (not the fresh 5100 / 6100 / 4100 sets): picks the smallest lever before the fresh measure.
//   node tools/legal1/lever_2026_11_15.js --code X --games 400 --seeds 11300,12300 --variants '[{"hqHp":12},{"deck":{...},"hqHp":10}]'
'use strict';
const X = require('./lib_legal_2026_11_15.js'), G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), N = +arg('--games', 400), seeds = arg('--seeds', '11300,12300').split(',').map(Number), vs = JSON.parse(arg('--variants', '[{}]'));
const { m, n } = X.byCode[code];
for (const v of vs) { const nn = Object.assign({}, n, v); G.NODE_MAP_HINT.set(nn, m.id); const sc = G.skirmishCastle(nn);
  const w = seeds.map(s => Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: s }).win * 1000) / 10);
  console.log(code, JSON.stringify(v), `hp ${sc.hp} shield ${sc.shield}`, w.join(' / '), 'mean', Math.round(w.reduce((t, x) => t + x, 0) / w.length * 10) / 10); }
