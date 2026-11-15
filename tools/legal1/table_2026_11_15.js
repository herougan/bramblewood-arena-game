#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): the per-fight table for the report: before (the four-seed live baseline of the live deck), after on the
// fresh seed sets (the measure files' rows of the fix's deck / Health / Shield), target and band, moves.
//   node tools/legal1/table_2026_11_15.js --fixes docs/balance/legal1/legal1-fixes.jsonl --measure a,b,c [--seeds 5100,6100,4100]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('./lib_legal_2026_11_15.js'), L = X.L, G = X.G, ALL = require('./status_2026_11_15.js').ALL;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const rd = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const B = p => path.join(ROOT, 'docs', 'balance', p);
const BASE4 = ['skirmish-pass-b1114r400', 'skirmish-pass-b1114s400', 'skirmish-pass-b1114t400', 'skirmish-pass-b1115u400'].map(f => rd(B(f + '.jsonl')));
const fixes = {}; rd(arg('--fixes')).forEach(x => { fixes[x.key] = x; });
const meas = (arg('--measure', '') || '').split(',').filter(Boolean).map(rd), seeds = arg('--seeds', '5100,6100,4100').split(',');
const band0 = BASE4[0], sig = (d, hp, sh) => L.keyOf(d) + '|' + hp + '|' + sh, r1 = x => Math.round(x * 10) / 10;
const diff = (d0, d1) => { const o = []; [...new Set(Object.keys(d0).concat(Object.keys(d1)))].sort().forEach(id => { const k = (d1[id] || 0) - (d0[id] || 0); if (k) o.push((k > 0 ? '+' : '') + k + ' ' + id); }); return o.sort((x, y) => (x[0] === '-' ? 0 : 1) - (y[0] === '-' ? 0 : 1)).join(' '); };
console.log('| Fight | Before (4-seed mean) | After ' + seeds.join(' / ') + ' | Target (band) | Moves |\n|---|---|---|---|---|');
for (const code of ALL) {
  const { m, n } = X.byCode[code], b = band0.find(r => r.key === code); G.NODE_MAP_HINT.set(n, m.id); const sc0 = G.skirmishCastle(n), s0 = sig(n.deck, sc0.hp, sc0.shield);
  const bef = BASE4.map(f => (f.find(r => r.key === code && sig(r.deck, r.hp, r.shield) === s0) || {}).win).filter(x => x != null);
  const fx = fixes[code]; let after = '-', moves = 'no legal fix';
  if (fx && fx.apply !== false) { const nn = Object.assign({}, n); if (fx.deck) nn.deck = fx.deck; if (fx.shieldOverride != null) nn.shieldOverride = fx.shieldOverride; if (fx.hqHp != null) nn.hqHp = fx.hqHp;
    G.NODE_MAP_HINT.set(nn, m.id); const sc = G.skirmishCastle(nn), s = sig(nn.deck, sc.hp, sc.shield);
    const ws = meas.map(f => (f.find(r => r.key === code && r.games === 400 && sig(r.deck, r.hp, r.shield) === s) || {}).win);
    const inb = ws.filter(w => w != null && w >= b.lo && w <= b.hi).length;
    after = ws.map(w => w == null ? '?' : w).join(' / ') + (ws.every(w => w != null) ? ` (mean ${r1(ws.reduce((t, w) => t + w, 0) / ws.length)}, ${inb}/3 in band)` : '');
    moves = [fx.deck ? diff(n.deck, fx.deck) : '', fx.shieldOverride != null ? `shieldOverride ${fx.shieldOverride} (Shield ${sc0.shield} to ${sc.shield})` : '', fx.hqHp != null ? `hqHp ${fx.hqHp} (Health ${sc0.hp} to ${sc.hp})` : ''].filter(Boolean).join('; '); }
  console.log(`| ${code} | ${bef.length ? r1(bef.reduce((t, w) => t + w, 0) / bef.length) : '?'} | ${after} | ${b.target} (${r1(b.lo)}-${r1(b.hi)}) | ${moves}${fx && fx.note ? ' ' + fx.note : ''} |`);
}
