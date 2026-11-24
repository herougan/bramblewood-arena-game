#!/usr/bin/env node
// 2026-11-18 (package UIFIN): pip text centring, tight trigger arrow, every map list as a pill, Glass Dunes skull, Venom -> Poison, REDESIGN3 focus skills.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
ok(/\.abadge\{display:inline-flex; align-items:center;/.test(tpl), '1 pips centre their text and emoji on one line');
ok(/\.abadge > span:not\(\.ab-wing\)\{display:inline-flex; align-items:center;\}/.test(tpl), 'PIPC (2026-11-22, owner 09:56 #1): the inner span holding a number and its emoji centres them too (they were baseline-aligned)');
ok(/\.ab-trig \.ab-arrow\{margin:0 -\.1em 0 -\.2em; translate:0 \.04em;\}/.test(tpl), '3 the trigger arrow sits tight to its glyph');
ok(/ui52-first-map is-first/.test(src) && !/>\+ \$\{escapeHtml\(TX\('ui\.pg-map-n'/.test(src) && /\.ui52-first-map\.is-first\{/.test(tpl), '2 equal map pills, no plus, the first one stronger');
ok(/map\.id==='md' \? mapSkullHTML\(\)/.test(src) && /\.map-skull\{/.test(tpl), '4 skull on the Glass Dunes');
ok(/poison:'Poison' \/\* ENG33; 2026-11-18 \(UIFIN\)/.test(src) && /name:'Poison', c:'#3fa535'/.test(src) && !/label:'Venom'/.test(src), '5 damage type and status chip read Poison');
const fk = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/design/redesign3-2026-11-17.json'), 'utf8')).focus;
const m = /const MAP_FOCUS_SKILLS = (\{[^;]*\});/.exec(src); const cfg = m && eval('(' + m[1] + ')');
// 2026-11-22 (TESTFIX9): the owner's later table moves, applied to the design file's keys: FOCUS2 (Map 5 Bleed -> Leech 'sap', Map 6 Leech -> Bleed),
// NOC7 (Nocturnal Map 4 -> Map 7), MAPADD1-1 a (Map 5 + Poison Barbs, Map 8 + Evasive); 2026-11-24 (DAUNT2): Map 6 + Intimidate, Map 11 + Daunt
const fkNow = f=>{ let k = f.skills.map(s=> s.key === 'arrowFlaming' ? 'fireArrow' : s.key);
  if(f.map === 5) k = k.map(x=> x === 'bleed' ? 'sap' : x).concat('poisonBarbs'); if(f.map === 6) k = k.map(x=> x === 'sap' || x === 'leech' ? 'bleed' : x);
  if(f.map === 4) k = k.filter(x=> x !== 'nocturnal'); if(f.map === 7 && !k.includes('nocturnal')) k = k.concat('nocturnal'); if(f.map === 8) k = k.concat('evasive'); if(f.map === 6) k = k.concat('intimidate'); if(f.map === 11) k = k.concat('daunt'); return k; };
const bad6 = cfg ? fk.filter(f=> f.map >= 0 && f.map <= 20).filter(f=> JSON.stringify(cfg[f.map]) !== JSON.stringify(fkNow(f))).map(f=> f.map + ': ' + cfg[f.map] + ' vs ' + fkNow(f)) : ['no table'];
ok(!bad6.length, '6 MAP_FOCUS_SKILLS = REDESIGN3 focus keys + the owner\'s later moves (' + bad6.join('; ') + ')');
console.log(fail ? 'FAIL ' + fail : 'ok uifin'); process.exit(fail ? 1 : 0);
