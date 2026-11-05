#!/usr/bin/env node
// 2026-11-05 (package BAL16): the road totals of a road measure (tools/skirmish_pass.js measure 40 ... --tag=<tag> --maxmap=20), the way
// tools/bal13/summary_2026_11_02.js counts them (fights with a curve target, the last line per fight wins): in the green band (target +/- 8),
// within 10, beyond 20, out of all; and the maps by mean |gap| (the worst first).
//   node tools/bal16/road_totals_2026_11_05.js <tag> [<tag2> ...] [--json out.json] [--worst 6]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
function rowsOf(tag) {
  const f = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), by = {};
  fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && r.curve !== false);
}
function totals(rows, worstN) {
  const gap = r => r.win - r.target, maps = {};
  rows.forEach(r => { const k = r.map; (maps[k] = maps[k] || { map: r.map, mapNo: r.mapNo, side: r.side, name: r.mapName, rows: [] }).rows.push(r); });
  const per = Object.values(maps).map(m => ({ map: m.map, mapNo: m.mapNo, side: m.side, name: m.name, fights: m.rows.length, green: m.rows.filter(r => r.green === 'green').length,
    meanAbsGap: Math.round(m.rows.reduce((t, r) => t + Math.abs(gap(r)), 0) / m.rows.length * 10) / 10, meanGap: Math.round(m.rows.reduce((t, r) => t + gap(r), 0) / m.rows.length * 10) / 10,
    beyond20: m.rows.filter(r => Math.abs(gap(r)) > 20).length })).sort((a, b) => b.meanAbsGap - a.meanAbsGap);
  return { fights: rows.length, green: rows.filter(r => r.green === 'green').length, within10: rows.filter(r => Math.abs(gap(r)) <= 10).length, beyond20: rows.filter(r => Math.abs(gap(r)) > 20).length,
    meanWin: Math.round(rows.reduce((t, r) => t + r.win, 0) / rows.length * 10) / 10, worst: per.slice(0, worstN), maps: per,
    beyond20Fights: rows.filter(r => Math.abs(gap(r)) > 20).sort((a, b) => Math.abs(gap(b)) - Math.abs(gap(a))).map(r => ({ code: r.code, map: r.map, win: r.win, target: r.target, gap: Math.round(gap(r)) })) };
}
module.exports = { rowsOf, totals };
if (require.main === module) {
  const a = process.argv.slice(2), tags = a.filter((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--')), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const N = +arg('--worst', 6), out = {};
  tags.forEach(t => { const T = totals(rowsOf(t), N); out[t] = T;
    console.log(`${t}: ${T.fights} fights, ${T.green} in band, ${T.within10} within 10, ${T.beyond20} beyond 20, mean win ${T.meanWin}`);
    console.log('  worst: ' + T.worst.map(m => `${m.mapNo}${m.side ? ' ' + m.map : ''} ${m.name} (|gap| ${m.meanAbsGap}, mean ${m.meanGap > 0 ? '+' : ''}${m.meanGap}, ${m.green}/${m.fights} green)`).join('; ')); });
  if (arg('--json', null)) fs.writeFileSync(path.join(ROOT, arg('--json')), JSON.stringify(out, null, 1) + '\n');
}
