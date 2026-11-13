#!/usr/bin/env node
// 2026-11-09 (package UI40, owner 16:35: "Make the thematic section and keyword use the same format as the above version"): in the admin Map cards window,
// "Thematic Recommendation" and "Keyword of the map" -> "Cards on this map that have it" draw UI39's full card (ui39PlainTileHTML) in a wrapping rv1-row, not chips.
// 1 Thematic: full card, Claude New / New card pill in the card's pill row, the 🏹 inside the tile (kept by an edit's redraw), theme headings and counts kept;
// 2 Keyword: full cards in the chips' old order, count kept; 3 ui39PlainTileHTML takes the extras and still redraws as kind ui39; 4 CSS injected;
// 5 the build is current. Browser: tests/e2e/ui40_2026_11_09.py (docs/screens/ui40/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i); return app.slice(i, j + 2); };

// 1 Thematic Recommendation
const cl = fn('ui22McClaudeNewHTML');
ok(/ui39PlainTileHTML\(e\.id, defs, e\.why \|\| '', \{/.test(cl) && !/vis4MapCardTilesHTML/.test(cl), 'Thematic: the full card, no chip');
ok(/data-ui22-claude-new=/.test(cl) && /pills: `<b class="ui22-pill/.test(cl) && /TX\('ui\.c17-new-card'\)/.test(cl), 'Thematic: the Claude New / New card pill under the card');
ok(/mark: rng \? `<b class="c17-rng"/.test(cl) && /is-c17-ranged/.test(cl), 'Thematic: the 🏹 on a ranged card');
ok(/c17-theme/.test(cl) && /<small>\$\{n\}<\/small>/.test(cl) && /<small>\$\{g\.picks\.length\}<\/small>/.test(cl), 'Thematic: theme headings and counts kept');
ok((cl.match(/vis4-mc-row rv1-row ui40-row/g) || []).length === 2 && !/ui22-row/.test(cl), 'Thematic: wrapping grid rows');
// 2 Keyword
const kw = fn('ui21McKeywordHTML');
ok(/ui40Sorted\(have, defs\)\.map\(id=> ui39PlainTileHTML\(id, defs, '', \{cls: 'ui40-tile'\}\)\)/.test(kw) && !/vis4MapCardTilesHTML/.test(kw), 'Keyword: full cards, no chips');
ok(/ui21-mapkw-cards'\)\)\} <small>\$\{have\.length\}<\/small>/.test(kw) && /vis4-mc-row rv1-row ui40-row/.test(kw), 'Keyword: count kept, wrapping grid');
ok(/roadRarityStep\(defs\[a\]\.rarity\) - roadRarityStep\(defs\[b\]\.rarity\)/.test(fn('ui40Sorted')), 'Keyword: rarity then name, as before');
// 3 the shared tile
const plain = fn('ui39PlainTileHTML');
ok(/function ui39PlainTileHTML\(id, defs, why, x\)/.test(plain) && /x\.mark \|\| ''/.test(plain) && /\$\{pack\}\$\{x\.pills \|\| ''\}/.test(plain) && /data-rv-kind="ui39"/.test(plain) && /large: true, power: true/.test(plain), 'ui39PlainTileHTML: extras, full card, power, redrawn as kind ui39');
ok(/x\.mark \|\| ''\}\$\{vis4MapCardTilesHTML/.test(plain), 'the mark sits outside the redrawn card element');
// 4 CSS
ok(/\.ui40-tile \.rv2-pills\{margin-top:9px/.test(fn('ui40Css')) && /try\{ ui40Css\(\); \}catch\(e\)\{\}/.test(fn('pk1OpenMapCards')), 'CSS injected when the window opens');
// 5 build
ok(html.includes('function ui40Sorted(') && html.includes("cls: 'is-claude ui40-tile'"), 'index.html is rebuilt');

console.log(`UI40: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
