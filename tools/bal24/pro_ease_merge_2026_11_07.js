#!/usr/bin/env node
// 2026-11-07 (package BAL24): merges pro_ease runs made in parts (the Map reference at 40 games; the reference ladder at 12 games a deck,
// Maps 0-9 and 10-20 side by side on 2 cores) into one file, docs/balance/pro-ease-bal24.json, which assemble_arena.py reads for Admin's PRO
// marks (the newest pro-ease-*.json that plays "map" and "ladder-k"). Prints the per-map table for the report.
//   node tools/opt/pro_ease.js --maps 0-20 --kind all --ref map --games 40 --tag bal24-map
//   node tools/opt/pro_ease.js --maps 0-9 --kind all --ref ladder --games 12 --tag bal24-ladder-a      (and 10-20, tag bal24-ladder-b)
//   node tools/bal24/pro_ease_merge_2026_11_07.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), DIR = path.join(ROOT, 'docs', 'balance');
const PARTS = (process.argv[2] || 'bal24-map,bal24-ladder-a,bal24-ladder-b').split(',');
const runs = PARTS.map(t => JSON.parse(fs.readFileSync(path.join(DIR, 'pro-ease-' + t + '.json'), 'utf8')));
const rows = [].concat(...runs.map(r => r.rows)), maps = {}; runs.forEach(r => r.maps.forEach(m => { maps[m.id] = Object.assign(maps[m.id] || {}, m, { refs: Object.assign((maps[m.id] || {}).refs || {}, m.refs) }); }));
const refs = [...new Set([].concat(...runs.map(r => r.settings.refs)))];
const out = { about: 'Package BAL24: the Map reference (40 games a deck) and the 10 simulated reference-ladder decks (12 games a deck each) against every PRO / BPRO / WPRO deck of Maps 0-20, as tools/opt/pro_ease.js plays them; merged from ' + PARTS.map(t => 'pro-ease-' + t + '.json').join(', ') + ' by tools/bal24/pro_ease_merge_2026_11_07.js. win = the reference\'s win rate.',
  tool: 'tools/bal24/pro_ease_merge_2026_11_07.js', generated: new Date().toISOString(), settings: { refs, games: Object.fromEntries(runs.map((r, i) => [PARTS[i], r.settings.games])), parts: PARTS, maps: '0-20', kind: 'all' },
  maps: Object.values(maps).sort((a, b) => a.map - b.map || (a.side ? 1 : 0) - (b.side ? 1 : 0)), rows };
fs.writeFileSync(path.join(DIR, 'pro-ease-bal24.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`-> docs/balance/pro-ease-bal24.json: ${rows.length} rows, refs ${refs.length}`);
