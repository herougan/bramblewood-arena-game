#!/usr/bin/env node
// 2026-11-11 (package SKIR2): SKIR1's reference-deck tool (tools/skir1/refdecks_2026_11_11.js: BAL16's 6/4 focused search, the PRO-1
// replacement rule) run unchanged on the maps whose lists SKIR2 changed, with its output in docs/balance/skir2/refdecks/ instead of SKIR1's.
// The decks keep source.package 'SKIR1' (the tests read it as "searched on the 2026-11-11 lists by SKIR1's tool") and add source.run 'SKIR2';
// their history entry and note name SKIR2. Same commands as SKIR1's:
//   node tools/skir2/refdecks_2026_11_11.js plan|run --kind bpro|pro|wpro|apply [--dry]|check  --maps mr,mu,...
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'skir1', 'refdecks_2026_11_11.js');
let src = fs.readFileSync(FILE, 'utf8');
const swaps = [
  [/path\.join\(ROOT, 'docs', 'balance', 'skir1', 'refdecks'\)/, "path.join(ROOT, 'docs', 'balance', 'skir2', 'refdecks')"],
  [/package: 'SKIR1', tool: res\.tool/g, "package: 'SKIR1', run: 'SKIR2', tool: res.tool"],
  [/package: 'SKIR1', plan: d\.plan/, "package: 'SKIR1', run: 'SKIR2', plan: d.plan"],
  [/const hist = \{ package: 'SKIR1', on: DATE, why: .*\};\n/, "const hist = { package: 'SKIR2', on: DATE, why: 'replaced by SKIR2\\'s re-run of SKIR1\\'s search (the 2026-11-11 lists with SKIR2\\'s adds)' };\n"],
  [/kept1: 'SKIR1 \(PRO-1 replacement rule\)/, "kept1: 'SKIR2 (PRO-1 replacement rule)"],
  [/\.concat\(\[`SKIR1: \$\{pro\.length\} PRO/, ".concat([`SKIR1: (re-run by SKIR2 on the amended list) ${pro.length} PRO"],
  [/about: 'SKIR1 reference decks per map \(apply report; tools\/skir1\/refdecks_2026_11_11\.js\)'/, "about: 'SKIR2 reference decks per map (apply report; tools/skir2/refdecks_2026_11_11.js running tools/skir1/refdecks_2026_11_11.js)'"],
];
for (const [re, to] of swaps) { if (!re.test(src)) throw new Error('SKIR1 refdecks tool changed: ' + re); src = src.replace(re, to); }
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
// run as the main module so its own command line runs (require.main === module inside it)
process.mainModule = m; require.main = m; m._compile(src.replace("if (require.main === module) main(", "if (true) main("), FILE);
