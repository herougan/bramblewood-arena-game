#!/usr/bin/env node
// 2026-11-16 (package REFIT1): the attribution swap test. Plays road fights against the Map reference with some cards put back at their
// pre-fold definition (from a cards.json of before FOLD5, e.g. `git show f6ac301f^:canonical/cards.json`), in process: the tool replaces
// lib_bramble's CARD_DEFS_BASELINE entries, nothing on disk changes. --cards all = every card FOLD5 changed.
//   node tools/refit1/swap_2026_11_16.js --pre <prefold cards.json> --cards a,b|all|none --fights 6-5,6-6 [--games 400] [--seed 7300] [--out f.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/server-overrides/fold-plan-2026-11-16.json'), 'utf8'));
const changedIds = plan.rows.filter(r => r.changes && r.changes.length).map(r => r.id);
const preRaw = JSON.parse(fs.readFileSync(arg('--pre'), 'utf8')), preById = {}; preRaw.forEach(c => { preById[c.id] = c; });
const cardsArg = arg('--cards', 'none'), ids = cardsArg === 'all' ? changedIds : cardsArg === 'none' ? [] : cardsArg.split(',');
for (const id of ids) { const c = preById[id]; if (!c) throw new Error('no pre-fold card ' + id); const d = Object.assign({ effects: {} }, c); delete d.art; B.CARD_DEFS_BASELINE[id] = d; }
const N = +arg('--games', 400), seed = +arg('--seed', 7300), out = arg('--out');
const fights = []; for (const m of B.MAPS) for (const n of m.nodes) fights.push({ m, n });
for (const code of arg('--fights').split(',')) {
  const f = fights.find(x => x.n.key === code); if (!f) { console.log('no fight', code); continue; }
  const t = Date.now(), r = G.simulateReferenceFight(f.m.id, f.n, N, { seed0: seed }), w = Math.round(r.win * 1000) / 10;
  const row = { key: code, cards: cardsArg, games: N, seed, win: w, ms: Date.now() - t };
  console.log(JSON.stringify(row)); if (out) fs.appendFileSync(out, JSON.stringify(row) + '\n');
}
