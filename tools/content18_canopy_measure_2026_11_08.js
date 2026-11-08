#!/usr/bin/env node
// 2026-11-08 (package CONTENT18, owner 10:52 #8 / BAL27-1): a quick measure of The Canopy's five fights (side map `my`, 14-A-*) now that their
// enemy defends the Canopy Bower (Rainforest and Savanna units +1/+2) instead of the borrowed Acacia Kraal (Lumber 1, first unit +3). Decks are
// not retuned here (BAL28 does that next): the same fights, the same seeds (seed0 9100, as tools/eng26_kraal_2026_11_06.js), the Map reference,
// once with the Kraal forced (node.characterId) and once as shipped. Win % is the player's.
//   node tools/content18_canopy_measure_2026_11_08.js [--games 40]  -> docs/balance/content18-canopy-2026-11-08.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const a = process.argv.slice(2), arg = (k, d)=>{ const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 40), SEED0 = 9100;
const B = require('./lib_bramble.js'), G = B.G;
const m = G.CONQUEST_MAPS.find(x=> x.id === 'my');
const rows = [];
(m.nodes || []).filter(n=> n.deck).forEach(n=>{
  G.NODE_MAP_HINT.set(n, m.id);
  const band = G.skirmishTargetBand(m.id, n), r1 = v=> Math.round(v * 1000) / 10;
  const w = forced=>{ const t = Object.assign({}, n); if(forced) t.characterId = forced; G.NODE_MAP_HINT.set(t, m.id); const r = G.simulateReferenceFight(m.id, t, GAMES, {seed0: SEED0}); return r1(r.wins / GAMES); };
  const kraal = w('acacia-kraal'), bower = w(null), castle = (G.skirmishCastle(n).character || {}).id;
  const row = {code: n.key, kind: n.kind, name: n.name, castle, target: r1(band.t), lo: r1(band.lo), hi: r1(band.hi), kraal, bower,
    inBand: bower >= r1(band.lo) && bower <= r1(band.hi), gap: Math.round((bower - r1(band.t)) * 10) / 10};
  rows.push(row);
  console.log(n.key.padEnd(8), n.kind.padEnd(8), 'target', row.target, `[${row.lo}-${row.hi}]`, ' Acacia Kraal:', kraal, ' Canopy Bower:', bower, row.inBand ? 'in band' : 'gap ' + row.gap);
});
const out = {tool: 'tools/content18_canopy_measure_2026_11_08.js', generated: new Date().toISOString(), games: GAMES, seed0: SEED0, note: 'player win %; decks unchanged (BAL28 retunes)', rows};
fs.writeFileSync(path.join(ROOT, 'docs/balance/content18-canopy-2026-11-08.json'), JSON.stringify(out, null, 1) + '\n');
