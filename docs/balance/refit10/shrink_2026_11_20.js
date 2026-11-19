// 2026-11-20 (package REFIT10): information for 19-A-7's owner call only (no size change applied): the live deck shrunk (SIDE2-2 e), 200 games on seed 311300. Output: shrink-19-A-7.log
const R = require('path').resolve(__dirname, '..', '..', '..') + '/';
require(R + 'docs/balance/refit10/m9_2026_11_20.js'); const X = require(R + 'tools/legal1/lib_legal_2026_11_15.js'), G = X.G; const { m, n } = X.byCode['19-A-7'];
const base = n.deck; const vs = [{}, { 'obsidian-scorpion': -2, 'cinder-hornet': -2 }, { 'obsidian-scorpion': -3, 'tide-spirit': -1 }, { 'cinder-hornet': -4 }];
for (const v of vs) { const d = Object.assign({}, base); for (const [k, x] of Object.entries(v)) { d[k] += x; if (!d[k]) delete d[k]; }
  const p = X.problemsFull('19-A-7', d, {}); const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id);
  console.log(JSON.stringify(v), JSON.stringify(p), Math.round(G.simulateReferenceFight(m.id, nn, 200, { seed0: 311300 }).win * 1000) / 10); }
