#!/usr/bin/env node
// 2026-11-05 (package BAL16, decision CONTENT10-2: "Pelican Point (2-4) still walls the starter deck"): 2-4 measured the way
// tools/content10/pelican_point_2026_11_05.js does (simulateReferenceFight, seeds 9100 + 37g) with the Map reference and the Otter starter
// in your seat, for the fight as it is and for candidate fixes that keep the bramble (IDEA-EARLY-6: "Don't lower bramble health anymore"):
//   deck variants from the fight's own list (Pebble Beach's MAP + SPECIAL, the deck's size 20 kept, the leader Conch Herald kept).
// Read-only. node tools/bal16/pelican_2026_11_05.js [games=200] -> docs/balance/bal16/pelican-point-2026-11-05.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const games = +(process.argv.slice(2).find(a => /^\d+$/.test(a)) || 200);
const node = B.byKey('mb', '2-4'); G.NODE_MAP_HINT.set(node, 'mb');
// candidates: the deck now, then weaker 20-card decks of the list (Conch Herald x2 kept as the leader)
const VARIANTS = {
  now: Object.assign({}, node.deck),
  'gull-thief for open-ocean-hermit-crab': { 'conch-herald': 2, 'gull-thief': 5, 'open-ocean-hermit-crab': 2, 'pincushion-urchin': 3, 'rock-pool-starfish': 5, 'beaver-lumberjack': 0, 'bramble-sprout': 3 },
  'soft: sprouts and drummers': { 'conch-herald': 2, 'gull-thief': 4, 'bramble-sprout': 5, 'cricket-drummer': 5, 'rock-pool-starfish': 4 },
  'soft: no Thorns': { 'conch-herald': 2, 'gull-thief': 5, 'open-ocean-hermit-crab': 4, 'rock-pool-starfish': 5, 'bramble-sprout': 4 },
};
const out = { fight: '2-4 Pelican Point', games, seeds: '9100 + 37g', bramble: null, rows: [] };
for (const [name, d0] of Object.entries(VARIANTS)) {
  const deck = Object.fromEntries(Object.entries(d0).filter(([, k]) => k > 0)), tot = Object.values(deck).reduce((a, b) => a + b, 0);
  const nn = Object.assign({}, node, { deck }); G.NODE_MAP_HINT.set(nn, 'mb');
  const row = { variant: name, deck, size: tot };
  for (const [k, sd] of [['map', null], ['starter', Object.assign({}, G.WINRATE_REF_DECKS.starter)]]) {
    const r = G.simulateReferenceFight('mb', nn, games, { seed0: 9100, deck: sd }); row[k] = Math.round(r.win * 1000) / 10; out.bramble = r.hp + ' + ' + r.shield + ' Shield'; }
  out.rows.push(row); console.log(`${name.padEnd(40)} size ${tot}  map ${row.map}%  starter ${row.starter}%`);
}
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal16'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal16', 'pelican-point-2026-11-05.json'), JSON.stringify(out, null, 1) + '\n');
