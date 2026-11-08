#!/usr/bin/env node
// 2026-11-08 (package BAL31, owner 17:22: "Our goal is to produce a simple skill budget for each skill - no pairwise skill budgeting - too
// complex. But, I guess let's see. You can design cards with N>30, as close as possible but >30, with any combination of 2 skills. Then do
// this test, for each combination."): the additivity test. Is a skill pair worth the sum of its two skills?
//
//   node tools/bal31/additivity_2026_11_08.js plan                 the skills, the pairs, the phases and the time (no games)
//   node tools/bal31/additivity_2026_11_08.js run [--hours 1.5]    play them, phase by phase (resumable from the cache)
//   node tools/bal31/additivity_2026_11_08.js summary              -> docs/balance/bal31/additivity-2026-11-08.{json,md}
// Options: --games 800, --level 9, --workers 2, --cache-dir (default ~/.cache/bramble-bal31: its own), --rounds 3 (matching rounds in
// phase 2; phase 4 adds rounds up to --rounds-max 8), --top 20 (phase 3: every pair among the 20 commonest Map 0-20 skills), --phase P (run
// only up to phase P), --bodies 1,9 (the Attack of each body), --boot 200.
//
// The method (the skill ladder's, tools/skill_ladder_2026_11_07.js, at one level):
//   - the level: the first whose War Hound budget N(L) (bramblewood-budget.js) is over 30 (Level 9: N = 30.16; bodies 3A + H = 30);
//   - two bodies: Attack 1 and the most (1/27, 9/3), so a skill that wants Health and one that wants Attack both find their body (the
//     ladder's best bodies sit at the two ends). The middle body (5/15, --bodies 1,5,9) was cut on 2026-11-08 for time: the 2 cores are
//     shared with other packages' tests (about 27 games/s at Level 9), and 800 fights on two bodies beat 400 on three for the ±1 test;
//   - the skills: the ladder's 113 (every skill on a Map 0-20 card the cost table prices, numbered or on/off), each at its commonest number
//     on those cards (put on its ladder: 1 .. 4; Shield 2 / 4 / 6);
//   - the pairs: phase 2, rounds of a random matching (seeded) that pairs each skill with a new partner of another kind where it can
//     (on-hit rider / defence / attack / other, canonical/skill-delivery.json), so every skill sits in `rounds` pairs; phase 3, every pair
//     among the `top` commonest skills; phase 4, more matching rounds;
//   - every body plays base, placebo, +1 Attack, +1 Health, each single and each pair on the same 800 fights (common random numbers);
//   - interaction on a body = worth(A+B) - worth(A) - worth(B) = (score AB - score A - score B + score base) / rate (the placebo cancels);
//     reported as the mean over the bodies (95% bootstrap over fights, the same fights for every body); the price gap = the most the
//     pair is worth on a body - the most A is worth - the most B is worth (each on its own best body: what a per-skill price adds);
//   - rate: the stat yardstick on the three bodies at this level (no anchors file at Level 9), held fixed; the ladder's L1 / L5 rates beside it.
// Nothing is written to canonical/: prices stay the owner's call.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const C = require('./common.js'), ROOT = C.ROOT, OUT = path.join(ROOT, 'docs', 'balance', 'bal31');
const VERSION = '1.0.0 (2026-11-08, BAL31)', SPEED = 60;

// ---------------------------------------------------------------- the plan
function skillsOf() {
  const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), p = C.LAD.planOf({ pairs: 0 });
  const cards = new Map(J('canonical/cards.json').map(c => [c.id, c])), pools = J('canonical/map-pools.json').maps, G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G;
  const del = J('canonical/skill-delivery.json'), ids = new Set();
  Object.entries(pools).forEach(([m, v]) => { const no = G.mapNumberOf(m); if (no != null && no <= 20) (v.cards || []).forEach(id => ids.add(id)); });
  const keys = [...new Set(p.items.map(x => x.key))], count = {}, at = {};
  ids.forEach(id => { const c = cards.get(id); if (!c) return; Object.entries(c.effects || {}).forEach(([k, v]) => { if (!p.ladders[k]) return; count[k] = (count[k] || 0) + 1;
    const n = C.LAD.onLadder(k, v, p.ladders[k]); (at[k] = at[k] || {})[n] = (at[k][n] || 0) + 1; }); });
  const kind = k => del.rides && del.rides[k] ? 'onhit' : del.against && del.against[k] ? 'defence' : del.delivery && (del.delivery[k] === 'melee' || del.delivery[k] === 'ranged') ? 'attack' : 'other';
  return keys.map(k => { const ns = p.ladders[k]; let n = ns[0];
    if (ns[0] !== true && at[k]) n = +Object.entries(at[k]).sort((x, y) => y[1] - x[1] || (+x[0] - +y[0]))[0][0];
    return { key: k, n, cards: count[k] || 0, kind: kind(k) }; }).sort((a, b) => b.cards - a.cards || (a.key < b.key ? -1 : 1));
}
// matching rounds: each round pairs every skill once (one skill twice when the count is odd), a new partner, another kind where it can
function matchings(S, rounds) {
  const r = C.mulberry(C.fnv('bal31-pairs')), used = new Set(), out = [], pk = (a, b) => a < b ? a + '+' + b : b + '+' + a;
  for (let t = 0; t < rounds; t++) {
    const order = S.map(s => s.key); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const kind = new Map(S.map(s => [s.key, s.kind])), left = new Set(order), round = [];
    for (const a of order) { if (!left.has(a)) continue; left.delete(a);
      let b = [...left].find(x => !used.has(pk(a, x)) && kind.get(x) !== kind.get(a)) || [...left].find(x => !used.has(pk(a, x)));
      if (!b) b = order.find(x => x !== a && !used.has(pk(a, x))); // the odd one out: a partner already paired this round
      if (!b) continue; left.delete(b); used.add(pk(a, b)); round.push(pk(a, b)); }
    out.push(round);
  }
  return out;
}
function planOf(o) {
  const S = skillsOf(), by = new Map(S.map(s => [s.key, s])), R = matchings(S, Math.max(o.rounds, o.roundsMax));
  const top = S.slice(0, o.top).map(s => s.key), topPairs = []; for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) topPairs.push(top[i] < top[j] ? top[i] + '+' + top[j] : top[j] + '+' + top[i]);
  const phases = [{ id: 1, name: 'bodies and singles', pairs: [] }, { id: 2, name: `matching rounds 1-${o.rounds}`, pairs: [].concat(...R.slice(0, o.rounds)) },
    { id: 3, name: `every pair among the ${o.top} commonest skills`, pairs: topPairs }, { id: 4, name: `matching rounds ${o.rounds + 1}-${o.roundsMax}`, pairs: [].concat(...R.slice(o.rounds, o.roundsMax)) }];
  const seen = new Set(); phases.forEach(ph => { ph.pairs = ph.pairs.filter(k => !seen.has(k) && seen.add(k)); });
  const pairOf = k => { const [a, b] = k.split('+'); return { key: k, a: by.get(a), b: by.get(b) }; };
  return { S, by, phases: phases.map(ph => Object.assign(ph, { pairs: ph.pairs.map(pairOf) })), top };
}
// 2026-11-08: two placebo keys (neither a skill the engine knows): the CPU values a card by its number of effect keys, so the pair carries
// two of them; this checks that two placebos cost twice one (the interaction's placebo cancel assumes it)
const PLACEBO2 = { skill2Placebo: true, skill3Placebo: true };
const effOf = s => ({ [s.key]: s.n });
const effPair = p => ({ [p.a.key]: p.a.n, [p.b.key]: p.b.n });
const nStr = n => n === true ? 'on' : String(n);

// ---------------------------------------------------------------- run
function opts(argv) {
  const a = argv.slice(), i = a.indexOf('--rounds-max'); let rm = 8; if (i >= 0) { rm = +a[i + 1]; a.splice(i, 2); }
  const o = C.parse(a, { games: 800, levels: [9], cacheDir: path.join(os.homedir(), '.cache', 'bramble-bal31'), boot: 200, rounds: 3, top: 20, phase: 4 });
  o.roundsMax = rm; if (o.level) o.levels = [o.level]; return o;
}
function bodiesFor(K, Lv, o) { const Bud = K.lv[Lv].Bud, top = Math.floor((Bud - 1) / 3), As = o.bodyAs || [1, top]; return As.map(A => ({ A, H: Bud - 3 * A, x: 3 * A / Bud })); }
async function main(argv) {
  const o = opts(argv), M = o.games, Lv = o.levels[0];
  if (o.cmd === 'help' || o.cmd === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 32).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const P = planOf(o);
  const K = C.bench(Object.assign({}, o, o.cmd === 'plan' ? { workers: 0 } : {}));
  try {
    const bs = bodiesFor(K, Lv, o);
    if (o.cmd === 'plan') {
      console.log(`Level ${Lv}: War Hound N(L) = ${K.lv[Lv].N.toFixed(2)}, bodies 3A + H = ${K.lv[Lv].Bud}: ${bs.map(b => b.A + '/' + b.H).join(' ')}; ${P.S.length} skills; ${M} fights a variant`);
      const kinds = {}; P.S.forEach(s => { kinds[s.kind] = (kinds[s.kind] || 0) + 1; }); console.log('kinds: ' + JSON.stringify(kinds));
      console.log('skills (N, cards): ' + P.S.map(s => `${s.key} ${nStr(s.n)} (${s.cards})`).join('; '));
      let tot = 0; P.phases.forEach(ph => { const v = ph.id === 1 ? bs.length * (4 + P.S.length) : ph.pairs.length * bs.length; tot += v * M;
        const deg = {}; ph.pairs.forEach(p => { deg[p.a.key] = (deg[p.a.key] || 0) + 1; deg[p.b.key] = (deg[p.b.key] || 0) + 1; });
        console.log(`phase ${ph.id} (${ph.name}): ${ph.id === 1 ? '' : ph.pairs.length + ' pairs, '}${v} variants x ${M} = ${v * M} games, about ${(v * M / SPEED / 3600).toFixed(1)} h; running total ${(tot / SPEED / 3600).toFixed(1)} h`); });
      console.log(`(${SPEED} games/s assumed with 2 workers at Level ${Lv}; cache ${o.cacheDir})`);
      return;
    }
    if (o.cmd === 'run') {
      const t0 = Date.now(), late = () => o.hours && (Date.now() - t0) / 3600000 >= o.hours;
      K.B.log(`BAL31 additivity ${VERSION}: Level ${Lv}, bodies ${bs.map(b => b.A + '/' + b.H).join(' ')}, ${M} fights; cache ${o.cacheDir}${o.hours ? '; stops starting new work after ' + o.hours + ' h' : ''}`);
      for (const ph of P.phases) { if (ph.id > o.phase) break;
        const groups = ph.id === 1 ? [{ name: 'bodies', its: C.statVariants(K, Lv, bs).concat(bs.map(b => ({ v: K.variant(Lv, b, PLACEBO2) }))) }].concat(P.S.map(s => ({ name: s.key + ' ' + nStr(s.n), its: bs.map(b => ({ v: K.variant(Lv, b, effOf(s)) })) })))
          : ph.pairs.map(p => ({ name: p.a.key + ' ' + nStr(p.a.n) + ' + ' + p.b.key + ' ' + nStr(p.b.n), its: bs.map(b => ({ v: K.variant(Lv, b, effPair(p)) })) }));
        // a group of 10 per need() call: fewer saves, and the time check between groups
        for (let g = 0; g < groups.length; g += 10) { if (late()) { K.B.log(`time is up (${o.hours} h): stopped in phase ${ph.id} at ${g}/${groups.length}; re-run the same command to go on`); return; }
          const part = groups.slice(g, g + 10), n = await K.B.need(K.lv[Lv].X, [].concat(...part.map(x => x.its)), M);
          if (n) K.B.log(`[phase ${ph.id} ${Math.min(g + 10, groups.length)}/${groups.length}, ${Math.round((Date.now() - t0) / 60000)} min] ${part[0].name} .. ${part[part.length - 1].name}: ${n} games`); }
        K.B.log(`phase ${ph.id} (${ph.name}) complete, ${Math.round((Date.now() - t0) / 60000)} min`);
      }
      K.B.log(`done; now: node tools/bal31/additivity_2026_11_08.js summary`);
    } else if (o.cmd === 'summary') summary(o, K, P, bs, M, Lv);
    else throw new Error('unknown command ' + o.cmd);
  } finally { K.B.close(); }
}

// ---------------------------------------------------------------- summary
function summary(o, K, P, bs, M, Lv) {
  const { T } = K.L.costs(), rate = C.statRate(K, Lv, M, bs); if (!rate) throw new Error('the bodies are not played yet (phase 1)');
  const boots = C.bootIdx(M, o.boot, 'add|' + M), sc = v => K.scores(Lv, v, M), base = bs.map(b => sc(K.variant(Lv, b))), plc = bs.map(b => sc(K.variant(Lv, b, C.PLACEBO)));
  const wr = a => C.meanIx(a);
  // singles: per body the gain a fight (less the placebo), worth = mean / rate
  const single = new Map(); P.S.forEach(s => { if (!bs.every(b => K.have(Lv, K.variant(Lv, b, effOf(s)), M))) return;
    const g = bs.map((b, j) => { const s1 = sc(K.variant(Lv, b, effOf(s))), out = new Float64Array(M); for (let i = 0; i < M; i++) out[i] = s1[i] - base[j][i] - (plc[j][i] - base[j][i]); return { s1, g: out }; });
    single.set(s.key, g); });
  const pairs = [];
  P.phases.forEach(ph => ph.pairs.forEach(p => {
    const ga = single.get(p.a.key), gb = single.get(p.b.key); if (!ga || !gb || !bs.every(b => K.have(Lv, K.variant(Lv, b, effPair(p)), M))) return;
    const d = bs.map((b, j) => { const sp = sc(K.variant(Lv, b, effPair(p))), x = new Float64Array(M), gp = new Float64Array(M);
      for (let i = 0; i < M; i++) { x[i] = sp[i] - ga[j].s1[i] - gb[j].s1[i] + base[j][i]; gp[i] = sp[i] - base[j][i] - 2 * (plc[j][i] - base[j][i]); } return { x, gp, wr1: wr(sp) }; });
    const at = ix => { const I = d.map(z => C.meanIx(z.x, ix) / rate), wp = d.map(z => C.meanIx(z.gp, ix) / rate), wa = ga.map(z => C.meanIx(z.g, ix) / rate), wb = gb.map(z => C.meanIx(z.g, ix) / rate);
      return { I: I.reduce((s, v) => s + v, 0) / I.length, Ib: I, wp, wa, wb, gap: Math.max(...wp) - Math.max(...wa) - Math.max(...wb) }; };
    const m = at(null), bt = boots.map(ix => at(ix)), ci = f => ({ m: C.r2(f(m)), lo: C.r2(C.q(bt.map(f), 0.025)), hi: C.r2(C.q(bt.map(f), 0.975)) });
    const I = ci(x => x.I), gap = ci(x => x.gap), sd = Math.sqrt(bt.reduce((s, x) => s + (x.I - m.I) ** 2, 0) / (bt.length - 1));
    pairs.push({ key: p.key, phase: ph.id, a: { key: p.a.key, n: p.a.n }, b: { key: p.b.key, n: p.b.n }, I, se: C.r2(sd), gap, perBody: m.Ib.map(C.r2),
      pair: m.wp.map(C.r2), aW: m.wa.map(C.r2), bW: m.wb.map(C.r2), within1: Math.abs(m.I) <= 1, ciHas0: I.lo <= 0 && I.hi >= 0, gapWithin1: Math.abs(m.gap) <= 1,
      flag85: d.some((z, j) => z.wr1 > C.FLAG_WR || wr(base[j]) > C.FLAG_WR) });
  }));
  const skills = P.S.map(s => { const g = single.get(s.key), mine = pairs.filter(p => p.a.key === s.key || p.b.key === s.key);
    const w = g ? g.map(z => C.meanIx(z.g) / rate) : null, abs = mine.map(p => Math.abs(p.I.m)), sgn = mine.map(p => p.I.m), gaps = mine.map(p => p.gap.m);
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
    return { key: s.key, n: s.n, cards: s.cards, kind: s.kind, price: C.r2(T.skillCost(s.key, s.n)), worth: w && w.map(C.r2), best: w && C.r2(Math.max(...w)), pairs: mine.length,
      meanAbsI: C.r2(avg(abs)), meanI: C.r2(avg(sgn)), meanGap: C.r2(avg(gaps)), within1: mine.length ? C.r2(mine.filter(p => p.within1).length / mine.length) : null,
      ciHas0: mine.length ? C.r2(mine.filter(p => p.ciHas0).length / mine.length) : null, worst: mine.slice().sort((x, y) => Math.abs(y.I.m) - Math.abs(x.I.m)).slice(0, 2).map(p => (p.a.key === s.key ? p.b.key : p.a.key) + ' ' + (p.I.m > 0 ? '+' : '') + p.I.m) }; });
  const n = pairs.length, share = f => n ? C.r2(pairs.filter(f).length / n) : null, mean = f => n ? C.r2(pairs.reduce((s, p) => s + f(p), 0) / n) : null;
  const noise = n ? C.r2(pairs.reduce((s, p) => s + p.se, 0) / n * Math.sqrt(2 / Math.PI)) : null;
  const L1 = C.ladderRate(1), L5 = C.ladderRate(5);
  // the spread of the true interactions: observed variance less the mean sampling variance; the share within ±1 of the mean interaction
  const mI = n ? pairs.reduce((s, p) => s + p.I.m, 0) / n : 0, vI = n > 1 ? pairs.reduce((s, p) => s + (p.I.m - mI) ** 2, 0) / (n - 1) : null, vS = n ? pairs.reduce((s, p) => s + p.se * p.se, 0) / n : null;
  // does the interaction grow with the pair's size? the slope of I on worth(A) + worth(B) (the mean over bodies)
  const xs = pairs.map(p => (p.aW.reduce((s, v) => s + v, 0) + p.bW.reduce((s, v) => s + v, 0)) / p.aW.length), mx = n ? xs.reduce((s, v) => s + v, 0) / n : 0;
  let sxy = 0, sxx = 0, syy = 0; pairs.forEach((p, i) => { sxy += (xs[i] - mx) * (p.I.m - mI); sxx += (xs[i] - mx) ** 2; syy += (p.I.m - mI) ** 2; });
  // two placebos against one: (score PP - 2 score P + score base) / rate, the mean over bodies (null until phase 1 played it)
  let plc2 = null; if (bs.every(b => K.have(Lv, K.variant(Lv, b, PLACEBO2), M))) { const pp = bs.map(b => sc(K.variant(Lv, b, PLACEBO2)));
    const f = ix => bs.reduce((s, b, j) => { let t = 0; const N = ix ? ix.length : M; for (let k = 0; k < N; k++) { const i = ix ? ix[k] : k; t += pp[j][i] - 2 * plc[j][i] + base[j][i]; } return s + t / N / rate; }, 0) / bs.length;
    const bt = boots.map(f); plc2 = { m: C.r2(f(null)), lo: C.r2(C.q(bt, 0.025)), hi: C.r2(C.q(bt, 0.975)) }; }
  const out = { tool: 'tools/bal31/additivity_2026_11_08.js ' + VERSION, generated: new Date().toISOString(), fingerprint: K.L.fingerprint(), games: M, level: Lv, N: C.r2(K.lv[Lv].N), budget: K.lv[Lv].Bud,
    bodies: bs.map(b => b.A + '/' + b.H), rate: C.r2(rate * 100), rateFrom: 'the stat yardstick on the bodies at Level ' + Lv, ladderRates: { L1: L1 && C.r2(L1.r * 100), L5: L5 && C.r2(L5.r * 100) },
    totals: { pairs: n, skillsCovered: skills.filter(s => s.pairs > 0).length, skills: skills.length, minPairs: Math.min(...skills.filter(s => single.has(s.key)).map(s => s.pairs)),
      within1: share(p => p.within1), ciHas0: share(p => p.ciHas0), meanAbsI: mean(p => Math.abs(p.I.m)), meanI: mean(p => p.I.m), noiseFloor: noise,
      gapWithin1: share(p => p.gapWithin1), meanAbsGap: mean(p => Math.abs(p.gap.m)), meanGap: mean(p => p.gap.m), within2: share(p => Math.abs(p.I.m) <= 2), flag85: pairs.filter(p => p.flag85).length,
      bigPos: pairs.filter(p => p.I.lo > 1).length, bigNeg: pairs.filter(p => p.I.hi < -1).length,
      sdObserved: vI == null ? null : C.r2(Math.sqrt(vI)), sdNoise: vS == null ? null : C.r2(Math.sqrt(vS)), sdTrue: vI == null ? null : C.r2(Math.sqrt(Math.max(0, vI - vS))),
      centredWithin1: share(p => Math.abs(p.I.m - mI) <= 1), slopeOnSize: sxx ? C.r2(sxy / sxx) : null, corrOnSize: sxx && syy ? C.r2(sxy / Math.sqrt(sxx * syy)) : null,
      bodyClash: share(p => p.aW.indexOf(Math.max(...p.aW)) !== p.bW.indexOf(Math.max(...p.bW))), placebo2: plc2 },
    baseWinRate: bs.map((b, j) => C.r2(wr(base[j]))),
    phases: P.phases.map(ph => ({ id: ph.id, name: ph.name, planned: ph.pairs.length, measured: pairs.filter(p => p.phase === ph.id).length })), skills, pairs };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'additivity-2026-11-08.json'), JSON.stringify(out, null, 1) + '\n');
  fs.writeFileSync(path.join(OUT, 'additivity-2026-11-08.md'), md(out)); console.log(md(out)); console.log('-> docs/balance/bal31/additivity-2026-11-08.{json,md}');
}
const ci = e => e ? `${e.m > 0 ? '+' : ''}${e.m} [${e.lo}, ${e.hi}]` : '-';
const pct = v => v == null ? '-' : Math.round(v * 100) + '%';
function md(out) {
  const t = out.totals, L = [];
  L.push(`# Skill additivity, ${out.generated.slice(0, 10)} (package BAL31)`, '',
    `Is a pair of skills worth the sum of the two? ${t.pairs} pairs covering ${t.skillsCovered} of ${t.skills} skills (each in at least ${t.minPairs} pairs), Level ${out.level} (N(L) ${out.N}, bodies 3A + H = ${out.budget}: ${out.bodies.join(', ')}), ${out.games} paired fights a variant. Worth in 3A + H points (rate ${out.rate} win-rate points a point, ${out.rateFrom}; the ladder's L1 ${out.ladderRates.L1}, L5 ${out.ladderRates.L5}). Interaction = worth(A+B) - worth(A) - worth(B), the mean over the bodies. Measurement only: no price changed.`, '',
    ...(fs.existsSync(path.join(__dirname, 'notes', 'additivity.md')) ? [fs.readFileSync(path.join(__dirname, 'notes', 'additivity.md'), 'utf8').trim(), ''] : []),
    '## Headline', '',
    `| Measure | Value |`, `|---|---|`,
    `| Pairs within ±1 point of additive | ${pct(t.within1)} (within ±2: ${pct(t.within2)}) |`,
    `| Pairs whose 95% interval holds 0 | ${pct(t.ciHas0)} |`,
    `| Mean interaction (signed) | ${t.meanI} |`,
    `| Mean abs interaction / noise floor (what pure noise would give) | ${t.meanAbsI} / ${t.noiseFloor} |`,
    `| Pairs clearly synergistic (95% low end > +1) / clearly clashing (high end < -1) | ${t.bigPos} / ${t.bigNeg} |`,
    `| Spread of interactions: observed SD / sampling noise SD / true SD (observed less noise) | ${t.sdObserved} / ${t.sdNoise} / ${t.sdTrue} |`,
    `| Pairs within ±1 of the mean interaction (a flat per-extra-skill term taken out) | ${pct(t.centredWithin1)} |`,
    `| Interaction against the pair's size (worth A + worth B): slope / correlation | ${t.slopeOnSize} / ${t.corrOnSize} |`,
    `| Two placebo keys against twice one (the CPU's key count; 0 = the cancel holds) | ${ci(t.placebo2)} |`,
    `| Price gap (best body of the pair - best body of A - best body of B): within ±1 / mean / mean abs | ${pct(t.gapWithin1)} / ${t.meanGap} / ${t.meanAbsGap} |`,
    `| Pairs whose two skills want different bodies (Attack 1 vs most) | ${pct(t.bodyClash)} |`, '',
    `Base win rate on the bodies: ${out.bodies.map((b, j) => b + ' ' + Math.round(out.baseWinRate[j] * 100) + '%').join(', ')}.`, '');
  L.push(`Phases: ${out.phases.map(p => `${p.id} ${p.name} ${p.measured}/${p.planned}`).join('; ')}.`, '');
  const worst = out.pairs.slice().sort((a, b) => Math.abs(b.I.m) - Math.abs(a.I.m)).slice(0, 20);
  L.push('## Worst-interacting pairs', '', '| Pair | Interaction (95%) | A + B -> pair, best body | Per body (Attack 1 / most) | Price gap |', '|---|---|---|---|---|');
  worst.forEach(p => L.push(`| ${p.a.key} ${nStr(p.a.n)} + ${p.b.key} ${nStr(p.b.n)} | ${ci(p.I)}${p.flag85 ? ' ^' : ''} | ${C.r2(Math.max(...p.aW))} + ${C.r2(Math.max(...p.bW))} -> ${C.r2(Math.max(...p.pair))} | ${p.perBody.join(' / ')} | ${ci(p.gap)} |`));
  L.push('', '## Per skill: price stability', '', 'Worth = the most the single is worth on the bodies (Level ' + out.level + '). Mean |I| = the mean absolute interaction over its pairs; within ±1 = the share of its pairs within ±1 point; worst = its two largest interactions.', '',
    '| Skill | N | Kind | Price | Worth (best body) | Pairs | Mean I | Mean abs I | Within ±1 | Worst partners |', '|---|---|---|---|---|---|---|---|---|---|');
  out.skills.slice().sort((a, b) => (b.meanAbsI || 0) - (a.meanAbsI || 0)).forEach(s => L.push(`| ${s.key} (${s.cards}) | ${nStr(s.n)} | ${s.kind} | ${s.price} | ${s.best == null ? '-' : s.best} | ${s.pairs} | ${s.meanI == null ? '-' : s.meanI} | ${s.meanAbsI == null ? '-' : s.meanAbsI} | ${pct(s.within1)} | ${s.worst.join(', ')} |`));
  L.push('', '^ = a body over 85% win rate (the cap squeezes the pair). Every pair is in the json (per body, the singles, the gap).', '');
  return L.join('\n') + '\n';
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { skillsOf, matchings, planOf, VERSION };
