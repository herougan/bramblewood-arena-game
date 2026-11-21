#!/usr/bin/env node
// BSWEEP (2026-11-21): each Maps 1-20 skill's shared-setup worth at bramble Health 5 / 15 / 30 and its verdict against the price at each.
// Usage: node tools/pipeline/bsweep_report.js   writes docs/balance/pipeline/bsweep-2026-11-21.json, prints counts and the level-dependent skills.
// The first sweep's bramble-5 run predates --ctx-tag parsing, so its readings come from that run's summary (measure-2026-11-21-1754.json).
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, B5 = {};
J('measure-2026-11-21-1754.json').changed.forEach(c => { const m = c.new.match(/^(-?[\d.]+) \[(-?[\d.]+), (-?[\d.]+)\]/); if (m) B5[c.id] = { m: +m[1], lo: +m[2], hi: +m[3] }; });
const keys = J('state/bsweep-keys.json').concat(J('state/bsweep2-keys.json')), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
for (const k of keys) {
  const a = w('global@b5|' + k) || B5[k], g = w('global|' + k), b = w('global@b30|' + k); if (!a || !g || !b) { inc('missing'); continue; }
  const p = R['global|' + k].test.price, v = x => x.lo > p ? 'cheap' : x.hi < p ? 'dear' : 'fair';
  const trend = b.lo > a.hi ? 'rises' : b.hi < a.lo ? 'falls' : 'flat', vs = [v(a), v(g), v(b)];
  inc(trend); inc(vs.every(x => x === vs[0]) ? 'same verdict' : 'verdict moves');
  rows.push({ key: k, price: p, b5: a, b15: g, b30: b, trend, verdicts: vs });
}
fs.writeFileSync(path.join(D, 'bsweep-2026-11-21.json'), JSON.stringify({ about: 'BSWEEP: Maps 1-20 skills, shared-setup worth at bramble 5 / 15 / 30 (worthRuler m, lo, hi); trend = 30 vs 5 intervals apart', rows }, null, 1));
console.log(keys.length, 'skills', n);
rows.filter(r => r.trend !== 'flat').sort((x, y) => (y.b30.m - y.b5.m) - (x.b30.m - x.b5.m))
  .forEach(r => console.log(`${r.trend.padEnd(6)} ${r.key.slice(0, 50).padEnd(50)} ${r2(r.b5.m)} / ${r2(r.b15.m)} / ${r2(r.b30.m)}  price ${r.price}  ${r.verdicts.join('/')}`));
