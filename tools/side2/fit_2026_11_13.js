#!/usr/bin/env node
// 2026-11-13 (package SIDE2): SKIR1's fit (tools/skir1/fit_2026_11_11.js, its rules and moves unchanged) for the re-carded side-map fights and the
// SK-anchored enders (easing: copies and cards swapped down, the fit's Shield moves). Only the comment it writes into arena_app.js names SIDE2
// and today. Same commands: run --codes ... --dir ../side2/fit [--resume]; apply --dir ../side2/fit [--codes ...]
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'skir1', 'fit_2026_11_11.js');
let src = fs.readFileSync(FILE, 'utf8');
const a = '/* 2026-11-11 (SKIR1 fit): toward the road curve', b = '/* 2026-11-13 (SIDE2 fit, SKIR1\'s fit on the SIDE1 lists): toward the road curve';
if (!src.includes(a)) throw new Error('SKIR1 fit changed: ' + a); src = src.split(a).join(b);
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
process.mainModule = m; require.main = m; m._compile(src, FILE);
