#!/usr/bin/env node
// 2026-11-13 (package UI53, owner 17:29 #1 #2 #4): Venom / Bleed pips carry their count, the battle hover lists the unit's live tokens and statuses,
// a Guardian's plates follow the card's tile, and a new skill in the Map cards window is red. Source checks (no browser).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');

// 1 pips: Venom and Bleed show their count (a bare 1 is dropped by ui14ChipCount like every chip)
ok(/function ui7PoisonChip[^\n]*>☠\$\{c\.poison\}<\/span>/.test(app), 'the Venom pip says ☠ and its count');
ok(/function ui30BleedChip[^\n]*>🩸\$\{c\.bleed\}<\/span>/.test(app), 'the Bleed pip says 🩸 and its count');
{ const fn = new Function('return ' + app.match(/function ui14ChipCount\(b\)\{[^\n]*\}/)[0].replace(/^function ui14ChipCount/, 'function'))();
  ok(fn('<span class="abadge poison">☠4</span>').includes('☠4'), 'Venom 4 keeps its 4');
  ok(fn('<span class="abadge poison">☠1</span>') === '<span class="abadge poison">☠</span>', 'Venom 1 stays the bare icon'); }
ok(/status-chips > \.abadge\.poison\{padding:0 calc\(var\(--sc-h\) \* \.16\) !important; width:auto; min-width:var\(--sc-h\);\}/.test(tpl), 'the Venom chip grows to fit its count');
// every counted pip builder prints a number after its icon
['scar', 'exposed', 'creativity', 'prayerTokens', 'asleep', 'paralyzed', 'shocked', 'corrode', 'staggered', 'irradiation', 'gpoison', 'silenced', 'stymied', 'exhaust', 'brittle', 'exploit', 'ffCounters', 'sk2Berries', 'water', 'burn', 'bound', 'webbed', 'toxin'].forEach(f=>
  ok(new RegExp('\\$\\{c\\.' + f + '\\}<\\/span>|\\$\\{n\\}<\\/span>|\\$\\{b\\}<\\/span>').test(app), `a pip shows c.${f}`));

// 1b hover: the unit's live rows are in the sheet and follow it
ok(/function ui53StatusHTML\(uid\)\{ const c = currentCardByUid\(uid\); return c \? liveStatusGlossHTML\(c\) : ''; \}/.test(app), 'ui53StatusHTML reads the live unit');
ok(/\$\{!liveCard && opts\.logUid != null \? ui53StatusHTML\(opts\.logUid\)/.test(app), 'fullCardHTML adds the live rows above the battle log');
ok(/const og = pop\.querySelector\('\.live-status-gloss'\), g = ui53StatusHTML\(lc\.uid\)/.test(app), 'the open hover refreshes the rows');

// 2 Guardian plates follow the tile
ok(/function ui53PlatesOn\(\)/.test(app) && /gsap\.ticker\.add/.test(app.match(/function ui53PlatesOn[\s\S]*?\n\}/)[0]) && /gp\.style\.transform = v/.test(app), 'a GSAP tick copies the tile transform onto the plates');
ok(/if\(guards\) ui53PlatesOn\(\);/.test(app), 'the follower starts when a Guardian is drawn');
{ const src = app.match(/function ui53PlatesOn[\s\S]*?\n\}/)[0]; let tick = null;
  const plates = {style: {transform: ''}}, tile = {style: {transform: 'translate(0px, -15px) scale(1.06)'}};
  const card = {querySelector: s=> s === ':scope > .guard-plates' ? plates : tile};
  const fn = new Function('hasGsap', 'gsap', 'document', 'var UI53_PLATES_ON = false;' + src + '; return ui53PlatesOn;')(()=> true, {ticker: {add: f=>{ tick = f; }}}, {querySelectorAll: ()=> [card]});
  fn(); tick(); ok(plates.style.transform === tile.style.transform, 'the plates take the lunge transform');
  tile.style.transform = ''; tick(); ok(plates.style.transform === '', 'and let go when the tile rests'); }

// 4 Map cards: NEW! skill red
ok(/\.pk1-mc-overlay \.ui19-sk \.ui19-new\{background:#c62828; color:#fff;/.test(tpl), 'the NEW! marker on a skill is white on red');
ok(/\.pk1-mc-overlay \.ui19-sk\.is-new, \.pk1-mc-overlay \.ui19-sk\.is-new\.is-intro\{border-color:#c62828;/.test(tpl), 'a new skill tile is red-tinted');
ok(/\.sk-new\{[^}]*background:#e9b949/.test(tpl), 'the card-details .sk-new tag is untouched (gold)');

console.log(fail ? `ui53: ${fail} failed` : 'ui53: all passed'); process.exit(fail ? 1 : 0);
