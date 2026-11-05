#!/usr/bin/env node
// 2026-11-04 (package UI20): static checks, no browser. The cost and wait badges leave the card name alone:
//   1 nmHTML tells the scroll how wide the badges are (--nm-cem, --nm-wem); the three tile builders pass the cost parts and the Wait
//   2 the CSS narrows the scroll from those widths and does not shrink the name
//   3 the width helpers behave (pips, a number icon, none)
// The browser check (every screen and size, 1366 and 390) is python3 tests/e2e/ui20_2026_11_04.py (not run by run.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const grab = (name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
// 1
ok(/function nmHTML\(name, costParts, wait\)/.test(src), '1. nmHTML takes the cost parts and the Wait');
ok(/nmHTML\(d\.name\|\|live\.fallbackName\|\|'', costParts, live\.waitHTML \? 0 : d\.wait\)/.test(src), '1. the board / hand tile passes them');
ok(/nmHTML\(d\.name\|\|'', costParts, d\.wait\)/.test(src), '1. the full tile passes them');
ok(/nmHTML\(d\.name\|\|'', null, d\.wait\)/.test(src), '1. the drag ghost passes its Wait');
// 2
ok(/--nm-reach:/.test(css) && /--nm-edge:/.test(css) && /max-width:min\(94%, calc\(100% - 2 \* var\(--nm-edge\)\)\)/.test(css), '2. the scroll is narrowed by the badges\' reach');
ok(/\.card-tile:has\(> \.waitbadge\[data-wait-total\]\) > \.nm\{--nm-ring:/.test(css), '2. the live wait ring has its own reach');
const blk = css.slice(css.indexOf('package UI20, owner 11-04'));
ok(!/--nm-s\b/.test(blk.slice(0, 1800).split('2026-11-05 23:39')[0]), '2. the name is not shrunk for the badges'); // 2026-11-05 23:39 (owner: names broke mid-word): after UI20 a name shrinks only until its longest word fits (--nm-lw), so the check reads the block before that rule
// 3
const ctx = {}; vm.createContext(ctx); vm.runInContext(grab('nmPartsEm') + grab('nmWaitEm') + ';this.a = nmPartsEm; this.b = nmWaitEm;', ctx);
ok(ctx.b(0) === 0 && ctx.b(1) > 1 && ctx.b(4) > ctx.b(2) && ctx.b(5) > 2, '3. Wait width grows with the pips, a number icon past 4');
ok(ctx.a([]) === 0 && ctx.a(null) === 0, '3. no cost, no width');
ok(ctx.a(['<span class="pips" data-n="3">']) > ctx.a(['<span class="pips" data-n="1">']), '3. more logs, wider');
ok(ctx.a(['<span class="pips" data-n="2">', '🕊️2']) > ctx.a(['<span class="pips" data-n="2">']), '3. a second cost part adds width');
console.log(`ui20: ${pass} ok, ${fail} failed`); process.exit(fail ? 1 : 0);
