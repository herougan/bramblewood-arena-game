#!/usr/bin/env node
// 2026-11-18 (package UIFIN): pip text centring, tight trigger arrow, every map list as a pill, Glass Dunes skull, Venom -> Poison, REDESIGN3 focus skills.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
ok(/\.abadge\{display:inline-flex; align-items:center;/.test(tpl), '1 pips centre their text and emoji on one line');
ok(/\.ab-trig \.ab-arrow\{margin:0 -\.1em 0 -\.2em; translate:0 \.04em;\}/.test(tpl), '3 the trigger arrow sits tight to its glyph');
ok(/ui52-first-map is-first/.test(src) && !/>\+ \$\{escapeHtml\(TX\('ui\.pg-map-n'/.test(src) && /\.ui52-first-map\.is-first\{/.test(tpl), '2 equal map pills, no plus, the first one stronger');
ok(/map\.id==='md' \? mapSkullHTML\(\)/.test(src) && /\.map-skull\{/.test(tpl), '4 skull on the Glass Dunes');
ok(/poison:'Poison' \/\* ENG33; 2026-11-18 \(UIFIN\)/.test(src) && /name:'Poison', c:'#3fa535'/.test(src) && !/label:'Venom'/.test(src), '5 damage type and status chip read Poison');
const fk = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/design/redesign3-2026-11-17.json'), 'utf8')).focus;
const m = /const MAP_FOCUS_SKILLS = (\{[^;]*\});/.exec(src); const cfg = m && eval('(' + m[1] + ')');
ok(cfg && fk.filter(f=> f.map >= 0 && f.map <= 20).every(f=> JSON.stringify(cfg[f.map]) === JSON.stringify(f.skills.map(s=> s.key === 'arrowFlaming' ? 'fireArrow' : s.key))), '6 MAP_FOCUS_SKILLS = REDESIGN3 focus keys (2026-11-19 TESTFIX7: the design file\'s arrowFlaming is the game\'s fireArrow)');
console.log(fail ? 'FAIL ' + fail : 'ok uifin'); process.exit(fail ? 1 : 0);
