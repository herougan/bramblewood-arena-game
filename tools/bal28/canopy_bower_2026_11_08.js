#!/usr/bin/env node
// 2026-11-08 (package BAL28): what the Canopy Bower's buff to the CPU's own units costs the player on The Canopy's five fights as BAL28 left
// them (decks, leaders, Shields), for decision BAL28-1. 200 games a cell on the road seeds (9100 + 37g), the Map reference. Variants: the
// Bower as shipped (Rainforest / Savanna +1/+2, CONTENT18-3 a), Rainforest only +1/+3 (CONTENT18-3 b), the Bower with no ability (same 26
// Health), and a plain bramble. No variant ships: the Bower's ability is the owner's (CONTENT18-3).
//   node tools/bal28/canopy_bower_2026_11_08.js [games=200] -> docs/balance/bal28/canopy-bower-2026-11-08.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const N = +(process.argv.slice(2).find(x => /^\d+$/.test(x)) || 200), map = G.CONQUEST_MAPS.find(m => m.id === 'my');
const CB = L.CHARACTER_DEFS['canopy-bower'];
L.CHARACTER_DEFS['bal28-rainforest'] = Object.assign({}, CB, { id: 'bal28-rainforest', effects: { habitatBonus: { kin: ['Rainforest'], atk: 1, hp: 3 } } });
L.CHARACTER_DEFS['bal28-bower-off'] = Object.assign({}, CB, { id: 'bal28-bower-off', effects: {} });
const V = { 'Bower (a) Rainforest+Savanna +1/+2': null, 'Bower (b) Rainforest +1/+3': 'bal28-rainforest', 'Bower, no ability': 'bal28-bower-off', 'plain bramble': 'castle' };
const rows = {};
for (const n0 of map.nodes.filter(n => n.deck)) {
  G.NODE_MAP_HINT.set(n0, 'my'); const t = G.skirmishTargetBand('my', n0), row = { target: Math.round(t.t * 100), lo: Math.round(t.lo * 100), hi: Math.round(t.hi * 100) };
  for (const [lab, id] of Object.entries(V)) { const n = Object.assign({}, n0); if (id) n.characterId = id; G.NODE_MAP_HINT.set(n, 'my'); row[lab] = Math.round(G.simulateReferenceFight('my', n, N, { seed0: 9100 }).wins / N * 1000) / 10; }
  rows[n0.key] = row; console.log(n0.key, n0.name, JSON.stringify(row));
}
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal28', 'canopy-bower-2026-11-08.json'), JSON.stringify({ tool: 'tools/bal28/canopy_bower_2026_11_08.js', games: N, seed0: 9100, rows }, null, 1) + '\n');
