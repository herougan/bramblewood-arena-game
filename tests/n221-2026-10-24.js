#!/usr/bin/env node
// 2026-10-24 (package N221, owner N22-1): the Maps 21-40 divvy (tools/n221_divvy_2026_10_24.js, docs/balance/n221-divvy-2026-10-24.md).
//   1. the tool's own check on the live files (pools valid, rarity caps, sources consistent, card-obtain-maps regenerated);
//   2. every card that waited for a source has exactly one home, and no card has two (applied pool, proposed map, quest, ...);
//   3. the applied placement (the Petrified Tree, a Pack 4 card of the Rimefire Caldera) and nothing else moved onto a map;
//   4. the proposed Maps 25-40: 6-10 a map, no card on two maps, held cards under the road's caps, the era holds (Devilry 66, Ecclesia 77,
//      Evomax 30) kept, pack tiers 4 / 5 / 6 by 21-27 / 28-34 / 35-41 (N221-1);
//   5. the record, the doc, the progression plan's Maps 21-40 section, the CHANGELOG entry and the owner calls N221-1 .. N221-7.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const N = require(path.join(ROOT, 'tools', 'n221_divvy_2026_10_24.js'));
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G;
const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c])), pools = J('canonical/map-pools.json').maps;
const STEP = r=> G.roadRarityStep(r || 'common');

// ---- 1. the tool's check
const chk = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'n221_divvy_2026_10_24.js'), 'check'], {encoding: 'utf8'});
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05; sizes owner 22:47: a main map's list 12-16). The tool pins N221's lists: its "mXX: pool N"
// within 12-16, and a card it wants on a list THEME2 leaves it off (with the obtain map that follows), are no problem; anything else still fails.
const T2 = Object.fromEntries(J('docs/balance/theme2-proposal-2026-10-28.json').maps.filter(m=> !m.skipped).map(m=> [m.key, m.proposed]));
const t2Has = (map, id)=> (T2[map] || []).includes(id), t2Any = id=> Object.values(T2).some(l=> l.includes(id));
const n221Probs = ((chk.stdout || '') + (chk.stderr || '')).trim().split('\n').map(l=> l.trim()).filter(l=> l && !/FAILED:?$|^ok\b/.test(l)).filter(l=>{
  let m = /^(m\d+): pool (\d+)$/.exec(l); if(m && +m[2] >= 12 && +m[2] <= 16) return false;
  m = /^(\S+): a pack card of (m\w+) but not in its pool/.exec(l); if(m && !t2Has(m[2], m[1])) return false;
  m = /^(\S+): (in one map pool|card-obtain-maps)/.exec(l); if(m && !t2Any(m[1])) return false;
  return true; });
ok(chk.status === 0 || !n221Probs.length, `the N221 check passes, but for THEME2's lists (${n221Probs.slice(0, 6).join(' | ') || 'ok'})`);

// ---- 2. one home each
const waiting = cards.filter(c=> c.awaitingSource).map(c=> c.id);
waiting.forEach(id=> ok(N.HOME[id], `${id} (waiting) has a home`));
const KINDS = new Set(['pool', 'map', 'quest', 'secrets', 'faction', 'smith', 'decision', 'hold']);
Object.entries(N.HOME).forEach(([id, h])=>{ ok(by[id], `home for a real card: ${id}`); ok(KINDS.has(h.kind), `${id}: home kind ${h.kind}`);
  if(h.kind === 'pool') ok(!by[id].awaitingSource, `${id}: applied, so no longer waiting`); else ok(by[id] && by[id].awaitingSource, `${id}: a proposal home, so still waiting`); });
ok(Object.keys(N.HOME).length === waiting.length + Object.keys(N.APPLY).length, `homes = waiting (${waiting.length}) + applied (${Object.keys(N.APPLY).length})`);
const onMaps = {}; Object.entries(N.PLAN).forEach(([no, P])=> [...P.held, ...P.carry, ...P.unsorted, ...(P.quest || [])].forEach(id=> (onMaps[id] = onMaps[id] || []).push(+no)));
Object.entries(onMaps).forEach(([id, ms])=> ok(ms.length === 1, `${id} is proposed on one map only (${ms.join(', ')})`));
Object.entries(N.HOME).filter(([, h])=> h.kind === 'map' && !h.existing).forEach(([id, h])=> ok((onMaps[id] || []).includes(h.map), `${id}: its home Map ${h.map} lists it`));
// the owner's holds
cards.filter(c=> c.awaitingSource && c.mechanicLine === 'devilry').forEach(c=> ok(N.HOME[c.id].kind === 'hold' && N.HOME[c.id].until === 66, `${c.id}: Devilry held for Map 66`));
cards.filter(c=> c.awaitingSource && c.mechanicLine === 'grace').forEach(c=> ok(N.HOME[c.id].kind === 'hold' && N.HOME[c.id].until === 77, `${c.id}: Ecclesia held for Map 77`));
cards.filter(c=> c.awaitingSource && c.mechanicLine === 'evolution').forEach(c=> ok(N.HOME[c.id].kind === 'map' && N.HOME[c.id].map >= 30, `${c.id}: Evomax from Map 30`));
cards.filter(c=> c.awaitingSource && c.cardType === 'spell').forEach(c=> ok(N.HOME[c.id].kind === 'hold' && N.HOME[c.id].until === 'spells', `${c.id}: a spell, held while spells are shelved`));
ok(N.HOME['grovebearer-dragon-turtle'].kind === 'map' && N.HOME['grovebearer-dragon-turtle'].map === 40, 'the Grovebearer stays held for Map 40 (DV5)');
['bog-shrew', 'mire-rat', 'hollow-belly-rat', 'gnawed-matriarch', 'kelpborn-otter', 'conger-eel', 'selkie-wavebinder'].forEach(id=> ok(N.HOME[id].kind === 'decision' && N.HOME[id].id === 'CONTENT2-3' && by[id].awaitingSource, `${id}: left to CONTENT2-3`));

// ---- 3. the applied placement, and only it
ok(JSON.stringify(Object.keys(N.APPLY)) === '["petrified-tree"]', 'one placement applied: the Petrified Tree');
const pt = by['petrified-tree'];
ok(pt && !pt.awaitingSource && JSON.stringify(pt.source) === '{"kind":"pack","tier":4,"map":"m22"}', `the Petrified Tree: Pack 4, the Rimefire Caldera (${JSON.stringify(pt && pt.source)})`);
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05): THEME2 leaves the Petrified Tree off every list (not obtainable yet: its obtain map reads 0)
const ptPools = Object.entries(pools).filter(([, P])=> P.cards.includes('petrified-tree') || P.special.includes('petrified-tree') || Object.values(P.submaps).some(s=> s.includes('petrified-tree'))).length;
ok(pools.m22.cards.includes('petrified-tree') === t2Has('m22', 'petrified-tree') && ptPools === (t2Any('petrified-tree') ? 1 : 0), `the Petrified Tree is on the Caldera's list where THEME2 puts it, on one list at most (${ptPools})`);
const ptMap = pools.m22.cards.includes('petrified-tree') ? 22 : 0;
ok((J('canonical/card-obtain-maps.json').maps['petrified-tree'] || 0) === ptMap && (G.cardObtainMap(pt) || 0) === ptMap, `its obtain map is ${ptMap} (card-obtain-maps regenerated)`);
const ut = J('canonical/unit-themes.json').units.find(u=> u.id === 'petrified-tree'); ok(ut && ut.source === 'pack', 'unit-themes regenerated (the tree is a pack card there)');
['m21', 'm22', 'm23', 'm24'].forEach(mid=>{ const P = pools[mid];
  ok(P && P.cards.length >= 12 && P.cards.length <= 16, `${mid}: pool ${P && P.cards.length} (12-16, owner 10-28 22:47; 2026-10-28 APPLY1: lists follow THEME2)`);
  [...P.cards, ...P.special].forEach(id=> ok(by[id] && !by[id].awaitingSource, `${mid}: ${id} is a sourced card`)); });
// the skirmish-base cards of Maps 21-24 under their fight's cap; their pack cards carry tier 4
G.CONQUEST_MAPS.filter(m=> ['m21', 'm22', 'm23', 'm24'].includes(m.id)).forEach(m=>{ const no = G.mapUnlockNumberOf(m.id);
  cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node && !(c.archetypes || []).includes('Leader')).forEach(c=>{ const nd = m.nodes.find(x=> x.key === c.source.node);
    ok(nd && STEP(c.rarity) <= STEP(G.roadRarityCap(no, nd.kind || 'skirmish')), `${m.id}: skirmish-base ${c.id} (${c.rarity}) under ${c.source.node}'s cap`); });
  cards.filter(c=> c.source && c.source.kind === 'pack' && c.source.map === m.id).forEach(c=> ok(c.source.tier === 4 && G.rarityIntroMap(c.rarity) <= no, `${m.id}: pack card ${c.id} is Pack 4 and revealed`)); });

// ---- 4. the proposed maps
ok(N.packTierOf(21) === 4 && N.packTierOf(27) === 4 && N.packTierOf(28) === 5 && N.packTierOf(34) === 5 && N.packTierOf(35) === 6 && N.packTierOf(41) === 6 && N.packTierOf(20) === 3, 'pack tiers: 4 = 21-27, 5 = 28-34, 6 = 35-41 (N221-1)');
ok(Object.keys(N.PLAN).map(Number).join(',') === Array.from({length: 16}, (_, i)=> 25 + i).join(','), 'Maps 25-40 each have a proposal');
Object.entries(N.PLAN).forEach(([no, P])=>{ no = +no;
  ok(!G.CONQUEST_MAPS.some(m=> !m.sub && !m.reserved && G.mapUnlockNumberOf(m.id) === no), `Map ${no} is not built (a proposal only)`);
  const size = P.held.length + P.carry.length + P.unsorted.length + P.ideas.filter(x=> !/^side map:/.test(x)).length;
  if(!P.ownerLed) ok(size >= 6 && size <= 10, `Map ${no}: pool ${size} (6-10)`);
  ok(P.base.length >= 1 && P.base.length <= 3, `Map ${no}: ${P.base.length} skirmish-base cards`);
  P.held.forEach(id=>{ const c = by[id]; ok(c && !G.roadNever(c.rarity) && STEP(c.rarity) <= STEP(G.roadRarityCap(no, 'boss')), `Map ${no}: ${id} (${c && c.rarity}) under the road's caps`);
    if(c && !P.base.includes(id)) ok(G.rarityIntroMap(c.rarity) <= no, `Map ${no}: pack card ${id} revealed by then`); });
  [...P.carry, ...P.unsorted].forEach(id=> ok(by[id] && !by[id].awaitingSource, `Map ${no}: ${id} is a live card`)); });
ok(N.PLAN[40].ownerLed === true, 'Map 40 is owner-led (Maps 40+ one at a time): a seed only');

// ---- 5. record, doc, plan, changelog, owner calls
const rec = J('docs/balance/n221-divvy-2026-10-24.json');
ok(Object.keys(rec.homes).length === Object.keys(N.HOME).length && rec.packTiers.length === 6 && Object.keys(rec.maps).length === 16 && rec.existing.m22 && rec.existing.m22.added.includes('petrified-tree'), 'the record is current (homes, pack tiers, maps, the Caldera\'s addition)');
const md = R('docs/balance/n221-divvy-2026-10-24.md');
ok(/## Maps 25-40: the proposal table/.test(md) && /## Where the \d+ waiting cards go/.test(md) && /New-skill flags/.test(md), 'the doc has the homes, the Maps 21-24 table, the proposal table and the flags');
ok(/## Maps 21-40/.test(R('docs/progression-plan.md')) && /Pack 4/.test(R('docs/progression-plan.md')), 'the progression plan has its Maps 21-40 section');
ok(/package N221/.test(R('docs/CHANGELOG.md').slice(0, 200000)) /* 2026-10-24 (EN8): later packages' entries sit above it; 2026-10-26: 200000 */, 'a CHANGELOG entry at the top');
const dec = J('docs/decisions.json').items;
['N221-1', 'N221-2', 'N221-3', 'N221-4', 'N221-5', 'N221-6', 'N221-7'].forEach(id=> ok(dec.some(x=> x.id === id && (x.status === 'YET' || x.status === 'DONE')), `owner call ${id}`)); // 2026-10-26 (release): the owner answered them 10-25 17:53
ok(/run node tests\/n221-2026-10-24\.js/.test(R('tests/run-all.sh')), 'listed in tests/run-all.sh');

console.log(fail ? `n221-2026-10-24: ${fail} of ${n} checks FAILED` : `n221-2026-10-24: all ${n} checks passed`); process.exit(fail ? 1 : 0);
