#!/usr/bin/env node
// 2026-11-05 (package BAL18, item 2): what would move 2-A-7 when no legal deck can (spot checks only, nothing applied): decks outside the
// fight's rules (K14 broken, other fights' reward cards from the list) and a Shield. 200 games, road measure seeds (9100 + 37g).
//   node tools/bal18/levers_2a7_2026_11_05.js  -> docs/balance/bal18/levers-2a7-2026-11-05.json
'use strict';
const fs = require('fs'), path = require('path');
const B = require('../lib_bramble.js'), G = B.G, MAP = 'mp', KEY = '2-A-7';
const node0 = G.CONQUEST_MAPS.find(x => x.id === MAP).nodes.find(n => n.key === KEY);
const run = (label, patch) => { const nn = Object.assign({}, node0, patch); G.NODE_MAP_HINT.set(nn, MAP); const r = G.simulateReferenceFight(MAP, nn, 200, { seed0: 9100 });
  const o = { label, patch, win: Math.round(r.wins / 200 * 1000) / 10, shield: r.shield, hp: r.hp }; console.log(JSON.stringify(o)); return o; };
const rows = [run('as is', {}),
  run('K14 broken: 4 Box Turtle, 3 Water Shrew + the map-unique cards', { deck: { 'lodge-engineer': 4, 'victoria-regia': 2, 'riverworks-bastion': 1, 'box-turtle': 4, 'water-shrew': 3 } }),
  run('other fights\' reward cards from the list (Snapstick Turtle, Platypus Spur, Pyrenean Desman, Muskrat Lodgekeeper) x1 each', { deck: { 'lodge-engineer': 4, 'old-sturgeon': 2, 'riverworks-bastion': 2, 'victoria-regia': 2, 'snapstick-turtle': 1, 'platypus-spur': 1, 'pyrenean-desman': 1, 'muskrat-lodgekeeper': 1 } }),
  run('Shield 20', { shieldOverride: 20 }), run('Shield 40', { shieldOverride: 40 })];
fs.writeFileSync(path.join(__dirname, '..', '..', 'docs', 'balance', 'bal18', 'levers-2a7-2026-11-05.json'), JSON.stringify({ about: 'BAL18: 2-A-7 spot checks outside the deck rules (not applied)', games: 200, seed0: 9100, rows }, null, 1) + '\n');
