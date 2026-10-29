#!/usr/bin/env node
// Package REVIEW2 (2026-10-29; owner 19:14). Part A, the 🃏 Map cards gallery: pills read off each entry's why / by (Skirmish, Carried or Unique, Your note,
// Claude's pick; no "kept"), the "X/N new cards, Y/M carried cards" targets per list, Chosen / Maybe / Cut order, panels, large cards, the Copy tooltip, texts in
// 12 packs. Part B, the Ambush: no link of its own (not drawn, not editable) and standing at the middle of the road it interrupted, computed (not a saved
// coordinate), with the unlock order unchanged. The browser run is tests/e2e/review1_2026_10_29.py (gallery) and the shots in docs/screens/review2/.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html');
function fnSrc(name){
  const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}
const TXs = {'ui.rv2-tag-skirmish': 'Skirmish', 'ui.rv2-tag-carried': 'Carried', 'ui.rv2-tag-unique': 'Unique', 'ui.rv2-tag-owner': 'Your note', 'ui.rv2-tag-claude': "Claude's pick", 'ui.rv2-tip-owner': 'o', 'ui.rv2-tip-claude': 'c',
  'ui.rv2-count': '{x}/{n} new cards, {y}/{m} carried cards', 'ui.rv2-count-new': '{x}/{n} new cards', 'ui.rv2-count-free': '{x} new cards, {y} carried cards'};
const TX = (k, v)=> String(TXs[k] || k).replace(/\{(\w+)\}/g, (_, n)=> v && n in v ? v[n] : '{' + n + '}');

// --- A1. pills
const SIDE = app.slice(app.indexOf('const RV2_SIDE_CLASS'), app.indexOf('\n', app.indexOf('const RV2_SIDE_UNIQUE')));
const A = new Function('TX', SIDE + '\n' + ['rv2IsCarried', 'rv2TagsOf', 'rv2TargetsOf', 'rv2CountText'].map(fnSrc).join('\n') + '\nreturn {rv2IsCarried, rv2TagsOf, rv2TargetsOf, rv2CountText, RV2_SIDE_CLASS, RV2_SIDE_UNIQUE};')(TX);
const names = e=> A.rv2TagsOf(e).map(t=> t[1]).join('+');
ok(names({why: 'Volcanic & ash card; skirmish reward of 6-3', by: 'kept'}) === 'Skirmish+Unique', 'A1. a skirmish reward: Skirmish + Unique, no kept pill (' + names({why: 'Volcanic & ash card; skirmish reward of 6-3', by: 'kept'}) + ')');
ok(names({why: 'Village & keep card; first-clear card of 6-5', by: 'kept'}) === 'Skirmish+Unique', 'A1. a first-clear card is a Skirmish card too');
ok(names({why: 'Carried from The Sundered Peak (Map 20); Volcanic & ash card', by: 'kept'}) === 'Carried', 'A1. carried from an earlier map: Carried only');
ok(names({why: 'Owner L2: carried from T-1 / T-2', by: 'owner'}) === 'Carried+Your note', 'A1. the owner\'s note adds "Your note" (' + names({why: 'Owner L2: carried from T-1 / T-2', by: 'owner'}) + ')');
ok(names({why: 'Too strong early', by: 'claude'}) === 'Unique+Claude\'s pick', 'A1. Claude\'s own pick is "Claude\'s pick"');
ok(names({why: 'Swamp & bog card, on no list now'}) === 'Unique', 'A1. a maybe (no by) shows no author pill');
ok(!A.rv2TagsOf({why: 'x', by: 'kept'}).some(t=> /kept/i.test(t[0] + t[1])), 'A1. there is no kept pill');
ok(A.rv2TagsOf({why: 'x', by: 'owner'}).find(t=> t[0] === 'owner')[2] && A.rv2TagsOf({why: 'x', by: 'claude'}).find(t=> t[0] === 'claude')[2], 'A1. the owner and Claude pills carry a tooltip saying what they mean');
// --- A2. targets
const u = n=> Array.from({length: n}, ()=> ({why: 'Meadow card'})), c = n=> Array.from({length: n}, ()=> ({why: 'Carried from Map 1'}));
let t = A.rv2TargetsOf({key: 'cards'}, 'm5', u(9).concat(c(4)), u(9).concat(c(4)));
ok(t && t.n === 9 && t.m === 4, 'A2. main map: unique 9 is in 8-11 so N = 9; carried 4 is in 4-5 so M = 4');
t = A.rv2TargetsOf({key: 'cards'}, 'm5', u(14).concat(c(1)), u(14).concat(c(1))); ok(t.n === 11 && t.m === 5, 'A2. main map out of range: the caps 11 and 5');
t = A.rv2TargetsOf({key: 'cards'}, 'm1', u(12), u(12)); ok(t.n === 11 && t.m === 0, 'A2. a map nothing is carried to has no carried target (M = 0)');
t = A.rv2TargetsOf({key: 'sub:mp', sub: 'mp'}, 'm5', u(3).concat(c(10)), u(3).concat(c(10))); ok(t.n === 3 && t.m === 10, 'A2. a new-location submap: 3 new, 10 carried');
t = A.rv2TargetsOf({key: 'sub:mz', sub: 'mz'}, 'm5', u(1).concat(c(12)), []); ok(t.n === 1 && t.m === 12, 'A2. a challenge submap: 1 new; carried 10+ (12 already, so M = 12)');
t = A.rv2TargetsOf({key: 'sub:mx', sub: 'mx'}, 'm20', u(5).concat(c(10)), []); ok(t.n === 5 && t.m === 10, 'A2. the Volcano Lair: 5 new');
ok(A.rv2TargetsOf({key: 'sub:mtut12', sub: 'mtut12'}, 'mtut', u(7), []) === null && A.rv2TargetsOf({key: 'cards'}, 'mtut', u(18), []) === null && A.rv2TargetsOf({key: 'special'}, 'm5', u(3), []) === null, 'A2. the Tutorial lists and SPECIAL have no target');
ok(A.rv2CountText(4, 2, {n: 11, m: 5}) === '4/11 new cards, 2/5 carried cards' && A.rv2CountText(4, 2, {n: 11, m: 0}) === '4/11 new cards' && A.rv2CountText(4, 2, null) === '4 new cards, 2 carried cards', 'A2. the three count lines');
const side = JSON.parse(rd('docs/balance/theme2-proposal-2026-10-28.json')).sideClasses;
ok(side.every(x=> A.RV2_SIDE_CLASS[x.key] === x.class), 'A2. the class table matches theme2-proposal sideClasses');
// --- A3. structure
{ const body = fnSrc('pk1OpenMapCards'), i = body.indexOf("part('chosen'"), j = body.indexOf("part('maybe'"), k = body.indexOf("part('cut'");
  ok(i > 0 && j > i && k > j, 'A3. the parts run Chosen, Maybe, Cut cards');
  ok(/rv2-panel/.test(body) && /rv2CopyTip/.test(body) && /role="tooltip"/.test(body) && /ui\.rv2-copy-tip/.test(body) && /rv2-counts/.test(body) && /rv2Update\(ov\)/.test(body), 'A3. panels, the Copy tooltip (role=tooltip) and the live count line are built');
  ok(/\.rv2-panel\{[^}]*border:2px solid/.test(css) && /\.rv2-copy:focus-within \.rv2-tip/.test(css) && /\.rv2-copy:hover \.rv2-tip/.test(css), 'A3. CSS: bounded panels, the tooltip shows on hover and on focus');
  ok(/\.vis4-mc-card\.is-large\{width:100% !important/.test(css), 'A3. CSS: large cards beat the 38px phone rule');
  const tiles = fnSrc('rv1TilesHTML'); ok(!/rv1-why|rv1-cap|rv1-by/.test(tiles), 'A3. the why is no longer printed under each card'); }

// --- B. the Ambush
{ const mk = (nodes)=> ({id: 'm4', nodes}), N = (key, extra)=> Object.assign({key}, extra || {});
  const code = ['mapRoadGeom', 'ambushRoadSpot', 'ambushOnRoad'].map(fnSrc).join('\n') + '\nreturn {mapRoadGeom, ambushRoadSpot, ambushOnRoad};';
  const B = new Function('skirmishCode', 'AMBUSH_AT', code)((m, k)=> ({a: '3-1', b: '3-2', c: '3-3'}[k] || k), '3-2');
  const map = mk([N('a'), N('b', {requires: ['a']}), N('c', {requires: ['b']}), N('amb', {ambush: true, requires: [], fixedPos: {x: 1, y: 1}})]);
  let pos = [{x: 10, y: 20}, {x: 30, y: 60}, {x: 70, y: 80}, {x: 99, y: 99}];
  const sp = B.ambushRoadSpot(map, pos);
  ok(sp && sp.index === 3 && Math.abs(sp.x - 20) < 1e-9 && Math.abs(sp.y - 40) < 1e-9, 'B1. the Ambush stands at the midpoint of the road into 3-2 (computed: ' + JSON.stringify(sp) + ')');
  const moved = B.ambushOnRoad(map, [{x: 10, y: 20}, {x: 50, y: 20}, {x: 70, y: 80}, {x: 99, y: 99}]); ok(Math.abs(moved[3].x - 30) < 1e-9 && Math.abs(moved[3].y - 20) < 1e-9, 'B1. it follows its neighbours when they move (a layout edit)');
  // a fight standing on the road bows it: the midpoint is the bowed road's middle, and the Ambush itself never bows a road
  const map2 = mk([N('a'), N('b', {requires: ['a']}), N('x'), N('amb', {ambush: true, requires: []})]);
  const g = B.mapRoadGeom(map2, [{x: 10, y: 10}, {x: 50, y: 10}, {x: 30, y: 10.5}, {x: 99, y: 99}], 0, 1); ok(g.blocked === true, 'B2. a fight on the road still bows it');
  const g2 = B.mapRoadGeom(map2, [{x: 10, y: 10}, {x: 50, y: 10}, {x: 99, y: 99}, {x: 30, y: 10}], 0, 1); ok(g2.blocked === false, 'B2. the Ambush standing on the road does not bow it');
  const sp2 = B.ambushRoadSpot(Object.assign({}, map2, {nodes: [N('a'), N('b', {requires: ['a']}), N('x'), N('amb', {ambush: true, requires: []})]}), [{x: 10, y: 10}, {x: 50, y: 10}, {x: 30, y: 10.5}, {x: 0, y: 0}]);
  ok(sp2 && Math.abs(sp2.x - 30) < 1e-9 && sp2.y !== 10, 'B2. on a bowed road the middle is the curve\'s middle, not the chord\'s (' + JSON.stringify(sp2) + ')');
  ok(B.ambushRoadSpot(mk([N('a'), N('b'), N('amb', {ambush: true})]), [{x: 0, y: 0}, {x: 1, y: 1}, {x: 5, y: 5}]) === null && B.ambushRoadSpot(mk([N('a'), N('b', {requires: ['a']})]), [{x: 0, y: 0}, {x: 1, y: 1}]) === null, 'B3. no link into 3-2 (or no Ambush): nothing moves, the saved spot stays');
}
{ const f = fnSrc('applyAmbushNode');
  ok(/requires: \[\], floating: true, ambush:true/.test(f), 'B4. the Ambush still requires nothing: no link, open the moment it is seen (unlock order unchanged)');
  const lock = fnSrc('ambushLocksNode'); ok(/skirmishCode\(map\.id, node\.key\) !== AMBUSH_AT\) return false;\s*return ambushPending\(\)/.test(lock), 'B4. ambushLocksNode (the fight it stopped stays locked until the Ambush is won) is as before');
  ok(/if\(n\.ambush\) return; \/\/ 2026-10-29/.test(app) && /j===undefined \|\| map\.nodes\[j\]\.ambush/.test(app), 'B5. the trail drawer draws no road from or to the Ambush');
  ok(/geo = mapRoadGeom\(map, positions, j, i\), blocked = geo\.blocked/.test(app), 'B5. the drawer and the Ambush use the one road geometry');
  const mp = fnSrc('mapNodePositions'), raw = fnSrc('mapNodePositionsRaw');
  ok(/ambushOnRoad\(map, mapNodePositionsRaw\(map\)\)/.test(mp) && /!n\.ambush && !\(opening/.test(raw), 'B6. every position read puts the Ambush on its road; a saved layout cannot move it');
  ok(/if\(n\.ambush\) return; \/\* 2026-10-29/.test(app), 'B7. the layout editor never saves a spot for the Ambush');
  ok(/el\.classList\.contains\('is-ambush'\)\)\{ el\.title = TX\('ui\.rv2-ambush-fixed'\); return; \}/.test(app) && /ambushRoadSpot\(map, mapNodePositionsRaw\(map\)\)/.test(app), 'B7. in the layout editor it is not draggable and follows its neighbours as they are dragged');
  ok(/if\(to\.ambush \|\| from\.ambush\) return;/.test(app) && /if\(t\.classList\.contains\('is-ambush'\)\) return;/.test(app), 'B8. the link editor takes no link to or from the Ambush');
}
// --- texts
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, keys = ['tag-skirmish', 'tag-carried', 'tag-unique', 'tag-owner', 'tag-claude', 'tip-owner', 'tip-claude', 'copy-tip', 'count', 'count-new', 'count-free', 'ambush-fixed'].map(k=> 'ui.rv2-' + k);
  ok(keys.every(k=> T[k]), 'T. the TX keys exist');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  ok(codes.every(c=>{ const p = JSON.parse(rd('lang/' + c + '.json')); return keys.every(k=> p[T[k]] && (T[k].match(/\{\w+\}/g) || []).every(ph=> p[T[k]].includes(ph))); }), 'T. each has a row in all 12 packs, placeholders kept'); }
console.log(`review2: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
