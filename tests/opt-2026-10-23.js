#!/usr/bin/env node
// 2026-10-23 (package OPT): the deck optimizer (tools/opt/deckopt.js). Legal decks (20 cards, rarity copy caps, top-rank caps, pool only),
// the per-map pools (map cards + owned by then; the whole spectrum is larger), the gauntlet (fair mirror / road / no-field entries for
// every fight deck), the same results inline and over 2 worker threads for a fixed --gens1 / --gens2 / --final-games run (seeds per
// entry and game, so order and worker never matter), the output's fields and the summary, resume from a checkpoint, the CLI help,
// the SEA build script and the manual-only GitHub Actions workflow. About 60 s on 2 cores.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), OPT = path.join(ROOT, 'tools', 'opt', 'deckopt.js');
const O = require(OPT);
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const OUT = path.join(ROOT, 'tests', 'out', 'opt-2026-10-23'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

// ---- legal decks and pools
const gm = O.loadGame(ROOT), G = gm.G;
const m0 = O.resolveMap(gm, '0'), m3 = O.resolveMap(gm, 'mc');
ok(m0.id === 'm1' && G.mapNumberOf(m3.id) === 3, 'maps by number and id');
const p0 = O.poolsFor(gm, m0, { owned: 'plan', crossPool: 'plan', submaps: true }), p3 = O.poolsFor(gm, m3, { owned: 'plan', crossPool: 'plan', submaps: true });
ok(p0.p1.length >= 20 && p0.all.length > p0.p1.length * 3, 'Map 0 pool ' + p0.p1.length + ', whole spectrum ' + p0.all.length);
ok(p0.owned.every(id => p3.p1.includes(id)) && p3.owned.length > p0.owned.length, 'what you own on Map 0 you still own on Map 3, and more (' + p0.owned.length + ' -> ' + p3.owned.length + ')');
// 2026-10-24 (package PRO): RW5 moved the Voidfeather Scout out of Base (a Hummingbird faction card, first on Map 5), so this named a
// card that is no longer Base. The check now reads the plan: every deckable Base / tutorial-base card is in Map 0's pool.
{ const base = gm.plan.cards.filter(c => (c.bucket === 'base' || c.bucket === 'tutorialBase') && gm.D[c.id] && !['token', 'test', 'hero', 'hallOfFame', 'pool'].some(k => gm.D[c.id][k]) && c.id !== 'wandering-traveller').map(c => c.id);
  ok(base.length >= 20 && base.includes('otter-centurion') && base.every(id => p0.p1.includes(id)), 'Base and tutorial-base cards are owned from Map 0 (' + base.filter(id => !p0.p1.includes(id)).join(', ') + ')'); }
ok(O.fightsOf(m3).every(f => Object.keys(f.deck).every(id => p3.p1.includes(id) || !O.poolsFor(gm, m3, {}).all.includes(id))), "a map's fight-deck cards are in its pool");
ok(p0.p1.every(id => !gm.D[id].token && !gm.D[id].pool), 'no tokens or pool candidates');
const rng = O.mulberry(7);
for (let t = 0; t < 30; t++) {
  const want = {}; for (let i = 0; i < 12; i++) { const id = p3.all[Math.floor(rng.next() * p3.all.length)]; want[id] = 1 + Math.floor(rng.next() * 6); }
  const d = O.repair(gm, want, p3.p1, rng, {});
  ok(O.deckTotal(d) === 20, 'repair -> 20 cards (' + O.deckTotal(d) + ')');
  ok(Object.keys(d).every(id => p3.p1.includes(id) && d[id] <= O.capOf(gm, id)), 'repair keeps the pool and the copy caps');
  ok(!gm.Budget.deckRankOver(d, gm.D, []).length, 'repair keeps the top-rank caps');
}
ok(O.deckKey(O.deckFromKey('a:2,b-c:3')) === 'a:2,b-c:3', 'deck keys round-trip');
const w = O.wilson(0.5, 100); ok(w[0] > 0.39 && w[1] < 0.61, 'Wilson interval');
ok(Math.round(O.elo(0.76, 100)) === 200, 'Elo of 76% is 200');
const en = O.buildEntries(gm, m3, { roadWeight: 0.25 });
const fights3 = O.fightsOf(m3).length;
ok(en.filter(e => e.kind === 'road').length === fights3, 'a road entry per fight');
ok(en.filter(e => e.kind === 'mirror' && !e.neutral).length >= fights3 - 2 && en.some(e => e.oppKey === 'ref:starter'), 'mirror entries: the fight decks (duplicates merged) and the reference decks');
ok(Math.abs(en.reduce((a, e) => a + e.weight, 0) - 1) < 1e-9 && en.filter(e => e.neutral).every(e => e.weight === 0), 'weights sum to 1; no-field entries only for the final');

// ---- the same run inline and over workers, and its output
// 2026-10-23 (OPT2): --gens1 / --gens2 gave way to --budget (search games per map); a small ladder and head-to-head keep it short
// 2026-10-24 (package PRO2): the CLI's default pool is now map-true (Map 0: Common cards a player holds, no phase-2 candidates), so this
// run asks for the classic OPT2 pool its checks describe (phase 2's 5-25 candidates); the modes have their own checks in tests/opt2-2026-10-23.js
const common = ['--mode', 'classic', '--map', '0', '--budget', '300', '--final-games', '2', '--pop', '3', '--children', '3', '--gmax', '2', '--screen-max', '3', '--restarts', '1', '--h2h-games', '2', '--ladder', '300', '--ladder-games', '2', '--ladder-walks', '1', '--quiet'];
const run = (dir, extra) => cp.execFileSync(process.execPath, [OPT].concat(common, ['--out', path.join(OUT, dir), '--ckpt-dir', path.join(OUT, 'ck-' + dir)], extra || []), { cwd: ROOT, encoding: 'utf8' });
run('w0', ['--workers', '0']); run('w2', ['--workers', '2']);
const file = d => { const f = fs.readdirSync(path.join(OUT, d)).find(x => /^deckopt-map00-m1-.*\.json$/.test(x)); return f && JSON.parse(fs.readFileSync(path.join(OUT, d, f), 'utf8')); };
const a = file('w0'), b = file('w2'), strip = r => JSON.stringify([r.phase1, r.phase2, r.gap, r.road, r.fieldImpact, r.optima, r.optimaH2H, r.ladder]);
ok(a && b && strip(a) === strip(b), 'same results inline and over 2 workers');
ok(a.phase1.best.cards.reduce((s, c) => s + c.copies, 0) === 20 && a.phase1.best.cards.every(c => !c.outOfMap), 'phase 1 best: 20 map cards');
ok(a.gap.length >= 4 && a.gap.every(g => g.h2h != null && g.eloCI.length === 2 && g.pointsBelow != null), 'the gap per opponent deck (h2h, Elo, points below)');
ok(a.road.length === O.fightsOf(m0).length && a.fieldImpact.length === a.gap.length, 'road results and field impact per fight');
ok(/--budget 300 --final-games 2 --method ga --level 1/.test(a.reproduce), 'reproduce line');
ok(a.level === 1, 'your level is 1 by default (OPT2)');
ok(a.candidates && a.candidates.list.length >= 5 && a.candidates.list.length <= 25, 'phase 2: 5-25 candidates');
ok(!a.phase2.best || a.phase2.best.cards.every(c => !c.outOfMap || a.candidates.list.some(x => x.id === c.id)), 'phase 2 uses only the logic-filtered candidates');
ok(a.optima.length >= 1 && a.ladder.length === 1 && a.ladder[0].sharedWithOptimum >= 6 && a.ladder[0].n > 0, 'distinct optima and a ladder deck sharing >= 6 copies (the core floor)');
ok(a.ladder.every(x => x.eloCI[0] <= x.eloGap && x.eloGap <= x.eloCI[1] && (x.eloGap >= 0) === (x.optimumH2H >= 0.5)), 'ladder: the Elo gap inside its interval, the optimum\'s score on the same side');
ok(a.throughput.games > 0 && a.throughput.gamesPerSecond > 0, 'throughput recorded');
ok(fs.readdirSync(path.join(OUT, 'w0')).some(f => /^deckopt-summary-.*\.md$/.test(f)), 'summary markdown');
// resume: a finished checkpoint replays to the same report without new search games
// 2026-10-24 (package PRO): the batch's run reported this check failing; it passed 5 times here (alone and under tests/run.js -j 2), so
// the check now says why when it fails: whether the run resumed at all (a checkpoint name that changed between the two runs, e.g. card
// data or the progression plan edited by a concurrent run, starts a fresh search instead) and which part of the report differs.
const logR = cp.execFileSync(process.execPath, [OPT].concat(common.filter(x => x !== '--quiet'), ['--out', path.join(OUT, 'w0r'), '--workers', '0', '--resume', '--ckpt-dir', path.join(OUT, 'ck-w0')]), { cwd: ROOT, encoding: 'utf8' });
ok(/resumed from .*stages done: .*ladder/.test(logR), 'resume: the run picked up the finished checkpoint (' + (logR.split('\n').find(x => /resumed from/.test(x)) || 'no "resumed from" line: the checkpoint name changed') + ')');
const c = file('w0r'), parts = ['phase1', 'phase2', 'gap', 'road', 'fieldImpact', 'optima', 'optimaH2H', 'ladder'];
ok(c && strip(c) === strip(a), 'resume from the checkpoint gives the same report' + (c && strip(c) !== strip(a) ? ' (differs: ' + parts.filter(k => JSON.stringify(c[k]) !== JSON.stringify(a[k])).join(', ') + ')' : ''));
// 2026-10-23 (OPT2): --redo ladder runs the ladder again from the checkpoint and gets the same ladder (its own generator)
run('w0l', ['--workers', '0', '--resume', '--redo', 'ladder', '--ckpt-dir', path.join(OUT, 'ck-w0')]);
const l = file('w0l'); ok(l && JSON.stringify(l.ladder) === JSON.stringify(a.ladder), '--redo ladder repeats the ladder exactly');

// ---- CLI, exe build, workflow
ok(/--cross-share[\s\S]*--ladder[\s\S]*--compare/.test(cp.execFileSync(process.execPath, [OPT, '--help'], { encoding: 'utf8' })), '--help lists --cross-share, --ladder, --compare');
const sh = fs.readFileSync(path.join(ROOT, 'tools', 'opt', 'build-exe.sh'), 'utf8');
ok(/--experimental-sea-config/.test(sh) && /postject/.test(sh) && /npx pkg/.test(sh), 'build-exe.sh: SEA + postject, pkg documented');
const wf = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deckopt.yml'), 'utf8');
ok(/workflow_dispatch/.test(wf) && !/^\s*push:/m.test(wf) && !/pull_request|schedule/.test(wf), 'workflow: manual dispatch only');
ok(/upload-artifact/.test(wf) && /tools\/opt\/deckopt\.js/.test(wf), 'workflow: runs deckopt and uploads the results');

console.log(fail ? `opt: ${fail}/${n} FAILED` : `opt: all ${n} passed`); process.exit(fail ? 1 : 0);
