#!/usr/bin/env node
// 2026-11-20 (package REFIT15): each fight's castle (Shield / rule, Health / the bramble's own, the 60% floor), its pool size and the count of
// fights with a lowered Health (level-curve check 3). Read only.  node docs/balance/refit15/info_2026_11_20.js CODE...
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
let nH = 0; for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower) continue; for (const nd of m.nodes) { if (!nd.deck || nd.kind === 'tutorial') continue;
  G.NODE_MAP_HINT.set(nd, m.id); const b = Object.assign({}, nd); delete b.hqHp; delete b.shieldOverride; G.NODE_MAP_HINT.set(b, m.id); if (G.skirmishCastle(nd).hp < G.skirmishCastle(b).hp) nH++; } }
console.log('fights with a lowered Health:', nH);
for (const code of process.argv.slice(2)) { const { m, n, f } = X.byCode[code]; G.NODE_MAP_HINT.set(n, m.id); const sc = G.skirmishCastle(n);
  const b = Object.assign({}, n); delete b.hqHp; delete b.shieldOverride; G.NODE_MAP_HINT.set(b, m.id); const own = G.skirmishCastle(b);
  console.log(code, 'shield', sc.shield, 'rule', own.rule, '| hp', sc.hp, 'own', own.hp, 'floor', Math.round(own.hp * 0.6), '| pool', f.pool.length, 'size', Object.values(n.deck).reduce((t, k) => t + k, 0), 'problems', JSON.stringify(X.problemsFull(code, n.deck, {}))); }
