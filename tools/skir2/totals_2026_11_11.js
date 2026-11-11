#!/usr/bin/env node
// 2026-11-11 (package SKIR2): road totals before -> after for several tags at once (SKIR1's tools/skir1/totals_2026_11_11.js rule: main maps = rows
// !side, !endless, mapNo <= 20, a curve target, the last row per fight; side maps apart): in band (green), within 10, beyond 20, mean |gap|, per
// map and in all, plus each fight's row in every tag.
//   node tools/skir2/totals_2026_11_11.js bal46w400 skir1w400 skir2w400   -> docs/balance/skir2/road-totals-<last tag>.json (+ a table on stdout)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const rowsOf = tag => { const by = {}, f = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`); if (!fs.existsSync(f)) throw new Error('no ' + f);
  fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map)); };
const g = r => Math.abs(r.win - r.target);
const sum = rows => ({ fights: rows.length, inBand: rows.filter(r => r.green === 'green').length, within10: rows.filter(r => g(r) <= 10).length, beyond20: rows.filter(r => g(r) > 20).length,
  meanGap: rows.length ? +(rows.reduce((t, r) => t + g(r), 0) / rows.length).toFixed(2) : null });
const tags = process.argv.slice(2), R = tags.map(rowsOf), last = tags[tags.length - 1];
const out = { about: `SKIR2 road totals (tools/skir2/totals_2026_11_11.js): ${tags.join(' -> ')}, the Map reference at 400 games`, tags, main: {}, side: {}, maps: {}, fights: {} };
tags.forEach((t, i) => { out.main[t] = sum(R[i].filter(r => !r.side)); out.side[t] = sum(R[i].filter(r => r.side)); });
const ids = [...new Set([].concat(...R.map(rs => rs.map(r => r.map))))], info = {}; R.forEach(rs => rs.forEach(r => { info[r.map] = { mapNo: r.mapNo, name: r.mapName, side: r.side }; }));
ids.sort((x, y) => info[x].mapNo - info[y].mapNo || (info[x].side ? 1 : 0) - (info[y].side ? 1 : 0));
for (const id of ids) { out.maps[id] = Object.assign({}, info[id]); tags.forEach((t, i) => { out.maps[id][t] = sum(R[i].filter(r => r.map === id)); });
  out.maps[id].off = R[R.length - 1].filter(r => r.map === id && r.green !== 'green').map(r => `${r.code} ${r.win}/${+r.target.toFixed(1)}`); }
R.forEach((rs, i) => rs.forEach(r => { (out.fights[r.code] = out.fights[r.code] || { target: +r.target.toFixed(1) })[tags[i]] = r.win; }));
const line = (k, s) => `${k.padEnd(16)} ${s.fights} fights, ${s.inBand} in band, ${s.within10} within 10, ${s.beyond20} beyond 20, mean |gap| ${s.meanGap}`;
tags.forEach(t => console.log(line('main ' + t, out.main[t]))); tags.forEach(t => console.log(line('side ' + t, out.side[t])));
ids.forEach(id => { const m = out.maps[id]; console.log(`${m.side ? '  side' : 'Map'} ${m.mapNo} ${id.padEnd(4)} ${tags.map(t => `${m[t].inBand}/${m[t].fights} (${m[t].meanGap})`).join(' -> ')}${m.off.length ? '  off: ' + m.off.join(', ') : ''}`); });
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'skir2'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir2', `road-totals-${last}.json`), JSON.stringify(out, null, 1) + '\n');
