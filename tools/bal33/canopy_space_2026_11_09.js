#!/usr/bin/env node
// 2026-11-09 (package BAL33): BAL28's whole-space search (below, unchanged) on tools/bal33/road_tune_2026_11_09.js; output
// docs/balance/bal33/space/<code>.json (apply: node tools/bal33/road_tune_2026_11_09.js apply --dir space).
// 2026-11-08 (package BAL28): The Canopy's fights sit 40-90 points under their targets and the road tuner's one-card steps read flat there
// (0-10%), so this walks each fight's whole legal deck space instead, under the tuner's own rules (tools/bal28/road_tune_2026_11_08.js
// setup().legal: the fight's own list and the road's rarity cap, the theme, no other fight's reward, size and first-clear cards kept, copy
// caps, K14 no worse, the challenge / CONTENT10 safeguards). Every legal deck (or a seeded sample of --sample when there are more) is screened
// at 20 games on the tune seeds (--seed0, default 11300) with the Shield at 0 (every Canopy fight is too hard, and 0 is inside the rule),
// the best 6 re-read at 60, then the leader options (the tuner's leaderCands) on the best; the pick plays 200 games on the road seeds
// (9100 + 37g) against the fight as it stands and is kept only when 2+ points nearer its target there (the tuner's keep rule). The Shield is
// then raised back toward the rule while the pick stays in band (a fight too easy). Output docs/balance/bal28/space/<code>.json, in the
// tuner's format, so `node tools/bal28/road_tune_2026_11_08.js apply --dir space` writes the kept picks.
//   node tools/bal28/canopy_space_2026_11_08.js --codes 14-A-1,... [--sample 160] [--seed0 11300]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CODES = (arg('--codes', '') || '').split(',').filter(Boolean), SAMPLE = +arg('--sample', 160), SEED0 = +arg('--seed0', 11300);
const T = require('./road_tune_2026_11_09.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'bal33', arg('--dir', 'space'));
const size = d => Object.values(d).reduce((t, k) => t + k, 0), keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
let rs = 12345; const rnd = () => (rs = (rs * 1103515245 + 12345) % 2147483648) / 2147483648;

function space(F) {
  const S0 = size(F.node0.deck), ids = F.ins, out = [], LIMIT = 400000; let seen = 0;
  const cur = {};
  (function dfs(i, left) {
    if (seen > LIMIT) return;
    if (i === ids.length) { if (left === 0) { seen++; const d = Object.assign({}, cur); if (F.legal(d, null)) out.push(d); } return; }
    const id = ids[i], cap = F.cap(id);
    for (let k = Math.min(cap, left); k >= 0; k--) { if (k) cur[id] = k; else delete cur[id]; dfs(i + 1, left - k); }
    delete cur[id];
  })(0, S0);
  return { decks: out, truncated: seen > LIMIT };
}
for (const code of CODES) {
  const F = T.setup(code), t0 = Date.now(), want = F.want, gap = x => Math.abs(x - want);
  const sp = space(F); let pool = sp.decks;
  if (pool.length > SAMPLE) { const p = pool.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } pool = p.slice(0, SAMPLE); }
  const sh0 = F.MAP === 'mpd' ? null : 0;
  const screened = pool.map(d => ({ v: { deck: d, leaders: null, shield: sh0 } })).map(c => Object.assign(c, { r: T.measure(F, c.v, 20, SEED0) }))
    .sort((p, q) => gap(p.r.win) - gap(q.r.win)).slice(0, 6).map(c => Object.assign(c, { r: T.measure(F, c.v, 60, SEED0) })).sort((p, q) => gap(p.r.win) - gap(q.r.win));
  let best = screened[0];
  for (const id of F.leaderCands) { const v = Object.assign({}, best.v, { leaders: id ? [id] : [] }); if (!F.legal(v.deck, v.leaders)) continue; const r = T.measure(F, v, 60, SEED0); if (gap(r.win) + 2 <= gap(best.r.win)) best = { v, r }; }
  const orig = { deck: F.node0.deck, leaders: null, shield: null };
  const was = T.measure(F, orig, 200, 9100); let now = T.measure(F, best.v, 200, 9100);
  // a pick past its band: give back Shield toward the rule while it stays at or above the band's top
  const rule = F.ov0 != null ? F.ov0 : F.rule;
  if (best.v.shield != null && now.win > F.hi) for (const s of [rule, Math.ceil(rule * 3 / 4), Math.ceil(rule / 2), Math.ceil(rule / 4)]) { if (s <= best.v.shield) continue; const v = Object.assign({}, best.v, { shield: s }), r = T.measure(F, v, 200, 9100); if (gap(r.win) < gap(now.win)) { best = { v, r }; now = r; break; } }
  if (best.v.shield != null && best.v.shield === (F.ov0 != null ? F.ov0 : null)) best.v.shield = null;
  const changed = keyOf(best.v.deck) !== keyOf(orig.deck) || best.v.leaders || best.v.shield != null, keep = changed && gap(now.win) + 2 <= gap(was.win);
  const desc = v => ({ deck: v.deck, leaders: v.leaders || F.leaders0, shieldOverride: v.shield == null ? F.ov0 : v.shield });
  const res = { about: 'BAL33 whole-space search (tools/bal33/canopy_space_2026_11_09.js)', code, map: F.MAP, mapName: F.m.name, kind: F.kind, name: F.node0.name,
    band: { lo: F.lo, hi: F.hi, target: want }, list: F.ins, firstClear: F.first, k14Before: F.K0, leaders: F.leaders0, namesake: F.namesake, shieldRule: F.rule, shieldOverride: F.ov0,
    space: sp.decks.length, truncated: sp.truncated, screened: pool.length, top: screened.map(c => ({ deck: c.v.deck, tune60: c.r.win })),
    before: Object.assign(desc(orig), { win200: was.win }), pick: Object.assign(desc(best.v), { win200: now.win, tune60: best.r.win }), keep, k14After: F.k14(best.v.deck),
    trail: [{ move: 'start', win: was.win }, { move: 'space pick', win: now.win }], sec: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(res, null, 1) + '\n');
  console.log(code, 'target', want, 'space', sp.decks.length, sp.truncated ? '(truncated)' : '', '| 200 games:', was.win, '->', now.win, keep ? 'KEEP' : 'no', JSON.stringify(desc(best.v)), res.sec + 's');
}
