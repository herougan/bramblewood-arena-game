#!/usr/bin/env node
// Road-curve merge (2026-10-19, package R2): node tools/road_curve_merge.js <out> <base> <newer> [<newer> ...]
// writes docs/balance/skirmish-pass-<out>.jsonl: every fight of <base>, each replaced by its row in a later file (the re-measures of
// the fights a tune round changed), in <base>'s order. Measures are deterministic (fixed seeds), so an untouched fight keeps its row.
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'docs', 'balance');
const read = t=> fs.readFileSync(path.join(OUT, `skirmish-pass-${t}.jsonl`), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l));
const [out, base, ...newer] = process.argv.slice(2);
const by = new Map(); newer.forEach(t=> read(t).forEach(r=> by.set(r.map + ':' + r.key, r)));
const rows = read(base).map(r=> by.get(r.map + ':' + r.key) || r);
fs.writeFileSync(path.join(OUT, `skirmish-pass-${out}.jsonl`), rows.map(r=> JSON.stringify(r)).join('\n') + '\n');
console.log(out, rows.length, 'rows,', rows.filter(r=> by.has(r.map + ':' + r.key)).length, 'from', newer.join(', '));
