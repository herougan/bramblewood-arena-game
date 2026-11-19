#!/usr/bin/env node
// 2026-11-20 (package REFIT10): 19-A-7's search stalled near 40 (target 67.5); this reads the Malachite Golem copies directly: from a start
// deck, k Malachite copies (down to 1, the brief keeps it) out for k of each other m9 pool card, legal decks only (problemsFull as the search
// reads it, the other accepted decks in place), at G games on seed S.
//   node docs/balance/refit10/probe_2026_11_20.js CODE '<start deck json>' [games=160] [seed=272300]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
require('./m9_2026_11_20.js');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [code, dj, gs, ss] = process.argv.slice(2), d0 = JSON.parse(dj), N = +(gs || 160), SEED = +(ss || 272300), { m, n, f } = X.byCode[code];
const fx = {}; ['acc.jsonl', 'acc2.jsonl'].forEach(fl => { const p = path.join(__dirname, fl); if (fs.existsSync(p)) fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; }); });
const win = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10; };
console.log('start', JSON.stringify(d0), win(d0));
const mal = d0['malachite-golem'] || 0;
for (let k = 1; k < mal; k++) for (const id of f.pool) { if (id === 'malachite-golem') continue;
  const d = Object.assign({}, d0, { 'malachite-golem': mal - k, [id]: (d0[id] || 0) + k }), p = X.problemsFull(code, d, fx);
  console.log(`-${k} malachite +${k} ${id}`.padEnd(42), p.length ? 'illegal ' + JSON.stringify(p) : win(d)); }
