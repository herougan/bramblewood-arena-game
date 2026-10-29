#!/usr/bin/env node
// Package REVIEW1 (2026-10-29; owner 00:13: the 🃏 Map cards overlay also shows what would be cut ("Cut cards") and the "maybe"s, beside the
// chosen list). Checks: canonical/map-review.json exists with the agreed shape and is inlined at build (assemble_arena.py, __MAP_REVIEW__);
// the review lookup per section (map, submap, "<map>:special") and the "No review yet" fallback; Chosen / Cut cards / Maybe parts with the why,
// the by-badge, the per-tile flip button and the "Copy my picks" text; the CSS; the texts are TX keys with a row in all 12 packs.
// The browser run (the button after "Mark cleared", shots at 1366 and 390) is tests/e2e/review1_2026_10_29.py.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), asm = rd('assemble_arena.py'), css = rd('arena_template.html');
const R = JSON.parse(rd('canonical/map-review.json'));
ok(typeof R._about === 'string' && 'built' in R && R.maps && typeof R.maps === 'object', '1. canonical/map-review.json has _about, built and maps');
for(const [id, m] of Object.entries(R.maps)){
  ok(['chosen', 'cut', 'maybe'].every(k=> Array.isArray(m[k] || [])), `1. map ${id}: chosen / cut / maybe are lists`);
  ok((m.chosen || []).every(e=> e.id && ['owner', 'claude', 'kept'].includes(e.by)) && (m.cut || []).every(e=> e.id && ['owner', 'claude'].includes(e.by)) && (m.maybe || []).every(e=> e.id), `1. map ${id}: entries carry id and by`);
}
ok(/__MAP_REVIEW__/.test(asm) && /canonical\/map-review\.json/.test(asm) && /const MAP_REVIEW = __MAP_REVIEW__;/.test(app), '1. the build inlines the review (assemble_arena.py, const MAP_REVIEW)');
ok(!fs.existsSync(path.join(ROOT, 'index.html')) || /const MAP_REVIEW = \{"built":/.test(rd('index.html')), '1. index.html carries the inlined review (built)');
// the lookup, run on the real source
{ const i = app.indexOf('function rv1ReviewOf('), body = app.slice(i, app.indexOf('\nfunction ', i + 10));
  const f = new Function('MAP_REVIEW', body + '\nreturn rv1ReviewOf;');
  const rv = f({maps: {m4: {chosen: [{id: 'a'}], cut: [], maybe: []}, s1: {chosen: [], cut: [], maybe: [{id: 'b'}]}, 'm4:special': {cut: [{id: 'c'}]}, empty: {chosen: [], cut: [], maybe: []}}});
  ok(rv({key: 'cards'}, 'm4') && rv({key: 'cards'}, 'm4').chosen[0].id === 'a', '2. the MAP section reads the review under the map id');
  ok(rv({key: 'sub:s1', sub: 's1'}, 'm4').maybe[0].id === 'b', '2. a submap section reads the review under the submap id');
  ok(rv({key: 'special'}, 'm4').cut[0].id === 'c', '2. SPECIAL reads "<map>:special"');
  ok(rv({key: 'cards'}, 'empty') === null && rv({key: 'cards'}, 'zzz') === null, '2. no review (or an empty one) gives null: "No review yet"'); }
{ const i = app.indexOf('function pk1OpenMapCards('), body = app.slice(i, app.indexOf('\nfunction ', i + 10));
  ok(/rv1ReviewOf\(s, top\)/.test(body) && /ui\.rv1-none/.test(body) && /has-rv1/.test(body), '3. a section without review data shows the list as before + "No review yet"');
  ok(['ui.rv1-chosen', 'ui.rv1-cut', 'ui.rv1-maybe'].every(k=> body.includes(k)) && /part\('chosen'/.test(body) && /part\('cut'/.test(body) && /part\('maybe'/.test(body), '3. Chosen, Cut cards and Maybe parts');
  ok(/rv1Copy/.test(body) && /clipboard\.writeText/.test(body) && /rv1PicksText\(ov\)/.test(body) && /Escape/.test(body) && /wireRewardZoom\(ov\)/.test(body), '3. Copy my picks, Escape and zoom stay');
  // 2026-10-29 (package REVIEW2): the why is the tile's title only, the by-badge became the pills (tests/review2-2026-10-29.js), the cards are deck-size
  ok(/vis4MapCardTilesHTML\(\[e\.id\], defs, \{packs: true, large: true\}\)/.test(app) && /title="\$\{escapeAttr\(e\.why \|\| ''\)\}"/.test(app) && /rv2-pill is-/.test(app) && /rv1-act/.test(app), '3. tiles reuse VIS4\'s (zoom) at deck size, carry the why as title, pills and a flip button'); }
{ const i = app.indexOf('function rv1PicksText('), body = app.slice(i, app.indexOf('\nfunction ', i + 10)), f = new Function(body + '\nreturn rv1PicksText;')();
  const tile = (kind, id, name)=> ({dataset: {rvKind: kind, rvId: id}, querySelector: ()=> ({getAttribute: ()=> name})});
  const sec = {dataset: {rvLabel: 'Map 4 / Map'}, querySelectorAll: ()=> [tile('chosen', 'a', 'Alpha'), tile('cut', 'b', 'Beta'), tile('maybe', 'c', 'Gamma')]};
  const ov = {querySelectorAll: ()=> [sec]};
  ok(f(ov) === 'Map 4 / Map: keep Beta, Gamma; cut Alpha', '4. picks text: flipped chosen = cut, flipped cut / maybe = keep (' + f(ov) + ')'); }
ok(/\.rv1-tile\{/.test(css) && /\.rv1-tile\.is-cut \.vis4-mc-card\{/.test(css) && /\.rv1-act\{[^}]*min-height:24px/.test(css), '5. its CSS (tiles, dimmed cut cards, tap-size buttons)');
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, keys = ['chosen', 'cut', 'maybe', 'none', 'by-owner', 'by-claude', 'by-kept', 'act-cut', 'act-keep', 'undo', 'copy', 'copied', 'copy-none'].map(k=> 'ui.rv1-' + k);
  ok(keys.every(k=> T[k]), '6. the TX keys exist');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  ok(codes.every(c=>{ const p = JSON.parse(rd('lang/' + c + '.json')); return keys.every(k=> p[T[k]]); }), '6. each has a row in all 12 language packs'); }
console.log(`review1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
