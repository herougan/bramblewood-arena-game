#!/usr/bin/env node
// 2026-11-20 (package REFIT10): the neighbour search left 19-A-7 near 40 (target 67.5) after two passes: every legal 1-2 move makes it
// harder or no easier. This reads the whole legal space instead: every deck of the fight's size from the m9 pool that passes problemsFull
// (as search_2026_11_20.js reads it: size kept, Malachite kept, leaders kept, the other accepted decks in place), within --maxmove copies
// of the start deck, screened at --g1 games on --seed1; the --top nearest re-read at --g2 on --seed2. Log: enum-<code>.jsonl.
//   node docs/balance/refit10/enum_2026_11_20.js CODE [--start '<deck json>'] [--maxmove 8] [--g1 40] [--g2 200] [--top 8] [--seed1 291300] [--seed2 292300] [--shard i/n]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
require('./m9_2026_11_20.js');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G, L = X.L;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = a[0], { m, n, f } = X.byCode[code], start = arg('--start') ? JSON.parse(arg('--start')) : n.deck;
const MAXMV = +arg('--maxmove', 8), G1 = +arg('--g1', 40), G2 = +arg('--g2', 200), TOP = +arg('--top', 8), S1 = +arg('--seed1', 291300), S2 = +arg('--seed2', 292300);
const [SI, SN] = (arg('--shard', '0/1')).split('/').map(Number);
const band = fs.readFileSync(path.join(__dirname, 'skirmish-pass-rel5.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code), T = band.target;
const fx = {}; ['acc.jsonl', 'acc2.jsonl'].forEach(fl => { const p = path.join(__dirname, fl); if (fs.existsSync(p)) fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; }); });
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const S = L.size(n.deck), live = n.deck;
const legal = d => L.size(d) === S && !(live['malachite-golem'] && !d['malachite-golem']) && !X.problemsFull(code, d, fx).length && leadersOf(d) === lead0;
const dist = (p, q) => [...new Set(Object.keys(p).concat(Object.keys(q)))].reduce((t, id) => t + Math.max(0, (q[id] || 0) - (p[id] || 0)), 0);
const pool = f.pool, out = [];
const rec = (i, d, left) => { if (left === 0) { if (Object.keys(d).length >= f.dMin && dist(start, d) <= MAXMV && legal(d)) out.push(Object.assign({}, d)); return; } if (i >= pool.length) return;
  for (let k = Math.min(f.cap(pool[i]), left); k >= 0; k--) { if (k) d[pool[i]] = k; else delete d[pool[i]]; if (Object.keys(d).length <= f.dMax) rec(i + 1, d, left - k); } delete d[pool[i]]; };
rec(0, {}, S);
const mine = out.filter((_, i) => i % SN === SI);
console.log(code, 'target', T, 'start', JSON.stringify(start), out.length, 'legal decks within', MAXMV, 'copies; this shard', mine.length);
const win = (d, g, s) => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, g, { seed0: s }).win * 1000) / 10; };
const LOG = path.join(__dirname, `enum-${code}.jsonl`);
// resumable (2026-11-20: a 30-minute background limit cut the first run under a load of 10+): each screen read goes to enum-<code>-screen.jsonl
const SCR = path.join(__dirname, `enum-${code}-screen.jsonl`), done = new Map();
if (fs.existsSync(SCR)) fs.readFileSync(SCR, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.g1 === G1 && x.seed1 === S1) done.set(L.keyOf(x.deck), x.w1); });
mine.forEach(d => { const k = L.keyOf(d); if (done.has(k)) { d.__w1 = done.get(k); return; } const deck = Object.assign({}, d); d.__w1 = win(deck, G1, S1); fs.appendFileSync(SCR, JSON.stringify({ deck, w1: d.__w1, g1: G1, seed1: S1 }) + '\n'); });
mine.sort((p, q) => Math.abs(p.__w1 - T) - Math.abs(q.__w1 - T));
const top = mine.slice(0, TOP); top.forEach(d => { d.__w2 = win(Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('__'))), G2, S2); });
top.sort((p, q) => Math.abs(p.__w2 - T) - Math.abs(q.__w2 - T) || dist(start, p) - dist(start, q));
top.forEach(d => { const deck = Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('__')));
  fs.appendFileSync(LOG, JSON.stringify({ code, shard: `${SI}/${SN}`, deck, w1: d.__w1, w2: d.__w2, move: dist(start, deck), seeds: [S1, S2] }) + '\n');
  console.log(JSON.stringify(deck), d.__w1, '/', d.__w2, 'copies moved', dist(start, deck)); });
