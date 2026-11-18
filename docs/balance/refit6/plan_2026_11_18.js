#!/usr/bin/env node
// 2026-11-18 (package REFIT6): the fights to re-fit and their lanes, from skirmish-pass-refit6-before-s9100.jsonl. Every Maps 0-20 curve fight
// out of its band, biggest gap first; a map's fights stay in one lane (joint legality); two lanes balanced by fight count; then cut into
// chunks of at most --chunk fights (each chunk one run under about 40 minutes; a map is never split across chunks of different lanes).
//   node docs/balance/refit6/plan_2026_11_18.js [measure.jsonl] [--chunk=14]   -> prints "A1: codes", "B1: codes", ...
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const a = process.argv.slice(2), CH = +((a.find(x => x.startsWith('--chunk=')) || '--chunk=14').slice(8));
const rows = fs.readFileSync(path.resolve(ROOT, a.find(x => !x.startsWith('--')) || 'docs/balance/skirmish-pass-refit6-before-s9100.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const by = {};
rows.forEach(r => { if (r.green === 'green' || r.mapNo > 20 || r.endless || r.map === 'mtut' || r.target == null) return; // REFIT6: the fights the counts read (20-B too)
  (by[r.map] = by[r.map] || []).push({ key: r.key, gap: Math.abs(r.win - r.target) }); });
const maps = Object.entries(by).map(([m, f]) => ({ m, f: f.sort((x, y) => y.gap - x.gap).map(x => x.key), pr: Math.max(...f.map(x => x.gap)) })).sort((x, y) => y.pr - x.pr);
const L = [[], []], n = [0, 0];
maps.forEach(x => { const i = n[0] <= n[1] ? 0 : 1; L[i].push(x.f); n[i] += x.f.length; });
console.log('to re-fit', n[0] + n[1]);
L.forEach((lane, i) => { let c = [], k = 1; const flush = () => { if (c.length) console.log(`${'AB'[i]}${k++}: ${c.join(' ')}`); c = []; };
  lane.forEach(f => { if (c.length && c.length + f.length > CH) flush(); c.push(...f); }); flush(); });
