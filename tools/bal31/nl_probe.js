#!/usr/bin/env node
// 2026-11-08 (package BAL31): the War Hound body's budget N(L) by level (the level whose N(L) is just over 30 hosts the additivity test).
'use strict';
const path = require('path'), ROOT = path.join(__dirname, '..', '..'), L = require(path.join(ROOT, 'tools', 'bench', 'lib.js'));
const B = new L.Bench(Object.assign(L.defaults(), { workers: 0, quiet: true })), gm = B.gm, defs = gm.G.referenceBaseDefs();
for (let Lv = 1; Lv <= 30; Lv++) { const m = L.O.mineFor(gm, defs, { 'war-hound': 1 }, Lv), s = defs[Object.keys(m)[0]];
  const b = L.budgetOf(Object.assign({}, gm.D['war-hound'], { attack: s.attack, health: s.health }), Lv); console.log(Lv, s.attack + '/' + s.health, b.N.toFixed(3)); }
B.close();
