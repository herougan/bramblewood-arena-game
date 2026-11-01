#!/usr/bin/env node
// 2026-11-02 (package BAL10): the road measure per map, from tools/skirmish_pass.js measure files (docs/balance/skirmish-pass-<tag>.jsonl):
// mean win rate against the mean road target, fights in the green band (ROAD_CURVE_TOL), and fights by the owner's tolerance ladder
// (docs/evaluation-protocol.md section 3: within 5 ideal, 5-10, 10-15, 15-20, beyond 20 unacceptable).
//   node tools/bal9/road_summary_2026_11_02.js <tag> [<tag2>] [--md out.md] [--json out.json]   (a second tag prints before -> after)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), tags = args.filter(a => !a.startsWith('--') && !/\.(md|json)$/.test(a));
const optv = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
function load(tag) {
  const f = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), by = {};
  fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; }); // the last line of a fight wins
  return Object.values(by).filter(r => r.target != null && r.curve !== false);
}
const pct = x => Math.round(x * 10) / 10;
function perMap(rows) {
  const m = {};
  rows.forEach(r => { const k = r.map; const e = m[k] = m[k] || { map: r.map, no: r.mapNo, side: r.side, name: r.mapName, n: 0, win: 0, target: 0, green: 0, ladder: [0, 0, 0, 0, 0], hard: [], easy: [] };
    e.n++; e.win += r.win; e.target += r.target; if (r.green === 'green') e.green++;
    const gap = r.win - r.target, a = Math.abs(gap), b = a <= 5 ? 0 : a <= 10 ? 1 : a <= 15 ? 2 : a <= 20 ? 3 : 4; e.ladder[b]++;
    if (gap < -15) e.hard.push(`${r.key} ${r.win}/${r.target}`); if (gap > 15) e.easy.push(`${r.key} ${r.win}/${r.target}`); });
  return Object.values(m).map(e => Object.assign(e, { win: pct(e.win / e.n), target: pct(e.target / e.n) })).sort((a, b) => a.no - b.no || (a.side ? 1 : 0) - (b.side ? 1 : 0) || (a.map < b.map ? -1 : 1));
}
const A = perMap(load(tags[0])), Bm = tags[1] ? perMap(load(tags[1])) : null;
const lines = ['| Map | Fights | Mean win | Target | Green | Ladder (<=5 / 10 / 15 / 20 / >20) | Over 15 off |', '|---|---|---|---|---|---|---|'];
A.forEach(e => { const b = Bm && Bm.find(x => x.map === e.map);
  const w = b ? `${e.win} -> ${b.win}` : `${e.win}`, g = b ? `${e.green} -> ${b.green}` : `${e.green}`, L = (b || e).ladder.join(' / ');
  const off = (b || e).hard.map(s => 'hard ' + s).concat((b || e).easy.map(s => 'easy ' + s)).join(', ');
  lines.push(`| ${e.no}${e.side ? ' ' + e.map : ''} ${e.name} | ${e.n} | ${w} | ${e.target} | ${g} | ${L} | ${off} |`); });
const all = rows => { const r = rows; return { fights: r.reduce((t, e) => t + e.n, 0), green: r.reduce((t, e) => t + e.green, 0), within10: r.reduce((t, e) => t + e.ladder[0] + e.ladder[1], 0), over20: r.reduce((t, e) => t + e.ladder[4], 0) }; };
const sa = all(A), sb = Bm && all(Bm);
lines.push('', `All: ${sa.fights} fights, green ${sa.green}${sb ? ' -> ' + sb.green : ''}, within 10 of target ${sa.within10}${sb ? ' -> ' + sb.within10 : ''}, beyond 20 ${sa.over20}${sb ? ' -> ' + sb.over20 : ''}`);
const out = lines.join('\n'); console.log(out);
if (optv('--md')) fs.writeFileSync(optv('--md'), out + '\n');
if (optv('--json')) fs.writeFileSync(optv('--json'), JSON.stringify({ before: A, after: Bm, totals: { before: sa, after: sb } }, null, 1) + '\n');
