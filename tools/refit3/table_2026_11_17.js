#!/usr/bin/env node
// 2026-11-17 (package REFIT3): a verify batch's fights on the fresh seed sets: live vs fix (400 games a read, GitHub), in band on each,
// and the acceptance rule (in band on every set read, and 2+ points nearer the target than the live deck on the mean).
//   node tools/refit3/table_2026_11_17.js <batch tag> <seed>,<seed>   (reads docs/balance/refit3/verify/<tag>-s<K>.jsonl and road/live-s<K>.jsonl)
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..'), D = path.join(ROOT, 'docs', 'balance', 'refit3');
const [tag, seeds] = process.argv.slice(2), S = seeds.split(',');
const rows = f => { const o = {}; if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); o[r.key] = r; }); return o; };
const live = S.map(k => rows(path.join(D, 'road', `live-s${k}.jsonl`))), fix = S.map(k => rows(path.join(D, 'verify', `${tag}-s${k}.jsonl`)));
const out = [];
Object.keys(fix[0]).sort().forEach(key => { const r = fix[0][key], T = r.target, inb = w => w >= r.lo && w <= r.hi;
  const fw = fix.map(x => x[key] ? x[key].win : null), lw = live.map(x => x[key] ? x[key].win : null), mean = a => a.reduce((t, x) => t + x, 0) / a.length;
  const nIn = fw.filter(inb).length, nearer = Math.abs(mean(lw) - T) - Math.abs(mean(fw) - T), ok = nIn === S.length && nearer >= 2;
  out.push({ key, target: T, lo: r.lo, hi: r.hi, live: lw, fix: fw, nIn, nearer: Math.round(nearer * 10) / 10, accept: ok });
  console.log(`${ok ? 'ACCEPT' : 'no    '} ${key.padEnd(7)} target ${+T.toFixed(1)} (${+r.lo.toFixed(1)}-${+r.hi.toFixed(1)}) live ${lw.join(' / ')} -> fix ${fw.join(' / ')} (${nIn}/${S.length} in band, ${nearer.toFixed(1)} nearer)`); });
fs.writeFileSync(path.join(D, 'verify', `${tag}-table.json`), JSON.stringify(out, null, 1) + '\n');
