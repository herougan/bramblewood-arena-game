#!/usr/bin/env node
// 2026-11-13 (package SIDE2): BAL24's pro_ease merge (tools/bal26/pro_ease_merge_2026_11_07.js) for the re-measure after SIDE2's side-map decks:
// parts side2-map (the Map reference and Reference-2 at 40 games, every PRO / BPRO / WPRO deck of canonical/pro-skirmishes.json: tests/pref reads
// both sets from the newest file) and side2-ladder-a / -b (the 10 reference-ladder decks at 12 games, Maps 0-9 and 10-20: Admin's PRO marks),
// output docs/balance/pro-ease-side2.json.
//   node tools/side2/pro_ease_merge_2026_11_13.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), DIR = path.join(ROOT, 'docs', 'balance');
const PARTS = ['side2-map', 'side2-ladder-a', 'side2-ladder-b'];
const runs = PARTS.map(t => JSON.parse(fs.readFileSync(path.join(DIR, 'pro-ease-' + t + '.json'), 'utf8')));
const rows = [].concat(...runs.map(r => r.rows)), maps = {}; runs.forEach(r => r.maps.forEach(m => { maps[m.id] = Object.assign(maps[m.id] || {}, m, { refs: Object.assign((maps[m.id] || {}).refs || {}, m.refs) }); }));
const refs = [...new Set([].concat(...runs.map(r => r.settings.refs)))];
const out = { about: 'Package SIDE2 (merge of BAL24\'s parts): the Map reference and Reference-2 (40 games a deck, every map) and the 10 reference-ladder decks (12 games a deck, Maps 0-20) against every PRO / BPRO / WPRO deck, as tools/opt/pro_ease.js plays them; merged from ' + PARTS.map(t => 'pro-ease-' + t + '.json').join(', '),
  tool: 'tools/side2/pro_ease_merge_2026_11_13.js', generated: new Date().toISOString(), settings: { refs, games: Object.fromEntries(runs.map((r, i) => [PARTS[i], r.settings.games])), parts: PARTS, maps: 'all (ladder 0-20)', kind: 'all' },
  maps: Object.values(maps).sort((a, b) => a.map - b.map || (a.side ? 1 : 0) - (b.side ? 1 : 0)), rows };
fs.writeFileSync(path.join(DIR, 'pro-ease-side2.json'), JSON.stringify(out, null, 1) + '\n');
// the protocol's marks (docs/evaluation-protocol.md section 3): N-SK too weak = the Map reference over 85% against a PRO / BPRO deck; N-WK too
// strong = under 50% against a WPRO deck; PRO vs the ladder 15-30% (the ladder's losses)
const by = {}; rows.forEach(r => { (by[r.mapId] = by[r.mapId] || []).push(r); });
const flags = [];
Object.entries(by).forEach(([mid, rs]) => { const m = maps[mid] || {};
  const sk = rs.filter(r => r.ref === 'map' && r.kind !== 'wpro' && r.win > 0.85).map(r => r.id), wk = rs.filter(r => r.ref === 'map' && r.kind === 'wpro' && r.win < 0.5).map(r => r.id);
  const lad = rs.filter(r => /^ladder-/.test(r.ref) && r.kind !== 'wpro'), lw = lad.length ? 1 - lad.reduce((t, r) => t + r.win, 0) / lad.length : null;
  flags.push({ map: mid, no: m.map, side: !!m.side, skTooWeak: sk, wkTooStrong: wk, proVsLadder: lw == null ? null : Math.round(lw * 1000) / 10 }); });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'side2', 'pro-marks-2026-11-13.json'), JSON.stringify({ about: 'SIDE2: N-SK / N-WK marks from pro-ease-side2.json (85% / 50%; PRO vs ladder 15-30%)', flags: flags.sort((a, b) => a.no - b.no) }, null, 1) + '\n');
console.log(`-> docs/balance/pro-ease-side2.json: ${rows.length} rows, refs ${refs.length}`);
flags.filter(f => f.side || f.skTooWeak.length || f.wkTooStrong.length).forEach(f => console.log(`${f.map} (${f.no}${f.side ? ' side' : ''}): SK too weak ${f.skTooWeak.join(',') || '-'} | WK too strong ${f.wkTooStrong.join(',') || '-'} | PRO vs ladder ${f.proVsLadder}%`));
