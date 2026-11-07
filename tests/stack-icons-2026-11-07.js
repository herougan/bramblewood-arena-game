#!/usr/bin/env node
// 2026-11-07 (owner 21:59: combined emoji skill pips "closer together, almost stacked ... 40+% of the poison symbol over top the cactus"):
// iconHTML splits an icon of two or more emoji into .ico-part pieces inside .ico-stack; the CSS pulls each later piece over the one before.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  x', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
ok(/function icoParts\(s\)/.test(app) && /ico-stack/.test(app), 'iconHTML stacks combined icons (icoParts)');
ok(/\.ico\.ico-stack\[data-ik\][^{]*\{display:inline-flex !important;[^}]*width:auto !important/.test(tpl), 'the stack beats the 1em .ico[data-ik] box');
ok(/\.ico-stack > \.ico-part \+ \.ico-part\{margin-left:-0\.8em\}/.test(tpl), 'each later part overlaps the one before');
// icoParts on its own (lifted from the source)
const src = app.match(/const ICO_SEG = [^\n]*\nfunction icoParts\(s\)\{[^\n]*\n[^\n]*\}/)[0]; const icoParts = new Function(src + '; return icoParts;')();
ok(icoParts('🌵☠️').length === 2 && icoParts('🌵☠️')[1] === '☠️', '🌵☠️ is two parts, the variation selector kept');
ok(icoParts('⚔⚔').length === 2, '⚔⚔ is two parts');
ok(icoParts('🐺').length === 1 && icoParts('A1').length === 1, 'a single emoji or text stays whole');
console.log(`stack-icons: ${checks - fail}/${checks} checks passed`); process.exit(fail ? 1 : 0);
