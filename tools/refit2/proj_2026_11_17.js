#!/usr/bin/env node
// 2026-11-17 (package REFIT2): a steadier projection than the one-seed table: every Maps 0-20 curve fight (tools/ci/road_summary.js's rows)
// at the mean of its five live reads (night2 s7600 + refit2/measure-live-s51100/52100/61100/62100), an accepted fix at the mean of its fresh
// reads. Counts in band / within 10 / beyond 20, main and side, before and after.
//   node tools/refit2/proj_2026_11_17.js [--fixes docs/balance/refit2/refit2-fixes.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const B = p => path.join(ROOT, 'docs', 'balance', p), rd = p => fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const files = ['skirmish-pass-night2-s7600.jsonl', ...[51100, 52100, 61100, 62100].map(s => `refit2/measure-live-s${s}.jsonl`)].map(f => rd(B(f)));
const by = {}; files[0].forEach(r => { by[r.map + ':' + r.key] = r; });
const rows = Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map));
const fx = {}; rd(arg('--fixes', B('refit2/refit2-fixes.jsonl'))).filter(x => x.apply).forEach(x => { const v = Object.values(x.fresh.fix); fx[x.key] = v.reduce((t, w) => t + w, 0) / v.length; });
const liveMean = r => { const v = files.map(f => (f.find(x => x.map === r.map && x.key === r.key) || {}).win).filter(w => w != null); return v.reduce((t, w) => t + w, 0) / v.length; };
for (const after of [0, 1]) { const t = { main: [0, 0, 0, 0], side: [0, 0, 0, 0] }, worst = [];
  rows.forEach(r => { const w = after && fx[r.key] != null ? fx[r.key] : liveMean(r), g = w - r.target, k = t[r.side ? 'side' : 'main'];
    k[0]++; if (w >= r.lo && w <= r.hi) k[1]++; if (Math.abs(g) <= 10) k[2]++; if (Math.abs(g) > 20) k[3]++; worst.push([r.key, Math.round(w * 10) / 10, r.target, Math.abs(g)]); });
  console.log(`${after ? 'with REFIT2' : 'live'} (mean of 5 reads): ` + ['main', 'side'].map(k => `${k} ${t[k][1]}/${t[k][0]} in band, ${t[k][2]} within 10, ${t[k][3]} beyond 20`).join('; '));
  console.log('  worst: ' + worst.sort((x, y) => y[3] - x[3]).slice(0, 10).map(x => `${x[0]} ${x[1]} (t${x[2]})`).join(', ')); }
