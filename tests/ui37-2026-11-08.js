#!/usr/bin/env node
// 2026-11-08 (package UI37, owner 17:22 #1-#4): the admin Map cards window's Prospects view.
// 1 the NEW! / Carried rule (ui37CarriedIndex, lifted from arena_app.js and run), 2 wiring (main maps only, prospects sources, targets from THEME6-1, Yes / No pills,
// storage in localStorage + the `__cfg:map-picks:<id>` card_overrides row, the cloud row read back, Export picks), 3 CSS, 4 texts in 12 packs, 5 build is current.
// Browser: tests/e2e/ui37_2026_11_08.py (both widths, flags across maps and a reload; screenshots in docs/screens/ui37/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js'), tpl = rd('arena_template.html');
const blk = app.slice(app.indexOf('// UI37_PROS:START'), app.indexOf('// UI37_PROS:END'));
ok(blk.length > 1000, 'the UI37_PROS block is in arena_app.js');

// 1. the rule
{ const m = blk.match(/function ui37CarriedIndex\(n, maps\)\{[\s\S]*?\n\}\n/); ok(!!m, 'ui37CarriedIndex found');
  const f = new Function('function ui43TutorialCards(){ return []; }' /* 2026-11-10 (UI43) */ + m[0] + '; return ui37CarriedIndex;')();
  const maps = [{n: 0, list: ['a', 'b'], yes: [], no: []}, {n: 1, list: ['c'], yes: ['x'], no: ['c']}, {n: 2, list: ['d'], yes: [], no: []}, {n: 3, list: ['e'], yes: ['b'], no: []}];
  const at2 = f(2, maps), at4 = f(4, maps), at0 = f(0, maps);
  ok(at0.size === 0, 'Map 0: nothing is carried');
  // 2026-11-09 (UI42, owner 22:48): only a card flagged Yes on an earlier main map is Carried; unflagged list cards no longer count (replaces UI37-1)
  ok(!at2.has('a') && !at2.has('b'), 'an unflagged card on an earlier MAP list is NOT Carried (UI42)');
  ok(at2.get('x') === 1, 'a card flagged Yes on an earlier map is Carried from it, list or not');
  ok(!at2.has('c'), 'a card flagged No (or unflagged) is NEW!');
  ok(!at4.has('d') && at4.get('b') === 3 - 0 && at4.get('b') !== 0, 'only Yes counts; b is Yes on Map 3');
  ok(at4.get('x') === 1, 'the earliest giver is named');
  const two = f(3, [{n: 0, list: [], yes: ['a'], no: []}, {n: 1, list: [], yes: ['a'], no: []}]); ok(two.get('a') === 0, 'Yes on two maps: Carried from the earlier one'); }

// 2. wiring
ok(/function ui37Mount\(ov, top, mapId, ok\)\{\n  ui37Live = null;\n  if\(!adminModeEnabled \|\| mpIsSub\(mapId\)\) return;/.test(blk), 'the view is admin-only and never on a submap window');
ok(/try\{ ui37Mount\(ov, top, mapId, ok\); \}catch\(e\)\{\}/.test(app.slice(app.indexOf('function pk1OpenMapCards'), app.indexOf('// UI29_PE:START'))), 'pk1OpenMapCards mounts it');
{ const f = blk.slice(blk.indexOf('function ui37Prospects'), blk.indexOf('// one map\'s split'));
  ok(/mpEntry\(top\)\.cards\.forEach\(id=> add\(id, 'list'\)\)/.test(f), 'prospects: the MAP list (not the submap lists)');
  ok(!/submaps/.test(f), 'prospects never read a submap list');
  ok(/rv1ReviewOf\(\{key: 'cards'\}, top\)/.test(f) && /cn\.theme5/.test(f) && /cn\.skillrec/.test(f) && /cn\.content17/.test(f), "prospects: the review's Maybe, THEME5, SKILLREC1, CONTENT17 (UI22 / CONTENT17 / UI34 data)"); }
ok(/grp\('is-new', TX\('ui\.ui37-new'\), sp\.neu, 'new'\) \+ grp\('is-car', TX\('ui\.ui37-carried'\), sp\.car, 'carried'\)/.test(blk), 'NEW! first, then Carried');
ok(/th6Targets\(n == null \? 2 : n\)/.test(blk) && /data-ui37-target="\$\{k\}"/.test(blk), 'targets default to THEME6-1 (th6Targets) and are editable inputs');
ok(/data-ui37-flag="\$\{k\}" aria-pressed=/.test(blk), 'Yes / No pill buttons with aria-pressed');
ok(/const UI37_KEY = 'bw_ui37_map_picks_v1'/.test(blk) && /try\{ localStorage\.setItem\(UI37_KEY/.test(blk), 'flags kept in localStorage inside try/catch');
ok(/cloudWriteCardOverride\('__cfg:map-picks:' \+ top, row\)/.test(blk) && /kind: 'map-picks', mapId: top, mapNo: mapNumberOf\(top\), yes: ui37Arr\(e\.yes\), no: ui37Arr\(e\.no\), targets/.test(blk), 'published as the __cfg:map-picks:<map> row (existing jsonb column)');
ok(/const mpk = \/\^__cfg:map-picks:\(\.\+\)\$\/\.exec\(r\.id\);[^\n]*\n  if\(mpk\)\{ try\{ applyCloudMapPicks\(mpk\[1\], r\); \}catch\(e\)\{\} return; \}/.test(app), 'applyCloudCfgRow reads the row back (newer wins, applyCloudMapPicks)');
ok(/data-ui37-export="json"/.test(blk) && /data-ui37-export="csv"/.test(blk) && /bramblewood-map-picks\./.test(blk), 'Export picks: JSON and CSV downloads');
ok(!/supabase\/proposed/.test(blk), 'no schema change needed');

// 3. CSS
ok(/\.pk1-mc-modal\[data-ui37-view="pros"\] > :not\(\.modal-head-row\):not\(\.ui37-switch\):not\(\.ui37-pros\)\{display:none !important;\}/.test(tpl), 'Prospects hides the list view');
ok(/\.ui37-switch\{[^}]*flex-shrink:0;/.test(tpl) && /\.ui37-yn-b\.is-yes\.on\{/.test(tpl), 'switch and pill CSS');

// 4. texts
{ const keys = ['sub', 'new', 'carried', 'flagged-new', 'flagged-carried', 'target-tip', 'yes', 'no', 'flag-label', 'src-list', 'src-maybe', 'src-claude', 'src-newcard', 'src-flag', 'src-earlier', 'from', 'from-tip', 'earlier', 'export', 'export-tip', 'saved-cloud', 'saved-local', 'prev', 'next'].map(k=> 'ui.ui37-' + k);
  const used = [...new Set([...blk.matchAll(/TX\('(ui\.ui37-[\w-]+)'/g)].map(x=> x[1]).concat([...blk.matchAll(/'ui\.ui37-src-' \+ s/g)].length ? [] : []))];
  ok(used.every(k=> keys.includes(k)), 'every TX key the block uses is listed: ' + used.filter(k=> !keys.includes(k)).join(','));
  const en = {}; keys.forEach(k=>{ const m = texts.match(new RegExp('"' + k + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, k + ' in bramblewood-texts.js'); if(m) en[k] = m[1].replace(/\\"/g, '"'); });
  CODES.forEach(c=>{ const d = JSON.parse(rd('lang/' + c + '.json')); keys.forEach(k=>{ if(en[k]) ok(typeof d[en[k]] === 'string' && d[en[k]].length > 0, c + ' has ' + k); }); }); }

// 5. build is current
{ const idx = rd('index.html'); ok(idx.includes('function ui37Mount') && idx.includes('ui37-yn-b'), 'index.html carries UI37 (rebuilt)'); }
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
