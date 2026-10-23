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
//
// 2026-10-23 (package OPT2, owner 22:23, OPT-1 / OPT-2: "use logic first - must be related, cannot be selected leaders or boss cards
// for future skirmishes, cannot be strange Map 40+ cards etc. maybe have similar attacks like arrows in an arrow map - that really limits
// the number of cards to prob 5-25." OPT-3: "we try to create the optimum (at lvl 1) deck first. then we see how to make a range of
// weaker decks after that. Idk if its possible to find multiple local maxima. Idk if we should do grid search based discrete descent or
// just random."). What changed:
//   - Phase 2's cards are a logic-filtered list (5-25 a map) instead of every obtainable card: candidatesFor() with the rules in
//     tools/opt/phase2-rules.json (related to the map by biome / terrain / unit type / animal group / skill family / field; never a later
//     map's leaders, showcased or boss-only cards, strange cards or Map 40+ cards). Every candidate is printed with its reasons.
//   - Your level is 1 unless --level says otherwise (--level ref = the game's reference level, 0 on Maps 0-5).
//   - The search budget is in games (--budget, per map; --minutes converts with the measured games/s), so a run reproduces exactly.
//   - Two searches (--method ga|descent): the genetic search, now with restarts and niching (elites kept apart by card-set distance),
//     and a discrete coordinate descent (one copy swapped at a time, sampled neighbours under successive halving, first improvement,
//     random restarts at each local maximum). --compare runs both on the map cards at equal game budgets and scores their best-so-far
//     decks on independent seeds.
//   - Distinct optima: the best decks at least --distinct-radius copies apart, with their mutual head-to-head.
//   - The difficulty ladder: legal decks from the same pool, sharing at least --ladder-core copies with the optimum, at target Elo gaps
//     below it (--ladder 600,450,300,150), measured head to head against the optimum under the map's fields.
//   - Checkpoints are per stage (a restart, the screen, phase 2, the final, the optima, the ladder); --resume skips the finished stages.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
let SEA = false; try { SEA = require('node:sea').isSea(); } catch (e) { /* Node without SEA */ }
const VERSION = '2.0.0 (2026-10-23, OPT2)';

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
  const themes = fs.existsSync(path.join(root, 'canonical', 'unit-themes.json')) ? rd('canonical/unit-themes.json') : { units: [], maps: [], vocab: { biomes: [] } };
  const obtain = fs.existsSync(path.join(root, 'canonical', 'card-obtain-maps.json')) ? rd('canonical/card-obtain-maps.json').maps : {};
  let factionGates = {}; try { factionGates = new Function(B.grab('FACTION_RARITY_GATES') + '\nreturn FACTION_RARITY_GATES;')(); } catch (e) { /* an older game: no gates */ }
  return { root, B, G: B.G, E: B.E, D: B.CARD_DEFS_BASELINE, Budget, plan, pools: rd('canonical/map-pools.json').maps, seededRng, themes, obtain, factionGates };
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
const OWNED_ALWAYS = new Set(['tutorialBase', 'base']), OWNED_SKIP = new Set(['unsorted', 'raid', 'materia', 'smith', 'nest', 'pack-nomap']);
function poolsFor(gm, map, opt) {
  const mapNo = gm.G.mapNumberOf(map.id), e = gm.pools[map.id] || { cards: [], submaps: {} };
  let mapCards = (e.cards || []).slice(); if (opt.submaps !== false) Object.values(e.submaps || {}).forEach(l => { mapCards = mapCards.concat(Array.isArray(l) ? l : (l.cards || [])); });
  fightsOf(map).forEach(n => { mapCards = mapCards.concat(Object.keys(n.deck)); }); // the map's own fight decks are its cards
  const owned = opt.owned === 'none' ? [] : gm.plan.cards.filter(c => OWNED_ALWAYS.has(c.bucket) || (c.adv != null && c.adv < mapNo && !OWNED_SKIP.has(c.bucket))).map(c => c.id); // Base cards from the start, the rest from the map after their advancement map
  const p1 = uniq(mapCards.concat(owned)).filter(id => deckable(gm, id)).sort();
  const spectrum = opt.crossPool === 'live' ? Object.keys(gm.D) : gm.plan.cards.filter(c => c.bucket !== 'unsorted').map(c => c.id);
  const all = uniq(p1.concat(spectrum)).filter(id => deckable(gm, id)).sort();
  // 2026-10-23 (OPT2): the map's core cards (its MAP tier and its fight decks, not the submaps) are what "related to the map" means
  const core = uniq((e.cards || []).concat(...fightsOf(map).map(n => Object.keys(n.deck)))).filter(id => deckable(gm, id)).sort();
  return { mapNo, mapCards: uniq(mapCards).filter(id => deckable(gm, id)).sort(), owned: uniq(owned).filter(id => deckable(gm, id) && !mapCards.includes(id)).sort(), p1, all, core };
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
  // 2026-10-23 (OPT2): successive-halving order: the decks that got the most games first (the survivors), then by score, so a deck
  // dropped after 2 lucky games never outranks one measured to gmax
  const all = rank(uniqDecks(cands)).map(x => Object.assign(x, { g: Math.min(o.gmax, stats.get(x.k).n[idx[0]] || 0) })).sort((x, y) => y.g - x.g || y.f - x.f || (x.k < y.k ? -1 : 1));
  return all;
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

// ---------------------------------------------------------------- phase 2's candidates (OPT2): logic first
// The rules live in tools/opt/phase2-rules.json (read from the game checkout, so the exe reads them too).
function loadRules(root, file) {
  const f = file ? path.resolve(file) : path.join(root, 'tools', 'opt', 'phase2-rules.json');
  if (!fs.existsSync(f)) throw new Error('no phase-2 rules at ' + f + ' (--rules FILE)');
  const r = JSON.parse(fs.readFileSync(f, 'utf8')); r._file = path.relative(root, f) || f; return r;
}
function unitOf(gm, id) { if (!gm._units) { gm._units = {}; (gm.themes.units || []).forEach(u => { gm._units[u.id] = u; }); } return gm._units[id] || null; }
function planOf(gm, id) { if (!gm._plan) { gm._plan = {}; gm.plan.cards.forEach(c => { gm._plan[c.id] = c; }); } return gm._plan[id] || null; }
function typesOf(gm, id) { const u = unitOf(gm, id), d = gm.D[id]; return uniq(((u && u.types) || []).concat(d.archetypes || [], d.species || [])); }
function familiesOf(rules, d) { const fx = Object.keys(d.effects || {}); return Object.keys(rules.families).filter(f => rules.families[f].some(k => fx.includes(k))); }
// the first map a card can be had: the HUB3 plan's advancement map, else its first map; a faction reward waits for its rarity's gate
// too (arena_app.js FACTION_RARITY_GATES: Rare Map 14, Very Rare 20, ... Heroic 30, Unique and up 40)
function obtainMapOf(gm, id) {
  const c = planOf(gm, id); let m = c && c.adv != null ? Math.max(0, c.adv) : c && c.first != null ? c.first : gm.obtain[id] != null ? gm.obtain[id] : null;
  if (c && /^faction/.test(c.bucket || '')) { const g = gm.factionGates[gm.D[id].rarity] || gm.factionGates.high; if (g && g.map != null) m = Math.max(m || 0, g.map); }
  return m;
}
function mapFacts(gm, map, pools, rules) {
  const G = gm.G, mapNo = pools.mapNo, fights = fightsOf(map);
  const tm = (gm.themes.maps || []).find(x => x.id === map.id) || {}, biome = tm.biome || null, vb = (gm.themes.vocab && gm.themes.vocab.biomes) || [];
  const kin = biome ? uniq(((vb.find(b => b.id === biome) || {}).kin || []).concat(vb.filter(b => (b.kin || []).includes(biome)).map(b => b.id))).sort() : [];
  const rulesOf = fights.map(n => G.fightRules(map.id, n) || {});
  const terrain = uniq([].concat(...rulesOf.map(r => (r.terrain && r.terrain.types) || []))).sort();
  const fieldKeys = uniq([].concat(...rulesOf.map(r => Object.keys(r).filter(k => r[k] != null && r[k] !== false && k !== 'terrain' && k !== 'phase').concat(r.phase ? ['phase:' + r.phase] : [])))).sort();
  const fieldFam = {}; fieldKeys.forEach(k => (rules.fieldFamilies[k] || []).forEach(f => { if (!fieldFam[f]) fieldFam[f] = k; }));
  const typeCount = {}, famCount = {}, groups = {};
  pools.core.forEach(id => { typesOf(gm, id).forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; }); familiesOf(rules, gm.D[id]).forEach(f => { famCount[f] = (famCount[f] || 0) + 1; });
    const u = unitOf(gm, id); if (u && u.animalGroup && !groups[u.animalGroup]) groups[u.animalGroup] = id; });
  const ign = new Set(rules.ignoreTypes || []), fo = new Set(rules.familiesFieldOnly || []);
  const types = Object.keys(typeCount).filter(t => typeCount[t] >= rules.sharedTypeMin && !ign.has(t)).sort();
  const mech = Object.keys(famCount).filter(f => famCount[f] >= rules.mechanicMin && !fo.has(f)).sort();
  // the exclusions that depend on the map: a later map's leaders, showcased cards and boss-only cards
  const future = { leaders: {}, showcase: {}, boss: {}, reward: {} }, plain = new Set(), special = new Set();
  G.CONQUEST_MAPS.forEach(m => (m.nodes || []).forEach(n => { if (!/boss/.test(n.kind || '')) Object.keys(n.deck || {}).forEach(id => plain.add(id)); }));
  G.CONQUEST_MAPS.filter(m => !m.reserved && G.mapNumberOf(m.id) > mapNo).forEach(m => (m.nodes || []).forEach(n => {
    const at = n.key + ' (' + m.id + ')';
    (n.leaders || []).forEach(id => { if (!future.leaders[id]) future.leaders[id] = at; });
    [].concat(n.showcase || []).forEach(id => { if (!future.showcase[id]) future.showcase[id] = at; });
    if (/boss/.test(n.kind || '')) Object.keys(n.deck || {}).forEach(id => { if (!plain.has(id) && !future.boss[id]) future.boss[id] = at; }); }));
  // (this map's own boss / ender rewards too: a player does not have them while the map is being played)
  const bossNode = {}; G.CONQUEST_MAPS.filter(m => !m.reserved && G.mapNumberOf(m.id) >= mapNo).forEach(m => (m.nodes || []).forEach(n => { if (/boss/.test(n.kind || '') || n.ender) bossNode[m.id + '|' + n.key] = n.key + ' (' + m.id + ')'; }));
  Object.keys(gm.D).forEach(id => { const s = gm.D[id].source; if (s && s.kind === 'map' && bossNode[s.id + '|' + s.node]) future.reward[id] = bossNode[s.id + '|' + s.node]; });
  Object.values(gm.pools).forEach(e => (e.special || []).forEach(id => special.add(id)));
  return { mapNo, biome, kin, terrain, fieldKeys, fieldFam, typeCount, famCount, groups, types, mech, future, special };
}
function exclusionOf(gm, id, F, X) {
  const d = gm.D[id], c = planOf(gm, id);
  if (!c) return 'not in the progression plan (not obtainable)';
  if ((X.buckets || []).includes(c.bucket)) return 'plan bucket ' + c.bucket;
  const fl = (X.flags || []).find(f => d[f] != null && d[f] !== false); if (fl) return 'strange: ' + fl;
  const om = obtainMapOf(gm, id); if (om != null && om > X.maxObtainMap) return 'first obtainable after Map ' + X.maxObtainMap;
  if (X.futureLeaders && F.future.leaders[id]) return 'a later fight\'s leader';
  if (X.futureShowcase && F.future.showcase[id]) return 'a later fight\'s showcased card';
  if (X.futureBossOnly && F.future.boss[id]) return 'met only in later boss fights';
  if (X.futureBossRewards && F.future.reward[id]) return 'a later boss / map-ender fight\'s reward';
  if (X.challengeRewards && d.source && d.source.challenge) return 'challenge reward (SS)';
  if (X.specialTier && F.special.has(id)) return 'a map\'s SPECIAL tier';
  return null;
}
function candidatesFor(gm, map, pools, rules) {
  const F = mapFacts(gm, map, pools, rules), W = rules.weights, X = rules.exclude, inP1 = new Set(pools.p1), rows = [], excluded = {};
  const spectrum = uniq(gm.plan.cards.map(c => c.id).concat(Object.keys(gm.D))).filter(id => deckable(gm, id) && !inP1.has(id)).sort();
  spectrum.forEach(id => {
    const ex = exclusionOf(gm, id, F, X); if (ex) { (excluded[ex] = excluded[ex] || []).push(id); return; }
    const d = gm.D[id], u = unitOf(gm, id), bio = (u && u.biomes) || [], ty = typesOf(gm, id), fam = familiesOf(rules, d), why = []; let score = 0;
    const add = (w, s) => { if (w) { score += w; why.push(s); } };
    if (F.biome && bio.includes(F.biome)) add(W.biome, 'biome ' + F.biome);
    else { const k = bio.filter(b => F.kin.includes(b)); if (k.length) add(W.kinBiome, 'kin biome ' + k[0]); }
    const tt = ty.filter(t => F.terrain.includes(t)); if (tt.length) add(W.terrainType, 'terrain type ' + tt.join('/'));
    ty.filter(t => F.types.includes(t)).sort((a, b) => F.typeCount[b] - F.typeCount[a] || (a < b ? -1 : 1)).slice(0, W.sharedTypeCap).forEach(t => add(W.sharedType, 'type ' + t + ' (' + F.typeCount[t] + ' map cards)'));
    if (u && u.animalGroup && F.groups[u.animalGroup]) add(W.animalGroup, 'animal group ' + u.animalGroup + ' (like ' + gm.D[F.groups[u.animalGroup]].name + ')');
    fam.filter(f => F.mech.includes(f)).sort((a, b) => F.famCount[b] - F.famCount[a] || (a < b ? -1 : 1)).slice(0, W.mechanicCap).forEach(f => add(W.mechanic, f + ' skills (' + F.famCount[f] + ' map cards)'));
    const ff = fam.filter(f => F.fieldFam[f]); if (ff.length) add(W.fieldMechanic, ff.join('/') + ' (field ' + uniq(ff.map(f => F.fieldFam[f])).join('/') + ')');
    if (score > 0) rows.push({ id, name: d.name, rarity: d.rarity, obtainMap: obtainMapOf(gm, id), score, reasons: why });
  });
  let minScore = rules.minScore, q;
  for (;;) { q = rows.filter(r => r.score >= minScore); if (q.length >= rules.minCards || minScore <= 1) break; minScore--; }
  const near = r => r.obtainMap == null ? 99 : Math.abs(r.obtainMap - F.mapNo);
  q.sort((a, b) => b.score - a.score || near(a) - near(b) || (a.id < b.id ? -1 : 1));
  const list = q.slice(0, rules.maxCards);
  return { rules: rules._file, facts: { biome: F.biome, kinBiomes: F.kin, terrainTypes: F.terrain, mapTypes: F.types.map(t => t + ' ' + F.typeCount[t]), mapMechanics: F.mech.map(f => f + ' ' + F.famCount[f]), field: F.fieldKeys, coreCards: pools.core.length },
    minScore, minScoreAsked: rules.minScore, qualified: q.length, cut: q.length - list.length, list,
    excluded: Object.keys(excluded).sort().map(k => ({ reason: k, n: excluded[k].length, e: excluded[k].slice(0, 6) })), belowScore: spectrum.length - Object.values(excluded).reduce((a, l) => a + l.length, 0) - q.length };
}

// ---------------------------------------------------------------- the two searches (OPT2): genetic with restarts + niching, coordinate descent
const overlap = (a, b) => { let s = 0; Object.keys(a).forEach(id => { if (b[id]) s += Math.min(a[id], b[id]); }); return s; };
const dist = (a, b) => Math.max(deckTotal(a), deckTotal(b)) - overlap(a, b); // copies that differ (0 = the same deck, 20 = nothing shared)
function nicheSelect(ranked, n, radius, cap) { // clearing: at most `cap` elites within `radius` copies of each other; the rest fill in order
  if (!radius) return ranked.slice(0, n); const out = [], left = [];
  ranked.forEach(x => { if (out.length >= n) return; if (out.filter(y => dist(x.d, y.d) < radius).length < cap) out.push(x); else left.push(x); });
  return out.concat(left).slice(0, n);
}
const fitK = (X, k) => fitness(X.entries, X.stats.get(k), X.main);
async function gaSearch(X, pool, budget, seeds, rng, credit, bias, label) {
  const { gm, ev, stats, entries, main, o } = X, g0 = ev.games, used = () => ev.games - g0, trace = [], shOpt = { g0: o.g0, gmax: o.gmax, keep: o.pop, top: o.top };
  let ranked = await halving(ev, stats, entries, main, uniqDecks(seeds), shOpt); updateCredit(credit, ranked);
  let pop = nicheSelect(ranked, o.pop, o.nicheRadius, o.nicheCap), gens = 0; trace.push([used(), ranked[0].k]);
  X.log(`  ${label} seeds: best ${r1(ranked[0].f * 100)}% (${used()} games)`);
  while (used() < budget) {
    const kids = []; let tries = 0;
    while (kids.length < o.children && tries++ < o.children * 5) { const a = tournament(pop, rng), c = rng.next() < 0.5 ? mutate(gm, crossover(gm, a, tournament(pop, rng), pool, credit, rng), pool, credit, rng, bias) : mutate(gm, a, pool, credit, rng, bias); if (deckTotal(c) === 20) kids.push(c); }
    ranked = await halving(ev, stats, entries, main, uniqDecks(pop.map(x => x.d).concat(kids)), shOpt);
    updateCredit(credit, ranked); pop = nicheSelect(ranked, o.pop, o.nicheRadius, o.nicheCap); gens++; trace.push([used(), ranked[0].k]);
    X.log(`  ${label} gen ${gens}: best ${r1(ranked[0].f * 100)}% ±${r1(ranked[0].se * 196)}  ${used()} games  ${r1(ev.games / Math.max(1, (Date.now() - X.t0) / 1000))} games/s`);
  }
  return { method: 'ga', label, gens, games: used(), best: ranked[0].k, pop: pop.map(x => x.k), trace };
}
function neighbours(gm, deck, pool, rng, k, keep) { // single-copy swaps: one copy out, one copy of another pool card in (legal); keep(d) filters
  const out = [], seen = new Set([deckKey(deck)]), ids = Object.keys(deck).sort(); let tries = 0;
  while (out.length < k && tries++ < k * 20) {
    const x = ids[Math.floor(rng.next() * ids.length)], d = Object.assign({}, deck); if (--d[x] <= 0) delete d[x];
    const ok = pool.filter(y => y !== x && canAdd(gm, d, y)); if (!ok.length) continue;
    const y = ok[Math.floor(rng.next() * ok.length)]; d[y] = (d[y] || 0) + 1;
    const kk = deckKey(d); if (seen.has(kk) || (keep && !keep(d))) continue; seen.add(kk); out.push(d); }
  return out;
}
// discrete coordinate descent: from a start deck, sample `neighbours` single-copy swaps, successive halving among them up to dgmax games
// per entry (the current deck is at dgmax too, on the same seeds), move to the best when it beats the current deck; `patience` samples
// without a better neighbour = a local maximum; then restart (the next start deck, or `restart()`), until the game budget is spent
async function descentSearch(X, pool, budget, starts, rng, restart, label) {
  const { gm, ev, stats, entries, main, o } = X, g0 = ev.games, used = () => ev.games - g0, trace = [], optima = [], sh = { g0: o.g0, gmax: o.dgmax, keep: 1, top: 1 };
  let best = null, steps = 0, moves = 0;
  const better = k => { if (!best || fitK(X, k).f > fitK(X, best).f) best = k; };
  const seedRank = starts.length > 1 ? await halving(ev, stats, entries, main, uniqDecks(starts), sh) : null, next = [seedRank ? seedRank[0].d : starts[0]];
  if (seedRank) X.log(`  ${label} seeds: best ${r1(seedRank[0].f * 100)}% (${used()} games)`);
  while (used() < budget) {
    const cur0 = next.length ? next.shift() : restart(); await ensure(ev, stats, [cur0], o.dgmax, main);
    let ck = deckKey(cur0), fail = 0, path = 0; better(ck); trace.push([used(), best]);
    while (fail < o.patience && used() < budget) {
      const nb = neighbours(gm, deckFromKey(ck), pool, rng, o.neighbours); if (!nb.length) break;
      const r = await halving(ev, stats, entries, main, nb, sh); steps++;
      if (r[0].g >= o.dgmax && r[0].f > fitK(X, ck).f) { ck = r[0].k; fail = 0; moves++; path++; } else fail++;
      better(ck); trace.push([used(), best]);
    }
    optima.push({ key: ck, f: r3(fitK(X, ck).f), moves: path, local: fail >= o.patience });
    X.log(`  ${label} restart ${optima.length}: ${path} moves, ${fail >= o.patience ? 'local maximum' : 'budget spent'} at ${r1(fitK(X, ck).f * 100)}%  (best ${r1(fitK(X, best).f * 100)}%, ${used()} games)`);
  }
  return { method: 'descent', label, steps, moves, restarts: optima.length, games: used(), best, optima, trace };
}
function perturb(gm, deck, pool, rng, k) { let d = Object.assign({}, deck); for (let i = 0; i < k; i++) { const nb = neighbours(gm, d, pool, rng, 1); if (nb.length) d = nb[0]; } return d; }
function seedDecks(gm, entries, pool, rng, credit, n) { // the map's fight decks and the reference decks repaired into the pool, the score-greedy deck, random decks
  const G = gm.G, seeds = entries.filter(e => e.kind === 'mirror' && !e.neutral).map(e => repair(gm, e.opp, pool, rng, credit));
  const greedy = {}; pool.slice().sort((a, b) => G.skirmishCardScore(gm.D[b]) - G.skirmishCardScore(gm.D[a]) || (a < b ? -1 : 1)).forEach(id => { while (deckTotal(greedy) < 20 && canAdd(gm, greedy, id)) greedy[id] = (greedy[id] || 0) + 1; });
  seeds.push(repair(gm, greedy, pool, rng, credit)); while (seeds.length < n) seeds.push(randomDeck(gm, pool, rng, credit));
  return seeds;
}
// a search over `pool` with the chosen method; restarts for the GA (each its own population and credit, the budget split evenly)
async function search(X, method, pool, budget, rng, seeds, label, opts) {
  opts = opts || {}; const o = X.o;
  if (method === 'descent') {
    const restart = opts.restart || (() => randomDeck(X.gm, pool, rng, null));
    return descentSearch(X, pool, budget, seeds, rng, restart, label);
  }
  const R = Math.max(1, opts.restarts || 1), runs = []; let spent = 0;
  for (let r = 0; r < R; r++) {
    const credit = r === 0 && opts.credit ? opts.credit : {};
    const sd = r === 0 ? seeds : seedDecks(X.gm, [], pool, rng, credit, o.pop * 2); // later restarts: random decks only
    const res = await gaSearch(X, pool, Math.round((budget - spent) / (R - r)), sd, rng, credit, opts.bias, R > 1 ? label + ' r' + (r + 1) : label);
    spent += res.games; res.credit = credit; runs.push(res);
  }
  const best = runs.map(x => x.best).sort((a, b) => fitK(X, b).f - fitK(X, a).f || (a < b ? -1 : 1))[0];
  const off = []; let acc = 0; runs.forEach(x => { x.trace.forEach(([g, k]) => off.push([acc + g, k])); acc += x.games; });
  // a merged best-so-far trace
  let bk = null; const trace = off.map(([g, k]) => { if (!bk || fitK(X, k).f > fitK(X, bk).f) bk = k; return [g, bk]; });
  return { method: 'ga', label, restarts: R, gens: runs.reduce((a, x) => a + x.gens, 0), games: spent, best, pop: uniq([].concat(...runs.map(x => x.pop))), runs: runs.map(x => ({ best: x.best, f: r3(fitK(X, x.best).f), gens: x.gens, games: x.games, top: x.pop.slice(0, 4) })), credit: runs[0].credit, trace };
}
// the decks a search ends on: its best, each GA restart's best and top niche leaders, each descent restart's local maximum
const searchKeys = s => uniq([s.best].concat((s.pop || []).slice(0, 4), (s.optima || []).map(x => x.key), ...(s.runs || []).map(x => [x.best].concat(x.top || []))));
function distinctOptima(X, keys, radius, window, max) { // the best decks at least `radius` copies apart and within `window` of the best
  const r = uniq(keys).map(k => ({ k, d: deckFromKey(k), ...fitK(X, k) })).sort((a, b) => b.f - a.f || (a.k < b.k ? -1 : 1)), out = [];
  r.forEach(x => { if (out.length >= max || (out.length && x.f < out[0].f - window)) return; if (out.every(y => dist(x.d, y.d) >= radius)) out.push(x); });
  return out.map(x => x.k);
}

// ---------------------------------------------------------------- head to head (the distinct optima, the ladder)
// entries: for each opponent deck j, a fair mirror under each fight's field; deck i's score over opponent j's entries = i's h2h vs j
function h2hEntries(map, opps) {
  const fights = fightsOf(map), out = [];
  opps.forEach((d, j) => fights.forEach(n => out.push({ key: 'h2h|o' + j + '|' + n.key, kind: 'mirror', node: n.key, opp: d, oppKey: 'o' + j, label: 'vs deck ' + j + ' under ' + n.key + "'s field", weight: 1 / fights.length, oj: j })));
  return out;
}
const idxOf = (entries, j) => entries.map((e, i) => i).filter(i => entries[i].oj === j);

// ---------------------------------------------------------------- one map
function parseArgs(argv) {
  const o = { maps: null, minutes: null, budget: null, workers: Math.max(1, Math.min(os.cpus().length, 8)), seed: 'bramble', crossShare: 0.3, roadWeight: 0.25, ai: 1, owned: 'plan', crossPool: 'rules', submaps: true,
    method: 'ga', restarts: 2, nicheRadius: 5, nicheCap: 2, neighbours: 10, patience: 3, dgmax: 16,
    pop: 16, children: 32, g0: 2, gmax: 32, top: 3, screenCopies: 3, screenMax: null, finalGames: 0, finalMax: 200, finalShare: 0.2, level: 1, beeTank: false,
    distinctRadius: 6, distinctWindow: 0.1, distinctMax: 4, h2hGames: 16,
    ladder: [600, 450, 300, 150], ladderCore: 10, ladderGames: 32, ladderWalks: 8, ladderTol: 60,
    compare: false, evalGames: 48, candidatesOnly: false, rules: null,
    out: null, ckptDir: path.join(os.tmpdir(), 'deckopt'), resume: false, root: null, quiet: false, summary: true, tag: null };
  const a = argv.slice(), take = () => a.shift();
  while (a.length) { const k = take();
    switch (k) {
      case '--map': case '--maps': o.maps = take(); break;
      case '--minutes': o.minutes = +take(); break; case '--budget': o.budget = +take(); break; case '--workers': case '-j': o.workers = +take(); break; case '--seed': o.seed = take(); break;
      case '--cross-share': o.crossShare = +take(); break; case '--road-weight': o.roadWeight = +take(); break; case '--ai': o.ai = +take(); break;
      case '--owned': o.owned = take(); break; case '--cross-pool': o.crossPool = take(); break; case '--no-submaps': o.submaps = false; break; case '--rules': o.rules = take(); break;
      case '--method': o.method = take(); break; case '--restarts': o.restarts = +take(); break; case '--niche-radius': o.nicheRadius = +take(); break; case '--niche-cap': o.nicheCap = +take(); break;
      case '--neighbours': case '--neighbors': o.neighbours = +take(); break; case '--patience': o.patience = +take(); break; case '--dgmax': o.dgmax = +take(); break;
      case '--pop': o.pop = +take(); break; case '--children': o.children = +take(); break; case '--g0': o.g0 = +take(); break; case '--gmax': o.gmax = +take(); break;
      case '--screen-copies': o.screenCopies = +take(); break; case '--screen-max': o.screenMax = +take(); break; case '--final-games': o.finalGames = +take(); break; case '--final-share': o.finalShare = +take(); break;
      case '--level': { const v = take(); o.level = v === 'ref' ? null : +v; break; } case '--bee-tank': o.beeTank = true; break;
      case '--distinct-radius': o.distinctRadius = +take(); break; case '--distinct-window': o.distinctWindow = +take(); break; case '--distinct-max': o.distinctMax = +take(); break; case '--h2h-games': o.h2hGames = +take(); break;
      case '--ladder': { const v = take(); o.ladder = v === 'none' ? [] : v.split(',').map(Number).filter(x => x > 0); break; } case '--no-ladder': o.ladder = []; break;
      case '--ladder-core': o.ladderCore = +take(); break; case '--ladder-games': o.ladderGames = +take(); break; case '--ladder-walks': o.ladderWalks = +take(); break; case '--ladder-tol': o.ladderTol = +take(); break;
      case '--compare': o.compare = true; break; case '--eval-games': o.evalGames = +take(); break; case '--candidates-only': o.candidatesOnly = true; break;
      case '--out': o.out = take(); break; case '--ckpt-dir': o.ckptDir = take(); break; case '--resume': o.resume = true; break; case '--root': o.root = take(); break;
      case '--quiet': o.quiet = true; break; case '--no-summary': o.summary = false; break; case '--tag': o.tag = take(); break;
      case '--gens1': case '--gens2': throw new Error(k + ' was replaced by --budget (search games per map) in deckopt 2 (OPT2)');
      case '--help': case '-h': o.help = true; break; case '--version': o.version = true; break;
      default: throw new Error('unknown option ' + k + ' (--help lists them)');
    } }
  if (o.g0 % 2) o.g0++; // mirror games swap seats: even counts
  if (!['ga', 'descent'].includes(o.method)) throw new Error('--method ga|descent');
  if (o.budget == null && o.minutes == null) o.minutes = 5;
  return o;
}
const HELP = `deckopt ${VERSION}: the strongest deck per map over the real Bramblewood engine (no Claude, no tokens).
  --map N | --maps 0-3 | --maps 0,2,mc    map number(s) or id(s)
  --budget G          search games per map (exact and reproducible)             --minutes M   or: search time per map, turned into games (default 5)
  --workers N         worker threads (default: cores, max 8; 0 = inline)        --seed S       seed (default "bramble")
  --level L | ref     your card level (default 1; ref = the game's reference level)
  --method ga|descent the search (default ga): genetic with --restarts R (2), niching --niche-radius D (5 copies) --niche-cap C (2);
                      or coordinate descent: --neighbours K (10) single-copy swaps a step, --patience P (3) steps without a gain = a local maximum, --dgmax G (16)
  --cross-share F     share of the search for phase 2 (0.3)                     --road-weight F  share of the score from the real fights (0.25)
  --cross-pool rules|plan|live  phase 2's cards: the logic-filtered list (tools/opt/phase2-rules.json, default), every obtainable card, every live card
  --rules FILE        other phase-2 rules                                       --candidates-only  print the phase-2 lists and stop
  --owned plan|none   add what a player owns by then (HUB3 plan, default) or only the map's cards
  --ai L              CPU skill of both sides in the fair mirror (1)
  --pop P --children K --g0 G --gmax G    GA sizes (16, 32, 2, 32)              --screen-copies C  copies of a screened card (3, capped by rarity)
  --final-games G     games per entry in the final (default: 64 with --budget, else what fits --final-share 0.2 of the time)
  --distinct-radius D --distinct-window W --distinct-max N   distinct optima: D copies apart (6), within W of the best (0.1), at most N (4); --h2h-games G (16 per field)
  --ladder 600,450,300,150 | none   the difficulty ladder's Elo gaps below the optimum; --ladder-core C (10 copies shared with the optimum),
                      --ladder-games G (32 per field), --ladder-walks W (8), --ladder-tol T (60 Elo)
  --compare           GA vs descent on the map cards at equal --budget each; best-so-far decks scored on independent seeds (--eval-games 48)
  --ckpt-dir D --resume   per-stage checkpoints (default <tmp>/deckopt) and picking up from them
  --out DIR           output folder (default docs/balance/opt)                  --root DIR     the game checkout (default: this repo; the exe: the working folder)
  --bee-tank          give your side the engine's Bee Tank fallback, as the game's reference harness does (off)
  --tag T             file tag (default: today's date)                          --quiet  --no-summary  --version`;

function mapList(gm, spec) {
  if (!spec) throw new Error('--map is required');
  const out = []; String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(String(i)); } else out.push(p); });
  return out.map(x => resolveMap(gm, x));
}
function saveJSON(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(obj)); fs.renameSync(tmp, file); }
const KEY_RE = /^[^,:]+:\d+(,[^,:]+:\d+)+$/;
function keysIn(v, out) { out = out || new Set(); if (typeof v === 'string') { if (KEY_RE.test(v)) out.add(v); } else if (Array.isArray(v)) v.forEach(x => keysIn(x, out)); else if (v && typeof v === 'object') Object.keys(v).forEach(k => { if (k !== 'stats' && k !== 'hstats') keysIn(v[k], out); }); return out; }

async function optimizeMap(gm, ev, map, o, log, rules) {
  const G = gm.G, t0 = Date.now(), fights = fightsOf(map), pools = poolsFor(gm, map, o);
  const cands = candidatesFor(gm, map, pools, rules);
  const p2pool = o.crossPool === 'rules' ? uniq(pools.p1.concat(cands.list.map(c => c.id))).sort() : pools.all;
  const level = o.level != null ? o.level : G.referenceFightSetup(map.id, fights[0], { deck: {} }).ref.level;
  const entries = buildEntries(gm, map, o), spec = { mapId: map.id, level, entries, seed: o.seed, ai: o.ai, beeTank: o.beeTank };
  const main = entries.map((e, i) => i).filter(i => !entries[i].neutral);
  const ckFile = path.join(o.ckptDir, 'deckopt2-' + map.id + '-' + fnv(JSON.stringify([VERSION, o.seed, o.budget, o.minutes, o.method, o.restarts, o.nicheRadius, o.nicheCap, o.neighbours, o.patience, o.dgmax, o.roadWeight, o.ai, o.owned, o.crossPool, o.crossShare, o.submaps, o.pop, o.children, o.g0, o.gmax, level, o.beeTank, o.screenCopies, o.finalGames, o.ladder, o.ladderCore, p2pool, entries.map(e => e.key)])).toString(36) + '.json');
  let S = null; if (o.resume && fs.existsSync(ckFile)) { S = JSON.parse(fs.readFileSync(ckFile, 'utf8')); log('  resumed from ' + ckFile + ' (stages done: ' + Object.keys(S.stages).join(', ') + ')'); }
  if (!S) S = { rng: fnv(o.seed + '|' + map.id), stages: {}, stats: {}, hstats: {}, credit: {} };
  const rng = mulberry(S.rng), stats = new Stats(entries.length, S.stats), X = { gm, ev, stats, entries, main, o, log, t0 }, games0 = ev.games;
  let hX = null; // the head-to-head context (set up after the final)
  // kept: every deck a stage names, and the fight / reference decks the report rates as your deck
  const checkpoint = () => { S.rng = rng.s; const keep = [...keysIn(S.stages)].concat(entries.filter(e => e.kind === 'mirror' && !e.neutral).map(e => deckKey(e.opp))); S.stats = stats.toJSON(keep); if (hX) S.hstats = hX.stats.toJSON(keep); saveJSON(ckFile, S); };
  const stage = async (name, fn) => { if (S.stages[name]) return S.stages[name]; const r = await fn(); S.stages[name] = r; checkpoint(); return r; };
  await ev.setup(spec);
  log(`  phase 2 candidates (${cands.list.length}, score >= ${cands.minScore}${cands.minScore < cands.minScoreAsked ? ', lowered from ' + cands.minScoreAsked : ''}${cands.cut ? ', ' + cands.cut + ' more cut' : ''}): ` + cands.list.map(c => c.name + ' ' + c.score).join(', '));
  // ---- the budget (games): --budget, or --minutes x the games/s of the seed decks' first games (those games are reused by the search)
  const budget = await stage('budget', async () => {
    if (o.budget != null) return { games: o.budget, from: 'budget' };
    const r0 = mulberry(fnv(o.seed + '|probe|' + map.id)), probe = seedDecks(gm, entries, pools.p1, r0, {}, o.pop * 2).slice(0, 8), t = Date.now(), g = ev.games;
    await ensure(ev, stats, probe, o.g0, main); const gps = (ev.games - g) / Math.max(0.001, (Date.now() - t) / 1000);
    return { games: Math.max(2000, Math.round(o.minutes * 60 * (1 - o.finalShare) * gps)), from: 'minutes', gps: r1(gps) };
  });
  const B1 = Math.round(budget.games * (1 - o.crossShare)), B2 = budget.games - B1;
  // ---- phase 1: the map's cards
  const s1 = await stage('p1', async () => {
    const credit = S.credit, seeds = seedDecks(gm, entries, pools.p1, rng, credit, o.pop * 2);
    const r = await search(X, o.method, pools.p1, B1, rng, seeds, 'p1', { restarts: o.restarts, credit });
    if (r.credit) S.credit = r.credit; delete r.credit; return r; });
  const best1 = s1.best;
  // ---- phase 2a: screen every candidate as a swap into the phase-1 best deck
  const outside = p2pool.filter(id => !pools.p1.includes(id));
  const scr = await stage('screen', async () => {
    const best = deckFromKey(best1), vars = [best], meta = {}, credit = S.credit;
    const order = outside.slice().sort((a, b) => G.skirmishCardScore(gm.D[b]) - G.skirmishCardScore(gm.D[a]) || (a < b ? -1 : 1)).slice(0, o.screenMax != null ? o.screenMax : outside.length);
    order.forEach(id => { const d = Object.assign({}, best); const k = Math.min(o.screenCopies, capOf(gm, id)), removed = [];
      const ord = Object.keys(d).sort((a, b) => cred(credit, a) - cred(credit, b) || (a < b ? -1 : 1));
      for (let i = 0; i < k; i++) { const x = ord.find(y => d[y] > 0); if (!x) break; d[x]--; removed.push(x); if (!d[x]) delete d[x]; }
      let added = 0; while (added < k && canAdd(gm, d, id)) { d[id] = (d[id] || 0) + 1; added++; }
      const fixed = repair(gm, d, p2pool, rng, credit); if (!fixed[id]) return; const kk = deckKey(fixed); if (meta[kk]) return; meta[kk] = { card: id, copies: fixed[id], out: removed }; vars.push(fixed); });
    log(`  screen: ${vars.length - 1} candidate swaps`);
    const ranked = await halving(ev, stats, entries, main, vars, { g0: o.g0, gmax: o.gmax, keep: 8, top: 3 }), base = fitK(X, best1);
    const list = ranked.filter(x => meta[x.k]).map(x => ({ key: x.k, card: meta[x.k].card, copies: meta[x.k].copies, out: meta[x.k].out, f: r3(x.f), se: r3(x.se), n: stats.get(x.k).n[main[0]], delta: r3(x.f - base.f) }));
    log(`  screen done: top swaps ${list.slice(0, 5).map(x => x.card + ' x' + x.copies + ' ' + (x.delta >= 0 ? '+' : '') + r1(x.delta * 100)).join(', ')}`);
    return { base: r3(base.f), list, skipped: outside.length - order.length }; });
  // ---- phase 2b: the search over the map cards + the candidates, from the phase-1 decks and the best swaps
  const s2 = await stage('p2', async () => {
    if (!outside.length) return { method: o.method, best: best1, games: 0, skipped: 'no candidates' };
    const bias = {}; scr.list.forEach(x => { bias[x.card] = Math.max(bias[x.card] == null ? -1 : bias[x.card], x.delta); });
    const swaps = scr.list.slice(0, o.pop).map(x => deckFromKey(x.key));
    if (o.method === 'descent') return search(X, 'descent', p2pool, B2, rng, [deckFromKey(best1)].concat(swaps.slice(0, 3)), 'p2', { restart: () => perturb(gm, deckFromKey(best1), p2pool, rng, 4) });
    const seeds = uniqDecks((s1.pop || [best1]).slice(0, o.pop).map(deckFromKey).concat(swaps));
    const r = await search(X, 'ga', p2pool, B2, rng, seeds, 'p2', { restarts: 1, credit: S.credit, bias }); delete r.credit; return r; });
  const best2 = s2.best;
  // ---- final: fixed games per entry, with and without the field effects
  const fightOpps = entries.filter(e => e.kind === 'mirror' && !e.neutral);
  const rateDecks = fightOpps.map(e => ({ key: e.oppKey, label: e.label.replace(/^vs /, ''), deck: e.opp }));
  const units = 2 * entries.length + rateDecks.length * main.length / 2;
  let FG = o.finalGames;
  if (!FG) FG = budget.from === 'minutes' ? Math.max(20, Math.min(o.finalMax, Math.floor(o.minutes * 60 * o.finalShare * budget.gps / units))) : 64;
  FG = Math.max(2, FG + FG % 2);
  const fin = await stage('final', async () => {
    log(`  final: ${FG} games per entry`);
    const all = entries.map((e, i) => i); await ensure(ev, stats, uniq([best1, best2]).map(deckFromKey), FG, all);
    for (const r of rateDecks) await ensure(ev, stats, [r.deck], FG / 2 + (FG / 2) % 2, main);
    const opt = fitK(X, best2).f > fitK(X, best1).f ? best2 : best1;
    // the distinct optima: every search's best decks, restarts' bests and local maxima, measured to gmax, then kept apart
    const pool = uniq(searchKeys(s1).concat(s2.best ? searchKeys(s2) : []));
    await ensure(ev, stats, pool.map(deckFromKey), o.method === 'descent' ? o.dgmax : o.gmax, main);
    const dk = distinctOptima(X, [opt].concat(pool), o.distinctRadius, o.distinctWindow, o.distinctMax);
    const optima = [opt].concat(dk.filter(k => k !== opt && dist(deckFromKey(k), deckFromKey(opt)) >= o.distinctRadius)).slice(0, o.distinctMax);
    await ensure(ev, stats, optima.map(deckFromKey), FG, main);
    return { FG, optimum: opt, optima, candidatesConsidered: pool.length }; });
  // ---- head to head: the distinct optima's round robin, and the difficulty ladder against the optimum
  const hEntries = h2hEntries(map, fin.optima.map(deckFromKey)), hSpec = { mapId: map.id, level, entries: hEntries, seed: o.seed + '|h2h', ai: o.ai, beeTank: o.beeTank };
  hX = { gm, ev, stats: new Stats(hEntries.length, S.hstats), entries: hEntries, main: idxOf(hEntries, 0), o, log, t0 };
  const needH = !S.stages.h2h || (o.ladder.length && !S.stages.ladder);
  if (needH) await ev.setup(hSpec);
  const h2h = await stage('h2h', async () => {
    const M = fin.optima.map(() => fin.optima.map(() => null));
    for (let i = 0; i < fin.optima.length; i++) for (let j = i + 1; j < fin.optima.length; j++) {
      const idx = idxOf(hEntries, j); await ensure(ev, hX.stats, [deckFromKey(fin.optima[i])], o.h2hGames, idx);
      const st = hX.stats.get(fin.optima[i]), f = fitness(hEntries, st, idx), n = idx.reduce((a, x) => a + st.n[x], 0);
      M[i][j] = { p: r3(f.f), elo: Math.round(elo(f.f, n)), n }; M[j][i] = { p: r3(1 - f.f), elo: -Math.round(elo(f.f, n)), n }; }
    return { matrix: M }; });
  const ladder = !o.ladder.length ? null : await stage('ladder', async () => makeLadder(hX, map, deckFromKey(fin.optimum), p2pool, rng, log));
  const wallS = (Date.now() - t0) / 1000, played = ev.games - games0;
  // ---- the report
  const per = (k, idx) => { const st = stats.get(k); return idx.map(i => { const n = st.n[i], p = n ? st.s[i] / n : null, ci = wilson(p || 0, n); return { entry: entries[i].key, label: entries[i].label, kind: entries[i].kind, neutral: !!entries[i].neutral, p: r3(p), lo: r3(ci[0]), hi: r3(ci[1]), n }; }); };
  const allIdx = entries.map((e, i) => i);
  const cardsOf = d => Object.keys(d).sort((a, b) => d[b] - d[a] || (a < b ? -1 : 1)).map(id => ({ id, name: gm.D[id].name, copies: d[id], rarity: gm.D[id].rarity, inMapPool: pools.mapCards.includes(id), owned: pools.owned.includes(id), outOfMap: !pools.p1.includes(id) }));
  const deckOut = (k, name) => { const d = deckFromKey(k), fit = fitK(X, k), mir = fitness(entries, stats.get(k), main.filter(i => entries[i].kind === 'mirror')), road = fitness(entries, stats.get(k), main.filter(i => entries[i].kind === 'road'));
    return { name, deck: d, cards: cardsOf(d), score: r3(fit.f), ci: [r3(fit.f - 1.96 * fit.se), r3(fit.f + 1.96 * fit.se)], mirror: r3(mir.f), road: road.se < 1 ? r3(road.f) : null, perEntry: per(k, allIdx) }; };
  const opt1 = deckOut(best1, 'optimum (map cards)'), opt2 = best2 && best2 !== best1 ? deckOut(best2, 'optimum (map cards + candidates)') : null, optK = fin.optimum;
  const fieldImpact = fightOpps.map(e => { const i = entries.indexOf(e), j = entries.findIndex(x => x.neutral && x.oppKey === e.oppKey), st = stats.get(optK);
    const pf = st.s[i] / st.n[i], pn = st.s[j] / st.n[j], se = Math.sqrt(pf * (1 - pf) / st.n[i] + pn * (1 - pn) / st.n[j]);
    return { opponent: e.oppKey, node: e.node, rules: ruleSummary(gm, map, e.node), withField: r3(pf), noField: r3(pn), delta: r3(pf - pn), ci: [r3(pf - pn - 1.96 * se), r3(pf - pn + 1.96 * se)] }; });
  const gap = rateDecks.map(r => { const e = fightOpps.find(x => x.oppKey === r.key), i = entries.indexOf(e), st = stats.get(optK), n = st.n[i], p = st.s[i] / n, ci = wilson(p, n);
    const subset = main.filter(x => entries[x].oppKey !== r.key), mine = fitness(entries, stats.get(deckKey(r.deck)), subset), best = fitness(entries, st, subset);
    const node = fights.find(f => f.key === e.node);
    return { opponent: r.key, label: r.label, kind: r.key.startsWith('fight:') ? (node.kind || 'skirmish') : 'reference', node: e.node,
      target: r.key.startsWith('fight:') ? (G.roadCurveTarget(map.id, node) || {}).t : null,
      h2h: r3(p), h2hCI: [r3(ci[0]), r3(ci[1])], elo: Math.round(elo(p, n)), eloCI: [Math.round(elo(ci[0], n)), Math.round(elo(ci[1], n))], n,
      asPlayer: r3(mine.f), optimumSame: r3(best.f), pointsBelow: r1((best.f - mine.f) * 100), pointsCI: r1(1.96 * Math.sqrt(mine.se * mine.se + best.se * best.se) * 100) }; });
  const reportRoad = fights.map(n => { const i = entries.findIndex(e => e.key === 'road|' + n.key); if (i < 0) return null; const st1 = stats.get(optK), p = st1.s[i] / st1.n[i], ci = wilson(p, st1.n[i]); const t = G.roadCurveTarget(map.id, n);
    return { node: n.key, kind: n.kind || 'skirmish', target: t ? t.t : null, optimum: r3(p), ci: [r3(ci[0]), r3(ci[1])], n: st1.n[i] }; }).filter(Boolean);
  const searchOut = s => s && ({ method: s.method, games: s.games, gens: s.gens, restarts: s.restarts, steps: s.steps, moves: s.moves, runs: s.runs, localOptima: s.optima ? s.optima.map(x => ({ score: x.f, moves: x.moves, local: x.local })) : undefined, skipped: s.skipped });
  const out = { tool: 'tools/opt/deckopt.js', version: VERSION, generated: new Date().toISOString(), map: { id: map.id, num: pools.mapNo, name: map.name },
    level, settings: { seed: o.seed, budget: budget.games, budgetFrom: budget.from, method: o.method, restarts: o.restarts, nicheRadius: o.nicheRadius, nicheCap: o.nicheCap, neighbours: o.neighbours, patience: o.patience, dgmax: o.dgmax, distinctRadius: o.distinctRadius, distinctWindow: o.distinctWindow, ladderCore: o.ladderCore,
      crossShare: o.crossShare, roadWeight: o.roadWeight, ai: o.ai, owned: o.owned, crossPool: o.crossPool, submaps: o.submaps, pop: o.pop, children: o.children, g0: o.g0, gmax: o.gmax, screenCopies: o.screenCopies, beeTank: o.beeTank, minutes: o.minutes, workers: o.workers },
    reproduce: `node tools/opt/deckopt.js --map ${map.id} --seed ${o.seed} --budget ${budget.games} --final-games ${FG} --method ${o.method} --level ${o.level == null ? 'ref' : o.level} --cross-share ${o.crossShare} --road-weight ${o.roadWeight}` + (o.method === 'ga' && o.restarts !== 2 ? ' --restarts ' + o.restarts : '') + (o.crossPool !== 'rules' ? ' --cross-pool ' + o.crossPool : '') + (o.owned !== 'plan' ? ' --owned ' + o.owned : '') + (o.beeTank ? ' --bee-tank' : '') + (o.ladder.join(',') !== '600,450,300,150' ? ' --ladder ' + (o.ladder.join(',') || 'none') : ''),
    pools: { phase1: pools.p1.length, mapCards: pools.mapCards, owned: pools.owned, phase2: p2pool.length, wholeSpectrum: pools.all.length },
    candidates: cands,
    gauntlet: entries.map(e => ({ key: e.key, kind: e.kind, node: e.node, label: e.label, weight: r3(e.weight), neutral: !!e.neutral, rules: ruleSummary(gm, map, e.node, e.neutral) })),
    throughput: { games: played, seconds: r1(wallS), gamesPerSecond: r1(played / wallS), workers: o.workers },
    phase1: { search: searchOut(s1), best: opt1 },
    phase2: { search: searchOut(s2), screenBaseline: scr.base, screened: scr.list.length,
      topSwaps: scr.list.slice(0, 15).map(x => ({ card: x.card, name: gm.D[x.card].name, rarity: gm.D[x.card].rarity, obtainMap: obtainMapOf(gm, x.card), copies: x.copies, out: x.out, score: x.f, delta: x.delta, n: x.n })),
      best: opt2, gainOverPhase1: opt2 ? r3(opt2.score - opt1.score) : 0 },
    optimum: optK === best1 ? 'phase1' : 'phase2',
    optima: fin.optima.map((k, i) => { const d = deckFromKey(k), f = fitK(X, k); return { i, deck: d, cards: cardsOf(d), score: r3(f.f), ci: [r3(f.f - 1.96 * f.se), r3(f.f + 1.96 * f.se)], copiesApartFromOptimum: dist(d, deckFromKey(optK)) }; }),
    optimaH2H: h2h.matrix, optimaConsidered: fin.candidatesConsidered,
    ladder: ladder && ladder.map(x => Object.assign({}, x, { cards: cardsOf(x.deck) })),
    road: reportRoad, fieldImpact, gap };
  S.stages.done = true; checkpoint();
  return out;
}
// The difficulty ladder (OPT2, owner OPT-3: "then we see how to make a range of weaker decks after that"): random walks away from the
// optimum, one copy at a time (half of them toward the pool's weaker cards by skirmishCardScore), never below `ladderCore` copies shared
// with it; every 2 steps a candidate. All candidates play the optimum briefly, the nearest to each target Elo gap are measured further and
// refined by single-copy swaps, and the pick is measured to --ladder-games per field.
async function makeLadder(hX, map, optimum, pool, rng, log) {
  const { gm, ev, stats, entries, o } = hX, G = gm.G, idx = hX.main, size = deckTotal(optimum);
  const gapOf = d => { const st = stats.get(deckKey(d)), f = fitness(entries, st, idx), n = idx.reduce((a, x) => a + st.n[x], 0); return { gap: elo(1 - f.f, n), p: 1 - f.f, n, se: f.se }; };
  const keep = d => overlap(d, optimum) >= o.ladderCore;
  const weak = pool.slice().sort((a, b) => G.skirmishCardScore(gm.D[a]) - G.skirmishCardScore(gm.D[b]) || (a < b ? -1 : 1)).slice(0, Math.ceil(pool.length / 2));
  const cands = [];
  for (let w = 0; w < o.ladderWalks; w++) { let d = Object.assign({}, optimum); const from = w % 2 ? weak : pool;
    for (let s = 1; s <= size - o.ladderCore; s++) {
      const shared = []; Object.keys(d).sort().forEach(id => { for (let c = 0; c < Math.min(d[id], optimum[id] || 0); c++) shared.push(id); });
      if (!shared.length) break; const x = shared[Math.floor(rng.next() * shared.length)], e = Object.assign({}, d); if (--e[x] <= 0) delete e[x];
      const ok = from.filter(y => canAdd(gm, e, y) && (e[y] || 0) >= (optimum[y] || 0)); if (!ok.length) break;
      const y = ok[Math.floor(rng.next() * ok.length)]; e[y] = (e[y] || 0) + 1; d = e;
      if (s % 2 === 0) cands.push(d); } }
  const pool0 = uniqDecks(cands); await ensure(ev, stats, pool0, 4, idx);
  log(`  ladder: ${pool0.length} candidate decks (>= ${o.ladderCore} copies shared with the optimum)`);
  const out = [];
  for (const t of o.ladder) {
    const near = list => list.map(d => ({ d, ...gapOf(d) })).sort((a, b) => Math.abs(a.gap - t) - Math.abs(b.gap - t) || (deckKey(a.d) < deckKey(b.d) ? -1 : 1));
    let top = near(pool0).slice(0, 3).map(x => x.d); await ensure(ev, stats, top, 12, idx);
    let cur = near(top)[0].d;
    for (let round = 0; round < 2 && Math.abs(gapOf(cur).gap - t) > o.ladderTol; round++) {
      const nb = neighbours(gm, cur, pool, rng, 8, keep); await ensure(ev, stats, nb, 6, idx);
      const b = near(nb).slice(0, 2).map(x => x.d); await ensure(ev, stats, b, 12, idx);
      const c = near(b.concat([cur]))[0].d; cur = c; }
    await ensure(ev, stats, [cur], o.ladderGames, idx);
    const g = gapOf(cur), ci = wilson(g.p, g.n);
    out.push({ target: t, key: deckKey(cur), deck: cur, eloGap: Math.round(g.gap), eloCI: [Math.round(elo(1 - ci[1], g.n)), Math.round(elo(1 - ci[0], g.n))], optimumH2H: r3(1 - g.p), n: g.n, sharedWithOptimum: overlap(cur, optimum), hit: Math.abs(g.gap - t) <= o.ladderTol });
    log(`  ladder ${t}: Elo gap ${Math.round(g.gap)} (${g.n} games, ${overlap(cur, optimum)} copies shared)${Math.abs(g.gap - t) <= o.ladderTol ? '' : ' (nearest found)'}`);
  }
  return out;
}
function ruleSummary(gm, map, nodeKey, neutral) {
  if (neutral) return 'Day, no field effects';
  const n = fightsOf(map).find(x => x.key === nodeKey), r = gm.G.fightRules(map.id, n), bits = [];
  Object.keys(r).sort().forEach(k => { const v = r[k]; if (v == null || v === false) return; if (k === 'terrain') bits.push('terrain ' + v.name + ' T' + v.tier + (v.sig ? ' (' + v.sig + ')' : '')); else if (k === 'phase') bits.push('phase ' + v); else bits.push(v === true ? k : k + ' ' + (typeof v === 'object' ? JSON.stringify(v) : v)); });
  return bits.join(', ');
}

// ---------------------------------------------------------------- GA vs descent (OPT2, owner OPT-3: "Idk if we should do grid search based discrete descent or just random")
// Both on the map's phase-1 pool, the same seeds, each its own game budget and caches; every best-so-far deck at 1/4, 1/2 and all of the
// budget is then scored on independent seeds (--eval-games per entry), so neither search is graded on the games it chose its deck by.
async function compareMap(gm, ev, map, o, log) {
  const t0 = Date.now(), pools = poolsFor(gm, map, o), fights = fightsOf(map), G = gm.G;
  const level = o.level != null ? o.level : G.referenceFightSetup(map.id, fights[0], { deck: {} }).ref.level;
  const entries = buildEntries(gm, map, o), main = entries.map((e, i) => i).filter(i => !entries[i].neutral), B = o.budget || 12000, res = {};
  const spec = { mapId: map.id, level, entries, seed: o.seed, ai: o.ai, beeTank: o.beeTank }; await ev.setup(spec);
  for (const m of ['ga', 'descent']) {
    const rng = mulberry(fnv(o.seed + '|' + map.id)), X = { gm, ev, stats: new Stats(entries.length), entries, main, o, log, t0: Date.now() }, credit = {};
    const seeds = seedDecks(gm, entries, pools.p1, rng, credit, o.pop * 2), t = Date.now();
    const s = await search(X, m, pools.p1, B, rng, seeds, m, { restarts: o.restarts, credit });
    const keys = searchKeys(s); await ensure(ev, X.stats, keys.map(deckFromKey), m === 'descent' ? o.dgmax : o.gmax, main);
    const distinct = distinctOptima(X, keys, o.distinctRadius, o.distinctWindow, 10);
    res[m] = { s, X, seconds: r1((Date.now() - t) / 1000), distinct };
  }
  const evSpec = Object.assign({}, spec, { seed: o.seed + '|eval' }); await ev.setup(evSpec);
  const E = new Stats(entries.length), fr = [0.25, 0.5, 1], at = (s, g) => { let k = s.trace[0][1]; s.trace.forEach(([gg, kk]) => { if (gg <= g) k = kk; }); return k; };
  const pick = {}; Object.keys(res).forEach(m => { pick[m] = fr.map(f => at(res[m].s, f * B)); });
  await ensure(ev, E, uniq([].concat(...Object.values(pick))).map(deckFromKey), o.evalGames, main);
  const evalOf = k => { const f = fitness(entries, E.get(k), main); return { score: r3(f.f), se: r3(f.se) }; };
  const out = { map: { id: map.id, num: pools.mapNo, name: map.name }, level, budget: B, evalGames: o.evalGames, pool: pools.p1.length, methods: {} };
  Object.keys(res).forEach(m => { const r = res[m], s = r.s;
    out.methods[m] = { games: s.games, seconds: r.seconds, gens: s.gens, restarts: s.restarts, steps: s.steps, moves: s.moves,
      curve: fr.map((f, i) => ({ share: f, games: Math.round(f * B), deck: pick[m][i], searchScore: r3(fitness(entries, r.X.stats.get(pick[m][i]), main).f), ...evalOf(pick[m][i]) })),
      distinctOptima: r.distinct.length, distinctScores: r.distinct.map(k => r3(fitK(r.X, k).f)), localOptima: s.optima ? s.optima.map(x => ({ score: x.f, moves: x.moves, local: x.local })) : undefined }; });
  // the two final decks head to head under each fight's field (fair mirror, independent seeds)
  const a = pick.ga[2], b = pick.descent[2];
  if (a !== b) { const he = h2hEntries(map, [deckFromKey(b)]); await ev.setup({ mapId: map.id, level, entries: he, seed: o.seed + '|cmp', ai: o.ai, beeTank: o.beeTank });
    const H = new Stats(he.length), idx = idxOf(he, 0); await ensure(ev, H, [deckFromKey(a)], o.h2hGames * 2, idx); const f = fitness(he, H.get(a), idx), n = idx.reduce((s, i) => s + H.get(a).n[i], 0);
    out.h2h = { gaVsDescent: r3(f.f), elo: Math.round(elo(f.f, n)), n }; } else out.h2h = { same: true };
  out.distance = dist(deckFromKey(a), deckFromKey(b));
  log(`  compare: GA ${pct(out.methods.ga.curve[2].score)} vs descent ${pct(out.methods.descent.curve[2].score)} (independent seeds, ${o.evalGames} games per entry)`);
  return out;
}

// ---------------------------------------------------------------- the summary (markdown)
const pct = v => v == null ? '-' : Math.round(v * 1000) / 10 + '%';
function deckLine(d) { return d.cards.map(c => c.copies + 'x ' + c.name + (c.outOfMap ? ' (candidate)' : c.owned ? ' (owned)' : '')).join(', '); }
function candidatesMd(c) {
  const L = [`Phase 2 candidates: **${c.list.length}** (score >= ${c.minScore}${c.minScore < c.minScoreAsked ? ', lowered from ' + c.minScoreAsked + ' to reach ' + c.list.length : ''}${c.cut ? '; ' + c.cut + ' more qualified and were cut at the cap' : ''}). Map: biome ${c.facts.biome || '?'} (kin ${c.facts.kinBiomes.join(', ') || '-'}), terrain types ${c.facts.terrainTypes.join(', ') || '-'}, field ${c.facts.field.join(', ') || '-'}, unit types ${c.facts.mapTypes.join(', ') || '-'}, skill families ${c.facts.mapMechanics.join(', ') || '-'}.`, '',
    '| Card | rarity | obtainable | score | why |', '|---|---|---|---|---|'];
  c.list.forEach(r => L.push(`| ${r.name} | ${r.rarity} | Map ${r.obtainMap == null ? '?' : r.obtainMap} | ${r.score} | ${r.reasons.join('; ')} |`));
  L.push('', 'Excluded: ' + c.excluded.map(e => e.reason + ' ' + e.n).join('; ') + '.', '');
  return L;
}
function summaryMd(reports, tag) {
  const L = [`# Deck optimizer results (${tag})`, '', 'Generated by `tools/opt/deckopt.js` (packages OPT, OPT2). Your level: ' + uniq(reports.map(r => r.level)).join(', ') + '. Fair mirror: both sides at your level, your bramble, CPU skill 1, seats swapped; "road" = the fight as the game builds it. Score = 0.75 mirror + 0.25 road unless the settings say otherwise. Elo gap = 400 log10(p / (1 - p)) of the optimum\'s head-to-head score against that deck (+200 = the optimum wins 76%, +400 = 91%, +600 = 97%). "Owned" = a Base card, or a card obtainable before this map (HUB3 progression plan). "Candidate" = a phase-2 card (tools/opt/phase2-rules.json).', ''];
  reports.forEach(r => {
    L.push(`## Map ${r.map.num}: ${r.map.name} (\`${r.map.id}\`), your level ${r.level}`, '');
    const s1 = r.phase1.search, s2 = r.phase2.search;
    L.push(`- Throughput: ${r.throughput.games} games in ${r.throughput.seconds} s = **${r.throughput.gamesPerSecond} games/s** (${r.throughput.workers} workers). Search: ${s1.method}, budget ${r.settings.budget} games (${s1.games} map cards${s1.gens != null ? ', ' + s1.gens + ' generations' : ''}${s1.restarts ? ', ' + s1.restarts + ' restarts' : ''}; ${s2.games} with the candidates). Reproduce: \`${r.reproduce}\``);
    L.push(`- Pool: ${r.pools.phase1} cards (${r.pools.mapCards.length} map cards + ${r.pools.owned.length} owned by then); phase 2 ${r.pools.phase2} (+${r.candidates.list.length} candidates).`, '');
    candidatesMd(r.candidates).forEach(x => L.push(x));
    L.push(`- **Optimum (map cards)**: score ${pct(r.phase1.best.score)} [${pct(r.phase1.best.ci[0])}, ${pct(r.phase1.best.ci[1])}], mirror ${pct(r.phase1.best.mirror)}, road ${pct(r.phase1.best.road)}: ${deckLine(r.phase1.best)}`);
    if (r.phase2.best) L.push(`- **Optimum (map cards + candidates)**: score ${pct(r.phase2.best.score)} (${r.phase2.gainOverPhase1 >= 0 ? '+' : ''}${Math.round(r.phase2.gainOverPhase1 * 1000) / 10} pts): ${deckLine(r.phase2.best)}`);
    else L.push('- With the candidates: no deck beat the map-card optimum.');
    L.push(`- Best candidate swaps into the map-card optimum: ${r.phase2.topSwaps.slice(0, 6).map(s => s.name + ' x' + s.copies + ' ' + (s.delta >= 0 ? '+' : '') + Math.round(s.delta * 1000) / 10).join('; ') || '-'}`, '');
    L.push(`**Distinct optima** (at least ${r.settings.distinctRadius} copies apart, within ${Math.round(r.settings.distinctWindow * 100)} points of the best, from ${r.optimaConsidered} decks the searches ended on): ${r.optima.length}`, '');
    r.optima.forEach(x => L.push(`${x.i}. ${pct(x.score)} [${pct(x.ci[0])}, ${pct(x.ci[1])}], ${x.copiesApartFromOptimum} copies from the optimum: ${deckLine(x)}`));
    if (r.optima.length > 1) { L.push('', '| row vs column (fair h2h, the map\'s fields) | ' + r.optima.map(x => x.i).join(' | ') + ' |', '|---|' + r.optima.map(() => '---|').join(''));
      r.optimaH2H.forEach((row, i) => L.push(`| ${i} | ` + row.map(c => c ? pct(c.p) + ' (' + (c.elo >= 0 ? '+' : '') + c.elo + ')' : '-').join(' | ') + ' |')); }
    L.push('');
    if (r.ladder) { L.push('**Difficulty ladder** (legal decks from the same pool, at least ' + Math.min(...r.ladder.map(x => x.sharedWithOptimum)) + ' copies shared with the optimum; Elo gap = how far below the optimum, head to head under the map\'s fields):', '', '| target | Elo gap [95%] | optimum wins | games | shared | deck |', '|---|---|---|---|---|---|');
      r.ladder.forEach(x => L.push(`| ${x.target} | ${x.eloGap} [${x.eloCI[0]}, ${x.eloCI[1]}]${x.hit ? '' : ' (nearest)'} | ${pct(x.optimumH2H)} | ${x.n} | ${x.sharedWithOptimum} | ${deckLine(x)} |`)); L.push(''); }
    { const fg = r.gap.filter(g => g.kind !== 'reference'), el = fg.map(g => g.elo).sort((a, b) => a - b), pb = fg.map(g => g.pointsBelow).sort((a, b) => a - b);
      if (fg.length) L.push(`- **Fight decks vs the optimum:** Elo gap median ${el[Math.floor(el.length / 2)]} (${el[0]} to ${el[el.length - 1]}${fg.some(g => g.h2h >= 1) ? '; a 100% head-to-head is shown as "≥", the games could not tell more' : ''}); as your deck they score ${pb[0]} to ${pb[pb.length - 1]} points below the optimum.`, ''); }
    L.push('| Opponent deck | fair h2h of the optimum | Elo gap | its own score as your deck | pts below optimum | road target |', '|---|---|---|---|---|---|');
    r.gap.forEach(g => L.push(`| ${g.label} | ${pct(g.h2h)} [${pct(g.h2hCI[0])}-${pct(g.h2hCI[1])}] | ${g.h2h >= 1 ? '≥' : ''}${g.elo} [${g.eloCI[0]}, ${g.h2h >= 1 ? '∞' : g.eloCI[1]}] | ${pct(g.asPlayer)} | ${g.pointsBelow} ±${g.pointsCI} | ${g.target == null ? '-' : pct(g.target)} |`));
    L.push('', '| Fight (as the game builds it) | optimum wins | road-curve target |', '|---|---|---|');
    r.road.forEach(x => L.push(`| ${x.node} ${x.kind} | ${pct(x.optimum)} [${pct(x.ci[0])}-${pct(x.ci[1])}] | ${pct(x.target)} |`));
    L.push('', '| Field (fight) | optimum with field | without | impact |', '|---|---|---|---|');
    r.fieldImpact.forEach(f => L.push(`| ${f.opponent} @ ${f.node}: ${f.rules || '-'} | ${pct(f.withField)} | ${pct(f.noField)} | ${f.delta >= 0 ? '+' : ''}${Math.round(f.delta * 1000) / 10} [${Math.round(f.ci[0] * 1000) / 10}, ${Math.round(f.ci[1] * 1000) / 10}] |`));
    L.push('');
  });
  return L.join('\n') + '\n';
}
function compareMd(list, tag) {
  const L = [`# GA vs coordinate descent (${tag})`, '', 'Generated by `tools/opt/deckopt.js --compare` (package OPT2). Each method searches the map\'s phase-1 pool (map cards + owned) from the same seed decks with the same game budget and its own caches. Its best-so-far deck at 1/4, 1/2 and the whole budget is then scored on **independent seeds** (the search never saw them): "eval". "search" is the score on the search\'s own seeds (optimistic: the winner\'s curse). Distinct optima: decks at least 6 copies apart within 10 points of the method\'s best.', '',
    '| Map | budget | GA eval at 1/4 · 1/2 · all | descent eval at 1/4 · 1/2 · all | GA vs descent h2h | distinct optima GA / descent | descent restarts (local maxima) | copies apart |', '|---|---|---|---|---|---|---|---|'];
  list.forEach(c => { const g = c.methods.ga, d = c.methods.descent;
    L.push(`| ${c.map.num} ${c.map.name} | ${c.budget} | ${g.curve.map(x => pct(x.score)).join(' · ')} | ${d.curve.map(x => pct(x.score)).join(' · ')} | ${c.h2h.same ? 'same deck' : pct(c.h2h.gaVsDescent) + ' (' + (c.h2h.elo >= 0 ? '+' : '') + c.h2h.elo + ')'} | ${g.distinctOptima} / ${d.distinctOptima} | ${d.restarts} (${(d.localOptima || []).filter(x => x.local).length}) | ${c.distance} |`); });
  const mean = (m, i) => list.reduce((a, c) => a + c.methods[m].curve[i].score, 0) / list.length;
  L.push('', `Mean eval score: GA ${[0, 1, 2].map(i => pct(mean('ga', i))).join(' · ')}; descent ${[0, 1, 2].map(i => pct(mean('descent', i))).join(' · ')} (1/4 · 1/2 · all of the budget).`, '');
  list.forEach(c => { L.push(`- Map ${c.map.num}: GA ${c.methods.ga.gens} generations over ${c.methods.ga.restarts} restarts, ${c.methods.ga.seconds} s; descent ${c.methods.descent.steps} steps, ${c.methods.descent.moves} moves, ${c.methods.descent.restarts} restarts, ${c.methods.descent.seconds} s. Search-seed score of the final deck: GA ${pct(c.methods.ga.curve[2].searchScore)}, descent ${pct(c.methods.descent.curve[2].searchScore)}.`); });
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
  const gm = loadGame(root), maps = mapList(gm, o.maps), rules = loadRules(root, o.rules), reports = [];
  if (o.candidatesOnly) { // the phase-2 lists, no games
    maps.forEach(m => { const p = poolsFor(gm, m, o), c = candidatesFor(gm, m, p, rules); reports.push({ map: { id: m.id, num: p.mapNo, name: m.name }, candidates: c });
      console.log(`Map ${p.mapNo} ${m.name} (${m.id}): ${c.list.length} candidates (score >= ${c.minScore})`); c.list.forEach(r => console.log(`  ${r.score}  ${r.name} (${r.rarity}, Map ${r.obtainMap})  ${r.reasons.join('; ')}`)); });
    return reports; }
  const ev = new Evaluator(root, o.workers, gm);
  log(`deckopt ${VERSION}: ${maps.length} map(s), ${o.budget != null ? o.budget + ' games' : o.minutes + ' min'} each, ${o.workers} workers, seed ${o.seed}, level ${o.level == null ? 'ref' : o.level}, ${o.compare ? 'GA vs descent' : o.method}`);
  try {
    for (const m of maps) { log(`Map ${gm.G.mapNumberOf(m.id)} ${m.name} (${m.id})`);
      if (o.compare) { reports.push(await compareMap(gm, ev, m, o, log)); continue; }
      const r = await optimizeMap(gm, ev, m, o, log, rules); reports.push(r);
      const f = path.join(outDir, `deckopt-map${String(r.map.num).padStart(2, '0')}-${m.id}-${tag}.json`); fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(r, null, 1) + '\n');
      log(`  -> ${path.relative(root, f)}  optimum ${pct((r.phase2.best && r.optimum === 'phase2' ? r.phase2.best : r.phase1.best).score)}; ${r.optima.length} distinct optima; ladder ${(r.ladder || []).map(x => x.target + ':' + x.eloGap).join(' ')}`); }
  } finally { ev.close(); }
  if (o.compare) { fs.mkdirSync(outDir, { recursive: true }); const f = path.join(outDir, `deckopt-compare-${tag}`);
    // merge with the maps already in this tag's file (one map per run is fine)
    let prev = []; try { prev = JSON.parse(fs.readFileSync(f + '.json', 'utf8')).maps.filter(x => !reports.some(r => r.map.id === x.map.id)); } catch (e) { /* none */ }
    const all = prev.concat(reports).sort((a, b) => a.map.num - b.map.num);
    fs.writeFileSync(f + '.json', JSON.stringify({ tool: 'tools/opt/deckopt.js --compare', version: VERSION, generated: new Date().toISOString(), seed: o.seed, maps: all }, null, 1) + '\n');
    fs.writeFileSync(f + '.md', compareMd(all, tag)); log('compare -> ' + path.relative(root, f) + '.md'); return reports; }
  if (o.summary) { // the summary covers every map file of this tag in the folder
    const all = fs.readdirSync(outDir).filter(f => f.startsWith('deckopt-map') && f.endsWith('-' + tag + '.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'))).filter(r => r.candidates);
    const sf = path.join(outDir, `deckopt-summary-${tag}.md`); fs.writeFileSync(sf, summaryMd(all, tag)); log('summary -> ' + path.relative(root, sf)); }
  return reports;
}
if (typeof module !== 'undefined') module.exports = { parseArgs, loadGame, loadRules, resolveMap, fightsOf, poolsFor, candidatesFor, mapFacts, repair, canAdd, capOf, buildEntries, makeContexts, runJobs, deckKey, deckFromKey, deckTotal, mulberry, wilson, elo, overlap, dist, nicheSelect, neighbours, optimizeMap, compareMap, Evaluator, main, summaryMd, compareMd, VERSION };
if (isMainThread && (require.main === module || SEA)) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
