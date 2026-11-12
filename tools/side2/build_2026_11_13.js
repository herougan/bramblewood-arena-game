#!/usr/bin/env node
// 2026-11-13 (package SIDE2, SIDE1 phase B step 3): SKIR1's builder (tools/skir1/build_2026_11_11.js, its rules unchanged) re-cards the side maps'
// fights on their new lists (SIDE1, canonical/map-pools.json). What differs: the plan goes to docs/balance/side2/build-plan-2026-11-13.json (SKIR1's
// plan stays its record); the peak strategies come from SIDE2's BPRO search (docs/balance/side2/refdecks/bpro) when it has run, else the file's
// decks; a map counts as already re-carded when its lines carry a SIDE2 comment (SKIR1's comments no longer stop it); the comments name SIDE2.
//   node tools/side2/build_2026_11_13.js plan --maps mo,mq,...   then   apply [--maps ...]   (rebuild after)
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'skir1', 'build_2026_11_11.js');
let src = fs.readFileSync(FILE, 'utf8');
const swaps = [
  ["path.join(ROOT, 'docs', 'balance', 'skir1', 'build-plan-2026-11-11.json')", "path.join(ROOT, 'docs', 'balance', 'side2', 'build-plan-2026-11-13.json')"],
  ["path.join(ROOT, 'docs', 'balance', 'skir1', 'refdecks', 'bpro',", "path.join(ROOT, 'docs', 'balance', 'side2', 'refdecks', 'bpro',"],
  [".*\\\\(SKIR1`, 'm')", ".*\\\\(SIDE2`, 'm')"],
  ["/* 2026-11-11 (SKIR1): rebuilt from the map's 2026-11-11 list, THEME5 plan:", "/* 2026-11-13 (SIDE2): re-carded from the side map's SIDE1 list (11-12), SKIR1's builder, THEME5 plan:"],
  ["!/\\(SKIR1/.test(mm[1])", "!/\\(SIDE2/.test(mm[1])"],
  ["/* 2026-11-11 (SKIR1): its Auto showcase leader, pinned */", "/* 2026-11-13 (SIDE2): its Auto showcase leader, pinned */"],
  ["about: 'SKIR1 build plan (tools/skir1/build_2026_11_11.js)", "about: 'SIDE2 build plan (tools/side2/build_2026_11_13.js running tools/skir1/build_2026_11_11.js)"],
];
for (const [a, b] of swaps) { if (!src.includes(a)) throw new Error('SKIR1 builder changed: ' + a); src = src.split(a).join(b); }
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
process.mainModule = m; require.main = m; m._compile(src, FILE);
