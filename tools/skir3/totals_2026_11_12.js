#!/usr/bin/env node
// 2026-11-12 (package SKIR3): SKIR1's road totals (tools/skir1/totals_2026_11_11.js: main maps 0-20 and side maps apart, in band / within 10 / beyond 20 /
// mean |gap|, per map) written to docs/balance/skir3/road-totals-<after>.json.   node tools/skir3/totals_2026_11_12.js listfix3w400 skir3w400
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.resolve(__dirname, '..', 'skir1', 'totals_2026_11_11.js');
let src = fs.readFileSync(file, 'utf8');
const from = "path.join(ROOT, 'docs', 'balance', 'skir1', `road-totals-${B}.json`)";
if (!src.includes(from)) throw new Error('totals_2026_11_11.js changed');
src = src.replace(from, "path.join(ROOT, 'docs', 'balance', 'skir3', `road-totals-${B}.json`)").replace("about: `SKIR1 road totals (tools/skir1/totals_2026_11_11.js)", "about: `SKIR3 road totals (tools/skir3/totals_2026_11_12.js over SKIR1's)");
const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
mod._compile(src, file);
