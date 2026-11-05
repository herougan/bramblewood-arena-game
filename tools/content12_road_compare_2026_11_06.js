#!/usr/bin/env node
// CONTENT12 (2026-11-06): two road measures on the same fights (the last line per fight wins; fights with a curve target), as
// tools/bal16/road_totals_2026_11_05.js counts them: green band (target +/- 8), within 10, beyond 20; and the fights that moved 10+ points.
//   node tools/content12_road_compare_2026_11_06.js <before-tag> <after-tag>
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rows = tag=>{ const by = {}; fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)).forEach(r=>{ by[r.map + ':' + r.key] = r; });
  return Object.fromEntries(Object.entries(by).filter(([, r])=> r.target != null && r.curve !== false)); };
const [A, B] = process.argv.slice(2), a = rows(A), b = rows(B), keys = Object.keys(b).filter(k=> a[k]);
const tot = (R)=>{ const g = keys.map(k=> R[k].win - R[k].target); return {fights: g.length, band: g.filter(x=> Math.abs(x) <= 8).length, within10: g.filter(x=> Math.abs(x) <= 10).length, beyond20: g.filter(x=> Math.abs(x) > 20).length, meanWin: Math.round(10 * keys.reduce((t, k)=> t + R[k].win, 0) / keys.length) / 10}; };
console.log('same fights:', keys.length, '| only in', B + ':', Object.keys(b).filter(k=> !a[k]).length);
console.log(A, JSON.stringify(tot(a))); console.log(B, JSON.stringify(tot(b)));
keys.filter(k=> Math.abs(b[k].win - a[k].win) >= 10).sort((x, y)=> (b[y].win - a[y].win) - (b[x].win - a[x].win)).forEach(k=> console.log(' ', b[k].code, b[k].name, a[k].win, '->', b[k].win, 'target', b[k].target));
