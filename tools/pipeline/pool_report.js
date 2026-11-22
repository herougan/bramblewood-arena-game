#!/usr/bin/env node
// POOL (2026-11-22): each Maps 1-20 skill's worth when both decks' other cards and the opponents come only from Commons and Uncommons
// (state/pool-low.json, ctx poollo) or only from Rare and up (state/pool-high.json, ctx poolhi), against the full pool (the shared measure), bramble 15.
// Usage: node tools/pipeline/pool_report.js   writes docs/balance/pipeline/pool-2026-11-22.json, prints counts and the movers.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
const cmp = (x, g) => !x ? null : x.lo > g.hi ? 'higher' : x.hi < g.lo ? 'lower' : 'same';
for (const k of keys) {
  const lo = w('global@poollo|' + k), g = w('global|' + k), hi = w('global@poolhi|' + k); if (!g || (!lo && !hi)) { inc('missing'); continue; }
  const ml = cmp(lo, g), mh = cmp(hi, g); if (ml) inc('low ' + ml); if (mh) inc('high ' + mh);
  const p = R['global|' + k].test.price, v = x => !x ? null : x.lo > p ? 'cheap' : x.hi < p ? 'dear' : 'ok';
  rows.push({ key: k, price: p, low: lo, full: g, high: hi, lowMove: ml, highMove: mh, verdicts: [v(lo), v(g), v(hi)] });
}
const stable = rows.filter(r => new Set(r.verdicts.filter(Boolean)).size === 1).length;
fs.writeFileSync(path.join(D, 'pool-2026-11-22.json'), JSON.stringify({ about: 'POOL: worthRuler with rests and opponents from Commons + Uncommons (low) / the full pool (shared) / Rare and up (high), bramble 15; move = interval above / below the full-pool one', stable, rows }, null, 1));
console.log(rows.length, 'skills', n, 'same verdict in every pool read:', stable);
const m = x => x ? r2(x.m) : '-';
rows.filter(r => (r.lowMove && r.lowMove !== 'same') || (r.highMove && r.highMove !== 'same')).sort((x, y) => ((y.high || y.full).m - (y.low || y.full).m) - ((x.high || x.full).m - (x.low || x.full).m))
  .forEach(r => console.log(`${((r.lowMove || '-') + '/' + (r.highMove || '-')).padEnd(14)} ${r.key.slice(0, 50).padEnd(50)} low ${m(r.low)}  full ${m(r.full)}  high ${m(r.high)}  price ${r.price}`));
