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
ok(p3.p1.length > p0.p1.length, 'Map 3 owns more than Map 0 (' + p3.p1.length + ')');
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
const common = ['--map', '0', '--gens1', '1', '--gens2', '1', '--final-games', '2', '--pop', '3', '--children', '3', '--gmax', '2', '--screen-max', '3', '--quiet'];
const run = (dir, extra) => cp.execFileSync(process.execPath, [OPT].concat(common, ['--out', path.join(OUT, dir), '--ckpt-dir', path.join(OUT, 'ck-' + dir)], extra || []), { cwd: ROOT, encoding: 'utf8' });
run('w0', ['--workers', '0']); run('w2', ['--workers', '2']);
const file = d => { const f = fs.readdirSync(path.join(OUT, d)).find(x => /^deckopt-map00-m1-.*\.json$/.test(x)); return f && JSON.parse(fs.readFileSync(path.join(OUT, d, f), 'utf8')); };
const a = file('w0'), b = file('w2'), strip = r => JSON.stringify([r.phase1, r.phase2, r.gap, r.road, r.fieldImpact]);
ok(a && b && strip(a) === strip(b), 'same results inline and over 2 workers');
ok(a.phase1.best.cards.reduce((s, c) => s + c.copies, 0) === 20 && a.phase1.best.cards.every(c => !c.outOfMap), 'phase 1 best: 20 map cards');
ok(a.gap.length >= 4 && a.gap.every(g => g.h2h != null && g.eloCI.length === 2 && g.pointsBelow != null), 'the gap per opponent deck (h2h, Elo, points below)');
ok(a.road.length === O.fightsOf(m0).length && a.fieldImpact.length === a.gap.length, 'road results and field impact per fight');
ok(/--gens1 1 --gens2 1 --final-games 2 --screen-max 3/.test(a.reproduce), 'reproduce line');
ok(a.throughput.games > 0 && a.throughput.gamesPerSecond > 0, 'throughput recorded');
ok(fs.readdirSync(path.join(OUT, 'w0')).some(f => /^deckopt-summary-.*\.md$/.test(f)), 'summary markdown');
// resume: a finished checkpoint replays to the same report without new search games
run('w0r', ['--workers', '0', '--resume', '--ckpt-dir', path.join(OUT, 'ck-w0')]);
const c = file('w0r'); ok(c && strip(c) === strip(a), 'resume from the checkpoint gives the same report');

// ---- CLI, exe build, workflow
ok(/--cross-share/.test(cp.execFileSync(process.execPath, [OPT, '--help'], { encoding: 'utf8' })), '--help lists --cross-share');
const sh = fs.readFileSync(path.join(ROOT, 'tools', 'opt', 'build-exe.sh'), 'utf8');
ok(/--experimental-sea-config/.test(sh) && /postject/.test(sh) && /npx pkg/.test(sh), 'build-exe.sh: SEA + postject, pkg documented');
const wf = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deckopt.yml'), 'utf8');
ok(/workflow_dispatch/.test(wf) && !/^\s*push:/m.test(wf) && !/pull_request|schedule/.test(wf), 'workflow: manual dispatch only');
ok(/upload-artifact/.test(wf) && /tools\/opt\/deckopt\.js/.test(wf), 'workflow: runs deckopt and uploads the results');

console.log(fail ? `opt: ${fail}/${n} FAILED` : `opt: all ${n} passed`); process.exit(fail ? 1 : 0);
