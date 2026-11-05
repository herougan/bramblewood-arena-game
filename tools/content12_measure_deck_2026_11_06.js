#!/usr/bin/env node
// CONTENT12 (2026-11-06): one road fight with a given enemy deck, the Map reference as the game deals it (G.simulateReferenceFight, as
// tools/bal18/scan_2a7_2026_11_05.js), on the road measure's seeds (9100 + 37g) unless --seed.
//   node tools/content12_measure_deck_2026_11_06.js <map> <key> '<deck json>' [games=200] [--seed 9100]
'use strict';
const B = require('./lib_bramble.js'), G = B.G, K = require('./bal7_k14_decks_2026_10_28.js');
const [MAP, KEY, DJ, GN] = process.argv.slice(2), a = process.argv.slice(2), si = a.indexOf('--seed'), seed0 = si >= 0 ? +a[si + 1] : 9100;
const m = G.CONQUEST_MAPS.find(x => x.id === MAP), node0 = m.nodes.find(n => n.key === KEY), deck = DJ && DJ !== '-' ? JSON.parse(DJ) : node0.deck, games = +GN || 200;
const f = K.fights().find(x => x.map === MAP && x.key === KEY), band = G.skirmishTargetBand(MAP, node0);
const nn = Object.assign({}, node0, { deck }); G.NODE_MAP_HINT.set(nn, MAP); const r = G.simulateReferenceFight(MAP, nn, games, { seed0 });
console.log(KEY, JSON.stringify(deck), 'cards', Object.values(deck).reduce((t, k) => t + k, 0), 'distinct', Object.keys(deck).length, 'K14', f ? K.violations(f, deck).length : '-',
  'win', Math.round(r.wins / games * 1000) / 10, 'band', Math.round(band.lo * 100), '-', Math.round(band.hi * 100), 'target', Math.round(band.t * 100));
