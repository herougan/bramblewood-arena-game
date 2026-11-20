// 2026-11-20 (package SKM1, owner 00:40: "Please measure the skill budget more ... Until we have 100 different ways of measuring skills"):
// the skill-measurement program's shared core. Measurement only: no card, price or engine change.
//   - universe(): the skills on Maps 0-20 cards (the maps' own pools, deckopt's bpro list), their carriers and today's price per skill
//     (the carrier's cap-1 left side (3A + H) x m + S with the skill minus without it, bramblewood-budget.js via tools/skill_costs.js,
//     averaged over the carriers; the bench's T2 definition);
//   - Sim: a worker pool that plays paired fights for a context spec and a slot variant (tools/bench/lib.js's variants and slot), and keeps
//     each game's outcome (score, rounds, both brambles' Health left) so one game feeds several estimators. Cached per game fingerprint.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const L = require('../bench/lib.js');
const SK = require('../bench/skill.js');
const O = L.O, C = L.C, ROOT = L.ROOT, fnv = L.fnv;
const VERSION = 'skm 1.0 (2026-11-20)';
const CACHE = process.env.SKM_CACHE || path.join(os.tmpdir(), 'skm-cache');
const MAPS = Array.from({ length: 21 }, (_, i) => i);

// ---------------------------------------------------------------- the skill universe of Maps 0-20
let UNI = null;
function universe(gm) {
  if (UNI) return UNI;
  gm = gm || O.loadGame(ROOT);
  const perMap = {}, union = new Set(), fields = [], roadFights = [];
  MAPS.forEach(n => {
    const map = O.resolveMap(gm, n);
    const pools = O.poolsFor(gm, map, { mode: 'bpro', rarityCap: 'map', faction: false, owned: 'plan', submaps: true });
    const pool = pools.p1.filter(id => C.fieldable(gm, id)).sort();
    const lvl = gm.G.referenceFightSetup(map.id, O.fightsOf(map)[0], { deck: {} }).ref.level;
    const fs_ = O.fightsOf(map).map(nd => ({ at: map.id + ':' + nd.key, rules: gm.G.fightRules(map.id, nd) || {} }));
    perMap[n] = { id: map.id, pool, level: lvl, fields: fs_, fights: O.fightsOf(map).map(nd => nd.key) };
    pool.forEach(id => union.add(id)); fs_.forEach(f => fields.push(f));
  });
  const pool = [...union].sort(), skills = {};
  pool.forEach(id => SK.skillsOf(gm, gm.D[id]).forEach(s => { (skills[s] = skills[s] || { skill: s, carriers: [], maps: new Set() }).carriers.push(id); }));
  MAPS.forEach(n => perMap[n].pool.forEach(id => SK.skillsOf(gm, gm.D[id]).forEach(s => skills[s].maps.add(n))));
  Object.values(skills).forEach(S => {
    S.maps = [...S.maps].sort((a, b) => a - b);
    S.prices = S.carriers.map(id => priceOn(gm, id, S.skill, 1));
    S.price = S.prices.reduce((a, b) => a + b, 0) / S.prices.length;
    S.firstMap = S.maps[0];
  });
  UNI = { gm, perMap, pool, fields, skills, list: Object.keys(skills).sort() };
  return UNI;
}
// the variant of `card` without skill s, and the price of s on card (cap-1 left side with minus without, at `level`)
const withoutV = (card, s) => s.startsWith('T:') ? { base: card, rmTrig: s.slice(2) } : { base: card, rm: [s] };
function priceOn(gm, card, s, level) {
  const w = L.budgetOf(L.printedDef(gm, { base: card }), level), o = L.budgetOf(L.printedDef(gm, withoutV(card, s)), level);
  return w.x1 - o.x1;
}
// the N (budget) of a card at a level
const nOf = (gm, card, level) => L.budgetOf(L.printedDef(gm, { base: card }), level).N;
// skill added to a body: copied from a real carrier
function addOf(gm, from, s) {
  const e = gm.D[from].effects || {};
  if (s.startsWith('T:')) return { addTrig: e.triggers.filter(t => t && (t.on + '>' + t.do) === s.slice(2)) };
  const add = { [s]: e[s] }; L.paramKeysOf(gm, e, s).forEach(p => { add[p] = e[p]; }); return { add };
}
// the vanilla bodies of a pool: no skill, Attack >= 1, Health >= 3; sorted by closeness to their full budget
function vanillaBodies(gm, pool, level) {
  return pool.filter(id => { const d = gm.D[id]; return !Object.keys(d.effects || {}).length && d.attack >= 1 && d.health >= 3; })
    .map(id => { const b = L.budgetOf(gm.D[id], level || 1); return { id, u: Math.abs(1 - b.x1 / b.N), r: gm.D[id].rarity }; })
    .sort((a, b) => a.u - b.u || (a.id < b.id ? -1 : 1)).map(x => x.id);
}

// ---------------------------------------------------------------- contexts
// cs: {kind: 'rand'|'homo'|'road'|'pro', scope: 'global'|'maps'|'map:N', fields: 'pool'|'neutral', level, k, bramble, aiMe, aiFoe, seed, foe:'random'|'vanilla'|'same'}
function contextOf(gm, cs) {
  const U = universe(gm); let pool, fields, level, mapNo = null;
  if (cs.scope && cs.scope.startsWith('map:')) { mapNo = +cs.scope.slice(4); const P = U.perMap[mapNo]; pool = P.pool; fields = P.fields; level = P.level; }
  else if (cs.scope === 'global') { const S = C.setupOf(gm); pool = S.cards; fields = S.fields; level = 1; }
  else { pool = U.pool; fields = U.fields; level = 1; }
  if (cs.level != null) level = cs.level;
  if (cs.fields === 'neutral') fields = [{ at: 'neutral', rules: { phase: 'day' } }];
  const X = Object.assign({ k: 6, bramble: 30, aiMe: 1, aiFoe: 1, seed: 'skm1', foe: 'random', kind: 'rand' }, cs);
  X.pool = pool; X.fieldList = fields; X.level = level; X.mapNo = mapNo; X.cs = cs; X.fights = new Map();
  if (X.kind === 'road') { // the fights of the scope's maps as the game builds them
    const maps = mapNo != null ? [mapNo] : MAPS; X.road = [];
    maps.forEach(n => { const map = O.resolveMap(gm, n); O.fightsOf(map).forEach(nd => X.road.push({ map: map.id, node: nd.key, n })); });
  }
  if (X.kind === 'pro') { // PRO / BPRO decks of the scope's maps as the opponent (fair mirror)
    const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')); X.pro = [];
    Object.values(J.maps).forEach(m => { if (m.map == null || m.map > 20 || (mapNo != null && m.map !== mapNo)) return;
      ['pro', 'bpro'].forEach(k => (m[k] || []).forEach(p => p.deck && X.pro.push({ id: p.id, deck: p.deck, rules: (m.field && m.field.rules) || {} }))); });
  }
  X.key = fnv(JSON.stringify([VERSION, L.fingerprint(), cs])).toString(36);
  X.name = [X.kind, (cs.scope || 'maps').replace(':', ''), cs.fields || 'pool', 'L' + level, 'k' + X.k, 'b' + X.bramble, 'ai' + X.aiMe + X.aiFoe, X.foe, X.seed].join('-');
  return X;
}
const VAN_FOE = 'skm-foe';
function fightOf(gm, X, i) {
  let f = X.fights.get(i); if (f) return f;
  const rng = O.mulberry(fnv(X.seed + '|skm|' + i));
  f = { R: X.rest ? X.rest : X.kind === 'homo' ? {} : L.randomDeck(gm, X.pool, rng, 20 - X.k), f: Math.floor(rng.next() * X.fieldList.length) };
  if (X.kind === 'road') f.road = X.road[i % X.road.length];
  else if (X.kind === 'pro') { f.pro = X.pro[i % X.pro.length]; }
  else if (X.foe === 'vanilla') f.B = { [VAN_FOE]: 20 };
  else if (X.foe === 'body') f.B = { [X.body]: 20 }; // the mirror: 20 copies of the vanilla body
  else if (X.foe === 'bodyV') f.B = {}; // the bumped body (X.foeV), built in makeGame
  else f.B = L.randomDeck(gm, X.pool, rng, 20);
  X.fights.set(i, f); return f;
}
function restFor(gm, X, i, card) {
  const R = fightOf(gm, X, i).R; if (!card || !R[card]) return R;
  const rng = O.mulberry(fnv(X.seed + '|sub|' + i + '|' + card)), out = Object.assign({}, R); let c = out[card]; delete out[card];
  while (c > 0) { let id = null; for (let t = 0; !id && t < 400; t++) { const y = X.pool[Math.floor(rng.next() * X.pool.length)]; if (y !== card && O.canAdd(gm, out, y)) id = y; }
    if (!id) break; out[id] = (out[id] || 0) + 1; c--; }
  return out;
}

// ---------------------------------------------------------------- one game, with its outcome
function makeGame(gm, X) {
  const G = gm.G, E = gm.E, defs = G.referenceBaseDefs();
  const castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: X.bramble, rarity: 'common', archetypes: ['Castle'], effects: {} };
  // the owner's standard enemy body (2026-10-21): a 4/11 with no abilities, scaled to the context's level by the budget's ratio
  if (!defs[VAN_FOE]) defs[VAN_FOE] = { id: VAN_FOE, name: 'Standard foe', icon: '▫️', cost: 0, wait: 0, attack: X.foeA || 3, health: X.foeH || 9, rarity: 'common', archetypes: [], effects: {}, bench: true };
  const roadCtx = new Map(), mode = G.CONQUEST_DEFAULT_MODE || 'open';
  function roadSetup(fx) {
    const k = fx.road.map + ':' + fx.road.node; let c = roadCtx.get(k); if (c) return c;
    const map = O.resolveMap(gm, fx.road.map), node = O.fightsOf(map).find(n => n.key === fx.road.node);
    c = G.referenceFightSetup(map.id, node, { deck: {}, level: X.level }); roadCtx.set(k, c); return c;
  }
  return function play(i, v, card) {
    const fx = fightOf(gm, X, i), R = restFor(gm, X, i, card);
    let mine;
    if (X.kind === 'homo') mine = L.slotMine(gm, defs, v, X.level, 20);
    else mine = Object.assign(L.slotMine(gm, defs, v, X.level, X.k), O.mineFor(gm, defs, R, X.level));
    const seed = (fnv(X.seed + '|game|' + i) + 2654435761) >>> 0;
    // cs.foeBramble (SKM3, 2026-11-20): the foe's bramble Health alone (the defence race: a foe that cannot fall, so the score is survival only)
    let rules = X.fieldList[fx.f].rules, road = null, opp = null, oppCastle = X.foeBramble ? Object.assign({}, castle, { health: X.foeBramble }) : castle;
    if (fx.road) { road = roadSetup(fx); rules = road.rules; }
    else if (fx.pro) { opp = O.mineFor(gm, defs, fx.pro.deck, X.level); if (X.fields !== 'neutral') rules = fx.pro.rules; }
    else if (X.foeV) opp = L.slotMine(gm, defs, X.foeV, X.level, 20); // the stat-equivalence foe: 20 copies of the body with a stat bump
    else opp = fx.B[VAN_FOE] ? { [VAN_FOE]: 20 } : O.mineFor(gm, defs, fx.B, X.level);
    if (road) Object.keys(defs).forEach(id => { if (!road.defs[id]) road.defs[id] = defs[id]; });
    const mirror = !road, aFirst = !mirror || i % 2 === 0;
    const engine = E.makeSimEngine(road ? road.defs : defs, gm.seededRng(seed), { recordEvents: false, battleMode: road ? road.mode : mode, rules, aiAim: true, aiLevel: X.aiMe });
    const sideOf = id => id === 1 ? 'A' : 'B', st = {};
    const d1 = mirror ? (aFirst ? mine : opp) : mine, d2 = mirror ? (aFirst ? opp : mine) : road.enemyDeck;
    const P = { 1: engine.newPlayer(1, d1, road ? road.myCastle : castle), 2: engine.newPlayer(2, d2, road ? road.sc.character : oppCastle) };
    P[1].loopCards = []; P[2].loopCards = [];
    if (road) { Object.assign(P[2].hq, road.setup.hq); if (road.setup.hq.shieldLayers) P[2].hq.shieldLayers = road.setup.hq.shieldLayers.slice(); if (road.setup.reserveLeaders) P[2].reserveLeaders = road.setup.reserveLeaders.slice(); }
    const ai1 = mirror ? (aFirst ? X.aiMe : X.aiFoe) : X.aiMe, ai2 = mirror ? (aFirst ? X.aiFoe : X.aiMe) : road.cpu;
    engine.draw(P[1], 3, 'A', st, null); engine.draw(P[2], 3, 'B', st, null);
    let r = 1, over = false, lastSig = null, stalled = 0;
    for (; r <= E.DRAW_ROUND_CAP && !over; r++) {
      engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
      [1, 2].forEach(p => { P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      if (r > 1) engine.roundStart(P, r, sideOf, st, null);
      engine.setAiLevel(ai1); engine.aiTakeTurn(P, sideOf, 1, st, null); engine.setAiLevel(ai2); engine.aiTakeTurn(P, sideOf, 2, st, null);
      over = engine.resolveCombat(P, sideOf, st, null, r % 2 === 0 ? 1 : 2); if (over) break;
      const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if (stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
      engine.draw(P[1], 1, 'A', st, null); engine.draw(P[2], 1, 'B', st, null);
    }
    const me = aFirst ? 1 : 2, foe = 3 - me, hm = Math.max(0, P[me].hq.hp | 0), hf = Math.max(0, P[foe].hq.hp | 0), meDead = hm <= 0, foeDead = hf <= 0;
    const s = road ? ((foeDead && !meDead) ? 1 : 0) : (meDead && !foeDead ? 0 : foeDead && !meDead ? 1 : 0.5);
    return (s === 1 ? '1' : s === 0 ? '0' : 'h') + ',' + Math.min(r, 99) + ',' + hm + ',' + hf;
  };
}

// ---------------------------------------------------------------- worker side
if (!isMainThread && workerData && workerData.skm) {
  const gm = O.loadGame(workerData.root), ctxs = new Map(), games = new Map();
  parentPort.on('message', m => {
    try {
      let X = ctxs.get(m.ckey); if (!X) { X = contextOf(gm, m.cs); ctxs.set(m.ckey, X); games.set(m.ckey, makeGame(gm, X)); }
      const play = games.get(m.ckey), out = []; for (const i of m.list) out.push(play(i, m.v, m.card));
      parentPort.postMessage({ id: m.id, out });
    } catch (e) { parentPort.postMessage({ id: m.id, err: String(e && e.stack || e) }); }
  });
}

// ---------------------------------------------------------------- the runner: cache + worker pool
class Sim {
  constructor(o) { o = o || {}; this.o = o; this.gm = O.loadGame(ROOT); universe(this.gm); this.ws = []; this.q = []; this.cb = new Map(); this.seq = 0; this.played = 0; this.ctx = new Map(); this.log = o.quiet ? () => {} : s => console.log(s); }
  context(cs) {
    const k = JSON.stringify(cs); let X = this.ctx.get(k); if (X) return X;
    X = contextOf(this.gm, cs); X.cacheFile = path.join(CACHE, X.name + '-' + X.key + '.json');
    X.cache = fs.existsSync(X.cacheFile) ? JSON.parse(fs.readFileSync(X.cacheFile, 'utf8')).games : {};
    this.ctx.set(k, X); return X;
  }
  save(X) { fs.mkdirSync(CACHE, { recursive: true }); const tmp = X.cacheFile + '.tmp'; fs.writeFileSync(tmp, JSON.stringify({ tool: VERSION, cs: X.cs, games: X.cache })); fs.renameSync(tmp, X.cacheFile); }
  slotKey(X, v, card, i) { const k = v && v.base ? L.vKey(v) : '~blank'; return k + (card && fightOf(this.gm, X, i).R[card] ? '#' + card : ''); }
  get(X, v, card, i) { const a = X.cache[this.slotKey(X, v, card, i)]; return a && a[i] ? a[i] : null; }
  put(X, key, i, o) { const a = X.cache[key] || (X.cache[key] = []); a[i] = o; }
  // items: [{v, card}] over fights 0..M-1 (or a list); plays what the cache lacks
  async need(X, items, M, from) {
    from = from || 0; const jobs = []; let todo = 0; const seen = new Set();
    items.forEach(it => { const card = it.card || (it.v && it.v.base) || null, list = [];
      for (let i = from; i < M; i++) { if (this.get(X, it.v, card, i) != null) continue; const k = this.slotKey(X, it.v, card, i) + '@' + i; if (seen.has(k)) continue; seen.add(k); list.push(i); }
      const ch = this.o.chunk || 10; for (let a = 0; a < list.length; a += ch) { jobs.push({ v: it.v || null, card, list: list.slice(a, a + ch) }); todo += Math.min(ch, list.length - a); } });
    if (!jobs.length) return 0;
    const t0 = Date.now(); let lastSave = Date.now();
    const finish = (job, out) => { for (let j = 0; j < job.list.length; j++) this.put(X, this.slotKey(X, job.v, job.card, job.list[j]), job.list[j], out[j]); this.played += out.length;
      if (Date.now() - lastSave > 60000) { this.save(X); lastSave = Date.now(); } };
    const W = this.o.workers == null ? 2 : this.o.workers;
    if (!W) { const play = makeGame(this.gm, X); for (const j of jobs) finish(j, j.list.map(i => play(i, j.v, j.card))); }
    else {
      if (!this.ws.length) for (let k = 0; k < W; k++) { const w = new Worker(__filename, { workerData: { skm: true, root: ROOT } }); w.idle = true;
        w.on('message', m => { const c = this.cb.get(m.id); this.cb.delete(m.id); w.idle = true; if (m.err) { console.error(m.err); process.exit(2); } c(m.out); this.pump(); });
        w.on('error', e => { console.error('worker error', e); process.exit(2); }); this.ws.push(w); }
      await Promise.all(jobs.map(j => new Promise(res => { this.q.push({ msg: { cs: X.cs, ckey: X.key, v: j.v, card: j.card, list: j.list }, done: out => { finish(j, out); res(); } }); this.pump(); })));
    }
    this.save(X);
    this.lastRate = todo / Math.max(0.001, (Date.now() - t0) / 1000);
    return todo;
  }
  pump() { for (const w of this.ws) { if (!this.q.length) return; if (!w.idle) continue; const t = this.q.shift(), id = ++this.seq; w.idle = false; this.cb.set(id, t.done); w.postMessage(Object.assign({ id }, t.msg)); } }
  close() { this.ws.forEach(w => w.terminate()); this.ws = []; }
  // outcomes of a slot over fights a..b-1: [{s, r, hm, hf}]
  outcomes(X, v, card, M, from) { card = card || (v && v.base) || null; const out = [];
    for (let i = from || 0; i < M; i++) { const c = this.get(X, v, card, i); if (c == null) throw new Error('not played: ' + L.vKey(v) + ' #' + i);
      const p = c.split(','); out.push({ i, s: p[0] === '1' ? 1 : p[0] === '0' ? 0 : 0.5, r: +p[1], hm: +p[2], hf: +p[3] }); }
    return out; }
}

// ---------------------------------------------------------------- statistics
function meanSE(a) { const n = a.length; if (!n) return { m: null, se: null, n: 0 }; let s = 0; for (const x of a) s += x; const m = s / n; let v = 0; for (const x of a) v += (x - m) * (x - m); return { m, se: n > 1 ? Math.sqrt(v / (n - 1) / n) : null, n }; }
const median = a => { const v = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };
// ratio estimator worth = mean(d) / rate with the delta method's standard error
function ratio(dm, dse, rm, rse) { if (!rm || !isFinite(rm)) return { worth: null, se: null }; const w = dm / rm; return { worth: w, se: Math.sqrt((dse / rm) ** 2 + (dm * rse / (rm * rm)) ** 2) }; }
function spearman(a, b) {
  const idx = a.map((_, i) => i).filter(i => a[i] != null && b[i] != null && isFinite(a[i]) && isFinite(b[i])); if (idx.length < 4) return null;
  const rk = v => { const s = idx.map(i => [v[i], i]).sort((x, y) => x[0] - y[0]), r = {}; let j = 0; while (j < s.length) { let k = j; while (k + 1 < s.length && s[k + 1][0] === s[j][0]) k++; for (let t = j; t <= k; t++) r[s[t][1]] = (j + k) / 2; j = k + 1; } return r; };
  const ra = rk(a), rb = rk(b), n = idx.length, ma = idx.reduce((t, i) => t + ra[i], 0) / n, mb = idx.reduce((t, i) => t + rb[i], 0) / n;
  let num = 0, da = 0, db = 0; idx.forEach(i => { num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2; });
  return da && db ? num / Math.sqrt(da * db) : null;
}

module.exports = { VERSION, ROOT, CACHE, MAPS, L, SK, O, C, fnv, universe, withoutV, priceOn, nOf, addOf, vanillaBodies, contextOf, fightOf, makeGame, Sim, meanSE, median, ratio, spearman };
