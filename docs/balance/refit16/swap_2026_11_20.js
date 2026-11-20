#!/usr/bin/env node
// 2026-11-20 (package REFIT16): REFIT15's swap scan (docs/balance/refit15/swap_2026_11_20.js) narrowed for the slow Maps 10-17 fights: only the
// listed out-cards (k = 1 .. kmax copies, kept cards' kept copies never) for the listed in-cards ('all' = the whole pool), legal decks only
// (problemsFull, leaders kept, refit16/acc.jsonl's decks in place), at G games on seed S; targets from the before file
// (refit15/skirmish-pass-refit15-road-s9100.jsonl). A start deck may be given (two-step swaps).
//   [KMIN=k] node docs/balance/refit16/swap_2026_11_20.js CODE games seed kmax outs|all ins|all ['<start deck json>']
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [code, gs, ss, km, outs, ins, dj] = process.argv.slice(2), { m, n, f } = X.byCode[code], N = +gs, SEED = +ss, KM = +km;
const d0 = dj ? JSON.parse(dj) : n.deck;
const T = fs.readFileSync(path.join(__dirname, '../refit15/skirmish-pass-refit15-road-s9100.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code).target;
const fx = {}; const pa = path.join(__dirname, 'acc.jsonl'); if (fs.existsSync(pa)) fs.readFileSync(pa, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const win = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10; };
const keepN = id => { const k = [...f.keep].find(x => (Array.isArray(x) ? x[0] : x) === id); return k ? (Array.isArray(k) ? k[1] : 1) : 0; };
const O = outs === 'all' ? Object.keys(d0) : outs.split(','), I = ins === 'all' ? f.pool : ins.split(',');
console.log(code, 'target', T, 'start', JSON.stringify(d0), win(d0), `(${N} games, seed ${SEED})`);
const why = {};
for (const a of O) for (const b of I) { if (b === a || !d0[a]) continue;
  for (let k = +(process.env.KMIN || 1); k <= Math.min(KM, d0[a] - keepN(a)); k++) { const d = Object.assign({}, d0, { [b]: (d0[b] || 0) + k }); if (d0[a] === k) delete d[a]; else d[a] = d0[a] - k;
    const p = X.problemsFull(code, d, fx).concat(leadersOf(d) === lead0 ? [] : ['leaders change']);
    if (p.length) { p.forEach(s => { const w = s.replace(/[0-9]+/g, 'N'); why[w] = (why[w] || 0) + 1; }); continue; }
    console.log(`-${k} ${a} +${k} ${b}`.padEnd(52), win(d), JSON.stringify(d)); } }
console.log('blocked:', JSON.stringify(Object.entries(why).sort((p, q) => q[1] - p[1]).slice(0, 12)));
