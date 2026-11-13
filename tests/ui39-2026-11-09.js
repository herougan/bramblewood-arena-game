#!/usr/bin/env node
// 2026-11-09 (package UI39, owner 10:17: "combine the prospects UI and the Lists UI ... full view. Not pill view."): the admin Map cards window of a main map is one view.
// 1 no Lists / Prospects switch; 2 the MAP list section becomes NEW! / Carried (keeping its data-rv-* so the Cut / Keep counts, Copy my picks and Export all work);
// 3 full cards: a review entry is its rv1 tile (Cut / Keep, edit), any other card the same full card with edit (kind ui39, redrawn after an edit), a concept a
// placeholder card; 4 a review entry neither group shows stays in its part; 5 the counters at the top, no Thematic Recommendation section on a main map,
// side maps untouched; 6 the CSS wraps at 390; 7 texts in 12 packs; 8 the build is current. Browser: tests/e2e/ui39_2026_11_09.py (docs/screens/ui39/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js');
const b37 = app.slice(app.indexOf('// UI37_PROS:START'), app.indexOf('// UI37_PROS:END')), b38 = app.slice(app.indexOf('// UI38_PROS:START'), app.indexOf('// UI38_PROS:END'));
const fn = name=>{ const i = b37.indexOf('function ' + name + '('); if(i < 0) return ''; const j = b37.indexOf('\n}\n', i); return b37.slice(i, j + 2); };
const mount = fn('ui37Mount');

// 1 one view
ok(mount.length > 500 && !/ui37-switch|data-ui37-view|setView/.test(b37), 'no Lists / Prospects switch');
ok(/localStorage\.removeItem\(UI37_VIEW_KEY\)/.test(mount), 'the old view choice is cleared');
ok(/if\(!adminModeEnabled \|\| \(mpIsSub\(mapId\) && !isSub\)\) return;/.test(mount) && /ui37MapsData\(\)\.some\(m=> m\.id === top\)/.test(mount), 'admin, main maps only (UI44: and the side maps, which have their own view; the Tutorial, endless dungeons and tower keep their lists)');
// 2 the list section becomes the groups
ok(/\['data-rv-i', 'data-rv-n', 'data-rv-m', 'data-rv-label'\]\.forEach/.test(mount) && /classList\.add\('has-rv1'\)/.test(mount) && /old\.replaceWith\(wrap\)/.test(mount), 'the MAP list section is replaced, its data-rv-* and has-rv1 kept (counts, Copy my picks, Export all)');
ok(/rv2Update\(ov\)/.test(mount), 'a redraw refreshes the Cut / Keep counts');
// 3 full cards
const tile = fn('ui37TileHTML');
ok(/c \? ui39ConceptCardHTML\(c\) : rv \? rv1TileHTML\(rv\.e, rv\.kind, defs, 'cards'\) : ui39PlainTileHTML\(p\.id, defs, p\.why \|\| ''\)/.test(tile), 'a concept card, a review tile, or the plain full card');
ok(/data-ui37-flag="\$\{k\}"/.test(tile) && /ui37-src is-\$\{s\}/.test(tile) && /ui37-from/.test(tile), "UI38's source pills, the Map N pill and Yes / No on every card");
ok(!/vis4MapCardTilesHTML\(\[p\.id\], defs, \{power: true/.test(b37) && !/ui38ConceptChipHTML\(c\)/.test(b37), 'no chips in the view');
const plain = fn('ui39PlainTileHTML');
ok(/large: true, power: true/.test(plain) && /data-rv-kind="ui39"/.test(plain), 'the plain card is full size, with its power badge (UI51: the card opens the editor)');
ok(/kind === 'egg' \|\| kind === 'added' \|\| kind === 'ui39'/.test(app) && /kind === 'ui39' \? \{packs: true, large: true, power: true, why\}/.test(app), 'ui13RefreshTile redraws a plain card after an edit');
const cc = fn('ui39ConceptCardHTML');
ok(/c\.name/.test(cc) && /c\.animal/.test(cc) && /DMG_TYPE_LABEL\[c\.element\]/.test(cc) && /ui39-c-rarity/.test(cc) && /c\.role/.test(cc) && /vis4-mc-card is-large/.test(cc) && /data-zoom-tip=/.test(cc), 'the concept card: name, animal, element, suggested rarity, role, full size, hover text');
// 4 nothing on the list is lost
const grp = fn('ui37GroupsHTML');
ok(/rvMap\.forEach\(\(v, id\)=>\{ if\(!shown\.has\(id\)\) rest\[v\.kind\]\.push\(v\.e\); \}\)/.test(grp) && /part\('cut', TX\('ui\.rv1-cut'\)\)/.test(grp), 'a review entry neither group shows is drawn in its Lists part (Chosen / Maybe / Cut)');
ok(/\[\['chosen', rv\.chosen\], \['maybe', rv\.maybe\], \['cut', rv\.cut\]\]/.test(fn('ui39ReviewMap')), 'the review entries: chosen, maybe, cut');
// 5 the top, the sections
ok(/at\.insertAdjacentElement\('afterend', head\)/.test(mount) && /rv1-bar/.test(mount) && /data-ui37-ct="\$\{k\}"/.test(fn('ui37HeadHTML')) && /data-ui37-export="json"/.test(fn('ui37HeadHTML')), 'the counters, map walk and Export at the top');
ok(/querySelector\('#ui22McClaude'\); if\(cl\) cl\.remove\(\)/.test(mount), 'no Thematic Recommendation section on a main map (its picks are in the groups)');
ok(/try\{ ui37Mount\(ov, top, mapId, ok\); \}catch\(e\)\{\}/.test(app.slice(app.indexOf('function pk1OpenMapCards'), app.indexOf('// UI37_PROS:START'))), 'pk1OpenMapCards mounts it');
// 6 CSS
ok(/\.ui37-tile\.ui39-tile\{display:flex; flex-direction:column;/.test(b38) && /\.ui39-list \.ui37-row\{display:flex; flex-wrap:wrap;/.test(b38) && /max-width:100%; box-sizing:border-box;/.test(b38), 'cards in a wrapping grid');
ok(/@media \(max-width:560px\)\{ \.pk1-mc-modal \.rv2-tip\{max-width:min\(240px, 62vw\);\}/.test(b38), 'the hidden Export all tip no longer widens the window at 390');
// 7 texts
{ const keys = ['ui.ui39-c-noart', 'ui.ui39-c-rarity'];
  const en = {}; keys.forEach(k=>{ const m = texts.match(new RegExp('"' + k + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, k + ' in bramblewood-texts.js'); if(m) en[k] = m[1]; ok(b37.includes("TX('" + k + "'"), k + ' used'); });
  CODES.forEach(c=>{ const d = JSON.parse(rd('lang/' + c + '.json')); keys.forEach(k=>{ if(en[k]) ok(typeof d[en[k]] === 'string' && d[en[k]].length > 0, c + ' has ' + k); }); }); }
// 8 build
{ const idx = rd('index.html'); ok(idx.includes('function ui39ConceptCardHTML') && idx.includes('ui39-tile') && !idx.includes('data-ui37-view="lists"'), 'index.html carries UI39 (rebuilt)'); }
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
