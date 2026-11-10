#!/usr/bin/env node
// 2026-11-10 (package BAL45): main-map-only road totals (rows with side false, curve target, last line per fight wins, as
// tools/bal16/road_totals_2026_11_05.js counts them): in band (lo..hi), within 10, beyond 20, mean win, mean |gap|; the fights whose win
// moved between two tags; and the main-map fights still 6+ from target.
//   node tools/bal45/main_totals_2026_11_10.js bal44w200 bal45w200
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const rowsOf = tag => { const by = {};
  fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && r.curve !== false); };
const [A, B] = process.argv.slice(2), ra = rowsOf(A), rb = rowsOf(B);
const tot = (tag, rows) => { const m = rows.filter(r => !r.side), g = r => Math.abs(r.win - r.target);
  console.log(`main maps only ${tag}: ${m.length} fights, ${m.filter(r => r.win >= r.lo && r.win <= r.hi).length} in band, ${m.filter(r => g(r) <= 10).length} within 10, ${m.filter(r => g(r) > 20).length} beyond 20, mean win ${(m.reduce((t, r) => t + r.win, 0) / m.length).toFixed(1)}, mean |gap| ${(m.reduce((t, r) => t + g(r), 0) / m.length).toFixed(2)}`); };
tot(A, ra); tot(B, rb);
const ia = new Map(ra.map(r => [r.map + ':' + r.key, r]));
const moved = rb.filter(r => { const o = ia.get(r.map + ':' + r.key); return o && o.win !== r.win; }).map(r => `${r.code} ${ia.get(r.map + ':' + r.key).win}->${r.win} (t ${+r.target.toFixed(1)}${r.side ? ', side' : ''})`);
console.log('fights whose win moved:', moved.join(', '));
console.log('main-map fights still 6+ from target in', B + ':', rb.filter(r => !r.side && Math.abs(r.win - r.target) >= 6).map(r => `${r.code} ${r.win}/${+r.target.toFixed(1)}`).join(', '));
