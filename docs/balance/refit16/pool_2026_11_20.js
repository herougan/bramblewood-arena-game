#!/usr/bin/env node
// 2026-11-20 (package REFIT16): a fight's deck, kept cards, leaders and pool with each card's cost / attack / health (read only).
//   node docs/balance/refit16/pool_2026_11_20.js CODE...
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G, D = require(path.join(ROOT, 'tools', 'skir1', 'lib_fight_2026_11_11.js')).D;
for (const code of process.argv.slice(2)) { const { m, n, f } = X.byCode[code]; G.NODE_MAP_HINT.set(n, m.id);
  console.log(code, n.name, 'deck', JSON.stringify(n.deck), 'keep', JSON.stringify([...f.keep]), 'leaders', JSON.stringify(G.skirmishLeadersOf(n, m.id) || []));
  for (const id of f.pool) { const c = D[id] || {}; console.log('   ', (n.deck[id] ? 'x' + n.deck[id] : '  '), id.padEnd(26), c.rarity, 'c' + c.cost, c.attack + '/' + c.health, Object.keys(c.effects || {}).join(',')); } }
