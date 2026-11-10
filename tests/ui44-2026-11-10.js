#!/usr/bin/env node
// 2026-11-10 (package UI44, owner 16:02): the admin Map cards window of a SIDE MAP has the Prospects view: "Unlocks after" select (default = the map the game opens it
// after today, saved only as the owner's pick), Carried = Yes on main maps up to the pick + the T-1 / T-2 tutorial cards, NEW! = the side map's list, Claude's thematic
// proposals and its own flags minus Carried; targets 12 / 8. Pure rules lifted from arena_app.js; the browser check is tests/e2e/ui44_2026_11_10.py.
'use strict';
const fs = require('fs'), path = require('path');
const rd = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html'), texts = rd('bramblewood-texts.js');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i), k = app.indexOf('\n', i); const e = (app[k - 1] === '}' && (j < 0 || j > k)) ? k : j + 2; return app.slice(i, e); };

// the world: Map 0 Outskirts (tutorial T-1 / T-2: t1, t2), Map 1 Thistlewood, Map 2 Gannet, Map 3 Pebble; side map sq opens after Map 2 (afterMapCleared 'm2'), sm after side map sq
const CONQUEST_MAPS = [{id: 'm0'}, {id: 'm1'}, {id: 'm2'}, {id: 'm3'}, {id: 'sq', sub: true, parent: 'm1', entry: {afterMapCleared: 'm2'}}, {id: 'sm', sub: true, parent: 'm0', entry: {afterMapCleared: 'sq'}},
  {id: 'mm', sub: true, parent: 'm0', endless: true}, {id: 'tw', sub: true, parent: 'm0', endless: true, tower: true}, {id: 'mtut', sub: true, parent: 'm0'}, {id: 'sr', sub: true, parent: 'm0', reserved: true}];
const MAINS = ['m0', 'm1', 'm2', 'm3'];
const mpMapById = id=> CONQUEST_MAPS.find(m=> m.id === id) || null, mainConquestMaps = ()=> CONQUEST_MAPS.filter(m=> !m.sub);
const mapNumberOf = id=>{ const m = mpMapById(id); if(!m) return null; return MAINS.indexOf(m.sub ? m.parent : m.id); };
const mpTopOf = id=> { const m = mpMapById(id); return m && m.sub ? m.parent : id; };
const mapUnlockNumberOf = id=>{ const m = mpMapById(id), n = mapNumberOf(id); if(!m.sub) return n; const a = m.entry && m.entry.afterMapCleared; return Math.max(n, a ? mapUnlockNumberOf(a) : 0); };
const ui37Picks = {}; const ui37Save = ()=>{}, ui37Publish = ()=>{}; const localStorage = {setItem(){}};
const defs = {}; ['t1', 't2', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(id=> defs[id] = {name: id.toUpperCase(), rarity: 'common', animal: id}); defs.i = {name: 'I', rarity: 'common', animal: 'a'}; defs.j = {name: 'J', rarity: 'common', animal: 'a'}; defs.k = {name: 'K', rarity: 'common', animal: 'a'};
const E1 = {sq: {fits: ['a', 'b', 'nope'], add: [{id: 'c', why: 'meadow'}, {id: 'zzz', why: 'x'}]}};
const maps = {m0: {cards: ['t1'], submaps: {sq: ['d', 'e']}}};
const mpEntry = top=> maps[top] || {cards: [], submaps: {}};
const MAPS_DATA = [{id: 'm0', n: 0, yes: [], no: []}, {id: 'm1', n: 1, yes: ['f'], no: []}, {id: 'm2', n: 2, yes: ['g', 'i'], no: []}, {id: 'm3', n: 3, yes: ['h'], no: []}];
const ui37MapsData = ()=> MAPS_DATA.map(m=> Object.assign({}, m, {yes: (ui37Picks[m.id] && ui37Picks[m.id].yes) || m.yes}));
const mpEntry2 = id=> id === 'm1' ? {cards: [], submaps: {sq: ['d', 'e']}} : {cards: [], submaps: {}};
const rv1ReviewOf = ()=> null, ui38Concept = ()=> null, ui38Family = (id, d)=> d[id] && d[id].animal, roadRarityStep = ()=> 0, UI38_PROS = {rules: {familyCap: 2}};
const ui43TutorialCards = ()=> ['t1', 't2'];
const body = ['ui37Arr', 'ui37Ent', 'ui37FlagOf', 'ui37CarriedIndex', 'ui41Cap', 'ui44IsSub', 'ui44ProsSubs', 'ui44MainByNo', 'ui44CurrentAfter', 'ui44After', 'ui44SetAfter', 'ui44UnlockPicks', 'ui44Split', 'ui37Targets'].map(fn).join('\n');
const th6Targets = n=> ({own: 10, carried: 5});
const F = new Function('CONQUEST_MAPS', 'mpMapById', 'mainConquestMaps', 'mapNumberOf', 'mpTopOf', 'mapUnlockNumberOf', 'ui37Picks', 'ui37Save', 'ui37Publish', 'UI44_SIDE', 'mpEntry', 'ui37MapsData', 'rv1ReviewOf', 'ui38Concept', 'ui38Family', 'roadRarityStep', 'UI38_PROS', 'ui43TutorialCards', 'th6Targets',
  body + '; return {ui44IsSub, ui44ProsSubs, ui44CurrentAfter, ui44After, ui44SetAfter, ui44Split, ui37Targets, ui44UnlockPicks};')(CONQUEST_MAPS, mpMapById, mainConquestMaps, mapNumberOf, mpTopOf, mapUnlockNumberOf, ui37Picks, ui37Save, ui37Publish, E1, mpEntry2, ui37MapsData, rv1ReviewOf, ui38Concept, ui38Family, roadRarityStep, UI38_PROS, ui43TutorialCards, th6Targets);
const okAll = ()=> true;

ok(F.ui44ProsSubs().map(m=> m.id).join() === 'sq,sm', 'side maps get the view: not the Tutorial, endless dungeons, tower or reserved');
ok(F.ui44IsSub('mm') === false && F.ui44IsSub('mtut') === false && F.ui44IsSub('m2') === false && F.ui44IsSub('sr') === false, 'main maps / mtut / endless / reserved are not');
ok(F.ui44CurrentAfter('sq') === 'm2', 'default = the entry.afterMapCleared map (Map 2)');
ok(F.ui44CurrentAfter('sm') === 'm2', 'a side map waiting on another side map resolves to the number that one opens at (Map 2)');
let sp = F.ui44Split('sq', defs, okAll);
const ids = l=> l.map(p=> p.id).sort().join();
ok(sp.n === 2 && sp.afterId === 'm2', 'split reads the default unlock map');
ok(ids(sp.car) === 'f,g,i,t1,t2' && !sp.car.some(p=> p.id === 'h'), 'Carried = Yes on Maps 0-2 (f, g, i) + the tutorial cards; the Map 3 Yes (h) is not');
ok(sp.idx.get('t1') === 0 && sp.idx.get('f') === 1 && sp.idx.get('g') === 2, 'pill numbers: tutorial 0, then the map that gives it');
ok(['d', 'e'].every(i=> sp.neu.some(p=> p.id === i && p.src.has('list'))), 'NEW! has the side map\'s own list');
ok(sp.neu.some(p=> p.id === 'a' && p.src.has('claude')) && sp.neu.some(p=> p.id === 'c' && p.why === 'meadow'), 'NEW! has Claude\'s fits and add (the why carried)');
ok(!sp.neu.some(p=> p.id === 'nope' || p.id === 'zzz'), 'ids that are not card defs are dropped');
ok(!sp.neu.some(p=> sp.car.some(q=> q.id === p.id)), 'nothing in both groups');
// the family cap: a, i, j, k share the animal 'a'; i is Carried; a (claude fit), j, k are NEW! only past the cap of 2
ui37Picks.sq = {yes: ['j'], no: ['k'], t: {}, after: '', localAt: 1};
sp = F.ui44Split('sq', defs, okAll);
ok(sp.neu.some(p=> p.id === 'j') && sp.neu.some(p=> p.id === 'e'), 'a card flagged Yes on the side map shows in NEW!');
ok(!sp.neu.some(p=> p.id === 'k') && sp.neu.some(p=> p.id === 'a'), 'family cap 2: the Yes card counts first, so the third animal-a card (k, flagged No only) is left out');
// choosing the unlock map
F.ui44SetAfter('sq', 'm1'); ok(ui37Picks.sq.after === 'm1' && ui37Picks.sq.yes.join() === 'j', 'the pick is saved beside the flags');
sp = F.ui44Split('sq', defs, okAll);
ok(ids(sp.car) === 'f,t1,t2' && sp.n === 1, 'an earlier pick (Map 1) drops the Map 2 Yes cards from Carried');
ok(sp.neu.some(p=> p.id === 'g') === false, 'a Yes on Map 2 is not NEW! either when it is on no list (only listed / proposed / flagged cards are NEW!)');
F.ui44SetAfter('sq', 'm3'); sp = F.ui44Split('sq', defs, okAll); ok(sp.car.some(p=> p.id === 'h' && sp.idx.get('h') === 3), 'a later pick (Map 3) adds the Map 3 Yes cards, pill Map 3');
F.ui44SetAfter('sq', 'm2'); ok(ui37Picks.sq.after === '', 'choosing the current map again clears the pick');
ok(JSON.stringify(F.ui44UnlockPicks()) === '[]', 'no pick: nothing to export');
F.ui44SetAfter('sq', 'm3'); ok(F.ui44UnlockPicks()[0].unlockAfterNo === 3 && F.ui44UnlockPicks()[0].currentUnlockId === 'm2', 'the export lists the pick and the current unlock');
ok(F.ui44After('sm') === 'm2', 'a side map without a pick uses the current one');
// targets
const tg = F.ui37Targets('sq'); ok(tg.n === 12 && tg.c === 8 && tg.dn === 12 && tg.dc === 8, 'side-map targets default 12 / 8');
ui37Picks.sq.t = {n: 9}; ok(F.ui37Targets('sq').n === 9 && F.ui37Targets('sq').c === 8, 'targets are editable');
ok(F.ui37Targets('m2').n === 10, 'a main map keeps th6Targets');
// wiring in the source
ok(/ui44IsSub\(mapId\)/.test(fn('ui37Mount')) && /ui44Split\(mapId/.test(fn('ui37Mount')) && /data-ui44-after/.test(fn('ui37Mount')), 'the Map cards mount draws the side-map view and redraws on the select');
ok(/after: e\.after/.test(fn('ui37SetFlag')) && /after: e\.after/.test(fn('ui37SetTarget')), 'flags and targets keep the unlock pick');
ok(/afterNo: mapNumberOf\(e\.after\)/.test(fn('ui37Publish')) && /r\.data\.after/.test(fn('applyCloudMapPicks')), 'published in the same __cfg:map-picks:<subId> row and read back');
ok(/ui44ExportRows\(rows, defs\)/.test(fn('ui37ExportRows')) && /unlockAfterId/.test(fn('ui37ExportFile')) && /submapUnlocks/.test(fn('ui37ExportFile')), 'Export picks JSON and CSV carry the pick');
ok(/never changes|does not change the game's unlock/.test(app) && !/entry\.afterMapCleared\s*=/.test(app.slice(app.indexOf('function ui44IsSub'), app.indexOf('// UI37_PROS:END'))), 'the pick never writes the game\'s entry');
// texts
const keys = ['ui.ui44-unlocks-after', 'ui.ui44-current', 'ui.ui44-after-note', 'ui.ui44-target-tip', 'ui.ui44-sub'];
const TEXT = {}; keys.forEach(k=>{ const m = new RegExp('"' + k.replace(/\./g, '\\.') + '": ("(?:[^"\\\\]|\\\\.)*")').exec(texts); ok(!!m, 'TX key ' + k); if(m) TEXT[k] = JSON.parse(m[1]); });
ok(/Saved as your pick; Claude folds it into the map later/.test(TEXT['ui.ui44-after-note'] || ''), 'the note says it is only a saved pick');
['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const d = JSON.parse(rd('lang/' + c + '.json')); keys.forEach(k=> ok(d[TEXT[k]] && d[TEXT[k]] !== TEXT[k], c + ' translates ' + k)); ok((d[TEXT['ui.ui44-target-tip']] || '').includes('{t}'), c + ' keeps {t}'); });
// embed
ok(/const UI44_SIDE = __SIDE_PROPOSALS__/.test(app) && /sub_once\(app_src, "__SIDE_PROPOSALS__"/.test(rd('assemble_arena.py')), 'proposals are embedded at build time by assemble_arena.py');
const m = /const UI44_SIDE = (\{.*?\}); \/\/ \{subId/.exec(html);
let side = null; try{ side = m && JSON.parse(m[1]); }catch(e){}
ok(side && side.mq && side.mq.fits.includes('lucky-hopper') && side.mq.add[0].id === 'meadow-rabbit' && side.mq.add[0].why, 'index.html embeds the fits and add ids with the why text');
ok(side && Object.keys(side).length >= 15 && !('concepts' in side.mq) && !('off' in side.mq), 'only fits and add are embedded');
console.log(fail ? `ui44: ${fail} failed, ${pass} passed` : `ok ${pass} checks`); process.exit(fail ? 1 : 0);
