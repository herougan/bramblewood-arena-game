#!/usr/bin/env node
// 2026-11-12 (SKIR3 follow-up): SKIR3 only swapped the PRO / BPRO / WPRO decks to legal cards, and they fail deck1, skill2 and bal11-wk on the
// owner's 11-12 lists. SKIR2's wrapper (tools/skir2/refdecks_2026_11_11.js) copied: SKIR1's tool (BAL16's 6/4 focused search, the PRO-1
// replacement rule) run unchanged on Maps 0-20 and their side maps, output in docs/balance/skir3/refdecks/. The decks keep source.package
// 'SKIR1' (the tests read it as "searched by SKIR1's tool") and add source.run 'SKIR3'; their history entry and note name SKIR3. Same commands:
//   node tools/skir3/refdecks_2026_11_12.js plan|run --kind bpro|pro|wpro|apply [--dry]|check  --maps mr,mu,...
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'skir1', 'refdecks_2026_11_11.js');
let src = fs.readFileSync(FILE, 'utf8');
const swaps = [
  [/path\.join\(ROOT, 'docs', 'balance', 'skir1', 'refdecks'\)/, "path.join(ROOT, 'docs', 'balance', 'skir3', 'refdecks')"],
  [/package: 'SKIR1', tool: res\.tool/g, "package: 'SKIR1', run: 'SKIR3', tool: res.tool"],
  [/package: 'SKIR1', plan: d\.plan/, "package: 'SKIR1', run: 'SKIR3', plan: d.plan"],
  [/const hist = \{ package: 'SKIR1', on: DATE, why: .*\};\n/, "const hist = { package: 'SKIR3', on: '2026-11-12', why: 'replaced by the re-run of SKIR1\\'s search on the owner\\'s 11-12 lists (SKIR3)' };\n"],
  [/kept1: 'SKIR1 \(PRO-1 replacement rule\)/, "kept1: 'SKIR3 (PRO-1 replacement rule)"],
  [/\.concat\(\[`SKIR1: \$\{pro\.length\} PRO/, ".concat([`SKIR1: (re-run on the owner's 11-12 lists, SKIR3) ${pro.length} PRO"],
  [/about: 'SKIR1 reference decks per map \(apply report; tools\/skir1\/refdecks_2026_11_11\.js\)'/, "about: 'SKIR3 reference decks per map (apply report; tools/skir3/refdecks_2026_11_12.js running tools/skir1/refdecks_2026_11_11.js)'"],
];
for (const [re, to] of swaps) { if (!re.test(src)) throw new Error('SKIR1 refdecks tool changed: ' + re); src = src.replace(re, to); }
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
// run as the main module so its own command line runs (require.main === module inside it)
process.mainModule = m; require.main = m; m._compile(src.replace("if (require.main === module) main(", "if (true) main("), FILE);
