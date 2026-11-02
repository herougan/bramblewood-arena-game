#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner BAL11-4 a: "measure the Lumber makers on their home maps and price them by the list's mean cost"): the
// worth of the Lumber-making skills in contexts whose card pools cost more or less Lumber on average, read by the stat yardstick (a 3A + H
// point: the canon's currency since SKILL2), so the price can follow the mean Lumber cost of a maker's home lists.
//   node tools/bal12/lumber_home_2026_11_02.js [--maps mb,mz,m7,mj] [--games 300] [--carriers-n 3] [--bramble 15] [--workers 2]
//     -> docs/balance/bal12/lumber-home-2026-11-02.json (+ .md)
// The method (the canon tool's, tools/skill_canon_2026_10_31.js, without its anchors): the canon's six vanilla carriers of the global context
// (the same bodies in every context, so only the context differs); per carrier as printed, + 1 Health, + 1 Attack, + the placebo and + each
// Lumber skill, on the same fights (the bench's paired swap: tools/bench/lib.js, 6 copies, both brambles at --bramble, the Smart CPU, the
// context's fields and level). Worth = (the skill's gain - the placebo's) / the stat yardstick's gain a point ((dH + dA) / 4: +1 Attack is 3
// points, +1 Health 1). 95% intervals: a bootstrap over fights. Each context's pool mean Lumber cost is the mean `cost` of its pool's cards
// (deck draws are uniform over the pool's cards, so this is what a random deck pays on average).
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../bench/lib.js'), CANON = require('../skill_canon_2026_10_31.js');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const MAPS = String(opt('maps', 'mb,mz,m7,mj')).split(',').filter(Boolean), M = +opt('games', 300), BR = +opt('bramble', 15), WK = +opt('workers', 2);
const OUT = path.join(L.ROOT, 'docs', 'balance', 'bal12');
const PLACEBO = { skill2Placebo: true };
// the Lumber-making skills measured (2026-11-02 run kept lean, the owner waiting; the machine shared): On Ready +1 Lumber (the keyword, 11 cards)
// and the Dune Packrat's trigger On Ready gain 3; --carriers-n 3 (default) plays the canon's three Common carriers (hitter, balanced, wall)
const SKILLS = {
  'onReadyGold=1': { onReadyGold: 1 },
  'T:onReady>gain 3': { triggers: [{ on: 'onReady', do: 'gain', resource: 'lumber', amount: 3 }] },
};
const vOf = (c, eff) => { const add = Object.assign({}, eff), trig = add.triggers; delete add.triggers; const v = { base: c }; if (Object.keys(add).length) v.add = add; if (trig) v.addTrig = trig; return v; };
const meanOf = (a, idx) => { let s = 0; if (idx) { for (let i = 0; i < idx.length; i++) s += a[idx[i]]; return s / idx.length; } for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
const q = (a, p) => { const v = a.slice().sort((x, y) => x - y); return v[Math.round(p * (v.length - 1))]; };
function boots(n, B, seed) { const r = L.O.mulberry(L.fnv('bal12-lumber|' + seed)), out = []; for (let b = 0; b < B; b++) { const a = new Uint32Array(n); for (let i = 0; i < n; i++) a[i] = Math.floor(r.next() * n); out.push(a); } return out; }

async function main() {
  const o = Object.assign(L.defaults(), { games: M, workers: WK, cacheDir: path.join(L.ROOT, 'tests', 'out', 'skill2-cache'), bramble: BR });
  const B = new L.Bench(o), gm = B.gm, res = { tool: 'tools/bal12/lumber_home_2026_11_02.js', generated: new Date().toISOString(), fingerprint: L.fingerprint(), bramble: BR, fights: M, contexts: {} };
  try {
    const G0 = B.context(L.csOf(Object.assign({}, o, { map: null }))), all = CANON.carriersOf(gm, G0), NC = +opt('carriers-n', 3), carriers = NC >= all.length ? all : all.filter((c, i) => i % 2 === 0).slice(0, NC);
    res.carriers = carriers;
    for (const ctx of ['global'].concat(MAPS)) {
      const X = ctx === 'global' ? G0 : B.context(L.csOf(Object.assign({}, o, { map: ctx })));
      const costs = X.pool.map(id => +(gm.D[id] && gm.D[id].cost) || 0), meanCost = L.r4(costs.reduce((a, b) => a + b, 0) / Math.max(1, costs.length));
      const items = []; carriers.forEach(c => { items.push({ v: { base: c } }, { v: { base: c, dH: 1 } }, { v: { base: c, dA: 1 } }, { v: vOf(c, PLACEBO) }); Object.values(SKILLS).forEach(e => items.push({ v: vOf(c, e) })); });
      console.log(`${X.name}: pool ${X.pool.length} cards, mean Lumber cost ${meanCost}, level ${X.level}, ${items.length} variants x ${M}`);
      await B.need(X, items, M);
      const gain = eff => { const d = new Float64Array(M); carriers.forEach(c => { const g = L.diff(B.scores(X, vOf(c, eff), c, M), B.scores(X, { base: c }, c, M)); for (let i = 0; i < M; i++) d[i] += g[i] / carriers.length; }); return d; };
      const D0 = gain(PLACEBO), dH = new Float64Array(M), dA = new Float64Array(M);
      carriers.forEach(c => { const b = B.scores(X, { base: c }, c, M), h = L.diff(B.scores(X, { base: c, dH: 1 }, c, M), b), a = L.diff(B.scores(X, { base: c, dA: 1 }, c, M), b); for (let i = 0; i < M; i++) { dH[i] += h[i] / carriers.length; dA[i] += a[i] / carriers.length; } });
      const sr = ix => (meanOf(dH, ix) + meanOf(dA, ix)) / 4, bs = boots(M, 400, X.key);
      const est = f => ({ m: L.r4(f(null)), lo: L.r4(q(bs.map(f), 0.025)), hi: L.r4(q(bs.map(f), 0.975)) });
      const row = { name: X.name, poolCards: X.pool.length, meanCost, level: X.level, statRate: est(sr), placebo: est(ix => meanOf(D0, ix) / sr(ix)), skills: {} };
      Object.entries(SKILLS).forEach(([k, e]) => { const D = gain(e); row.skills[k] = est(ix => (meanOf(D, ix) - meanOf(D0, ix)) / sr(ix)); });
      res.contexts[ctx] = row;
      console.log(`  stat point ${(row.statRate.m * 100).toFixed(2)} win-rate pts; ` + Object.entries(row.skills).map(([k, w]) => `${k} ${w.m} [${w.lo}, ${w.hi}]`).join('; '));
      fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'lumber-home-2026-11-02.json'), JSON.stringify(res, null, 1) + '\n');
    }
  } finally { B.close(); }
  // the fit: worth(ctx) / worth(global) against (mean cost - the global mean cost), pooled over the skills (weights 1 / variance), a line through 1
  const g = res.contexts.global, pts = [];
  Object.entries(res.contexts).forEach(([ctx, r]) => { if (ctx === 'global') return; Object.keys(SKILLS).forEach(k => { const w = r.skills[k], w0 = g.skills[k]; if (!(w0.m > 0.3)) return;
    const ratio = w.m / w0.m, se = Math.sqrt(((w.hi - w.lo) / 3.92) ** 2 + (ratio * (w0.hi - w0.lo) / 3.92) ** 2) / w0.m; pts.push({ ctx, skill: k, dc: r.meanCost - g.meanCost, ratio: L.r4(ratio), se: L.r4(se) }); }); });
  let sxy = 0, sxx = 0; pts.forEach(p => { const w = 1 / Math.max(1e-4, p.se * p.se); sxy += w * p.dc * (p.ratio - 1); sxx += w * p.dc * p.dc; });
  res.fit = { slope: L.r4(sxx ? sxy / sxx : 0), slopeSE: L.r4(sxx ? Math.sqrt(1 / sxx) : null), globalMeanCost: g.meanCost, points: pts, form: 'mult = 1 + slope x (home mean cost - global mean cost)' };
  fs.writeFileSync(path.join(OUT, 'lumber-home-2026-11-02.json'), JSON.stringify(res, null, 1) + '\n');
  const md = ['# Lumber makers by their lists\' mean cost (BAL12, 2026-11-02)', '', `\`${res.tool}\`; game \`${res.fingerprint}\`; ${M} paired fights a variant; both brambles ${BR}; carriers ${res.carriers.join(', ')} (6 copies). Worth in 3A + H stat points, less the placebo, 95% bootstrap.`, '',
    '| Context | Pool | Mean Lumber cost | Level | ' + Object.keys(SKILLS).join(' | ') + ' |', '|---|---|---|---|' + Object.keys(SKILLS).map(() => '---|').join(''),
    ...Object.values(res.contexts).map(r => `| ${r.name} | ${r.poolCards} | ${r.meanCost} | ${r.level} | ` + Object.values(r.skills).map(w => `${w.m} [${w.lo}, ${w.hi}]`).join(' | ') + ' |'), '',
    `Fit (ratio to global against the mean-cost difference, weighted by 1/se²): mult = 1 + ${res.fit.slope} (se ${res.fit.slopeSE}) x (mean cost - ${g.meanCost}).`, ''];
  fs.writeFileSync(path.join(OUT, 'lumber-home-2026-11-02.md'), md.join('\n'));
  console.log(`fit: mult = 1 + ${res.fit.slope} (se ${res.fit.slopeSE}) x (mean cost - ${g.meanCost})`);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
