#!/usr/bin/env node
// 2026-11-08 (package BAL28): The Canopy (my, 14-A-*) after CONTENT18's Canopy Bower. Plays each fight against the Map reference
// (simulateReferenceFight, the road seeds 9100 + 37g) with one lever changed at a time: the fields (High Canopy, Spring Rain, the Old
// Woods terrain; all canopy-themed, rain allowed: BAL27-1), the Shield (0 .. the rule), and, to size the Bower's own part, the Bower with
// its Rainforest / Savanna +1/+2 off (a copy of it with no ability: same Health) and a plain bramble. Prints a table and writes
// docs/balance/bal28/canopy-levers-2026-11-08.json.
//   node tools/bal28/canopy_levers_2026_11_08.js [games=40] [--codes 14-A-1,...] [--only 'label,label']
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const N = +(a.find(x => /^\d+$/.test(x)) || 40), map = G.CONQUEST_MAPS.find(m => m.id === 'my');
const codes = (arg('--codes', '') || map.nodes.filter(n => n.deck).map(n => n.key).join(',')).split(',');
// the Bower with its ability off (same Health, same rarity): sizes what its +1/+2 to the CPU's own Rainforest / Savanna units costs you
L.CHARACTER_DEFS['bal28-bower-off'] = Object.assign({}, L.CHARACTER_DEFS['canopy-bower'], { id: 'bal28-bower-off', effects: {} });
const V = {
  'as is': {},
  'Bower off': { characterId: 'bal28-bower-off' },
  'plain bramble': { characterId: 'castle' },
  'Shield 0': { shieldOverride: 0 },
  'no Rain': { rules: { field: 'none' } },
  'no High Canopy': { rules: { canopy: false } },
  'no Rain + Shield 0': { shieldOverride: 0, rules: { field: 'none' } },
  'Bower off + no Rain': { characterId: 'bal28-bower-off', rules: { field: 'none' } },
};
const only = arg('--only', null), labs = only ? only.split(',') : Object.keys(V);
const out = {};
for (const key of codes) {
  const n0 = map.nodes.find(n => n.key === key); G.NODE_MAP_HINT.set(n0, 'my'); const t = G.skirmishTargetBand('my', n0), row = { target: Math.round(t.t * 100) };
  for (const lab of labs) {
    const p = V[lab], n = JSON.parse(JSON.stringify(n0)), q = Object.assign({}, p);
    if (q.rules) { n.rules = Object.assign({}, n0.rules || {}, q.rules); delete q.rules; }
    Object.assign(n, q); G.NODE_MAP_HINT.set(n, 'my');
    const r = G.simulateReferenceFight('my', n, N, { seed0: 9100 }); row[lab] = Math.round(r.wins / N * 1000) / 10;
  }
  out[key] = row; console.log(key, n0.name, JSON.stringify(row));
}
if (!only && !arg('--codes', '')) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal28', 'canopy-levers-2026-11-08.json'), JSON.stringify({ tool: 'tools/bal28/canopy_levers_2026_11_08.js', games: N, seed0: 9100, rows: out }, null, 1) + '\n');
