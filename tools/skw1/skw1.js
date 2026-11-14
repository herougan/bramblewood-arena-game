#!/usr/bin/env node
// 2026-11-14 (package SKW1, owner 11-14 11:11: "measure skills weightage more. Using different ways of building the field too. Also, 2nd:
// attempt to measure Trigger -> Action costs. Find a way to decouple trigger from its actions."). Measurement only: writes nothing but its
// own results (docs/balance/skw1/) and its game cache (docs/balance/skw1/cache/).
//
//   node tools/skw1/skw1.js a --ctx g1 --games 100      Part A: the skill list below in one context (a-<ctx>.json)
//   node tools/skw1/skw1.js b --ctx g1 --games 100      Part B: the trigger x action grid in one context (b-<ctx>.json)
//   node tools/skw1/skw1.js report                      read every a-*.json / b-*.json, fit, print tables (summary.json + tables.md)
//   node tools/skw1/skw1.js contexts                    list the contexts (no games)
// Options: --games M (fights a variant; a later run with a larger M plays only the new fights), --seed S, --skills a,b (Part A subset).
//
// The method is the skill canon's (tools/skill_canon_2026_10_31.js), with the stat yardstick as the ruler and several contexts:
//   - six vanilla carriers (the canon's pick on the global pool: a Common and an Uncommon / Rare hitter, balanced and wall), the same in every
//     context, each as a slot of 6 copies in a 20-card deck; fight i has the same decks, field and engine seed for every variant (paired);
//   - per carrier: base, +1 Attack, +3 Health, the placebo (a key the engine does not know: the CPU's cardValue counts keys), and each test;
//   - gain_t[i] = mean over carriers of score(c + t) - score(c), less the placebo's gain once a key the test adds;
//   - the ruler r = (gain(+1 Attack) + gain(+3 Health)) / 6: win rate per budget point of stats (3A + H); worth = gain_t / r, in budget points;
//     the measured Attack weight = 3 x gain(+1 A) / gain(+3 H) (the budget says 3);
//   - 95% intervals: bootstrap over fights (400 resamples, the same fights for the test and the ruler);
//   - price: the budget's cap-1 left side of the variant less the carrier's, mean over carriers (tools/skill_costs.js on bramblewood-budget.js).
// Single thread (in-process games, no workers): the box is shared (owner rule: one worker).
'use strict';
const path = require('path'), fs = require('fs');
const L = require(path.join(__dirname, '..', 'bench', 'lib.js'));
const VERSION = '1.0.0 (2026-11-14, SKW1)';
const OUT = path.join(L.ROOT, 'docs', 'balance', 'skw1');
const CACHE = path.join(OUT, 'cache');
const BRAMBLE = 15; // the road's bramble Health (pipeline config measure.bramble, BAL12)
const CARRIERS = ['house-cat', 'bramblewood-lynx', 'blessed-avatar', 'stable-colt', 'rivergate-recruit', 'lucky-hopper']; // the canon's global-b15 pick (skill_canon anchors, 2026-11-14)
const PLACEBO = { skill2Placebo: true };
const BOOT = 400;

// ---------------------------------------------------------------- Part A: the skills (the most carried skills on Maps 0-20, at their usual N)
const SKILLS = {
  'flying': { flying: true }, 'evasive': { evasive: true }, 'tide': { tide: true }, 'armor=1': { armor: 1 }, 'armor=2': { armor: 2 },
  'poison=1': { poison: 1 }, 'poison=2': { poison: 2 }, 'guardian': { guardian: true }, 'nocturnal=1': { nocturnal: 1 }, 'diurnal=1': { diurnal: 1 },
  'pounce=2': { pounce: 2 }, 'bleed=1': { bleed: 1 }, 'bleed=2': { bleed: 2 }, 'delivery': { delivery: { v: 1, every: 'round' } }, 'arrow=1': { arrow: 1 },
  'thorns=1': { thorns: 1 }, 'thorns=2': { thorns: 2 }, 'quick': { quick: true }, 'regen=1': { regen: 1 }, 'regen=2': { regen: 2 }, 'sweep=2': { sweep: 2 },
  'dry': { dry: true }, 'inspiring=1': { inspiring: 1 }, 'pierce=1': { pierce: 1 }, 'illuminate': { illuminate: true }, 'esprit=2': { esprit: 2 },
  'rage': { rage: true }, 'shell=2': { shell: 2 }, 'stealth': { stealth: true }, 'fork': { fork: true }, 'siege=4': { siege: 4 }, 'backstab=2': { backstab: 2 },
  'reach': { reach: true }, 'keenEye': { keenEye: true }
};

// ---------------------------------------------------------------- Part B: triggers x actions (on the carrier itself)
const TRIGGERS = ['onSpawn', 'perTurn', 'onRoundStart', 'onAttack', 'onAttacked', 'onDeath', 'onKill', 'onAllyDie', 'onEnemySpawn', 'onAllyPlayed'];
const ACTIONS = {
  dmg2: { do: 'damage', amount: 2, dmgType: 'physical', who: 'enemy', sub: 'random' },
  poison1: { do: 'poison', amount: 1, who: 'enemy', sub: 'random' },
  heal2: { do: 'heal', amount: 2 },
  atk1: { do: 'buff', amount: 1, who: 'self' },
  hp2: { do: 'buff', amount2: 2, who: 'self' },
  shield2: { do: 'shield', amount: 2 },
  draw1: { do: 'drawCard', count: 1 },
  lumber1: { do: 'gain', resource: 'lumber', amount: 1 }
};
// Part B2: the amount (does the action's worth grow with its number the way the budget's per-amount price does?), on four triggers
const TRIGGERS2 = ['onSpawn', 'perTurn', 'onAttacked', 'onDeath'];
const ACTIONS2 = {
  dmg1: { do: 'damage', amount: 1, dmgType: 'physical', who: 'enemy', sub: 'random' }, dmg4: { do: 'damage', amount: 4, dmgType: 'physical', who: 'enemy', sub: 'random' },
  atk2: { do: 'buff', amount: 2, who: 'self' }, hp4: { do: 'buff', amount2: 4, who: 'self' }
};
const trigOf = (t, a) => Object.assign({ on: t }, ACTIONS[a] || ACTIONS2[a]);

// ---------------------------------------------------------------- contexts
// why each: g1 the pipeline's own (random legal decks of every fieldable card, every road fight's field, Level 1); g10 the same at Level 10
// (late levels: bigger bodies); van a vanilla mirror (only skill-less cards on both sides, no field: the skill alone); nof the g1 decks with
// no field; tide the g1 decks on the tide fields of Maps 0-20 (Flood / Ebb); dark the g1 decks on the dark and night fields of Maps 0-20;
// ref the PRO / BPRO decks of Maps 0-20 (main and side maps) as the opponent, on their own map's field, the rest from that map's pool.
const CONTEXTS = {
  g1: 'global pool, every road field, Level 1', g10: 'global pool, every road field, Level 10', van: 'vanilla cards only, no field, Level 1',
  nof: 'global pool, no field, Level 1', tide: 'global pool, tide fields of Maps 0-20, Level 1', dark: 'global pool, dark / night fields of Maps 0-20, Level 1',
  ref: 'opponent = a PRO / BPRO deck of Maps 0-20 on its field, rest from that map pool, Level 1'
};
function mapNo(gm, at) { try { return gm.G.mapNumberOf(String(at).split(':')[0]); } catch (e) { return null; } }
function buildContext(B, name, seed) {
  const gm = B.gm, base = { kind: 'global', seed, k: 6, bramble: BRAMBLE, level: name === 'g10' ? 10 : 1 };
  if (name === 'van') base.pool = Object.keys(gm.D).filter(id => L.C.fieldable(gm, id) && !Object.keys(gm.D[id].effects || {}).length && gm.D[id].attack >= 0);
  const X = L.contextOf(gm, base);
  const low = f => { const n = mapNo(gm, f.at); return n != null && n <= 20; };
  if (name === 'van' || name === 'nof') X.fields = [{ at: 'none', rules: {} }];
  else if (name === 'tide') X.fields = X.fields.filter(f => low(f) && (f.rules.tide || f.rules.permaTide));
  else if (name === 'dark') X.fields = X.fields.filter(f => low(f) && (f.rules.dark || f.rules.phase === 'night'));
  else if (name === 'ref') {
    const P = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps, decks = [], fields = [];
    Object.keys(P).sort().forEach(k => { const e = P[k]; if (typeof e.map !== 'number' || e.map > 20) return;
      let pool = X.pool; try { pool = L.contextOf(gm, { kind: 'map', map: k, mode: 'bpro', seed, k: 6, level: 1 }).pool; } catch (err) { /* the global pool */ }
      const fi = fields.push({ at: k + ':pro', rules: (e.field && e.field.rules) || {} }) - 1;
      [].concat(e.pro || [], e.bpro || []).forEach(p => { if (p.deck && Object.keys(p.deck).length) decks.push({ id: p.id, deck: p.deck, pool, f: fi }); }); });
    X.fields = fields; X.refDecks = decks;
    const rng = L.O.mulberry(L.fnv(seed + '|ref-order')), order = decks.map((d, j) => j); for (let j = order.length - 1; j > 0; j--) { const r = Math.floor(rng.next() * (j + 1)); [order[j], order[r]] = [order[r], order[j]]; }
    X.refOrder = order;
  }
  if (!X.fields.length) throw new Error('context ' + name + ': no fields');
  X.name = 'skw1-' + name; X.key = L.fnv(JSON.stringify([VERSION, L.fingerprint(), name, seed, X.level, X.pool.length, X.fields.map(f => f.at)])).toString(36);
  X.cacheFile = path.join(CACHE, X.name + '-' + X.key + '.json');
  X.cache = fs.existsSync(X.cacheFile) ? JSON.parse(fs.readFileSync(X.cacheFile, 'utf8')).games : {};
  return X;
}
// fight i of a context (ref: the opponent is a PRO / BPRO deck; others: bench's random decks)
function prefill(B, X, M) {
  if (!X.refDecks) return;
  for (let i = 0; i < M; i++) { if (X.fights.has(i)) continue; const d = X.refDecks[X.refOrder[i % X.refOrder.length]], rng = L.O.mulberry(L.fnv(X.seed + '|refrest|' + i));
    X.fights.set(i, { B: d.deck, R: L.randomDeck(B.gm, d.pool, rng, 20 - X.k), f: d.f, ref: d.id }); }
}

// ---------------------------------------------------------------- statistics
function bootIdx(M, seed) { const rng = L.O.mulberry(L.fnv('skw1-boot|' + seed)), out = []; for (let b = 0; b < BOOT; b++) { const a = new Uint32Array(M); for (let i = 0; i < M; i++) a[i] = Math.floor(rng.next() * M); out.push(a); } return out; }
const meanOf = (a, idx) => { let s = 0; if (idx) { for (let i = 0; i < idx.length; i++) s += a[idx[i]]; return s / idx.length; } for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
const q = (a, p) => { const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))]; };
const sd = a => { const m = a.reduce((t, x) => t + x, 0) / a.length; return Math.sqrt(a.reduce((t, x) => t + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); };
const r3 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;

function variantFor(card, eff) { const add = Object.assign({}, eff), trig = add.triggers; delete add.triggers; const v = { base: card };
  if (Object.keys(add).length) v.add = add; if (Array.isArray(trig) && trig.length) v.addTrig = trig; return v; }

// measure a list of tests [{key, eff}] in context X with M fights; returns the per-test results
async function measure(B, X, tests, M) {
  prefill(B, X, M);
  const items = [];
  CARRIERS.forEach(c => { items.push({ v: { base: c } }, { v: { base: c, dA: 1 } }, { v: { base: c, dH: 3 } }, { v: variantFor(c, PLACEBO) }); tests.forEach(t => items.push({ v: variantFor(c, t.eff) })); });
  B.log(`${X.name}: ${CONTEXTS[X.name.replace('skw1-', '')]}; ${X.fields.length} fields, pool ${X.pool.length}, Level ${X.level}; ${items.length} variants x ${M} fights`);
  await B.need(X, items, M);
  const base = {}; CARRIERS.forEach(c => { base[c] = B.scores(X, { base: c }, c, M); });
  const gainRaw = v => { const d = new Float64Array(M); CARRIERS.forEach(c => { const s = B.scores(X, v(c), c, M); for (let i = 0; i < M; i++) d[i] += (s[i] - base[c][i]) / CARRIERS.length; }); return d; };
  const D0 = gainRaw(c => variantFor(c, PLACEBO)), DA = gainRaw(c => ({ base: c, dA: 1 })), DH = gainRaw(c => ({ base: c, dH: 3 }));
  const boots = bootIdx(M, X.key + '|' + M);
  const est = f => { const m = f(null), bs = boots.map(ix => f(ix)); return { m: r3(m), lo: r3(q(bs, 0.025)), hi: r3(q(bs, 0.975)), se: r3(sd(bs)) }; };
  const rate = ix => (meanOf(DA, ix) + meanOf(DH, ix)) / 6;
  const ruler = { rate: est(rate), aw: est(ix => 3 * meanOf(DA, ix) / meanOf(DH, ix)), gA: est(ix => meanOf(DA, ix)), gH3: est(ix => meanOf(DH, ix)), placebo: est(ix => meanOf(D0, ix)), placeboWorth: est(ix => meanOf(D0, ix) / rate(ix)) };
  const baseWin = r3(CARRIERS.reduce((t, c) => t + meanOf(base[c]), 0) / CARRIERS.length);
  const out = tests.map(t => {
    const raw = gainRaw(c => variantFor(c, t.eff)), k = Object.keys(t.eff).length || 1, D = new Float64Array(M); for (let i = 0; i < M; i++) D[i] = raw[i] - k * D0[i];
    const price = CARRIERS.map(c => L.budgetOf(L.printedDef(B.gm, variantFor(c, t.eff)), X.level).x1 - L.budgetOf(L.printedDef(B.gm, { base: c }), X.level).x1);
    const perCarrier = {}; CARRIERS.forEach(c => { const s = B.scores(X, variantFor(c, t.eff), c, M); let g = 0, p = 0; for (let i = 0; i < M; i++) { g += s[i] - base[c][i]; p += 0; } perCarrier[c] = r3(g / M); });
    return { key: t.key, eff: t.eff, gain: est(ix => meanOf(D, ix)), worth: est(ix => meanOf(D, ix) / rate(ix)), price: r3(price.reduce((a, b) => a + b, 0) / price.length), priceBy: price.map(r3), rawGainBy: perCarrier };
  });
  return { tool: 'tools/skw1/skw1.js ' + VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(), context: { name: X.name, about: CONTEXTS[X.name.replace('skw1-', '')], level: X.level, fights: M, copies: X.k, bramble: X.bramble, pool: X.pool.length, fields: X.fields.length, seed: X.seed, refDecks: X.refDecks ? X.refDecks.length : undefined }, carriers: CARRIERS, baseWin, ruler, tests: out };
}

// ---------------------------------------------------------------- the fits (Part B)
// W[t][a] with se: (1) additive W = mu + a_t + b_a (weighted two-way); (2) multiplicative W = f_t x g_a (weighted rank 1, alternating least
// squares); (3) multiplicative + additive offset per action W = f_t x g_a + c_a. Reports weighted R² (1 - Σw r² / Σw (W - W̄)²), χ² / df and
// the cells with |z| > 2.5 (a real interaction the factor model misses).
function fitGrid(T, A, W, S) {
  const w = (i, j) => 1 / Math.max(0.05, S[i][j]) ** 2, nT = T.length, nA = A.length;
  let wm = 0, ws = 0; for (let i = 0; i < nT; i++) for (let j = 0; j < nA; j++) { wm += w(i, j) * W[i][j]; ws += w(i, j); } wm /= ws;
  let sst = 0; for (let i = 0; i < nT; i++) for (let j = 0; j < nA; j++) sst += w(i, j) * (W[i][j] - wm) ** 2;
  const stats = (pred, npar, name) => { let ssr = 0, z = []; for (let i = 0; i < nT; i++) for (let j = 0; j < nA; j++) { const r = W[i][j] - pred(i, j); ssr += w(i, j) * r * r; z.push({ t: T[i], a: A[j], W: r3(W[i][j]), fit: r3(pred(i, j)), z: r3(r / Math.max(0.05, S[i][j])) }); }
    const df = nT * nA - npar; return { name, r2: r3(1 - ssr / sst), chi2: r3(ssr), df, chi2df: r3(ssr / df), big: z.filter(x => Math.abs(x.z) > 2.5).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)), cells: z }; };
  // additive
  let mu = wm, at = new Array(nT).fill(0), ba = new Array(nA).fill(0);
  for (let it = 0; it < 200; it++) {
    for (let i = 0; i < nT; i++) { let s = 0, sw = 0; for (let j = 0; j < nA; j++) { s += w(i, j) * (W[i][j] - mu - ba[j]); sw += w(i, j); } at[i] = s / sw; }
    for (let j = 0; j < nA; j++) { let s = 0, sw = 0; for (let i = 0; i < nT; i++) { s += w(i, j) * (W[i][j] - mu - at[i]); sw += w(i, j); } ba[j] = s / sw; }
    const m = at.reduce((x, y) => x + y, 0) / nT; at = at.map(x => x - m); mu += m;
  }
  const add = stats((i, j) => mu + at[i] + ba[j], nT + nA - 1, 'additive');
  add.params = { mu: r3(mu), trigger: Object.fromEntries(T.map((t, i) => [t, r3(at[i])])), action: Object.fromEntries(A.map((a, j) => [a, r3(ba[j])])) };
  // multiplicative (rank 1)
  const rank1 = (withC) => { let f = new Array(nT).fill(1), g = A.map((a, j) => { let s = 0; for (let i = 0; i < nT; i++) s += W[i][j]; return s / nT; }), c = new Array(nA).fill(0);
    for (let it = 0; it < 500; it++) {
      for (let j = 0; j < nA; j++) { if (withC) { // solve g_j, c_j jointly: min Σ_i w (W - f_i g - c)²
          let s11 = 0, s12 = 0, s22 = 0, b1 = 0, b2 = 0; for (let i = 0; i < nT; i++) { const ww = w(i, j); s11 += ww * f[i] * f[i]; s12 += ww * f[i]; s22 += ww; b1 += ww * f[i] * W[i][j]; b2 += ww * W[i][j]; }
          const det = s11 * s22 - s12 * s12; if (Math.abs(det) > 1e-12) { g[j] = (b1 * s22 - b2 * s12) / det; c[j] = (s11 * b2 - s12 * b1) / det; } }
        else { let s = 0, sw = 0; for (let i = 0; i < nT; i++) { s += w(i, j) * f[i] * W[i][j]; sw += w(i, j) * f[i] * f[i]; } g[j] = sw ? s / sw : 0; } }
      for (let i = 0; i < nT; i++) { let s = 0, sw = 0; for (let j = 0; j < nA; j++) { s += w(i, j) * g[j] * (W[i][j] - c[j]); sw += w(i, j) * g[j] * g[j]; } f[i] = sw ? s / sw : 0; }
    }
    const k = f[T.indexOf('onSpawn')] || 1; f = f.map(x => x / k); g = g.map(x => x * k); // normalise: On Spawn = 1
    return { f, g, c };
  };
  const m1 = rank1(false), mul = stats((i, j) => m1.f[i] * m1.g[j], nT + nA - 1, 'multiplicative');
  mul.params = { trigger: Object.fromEntries(T.map((t, i) => [t, r3(m1.f[i])])), action: Object.fromEntries(A.map((a, j) => [a, r3(m1.g[j])])) };
  const m2 = rank1(true), mulc = stats((i, j) => m2.f[i] * m2.g[j] + m2.c[j], nT + 2 * nA - 1, 'multiplicative + action offset');
  mulc.params = { trigger: Object.fromEntries(T.map((t, i) => [t, r3(m2.f[i])])), action: Object.fromEntries(A.map((a, j) => [a, r3(m2.g[j])])), offset: Object.fromEntries(A.map((a, j) => [a, r3(m2.c[j])])) };
  return { additive: add, multiplicative: mul, multiplicativeOffset: mulc };
}

// ---------------------------------------------------------------- the budget's own trigger / action model (canonical/skill-costs.json)
function budgetModel() {
  const t = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  return { trig: Object.fromEntries(t.triggers.map(x => [x.id, x.value])), act: Object.fromEntries(t.actions.map(x => [x.id, x.value])), pairs: t.pairs || {} };
}

// ---------------------------------------------------------------- report
function report() {
  const files = fs.readdirSync(OUT).filter(f => /^[ab]-[a-z0-9]+\.json$/.test(f)).sort(), A = {}, Bx = {};
  files.forEach(f => { const r = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); (f[0] === 'a' ? A : Bx)[f.slice(2, -5)] = r; });
  const lines = [], sum = { tool: 'tools/skw1/skw1.js ' + VERSION, generated: new Date().toISOString(), partA: null, partB: {} };
  // ---- Part A
  const ctxs = Object.keys(A);
  if (ctxs.length) {
    lines.push('## Part A: skill worth by context (budget points, 3A + H)', '', 'Contexts: ' + ctxs.map(c => `${c} (${A[c].context.fights} fights; ruler ${(A[c].ruler.rate.m * 100).toFixed(2)} win pts a point, Attack weight ${A[c].ruler.aw.m} [${A[c].ruler.aw.lo}, ${A[c].ruler.aw.hi}], base win ${A[c].baseWin})`).join('; '), '');
    const keys = Object.keys(SKILLS).filter(k => ctxs.some(c => A[c].tests.find(t => t.key === k)));
    const rows = keys.map(k => { const per = {}; ctxs.forEach(c => { const t = A[c].tests.find(x => x.key === k); if (t) per[c] = t; });
      const ws = Object.values(per).map(t => t.worth.m), ses = Object.values(per).map(t => t.worth.se), n = ws.length, mean = ws.reduce((a, b) => a + b, 0) / n;
      const seMean = Math.sqrt(ses.reduce((a, b) => a + b * b, 0)) / n, price = per.g1 ? per.g1.price : Object.values(per)[0].price;
      const chi2 = ws.reduce((t, x, j) => t + ((x - mean) / Math.max(0.1, ses[j])) ** 2, 0), spread = n > 1 ? sd(ws) : 0, noise = Math.sqrt(ses.reduce((a, b) => a + b * b, 0) / n);
      const off = mean - price, offZ = off / Math.max(0.1, seMean);
      return { key: k, n, mean: r3(mean), seMean: r3(seMean), spread: r3(spread), noise: r3(noise), chi2: r3(chi2), df: n - 1, min: r3(Math.min(...ws)), max: r3(Math.max(...ws)), price: r3(price), off: r3(off), offZ: r3(offZ),
        verdict: Math.abs(offZ) > 2 && Math.abs(off) > 1 ? (off > 0 ? 'UNDER-priced' : 'OVER-priced') : 'ok', contextual: n > 2 && chi2 > 2.5 * (n - 1) && spread > 1.5, per: Object.fromEntries(Object.entries(per).map(([c, t]) => [c, { w: t.worth.m, se: t.worth.se, price: t.price }])) }; });
    rows.sort((a, b) => Math.abs(b.off) - Math.abs(a.off));
    sum.partA = { contexts: Object.fromEntries(ctxs.map(c => [c, { about: A[c].context.about, fights: A[c].context.fights, level: A[c].context.level, fields: A[c].context.fields, rate: A[c].ruler.rate, attackWeight: A[c].ruler.aw, placeboWorth: A[c].ruler.placeboWorth, baseWin: A[c].baseWin }])), rows };
    lines.push('| Skill | Price | Mean worth (se) | ' + ctxs.join(' | ') + ' | Spread (sd) / noise | Verdict | Context-dependent |', '|---|---|---|' + ctxs.map(() => '---|').join('') + '---|---|---|');
    rows.forEach(r => lines.push(`| ${r.key} | ${r.price} | ${r.mean} (${r.seMean}) | ` + ctxs.map(c => r.per[c] ? `${r.per[c].w}` : '-').join(' | ') + ` | ${r.spread} / ${r.noise} | ${r.verdict === 'ok' ? '' : r.verdict + ' ' + (r.off > 0 ? '+' : '') + r.off} | ${r.contextual ? 'yes (χ² ' + r.chi2 + ', df ' + r.df + ')' : ''} |`));
    lines.push('');
  }
  // ---- Part B
  const BM = budgetModel();
  Object.keys(Bx).forEach(c => {
    const r = Bx[c], T = TRIGGERS.filter(t => r.tests.some(x => x.key.startsWith(t + '>'))), Ak = Object.keys(ACTIONS).filter(a => r.tests.some(x => x.key.endsWith('>' + a)));
    const cell = (t, a) => r.tests.find(x => x.key === t + '>' + a);
    const W = T.map(t => Ak.map(a => cell(t, a).worth.m)), S = T.map(t => Ak.map(a => cell(t, a).worth.se)), P = T.map(t => Ak.map(a => cell(t, a).price));
    const fit = fitGrid(T, Ak, W, S), fitP = fitGrid(T, Ak, P, P.map(row => row.map(() => 1)));
    // the measure against the price, cell by cell
    let sw = 0, sr = 0; const off = []; T.forEach((t, i) => Ak.forEach((a, j) => { const z = (W[i][j] - P[i][j]) / Math.max(0.05, S[i][j]); off.push({ t, a, W: W[i][j], price: P[i][j], z: r3(z) }); }));
    sum.partB[c] = { fights: r.context.fights, ruler: r.ruler, triggers: T, actions: Ak, W, S, P, fit, priceFit: { multiplicative: { r2: fitP.multiplicative.r2, params: fitP.multiplicative.params }, additive: { r2: fitP.additive.r2 } }, offCells: off.filter(x => Math.abs(x.z) > 2.5 && Math.abs(x.W - x.price) > 1).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)) };
    lines.push(`## Part B (${c}, ${r.context.fights} fights a variant, ruler ${(r.ruler.rate.m * 100).toFixed(2)} win pts a point): worth (se) / budget price`, '', '| Trigger | ' + Ak.join(' | ') + ' |', '|---|' + Ak.map(() => '---|').join(''));
    T.forEach((t, i) => lines.push(`| ${t} | ` + Ak.map((a, j) => `${W[i][j]} (${S[i][j]}) / ${P[i][j]}`).join(' | ') + ' |'));
    lines.push('', '| Fit | R² (weighted) | χ²/df | cells with abs z > 2.5 |', '|---|---|---|---|');
    ['additive', 'multiplicative', 'multiplicativeOffset'].forEach(k => lines.push(`| ${fit[k].name} | ${fit[k].r2} | ${fit[k].chi2df} | ${fit[k].big.length}: ${fit[k].big.slice(0, 8).map(x => x.t + '>' + x.a + ' ' + x.W + ' vs ' + x.fit).join('; ')} |`));
    const mp = fit.multiplicative.params, pp = fitP.multiplicative.params;
    lines.push('', '| Trigger | Measured multiplier (On Spawn = 1) | Price-implied multiplier | Budget trigger weight / On Spawn\'s |', '|---|---|---|---|');
    T.forEach(t => lines.push(`| ${t} | ${mp.trigger[t]} | ${pp.trigger[t]} | ${BM.trig[t] != null ? r3(BM.trig[t] / BM.trig.onSpawn) : '-'} |`));
    lines.push('', '| Action | Measured base value (On Spawn once) | Price-implied base value | Additive offset fit (g, c) |', '|---|---|---|---|');
    Ak.forEach(a => lines.push(`| ${a} | ${mp.action[a]} | ${pp.action[a]} | ${fit.multiplicativeOffset.params.action[a]}, ${fit.multiplicativeOffset.params.offset[a]} |`));
    lines.push('');
  });
  // ---- Part B2: the amount
  fs.readdirSync(OUT).filter(f => /^b2-[a-z0-9]+\.json$/.test(f)).forEach(f => {
    const c = f.slice(3, -5), r2x = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')), rb = Bx[c]; if (!rb) return;
    const get = (t, a) => r2x.tests.find(x => x.key === t + '>' + a) || rb.tests.find(x => x.key === t + '>' + a);
    const fam = { 'damage (random enemy)': [['dmg1', 1], ['dmg2', 2], ['dmg4', 4]], 'buff Attack (self)': [['atk1', 1], ['atk2', 2]], 'buff Health (self)': [['hp2', 2], ['hp4', 4]] };
    const rows = []; lines.push(`## Part B2 (${c}): worth by amount (worth [95%] / price)`, '', '| Trigger | Action | ' + 'amounts: worth / price |', '|---|---|---|');
    TRIGGERS2.forEach(t => Object.entries(fam).forEach(([nm, list]) => { const cells = list.map(([a, n]) => { const x = get(t, a); return x ? { n, w: x.worth.m, lo: x.worth.lo, hi: x.worth.hi, se: x.worth.se, p: x.price } : null; }).filter(Boolean);
      rows.push({ t, family: nm, cells }); lines.push(`| ${t} | ${nm} | ` + cells.map(x => `${x.n}: ${x.w} [${x.lo}, ${x.hi}] / ${x.p}`).join('; ') + ' |'); }));
    sum.partB2 = sum.partB2 || {}; sum.partB2[c] = rows; lines.push('');
  });
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(sum, null, 1) + '\n'); fs.writeFileSync(path.join(OUT, 'tables.md'), '# SKW1 tables (generated by tools/skw1/skw1.js report)\n\n' + lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

// ---------------------------------------------------------------- fires: how often each trigger goes off (the trigger's frequency)
// Each carrier gets one counter trigger {on: hook, do: gain, resource: uranium, amount: 1} (Uranium: no card of the decks spends it but the
// rare uraniumCost ones; the carrier's own base games give the background, subtracted). Fires per fight = Uranium gained by the carrier's
// side at the end less the background. On Spawn's count is the copies that reached the board, so fires / On Spawn's = fires per copy played.
// The engine is wrapped in-process only to read the two players at the end (makeSimEngine -> newPlayer); no game rule is touched.
const HOOKS = TRIGGERS.concat(['onReady', 'onAction', 'onHit', 'onKillCreature', 'onAnyDeath', 'onAllySpawn', 'onEnemyPlayed', 'onAllyReady', 'onEnemyReady', 'onEnemyEnter', 'onMove', 'onHealed', 'onEnterSlot', 'onColumnSpawn']);
async function fires(B, X, M) {
  prefill(B, X, M);
  const gm = B.gm, CAP = {}, orig = gm.E.makeSimEngine;
  gm.E.makeSimEngine = function () { const eng = orig.apply(this, arguments), np = eng.newPlayer; eng.newPlayer = function (id) { const p = np.apply(this, arguments); CAP[id] = p; return p; }; return eng; };
  const play = L.makeGame(gm, X), t0 = Date.now(), out = {}; let n = 0;
  const uran = (v, c, i) => { play(i, v, c); const me = i % 2 === 0 ? 1 : 2; return (CAP[me] && CAP[me].uranium) || 0; };
  const bg = {}; CARRIERS.forEach(c => { let s = 0; for (let i = 0; i < M; i++) s += uran({ base: c }, c, i); bg[c] = s / M; n += M; });
  HOOKS.forEach(h => { const per = {}; CARRIERS.forEach(c => { const v = variantFor(c, { triggers: [{ on: h, do: 'gain', resource: 'uranium', amount: 1 }] }); const xs = [];
      for (let i = 0; i < M; i++) xs.push(uran(v, c, i) - bg[c]); n += M; const m = xs.reduce((a, b) => a + b, 0) / M; per[c] = { m: r3(m), se: r3(sd(xs) / Math.sqrt(M)) }; });
    const all = Object.values(per).map(x => x.m); out[h] = { perFight: r3(all.reduce((a, b) => a + b, 0) / all.length), byCarrier: per };
    B.log(`  ${h.padEnd(14)} ${out[h].perFight} a fight (${CARRIERS.map(c => per[c].m).join(' / ')})  [${n} games, ${Math.round((Date.now() - t0) / 1000)} s]`); });
  gm.E.makeSimEngine = orig;
  const sp = out.onSpawn.perFight; Object.values(out).forEach(o => { o.perCopy = r3(o.perFight / sp); });
  return { tool: 'tools/skw1/skw1.js ' + VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(), context: { name: X.name, about: CONTEXTS[X.name.replace('skw1-', '')], level: X.level, fights: M, copies: X.k }, carriers: CARRIERS, background: bg, games: n, seconds: Math.round((Date.now() - t0) / 1000), hooks: out };
}

async function main(argv) {
  const a = argv.slice(), cmd = a.shift() || 'help', o = { games: 100, seed: 'skw1', ctx: 'g1' };
  while (a.length) { const k = a.shift(); if (k === '--games') o.games = +a.shift(); else if (k === '--seed') o.seed = a.shift(); else if (k === '--ctx') o.ctx = a.shift(); else if (k === '--skills') o.skills = a.shift().split(','); else throw new Error('unknown option ' + k); }
  if (cmd === 'help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 22).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  if (cmd === 'report') return report();
  fs.mkdirSync(CACHE, { recursive: true });
  const B = new L.Bench({ workers: 0, chunk: 25, cacheDir: CACHE });
  try {
    if (cmd === 'contexts') { Object.keys(CONTEXTS).forEach(c => { const X = buildContext(B, c, o.seed); console.log(c.padEnd(5), CONTEXTS[c], '| fields', X.fields.length, 'pool', X.pool.length, X.refDecks ? 'ref decks ' + X.refDecks.length : ''); }); return; }
    if (!CONTEXTS[o.ctx]) throw new Error('no context ' + o.ctx);
    const X = buildContext(B, o.ctx, o.seed);
    if (cmd === 'fires') { const r = await fires(B, X, o.games), f = path.join(OUT, 'fires-' + o.ctx + '.json'); fs.writeFileSync(f, JSON.stringify(r, null, 1) + '\n');
      console.log(`${r.games} games in ${r.seconds} s -> ${path.relative(L.ROOT, f)}`); Object.entries(r.hooks).forEach(([h, x]) => console.log(`  ${h.padEnd(14)} ${String(x.perFight).padStart(6)} a fight, ${x.perCopy} a copy played`)); return; }
    let tests;
    if (cmd === 'a') tests = Object.keys(SKILLS).filter(k => !o.skills || o.skills.includes(k)).map(k => ({ key: k, eff: SKILLS[k] }));
    else if (cmd === 'b') { tests = []; TRIGGERS.forEach(t => Object.keys(ACTIONS).forEach(ac => tests.push({ key: t + '>' + ac, eff: { triggers: [trigOf(t, ac)] } }))); }
    else if (cmd === 'b2') { tests = []; TRIGGERS2.forEach(t => Object.keys(ACTIONS2).forEach(ac => tests.push({ key: t + '>' + ac, eff: { triggers: [trigOf(t, ac)] } }))); }
    else throw new Error('unknown command ' + cmd);
    const t0 = Date.now(), res = await measure(B, X, tests, o.games); res.seconds = Math.round((Date.now() - t0) / 1000); res.played = B.played;
    const f = path.join(OUT, cmd + '-' + o.ctx + '.json'); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n');
    console.log(`ruler: ${(res.ruler.rate.m * 100).toFixed(2)} win pts a budget point; Attack weight ${res.ruler.aw.m} [${res.ruler.aw.lo}, ${res.ruler.aw.hi}]; placebo ${res.ruler.placeboWorth.m}; base win ${res.baseWin}; ${res.played} games in ${res.seconds} s -> ${path.relative(L.ROOT, f)}`);
    res.tests.slice().sort((x, y) => (y.worth.m - y.price) - (x.worth.m - x.price)).forEach(t => console.log(`  ${t.key.padEnd(24)} worth ${String(t.worth.m).padStart(7)} [${t.worth.lo}, ${t.worth.hi}]  price ${t.price}`));
  } finally { B.close(); }
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { SKILLS, TRIGGERS, ACTIONS, CONTEXTS, fitGrid };
