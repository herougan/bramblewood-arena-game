#!/usr/bin/env node
// 2026-11-18 (package REFIT6): road status counts of Maps 0-20 curve fights (main and side: in band / within 10 / beyond 20), from a base read
// with later reads laid over it by fight key (later files win), and the fights out of band.
//   node docs/balance/refit6/counts_2026_11_18.js base.jsonl [over.jsonl ...] [--list] [--write=merged.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), B = path.join(__dirname, '..');
const a = process.argv.slice(2), files = a.filter(x => !x.startsWith('--'));
const rd = f => fs.readFileSync(path.resolve(B, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const by = {}; files.forEach(f => rd(f).forEach(r => { by[r.key] = r; }));
// the fights REFIT5 counted: the curve fights plus Map 20's second side map (20-B, off the curve, own targets); no endless floor, no tutorial
const rows = Object.values(by).filter(r => r.mapNo <= 20 && !r.endless && r.map !== 'mtut' && r.target != null);
const gap = r => Math.round((r.win - r.target) * 10) / 10;
const cnt = side => { const s = rows.filter(r => !!r.side === side); return `${s.filter(r => r.win >= r.lo && r.win <= r.hi).length} in band / ${s.filter(r => Math.abs(gap(r)) <= 10).length} within 10 / ${s.filter(r => Math.abs(gap(r)) > 20).length} beyond 20 (of ${s.length})`; };
console.log('main', cnt(false)); console.log('side', cnt(true));
if (a.includes('--list')) rows.filter(r => !(r.win >= r.lo && r.win <= r.hi)).sort((x, y) => Math.abs(gap(y)) - Math.abs(gap(x)))
  .forEach(r => console.log(`${r.key} ${r.win}/${r.target} ${gap(r) > 0 ? '+' : ''}${gap(r)} ${r.stage}`));
const w = a.find(x => x.startsWith('--write=')); if (w) fs.writeFileSync(path.resolve(B, w.slice(8)), Object.values(by).map(r => JSON.stringify(r)).join('\n') + '\n');
