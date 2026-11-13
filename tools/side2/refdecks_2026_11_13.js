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
// the same stall guard for the weak-plan search (SKIR1's weakMap: `while (ev.games < budget)`), as one more swap on SKIR1's source
{ const at = 'const swaps = [\n'; if (!src.includes(at)) throw new Error('SKIR3 refdecks wrapper changed: no swaps list');
  src = src.replace(at, at + String.raw`  [/while \(ev\.games < budget\) \{\n/, "let stallW = 0, lastW = -1; while (ev.games < budget) { if (ev.games === lastW) { if (++stallW > 40) break; } else { stallW = 0; lastW = ev.games; }\n"],` + '\n'); }
// 2026-11-13 (SIDE2): a stall guard for the focused search (tools/bench/deck.js, loaded patched into the require cache for this run only; the file
// itself is another package's). The Canopy's BPRO search (11 cards) ran 3.5 hours without ending: once every neighbour of the best deck is already
// read, O.halving plays no new game, so `used() < share` never turns false and `fail` resets every 3 tries. A focus now stops after 40 turns in
// a row that play no new game; a search that never stalls plays exactly as before.
{
  const DECK = path.join(__dirname, '..', 'bench', 'deck.js'); let ds = fs.readFileSync(DECK, 'utf8');
  const a0 = 'while (used() < share) {\n';
  if (!ds.includes(a0)) throw new Error('tools/bench/deck.js changed: no search loop to guard');
  ds = ds.replace(a0, "let stall = 0, lastG = -1; while (used() < share) { if (ev.games === lastG) { if (++stall > 40) { log(`  ${f.id}: stalled (every neighbour already read), stopping at ${used()} games`); break; } } else { stall = 0; lastG = ev.games; }\n");
  const dm = new Module(DECK, module); dm.filename = DECK; dm.paths = Module._nodeModulePaths(path.dirname(DECK)); dm._compile(ds, DECK); dm.loaded = true; require.cache[DECK] = dm;
}
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
process.mainModule = m; require.main = m; m._compile(src, FILE);
