'use strict';
// LOOKAHEAD1 (2026-11-22): the look-ahead pilot of the bench (tools/bench/lookahead.js, --ai-mine look).
//   (1) deterministic: the same fight twice gives the same game, and every replay reaches the real state (no divergence);
//   (2) stronger: in a mirror of one fixed deck (the bench's global context, bramble 15, both seats the smartest CPU), the look seat
//       beats a level-2 seat over the same FIGHTS fights (Wilson 95% lower bound > 50%, and the paired gain over the level-2 seat's own
//       results on those fights 2 SE above 0); prints the win rates and the slowdown per fight;
//   (3) a pipeline measure of one skill with --ai-mine look runs (PIPELINE_OUT and the cache in a temp folder; nothing in docs/).
// LOOK_FIGHTS=n overrides FIGHTS (default 200). Reads bramblewood-engine.js, tools/lib_bramble.js, tools/opt/deckopt.js, tools/bench/lookahead.js,
// tools/pipeline/measure.js and tools/skill_canon_2026_10_31.js (named here for the test cache).
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const ROOT = path.join(__dirname, '..');
const L = require('../tools/bench/lib.js'), O = L.O, LA = require('../tools/bench/lookahead.js');
const FIGHTS = +process.env.LOOK_FIGHTS || 200;

function setup() {
  const gm = O.loadGame(ROOT), G = gm.G, X = L.contextOf(gm, { kind: 'global', bramble: 15, ai: 2 });
  const defs = G.referenceBaseDefs(), castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: 15, rarity: 'common', archetypes: ['Castle'], effects: {} };
  const deck = L.randomDeck(gm, X.pool, O.mulberry(L.fnv('lookahead1|deck')), 20), mine = O.mineFor(gm, defs, deck, X.level);
  const ctx = { en: { kind: 'mirror' }, defs, rules: {}, mode: G.CONQUEST_DEFAULT_MODE || 'open', cpu: 2, myCastle: castle, mineCache: new Map([[O.deckKey(mine), mine]]), oppMine: mine, seedBase: L.fnv('lookahead1|game') };
  return { gm, ctx, mine, deck };
}
function playRange(a, b, aiMine) {
  const S = setup(), spec = { level: 1, ai: 2, aiMine, beeTank: false }, out = []; const t0 = Date.now();
  for (let i = a; i < b; i++) out.push(O.playOne(S.gm, spec, S.ctx, S.mine, i));
  return { out, ms: Date.now() - t0, stats: Object.assign({}, LA.stats) };
}
if (!isMainThread) { parentPort.postMessage(playRange(workerData.a, workerData.b, workerData.aiMine)); return; }

let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const par = (aiMine, n) => { const W = Math.max(1, Math.min(2, os.cpus().length)), step = Math.ceil(n / W), jobs = [];
  for (let a = 0; a < n; a += step) jobs.push(new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { a, b: Math.min(n, a + step), aiMine } }); w.on('message', res); w.on('error', rej); }));
  return Promise.all(jobs).then(rs => ({ out: [].concat(...rs.map(r => r.out)), ms: rs.reduce((t, r) => t + r.ms, 0), diverged: rs.reduce((t, r) => t + r.stats.diverged, 0), replays: rs.reduce((t, r) => t + r.stats.replays, 0) })); };

(async () => {
  // (1) determinism
  { const S = setup(), spec = { level: 1, ai: 2, aiMine: 'look', beeTank: false }, D = require('../tools/opt/deckopt.js');
    const sigOf = i => { const g = LA.playLook(S.gm, spec, S.ctx, S.mine, i % 2 === 0, (S.ctx.seedBase + Math.imul(i + 1, 2654435761)) >>> 0, D.playGame); return g.r + '|' + LA.stateSig(S.gm.E, g.P); };
    const a = [0, 1].map(sigOf), b = [0, 1].map(sigOf);
    ok(a[0] === b[0] && a[1] === b[1], 'the same seed plays the same game twice (both seats)');
    ok(LA.stats.replays > 0 && LA.stats.diverged === 0, 'every replay reached the real state (' + LA.stats.replays + ' replays, ' + LA.stats.diverged + ' diverged)');
    const X = L.contextOf(S.gm, { kind: 'global', bramble: 15, aiMine: L.aiMineOf('look') }), X0 = L.contextOf(S.gm, { kind: 'global', bramble: 15 });
    ok(/-pilotlook$/.test(X.name) && X.key !== X0.key, "--ai-mine look reaches the bench context (name '" + X.name + "', its own cache key)"); }
  // (2) the look seat vs a level-2 seat, the same fights
  { const base = await par(undefined, FIGHTS), look = await par('look', FIGHTS);
    const m = a => a.reduce((t, x) => t + x, 0) / a.length, pb = m(base.out), pl = m(look.out), [lo, hi] = O.wilson(pl, FIGHTS), [blo, bhi] = O.wilson(pb, FIGHTS);
    const msB = base.ms / FIGHTS, msL = look.ms / FIGHTS;
    console.log(`     ${FIGHTS} mirror fights (one fixed deck, bramble 15, smartest CPU opposite): look seat ${(pl * 100).toFixed(1)}% [${(lo * 100).toFixed(1)}, ${(hi * 100).toFixed(1)}], level-2 seat ${(pb * 100).toFixed(1)}% [${(blo * 100).toFixed(1)}, ${(bhi * 100).toFixed(1)}]`);
    console.log(`     per fight: level 2 ${msB.toFixed(0)} ms, look ${msL.toFixed(0)} ms (x${(msL / msB).toFixed(0)}); ${look.replays} replays, ${look.diverged} diverged`);
    const d = look.out.map((x, i) => x - base.out[i]), dm = m(d), dse = Math.sqrt(d.reduce((t, x) => t + (x - dm) * (x - dm), 0) / (FIGHTS - 1) / FIGHTS);
    console.log(`     paired gain over the level-2 seat on the same fights: ${(dm * 100).toFixed(1)} points (SE ${(dse * 100).toFixed(1)})`);
    ok(lo > 0.5 && dm - 2 * dse > 0, 'the look seat beats a level-2 seat (95% lower bound ' + (lo * 100).toFixed(1) + '% > 50%; paired gain ' + (dm * 100).toFixed(1) + ' > 2 SE)');
    ok(look.diverged === 0, 'no replay diverged in ' + FIGHTS + ' fights'); }
  // (3) a pipeline measure with --ai-mine look
  { const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lookahead1-'));
    const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'pipeline', 'run.js'), 'measure', '--skills', 'armor=1', '--ai-mine', 'look', '--fights', '4', '--carriers', 'soldier-ant,glass-golem', '--ctx-tag', 'looktest', '--cache-dir', path.join(tmp, 'cache')],
      { cwd: ROOT, env: Object.assign({}, process.env, { PIPELINE_OUT: path.join(tmp, 'out') }), encoding: 'utf8', timeout: 1800000 });
    const caches = fs.existsSync(path.join(tmp, 'cache')) ? fs.readdirSync(path.join(tmp, 'cache')) : [], store = path.join(tmp, 'out', 'measures.json');
    const res = fs.existsSync(store) ? JSON.parse(fs.readFileSync(store, 'utf8')).results['global@looktest|armor=1'] : null;
    ok(r.status === 0, 'pipeline measure --ai-mine look exits 0' + (r.status ? ': ' + (r.stdout || '').slice(-400) + (r.stderr || '').slice(-400) : ''));
    const cf = caches.find(f => /-pilotlook-/.test(f)), games = cf ? Object.values(JSON.parse(fs.readFileSync(path.join(tmp, 'cache', cf), 'utf8')).games).reduce((t, s) => t + s.replace(/\./g, '').length, 0) : 0;
    ok(cf && games >= 38 * 4, 'its fights are played and cached under the look context (' + cf + ': ' + games + ' fights)');
    // (4 fights a slot is too few for a stable reading: the reading is printed, not required)
    console.log('     armor=1 under --ai-mine look: ' + (res && res.test && res.test.worthRuler.m != null ? 'worth ' + res.test.worthRuler.m + ' [' + res.test.worthRuler.lo + ', ' + res.test.worthRuler.hi + '] over ' + res.fights + ' fights' : 'no reading at 4 fights a slot (flagged by the step)'));
    fs.rmSync(tmp, { recursive: true, force: true }); }
  console.log(fails ? `lookahead-2026-11-22: ${fails} FAILED` : 'lookahead-2026-11-22: all passed');
  process.exit(fails ? 1 : 0);
})();
