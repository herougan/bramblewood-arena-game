#!/usr/bin/env node
// 2026-11-17 (package REFIT3): a wider legal search for one road fight, for the fights REFIT2's local search left out
// (tools/refit1/search_2026_11_16.js stops at the first deck no single or paired copy move improves).
//   1. sample: random legal decks over the whole legal space (any mix of the fight's pool, its size and copy caps; a side deck may be
//      smaller, down to its size - 4); legal = tools/legal1 problemsFull() empty (SKIR1's rules under SIDE2's holds, the map lines, with
//      the decks accepted before it on its map: --fx) and the fight's leaders unchanged (tests/skir1 "its leaders are kept" / "its showcase
//      is kept": the showcase is not a lever). Each read at --gs games on --seed1.
//   2. model: a ridge fit of win ~ copies of each card; a hill climb on the model over legal decks (multi-card moves of 1-4 copies,
//      2-step moves) from the --starts nearest sampled decks; the --pred nearest predictions read at --gp games on --seed1.
//   3. re-read: the --top nearest (sampled or predicted, and the live deck) at --g2 games on --seed2; the nearest kept.
// The result line goes to --accept in the fixes format (REFIT1's search polishes it with --from-accepted). Targets from --bands.
//   node tools/refit3/wide_2026_11_17.js --code 4-5 [--fx acc.jsonl] [--accept acc.jsonl] [--bands f.jsonl] [--n 240] [--gs 16] ...
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), N = +arg('--n', 240), GS = +arg('--gs', 16), GP = +arg('--gp', 60), G2 = +arg('--g2', 300), TOP = +arg('--top', 5);
const STARTS = +arg('--starts', 12), PRED = +arg('--pred', 16), SEED1 = +arg('--seed1', 63300), SEED2 = +arg('--seed2', 64300);
const OUT = arg('--out', path.join(ROOT, 'docs', 'balance', 'refit3', 'wide-2026-11-17.jsonl'));
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const fx = {}; rd(arg('--fx', '')).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const band = rd(path.resolve(ROOT, arg('--bands', 'docs/balance/refit3/live-s7600.jsonl'))).find(x => x.key === code);
const T = band.target, LO = band.lo, HI = band.hi, { m, n, f } = X.byCode[code];
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
// not worse than now: a problem the live deck already has (4-3 / 4-5 K14, 20-4's boon off) does not count against a candidate
const P0 = new Set(X.problemsFull(code, n.deck, {}));
const legalP = d => X.problemsFull(code, d, fx).filter(x => !P0.has(x)).concat(leadersOf(d) === lead0 ? [] : ['leaders change to ' + leadersOf(d)]), legal = d => !legalP(d).length;
const cache = new Map();
function win(deck, games, seed) { const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id); const k = L.keyOf(deck) + '|' + games + '|' + seed;
  if (cache.has(k)) return cache.get(k); const w = Math.round(G.simulateReferenceFight(m.id, nn, games, { seed0: seed }).win * 1000) / 10; cache.set(k, w); return w; }
const off = w => Math.abs(w - T), sideMin = f.side ? Math.max(10, f.S - 4) : f.S;
const carried = id => !!(f.U && !f.U.has(id) && !f.L0.includes(id)), capOf = id => carried(id) ? Math.min(f.cap(id), f.carriedMax) : f.cap(id);
const pool = f.pool.slice(), keepMin = id => f.keep.get(id) || 0;
const log = o => fs.appendFileSync(OUT, JSON.stringify(Object.assign({ code, t: new Date().toISOString() }, o)) + '\n');
let rs = 12345 + code.split('').reduce((t, c) => t * 31 + c.charCodeAt(0), 7) % 100000; const rnd = () => { rs = (rs * 1103515245 + 12345) % 2147483648; return rs / 2147483648; };
const shuffle = x => { for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
function sample() {
  const S = f.side ? sideMin + Math.floor(rnd() * (f.S - sideMin + 1)) : f.S;
  const must = [...f.keep.keys()].filter(id => pool.includes(id)), rest = shuffle(pool.filter(id => !must.includes(id)));
  const dLo = Math.max(f.dMin, must.length), dHi = Math.min(f.dMax, pool.length); if (dHi < dLo) return null;
  const k = dLo + Math.floor(rnd() * (dHi - dLo + 1)), ids = must.concat(rest.slice(0, Math.max(0, k - must.length)));
  const d = {}; ids.forEach(id => { d[id] = Math.max(1, keepMin(id)); }); let left = S - L.size(d); if (left < 0) return null;
  // carried cards: at most 6 copies in all (K14); fill the rest at random within the caps
  let guard = 0; while (left > 0 && guard++ < 500) { const id = ids[Math.floor(rnd() * ids.length)]; if (d[id] >= capOf(id)) continue;
    if (carried(id) && Object.keys(d).filter(carried).reduce((t, x) => t + d[x], 0) >= 6) continue; d[id]++; left--; }
  return left ? null : d;
}
const t0 = Date.now(), seen = new Set(), samples = [];
console.log(code, `target ${T} (${LO}-${HI}) size ${f.S}${f.side ? ' side min ' + sideMin : ''} pool ${pool.length} live`, JSON.stringify(n.deck));
for (let tries = 0; tries < 400000 && samples.length < N; tries++) { const d = sample(); if (!d) continue; const k = L.keyOf(d); if (seen.has(k)) continue; seen.add(k); if (legal(d)) samples.push({ d }); }
console.log(`sampled ${samples.length} legal decks (${seen.size} distinct tried) in ${Math.round((Date.now() - t0) / 1000)}s`);
if (!samples.length) { log({ phase: 'result', key: code, none: true }); console.log('RESULT', code, 'NO LEGAL DECK SAMPLED'); process.exit(0); }
samples.forEach(s => { s.w = win(s.d, GS, SEED1); });
const ws = samples.map(s => s.w).sort((x, y) => x - y), q = p => ws[Math.min(ws.length - 1, Math.floor(p * ws.length))];
console.log(`sample reads (${GS} games): min ${ws[0]} p10 ${q(0.1)} median ${q(0.5)} p90 ${q(0.9)} max ${ws[ws.length - 1]} (${Math.round((Date.now() - t0) / 1000)}s)`);
// ridge fit: win = b0 + sum_i b_i * copies_i
const ids = pool, P = ids.length + 1, lam = 2;
const row = d => [1].concat(ids.map(id => d[id] || 0));
const A = Array.from({ length: P }, () => new Array(P).fill(0)), bv = new Array(P).fill(0);
samples.forEach(s => { const r = row(s.d); for (let i = 0; i < P; i++) { bv[i] += r[i] * s.w; for (let j = 0; j < P; j++) A[i][j] += r[i] * r[j]; } });
for (let i = 1; i < P; i++) A[i][i] += lam * samples.length / 50;
const solve = (M, v) => { const n2 = v.length, Mx = M.map((r, i) => r.concat([v[i]])); for (let c = 0; c < n2; c++) { let p = c; for (let r = c + 1; r < n2; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r; [Mx[c], Mx[p]] = [Mx[p], Mx[c]];
  const pv = Mx[c][c] || 1e-9; for (let r = 0; r < n2; r++) if (r !== c) { const fct = Mx[r][c] / pv; for (let k = c; k <= n2; k++) Mx[r][k] -= fct * Mx[c][k]; } } return Mx.map((r, i) => r[n2] / (r[i] || 1e-9)); };
const beta = solve(A, bv), pred = d => row(d).reduce((t, x, i) => t + x * beta[i], 0);
const eff = ids.map((id, i) => [id, Math.round(beta[i + 1] * 10) / 10]).sort((x, y) => x[1] - y[1]);
console.log('per copy (model):', eff.map(([id, b]) => `${id} ${b}`).join(', '));
// hill climb on the model: moves of 1-4 copies of one card for another (or out, on a side deck), two steps at a time
const moves = d => { const out = []; for (const o of Object.keys(d)) for (const k of [1, 2, 3, 4]) { if (d[o] < k) continue;
  for (const i of pool) { if (i === o) continue; const nd = Object.assign({}, d); nd[o] -= k; if (!nd[o]) delete nd[o]; nd[i] = (nd[i] || 0) + k; out.push(nd); }
  if (f.side && L.size(d) - k >= sideMin) { const nd = Object.assign({}, d); nd[o] -= k; if (!nd[o]) delete nd[o]; out.push(nd); } } return out; };
// the climb aims past the target by --margin (a fit shrinks toward the mean), and also at the far end in the fight's direction
const predicted = new Map(), dir = Math.sign(T - win(n.deck, GP, SEED1)) || 1, MARGIN = +arg('--margin', 6);
for (const Tc of [T + dir * MARGIN, T + dir * 1000]) { const offc = p => Math.abs(p - Tc);
  const starts = samples.slice().sort((x, y) => offc(pred(x.d)) - offc(pred(y.d))).slice(0, STARTS).map(s => s.d).concat([n.deck].filter(legal));
  for (const s0 of starts) { let cur = s0, pc = pred(cur);
    for (let step = 0; step < 10; step++) { let best = null; for (const d1 of moves(cur)) { const k = L.keyOf(d1); if (predicted.has(k)) continue;
        const p1 = pred(d1); if (best && offc(p1) >= offc(best.p)) continue; if (!legal(d1)) { predicted.set(k, null); continue; } best = { d: d1, p: p1 }; }
      if (!best || offc(best.p) >= offc(pc)) break; cur = best.d; pc = best.p; predicted.set(L.keyOf(cur), { d: cur, p: pc }); } } }
const pv = [...predicted.values()].filter(Boolean), pk = new Set(), plist = [];
pv.slice().sort((x, y) => Math.abs(x.p - T - dir * MARGIN) - Math.abs(y.p - T - dir * MARGIN)).slice(0, Math.ceil(PRED / 2)).concat(pv.slice().sort((x, y) => dir * (y.p - x.p)).slice(0, PRED))
  .forEach(p => { const k = L.keyOf(p.d); if (!pk.has(k) && plist.length < PRED) { pk.add(k); plist.push(p); } });
plist.forEach(p => { p.w = win(p.d, GP, SEED1); });
console.log(`model: ${predicted.size} decks visited, ${plist.length} read at ${GP}: ` + plist.slice(0, 6).map(p => `${Math.round(p.p)}/${p.w}`).join(' '));
// re-read the nearest at G2 on seed2 (the samples' nearest re-read at GP first)
const sNear = samples.slice().sort((x, y) => off(x.w) - off(y.w)).slice(0, PRED); sNear.forEach(s => { s.w = win(s.d, GP, SEED1); });
const cand = sNear.concat(plist).sort((x, y) => off(x.w) - off(y.w)), top = [], tk = new Set();
for (const c of cand) { const k = L.keyOf(c.d); if (tk.has(k)) continue; tk.add(k); top.push(c); if (top.length >= TOP) break; }
top.forEach(c => { c.w2 = win(c.d, G2, SEED2); }); const live2 = win(n.deck, G2, SEED2); top.sort((x, y) => off(x.w2) - off(y.w2));
console.log(`re-read (${G2} games, seed ${SEED2}): live ${live2}; ` + top.map(c => `${JSON.stringify(c.d)} ${c.w}/${c.w2}`).join(' | '));
const b = top[0], better = off(b.w2) < off(live2) - 1;
log({ phase: 'result', key: code, target: T, lo: LO, hi: HI, live2, best: b.d, w1: b.w, w2: b.w2, better, samples: samples.length, dist: { min: ws[0], p10: q(0.1), med: q(0.5), p90: q(0.9), max: ws[ws.length - 1] }, eff, top: top.map(c => ({ deck: c.d, w1: c.w, w2: c.w2 })), fx: Object.keys(fx), s: Math.round((Date.now() - t0) / 1000) });
if (arg('--accept')) fs.appendFileSync(arg('--accept'), JSON.stringify({ key: code, deck: better ? b.d : null, shieldOverride: null, hqHp: null, tune: { w2: better ? b.w2 : live2, live2, seed2: SEED2, games: G2 }, moves: better ? ['wide -> ' + JSON.stringify(b.d)] : [] }) + '\n');
console.log('RESULT', code, better ? JSON.stringify(b.d) : 'live kept', better ? b.w2 : live2, `live ${live2} target ${T} (${LO}-${HI}) ${Math.round((Date.now() - t0) / 1000)}s`);
