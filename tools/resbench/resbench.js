#!/usr/bin/env node
// 2026-11-28 (package RESBENCH1, owner 11-28 12:20: "we don't have a robust way to measure resource related skills. Maybe one could be a range
// of test decks A-n: A-0 is a deck of 12 0-lumber cost test creatures, 5 1-lumber cost creatures, 2 2-lumber, 1 3-lumber. In A-n, n 0-lumber
// cost creatures are replaced with a test creature with the resource skill. Those that generate every turn can have 2 variants, one that costs
// 0-lumber, one that costs 1-lumber ... maybe its just to find the ideal A-n mixture. Then, in that mixture and A-0 or A-1, you can mix around
// real units in and compare win rate. That gives you the contribution of the resource units"). Measurement only: no card, deck or price edits.
//
// Test creatures live in this tool only (never in canonical/cards.json): vanillas at 0/1/2/3 Lumber, Common, Wait 0, Map 0, Level 1, sized by
// bramblewood-budget.js (N = nOf, the best 3A + H inside cap 1 with A·H inside cap 2); a resource test creature is the 0-Lumber vanilla's body
// with one resource skill, costing 0 (or 1 for the every-turn ones). Every variant of an opponent plays the same games with the same engine seed
// and the same deck positions (common random numbers), so differences between variants are paired.
//   node tools/resbench/resbench.js plan                       # the test creatures, the skills, the real cards, the variant counts
//   node tools/resbench/resbench.js run --phase curve|calib|cards --games 400 --shard 0/2   # plays what the saved games lack (resumable)
//   node tools/resbench/resbench.js report                     # fits, n*, contributions -> docs/balance/resbench/resbench1-<date>.json
'use strict';
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const BL = require(path.join(ROOT, 'tools', 'bench', 'lib.js'));
const OUT = path.join(ROOT, 'docs', 'balance', 'resbench');
const VERSION = '1.0.0 (2026-11-28, RESBENCH1)';
const LEVEL = 1, BRAMBLE = 30, AI = 1, NS = [1, 2, 3, 4, 6, 8, 10, 12];
const SHAPE = [12, 5, 2, 1]; // A-0: copies at 0 / 1 / 2 / 3 Lumber

// ---------------------------------------------------------------- the resource skills of Maps 0-20 (docs/effects-cards-0-20.md, Resources and the gain triggers)
const gainT = (on, n) => ({ triggers: [{ on, do: 'gain', resource: 'lumber', amount: n || 1 }] });
const SKILLS = [
  { id: 'delivery1', label: 'Delivery 1 (once, on Ready)', fx: { delivery: 1 }, every: false },
  { id: 'forestry1', label: 'Forestry 1 (every turn while Ready)', fx: { forestry: 1 }, every: true },
  { id: 'foraging1', label: 'Foraging 1 (a Berry a turn, 3 heal 3)', fx: { foraging: 1 }, every: true },
  { id: 'onPlayGain1', label: 'On Play: gain 1 Lumber', fx: gainT('onSpawn', 1), every: false },
  { id: 'onAttackGain1', label: 'On Attack: gain 1 Lumber', fx: gainT('onAttack', 1), every: true },
  { id: 'onKillGain1', label: 'On Kill: gain 1 Lumber', fx: gainT('onKill', 1), every: true },
  { id: 'onAttackedGain1', label: 'On Attacked: gain 1 Lumber', fx: gainT('onAttacked', 1), every: true },
  { id: 'bounty1', label: 'Bounty 1 (+1 on play, the foe +1 on its death)', fx: { bounty: 1 }, every: false },
  // the placebo: a key the engine does not know. The CPU values a card by its number of effect keys (cardValue, + 1.5 a key; docs/evaluation-protocol.md 5a)
  // and pitches a skilled card later, so part of any skill's gain is that bias; the placebo's curve measures it
  { id: 'placebo', label: 'Placebo (an unknown key: the CPU\'s key bias only)', fx: { resbench1Placebo: true }, every: false, placebo: true },
];
// the real cards a player holds by Map 20 with a resource skill (cardObtainMap <= 20), each read under one skill, at the level its skill is live
const CARDS = [
  ['beaver-lumberjack', 'delivery1', 1], ['pika-hoarder', 'delivery1', 1], ['lodge-engineer', 'delivery1', 1], ['pack-mule', 'delivery1', 1], ['muskrat-lodgekeeper', 'delivery1', 2],
  ['giant-clam', 'delivery1', 1], ['irradiated-axolotl', 'delivery1', 1],
  ['muskrat-reedgatherer', 'forestry1', 1], ['nutria-reedcutter', 'forestry1', 1], ['sunfeather-scout', 'forestry1', 1], ['chipmunk-hoarder', 'forestry1', 1],
  ['coral-polyp-colony', 'forestry1', 1], ['old-willow-of-the-ford', 'forestry1', 1], ['elder-willow', 'forestry1', 1],
  ['dormouse', 'foraging1', 1], ['chipmunk-forager', 'foraging1', 1], ['raccoon-nightcrew', 'foraging1', 1],
  ['glowworm-cluster', 'onPlayGain1', 1], ['trash-panda-trickster', 'onPlayGain1', 1], ['cone-cutter-squirrel', 'onPlayGain1', 1], ['pumice-beetle', 'onPlayGain1', 1], ['salvager-hermit-crab', 'onPlayGain1', 6],
  ['forager-ant', 'onAttackGain1', 1], ['gull-thief', 'onAttackGain1', 1],
  ['ferry-toll-frog', 'onKillGain1', 1], ['beaver-feller', 'onKillGain1', 3], ['dust-hyena', 'onKillGain1', 3],
  ['driftwood-crab', 'onAttackedGain1', 1], ['gannet-nestweaver', null, 1 /* On Healed: no test creature (no healer in the test decks), read in A-0 only */],
  ['riverside-peddler', 'bounty1', 1],
];
const OPPS = [{ id: 'mirror', label: 'A-0 mirror' }, { id: 'ref8', label: 'Map 8 reference deck (WINRATE_REF_DECKS.road[8], level 0 = printed; A-0 wins about 30%: the Map 5-6 decks lose 90%+ to A-0 and Map 7 is 21%, so Map 8 leaves the most room to read gains)', map: 8 }];

// ---------------------------------------------------------------- the game, the test creatures
let GM = null; const gm = () => GM || (GM = O.loadGame(ROOT));
const r2 = v => Math.round(v * 100) / 100;
// the best body inside the budget: max 3A + H <= N, A·H <= cap 2, then the most even A·H; A >= 1
function sizeBody(N) {
  const Bu = gm().Budget, aw = +Bu.DEFAULTS.attackWeight || 3, c2 = Bu.cap2Limit(N); let best = null;
  for (let A = 1; aw * A < N; A++) { const H = Math.floor(Math.min(N - aw * A, c2 / A)); if (H < 1) continue; const use = aw * A + H;
    if (!best || use > best.use || (use === best.use && A * H > best.A * best.H)) best = { A, H, use }; }
  return best;
}
const plainDef = (id, cost, extra) => Object.assign({ id, name: id, icon: '🧪', cost, wait: 0, rarity: 'common', obtainMap: 0, archetypes: [], effects: {}, bench: true }, extra || {});
function testDefs() {
  const Bu = gm().Budget, out = {}, meta = {};
  [0, 1, 2, 3].forEach(c => { const d = plainDef('rb-v' + c, c), N = Bu.nOf(d, LEVEL), b = sizeBody(N); Object.assign(d, { attack: b.A, health: b.H }); out[d.id] = d; meta[d.id] = { N, use: b.use }; });
  const v0 = out['rb-v0'];
  SKILLS.forEach(s => (s.every ? [0, 1] : [0]).forEach(c => { const id = 'rb-' + s.id + '-' + c; out[id] = Object.assign({}, v0, { id, name: id, cost: c, effects: JSON.parse(JSON.stringify(s.fx)) }); }));
  out['rb-v0-a1'] = Object.assign({}, v0, { id: 'rb-v0-a1', attack: v0.attack + 1 }); out['rb-v0-h2'] = Object.assign({}, v0, { id: 'rb-v0-h2', health: v0.health + 2 });
  return { defs: out, meta };
}
// a real card at its level (deckopt's levelled copy) and its budget twin: a plain body with the card's cost, wait, rarity and map, sized by N
function realOf(defs, id, L) {
  const G = gm().G, Bu = gm().Budget, mine = O.mineFor(gm(), defs, { [id]: 1 }, L), did = Object.keys(mine)[0], d = defs[did];
  const map = G.cardObtainMap(gm().D[id]), tw = plainDef('rb-twin-' + id + '@' + L, d.cost || 0, { wait: d.wait || 0, rarity: d.rarity, obtainMap: map });
  const N = Bu.nOf(tw, L), b = sizeBody(N); Object.assign(tw, { attack: b.A, health: b.H }); if (!defs[tw.id]) defs[tw.id] = tw;
  return { did, def: d, twin: tw.id, twinN: N, map, budget: BL.budgetOf(d, L) };
}

// ---------------------------------------------------------------- decks (ordered: every variant keeps the same deck positions)
// slots: [[defId, copies]...] in deck order; the first 12 positions are the 0-Lumber step
function deckA(n, resId, extra) { // extra: {at: 'res'|'v0', id, k} puts k copies of id in place of the last k of that group
  const g = [[resId, n], ['rb-v0', SHAPE[0] - n]];
  if (extra) { const gi = extra.at === 'res' ? 0 : 1; g[gi][1] -= extra.k; g.splice(gi + 1, 0, [extra.id, extra.k]); }
  return g.concat([['rb-v1', SHAPE[1]], ['rb-v2', SHAPE[2]], ['rb-v3', SHAPE[3]]]).filter(x => x[0] && x[1] > 0);
}
const mineOf = slots => { const m = {}; slots.forEach(([id, k]) => { m[id] = (m[id] || 0) + k; }); return m; };
const slotKey = slots => slots.map(([id, k]) => id + ':' + k).join(',');

// ---------------------------------------------------------------- the variants of each phase
function variants(phase, nstar) {
  const out = [];
  const add = (opp, group, label, slots, info) => out.push(Object.assign({ key: opp + '|' + slotKey(slots), opp, group, label, slots }, info || {}));
  OPPS.forEach(o => {
    if (phase === 'curve') { add(o.id, 'base', 'A-0', deckA(0, null));
      SKILLS.forEach(s => (s.every ? [0, 1] : [0]).forEach(c => NS.forEach(n => add(o.id, 'curve', s.id + '-' + c + ' n' + n, deckA(n, 'rb-' + s.id + '-' + c), { skill: s.id, cost: c, n })))); }
    if (phase === 'calib') [['rb-v0-a1', 3], ['rb-v0-h2', 2]].forEach(([id, pts]) => [1, 2, 4, 12].forEach(k => add(o.id, 'calib', id + ' x' + k, deckA(0, null, { at: 'v0', id, k }), { bump: id, k, pts: pts * k }))); // the bumped copies first
    if (phase === 'cards') { const { defs } = ctxDefs();
      // the A-n* decks themselves when n* is not on the curve's grid (the "vs slot" base of the A-n* swaps)
      SKILLS.filter(s => nstar && nstar[o.id] && nstar[o.id][s.id] && !NS.includes(nstar[o.id][s.id].n)).forEach(s => { const ns = nstar[o.id][s.id]; add(o.id, 'cards', s.id + '-' + ns.cost + ' n' + ns.n + ' (A-n* base)', deckA(ns.n, 'rb-' + s.id + '-' + ns.cost), { skill: s.id, cost: ns.cost, n: ns.n, kind: 'base' }); });
      CARDS.forEach(([id, sk, L]) => { const R = realOf(defs, id, L), ns = nstar && nstar[o.id] && nstar[o.id][sk];
        [[R.did, 'real'], [R.twin, 'twin']].forEach(([did, kind]) => { // a card with no test skill (sk null) plays in A-0 only
          add(o.id, 'cards', id + ' ' + kind + ' in A-0', deckA(0, null, { at: 'v0', id: did, k: 1 }), { card: id, kind, ctx: 'A-0', skill: sk, level: L });
          if (ns && ns.n >= 1) add(o.id, 'cards', id + ' ' + kind + ' in A-' + ns.n, deckA(ns.n, 'rb-' + sk + '-' + ns.cost, { at: 'res', id: did, k: 1 }), { card: id, kind, ctx: 'A-n*', skill: sk, level: L, n: ns.n, cost: ns.cost });
        }); }); }
  });
  return out;
}

// ---------------------------------------------------------------- one game
let CTXD = null;
function ctxDefs() { if (CTXD) return CTXD; const defs = gm().G.referenceBaseDefs(), T = testDefs(); Object.assign(defs, T.defs); CTXD = { defs, meta: T.meta }; return CTXD; }
function oppMine(defs, o) {
  if (o.id === 'mirror') return mineOf(deckA(0, null));
  const r = gm().G.referenceDeckFor(gm().G.CONQUEST_MAPS.find(x => !x.sub && !x.reserved && gm().G.mapNumberOf(x.id) === o.map).id);
  return O.mineFor(gm(), defs, r.deck, r.level);
}
const ctxCache = new Map();
function play(v, g) {
  const { defs } = ctxDefs(); let base = ctxCache.get(v.opp);
  if (!base) { const o = OPPS.find(x => x.id === v.opp); base = { oppMine: oppMine(defs, o), seedBase: BL.fnv('resbench1|' + v.opp) }; ctxCache.set(v.opp, base); }
  const mine = mineOf(v.slots), castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: BRAMBLE, rarity: 'common', archetypes: ['Castle'], effects: {} };
  const ctx = { en: { kind: 'mirror' }, defs, rules: {}, mode: 'open', cpu: AI, myCastle: castle, mineCache: new Map([[O.deckKey(mine), mine]]), oppMine: base.oppMine, seedBase: base.seedBase };
  const s = O.playOne(gm(), { level: LEVEL, ai: AI, beeTank: false }, ctx, mine, g);
  return s === 1 ? '1' : s === 0 ? '0' : 'h';
}

// ---------------------------------------------------------------- the saved games (one file a shard; a key holds its games as a string, index = game)
function fingerprint() {
  const h = crypto.createHash('sha1'); h.update(VERSION);
  ['bramblewood-engine.js', 'bramblewood-budget.js', 'tools/opt/deckopt.js', 'tools/lib_bramble.js'].forEach(f => h.update(fs.readFileSync(path.join(ROOT, f))));
  // the card data this bench plays (the real cards and the reference deck), not the whole cards.json, so unrelated card edits keep the games
  const D = gm().D, used = new Set(CARDS.map(c => c[0])); const refs = OPPS.filter(o => o.map != null).map(o => gm().G.referenceDeckFor(gm().G.CONQUEST_MAPS.find(x => !x.sub && !x.reserved && gm().G.mapNumberOf(x.id) === o.map).id)); refs.forEach(r => Object.keys(r.deck).forEach(id => used.add(id)));
  [...used].sort().forEach(id => h.update(JSON.stringify(D[id] || null))); h.update(JSON.stringify(refs));
  return h.digest('hex').slice(0, 10);
}
const gamesFile = (fp, shard) => path.join(OUT, 'games-' + fp + '-' + shard.replace('/', 'of') + '.json');
function loadAll(fp) { const all = {}; if (!fs.existsSync(OUT)) return all;
  fs.readdirSync(OUT).filter(f => f.startsWith('games-' + fp + '-') && f.endsWith('.json')).forEach(f => { const j = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).games;
    Object.entries(j).forEach(([k, s]) => { const a = all[k] || ''; all[k] = s.length > a.length ? s : a; }); }); return all; }
function saveShard(fp, shard, games) { fs.mkdirSync(OUT, { recursive: true }); const f = gamesFile(fp, shard), t = f + '.tmp';
  fs.writeFileSync(t, JSON.stringify({ tool: 'tools/resbench ' + VERSION, fingerprint: fp, level: LEVEL, bramble: BRAMBLE, ai: AI, games }, null, 0)); fs.renameSync(t, f); }

// ---------------------------------------------------------------- statistics
const sc = c => c === '1' ? 1 : c === '0' ? 0 : 0.5;
function arr(s, M) { const a = new Float64Array(M); for (let i = 0; i < M; i++) a[i] = sc(s[i]); return a; }
function mean(a) { let s = 0; for (const x of a) s += x; return s / a.length; }
function se(a) { const m = mean(a); let v = 0; for (const x of a) v += (x - m) * (x - m); return Math.sqrt(v / (a.length - 1) / a.length); }
const dif = (a, b) => a.map((x, i) => x - b[i]);
// least squares y = b0 + b1 x + b2 x^2
function quadFit(xs, ys) {
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], T = [0, 0, 0];
  xs.forEach((x, i) => { const p = [1, x, x * x]; for (let r = 0; r < 3; r++) { T[r] += p[r] * ys[i]; for (let c = 0; c < 3; c++) S[r][c] += p[r] * p[c]; } });
  const M = S.map((r, i) => r.concat([T[i]])); for (let c = 0; c < 3; c++) { let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; } }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}
const qAt = (b, x) => b[0] + b[1] * x + b[2] * x * x;
// the saturating fit (2026-11-28): d(n) = a (1 - e^(-n/tau)) + b n through d(0) = 0: a steep first copies that level off (a) and a late
// straight trend (b, - when too many resource bodies crowd out the rest). The A-n curves rise fastest at n = 1-3 and flatten, which a
// quadratic misses (it under-reads the first copies and puts n* where the curve has long flattened). tau on a log grid, a and b by least squares.
function satFit(xs, ds) {
  let best = null;
  for (let t = 0.25; t <= 60; t *= 1.04) { const f = xs.map(x => 1 - Math.exp(-x / t));
    let sff = 0, sfx = 0, sxx = 0, sfy = 0, sxy = 0; xs.forEach((x, i) => { sff += f[i] * f[i]; sfx += f[i] * x; sxx += x * x; sfy += f[i] * ds[i]; sxy += x * ds[i]; });
    const det = sff * sxx - sfx * sfx; if (Math.abs(det) < 1e-12) continue; const a = (sfy * sxx - sfx * sxy) / det, b = (sff * sxy - sfx * sfy) / det;
    let e = 0; xs.forEach((x, i) => { const r = a * f[i] + b * x - ds[i]; e += r * r; }); if (!best || e < best.e) best = { a, b, tau: t, e }; }
  return best;
}
const sAt = (p, x) => p.a * (1 - Math.exp(-x / p.tau)) + p.b * x;
function nStarSat(p) { let best = 0, bv = 0; for (let x = 0; x <= 12.0001; x += 0.05) { const v = sAt(p, x); if (v > bv + 1e-9) { bv = v; best = x; } } return { n: best, gain: bv }; }
function nStarOf(b) { let best = 0, bv = qAt(b, 0); for (let x = 0; x <= 12.0001; x += 0.05) { const v = qAt(b, x); if (v > bv) { bv = v; best = x; } } return { n: best, gain: bv - qAt(b, 0) }; }
function rng(seed) { return O.mulberry(seed); }
function quant(a, q) { const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.max(0, Math.round(q * (v.length - 1))))]; }

// ---------------------------------------------------------------- commands
function parse(argv) { const o = { cmd: argv[0] || 'plan', games: 400, shard: '0/1', phase: 'curve', boot: 400 };
  for (let i = 1; i < argv.length; i++) { const a = argv[i]; const v = () => argv[++i];
    if (a === '--games') o.games = +v(); else if (a === '--shard') o.shard = v(); else if (a === '--phase') o.phase = v(); else if (a === '--boot') o.boot = +v(); else if (a === '--time') o.time = +v(); else if (a === '--md') o.md = path.resolve(v()); }
  return o; }
function nstarFile() { return path.join(OUT, 'nstar.json'); }

function cmdPlan(o) {
  const { defs, meta } = ctxDefs();
  console.log('Test creatures (Level ' + LEVEL + ', Common, Wait 0, Map 0):');
  [0, 1, 2, 3].forEach(c => { const d = defs['rb-v' + c]; console.log(`  rb-v${c}: ${c} Lumber, N ${meta[d.id].N}, ${d.attack}/${d.health} (3A + H ${meta[d.id].use}), x${SHAPE[c]} in A-0`); });
  SKILLS.forEach(s => (s.every ? [0, 1] : [0]).forEach(c => { const d = defs['rb-' + s.id + '-' + c], b = BL.budgetOf(d, LEVEL); console.log(`  rb-${s.id}-${c}: ${d.attack}/${d.health}, ${c} Lumber, S ${b.S}, N ${b.N}, use ${r2(b.x1 / b.N * 100)}%`); }));
  console.log('Real cards:'); CARDS.forEach(([id, sk, L]) => { const R = realOf(defs, id, L); console.log(`  ${id} L${L} (${sk}): ${R.def.cost}L w${R.def.wait} ${R.def.rarity} map ${R.map} ${R.def.attack}/${R.def.health} ${JSON.stringify(R.def.effects)} | twin ${defs[R.twin].attack}/${defs[R.twin].health} N ${R.twinN}`); });
  ['curve', 'calib', 'cards'].forEach(p => console.log(p, variants(p, null).length, 'variants'));
  console.log('fingerprint', fingerprint());
}
function cmdRun(o) {
  const fp = fingerprint(), [si, sn] = o.shard.split('/').map(Number), nstar = fs.existsSync(nstarFile()) ? JSON.parse(fs.readFileSync(nstarFile(), 'utf8')) : null;
  if (o.phase === 'cards' && !nstar) throw new Error('run report after the curve phase first (it writes nstar.json)');
  const all = loadAll(fp), own = fs.existsSync(gamesFile(fp, o.shard)) ? JSON.parse(fs.readFileSync(gamesFile(fp, o.shard), 'utf8')).games : {};
  const V = variants(o.phase, nstar).filter((v, i) => i % sn === si), M = o.games; let todo = 0; V.forEach(v => { todo += Math.max(0, M - (all[v.key] || '').length); });
  console.log(`resbench ${o.phase} shard ${o.shard}: ${V.length} variants, ${todo} games to play (fp ${fp})`);
  const t0 = Date.now(); let done = 0, last = Date.now();
  for (const v of V) { let s = all[v.key] || ''; if (s.length >= M) continue; while (s.length < M) { s += play(v, s.length); done++;
      if (o.time && done >= o.time) { own[v.key] = s; saveShard(fp, o.shard, own); console.log(`timed ${done} games in ${((Date.now() - t0) / 1000).toFixed(1)} s`); return; }
      if (Date.now() - last > 60000) { last = Date.now(); own[v.key] = s; saveShard(fp, o.shard, own); const r = done / ((Date.now() - t0) / 1000); console.log(`  ${done}/${todo} games, ${r.toFixed(1)}/s, ~${Math.round((todo - done) / r / 60)} min left`); } }
    own[v.key] = s; all[v.key] = s; }
  saveShard(fp, o.shard, own); console.log(`done: ${done} games in ${Math.round((Date.now() - t0) / 1000)} s`);
}
function cmdReport(o) {
  const fp = fingerprint(), all = loadAll(fp), nstar = {}, res = { tool: VERSION, fingerprint: fp, date: new Date().toISOString().slice(0, 10), level: LEVEL, bramble: BRAMBLE, ai: AI, opps: OPPS, ns: NS, skills: [], calib: {}, cards: [] };
  const { defs, meta } = ctxDefs(); res.testCreatures = [0, 1, 2, 3].map(c => ({ id: 'rb-v' + c, cost: c, N: meta['rb-v' + c].N, attack: defs['rb-v' + c].attack, health: defs['rb-v' + c].health, copies: SHAPE[c] }));
  const R = rng(BL.fnv('resbench1-boot')), B = o.boot;
  const has = (v, M) => (all[v.key] || '').length >= M;
  for (const op of OPPS) {
    const curve = variants('curve', null).filter(v => v.opp === op.id), base = curve.find(v => v.group === 'base'); const M = base && all[base.key] ? all[base.key].length : 0; if (!M) continue;
    const a0 = arr(all[base.key], M); nstar[op.id] = {};
    res.base = res.base || {}; res.base[op.id] = { wr: mean(a0), se: se(a0), games: M };
    // the calibration line (WR points per budget point), through the origin
    const cal = variants('calib', null).filter(v => v.opp === op.id && has(v, M));
    const boots = Array.from({ length: B }, () => Array.from({ length: M }, () => Math.floor(R.next() * M)));
    const slopeOf = (idx, only) => { let sxy = 0, sxx = 0; cal.filter(v => v.k <= 4 && (!only || v.bump === only)).forEach(v => { const a = arr(all[v.key], M); let d = 0; idx.forEach(i => { d += a[i] - a0[i]; }); d /= idx.length; sxy += v.pts * d; sxx += v.pts * v.pts; }); return sxx ? sxy / sxx : null; };
    const id0 = Array.from({ length: M }, (_, i) => i), slope = slopeOf(id0), slopeB = cal.length ? boots.map(ix => slopeOf(ix)) : [];
    res.calib[op.id] = { slopeA: slopeOf(id0, 'rb-v0-a1'), slopeH: slopeOf(id0, 'rb-v0-h2'), slope, lo: slopeB.length ? quant(slopeB, 0.025) : null, hi: slopeB.length ? quant(slopeB, 0.975) : null, points: cal.map(v => { const d = dif(arr(all[v.key], M), a0); return { variant: v.label, pts: v.pts, d: mean(d), se: se(d) }; }) };
    for (const s of SKILLS) for (const c of (s.every ? [0, 1] : [0])) {
      const pts = curve.filter(v => v.skill === s.id && v.cost === c && has(v, M)); if (!pts.length) continue;
      const xs = [0].concat(pts.map(v => v.n)), A = [a0].concat(pts.map(v => arr(all[v.key], M)));
      const meansOf = idx => A.map(a => { let t = 0; idx.forEach(i => { t += a[i]; }); return t / idx.length; });
      const fitIdx = idx => { const m = meansOf(idx); return satFit(xs, m.map(v => v - m[0])); };
      const b = fitIdx(id0), st = nStarSat(b), bs = boots.map(idx => nStarSat(fitIdx(idx))), qb = quadFit(xs, meansOf(id0)), qs = nStarOf(qb);
      const first = dif(A[1], a0), d = BL.budgetOf(defs['rb-' + s.id + '-' + c], LEVEL);
      const row = { skill: s.id, label: s.label, cost: c, price: d.S, fit: b, quad: { fit: qb, nstar: qs.n, gain: qs.gain }, nstar: st.n, gain: st.gain, nstarLo: quant(bs.map(x => x.n), 0.025), nstarHi: quant(bs.map(x => x.n), 0.975), gainLo: quant(bs.map(x => x.gain), 0.025), gainHi: quant(bs.map(x => x.gain), 0.975),
        points: xs.map((n, i) => { const dd = dif(A[i], a0); return { n, wr: mean(A[i]), se: se(A[i]), d: mean(dd), dse: i ? se(dd) : 0 }; }),
        first: { d: mean(first), se: se(first) }, firstPts: slope ? mean(first) / slope : null, firstPtsSe: slope ? se(first) / slope : null };
      row.marg1Pts = slope ? sAt(b, 1) / slope : null; // the fitted first copy, in budget points
      row.perCopyAtNstar = st.n > 0.5 && slope ? st.gain / st.n / slope : null;
      res.skills.push(Object.assign({ opp: op.id }, row));
      const key = s.id, cur = nstar[op.id][key]; const ni = Math.max(1, Math.min(12, Math.round(st.n))); // at least A-1, so every card has a resource context
      if (!cur || st.gain > cur.gain) nstar[op.id][key] = { n: ni, cost: c, gain: st.gain };
    }
    // net of the placebo: the skill's A-n minus the placebo's A-n on the same games (the CPU's key bias taken out)
    const pl = res.skills.find(r => r.opp === op.id && r.skill === 'placebo'), plV = curve.filter(v => v.skill === 'placebo' && has(v, M));
    if (pl) res.skills.filter(r => r.opp === op.id && r.skill !== 'placebo').forEach(r => {
      const v1 = curve.find(v => v.skill === r.skill && v.cost === r.cost && v.n === 1), p1v = plV.find(v => v.n === 1);
      if (v1 && p1v && has(v1, M)) { const d = dif(arr(all[v1.key], M), arr(all[p1v.key], M)); r.firstNet = { d: mean(d), se: se(d) }; r.firstNetPts = slope ? mean(d) / slope : null; r.firstNetPtsSe = slope ? se(d) / slope : null; }
      r.marg1NetPts = slope ? (sAt(r.fit, 1) - sAt(pl.fit, 1)) / slope : null;
      const ni = r.nstar; r.gainNet = sAt(r.fit, ni) - sAt(pl.fit, ni); });
    // the real cards
    const cv = fs.existsSync(nstarFile()) ? variants('cards', JSON.parse(fs.readFileSync(nstarFile(), 'utf8'))).filter(v => v.opp === op.id) : [];
    for (const [id, sk, L] of CARDS) for (const cx of ['A-0', 'A-n*']) {
      const re = cv.find(v => v.card === id && v.kind === 'real' && v.ctx === cx), tw = cv.find(v => v.card === id && v.kind === 'twin' && v.ctx === cx); if (!re || !tw || !has(re, M) || !has(tw, M)) continue;
      const ar = arr(all[re.key], M), at = arr(all[tw.key], M), ref = cx === 'A-0' ? a0 : (() => { const k = op.id + '|' + slotKey(deckA(re.n, 'rb-' + sk + '-' + re.cost)); return (all[k] || '').length >= M ? arr(all[k], M) : null; })();
      const dTw = dif(ar, at), dRef = ref ? dif(ar, ref) : null, rr = realOf(defs, id, L);
      res.cards.push({ opp: op.id, card: id, skill: sk, level: L, ctx: cx, n: re.n || 0, cost: re.cost, wr: mean(ar), vsTwin: { d: mean(dTw), se: se(dTw) }, vsSlot: dRef ? { d: mean(dRef), se: se(dRef) } : null,
        vsTwinPts: slope ? mean(dTw) / slope : null, vsTwinPtsSe: slope ? se(dTw) / slope : null, vsSlotPts: slope && dRef ? mean(dRef) / slope : null, vsSlotPtsSe: slope && dRef ? se(dRef) / slope : null,
        printed: { cost: rr.def.cost, wait: rr.def.wait, rarity: rr.def.rarity, attack: rr.def.attack, health: rr.def.health, effects: rr.def.effects }, budget: rr.budget, twin: { attack: defs[rr.twin].attack, health: defs[rr.twin].health, N: rr.twinN } });
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  // n* is frozen (nstar.json) once every curve variant has its games: the cards phase builds its A-n* decks from it; --renstar rewrites it
  const curveDone = variants('curve', null).every(v => (all[v.key] || '').length >= Math.max(400, (res.base && res.base[v.opp] && res.base[v.opp].games) || 1e9));
  if (curveDone && (!fs.existsSync(nstarFile()) || o.renstar)) fs.writeFileSync(nstarFile(), JSON.stringify(nstar, null, 1));
  res.curveComplete = curveDone;
  res.nstarUsed = fs.existsSync(nstarFile()) ? JSON.parse(fs.readFileSync(nstarFile(), 'utf8')) : nstar;
  const f = path.join(OUT, 'resbench1-' + res.date + '.json'); fs.writeFileSync(f, JSON.stringify(res, null, 1));
  // the short summary
  const pp = v => v == null ? '-' : (v >= 0 ? '+' : '') + (v * 100).toFixed(1), p1 = v => v == null ? '-' : (v >= 0 ? '+' : '') + v.toFixed(1);
  for (const op of OPPS) { if (!res.base || !res.base[op.id]) continue; const c = res.calib[op.id];
    console.log(`\n${op.id}: A-0 ${pp(res.base[op.id].wr)}% ± ${(1.96 * res.base[op.id].se * 100).toFixed(1)} (${res.base[op.id].games} games); slope ${c.slope != null ? (c.slope * 100).toFixed(2) : '-'} WR pts / budget pt [${c.lo != null ? (c.lo * 100).toFixed(2) : '-'}, ${c.hi != null ? (c.hi * 100).toFixed(2) : '-'}]`);
    res.skills.filter(r => r.opp === op.id).forEach(r => console.log(`  ${(r.skill + '-' + r.cost).padEnd(18)} n* ${r.nstar.toFixed(1)} [${r.nstarLo.toFixed(1)}, ${r.nstarHi.toFixed(1)}] gain ${pp(r.gain)} [${pp(r.gainLo)}, ${pp(r.gainHi)}]  first copy ${pp(r.first.d)} ± ${(1.96 * r.first.se * 100).toFixed(1)} = ${p1(r.marg1Pts)} pts (fit), price S ${r.price}`));
    res.cards.filter(r => r.opp === op.id).forEach(r => console.log(`  ${r.card.padEnd(24)} ${r.ctx.padEnd(5)} vs twin ${pp(r.vsTwin.d)} ± ${(1.96 * r.vsTwin.se * 100).toFixed(1)} = ${p1(r.vsTwinPts)} pts; vs slot ${r.vsSlot ? pp(r.vsSlot.d) : '-'}`)); }
  console.log('\nwrote', path.relative(ROOT, f));
  if (o.md) fs.writeFileSync(o.md, mdTables(res)), console.log('wrote', o.md);
}
// the report's tables (markdown), from the report's JSON
function mdTables(res) {
  const pp = v => v == null ? '-' : (v >= 0 ? '+' : '') + (v * 100).toFixed(1), p1 = v => v == null || !isFinite(v) ? '-' : (v >= 0 ? '+' : '') + v.toFixed(1), ci = (d, s) => `${pp(d)} ± ${(1.96 * s * 100).toFixed(1)}`;
  const L = [], dN = res.testCreatures[1].N - res.testCreatures[0].N + 0; // what 1 Lumber of cost adds to N, read on the vanillas (plain bonus on both)
  L.push('### Test creatures (Level ' + res.level + ', Common, Wait 0, Map 0, plain)', '', '| Id | Lumber | N | Body | Copies in A-0 |', '|---|---:|---:|---|---:|');
  res.testCreatures.forEach(t => L.push(`| ${t.id} | ${t.cost} | ${t.N} | ${t.attack}/${t.health} | ${t.copies} |`));
  L.push('', '### Baselines and calibration', '', '| Opponent | A-0 win rate | Games | Slope (WR points per budget point, bumps on 1-4 copies) [95%] | +1 Attack alone | +2 Health alone | Calibration points (ΔWR vs A-0 ± 95%) |', '|---|---:|---:|---|---:|---:|---|');
  res.opps.forEach(o => { const b = res.base && res.base[o.id], c = res.calib[o.id]; if (!b) return;
    L.push(`| ${o.id} | ${pp(b.wr).replace('+', '')}% ± ${(1.96 * b.se * 100).toFixed(1)} | ${b.games} | ${c.slope != null ? (c.slope * 100).toFixed(2) : '-'} [${c.lo != null ? (c.lo * 100).toFixed(2) : '-'}, ${c.hi != null ? (c.hi * 100).toFixed(2) : '-'}] | ${(c.slopeA * 100).toFixed(2)} | ${(c.slopeH * 100).toFixed(2)} | ${c.points.map(p => `${p.variant} (${p.pts} pts) ${ci(p.d, p.se)}`).join('; ')} |`); });
  L.push('', '### The A-n curves', '', 'ΔWR of A-n over A-0 in win-rate points (paired, same games), the saturating fit\'s n* and gain with 95% bootstrap intervals (the quadratic\'s n* beside it), the first copy in budget points (A-1 over A-0 on the same games, divided by the slope; and net of the placebo\'s A-1) and the price table\'s S for the test creature.', '',
    '| Skill | Cost | Opp | ΔWR at n = ' + res.ns.join(' / ') + ' | n* [95%] | Quadratic n* | Gain at n* [95%] | Gain net of placebo | First copy (pts ± 95%) | First copy net of placebo (pts ± 95%) | Price S | Budget says (S, or S − ' + dN.toFixed(2) + ' for 1 Lumber) |', '|---|---:|---|---|---|---:|---|---:|---:|---:|---:|---:|');
  res.skills.forEach(r => L.push(`| ${r.skill} | ${r.cost} | ${r.opp} | ${r.points.slice(1).map(p => pp(p.d)).join(' / ')} | ${r.nstar.toFixed(1)} [${r.nstarLo.toFixed(1)}, ${r.nstarHi.toFixed(1)}] | ${r.quad.nstar.toFixed(1)} | ${pp(r.gain)} [${pp(r.gainLo)}, ${pp(r.gainHi)}] | ${pp(r.gainNet)} | ${p1(r.firstPts)} ± ${(1.96 * r.firstPtsSe).toFixed(1)} | ${r.firstNetPts != null ? p1(r.firstNetPts) + ' ± ' + (1.96 * r.firstNetPtsSe).toFixed(1) : '-'} | ${r.price} | ${p1(r.cost ? r.price - dN : r.price)} |`));
  L.push('', '### Real cards', '', 'Each card at the level its resource skill is live, one copy. "vs twin": the card against a plain body of its own cost, Wait, rarity and map sized by the budget (+ = stronger than its budget buys), in budget points ± 95%. "vs slot": the card against the test creature it replaced (a vanilla 0-Lumber in A-0, a resource test creature in A-n*), ΔWR.', '',
    '| Card | Skill | L | Printed | Cap-1 use | Opp | A-0 vs twin (pts) | A-n* vs twin (pts) | A-0 vs slot (ΔWR) | A-n* vs slot (ΔWR) |', '|---|---|---:|---|---:|---|---:|---:|---:|---:|');
  const byCard = {}; res.cards.forEach(r => { const k = r.card + '|' + r.opp; (byCard[k] = byCard[k] || {})[r.ctx] = r; });
  Object.values(byCard).forEach(x => { const a = x['A-0'] || x['A-n*'], b = x['A-n*'], z = x['A-0'];
    L.push(`| ${a.card} | ${a.skill || '-'} | ${a.level} | ${a.printed.cost}L w${a.printed.wait} ${a.printed.attack}/${a.printed.health} | ${Math.round(a.budget.x1 / a.budget.N * 100)}% | ${a.opp} | ${z ? p1(z.vsTwinPts) + ' ± ' + (1.96 * z.vsTwinPtsSe).toFixed(1) : '-'} | ${b ? p1(b.vsTwinPts) + ' ± ' + (1.96 * b.vsTwinPtsSe).toFixed(1) + ' (A-' + b.n + ')' : '-'} | ${z && z.vsSlot ? ci(z.vsSlot.d, z.vsSlot.se) : '-'} | ${b && b.vsSlot ? ci(b.vsSlot.d, b.vsSlot.se) : '-'} |`); });
  return L.join('\n') + '\n';
}

if (require.main === module) {
  const o = parse(process.argv.slice(2));
  if (process.argv.includes('--renstar')) o.renstar = true;
  ({ plan: cmdPlan, run: cmdRun, report: cmdReport })[o.cmd](o);
}
module.exports = { SKILLS, CARDS, OPPS, testDefs, sizeBody, variants, quadFit, nStarOf };
