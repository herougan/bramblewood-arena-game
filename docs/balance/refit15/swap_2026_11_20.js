#!/usr/bin/env node
// 2026-11-20 (package REFIT15): REFIT14's script on refit15/ files (targets from refit14/skirmish-pass-refit14-road-s9100.jsonl). Was: REFIT12's script; before that REFIT10's probe (docs/balance/refit10/probe_2026_11_20.js) widened to every card: from a start deck, k copies
// of each deck card out for k of each other pool card (k = 1 .. all its copies; size kept), legal decks only (problemsFull as the search reads
// it, leaders kept, acc.jsonl's decks in place), at G games on seed S. Prints the legal swaps sorted by distance to the target and a count of
// the problems that blocked the rest. For the fights the neighbour search (lane_2026_11_20.sh) stalled on.
//   node docs/balance/refit15/swap_2026_11_20.js CODE ['<start deck json>'|live] [games=60] [seed=311300]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [code, dj, gs, ss] = process.argv.slice(2), { m, n, f } = X.byCode[code], N = +(gs || 60), SEED = +(ss || 311300);
const d0 = !dj || dj === 'live' ? n.deck : JSON.parse(dj);
const T = fs.readFileSync(path.join(__dirname, '../refit14/skirmish-pass-refit14-road-s9100.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code).target;
const fx = {}; const pa = path.join(__dirname, 'acc.jsonl'); if (fs.existsSync(pa)) fs.readFileSync(pa, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const win = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10; };
console.log(code, 'target', T, 'start', JSON.stringify(d0), win(d0), `(${N} games, seed ${SEED})`);
const rows = [], why = {};
for (const a of Object.keys(d0)) for (const b of f.pool) { if (b === a) continue;
  for (let k = 1; k <= d0[a]; k++) { const d = Object.assign({}, d0, { [b]: (d0[b] || 0) + k }); if (d0[a] === k) delete d[a]; else d[a] = d0[a] - k;
    const p = X.problemsFull(code, d, fx).concat(leadersOf(d) === lead0 ? [] : ['leaders change']);
    if (p.length) { p.forEach(s => { const w = s.replace(/[0-9]+/g, 'N'); why[w] = (why[w] || 0) + 1; }); continue; }
    rows.push({ mv: `-${k} ${a} +${k} ${b}`, w: win(d), d }); } }
rows.sort((p, q) => Math.abs(p.w - T) - Math.abs(q.w - T)).forEach(r => console.log(r.mv.padEnd(52), r.w, JSON.stringify(r.d)));
console.log('blocked:', JSON.stringify(Object.entries(why).sort((p, q) => q[1] - p[1]).slice(0, 12)));
