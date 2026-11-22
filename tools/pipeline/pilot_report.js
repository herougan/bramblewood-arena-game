#!/usr/bin/env node
// PILOT (2026-11-22, owner 13:24: "some cards are only good if a good player uses it - what does this mean? cards whose impact has HIGH variance?"):
// a skill's skill ceiling = its worth when the measured deck's own seat plays at CPU level 2 (ctx pilot2) minus its worth at CPU level 0 (ctx pilot0),
// the opponent at level 1 in both, bramble 15. Not variance: variance is luck spread at one pilot level; the ceiling is how much a better pilot gets out of it.
// High = the skill pays mostly in good hands; negative = a basic pilot does as well or better (simple, forgiving skills).
// Usage: node tools/pipeline/pilot_report.js   writes docs/balance/pipeline/pilot-2026-11-22.json, prints counts and the top and bottom skills.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
for (const k of keys) {
  const a = w('global@pilot2|' + k), b = w('global@pilot0|' + k), g = w('global|' + k); if (!a || !b) { inc('missing'); continue; }
  const gap = a.m - b.m, se = Math.sqrt(((a.hi - a.lo) / 3.92) ** 2 + ((b.hi - b.lo) / 3.92) ** 2), z = se ? gap / se : 0;
  const rel = Math.abs(b.m) > 0.5 ? gap / Math.abs(b.m) : null; inc(z > 1.96 ? 'higher with a good pilot' : z < -1.96 ? 'higher with a basic pilot' : 'same');
  rows.push({ key: k, price: g && R['global|' + k].test.price, pilot0: r2(b.m), pilot1: g ? r2(g.m) : null, pilot2: r2(a.m), ceiling: r2(gap), z: r2(z), rel: rel == null ? null : r2(rel) });
}
rows.sort((x, y) => y.ceiling - x.ceiling);
fs.writeFileSync(path.join(D, 'pilot-2026-11-22.json'), JSON.stringify({ about: 'PILOT: worthRuler with the measured deck at CPU level 2 vs level 0 (opponent level 1), bramble 15; ceiling = pilot2 - pilot0, z from the 95% intervals; pilot1 = the shared measure', counts: n, rows }, null, 1));
console.log(rows.length, 'skills', n);
const show = r => console.log(`${String(r.ceiling).padStart(6)} z ${String(r.z).padStart(5)}  ${r.key.slice(0, 48).padEnd(48)} p0 ${r.pilot0}  p1 ${r.pilot1}  p2 ${r.pilot2}  price ${r.price}`);
console.log('-- highest ceiling'); rows.slice(0, 12).forEach(show); console.log('-- lowest ceiling'); rows.slice(-8).forEach(show);
