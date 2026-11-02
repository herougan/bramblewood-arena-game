#!/usr/bin/env node
// 2026-11-02 (package BAL13, owner 19:56: "Make at least 10 reference decks"): the reference ladder, set id "ladder". For every map with a PRO
// entry (canonical/pro-skirmishes.json: Maps 0-20 and their side maps), 10 decks a player could hold there, spread from weak to strong.
//
//   node tools/bal13/ladder_2026_11_02.js build [--maps 0-20 | --map mf,mq] [--workers 2] [--cands 24] [--games 6] [--force]
//        per map: candidates, each measured against the map's road fights -> docs/balance/bal13/ladder/<mapId>.json (resumable: a map whose
//        file has the same inputs is skipped)
//   node tools/bal13/ladder_2026_11_02.js collect     the 10 chosen decks of every map -> docs/balance/ref/ref-ladder.json (the set file)
//   node tools/bal13/ladder_2026_11_02.js check       every ladder deck: 20 cards, the copy caps and top-rank caps, every card in the map's pool
//
// THE POOL (docs/evaluation-protocol.md section 2, as the PRO decks are built): deckopt's map-true pool (tools/opt/deckopt.js poolsFor, mode
// map-true): the map's own cards (its list, SPECIAL and fight decks) plus what a player holds by then, every card within the map's rarity cap
// (roadRarityCap over its fights) and first obtainable by this map; no faction card. Left out as well: enemy-only cards (no source, not Base or
// starter: no player can own one). THE DECK RULE (a player's): 20 cards, at most 12 different cards, each at most its rarity's copy cap (maxCopiesForRarity), the
// top-rank caps (bramblewood-budget.js deckRankBlock). THE LEADER (owner 21:37): every deck of a map plays the leader a player holds there
// (lib_leader leaderFor: the strongest card that may lead in the map-true pool, else the Wandering Traveller), summoned by your seat's AI. Each deck plays at the Map reference's level
// (referencePlayerLevel), as the Map reference and the Pool reference do.
// THE CANDIDATES (seeded by the map id): the Map reference's own road deck, the Pool reference's deck (ref-pool), the five Reference (Random)
// decks (prog) and the map's PRO decks, each when every card is in the pool; then --cands decks sampled across the card-strength scale (a
// card's per-copy contribution: the map's own bench-contrib file when there is one, else the global one, docs/balance/bench-contrib-global-
// 2026-10-30-final.json, else its stat score), each a draw of 5-8 cards around a strength quantile q (q = 0 .. 1 evenly) with random copies.
// THE MEASURE: every candidate against each of the map's road-curve fights as the game builds them (simulateReferenceFight, the road measure's
// fight, with your leader: tools/bal13/lib_leader_2026_11_02.js, owner 21:37), --games a fight on the ladder seeds (5300 + 37g; the road measure uses 9100, the retune 7300). THE CHOICE: candidates sorted by mean
// win; 10 targets evenly spaced between the weakest and the strongest; for each, the unused candidate nearest it that is at least 4 copies from
// every deck already chosen. Rank 1 = the weakest, rank 10 = the strongest (by the selection measure; tools/bal13/summary_2026_11_02.js re-measures
// rank 1 and rank 10 on the road measure's seeds).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('../opt/deckopt.js'), RP = require('../opt/ref_pool.js'), LL = require('./lib_leader_2026_11_02.js'); // owner 21:37: with a leader
const DATE = '2026-11-02', VERSION = '1.1.0 (2026-11-02, BAL13: with leaders)';
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal13', 'ladder'), SET = path.join(ROOT, 'docs', 'balance', 'ref', 'ref-ladder.json');
const PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const RANKS = 10, MAX_UNIQUE = 12, MAX_COPIES = 99, SIZE = 20, APART = 4, SEED0 = 5300;
const argv = process.argv.slice(2), CMD = argv[0];
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const tot = d => Object.values(d).reduce((t, k) => t + k, 0);
const overlap = (a, b) => Object.keys(a).reduce((t, id) => t + Math.min(a[id], b[id] || 0), 0);
const apart = (a, b) => SIZE - overlap(a, b); // copies that differ
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(/^\d+$/.test(p) ? +p : p); }); return out; }

let _gm = null; const game = () => _gm || (_gm = O.loadGame(ROOT));
function entries() { const pro = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')); return Object.keys(pro.maps).map(id => Object.assign({ id }, pro.maps[id])); }
function selectEntries(spec) { const want = mapRange(spec); return entries().filter(e => !want || want.has(e.map) || want.has(e.id)); }
// the map's road fights: every fight of the map the road measure plays (tools/skirmish_pass.js fights: not tutorial / raid, a deck), on the curve
function roadFights(gm, map) {
  const G = gm.G; return (map.nodes || []).filter(n => n.deck && Object.keys(n.deck).length && !['tutorial', 'raidboss'].includes(n.kind || 'skirmish')).map(n => {
    G.NODE_MAP_HINT.set(n, map.id); let b = null; try { b = G.skirmishTargetBand(map.id, n); } catch (e) {}
    return { key: n.key, node: n, curve: !!(b && b.curve) }; }).filter((f, i, a) => f.curve || !a.some(x => x.curve)); // a map with no curve fight (the Volcano Lair): all its fights
}
function poolOf(gm, map) {
  const G = gm.G, p = O.poolsFor(gm, map, { mode: 'map-true' });
  return p.p1.filter(id => { const d = gm.D[id]; if (!d || !O.deckable(gm, id)) return false; if (d.effects && d.effects.leader) return false;
    const enemyOnly = !(d.source && d.source.kind) && d.rarity !== 'starter' && G.cardSourceOf(d).kind !== 'base'; return !enemyOnly; }).sort();
}
function capOf(gm, id) { return Math.min(MAX_COPIES, gm.G.maxCopiesForRarity(gm.D[id].rarity)); }
function legal(gm, d, pool) { const ids = Object.keys(d); if (tot(d) !== SIZE || ids.length > MAX_UNIQUE) return false; const P = new Set(pool);
  if (ids.some(id => !P.has(id) || d[id] < 1 || d[id] > capOf(gm, id))) return false;
  try { if (ids.some(id => gm.Budget.deckRankBlock(Object.assign({}, d, { [id]: d[id] - 1 }), id, gm.D, []))) return false; } catch (e) {}
  return true; }
function strengthTable(gm, map) {
  const dir = path.join(ROOT, 'docs', 'balance'), out = {}, no = gm.G.mapNumberOf(map.id);
  try { const g = JSON.parse(fs.readFileSync(path.join(dir, 'bench-contrib-global-2026-10-30-final.json'), 'utf8')); g.cards.forEach(c => { out[c.id] = c.perCopy; }); } catch (e) {}
  const own = fs.readdirSync(dir).filter(n => new RegExp(`^bench-contrib-map${String(no).padStart(2, '0')}-${map.id}-.*\\.json$`).test(n)).sort().pop();
  if (own) { try { JSON.parse(fs.readFileSync(path.join(dir, own), 'utf8')).cards.forEach(c => { out[c.id] = c.perCopy; }); } catch (e) {} }
  return { of: id => out[id] != null ? out[id] : ((gm.G.skirmishCardScore(gm.D[id] || {}) || 0) - 10) / 300, file: own || 'bench-contrib-global-2026-10-30-final.json' };
}
function sampleDeck(gm, pool, S, q, rng) {
  const sorted = pool.slice().sort((a, b) => S.of(a) - S.of(b)), n = sorted.length; if (!n) return null;
  const want = 5 + Math.floor(rng.next() * 4), w = sorted.map((id, i) => Math.exp(-Math.pow(i / Math.max(1, n - 1) - q, 2) / 0.03) * (0.4 + rng.next())), picked = [];
  for (let j = 0; j < Math.min(want, n); j++) { let t = 0; w.forEach((x, i) => { if (!picked.includes(i)) t += x; }); let r = rng.next() * t;
    for (let i = 0; i < n; i++) { if (picked.includes(i)) continue; r -= w[i]; if (r <= 0) { picked.push(i); break; } } }
  const ids = picked.map(i => sorted[i]), d = {}; ids.forEach(id => { d[id] = 1; });
  let guard = 0; while (tot(d) < SIZE && guard++ < 400) { const open = ids.filter(id => d[id] < capOf(gm, id) && !rankBlocked(gm, d, id)); if (!open.length) break; const id = open[Math.floor(rng.next() * open.length)]; d[id]++; }
  if (tot(d) < SIZE) { // too few copies in the picked cards: fill from the pool near q
    for (const id of sorted.slice().sort((a, b) => Math.abs(sorted.indexOf(a) / n - q) - Math.abs(sorted.indexOf(b) / n - q))) { if (Object.keys(d).length >= MAX_UNIQUE && !d[id]) continue;
      while (tot(d) < SIZE && (d[id] || 0) < capOf(gm, id) && !rankBlocked(gm, d, id)) d[id] = (d[id] || 0) + 1; if (tot(d) >= SIZE) break; } }
  return legal(gm, d, pool) ? d : null;
}
function rankBlocked(gm, d, id) { try { return !!gm.Budget.deckRankBlock(d, id, gm.D, []); } catch (e) { return false; } }
function anchors(gm, map, e, pool) {
  const G = gm.G, out = [], no = G.mapNumberOf(map.id), push = (d, from) => { if (d && legal(gm, d, pool) && !out.some(x => O.deckKey(x.d) === O.deckKey(d))) out.push({ d: Object.assign({}, d), from }); };
  const f0 = (map.nodes || []).find(n => n.deck); try { push(G.referenceDeckFor(map.id, f0).deck, 'Map reference (road deck)'); } catch (e2) {}
  try { const s = RP.loadSet(ROOT, 'ref-pool'); if (s) push(RP.deckFor(s, G.referenceDeckFor(map.id, f0).mapNo), 'Pool reference (ref-pool)'); } catch (e2) {}
  try { const pr = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'ref', 'ref5-prog.json'), 'utf8')), k = G.referenceDeckFor(map.id, f0).mapNo, ks = Object.keys(pr.decks).map(Number).filter(x => x <= k).sort((a, b) => a - b), at = ks[ks.length - 1];
    (pr.decks[at] || []).forEach((x, i) => push(x.counts, 'Reference (Random) prog-' + (i + 1))); } catch (e2) {}
  (e.pro || []).forEach(x => push(x.deck, x.id));
  return out;
}
function fingerprint(gm, map, e, fights, opts) {
  const files = ['arena_app.js', 'bramblewood-engine.js', 'canonical/cards.json', 'bramblewood-budget.js'].map(f => sha(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return sha(JSON.stringify([VERSION, files, sha(fs.readFileSync(path.join(__dirname, 'lib_leader_2026_11_02.js'), 'utf8')), map.id, (e.pro || []).map(x => x.deck), fights.map(f => f.key), opts]));
}
function buildMap(gm, e, opts) {
  const G = gm.G, map = G.CONQUEST_MAPS.find(m => m.id === e.id), file = path.join(OUTDIR, e.id + '.json');
  const fights = roadFights(gm, map), fp = fingerprint(gm, map, e, fights, opts);
  if (!opts.force && fs.existsSync(file)) { try { if (JSON.parse(fs.readFileSync(file, 'utf8')).fingerprint === fp) return { id: e.id, skipped: true }; } catch (x) {} }
  const t0 = Date.now(), pool = poolOf(gm, map), S = strengthTable(gm, map), rng = O.mulberry(fnv('ladder|' + e.id)), leader = LL.leaderFor(gm, map);
  const cands = anchors(gm, map, e, pool), seen = new Set(cands.map(c => O.deckKey(c.d)));
  for (let i = 0, tries = 0; i < opts.cands && tries < opts.cands * 20; tries++) { const q = opts.cands > 1 ? i / (opts.cands - 1) : 0.5, d = sampleDeck(gm, pool, S, q, rng); if (!d) continue; const k = O.deckKey(d); if (seen.has(k)) continue; seen.add(k); cands.push({ d, from: 'sampled q=' + q.toFixed(2) }); i++; }
  cands.forEach(c => { c.pred = Math.round(Object.entries(c.d).reduce((t, [id, k]) => t + k * S.of(id), 0) * 1000) / 1000; let w = 0, n = 0; c.perFight = {};
    fights.forEach(f => { const r = LL.simulateLed(gm, map.id, f.node, opts.games, { seed0: SEED0, deck: c.d }, leader); c.perFight[f.key] = Math.round(r.win * 1000) / 10; w += r.wins; n += r.n; });
    c.win = Math.round(w / Math.max(1, n) * 1000) / 10; });
  // the choice: 10 targets between the weakest and the strongest, the nearest unused candidate at least APART copies from those chosen
  const byWin = cands.slice().sort((a, b) => a.win - b.win || a.pred - b.pred), lo = byWin[0].win, hi = byWin[byWin.length - 1].win, chosen = [];
  for (let r = 0; r < RANKS; r++) { const t = lo + (hi - lo) * r / (RANKS - 1);
    const pick = byWin.filter(c => !chosen.includes(c) && chosen.every(x => apart(x.d, c.d) >= APART)).sort((a, b) => Math.abs(a.win - t) - Math.abs(b.win - t))[0]
      || byWin.filter(c => !chosen.includes(c)).sort((a, b) => Math.abs(a.win - t) - Math.abs(b.win - t))[0]; if (pick) chosen.push(pick); }
  chosen.sort((a, b) => a.win - b.win || a.pred - b.pred);
  const out = { about: 'BAL13 reference ladder build for one map (tools/bal13/ladder_2026_11_02.js build); `collect` writes the chosen decks to docs/balance/ref/ref-ladder.json', tool: VERSION, fingerprint: fp, built: new Date().toISOString(),
    map: { id: map.id, num: G.mapNumberOf(map.id), name: map.name, side: !!map.sub }, pool: pool.length, leader, strength: S.file, settings: { games: opts.games, cands: opts.cands, seed0: SEED0, maxUnique: MAX_UNIQUE, maxCopies: MAX_COPIES, apart: APART },
    fights: fights.map(f => f.key), chosen: chosen.map((c, i) => ({ rank: i + 1, counts: c.d, from: c.from, selectWin: c.win, pred: c.pred, perFight: c.perFight })),
    candidates: cands.map(c => ({ from: c.from, win: c.win, pred: c.pred, counts: c.d })), ms: Date.now() - t0 };
  fs.mkdirSync(OUTDIR, { recursive: true }); fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  return { id: e.id, cands: cands.length, lo, hi, s: Math.round((Date.now() - t0) / 1000) };
}
function runShard(list, opts) { const gm = game(); for (const e of list) { const r = buildMap(gm, e, opts); console.log(JSON.stringify(r)); } }
function build() {
  const opts = { games: +arg('--games', 6), cands: +arg('--cands', 24), force: argv.includes('--force') }, list = selectEntries(arg('--maps', arg('--map', null)));
  const sh = arg('--shard', null); if (sh) { const [i, n] = sh.split('/').map(Number); return runShard(list.filter((e, k) => k % n === i), opts); }
  const W = +arg('--workers', 1); if (W <= 1) return runShard(list, opts);
  const base = argv.filter((a, i) => a !== '--workers' && argv[i - 1] !== '--workers'); let left = W;
  for (let i = 0; i < W; i++) { const c = cp.fork(__filename, base.concat(['--shard', `${i}/${W}`]), { stdio: 'inherit' }); c.on('exit', code => { if (code) console.log('worker', i, 'exit', code); if (--left === 0) console.log('build done'); }); }
}
// 2026-11-02 (BAL13, owner 22:15: "Can you name the 10 decks, per map? Earlier maps will not have very inspiring names"): a deck's name from its
// make-up: its lead card (most copies; then rarity, then cost) and a word for its shape (TACTICS; the game renders "<lead> <word>" through TX
// ui.bal13-deck-name / ui.bal13-tactic-<key>, so the word translates and the card name is the game's own). The shape, first that fits:
// a family of 8+ copies (flock, hive, school, pack, ...), 6+ copies of Lumber makers (camp), 12+ copies costing and waiting 1 or less (swarm),
// Health at least 4x Attack (wall), Attack x3 at least Health x1.5 (raiders), else band. Two decks of a map with one name: "II", "III" by rank.
const FAMILY_WORD = [['Bird', 'flock'], ['Hummingbird', 'flock'], ['Duck', 'flock'], ['Insect', 'hive'], ['Arachnid', 'nest'], ['Fish', 'school'], ['Cephalopod', 'school'], ['Crustacean', 'school'],
  ['Canid', 'pack'], ['Felid', 'pride'], ['Rodent', 'warren'], ['Mouse', 'warren'], ['Lagomorph', 'warren'], ['Rabbit', 'warren'], ['Mustelid', 'clan'], ['Otter', 'clan'], ['Reptile', 'brood'], ['Amphibian', 'brood'], ['Turtle', 'brood'], ['Bat', 'colony'], ['Primate', 'troop'], ['Ape', 'troop'], ['Dragon', 'brood'], ['Elemental', 'host']];
const TACTICS = ['flock', 'hive', 'nest', 'school', 'pack', 'pride', 'warren', 'clan', 'brood', 'colony', 'troop', 'host', 'camp', 'swarm', 'wall', 'raiders', 'band'];
function lumberMaker(gm, id) { const e = (gm.D[id] || {}).effects || {}; return !!(e.onSpawnGold || e.onReadyGold || e.bounty || (e.triggers || []).some(t => t && (t.do === 'gainGold' || t.do === 'gainLumber' || (t.do === 'gain' && (t.resource || 'lumber') === 'lumber')))); }
function deckName(gm, counts) {
  const D = gm.D, G = gm.G, ids = Object.keys(counts), step = id => G.roadRarityStep((D[id] || {}).rarity || 'common');
  const lead = ids.slice().sort((a, b) => counts[b] - counts[a] || step(b) - step(a) || ((+D[b].cost || 0) - (+D[a].cost || 0)) || (a < b ? -1 : 1))[0];
  const fam = {}; ids.forEach(id => { const t = new Set([...(D[id].species || []), ...(D[id].archetypes || [])]); const ws = new Set(FAMILY_WORD.filter(([k]) => t.has(k)).map(([, w]) => w)); ws.forEach(w => { fam[w] = (fam[w] || 0) + counts[id]; }); });
  const famTop = Object.entries(fam).sort((a, b) => b[1] - a[1] || TACTICS.indexOf(a[0]) - TACTICS.indexOf(b[0]))[0];
  const sum = f => ids.reduce((t, id) => t + counts[id] * f(D[id], id), 0), A = sum(d => +d.attack || 0), H = sum(d => +d.health || 0);
  const tactic = famTop && famTop[1] >= 8 ? famTop[0] : sum((d, id) => lumberMaker(gm, id) ? 1 : 0) >= 6 ? 'camp' : sum(d => (+d.cost || 0) <= 1 && (+d.wait || 0) <= 1 ? 1 : 0) >= 12 ? 'swarm'
    : H >= 4 * A ? 'wall' : 3 * A >= 1.5 * H ? 'raiders' : 'band';
  return { lead, tactic };
}
function collect() {
  const gm = game(), G = gm.G, ladder = {}, missing = [];
  for (const e of entries()) { const f = path.join(OUTDIR, e.id + '.json'); if (!fs.existsSync(f)) { missing.push(e.id); continue; } const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const map = G.CONQUEST_MAPS.find(m => m.id === e.id), f0 = (map.nodes || []).find(n => n.deck), level = G.referenceDeckFor(e.id, f0).level, seen = {};
    const roman = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
    ladder[e.id] = { map: j.map.num, name: j.map.name, side: j.map.side, pool: j.pool, level, fights: j.fights, leader: j.leader, decks: j.chosen.map(c => { const nm = deckName(gm, c.counts), k = nm.lead + '|' + nm.tactic; seen[k] = (seen[k] || 0) + 1;
      const en = `${(gm.D[nm.lead] || {}).name || nm.lead} ${nm.tactic.charAt(0).toUpperCase() + nm.tactic.slice(1)}${roman[seen[k] - 1] || ''}`;
      return { rank: c.rank, name: Object.assign(nm, { n: seen[k] }), title: en, counts: c.counts, parts: G.levelMixDeck(c.counts, level), leader: j.leader, from: c.from, selectWin: c.selectWin }; }) }; }
  const set = { id: 'ladder', label: 'Reference ladder', bake: true, byMapId: true, built: DATE, tool: 'tools/bal13/ladder_2026_11_02.js ' + VERSION, level: 'referencePlayerLevel',
    note: 'Package BAL13 (owner 2026-11-02 19:56: "Make at least 10 reference decks"): per map (every PRO entry: Maps 0-20 and their side maps), 10 decks a player could hold there (the map-true pool: the map\'s own cards plus what a player holds by then, within the map\'s rarity cap, no faction or enemy-only card; 20 cards, at most 12 different, the rarity copy caps), rank 1 the weakest to rank 10 the strongest by their win rate against the map\'s road fights. Played at the Map reference\'s level (referencePlayerLevel), each with the leader a player holds at that map (owner 21:37; tools/bal13/lib_leader_2026_11_02.js leaderFor, the Wandering Traveller when none), summoned by your seat\'s AI. A per-map ladder ("ladder" by map id, not "decks" by map number). tools/opt/ref_decks.js bakes it into arena_app.js REF_DECK_SETS (owner 22:15: the game\'s "Reference (Random)" deals one of the map\'s 10 at random, each with its name, leader and levelled parts); the tools play it (tools/bal13/summary_2026_11_02.js).',
    rule: { pool: 'tools/opt/deckopt.js poolsFor mode map-true, minus enemy-only cards', deck: { size: SIZE, maxUnique: MAX_UNIQUE, maxCopies: MAX_COPIES }, choice: `10 targets evenly between the weakest and the strongest candidate's road win rate (ladder seeds ${SEED0} + 37g); nearest candidate at least ${APART} copies apart` },
    ladder };
  fs.writeFileSync(SET, JSON.stringify(set, null, 1) + '\n'); console.log(`-> docs/balance/ref/ref-ladder.json: ${Object.keys(ladder).length} maps${missing.length ? '; missing ' + missing.join(', ') : ''}`);
}
function check() {
  const gm = game(), set = JSON.parse(fs.readFileSync(SET, 'utf8')), probs = [];
  for (const e of entries()) { const L = set.ladder[e.id]; if (!L) { probs.push(e.id + ': no ladder'); continue; } const map = gm.G.CONQUEST_MAPS.find(m => m.id === e.id), pool = poolOf(gm, map);
    if (L.decks.length < RANKS) probs.push(`${e.id}: ${L.decks.length} decks (want ${RANKS})`);
    L.decks.forEach(d => { if (!legal(gm, d.counts, pool)) probs.push(`${e.id} rank ${d.rank}: not legal (${Object.keys(d.counts).filter(id => !pool.includes(id)).join(', ') || 'size / caps'})`); });
    for (let i = 1; i < L.decks.length; i++) if (L.decks[i].selectWin < L.decks[i - 1].selectWin) probs.push(`${e.id}: ranks out of order at ${i + 1}`); }
  probs.forEach(p => console.log('problem: ' + p)); console.log(probs.length ? probs.length + ' problems' : 'ok: ' + Object.keys(set.ladder).length + ' maps, ' + RANKS + ' decks each'); if (probs.length) process.exit(1);
}
if (require.main === module) { if (CMD === 'build') build(); else if (CMD === 'collect') collect(); else if (CMD === 'check') check(); else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 29).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); }
module.exports = { poolOf, legal, roadFights, entries, SET, RANKS };
