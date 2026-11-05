#!/usr/bin/env node
// 2026-11-05 (package BAL16): the final road measure = the base measure's rows, with each fight replaced by a later measure's row when that row
// played the fight's current deck (arena_app.js); prints the fights whose current deck no measure played (to measure again).
//   node tools/bal16/merge_measure_2026_11_05.js <out-tag> <base-tag> <later-tag> [<later-tag> ...]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const [out, ...tags] = process.argv.slice(2), file = t => path.join(ROOT, 'docs', 'balance', `skirmish-pass-${t}.jsonl`);
const by = {}, key = r => r.map + ':' + r.key, same = (a, b) => JSON.stringify(Object.keys(a || {}).sort().map(k => [k, a[k]])) === JSON.stringify(Object.keys(b || {}).sort().map(k => [k, b[k]]));
tags.forEach(t => fs.readFileSync(file(t), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { const n = B.byKey(r.map, r.key); if (!n || same(n.deck, r.deck) || !by[key(r)]) by[key(r)] = r; }));
const stale = Object.values(by).filter(r => { const n = B.byKey(r.map, r.key); return n && !same(n.deck, r.deck); }).map(r => r.code);
fs.writeFileSync(file(out), Object.values(by).map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(`${Object.keys(by).length} fights -> ${path.relative(ROOT, file(out))}; not played on the current deck: ${stale.join(',') || 'none'}`);
