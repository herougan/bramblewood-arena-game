// 2026-11-08 (package BAL31, owner 17:22: "Our goal is to produce a simple skill budget for each skill - no pairwise skill budgeting - too
// complex. But, I guess let's see."): the shared bench side of the BAL31 experiments (additivity, on-hit riders). It is the skill ladder's
// method (tools/skill_ladder_2026_11_07.js): a War Hound body re-statted to Attack / Health spreads at its own budget (3A + H = round N(L)),
// every variant on the same fights (paired, common random numbers), the placebo once a key, worth = paired gain / one rate. Measurement
// only: nothing here writes a card, a price or the cost table.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..', '..');
const LAD = require(path.join(ROOT, 'tools', 'skill_ladder_2026_11_07.js'));
const BASE = 'war-hound', BRAMBLE = 15, PLACEBO = { skill2Placebo: true }, FLAG_WR = 0.85;

const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
const q = (a, p) => { const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))]; };
const meanIx = (a, ix) => { let s = 0; if (!ix) { for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; } for (let i = 0; i < ix.length; i++) s += a[ix[i]]; return s / ix.length; };
function bootIdx(M, B, seed) { const r = mulberry(fnv('bal31-boot|' + seed)), out = []; for (let b = 0; b < B; b++) { const a = new Uint32Array(M); for (let i = 0; i < M; i++) a[i] = Math.floor(r() * M); out.push(a); } return out; }

// the bench at the given levels: per level its context, the base's levelled stats and its budget
function bench(o) {
  const L = require(path.join(ROOT, 'tools', 'bench', 'lib.js')), B = new L.Bench(o), gm = B.gm, defs = gm.G.referenceBaseDefs(), lv = {};
  o.levels.forEach(Lv => {
    const X = B.context(L.csOf(Object.assign({}, o, { level: Lv, bramble: BRAMBLE, map: null, pool: null })));
    const m = L.O.mineFor(gm, defs, { [BASE]: 1 }, Lv), s = defs[Object.keys(m)[0]];
    const N = L.budgetOf(Object.assign({}, gm.D[BASE], { attack: s.attack, health: s.health }), Lv).N;
    lv[Lv] = { X, a0: s.attack, h0: s.health, N, Bud: Math.round(N) };
  });
  const variant = (Lv, body, eff) => { const c = lv[Lv], v = { base: BASE }; if (body.A !== c.a0) v.dA = body.A - c.a0; if (body.H !== c.h0) v.dH = body.H - c.h0;
    if (eff) { const add = Object.assign({}, eff), trig = add.triggers; delete add.triggers; if (Object.keys(add).length) v.add = add; if (Array.isArray(trig) && trig.length) v.addTrig = trig; } return v; };
  const have = (Lv, v, M) => { const X = lv[Lv].X; for (let i = 0; i < M; i++) if (B.get(X, v, BASE, i) == null) return false; return true; };
  const scores = (Lv, v, M) => B.scores(lv[Lv].X, v, BASE, M);
  return { L, B, gm, lv, variant, have, scores };
}
// the stat yardstick on bodies: (gain of +1 Attack + gain of +1 Health) / 4, the mean over bodies (win rate a 3A + H point)
function statVariants(K, Lv, bs) { const out = []; bs.forEach(b => out.push({ v: K.variant(Lv, b) }, { v: K.variant(Lv, b, PLACEBO) }, { v: K.variant(Lv, { A: b.A + 1, H: b.H }) }, { v: K.variant(Lv, { A: b.A, H: b.H + 1 }) })); return out; }
function statRate(K, Lv, M, bs, ix) {
  if (!bs.every(b => K.have(Lv, K.variant(Lv, b), M) && K.have(Lv, K.variant(Lv, { A: b.A + 1, H: b.H }), M) && K.have(Lv, K.variant(Lv, { A: b.A, H: b.H + 1 }), M))) return null;
  let t = 0; bs.forEach(b => { const s0 = K.scores(Lv, K.variant(Lv, b), M), a = K.scores(Lv, K.variant(Lv, { A: b.A + 1, H: b.H }), M), h = K.scores(Lv, K.variant(Lv, { A: b.A, H: b.H + 1 }), M);
    t += (meanIx(a, ix) + meanIx(h, ix) - 2 * meanIx(s0, ix)) / 4; }); return t / bs.length;
}
// per body: the paired gain a fight of `eff` (less the placebo once a key), win rates with and without
function gainsOf(K, Lv, eff, M, bs) {
  const k = Object.keys(eff).length;
  if (!bs.every(b => K.have(Lv, K.variant(Lv, b), M) && K.have(Lv, K.variant(Lv, b, PLACEBO), M) && K.have(Lv, K.variant(Lv, b, eff), M))) return null;
  return bs.map(b => { const s0 = K.scores(Lv, K.variant(Lv, b), M), s1 = K.scores(Lv, K.variant(Lv, b, eff), M), sp = K.scores(Lv, K.variant(Lv, b, PLACEBO), M), g = new Float64Array(M);
    let w0 = 0, w1 = 0; for (let i = 0; i < M; i++) { g[i] = s1[i] - s0[i] - k * (sp[i] - s0[i]); w0 += s0[i]; w1 += s1[i]; }
    return { body: b, g, wr0: w0 / M, wr1: w1 / M }; });
}
// the ladder's rate at a level (the anchors' canon rate), else null
function ladderRate(Lv) {
  const f = path.join(ROOT, 'docs', 'balance', 'skill-ladder', `skill-canon-anchors-L${Lv}-ladder.json`);
  if (!fs.existsSync(f)) return null; const x = JSON.parse(fs.readFileSync(f, 'utf8')); return { r: x.canonRate.m, ci: x.canonRate, from: path.relative(ROOT, f) + ' (canon rate, ' + x.context.fights + ' fights)' };
}
function parse(argv, defaults) {
  const L = require(path.join(ROOT, 'tools', 'bench', 'lib.js')), o = Object.assign(L.defaults(), defaults), a = argv.slice(); o.cmd = a.shift() || 'help';
  while (a.length) { if (L.parseCommon(a, o)) continue; const k = a.shift();
    if (k === '--levels') o.levels = a.shift().split(',').map(Number); else if (k === '--only') o.only = a.shift().split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--hours') o.hours = +a.shift(); else if (k === '--boot') o.boot = +a.shift(); else if (k === '--phase') o.phase = +a.shift();
    else if (k === '--rounds') o.rounds = +a.shift(); else if (k === '--top') o.top = +a.shift(); else if (k === '--bodies') o.bodyAs = a.shift().split(',').map(Number);
    else throw new Error('unknown option ' + k); }
  o.quiet = false; return o;
}
module.exports = { ROOT, LAD, BASE, BRAMBLE, PLACEBO, FLAG_WR, fnv, mulberry, r2, q, meanIx, bootIdx, bench, statVariants, statRate, gainsOf, ladderRate, parse };
