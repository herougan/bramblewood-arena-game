#!/usr/bin/env node
// 2026-11-18 (package REFIT4): road counts of a skirmish_pass measure file, Maps 0-20: main / side fights in band (green), within 10 of the
// target, beyond 20; the worst maps (mean |gap|) and the fights beyond 20.   node docs/balance/refit4/summary_2026_11_18.js <measure.jsonl> [--over=other.jsonl]
// --over: rows of a second file (e.g. a re-measure of the changed fights) replace the first file's rows of the same key.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const a = process.argv.slice(2), rd = f => fs.readFileSync(path.resolve(ROOT, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const by = {}; rd(a.find(x => !x.startsWith('--'))).forEach(r => { by[r.map + ':' + r.key] = r; });
const ov = a.find(x => x.startsWith('--over=')); if (ov) rd(ov.slice(7)).forEach(r => { by[r.map + ':' + r.key] = r; });
const rows = Object.values(by).filter(r => r.mapNo <= 20 && r.target != null && r.curve !== false); // off the curve (tutorial come-back fights, endless floors) left out, as the protocol says
const cnt = s => { const g = rows.filter(r => !!r.side === s); return `${g.filter(r => r.green === 'green').length} in band / ${g.filter(r => Math.abs(r.win - r.target) <= 10).length} within 10 / ${g.filter(r => Math.abs(r.win - r.target) > 20).length} beyond 20 (of ${g.length})`; };
console.log('main:', cnt(false)); console.log('side:', cnt(true));
const mm = {}; rows.filter(r => !r.side).forEach(r => { (mm[r.mapNo] = mm[r.mapNo] || []).push(Math.abs(r.win - r.target)); });
console.log('worst main maps (mean |gap|):', Object.entries(mm).map(([m, v]) => [m, v.reduce((x, y) => x + y, 0) / v.length]).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([m, v]) => `Map ${m} ${v.toFixed(1)}`).join(', '));
console.log('beyond 20:', rows.filter(r => Math.abs(r.win - r.target) > 20).sort((x, y) => Math.abs(y.win - y.target) - Math.abs(x.win - x.target)).map(r => `${r.key} ${r.win}/${Math.round(r.target)}`).join(', '));
