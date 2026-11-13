#!/usr/bin/env node
// 2026-11-13 (package LIST1, owner 11:08 #10 / #12 / #14):
//   1. the fold: the owner's live picks (docs/balance/server-overrides/map-picks-dump-2026-11-13.json) are the picks file and the lists: each main map's
//      MAP tier = his Yes + Claude's admin adds (+ Barrel Cactus on Map 18); each side list holds his Yes; no fight of Maps 0-21 and their side maps
//      loses a deck card to the fold (a dropped card it fields sits on SPECIAL);
//   2. #10: a map over its NEW! target keeps that count as its target (LIST1_NEW_TARGETS; Maps 1-3 11/11), ui37Targets reads it;
//   3. #12: on a side map a later main map's card is no proposal, an earlier main map's Yes card shows as Carried only if it fits (LIST1_SIDE_FIT);
//      on a main map a side map's own card past its unlock is Carried (list1SideOwnIndex);
//   4. #14: each gap has Claude's picks that close it: existing cards on no list and unique nowhere, concepts with existing skills; never a Yes;
//   5. the doc, the record, CHANGELOG, run-all.sh.
//   node tests/list1-2026-11-13.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js');
const fn = name => { const i = app.indexOf('function ' + name + '('); if (i < 0) return ''; const j = app.indexOf('\n}\n', i), k = app.indexOf('\n', i); const e = (app[k - 1] === '}' && (j < 0 || j > k)) ? k : j + 2; return app.slice(i, e); };
const grab = n => JSON.parse((app.match(new RegExp('^const ' + n + ' = (\\{.*?\\});$', 'm')) || [0, 'null'])[1]);
const same = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

// ---- 1. the fold ----
const dump = J('docs/balance/server-overrides/map-picks-dump-2026-11-13.json').rows, picks = J('docs/design/map-picks-owner-2026-11-13.json').maps;
const pools = J('canonical/map-pools.json'), P = pools.maps, ADM = grab('UI47_ADMIN_ADD'), CARDS = J('canonical/cards.json'), C = {}; CARDS.forEach(c => { C[c.id] = c; });
ok(dump.length >= 30 && dump.every(r => /^__cfg:map-picks:/.test(r.id) && r.data && Array.isArray(r.data.yes)), '1. the dump holds the __cfg:map-picks rows');
dump.forEach(r => ok(picks[r.data.mapId] && same(picks[r.data.mapId].yes, r.data.yes), `1. ${r.data.mapId}: the picks file is the row's Yes`));
const parentOf = s => Object.keys(P).find(t => (P[t].submaps || {})[s]);
Object.entries(picks).forEach(([k, e]) => {
  if (e.sub) { const l = P[parentOf(k)].submaps[k]; ok(e.yes.filter(id => C[id]).every(id => l.includes(id)), `1. side ${k}: every Yes is on its list`); return; }
  const want = e.yes.concat(ADM[k] || []).filter(id => C[id]).concat(k === 'md' ? ['barrel-cactus'] : []);
  ok(same(P[k].cards, want), `1. ${k}: the MAP tier is his Yes + Claude's admin adds (${P[k].cards.filter(x => !want.includes(x)).concat(want.filter(x => !P[k].cards.includes(x))).join(' ')})`);
});
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G, LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const rec = J('docs/balance/list1/fold-2026-11-13.json'), dropped = {}; Object.entries(rec.main).concat(Object.entries(rec.side)).forEach(([k, r]) => { dropped[k] = r.dropped || []; });
let fights = 0;
G.CONQUEST_MAPS.forEach(m => { if (!dropped[m.id]) return; const pool = LP.fightPool(pools, m.id, m.sub ? m.parent : null);
  (m.nodes || []).forEach(n => { if (!n.deck) return; fights++; const off = Object.keys(n.deck).filter(id => dropped[m.id].includes(id) && !pool.has(id));
    ok(!off.length, `1. ${n.key} (${m.id}): a card the fold took off its list is still in its pool (${off.join(' ')})`); }); });
ok(fights > 150, '1. the fights of Maps 0-21 and their side maps were read (' + fights + ')');
Object.entries(rec.special).forEach(([t, l]) => l.forEach(x => ok(P[t].special.includes(x.id), `1. ${x.id} (dropped from ${x.from}, fielded) is on ${t}'s SPECIAL`)));

// ---- 2. #10 targets ----
const R = J('docs/balance/list1/list1-2026-11-13.json'), T = grab('LIST1_NEW_TARGETS');
ok(T && same(Object.keys(T), Object.keys(R.targets)) && Object.keys(T).every(k => T[k] === R.targets[k]), '2. LIST1_NEW_TARGETS is the record\'s');
ok(T.mf === 11 && T.mb === 11 && T.mc === 11, '2. Maps 1-3: 11/11, not 11/10');
R.maps.forEach(r => ok(r.target === Math.max(r.dflt, r.newNow) || r.newNow < r.dflt, `2. ${r.id}: target ${r.target} = the count where over the default ${r.dflt}`));
{ const ui37Ent = () => ({ t: {} }), mapNumberOf = id => ({ mf: 1, m2: 4 })[id], ui44IsSub = () => false, th6Targets = () => ({ own: 10, carried: 5 });
  const F = new Function('LIST1_NEW_TARGETS', 'ui37Ent', 'mapNumberOf', 'ui44IsSub', 'th6Targets', fn('ui37Targets') + '; return ui37Targets;')({ mf: 11 }, ui37Ent, mapNumberOf, ui44IsSub, th6Targets);
  ok(F('mf').n === 11 && F('mf').dn === 11 && F('m2').n === 10, '2. ui37Targets: the canonical count is the default (11), other maps keep th6');
  ok(/data-ui37-target="\$\{k\}" value="\$\{t\}"/.test(app), '2. the owner can still type his own target'); }

// ---- 3. #12 side maps / main maps ----
{ // world: main m0..m3; side sq (parent m1) opens after Map 2
  const CONQUEST_MAPS = [{ id: 'm0' }, { id: 'm1' }, { id: 'm2' }, { id: 'm3' }, { id: 'sq', sub: true, parent: 'm1', entry: { afterMapCleared: 'm2' } }];
  const MAINS = ['m0', 'm1', 'm2', 'm3'], mpMapById = id => CONQUEST_MAPS.find(m => m.id === id) || null, mainConquestMaps = () => CONQUEST_MAPS.filter(m => !m.sub);
  const mapNumberOf = id => { const m = mpMapById(id); if (!m) return null; return MAINS.indexOf(m.sub ? m.parent : m.id); };
  const mpTopOf = id => { const m = mpMapById(id); return m && m.sub ? m.parent : id; };
  const mapUnlockNumberOf = id => { const m = mpMapById(id), n = mapNumberOf(id); if (!m.sub) return n; const a = m.entry && m.entry.afterMapCleared; return Math.max(n, a ? mapUnlockNumberOf(a) : 0); };
  const ui37Picks = { sq: { yes: ['own1'], no: [] } }, defs = {}; ['f', 'g', 'h', 'own1', 'lst', 'tut1'].forEach(id => { defs[id] = { name: id, rarity: 'common', animal: id }; });
  const MAPS = [{ id: 'm0', n: 0, yes: ['f'], no: [] }, { id: 'm1', n: 1, yes: ['g'], no: [] }, { id: 'm2', n: 2, yes: [], no: [] }, { id: 'm3', n: 3, yes: ['h'], no: [] }];
  const ui37MapsData = () => MAPS, mpEntry = top => top === 'm1' ? { cards: ['g'], submaps: { sq: ['lst'] } } : { cards: [], submaps: {} };
  const UI44_SIDE = { sq: { fits: ['h', 'f'], add: [] } }, LIST1_SIDE_FIT = { sq: ['f', 'h'] }, CLAUDE_NEW = { list1: { sq: { picks: [{ id: 'h', why: 'x' }] } } };
  const body = ['ui37Arr', 'ui37Ent', 'ui47AdminOf', 'ui47IsAdminAdded', 'ui47YesList', 'ui47SuggestedOf', 'ui47SuggestFirst', 'ui37FlagOf', 'ui37CarriedIndex', 'ui41Cap', 'ui44IsSub', 'ui44ProsSubs', 'ui44MainByNo', 'ui44CurrentAfter', 'ui44After', 'ui44Split', 'list1PicksOf', 'list1SideOwnIndex'].map(fn).join('\n');
  const F = new Function('CONQUEST_MAPS', 'mpMapById', 'mainConquestMaps', 'mapNumberOf', 'mpTopOf', 'mapUnlockNumberOf', 'ui37Picks', 'UI44_SIDE', 'mpEntry', 'ui37MapsData', 'rv1ReviewOf', 'ui38Concept', 'ui38Family', 'roadRarityStep', 'UI38_PROS', 'ui43TutorialCards', 'UI47_TUT', 'UI47_SUGGEST', 'UI47_ADMIN_ADD', 'LIST1_SIDE_FIT', 'CLAUDE_NEW',
    body + '; return {ui44Split, list1SideOwnIndex};')(CONQUEST_MAPS, mpMapById, mainConquestMaps, mapNumberOf, mpTopOf, mapUnlockNumberOf, ui37Picks, UI44_SIDE, mpEntry, ui37MapsData, () => null, () => null, (id, d) => d[id] && d[id].animal, () => 0, { rules: { familyCap: 2 } }, () => ['tut1'], -1, {}, {}, LIST1_SIDE_FIT, CLAUDE_NEW);
  let sp = F.ui44Split('sq', defs, () => true); const has = (l, id) => l.some(p => p.id === id);
  ok(has(sp.car, 'f') && !has(sp.car, 'g'), '3. side map: an earlier main map\'s Yes card that fits is Carried (f); one that does not fit (g) is not suggested');
  ok(!has(sp.neu, 'h') && !has(sp.car, 'h'), '3. side map: a later main map\'s card (Map 3) is no proposal, not even Claude\'s fit or a gap pick');
  ok(has(sp.neu, 'own1') && has(sp.neu, 'lst'), '3. side map: its own list and its Yes flags are NEW!');
  ui37Picks.sq.yes.push('g'); sp = F.ui44Split('sq', defs, () => true);
  ok(has(sp.car, 'g'), '3. side map: a non-fitting card the owner flags Yes still shows (Carried)');
  const sx = F.list1SideOwnIndex(3, MAPS);
  ok(sx.get('own1') === 2 && sx.get('lst') === 2 && !sx.has('g'), '3. main map past the unlock: the side map\'s own cards are Carried (pill: Map 2); what it carries is not');
  ok(F.list1SideOwnIndex(2, MAPS).size === 0, '3. main map up to the unlock: nothing from the side map');
}
ok(/const sx = list1SideOwnIndex\(n, maps\), idx2 = new Map\(idx\)/.test(fn('ui37Split')) && /idx: idx2/.test(fn('ui37Split')), '3. ui37Split moves those cards to Carried with their pill');
ok(/p\.src\.has\('list1'\)/.test(fn('ui41Cap')), '3. a gap pick is not hidden by the 2-per-family cap');
const FIT = grab('LIST1_SIDE_FIT');
ok(FIT && Object.keys(FIT).length === 15 && Object.values(FIT).every(l => Array.isArray(l) && l.length >= 20 && l.every(id => C[id])), '3. LIST1_SIDE_FIT: the 15 side maps, live card ids');
ok(!FIT.mx.includes('rock-pool-starfish') && !FIT.mx.includes('duckling') && FIT.mx.includes('magma-salamander'), '3. Volcano Lair: no Rock Pool Starfish or Duckling, the Magma Salamander fits');
ok(Object.values(R.carriedShrink).every(x => x.after <= x.before) && R.carriedShrink.mx.after < R.carriedShrink.mx.before, '3. the Carried suggestions shrink to the fitting ones');

// ---- 4. #14 picks ----
const CN = J('canonical/claude-new-cards.json').list1, listed = LP.listedIds(pools);
const skills = rd('canonical/skill-costs.json');
R.maps.filter(r => r.gap > 0).forEach(r => { const e = CN[r.id]; ok(!!e && (e.picks || []).length + (e.concepts || []).length >= r.gap && r.newAfterPicks >= r.target, `4. ${r.id}: the gap of ${r.gap} has picks that close it`); });
Object.entries(CN).filter(([k]) => k !== '_about').forEach(([k, e]) => {
  (e.picks || []).forEach(p => ok(C[p.id] && !listed.has(p.id) && !C[p.id].pool && p.why, `4. ${k}: ${p.id} is an existing card on no list, with a reason`));
  (e.concepts || []).forEach(c => ok(/^concept-[a-z0-9-]+$/.test(c.id) && !C[c.id] && c.name && c.animal && c.family && c.element && c.rarity && c.role && c.why && skills.includes('"' + c.skill + '"'), `4. ${k}: concept ${c.name} has its fields and an existing skill (${c.skill})`));
  ok(!dump.some(r => r.data.mapId === k && (e.picks || []).concat(e.concepts || []).some(p => r.data.yes.includes(p.id))), `4. ${k}: no pick is written as his Yes`);
});
ok(/list1PicksOf\(top\)\.forEach\(e=> add\(e\.id, 'list1'/.test(app) && /list1PicksOf\(subId\)\.forEach\(e=> prop\(e\.id, 'list1'/.test(app) && /list1: \(\)=> TX\('ui\.ui37-src-claude'\)/.test(app), '4. the window shows them as "Claude\'s pick" on main and side maps');
ok(/CLAUDE_NEW\.list1/.test(fn('list1PicksOf')) && /"list1"\)/.test(rd('assemble_arena.py')) && rd('index.html').includes('concept-summit-tahr'), '4. baked into the page with CLAUDE_NEW');
ok(/CLAUDE_NEW\.list1/.test(app.slice(app.indexOf('const UI38_CONCEPTS'), app.indexOf('function ui38Concept('))), '4. the concepts are known to ui38Concept');

// ---- 5. docs ----
const md = rd('docs/balance/list1-2026-11-13.md');
ok(/## Gaps/.test(md) && /The Quiet Summit/.test(md) && /The Aerie Vault/.test(md) && /## Side maps whose Carried list shrank/.test(md), '5. the doc: gaps with picks, the Carried shrink');
ok(rd('docs/CHANGELOG.md').slice(0, 20000).includes('LIST1'), '5. CHANGELOG entry near the top');
ok(rd('tests/run-all.sh').includes('tests/list1-2026-11-13.js'), '5. listed in run-all.sh');
const dec = J('docs/decisions.json'), di = (Array.isArray(dec) ? dec : dec.decisions || dec.items || []).filter(d => /^LIST1-/.test(d.id));
ok(di.length >= 1 && di.every(d => String(d.body || '').split(/\s+/).length < 100), '5. decisions LIST1-n, under 100 words');
console.log(`list1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
