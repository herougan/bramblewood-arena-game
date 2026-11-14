#!/usr/bin/env node
// 2026-11-15 (package SIDE4P, scratch only): reference win % of one fight with node-field variants (the way side3p_search.js reads a deck).
//   node tools/side4p_lever.js --code X --games 400 --seeds 11300,7100 --variants '[{"shieldOverride":2},{"deck":{...},"brambleHealth":14}]'
'use strict';
const L = require('./skir1/lib_fight_2026_11_11.js'), G = L.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), N = +arg('--games', 400), seeds = arg('--seeds', '11300,7100').split(',').map(Number), vs = JSON.parse(arg('--variants', '[{}]'));
let m, n; for (const mm of L.maps()) { const x = L.fightsOf(mm).find(y => y.key === code); if (x) { m = mm; n = x; break; } }
for (const v of [{}].concat(vs)) { const nn = Object.assign({}, n, v); G.NODE_MAP_HINT.set(nn, m.id); const sc = G.skirmishCastle(nn);
  const w = seeds.map(s => { const ctx = G.referenceFightSetup(m.id, nn, { seed0: s }); let k = 0; for (let g = 0; g < N; g++) if (G.playReferenceGame(ctx, g).win) k++; return Math.round(k / N * 1000) / 10; });
  console.log(code, JSON.stringify(v), `hp ${sc.hp} shield ${sc.shield}`, w.join(' / ')); }
