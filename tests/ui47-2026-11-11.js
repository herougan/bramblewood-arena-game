#!/usr/bin/env node
// 2026-11-11 (package UI47, owner 00:06 / 00:16): Map cards window source checks. Browser measure with the owner's picks: tests/e2e/ui47_2026_11_11.py.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html'), texts = rd('bramblewood-texts.js');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const k = app.indexOf('\n', i), line = app.slice(i, k); if(/\}\s*(\/\/.*)?$/.test(line) && !/\{\s*(\/\/.*)?$/.test(line)) return line; const j = app.indexOf('\n}\n', i); return app.slice(i, j + 2); };
ok(/const UI47_SUGGEST = \{\};/.test(app) && /const UI47_ADMIN_ADD = \{\};/.test(app), 'UI47_SUGGEST and UI47_ADMIN_ADD exist and are empty');
ok(/const UI47_TUT = -1;/.test(app) && /n >= 0\) ui43TutorialCards\(\)\.forEach\(id=>\{ if\(!out\.has\(id\)\) out\.set\(id, UI47_TUT\)/.test(app), 'ui37CarriedIndex: Map 0 on, tutorial index -1');
ok(/if\(n != null && n >= 0\) ui43TutorialCards\(\)\.forEach\(id=> add\(id, 'tut'\)\)/.test(app), 'ui37Prospects: tutorial cards are prospects from Map 0');
// the pure rule, lifted
{ const f = new Function("const UI47_TUT = -1; const ui43TutorialCards = ()=> ['t1', 't2'];" + fn('ui37CarriedIndex') + 'return ui37CarriedIndex;')();
  const maps = [{n: 0, yes: ['a', 't1']}, {n: 1, yes: ['b']}, {n: 2, yes: ['c']}], idx0 = f(0, maps), idx2 = f(2, maps);
  ok(idx0.get('t1') === -1 && idx0.get('t2') === -1 && idx0.size === 2, 'Map 0: Carried = the tutorial cards only: ' + [...idx0]);
  ok(idx2.get('a') === 0 && idx2.get('b') === 1 && !idx2.has('c') && idx2.get('t1') === -1, 'Map 2: Yes cards of Maps 0-1 (pill = their map), tutorial -1, nothing from itself');
  ok(!f(null, maps).size, 'no map number, nothing carried'); }
// suggested / admin / baby helpers, lifted
{ const f = new Function("const UI47_SUGGEST = {m: ['s']}, UI47_ADMIN_ADD = {m: ['x']}; const ui37Ent = t=> ({yes: ['y']}); const ui38Concept = ()=> null; const ui13IsBaby = id=> id === 'baby';"
    + ['ui47SuggestedOf', 'ui47IsSuggested', 'ui47SuggestFirst', 'ui47AdminOf', 'ui47IsAdminAdded', 'ui47YesList', 'ui47IsBaby', 'ui47Counted', 'ui47Search'].map(fn).join('\n') + 'return {ui47SuggestFirst, ui47YesList, ui47IsAdminAdded, ui47Counted, ui47Search, ui47IsSuggested};')();
  const neu = [{id: 'a'}, {id: 's'}, {id: 'b'}]; f.ui47SuggestFirst('m', neu);
  ok(neu.map(p=> p.id).join() === 's,a,b', 'Suggested sorts first in NEW!, the rest keep their order');
  ok(f.ui47YesList('m').join() === 'y,x' && f.ui47IsAdminAdded('m', 'x') && !f.ui47IsAdminAdded('q', 'x'), 'admin adds join the Yes list');
  ok(f.ui47Counted([{id: 'baby'}, {id: 'a'}], {baby: {}, a: {}}).length === 1, 'baby cards are not counted');
  const defs = {'moon-jelly': {name: 'Moon Jelly'}, 'field-vole': {name: 'Field Vole'}, 'jelly-bean': {name: 'Jelly Bean'}};
  ok(f.ui47Search('jelly moon', defs, ()=> true).join() === 'moon-jelly', 'search: all words, any order');
  ok(f.ui47Search('jelly', defs, ()=> true)[0] === 'jelly-bean' && f.ui47Search('jelly', defs, id=> id !== 'jelly-bean').join() === 'moon-jelly', 'search: starts-with first; ok() filter applies; nothing for empty text: ' + f.ui47Search('', defs, ()=> true).length); }
// wiring
ok(/ui47SuggestFirst\(top, neu\)/.test(fn('ui37Split')), 'ui37Split sorts Suggested first');
ok(/yes: ui47YesList\(m\.id\)/.test(fn('ui37MapsData')) && /ui47IsAdminAdded\(top, id\)/.test(fn('ui37FlagOf')), 'admin adds count as Yes for Carried and flags');
ok(!/ui47AdminOf|UI47_ADMIN_ADD/.test(fn('ui37Publish') + fn('ui37SetFlag') + fn('ui37Ent')), 'admin adds are never written to the owner picks');
ok(/ui47YesIds\(top, mapId, ok\)/.test(fn('ui32McSkillIds')) && /ui32McRefreshSkills\(ov\); \/\* 2026-11-11 \(UI47 #2\)/.test(app), 'Skills on these cards: Yes cards, redrawn on each flag');
ok(/ui37SetFlag\(key, id, 'yes'\)/.test(app) && /id="ui47AddIn"/.test(app) && /role="combobox"/.test(app) && /ArrowDown/.test(app), 'Add card: search box, combobox keys, the ui37SetFlag path');
ok(/ui39PlainTileHTML\(id, defs, ''/.test(fn('ui22McTile')), 'Skirmish rewards use the shared full card tile');
ok(/ui47UsedChipHTML\(p\.id\)/.test(fn('ui37TileHTML')) && /ui47-sug/.test(fn('ui37TileHTML')) && /ui47-adm/.test(fn('ui37TileHTML')), 'tile: x N chip, Suggested and Added by Claude badges');
ok(/ui47Counted\(sp\.neu/.test(fn('ui37HeadHTML')) && /ui47Counted\(sp\.neu/.test(fn('ui44HeadHTML')), 'NEW! flagged count skips baby cards (main and side maps)');
// texts and the 12 packs
const keys = {'ui.ui47-suggested': 'Suggested', 'ui.ui47-from-tip': 'Flagged Yes on Map {n}', 'ui.ui47-from-tut-tip': 'Given by the tutorial maps (T-1, T-2)', 'ui.ui47-add': 'Add card', 'ui.ui47-add-ph': 'Search a card by name', 'ui.ui47-add-none': 'No card matches.', 'ui.ui47-add-yes': 'already Yes here', 'ui.ui47-added': 'Added {name} to {group}.', 'ui.ui47-baby-note': 'Baby cards are not counted.', 'ui.ui47-used-tip': 'Used on {n} main maps: {maps}', 'ui.ui47-admin-added': 'Added by Claude'};
const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'], packs = {};
codes.forEach(c=> packs[c] = JSON.parse(rd('lang/' + c + '.json')));
Object.entries(keys).forEach(([k, en])=>{
  ok(texts.includes('"' + k + '": ' + JSON.stringify(en)), 'TX key ' + k);
  ok(codes.every(c=> typeof packs[c][en] === 'string' && packs[c][en] && (c === 'ja' || c === 'ko' || /zh/.test(c) || packs[c][en] !== en || en === 'Suggested')), k + ': translated in 12 packs');
});
ok(html.includes('UI47_ADMIN_ADD') && html.includes('ui47Add'), 'index.html rebuilt');
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
