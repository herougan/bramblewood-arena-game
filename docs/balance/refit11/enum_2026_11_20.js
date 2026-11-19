#!/usr/bin/env node
// 2026-11-20 (package REFIT11): REFIT10's whole-space read (docs/balance/refit10/enum_2026_11_20.js) for the FOCUS2 carrier fights the
// neighbour search cannot move: Map 6's decks sit at the 5-6 distinct-card limit with their four-ofs at the cap, so no single copy is a legal
// move and only whole-card swaps remain (the search builds those only from legal single moves). Every deck of the fight's size from its pool
// that passes problemsFull (size kept, leaders kept, refit11/acc.jsonl's decks in place), within --maxmove copies of the start deck, screened at
// --g1 games on --seed1; the --top nearest re-read at --g2 on --seed2. --keep-carrier: a FOCUS2 carrier in the live deck keeps 1+ copy.
// Targets from refit11/skirmish-pass-refit11-before-s9100.jsonl. Log: enum-<code>.jsonl (screen reads: enum-<code>-screen.jsonl, resumable).
//   node docs/balance/refit11/enum_2026_11_20.js CODE [--start '<deck json>'] [--maxmove 8] [--g1 40] [--g2 200] [--top 8] [--seed1 293300] [--seed2 294300] [--keep-carrier]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G, L = X.L;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = a[0], { m, n, f } = X.byCode[code], start = arg('--start') ? JSON.parse(arg('--start')) : n.deck;
const MAXMV = +arg('--maxmove', 8), G1 = +arg('--g1', 40), G2 = +arg('--g2', 200), TOP = +arg('--top', 8), S1 = +arg('--seed1', 293300), S2 = +arg('--seed2', 294300);
const KEEPC = a.includes('--keep-carrier'), CARRIERS = ['meerkat-sentry', 'sworn-shieldbearer', 'booming-bittern'];
const band = fs.readFileSync(path.join(__dirname, 'skirmish-pass-refit11-before-s9100.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code), T = band.target;
const fx = {}; const p0 = path.join(__dirname, 'acc.jsonl'); if (fs.existsSync(p0)) fs.readFileSync(p0, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const S = L.size(n.deck), live = n.deck;
const legal = d => L.size(d) === S && !(KEEPC && CARRIERS.some(id => live[id] && !d[id])) && !X.problemsFull(code, d, fx).length && leadersOf(d) === lead0;
const dist = (p, q) => [...new Set(Object.keys(p).concat(Object.keys(q)))].reduce((t, id) => t + Math.max(0, (q[id] || 0) - (p[id] || 0)), 0);
const pool = f.pool, out = [];
const rec = (i, d, left) => { if (left === 0) { if (Object.keys(d).length >= f.dMin && dist(start, d) <= MAXMV && legal(d)) out.push(Object.assign({}, d)); return; } if (i >= pool.length) return;
  for (let k = Math.min(f.cap(pool[i]), left); k >= 0; k--) { if (k) d[pool[i]] = k; else delete d[pool[i]]; if (Object.keys(d).length <= f.dMax) rec(i + 1, d, left - k); } delete d[pool[i]]; };
rec(0, {}, S);
console.log(code, 'target', T, 'start', JSON.stringify(start), out.length, 'legal decks within', MAXMV, 'copies');
const win = (d, g, s) => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, g, { seed0: s }).win * 1000) / 10; };
const LOG = path.join(__dirname, `enum-${code}.jsonl`), SCR = path.join(__dirname, `enum-${code}-screen.jsonl`), done = new Map();
if (fs.existsSync(SCR)) fs.readFileSync(SCR, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.g1 === G1 && x.seed1 === S1) done.set(L.keyOf(x.deck), x.w1); });
out.forEach(d => { const k = L.keyOf(d); if (done.has(k)) { d.__w1 = done.get(k); return; } const deck = Object.assign({}, d); d.__w1 = win(deck, G1, S1); fs.appendFileSync(SCR, JSON.stringify({ deck, w1: d.__w1, g1: G1, seed1: S1 }) + '\n'); });
out.sort((p, q) => Math.abs(p.__w1 - T) - Math.abs(q.__w1 - T));
const strip = d => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('__')));
const top = out.slice(0, TOP); top.forEach(d => { d.__w2 = win(strip(d), G2, S2); });
top.sort((p, q) => Math.abs(p.__w2 - T) - Math.abs(q.__w2 - T) || dist(start, p) - dist(start, q));
top.forEach(d => { const deck = strip(d);
  fs.appendFileSync(LOG, JSON.stringify({ code, deck, w1: d.__w1, w2: d.__w2, move: dist(start, deck), seeds: [S1, S2], keepCarrier: KEEPC }) + '\n');
  console.log(JSON.stringify(deck), d.__w1, '/', d.__w2, 'copies moved', dist(start, deck)); });
