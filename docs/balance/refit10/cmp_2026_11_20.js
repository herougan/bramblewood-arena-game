#!/usr/bin/env node
// 2026-11-20 (package REFIT10): two road reads side by side, per fight (win, target, band, gap), for the fights both hold.
//   node docs/balance/refit10/cmp_2026_11_20.js <a.jsonl> <b.jsonl>
'use strict';
const fs = require('fs');
const rd = f => Object.fromEntries(fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).map(r => [r.code || r.key, r]));
const [a, b] = process.argv.slice(2).map(rd), inb = r => r.win >= r.lo && r.win <= r.hi;
for (const k of Object.keys(b)) { const x = a[k], y = b[k]; if (!x) continue;
  console.log(k.padEnd(8), String(x.win).padStart(5), '->', String(y.win).padStart(5), ' target', y.target, `(${y.lo}-${y.hi})`, ' gap', (y.win - y.target).toFixed(1), inb(y) ? 'in' : 'OUT'); }
