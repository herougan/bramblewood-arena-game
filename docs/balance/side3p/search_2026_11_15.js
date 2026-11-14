#!/usr/bin/env node
// 2026-11-15 (package SIDE3P, scratch only): local search for a legal side-fight deck under SIDE2-2 e (run under
// tools/whatif1/rules_2026_11_14.js --carried 2, in the side2p-e scratch copy whose decks are already the smaller ones).
// Moves: k copies (1..3) of one card for one pool card, or two different 1-copy swaps; every candidate must pass lib_fight legal().
// Round: all candidates at --g1 games (tune seeds --seed0, default 11300), top --top re-read at --g2; keep the best if 1+ point nearer.
//   node tools/side3p_search.js --code X [--rounds 4] [--g1 60] [--g2 300] [--top 4] [--seed0 11300]
'use strict';
const fs = require('fs'), path = require('path');
require('./side2/holds_2026_11_13.js').patch();
const L = require('./skir1/lib_fight_2026_11_11.js'), G = L.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), R = +arg('--rounds', 4), G1 = +arg('--g1', 60), G2 = +arg('--g2', 300), TOP = +arg('--top', 4), SEED = +arg('--seed0', 11300);
const OUT = path.join(__dirname, '..', 'side3p-search.jsonl');
function find(c) { for (const m of L.maps()) { const n = L.fightsOf(m).find(x => x.key === c); if (n) return { m, n }; } throw new Error('no fight ' + c); }
const { m, n } = find(code), f = L.fight(m, n);
const b = G.skirmishTargetBand(m.id, n), drop = n.challenge && b.curve ? 0.10 : 0, T = Math.round((b.t - drop) * 1000) / 10;
function win(deck, games) { const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id);
  const ctx = G.referenceFightSetup(m.id, nn, { seed0: SEED }); let w = 0; for (let g = 0; g < games; g++) if (G.playReferenceGame(ctx, g).win) w++; return Math.round(w / games * 1000) / 10; }
function neigh(d0) {
  const out = new Map(), ids = [...new Set(Object.keys(d0).concat(f.pool))];
  const add = (d, mv) => { Object.keys(d).forEach(k => { if (!d[k]) delete d[k]; }); const key = L.keyOf(d); if (!out.has(key) && key !== L.keyOf(d0) && f.legal(d)) out.set(key, { deck: d, move: mv }); };
  for (const k of [1, 2, 3]) for (const o of Object.keys(d0)) for (const i of ids) { if (i === o || d0[o] < k) continue; const d = Object.assign({}, d0); d[o] -= k; d[i] = (d[i] || 0) + k; add(d, `-${k} ${o} +${k} ${i}`); }
  for (const o1 of ids) for (const o2 of ids) for (const i1 of ids) for (const i2 of ids) {
    if (o1 >= o2 || i1 > i2 || [o1, o2].some(o => o === i1 || o === i2)) continue; if (!(d0[o1] >= 1 && d0[o2] >= 1)) continue;
    const d = Object.assign({}, d0); d[o1]--; d[o2]--; d[i1] = (d[i1] || 0) + 1; d[i2] = (d[i2] || 0) + 1; add(d, `-1 ${o1} -1 ${o2} +1 ${i1} +1 ${i2}`); }
  return [...out.values()];
}
let cur = Object.assign({}, n.deck), curW = win(cur, G2), path_ = [];
console.log(code, 'target', T, 'start', JSON.stringify(cur), curW, '(seed0', SEED + ')');
for (let r = 1; r <= R && Math.abs(curW - T) > 3; r++) {
  const cs = neigh(cur); cs.forEach(c => { c.w1 = win(c.deck, G1); });
  cs.sort((x, y) => Math.abs(x.w1 - T) - Math.abs(y.w1 - T));
  const top = cs.slice(0, TOP); top.forEach(c => { c.w2 = win(c.deck, G2); });
  top.sort((x, y) => Math.abs(x.w2 - T) - Math.abs(y.w2 - T));
  console.log(`round ${r}: ${cs.length} legal moves; top: ` + top.map(c => `${c.move} ${c.w1}/${c.w2}`).join(' | '));
  fs.appendFileSync(OUT, JSON.stringify({ code, round: r, seed0: SEED, target: T, from: cur, fromWin: curW, top: top.map(c => ({ move: c.move, deck: c.deck, w1: c.w1, w2: c.w2 })) }) + '\n');
  const best = top[0]; if (!best || Math.abs(best.w2 - T) > Math.abs(curW - T) - 1) { console.log('no nearer move'); break; }
  cur = best.deck; curW = best.w2; path_.push(best.move);
}
console.log('RESULT', code, JSON.stringify(cur), curW, 'moves:', path_.join(' ; '), 'problems:', JSON.stringify(f.problems(cur)));
