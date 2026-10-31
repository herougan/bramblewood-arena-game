#!/usr/bin/env node
// 2026-10-31 (package BUDGET2, X14; owner 10-30: "we need to think of a robust way to measure skill strength, then for newer skill or doing
// sub-batching, comparing skills with a set of skills we have 'canonised' their values of."): a skill's worth measured against the canon
// anchors (canonical/skill-costs.json entries with canon: true, at their canonAt numbers), by paired sims on the same carriers.
//
//   node tools/skill_canon_2026_10_31.js anchors                       the anchors and their prices (no games)
//   node tools/skill_canon_2026_10_31.js measure '{"anadromous":true}'  a skill (effects JSON, a trigger as {"triggers":[{...}]})
//   node tools/skill_canon_2026_10_31.js measure --skill arrow=2       the same for one keyword (=N; no = means true)
//   node tools/skill_canon_2026_10_31.js check                         the anchors against each other (leave one out), no test skill
// Options: --games M (paired fights a variant, default 200), --carriers a,b,c (default: 6 vanilla cards of the pool nearest their full
// budget, a Common and an Uncommon / Rare in each of three shapes: hitter, balanced, wall), --map N (a map's context: its fields, level, pool; default the global one), --name X (the file
// name), --save (docs/balance/skill-canon-<name>-<tag>.json + .md), --workers N, --seed S, --copies k (the bench's slot, default 6),
// --cache-dir D. Games are the bench's (tools/bench/lib.js): cached by the game's fingerprint, so a stopped run resumes by re-running it and
// the anchors' games are shared by every later measurement in the same context (same cards, engine and budget).
//
// The method (each fight i is played by every variant with the same decks, field and engine seed: common random numbers):
//   - carriers c: vanilla cards (no skill); each plays as printed (base), + each anchor a at its canonAt N, + the test skill, + 1 Health,
//     + 1 Attack. D_a[i] = mean over carriers of score(c + a)[i] - score(c)[i], the same for the test, D_t.
//   - the canon rate r = the median over the anchors of D̄_a / P_a (P_a = the table's price at canonAt): win rate a canon point; robust to an
//     anchor that suits the carriers unusually well or badly (the least-squares line through 0 is reported beside it, with its R²). The test's worth W = D̄_t / r, in canon points (the table's currency, set by the anchors).
//   - the 95% intervals come from a bootstrap over fights (the same resampled fights for the anchors and the test, so their noise is paired).
//   - the stat yardstick: +1 Health = 1 point, +1 Attack = attackWeight points (3 since BUDGET2): r_stat = (ΣΔA + ΣΔH) / (3 nA + nH). The
//     currency ratio κ = r_stat / r tells whether the anchors' prices and the 3A + H stats agree (κ ≈ 1: a canon point buys what a budget
//     point of stats buys; κ < 1: the anchors are cheap next to stats, so every skill priced in their currency is too).
//   - check: each anchor measured from the others (leave one out) against its canon price; R² of the anchors' line.
// A price change stays the owner's call: the tool writes nothing to canonical/skill-costs.json.
'use strict';
const path = require('path'), fs = require('fs');
const L = require('./bench/lib.js');
// 1.1.0 (2026-10-31, package SKILL2, BUDGET2-2): each anchor also read by the stat yardstick (worthStat); the canon prices are set in 3A + H
// stat points from one shared measure (tools/skill2_apply_2026_10_31.js anchors), so κ ≈ 1 by construction and the ruler reads stat points.
// The placebo (SKILL2): {"skill2Placebo": true}, a key the engine does not know. The CPU values a card by its number of effect keys
// (bramblewood-engine.js cardValue, + 1.5 a key: it pitches a skilled card later), so any added key gains about 1.5 win-rate points on
// these carriers (0.41 [0.22, 0.59] stat points at 1,000 fights). Every anchor and test reading is less the placebo's, once a key the
// variant adds (Remember + its triggers: two). --no-placebo reads them raw (the BUDGET2 reading).
const PLACEBO = { skill2Placebo: true };
const VERSION = '1.1.0 (2026-10-31, SKILL2)';
const BOOT = 400;

function anchorsOf(table, T) {
  const out = [];
  (table.skills || []).filter(e => e.canon).forEach(e => (e.canonAt || [true]).forEach(n => {
    const P = T.skillCost(e.id, n); out.push({ id: e.id, n, key: e.id + (n === true ? '' : ' ' + n), price: L.r4(P), reason: e.canonReason || '' }); }));
  return out;
}
// carriers: vanilla cards of the pool (no effects, Attack >= 1, Health >= 3), nearest their full budget, one Common and one Uncommon / Rare
// in each of three shapes (Attack / Health 0.4 and up: a hitter; 0.2-0.4: balanced; below 0.2: a wall), so a skill that suits one body
// (Armor on a wall, Sweep on a hitter) is read on all three
const SHAPES = [[0.4, 99], [0.2, 0.4], [0, 0.2]];
function carriersOf(gm, X) {
  const pick = (rs, lo, hi, not) => X.pool.filter(id => { const d = gm.D[id]; const r = d.attack / Math.max(1, d.health); return rs.includes(d.rarity) && !Object.keys(d.effects || {}).length && d.attack >= 1 && d.health >= 3 && r >= lo && r < hi && !not.includes(id); })
    .map(id => { const b = L.budgetOf(gm.D[id], X.level); return { id, u: Math.abs(1 - b.x1 / b.N) }; }).sort((a, b) => a.u - b.u || (a.id < b.id ? -1 : 1)).map(x => x.id)[0];
  const out = []; SHAPES.forEach(([lo, hi]) => [['common'], ['uncommon', 'rare']].forEach(rs => { const id = pick(rs, lo, hi, out); if (id) out.push(id); }));
  return out;
}
function variantFor(card, eff) { // effects -> a bench variant (keywords add, triggers addTrig)
  const add = Object.assign({}, eff), trig = add.triggers; delete add.triggers; const v = { base: card };
  if (Object.keys(add).length) v.add = add; if (Array.isArray(trig) && trig.length) v.addTrig = trig; return v;
}
function bootIdx(M, B, seed) { const rng = L.O.mulberry(L.fnv('canon-boot|' + seed)), out = []; for (let b = 0; b < B; b++) { const a = new Uint32Array(M); for (let i = 0; i < M; i++) a[i] = Math.floor(rng.next() * M); out.push(a); } return out; }
const meanOf = (a, idx) => { let s = 0; if (idx) { for (let i = 0; i < idx.length; i++) s += a[idx[i]]; return s / idx.length; } for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
const q = (a, p) => { const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))]; };

async function run(o) {
  const B = new L.Bench(o), gm = B.gm, { table, T } = L.costs(), BB = gm.Budget || require(path.join(L.ROOT, 'bramblewood-budget.js'));
  try {
    const X = B.context(L.csOf(o)), M = o.games, AW = (BB.DEFAULTS && BB.DEFAULTS.attackWeight) || 2;
    const anchors = anchorsOf(table, T), carriers = o.carriers && o.carriers.length ? o.carriers : carriersOf(gm, X);
    if (o.cmd === 'anchors') { B.log(`${anchors.length} anchor points (canonical/skill-costs.json canon: true):`); anchors.forEach(a => B.log(`  ${a.key.padEnd(16)} ${String(a.price).padStart(6)}  ${a.reason}`)); B.log(`carriers (${X.name}): ${carriers.join(', ')}`); return null; }
    const test = o.cmd === 'measure' ? o.test : null;
    const items = [];
    carriers.forEach(c => { items.push({ v: { base: c } }, { v: { base: c, dH: 1 } }, { v: { base: c, dA: 1 } });
      anchors.forEach(a => items.push({ v: variantFor(c, { [a.id]: a.n }) })); if (test) items.push({ v: variantFor(c, test) }); if (o.placebo !== false) items.push({ v: variantFor(c, PLACEBO) }); });
    B.log(`canon (${X.name}, Level ${X.level}, ${X.k} copies, ${M} fights a variant): ${anchors.length} anchor points, ${carriers.length} carriers (${carriers.join(', ')}), ${items.length} variants${test ? ', test ' + JSON.stringify(test) : ''}`);
    await B.need(X, items, M);
    const gainRaw = eff => { const d = new Float64Array(M); carriers.forEach(c => { const g = L.diff(B.scores(X, variantFor(c, eff), c, M), B.scores(X, { base: c }, c, M)); for (let i = 0; i < M; i++) d[i] += g[i] / carriers.length; }); return d; };
    // the placebo (SKILL2): every reading less the placebo's gain once a key the variant adds (the CPU's cardValue counts effect keys)
    const D0 = o.placebo !== false ? gainRaw(PLACEBO) : new Float64Array(M);
    const gain = eff => { const d = gainRaw(eff), k = Object.keys(eff).length || 1; for (let i = 0; i < M; i++) d[i] -= k * D0[i]; return d; };
    const DA = anchors.map(a => gain({ [a.id]: a.n })), DT = test ? gain(test) : null;
    const dH = new Float64Array(M), dAt = new Float64Array(M); let nA = 0;
    carriers.forEach(c => { const b = B.scores(X, { base: c }, c, M), h = L.diff(B.scores(X, { base: c, dH: 1 }, c, M), b); for (let i = 0; i < M; i++) dH[i] += h[i] / carriers.length;
      const d = gm.D[c]; if (!(d.effects || {}).archer) { const a = L.diff(B.scores(X, { base: c, dA: 1 }, c, M), b); for (let i = 0; i < M; i++) dAt[i] += a[i]; nA++; } });
    for (let i = 0; i < M; i++) dAt[i] /= Math.max(1, nA);
    const P = anchors.map(a => a.price), P2 = P.reduce((t, p) => t + p * p, 0);
    // the canon rate: the median over the anchors of gain / price (robust: one anchor that suits these carriers far better or worse than
    // its price says moves it little); lsqRate is the least-squares line through 0, reported beside it
    const rateOf = (idx, skip) => { const v = []; DA.forEach((d, j) => { if (j !== skip) v.push(meanOf(d, idx) / P[j]); }); v.sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
    const lsqRate = idx => { let s = 0, p2 = 0; DA.forEach((d, j) => { s += P[j] * meanOf(d, idx); p2 += P[j] * P[j]; }); return s / p2; };
    const statRate = idx => (meanOf(dAt, idx) + meanOf(dH, idx)) / (AW + 1); // per carrier: +1 Attack (AW points) and +1 Health (1 point)
    const boots = bootIdx(M, BOOT, X.key + '|' + M);
    const est = (f) => { const m = f(null), bs = boots.map(ix => f(ix)); return { m: L.r4(m), lo: L.r4(q(bs, 0.025)), hi: L.r4(q(bs, 0.975)) }; };
    const r = est(ix => rateOf(ix)), rl = est(ix => lsqRate(ix)), rs = est(ix => statRate(ix)), kappa = est(ix => statRate(ix) / rateOf(ix)), aInH = est(ix => meanOf(dAt, ix) / meanOf(dH, ix));
    // the anchors' line: R² of the least-squares line through 0, and each anchor from the others
    const dm = DA.map(d => meanOf(d)), rr = lsqRate(null), ssr = dm.reduce((t, d, j) => t + (d - rr * P[j]) ** 2, 0), sst = dm.reduce((t, d) => t + d * d, 0);
    // worthStat (SKILL2, 2026-10-31): the anchor's gain read by the stat yardstick (3A + H points, the canon's currency since BUDGET2-2)
    const loo = anchors.map((a, j) => { const w = est(ix => meanOf(DA[j], ix) / rateOf(ix, j)), ws = est(ix => meanOf(DA[j], ix) / statRate(ix));
      return Object.assign({}, a, { gain: L.r4(dm[j]), worth: w, worthStat: ws, off: !(a.price >= w.lo && a.price <= w.hi), offStat: !(a.price >= ws.lo && a.price <= ws.hi) }); });
    const res = { tool: 'tools/skill_canon_2026_10_31.js ' + VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(),
      context: { name: X.name, level: X.level, copies: X.k, fights: M, pool: X.pool.length, fields: X.fields.length, seed: X.seed }, carriers, attackWeight: AW,
      canonRate: r, lsqRate: rl, statRate: rs, kappa, attackInHealth: aInH, line: { r2: L.r4(sst ? 1 - ssr / sst : null) }, placebo: o.placebo !== false ? { effects: PLACEBO, gain: L.r4(meanOf(D0)), worthStat: est(ix => meanOf(D0, ix) / statRate(ix)) } : null, anchors: loo,
      outside: loo.filter(a => a.off).map(a => a.key) };
    // the ruler: the anchors sorted by their gain, their prices made non-decreasing in gain (pool-adjacent-violators), and a gain read off
    // between its two neighbours (straight lines; past the ends, the median rate). "It gains what Bleed 2 gains, so it is worth what Bleed 2
    // costs": no assumption that gain is proportional to price.
    const ruler = (idx, g) => { const pts = DA.map((d, j) => ({ g: meanOf(d, idx), p: P[j], w: 1 })).sort((a, b) => a.g - b.g);
      const st = []; pts.forEach(x => { st.push({ g: x.g * x.w, p: x.p * x.w, w: x.w }); while (st.length > 1 && st[st.length - 2].p / st[st.length - 2].w > st[st.length - 1].p / st[st.length - 1].w) { const b = st.pop(), a = st.pop(); st.push({ g: a.g + b.g, p: a.p + b.p, w: a.w + b.w }); } });
      const k = st.map(x => ({ g: x.g / x.w, p: x.p / x.w })), rt = rateOf(idx);
      if (g <= k[0].g) return k[0].g > 0 ? g * k[0].p / k[0].g : g / rt; if (g >= k[k.length - 1].g) return k[k.length - 1].p + (g - k[k.length - 1].g) / rt;
      for (let j = 1; j < k.length; j++) if (g <= k[j].g) return k[j - 1].p + (k[j].p - k[j - 1].p) * (g - k[j - 1].g) / Math.max(1e-9, k[j].g - k[j - 1].g); return g / rt; };
    if (test) {
      const W = est(ix => meanOf(DT, ix) / rateOf(ix)), Ws = est(ix => meanOf(DT, ix) / statRate(ix)), Wr = est(ix => ruler(ix, meanOf(DT, ix)));
      const price = carriers.map(c => { const w = L.budgetOf(L.printedDef(gm, variantFor(c, test)), X.level), p = L.budgetOf(L.printedDef(gm, { base: c }), X.level); return w.x1 - p.x1; });
      const pr = L.r4(price.reduce((t, x) => t + x, 0) / price.length);
      const below = loo.filter(a => a.price <= W.m).sort((a, b) => b.price - a.price)[0], above = loo.filter(a => a.price > W.m).sort((a, b) => a.price - b.price)[0];
      res.test = { effects: test, gain: L.r4(meanOf(DT)), worth: W, worthRuler: Wr, worthStat: Ws, price: pr, net: L.r4(Wr.m - pr) /* the ruler's */, verdict: pr < Wr.lo ? 'under-priced' : pr > Wr.hi ? 'over-priced' : 'within its interval', between: [below ? below.key + ' (' + below.price + ')' : '-', above ? above.key + ' (' + above.price + ')' : '-'] };
    }
    print(res, B.log);
    if (o.save) { fs.mkdirSync(o.out, { recursive: true }); const f = path.join(o.out, `skill-canon-${o.name || (test ? Object.keys(test)[0] : 'check')}-${o.tag}.json`);
      fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n'); fs.writeFileSync(f.replace(/\.json$/, '.md'), md(res)); B.log('-> ' + path.relative(L.ROOT, f) + ' (+ .md)'); }
    return res;
  } finally { B.close(); }
}
const ci = e => `${e.m} [${e.lo}, ${e.hi}]`;
function print(res, log) {
  log(`canon rate: one canon point = ${ci({ m: L.r4(res.canonRate.m * 100), lo: L.r4(res.canonRate.lo * 100), hi: L.r4(res.canonRate.hi * 100) })} win-rate points; stat yardstick (${res.attackWeight}A + H): one budget point = ${L.r4(res.statRate.m * 100)} [${L.r4(res.statRate.lo * 100)}, ${L.r4(res.statRate.hi * 100)}]`);
  log(`currency ratio κ = stat point / canon point = ${ci(res.kappa)} (1 = the anchors and the stats agree); +1 Attack = ${ci(res.attackInHealth)} Health measured; least-squares rate ${L.r4(res.lsqRate.m * 100)}, R² ${res.line.r2}`);
  if (res.placebo) log(`placebo ${JSON.stringify(res.placebo.effects)}: gain ${(res.placebo.gain * 100).toFixed(1)} win-rate points (${ci(res.placebo.worthStat)} stat points); every gain below is less it, once a key`);
  log('anchor           price   gain    worth from the others (95%)        by the stat yardstick (95%)');
  res.anchors.forEach(a => log(`${a.key.padEnd(16)} ${String(a.price).padStart(5)}  ${(a.gain * 100).toFixed(1).padStart(5)}   ${ci(a.worth).padEnd(30)}${a.off ? ' <- outside' : '           '}  ${a.worthStat ? ci(a.worthStat) : ''}`));
  if (res.test) { const t = res.test; log(`test ${JSON.stringify(t.effects)}: gain ${(t.gain * 100).toFixed(1)}; worth ${ci(t.worth)} canon points (the ruler ${ci(t.worthRuler)}; ${ci(t.worthStat)} by the stat yardstick); price on its carriers ${t.price}; net ${t.net}: ${t.verdict}; between ${t.between.join(' and ')}`); }
}
function md(res) {
  const t = res.test, lines = [`# Skill canon measure (${res.context.name}, ${res.generated.slice(0, 10)})`, '',
    `\`${res.tool}\`; game fingerprint \`${res.fingerprint}\`; ${res.context.fights} paired fights a variant, slot of ${res.context.copies} copies, Level ${res.context.level}; carriers ${res.carriers.join(', ')}.`, '',
    `- One canon point = ${ci(res.canonRate)} win rate (fraction; the median of the anchors' gain / price; least squares ${ci(res.lsqRate)}, R² ${res.line.r2}); one budget point of stats (${res.attackWeight}A + H) = ${ci(res.statRate)}; κ = ${ci(res.kappa)}; +1 Attack = ${ci(res.attackInHealth)} Health measured.`];
  if (res.placebo) lines.push(`- Placebo \`${JSON.stringify(res.placebo.effects)}\` (a key the engine does not know; the CPU's cardValue counts keys): gain ${(res.placebo.gain * 100).toFixed(1)} win-rate points, ${ci(res.placebo.worthStat)} stat points; every gain here is less it, once a key the variant adds.`);
  if (t) lines.push(`- **Test** \`${JSON.stringify(t.effects)}\`: worth **${ci(t.worth)}** canon points by the median rate, ${ci(t.worthRuler)} by the ruler (${ci(t.worthStat)} by the stat yardstick); price on its carriers ${t.price}; ${t.verdict}; between ${t.between.join(' and ')}.`);
  lines.push('', '| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |', '|---|---|---|---|---|---|', ...res.anchors.map(a => `| ${a.key} | ${a.price} | ${(a.gain * 100).toFixed(1)} | ${ci(a.worth)} | ${a.off ? 'outside' : ''} | ${a.worthStat ? ci(a.worthStat) : ''} |`), '');
  return lines.join('\n');
}
async function main(argv) {
  const o = L.defaults(), a = argv.slice(); o.cmd = a.shift() || 'help'; o.games = 200;
  if (o.cmd === 'help' || o.cmd === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 30).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  while (a.length) {
    if (L.parseCommon(a, o)) continue;
    const k = a.shift();
    if (k === '--carriers') o.carriers = a.shift().split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--skill') { const [id, n] = a.shift().split('='); o.test = { [id]: n == null ? true : (isNaN(+n) ? n : +n) }; }
    else if (k === '--name') o.name = a.shift(); else if (k === '--save') o.save = true; else if (k === '--no-placebo') o.placebo = false;
    else if (!k.startsWith('--') && o.cmd === 'measure' && !o.test) o.test = JSON.parse(k);
    else throw new Error('unknown option ' + k);
  }
  if (o.cmd === 'measure' && !o.test) throw new Error('measure: give the skill as effects JSON or --skill id[=N]');
  if (!['anchors', 'measure', 'check'].includes(o.cmd)) throw new Error('unknown command ' + o.cmd + ' (anchors, measure, check, help)');
  return run(o);
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { main, run, anchorsOf, carriersOf };
