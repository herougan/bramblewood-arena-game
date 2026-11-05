#!/usr/bin/env node
// 2026-11-05 (package BAL18, item 1): rebuild only the reference-ladder decks that no longer fit their map's map-true pool (after CONTENT10's
// list changes, tests/bal13-2026-11-02.js "every card in the map-true pool"), with BAL13's rules, and keep every other entry as it is.
//   node tools/bal18/ladder_stale_2026_11_05.js list                       the stale decks (map, rank, the cards out of the pool)
//   node tools/bal18/ladder_stale_2026_11_05.js build [--map mb,m2] [--workers 2] [--force]
//        per map with a stale deck: BAL13's candidates (the anchors and 24 sampled decks, tools/bal13/ladder_2026_11_02.js, the same code run
//        here, not a copy) plus each stale deck repaired (its out-of-pool copies to the pool's nearest card, BAL13's fix / swapOut), each
//        measured as BAL13 measured them: the map's road fights, 6 games a fight on the ladder seeds (5300 + 37g), at the Map reference's
//        level, with the ladder entry's own leader -> docs/balance/bal18/ladder/<mapId>.json (resumable by fingerprint)
//   node tools/bal18/ladder_stale_2026_11_05.js collect [--dry]           docs/balance/ref/ref-ladder.json: each stale slot gets the unused
//        candidate nearest that slot's old selection win rate, at least 4 copies from every deck of the map (BAL13's choice rule); the
//        kept decks are untouched (counts, name, selectWin); the map's decks are then ranked weak to strong again by selectWin. A new deck's
//        name comes from BAL13's deckName (a "II" / "III" when the name is taken in the map).
// Then: node tools/opt/ref_decks.js --apply, and rebuild.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), Module = require('module');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('../opt/deckopt.js'), LL = require('../bal13/lib_leader_2026_11_02.js'), DK = require('../bal13/decks_2026_11_02.js');
// BAL13's ladder module with its internal functions exposed (the same source, compiled at its own path, so the rules are BAL13's own code)
const LADDER_FILE = path.join(ROOT, 'tools', 'bal13', 'ladder_2026_11_02.js');
const LD = (() => { const src = fs.readFileSync(LADDER_FILE, 'utf8').replace(/^#!.*\n/, '') + '\nmodule.exports.__int = { strengthTable, sampleDeck, anchors, deckName, capOf, apart, SEED0, APART };\n';
  const m = new Module(LADDER_FILE, module); m.filename = LADDER_FILE; m.paths = Module._nodeModulePaths(path.dirname(LADDER_FILE)); m._compile(src, LADDER_FILE); return m.exports; })();
const I = LD.__int, VERSION = '1.0.0 (2026-11-05, BAL18)';
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal18', 'ladder');
const argv = process.argv.slice(2), CMD = argv[0];
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
let _gm = null; const game = () => _gm || (_gm = O.loadGame(ROOT));
const readSet = () => JSON.parse(fs.readFileSync(LD.SET, 'utf8'));

function stale(gm) {
  const set = readSet(), out = [];
  for (const e of LD.entries()) { const L = set.ladder[e.id]; if (!L) continue; const map = gm.G.CONQUEST_MAPS.find(m => m.id === e.id), pool = LD.poolOf(gm, map), P = new Set(pool);
    const bad = L.decks.filter(d => !LD.legal(gm, d.counts, pool)); if (bad.length) out.push({ id: e.id, e, map, pool, L, bad: bad.map(d => ({ rank: d.rank, out: Object.keys(d.counts).filter(id => !P.has(id)), selectWin: d.selectWin, counts: d.counts })) }); }
  return out;
}
function buildMap(gm, s, opts) {
  const G = gm.G, file = path.join(OUTDIR, s.id + '.json'), fights = LD.roadFights(gm, s.map), leader = s.L.leader;
  const files = ['arena_app.js', 'bramblewood-engine.js', 'canonical/cards.json', 'bramblewood-budget.js'].map(f => sha(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  const fp = sha(JSON.stringify([VERSION, files, s.id, leader, s.bad, fights.map(f => f.key), opts.games, opts.cands]));
  if (!opts.force && fs.existsSync(file)) { try { if (JSON.parse(fs.readFileSync(file, 'utf8')).fingerprint === fp) return { id: s.id, skipped: true }; } catch (x) {} }
  const t0 = Date.now(), pool = s.pool, S = I.strengthTable(gm, s.map), rng = O.mulberry(fnv('ladder|' + s.id)), cap = O.mapRarityCap(gm, s.map, 'map'), P = new Set(pool);
  const cands = I.anchors(gm, s.map, s.e, pool), seen = new Set(cands.map(c => O.deckKey(c.d)));
  // each stale deck repaired as BAL13's fix does (its out-of-pool / over-cap copies to the pool's nearest card)
  s.bad.forEach(b => { const take = {}; Object.keys(b.counts).forEach(id => { if (!P.has(id)) take[id] = b.counts[id]; else if (b.counts[id] > I.capOf(gm, id)) take[id] = b.counts[id] - I.capOf(gm, id); });
    let r = null; try { r = DK.swapOut(b.counts, take, pool, cap, () => true, new Set(), { maxUnique: 12 }); } catch (x) {}
    if (r && LD.legal(gm, r.deck, pool) && !seen.has(O.deckKey(r.deck))) { seen.add(O.deckKey(r.deck)); cands.push({ d: r.deck, from: `rank ${b.rank} repaired (BAL18: ` + r.moves.map(v => v.out + ' -' + v.copies + ' -> ' + Object.entries(v.to).map(([x, k]) => x + ' x' + k).join(' + ')).join('; ') + ')' }); } });
  for (let i = 0, tries = 0; i < opts.cands && tries < opts.cands * 20; tries++) { const q = opts.cands > 1 ? i / (opts.cands - 1) : 0.5, d = I.sampleDeck(gm, pool, S, q, rng); if (!d) continue; const k = O.deckKey(d); if (seen.has(k)) continue; seen.add(k); cands.push({ d, from: 'sampled q=' + q.toFixed(2) }); i++; }
  cands.forEach(c => { c.pred = Math.round(Object.entries(c.d).reduce((t, [id, k]) => t + k * S.of(id), 0) * 1000) / 1000; let w = 0, n = 0; c.perFight = {};
    fights.forEach(f => { const r = LL.simulateLed(gm, s.map.id, f.node, opts.games, { seed0: I.SEED0, deck: c.d }, leader); c.perFight[f.key] = Math.round(r.win * 1000) / 10; w += r.wins; n += r.n; });
    c.win = Math.round(w / Math.max(1, n) * 1000) / 10; });
  const out = { about: 'BAL18 stale-ladder rebuild for one map (tools/bal18/ladder_stale_2026_11_05.js build); `collect` fills the stale slots of docs/balance/ref/ref-ladder.json', tool: VERSION, fingerprint: fp, built: new Date().toISOString(),
    map: { id: s.id, num: G.mapNumberOf(s.id), name: s.map.name, side: !!s.map.sub }, pool: pool.length, leader, leaderForNow: LL.leaderFor(gm, s.map), strength: S.file,
    settings: { games: opts.games, cands: opts.cands, seed0: I.SEED0, apart: I.APART }, fights: fights.map(f => f.key), stale: s.bad,
    candidates: cands.map(c => ({ from: c.from, win: c.win, pred: c.pred, counts: c.d, perFight: c.perFight })), ms: Date.now() - t0 };
  fs.mkdirSync(OUTDIR, { recursive: true }); fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  return { id: s.id, stale: s.bad.length, cands: cands.length, s: Math.round((Date.now() - t0) / 1000) };
}
function build() {
  const opts = { games: +arg('--games', 6), cands: +arg('--cands', 24), force: argv.includes('--force') }, want = arg('--map', null), W = +arg('--workers', 1), sh = arg('--shard', null);
  if (W > 1 && !sh) { const base = argv.filter((a, i) => a !== '--workers' && argv[i - 1] !== '--workers'); let left = W;
    for (let i = 0; i < W; i++) { const c = cp.fork(__filename, base.concat(['--shard', `${i}/${W}`]), { stdio: 'inherit' }); c.on('exit', code => { if (code) console.log('worker', i, 'exit', code); if (--left === 0) console.log('build done'); }); } return; }
  const gm = game(); let list = stale(gm).filter(s => !want || want.split(',').includes(s.id));
  if (sh) { const [i, n] = sh.split('/').map(Number); list = list.filter((s, k) => k % n === i); }
  for (const s of list) console.log(JSON.stringify(buildMap(gm, s, opts)));
}
function collect() {
  const gm = game(), G = gm.G, set = readSet(), rows = [], missing = [];
  for (const s of stale(gm)) { const f = path.join(OUTDIR, s.id + '.json'); if (!fs.existsSync(f)) { missing.push(s.id); continue; } const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const L = set.ladder[s.id], badRanks = new Set(s.bad.map(b => b.rank)), kept = L.decks.filter(d => !badRanks.has(d.rank)), chosen = [], used = new Set(kept.map(d => O.deckKey(d.counts)));
    const titles = new Set(kept.map(d => d.title)), roman = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
    const pool = j.candidates.filter(c => LD.legal(gm, c.counts, s.pool));
    s.bad.slice().sort((a, b) => a.selectWin - b.selectWin).forEach(b => {
      const others = kept.map(d => d.counts).concat(chosen.map(c => c.counts)), free = pool.filter(c => !used.has(O.deckKey(c.counts)));
      const near = list => list.slice().sort((x, y) => Math.abs(x.win - b.selectWin) - Math.abs(y.win - b.selectWin) || x.pred - y.pred)[0];
      const pick = near(free.filter(c => others.every(o => I.apart(o, c.counts) >= I.APART))) || near(free);
      if (!pick) { rows.push({ map: s.id, rank: b.rank, problem: 'no candidate' }); return; }
      used.add(O.deckKey(pick.counts)); const nm = I.deckName(gm, pick.counts), base = `${(gm.D[nm.lead] || {}).name || nm.lead} ${nm.tactic.charAt(0).toUpperCase() + nm.tactic.slice(1)}`;
      let k = 1; while (titles.has(base + (roman[k - 1] || ' ' + k))) k++; const title = base + (roman[k - 1] || ' ' + k); titles.add(title);
      chosen.push({ oldRank: b.rank, name: Object.assign(nm, { n: k }), title, counts: pick.counts, parts: G.levelMixDeck(pick.counts, L.level), leader: L.leader, from: pick.from, selectWin: pick.win,
        bal18: `2026-11-05 (BAL18): replaces old rank ${b.rank} (${b.out.join(', ')} left the map-true pool after CONTENT10; old selectWin ${b.selectWin})` });
      rows.push({ map: s.id, oldRank: b.rank, out: b.out, oldWin: b.selectWin, newWin: pick.win, from: pick.from, title }); });
    const decks = kept.concat(chosen).sort((a, b) => a.selectWin - b.selectWin || (a.rank || 99) - (b.rank || 99));
    L.decks = decks.map((d, i) => { const x = Object.assign({ rank: i + 1 }, d); delete x.oldRank; x.rank = i + 1; return x; });
    rows.filter(r => r.map === s.id && r.oldRank).forEach(r => { r.newRank = L.decks.findIndex(d => d.title === r.title) + 1; }); }
  set.note = set.note.replace(/ BAL18 \(2026-11-05\).*$/, '') + ' BAL18 (2026-11-05): the decks that left their map-true pool after CONTENT10 rebuilt by tools/bal18/ladder_stale_2026_11_05.js with BAL13\'s candidates, measure and choice; every other deck kept as it was.';
  const rep = path.join(ROOT, 'docs', 'balance', 'bal18', 'ladder-stale-2026-11-05.json');
  fs.mkdirSync(path.dirname(rep), { recursive: true }); fs.writeFileSync(rep, JSON.stringify({ about: 'BAL18: the stale ladder decks and what replaced them', tool: VERSION, rows }, null, 1) + '\n');
  if (!argv.includes('--dry')) fs.writeFileSync(LD.SET, JSON.stringify(set, null, 1) + '\n');
  console.log(`${rows.length} slots${missing.length ? '; missing builds: ' + missing.join(', ') : ''}; ${rows.filter(r => r.problem).length} problems; mean |new - old| win ${(rows.filter(r => r.newWin != null).reduce((t, r) => t + Math.abs(r.newWin - r.oldWin), 0) / Math.max(1, rows.length)).toFixed(1)}`);
}
if (require.main === module) {
  if (CMD === 'list') { const gm = game(), s = stale(gm); s.forEach(x => console.log(x.id, x.bad.map(b => 'rank ' + b.rank + ' (' + b.out.join(', ') + ')').join('; '))); console.log(s.reduce((t, x) => t + x.bad.length, 0), 'stale decks on', s.length, 'maps'); }
  else if (CMD === 'build') build(); else if (CMD === 'collect') collect();
  else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 15).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { stale };
