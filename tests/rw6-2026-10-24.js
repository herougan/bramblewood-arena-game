#!/usr/bin/env node
// Package RW6 (2026-10-24, owner 12:02). Headless checks on the source and the texts; the browser half (results list, Base card tile, PRO nodes on
// the map in Admin Mode and absent for a player, a tap starting the fight, shots at 390 and 1366) is tests/e2e/rw6_2026_10_24.py.
//   1. the results list shows no locked-card chips (lock + card + rank emblem); the old helper is no longer called
//   2. a Base card won (conquestBaseGrowth.copies) is a card tile in Cards won, with no "spare copy" chip
//   3. PRO fights are map nodes in Admin Mode only (proMapNodesHTML), starting through data-pro-start; styled apart from .map-node
//   4. the new text is a TX key with a row in all 12 language packs
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;

// ---- 1
ok(!/lockedCardChipsHTML\(m, '/.test(app), '1. nothing calls lockedCardChipsHTML any more (neither the Rewards block nor the rank pills)');
ok(!/rw-locked-card/.test(app.replace(/function lockedCardChipsHTML[\s\S]*?\n\}\n/, '')), '1. no locked-card chip is built outside the retired helper');
// ---- 2
ok(/const baseCopyIds = \(\(m\.conquestBaseGrowth && m\.conquestBaseGrowth\.copies\) \|\| \[\]\)/.test(app), '2. Base copies are read from conquestBaseGrowth.copies');
ok(/\$\{baseCopyIds\.map\(id=> `<div class="rw-card is-unlock rw-base-copy"[^`]*cardTileHTML\(defs\[id\], \{inPlay:true\}\)/.test(app), '2. each is a card tile in Cards won');
ok(!/results\.a-spare-copy-of-a-base/.test(app), '2. the "spare copy ... feed it in the Forge" chip is gone from the results');
// ---- 3
ok(/function proMapNodesHTML\(map, positions\)\{\n  if\(!adminModeEnabled /.test(app), '3. the nodes are drawn only in Admin Mode');
ok(/\$\{tutPhase \? '' : proMapNodesHTML\(map, positions\)\}/.test(app), '3. the map canvas draws them');
ok(/class="map-pro" data-pro-start=/.test(app) && /\.map-pro\{/.test(tpl) && /\.map-pro \.mpr-code\{/.test(tpl), '3. a .map-pro button with data-pro-start (the PRO click handler), its own style');
ok(!/class="map-pro[^"]*map-node/.test(app), '3. not a .map-node (no progress, layout or unlock logic)');
// ---- 4
const KEY = 'ui.rw6-pro-node-tip', EN = T[KEY];
ok(typeof EN === 'string' && /\{key\}/.test(EN), '4. the text is a TX key');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  ok(typeof pack[EN] === 'string' && pack[EN] && pack[EN] !== EN && /\{key\}/.test(pack[EN]), '4. ' + code + ' has the row');
}
console.log(fail ? `rw6-2026-10-24: ${fail} of ${n} checks FAILED` : `rw6-2026-10-24: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
