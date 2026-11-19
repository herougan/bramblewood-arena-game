#!/usr/bin/env node
// 2026-11-20 (package REFIT10): information for decision REFIT10-1 only (no Shield change is applied: road retunes are swaps only):
// 19-A-7's live deck read at lower shieldOverride values, G games on seed S.
//   node docs/balance/refit10/shield_2026_11_20.js [games=200] [seed=311300] [shields=27,20,14,8,0]
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
require('./m9_2026_11_20.js');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [gs, ss, sh] = process.argv.slice(2), N = +(gs || 200), SEED = +(ss || 311300), { m, n } = X.byCode['19-A-7'];
for (const s of (sh || '27,20,14,8,0').split(',').map(Number)) { const nn = Object.assign({}, n, { shieldOverride: s }); G.NODE_MAP_HINT.set(nn, m.id);
  console.log('19-A-7 shieldOverride', s, Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10); }
