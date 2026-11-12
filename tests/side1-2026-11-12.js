#!/usr/bin/env node
// Package SIDE1, phase A (2026-11-12, owner 23:50: "Help me do "yes/no" for the submaps like the maps ... I want to be strict with 1-3 skills per
// map"): the side lists of Maps 0-21 after Claude's Yes / No picks. No games are played.
//   1. every side map's list (canonical/map-pools.json) is its Yes picks in docs/design/side-picks-proposal-2026-11-12.json; NEW! 1-3 (a Baby
//      does not count) and Carried at most 8, split as the Map cards window splits them (Carried = on a main list up to the map it opens after)
//   2. 1-3 skills a side map: the distinct skills of its counted NEW! cards (light skills, plain Flying / Tide / Diurnal / Nocturnal ..., aside)
//   3. the owner's cuts are absent: his 11-01 cuts on that side map (House Cat on The Old Bramble, Armadillo Guard on The Pale Desert among them)
//   4. each side map's fight reward (a card whose source is that map) is on its list, NEW!; each NEW! card has a source (a player can own it)
//   5. The Old Bramble: the owner's own flags are kept in the proposal (his 6 picks), its list takes 3 of them
//   6. the record: the proposed SQL (14 side maps, never The Old Bramble, guarded so a filled row stays), the card power report (.md, .json) with
//      every card in play on the 11-12 lists, the hub's Card table carrying the reading, the Phase B plan, project-state's rule, a CHANGELOG entry
//   node tests/side1-2026-11-12.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const L = require(path.join(ROOT, 'tools', 'side1', 'lib_side1_2026_11_12.js')), C = L.C;
const P = L.pools(), PR = J('docs/design/side-picks-proposal-2026-11-12.json').maps, OWNER = J('docs/design/map-picks-owner-2026-11-12.json').maps;
ok(L.SIDES.length === 15 && L.SIDES.every(s => PR[s]), '0. a proposal for each of the 15 side maps of Maps 0-21');
L.SIDES.forEach(s => {
  const par = L.parentOf(s, P), list = (P[par].submaps || {})[s] || [], pr = PR[s] || { yes: [] }, idx = L.carriedIndex(L.unlockOf(s), P);
  ok(list.length === pr.yes.length && list.every(id => pr.yes.includes(id)), `1. ${s}: the list is its Yes picks`);
  const neu = list.filter(id => !idx.has(id)), car = list.filter(id => idx.has(id)), nNew = neu.filter(id => !L.baby(id)).length;
  ok(nNew >= 1 && nNew <= L.SIDE_LIMIT.own, `1. ${s}: NEW! ${nNew} (1-3)`); ok(car.length <= L.SIDE_LIMIT.carried, `1. ${s}: Carried ${car.length} (<= 8)`);
  const sk = new Set(); neu.filter(id => !L.baby(id)).forEach(id => L.skillsOf(C[id]).forEach(x => { if (!x.light) sk.add(x.key); }));
  ok(sk.size >= 1 && sk.size <= 3, `2. ${s}: ${sk.size} skills (1-3): ${[...sk].join(', ')}`);
  ok((pr.skills || []).length === sk.size, `2. ${s}: the proposal names its ${sk.size} skills`);
  const cuts = L.ownerCuts(s); ok(!list.some(id => cuts.includes(id)), `3. ${s}: no owner cut listed (${list.filter(id => cuts.includes(id)).join(', ')})`);
  L.CARDS.filter(c => c.source && c.source.kind === 'map' && c.source.id === s).forEach(c => ok(neu.includes(c.id), `4. ${s}: reward ${c.id} (${c.source.node}) listed as NEW!`));
  neu.forEach(id => ok(!!(C[id].source && C[id].source.kind), `4. ${s}: NEW! ${id} has a source`));
  ok(pr.no.every(id => !list.includes(id)), `1. ${s}: no No card on the list`);
});
ok(!P.m1.submaps.mo.includes('house-cat') && !P.md.submaps.mpd.includes('armadillo-guard'), '3. House Cat and Armadillo Guard (cut 11-01) are off The Old Bramble and The Pale Desert');
ok(PR.mo.ownerFlags && JSON.stringify(PR.mo.ownerFlags.yes) === JSON.stringify(OWNER.mo.yes) && PR.mo.yes.filter(id => OWNER.mo.yes.includes(id)).length === 3, '5. The Old Bramble keeps his 6 flags; its list takes 3 of them');
// 6. the record
const sql = read('supabase/proposed/20261112_side1_map_picks.sql');
ok(/PROPOSED ONLY/.test(sql) && (sql.match(/insert into card_overrides/g) || []).length === 14 && !/map-picks:mo'/.test(sql) && /jsonb_array_length\(card_overrides\.data->'yes'\), 0\) = 0/.test(sql), '6. proposed SQL: 14 side maps, not The Old Bramble, a filled row left alone');
const cp = J('docs/balance/card-power-2026-11-12.json'), md = read('docs/balance/card-power-2026-11-12.md'), have = new Set(cp.cards.map(r => r.id));
const inPlay = new Set(); L.mainByNo().filter(m => m.n <= 21).forEach(m => P[m.id].cards.forEach(id => inPlay.add(id))); L.SIDES.forEach(s => P[L.parentOf(s, P)].submaps[s].forEach(id => inPlay.add(id)));
ok([...inPlay].every(id => have.has(id) || !C[id]), '6. card power: every card in play on the 11-12 lists has a row (' + [...inPlay].filter(id => !have.has(id)).slice(0, 5).join(', ') + ')');
ok(cp.cards.every(r => ['over', 'in', 'under'].includes(r.verdict) && typeof r.margin === 'number' && r.firstMap != null), '6. card power: each row reads over / in / under with its margin and first map');
ok(cp.skillsAMap.length === 22 + 15 && /## Over budget/.test(md) && md.indexOf('## Over budget') < md.indexOf('## Every card') && /## Skills a map/.test(md), '6. card power report: outliers first, then the full table; skills for 22 main and 15 side maps');
ok(cp.counts.toolsMapStale === 0, '6. the tools\' obtain map (canonical/card-obtain-maps.json) follows the game\'s cardObtainMap on the 11-12 lists');
ok(/card-power-/.test(read('tools/hub/hub5_data.py')) && /'bu':/.test(read('tools/hub/hub5_data.py')), '6. the hub Card table data carries the reading');
ok(fs.existsSync(path.join(ROOT, 'docs/balance/side1/phase-b-plan.md')) && /refdecks_2026_11_12\.js run --kind bpro/.test(read('docs/balance/side1/phase-b-plan.md')), '6. the Phase B plan names the focused search');
ok(/SIDE1/.test(read('docs/project-state.md')) && /side maps are tuned now/i.test(read('docs/project-state.md')) && /SK anchor/i.test(read('docs/project-state.md')), '6. project-state: side maps tuned now, the SK anchor');
ok(read('docs/CHANGELOG.md').slice(0, 20000).includes('SIDE1'), '6. a CHANGELOG entry near the top');
ok(read('tests/run-all.sh').includes('tests/side1-2026-11-12.js'), '6. listed in run-all.sh');
// 7. (2026-11-13, package SIDE2) the card editor's budget readout reads every card as tools/skill_costs.js does: the Attack that counts (an
//    Archer's, or arrow {swings: 'never'}, is 0; Hibernate's is its awake share). SIDE1 found Stonedrop Vulture at 247% in the editor, 74% in the tools.
{
  const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
  const fnA = new Function('BramblewoodBudget', LB.grab('sbAttackMult') + '\n' + LB.grab('sbAttackOf') + '\nreturn sbAttackOf;')(BB);
  const app = read('arena_app.js'), ce = app.slice(app.indexOf('function ceBudgetHTML('), app.indexOf('function ceBudgetHTML(') + 400);
  ok(/A = sbAttackOf\(d\)/.test(ce), '7. the card editor\'s budget box (ceBudgetHTML) counts sbAttackOf, not the printed Attack');
  const v = LB.CARD_DEFS_BASELINE['stonedrop-vulture'];
  ok(v && fnA(v) === 0, '7. Stonedrop Vulture (arrow, swings never): the editor counts 0 Attack');
  const bad = [];
  Object.values(LB.CARD_DEFS_BASELINE).forEach(d => { if (!d || !d.id || d.attack == null) return;
    const e = BB.SPL ? BB.SPL.expandDef(d).effects || {} : d.effects || {};
    const toolsA = (e.archer && !(Number(e.archer) < 0)) ? 0 : (d.attack || 0) * (e.hibernate ? 1 - BB.EN6_HIBERNATE_UPTIME : 1);
    if (Math.abs(fnA(d) - toolsA) > 1e-9) bad.push(d.id); });
  const cpr = J('docs/balance/card-power-2026-11-12.json').cards, apart = cpr.filter(r => Math.abs(r.use - r.toolsUse) >= 2);
  ok(cpr.length > 100 && !apart.length, '7. card power report: the editor box and tools/skill_costs.js read every card in play within 2 points (' + apart.slice(0, 5).map(r => r.name + ' ' + r.use + '/' + r.toolsUse).join(', ') + ')');
  ok(/sbCheck\(A, D, S, N, M, F, SH, sbEffectsOf\(d\)\)/.test(ce), '7. the editor box passes the effects (Bloom\'s body copy) to the shared capScores');
  ok(!bad.length, '7. the editor\'s Attack that counts equals the tools\' for every card (' + bad.slice(0, 6).join(', ') + ')');
}
console.log(fail ? `side1-2026-11-12: ${fail} of ${pass + fail} failed` : `side1-2026-11-12: all ${pass} passed`);
process.exit(fail ? 1 : 0);
