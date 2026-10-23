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

// ---- a tiny compare run (both methods, independent eval seeds)
cp.execFileSync(process.execPath, [OPT, '--map', '0', '--compare', '--budget', '400', '--pop', '3', '--children', '3', '--gmax', '2', '--dgmax', '2', '--neighbours', '3', '--patience', '1', '--restarts', '1', '--eval-games', '2', '--h2h-games', '1', '--workers', '2', '--out', OUT, '--tag', 't', '--quiet'], { cwd: ROOT, encoding: 'utf8' });
const cj = JSON.parse(fs.readFileSync(path.join(OUT, 'deckopt-compare-t.json'), 'utf8')), cm = cj.maps[0];
ok(cm && cm.methods.ga && cm.methods.descent, 'compare: both methods');
ok(['ga', 'descent'].every(k => cm.methods[k].curve.length === 3 && cm.methods[k].curve.every(x => x.score != null) && cm.methods[k].games >= 400), 'compare: three budget points scored on eval seeds, budget spent');
ok(cm.methods.descent.restarts >= 1, 'compare: descent restarts counted');
ok(/GA vs coordinate descent/.test(fs.readFileSync(path.join(OUT, 'deckopt-compare-t.md'), 'utf8')), 'compare markdown');

console.log(fail ? `opt2: ${fail}/${n} FAILED` : `opt2: all ${n} passed`); process.exit(fail ? 1 : 0);
