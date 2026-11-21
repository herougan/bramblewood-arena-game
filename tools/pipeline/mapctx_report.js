#!/usr/bin/env node
// MAPCTX (2026-11-21): one table of every skill measured on its own map against the shared measure and its price.
// Usage: node tools/pipeline/mapctx_report.js [--json out.json]   prints markdown rows; "apart" = shared mean outside the map's 95% interval.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/pipeline/measures.json'), 'utf8')).results;
const r2 = v => Math.round(v * 100) / 100, rows = [];
for (let m = 1; m <= 20; m++) {
  const f = path.join(ROOT, `docs/balance/pipeline/state/mapctx-${String(m).padStart(2, '0')}.json`);
  if (!fs.existsSync(f)) continue;
  const k = JSON.parse(fs.readFileSync(f, 'utf8')), keys = Array.isArray(k) ? k : (k.keys || k.only || Object.keys(k));
  for (const key of keys) {
    const e = R[`map${m}|${key}`], g = R[`global|${key}`];
    if (!e || !e.test) continue;
    const w = e.test.worthRuler, p = e.test.price, gm = g && g.test ? g.test.worthRuler.m : null;
    rows.push({ map: m, key, worth: r2(w.m), lo: r2(w.lo), hi: r2(w.hi), shared: gm == null ? null : r2(gm), price: p, fights: e.fights,
      apart: gm != null && (gm < w.lo || gm > w.hi), zero: w.lo === 0 && w.hi === 0,
      verdict: w.lo > p ? 'too cheap' : w.hi < p ? 'too dear' : 'in range' });
  }
}
const by = {}; rows.forEach(r => { (by[r.map] = by[r.map] || []).push(r); });
console.log('| Map | items | apart from shared | too cheap | too dear | read 0 |\n|---|---|---|---|---|---|');
Object.keys(by).forEach(m => { const a = by[m]; console.log(`| ${m} | ${a.length} | ${a.filter(r => r.apart).length} | ${a.filter(r => r.verdict === 'too cheap').length} | ${a.filter(r => r.verdict === 'too dear').length} | ${a.filter(r => r.zero).length} |`); });
const t = rows.length, n = f => rows.filter(f).length;
console.log(`| all | ${t} | ${n(r => r.apart)} | ${n(r => r.verdict === 'too cheap')} | ${n(r => r.verdict === 'too dear')} | ${n(r => r.zero)} |`);
const i = process.argv.indexOf('--json'); if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(rows, null, 1));
