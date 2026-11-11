#!/usr/bin/env node
// 2026-11-12 (package SKIR3): drops from a road read (docs/balance/skirmish-pass-<tag>.jsonl) the rows of fights whose deck or Shield changed since
// they were read, so `node tools/skirmish_pass.js measure 400 ... --tag=<tag>` (resumable) reads only those again. The dropped rows are kept in
// docs/balance/skir3/stale-<tag>.jsonl (the before of each re-read).   node tools/skir3/stale_2026_11_12.js skir3w400
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), tag = process.argv[2];
const B = require('../lib_bramble.js'), cur = {}; B.MAPS.forEach(m => (m.nodes || []).forEach(n => { if (n.deck) cur[m.id + ':' + n.key] = n; }));
const key = d => Object.keys(d || {}).sort().map(k => k + d[k]).join(',');
const F = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), rows = fs.readFileSync(F, 'utf8').trim().split('\n').map(JSON.parse);
const stale = r => { const n = cur[r.map + ':' + r.key]; if (!n) return false; let sh; try { sh = B.G.skirmishCastle(n).shield; } catch (e) { sh = r.shield; } return key(n.deck) !== key(r.deck) || sh !== r.shield; };
const keep = rows.filter(r => !stale(r)), gone = rows.filter(stale);
fs.writeFileSync(F, keep.map(r => JSON.stringify(r)).join('\n') + '\n');
fs.appendFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', `stale-${tag}.jsonl`), gone.map(r => JSON.stringify(r)).join('\n') + (gone.length ? '\n' : ''));
console.log(`${gone.length} stale rows dropped: ${gone.map(r => r.code).join(', ')}`);
