#!/usr/bin/env node
// 2026-11-20 (package REFIT15): two road measures side by side (Maps 0-20, curve fights): main / side counts in band / within 10 / beyond 20,
// and every fight whose win rate moved by more than --min points (default 6, about the 400-game noise).
//   node docs/balance/refit15/compare_2026_11_20.js <before.jsonl> <after.jsonl> [--min 6]
'use strict';
const fs = require('fs'), a = process.argv.slice(2), MIN = a.includes('--min') ? +a[a.indexOf('--min') + 1] : 6;
const rd = f => fs.readFileSync(f, 'utf8').trim().split('\n').map(JSON.parse).filter(r => r.curve && r.mapNo <= 20);
const B = rd(a[0]), A = rd(a[1]), key = r => r.map + ':' + r.key, bm = new Map(B.map(r => [key(r), r]));
const count = rs => ['main', 'side'].map(s => { const x = rs.filter(r => r.side === (s === 'side'));
  return `${s} ${x.length}: ${x.filter(r => r.win >= r.lo && r.win <= r.hi).length} in band / ${x.filter(r => Math.abs(r.win - r.target) <= 10).length} within 10 / ${x.filter(r => Math.abs(r.win - r.target) > 20).length} beyond 20`; }).join('; ');
console.log('before', count(B)); console.log('after ', count(A));
A.forEach(r => { const b = bm.get(key(r)); if (b && Math.abs(b.win - r.win) > MIN) console.log(`  ${r.key.padEnd(8)} ${String(b.win).padStart(5)} -> ${String(r.win).padStart(5)}  target ${r.target} (${r.lo}-${r.hi})${r.side ? ' side' : ''}`); });
const worst = A.filter(r => !r.side).sort((p, q) => Math.abs(q.win - q.target) - Math.abs(p.win - p.target)).slice(0, 10);
console.log('worst main:', worst.map(r => `${r.key} ${r.win}/${r.target}`).join(', '));
