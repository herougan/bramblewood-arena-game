#!/usr/bin/env node
// 2026-11-16 (package BAL-LEGAL2): the per-fight table and the road projection for the legal re-fit of the 11-16 release measure.
//   before = the release read (skirmish-pass-b1116-s7300) and the live deck on the fresh seed sets; after = the fix's deck on the same seed sets
//   (rows matched by deck, Health and Shield). Projection: the release read for every Maps 0-20 curve fight (tools/ci/road_summary.js rows),
//   a fixed fight at the mean of its fresh reads.
//   node tools/legal2/table_2026_11_16.js [--seeds 23100,24100,25100]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const B = p => path.join(ROOT, 'docs', 'balance', p), rd = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const seeds = arg('--seeds', '23100,24100,25100').split(','), rel = rd(B('skirmish-pass-b1116-s7300.jsonl'));
const live = seeds.map(s => rd(B(`legal2/measure-live-s${s}.jsonl`))), fixm = seeds.map(s => rd(B(`legal2/measure-fix-s${s}.jsonl`)));
const fixes = rd(B('legal2/legal2-fixes.jsonl')).filter(x => x.apply !== false), r1 = x => Math.round(x * 10) / 10, mean = v => v.reduce((t, x) => t + x, 0) / v.length;
const sig = (d, hp, sh) => L.keyOf(d) + '|' + hp + '|' + sh;
const sigOf = (code, deck) => { const { m, n } = X.byCode[code], nn = Object.assign({}, n, deck ? { deck } : {}); G.NODE_MAP_HINT.set(nn, m.id); const c = G.skirmishCastle(nn); return sig(nn.deck, c.hp, c.shield); };
const find = (f, code, s) => (f.find(r => r.key === code && r.games === 400 && sig(r.deck, r.hp, r.shield) === s) || {}).win;
const diff = (d0, d1) => { const o = []; [...new Set(Object.keys(d0).concat(Object.keys(d1)))].sort().forEach(id => { const k = (d1[id] || 0) - (d0[id] || 0); if (k) o.push((k > 0 ? '+' : '') + k + ' ' + id); }); return o.sort((x, y) => (x[0] === '-' ? 0 : 1) - (y[0] === '-' ? 0 : 1)).join(' '); };
const after = {};
console.log(`| Fight | Release s7300 | Before ${seeds.join(' / ')} | After ${seeds.join(' / ')} (mean, in band) | Target (band) | Moves |\n|---|---|---|---|---|---|`);
for (const fx of fixes) {
  const z = rel.find(r => r.key === fx.key), n = X.byCode[fx.key].n, s0 = sigOf(fx.key), s1 = sigOf(fx.key, fx.deck);
  const bw = live.map(f => find(f, fx.key, s0)), aw = fixm.map(f => find(f, fx.key, s1)), ok = aw.filter(w => w != null);
  const inb = ok.filter(w => w >= z.lo && w <= z.hi).length; if (ok.length) after[fx.key] = mean(ok);
  console.log(`| ${fx.key} | ${z.win} | ${bw.map(w => w == null ? '-' : w).join(' / ')} | ${aw.map(w => w == null ? '-' : w).join(' / ')} (${ok.length ? r1(mean(ok)) : '-'}, ${inb}/${ok.length}) | ${z.target} (${r1(z.lo)}-${r1(z.hi)}) | ${diff(n.deck, fx.deck)} (${L.size(fx.deck)} cards) |`);
}
const by = {}; rel.forEach(r => { by[r.map + ':' + r.key] = r; });
const rows = Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map));
for (const proj of [false, true]) { const t = { main: [0, 0, 0, 0], side: [0, 0, 0, 0] }, worst = [];
  rows.forEach(r => { const w = proj && after[r.key] != null ? after[r.key] : r.win, g = w - r.target, k = t[r.side ? 'side' : 'main'];
    k[0]++; if (w >= r.lo && w <= r.hi) k[1]++; if (Math.abs(g) <= 10) k[2]++; if (Math.abs(g) > 20) k[3]++; worst.push([r.key, r1(w), r.target, Math.abs(g)]); });
  console.log(`\n${proj ? 'with BAL-LEGAL2' : 'release s7300'}: ` + ['main', 'side'].map(k => `${k} ${t[k][1]}/${t[k][0]} in band, ${t[k][2]} within 10, ${t[k][3]} beyond 20`).join('; '));
  console.log('worst: ' + worst.sort((x, y) => y[3] - x[3]).slice(0, 8).map(x => `${x[0]} ${x[1]} (t${x[2]})`).join(', ')); }
