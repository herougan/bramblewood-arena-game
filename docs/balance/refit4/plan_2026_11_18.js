#!/usr/bin/env node
// 2026-11-18 (package REFIT4): the fights to re-fit and their lanes. Illegal decks (problems new since FOLD6) first, then every fight out of its
// band in the whole-road measure, biggest gap first; a map's fights stay in one lane (joint legality); two lanes balanced by fight count.
//   node docs/balance/refit4/plan_2026_11_18.js [measure.jsonl] [--min-gap=8]   -> prints "LANE A: codes" / "LANE B: codes"
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const a = process.argv.slice(2), mf = a.find(x => !x.startsWith('--')) || 'docs/balance/skirmish-pass-refit4-before-s9100.jsonl';
const rows = fs.readFileSync(path.resolve(ROOT, mf), 'utf8').trim().split('\n').map(JSON.parse);
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8').trim().split('\n').filter(Boolean).map(l => l.split(' ')[0]);
const pre = new Set(rd('problems-prefold-2026-11-18.txt')), now = rd('problems-before-2026-11-18.txt'), illegal = new Set(now.filter(c => !pre.has(c) || c === '13-4'));
const by = {};
rows.forEach(r => { const out = r.green !== 'green' && r.curve !== false && r.mapNo <= 20, ill = illegal.has(r.key); if (!out && !ill) return; // off-curve fights (come-back, endless floors) are not re-fitted
  (by[r.map] = by[r.map] || []).push({ key: r.key, ill, gap: Math.abs(r.win - r.target), mapNo: r.mapNo }); });
const maps = Object.entries(by).map(([m, fs]) => ({ m, fs: fs.sort((x, y) => (y.ill - x.ill) || (y.gap - x.gap)), w: fs.length, pr: Math.max(...fs.map(f => (f.ill ? 100 : 0) + f.gap)) }))
  .sort((x, y) => y.pr - x.pr);
const L = [[], []], n = [0, 0];
maps.forEach(x => { const i = n[0] <= n[1] ? 0 : 1; L[i].push(...x.fs.map(f => f.key)); n[i] += x.w; });
console.log('to re-fit', n[0] + n[1], '(illegal', [...illegal].filter(k => rows.some(r => r.key === k)).length + ')');
console.log('LANE A:', L[0].join(' ')); console.log('LANE B:', L[1].join(' '));
