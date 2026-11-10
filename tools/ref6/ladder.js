#!/usr/bin/env node
// 2026-11-11 (package REF6, owner 00:16: "do the 100 reference player decks thing per map, and also let me know the variance in strength of the
// different decks"): BAL24's simulated reference players (tools/bal24/ladder_sim_2026_11_07.js), 100 a map instead of 10, for Maps 0-20 and
// their side maps (the 36 PRO entries).
//
//   node tools/ref6/ladder.js [--players 100] [--maps 0-20] [--workers 2]   -> docs/balance/ref6/ladder-100.json
//   node tools/ref6/ladder.js check                                          the file's shape and every deck's legality (exit 1 on a problem)
//
// THE PLAYERS (as BAL24): player k walks the road with seed "ref6-<k>" (tools/opt/ref5_prog.js walk: the game's own rewards, packs opened by
// rollPackCards with the player's generator). One walk to the last arrival gives every map's collection (walk's arrive hook); the collections
// are cached per player in ~/bench-cache-ref6/pools (keyed by canonical/cards.json), so a rebuild does not walk again. A main map's players
// stand at its arrival, a side map's at the main map it opens on (mapUnlockNumberOf).
// LEGAL: cards the player holds at that map (BAL24's pool rule), no faction card (deck or leader; PRO3's rule, which BAL24 did not apply), each
// card within its rarity's copy cap and the copies the player owns (Base / starter unlimited); 20 cards. The PRO rarity cap (the map's rarest
// fight) is not applied: it would take away cards every player holds from Map 0 (2 Otter Centurions, rare, at Map 3 whose cap is Uncommon).
// THE LEADER (as BAL24): the strongest card that may lead among the legal cards the player holds (ref5_prog chooseLeader), else the Wandering
// Traveller; kept out of the deck.
// THE DECK: an optimiser run per deck (BAL24: deckopt --mode prog, about 1,000 games, 35-85 s a deck) would be 3,600 runs, about 60 core-hours,
// more than two days on this 2-core machine. So each deck is built with no games from what the map's optimised decks pick: the library = the
// map's PRO and BPRO decks, its 10 BAL24 decks (optimiser runs on simulated collections), the progression and pool reference decks of its map
// number (a side map: of the map it opens on) and the Map reference deck. A card's library value v = its mean copies over the library decks; the
// player's deck takes its legal cards in order of v (then the game's card score, skirmishCardScore), each up to the copies it may play, to 20.
// Checked with no games on BAL24's own 360 collections (each deck left out of its library): this rule picks 7.6 of the optimiser's 20 copies on
// average; two BAL24 optimiser decks of one map share 6.1, and "keep the most copies of one library deck" picked 5.2 (tried and dropped).
// Each deck plays at the Map reference's level (as BAL24). Its measured strength comes from tools/ref6/measure.js (--strength).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const VERSION = '1.0.0 (2026-11-11, REF6)';
const OUT = path.join(ROOT, 'docs', 'balance', 'ref6', 'ladder-100.json');
const CACHE = process.env.REF6_CACHE || path.join(os.homedir(), 'bench-cache-ref6');
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const B24 = () => require('../bal24/ladder_sim_2026_11_07.js');
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const tot = d => Object.values(d).reduce((t, k) => t + k, 0);

let _gm = null, _g5 = null;
const O = () => require('../opt/deckopt.js'), R5 = () => require('../opt/ref5_prog.js');
const game = () => _gm || (_gm = O().loadGame(ROOT));
const game5 = () => _g5 || (_g5 = R5().game());
function entries(spec) { return B24().entries(spec); }
const mapOf = (gm, id) => gm.G.CONQUEST_MAPS.find(m => m.id === id);
function refLevelOf(gm, map) { const f0 = (map.nodes || []).find(n => n.deck); try { return gm.G.referenceDeckFor(map.id, f0).level || 0; } catch (e) { return 0; } }

// ---------------------------------------------------------------- the collections (one walk a player, cached)
const cardsKey = () => sha(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json')));
function collections(p, arrivals) {
  const f = path.join(CACHE, 'pools', `ref6-${p}.json`), key = sha(VERSION + '|' + cardsKey() + '|' + arrivals.join(','));
  if (fs.existsSync(f)) { const c = JSON.parse(fs.readFileSync(f, 'utf8')); if (c.key === key) return c; }
  const want = new Set(arrivals), out = { key, seed: 'ref6-' + p, unlimited: null, at: {} }, last = Math.max(...arrivals);
  const st = R5().walk('ref6-' + p, last, () => null, { arrive: (i, s) => { if (want.has(i)) out.at[i] = Object.assign({}, s.owned); } });
  out.unlimited = [...st.unlimited].sort();
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(out));
  return out;
}

// ---------------------------------------------------------------- the library of a map (its known optimised decks)
function library(gm, map, e) {
  const J = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (x) { return null; } };
  const lad = J('docs/balance/ref/ref-ladder.json'), pro = J('canonical/pro-skirmishes.json'), prog = J('docs/balance/ref/ref5-prog.json'), pool = J('docs/balance/ref/ref-pool.json');
  const no = map.sub ? Math.min(B24().arrivalOf(gm, map), 24) : gm.G.mapNumberOf(map.id), out = [], add = (src, deck) => { if (deck && tot(deck) >= 10) out.push({ src, deck }); };
  const pe = (pro && pro.maps[map.id]) || {}; (pe.pro || []).concat(pe.bpro || []).forEach(d => add(d.id, d.deck));
  ((lad && lad.ladder[map.id] && lad.ladder[map.id].decks) || []).forEach(d => add('bal24 ' + (d.from || d.rank).toString().replace(/^simulated player (\d+).*/, 'p$1'), d.counts));
  ((prog && prog.decks && prog.decks[no]) || []).forEach(d => add('prog-' + d.seed, d.counts));
  if (pool && pool.decks && pool.decks[no]) add('ref-pool', pool.decks[no]);
  try { add('map reference', gm.G.referenceDeckFor(map.id, map.nodes.find(n => n.deck)).deck); } catch (x) { /* none */ }
  const v = {}; out.forEach(L => Object.keys(L.deck).forEach(id => { v[id] = (v[id] || 0) + L.deck[id] / out.length; }));
  return { decks: out, v };
}

// ---------------------------------------------------------------- one player's deck at one map
function legalFilter(gm) { return { ok: id => O().deckable(gm, id) && !O().isFactionCard(gm, id) }; }
function buildDeck(gm, g5, lib, legal, coll, unlimited, arrival) {
  const owned = Object.keys(coll).filter(id => g5.D[id] && legal.ok(id)).sort();
  const leader = R5().chooseLeader(g5, owned, arrival, {});
  const pool = owned.filter(id => id !== leader), copies = {};
  pool.forEach(id => { copies[id] = unlimited.has(id) ? null : coll[id]; });
  gm.copyCap = {}; pool.forEach(id => { if (copies[id] != null) gm.copyCap[id] = copies[id]; }); // deckopt's canAdd holds a card to the copies owned
  const inPool = new Set(pool), canAdd = (d, id) => inPool.has(id) && O().canAdd(gm, d, id), v = id => lib.v[id] || 0;
  const score = id => gm.G.skirmishCardScore(gm.D[id]);
  const order = pool.slice().sort((a, b) => v(b) - v(a) || score(b) - score(a) || (a < b ? -1 : 1)), d = {};
  for (const id of order) { while (tot(d) < 20 && canAdd(d, id)) d[id] = (d[id] || 0) + 1; if (tot(d) >= 20) break; }
  if (tot(d) !== 20) throw new Error('no legal 20-card deck');
  const counts = {}; Object.keys(d).sort().forEach(id => { counts[id] = d[id]; });
  const sv = Object.keys(d).reduce((t, id) => t + d[id] * v(id), 0);
  return { counts, leader, score: Math.round(sv * 100) / 100, collection: pool.length }; // score: the deck's summed library value
}

// ---------------------------------------------------------------- build (sharded over child processes by player)
function cmdBuild() {
  const players = +arg('--players', 100), workers = +arg('--workers', Math.max(1, os.cpus().length)), list = entries(arg('--maps', null));
  const gm = game(), arrivals = [...new Set(list.map(e => B24().arrivalOf(gm, mapOf(gm, e.id))))].sort((a, b) => a - b);
  if (argv.includes('--worker')) { // a shard: walk its players (cached), print nothing but progress
    const [i, n] = arg('--worker').split('/').map(Number), t = Date.now();
    for (let p = 1 + i; p <= players; p += n) { collections(p, arrivals); if (p % 10 === 1 + i % 10 || p > players - n) process.stdout.write(`walked ref6-${p} (${Math.round((Date.now() - t) / 1000)} s)\n`); }
    return;
  }
  if (workers > 1) { const kids = []; for (let i = 0; i < workers; i++) kids.push(cp.spawn('node', [__filename, '--worker', `${i}/${workers}`, '--players', String(players)].concat(arg('--maps') ? ['--maps', arg('--maps')] : []), { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] }));
    let left = kids.length; kids.forEach(k => k.on('exit', c => { if (c) { console.error('a walk shard failed'); process.exit(1); } if (--left === 0) assemble(); })); return; }
  assemble();
  function assemble() {
    const g5 = game5(), colls = []; for (let p = 1; p <= players; p++) colls.push(collections(p, arrivals));
    const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null, maps = {};
    for (const e of list) {
      const map = mapOf(gm, e.id), arrival = B24().arrivalOf(gm, map), lib = library(gm, map, e), legal = legalFilter(gm), level = refLevelOf(gm, map);
      const decks = colls.map((c, k) => Object.assign({ p: k + 1 }, buildDeck(gm, g5, lib, legal, c.at[arrival], new Set(c.unlimited), arrival)));
      maps[e.id] = { map: gm.G.mapNumberOf(map.id), name: map.name, side: !!map.sub, arrival, level: Math.round(level), library: lib.decks.map(L => L.src), decks };
      const n = new Set(decks.map(d => JSON.stringify(d.counts) + d.leader)).size;
      console.log(`${e.id.padEnd(4)} Map ${String(maps[e.id].map).padStart(2)}${map.sub ? ' side' : '     '} arrival ${String(arrival).padStart(2)}: ${decks.length} decks, ${n} different, library ${lib.decks.length}`);
    }
    const out = { about: 'Package REF6: 100 simulated players per map (seeds ref6-1 .. ref6-' + players + '), each with its own collection from the game\'s rewards and pack draws and a legal deck built from what the map\'s optimised decks pick (tools/ref6/ladder.js header). counts: card -> copies; leader kept out of the deck; level: every card at the Map reference\'s level; strength: the deck\'s mean win rate over the map\'s road fights from the measure named in strengthTag (tools/ref6/measure.js --strength).',
      tool: 'tools/ref6/ladder.js ' + VERSION, built: new Date().toISOString().slice(0, 10), players, seeds: 'ref6-1 .. ref6-' + players,
      rule: { legal: 'cards the player holds at the map; no faction card; copies within the rarity\'s copy cap and the copies owned; 20 cards (no map rarity cap)', leader: 'strongest legal card that may lead (ref5_prog chooseLeader), else wandering-traveller', deck: 'the player\'s legal cards by library value (mean copies over the map\'s optimised decks), see the tool header' },
      maps: Object.assign({}, prev && prev.maps, maps) };
    // keep a measured strength when the deck is unchanged
    if (prev && prev.maps) Object.keys(maps).forEach(id => { const pm = prev.maps[id]; if (!pm) return; maps[id].strengthTag = pm.strengthTag;
      maps[id].decks.forEach((d, i) => { const o = pm.decks[i]; if (o && o.strength != null && JSON.stringify(o.counts) === JSON.stringify(d.counts) && o.leader === d.leader) d.strength = o.strength; }); });
    write(out); console.log('-> ' + path.relative(ROOT, OUT));
  }
}
// one map a line, so a rebuild's diff reads per map
function write(out) {
  const head = Object.assign({}, out); delete head.maps;
  const s = JSON.stringify(head).slice(0, -1) + ',"maps":{\n' + Object.keys(out.maps).map(id => JSON.stringify(id) + ':' + JSON.stringify(out.maps[id])).join(',\n') + '\n}}\n';
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, s);
}
const load = () => JSON.parse(fs.readFileSync(OUT, 'utf8'));

// ---------------------------------------------------------------- check: shape and legality
function problems(gm, L) {
  const out = [], list = entries(null);
  if (Object.keys(L.maps || {}).length !== list.length) out.push(`maps: ${Object.keys(L.maps || {}).length}, want ${list.length}`);
  for (const e of list) {
    const M = L.maps[e.id]; if (!M) { out.push(e.id + ': missing'); continue; }
    const legal = legalFilter(gm);
    if (M.decks.length !== L.players) out.push(`${e.id}: ${M.decks.length} decks, want ${L.players}`);
    M.decks.forEach((d, i) => { const w = `${e.id} deck ${i + 1}`;
      if (d.p !== i + 1) out.push(w + ': player number');
      if (tot(d.counts) !== 20) out.push(w + ': ' + tot(d.counts) + ' cards');
      Object.keys(d.counts).forEach(id => { if (!gm.D[id]) out.push(w + ': unknown card ' + id); else { if (!legal.ok(id)) out.push(w + ': ' + id + (O().isFactionCard(gm, id) ? ' is a faction card' : ' is not deckable'));
        if (d.counts[id] > gm.G.maxCopiesForRarity(gm.D[id].rarity)) out.push(w + ': ' + id + ' over its copy cap'); } });
      if (d.counts[d.leader]) out.push(w + ': the leader is in the deck');
      const cf = path.join(CACHE, 'pools', `ref6-${d.p}.json`); // the player's collection, when this machine has it cached
      if (fs.existsSync(cf)) { const c = JSON.parse(fs.readFileSync(cf, 'utf8')), own = c.at && c.at[M.arrival], unl = new Set(c.unlimited || []);
        if (own) Object.keys(d.counts).forEach(id => { if (!own[id] || (!unl.has(id) && d.counts[id] > own[id])) out.push(`${w}: ${id} x${d.counts[id]}, player ${d.p} holds ${own[id] || 0}`); }); }
      if (d.leader !== 'wandering-traveller' && (!gm.D[d.leader] || !legal.ok(d.leader))) out.push(w + ': leader ' + d.leader + ' not legal'); });
  }
  return out;
}
function cmdCheck() { const p = problems(game(), load()); p.slice(0, 40).forEach(x => console.log('  ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ladder-100.json: ok'); process.exit(p.length ? 1 : 0); }

if (require.main === module) { if (argv[0] === 'check') cmdCheck(); else cmdBuild(); }
module.exports = { entries, load, write, problems, legalFilter, mapOf, refLevelOf, OUT, CACHE, VERSION, sha, tot };
