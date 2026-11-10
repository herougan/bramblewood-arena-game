#!/usr/bin/env node
// 2026-11-11 (package SKIR1): road totals per map and in all, before (a tag, e.g. bal46w400) and after (e.g. skir1w400): in band (green), within
// 10, beyond 20, mean |gap|; main maps (rows !side, !endless, mapNo <= 20, a curve target; the last row per fight wins, as BAL46's main_totals)
// and side maps apart. Writes docs/balance/skir1/road-totals-<after>.json.
//   node tools/skir1/totals_2026_11_11.js bal46w400 skir1w400
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const rowsOf = tag => { const by = {}; const f = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`); if (!fs.existsSync(f)) return [];
  fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map)); };
const g = r => Math.abs(r.win - r.target);
const sum = rows => ({ fights: rows.length, inBand: rows.filter(r => r.green === 'green').length, within10: rows.filter(r => g(r) <= 10).length, beyond20: rows.filter(r => g(r) > 20).length,
  meanGap: rows.length ? +(rows.reduce((t, r) => t + g(r), 0) / rows.length).toFixed(2) : null, meanWin: rows.length ? +(rows.reduce((t, r) => t + r.win, 0) / rows.length).toFixed(1) : null });
const [A, B] = process.argv.slice(2), ra = rowsOf(A), rb = rowsOf(B);
const byMap = rows => { const o = {}; rows.forEach(r => { (o[r.map] = o[r.map] || { mapNo: r.mapNo, name: r.mapName, side: r.side, rows: [] }).rows.push(r); }); return o; };
const ma = byMap(ra), mb = byMap(rb), maps = [...new Set(Object.keys(ma).concat(Object.keys(mb)))].sort((x, y) => ((ma[x] || mb[x]).mapNo - (ma[y] || mb[y]).mapNo) || ((ma[x] || mb[x]).side ? 1 : 0) - ((ma[y] || mb[y]).side ? 1 : 0));
const out = { about: `SKIR1 road totals (tools/skir1/totals_2026_11_11.js): ${A} -> ${B}, the Map reference`, before: A, after: B,
  main: { before: sum(ra.filter(r => !r.side)), after: sum(rb.filter(r => !r.side)) }, side: { before: sum(ra.filter(r => r.side)), after: sum(rb.filter(r => r.side)) }, maps: {} };
for (const id of maps) { const x = ma[id] || mb[id]; out.maps[id] = { mapNo: x.mapNo, name: x.name, side: x.side, before: sum((ma[id] || { rows: [] }).rows), after: sum((mb[id] || { rows: [] }).rows),
  off: (mb[id] || { rows: [] }).rows.filter(r => r.green !== 'green').map(r => `${r.code} ${r.win}/${+r.target.toFixed(1)}`) }; }
const line = (k, s) => `${k}: ${s.fights} fights, ${s.inBand} in band, ${s.within10} within 10, ${s.beyond20} beyond 20, mean |gap| ${s.meanGap}`;
console.log(line('main ' + A, out.main.before)); console.log(line('main ' + B, out.main.after)); console.log(line('side ' + A, out.side.before)); console.log(line('side ' + B, out.side.after));
Object.entries(out.maps).forEach(([id, m]) => console.log(`${m.side ? '  side' : 'Map'} ${m.mapNo} ${id.padEnd(4)} ${m.before.inBand}/${m.before.fights} |gap| ${m.before.meanGap} -> ${m.after.inBand}/${m.after.fights} |gap| ${m.after.meanGap}${m.off.length ? '  off: ' + m.off.join(', ') : ''}`));
if (B) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir1', `road-totals-${B}.json`), JSON.stringify(out, null, 1) + '\n');
