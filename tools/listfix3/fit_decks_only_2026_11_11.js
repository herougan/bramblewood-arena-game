#!/usr/bin/env node
// 2026-11-11 (package LISTFIX3): tools/skir1/fit_2026_11_11.js with its Shield moves off: road retunes are deck swaps only (owner rule: no Shield or
// Health change unless the item says so). Same arguments, e.g.  node tools/listfix3/fit_decks_only_2026_11_11.js run --codes 16-1,16-5 --dir ../listfix3/fit2
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.resolve(__dirname, '..', 'skir1', 'fit_2026_11_11.js'), from = "if (m.id !== 'mpd') {", src = fs.readFileSync(file, 'utf8');
if (!src.includes(from)) throw new Error('fit_2026_11_11.js: no Shield-move block to turn off');
const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
mod._compile(src.replace(from, 'if (false) { // LISTFIX3: deck moves only'), file);
