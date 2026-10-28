// 2026-10-28 (package TOOLS1, owner 10-28 21:40: "we need ... 1) a good way to measure cards contribution 2) a good way to quickly measure
// skills impact to a card's contribution and therefore indirectly its strength - in a fair and balanced way 3) a good way to optimise a deck
// out of a list of cards"): the balance workbench's shared core. Measurement only: no card, deck or game code changes.
//
// The paired-swap design (T1 contrib, T2 skill):
//   - a context: the card pool random decks are drawn from, the fields fights are played under and the level (global: every fieldable card
//     of BAL6's tools/balance/contribution.js and every road fight's field, Level 1; --map N: that map's own cards (deckopt's bpro pool, or
//     --mode map-true), its fights' fields and the map's reference level);
//   - fight i (a pure function of the context's seed and i): an opponent deck B (20 cards), a rest R (20 - k cards) and a field;
//   - a slot of k copies (--copies, default 4) completes R into deck A. The slot holds the card being measured (or a variant of it: a skill
//     removed or added, +1 Attack, +1 Health), or k Blanks (a 0/1 at 0 Lumber with no skill, "nearly nothing"). Every variant of a card
//     plays the same fights with the same engine seed and the same deck order (the slot is dealt first), so their difference is paired
//     (common random numbers);
//   - when R holds the measured card itself, its copies are swapped for other cards of R (seeded by the card), so the slot is the only place
//     it appears; the Blank games of the base R are shared by every card whose R it does not touch (the cached base sample);
//   - a card's absolute contribution = score(A with k copies) - score(A with k Blanks); everything is cached per context (--cache-dir,
//     default <tmp>/bramble-bench) and keyed by the game's fingerprint (engine, app, cards, budget, map pools) and VERSION, so a re-run plays
//     only the games it has not played yet.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const C = require(path.join(ROOT, 'tools', 'balance', 'contribution.js'));
const VERSION = '1.0.0 (2026-10-28, TOOLS1)';
const BRAMBLE = 30, AI = 1, DECK = 20, BLANK = 'bench-blank';
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const r4 = v => v == null || !isFinite(v) ? null : Math.round(v * 10000) / 10000;
const numOf = v => typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b) => a + (+b || 0), 0) : 0);

// ---------------------------------------------------------------- the game's fingerprint (a cache is valid only for the same game)
let FP = null;
function fingerprint() {
  if (FP) return FP;
  const h = crypto.createHash('sha1');
  ['bramblewood-engine.js', 'arena_app.js', 'canonical/cards.json', 'bramblewood-budget.js', 'canonical/map-pools.json', 'tools/lib_bramble.js'] // + VERSION in the key: bump it when the fight or slot rules here change
    .forEach(f => { const p = path.join(ROOT, f); if (fs.existsSync(p)) h.update(fs.readFileSync(p)); });
  return (FP = h.digest('hex').slice(0, 12));
}

// ---------------------------------------------------------------- contexts
// cs (serialisable): {kind: 'global'|'map', map, mode, seed, k, level}
function contextOf(gm, cs) {
  const G = gm.G; let pool, fields, level, map = null, name;
  if (cs.kind === 'map') {
    map = O.resolveMap(gm, cs.map); const pools = O.poolsFor(gm, map, { mode: cs.mode || 'bpro', rarityCap: 'map', faction: false, owned: 'plan', submaps: true });
    pool = pools.p1.filter(id => C.fieldable(gm, id)).sort();
    fields = O.fightsOf(map).map(n => ({ at: map.id + ':' + n.key, rules: G.fightRules(map.id, n) || {} }));
    level = cs.level != null ? cs.level : G.referenceFightSetup(map.id, O.fightsOf(map)[0], { deck: {} }).ref.level;
    name = 'map' + String(G.mapNumberOf(map.id)).padStart(2, '0') + '-' + map.id + '-' + (cs.mode || 'bpro');
  } else {
    const S = C.setupOf(gm); pool = S.cards; fields = S.fields; level = cs.level != null ? cs.level : 1; name = 'global';
  }
  if (cs.pool) { pool = cs.pool.filter(id => gm.D[id] && C.fieldable(gm, id)).sort(); name += '-pool' + fnv(pool.join(',')).toString(36); }
  const k = cs.k || 4, seed = cs.seed || 'tools1';
  const key = fnv(JSON.stringify([VERSION, fingerprint(), cs.kind, map && map.id, cs.mode || '', seed, k, level, pool, fields.map(f => f.at)])).toString(36);
  return { cs, key, name, pool, fields, level, k, seed, mapId: map && map.id, fights: new Map() };
}

// a random legal deck of `size` cards from `pool` (contribution.js's randomDeck with a size): kk different cards, then copies within the caps
function randomDeck(gm, pool, rng, size) {
  const d = {}, pick = [], want = Math.min(pool.length, Math.max(3, Math.round((6 + Math.floor(rng.next() * 9)) * size / DECK))); let guard = 0;
  while (pick.length < want && guard++ < 400) { const id = pool[Math.floor(rng.next() * pool.length)]; if (!pick.includes(id) && O.canAdd(gm, d, id)) { pick.push(id); d[id] = 1; } }
  let n = pick.length; guard = 0;
  while (n < size && guard++ < 4000) {
    const open = pick.filter(id => O.canAdd(gm, d, id));
    if (!open.length) { const id = pool[Math.floor(rng.next() * pool.length)]; if (!d[id] && O.canAdd(gm, d, id)) { pick.push(id); d[id] = 1; n++; } continue; }
    const id = open[Math.floor(rng.next() * open.length)]; d[id] = (d[id] || 0) + 1; n++;
  }
  if (n !== size) throw new Error('randomDeck: the pool cannot fill ' + size + ' cards');
  return d;
}
function fightOf(gm, X, i) {
  let f = X.fights.get(i); if (f) return f;
  const rng = O.mulberry(fnv(X.seed + '|bench|' + i));
  f = { B: randomDeck(gm, X.pool, rng, DECK), R: randomDeck(gm, X.pool, rng, DECK - X.k), f: Math.floor(rng.next() * X.fields.length) };
  X.fights.set(i, f); return f;
}
// R without card `card`: its copies go to other cards of R (or other pool cards), seeded by the card
function restFor(gm, X, i, card) {
  const R = fightOf(gm, X, i).R; if (!card || !R[card]) return R;
  const rng = O.mulberry(fnv(X.seed + '|sub|' + i + '|' + card)), out = Object.assign({}, R); let c = out[card]; delete out[card];
  while (c > 0) { const ids = Object.keys(out).filter(id => O.canAdd(gm, out, id)); let id = ids.length ? ids[Math.floor(rng.next() * ids.length)] : null;
    for (let t = 0; !id && t < 400; t++) { const y = X.pool[Math.floor(rng.next() * X.pool.length)]; if (y !== card && O.canAdd(gm, out, y)) id = y; }
    if (!id) throw new Error('restFor: no substitute for ' + card); out[id] = (out[id] || 0) + 1; c--; }
  return out;
}
const restHas = (gm, X, i, card) => !!(card && fightOf(gm, X, i).R[card]);

// ---------------------------------------------------------------- variants
// v: {base: card id (null = the Blank), rm: [effect keys], rmTrig: 'on>do', add: {key: value}, addTrig: [trigger entries], dA, dH}
function vKey(v) {
  if (!v || !v.base) return '~blank';
  let s = v.base;
  if (v.rm && v.rm.length) s += '|-' + v.rm.slice().sort().join(',');
  if (v.rmTrig) s += '|-T:' + v.rmTrig;
  if (v.add && Object.keys(v.add).length) s += '|+' + JSON.stringify(Object.keys(v.add).sort().map(k => [k, v.add[k]]));
  if (v.addTrig && v.addTrig.length) s += '|+T:' + JSON.stringify(v.addTrig);
  if (v.dA) s += '|a' + (v.dA > 0 ? '+' : '') + v.dA;
  if (v.dH) s += '|h' + (v.dH > 0 ? '+' : '') + v.dH;
  return s;
}
const isPlain = v => v && v.base && vKey(v) === v.base;
// the parameter keys that belong to a skill (Crepuscular's crepuscularHp / crepuscularGrant ...): removed with it
function paramKeysOf(gm, effects, key) {
  const P = (gm.Budget.PARAMS || []); return Object.keys(effects || {}).filter(k => k !== key && k.startsWith(key) && (P.includes(k) || /(Hp|Grant|N|Uses)$/.test(k)));
}
// the effects of a variant, from the card's effects
function variantEffects(gm, eff, v) {
  const e = JSON.parse(JSON.stringify(eff || {}));
  (v.rm || []).forEach(k => { paramKeysOf(gm, eff, k).forEach(p => delete e[p]); delete e[k]; });
  if (v.rmTrig && Array.isArray(e.triggers)) { e.triggers = e.triggers.filter(t => !t || (t.on + '>' + t.do) !== v.rmTrig); if (!e.triggers.length) delete e.triggers; }
  if (v.add) Object.assign(e, JSON.parse(JSON.stringify(v.add)));
  if (v.addTrig && v.addTrig.length) e.triggers = (e.triggers || []).concat(JSON.parse(JSON.stringify(v.addTrig)));
  return e;
}
// the printed card of a variant (for the budget: N, x1)
function printedDef(gm, v) {
  if (!v || !v.base) return { id: BLANK, name: 'Blank', cost: 0, wait: 0, attack: 0, health: 1, rarity: 'common', effects: {} };
  const b = gm.D[v.base], o = Object.assign({}, b, { effects: variantEffects(gm, b.effects, v) });
  if (v.dA && o.attack != null) o.attack += v.dA; if (v.dH && o.health != null) o.health += v.dH;
  return o;
}
// the slot's copies as the engine sees them ({defId: k}); a plain card goes through deckopt.mineFor (the game's levelled "<id>@p<L>" copy),
// a variant is that copy with its changes under its own id
function slotMine(gm, defs, v, level, k) {
  if (!v || !v.base) { if (!defs[BLANK]) defs[BLANK] = { id: BLANK, name: 'Blank', icon: '▫️', cost: 0, wait: 0, attack: 0, health: 1, rarity: 'common', archetypes: [], effects: {}, bench: true }; return { [BLANK]: k }; }
  const plain = O.mineFor(gm, defs, { [v.base]: k }, level); if (isPlain(v)) return plain;
  const lid = Object.keys(plain)[0], key = vKey(v), id = v.base + '~b' + fnv(key).toString(36);
  if (!defs[id]) { const L = defs[lid], o = Object.assign({}, L, { id, benchVariant: key, effects: variantEffects(gm, L.effects, v) });
    if (v.dA && o.attack != null) o.attack += v.dA; if (v.dH && o.health != null) o.health += v.dH; delete o.derivedFrom; defs[id] = o; }
  return { [id]: k };
}

// ---------------------------------------------------------------- one game
function makeGame(gm, X) {
  const G = gm.G, defs = G.referenceBaseDefs(), castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: BRAMBLE, rarity: 'common', archetypes: ['Castle'], effects: {} };
  const spec = { level: X.level, ai: AI, beeTank: false }, mode = G.CONQUEST_DEFAULT_MODE || 'open';
  // the score of deck A (slot `v` + the rest without `card`): '1' win, '0' loss, 'h' draw
  return function play(i, v, card) {
    const fx = fightOf(gm, X, i), R = restFor(gm, X, i, card);
    const mine = Object.assign(slotMine(gm, defs, v, X.level, X.k), O.mineFor(gm, defs, R, X.level)); // the slot first: the same deck order for every variant
    const ctx = { en: { kind: 'mirror' }, defs, rules: X.fields[fx.f].rules, mode, cpu: AI, myCastle: castle, mineCache: new Map([[O.deckKey(mine), mine]]), oppMine: O.mineFor(gm, defs, fx.B, X.level), seedBase: fnv(X.seed + '|game|' + i) };
    const s = O.playOne(gm, spec, ctx, mine, i);
    return s === 1 ? '1' : s === 0 ? '0' : 'h';
  };
}

// ---------------------------------------------------------------- worker side
if (!isMainThread && workerData && workerData.bench) {
  const gm = O.loadGame(workerData.root), ctxs = new Map(), games = new Map();
  parentPort.on('message', m => {
    try {
      let X = ctxs.get(m.ckey); if (!X) { X = contextOf(gm, m.cs); ctxs.set(m.ckey, X); games.set(m.ckey, makeGame(gm, X)); }
      const play = games.get(m.ckey); let s = ''; for (const i of m.list) s += play(i, m.v, m.card);
      parentPort.postMessage({ id: m.id, s });
    } catch (e) { parentPort.postMessage({ id: m.id, err: String(e && e.stack || e) }); }
  });
}

// ---------------------------------------------------------------- the runner: cache + worker pool
class Bench {
  constructor(o) { this.o = o; this.gm = O.loadGame(ROOT); this.ws = []; this.q = []; this.cb = new Map(); this.seq = 0; this.played = 0; this.log = o.quiet ? () => {} : s => console.log(s); }
  context(cs) {
    const X = contextOf(this.gm, cs); X.cacheFile = path.join(this.o.cacheDir || path.join(os.tmpdir(), 'bramble-bench'), 'bench-' + X.name + '-' + X.key + '.json');
    X.cache = fs.existsSync(X.cacheFile) ? JSON.parse(fs.readFileSync(X.cacheFile, 'utf8')).games : {};
    return X;
  }
  save(X) { fs.mkdirSync(path.dirname(X.cacheFile), { recursive: true }); const tmp = X.cacheFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ tool: 'tools/bench ' + VERSION, fingerprint: fingerprint(), cs: X.cs, name: X.name, games: X.cache })); fs.renameSync(tmp, X.cacheFile); }
  // where a game is stored: the Blank's games are shared unless the rest lost the measured card
  slotKey(X, v, card, i) { return v && v.base ? vKey(v) : '~blank#' + (restHas(this.gm, X, i, card) ? card : ''); }
  get(X, v, card, i) { const s = X.cache[this.slotKey(X, v, card, i)]; const c = s && s[i]; return c && c !== '.' ? c : null; }
  put(X, key, i, ch) { let s = X.cache[key] || ''; if (s.length <= i) s = s + '.'.repeat(i + 1 - s.length); X.cache[key] = s.slice(0, i) + ch + s.slice(i + 1); }
  // items: [{v, card}] each over fights 0..M-1; plays what the cache lacks
  async need(X, items, M) {
    const jobs = []; let todo = 0;
    items.forEach(it => { const card = it.card || (it.v && it.v.base) || null, miss = [];
      for (let i = 0; i < M; i++) if (this.get(X, it.v, card, i) == null) miss.push(i);
      // the same game may be asked twice (the Blank under two cards whose rest is the base one): de-duplicate by slot key
      const seen = new Set(); const list = miss.filter(i => { const k = this.slotKey(X, it.v, card, i) + '@' + i; if (seen.has(k) || this._pending && this._pending.has(k)) return false; seen.add(k); (this._pending = this._pending || new Set()).add(k); return true; });
      for (let a = 0; a < list.length; a += this.o.chunk || 25) { jobs.push({ v: it.v || null, card, list: list.slice(a, a + (this.o.chunk || 25)) }); todo += Math.min(this.o.chunk || 25, list.length - a); } });
    if (!jobs.length) { this._pending = null; return 0; }
    const t0 = Date.now(); let done = 0, lastSave = Date.now(), lastLog = Date.now();
    const finish = (job, s) => { for (let j = 0; j < job.list.length; j++) this.put(X, this.slotKey(X, job.v, job.card, job.list[j]), job.list[j], s[j]); done += s.length; this.played += s.length;
      if (Date.now() - lastSave > 30000) { this.save(X); lastSave = Date.now(); }
      if (Date.now() - lastLog > 60000) { lastLog = Date.now(); const r = done / ((Date.now() - t0) / 1000); this.log(`  ${done}/${todo} games, ${r.toFixed(1)}/s, about ${Math.round((todo - done) / r / 60)} min left`); } };
    if (!this.o.workers) { const play = makeGame(this.gm, X); for (const j of jobs) { let s = ''; for (const i of j.list) s += play(i, j.v, j.card); finish(j, s); } }
    else {
      if (!this.ws.length) for (let k = 0; k < this.o.workers; k++) { const w = new Worker(__filename, { workerData: { bench: true, root: ROOT } }); w.idle = true;
        w.on('message', m => { const c = this.cb.get(m.id); this.cb.delete(m.id); w.idle = true; if (m.err) { console.error(m.err); process.exit(2); } c(m.s); this.pump(); });
        w.on('error', e => { console.error('worker error', e); process.exit(2); }); this.ws.push(w); }
      await Promise.all(jobs.map(j => new Promise(res => { this.q.push({ msg: { cs: X.cs, ckey: X.key, v: j.v, card: j.card, list: j.list }, done: s => { finish(j, s); res(); } }); this.pump(); })));
    }
    this.save(X); this._pending = null;
    this.log(`  played ${todo} games in ${Math.round((Date.now() - t0) / 1000)} s`);
    return todo;
  }
  pump() { for (const w of this.ws) { if (!this.q.length) return; if (!w.idle) continue; const t = this.q.shift(), id = ++this.seq; w.idle = false; this.cb.set(id, t.done); w.postMessage(Object.assign({ id }, t.msg)); } }
  close() { this.ws.forEach(w => w.terminate()); this.ws = []; }
  // the per-fight scores of a slot (1, 1/2, 0), fights 0..M-1 (all cached)
  scores(X, v, card, M) { const out = new Float64Array(M); card = card || (v && v.base) || null;
    for (let i = 0; i < M; i++) { const c = this.get(X, v, card, i); if (c == null) throw new Error('not played: ' + (v ? vKey(v) : '~blank') + ' fight ' + i); out[i] = c === '1' ? 1 : c === '0' ? 0 : 0.5; } return out; }
}

// ---------------------------------------------------------------- small statistics
function meanSE(a) { const n = a.length; if (!n) return { m: null, se: null }; let s = 0; for (const x of a) s += x; const m = s / n; let v = 0; for (const x of a) v += (x - m) * (x - m); return { m, se: n > 1 ? Math.sqrt(v / (n - 1) / n) : null }; }
const diff = (a, b) => { const o = new Float64Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] - b[i]; return o; };
const median = a => { const v = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };

// ---------------------------------------------------------------- the budget (bramblewood-budget.js via tools/skill_costs.js)
let SCT = null;
function costs() { if (!SCT) { const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')); const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')); SCT = { SC, table, T: SC.make(table) }; } return SCT; }
// N at the level played, the cap-1 left side as printed (2A + H) x m + S, and S
function budgetOf(def, level) { const { T } = costs(); const b = T.budget(def, { level }); return { N: b.N, x1: b.x1, S: b.S }; }

function parseCommon(a, o) { // the options every command shares; returns true when it took the option
  const k = a[0];
  const take = () => { a.shift(); return a.shift(); };
  switch (k) {
    case '--games': o.games = +take(); return true; case '--copies': o.k = +take(); return true; case '--seed': o.seed = take(); return true;
    case '--workers': case '-j': o.workers = +take(); return true; case '--map': o.map = take(); return true; case '--mode': o.mode = take(); return true;
    case '--level': o.level = +take(); return true; case '--cache-dir': o.cacheDir = take(); return true; case '--tag': o.tag = take(); return true;
    case '--out': o.out = path.resolve(take()); return true; case '--quiet': a.shift(); o.quiet = true; return true; case '--chunk': o.chunk = +take(); return true;
    case '--pool': o.pool = take().split(',').map(s => s.trim()).filter(Boolean); return true;
  }
  return false;
}
function defaults() { return { games: 200, k: 6, seed: 'tools1', workers: Math.max(1, Math.min(os.cpus().length, 2)), map: null, mode: 'bpro', level: null, cacheDir: path.join(os.tmpdir(), 'bramble-bench'), tag: new Date().toISOString().slice(0, 10), out: path.join(ROOT, 'docs', 'balance'), chunk: 25 }; }
const csOf = o => o.map != null ? { kind: 'map', map: o.map, mode: o.mode, seed: o.seed, k: o.k, level: o.level, pool: o.pool } : { kind: 'global', seed: o.seed, k: o.k, level: o.level, pool: o.pool };
const pp = v => v == null ? '-' : (v >= 0 ? '+' : '') + (v * 100).toFixed(1);

module.exports = { VERSION, ROOT, O, C, BLANK, fnv, r4, numOf, fingerprint, contextOf, randomDeck, fightOf, restFor, restHas, vKey, isPlain, paramKeysOf, variantEffects, printedDef, slotMine, makeGame, Bench, meanSE, diff, median, costs, budgetOf, parseCommon, defaults, csOf, pp };
