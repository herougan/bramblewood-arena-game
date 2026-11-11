#!/usr/bin/env node
// 2026-11-12 (package SKIR3): LISTFIX3's PvP test-deck repair (tools/listfix3/pvp_2026_11_11.js: an out-of-play card's copies go to the best in-play card by
// PVP1's fill measure, legal, gauntletWin re-measured) on the owner's 11-12 lists, with SKIR3's record and note. Then: node tools/pvp1/pvp1.js apply
//   node tools/skir3/pvp_2026_11_12.js [--apply] [--workers 2]   -> canonical/pvp-test-decks.json, docs/balance/skir3/pvp-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.resolve(__dirname, '..', 'listfix3', 'pvp_2026_11_11.js');
let src = fs.readFileSync(file, 'utf8');
const rep = (from, to) => { if (!src.includes(from)) throw new Error('pvp_2026_11_11.js changed: ' + from); src = src.split(from).join(to); };
rep("path.join(ROOT, 'docs', 'balance', 'listfix3')", "path.join(ROOT, 'docs', 'balance', 'skir3')");
rep("path.join(ROOT, 'docs', 'balance', 'listfix3', 'pvp-2026-11-11.json')", "path.join(ROOT, 'docs', 'balance', 'skir3', 'pvp-2026-11-12.json')");
rep("'LISTFIX3 PvP test deck swaps (tools/listfix3/pvp_2026_11_11.js)'", "'SKIR3 PvP test deck swaps (tools/skir3/pvp_2026_11_12.js)'");
rep("key = 'lf3-' + d.id", "key = 'skir3-' + d.id");
rep("listfix3: `2026-11-11 (LISTFIX3): ${row.out.join(', ')} out of play since SKIR1's lists;", "skir3: `2026-11-12 (SKIR3): ${row.out.join(', ')} out of play on the owner's 11-12 lists;");
const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
mod._compile(src, file);
