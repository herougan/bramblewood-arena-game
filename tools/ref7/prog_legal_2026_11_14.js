#!/usr/bin/env node
// 2026-11-14 (package REF7): which Reference (Random) prog decks (docs/balance/ref/ref5-prog.json) the BAL13 ladder build can take as
// candidates: its anchors() keeps a deck only when legal() in the map-true pool (tools/bal13/ladder_2026_11_02.js). Measurement only.
//   node tools/ref7/prog_legal_2026_11_14.js [--max 20]   per PRO entry: prog decks legal / 5 and why the others fail
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const L = require('../bal13/ladder_2026_11_02.js'), O = require('../opt/deckopt.js');
const gm = O.loadGame(ROOT), G = gm.G, pr = require(path.join(ROOT, 'docs/balance/ref/ref5-prog.json'));
const ai = process.argv.indexOf('--max'), max = ai >= 0 ? +process.argv[ai + 1] : 20;
const tot = d => Object.values(d).reduce((t, k) => t + k, 0);
for (const e of L.entries().filter(x => x.map <= max)) {
  const map = G.CONQUEST_MAPS.find(m => m.id === e.id), f0 = map.nodes.find(n => n.deck), k = G.referenceDeckFor(map.id, f0).mapNo;
  const ks = Object.keys(pr.decks).map(Number).filter(x => x <= k).sort((a, b) => a - b), decks = pr.decks[ks[ks.length - 1]] || [];
  const poolArr = L.poolOf(gm, map), pool = new Set(poolArr);
  const why = decks.map(x => {
    if (L.legal(gm, x.counts, poolArr)) return 'ok';
    const out = Object.keys(x.counts).filter(id => !pool.has(id)), u = Object.keys(x.counts).length;
    return [out.length ? 'out of pool: ' + out.join(',') : '', u > 12 ? u + ' different' : '', tot(x.counts) !== 20 ? tot(x.counts) + ' cards' : ''].filter(Boolean).join('; ') || 'caps';
  });
  console.log(`${e.id.padEnd(4)} map ${String(e.map).padStart(2)} prog@${ks[ks.length - 1]}: ${why.filter(w => w === 'ok').length}/${decks.length} legal  ${why.filter(w => w !== 'ok').join(' | ').slice(0, 240)}`);
}
