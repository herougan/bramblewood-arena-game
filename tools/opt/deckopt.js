#!/usr/bin/env node
// 2026-10-23 (package OPT, owner 20:44: "hard to make increasingly difficult skirmishes ... if in each map, limiting just to those map's
// cards (and not thinking special), we do 2 things: we find the most optimum combination of cards given the typical field effect -
// through fighting a range of decks in that field effect. Then, also finding cards in the whole spectrum that might fit the deck as well
// - but i dont want to put only 10% computing power to this 2nd. Lastly, not using tokens but a constructed exe to do this."):
// a standalone deck optimizer over the real seeded engine. Nothing in the game is changed; it only reads.
//
//   node tools/opt/deckopt.js --map 3 --minutes 20 --workers 2
//   node tools/opt/deckopt.js --maps 0-3 --minutes 3            (each map gets 3 minutes)
//   node tools/opt/deckopt.js --help                            (every option)
//
// Per map:
//   1. Phase 1 (map cards): the candidate pool is the map's own cards (canonical/map-pools.json: the MAP tier and its submaps' lists,
//      not SPECIAL) plus what a player plausibly owns by then (docs/balance/progression-plan-2026-10-23.json, package HUB3: every card
//      whose advancement map is before this one, packs and faction cards included; --owned none leaves them out). A genetic search
//      (tournament parents, crossover, swap mutations steered by a per-card credit) with successive halving on game counts: every
//      generation's candidates play a few games against each gauntlet entry, the better half doubles its games, and so on.
//   2. Phase 2 (whole spectrum, --cross-share of the search time, default 0.3): every obtainable card outside the phase-1 pool is
//      screened by swapping its copies into the phase-1 best deck (successive halving over the swaps), then the genetic search goes on
//      over the whole card list, seeded with the best swaps.
//   3. Final: the best decks, the map's own skirmish decks and the reference decks play a fixed number of games per gauntlet entry, with
//      and without the map's field effects.
// The gauntlet ("fighting a range of decks in that field effect"):
//   - mirror entries: each of the map's fight decks, the game's reference deck(s) and its expected player deck, as the opponent in a FAIR
//     match: both sides at the player's level, the same bramble (your bramble as the game builds it), the same CPU skill (--ai, 1 = the
//     reference player's), seats swapped every other game, no leaders, no Bee Tank fallback, under that fight's own field effects (its
//     rules: Mist, day / night, Tide, wind, terrain ...). The reference decks borrow the fights' rules in turn.
//   - road entries: the map's fights as the game builds them (enemy level, bramble Health + Shield, CPU level, leaders), what the player
//     really meets (weight --road-weight, default 0.25 of the score).
// Fitness = the weighted mean score (win 1, draw 1/2) over the entries. Every game's seed is a function of (--seed, entry, game number),
// so a deck's result never depends on the order or the worker that played it, and all decks meet the same seeds (common random numbers).
// "X points below the optimum": the optimum's head-to-head score p against each fight's deck in the fair mirror, as Elo points
// (400 log10(p / (1 - p))), with a 95% interval; and each fight deck's own gauntlet score as a player deck, in win-rate points below
// the optimum's on the same entries.
// Determinism: with --gens1 / --gens2 / --final-games (the output's "reproduce" line) a run is the same on every machine; --minutes only
// decides how many generations fit. Checkpoints (--ckpt-dir, default <tmp>/deckopt) after every generation; --resume picks up there.
// Engine hooks: none needed. Two harness notes (reported, not changed): the game's playReferenceGame gives the reference player the
// engine's default Bee Tank fallback once its hand and deck are empty (its loopCards is unset; the CPU side's is []), so here both
// sides get [] (--bee-tank restores the game's harness), and the reference harness has no player leader, so neither has one here.
// Packaging (owner: "a constructed exe"): tools/opt/build-exe.sh makes one executable with Node's Single Executable Applications; the
// GitHub Actions workflow .github/workflows/deckopt.yml runs this on GitHub's free runners (manual dispatch) and uploads the results.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
let SEA = false; try { SEA = require('node:sea').isSea(); } catch (e) { /* Node without SEA */ }
const VERSION = '1.0.0 (2026-10-23)';

// ---------------------------------------------------------------- small helpers
function mulberry(state) { // a serialisable PRNG: {s} is its whole state
  return { s: state >>> 0, next() { let t = (this.s = (this.s + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } };
}
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const uniq = a => [...new Set(a)];
const r3 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;
const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
const deckKey = d => Object.keys(d).filter(k => d[k] > 0).sort().map(k => k + ':' + d[k]).join(',');
const deckFromKey = k => { const d = {}; if (k) k.split(',').forEach(p => { const i = p.lastIndexOf(':'); d[p.slice(0, i)] = +p.slice(i + 1); }); return d; };
const deckTotal = d => Object.values(d).reduce((a, b) => a + (b | 0), 0);
function wilson(p, n, z) { z = z || 1.96; if (!n) return [0, 1]; const d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)]; }
function elo(p, n) { const e = 0.5 / Math.max(1, n || 1); p = Math.min(1 - e, Math.max(e, p)); return 400 * Math.log10(p / (1 - p)); }

// ---------------------------------------------------------------- the game, read from the repo (lib_bramble evaluates arena_app.js)
function loadGame(root) {
  const req = require('module').createRequire(path.join(root, 'tools', 'opt', 'deckopt.js'));
  const B = req(path.join(root, 'tools', 'lib_bramble.js'));
  const Budget = req(path.join(root, 'bramblewood-budget.js'));
  const rd = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  const planFile = path.join(root, 'docs', 'balance', 'progression-plan-2026-10-23.json');
  const plan = fs.existsSync(planFile) ? JSON.parse(fs.readFileSync(planFile, 'utf8')) : { cards: [] };
  const seededRng = new Function(B.grab('seededRng') + '\nreturn seededRng;')(); // the game's own match PRNG (lib_bramble evaluates it but does not export it)
  return { root, B, G: B.G, E: B.E, D: B.CARD_DEFS_BASELINE, Budget, plan, pools: rd('canonical/map-pools.json').maps, seededRng };
}
function resolveMap(gm, m) {
  const all = gm.G.CONQUEST_MAPS;
  const hit = /^\d+$/.test(String(m)) ? all.find(x => !x.sub && !x.reserved && gm.G.mapNumberOf(x.id) === +m) : all.find(x => x.id === m);
  if (!hit) throw new Error('no map ' + m);
  return hit;
}
function fightsOf(map) { return (map.nodes || []).filter(n => n.deck && Object.keys(n.deck).length && n.kind !== 'tutorial' && !/raidboss|megaraid/.test(n.kind || '')); }
function deckable(gm, id) { const d = gm.D[id]; return !!d && !d.token && !d.test && !d.hero && !d.hallOfFame && !d.pool && id !== 'wandering-traveller'; }
const capOf = (gm, id) => gm.G.maxCopiesForRarity(gm.D[id].rarity);
function canAdd(gm, deck, id) { if ((deck[id] || 0) >= capOf(gm, id)) return false; try { return !gm.Budget.deckRankBlock(deck, id, gm.D, []); } catch (e) { return true; } }
const OWNED_SKIP = new Set(['unsorted', 'raid', 'materia', 'smith', 'nest', 'pack-nomap']);
function poolsFor(gm, map, opt) {
  const mapNo = gm.G.mapNumberOf(map.id), e = gm.pools[map.id] || { cards: [], submaps: {} };
  let mapCards = (e.cards || []).slice(); if (opt.submaps !== false) Object.values(e.submaps || {}).forEach(l => { mapCards = mapCards.concat(Array.isArray(l) ? l : (l.cards || [])); });
  fightsOf(map).forEach(n => { mapCards = mapCards.concat(Object.keys(n.deck)); }); // the map's own fight decks are its cards
  const owned = opt.owned === 'none' ? [] : gm.plan.cards.filter(c => c.adv != null && c.adv < mapNo && !OWNED_SKIP.has(c.bucket)).map(c => c.id);
  const p1 = uniq(mapCards.concat(owned)).filter(id => deckable(gm, id)).sort();
  const spectrum = opt.crossPool === 'live' ? Object.keys(gm.D) : gm.plan.cards.filter(c => c.bucket !== 'unsorted').map(c => c.id);
  const all = uniq(p1.concat(spectrum)).filter(id => deckable(gm, id)).sort();
  return { mapNo, mapCards: uniq(mapCards).filter(id => deckable(gm, id)).sort(), owned: uniq(owned).filter(id => deckable(gm, id) && !mapCards.includes(id)).sort(), p1, all };
}
// a legal 20-card deck from any counts: copies within the rarity's cap and the top-rank caps, cards within `pool`
function repair(gm, deck, pool, rng, credit, size) {
  size = size || gm.G.DECK_SIZE || 20; const inPool = new Set(pool), out = {};
  Object.keys(deck).sort().forEach(id => { let k = deck[id] | 0; if (!inPool.has(id) || k <= 0) return; while (k-- > 0 && canAdd(gm, out, id)) out[id] = (out[id] || 0) + 1; });
  while (deckTotal(out) > size) { const ids = Object.keys(out).sort(); const id = pickLow(ids, credit, rng); if (--out[id] <= 0) delete out[id]; }
  let guard = 0;
  while (deckTotal(out) < size && guard++ < 500) { const id = pickAdd(gm, out, pool, credit, rng); if (!id) break; out[id] = (out[id] || 0) + 1; }
  return out;
}
const cred = (credit, id) => (credit && credit[id]) ? credit[id].s / (credit[id].n + 2) : 0;
function pickLow(ids, credit, rng) { // a card to drop: low credit, with noise
  let best = null, bv = Infinity; ids.forEach(id => { const v = cred(credit, id) + (rng.next() - 0.5) * 0.04; if (v < bv) { bv = v; best = id; } }); return best;
}
function pickAdd(gm, deck, pool, credit, rng, bias) { // a card to add: half uniform over the pool, half by credit (softmax)
  const ok = pool.filter(id => canAdd(gm, deck, id)); if (!ok.length) return null;
  if (rng.next() < (bias ? 0.3 : 0.5)) return ok[Math.floor(rng.next() * ok.length)];
  const w = ok.map(id => Math.exp((cred(credit, id) + (bias && bias[id] || 0)) / 0.02)), tot = w.reduce((a, b) => a + b, 0);
  let x = rng.next() * tot; for (let i = 0; i < ok.length; i++) { x -= w[i]; if (x <= 0) return ok[i]; } return ok[ok.length - 1];
}

// ---------------------------------------------------------------- the gauntlet
// entries: [{key, kind: 'mirror'|'road', node, opp (deck, mirror), label, weight, neutral}]
function buildEntries(gm, map, opt) {
  const G = gm.G, fights = fightsOf(map), out = [];
  const mirrorW = 1 - opt.roadWeight, roadW = opt.roadWeight;
  const opps = fights.map(n => ({ key: 'fight:' + n.key, node: n.key, deck: n.deck, label: n.key + ' ' + (n.kind || 'skirmish') + "'s deck" }));
  const ref = G.referenceDeckFor(map.id, fights[0]);
  const refs = [{ key: 'ref:starter', deck: G.WINRATE_REF_DECKS.starter, label: 'reference starter deck' }];
  if (ref.stage === 'road') refs.push({ key: 'ref:road' + ref.deckMap, deck: ref.deck, label: 'reference deck (Map ' + ref.deckMap + ')' });
  try { const ex = G.expectedPlayerDeck(map.id, fights[0].key); if (deckTotal(ex) >= 10) refs.push({ key: 'ref:expected', deck: ex, label: 'expected player deck (expectedPlayerDeck)' }); } catch (e) { /* none */ }
  refs.forEach((r, i) => { r.node = fights[i % fights.length].key; r.label += ' under ' + r.node + "'s field"; });
  const seen = new Set(), all = opps.concat(refs).filter(o => { const k = deckKey(o.deck); if (seen.has(k)) return false; seen.add(k); return true; });
  all.forEach(o => out.push({ key: 'mirror|' + o.key, kind: 'mirror', node: o.node, opp: o.deck, oppKey: o.key, label: 'vs ' + o.label, weight: mirrorW / all.length }));
  if (roadW > 0) fights.forEach(n => out.push({ key: 'road|' + n.key, kind: 'road', node: n.key, label: n.key + ' as the game builds it', weight: roadW / fights.length }));
  // the same mirror matches without the field effects (final evaluation only): plain Day, no terrain / Mist / Tide / wind
  all.forEach(o => out.push({ key: 'neutral|' + o.key, kind: 'mirror', node: o.node, opp: o.deck, oppKey: o.key, label: 'vs ' + o.label + ' (no field effects)', weight: 0, neutral: true }));
  return out;
}
// levelled copies as the game's referencePlayerDeck makes them ("<id>@p<level>" defs, added to ctx.defs)
function mineFor(gm, defs, deck, level) {
  const G = gm.G, out = {};
  G.levelMixDeck(deck, level).forEach(([id, k, L]) => { const b = defs[id];
    if (!b) return; if (G.cardBaseLevel(b) >= L || (b.attack == null && b.health == null)) { out[id] = (out[id] || 0) + k; return; }
    const did = id + '@p' + L;
    if (!defs[did]) { const st = G.statsAtLevel(b, L), o = Object.assign({}, b, { id: did, derivedFrom: id, attack: st.attack, health: st.health, level: L, baseLevel: G.cardBaseLevel(b), locked: false });
      if (b.levelSkills) { const fx = Object.assign({}, b.effects || {}); Object.keys(b.levelSkills).map(Number).filter(x => x <= L).sort((x, y) => x - y).forEach(x => Object.assign(fx, b.levelSkills[x])); o.effects = fx; }
      defs[did] = o; }
    out[did] = (out[did] || 0) + k; });
  return out;
}
function makeContexts(gm, spec) {
  const map = resolveMap(gm, spec.mapId), byKey = {}; fightsOf(map).forEach(n => byKey[n.key] = n);
  return spec.entries.map(en => {
    const node = byKey[en.node], c = gm.G.referenceFightSetup(map.id, node, { deck: {}, level: spec.level });
    const ctx = { en, defs: c.defs, rules: en.neutral ? { phase: 'day' } : c.rules, mode: c.mode, cpu: c.cpu, sc: c.sc, setup: c.setup, myCastle: c.myCastle, node, enemyDeck: c.enemyDeck, seedBase: fnv(spec.seed + '|' + en.key) };
    if (en.kind === 'mirror') ctx.oppMine = mineFor(gm, c.defs, en.opp, spec.level);
    ctx.mineCache = new Map();
    return ctx;
  });
}
function playOne(gm, spec, ctx, deck, g) {
  const E = gm.E, G = gm.G, seed = (ctx.seedBase + Math.imul(g + 1, 2654435761)) >>> 0;
  const dk = deckKey(deck); let mine = ctx.mineCache.get(dk); if (!mine) { mine = mineFor(gm, ctx.defs, deck, spec.level); if (ctx.mineCache.size > 64) ctx.mineCache.clear(); ctx.mineCache.set(dk, mine); }
  const mirror = ctx.en.kind === 'mirror', aFirst = !mirror || g % 2 === 0, ai2 = mirror ? spec.ai : ctx.cpu;
  const engine = E.makeSimEngine(ctx.defs, gm.seededRng(seed), { recordEvents: false, battleMode: ctx.mode, rules: ctx.rules, aiAim: true, aiLevel: mirror ? spec.ai : ctx.cpu });
  const sideOf = id => id === 1 ? 'A' : 'B', st = {};
  const d1 = mirror ? (aFirst ? mine : ctx.oppMine) : mine, d2 = mirror ? (aFirst ? ctx.oppMine : mine) : ctx.enemyDeck;
  const P = { 1: engine.newPlayer(1, d1, ctx.myCastle), 2: engine.newPlayer(2, d2, mirror ? ctx.myCastle : ctx.sc.character) };
  P[2].loopCards = []; if (!spec.beeTank) P[1].loopCards = [];
  if (!mirror) { Object.assign(P[2].hq, ctx.setup.hq); if (ctx.setup.hq.shieldLayers) P[2].hq.shieldLayers = ctx.setup.hq.shieldLayers.slice(); if (ctx.setup.reserveLeaders) P[2].reserveLeaders = ctx.setup.reserveLeaders.slice(); }
  engine.draw(P[1], 3, 'A', st, null); engine.draw(P[2], 3, 'B', st, null);
  let r = 1, over = false, lastSig = null, stalled = 0;
  for (; r <= E.DRAW_ROUND_CAP && !over; r++) {
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p => { P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if (r > 1) engine.roundStart(P, r, sideOf, st, null);
    engine.setAiLevel(mirror ? spec.ai : 1); engine.aiTakeTurn(P, sideOf, 1, st, null); engine.setAiLevel(ai2); engine.aiTakeTurn(P, sideOf, 2, st, null);
    over = engine.resolveCombat(P, sideOf, st, null, r % 2 === 0 ? 1 : 2); if (over) break;
    const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if (stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', st, null); engine.draw(P[2], 1, 'B', st, null);
  }
  const mySide = aFirst ? 1 : 2, foe = 3 - mySide, meDead = P[mySide].hq.hp <= 0, foeDead = P[foe].hq.hp <= 0;
  if (!mirror) return (over && foeDead && !meDead) ? 1 : 0; // the road: a win is a win (as the game counts it)
  return meDead && !foeDead ? 0 : foeDead && !meDead ? 1 : 0.5;
}
// jobs: [[entryIndex, from, to]] -> [[entryIndex, scoreSum, games]]
function runJobs(gm, spec, ctxs, deck, jobs) { return jobs.map(([ei, a, b]) => { let s = 0; for (let g = a; g < b; g++) s += playOne(gm, spec, ctxs[ei], deck, g); return [ei, s, b - a]; }); }

// ---------------------------------------------------------------- worker side
if (!isMainThread && workerData && workerData.deckopt) {
  const gm = loadGame(workerData.root); let spec = null, ctxs = null;
  parentPort.on('message', m => {
    try {
      if (m.type === 'setup') { spec = m.spec; ctxs = makeContexts(gm, spec); parentPort.postMessage({ type: 'ready' }); }
      else if (m.type === 'eval') parentPort.postMessage({ type: 'res', id: m.id, res: runJobs(gm, spec, ctxs, m.deck, m.jobs) });
    } catch (e) { parentPort.postMessage({ type: 'err', id: m.id, err: String(e && e.stack || e) }); }
  });
}

// ---------------------------------------------------------------- the evaluator (a worker pool, or inline with --workers 0)
class Evaluator {
  constructor(root, n, gm) { this.root = root; this.n = n; this.gm = gm; this.ws = []; this.q = []; this.cb = new Map(); this.seq = 0; this.games = 0; this.busyMs = 0; }
  workerSource() { if (SEA) return { src: require('node:sea').getAsset('deckopt.js', 'utf8'), eval: true }; return { src: __filename, eval: false }; }
  async setup(spec) {
    this.spec = spec;
    if (!this.n) { this.ctxs = makeContexts(this.gm, spec); return; }
    if (!this.ws.length) { const s = this.workerSource();
      for (let i = 0; i < this.n; i++) { const w = new Worker(s.src, { eval: s.eval, workerData: { deckopt: true, root: this.root } }); w.idle = true; w.on('message', m => this.onMsg(w, m)); w.on('error', e => { console.error('worker error', e); process.exit(2); }); this.ws.push(w); } }
    await Promise.all(this.ws.map(w => new Promise((res, rej) => { w.ready = res; w.fail = rej; w.idle = false; w.postMessage({ type: 'setup', spec }); })));
    this.ws.forEach(w => { w.idle = true; }); this.pump();
  }
  onMsg(w, m) {
    if (m.type === 'ready') { w.ready(); return; }
    if (m.type === 'err') { console.error(m.err); process.exit(2); }
    const c = this.cb.get(m.id); this.cb.delete(m.id); w.idle = true; c(m.res); this.pump();
  }
  pump() { for (const w of this.ws) { if (!this.q.length) return; if (!w.idle) continue; const t = this.q.shift(); w.idle = false; this.cb.set(t.id, t.done); w.postMessage({ type: 'eval', id: t.id, deck: t.deck, jobs: t.jobs }); } }
  run(deck, jobs) {
    const n = jobs.reduce((a, j) => a + j[2] - j[1], 0); this.games += n;
    if (!this.n) return Promise.resolve(runJobs(this.gm, this.spec, this.ctxs, deck, jobs));
    return new Promise(done => { this.q.push({ id: ++this.seq, deck, jobs, done }); this.pump(); });
  }
  close() { this.ws.forEach(w => w.terminate()); this.ws = []; }
}

// ---------------------------------------------------------------- stats and successive halving
class Stats {
  constructor(nE, raw) { this.nE = nE; this.m = new Map(); if (raw) Object.entries(raw).forEach(([k, v]) => this.m.set(k, { s: v.s.slice(), n: v.n.slice() })); }
  get(k) { let v = this.m.get(k); if (!v) { v = { s: new Array(this.nE).fill(0), n: new Array(this.nE).fill(0) }; this.m.set(k, v); } return v; }
  toJSON(keep) { const o = {}; (keep || [...this.m.keys()]).forEach(k => { const v = this.m.get(k); if (v) o[k] = v; }); return o; }
}
function fitness(entries, st, which) { // weighted mean score over the entries in `which` (indices) that have games
  let a = 0, w = 0, v = 0; which.forEach(i => { const e = entries[i]; if (!st.n[i] || !e.weight) return; const p = st.s[i] / st.n[i]; a += e.weight * p; w += e.weight; v += e.weight * e.weight * Math.max(p * (1 - p), 0.0625 / st.n[i]) / st.n[i]; });
  return w ? { f: a / w, se: Math.sqrt(v) / w } : { f: 0, se: 1 };
}
async function ensure(ev, stats, decks, target, idx) { // every deck to >= target games on every entry in idx (chunks of <= 48 games)
  const ps = [];
  decks.forEach(d => { const k = deckKey(d), st = stats.get(k), jobs = [];
    idx.forEach(i => { let a = st.n[i]; while (a < target) { const b = Math.min(target, a + 48); jobs.push([i, a, b]); a = b; } });
    for (let j = 0; j < jobs.length;) { const chunk = []; let g = 0; while (j < jobs.length && g < 64) { g += jobs[j][2] - jobs[j][1]; chunk.push(jobs[j++]); }
      ps.push(ev.run(d, chunk).then(res => res.forEach(([i, s, n]) => { st.s[i] += s; st.n[i] += n; }))); } });
  await Promise.all(ps);
}
// successive halving: all candidates to g0 games per entry, keep the better half (never fewer than `keep`), double, ... up to gmax
async function halving(ev, stats, entries, idx, cands, o) {
  let alive = cands.slice(), g = o.g0; const rank = list => list.map(d => ({ d, k: deckKey(d), ...fitness(entries, stats.get(deckKey(d)), idx) })).sort((x, y) => y.f - x.f || (x.k < y.k ? -1 : 1));
  for (;;) { await ensure(ev, stats, alive, g, idx); const r = rank(alive);
    if (alive.length <= o.keep || g >= o.gmax) { alive = r.map(x => x.d); break; }
    alive = r.slice(0, Math.max(o.keep, Math.ceil(r.length / 2))).map(x => x.d); g = Math.min(o.gmax, g * 2); }
  if (o.top) await ensure(ev, stats, alive.slice(0, o.top), o.gmax, idx); // the leaders are measured to gmax
  const all = rank(uniqDecks(cands)); return all;
}
function uniqDecks(list) { const seen = new Set(); return list.filter(d => { const k = deckKey(d); if (seen.has(k)) return false; seen.add(k); return true; }); }

// ---------------------------------------------------------------- the genetic search
function mutate(gm, deck, pool, credit, rng, bias) {
  const d = Object.assign({}, deck), m = 1 + (rng.next() < 0.5 ? 0 : rng.next() < 0.6 ? 1 : 2);
  if (rng.next() < 0.25) { // all copies of one card -> another card
    const ids = Object.keys(d).sort(), out = pickLow(ids, credit, rng), k = d[out]; delete d[out];
    const inn = pickAdd(gm, d, pool.filter(x => x !== out), credit, rng, bias); if (inn) d[inn] = Math.min(k, capOf(gm, inn));
  } else for (let i = 0; i < m; i++) { const ids = Object.keys(d).sort(), out = pickLow(ids, credit, rng); if (--d[out] <= 0) delete d[out]; const inn = pickAdd(gm, d, pool, credit, rng, bias); if (inn) d[inn] = (d[inn] || 0) + 1; }
  return repair(gm, d, pool, rng, credit);
}
function crossover(gm, a, b, pool, credit, rng) {
  const d = {}; uniq(Object.keys(a).concat(Object.keys(b))).sort().forEach(id => { const x = a[id] || 0, y = b[id] || 0; const v = rng.next() < 0.5 ? x : y; if (v) d[id] = v; });
  return repair(gm, d, pool, rng, credit);
}
function tournament(ranked, rng) { const n = ranked.length, i = Math.floor(rng.next() * n), j = Math.floor(rng.next() * n); return ranked[Math.min(i, j)].d; }
function updateCredit(credit, ranked) {
  const fs_ = ranked.map(x => x.f), mean = fs_.reduce((a, b) => a + b, 0) / Math.max(1, fs_.length);
  ranked.forEach(x => Object.keys(x.d).forEach(id => { const c = credit[id] || (credit[id] = { s: 0, n: 0 }); c.s += (x.f - mean) * x.d[id] / 4; c.n += x.d[id] / 4; }));
}
function randomDeck(gm, pool, rng, credit) { return repair(gm, {}, pool, rng, credit); }

// ---------------------------------------------------------------- one map
function parseArgs(argv) {
  const o = { maps: null, minutes: 5, workers: Math.max(1, Math.min(os.cpus().length, 8)), seed: 'bramble', crossShare: 0.3, roadWeight: 0.25, ai: 1, owned: 'plan', crossPool: 'plan', submaps: true,
    pop: 16, children: 32, g0: 2, gmax: 32, top: 3, screenCopies: 3, screenMax: null, finalGames: 0, finalMax: 200, finalShare: 0.2, gens1: null, gens2: null, level: null, beeTank: false,
    out: null, ckptDir: path.join(os.tmpdir(), 'deckopt'), resume: false, root: null, quiet: false, summary: true, tag: null };
  const a = argv.slice(), take = () => a.shift();
  while (a.length) { const k = take();
    switch (k) {
      case '--map': case '--maps': o.maps = take(); break;
      case '--minutes': o.minutes = +take(); break; case '--workers': case '-j': o.workers = +take(); break; case '--seed': o.seed = take(); break;
      case '--cross-share': o.crossShare = +take(); break; case '--road-weight': o.roadWeight = +take(); break; case '--ai': o.ai = +take(); break;
      case '--owned': o.owned = take(); break; case '--cross-pool': o.crossPool = take(); break; case '--no-submaps': o.submaps = false; break;
      case '--pop': o.pop = +take(); break; case '--children': o.children = +take(); break; case '--g0': o.g0 = +take(); break; case '--gmax': o.gmax = +take(); break;
      case '--screen-copies': o.screenCopies = +take(); break; case '--screen-max': o.screenMax = +take(); break; case '--final-games': o.finalGames = +take(); break; case '--final-share': o.finalShare = +take(); break;
      case '--gens1': o.gens1 = +take(); break; case '--gens2': o.gens2 = +take(); break; case '--level': o.level = +take(); break; case '--bee-tank': o.beeTank = true; break;
      case '--out': o.out = take(); break; case '--ckpt-dir': o.ckptDir = take(); break; case '--resume': o.resume = true; break; case '--root': o.root = take(); break;
      case '--quiet': o.quiet = true; break; case '--no-summary': o.summary = false; break; case '--tag': o.tag = take(); break;
      case '--help': case '-h': o.help = true; break; case '--version': o.version = true; break;
      default: throw new Error('unknown option ' + k + ' (--help lists them)');
    } }
  if (o.g0 % 2) o.g0++; // mirror games swap seats: even counts
  return o;
}
const HELP = `deckopt ${VERSION}: the strongest deck per map over the real Bramblewood engine (no Claude, no tokens).
  --map N | --maps 0-3 | --maps 0,2,mc    map number(s) or id(s)               --minutes M    search time per map (default 5)
  --workers N         worker threads (default: cores, max 8; 0 = inline)        --seed S       seed (default "bramble")
  --cross-share F     share of the search for the whole-spectrum phase (0.3)    --road-weight F  share of the score from the real fights (0.25)
  --owned plan|none   add what a player owns by then (HUB3 plan, default) or only the map's cards
  --cross-pool plan|live  phase 2's cards: obtainable (plan, default) or every live card
  --ai L              CPU skill of both sides in the fair mirror (1)            --level L      player card level (default: the game's reference level)
  --pop P --children K --g0 G --gmax G    search sizes (16, 32, 2, 32)          --screen-copies C  copies of a screened card (3, capped by rarity)
  --screen-max N      how many out-of-map cards to screen (default: what fits half of phase 2's time; all with --gens2)
  --final-games G     games per entry in the final (default: fits --final-share 0.2 of the time, max 200)
  --gens1 A --gens2 B fixed generation counts (reproduce a run exactly; the output's "reproduce" line)
  --ckpt-dir D --resume   checkpoints after every generation (default <tmp>/deckopt) and picking up from them
  --out DIR           output folder (default docs/balance/opt)                  --root DIR     the game checkout (default: this repo; the exe: the working folder)
  --bee-tank          give your side the engine's Bee Tank fallback, as the game's reference harness does (off)
  --tag T             file tag (default: today's date)                          --quiet  --no-summary  --version`;

function mapList(gm, spec) {
  if (!spec) throw new Error('--map is required');
  const out = []; String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(String(i)); } else out.push(p); });
  return out.map(x => resolveMap(gm, x));
}
function saveJSON(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(obj)); fs.renameSync(tmp, file); }

async function optimizeMap(gm, ev, map, o, log) {
  const G = gm.G, t0 = Date.now(), fights = fightsOf(map), pools = poolsFor(gm, map, o);
  const level = o.level != null ? o.level : G.referenceFightSetup(map.id, fights[0], { deck: {} }).ref.level;
  const entries = buildEntries(gm, map, o), spec = { mapId: map.id, level, entries, seed: o.seed, ai: o.ai, beeTank: o.beeTank };
  const main = entries.map((e, i) => i).filter(i => !entries[i].neutral), neutral = entries.map((e, i) => i).filter(i => entries[i].neutral);
  const ckFile = path.join(o.ckptDir, 'deckopt-' + map.id + '-' + fnv(JSON.stringify([VERSION, o.seed, o.roadWeight, o.ai, o.owned, o.crossPool, o.submaps, o.pop, o.children, o.g0, o.gmax, level, o.beeTank, o.screenCopies, entries.map(e => e.key)])).toString(36) + '.json');
  let S = null; if (o.resume && fs.existsSync(ckFile)) { S = JSON.parse(fs.readFileSync(ckFile, 'utf8')); log('  resumed from ' + ckFile + ' (' + S.phase + ', gen ' + S.gen + ')'); }
  if (!S) S = { phase: 'p1', gen: 0, gens1: 0, gens2: 0, rng: fnv(o.seed + '|' + map.id), pop: [], credit: {}, stats: {}, screen: null, best1: null, elapsedMs: 0, games: 0 };
  const rng = mulberry(S.rng), stats = new Stats(entries.length, S.stats), credit = S.credit;
  await ev.setup(spec);
  const searchMs = o.minutes * 60000 * (1 - o.finalShare), p1Ms = searchMs * (1 - o.crossShare), elapsed0 = S.elapsedMs, tStart = Date.now();
  const elapsed = () => elapsed0 + (Date.now() - tStart), games0 = ev.games - S.games;
  const checkpoint = () => { const keep = uniq(S.pop.concat(S.hof || []).concat(S.best1 ? [S.best1] : []).concat(S.screen ? S.screen.map(x => x.key) : []).concat(S.p2seed || [])); S.rng = rng.s; S.elapsedMs = elapsed(); S.games = ev.games - games0; S.stats = stats.toJSON(keep); saveJSON(ckFile, S); };
  const hall = ranked => { S.hof = uniq((S.hof || []).concat(ranked.slice(0, 4).map(x => x.k))).slice(-40); };
  const shOpt = { g0: o.g0, gmax: o.gmax, keep: o.pop, top: o.top };
  const rankKeys = keys => keys.map(k => ({ k, d: deckFromKey(k), ...fitness(entries, stats.get(k), main) })).sort((x, y) => y.f - x.f || (x.k < y.k ? -1 : 1));
  async function gaLoop(pool, phase, untilMs, maxGens, bias) {
    let ranked = rankKeys(S.pop);
    while (true) {
      const done = phase === 'p1' ? S.gens1 : S.gens2;
      if (maxGens != null ? done >= maxGens : (done >= 1 && elapsed() >= untilMs)) break;
      const kids = []; let tries = 0;
      while (kids.length < o.children && tries++ < o.children * 5) { const a = tournament(ranked, rng), c = rng.next() < 0.5 ? mutate(gm, crossover(gm, a, tournament(ranked, rng), pool, credit, rng), pool, credit, rng, bias) : mutate(gm, a, pool, credit, rng, bias); if (deckTotal(c) === 20) kids.push(c); }
      ranked = await halving(ev, stats, entries, main, uniqDecks(ranked.map(x => x.d).concat(kids)), shOpt);
      updateCredit(credit, ranked); S.pop = ranked.slice(0, o.pop).map(x => x.k); hall(ranked); ranked = ranked.slice(0, o.pop);
      if (phase === 'p1') S.gens1++; else S.gens2++;
      const b = ranked[0], st = stats.get(b.k); checkpoint();
      log(`  ${phase} gen ${phase === 'p1' ? S.gens1 : S.gens2}: best ${r1(b.f * 100)}% ±${r1(b.se * 196)} (${st.n[main[0]]} g/entry)  ${r1((ev.games - games0) / Math.max(1, (Date.now() - tStart) / 1000))} games/s  ${Math.round(elapsed() / 1000)} s`);
    }
    return ranked;
  }
  // ---- phase 1: the map's cards
  if (S.phase === 'p1') {
    if (!S.pop.length) { // seeds: the map's fight decks and the reference decks repaired into the pool, the score-greedy deck, random decks
      const seeds = entries.filter(e => e.kind === 'mirror' && !e.neutral).map(e => repair(gm, e.opp, pools.p1, rng, credit));
      const greedy = {}; pools.p1.slice().sort((a, b) => G.skirmishCardScore(gm.D[b]) - G.skirmishCardScore(gm.D[a]) || (a < b ? -1 : 1)).forEach(id => { while (deckTotal(greedy) < 20 && canAdd(gm, greedy, id)) greedy[id] = (greedy[id] || 0) + 1; });
      seeds.push(repair(gm, greedy, pools.p1, rng, credit)); while (seeds.length < o.pop * 2) seeds.push(randomDeck(gm, pools.p1, rng, credit));
      const ranked = await halving(ev, stats, entries, main, uniqDecks(seeds), shOpt); updateCredit(credit, ranked); S.pop = ranked.slice(0, o.pop).map(x => x.k); hall(ranked); checkpoint();
      log(`  p1 seeds: best ${r1(ranked[0].f * 100)}%  (${ev.games - games0} games)`);
    }
    await gaLoop(pools.p1, 'p1', p1Ms, o.gens1);
    S.best1 = rankKeys(S.pop)[0].k; S.p1top = rankKeys(S.pop).slice(0, 5).map(x => x.k); S.phase = 'screen'; checkpoint();
  }
  // ---- phase 2a: screen every card outside the phase-1 pool as a swap into the phase-1 best deck
  const outside = pools.all.filter(id => !pools.p1.includes(id));
  if (S.phase === 'screen') {
    const best = deckFromKey(S.best1), vars = [best], meta = {};
    // the screen gets about half of phase 2's time: when every swap won't fit, the cards with the best skirmishCardScore go first
    // (--screen-max fixes the count, as the output's reproduce line does)
    const gpsNow = Math.max(10, (ev.games - games0) / Math.max(1, (Date.now() - tStart) / 1000));
    const fit = Math.floor(searchMs * o.crossShare * 0.5 / 1000 * gpsNow / (2 * o.g0 * main.length));
    S.screenMax = o.screenMax != null ? o.screenMax : o.gens2 != null ? outside.length : Math.max(20, fit);
    const order = outside.slice().sort((a, b) => G.skirmishCardScore(gm.D[b]) - G.skirmishCardScore(gm.D[a]) || (a < b ? -1 : 1)).slice(0, S.screenMax);
    S.screenSkipped = outside.length - order.length;
    order.forEach(id => { const d = Object.assign({}, best); const k = Math.min(o.screenCopies, capOf(gm, id)); const removed = [];
      const order = Object.keys(d).sort((a, b) => cred(credit, a) - cred(credit, b) || (a < b ? -1 : 1));
      for (let i = 0; i < k; i++) { const x = order.find(y => d[y] > 0); if (!x) break; d[x]--; removed.push(x); if (!d[x]) delete d[x]; }
      let added = 0; while (added < k && canAdd(gm, d, id)) { d[id] = (d[id] || 0) + 1; added++; }
      const fixed = repair(gm, d, pools.all, rng, credit); if (!fixed[id]) return; const kk = deckKey(fixed); if (meta[kk]) return; meta[kk] = { card: id, copies: fixed[id], out: removed }; vars.push(fixed); });
    log(`  screen: ${vars.length - 1} out-of-map swaps` + (S.screenSkipped ? ` (${S.screenSkipped} lower-scored cards left out for time; --screen-max ${outside.length} screens all)` : ''));
    const ranked = await halving(ev, stats, entries, main, vars, { g0: o.g0, gmax: o.gmax, keep: 8, top: 3 });
    const base = fitness(entries, stats.get(S.best1), main);
    S.screen = ranked.filter(x => meta[x.k]).map(x => ({ key: x.k, card: meta[x.k].card, copies: meta[x.k].copies, out: meta[x.k].out, f: x.f, se: x.se, n: stats.get(x.k).n[main[0]], delta: x.f - base.f }));
    S.screenBase = base; S.phase = 'p2';
    // phase 2 starts from the phase-1 population plus the best swaps
    S.p2seed = S.screen.slice(0, o.pop).map(x => x.key); S.pop = uniq(S.pop.concat(S.p2seed)); checkpoint();
    log(`  screen done: top swaps ${S.screen.slice(0, 5).map(x => x.card + ' x' + x.copies + ' ' + (x.delta >= 0 ? '+' : '') + r1(x.delta * 100)).join(', ')}`);
  }
  // ---- phase 2b: the genetic search over the whole card list, steered toward the cards that screened well
  if (S.phase === 'p2') {
    const bias = {}; (S.screen || []).forEach(x => { bias[x.card] = Math.max(bias[x.card] || -1, x.delta); });
    await gaLoop(pools.all, 'p2', searchMs, o.gens2, bias);
    S.best2 = rankKeys(S.pop)[0].k; S.phase = 'final'; checkpoint();
  }
  // ---- final: fixed games per entry, with and without the field effects
  const gps = Math.max(10, (ev.games - games0) / Math.max(1, (Date.now() - tStart) / 1000));
  const fightOpps = entries.filter(e => e.kind === 'mirror' && !e.neutral);
  const rateDecks = fightOpps.map(e => ({ key: e.oppKey, label: e.label.replace(/^vs /, ''), deck: e.opp }));
  const units = 2 * entries.length + rateDecks.length * main.length / 2;
  let FG = o.finalGames || Math.floor(Math.max(0, o.minutes * 60000 * o.finalShare) / 1000 * gps / units);
  if (!o.finalGames) FG = Math.max(20, Math.min(o.finalMax, FG)); FG = Math.max(2, FG + FG % 2); // an explicit --final-games is kept as given (even)
  log(`  final: ${FG} games per entry (${Math.round(units * FG)} games)`);
  const finals = uniq([S.best1, S.best2]).map(deckFromKey), all = entries.map((e, i) => i);
  await ensure(ev, stats, finals, FG, all);
  for (const r of rateDecks) { // each fight / reference deck as YOUR deck (at your level) against the same gauntlet
    await ensure(ev, stats, [r.deck], FG / 2 + (FG / 2) % 2, main); }
  const wallS = (Date.now() - t0) / 1000, played = ev.games - games0;
  // ---- the report
  const per = (k, idx) => { const st = stats.get(k); return idx.map(i => { const n = st.n[i], p = n ? st.s[i] / n : null, ci = wilson(p || 0, n); return { entry: entries[i].key, label: entries[i].label, kind: entries[i].kind, neutral: !!entries[i].neutral, p: r3(p), lo: r3(ci[0]), hi: r3(ci[1]), n }; }); };
  const deckOut = (k, name) => { const d = deckFromKey(k), fit = fitness(entries, stats.get(k), main), mir = fitness(entries, stats.get(k), main.filter(i => entries[i].kind === 'mirror')), road = fitness(entries, stats.get(k), main.filter(i => entries[i].kind === 'road'));
    return { name, deck: d, cards: Object.keys(d).sort((a, b) => d[b] - d[a] || (a < b ? -1 : 1)).map(id => ({ id, name: gm.D[id].name, copies: d[id], rarity: gm.D[id].rarity, inMapPool: pools.mapCards.includes(id), owned: pools.owned.includes(id), outOfMap: !pools.p1.includes(id) })),
      score: r3(fit.f), ci: [r3(fit.f - 1.96 * fit.se), r3(fit.f + 1.96 * fit.se)], mirror: r3(mir.f), road: road.se < 1 ? r3(road.f) : null, perEntry: per(k, all) }; };
  const opt1 = deckOut(S.best1, 'optimum (map cards)'), opt2 = S.best2 && S.best2 !== S.best1 ? deckOut(S.best2, 'optimum (whole spectrum)') : null;
  // field impact: the optimum's score per opponent with the fields minus without
  const fieldImpact = fightOpps.map(e => { const i = entries.indexOf(e), j = entries.findIndex(x => x.neutral && x.oppKey === e.oppKey), st = stats.get(S.best1);
    const pf = st.s[i] / st.n[i], pn = st.s[j] / st.n[j], se = Math.sqrt(pf * (1 - pf) / st.n[i] + pn * (1 - pn) / st.n[j]);
    return { opponent: e.oppKey, node: e.node, rules: ruleSummary(gm, map, e.node), withField: r3(pf), noField: r3(pn), delta: r3(pf - pn), ci: [r3(pf - pn - 1.96 * se), r3(pf - pn + 1.96 * se)] }; });
  // the gap: the optimum vs each fight's deck (fair mirror, that fight's field), and each deck's own gauntlet score as your deck
  const gap = rateDecks.map(r => { const e = fightOpps.find(x => x.oppKey === r.key), i = entries.indexOf(e), st = stats.get(S.best1), n = st.n[i], p = st.s[i] / n, ci = wilson(p, n);
    const subset = main.filter(x => entries[x].oppKey !== r.key), mine = fitness(entries, stats.get(deckKey(r.deck)), subset), best = fitness(entries, st, subset);
    const node = fights.find(f => f.key === e.node);
    return { opponent: r.key, label: r.label, kind: r.key.startsWith('fight:') ? (node.kind || 'skirmish') : 'reference', node: e.node,
      target: r.key.startsWith('fight:') ? (G.roadCurveTarget(map.id, node) || {}).t : null,
      h2h: r3(p), h2hCI: [r3(ci[0]), r3(ci[1])], elo: Math.round(elo(p, n)), eloCI: [Math.round(elo(ci[0], n)), Math.round(elo(ci[1], n))], n,
      asPlayer: r3(mine.f), optimumSame: r3(best.f), pointsBelow: r1((best.f - mine.f) * 100), pointsCI: r1(1.96 * Math.sqrt(mine.se * mine.se + best.se * best.se) * 100) }; });
  const reportRoad = fights.map(n => { const i = entries.findIndex(e => e.key === 'road|' + n.key); if (i < 0) return null; const st1 = stats.get(S.best1), p = st1.s[i] / st1.n[i], ci = wilson(p, st1.n[i]); const t = G.roadCurveTarget(map.id, n);
    return { node: n.key, kind: n.kind || 'skirmish', target: t ? t.t : null, optimum: r3(p), ci: [r3(ci[0]), r3(ci[1])], n: st1.n[i] }; }).filter(Boolean);
  const out = { tool: 'tools/opt/deckopt.js', version: VERSION, generated: new Date().toISOString(), map: { id: map.id, num: pools.mapNo, name: map.name },
    level, settings: { seed: o.seed, crossShare: o.crossShare, roadWeight: o.roadWeight, ai: o.ai, owned: o.owned, crossPool: o.crossPool, submaps: o.submaps, pop: o.pop, children: o.children, g0: o.g0, gmax: o.gmax, screenCopies: o.screenCopies, beeTank: o.beeTank, minutes: o.minutes, workers: o.workers },
    reproduce: `node tools/opt/deckopt.js --map ${map.id} --seed ${o.seed} --gens1 ${S.gens1} --gens2 ${S.gens2} --final-games ${FG} --screen-max ${S.screenMax} --cross-share ${o.crossShare} --road-weight ${o.roadWeight}` + (o.owned !== 'plan' ? ' --owned ' + o.owned : '') + (o.level != null ? ' --level ' + o.level : '') + (o.beeTank ? ' --bee-tank' : ''),
    pools: { phase1: pools.p1.length, mapCards: pools.mapCards, owned: pools.owned, wholeSpectrum: pools.all.length },
    gauntlet: entries.map(e => ({ key: e.key, kind: e.kind, node: e.node, label: e.label, weight: r3(e.weight), neutral: !!e.neutral, rules: ruleSummary(gm, map, e.node, e.neutral) })),
    throughput: { games: played, seconds: r1(wallS), gamesPerSecond: r1(played / wallS), workers: o.workers, searchGamesPerSecond: r1(gps) },
    phase1: { generations: S.gens1, best: opt1, runnersUp: (S.p1top || []).slice(1, 4).map(k => ({ deck: deckFromKey(k), score: r3(fitness(entries, stats.get(k), main).f) })) },
    phase2: { generations: S.gens2, screenBaseline: r3(S.screenBase && S.screenBase.f), screened: (S.screen || []).length, screenSkipped: S.screenSkipped || 0,
      topSwaps: (S.screen || []).slice(0, 15).map(x => ({ card: x.card, name: gm.D[x.card].name, rarity: gm.D[x.card].rarity, obtainMap: (gm.plan.cards.find(c => c.id === x.card) || {}).adv, copies: x.copies, out: x.out, score: r3(x.f), delta: r3(x.delta), n: x.n })),
      best: opt2, gainOverPhase1: opt2 ? r3(opt2.score - opt1.score) : 0 },
    road: reportRoad, fieldImpact, gap };
  ev.lastReport = out; S.phase = 'done'; checkpoint();
  return out;
}
function ruleSummary(gm, map, nodeKey, neutral) {
  if (neutral) return 'Day, no field effects';
  const n = fightsOf(map).find(x => x.key === nodeKey), r = gm.G.fightRules(map.id, n), bits = [];
  Object.keys(r).sort().forEach(k => { const v = r[k]; if (v == null || v === false) return; if (k === 'terrain') bits.push('terrain ' + v.name + ' T' + v.tier + (v.sig ? ' (' + v.sig + ')' : '')); else if (k === 'phase') bits.push('phase ' + v); else bits.push(v === true ? k : k + ' ' + (typeof v === 'object' ? JSON.stringify(v) : v)); });
  return bits.join(', ');
}

// ---------------------------------------------------------------- the summary (markdown)
const pct = v => v == null ? '-' : Math.round(v * 1000) / 10 + '%';
function deckLine(d) { return d.cards.map(c => c.copies + 'x ' + c.name + (c.outOfMap ? ' (out of map)' : c.owned ? ' (owned)' : '')).join(', '); }
function summaryMd(reports, tag) {
  const L = [`# Deck optimizer results (${tag})`, '', 'Generated by `tools/opt/deckopt.js` (package OPT). Fair mirror: both sides at your level, your bramble, CPU skill 1, seats swapped; "road" = the fight as the game builds it. Score = 0.75 mirror + 0.25 road unless the settings say otherwise. Elo gap = 400 log10(p / (1 - p)) of the optimum\'s head-to-head score against that deck.', ''];
  reports.forEach(r => {
    L.push(`## Map ${r.map.num}: ${r.map.name} (\`${r.map.id}\`), your level ${r.level}`, '');
    L.push(`- Throughput: ${r.throughput.games} games in ${r.throughput.seconds} s = **${r.throughput.gamesPerSecond} games/s** (${r.throughput.workers} workers). Generations: ${r.phase1.generations} (map cards) + ${r.phase2.generations} (whole spectrum). Reproduce: \`${r.reproduce}\``);
    L.push(`- Pool: ${r.pools.phase1} cards (${r.pools.mapCards.length} map cards + ${r.pools.owned.length} owned by then); whole spectrum ${r.pools.wholeSpectrum}.`);
    L.push(`- **Optimum (map cards)**: score ${pct(r.phase1.best.score)} [${pct(r.phase1.best.ci[0])}, ${pct(r.phase1.best.ci[1])}], mirror ${pct(r.phase1.best.mirror)}, road ${pct(r.phase1.best.road)}: ${deckLine(r.phase1.best)}`);
    if (r.phase2.best) L.push(`- **Optimum (whole spectrum)**: score ${pct(r.phase2.best.score)} (${r.phase2.gainOverPhase1 >= 0 ? '+' : ''}${Math.round(r.phase2.gainOverPhase1 * 1000) / 10} pts): ${deckLine(r.phase2.best)}`);
    else L.push('- Whole spectrum: no deck beat the map-card optimum.');
    L.push(`- Best out-of-map swaps into the optimum: ${r.phase2.topSwaps.slice(0, 6).map(s => s.name + ' x' + s.copies + ' (Map ' + (s.obtainMap == null ? '?' : s.obtainMap) + ') ' + (s.delta >= 0 ? '+' : '') + Math.round(s.delta * 1000) / 10).join('; ')}`, '');
    L.push('| Opponent deck | fair h2h of the optimum | Elo gap | its own score as your deck | pts below optimum | road target |', '|---|---|---|---|---|---|');
    r.gap.forEach(g => L.push(`| ${g.label} | ${pct(g.h2h)} [${pct(g.h2hCI[0])}-${pct(g.h2hCI[1])}] | ${g.elo} [${g.eloCI[0]}, ${g.eloCI[1]}] | ${pct(g.asPlayer)} | ${g.pointsBelow} ±${g.pointsCI} | ${g.target == null ? '-' : pct(g.target)} |`));
    L.push('', '| Fight (as the game builds it) | optimum wins | road-curve target |', '|---|---|---|');
    r.road.forEach(x => L.push(`| ${x.node} ${x.kind} | ${pct(x.optimum)} [${pct(x.ci[0])}-${pct(x.ci[1])}] | ${pct(x.target)} |`));
    L.push('', '| Field (fight) | optimum with field | without | impact |', '|---|---|---|---|');
    r.fieldImpact.forEach(f => L.push(`| ${f.opponent} @ ${f.node}: ${f.rules || '-'} | ${pct(f.withField)} | ${pct(f.noField)} | ${f.delta >= 0 ? '+' : ''}${Math.round(f.delta * 1000) / 10} [${Math.round(f.ci[0] * 1000) / 10}, ${Math.round(f.ci[1] * 1000) / 10}] |`));
    L.push('');
  });
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------- main
async function main(argv) {
  const o = parseArgs(argv);
  if (o.version) { console.log(VERSION); return; }
  if (o.help) { console.log(HELP); return; }
  const root = path.resolve(o.root || (SEA ? process.cwd() : path.join(__dirname, '..', '..')));
  if (!fs.existsSync(path.join(root, 'arena_app.js'))) throw new Error('no game at ' + root + ' (run from the repo checkout or pass --root)');
  const tag = o.tag || new Date().toISOString().slice(0, 10), outDir = path.resolve(o.out || path.join(root, 'docs', 'balance', 'opt'));
  const log = o.quiet ? () => {} : s => console.log(s);
  const gm = loadGame(root), maps = mapList(gm, o.maps), ev = new Evaluator(root, o.workers, gm), reports = [];
  log(`deckopt ${VERSION}: ${maps.length} map(s), ${o.minutes} min each, ${o.workers} workers, seed ${o.seed}`);
  try {
    for (const m of maps) { log(`Map ${gm.G.mapNumberOf(m.id)} ${m.name} (${m.id})`);
      const r = await optimizeMap(gm, ev, m, o, log); reports.push(r);
      const f = path.join(outDir, `deckopt-map${String(r.map.num).padStart(2, '0')}-${m.id}-${tag}.json`); fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(r, null, 1) + '\n');
      log(`  -> ${path.relative(root, f)}  optimum ${pct(r.phase1.best.score)}; gaps ${r.gap.map(g => g.node + ':' + g.elo).join(' ')}`); }
  } finally { ev.close(); }
  if (o.summary) { // the summary covers every map file of this tag in the folder
    const all = fs.readdirSync(outDir).filter(f => f.startsWith('deckopt-map') && f.endsWith('-' + tag + '.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8')));
    const sf = path.join(outDir, `deckopt-summary-${tag}.md`); fs.writeFileSync(sf, summaryMd(all, tag)); log('summary -> ' + path.relative(root, sf)); }
  return reports;
}
if (typeof module !== 'undefined') module.exports = { parseArgs, loadGame, resolveMap, fightsOf, poolsFor, repair, canAdd, capOf, buildEntries, makeContexts, runJobs, deckKey, deckFromKey, deckTotal, mulberry, wilson, elo, optimizeMap, Evaluator, main, summaryMd, VERSION };
if (isMainThread && (require.main === module || SEA)) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
