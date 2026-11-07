#!/usr/bin/env node
// 2026-11-07 (package BAL24, owner BAL21-3, 11-07 08:54: "The ladder - as in optimised player decks from cards they could have won on the way
// here - should contain random cards from packs, rewards, etc. ... generate 100 players, make them each win packs separately - generating 100
// card lists. Then optimising a deck 100 times ... If 10 is enough, then do it 10 times = ok."): the simulated reference ladder (set id
// "ladder", docs/balance/ref/ref-ladder.json) for Maps 0-20 and their side maps. It replaces BAL13's sampled ladder; Maps 21-24 keep theirs.
//
//   node tools/bal24/ladder_sim_2026_11_07.js pools   [--maps 0-20] [--k 10]   K players' collections per map -> docs/balance/bal24/pools/<mapId>.json
//   node tools/bal24/ladder_sim_2026_11_07.js opt     [--maps 0-20] [--k 10] [--budget 900] [--shard i/n]   deckopt --mode prog, one run a player
//   node tools/bal24/ladder_sim_2026_11_07.js measure [--maps 0-20] [--games 8] [--shard i/n]   each player's deck against the map's road fights
//   node tools/bal24/ladder_sim_2026_11_07.js collect                          ranks the K decks weak -> strong, writes ref-ladder.json + the spread report
//   node tools/bal24/ladder_sim_2026_11_07.js status                           what is done
//
// THE PLAYERS (seeded: player k walks with seed "bal24-<k>"): tools/opt/ref5_prog.js walk(), the game's own economy read from arena_app.js:
// the starter deck and every Base card, the tutorial, every first clear on the faction-track road order before the map (its Maple Leaves and
// Dust, its reward cards, its first-clear pack card, an elite / boss's base-track card, its free pack), each main map's end-of-map and free
// pack, the faction track (Otters: tutorial and faction rewards, milestones, end-of-map faction packs, achievements' cards), the level track,
// the Trail Mix Trek's free lane, and the packs 1.0x of the Leaves buys at each map's arrival; every pack opened by the game's rollPackCards
// (its real contents, rarity odds, bonus copies), Math.random replaced by the player's generator. So each player's card list differs by the
// draws. A main map's players arrive at it (after its arrival purchases); a side map's arrive at the main map it opens on
// (mapUnlockNumberOf: e.g. the Old Bramble at Map 21). One collection per map, not per fight: the ladder serves a map's N-SK / N-WK fights
// and Admin's reference switch, which are keyed by map; a map's own first clears add 1-3 cards and would cost K optimiser runs a fight.
// THE LEADER: the strongest card that may lead in that player's collection (ref5_prog chooseLeader, at the map's reference level), else the
// Wandering Traveller; it is taken out of the deck's pool (the game keeps a leader out of its deck) and deckopt plays it (--leader).
// THE LEVELS: every card at the Map reference's level (referenceDeckFor(...).level, rounded; never under the card's own level nor over its
// cap; Base cards Lv 4 at most), as the BAL13 ladder and the Map reference play.
// THE DECK: tools/opt/deckopt.js --mode prog --seed-ref (the collection's cards, each up to min(its rarity's copy cap, the copies owned), 20
// cards, the gauntlet = the map's fight decks in fair mirrors under each fight's field + the road fights as the game builds them, with the leader).
// THE RANK: each deck against each of the map's road-curve fights as the game builds them, with its leader (simulateReferenceFight, the
// ladder seeds 5300 + 37g, --games a fight); rank 1 = the weakest, rank K = the strongest (selectWin).
// THE SPREAD (is K enough?): per map, the SD of the K players' road win rates and the standard error of the K-deck mean (SD / sqrt(K)); the
// ladder is used as a mean over its decks (pro_ease, the summary), so K is enough when that standard error is small next to the 15-30% band.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const R5 = require('../opt/ref5_prog.js'), O = require('../opt/deckopt.js');
const DATE = '2026-11-07', VERSION = '1.0.0 (2026-11-07, BAL24)';
const POOLDIR = path.join(ROOT, 'docs', 'balance', 'bal24', 'pools'), SIMDIR = path.join(ROOT, 'docs', 'balance', 'bal24', 'sim');
const OPTDIR = process.env.BAL24_OPT_DIR || path.join(os.homedir(), 'bench-cache-bal24', 'opt'), CKPT = process.env.BAL24_CKPT_DIR || path.join(os.homedir(), 'bench-cache-bal24', 'ckpt');
const SET = path.join(ROOT, 'docs', 'balance', 'ref', 'ref-ladder.json'), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const SEED0 = 5300, MAX_MAP = 20;
const argv = process.argv.slice(2), CMD = argv[0];
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const r1 = x => Math.round(x * 10) / 10;
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(/^\d+$/.test(p) ? +p : p); }); return out; }
const K = () => +arg('--k', 10);
const playerSeed = k => 'bal24-' + k;

let _g = null; const game = () => _g || (_g = O.loadGame(ROOT));
// the PRO entries of Maps 0-20 (main and side), the ladder's maps
function entries(spec) {
  const pro = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), want = mapRange(spec);
  return Object.keys(pro.maps).map(id => Object.assign({ id }, pro.maps[id])).filter(e => e.map <= MAX_MAP && (!want || want.has(e.map) || want.has(e.id)));
}
function shardOf(list) { const sh = arg('--shard', null); if (!sh) return list; const [i, n] = sh.split('/').map(Number); return list.filter((e, k) => k % n === i); }
// the main-map number a player stands on when the map opens (its own number; a side map: the map it opens on)
function arrivalOf(gm, map) { if (!map.sub) return gm.G.mapNumberOf(map.id); let n = null; try { n = gm.G.mapUnlockNumberOf(map.id); } catch (e) {} return n != null ? n : gm.G.mapNumberOf(map.id); }
function refLevelOf(gm, map) { const f0 = (map.nodes || []).find(n => n.deck); try { return gm.G.referenceDeckFor(map.id, f0).level || 0; } catch (e) { return 0; } }
function cardLevel(g5, id, level) { const d = g5.D[id], b = g5.G.cardBaseLevel(d); let cap = g5.P.cardMaxLevel(d); if (g5.P.isBaseLevelCapped(d)) cap = Math.min(cap, g5.P.BASE_CARD_LEVEL_CAP); return Math.max(b, Math.min(Math.round(level), cap)); }
const poolFile = id => path.join(POOLDIR, id + '.json');
const simFile = id => path.join(SIMDIR, id + '.json');
const optTag = k => 'bal24-p' + k;
function optFile(gm, map, k) { const no = gm.G.mapNumberOf(map.id); return path.join(OPTDIR, `deckopt-map${String(no).padStart(2, '0')}-${map.id}-${optTag(k)}.json`); }

// ---------------------------------------------------------------- pools
function cmdPools() {
  const gm = game(), g5 = R5.game(), list = entries(arg('--maps', null)), k = K(), byArrival = {};
  list.forEach(e => { const map = gm.G.CONQUEST_MAPS.find(m => m.id === e.id); (byArrival[arrivalOf(gm, map)] = byArrival[arrivalOf(gm, map)] || []).push(map); });
  fs.mkdirSync(POOLDIR, { recursive: true });
  for (const a of Object.keys(byArrival).map(Number).sort((x, y) => x - y)) {
    const maps = byArrival[a], files = {};
    maps.forEach(map => { files[map.id] = { about: 'Package BAL24: the collections of ' + k + ' simulated players arriving at ' + map.name + ' (tools/bal24/ladder_sim_2026_11_07.js pools; read by tools/opt/deckopt.js --mode prog --pool-file). copies: null = unlimited (Base / starter). levels: absolute card levels where not the card\'s own. No "id": tools/opt/ref_decks.js skips it.',
      tool: 'tools/bal24/ladder_sim_2026_11_07.js ' + VERSION, mapId: map.id, arrival: a, level: refLevelOf(gm, map), maps: { [gm.G.mapNumberOf(map.id)]: { mapId: map.id, name: map.name, seeds: {} } } }; });
    for (let p = 1; p <= k; p++) {
      const st = R5.walk(playerSeed(p), a, () => null), owned = Object.keys(st.owned).sort();
      maps.forEach(map => { const f = files[map.id], level = f.level, ent = f.maps[gm.G.mapNumberOf(map.id)];
        const pool = owned.filter(id => O.deckable(gm, id) && g5.D[id]), leader = R5.chooseLeader(g5, pool, a, {}) /* the strongest card that may lead in the collection */;
        const deckPool = pool.filter(id => id !== leader), copies = {}, levels = {};
        deckPool.forEach(id => { copies[id] = st.unlimited.has(id) ? null : st.owned[id]; const L = cardLevel(g5, id, level); if (L !== g5.G.cardBaseLevel(g5.D[id])) levels[id] = L; });
        ent.seeds[p] = { pool: deckPool, copies, levels, leader, prev: null, size: deckPool.length, bought: st.arrival.bought, factionCards: deckPool.filter(id => { const d = g5.D[id]; return d.source && d.source.kind === 'pack' && d.source.tier === 11; }).length }; });
      process.stdout.write(`arrival ${a} player ${p}: ${owned.length} cards\n`);
    }
    maps.forEach(map => fs.writeFileSync(poolFile(map.id), JSON.stringify(files[map.id]) + '\n'));
  }
  console.log('pools -> ' + path.relative(ROOT, POOLDIR));
}

// ---------------------------------------------------------------- the optimiser runs
function cmdOpt() {
  const gm = game(), k = K(), budget = arg('--budget', '900'), list = entries(arg('--maps', null)), jobs = [];
  list.forEach(e => { for (let p = 1; p <= k; p++) jobs.push({ id: e.id, p }); });
  const mine = shardOf(jobs); if (argv.includes('--reverse')) mine.reverse(); // a helper process from the far end (skips what is done)
  fs.mkdirSync(OPTDIR, { recursive: true });
  for (const j of mine) {
    const map = gm.G.CONQUEST_MAPS.find(m => m.id === j.id), out = optFile(gm, map, j.p);
    if (fs.existsSync(out)) continue;
    const pf = JSON.parse(fs.readFileSync(poolFile(j.id), 'utf8')), seed = pf.maps[gm.G.mapNumberOf(map.id)].seeds[j.p], t = Date.now();
    const args = [path.join(ROOT, 'tools/opt/deckopt.js'), '--map', map.id, '--mode', 'prog', '--prog-seed', String(j.p), '--pool-file', path.relative(ROOT, poolFile(j.id)), '--level', 'ref', '--budget', budget, '--final-games', arg('--final-games', '4'),
      '--ladder', 'none', '--distinct-max', '1', '--seed-ref', '--pop', '8', '--children', '16', '--g0', '2', '--gmax', '8', '--restarts', '1', '--workers', arg('--workers', '1'), '--tag', optTag(j.p), '--seed', 'bal24-' + j.id + '-p' + j.p,
      '--quiet', '--no-summary', '--out', OPTDIR, '--ckpt-dir', CKPT].concat(seed.leader && seed.leader !== 'wandering-traveller' ? ['--leader', seed.leader] : []);
    cp.execFileSync('node', args, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    console.log(`${j.id} player ${j.p}: ${Math.round((Date.now() - t) / 1000)} s`);
  }
  console.log('opt shard done');
}

// ---------------------------------------------------------------- the measure (each player's deck on the map's road fights)
function roadFights(gm, map) { return require('../bal13/ladder_2026_11_02.js').roadFights(gm, map); }
function cmdMeasure() {
  const gm = game(), G = gm.G, k = K(), games = +arg('--games', 8), list = shardOf(entries(arg('--maps', null))); fs.mkdirSync(SIMDIR, { recursive: true });
  for (const e of list) {
    const map = G.CONQUEST_MAPS.find(m => m.id === e.id), pf = JSON.parse(fs.readFileSync(poolFile(e.id), 'utf8')), ent = pf.maps[G.mapNumberOf(map.id)], fights = roadFights(gm, map), t = Date.now();
    const f = simFile(e.id), prev = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null, players = [];
    let missing = 0;
    for (let p = 1; p <= k; p++) {
      const of = optFile(gm, map, p); if (!fs.existsSync(of)) { missing++; continue; }
      const d = JSON.parse(fs.readFileSync(of, 'utf8')), best = (d.optima || [])[0] || d[d.optimum].best, counts = best.deck, seed = ent.seeds[p];
      const bad = Object.keys(counts).filter(id => !seed.pool.includes(id) || (seed.copies[id] != null && counts[id] > seed.copies[id])); if (bad.length) throw new Error(`${e.id} player ${p}: the optimum breaks the collection: ${bad.join(', ')}`);
      const parts = Object.keys(counts).sort().map(id => [id, counts[id], seed.levels[id] != null ? seed.levels[id] : G.cardBaseLevel(gm.D[id])]);
      const old = prev && (prev.players || []).find(x => x.player === p && O.deckKey(x.counts) === O.deckKey(counts) && x.games === games);
      let perFight = old ? old.perFight : null, win = old ? old.win : null;
      if (!old) { let w = 0, n = 0; perFight = {};
        const lead = seed.leader && seed.leader !== 'wandering-traveller' ? { leader: seed.leader } : { leader: 'wandering-traveller' };
        fights.forEach(fx => { const r = G.simulateReferenceFight(map.id, fx.node, games, Object.assign({ seed0: SEED0, deck: counts, level: Math.round(pf.level || 0) }, lead)); perFight[fx.key] = r1(r.win * 100); w += r.wins; n += r.n; });
        win = r1(w / Math.max(1, n) * 100); }
      players.push({ player: p, seed: playerSeed(p), counts, parts, leader: seed.leader || 'wandering-traveller', collection: seed.size, factionCards: seed.factionCards, optScore: best.score, optBudget: (d.settings || {}).budget, optFile: path.basename(of), games, perFight, win });
    }
    const out = { about: 'Package BAL24: each simulated player\'s optimised deck at this map and its win rate against the map\'s road fights (tools/bal24/ladder_sim_2026_11_07.js measure; ladder seeds ' + SEED0 + ' + 37g, ' + games + ' games a fight, with the player\'s leader).',
      tool: 'tools/bal24/ladder_sim_2026_11_07.js ' + VERSION, map: { id: map.id, num: G.mapNumberOf(map.id), name: map.name, side: !!map.sub, arrival: pf.arrival }, level: pf.level, fights: fights.map(x => x.key), players, missing, measured: new Date().toISOString() };
    fs.writeFileSync(f, JSON.stringify(out, null, 1) + '\n');
    console.log(`${e.id}: ${players.length} decks, road ${players.map(x => x.win).join(' ')} (${Math.round((Date.now() - t) / 1000)} s)`);
  }
}

// ---------------------------------------------------------------- collect: the set file and the spread
const sd = a => { if (a.length < 2) return 0; const m = a.reduce((t, x) => t + x, 0) / a.length; return Math.sqrt(a.reduce((t, x) => t + (x - m) * (x - m), 0) / (a.length - 1)); };
function cmdCollect() {
  const gm = game(), G = gm.G, LD = require('../bal13/ladder_2026_11_02.js'), set = JSON.parse(fs.readFileSync(SET, 'utf8')), spread = [], missing = [];
  const roman = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X', ' XI', ' XII'];
  const deckName = LD.deckName;
  for (const e of entries(null)) {
    const f = simFile(e.id); if (!fs.existsSync(f)) { missing.push(e.id); continue; } const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.players.length < K()) { missing.push(e.id + ' (' + j.players.length + ' decks)'); continue; }
    const ps = j.players.slice().sort((a, b) => a.win - b.win || a.optScore - b.optScore || a.player - b.player), seen = {};
    set.ladder[e.id] = { map: j.map.num, name: j.map.name, side: j.map.side, arrival: j.map.arrival, pool: Math.round(ps.reduce((t, x) => t + x.collection, 0) / ps.length), level: j.level, fights: j.fights, leader: ps[ps.length - 1].leader, source: 'bal24-sim',
      decks: ps.map((x, i) => { const nm = deckName(gm, x.counts), kk = nm.lead + '|' + nm.tactic; seen[kk] = (seen[kk] || 0) + 1;
        const en = `${(gm.D[nm.lead] || {}).name || nm.lead} ${nm.tactic.charAt(0).toUpperCase() + nm.tactic.slice(1)}${roman[seen[kk] - 1] || ' ' + seen[kk]}`;
        return { rank: i + 1, name: Object.assign(nm, { n: seen[kk] }), title: en, counts: x.counts, parts: x.parts, leader: x.leader, from: 'simulated player ' + x.player + ' (' + x.seed + ', ' + x.collection + ' cards)', player: x.player, selectWin: x.win, perFight: x.perFight }; }) };
    const w = ps.map(x => x.win), s = sd(w);
    spread.push({ id: e.id, map: j.map.num, side: j.map.side, name: j.map.name, k: w.length, min: Math.min(...w), max: Math.max(...w), mean: r1(w.reduce((t, x) => t + x, 0) / w.length), sd: r1(s), se: r1(s / Math.sqrt(w.length)), games: ps[0].games, fights: j.fights.length,
      seGame: r1(Math.sqrt(w.reduce((t, x) => t + (x / 100) * (1 - x / 100), 0) / w.length / (ps[0].games * j.fights.length)) * 100) /* one deck's measurement noise */ });
  }
  if (missing.length) { console.log('not collected (missing): ' + missing.join(', ')); if (!argv.includes('--partial')) process.exit(1); }
  set.built = DATE; set.tool = 'tools/bal24/ladder_sim_2026_11_07.js ' + VERSION;
  set.note = 'Package BAL24 (owner BAL21-3, 2026-11-07 08:54: "optimised player decks from cards they could have won on the way here ... random cards from packs, rewards"): Maps 0-20 and their side maps: ' + K() + ' simulated players per map (seeds bal24-1 .. bal24-' + K() + '), each walking the road with the game\'s own rewards and pack odds (tools/opt/ref5_prog.js walk: starter, tutorial, first clears, faction track and achievements, level track, Trail, end-of-map / free / bought packs), each player\'s best deck from that collection by tools/opt/deckopt.js --mode prog, with the strongest leader the player holds, at the Map reference\'s level. Ranked weak (1) to strong by the road win rate (ladder seeds 5300 + 37g). Source: tools/bal24/ladder_sim_2026_11_07.js. Maps 21-24 (m21-m24) keep BAL13 / BAL17\'s sampled ladder. ' + (set.note || '').replace(/^Package BAL24.*?BAL13 \/ BAL17's sampled ladder\. /, '');
  set.rule = { source: 'simulated players (BAL24) for Maps 0-20; BAL13 sampling for Maps 21-24', players: K(), deck: 'tools/opt/deckopt.js --mode prog --seed-ref', rank: 'road win rate, ladder seeds 5300 + 37g', bal13: set.rule && set.rule.bal13 ? set.rule.bal13 : set.rule };
  fs.writeFileSync(SET, JSON.stringify(set, null, 1) + '\n');
  const sum = { about: 'Package BAL24: the spread of the simulated ladder per map (K players): the road win rates of the K decks, their SD and the standard error of the K-deck mean.', tool: set.tool, k: K(), maps: spread };
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal24', 'ladder-spread-' + DATE + '.json'), JSON.stringify(sum, null, 1) + '\n');
  const L = ['# BAL24 simulated ladder: spread at K = ' + K() + ' (' + DATE + ')', '', 'Each row: the road win rates (ladder seeds 5300 + 37g) of the ' + K() + ' simulated players\' decks at that map. SE = SD / sqrt(K), the error of the ladder\'s mean. Made by `node tools/bal24/ladder_sim_2026_11_07.js collect`.', '',
    '| Map | Name | min | mean | max | SD | SE of mean | one deck\'s noise |', '|---|---|---|---|---|---|---|---|'];
  spread.forEach(s => L.push(`| ${s.id} (${s.map}${s.side ? ' side' : ''}) | ${s.name} | ${s.min} | ${s.mean} | ${s.max} | ${s.sd} | ${s.se} | ${s.seGame} |`));
  const sds = spread.map(s => s.sd), ses = spread.map(s => s.se);
  L.push('', `Median SD ${median(sds)} points, median SE of the mean ${median(ses)}, largest SE ${Math.max(...ses)}.`);
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal24', 'ladder-spread-' + DATE + '.md'), L.join('\n') + '\n');
  console.log(`-> ${path.relative(ROOT, SET)}: ${spread.length} maps simulated; median SD ${median(sds)}, median SE ${median(ses)}, max SE ${Math.max(...ses)}`);
}
function median(a) { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : null; }
function cmdStatus() {
  const gm = game(), k = K(); let need = 0, done = 0;
  entries(arg('--maps', null)).forEach(e => { const map = gm.G.CONQUEST_MAPS.find(m => m.id === e.id); let d = 0; for (let p = 1; p <= k; p++) if (fs.existsSync(optFile(gm, map, p))) d++; need += k; done += d;
    console.log(`${e.id.padEnd(4)} pools ${fs.existsSync(poolFile(e.id)) ? 'y' : '-'} opt ${d}/${k} measured ${fs.existsSync(simFile(e.id)) ? JSON.parse(fs.readFileSync(simFile(e.id), 'utf8')).players.length : '-'}`); });
  console.log(`opt ${done}/${need}`);
}
if (require.main === module) {
  if (CMD === 'pools') cmdPools(); else if (CMD === 'opt') cmdOpt(); else if (CMD === 'measure') cmdMeasure(); else if (CMD === 'collect') cmdCollect(); else if (CMD === 'status') cmdStatus();
  else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 32).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { entries, arrivalOf, playerSeed, VERSION, SEED0 };
