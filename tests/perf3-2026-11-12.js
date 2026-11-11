#!/usr/bin/env node
// Package PERF3 (2026-11-12, owner 00:43: "right now, we're really lagging as we play"). Static guardrails for what the profiling found (no browser; run-all.sh runs this).
// The measuring tools are tools/perf/played_turn3.js (a human-paced fight, per phase CPU / style passes / long tasks, --stacks, --selectors, --prof),
// tools/perf/fight3_profile.js (Auto-play CPU profile), tools/perf/startup3.js (load) and tools/perf/leak3.js (several fights in one page: counters must plateau).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const tpl = read('arena_template.html'), app = read('arena_app.js');
const css = tpl.replace(/\/\*[\s\S]*?\*\//g, '');
// 1. no :has() on <body> / <html> (every DOM change of a fight re-checked the whole page: 28% of a fight's style time)
ok(!/(^|[\s,{}])(body|html)\s*:has\(/m.test(css), '1. no body:has() / html:has() rule in the CSS');
ok(/body\.pg-has-ds2 #cardPop/.test(tpl) && /body\.pg-pack-open #cardPop/.test(tpl) && /html\.bw-touch-dragging, body\.bw-touch-dragging/.test(tpl), '1. #cardPop and the touch drag use body / html classes');
ok(/'pg-has-ds2'/.test(app) && /'pg-pack-open'/.test(app) && /documentElement\.classList\.add\('bw-touch-dragging'\)/.test(app) && /documentElement\.classList\.remove\('bw-touch-dragging'\)/.test(app), '1. syncPageFlags and the drag keep those classes in step');
// 2. a long :is() list as the right-hand part of a descendant rule is tried on every element
ok(!/:where\(html\[data-fx="none"\], html\[data-fx="low"\]\) :is\(/.test(css), '2. no `:where(html[data-fx]) :is(...)` rule');
// 3. startup: the card-data hash is not worked out at load
ok(!/^const BASELINE_CARD_HASH/m.test(app) && /function baselineCardHash\(\)\{ if\(_baselineHash === null\)/.test(app), '3. the baseline card hash is lazy');
ok(!/BASELINE_CARD_HASH/.test(app.replace(/\/\/.*$/gm, '')), '3. nothing reads the old constant');
// 4. no computed-style read per pip on a board redraw; the top-row fit is not re-measured for the same viewport and row
ok(/const VIS3_CLS_OFF = new Map\(\);[\s\S]{0,200}const ck = img\.classList\.contains\('emo'\) \? img\.className : null;/.test(app), '4. pip offsets are cached by class');
ok(/fitTopRowControls\._memo/.test(app) && /memo\.sig === sig && document\.fonts && document\.fonts\.status === 'loaded'/.test(app), '4. fitTopRowControls re-applies its last answer');
console.log(`perf3-2026-11-12: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
