#!/usr/bin/env node
// Package PERF4 (2026-11-12, owner 00:43: "right now, we're really lagging as we play"). Static guardrails for the round-end redraw and the per-frame reads
// (no browser; run-all.sh runs this). Measuring: tools/perf/played_turn3.js (--prof --incl / --under <fn> / --events), tools/perf/dom_same4.js (DOM of a fight, kept vs redrawn).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
// 1. a live fight keeps its board rows and battle log across renderMatchUI (a switch, so the DOM of a kept and a redrawn fight can be compared)
ok(/const PERF4_KEEP_DOM = true;/.test(app), '1. PERF4_KEEP_DOM is on');
ok(/const keptRows = \(m\.over \|\| PERF4_KEEP_DOM\) \?/.test(app), '1. rows are kept in a live fight');
ok(/const keepLog = !!\(keptLog && keptLog\.__bwMatch === m && keptLog\.dataset\.pinWired\);/.test(app) && /if\(!keepLog\)\{ const pin0 = battleLogPinned;[^\n]*m\.log\.forEach\(renderLogLine\)/.test(app), '1. the battle log is not replayed into a kept box');
ok(/m\.log\.length < 200/.test(app), '1. a full (trimmed) 200-line log is replayed, not kept');
// 2. the card defs live 1 s during a fight (the 0 ms expiry rebuilt them on every render call)
ok(/matchState\.resolving \|\| !matchState\.over\)\) ms = 1000/.test(app), '2. card defs cache for a live fight');
// 3. the night-light loop reads the board's box at most every 250 ms
ok(/now - P\.rAt < 250 && P\.rect/.test(app), '3. night light caches the board rect');
console.log(`perf4-2026-11-12: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
