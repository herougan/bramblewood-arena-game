#!/usr/bin/env node
// SEED (2026-11-22): each Maps 1-20 skill re-measured on a fresh, independent set of fights (seed tools2 instead of tools1), bramble 15.
// Tests whether the shared measure's 95% intervals are honest: z = (m2 - m1) / sqrt(se1^2 + se2^2), se = interval width / 3.92;
// if they are, about 5% of skills have |z| > 1.96 and about 32% have |z| > 1.
// Usage: node tools/pipeline/seed_report.js [--tag seed2]   writes docs/balance/pipeline/seed-2026-11-22.json, prints the calibration and the outliers.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const ti = process.argv.indexOf('--tag'), tag = ti > 0 ? process.argv[ti + 1] : 'seed2';
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [];
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, se = x => (x.hi - x.lo) / 3.92;
for (const k of keys) {
  const a = w('global|' + k), b = w(`global@${tag}|` + k); if (!a || !b) continue;
  const s = Math.hypot(se(a), se(b)), z = s > 0 ? (b.m - a.m) / s : 0, p = R['global|' + k].test.price, v = x => x.lo > p ? 'cheap' : x.hi < p ? 'dear' : 'ok';
  rows.push({ key: k, price: p, first: a, fresh: b, z: r2(z), verdicts: [v(a), v(b)] });
}
const N = rows.length, f = t => rows.filter(r => Math.abs(r.z) > t).length, pc = x => Math.round(100 * x / Math.max(1, N));
const out = { about: `SEED: worthRuler on seed tools1 (the shared measure) vs ${tag}; |z| > 1.96 should be about 5%, > 1 about 32%`, n: N, over1: f(1), over196: f(1.96),
  meanZ: r2(rows.reduce((s, r) => s + r.z, 0) / Math.max(1, N)), sameVerdict: rows.filter(r => r.verdicts[0] === r.verdicts[1]).length, rows };
fs.writeFileSync(path.join(D, 'seed-2026-11-22.json'), JSON.stringify(out, null, 1));
console.log(`${N} skills: |z| > 1 ${out.over1} (${pc(out.over1)}%, honest ~32%), |z| > 1.96 ${out.over196} (${pc(out.over196)}%, honest ~5%), mean z ${out.meanZ}, same verdict ${out.sameVerdict}`);
rows.filter(r => Math.abs(r.z) > 1.96).sort((x, y) => Math.abs(y.z) - Math.abs(x.z))
  .forEach(r => console.log(`z ${String(r.z).padStart(6)} ${r.key.slice(0, 50).padEnd(50)} first ${r2(r.first.m)}  fresh ${r2(r.fresh.m)}  price ${r.price}  ${r.verdicts.join('>')}`));
