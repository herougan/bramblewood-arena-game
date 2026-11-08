#!/usr/bin/env node
// 2026-11-08 (package BAL27): why The Canopy (14-A-*) is a wall. Plays each fight against the Map reference (simulateReferenceFight, the
// road seeds 9100 + 37g) with one factor taken away at a time: the Acacia Kraal it inherits from Savanna Reaches (characterId 'castle' =
// a plain bramble), High Canopy, Spring Rain, the Shield. Table in docs/balance/bal27/canopy-cause-2026-11-08.txt.
//   node tools/bal27/canopy_cause_2026_11_08.js [games=40] [--map my] [--codes 14-A-1,...]
'use strict';
const path = require('path');
const G = require(path.join(__dirname, '..', 'lib_bramble.js')).G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const N = +(a.find(x => /^\d+$/.test(x)) || 40), MAP = arg('--map', 'my'), map = G.CONQUEST_MAPS.find(m => m.id === MAP);
const codes = (arg('--codes', '') || map.nodes.filter(n => n.deck).map(n => n.key).join(',')).split(',');
const V = { 'as is': {}, 'plain bramble': { characterId: 'castle' }, 'no High Canopy': { rules: { canopy: false } }, 'no Rain': { rules: { field: 'none' } },
  'no fields': { rules: { canopy: false, field: 'none' } }, 'plain + no Rain': { characterId: 'castle', rules: { field: 'none' } },
  'plain + no fields': { characterId: 'castle', rules: { canopy: false, field: 'none' } }, 'plain + no fields + Shield 0': { characterId: 'castle', shieldOverride: 0, rules: { canopy: false, field: 'none' } } };
for (const key of codes) {
  const n0 = map.nodes.find(n => n.key === key); G.NODE_MAP_HINT.set(n0, MAP); const t = G.skirmishTargetBand(MAP, n0), out = [];
  for (const [lab, p] of Object.entries(V)) {
    const n = JSON.parse(JSON.stringify(n0)), q = Object.assign({}, p);
    if (q.rules) { n.rules = Object.assign({}, n0.rules || {}, q.rules); delete q.rules; }
    Object.assign(n, q);
    const r = G.simulateReferenceFight(MAP, n, N, { seed0: 9100 }); out.push(lab + ' ' + (r.win * 100).toFixed(1));
  }
  console.log(key, n0.name, 'target', Math.round(t.t * 100), '|', out.join(' | '));
}
