#!/usr/bin/env node
// 2026-11-10 (package BAL35): BAL33's whole-space search (below, its rules unchanged) on tools/bal35/road_tune_2026_11_10.js for any road
// fight, both ways: the fight as it stands is read first (200 games, road seeds); a fight too easy is screened with its Shield as it has it
// (the tuner raises a Shield only up to the rule, and Thistlewood's are at it), a fight too hard with the Shield at 0 as before. Output
// docs/balance/bal35/space/<code>.json (apply: node tools/bal35/road_tune_2026_11_10.js apply --dir space).
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
const T = require('./road_tune_2026_11_10.js'), K14 = require('../bal7_k14_decks_2026_10_28.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'bal35', arg('--dir', 'space'));
const size = d => Object.values(d).reduce((t, k) => t + k, 0), keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
let rs = 12345; const rnd = () => (rs = (rs * 1103515245 + 12345) % 2147483648) / 2147483648;

function space(F) {
  const S0 = size(F.node0.deck), ids = F.ins, out = [], LIMIT = 400000; let seen = 0;
  // BAL35: prune with K14's per-card cap (a card not unique to the map keeps at most max(1, its copies now); setup().legal still decides)
  // and the distinct-card ceiling (7 on a skirmish, 8 otherwise), so a 13-14 card list (Thistlewood) is walked whole, not truncated
  const U = F.MAP === 'm1' || /^T-/.test(F.code) ? null : K14.uniqueOf(F.MAP), dMax = F.kind === 'skirmish' ? Math.max(6, Object.keys(F.node0.deck).length) : Math.max(8, Object.keys(F.node0.deck).length);
  const capOf = id => U && !U.has(id) && !(F.leaders0 || []).includes(id) ? Math.min(F.cap(id), Math.max(1, F.node0.deck[id] || 0)) : F.cap(id);
  const cur = {}; let nd = 0;
  (function dfs(i, left) {
    if (seen > LIMIT) return;
    if (i === ids.length) { if (left === 0) { seen++; const d = Object.assign({}, cur); if (F.legal(d, null)) out.push(d); } return; }
    const id = ids[i], cap = capOf(id), rest = ids.slice(i + 1).reduce((t, x) => t + capOf(x), 0);
    for (let k = Math.min(cap, left); k >= 0; k--) { if (left - k > rest) break; if (k && nd >= dMax) continue; if (k) { cur[id] = k; nd++; } else delete cur[id]; dfs(i + 1, left - k); if (k) nd--; }
    delete cur[id];
  })(0, S0);
  return { decks: out, truncated: seen > LIMIT };
}
if (require.main === module && a.includes('--count')) { for (const code of CODES) { const sp = space(T.setup(code)); console.log(code, 'legal decks', sp.decks.length, sp.truncated ? '(truncated)' : ''); } process.exit(0); } // BAL35: sizes only
if (require.main === module) for (const code of CODES) { // BAL35: not when required by road_exhaust
  const F = T.setup(code), t0 = Date.now(), want = F.want, gap = x => Math.abs(x - want);
  const sp = space(F); let pool = sp.decks;
  if (pool.length > SAMPLE) { const p = pool.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } pool = p.slice(0, SAMPLE); }
  const was0 = T.measure(F, { deck: F.node0.deck, leaders: null, shield: null }, 200, 9100); // BAL35: which way the fight is off
  const sh0 = F.MAP === 'mpd' || was0.win > want ? null : 0;
  const screened = pool.map(d => ({ v: { deck: d, leaders: null, shield: sh0 } })).map(c => Object.assign(c, { r: T.measure(F, c.v, 20, SEED0) }))
    .sort((p, q) => gap(p.r.win) - gap(q.r.win)).slice(0, 6).map(c => Object.assign(c, { r: T.measure(F, c.v, 60, SEED0) })).sort((p, q) => gap(p.r.win) - gap(q.r.win));
  let best = screened[0];
  for (const id of F.leaderCands) { const v = Object.assign({}, best.v, { leaders: id ? [id] : [] }); if (!F.legal(v.deck, v.leaders)) continue; const r = T.measure(F, v, 60, SEED0); if (gap(r.win) + 2 <= gap(best.r.win)) best = { v, r }; }
  const orig = { deck: F.node0.deck, leaders: null, shield: null };
  const was = was0; let now = T.measure(F, best.v, 200, 9100);
  // a pick past its band: give back Shield toward the rule while it stays at or above the band's top
  const rule = F.ov0 != null ? F.ov0 : F.rule;
  if (best.v.shield != null && now.win > F.hi) for (const s of [rule, Math.ceil(rule * 3 / 4), Math.ceil(rule / 2), Math.ceil(rule / 4)]) { if (s <= best.v.shield) continue; const v = Object.assign({}, best.v, { shield: s }), r = T.measure(F, v, 200, 9100); if (gap(r.win) < gap(now.win)) { best = { v, r }; now = r; break; } }
  if (best.v.shield != null && best.v.shield === (F.ov0 != null ? F.ov0 : null)) best.v.shield = null;
  const changed = keyOf(best.v.deck) !== keyOf(orig.deck) || best.v.leaders || best.v.shield != null, keep = changed && gap(now.win) + 2 <= gap(was.win);
  const desc = v => ({ deck: v.deck, leaders: v.leaders || F.leaders0, shieldOverride: v.shield == null ? F.ov0 : v.shield });
  const res = { about: 'BAL35 whole-space search (tools/bal35/road_space_2026_11_10.js)', code, map: F.MAP, mapName: F.m.name, kind: F.kind, name: F.node0.name,
    band: { lo: F.lo, hi: F.hi, target: want }, list: F.ins, firstClear: F.first, k14Before: F.K0, leaders: F.leaders0, namesake: F.namesake, shieldRule: F.rule, shieldOverride: F.ov0,
    space: sp.decks.length, truncated: sp.truncated, screened: pool.length, top: screened.map(c => ({ deck: c.v.deck, tune60: c.r.win })),
    before: Object.assign(desc(orig), { win200: was.win }), pick: Object.assign(desc(best.v), { win200: now.win, tune60: best.r.win }), keep, k14After: F.k14(best.v.deck),
    trail: [{ move: 'start', win: was.win }, { move: 'space pick', win: now.win }], sec: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(res, null, 1) + '\n');
  console.log(code, 'target', want, 'space', sp.decks.length, sp.truncated ? '(truncated)' : '', '| 200 games:', was.win, '->', now.win, keep ? 'KEEP' : 'no', JSON.stringify(desc(best.v)), res.sec + 's');
}
module.exports = { space }; // BAL35: tools/bal35/road_exhaust_2026_11_10.js walks the same space
