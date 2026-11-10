#!/usr/bin/env node
// 2026-11-09 (package UI38, owner 03:55): the admin Map cards window's bigger Prospects pool (NEW! 30+, Carried 20+, proposed concepts, no side maps).
// 1 the data file (docs/design/map-prospects-2026-11-09.json): every main map 0-20, pool sizes with no flags, concepts' fields, names, families;
// 2 ui38Fill lifted from arena_app.js and run on a small case (fit order, family cap, newMax, concepts, Carried fill, side-map cards left out, Yes-earlier first);
// 3 wiring (ui37Split uses it, no fold, Export carries concepts, the build bakes the file in); 4 texts in 12 packs; 5 the build is current.
// Browser: tests/e2e/ui38_2026_11_09.py (screenshots in docs/screens/ui38/).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js');
const blk = app.slice(app.indexOf('// UI38_PROS:START'), app.indexOf('// UI38_PROS:END'));
const b37 = app.slice(app.indexOf('// UI37_PROS:START'), app.indexOf('// UI37_PROS:END'));
ok(blk.length > 1000, 'the UI38_PROS block is in arena_app.js');

// 1. the data file
const D = JSON.parse(rd('docs/design/map-prospects-2026-11-09.json')), R = D.rules;
const cards = JSON.parse(rd('canonical/cards.json')), names = new Set(cards.map(c=> c.name.toLowerCase()));
const MAIN = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11'];
ok(MAIN.every(k=> D.maps[k]) && Object.keys(D.maps).length === 21, 'one entry per main map 0-20, no side map');
ok(R.newTarget === 30 && R.carriedTarget === 20 && R.familyCap === 2, 'rules: NEW! 30+, Carried 20+, family cap 2');
const seen = new Set(), cnames = new Set();
MAIN.forEach(k=>{ const m = D.maps[k], st = m.static;
  ok(st.new >= R.newTarget, `Map ${m.no}: NEW! ${st.new} >= ${R.newTarget} with no flags`);
  if(m.no >= 3) ok(st.carried >= R.carriedTarget, `Map ${m.no}: Carried ${st.carried} >= ${R.carriedTarget} with no flags`);
  m.concepts.forEach(c=>{
    ok(/^concept-[a-z0-9-]+$/.test(c.id) && !seen.has(c.id), 'concept id stable and unique: ' + c.id); seen.add(c.id);
    ok(['name', 'animal', 'family', 'element', 'rarity', 'role'].every(f=> typeof c[f] === 'string' && c[f]), c.id + ' has name, animal, family, element, rarity, role');
    ok(!('attack' in c) && !('health' in c) && !('skills' in c) && !('effects' in c), c.id + ': no stats or skills');
    ok(!names.has(c.name.toLowerCase()) && !cnames.has(c.name.toLowerCase()), c.name + ': no clash with a card name or another concept'); cnames.add(c.name.toLowerCase());
    ok(!/pyrenean|blue-ringed|otter|hummingbird|knight/i.test(c.name + ' ' + c.animal), c.name + ': a simple, non-faction animal');
  });
  const fc = {}; m.concepts.forEach(c=> fc[c.family] = (fc[c.family] || 0) + 1); ok(Object.values(fc).every(n=> n <= R.familyCap), `Map ${m.no}: no family more than ${R.familyCap} times among its concepts`);
  ok(m.fit.every(e=> Array.isArray(e) && typeof e[0] === 'string' && typeof e[1] === 'number' && typeof e[2] === 'string'), `Map ${m.no}: fit rows are [id, score, codes]`);
});
{ const r = cp.spawnSync('python3', [path.join(ROOT, 'tools/ui38/map_prospects_2026_11_09.py'), '--check'], {encoding: 'utf8'}); ok(r.status === 0, 'the generator check passes (no clash, no shortfall): ' + (r.stdout || '').split('\n').filter(l=> l.includes('!')).join(' | ')); }

// 2. ui38Fill on a small case
{ const P = {rules: {familyCap: 2, newMinScore: 4, newMax: 6, carriedFill: 3, newTarget: 5, carriedTarget: 20},
    family: {a1: 'croc', a2: 'croc', a3: 'croc', a4: 'frog', a5: 'heron', s1: 'snake', e1: 'croc', e2: 'bat', e3: 'mole', e4: 'owl', w1: 'frog'},
    maps: {mx: {fit: [['a1', 9, 'bc'], ['a2', 8, 'b'], ['a3', 8, 'b'], ['s1', 8, 'b'], ['a4', 3, 'k'], ['a5', 6, 'b'], ['e1', 5, 'b'], ['w1', 4, 'b']], concepts: [{id: 'concept-x', name: 'X', animal: 'x', family: 'x', element: 'physical', rarity: 'common', role: 'r'}]}}};
  const src = blk.replace('__MAP_PROSPECTS__', JSON.stringify(P));
  const env = `const mapNumberOf = id=> ({m0: 0, m1: 1, mx: 2})[id]; const mainConquestMaps = ()=> [{id: 'm0'}, {id: 'm1'}, {id: 'mx'}];
    const mpEntry = id=> ({m0: {cards: ['e1', 'e2'], submaps: {s: ['s1']}}, m1: {cards: ['e3', 'e4'], submaps: {}}, mx: {cards: [], submaps: {t: ['e3']}}})[id];
    const ui37MapsData = ()=> [{id: 'm0', n: 0, yes: ['e2'], no: []}, {id: 'm1', n: 1, yes: [], no: []}];
    const TX = k=> k, ui37FlagOf = ()=> '', escapeAttr = s=> s, cardChipHTML = ()=> '';`;
  const f = new Function(env + src + '; return {ui38Fill, ui38SideOnly, ui38Concept};')();
  const defs = {}; ['a1', 'a2', 'a3', 'a4', 'a5', 's1', 'e1', 'e2', 'e3', 'e4', 'w1'].forEach(id=> defs[id] = {name: id, animal: P.family[id]});
  const idx = new Map([['e1', 0], ['e2', 0], ['e3', 1], ['e4', 1]]), neu = [{id: 'w1', src: new Set(['list'])}], car = [];
  f.ui38Fill('mx', defs, ()=> true, idx, neu, car);
  const ids = l=> l.map(p=> p.id);
  ok(f.ui38SideOnly().has('s1'), 'a card only on a side map\'s list is side-only');
  ok(f.ui38SideOnly('mx').has('e3') && !f.ui38SideOnly('m1').has('e3') && !f.ui38SideOnly('mx').has('e1'), "a card on the map's own side map's list is left out on that map only");
  ok(JSON.stringify(ids(neu)) === JSON.stringify(['w1', 'a1', 'a2', 'a5', 'concept-x']), 'NEW!: list first, fit by score, family cap 2 (a3 left out), score < 4 left out, side-only s1 left out, concepts last: ' + ids(neu).join(','));
  ok(neu[1].src.has('fit') && neu[4].src.has('concept') && neu[1].why.length > 0, 'fit / concept sources and a why text');
  ok(JSON.stringify(ids(car)) === JSON.stringify(['e1', 'e2', 'e4']), 'Carried: fit first (e1), then the Yes-earlier card (e2), then the most recent map (Map 1; e3 is on this map\'s side map): ' + ids(car).join(','));
  ok(car[1].src.has('earlier') && !car[2].src.has('earlier'), 'only a card flagged Yes on an earlier map gets the "Yes earlier" pill');
  ok(f.ui38Concept('concept-x').mapId === 'mx' && f.ui38Concept('a1') === null, 'concept lookup by id'); }

// 3. wiring
ok(/ui38Fill\(top, defs, ok, pool, neu, car\);[^\n]*\n  return \{n, neu, car, extra: \[\], idx: /.test(b37), 'ui37Split fills both groups with ui38Fill; no fold list');
ok(!/details class="pk1-mc-sec rv2-panel ui37-grp ui37-extra"/.test(b37) && !/ui37-earlier/.test(b37), 'the closed "More cards from earlier maps" fold is gone');
ok(/src !== 'flag' && (src !== 'tut' && )?side\.has\(id\)/.test(b37) /* 2026-11-10 (UI43): the tutorial's cards pass */, 'prospects leave out side-map-only cards (unless already flagged)');
ok(/ui38Concept\(id\) \|\| \(defs\[id\] && ok\(id\)\)/.test(b37), 'a flagged concept id is a prospect');
ok(/concepts: ui38ExportConcepts\(\)/.test(b37) && /'concept', 'animal', 'family', 'element', 'rarity', 'role'/.test(b37), 'Export: concepts with their fields (JSON section, CSV columns)');
ok(/c \? ui39ConceptCardHTML\(c\) : rv \? rv1TileHTML/.test(b37) && /data-zoom-tip=/.test(b37), 'a concept shows as a placeholder card whose hover is the concept text (UI39: a full-size card, was a chip)');
ok(/sub_once\(app_src, "__MAP_PROSPECTS__"/.test(rd('assemble_arena.py')) && (app.match(/__MAP_PROSPECTS__/g) || []).length === 1, 'the build bakes the data file in once');

// 4. texts
{ const keys = ['sub', 'min', 'src-fit', 'src-concept', 'concept-tip', 'why-b', 'why-k', 'why-c', 'why-t', 'why-s', 'why-g', 'why-e'].map(k=> 'ui.ui38-' + k);
  const used = [...new Set([...(blk + b37).matchAll(/TX\('(ui\.ui38-[\w-]+)'/g)].map(x=> x[1]))];
  ok(used.every(k=> keys.includes(k)) && keys.every(k=> used.includes(k)), 'the TX keys used are the listed ones: ' + used.filter(k=> !keys.includes(k)).join(','));
  const en = {}; keys.forEach(k=>{ const m = texts.match(new RegExp('"' + k + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, k + ' in bramblewood-texts.js'); if(m) en[k] = m[1].replace(/\\"/g, '"'); });
  CODES.forEach(c=>{ const d = JSON.parse(rd('lang/' + c + '.json')); keys.forEach(k=>{ if(en[k]) ok(typeof d[en[k]] === 'string' && d[en[k]].length > 0, c + ' has ' + k); }); }); }

// 5. build is current
{ const idx = rd('index.html'); ok(idx.includes('function ui38Fill') && idx.includes('concept-clifftop-coney') && !idx.includes('__MAP_PROSPECTS__'), 'index.html carries UI38 with the data baked in (rebuilt)'); }
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
