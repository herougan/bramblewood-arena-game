#!/usr/bin/env node
// 2026-11-09 (package UI41, owner 21:36): Map cards window: 7 cards per row on a wide window, no faction cards as prospects (unless flagged Yes), dark-mode number
// boxes, Yes / No carry the Keep / Cut emojis (old Cut / Keep, its X/N count and the Carried / Unique pill hidden), the family cap also for Claude's picks / Maybe.
// Browser: tests/e2e/ui41_2026_11_09.py (docs/screens/ui41/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), html = rd('index.html');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i); return app.slice(i, j + 2); };
// 1 faction cards
ok(/d\.faction === 'base'/.test(fn('ui41Allowed')) && /ui41YesAnywhere\(id\)/.test(fn('ui41Allowed')), 'a faction card (faction set, not base) is allowed only when flagged Yes');
ok(/ok2 = id=> ok\(id\) && ui41Allowed\(id, defs\)/.test(app) && /ui37Split\(top, defs, ok2\)/.test(app) && /ui39ReviewMap\(top, ok2\)/.test(app), 'the window draws with the faction filter (list, Maybe, Claude, fill and review parts)');
ok(/R\.newTarget \|\| 30/.test(fn('ui38Fill')), 'NEW! is topped up to its 30 minimum with lower-score fits');
// 2 cap
const cap = fn('ui41Cap'); ok(/p\.src\.has\('list'\) \|\| yes\.has\(p\.id\)/.test(cap) && /cnt\[f\] \|\| 0\) >= cap/.test(cap), 'family cap: list cards and Yes cards stay and count first');
ok(/ui41Cap\(top, neu, defs\), car2 = ui41Cap\(top, car, defs\)/.test(fn('ui37Split')), 'the cap runs on both groups before the fill');
// 3 Yes / No
ok(/btn\('yes', '↩ ' \+ TX\('ui\.ui37-yes'\)\)/.test(app) && /btn\('no', '✂ ' \+ TX\('ui\.ui37-no'\)\)/.test(app), 'Yes carries the Keep emoji, No the Cut scissors');
ok(/data-ui39\] \.rv1-act:not\(\[data-rv-act="remove-added"\]\)/.test(tpl) && /data-ui39\] \.rv2-cl\[data-rv2-count\]/.test(tpl) && /data-ui39\] \.rv2-pill\.is-carried/.test(tpl) && /data-ui39\] \.rv2-pill\.is-unique/.test(tpl), 'old Cut / Keep, count line, Carried / Unique pill hidden in this view');
// 4 layout and dark inputs
ok(/\.pk1-mc-modal\[data-ui39\]\{max-width:min\(1180px, 98vw\)/.test(tpl), 'the window is wide enough for 7 cards per row');
ok(/\.ui37-ct input, \.pk1-mc-modal input\[type="number"\][^}]*background:var\(--surface\); color:var\(--ink\)/.test(tpl) && /data-theme="dark"\] \.ui37-ct input/.test(tpl), 'inputs use the theme surface and ink, dark colour scheme');
// 5 concepts untouched, build
ok(/concepts\.forEach\(c=>\{ have\.add\(c\.id\)/.test(fn('ui38Fill')), 'proposed concepts still always show');
ok(html.includes('function ui41Cap(') && html.includes('data-ui39] .rv2-pill.is-unique'), 'index.html is rebuilt');
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
