#!/usr/bin/env node
// 2026-11-10 (package BAL35): the whole-space search with more games. tools/bal35/road_space_2026_11_10.js screens a sample at 20 games and
// re-reads 6 at 60, and on fights 15-50 points off its picks read worse at 200 (the screen's noise picks them). Small spaces (Basalt Foundry
// 18-95 legal decks, 14-1 40, 14-6 272) can be read whole at more games: every legal deck (or a seeded sample of --sample) plays --g1 games
// (default 60) on the tune seeds (--seed0, default 11300), the best --top (8) re-read at 200 on the same seeds, then the tuner's leader
// options on the best 3 at 200. The one pick then plays 200 games on the road seeds (9100 + 37g) against the fight as it stands and is kept
// only when 2+ points nearer the target there (the tuner's keep rule, unchanged). Shield: 0 on a fight too hard (inside the rule), as it has
// it on one too easy. Same rules as the tuner (setup().legal). Output docs/balance/bal35/exhaust/<code>.json in the tuner's format
// (apply: node tools/bal35/road_tune_2026_11_10.js apply --dir exhaust).
//   node tools/bal35/road_exhaust_2026_11_10.js --codes 19-A-3,... [--g1 60] [--top 8] [--sample 400]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CODES = (arg('--codes', '') || '').split(',').filter(Boolean), G1 = +arg('--g1', 60), TOP = +arg('--top', 8), SAMPLE = +arg('--sample', 400), SEED0 = +arg('--seed0', 11300);
const T = require('./road_tune_2026_11_10.js'), SP = require('./road_space_2026_11_10.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'bal35', arg('--dir', 'exhaust'));
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
let rs = 4242; const rnd = () => (rs = (rs * 1103515245 + 12345) % 2147483648) / 2147483648;
for (const code of CODES) {
  const F = T.setup(code), t0 = Date.now(), want = F.want, gap = x => Math.abs(x - want);
  const orig = { deck: F.node0.deck, leaders: null, shield: null }, was = T.measure(F, orig, 200, 9100);
  const sh = F.MAP === 'mpd' || was.win > want ? null : 0;
  const sp = SP.space(F); let pool = sp.decks;
  if (pool.length > SAMPLE) { const p = pool.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } pool = p.slice(0, SAMPLE); }
  if (!pool.some(d => keyOf(d) === keyOf(orig.deck))) pool.push(orig.deck);
  const s1 = pool.map(d => ({ v: { deck: d, leaders: null, shield: sh } })).map(c => Object.assign(c, { r: T.measure(F, c.v, G1, SEED0) })).sort((p, q) => gap(p.r.win) - gap(q.r.win));
  const s2 = s1.slice(0, TOP).map(c => Object.assign({}, c, { r: T.measure(F, c.v, 200, SEED0) })).sort((p, q) => gap(p.r.win) - gap(q.r.win));
  const s3 = s2.slice();
  for (const c of s2.slice(0, 3)) for (const id of F.leaderCands) { const v = Object.assign({}, c.v, { leaders: id ? [id] : [] }); if (!F.legal(v.deck, v.leaders)) continue; s3.push({ v, r: T.measure(F, v, 200, SEED0) }); }
  s3.sort((p, q) => gap(p.r.win) - gap(q.r.win));
  const best = s3[0];
  if (best.v.shield != null && best.v.shield === (F.ov0 != null ? F.ov0 : null)) best.v.shield = null;
  const changed = keyOf(best.v.deck) !== keyOf(orig.deck) || !!best.v.leaders || best.v.shield != null;
  const now = changed ? T.measure(F, best.v, 200, 9100) : was, keep = changed && gap(now.win) + 2 <= gap(was.win);
  const desc = v => ({ deck: v.deck, leaders: v.leaders || F.leaders0, shieldOverride: v.shield == null ? F.ov0 : v.shield });
  const wins = s1.map(c => c.r.win);
  const res = { about: 'BAL35 whole-space read (tools/bal35/road_exhaust_2026_11_10.js)', code, map: F.MAP, mapName: F.m.name, kind: F.kind, name: F.node0.name,
    band: { lo: F.lo, hi: F.hi, target: want }, list: F.ins, firstClear: F.first, k14Before: F.K0, leaders: F.leaders0, namesake: F.namesake, shieldRule: F.rule, shieldOverride: F.ov0,
    space: sp.decks.length, read: pool.length, g1: G1, range: { min: Math.min(...wins), max: Math.max(...wins) },
    top: s3.slice(0, 6).map(c => ({ deck: c.v.deck, leaders: c.v.leaders, tune200: c.r.win })),
    before: Object.assign(desc(orig), { win200: was.win }), pick: Object.assign(desc(best.v), { win200: now.win, tune200: best.r.win }), keep, k14After: F.k14(best.v.deck),
    trail: [{ move: 'start', win: was.win }, { move: 'whole-space pick', win: now.win }], sec: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(res, null, 1) + '\n');
  console.log(code, 'target', want, 'space', sp.decks.length, 'read', pool.length, 'range', res.range.min, '-', res.range.max, '| 200 games:', was.win, '->', now.win, keep ? 'KEEP' : 'no', JSON.stringify(desc(best.v)), res.sec + 's');
}
