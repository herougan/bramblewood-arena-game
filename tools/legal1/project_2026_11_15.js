#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): the road projection if the legal fixes are applied: Maps 0-20 curve fights (the curve rows of
// docs/balance/skirmish-pass-b1114r400.jsonl), main and side, in band / within 10 / beyond 20 of the target.
//   - a fixed fight: the mean of its fresh reads in the --measure files (rows whose deck, Health and Shield are the fix's);
//   - any other fight: the four-seed live baseline (skirmish-pass-b1114r400 / s400 / t400 / b1115u400) when its live deck, Health and Shield are the
//     ones measured there; else (a fight BALREL1 changed) the mean of the saved 400-game reads of its live deck in the BASE2 files (the six-seed
//     reads BALREL1 projected with: allfix final / final2 seed sets, and SIDE4P's / SIDE3P's fresh reads).
//   node tools/legal1/project_2026_11_15.js --fixes docs/balance/legal1/legal1-fixes.jsonl --measure a.jsonl,b.jsonl,c.jsonl [--before]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('./lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const B = p => path.join(ROOT, 'docs', 'balance', p);
const rd = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const BASE4 = ['skirmish-pass-b1114r400', 'skirmish-pass-b1114s400', 'skirmish-pass-b1114t400', 'skirmish-pass-b1115u400'].map(f => B(f + '.jsonl'));
const BASE2 = ['allfix/skirmish-pass-final-s1100', 'allfix/skirmish-pass-final-s2100', 'allfix/skirmish-pass-final-s7100', 'allfix/skirmish-pass-final2-s6200', 'allfix/skirmish-pass-final2-s8100',
  'allfix/skirmish-pass-final2-s9200', 'allfix/skirmish-pass-fix2a4', 'side4p/measure-s4100-2026-11-15', 'side4p/measure-s5100-2026-11-15', 'side4p/measure-s6100-2026-11-15',
  'side3p/measure-v2-s4100-2026-11-15', 'side3p/measure-v2-s5100-2026-11-15', 'side3p/measure-v2-s6100-2026-11-15', 'side3p/skirmish-pass-side18-s4100', 'side3p/skirmish-pass-side18-s5100', 'side3p/skirmish-pass-side18-s6100'].map(f => B(f + '.jsonl'));
const fixes = {}; rd(arg('--fixes', B('legal1/legal1-fixes.jsonl'))).filter(x => x.apply !== false).forEach(x => { fixes[x.key] = x; });
const meas = [].concat(...(arg('--measure', '') || '').split(',').filter(Boolean).map(rd));
const before = a.includes('--before'); // the projection with no legal fix (today's live game)
const curve = rd(BASE4[0]).filter(r => r.curve && r.mapNo != null && r.mapNo <= 20);
const sig = (deck, hp, sh) => L.keyOf(deck) + '|' + hp + '|' + sh;
const reads = (files, s, key) => [].concat(...files.map(f => rd(f).filter(r => r.key === key && r.games === 400 && r.win != null && r.deck && sig(r.deck, r.hp, r.shield) === s).map(r => r.win)));
const mean = v => v.reduce((t, x) => t + x, 0) / v.length;
const tally = { main: { n: 0, band: 0, w10: 0, b20: 0 }, side: { n: 0, band: 0, w10: 0, b20: 0 } }, rows = [];
const cacheRd = {}; const rdc = p => cacheRd[p] || (cacheRd[p] = rd(p));
const readsC = (files, s, key) => [].concat(...files.map(f => rdc(f).filter(r => r.key === key && r.games === 400 && r.win != null && r.deck && sig(r.deck, r.hp, r.shield) === s).map(r => r.win)));
for (const r of curve) {
  const bc = X.byCode[r.key]; if (!bc) { console.error('no live fight', r.key); continue; }
  const node = Object.assign({}, bc.n), fx = before ? null : fixes[r.key];
  if (fx) { if (fx.deck) node.deck = fx.deck; if (fx.shieldOverride != null) node.shieldOverride = fx.shieldOverride; if (fx.hqHp != null) node.hqHp = fx.hqHp; }
  G.NODE_MAP_HINT.set(node, bc.m.id); const sc = G.skirmishCastle(node), s = sig(node.deck, sc.hp, sc.shield);
  let v, src;
  if (fx) { v = meas.filter(x => x.key === r.key && x.games === 400 && sig(x.deck, x.hp, x.shield) === s).map(x => x.win); src = 'legal1'; }
  if (!v || !v.length) { v = readsC(BASE4, s, r.key); src = 'base4'; }
  if (!v.length) { v = readsC(BASE2, s, r.key); src = 'base2'; }
  if (!v.length) { console.error('no read for', r.key, s); continue; }
  const w = mean(v), gap = Math.abs(w - r.target), t = tally[r.side ? 'side' : 'main'];
  t.n++; if (w >= r.lo && w <= r.hi) t.band++; if (gap <= 10) t.w10++; if (gap > 20) t.b20++;
  rows.push({ key: r.key, side: r.side, w: Math.round(w * 10) / 10, n: v.length, src, target: r.target, lo: r.lo, hi: r.hi, gap: Math.round((w - r.target) * 10) / 10 });
}
if (a.includes('--rows')) rows.forEach(x => console.log(JSON.stringify(x)));
['main', 'side'].forEach(k => { const t = tally[k]; console.log(`${k}: ${t.band}/${t.n} in band, ${t.w10} within 10, ${t.b20} beyond 20`); });
console.log('beyond 20:', rows.filter(x => Math.abs(x.gap) > 20).map(x => `${x.key} ${x.w} (${x.target})`).join(', ') || 'none');
console.log('sources:', JSON.stringify(rows.reduce((o, x) => { o[x.src] = (o[x.src] || 0) + 1; return o; }, {})));
