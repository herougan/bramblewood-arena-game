#!/usr/bin/env node
// 2026-11-07 (owner 07:15: "redo a skill budgeting test ... such that the skill's budget is a comprehensive and good one. E.g. test armor 1,
// armor 2, armor 3..."; package BAL23, the owner's method 07:37): the skill ladder. A skill's price = the most it is worth on any body.
//
//   node tools/skill_ladder_2026_11_07.js plan [--games 400]       the measurements, the pairs and the time estimate (no games)
//   node tools/skill_ladder_2026_11_07.js run [--games 400] [--hours 2] [--only armor,poison] [--no-pairs]   play them (resumable)
//   node tools/skill_ladder_2026_11_07.js summary [--games 400]    the prices -> docs/balance/skill-ladder/summary-2026-11-07.{json,md}
//   node tools/skill_ladder_2026_11_07.js check [--games 1000]     the anchors at each level (the canon tool's check: the common rate)
// Options: --levels 1,5 (default), --workers N (2), --cache-dir D (default ~/.cache/bramble-ladder: its own, so a canon run sharing the
// global context never overwrites its cache file), --rate 1=0.031,5=0.027 (win rate a budget point; default the anchors' canon rate from
// docs/balance/skill-ladder/skill-canon-anchors-L<L>-ladder.json, else the stat yardstick measured on the bodies), --boot B (300).
//
// The method (owner 2026-11-07 07:37):
//   1. the N ladder: a numbered skill at N = 1 .. min(4, one past the highest on a Map 0-20 card, at least 2); Shield at 2, 4, 6; an on/off
//      skill once. Twin Strike always (the owner's example).
//   2. bodies, not fixed carriers: one vanilla base (War Hound: cost 1, Wait 1, no type any rule reads) re-statted as bench variants
//      (dA / dH on its levelled copy) to every Attack / Health spread at its own budget, 3A + H = round(N(L)) (L1: 23, A 1..7; L5: 27,
//      A 1..8), Health at least 1. When a level allows more than 8 spreads, 8 are drawn per skill (seeded by the skill; Attack 1 and the
//      most always in). Every body plays with and without the skill on the same fights (paired; common random numbers). The worth on a
//      body = the paired gain (less the placebo's, once a key the skill adds: the CPU values a card by its number of effect keys) / one
//      common rate (the anchors' canon rate at that level: win rate a canon = 3A + H point). The price = the MAXIMUM worth over bodies,
//      read off a quadratic fitted to worth against attack share (3A / budget), its maximum inside the sampled range (so one lucky noisy
//      body does not set it); the raw best body and the mean over bodies are reported beside it. 95% intervals: a bootstrap over fights
//      (the same resampled fights for every body and variant), the curve refitted each time; the rate is held fixed (its own interval is
//      in the anchors file).
//   3. win rate stays the measure; a body whose win rate with or without the skill is over 85% is flagged (the cap at 100 squeezes it).
//   4. Levels 1 and 5, both brambles 15, the global context (every road fight's field: field skills such as Nocturnal or Tide are read
//      under the road's mix), slot of 6 copies, the bench's random decks.
//   5. pairs: the 25 skill pairs that occur together most often on Map 0-20 cards (at their commonest numbers, put on the ladder), each
//      played on its best body (the most the two singles' curves add to): synergy = worth of the pair - worth of the two singles there.
//   6. summary: per skill and N, the table price, the best worth (95%), the mean over bodies, the best spread, a value x N^pow curve per
//      level, L1 and L5 side by side, ** where the price is off (more than 0.5 and outside the interval), ^ where a body passed 85%.
// Nothing is written to canonical/skill-costs.json: a price change stays the owner's call. Games are cached (tools/bench/lib.js, keyed by
// the game's fingerprint), so a stopped run resumes where it stopped; --hours H stops starting new work after H hours (segments).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'docs', 'balance', 'skill-ladder'), TAG = 'ladder';
const VERSION = '2.0.0 (2026-11-07, BAL23)';
const CAP = 4, SHIELD_NS = [2, 4, 6], FORCE = ['twinStrike'], BASE = 'war-hound', MAX_BODIES = 8, PAIRS = 25, FLAG_WR = 0.85, BRAMBLE = 15;
const PLACEBO = { skill2Placebo: true }; // the canon tool's placebo (a key the engine does not know)
// keys that are a parameter of another skill, or not a skill the table prices on its own
const SKIP = new Set(['deliveryEvery', 'triggers', 'remember', 'leader', 'archerStyle', 'hatchling', 'fodder', 'speciesOverride']);
const SPEED = 85; // games a second with 2 workers on an idle 2-core machine (owner 11-07)

// ---------------------------------------------------------------- the plan
function ladderOf(key, max) { return key === 'shield' ? SHIELD_NS.slice() : Array.from({ length: Math.min(CAP, Math.max(2, Math.ceil(max) + 1)) }, (_, i) => i + 1); }
function onLadder(key, v, ns) { // a card's number put on the skill's ladder
  if (ns.length === 1 && ns[0] === true) return true; const x = typeof v === 'number' ? v : 1;
  return ns.reduce((b, n) => Math.abs(n - x) < Math.abs(b - x) || (Math.abs(n - x) === Math.abs(b - x) && n > b) ? n : b, ns[0]);
}
function planOf(opt) {
  opt = opt || {};
  const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const cards = new Map(J('canonical/cards.json').map(c => [c.id, c])), pools = J('canonical/map-pools.json').maps, table = J('canonical/skill-costs.json');
  const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, priced = new Set((table.skills || []).map(e => e.id));
  const ids = new Set(); Object.entries(pools).forEach(([m, v]) => { const no = G.mapNumberOf(m); if (no != null && no <= 20) (v.cards || []).forEach(id => ids.add(id)); });
  const seen = new Map(); // key -> {max, flag, other, cards}
  ids.forEach(id => { const c = cards.get(id); if (!c) return; Object.entries(c.effects || {}).forEach(([k, v]) => {
    if (SKIP.has(k)) return; const s = seen.get(k) || { key: k, max: 0, flag: false, other: false, cards: 0 }; s.cards++;
    if (typeof v === 'boolean') s.flag = true; else if (typeof v === 'number') s.max = Math.max(s.max, v); else s.other = true; seen.set(k, s); }); });
  FORCE.forEach(k => { if (!seen.has(k)) seen.set(k, { key: k, max: 0, flag: true, other: false, cards: 0 }); });
  const items = [], skipped = [], ladders = {};
  [...seen.values()].sort((a, b) => b.cards - a.cards || (a.key < b.key ? -1 : 1)).forEach(s => {
    if (!priced.has(s.key)) { skipped.push(s.key + ' (not in the cost table)'); return; }
    if (s.max > 0 || s.key === 'shield') ladders[s.key] = ladderOf(s.key, s.max);
    else if (s.flag) ladders[s.key] = [true];
    else { skipped.push(s.key + ' (object value: measured with its card, not on its own)'); return; }
    ladders[s.key].forEach(n => items.push({ key: s.key, n, cards: s.cards }));
  });
  // pairs that occur together on a card, at their commonest numbers (on the ladder)
  const pc = new Map();
  ids.forEach(id => { const c = cards.get(id); if (!c) return; const ks = Object.keys(c.effects || {}).filter(k => ladders[k]).sort();
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const a = ks[i], b = ks[j], na = onLadder(a, c.effects[a], ladders[a]), nb = onLadder(b, c.effects[b], ladders[b]);
      const p = pc.get(a + '+' + b) || { a, b, cards: 0, at: {} }; p.cards++; const t = na + '|' + nb; p.at[t] = (p.at[t] || 0) + 1; pc.set(a + '+' + b, p); } });
  const pairs = [...pc.values()].sort((x, y) => y.cards - x.cards || ((x.a + x.b) < (y.a + y.b) ? -1 : 1)).slice(0, opt.pairs != null ? opt.pairs : PAIRS).map(p => {
    const [t] = Object.entries(p.at).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0], [na, nb] = t.split('|').map(s => s === 'true' ? true : +s);
    return { key: p.a + '+' + p.b, a: { key: p.a, n: na }, b: { key: p.b, n: nb }, cards: p.cards }; });
  const only = opt.only || null;
  return { items: only ? items.filter(x => only.includes(x.key)) : items, pairs: only ? pairs.filter(p => only.includes(p.a.key) && only.includes(p.b.key)) : pairs, skipped, cards: ids.size, ladders };
}

// ---------------------------------------------------------------- bodies
// every Attack / Health spread at budget Bud (3A + H = Bud, A >= 1, H >= 1); more than `max`: Attack 1, the most, and a seeded draw
function bodiesOf(Bud, seed, max, rng) {
  const top = Math.floor((Bud - 1) / 3), all = []; for (let A = 1; A <= top; A++) all.push(A);
  let pick = all;
  if (all.length > max) { const r = rng || mulberry(fnv('ladder-bodies|' + seed)), mid = all.slice(1, -1);
    for (let i = mid.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mid[i], mid[j]] = [mid[j], mid[i]]; }
    pick = [all[0]].concat(mid.slice(0, max - 2), [all[all.length - 1]]).sort((a, b) => a - b); }
  return pick.map(A => ({ A, H: Bud - 3 * A, x: 3 * A / Bud }));
}
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- curves
// least-squares quadratic y = c0 + c1 x + c2 x^2 (a line when fewer than 3 points); its maximum on [lo, hi]
function fitQuad(xs, ys, lo, hi) {
  const n = xs.length; if (lo == null) lo = Math.min(...xs); if (hi == null) hi = Math.max(...xs);
  let c;
  if (n >= 3) { const S = [0, 0, 0, 0, 0], T = [0, 0, 0]; for (let i = 0; i < n; i++) { let p = 1; for (let k = 0; k < 5; k++) { S[k] += p; if (k < 3) T[k] += p * ys[i]; p *= xs[i]; } }
    c = solve3([[S[0], S[1], S[2]], [S[1], S[2], S[3]], [S[2], S[3], S[4]]], T); }
  if (!c) { const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
    const b = sxx ? sxy / sxx : 0; c = [my - b * mx, b, 0]; }
  const f = x => c[0] + c[1] * x + c[2] * x * x, cand = [lo, hi]; if (c[2] < 0) { const v = -c[1] / (2 * c[2]); if (v > lo && v < hi) cand.push(v); }
  let bx = cand[0]; cand.forEach(x => { if (f(x) > f(bx)) bx = x; });
  return { c, f, xMax: bx, yMax: f(bx) };
}
function solve3(A, b) { // Gaussian elimination with partial pivoting; null when singular
  const M = A.map((r, i) => r.concat([b[i]]));
  for (let i = 0; i < 3; i++) { let p = i; for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; if (Math.abs(M[p][i]) < 1e-12) return null; [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < 3; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let k = i; k < 4; k++) M[r][k] -= f * M[i][k]; } }
  return [0, 1, 2].map(i => M[i][3] / M[i][i]);
}
// value x N^pow through the measured points (weighted least squares on log worth, weight 1 / relative variance); points <= 0.05 left out
function fitPow(pts) {
  const num = pts.filter(x => typeof x.n === 'number' && x.m > 0.05); if (num.length < 2) return null;
  let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  num.forEach(x => { const w = 1 / Math.max(0.01, Math.pow((x.se || x.m * 0.2) / x.m, 2)), X = Math.log(x.n), Y = Math.log(x.m); sw += w; sx += w * X; sy += w * Y; sxx += w * X * X; sxy += w * X * Y; });
  const den = sw * sxx - sx * sx; if (Math.abs(den) < 1e-12) return null; const pw = (sw * sxy - sx * sy) / den, a = Math.exp((sy - pw * sx) / sw);
  return { value: +a.toFixed(3), pow: +pw.toFixed(3) };
}

// ---------------------------------------------------------------- the bench side
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
const q = (a, p) => { const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))]; };
function bench(o) {
  const L = require('./bench/lib.js'), B = new L.Bench(o), gm = B.gm, defs = gm.G.referenceBaseDefs(), lv = {};
  o.levels.forEach(Lv => {
    const X = B.context(L.csOf(Object.assign({}, o, { level: Lv, bramble: BRAMBLE, map: null, pool: null })));
    const m = L.O.mineFor(gm, defs, { [BASE]: 1 }, Lv), s = defs[Object.keys(m)[0]];
    const Bud = Math.round(L.budgetOf(Object.assign({}, gm.D[BASE], { attack: s.attack, health: s.health }), Lv).N);
    lv[Lv] = { X, a0: s.attack, h0: s.health, Bud };
  });
  const variant = (Lv, body, eff) => { const c = lv[Lv], v = { base: BASE }; if (body.A !== c.a0) v.dA = body.A - c.a0; if (body.H !== c.h0) v.dH = body.H - c.h0;
    if (eff) { const add = Object.assign({}, eff), trig = add.triggers; delete add.triggers; if (Object.keys(add).length) v.add = add; if (Array.isArray(trig) && trig.length) v.addTrig = trig; } return v; };
  const bodies = (Lv, seed) => bodiesOf(lv[Lv].Bud, seed, MAX_BODIES);
  const have = (Lv, v, M) => { const X = lv[Lv].X; for (let i = 0; i < M; i++) if (B.get(X, v, BASE, i) == null) return false; return true; };
  const scores = (Lv, v, M) => B.scores(lv[Lv].X, v, BASE, M);
  const price = (Lv, body, eff) => { const d = Object.assign({}, gm.D[BASE], { attack: body.A, health: body.H }); return L.budgetOf(Object.assign({}, d, { effects: eff }), Lv).x1 - L.budgetOf(Object.assign({}, d, { effects: {} }), Lv).x1; };
  return { L, B, gm, lv, variant, bodies, have, scores, price };
}
const effOf = (key, n) => ({ [key]: n });
const effPair = p => ({ [p.a.key]: p.a.n, [p.b.key]: p.b.n });
const seedOf = key => key.split('+')[0]; // a pair is drawn on its first skill's bodies (the same bodies whenever a level has 8 or fewer)
// the variants one skill point needs at a level: per body the base, the placebo, +1 Attack / +1 Health (the stat yardstick), the skill
function itemsFor(K, Lv, key, eff) { const out = []; K.bodies(Lv, seedOf(key)).forEach(b => { out.push({ v: K.variant(Lv, b) }, { v: K.variant(Lv, b, PLACEBO) }, { v: K.variant(Lv, { A: b.A + 1, H: b.H }) }, { v: K.variant(Lv, { A: b.A, H: b.H + 1 }) }); if (eff) out.push({ v: K.variant(Lv, b, eff) }); }); return out; }

// per body: the paired gain a fight (less the placebo once a key), the win rates
function gainsOf(K, Lv, key, eff, M, bodyList) {
  const bs = bodyList || K.bodies(Lv, seedOf(key)), k = Object.keys(eff).length;
  if (!bs.every(b => K.have(Lv, K.variant(Lv, b), M) && K.have(Lv, K.variant(Lv, b, PLACEBO), M) && K.have(Lv, K.variant(Lv, b, eff), M))) return null;
  return bs.map(b => { const s0 = K.scores(Lv, K.variant(Lv, b), M), s1 = K.scores(Lv, K.variant(Lv, b, eff), M), sp = K.scores(Lv, K.variant(Lv, b, PLACEBO), M), g = new Float64Array(M);
    let w0 = 0, w1 = 0; for (let i = 0; i < M; i++) { g[i] = s1[i] - s0[i] - k * (sp[i] - s0[i]); w0 += s0[i]; w1 += s1[i]; }
    return { body: b, g, wr0: w0 / M, wr1: w1 / M }; });
}
const meanIx = (a, ix) => { let s = 0; if (!ix) { for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; } for (let i = 0; i < ix.length; i++) s += a[ix[i]]; return s / ix.length; };
function bootIdx(M, B, seed) { const r = mulberry(fnv('ladder-boot|' + seed)), out = []; for (let b = 0; b < B; b++) { const a = new Uint32Array(M); for (let i = 0; i < M; i++) a[i] = Math.floor(r() * M); out.push(a); } return out; }
// the stat yardstick on the bodies (a fallback rate, and a check of the anchors' one): (gain of +1 Attack + gain of +1 Health) / 4 a body
function statRateOf(K, Lv, M, bs) {
  if (!bs.every(b => K.have(Lv, K.variant(Lv, b), M) && K.have(Lv, K.variant(Lv, { A: b.A + 1, H: b.H }), M) && K.have(Lv, K.variant(Lv, { A: b.A, H: b.H + 1 }), M))) return null;
  let t = 0; bs.forEach(b => { const s0 = K.scores(Lv, K.variant(Lv, b), M), a = K.scores(Lv, K.variant(Lv, { A: b.A + 1, H: b.H }), M), h = K.scores(Lv, K.variant(Lv, { A: b.A, H: b.H + 1 }), M);
    t += (meanIx(a) + meanIx(h) - 2 * meanIx(s0)) / 4; }); return t / bs.length;
}
// one skill point at a level: the worth on each body, the curve's maximum, the raw best, the mean, intervals
function measure(G, rate, boots) {
  const xs = G.map(x => x.body.x), lo = Math.min(...xs), hi = Math.max(...xs);
  const one = ix => { const w = G.map(x => meanIx(x.g, ix) / rate), f = fitQuad(xs, w, lo, hi); let rb = 0; w.forEach((v, j) => { if (v > w[rb]) rb = j; }); return { w, f, rb, mean: w.reduce((a, b) => a + b, 0) / w.length }; };
  const m = one(null), bs = boots.map(ix => one(ix)), ci = (f0, fb) => ({ m: r2(f0), lo: r2(q(fb, 0.025)), hi: r2(q(fb, 0.975)) });
  const Bud = G[0].body.H + 3 * G[0].body.A, xStar = m.f.xMax, aStar = xStar * Bud / 3;
  return { best: ci(m.f.yMax, bs.map(b => b.f.yMax)), raw: ci(m.w[m.rb], bs.map(b => Math.max(...b.w))), mean: ci(m.mean, bs.map(b => b.mean)),
    spread: { share: r2(xStar), A: r2(aStar), H: r2(Bud - 3 * aStar), xLo: r2(lo), xHi: r2(hi) }, rawBody: { A: G[m.rb].body.A, H: G[m.rb].body.H },
    bodies: G.map((x, j) => ({ A: x.body.A, H: x.body.H, worth: r2(m.w[j]), wr0: r2(x.wr0), wr1: r2(x.wr1) })), flag85: G.filter(x => x.wr0 > FLAG_WR || x.wr1 > FLAG_WR).map(x => x.body.A + '/' + x.body.H), quad: m.f.c.map(v => +v.toFixed(4)) };
}

// ---------------------------------------------------------------- commands
function parse(argv) {
  const L = require('./bench/lib.js'), o = L.defaults(), a = argv.slice(); o.cmd = a.shift() || 'help'; o.games = 400; o.levels = [1, 5]; o.cacheDir = path.join(os.homedir(), '.cache', 'bramble-ladder'); o.boot = 300; o.pairsOn = true;
  while (a.length) { if (L.parseCommon(a, o)) continue; const k = a.shift();
    if (k === '--levels') o.levels = a.shift().split(',').map(Number); else if (k === '--only') o.only = a.shift().split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--hours') o.hours = +a.shift(); else if (k === '--no-pairs') o.pairsOn = false; else if (k === '--boot') o.boot = +a.shift();
    else if (k === '--rate') { o.rate = {}; a.shift().split(',').forEach(s => { const [l, r] = s.split('='); o.rate[+l] = +r; }); }
    else throw new Error('unknown option ' + k); }
  o.quiet = false; return o;
}
function rateFor(o, K, Lv, M) {
  if (o.rate && o.rate[Lv]) return { r: o.rate[Lv], from: '--rate' };
  const f = path.join(OUT, `skill-canon-anchors-L${Lv}-${TAG}.json`);
  if (fs.existsSync(f)) { const x = JSON.parse(fs.readFileSync(f, 'utf8')); return { r: x.canonRate.m, ci: x.canonRate, from: path.relative(ROOT, f) + ' (canon rate, ' + x.context.fights + ' fights)' }; }
  const s = statRateOf(K, Lv, M, K.bodies(Lv, '')); return s ? { r: s, from: 'the stat yardstick on the bodies (no anchors file)' } : null;
}
function planSize(o, p) {
  const K = bench(Object.assign({}, o, { workers: 0 })); try {
    const per = {}; o.levels.forEach(Lv => { const keys = new Set(); p.items.forEach(x => itemsFor(K, Lv, x.key, effOf(x.key, x.n)).forEach(it => keys.add(K.L.vKey(it.v)))); per[Lv] = { variants: keys.size + (o.pairsOn ? p.pairs.length : 0), Bud: K.lv[Lv].Bud, bodies: K.bodies(Lv, 'x').length, base: K.lv[Lv].a0 + '/' + K.lv[Lv].h0 }; });
    return per; } finally { K.B.close(); }
}
async function main(argv) {
  const o = parse(argv), M = o.games;
  if (o.cmd === 'help' || o.cmd === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 40).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const p = planOf({ only: o.only });
  if (o.cmd === 'plan') {
    console.log(`${p.cards} cards on Maps 0-20; ${p.items.length} skill points a level; ${p.pairs.length} pairs`);
    const by = {}; p.items.forEach(x => { (by[x.key] = by[x.key] || []).push(x.n === true ? 'on' : x.n); }); Object.entries(by).forEach(([k, ns]) => console.log(`  ${k.padEnd(18)} ${ns.join(' ')}`));
    console.log('pairs: ' + p.pairs.map(x => `${x.a.key} ${x.a.n === true ? '' : x.a.n} + ${x.b.key} ${x.b.n === true ? '' : x.b.n} (${x.cards})`.replace(/ +\(/g, ' (').replace(/ +\+/g, ' +')).join('; '));
    if (p.skipped.length) console.log('skipped: ' + p.skipped.join('; '));
    const per = planSize(o, p); let tot = 0;
    Object.entries(per).forEach(([Lv, s]) => { tot += s.variants; console.log(`Level ${Lv}: base ${BASE} ${s.base}, budget 3A + H = ${s.Bud}, ${s.bodies} bodies; ${s.variants} variants x ${M} fights = ${s.variants * M} games`); });
    console.log(`total ${tot * M} games: about ${(tot * M / SPEED / 3600).toFixed(1)} h at ${SPEED} games/s (2 workers, idle machine; a shared CPU is slower). Cache: ${o.cacheDir}`);
    return;
  }
  if (o.cmd === 'check') { // the anchors at each level by the canon tool (its check command): the common rate
    const { spawnSync } = require('child_process'); fs.mkdirSync(OUT, { recursive: true });
    o.levels.forEach(Lv => { const f = path.join(OUT, `skill-canon-anchors-L${Lv}-${TAG}.json`); if (fs.existsSync(f)) { console.log('have ' + path.relative(ROOT, f)); return; }
      const g = argv.includes('--games') ? M : 1000;
      const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'skill_canon_2026_10_31.js'), 'check', '--bramble', String(BRAMBLE), '--games', String(g), '--level', String(Lv), '--save', '--out', OUT, '--name', `anchors-L${Lv}`, '--tag', TAG], { cwd: ROOT, stdio: 'inherit' });
      console.log(`anchors L${Lv}: exit ${r.status}`); });
    return;
  }
  const K = bench(o);
  try {
    if (o.cmd === 'run') {
      const t0 = Date.now(), late = () => o.hours && (Date.now() - t0) / 3600000 >= o.hours, keys = [...new Set(p.items.map(x => x.key))];
      K.B.log(`skill ladder ${VERSION}: ${keys.length} skills, ${p.items.length} points, ${o.pairsOn ? p.pairs.length : 0} pairs, Levels ${o.levels.join(', ')}, ${M} fights a variant; cache ${o.cacheDir}${o.hours ? '; stops starting new work after ' + o.hours + ' h' : ''}`);
      let k = 0;
      for (const key of keys) { k++;
        if (late()) { K.B.log(`time is up (${o.hours} h): stopped before ${key}; re-run the same command to go on`); return; }
        for (const Lv of o.levels) { const its = []; p.items.filter(x => x.key === key).forEach(x => its.push(...itemsFor(K, Lv, key, effOf(key, x.n))));
          const n = await K.B.need(K.lv[Lv].X, its, M); K.B.log(`[${k}/${keys.length}, ${Math.round((Date.now() - t0) / 60000)} min] L${Lv} ${key}: ${n} games played`); }
      }
      if (o.pairsOn) for (const pr of p.pairs) { if (late()) { K.B.log(`time is up (${o.hours} h): stopped before the pair ${pr.key}`); return; }
        for (const Lv of o.levels) { const bb = pairBody(K, Lv, pr, M); if (!bb) { K.B.log(`L${Lv} pair ${pr.key}: its singles are not all played yet (skipped)`); continue; }
          const n = await K.B.need(K.lv[Lv].X, [{ v: K.variant(Lv, bb, effPair(pr)) }], M); K.B.log(`L${Lv} pair ${pr.key} on ${bb.A}/${bb.H}: ${n} games played`); } }
      K.B.log(`done in ${Math.round((Date.now() - t0) / 60000)} min; now: node tools/skill_ladder_2026_11_07.js summary --games ${M}${o.only ? ' --only ' + o.only.join(',') : ''}`);
    } else if (o.cmd === 'summary') summary(o, K, p, M);
    else throw new Error('unknown command ' + o.cmd + ' (plan, run, summary, check, help)');
  } finally { K.B.close(); }
}
// a pair's best body: the most the two singles' curves add to (no rate needed: the gains in win rate)
function pairBody(K, Lv, pr, M) {
  const bs = K.bodies(Lv, seedOf(pr.key)), ga = gainsOf(K, Lv, pr.key, effOf(pr.a.key, pr.a.n), M, bs), gb = gainsOf(K, Lv, pr.key, effOf(pr.b.key, pr.b.n), M, bs); if (!ga || !gb) return null;
  const xs = bs.map(b => b.x), fa = fitQuad(xs, ga.map(x => meanIx(x.g))), fb = fitQuad(xs, gb.map(x => meanIx(x.g)));
  let j = 0; bs.forEach((b, i) => { if (fa.f(b.x) + fb.f(b.x) > fa.f(bs[j].x) + fb.f(bs[j].x)) j = i; }); return bs[j];
}
function summary(o, K, p, M) {
  const { T } = K.L.costs(), out = { tool: 'tools/skill_ladder_2026_11_07.js ' + VERSION, generated: new Date().toISOString(), fingerprint: K.L.fingerprint(), games: M, base: BASE, levels: {}, skills: [], pairs: [] };
  const rates = {}, boots = {};
  o.levels.forEach(Lv => { const r = rateFor(o, K, Lv, M), st = statRateOf(K, Lv, M, K.bodies(Lv, '')); rates[Lv] = r; boots[Lv] = bootIdx(M, o.boot, Lv + '|' + M);
    out.levels['L' + Lv] = { budget: K.lv[Lv].Bud, baseStats: K.lv[Lv].a0 + '/' + K.lv[Lv].h0, bodies: K.bodies(Lv, '').map(b => b.A + '/' + b.H).join(' '), rate: r && r.r, rateFrom: r && r.from, rateCi: r && r.ci || null, statRateOnBodies: r2(st == null ? null : st * 100) }; });
  [...new Set(p.items.map(x => x.key))].forEach(key => {
    const ns = p.items.filter(x => x.key === key).map(x => x.n), s = { key, cards: p.items.find(x => x.key === key).cards, points: [], fit: {} };
    ns.forEach(n => { const pt = { n, price: r2(T.skillCost(key, n)) };
      o.levels.forEach(Lv => { if (!rates[Lv]) return; const G = gainsOf(K, Lv, key, effOf(key, n), M); if (!G) return; const m = measure(G, rates[Lv].r, boots[Lv]);
        m.bodyPrice = r2(K.price(Lv, m.rawBody, effOf(key, n))); m.off = pt.price != null && Math.abs(m.best.m - pt.price) > 0.5 && (pt.price < m.best.lo || pt.price > m.best.hi); pt['L' + Lv] = m; });
      s.points.push(pt); });
    o.levels.forEach(Lv => { const f = fitPow(s.points.filter(x => x['L' + Lv]).map(x => ({ n: x.n, m: x['L' + Lv].best.m, se: (x['L' + Lv].best.hi - x['L' + Lv].best.lo) / 3.92 }))); if (f) s.fit['L' + Lv] = f; });
    out.skills.push(s);
  });
  p.pairs.forEach(pr => { const row = { key: pr.key, a: pr.a, b: pr.b, cards: pr.cards };
    o.levels.forEach(Lv => { if (!rates[Lv]) return; const bb = pairBody(K, Lv, pr, M); if (!bb || !K.have(Lv, K.variant(Lv, bb, effPair(pr)), M)) return;
      const [gp] = gainsOf(K, Lv, pr.key, effPair(pr), M, [bb]), [ga] = gainsOf(K, Lv, pr.key, effOf(pr.a.key, pr.a.n), M, [bb]), [gb] = gainsOf(K, Lv, pr.key, effOf(pr.b.key, pr.b.n), M, [bb]), r = rates[Lv].r;
      const f = ix => [meanIx(gp.g, ix) / r, meanIx(ga.g, ix) / r, meanIx(gb.g, ix) / r], m = f(null), bs = boots[Lv].map(ix => { const v = f(ix); return v[0] - v[1] - v[2]; });
      row['L' + Lv] = { body: bb.A + '/' + bb.H, pair: r2(m[0]), a: r2(m[1]), b: r2(m[2]), synergy: { m: r2(m[0] - m[1] - m[2]), lo: r2(q(bs, 0.025)), hi: r2(q(bs, 0.975)) }, flag85: gp.wr1 > FLAG_WR || gp.wr0 > FLAG_WR }; });
    out.pairs.push(row); });
  fs.mkdirSync(OUT, { recursive: true }); const name = o.only ? `summary-2026-11-07-${o.only.join('-').slice(0, 60)}` : 'summary-2026-11-07';
  fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(out, null, 1) + '\n'); fs.writeFileSync(path.join(OUT, name + '.md'), md(out, o.levels));
  console.log(md(out, o.levels)); console.log(`-> docs/balance/skill-ladder/${name}.{json,md}`);
}
const ci = e => e ? `${e.m} [${e.lo}, ${e.hi}]` : '-';
function md(out, levels) {
  const Ls = levels.map(l => 'L' + l), lines = [`# Skill ladder, ${new Date(out.generated).toLocaleDateString('sv')} (package BAL23)`, '',
    `\`${out.tool}\`; game fingerprint \`${out.fingerprint}\`; ${out.games} paired fights a variant; base ${out.base}; brambles ${BRAMBLE}; the global context (the road's fields). Worth in 3A + H budget points. Nothing applied.`, ''];
  Ls.forEach(L => { const x = out.levels[L]; lines.push(`- ${L}: budget 3A + H = ${x.budget} (base ${x.baseStats}), bodies (A/H) ${x.bodies}; rate ${x.rate == null ? '-' : (x.rate * 100).toFixed(2)} win-rate points a budget point (${x.rateFrom || 'none'}); the stat yardstick on these bodies ${x.statRateOnBodies}.`); });
  lines.push('', '**Best** = the maximum of a quadratic through worth against attack share (95% bootstrap); raw = the best single body; mean = over bodies; spread = Attack/Health at the curve\'s maximum. ** = price off (more than 0.5 and outside 95%); ^ = a body over 85% win rate.', '',
    `| Skill | N | Price | ${Ls.map(L => `${L} best | ${L} raw (body) | ${L} mean | ${L} spread`).join(' | ')} |`, `|---|---|---|${Ls.map(() => '---|---|---|---').join('|')}|`);
  out.skills.forEach(s => { s.points.forEach((x, i) => { const fit = i ? '' : Ls.map(L => s.fit[L] ? `${L} ${s.fit[L].value}×N^${s.fit[L].pow}` : '').filter(Boolean).join(', ');
    lines.push(`| ${i ? '' : s.key + ' (' + s.cards + ')' + (fit ? '<br>' + fit : '')} | ${x.n === true ? 'on' : x.n} | ${x.price} | ${Ls.map(L => { const m = x[L]; if (!m) return '- | - | - | -';
      return `${m.off ? '**' : ''}${ci(m.best)}${m.off ? '**' : ''}${m.flag85.length ? ' ^' : ''} | ${m.raw.m} (${m.rawBody.A}/${m.rawBody.H}) | ${ci(m.mean)} | ${m.spread.A}/${m.spread.H}`; }).join(' | ')} |`); }); });
  if (out.pairs.length) { lines.push('', '## Pairs (synergy = the pair - the two singles, on the pair\'s best body)', '', `| Pair | Cards | ${Ls.map(L => `${L} body | ${L} pair = a + b | ${L} synergy (95%)`).join(' | ')} |`, `|---|---|${Ls.map(() => '---|---|---').join('|')}|`);
    out.pairs.forEach(pr => lines.push(`| ${pr.a.key} ${pr.a.n === true ? '' : pr.a.n} + ${pr.b.key} ${pr.b.n === true ? '' : pr.b.n} | ${pr.cards} | ${Ls.map(L => { const m = pr[L]; return m ? `${m.body} | ${m.pair} vs ${m.a} + ${m.b} | ${ci(m.synergy)}${m.flag85 ? ' ^' : ''}` : '- | - | -'; }).join(' | ')} |`)); }
  return lines.join('\n') + '\n';
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { planOf, ladderOf, onLadder, bodiesOf, fitQuad, fitPow, measure, CAP, SHIELD_NS, BASE, VERSION };
