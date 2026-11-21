#!/usr/bin/env node
// CARRIER (2026-11-21): each Maps 1-20 skill's worth on high-Attack carriers (glass-golem, soldier-ant, blessed-avatar) against high-Health
// ones (lucky-hopper, rivergate-recruit, stable-colt), both at bramble 15, beside the six-carrier shared measure.
// Usage: node tools/pipeline/carrier_report.js   writes docs/balance/pipeline/carrier-2026-11-21.json, prints counts and the body-dependent skills.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const w = k => R[k] && R[k].test ? R[k].test.worthRuler : null, inc = x => { n[x] = (n[x] || 0) + 1; };
for (const k of keys) {
  const a = w('global@atk|' + k), h = w('global@hp|' + k), g = w('global|' + k); if (!a || !h || !g) { inc('missing'); continue; }
  const side = a.lo > h.hi ? 'attackers' : a.hi < h.lo ? 'walls' : 'either'; inc(side);
  rows.push({ key: k, price: R['global|' + k].test.price, shared: g, atk: a, hp: h, better: side });
}
fs.writeFileSync(path.join(D, 'carrier-2026-11-21.json'), JSON.stringify({ about: 'CARRIER: worthRuler on high-Attack vs high-Health carriers at bramble 15; better = whose interval sits above', rows }, null, 1));
console.log(keys.length, 'skills', n);
rows.filter(r => r.better !== 'either').sort((x, y) => (y.atk.m - y.hp.m) - (x.atk.m - x.hp.m))
  .forEach(r => console.log(`${r.better.padEnd(9)} ${r.key.slice(0, 50).padEnd(50)} atk ${r2(r.atk.m)}  hp ${r2(r.hp.m)}  shared ${r2(r.shared.m)}  price ${r.price}`));
