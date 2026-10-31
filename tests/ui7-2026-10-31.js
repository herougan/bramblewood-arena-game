#!/usr/bin/env node
// Package UI7 (2026-10-31; owner Y1, Y4). Static and function-level checks; the browser run is tests/e2e/ui7_2026_10_31.py (shots in tests/e2e/shots/ui7/).
//   Y1 Poison (status chip and skill chip) and Regeneration (skill chip) on a board card are the icon alone; the value is in the tooltip and aria-label.
//   Y4 HELD_STATUSES (one list) drives .is-held on the board card; bramblewood-fx-b.js wriggles held cards rarely, staggered, Effects Medium+, not on reduced motion.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  x', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html'), fxb = rd('bramblewood-fx-b.js'), tx = rd('bramblewood-texts.js');

// ---- Y1
ok(/function ui7PoisonChip\(c\)/.test(app) && !/class="abadge poison">☠\$\{c\.poison\}/.test(app), 'Y1 the status chip for Poison no longer prints the number');
ok((app.match(/ui7PoisonChip\(c\)/g) || []).length >= 3, 'Y1 both the first render and the live patch build the Poison chip with the same helper');
ok(/ui7P \? '' : n1\(e\.poison\)/.test(app), 'Y1 the Poison skill chip drops the number on a board card (bopts.live)');
ok(/ui7NoNum = !!\(bopts && bopts\.live\) && k === 'regen'/.test(app), 'Y1 the Regeneration skill chip drops the number on a board card');
['ui.ui7-poison-tip', 'ui.ui7-poison-skill-tip', 'ui.ui7-regen-tip'].forEach(k=> ok(new RegExp('"' + k.replace(/\./g, '\\.') + '": ".*\\{n\\}').test(tx), 'Y1 TX key ' + k + ' carries the exact value'));
ok(/status-chips > \.abadge\{gap:0 !important;\}/.test(css), 'Y1 the number sits tight to its icon in a status chip');
// the shield badge is not touched
ok(/vis3ShieldHTML\(c\)/.test(app) && /title="Shield: \$\{n\} temporary Health, spent before its Health">\$\{n\}<\/span>/.test(app), 'Y1 the Shield number is as it was');

// ---- Y4: HELD_STATUSES and ui7IsHeld, run on stubs
{ const m = /const HELD_STATUSES = (\[[^\]]*\]);\s*\nfunction ui7IsHeld\(c\)\{[^\n]*\}/.exec(app);
  ok(!!m, 'Y4 HELD_STATUSES and ui7IsHeld are defined together, once');
  ok((app.match(/const HELD_STATUSES/g) || []).length === 1, 'Y4 the list is in one place');
  if(m){ const f = new Function(m[0] + '; return {HELD_STATUSES, ui7IsHeld};')(); const L = f.HELD_STATUSES;
    ok(['pinDown', 'webbed', 'tangled'].every(k=> L.includes(k)), 'Y4 Pinned (pinDown), Webbed and Tangled are held');
    ok(f.ui7IsHeld({pinDown: 1}) && f.ui7IsHeld({webbed: 2}) && f.ui7IsHeld({tangled: 1}), 'Y4 a unit with one of them is held');
    ok(!f.ui7IsHeld({}) && !f.ui7IsHeld({poison: 3, pinDown: 0}) && !f.ui7IsHeld(null), 'Y4 a free unit is not held');
    L.push('lasso'); ok(f.ui7IsHeld({lasso: 1}), 'Y4 a new key added to the list makes a unit held (Lasso)'); } }
ok(/ui7IsHeld\(c\) \? 'is-held'/.test(app) && /el\.classList\.toggle\('is-held', ui7IsHeld\(c\)\)/.test(app), 'Y4 .is-held is set on render and on the live patch');
ok(/UI7_MIN_MS = 6000, UI7_MAX_MS = 12000/.test(fxb), 'Y4 each held card rolls every 6-12 s');
ok(/ui7Next\.has\(card\)/.test(fxb) && /1000 \+ Math\.random\(\)/.test(fxb), 'Y4 the first roll is staggered per card');
ok(/fxAtLeast\('med'\)/.test(fxb) && /reducedMotion\(\)/.test(fxb), 'Y4 Effects Medium or higher, and off with reduced motion');
ok(/@keyframes ui7Wriggle/.test(fxb) && /@keyframes ui7Tug/.test(fxb) && /ui7Wriggle \.6s/.test(fxb), 'Y4 a 0.6 s wriggle with a tug of the status chip');
ok(/prefers-reduced-motion: reduce\)\{ \.board-card\.is-struggling/.test(fxb), 'Y4 the CSS also turns it off for reduced motion');
ok(/translate:/.test(fxb.slice(fxb.indexOf('@keyframes ui7Wriggle'), fxb.indexOf('@keyframes ui7Wriggle') + 200)) && !/transform:/.test(fxb.slice(fxb.indexOf('@keyframes ui7Wriggle'), fxb.indexOf('@keyframes ui7Tug'))), 'Y4 it uses the translate property, so GSAP\'s transform is untouched');

console.log(fail ? `ui7: ${fail} of ${checks} checks FAILED` : `ui7: ${checks} checks ok`);
process.exit(fail ? 1 : 0);
