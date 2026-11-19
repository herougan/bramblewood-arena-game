// 2026-11-20 (package SKM1, owner 00:40: "Until we have 100 different ways of measuring skills"): the registry of skill-worth methods.
// Each entry: {id, name, idea (its one-line assumption), exp (the game design it reads, null = offline), run(skill, opts) -> {worth, ci, games}}.
// worth is in the budget's units: stat points of the cap-1 left side (3A + H) x m + S, the same units as today's price (lib.universe()).
// Sim methods share games: every estimator of one design reads the same cached paired fights; only the design's primary method plays new
// games (stages until the 95% half-width is under 10% of the estimate, or the design's cap), the others read what the primary played.
'use strict';
const path = require('path'), fs = require('fs');
const S = require('./lib.js');
const { L, meanSE, ratio } = S;
const ROOT = S.ROOT, BAL = path.join(ROOT, 'docs', 'balance');

// ---------------------------------------------------------------- carriers
// the skill's carrier for the sim designs: the Maps 0-20 card with the fewest other skills (then Attack >= 1, then the earliest map)
function carrierOf(U, s, n) {
  const gm = U.gm, first = id => Math.min(...S.MAPS.filter(m => U.perMap[m].pool.includes(id)));
  return U.skills[s].carriers.slice().sort((a, b) => S.SK.skillsOf(gm, gm.D[a]).length - S.SK.skillsOf(gm, gm.D[b]).length
    || ((gm.D[b].attack >= 1) - (gm.D[a].attack >= 1)) || first(a) - first(b) || (a < b ? -1 : 1)).slice(0, n || 1);
}

// ---------------------------------------------------------------- game designs (experiments)
// design: 'van'  = a deck of 20 copies of a vanilla body given the skill (copied from its carrier) against 20 plain copies of the body; the
//                  control (body vs body) and the yardstick (body +1 Attack, body +2 Health) are shared by every skill;
//         'own'  = the carrier with the skill and without it (the same stats), in a deck of 20 copies (homo) or a slot of k (rand / pro / road);
//                  yardstick: the carrier without the skill +1 Attack / +2 Health (/ +4 Health), or pooled over vanilla bodies (yard 'pool').
const BODY1 = 'farm-dog', BODY2 = 'soldier-ant', BODY3 = 'bear-cub';
const EXPS = {
  V1: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, seed: 'skmV1' }, stages: [40, 80, 120], yardM: 400,
    idea: 'mirror match: 20 farm-dogs given the skill vs 20 plain farm-dogs, map fields' },
  H1: { design: 'own', yard: 'own', ladder: true, cs: { kind: 'homo', foe: 'random', seed: 'skmH1' }, stages: [24, 32], idea: 'the carrier x20 with vs without the skill, against random Maps 0-20 decks' },
  R1: { design: 'own', yard: 'pool', cs: { kind: 'rand', k: 6, seed: 'skmR1' }, stages: [40], yardM: 200, idea: 'bench slot: 6 copies in a random Maps 0-20 deck, with vs without' },
  V3: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, aiMe: 0, aiFoe: 0, seed: 'skmV3' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match with the basic CPU on both sides' },
  V4: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, aiMe: 2, aiFoe: 2, seed: 'skmV4' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match with the smartest CPU on both sides' },
  DK: { design: 'deck', mode: 'remove', cs: { kind: 'pro', seed: 'skmDK' }, stages: [40], idea: 'removal from a real deck: the Maps 0-20 PRO / BPRO deck holding most copies of a carrier, with vs without the skill, against its map\'s PRO / BPRO decks' },
  AD: { design: 'deck', mode: 'add', cs: { kind: 'pro', seed: 'skmAD' }, stages: [40], idea: 'addition to a real deck: the skill given to the most-copied card of the first PRO deck of the skill\'s first map, against that map\'s PRO / BPRO decks' },
  V9: { design: 'van', body: 'bee-sentry', cs: { kind: 'homo', foe: 'body', body: 'bee-sentry', seed: 'skmV9' }, stages: [40, 60], yardM: 300,
    idea: 'synergy with Flying: mirror match on a Flying body (bee-sentry)' },
  V10: { design: 'van', body: 'horseshoe-crab', cs: { kind: 'homo', foe: 'body', body: 'horseshoe-crab', seed: 'skmV10' }, stages: [40, 60], yardM: 300,
    idea: 'synergy with Armor: mirror match on an Armor body (horseshoe-crab)' },
  P1: { design: 'own', yard: 'pool', cs: { kind: 'pro', k: 6, seed: 'skmP1' }, stages: [40], yardM: 200, idea: 'bench slot in a random Maps 0-20 deck, against the PRO / BPRO decks of Maps 0-20' },
  V11: { design: 'van', body: BODY1, perMap: true, cs: { kind: 'homo', foe: 'body', body: BODY1, seed: 'skmV11' }, stages: [40, 60], yardM: 120,
    idea: 'per map level: mirror match at the skill\'s first map\'s level and fields' },
  V2: { design: 'van', body: BODY2, cs: { kind: 'homo', foe: 'body', body: BODY2, fields: 'neutral', seed: 'skmV2' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match on a 3/7 soldier-ant body, no field (plain day)' },
  V5: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, bramble: 15, seed: 'skmV5' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match with the road brambles (15 Health)' },
  V7: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, aiMe: 1, aiFoe: 2, seed: 'skmV7' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match, the skill side Smart CPU against the smartest CPU' },
  V6: { design: 'van', body: BODY3, cs: { kind: 'homo', foe: 'body', body: BODY3, level: 10, seed: 'skmV6' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match on a bear-cub body at Level 10' },
  V8: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, bramble: 45, seed: 'skmV8' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match with 45-Health brambles (long games)' },
  D1: { design: 'own', yard: 'own', road: true, cs: { kind: 'road', k: 6, seed: 'skmD1' }, stages: [40], idea: 'bench slot in a random deck of the skill\'s first map against that map\'s road fights as the game builds them' },
  // round 2 (new kinds once the first designs stabilised)
  V12: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'random', body: BODY1, seed: 'skmV12' }, stages: [40, 60], yardM: 300,
    idea: '20 farm-dogs given the skill vs 20 plain farm-dogs, both against random Maps 0-20 decks' },
  V13: { design: 'van', body: 'mudpuppy', cs: { kind: 'homo', foe: 'body', body: 'mudpuppy', seed: 'skmV13' }, stages: [40, 60], yardM: 300,
    idea: 'synergy with Tide: mirror match on a Tide body (mudpuppy)' },
  V14: { design: 'van', body: 'moonlit-hare', cs: { kind: 'homo', foe: 'body', body: 'moonlit-hare', seed: 'skmV14' }, stages: [40, 60], yardM: 300,
    idea: 'synergy with Nocturnal: mirror match on a Nocturnal 4/4 body (moonlit-hare)' },
  V15: { design: 'van', body: 'hedgehog-scout', cs: { kind: 'homo', foe: 'body', body: 'hedgehog-scout', seed: 'skmV15' }, stages: [40, 60], yardM: 300,
    idea: 'synergy with Thorns: mirror match on a Thorns 1/6 body (hedgehog-scout)' },
  R2: { design: 'own', yard: 'pool', cs: { kind: 'rand', k: 2, seed: 'skmR2' }, stages: [60], yardM: 200, idea: 'bench slot of 2 copies (a light presence) in a random Maps 0-20 deck' },
  R3: { design: 'own', yard: 'pool', cs: { kind: 'rand', k: 12, seed: 'skmR3' }, stages: [40], yardM: 200, idea: 'bench slot of 12 copies (the deck\'s core) in a random Maps 0-20 deck' },
  H2: { design: 'own', yard: 'own', cs: { kind: 'homo', foe: 'random', bramble: 15, seed: 'skmH2' }, stages: [24, 32], idea: 'the carrier x20 with vs without the skill, random Maps 0-20 decks, road brambles (15 Health)' },
  V16: { design: 'van', body: BODY1, cs: { kind: 'homo', foe: 'body', body: BODY1, level: 0, seed: 'skmV16' }, stages: [40, 60], yardM: 300,
    idea: 'mirror match at Level 0 (Maps 0-5 play there)' },
};
// the real decks (PRO / BPRO of Maps 0-20) and the card that holds or gets the skill
let PRO = null;
function proDecks(U) { if (PRO) return PRO; const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')); PRO = [];
  Object.values(J.maps).forEach(m => { if (m.map == null || m.map > 20) return; ['pro', 'bpro'].forEach(k => (m[k] || []).forEach(p => p.deck && PRO.push({ id: p.id, map: m.map, kind: k, deck: p.deck }))); });
  return PRO; }
function deckPlan(U, E, s) {
  const gm = U.gm, P = proDecks(U);
  if (E.mode === 'remove') { let best = null; P.forEach(p => Object.keys(p.deck).forEach(id => { if (U.skills[s].carriers.includes(id) && (!best || p.deck[id] > best.k || (p.deck[id] === best.k && p.map < best.map))) best = { deck: p, card: id, k: p.deck[id], map: p.map }; }));
    return best; }
  const m = U.skills[s].firstMap, p = P.filter(x => x.map === m && x.kind === 'pro')[0] || P.filter(x => x.map === m)[0]; if (!p) return null;
  const ids = Object.keys(p.deck).filter(id => gm.D[id] && gm.D[id].attack != null && !S.SK.skillsOf(gm, gm.D[id]).includes(s)).sort((a, b) => p.deck[b] - p.deck[a] || (a < b ? -1 : 1));
  return ids.length ? { deck: p, card: ids[0], k: p.deck[ids[0]], map: m } : null;
}
// the context spec of a design for a skill (the road design and the per-map design play at the skill's first map; the deck designs at the deck's)
function csFor(U, E, s) {
  if (E.design === 'deck') { const d = deckPlan(U, E, s); if (!d) return null; const rest = Object.assign({}, d.deck.deck); delete rest[d.card];
    return Object.assign({}, E.cs, { scope: 'map:' + d.map, k: d.k, rest, deckId: d.deck.id }); }
  if (!E.road && !E.perMap) return E.cs; return Object.assign({}, E.cs, { scope: 'map:' + U.skills[s].firstMap });
}

// ---------------------------------------------------------------- metrics and filters
const METRICS = {
  win: (o, X) => o.s,
  margin: (o, X) => (o.hm - o.hf) / X.bramble,
  dealt: (o, X) => (X.bramble - o.hf) / X.bramble,
  kept: (o, X) => o.hm / X.bramble,
  surv: (o, X) => o.s === 0 ? Math.min(1, o.r / 20) : 1, // survival: rounds lived in a loss, a win or draw counts as surviving
  speed: (o, X) => o.s === 1 ? 1 - Math.min(o.r, 30) / 30 : 0, // tempo: a win scores more the sooner it comes
  strict: (o, X) => o.s === 1 ? 1 : 0, // a draw counts as a loss
};
const RANGED = ['arrow', 'archer', 'twinShot', 'snipe', 'fork', 'trident', 'avalanche'];
function share(gm, deck, keys) { let n = 0, t = 0; Object.keys(deck || {}).forEach(id => { const e = (gm.D[id] && gm.D[id].effects) || {}; t += deck[id]; if (keys.some(k => e[k] != null)) n += deck[id]; }); return t ? n / t : 0; }
function plainRules(r) { return !r || !Object.keys(r).some(k => !(k === 'phase' && (r[k] === 'day' || r[k] === 'off'))); }
// a filter: (gm, X, i, ctrl outcome, threshold) -> keep the fight
const FILTERS = {
  early: (gm, X, i, c, t) => c.r <= t, late: (gm, X, i, c, t) => c.r > t,
  field: (gm, X, i) => !plainRules(X.fieldList[S.fightOf(gm, X, i).f].rules), plain: (gm, X, i) => plainRules(X.fieldList[S.fightOf(gm, X, i).f].rules),
  ranged: (gm, X, i) => share(gm, S.fightOf(gm, X, i).B, RANGED) >= 0.2, melee: (gm, X, i) => share(gm, S.fightOf(gm, X, i).B, RANGED) < 0.2,
  flyers: (gm, X, i) => share(gm, S.fightOf(gm, X, i).B, ['flying']) >= 0.25, grounded: (gm, X, i) => share(gm, S.fightOf(gm, X, i).B, ['flying']) < 0.25,
  even: (gm, X, i) => i % 2 === 0, odd: (gm, X, i) => i % 2 === 1, // seat split: the skill side moves first / second
  close: (gm, X, i, c) => Math.abs(c.hm - c.hf) <= 0.3 * X.bramble, blowout: (gm, X, i, c) => Math.abs(c.hm - c.hf) > 0.3 * X.bramble, // the control fight's closeness
};

// ---------------------------------------------------------------- the estimators on a design's games
const AW = 3; // BUDGET2: Attack's budget points (bramblewood-budget.js DEFAULTS.attackWeight)
function threshold(outs) { const r = outs.map(o => o.r).sort((a, b) => a - b); return r[r.length >> 1]; }
// pairs: [{w, c}] (treated, control outcomes on the same fight); yard: [{pts, b: [outcomes], u: [outcomes]}] (each on the same fights)
function estimate(gm, X, pairs, yard, est) {
  const m = METRICS[est.metric || 'win'], f = est.filter ? FILTERS[est.filter] : null;
  const allCtrl = pairs.map(p => p.c).concat(...yard.map(y => y.b)), t = threshold(allCtrl);
  const keep = (o, ctrl) => !f || f(gm, X, o.i, ctrl, t);
  if (est.metric === 'logit') return logitEst(gm, X, pairs, yard, keep, est);
  const g = est.sign ? x => Math.sign(x) : x => x;
  const d = pairs.filter(p => keep(p.w, p.c)).map(p => g(m(p.w, X) - m(p.c, X))); if (d.length < 8) return null;
  const D = meanSE(d);
  // the yardstick per fight: (sum of bumps' gains) / (sum of their points), for the bumps the estimator uses
  const use = yard.filter(y => est.yard === 'A' ? y.kind === 'A' : est.yard === 'H' ? y.kind === 'H' : est.yard === 'ladder' ? y.kind === 'H' || y.kind === 'H4' : y.kind !== 'H4');
  if (!use.length) return null;
  let Y;
  if (est.yard === 'ladder') { // least-squares slope over the Health rungs 0, 2, 4 (per fight), the rung 0 being the control
    const h4 = use.find(y => y.kind === 'H4'), h2 = use.find(y => y.kind === 'H'); if (!h4 || !h2) return null;
    const per = []; for (let j = 0; j < h2.b.length; j++) { if (!keep(h2.b[j], h2.b[j])) continue; const y0 = m(h2.b[j], X), y2 = m(h2.u[j], X), y4 = m(h4.u[j], X); per.push(((0 - 2) * y0 + 0 * y2 + (4 - 2) * y4) / 8); }
    Y = meanSE(per);
  } else {
    const nF = use[0].b.length, per = [];
    for (let j = 0; j < nF; j++) { if (!keep(use[0].b[j], use[0].b[j])) continue; let gg = 0, p = 0; use.forEach(y => { gg += est.sign ? Math.sign(m(y.u[j], X) - m(y.b[j], X)) : m(y.u[j], X) - m(y.b[j], X); p += y.pts; }); per.push(gg / p); }
    if (per.length < 8) return null; Y = meanSE(per);
  }
  const r = ratio(D.m, D.se, Y.m, Y.se); if (r.worth == null || Y.m <= 0) return { worth: null, ci: null, n: d.length, note: 'yardstick not positive' };
  return { worth: r.worth, ci: 1.96 * r.se, n: d.length, delta: D.m, rate: Y.m };
}
const logit = p => Math.log(p / (1 - p));
function logitEst(gm, X, pairs, yard, keep, est) {
  const sel = pairs.filter(p => keep(p.w, p.c)); if (sel.length < 8) return null;
  const pr = a => (a.reduce((t, o) => t + o.s, 0) + 0.5) / (a.length + 1), v = a => { const p = pr(a); return 1 / (a.length * p * (1 - p)); };
  const W = sel.map(p => p.w), Cc = sel.map(p => p.c), d = logit(pr(W)) - logit(pr(Cc)), dv = v(W) + v(Cc);
  const use = yard.filter(y => y.kind !== 'H4'); let num = 0, pts = 0, yv = 0;
  use.forEach(y => { const b = y.b.filter(o => keep(o, o)), u = y.u.filter((o, j) => keep(y.b[j], y.b[j])); num += logit(pr(u)) - logit(pr(b)); pts += y.pts; yv += v(u) + v(b); });
  const rm = num / pts, rse = Math.sqrt(yv) / pts; if (rm <= 0) return { worth: null, ci: null, n: sel.length };
  const r = ratio(d, Math.sqrt(dv), rm, rse); return { worth: r.worth, ci: 1.96 * r.se, n: sel.length };
}

// ---------------------------------------------------------------- playing a design for a skill
const YARD = new Map(); // pooled / shared yardsticks, per context and M
function bumps(base) { return [{ kind: 'A', pts: AW, v: Object.assign({}, base, { dA: (base.dA || 0) + 1 }) }, { kind: 'H', pts: 2, v: Object.assign({}, base, { dH: (base.dH || 0) + 2 }) }]; }
async function sharedYard(sim, X, bodies, M) {
  const key = X.key + '|' + bodies.join(',') + '|' + M; if (YARD.has(key)) return YARD.get(key);
  const items = []; bodies.forEach(b => { items.push({ v: { base: b } }); bumps({ base: b }).forEach(x => items.push({ v: x.v })); });
  await sim.need(X, items, M);
  // pooled over the bodies: per fight, each body's bump outcomes are kept apart (yard entries per body)
  const out = []; bodies.forEach(b => { const base = sim.outcomes(X, { base: b }, b, M); bumps({ base: b }).forEach(x => out.push({ kind: x.kind, pts: x.pts, b: base, u: sim.outcomes(X, x.v, b, M) })); });
  // merge the bodies into one entry per kind (fights concatenated: each body's fights are its own sample)
  const merged = ['A', 'H'].map(k => { const e = out.filter(y => y.kind === k); return { kind: k, pts: e[0].pts, b: [].concat(...e.map(y => y.b)), u: [].concat(...e.map(y => y.u)) }; });
  YARD.set(key, merged); return merged;
}
// the items, pairs and yardstick of design E for skill s at M fights (plays what is missing)
async function playDesign(sim, E, s, M) {
  const U = S.universe(sim.gm), gm = sim.gm, cs = csFor(U, E, s);
  if (!cs) return { skip: 'no real deck holds a carrier of this skill' };
  const X = sim.context(cs);
  if (E.design === 'deck') { // the slot = the deck's copies of the card; with / without (remove) or plain / given (add); own +1 Attack / +2 Health bumps
    const d = deckPlan(U, E, s), c = d.card, src = carrierOf(U, s, 1)[0];
    const withV = E.mode === 'remove' ? { base: c } : Object.assign({ base: c }, S.addOf(gm, src, s)), without = E.mode === 'remove' ? S.withoutV(c, s) : { base: c };
    const bs = bumps(without), items = [{ v: withV, card: c }, { v: without, card: c }].concat(bs.map(b => ({ v: b.v, card: c })));
    await sim.need(X, items, M);
    const base = sim.outcomes(X, without, c, M), yard = bs.map(b => ({ kind: b.kind, pts: b.pts, b: base, u: sim.outcomes(X, b.v, c, M) }));
    const w = sim.outcomes(X, withV, c, M);
    return { X, carrier: c + '@' + d.deck.id, pairs: w.map((x, j) => ({ w: x, c: base[j] })), yard, games: M * items.length };
  }
  const c = carrierOf(U, s, 1)[0];
  if (E.design === 'van') {
    const body = E.body; if (S.SK.skillsOf(gm, gm.D[body]).includes(s)) return { skip: 'the body already has this skill' };
    const withV = Object.assign({ base: body }, S.addOf(gm, c, s)), ctrl = { base: body };
    const yard = await sharedYard(sim, X, [body], Math.max(M, E.yardM || M));
    await sim.need(X, [{ v: withV }, { v: ctrl }], M);
    const w = sim.outcomes(X, withV, body, M), cc = sim.outcomes(X, ctrl, body, M);
    return { X, carrier: c, pairs: w.map((o, j) => ({ w: o, c: cc[j] })), yard, games: M };
  }
  const withV = { base: c }, without = S.withoutV(c, s), items = [{ v: withV, card: c }, { v: without, card: c }];
  let yard;
  if (E.yard === 'own') {
    const bs = bumps(without); if (E.ladder) bs.push({ kind: 'H4', pts: 4, v: Object.assign({}, without, { dH: 4 }) });
    bs.forEach(b => items.push({ v: b.v, card: c }));
    await sim.need(X, items, M);
    const base = sim.outcomes(X, without, c, M); yard = bs.map(b => ({ kind: b.kind, pts: b.pts, b: base, u: sim.outcomes(X, b.v, c, M) }));
  } else {
    yard = await sharedYard(sim, X, S.vanillaBodies(gm, X.pool, X.level).slice(0, 6), E.yardM || 300);
    await sim.need(X, items, M);
  }
  const w = sim.outcomes(X, withV, c, M), o = sim.outcomes(X, without, c, M);
  return { X, carrier: c, pairs: w.map((x, j) => ({ w: x, c: o[j] })), yard, games: M * items.length };
}

// ---------------------------------------------------------------- registry entries
const REG = [];
const ESTS = [
  { k: 'win', est: { metric: 'win' }, name: 'win rate', idea: 'win-rate gain / the win-rate gain of a budget point (+1 Attack = 3, +2 Health = 2)' },
  { k: 'margin', est: { metric: 'margin' }, name: 'bramble margin', idea: 'gain in (my bramble Health - theirs) / that of a budget point; a continuous, lower-noise score' },
  { k: 'dealt', est: { metric: 'dealt' }, name: 'damage dealt', idea: 'gain in damage dealt to the enemy bramble / that of a budget point (offence proxy)' },
  { k: 'kept', est: { metric: 'kept' }, name: 'damage prevented', idea: 'gain in my bramble Health left / that of a budget point (defence proxy)' },
  { k: 'surv', est: { metric: 'surv' }, name: 'survival time', idea: 'gain in rounds survived (losses; wins count as surviving) / that of a budget point' },
  { k: 'logit', est: { metric: 'logit' }, name: 'logit win rate', idea: 'gain in log-odds of winning / that of a budget point (no ceiling squeeze near 0% or 100%)' },
  { k: 'yA', est: { metric: 'win', yard: 'A' }, name: 'Attack-equivalent', idea: 'win-rate gain priced in +1 Attack bumps only (3 points each)' },
  { k: 'yH', est: { metric: 'win', yard: 'H' }, name: 'Health-equivalent', idea: 'win-rate gain priced in +2 Health bumps only (1 point each)' },
  { k: 'early', est: { metric: 'win', filter: 'early' }, name: 'early games', idea: 'only fights the control won or lost by the median round (turn of impact: early)' },
  { k: 'late', est: { metric: 'win', filter: 'late' }, name: 'late games', idea: 'only fights that went past the median round (turn of impact: late)' },
  { k: 'field', est: { metric: 'win', filter: 'field' }, name: 'under a field', idea: 'only fights under a field rule (Mist, night, Tide, wind ...)' },
  { k: 'plain', est: { metric: 'win', filter: 'plain' }, name: 'plain field', idea: 'only fights under a plain day' },
  { k: 'first', est: { metric: 'win', filter: 'even' }, name: 'moving first', idea: 'only fights where the skill side takes the first seat' },
  { k: 'second', est: { metric: 'win', filter: 'odd' }, name: 'moving second', idea: 'only fights where the skill side takes the second seat' },
];
const MORE = [
  { k: 'speed', est: { metric: 'speed' }, name: 'win tempo', idea: 'gain in a tempo score (a win scores 1 - rounds / 30) / that of a budget point' },
  { k: 'strict', est: { metric: 'strict' }, name: 'wins only', idea: 'win-rate gain with draws counted as losses / that of a budget point' },
  { k: 'close', est: { metric: 'win', filter: 'close' }, name: 'close fights', idea: 'only fights whose control game ended within 30% of a bramble\'s Health' },
  { k: 'blowout', est: { metric: 'win', filter: 'blowout' }, name: 'lopsided fights', idea: 'only fights whose control game was lopsided (margin over 30%)' },
  { k: 'ps', est: { metric: 'margin', sign: true }, name: 'probability of superiority', idea: 'how often the skill side ends with the better bramble margin than its control (sign test) / the same for a budget point' },
];
const OPP = [
  { k: 'vsRanged', est: { metric: 'win', filter: 'ranged' }, name: 'vs ranged decks', idea: 'only fights against decks with 20%+ shooters (damage type: ranged)' },
  { k: 'vsMelee', est: { metric: 'win', filter: 'melee' }, name: 'vs melee decks', idea: 'only fights against decks with under 20% shooters (damage type: melee)' },
  { k: 'vsFlyers', est: { metric: 'win', filter: 'flyers' }, name: 'vs flyer decks', idea: 'only fights against decks with 25%+ Flying (family: flyers)' },
  { k: 'vsGround', est: { metric: 'win', filter: 'grounded' }, name: 'vs grounded decks', idea: 'only fights against decks with under 25% Flying' },
];
// which estimators each design gets (the primary first)
const PLAN = {
  V1: ['win', 'margin', 'dealt', 'kept', 'surv', 'logit', 'yA', 'yH', 'early', 'late', 'field', 'first', 'second', 'speed', 'strict', 'close', 'blowout', 'ps'],
  H1: ['win', 'margin', 'dealt', 'kept', 'logit', 'yA', 'yH', 'ladder', 'early', 'late', 'field', 'vsRanged', 'vsMelee', 'vsFlyers', 'vsGround', 'surv', 'speed', 'close', 'ps'],
  R1: ['win', 'margin', 'dealt', 'kept', 'logit', 'yA', 'yH', 'early', 'late', 'vsRanged', 'vsMelee', 'vsFlyers', 'vsGround', 'surv', 'ps'],
  V3: ['win', 'margin', 'logit', 'early', 'late', 'dealt', 'kept', 'ps'],
  V4: ['win', 'margin', 'logit', 'early', 'late', 'dealt', 'kept', 'ps'],
  DK: ['margin', 'win', 'dealt', 'kept', 'logit', 'yH', 'yA', 'ps', 'early', 'late'],
  AD: ['margin', 'win', 'dealt', 'kept', 'logit', 'yH', 'yA', 'ps', 'early', 'late'],
  V9: ['win', 'margin', 'logit'],
  V10: ['win', 'margin', 'logit'],
  P1: ['win', 'margin', 'dealt', 'logit', 'early', 'late'],
  V11: ['win', 'margin', 'logit'],
  V2: ['win', 'margin', 'logit', 'yH', 'early', 'late'],
  V5: ['win', 'margin', 'logit', 'early', 'late'],
  V7: ['win', 'margin', 'logit'],
  V6: ['win', 'margin', 'logit'],
  V8: ['win', 'margin', 'logit', 'early', 'late'],
  D1: ['margin', 'win', 'dealt', 'yH', 'early', 'late'],
  V12: ['win', 'margin', 'logit', 'vsRanged', 'vsMelee', 'vsFlyers', 'vsGround', 'early', 'late'],
  V13: ['win', 'margin', 'logit'],
  V14: ['win', 'margin', 'logit'],
  V15: ['win', 'margin', 'logit'],
  R2: ['win', 'margin', 'logit'],
  R3: ['win', 'margin', 'logit', 'vsRanged', 'vsMelee'],
  H2: ['win', 'margin', 'logit', 'yA', 'yH', 'early', 'late'],
  V16: ['win', 'margin', 'logit'],
};
const ALL_EST = {}; ESTS.concat(MORE, OPP).forEach(e => ALL_EST[e.k] = e);
ALL_EST.ladder = { k: 'ladder', est: { metric: 'win', yard: 'ladder' }, name: 'stat-equivalence ladder', idea: 'the Health that matches the skill: least-squares line through +0 / +2 / +4 Health on the bare carrier' };
Object.keys(PLAN).forEach(eid => {
  const E = EXPS[eid];
  PLAN[eid].forEach((k, j) => {
    const e = ALL_EST[k];
    REG.push({ id: eid + '-' + k, exp: eid, primary: j === 0, name: eid + ' ' + e.name, idea: E.idea + '; ' + e.idea,
      async run(s, o) {
        const sim = o.sim; let M = o.M || E.stages[0], res, D;
        const stages = this.primary ? (o.stages || E.stages) : [o.M || E.stages[E.stages.length - 1]];
        for (const st of stages) { M = st; D = await playDesign(sim, E, s, M); if (D.skip) return { worth: null, ci: null, games: 0, M, note: D.skip }; res = estimate(sim.gm, D.X, D.pairs, D.yard, e.est);
          if (this.primary && res && res.worth != null && res.ci < 0.1 * Math.abs(res.worth)) break; }
        if (!res) return { worth: null, ci: null, games: D.games, carrier: D.carrier, M, note: 'too few fights after the filter' };
        return { worth: res.worth, ci: res.ci, games: D.games, carrier: D.carrier, M, n: res.n, note: res.note };
      } });
  });
});

// ---------------------------------------------------------------- offline methods (no games: earlier measurements and cross-sections)
const readJ = f => { const p = path.join(BAL, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
function benchHistory(file, id, note) {
  return { id, exp: null, name: 'history: ' + file, idea: note + ' (bench T2 file of that date; worth rescaled to the 3A + H yardstick, the engine and prices of that day)',
    run(s, o) { const J = readJ(file); if (!J) return { worth: null };
      const y = J.yardstick, aw = /2026-10-(2|30)/.test(file) ? 2 : 3, k = y.attack && y.health ? (y.perPoint / ((y.attack + y.health) / (AW + 1))) : 1;
      const r = J.ranked.find(x => x.skill === s); if (!r) return { worth: null };
      return { worth: r.worth * (aw === 2 ? k : 1), ci: r.worthCI * (aw === 2 ? k : 1), games: (J.context.fights || 0) * (r.carriers || []).length * 2 }; } };
}
REG.push(benchHistory('bench-skills-2026-10-28.json', 'O-bench1028', 'the workbench skill test of 2026-10-28'));
REG.push(benchHistory('bench-skills-2026-10-30.json', 'O-bench1030', 'the workbench skill test of 2026-10-30'));
REG.push(benchHistory('bench-skills-2026-10-30-remeasure.json', 'O-bench1030r', 'the workbench re-measure of 2026-10-30'));
// the robust skill test (2026-10-22): each mono row's worth for the skill's number nearest its carriers'
REG.push({ id: 'O-robust', exp: null, name: 'history: robust mono test 2026-10-22', idea: 'robust skill test (random rarity / Wait / Lumber profiles and fields, 2,000 fights a row) of 2026-10-22, BF7 units',
  run(s, o) { const J = readJ('skill-test-robust-mono-2000-2026-10-22.json'); if (!J || s.startsWith('T:')) return { worth: null };
    const rows = J.rows.filter(r => { const m = /^mono:(\{.*\})$/.exec(r.key); if (!m) return false; try { return Object.keys(JSON.parse(m[1]))[0] === s; } catch (e) { return false; } });
    if (!rows.length) return { worth: null }; const n = carrierN(o.U, s), nv = r => { const v = Object.values(JSON.parse(r.key.slice(5)))[0]; return typeof v === 'number' ? v : 1; };
    const r = rows.slice().sort((a, b) => Math.abs(nv(a) - n) - Math.abs(nv(b) - n))[0]; return { worth: r.worth, ci: r.netSE != null ? 1.96 * r.netSE : null, games: r.n }; } });
// the skill ladder of BAL23 (2026-11-08): 7-8 bodies from hitter to wall at a fixed budget, 400 paired fights a variant, 15-Health brambles
const nearestN = (pts, n) => pts.slice().sort((a, b) => Math.abs((typeof a.n === 'number' ? a.n : 1) - n) - Math.abs((typeof b.n === 'number' ? b.n : 1) - n))[0];
[['L1', 'best'], ['L1', 'mean'], ['L5', 'best'], ['L5', 'mean']].forEach(([lv, k]) => REG.push({ id: 'O-ladder-' + lv + k, exp: null, name: 'history: skill ladder ' + lv + ' ' + k,
  idea: 'BAL23 skill ladder (2026-11-08) at ' + lv + ': ' + (k === 'best' ? 'the worth on the best body shape (a quadratic through worth against Attack share)' : 'the worth averaged over the 7-8 body shapes') + ', 3A + H points',
  run(s, o) { const J = readJ('skill-ladder/summary-2026-11-07.json'); if (!J) return { worth: null }; const e = J.skills.find(x => x.key === s); if (!e) return { worth: null };
    const pts = e.points.filter(p => p[lv] && p[lv][k] && p[lv][k].m != null); if (!pts.length) return { worth: null }; const p = nearestN(pts, carrierN(o.U, s)), v = p[lv][k];
    return { worth: v.m, ci: v.hi != null ? (v.hi - v.lo) / 2 : null, games: J.games || 0 }; } }));
// the SKILL2 / pipeline canon measures (what today's prices came from)
REG.push({ id: 'O-canon', exp: null, name: 'pipeline canon measures', idea: 'the SKILL2 / pipeline measure (tools/skill_canon) at the number nearest the carriers\'; the source of most of today\'s prices',
  run(s, o) { const J = readJ('pipeline/measures.json'); if (!J) return { worth: null }; const n = carrierN(o.U, s);
    const rows = Object.values(J.results).filter(r => r.id === s && r.ctx === 'global' && r.stages && r.stages.length); if (!rows.length) return { worth: null };
    const r = rows.slice().sort((a, b) => Math.abs((a.n || 1) - n) - Math.abs((b.n || 1) - n))[0], st = r.stages[r.stages.length - 1];
    const sc = n && r.n ? n / r.n : 1; return { worth: st.m * sc, ci: st.hi != null ? (st.hi - st.lo) / 2 * sc : null, games: st.fights }; } });
// the table's own measured value (skill-costs.json measuredS) on today's carriers: price x measured / value
REG.push({ id: 'O-measuredS', exp: null, name: 'skill-costs measuredS', idea: 'today\'s price scaled by the entry\'s measuredS / value (skill_worth.js measures of 10-19 / 10-21)',
  run(s, o) { const t = L.costs().table; if (s.startsWith('T:')) { const [on, d] = s.slice(2).split('>'), tr = t.triggers.find(x => x.id === on), ac = (t.actions || []).find(x => x.id === d);
      const f = (tr && tr.measuredS && tr.value ? tr.measuredS / tr.value : null), g = (ac && ac.measuredS && ac.value ? ac.measuredS / ac.value : null); if (f == null && g == null) return { worth: null };
      return { worth: o.U.skills[s].price * (f == null ? 1 : f) * (g == null ? 1 : g), ci: null, games: 0 }; }
    const e = (t.skills || []).find(x => x.id === s); if (!e || e.measuredS == null || !e.value) return { worth: null };
    return { worth: o.U.skills[s].price * e.measuredS / e.value, ci: e.measuredSE != null ? 1.96 * o.U.skills[s].price * e.measuredSE / e.value : null, games: 0 }; } });
function carrierN(U, s) { const gm = U.gm, ns = U.skills[s].carriers.map(id => { const v = (gm.D[id].effects || {})[s]; return typeof v === 'number' ? v : 1; }); return ns.reduce((a, b) => a + b, 0) / ns.length; }

// cross-sections: a ridge regression over cards, y_i = a + b x statPoints_i + c x wait_i + d x cost_i + sum_s w_s has_s(i); worth_s = w_s / b
// (rows: {y, stat, cov: [wait, cost], skills: [...]})
function ridgeWorth(rows, lambda) {
  const skills = [...new Set(rows.flatMap(r => r.skills))].sort(), nc = (rows[0].cov || []).length, off = 2 + nc, K = skills.length + off, idx = {}; skills.forEach((s, j) => idx[s] = j + off);
  const A = Array.from({ length: K }, () => new Float64Array(K)), bv = new Float64Array(K);
  rows.forEach(r => { const x = new Float64Array(K); x[0] = 1; x[1] = r.stat; (r.cov || []).forEach((v, j) => x[2 + j] = v); r.skills.forEach(s => x[idx[s]] = 1);
    for (let p = 0; p < K; p++) { if (!x[p]) continue; bv[p] += x[p] * r.y; for (let q = 0; q < K; q++) if (x[q]) A[p][q] += x[p] * x[q]; } });
  for (let p = 1; p < K; p++) A[p][p] += p >= off ? lambda : 1e-6; // a tiny ridge on the covariates keeps an all-zero column (no Wait on file) solvable
  const w = solve(A, bv); if (!w) return null; const out = {}; skills.forEach(s => { out[s] = w[1] > 0 ? w[idx[s]] / w[1] : null; });
  const cnt = {}; rows.forEach(r => r.skills.forEach(s => cnt[s] = (cnt[s] || 0) + 1)); return { worth: out, b: w[1], count: cnt };
}
function solve(A, b) { const n = b.length, M = A.map((r, i) => Array.from(r).concat([b[i]]));
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; if (Math.abs(M[p][c]) < 1e-12) return null; [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  return M.map((r, i) => r[n] / r[i]); }
const statPts = (gm, d, level) => { const b = L.budgetOf(Object.assign({}, d, { effects: {} }), level || 1); return b.x1; };
const CROSS = new Map();
function crossMethod(id, name, idea, build) {
  return { id, exp: null, name, idea, run(s, o) { if (!CROSS.has(id)) CROSS.set(id, build(o.U)); const R = CROSS.get(id); if (!R || R.worth[s] == null) return { worth: null };
    return { worth: R.worth[s], ci: null, games: 0, n: R.count[s] }; } };
}
const sk = gm => r => S.SK.skillsOf(gm, gm.D[r.id]);
// hedonic: the designers' slack. y = N - (3A + H) x m on the bare stats; the skills explain it (y = sum w_s)
function hedonic(U, ids) { const gm = U.gm; const rows = ids.filter(id => gm.D[id] && gm.D[id].attack != null).map(id => ({ id, stat: 0, y: S.nOf(gm, id, 1) - statPts(gm, gm.D[id], 1) }));
  // stat column is constant here: regress y on skills only (b fixed at 1): put stat = 1 for all and lambda small
  rows.forEach(r => { r.stat = 0; }); const skills = [...new Set(rows.flatMap(sk(gm)))]; const out = {}, cnt = {};
  // ridge with a fixed intercept 0: w = (X'X + lambda I)^-1 X'y
  const K = skills.length, idx = {}; skills.forEach((s, j) => idx[s] = j); const A = Array.from({ length: K }, () => new Float64Array(K)), bv = new Float64Array(K);
  rows.forEach(r => { const ks = sk(gm)(r).map(s => idx[s]); ks.forEach(p => { bv[p] += r.y; ks.forEach(q => A[p][q] += 1); }); ks.forEach(p => cnt[skills[p]] = (cnt[skills[p]] || 0) + 1); });
  for (let p = 0; p < K; p++) A[p][p] += 0.5; const w = solve(A, bv); if (!w) return null; skills.forEach((s, j) => out[s] = w[j]); return { worth: out, count: cnt }; }
REG.push(crossMethod('O-hedonic-maps', 'designers\' slack, Maps 0-20 cards', 'what the card designs leave for skills: N minus the bare stats\' (3A + H) x m, shared among each card\'s skills (ridge), Maps 0-20 cards',
  U => hedonic(U, U.pool)));
REG.push(crossMethod('O-hedonic-all', 'designers\' slack, every fieldable card', 'the same over every fieldable card of the game (later maps\' designs too)',
  U => hedonic(U, Object.keys(U.gm.D).filter(id => S.C.fieldable(U.gm, id)))));
REG.push(crossMethod('O-hedonic-solo', 'designers\' slack, one-skill cards', 'median slack of the cards that carry only this skill (no sharing assumption)', U => {
  const gm = U.gm, out = {}, cnt = {}, by = {}; Object.keys(gm.D).filter(id => S.C.fieldable(gm, id)).forEach(id => { const ss = S.SK.skillsOf(gm, gm.D[id]); if (ss.length !== 1) return; (by[ss[0]] = by[ss[0]] || []).push(S.nOf(gm, id, 1) - statPts(gm, gm.D[id], 1)); });
  Object.keys(by).forEach(s => { out[s] = S.median(by[s]); cnt[s] = by[s].length; }); return { worth: out, count: cnt }; }));
// contribution cross-sections: per-copy contribution on the bare stat points and skill dummies
// the file's own card stats and skills (the cards as they were that day): stat = 3A + H, covariates Wait and Lumber
function contribRows(U, file, pick) { const J = readJ(file); if (!J) return null; const list = pick(J) || [];
  return list.filter(r => r && r.attack != null && r.health != null && r.y != null && isFinite(r.y) && Array.isArray(r.skills))
    .map(r => ({ id: r.id, y: r.y, stat: AW * r.attack + r.health, cov: [r.wait || 0, r.cost || 0], skills: r.skills.filter(k => typeof k === 'string') })); }
function contribMethod(id, file, pick, note) { return crossMethod(id, 'contribution regression: ' + file, note + '; per-copy contribution = a + b x bare stat points + sum of skill terms, worth = term / b (ridge)', U => {
  const rows = contribRows(U, file, pick); return rows && rows.length > 30 ? ridgeWorth(rows, 2) : null; }); }
const benchContribPick = J => (J.cards || []).map(r => Object.assign({}, r, { y: r.perCopy }));
REG.push(contribMethod('O-contrib-skill2', 'bench-contrib-global-2026-10-31-skill2-final.json', benchContribPick, 'workbench card contribution after SKILL2 (2026-10-31), random decks'));
REG.push(contribMethod('O-contrib-b15', 'bench-contrib-global-b15-2026-11-03-bal15-tempo.json', benchContribPick, 'workbench card contribution at 15-Health brambles (2026-11-03)'));
REG.push(contribMethod('O-contrib-bal6', 'contribution-2026-10-27.json', J => ((J.analysis || {}).cards || []).map(r => Object.assign({}, r, { y: r.perCopy })), 'BAL6 all-cards regression (2026-10-27)'));
// pick rate: copies of each list card in the PRO / BPRO decks of its map (deck optimiser output), on surplus stat points and skill terms
REG.push(crossMethod('O-pickrate', 'deckopt pick rate (PRO / BPRO decks)', 'how often the deck optimiser picks a card (copies in the Maps 0-20 PRO / BPRO decks over the map\'s list) = a + b x bare stat points + skill terms; worth = term / b', U => {
  const gm = U.gm, J = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')), rows = [];
  Object.values(J.maps).forEach(m => { if (m.map == null || m.map > 20) return; const P = U.perMap[m.map]; if (!P) return; const decks = [].concat(m.pro || [], m.bpro || []).filter(p => p.deck); if (!decks.length) return;
    P.pool.forEach(id => { if (gm.D[id].attack == null) return; const c = decks.reduce((t, p) => t + (p.deck[id] || 0), 0) / decks.length; const d = gm.D[id]; rows.push({ id, y: c, stat: statPts(gm, d, 1), cov: [d.wait || 0, d.cost || 0, S.nOf(gm, id, 1)], skills: S.SK.skillsOf(gm, d) }); }); });
  return ridgeWorth(rows, 1); }));
// the workbook export (2026-11-07): per-card power figures, same regression
function workbookRows(U, col) { const f = path.join(ROOT, 'docs', 'balance', 'skm', 'workbook-cards-2026-11-07.json'); if (!fs.existsSync(f)) return null; const J = JSON.parse(fs.readFileSync(f, 'utf8')), gm = U.gm;
  return J.filter(r => r.id && gm.D[r.id] && gm.D[r.id].attack != null && typeof r[col] === 'number').map(r => { const d = gm.D[r.id]; return { id: r.id, y: r[col], stat: statPts(gm, d, 1), cov: [d.wait || 0, d.cost || 0, S.nOf(gm, r.id, 1)], skills: S.SK.skillsOf(gm, d) }; }); }
['basic', 'advanced', 'power'].forEach(col => REG.push(crossMethod('O-workbook-' + col, 'workbook ' + col + ' (2026-11-07)', 'the 2026-11-07 workbook\'s per-card ' + col + ' figure on bare stat points and skill terms (ridge)', U => {
  const rows = workbookRows(U, col); return rows && rows.length > 30 ? ridgeWorth(rows, 2) : null; })));

// the price of the skill on the card a sim row measured it on (cap-1 left side with minus without, Level 1): the van design's body given the
// skill, the carrier without it, or the deck card given it; today's skill price is the mean over every carrier, this is the row's own
function rowPrice(U, methodId, s, carrier) {
  const m = REG.find(x => x.id === methodId), gm = U.gm; if (!m || !m.exp || !carrier) return null; const E = EXPS[m.exp];
  const x1 = v => L.budgetOf(L.printedDef(gm, v), 1).x1, src = carrierOf(U, s, 1)[0];
  try {
    if (E.design === 'van') return x1(Object.assign({ base: E.body }, S.addOf(gm, src, s))) - x1({ base: E.body });
    const card = String(carrier).split('@')[0];
    if (E.design === 'deck' && E.mode === 'add') return x1(Object.assign({ base: card }, S.addOf(gm, src, s))) - x1({ base: card });
    return S.priceOn(gm, card, s, 1);
  } catch (e) { return null; }
}

module.exports = { REG, EXPS, PLAN, carrierOf, playDesign, estimate, METRICS, FILTERS, rowPrice };
