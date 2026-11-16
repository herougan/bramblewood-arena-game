#!/usr/bin/env node
// 2026-11-16 (package REFIT1): the fights to re-fit: curve fights of Maps 0-20 out of band in a measure (default the post-fold s7300 read),
// grouped by map, minus the fights BAL-LEGAL1/2 already found no legal fix for and FOLD5 did not touch (--skip). Prints one map per line.
//   node tools/refit1/targets_2026_11_16.js [--from rows.jsonl] [--skip 20-9,19-1,19-A-4,19-5,8-7] [--min 0]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const rows = fs.readFileSync(path.resolve(ROOT, arg('--from', 'docs/balance/skirmish-pass-fold5-s7300.jsonl')), 'utf8').trim().split('\n').map(JSON.parse);
const skip = new Set(arg('--skip', '20-9,19-1,19-A-4,19-5,8-7').split(',')), MIN = +arg('--min', 0);
const off = rows.filter(r => r.curve && !skip.has(r.key) && (r.win < r.lo - MIN || r.win > r.hi + MIN));
const by = {}; off.forEach(r => { const mk = r.key.replace(/-\d+$/, ''); (by[mk] = by[mk] || []).push(r); });
Object.entries(by).sort((x, y) => y[1].reduce((t, r) => t + Math.abs(r.win - r.target), 0) - x[1].reduce((t, r) => t + Math.abs(r.win - r.target), 0))
  .forEach(([mk, rs]) => console.log(mk, Math.round(rs.reduce((t, r) => t + Math.abs(r.win - r.target), 0)), rs.map(r => `${r.key}:${r.win}/${r.target}`).join(' ')));
console.log('total', off.length);
