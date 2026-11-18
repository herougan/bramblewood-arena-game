#!/usr/bin/env node
// 2026-11-18 (package SKWK2): SIDE2's pro_ease merge (tools/side2/pro_ease_merge_2026_11_13.js) for SKWK2's after-read. Parts (tools/opt/pro_ease.js,
// 40 games a pairing): skwk2-2-after-a (Maps 0-9 and side maps, every PRO / BPRO / WPRO deck vs map, ref2 and ladder-1..10), -b (Maps 10-20) and
// -c (Maps 21-24, PRO / BPRO vs map and ref2: tests/pref reads both sets from the newest file); then the patch reads, in order, each replacing
// its maps' rows: -d1 (Maps 7, 14) and -d2 (Maps 16, 20) after the follow-up (reverted / dropped decks, renumbered ids), -e1 (Maps 1, 7, 9) and
// -e2 (Maps 13, 20) after a dropped PRO deck went back on the maps left with one (tests/deck1). Output docs/balance/pro-ease-skwk2-2-after.json,
// the newest file with the ladder, which assemble_arena.py bakes as Admin's PRO marks.
//   node docs/balance/skwk2/pro_ease_merge_2026_11_18.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..'), DIR = path.join(ROOT, 'docs', 'balance');
const PARTS = ['skwk2-2-after-a', 'skwk2-2-after-b', 'skwk2-2-after-c'], PATCH = ['skwk2-2-after-d1', 'skwk2-2-after-d2', 'skwk2-2-after-e1', 'skwk2-2-after-e2'];
const read = t => JSON.parse(fs.readFileSync(path.join(DIR, 'pro-ease-' + t + '.json'), 'utf8'));
const runs = PARTS.map(read), pnames = PATCH.filter(t => fs.existsSync(path.join(DIR, 'pro-ease-' + t + '.json'))), patches = pnames.map(read);
let rows = [].concat(...runs.map(r => r.rows)); const patched = new Set();
patches.forEach(p => { const ids = new Set(p.maps.map(m => m.id)); ids.forEach(i => patched.add(i)); rows = rows.filter(r => !ids.has(r.mapId)).concat(p.rows); });
const maps = {}; runs.concat(patches).forEach(r => r.maps.forEach(m => { maps[m.id] = Object.assign(maps[m.id] || {}, m, { refs: Object.assign((maps[m.id] || {}).refs || {}, m.refs) }); }));
const all = runs.concat(patches), names = PARTS.concat(pnames), refs = [...new Set([].concat(...all.map(r => r.settings.refs)))];
const out = { about: 'Package SKWK2 (merge of its parts): the Map reference, Reference-2 and the 10 reference-ladder decks against every Maps 0-20 PRO / BPRO / WPRO deck (40 games a pairing), and the Map reference and Reference-2 against the Maps 21-24 PRO / BPRO decks, as tools/opt/pro_ease.js plays them; merged from ' + names.map(t => 'pro-ease-' + t + '.json').join(', ') + (patches.length ? ' (the patch reads replace their maps, in order: ' + [...patched].join(', ') + ')' : ''),
  tool: 'docs/balance/skwk2/pro_ease_merge_2026_11_18.js', generated: new Date().toISOString(), settings: { refs, games: Object.fromEntries(all.map((r, i) => [names[i], r.settings.games])), parts: names, maps: 'all (ladder 0-20)', kind: 'all' },
  maps: Object.values(maps).sort((a, b) => a.map - b.map || (a.side ? 1 : 0) - (b.side ? 1 : 0)), rows };
fs.writeFileSync(path.join(DIR, 'pro-ease-skwk2-2-after.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`-> docs/balance/pro-ease-skwk2-2-after.json: ${rows.length} rows, refs ${refs.length}${patches.length ? ', patched ' + [...patched].join(',') : ''}`);
