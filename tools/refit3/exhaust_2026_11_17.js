#!/usr/bin/env node
// 2026-11-17 (package REFIT3): every legal deck of one road fight (small pools), each read; the widest legal search there is.
// Enumerates all decks of the fight's size (a side deck also down to its size - 4) from its pool within the copy caps, the kept cards' floors,
// the distinct-card range and K14's 6 carried copies; keeps those with problemsFull no worse than the live deck's (tools/legal1: SKIR1's rules
// under SIDE2's holds, the map lines, with --fx decks) and the fight's leaders unchanged. All read at --g1 games on --seed1 (an even spread of
// --max if more), the --mid nearest at --gm, the --top nearest at --g2 on --seed2 (the live deck too). The result line goes to --accept.
//   node tools/refit3/exhaust_2026_11_17.js --code 2-B-1 [--fx f.jsonl] [--accept f.jsonl] [--g1 20] [--gm 80] [--g2 300] [--max 2500]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), G1 = +arg('--g1', 20), GM = +arg('--gm', 80), G2 = +arg('--g2', 300), MAX = +arg('--max', 2500), MID = +arg('--mid', 40), TOP = +arg('--top', 6);
const SEED1 = +arg('--seed1', 67300), SEED2 = +arg('--seed2', 68300);
const OUT = arg('--out', path.join(ROOT, 'docs', 'balance', 'refit3', 'exhaust-2026-11-17.jsonl'));
const rd = f => f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const fx = {}; rd(arg('--fx')).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const band = rd(path.join(ROOT, 'docs/balance/refit3/road/live-s7600.jsonl')).find(x => x.key === code), T = band.target, { m, n, f } = X.byCode[code];
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const P0 = new Set(X.problemsFull(code, n.deck, {}));
const legal = d => !X.problemsFull(code, d, fx).filter(x => !P0.has(x)).length && leadersOf(d) === lead0;
const carried = id => !!(f.U && !f.U.has(id) && !f.L0.includes(id)), capOf = id => carried(id) ? Math.min(f.cap(id), f.carriedMax) : f.cap(id);
const pool = f.pool.slice(), lo = id => f.keep.get(id) || 0, sideMin = f.side ? Math.max(10, f.S - 4) : f.S;
const t0 = Date.now(), all = []; let tried = 0;
for (let S = sideMin; S <= f.S; S++) {
  const d = {}; const rec = (i, left, nd, nc) => { if (all.length > 400000) return;
    if (i === pool.length) { if (left === 0 && nd >= f.dMin && nd <= f.dMax) { tried++; const dd = Object.assign({}, d); if (legal(dd)) all.push(dd); } return; }
    const id = pool[i], c = carried(id); for (let k = lo(id); k <= capOf(id); k++) { if (k > left) break; if (k && nd + 1 > f.dMax) break; if (c && nc + k > 6) break;
      if (k) d[id] = k; rec(i + 1, left - k, nd + (k ? 1 : 0), nc + (c ? k : 0)); delete d[id]; } };
  rec(0, S, 0, 0); }
console.log(code, `target ${T} (${band.lo}-${band.hi}) pool ${pool.length} size ${sideMin}-${f.S}: ${tried} decks in the rules' shape, ${all.length} legal (${Math.round((Date.now() - t0) / 1000)}s)`);
if (!all.length) { console.log('RESULT', code, 'NO LEGAL DECK'); process.exit(0); }
if (a.includes('--count')) process.exit(0);
const win = (d, g, s) => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, g, { seed0: s }).win * 1000) / 10; };
let list = all; if (list.length > MAX) list = Array.from({ length: MAX }, (_, i) => all[Math.floor(i * all.length / MAX)]);
const r = list.map(d => ({ d, w1: win(d, G1, SEED1) })), ws = r.map(x => x.w1).sort((x, y) => x - y);
console.log(`read ${r.length} at ${G1}: min ${ws[0]} median ${ws[Math.floor(ws.length / 2)]} max ${ws[ws.length - 1]} (${Math.round((Date.now() - t0) / 1000)}s)`);
const off = w => Math.abs(w - T), dir = Math.sign(T - win(n.deck, GM, SEED1)) || 1;
// the nearest and the far end in the fight's direction (a 20-game read is +-20)
const pick = new Map(); r.slice().sort((x, y) => off(x.w1) - off(y.w1)).slice(0, MID / 2).concat(r.slice().sort((x, y) => dir * (y.w1 - x.w1)).slice(0, MID / 2)).forEach(x => pick.set(L.keyOf(x.d), x));
const mid = [...pick.values()]; mid.forEach(x => { x.wm = win(x.d, GM, SEED1); }); mid.sort((x, y) => off(x.wm) - off(y.wm));
const mws = mid.map(x => x.wm).sort((x, y) => x - y);
console.log(`re-read ${mid.length} at ${GM}: range ${mws[0]}-${mws[mws.length - 1]}; nearest ` + mid.slice(0, 5).map(x => x.wm).join(' '));
const top = mid.slice(0, TOP); top.forEach(x => { x.w2 = win(x.d, G2, SEED2); }); top.sort((x, y) => off(x.w2) - off(y.w2)); const live2 = win(n.deck, G2, SEED2);
console.log(`top at ${G2} (seed ${SEED2}), live ${live2}: ` + top.map(x => `${JSON.stringify(x.d)} ${x.wm}/${x.w2}`).join(' | '));
const b = top[0], better = off(b.w2) < off(live2) - 1;
fs.appendFileSync(OUT, JSON.stringify({ code, t: new Date().toISOString(), target: T, tried, legal: all.length, read: r.length, range1: [ws[0], ws[ws.length - 1]], rangeM: [mws[0], mws[mws.length - 1]], live2, top: top.map(x => ({ deck: x.d, wm: x.wm, w2: x.w2 })) }) + '\n');
if (arg('--accept')) fs.appendFileSync(arg('--accept'), JSON.stringify({ key: code, deck: better ? b.d : null, shieldOverride: null, hqHp: null, tune: { w2: better ? b.w2 : live2, live2, seed2: SEED2, games: G2 }, moves: better ? ['exhaust -> ' + JSON.stringify(b.d)] : [] }) + '\n');
console.log('RESULT', code, better ? JSON.stringify(b.d) : 'live kept', better ? b.w2 : live2, `live ${live2} target ${T} ${Math.round((Date.now() - t0) / 1000)}s`);
