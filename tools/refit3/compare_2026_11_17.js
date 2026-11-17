#!/usr/bin/env node
// 2026-11-17 (package REFIT3): two road measures side by side (rows as tools/ci/road_summary.js: Maps 0-20, curve fights, main / side apart):
// the totals of each and the fights whose band status differs (into the band, out of it), with both reads.
//   node tools/refit3/compare_2026_11_17.js <base.jsonl> <alt.jsonl> [label]
'use strict';
const fs = require('fs');
const [fa, fb, label = 'alt'] = process.argv.slice(2);
const load = f => { const by = {}; fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); by[r.map + ':' + r.key] = r; });
  const o = {}; Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map)).forEach(r => { o[r.map + ':' + r.key] = r; }); return o; };
const A = load(fa), B = load(fb), inb = r => r.lo <= r.win && r.win <= r.hi, gap = r => r.win - r.target;
const tot = (o, side) => { const rs = Object.values(o).filter(r => !!r.side === side); return `${rs.filter(inb).length}/${rs.length} in band, ${rs.filter(r => Math.abs(gap(r)) <= 10).length} within 10, ${rs.filter(r => Math.abs(gap(r)) > 20).length} beyond 20`; };
console.log(`base ${fa.split('/').pop()}: main ${tot(A, false)}; side ${tot(A, true)}`);
console.log(`${label} ${fb.split('/').pop()}: main ${tot(B, false)}; side ${tot(B, true)}`);
const ch = Object.keys(B).filter(k => A[k] && inb(A[k]) !== inb(B[k])).sort();
ch.forEach(k => console.log(`  ${inb(B[k]) ? 'IN ' : 'OUT'} ${B[k].code} ${A[k].win} -> ${B[k].win} (target ${+B[k].target.toFixed(1)}, ${+B[k].lo.toFixed(1)}-${+B[k].hi.toFixed(1)})`));
const miss = Object.keys(A).filter(k => !B[k]); if (miss.length) console.log('  missing in alt:', miss.join(' '));
