#!/usr/bin/env node
// Package UIFIN3 (2026-11-19): while the pack opener is open, toasts sit at the bottom edge (newest two) clear of the pile line. Static.
'use strict';
const fs = require('fs'), path = require('path');
const t = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
ok(/html\.po2-open \.toast-host\{top:auto !important; bottom:calc\(6px/.test(t), '1. toast host pinned to the bottom while po2-open');
ok(/html\.po2-open \.toast-host \.toast:nth-last-child\(n\+3\)\{display:none;\}/.test(t), '2. only the newest two toasts show');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'ok ' + n + ' checks'); process.exit(fail ? 1 : 0);
