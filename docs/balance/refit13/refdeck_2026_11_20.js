#!/usr/bin/env node
// 2026-11-20 (package REFIT13, report only): a map's road fights played by a stand-in reference deck (the game's simulateReferenceFight with
// opts.deck; the Map reference's level, no leader, as the Map reference plays), against the live deck on the same seeds. Nothing is changed.
//   node docs/balance/refit13/refdeck_2026_11_20.js MAPNO games seed '<label>=<deck json>' ...      (MAPNO: a main map number)
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [mapNo, gs, ss, ...alts] = process.argv.slice(2), N = +gs, SEED = +ss;
const codes = Object.keys(X.byCode).filter(c => new RegExp('^' + mapNo + '-\\d+$').test(c)).sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);
const sets = [['live', null]].concat(alts.map(a => { const j = a.indexOf('='); return [a.slice(0, j), JSON.parse(a.slice(j + 1))]; }));
console.log('fight'.padEnd(8), sets.map(s => s[0].padStart(12)).join(''), `  (${N} games, seed ${SEED})`);
const sum = sets.map(() => 0);
codes.forEach(c => { const { m, n } = X.byCode[c];
  const row = sets.map(([, d], i) => { const r = Math.round(G.simulateReferenceFight(m.id, n, N, { seed0: SEED, deck: d }).win * 1000) / 10; sum[i] += r; return r; });
  console.log(c.padEnd(8), row.map(v => String(v).padStart(12)).join('')); });
console.log('mean'.padEnd(8), sum.map(v => (Math.round(v / codes.length * 10) / 10 + '').padStart(12)).join(''));
