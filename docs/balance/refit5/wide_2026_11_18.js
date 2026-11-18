#!/usr/bin/env node
// 2026-11-18 (package REFIT5, item 3: 20-9, 7-6, 1-A-5, 7-A-2 stayed too easy because REFIT4's 1-copy search found no nearer neighbour):
// a wide search over the fight's whole legal space instead of the deck's neighbours. Stage 1: --n1 random legal decks (keep cards at their
// minimum, the deck's size, at most dMax different, pool caps) at --g1 games on --seed1; a ridge fit of win rate on copies gives each pool
// card a per-copy effect. Stage 2: 20,000 more random legal decks ranked by that fit, the --n2 predicted nearest the target read at --g1;
// the --top nearest of all reads re-read at --g2 on --seed2 next to the current deck. Same legality as REFIT4 (REFIT1's problemsFull with
// the pre-fold held problems not counted, the leaders kept, the other accepted decks --fx in place). Prints and logs; --accept appends the
// best deck when it is 2+ points nearer than the current deck on --seed2 (the fresh-seed check is a separate read).
//   node docs/balance/refit5/wide_2026_11_18.js --code X --bands <measure.jsonl> [--fx acc.jsonl] [--accept acc.jsonl] [--out log.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), L = X.L, G = X.G;
const held = {}; fs.readFileSync(path.join(ROOT, 'docs/balance/refit4/problems-prefold-2026-11-18.txt'), 'utf8').trim().split('\n').filter(Boolean).forEach(l => {
  const i = l.indexOf(' '); held[l.slice(0, i)] = new Set(JSON.parse(l.slice(i + 1))); });
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), N1 = +arg('--n1', 100), N2 = +arg('--n2', 40), G1 = +arg('--g1', 16), G2 = +arg('--g2', 160), TOP = +arg('--top', 5);
const SEED1 = +arg('--seed1', 91300), SEED2 = +arg('--seed2', 92300), OUT = arg('--out', path.join(__dirname, 'wide-2026-11-18.jsonl'));
const readJ = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const fx = {}; let own = null; readJ(arg('--fx', '')).forEach(x => { if (x.key === code) { if (x.deck) own = x.deck; } else if (x.deck) fx[x.key] = x.deck; });
const band = readJ(path.resolve(ROOT, arg('--bands'))).find(x => x.key === code), T = +arg('--target', band.target);
const { m, n, f } = X.byCode[code];
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const probs = d => X.problemsFull(code, d, fx).filter(p => !(held[code] && held[code].has(p))).concat(leadersOf(d) === lead0 ? [] : ['leaders']);
const cache = new Map(), win = (deck, games, seed) => { const k = L.keyOf(deck) + '|' + games + '|' + seed; if (cache.has(k)) return cache.get(k);
  const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id); const w = Math.round(G.simulateReferenceFight(m.id, nn, games, { seed0: seed }).win * 1000) / 10; cache.set(k, w); return w; };
const cur = Object.assign({}, own || n.deck), S = L.size(cur), pool = f.pool, keep = f.keep, dMin = Math.min(5, f.dMax);
let s = 12345; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
function sample() { // keep cards first, then random distinct cards, copies spread to the size within caps
  for (let t = 0; t < 50; t++) { const d = {}; keep.forEach((k, id) => { d[id] = k; });
    const want = dMin + Math.floor(rnd() * (f.dMax - dMin + 1)), others = pool.filter(id => !d[id]).sort(() => rnd() - 0.5);
    while (Object.keys(d).length < want && others.length) d[others.pop()] = 1;
    const ids = Object.keys(d); let left = S - L.size(d), g = 0;
    while (left > 0 && g++ < 400) { const id = ids[Math.floor(rnd() * ids.length)]; if (d[id] < f.cap(id)) { d[id]++; left--; } }
    if (left === 0 && !probs(d).length) return d; }
  return null; }
const off = w => Math.abs(w - T), seen = new Set([L.keyOf(cur)]), reads = [];
const readOne = d => { const k = L.keyOf(d); if (seen.has(k)) return; seen.add(k); reads.push({ d, w1: win(d, G1, SEED1) }); };
console.log(code, 'target', T, 'size', S, 'dMax', f.dMax, 'pool', pool.length, 'current', JSON.stringify(cur), 'problems', JSON.stringify(probs(cur)));
for (let i = 0, tries = 0; reads.length < N1 && tries < N1 * 20; tries++) { const d = sample(); if (d) readOne(d); }
// ridge fit: w1 ~ b0 + sum_id beta_id * copies
const P = pool.length, idx = Object.fromEntries(pool.map((id, i) => [id, i])), A = [...Array(P + 1)].map(() => Array(P + 2).fill(0));
reads.forEach(r => { const x = [1].concat(pool.map(id => r.d[id] || 0)); for (let i = 0; i <= P; i++) { for (let j = 0; j <= P; j++) A[i][j] += x[i] * x[j]; A[i][P + 1] += x[i] * r.w1; } });
for (let i = 1; i <= P; i++) A[i][i] += 2; // ridge
for (let c = 0; c <= P; c++) { let p = c; for (let r = c + 1; r <= P; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]];
  if (Math.abs(A[c][c]) < 1e-9) continue; for (let r = 0; r <= P; r++) if (r !== c) { const q = A[r][c] / A[c][c]; for (let k = c; k <= P + 1; k++) A[r][k] -= q * A[c][k]; } }
const beta = A.map((r, i) => Math.abs(r[i]) < 1e-9 ? 0 : r[P + 1] / r[i]), pred = d => beta[0] + Object.entries(d).reduce((t, [id, k]) => t + (idx[id] != null ? beta[idx[id] + 1] * k : 0), 0);
console.log('per-copy fit:', pool.map(id => `${id} ${beta[idx[id] + 1].toFixed(1)}`).join(', '));
const cand = new Map(); for (let t = 0; t < 20000 && cand.size < 4000; t++) { const d = sample(); if (d && !seen.has(L.keyOf(d))) cand.set(L.keyOf(d), d); }
[...cand.values()].map(d => ({ d, p: pred(d) })).sort((x, y) => off(x.p) - off(y.p)).slice(0, N2).forEach(c => readOne(c.d));
const top = reads.sort((x, y) => off(x.w1) - off(y.w1)).slice(0, TOP); top.forEach(c => { c.w2 = win(c.d, G2, SEED2); }); top.sort((x, y) => off(x.w2) - off(y.w2));
const w0 = win(cur, G2, SEED2), best = top[0];
console.log('reads', reads.length, '| range', Math.min(...reads.map(r => r.w1)), '-', Math.max(...reads.map(r => r.w1)), '| current', w0, '| top:', top.map(c => `${JSON.stringify(c.d)} ${c.w1}/${c.w2}`).join(' | '));
const ok = best && off(best.w2) <= off(w0) - 2;
fs.appendFileSync(OUT, JSON.stringify({ code, t: new Date().toISOString(), target: T, cur, w0, seed2: SEED2, g2: G2, reads: reads.length, range: [Math.min(...reads.map(r => r.w1)), Math.max(...reads.map(r => r.w1))],
  beta: Object.fromEntries(pool.map(id => [id, +beta[idx[id] + 1].toFixed(2)])), top: top.map(c => ({ deck: c.d, w1: c.w1, w2: c.w2 })), accepted: !!ok }) + '\n');
if (ok && arg('--accept')) fs.appendFileSync(arg('--accept'), JSON.stringify({ key: code, deck: best.d, shieldOverride: null, hqHp: null, tune: { w2: best.w2, seed2: SEED2, games: G2, from: w0 }, moves: ['wide'] }) + '\n');
console.log('RESULT', code, ok ? 'NEARER' : 'none nearer', ok ? JSON.stringify(best.d) + ' ' + best.w2 : '', 'current', w0);
