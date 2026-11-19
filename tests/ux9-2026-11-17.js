#!/usr/bin/env node
// 2026-11-17 (package UX9, owner 22:33): a focus (New!) skill is a solid red pill (red fill and border), on the main cards or "To Add"; order: red on main cards, other main, red "To Add", then counters / suggestions / others.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'), app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/\.ui19-sk\.is-new\{border-color:#c62828; background:#c62828; color:#fff;\}/.test(tpl), 'NEW! tile: red fill, red border, white text (UIQ2 2026-11-20: was the focus tile)');
ok(!/\.is-focus-add\{border:2px solid #c62828; background:var\(--bg\)/.test(tpl), 'To Add tile is no longer an outline on the plain background');
const L = app.slice(app.indexOf('function ui19McSkillsHTML('));
ok(L.includes("${flaggedMain.filter(r=> !r.late).map(li).join('')}${addTiles}${ctrTiles}"), 'list order: main skills (red first), To Add red pills, then counters and the rest');
ok(/function ux7Rank\(r\)\{ return r\.outside \? 0 : r\.isNew \? 0 : r\.isFocus \? 1 :/.test(L), 'red NEW! (then focus) skills sort first among the main skills');
console.log(fail ? `ux9: ${fail} of ${n} checks FAILED` : `ux9: ${n} checks passed`); process.exit(fail ? 1 : 0);
