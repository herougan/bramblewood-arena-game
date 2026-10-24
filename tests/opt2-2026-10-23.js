#!/usr/bin/env node
// 2026-10-23 (package OPT2, owner 22:23 OPT-1..3): the deck optimizer's logic-filtered phase 2 (tools/opt/phase2-rules.json), the
// search helpers (card-set distance, niching, single-copy neighbours) and a tiny GA-vs-descent --compare run. About 60 s on 2 cores.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), OPT = path.join(ROOT, 'tools', 'opt', 'deckopt.js');
const O = require(OPT);
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const OUT = path.join(ROOT, 'tests', 'out', 'opt2-2026-10-23'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const gm = O.loadGame(ROOT), G = gm.G, rules = O.loadRules(ROOT);

// ---- the rules file is readable and complete
['minCards', 'maxCards', 'minScore', 'weights', 'families', 'fieldFamilies', 'exclude'].forEach(k => ok(rules[k] != null, 'rules: ' + k));
ok(rules.exclude.maxObtainMap === 39, 'rules: no Map 40+ cards');

// ---- the candidate lists, Maps 0-3
const later = no => G.CONQUEST_MAPS.filter(m => !m.reserved && G.mapNumberOf(m.id) > no);
for (const m of ['0', '1', '2', '3']) {
  const map = O.resolveMap(gm, m), p = O.poolsFor(gm, map, {}), c = O.candidatesFor(gm, map, p, rules), no = p.mapNo;
  ok(c.list.length >= rules.minCards && c.list.length <= rules.maxCards, `Map ${m}: ${c.list.length} candidates (5-25)`);
  ok(c.list.every(r => !p.p1.includes(r.id)), `Map ${m}: candidates are outside the phase-1 pool`);
  ok(c.list.every(r => r.score >= c.minScore && r.reasons.length >= 1), `Map ${m}: every candidate has its reasons`);
  ok(c.list.every(r => r.obtainMap == null || r.obtainMap <= 39), `Map ${m}: no Map 40+ card`);
  const lead = new Set(), show = new Set(); later(no).forEach(mm => (mm.nodes || []).forEach(nd => { (nd.leaders || []).forEach(x => lead.add(x)); if (nd.showcase) show.add(nd.showcase); }));
  ok(c.list.every(r => !lead.has(r.id) && !show.has(r.id)), `Map ${m}: no later leader or showcased card`);
  const D = gm.D; ok(c.list.every(r => !D[r.id].hidden && !D[r.id].easterEgg && !D[r.id].awaitingSource && !D[r.id].raid && !D[r.id].worldBoss && !(D[r.id].source && D[r.id].source.challenge)), `Map ${m}: no strange or challenge card`);
  for (let i = 1; i < c.list.length; i++) ok(c.list[i - 1].score >= c.list[i].score, `Map ${m}: sorted by score`);
}
// the arrow example: on Map 3 (wind) flyers score through the field
const c3 = O.candidatesFor(gm, O.resolveMap(gm, '3'), O.poolsFor(gm, O.resolveMap(gm, '3'), {}), rules);
ok(c3.list.some(r => r.reasons.some(s => /flying \(field wind/.test(s))), 'Map 3: flying cards relate through the wind');
ok(c3.facts.terrainTypes.includes('Mountain'), 'Map 3: terrain types read from the fights');
// a stricter rule file narrows the list (the config is live)
const strict = JSON.parse(JSON.stringify(rules)); strict.maxCards = 6; strict.minCards = 2;
ok(O.candidatesFor(gm, O.resolveMap(gm, '3'), O.poolsFor(gm, O.resolveMap(gm, '3'), {}), strict).list.length === 6, 'maxCards caps the list');

// ---- search helpers
const a = { x: 4, y: 4, z: 12 }, b = { x: 4, y: 2, w: 2, z: 12 };
ok(O.overlap(a, b) === 18 && O.dist(a, b) === 2 && O.dist(a, a) === 0, 'card-set distance');
const ranked = [{ d: a, k: 'a' }, { d: b, k: 'b' }, { d: { q: 20 }, k: 'c' }];
ok(O.nicheSelect(ranked, 2, 5, 1).map(x => x.k).join() === 'a,c', 'niching keeps the far deck over the near one');
const p0 = O.poolsFor(gm, O.resolveMap(gm, '0'), {}), rng = O.mulberry(3), base = O.repair(gm, {}, p0.p1, rng, {});
const nb = O.neighbours(gm, base, p0.p1, rng, 12);
ok(nb.length === 12 && nb.every(d => O.deckTotal(d) === 20 && O.dist(d, base) === 1 && !gm.Budget.deckRankOver(d, gm.D, []).length && Object.keys(d).every(id => d[id] <= O.capOf(gm, id))), 'neighbours: legal single-copy swaps');
ok(new Set(nb.map(O.deckKey)).size === 12, 'neighbours are distinct');

// ---- options
ok(O.parseArgs(['--map', '0']).level === 1 && O.parseArgs(['--level', 'ref']).level === null, '--level 1 by default, ref = the game\'s');
let threw = false; try { O.parseArgs(['--gens1', '3']); } catch (e) { threw = /--budget/.test(e.message); } ok(threw, '--gens1 points to --budget');
ok(O.parseArgs(['--ladder', '500,250']).ladder.join() === '500,250' && O.parseArgs(['--no-ladder']).ladder.length === 0, '--ladder');

// ---- 2026-10-24 (package PRO2, owner 21:20 #9-#11): the map-true and BPRO pools, the map's rarity cap, the Alley Cat's move
{ const step = r => G.roadRarityStep(r), mapPool = id => gm.pools[id] || { cards: [], special: [], submaps: {} };
  ok(['0', '1', '2', '3'].map(m => O.mapRarityCap(gm, O.resolveMap(gm, m))).join() === 'common,uncommon,uncommon,uncommon', 'rarity cap = the highest of the map\'s fights: Map 0 Common, Maps 1-3 Uncommon');
  ok(O.mapRarityCap(gm, O.resolveMap(gm, '1'), 'skirmish') === 'common' && O.mapRarityCap(gm, O.resolveMap(gm, '1'), 'rare') === 'rare', '--rarity-cap skirmish (Map 1 Common) and by name');
  for (const m of ['0', '1', '2', '3']) {
    const map = O.resolveMap(gm, m), no = G.mapNumberOf(map.id), cap = O.mapRarityCap(gm, map), e = mapPool(map.id);
    const own = new Set((e.cards || []).concat(e.special || [], ...O.fightsOf(map).map(n => Object.keys(n.deck))));
    const mt = O.poolsFor(gm, map, { mode: 'map-true' }), bp = O.poolsFor(gm, map, { mode: 'bpro' });
    ok(mt.cap === cap && bp.cap === cap, `Map ${m}: both modes read the cap (${cap})`);
    ok(mt.p1.length >= 20 && mt.p1.every(id => step(gm.D[id].rarity) <= step(cap)), `Map ${m} map-true: ${mt.p1.length} cards, none over ${cap}`);
    ok(mt.p1.every(id => own.has(id) || O.obtainOf(gm, id) <= no), `Map ${m} map-true: every outside card is obtainable by Map ${m}`);
    const closed = G.CONQUEST_MAPS.filter(s => s.sub && s.parent === map.id && G.mapUnlockNumberOf(s.id) > no).map(s => s.id);
    ok(closed.every(s => !mt.subsOpen.includes(s)), `Map ${m} map-true: submaps that open later (${closed.join(', ') || 'none'}) are not open`);
    ok(bp.p1.length >= 13 && bp.p1.every(id => own.has(id) && step(gm.D[id].rarity) <= step(cap)), `Map ${m} BPRO: ${bp.p1.length} cards, all the map's own (MAP + SPECIAL + fight decks), none over ${cap}`);
    ok(bp.all.length === bp.p1.length && O.candidatesFor(gm, map, bp, rules).list.length === 0, `Map ${m} BPRO: no outside card, no phase-2 candidate`);
    ok(O.candidatesFor(gm, map, mt, rules).list.every(r => !mt.rule(r.id)), `Map ${m} map-true: phase-2 candidates obey the map rule`);
  }
  const m0 = O.resolveMap(gm, '0'), p0mt = O.poolsFor(gm, m0, { mode: 'map-true' });
  ok(['ent', 'alley-cat', 'otter-centurion', 'bombardier-beetle', 'badger-berserker'].every(id => !p0mt.p1.includes(id)), 'Map 0 map-true: no Ent (the Old Bramble opens after Map 21), Alley Cat, Otter Centurion, Bombardier Beetle or Badger Berserker');
  ok(O.mapRuleProblems(gm, m0, { ent: 2, 'fox-kit': 18 }, 'map-true').some(x => /^ent: rare is over the map's rarity cap \(common\)/.test(x)), 'mapRuleProblems names the Ent on Map 0');
  ok(O.mapRuleProblems(gm, O.resolveMap(gm, '2'), { 'beetle-grunt': 5, 'tide-pool-crab': 5 }, 'bpro').some(x => /^beetle-grunt: not in the map's own pool/.test(x)) && !O.mapRuleProblems(gm, O.resolveMap(gm, '2'), { 'beetle-grunt': 5, 'tide-pool-crab': 5 }, 'map-true').length, 'BPRO refuses an outside card that map-true allows');
  ok(O.parseArgs(['--map', '0']).mode === 'map-true' && O.parseArgs(['--bpro']).mode === 'bpro' && O.parseArgs(['--bpro']).crossShare === 0 && O.parseArgs(['--classic']).mode === 'classic', '--mode: map-true by default, --bpro (no phase 2), --classic');
  let bad = false; try { O.parseArgs(['--mode', 'nope']); } catch (e2) { bad = /--mode/.test(e2.message); } ok(bad, '--mode refuses an unknown mode');
  // the Alley Cat (owner #10): a Rare in Map 0's list, whose fights are Common only; now the Gatorback Swamp's (Map 5), still Pack 1 and obtainable on Map 5
  const ac = gm.D['alley-cat'];
  ok(!mapPool('m1').cards.includes('alley-cat') && mapPool('mw').cards.includes('alley-cat') && ac.source.map === 'mw' && +ac.source.tier === 1 && gm.obtain['alley-cat'] === 5, 'the Alley Cat lives in the Gatorback Swamp (Map 5), Pack 1, obtainable on Map 5');
  const over = []; G.CONQUEST_MAPS.filter(x => !x.sub && !x.reserved && G.mapNumberOf(x.id) != null && G.mapNumberOf(x.id) <= 40).forEach(x => { const cap = O.mapRarityCap(gm, x);
    (mapPool(x.id).cards || []).forEach(id => { if (gm.D[id] && step(gm.D[id].rarity) > step(cap)) over.push(x.id + ':' + id); }); });
  ok(!over.length, 'no main map (0-40) lists a MAP-tier card over the rarest its fights may hold: ' + over.join(', ')); }

// ---- a tiny compare run (both methods, independent eval seeds)
cp.execFileSync(process.execPath, [OPT, '--map', '0', '--compare', '--budget', '400', '--pop', '3', '--children', '3', '--gmax', '2', '--dgmax', '2', '--neighbours', '3', '--patience', '1', '--restarts', '1', '--eval-games', '2', '--h2h-games', '1', '--workers', '2', '--out', OUT, '--tag', 't', '--quiet'], { cwd: ROOT, encoding: 'utf8' });
const cj = JSON.parse(fs.readFileSync(path.join(OUT, 'deckopt-compare-t.json'), 'utf8')), cm = cj.maps[0];
ok(cm && cm.methods.ga && cm.methods.descent, 'compare: both methods');
ok(['ga', 'descent'].every(k => cm.methods[k].curve.length === 3 && cm.methods[k].curve.every(x => x.score != null) && cm.methods[k].games >= 400), 'compare: three budget points scored on eval seeds, budget spent');
ok(cm.methods.descent.restarts >= 1, 'compare: descent restarts counted');
ok(/GA vs coordinate descent/.test(fs.readFileSync(path.join(OUT, 'deckopt-compare-t.md'), 'utf8')), 'compare markdown');

console.log(fail ? `opt2: ${fail}/${n} FAILED` : `opt2: all ${n} passed`); process.exit(fail ? 1 : 0);
