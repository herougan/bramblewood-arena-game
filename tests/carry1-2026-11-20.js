#!/usr/bin/env node
// 2026-11-20 (package CARRY1, owner 00:26: "Make sure the recommendations were explicit by you - not just accumulation of all previous map lists"):
//   1. docs/design/carry-picks-2026-11-20.json: picks for main maps 1-20 and the side maps of Maps 0-20, {id, why} (why <= 8 words), each an earlier card
//      (on an earlier main map's list or flagged Yes there, the flags as read into `_yes`; a main map also takes side maps opened before it), none on its own list;
//   2. baked into index.html as CARRY1_PICKS;
//   3. the window: a main map's and a side map's Carried group = its list's carried cards + its flags + the picks; a later-map pick is not shown.
//   node tests/carry1-2026-11-20.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js');
const fn = name => { const i = app.indexOf('function ' + name + '('); if (i < 0) return ''; const j = app.indexOf('\n}\n', i), k = app.indexOf('\n', i); const e = (app[k - 1] === '}' && (j < 0 || j > k)) ? k : j + 2; return app.slice(i, e); };
const same = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

// ---- 1. the picks file ----
const D = J('docs/design/carry-picks-2026-11-20.json'), YES = D._yes || {}, PICKS = {}; Object.keys(D).filter(k => !k.startsWith('_')).forEach(k => { PICKS[k] = D[k]; });
const C = new Set(J('canonical/cards.json').map(c => c.id)), P = J('canonical/map-pools.json').maps;
const { MAPS } = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const main = MAPS.filter(m => !m.sub), num = id => { const m = MAPS.find(x => x.id === id); return m ? main.indexOf(m.sub ? MAPS.find(x => x.id === m.parent) : m) : null; };
const unlock = id => { const m = MAPS.find(x => x.id === id), n = num(id); if (!m.sub) return n; const a = m.entry && m.entry.afterMapCleared; return Math.max(n || 0, a ? unlock(a) : 0); };
const mains = main.filter(m => !m.reserved).map(m => ({ id: m.id, n: num(m.id), list: (P[m.id] || {}).cards || [] }));
const sides = MAPS.filter(m => m.sub && !m.reserved && !m.endless && !m.tower && m.id !== 'mtut' && num(m.id) <= 20).map(m => ({ id: m.id, after: unlock(m.id), list: ((P[m.parent] || {}).submaps || {})[m.id] || [] }));
const tut = ((P.m1 || {}).submaps || {}).mtut12 || [];
ok(Object.keys(YES).length >= 30, '1. the file keeps the Yes flags it was checked against (_yes)');
const earlier = (n, side) => { const s = new Set(); if (n <= 1) tut.forEach(id => s.add(id));
  mains.filter(m => m.n < n).forEach(m => m.list.concat(YES[m.id] || []).forEach(id => s.add(id)));
  if (!side) sides.filter(x => x.after < n).forEach(x => x.list.concat(YES[x.id] || []).forEach(id => s.add(id)));
  return s; };
const targets = mains.filter(m => m.n >= 1 && m.n <= 20).map(m => ({ id: m.id, n: m.n, list: m.list, side: false })).concat(sides.map(x => ({ id: x.id, n: x.after + 1, list: x.list, side: true })));
ok(same(Object.keys(PICKS), targets.map(t => t.id)), '1. one entry per main map 1-20 and per side map of Maps 0-20: ' + Object.keys(PICKS).filter(k => !targets.some(t => t.id === k)).concat(targets.filter(t => !PICKS[t.id]).map(t => t.id)).join(' '));
let total = 0;
targets.forEach(t => { const l = PICKS[t.id] || [], E = earlier(t.n, t.side), own = new Set(t.list.concat(YES[t.id] || [])); total += l.length;
  ok(Array.isArray(l) && l.length <= 10, `1. ${t.id}: 0-10 picks (${l.length})`);
  l.forEach(e => {
    ok(e && C.has(e.id), `1. ${t.id}: ${e && e.id} is a card`);
    ok(typeof e.why === 'string' && e.why.trim() && e.why.trim().split(/\s+/).length <= 8, `1. ${t.id}: ${e.id}'s why is 1-8 words`);
    ok(E.has(e.id), `1. ${t.id}: ${e.id} comes from an earlier map (no pick from a later one)`);
    ok(!own.has(e.id), `1. ${t.id}: ${e.id} is not already on its list or flags`);
  });
  ok(new Set(l.map(e => e.id)).size === l.length, `1. ${t.id}: no pick twice`);
});
ok(total >= 40, '1. picks in all: ' + total);
ok(!(PICKS.m10 || []).some(e => tut.includes(e.id)) && targets.filter(t => t.n >= 2).every(t => !(PICKS[t.id] || []).some(e => tut.includes(e.id) && !(YES.m1 || []).concat(YES.mf || []).includes(e.id))), '1. no tutorial-only card is picked past Map 1');

// ---- 2. the bake ----
ok(/sub_once\(app_src, "__CARRY_PICKS__"/.test(rd('assemble_arena.py')) && (app.match(/__CARRY_PICKS__/g) || []).length === 1, '2. assemble_arena.py bakes the file in once');
{ const html = rd('index.html'), m = html.match(/const CARRY1_PICKS = (\{.*?\}); /);
  ok(!!m && same(Object.keys(JSON.parse(m[1])), Object.keys(PICKS)) && !html.includes('__CARRY_PICKS__') && !m[1].includes('"_yes"'), '2. index.html carries the picks (no notes)'); }
ok(!/idx\.keys\(\)/.test(fn('ui38Fill')) && !/'earlier'\); \}\);/.test(fn('ui44Split')) && !/fit\(id\)/.test(fn('ui44Split')), '2. the accumulation fills are gone (ui38Fill, ui44Split)');

// ---- 3. the window ----
const ids = l => l.map(p => p.id);
{ // main map: m0 (Map 0), m1 (Map 1), mx (Map 2), m3 (Map 3)
  const LIST = { m0: ['y0', 'l0', 'cl'], m1: ['y1', 'acc'], mx: ['y0', 'own'], m3: ['y3'] }, YS = { m0: ['y0', 'cl'], m1: ['y1', 'acc'], mx: ['y1'], m3: ['y3'] };
  const maps = ['m0', 'm1', 'mx', 'm3'].map((id, n) => ({ id, n, list: LIST[id], yes: YS[id], no: [] }));
  const defs = {}; ['y0', 'l0', 'cl', 'y1', 'acc', 'own', 'y3', 't1'].forEach(id => { defs[id] = { name: id, rarity: 'common', animal: 'same' }; });
  const pros = new Map([['y0', { id: 'y0', src: new Set(['list']), why: '' }], ['own', { id: 'own', src: new Set(['list']), why: '' }], ['y1', { id: 'y1', src: new Set(['flag']), why: '' }], ['cl', { id: 'cl', src: new Set(['claude']), why: 'x' }], ['l0', { id: 'l0', src: new Set(['claude']), why: 'old' }]]); // l0: an old proposal (NEW!) that is also a pick
  const body = ['ui37CarriedIndex', 'ui38Fill', 'carry1Earlier', 'carry1Carried', 'ui37Split'].map(fn).join('\n');
  const F = new Function('mapNumberOf', 'ui37MapsData', 'ui37Prospects', 'ui38Concept', 'roadRarityStep', 'ui41Cap', 'list1SideOwnIndex', 'ui47SuggestFirst', 'ui43TutorialCards', 'UI47_TUT', 'UI38_PROS', 'ui38SideOnly', 'ui38Family', 'ui38WhyText', 'CARRY1_PICKS',
    body + '; return ui37Split;')(id => ({ m0: 0, m1: 1, mx: 2, m3: 3 })[id], () => maps, () => new Map(pros), () => null, () => 0, (t, l) => l.slice(), () => new Map(), (t, l) => l, () => ['t1'], -1, { rules: {}, maps: {} }, () => new Set(), () => '', () => '',
    { mx: [{ id: 'l0', why: 'on Map 0, not Yes' }, { id: 'acc', why: 'fits the map' }, { id: 'y3', why: 'a later map' }, { id: 't1', why: 'tutorial' }] });
  const sp = F('mx', defs, () => true), car = ids(sp.car);
  const listCarried = ['y0'], flags = ['y1'], picks = ['l0', 'acc'];
  ok(same(car, listCarried.concat(flags, picks)), '3. main map: Carried = list carried (y0) + flags (y1) + picks (l0, acc): ' + car.join(','));
  ok(!car.includes('cl') && !ids(sp.neu).includes('cl'), '3. main map: an earlier Yes card only Claude\'s old prospect lists name (cl) is not Carried');
  ok(!car.includes('y3') && !car.includes('t1'), '3. main map: a pick from a later map (y3) and a tutorial card past Map 1 (t1) are not shown');
  const l0 = sp.car.find(p => p.id === 'l0'); ok(l0 && l0.src.has('earlier') && l0.why === 'on Map 0, not Yes' && sp.idx.get('l0') === 0 && sp.idx.get('acc') === 1, '3. a pick wears "Yes earlier", its why, and the Map N pill of the map that gives it');
  ok(ids(sp.neu).join() === 'own', '3. main map: NEW! keeps the list\'s own card; a pick an old proposal put in NEW! (l0) moved to Carried: ' + ids(sp.neu).join(','));
}
{ // side map sq (parent m1) opens after Map 2
  const CONQUEST_MAPS = [{ id: 'm0' }, { id: 'm1' }, { id: 'm2' }, { id: 'm3' }, { id: 'sq', sub: true, parent: 'm1', entry: { afterMapCleared: 'm2' } }];
  const MAINS = ['m0', 'm1', 'm2', 'm3'], mpMapById = id => CONQUEST_MAPS.find(m => m.id === id) || null, mainConquestMaps = () => CONQUEST_MAPS.filter(m => !m.sub);
  const mapNumberOf = id => { const m = mpMapById(id); return m ? MAINS.indexOf(m.sub ? m.parent : m.id) : null; }, mpTopOf = id => { const m = mpMapById(id); return m && m.sub ? m.parent : id; };
  const mapUnlockNumberOf = id => { const m = mpMapById(id), n = mapNumberOf(id); if (!m.sub) return n; const a = m.entry && m.entry.afterMapCleared; return Math.max(n, a ? mapUnlockNumberOf(a) : 0); };
  const ui37Picks = { sq: { yes: ['g'], no: ['k'] } }, defs = {}; ['f', 'g', 'k', 'm2c', 'pk', 'h', 'lst'].forEach(id => { defs[id] = { name: id, rarity: 'common', animal: 'same' }; });
  const MAPS2 = [{ id: 'm0', n: 0, list: ['f', 'pk'], yes: ['f'], no: [] }, { id: 'm1', n: 1, list: ['g'], yes: ['g'], no: [] }, { id: 'm2', n: 2, list: ['k', 'm2c'], yes: ['k', 'm2c'], no: [] }, { id: 'm3', n: 3, list: ['h'], yes: ['h'], no: [] }];
  const mpEntry = top => top === 'm1' ? { cards: ['g'], submaps: { sq: ['lst', 'f'] } } : { cards: [], submaps: {} };
  const UI44_SIDE = { sq: { fits: ['m2c'], add: [] } }, CARRY1_PICKS = { sq: [{ id: 'pk', why: 'from Map 0' }, { id: 'h', why: 'later' }] };
  const body = ['ui37Arr', 'ui37Ent', 'ui47AdminOf', 'ui47IsAdminAdded', 'ui47YesList', 'ui47SuggestedOf', 'ui47SuggestFirst', 'ui37FlagOf', 'ui37CarriedIndex', 'ui41Cap', 'ui44IsSub', 'ui44ProsSubs', 'ui44MainByNo', 'ui44CurrentAfter', 'ui44After', 'ui44Split', 'list1PicksOf', 'list1SideOwnIndex', 'carry1Earlier', 'carry1Carried'].map(fn).join('\n');
  const F = new Function('CONQUEST_MAPS', 'mpMapById', 'mainConquestMaps', 'mapNumberOf', 'mpTopOf', 'mapUnlockNumberOf', 'ui37Picks', 'UI44_SIDE', 'mpEntry', 'ui37MapsData', 'rv1ReviewOf', 'ui38Concept', 'ui38Family', 'roadRarityStep', 'UI38_PROS', 'ui43TutorialCards', 'UI47_TUT', 'UI47_SUGGEST', 'UI47_ADMIN_ADD', 'CLAUDE_NEW', 'CARRY1_PICKS',
    body + '; return ui44Split;')(CONQUEST_MAPS, mpMapById, mainConquestMaps, mapNumberOf, mpTopOf, mapUnlockNumberOf, ui37Picks, UI44_SIDE, mpEntry, () => MAPS2, () => null, () => null, () => '', () => 0, { rules: { familyCap: 2 } }, () => ['t1'], -1, {}, {}, {}, CARRY1_PICKS);
  const sp = F('sq', defs, () => true), car = ids(sp.car);
  ok(same(car, ['f'].concat(['g', 'k'], ['pk'])), '3. side map: Carried = list carried (f) + flags (g Yes, k No) + picks (pk): ' + car.join(','));
  ok(!car.includes('m2c') && !car.includes('h'), '3. side map: a Yes card Claude\'s old fit list names (m2c) and a later-map pick (h) are not shown');
  ok(sp.idx.get('pk') === 0 && sp.car.find(p => p.id === 'pk').why === 'from Map 0', '3. side map: the pick\'s pill and why');
}
ok(/s === 'earlier' && p\.why \? ` title=/.test(fn('ui37TileHTML')), '3. the "Yes earlier" pill shows the why on hover');

console.log(fail ? `carry1: ${pass} passed, ${fail} failed` : `carry1: ${pass} passed, 0 failed`);
process.exit(fail ? 1 : 0);
