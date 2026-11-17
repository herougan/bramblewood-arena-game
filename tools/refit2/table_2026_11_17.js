#!/usr/bin/env node
// 2026-11-17 (package REFIT2): REFIT1's table tool (tools/refit1/table_2026_11_16.js) for the road after SKN1 / ARROW1 / ECONSK1 / CARDPOW1:
//   before = the GitHub measure skirmish-pass-night2-s7600 and the live deck on the fresh seed sets (refit2/measure-live-s<K>.jsonl); after =
//   the fix on the same seed sets (refit2/measure-fix-s<K>.jsonl; rows matched by deck, Health and Shield). Accepted = in band on every fresh
//   seed set it was read on (2+). Projection: the s7600 read for every Maps 0-20 curve fight, an accepted fight at the mean of its fresh reads.
//   node tools/refit2/table_2026_11_17.js [--seeds 61100,62100] [--fixes docs/balance/refit2/refit2-fixes.jsonl] [--accept]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const B = p => path.join(ROOT, 'docs', 'balance', p), rd = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const seeds = arg('--seeds', '61100,62100').split(','), rel = rd(B('skirmish-pass-night2-s7600.jsonl')), FX = arg('--fixes', B('refit2/refit2-fixes.jsonl'));
// every fresh seed set a fix was read on (refit2/measure-fix-s<K>.jsonl)
const fseeds = fs.readdirSync(B('refit2')).map(f => (/^measure-fix-s(\d+)\.jsonl$/.exec(f) || [])[1]).filter(Boolean).sort();
const live = seeds.map(s => rd(B(`refit2/measure-live-s${s}.jsonl`))), fixm = fseeds.map(s => rd(B(`refit2/measure-fix-s${s}.jsonl`)));
const fixes = rd(FX), r1 = x => Math.round(x * 10) / 10, mean = v => v.reduce((t, x) => t + x, 0) / v.length;
const sig = (d, hp, sh) => L.keyOf(d) + '|' + hp + '|' + sh;
const sigOf = (code, fx) => { const { m, n } = X.byCode[code], nn = Object.assign({}, n, fx && fx.deck ? { deck: fx.deck } : {}, fx && fx.shieldOverride != null ? { shieldOverride: fx.shieldOverride } : {}, fx && fx.hqHp != null ? { hqHp: fx.hqHp } : {});
  G.NODE_MAP_HINT.set(nn, m.id); const c = G.skirmishCastle(nn); return sig(nn.deck, c.hp, c.shield); };
const find = (f, code, s) => (f.slice().reverse().find(r => r.key === code && r.games === 400 && sig(r.deck, r.hp, r.shield) === s) || {}).win;
const diff = (d0, d1) => { const o = []; [...new Set(Object.keys(d0).concat(Object.keys(d1)))].sort().forEach(id => { const k = (d1[id] || 0) - (d0[id] || 0); if (k) o.push((k > 0 ? '+' : '') + k + ' ' + id); }); return o.sort((x, y) => (x[0] === '-' ? 0 : 1) - (y[0] === '-' ? 0 : 1)).join(' '); };
const lever = (code, fx) => { const { m, n } = X.byCode[code], c0 = (G.NODE_MAP_HINT.set(n, m.id), G.skirmishCastle(n)), nn = Object.assign({}, n, fx.deck ? { deck: fx.deck } : {}, fx.shieldOverride != null ? { shieldOverride: fx.shieldOverride } : {}, fx.hqHp != null ? { hqHp: fx.hqHp } : {});
  G.NODE_MAP_HINT.set(nn, m.id); const c1 = G.skirmishCastle(nn); const o = []; if (c1.shield !== c0.shield) o.push(`Shield ${c0.shield}→${c1.shield}`); if (c1.hp !== c0.hp) o.push(`Health ${c0.hp}→${c1.hp}`); return o.join(', '); };
const after = {}, nearer = {}, out = [];
console.log(`| Fight | Night2 s7600 | Live deck ${seeds.join(' / ')} | Fix, fresh seed sets (mean, in band) | Target (band) | Moves |\n|---|---|---|---|---|---|`);
for (const fx of fixes) {
  const z = rel.find(r => r.key === fx.key), n = X.byCode[fx.key].n, s0 = sigOf(fx.key), s1 = sigOf(fx.key, fx);
  const bw = live.map(f => find(f, fx.key, s0)), reads = fseeds.map((s, i) => ({ s, w: find(fixm[i], fx.key, s1) })).filter(x => x.w != null), ok = reads.map(x => x.w);
  const inb = ok.filter(w => w >= z.lo && w <= z.hi).length, acc = ok.length >= 2 && inb === ok.length;
  if (acc) after[fx.key] = mean(ok); else if (ok.length >= 2 && fx.hqHp == null && Math.abs(mean(ok) - z.target) < Math.abs(mean(bw.filter(w => w != null)) - z.target) - 2) nearer[fx.key] = mean(ok);
  out.push(Object.assign({}, fx, { apply: acc, fresh: { live: Object.fromEntries(seeds.map((s, i) => [s, bw[i]])), fix: Object.fromEntries(reads.map(x => [x.s, x.w])) } }));
  const lv = lever(fx.key, fx);
  console.log(`| ${fx.key} | ${z.win} | ${bw.map(w => w == null ? '-' : w).join(' / ')} | ${reads.map(x => `${x.w} (s${x.s})`).join(' / ') || '-'} (${ok.length ? r1(mean(ok)) : '-'}, ${inb}/${ok.length})${acc ? '' : ' not accepted'} | ${z.target} (${r1(z.lo)}-${r1(z.hi)}) | ${fx.deck ? diff(n.deck, fx.deck) + ` (${L.size(fx.deck)} cards)` : 'deck kept'}${lv ? '; ' + lv : ''} |`);
}
if (a.includes('--accept')) { fs.writeFileSync(FX, out.map(x => JSON.stringify(x)).join('\n') + '\n'); console.log(`\n${out.filter(x => x.apply).length} of ${out.length} accepted (written to ${path.relative(ROOT, FX)})`); }
const by = {}; rel.forEach(r => { by[r.map + ':' + r.key] = r; });
const rows = Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map)); // tools/ci/road_summary.js's rows
// the third line also counts the fixes left apply:false that read 2+ points nearer their target than the live deck (no Health lever)
for (const proj of [0, 1, 2]) { const t = { main: [0, 0, 0, 0], side: [0, 0, 0, 0] }, worst = [];
  rows.forEach(r => { const w = proj && after[r.key] != null ? after[r.key] : proj === 2 && nearer[r.key] != null ? nearer[r.key] : r.win, g = w - r.target, k = t[r.side ? 'side' : 'main'];
    k[0]++; if (w >= r.lo && w <= r.hi) k[1]++; if (Math.abs(g) <= 10) k[2]++; if (Math.abs(g) > 20) k[3]++; worst.push([r.key, r1(w), r.target, Math.abs(g)]); });
  console.log(`\n${['night2 s7600', 'with REFIT2', 'with REFIT2 and the ' + Object.keys(nearer).length + ' nearer apply:false decks (' + Object.keys(nearer).join(', ') + ')'][proj]}: ` + ['main', 'side'].map(k => `${k} ${t[k][1]}/${t[k][0]} in band, ${t[k][2]} within 10, ${t[k][3]} beyond 20`).join('; '));
  console.log('worst: ' + worst.sort((x, y) => y[3] - x[3]).slice(0, 10).map(x => `${x[0]} ${x[1]} (t${x[2]})`).join(', ')); }
