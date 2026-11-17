#!/usr/bin/env node
// 2026-11-17 (package REFIT3): the decks REFIT2 and REFIT3's searches read nearest a fight's target (search logs: REFIT2 search, REFIT3 wide,
// polish and exhaust), re-checked for legality now (tools/legal1 problemsFull no worse than live, leaders kept, with --fx decks) and read
// again at --games on a screen seed (not a verify seed). Prints them nearest first; --out appends the in-band ones as fix lines.
//   node tools/refit3/harvest_2026_11_17.js --codes 11-9,12-4 [--per 8] [--games 400] [--seed 95100] [--fx f.jsonl] [--out f.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const PER = +arg('--per', 8), N = +arg('--games', 400), SEED = +arg('--seed', 95100);
const rd = f => fs.existsSync(path.resolve(ROOT, f)) ? fs.readFileSync(path.resolve(ROOT, f), 'utf8').trim().split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean) : [];
const logs = ['docs/balance/refit2/search-2026-11-17.jsonl', 'docs/balance/refit3/wide-2026-11-17.jsonl', 'docs/balance/refit3/polish-2026-11-17.jsonl', 'docs/balance/refit3/exhaust-2026-11-17.jsonl'];
const fx = {}; rd(arg('--fx', '-')).forEach(x => { if (x.deck) fx[x.key] = x.deck; });
const bands = {}; rd('docs/balance/refit3/road/live-s7600.jsonl').forEach(r => { bands[r.key] = r; });
for (const code of arg('--codes').split(',')) {
  const b = bands[code], T = b.target, { m, n } = X.byCode[code], cands = new Map();
  const add = (d, w, src) => { if (!d || w == null) return; const k = L.keyOf(d), c = cands.get(k); if (!c || Math.abs(w - T) < Math.abs(c.w - T)) cands.set(k, { d, w, src }); };
  logs.forEach(f => rd(f).filter(x => (x.code || x.key) === code).forEach(x => {
    (x.top || []).forEach(t => add(t.deck, t.w2 != null ? t.w2 : t.wm, f.split('/').pop()));
    if (x.phase === 'result') add(x.deck || x.best, x.w2, f.split('/').pop()); }));
  const oth = Object.assign({}, fx); delete oth[code];
  const P0 = new Set(X.problemsFull(code, n.deck, {})), lead = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, l0 = lead(n.deck);
  const ok = d => !X.problemsFull(code, d, oth).filter(x => !P0.has(x)).length && lead(d) === l0;
  const list = [...cands.values()].filter(c => ok(c.d)).sort((x, y) => Math.abs(x.w - T) - Math.abs(y.w - T)).slice(0, PER);
  const win = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10; };
  const live = win(n.deck); list.forEach(c => { c.s = win(c.d); }); list.sort((x, y) => Math.abs(x.s - T) - Math.abs(y.s - T));
  console.log(`${code} target ${T} (${b.lo}-${b.hi}) live ${live} at ${N} on ${SEED}; ${cands.size} decks in the logs, ${list.length} read`);
  list.forEach(c => console.log(`  ${c.s >= b.lo && c.s <= b.hi ? 'IN ' : '   '} ${c.s} (log ${c.w}, ${c.src}) ${JSON.stringify(c.d)}`));
  if (arg('--out')) list.filter(c => c.s >= b.lo && c.s <= b.hi).slice(0, 1).forEach(c => fs.appendFileSync(arg('--out'), JSON.stringify({ key: code, deck: c.d, shieldOverride: null, hqHp: null, apply: false, src: 'harvest', screen: { seed: SEED, games: N, win: c.s, live } }) + '\n'));
}
