#!/usr/bin/env node
// 2026-11-09 (package BAL33): The Canopy's five fights (my, 14-A-*) against the Map reference at the road seeds (9100 + 37g), as the game
// builds them now (BAL28-1 a: the CPU's Canopy Bower has no ability there) and, with --shipped, with the Bower's ability on (a copy of the
// Bower, same Health, that the BAL33 rule does not mute). Prints a row a fight; --out writes the rows as JSON.
//   node tools/bal33/canopy_measure_2026_11_09.js [games=200] [--codes 14-A-1,..] [--shipped] [--out docs/balance/bal33/<file>.json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const N = +(a.find(x => /^\d+$/.test(x)) || 200), map = G.CONQUEST_MAPS.find(m => m.id === 'my');
L.CHARACTER_DEFS['bal33-bower-on'] = Object.assign({}, L.CHARACTER_DEFS['canopy-bower'], { id: 'bal33-bower-on' });
const codes = (arg('--codes', '') || map.nodes.filter(n => n.deck).map(n => n.key).join(',')).split(',');
const rows = {};
for (const key of codes) {
  const n0 = map.nodes.find(n => n.key === key); G.NODE_MAP_HINT.set(n0, 'my'); const t = G.skirmishTargetBand('my', n0);
  const row = { name: n0.name, kind: n0.kind, target: Math.round(t.t * 100), lo: Math.round(t.lo * 100), hi: Math.round(t.hi * 100) };
  const run = n => Math.round(G.simulateReferenceFight('my', n, N, { seed0: 9100 }).wins / N * 1000) / 10;
  row.now = run(n0);
  if (a.includes('--shipped')) { const n = Object.assign({}, n0, { characterId: 'bal33-bower-on' }); G.NODE_MAP_HINT.set(n, 'my'); row.bowerOn = run(n); }
  rows[key] = row; console.log(key, JSON.stringify(row));
}
const out = arg('--out', null);
if (out) { fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true }); fs.writeFileSync(path.join(ROOT, out), JSON.stringify({ tool: 'tools/bal33/canopy_measure_2026_11_09.js', games: N, seed0: 9100, rows }, null, 1) + '\n'); }
