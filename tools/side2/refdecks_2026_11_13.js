#!/usr/bin/env node
// 2026-11-13 (package SIDE2, SIDE1 phase B step 1): SKIR3's focused search (tools/skir3/refdecks_2026_11_12.js, which runs SKIR1's tool with its
// fixes) on the side maps' new lists (SIDE1, canonical/map-pools.json). Only the output folder and the labels differ: docs/balance/side2/refdecks/
// (so SKIR3's side-map searches on the older lists stay as its record, and a killed run resumes: a map with a result file is skipped), and the
// decks' source.run / history name SIDE2. Same commands:
//   node tools/side2/refdecks_2026_11_13.js plan|run --kind bpro|pro|wpro|apply [--dry]|check  --maps mo,mq,...
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'skir3', 'refdecks_2026_11_12.js');
let src = fs.readFileSync(FILE, 'utf8');
const swaps = [
  [/"path\.join\(ROOT, 'docs', 'balance', 'skir3', 'refdecks'\)"/, `"path.join(ROOT, 'docs', 'balance', 'side2', 'refdecks')"`],
  [/run: 'SKIR3'/g, "run: 'SIDE2'"],
  [/\{ package: 'SKIR3', on: '2026-11-12', why: '[^}]*\(SKIR3\)' \}/, "{ package: 'SIDE2', on: '2026-11-13', why: 'replaced by the re-run of SKIR1\\\\'s search on the SIDE1 side lists (SIDE2)' }"],
];
for (const [re, to] of swaps) { if (!re.test(src)) throw new Error('SKIR3 refdecks wrapper changed: ' + re); src = src.replace(re, to); }
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
process.mainModule = m; require.main = m; m._compile(src, FILE);
