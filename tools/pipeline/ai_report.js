#!/usr/bin/env node
// AI (2026-11-22): each Maps 1-20 skill's worth with both seats played by the basic (ai0), smart (default, the shared measure) and smartest (ai2) CPU,
// bramble 15. "move" compares ai0 against the smart reading (and ai2 against smart when ai2 is there).
// Usage: node tools/pipeline/ai_report.js   writes docs/balance/pipeline/ai-2026-11-22.json, prints counts and the movers.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
const cmp = (x, g) => !x ? null : x.lo > g.hi ? 'higher' : x.hi < g.lo ? 'lower' : 'same';
for (const k of keys) {
  const a = w('global@ai0|' + k), g = w('global|' + k), b = w('global@ai2|' + k); if (!a || !g) { inc('missing'); continue; }
  const m0 = cmp(a, g), m2 = cmp(b, g); inc('basic ' + m0); if (m2) inc('smartest ' + m2);
  const p = R['global|' + k].test.price, v = x => !x ? null : x.lo > p ? 'cheap' : x.hi < p ? 'dear' : 'ok';
  rows.push({ key: k, price: p, ai0: a, ai1: g, ai2: b, basic: m0, smartest: m2, verdicts: [v(a), v(g), v(b)].filter(Boolean) });
}
const stable = rows.filter(r => new Set(r.verdicts).size === 1).length;
fs.writeFileSync(path.join(D, 'ai-2026-11-22.json'), JSON.stringify({ about: 'AI: worthRuler with both seats on CPU level 0 / 1 (shared) / 2 at bramble 15; basic / smartest = interval above / below the smart one', stable, rows }, null, 1));
console.log(keys.length, 'skills', n, 'same verdict at every level read:', stable);
rows.filter(r => r.basic !== 'same' || (r.smartest && r.smartest !== 'same')).sort((x, y) => (y.ai1.m - y.ai0.m) - (x.ai1.m - x.ai0.m))
  .forEach(r => console.log(`${(r.basic + '/' + (r.smartest || '-')).padEnd(14)} ${r.key.slice(0, 50).padEnd(50)} ai0 ${r2(r.ai0.m)}  ai1 ${r2(r.ai1.m)}  ai2 ${r.ai2 ? r2(r.ai2.m) : '-'}  price ${r.price}`));
