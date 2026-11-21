#!/usr/bin/env node
// LEVEL (2026-11-22): each Maps 1-20 skill's worth with both decks at Level 1 (the shared measure), Level 3 and Level 5 (Map 20's level),
// bramble 15, beside its price at each level. "grows" compares the Level 1 and Level 5 intervals; a skill's number grows with the card's
// levelBonus only on real cards, so the carriers keep the skill's printed number and the price read here is the bench's at that level.
// Usage: node tools/pipeline/level_report.js   writes docs/balance/pipeline/level-2026-11-22.json, prints counts and the movers.
'use strict';
const fs = require('fs'), path = require('path'), D = path.join(__dirname, '..', '..', 'docs/balance/pipeline'), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const R = J('measures.json').results, keys = J('state/carrier-keys.json'), r2 = v => Math.round(v * 100) / 100, rows = [], n = {};
const t = k => R[k] && R[k].test ? R[k].test : null, inc = x => { n[x] = (n[x] || 0) + 1; };
const top = process.argv.includes('--l3') ? 'L3' : 'L5';
for (const k of keys) {
  const a = t('global|' + k), m = t('global@L3|' + k), b = t('global@' + top + '|' + k); if (!a || !b) { inc('missing'); continue; }
  const A = a.worthRuler, B = b.worthRuler, move = B.lo > A.hi ? 'rises' : B.hi < A.lo ? 'falls' : 'same'; inc(move);
  const v = x => x.worthRuler.lo > x.price ? 'cheap' : x.worthRuler.hi < x.price ? 'dear' : 'ok';
  rows.push({ key: k, L1: { w: A, price: a.price, v: v(a) }, L3: m ? { w: m.worthRuler, price: m.price, v: v(m) } : null, top: { w: B, price: b.price, v: v(b) }, move });
}
const stable = rows.filter(r => r.L1.v === r.top.v).length;
fs.writeFileSync(path.join(D, 'level-2026-11-22.json'), JSON.stringify({ about: `LEVEL: worthRuler and price at Level 1 / 3 / 5, bramble 15; move = ${top} interval above / below Level 1`, top, stable, rows }, null, 1));
console.log(keys.length, 'skills,', top, 'vs L1', n, 'same verdict:', stable);
rows.filter(r => r.move !== 'same').sort((x, y) => (y.top.w.m - y.L1.w.m) - (x.top.w.m - x.L1.w.m))
  .forEach(r => console.log(`${r.move.padEnd(6)} ${r.key.slice(0, 48).padEnd(48)} L1 ${r2(r.L1.w.m)} (${r.L1.price})  ${r.L3 ? 'L3 ' + r2(r.L3.w.m) + ' (' + r.L3.price + ')' : ''}  ${top} ${r2(r.top.w.m)} (${r.top.price})`));
