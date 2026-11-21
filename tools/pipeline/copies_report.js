#!/usr/bin/env node
// COPIES (2026-11-21): each Maps 1-20 skill's worth with 2, 6 (the shared measure) and 12 copies of the skilled card in the test deck,
// bramble 15. Worth is per copy-slot as the ruler reads it; "scales" compares the 2- and 12-copy intervals.
// Usage: node tools/pipeline/copies_report.js   writes docs/balance/pipeline/copies-2026-11-21.json, prints counts and the movers.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
for (const k of keys) {
  const a = w('global@k2|' + k), g = w('global|' + k), b = w('global@k12|' + k); if (!a || !g || !b) { inc('missing'); continue; }
  const move = b.lo > a.hi ? 'more with copies' : b.hi < a.lo ? 'less with copies' : 'same'; inc(move);
  const p = R['global|' + k].test.price, v = x => x.lo > p ? 'cheap' : x.hi < p ? 'dear' : 'ok';
  rows.push({ key: k, price: p, k2: a, k6: g, k12: b, move, verdicts: [v(a), v(g), v(b)] });
}
const stable = rows.filter(r => new Set(r.verdicts).size === 1).length;
fs.writeFileSync(path.join(D, 'copies-2026-11-21.json'), JSON.stringify({ about: 'COPIES: worthRuler with 2 / 6 / 12 copies at bramble 15; move = 12-copy interval above / below the 2-copy one', stable, rows }, null, 1));
console.log(keys.length, 'skills', n, 'same verdict at all three:', stable);
rows.filter(r => r.move !== 'same').sort((x, y) => (y.k12.m - y.k2.m) - (x.k12.m - x.k2.m))
  .forEach(r => console.log(`${r.move.padEnd(16)} ${r.key.slice(0, 50).padEnd(50)} k2 ${r2(r.k2.m)}  k6 ${r2(r.k6.m)}  k12 ${r2(r.k12.m)}  price ${r.price}`));
