#!/usr/bin/env node
// 2026-11-12 (package SKIR3): LISTFIX3's wider deck search (tools/listfix3/jump_2026_11_11.js: random walks of 1-4 legal moves of up to 4 copies,
// read at 48 games, the 6 nearest at 200 on the road seeds, kept when 2+ points nearer) for the fights SKIR1's fit could not move on the 11-12 lists;
// --slack 1 lets a card into one more of the map's fights than the usage line (SKIR1's slack rule; each such map is named in the record).
// Writes SKIR1's fit format to docs/balance/skir3/<dir>/<code>.json for tools/skir3/decks_2026_11_12.js fitapply --dir <dir>.
//   node tools/skir3/jump_2026_11_12.js --codes 7-6,2-2 [--walks 160] [--dir jump] [--slack 1] [--seed 7]
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.resolve(__dirname, '..', 'listfix3', 'jump_2026_11_11.js');
let src = fs.readFileSync(file, 'utf8');
const rep = (from, to) => { if (!src.includes(from)) throw new Error('jump_2026_11_11.js changed: ' + from); src = src.split(from).join(to); };
rep("path.join(ROOT, 'docs', 'balance', 'listfix3', arg('--dir', 'fit3'))", "path.join(ROOT, 'docs', 'balance', 'skir3', arg('--dir', 'jump'))");
rep("ucap = L.ucapOf(m), use = {};", "ucap = L.ucapOf(m) + (+arg('--slack', 0)), use = {};");
rep("about: 'LISTFIX3 jump search (tools/listfix3/jump_2026_11_11.js)'", "about: 'SKIR3 jump search (tools/skir3/jump_2026_11_12.js over tools/listfix3/jump_2026_11_11.js)', slack: +arg('--slack', 0)");
const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
mod._compile(src, file);
