#!/usr/bin/env node
// 2026-11-11 (package SKIR2): a wider re-fit for a fight SKIR1's local fit (tools/skir1/fit_2026_11_11.js: 1-2 copy moves, up to 5 rounds) leaves
// far off its band: a re-draw. --n legal decks are drawn with SKIR1's own deck fill (tools/skir1/build_2026_11_11.js fill: the fight's kept cards,
// its pool, size, caps, K14, boon) from 5-7 pool cards picked by stat score (skirmishCardScore): the stronger end when the fight reads too easy,
// the weaker end when too hard, with a seeded spread; each must also keep the map's rules (a card in at most the map's usage line, two cards of a
// two-card family never together, the mix kinds the map's decks show). Each draw plays --g1 games (tune seeds 11300 + 37g, as the fit), the --top
// nearest the target play --g2 more, and the nearest then plays 200 road games (9100 + 37g, the road measure's own) against the deck as it stands;
// it is kept only when 2+ points nearer there (the fit's keep rule). The Shield, Health, leaders and rules are never touched.
//   node tools/skir2/search_2026_11_11.js run --codes 7-6,2-1 [--n 40 --g1 40 --g2 120 --top 4] [--dir search]  -> docs/balance/skir2/<dir>/<code>.json
//   (apply with tools/skir2/decks_2026_11_11.js fitapply --dir <dir>: the result has the fit's shape)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
// SKIR1's build and fit run their own command line when loaded: load them with an inert one
const argv0 = process.argv; process.argv = argv0.slice(0, 2).concat(['(loaded by tools/skir2/search)']);
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M, B = require('../skir1/build_2026_11_11.js'), F = require('../skir1/fit_2026_11_11.js');
process.argv = argv0;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
// --bias: how hard the draw leans to its end of the score order (1.5); --floor: a probe that ignores the map's usage line and keeps nothing
const BIAS = +arg('--bias', 1.5), FLOOR = a.includes('--floor');
const CODES = String(arg('--codes', '')).split(',').filter(Boolean), N = +arg('--n', 40), G1 = +arg('--g1', 40), G2 = +arg('--g2', 120), TOP = +arg('--top', 4), G3 = 200;
const DIR = path.join(ROOT, 'docs', 'balance', 'skir2', arg('--dir', 'search'));
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const score = id => G.skirmishCardScore(D[id] || {});
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let t = fnv(seed); return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
const keyOf = L.keyOf;
function search(code) {
  const m = L.maps().find(x => L.fightsOf(x).some(n => n.key === code)), fl = L.fightsOf(m), n = fl.find(x => x.key === code), f = L.fight(m, n), band = F.bandOf(m, n), t0 = Date.now();
  const others = fl.filter(x => x !== n), FO = others.map(x => L.fight(m, x)), ucap = L.ucapOf(m), use = {};
  FO.forEach(fx => Object.keys(fx.n.deck).forEach(id => { if (!fx.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
  const listAll = [...new Set([].concat(f.pool, ...FO.map(fx => fx.pool)))], fam = {}; listAll.forEach(id => { fam[B.family(id)] = (fam[B.family(id)] || 0) + 1; });
  const pairBad = d => Object.keys(d).some(id => !f.keep.has(id) && fam[B.family(id)] === 2 && Object.keys(d).some(y => y !== id && B.family(y) === B.family(id)));
  const shownBy = d => { const ids = new Set(Object.keys(d)); others.forEach(x => Object.keys(x.deck).forEach(id => ids.add(id))); const o = {}; Object.keys(MIN).forEach(k => { o[k] = [...ids].filter(id => D[id] && M.kinds(D[id])[k]).length; }); return o; };
  const shown0 = shownBy(n.deck), mixOk = d => { const s = shownBy(d); return Object.keys(MIN).every(k => s[k] >= Math.min(MIN[k], listAll.filter(id => M.kinds(D[id])[k]).length) || s[k] >= shown0[k]); };
  const mapOk = d => (FLOOR || Object.keys(d).every(id => f.keep.has(id) || (use[id] || 0) + 1 <= ucap)) && !pairBad(d) && (FLOOR || mixOk(d));
  const v0 = { deck: Object.assign({}, n.deck), shield: null }, was = F.measure(m, n, v0, G3, 9100), stronger = was > band.t; // an easy fight wants stronger enemy cards (a higher stat score)
  const R = rng('skir2-search|' + code), cand = f.pool.filter(id => !f.keep.has(id) || true).sort((p, q) => score(p) - score(q));
  const draws = [], seen = new Set([keyOf(n.deck)]);
  for (let i = 0; i < N * 6 && draws.length < N; i++) {
    // pick 5-7 cards: a rank-weighted draw from the end of the score order the fight needs (stronger end when too easy)
    const k = Math.min(f.dMax, Math.max(f.dMin, 5 + Math.floor(R() * 3))), ids = [...f.keep.keys()], pool = cand.filter(id => !ids.includes(id));
    while (ids.length < k && pool.length) { const w = pool.map((id, j) => Math.pow(stronger ? (j + 1) / pool.length : (pool.length - j) / pool.length, BIAS) + 0.05), tot = w.reduce((s, x) => s + x, 0);
      let x = R() * tot, j = 0; for (; j < pool.length - 1; j++) { x -= w[j]; if (x <= 0) break; } ids.push(pool.splice(j, 1)[0]); }
    const want = {}; ids.forEach(id => { want[id] = f.S / ids.length * (0.6 + 0.8 * R()); });
    const d = B.fill(f, want, id => 1 + R(), R, (dd, id) => (!FLOOR && !f.keep.has(id) && (use[id] || 0) + 1 > ucap));
    // the deck as arena_app.js writes it (keys sorted): the game deals from the deck's key order, so the road seeds read the applied deck exactly
    if (!d || seen.has(keyOf(d)) || !mapOk(d)) continue; seen.add(keyOf(d)); draws.push({ deck: Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]])), shield: null });
  }
  const gap = w => Math.abs(w - band.t);
  draws.forEach(v => { v.w1 = F.measure(m, n, v, G1, 11300); });
  const top = draws.sort((p, q) => gap(p.w1) - gap(q.w1)).slice(0, TOP); top.forEach(v => { v.w2 = Math.round((v.w1 * G1 + F.measure(m, n, v, G2, 11300 + 37 * G1) * G2) / (G1 + G2) * 10) / 10; });
  const best = top.sort((p, q) => gap(p.w2) - gap(q.w2))[0];
  const now = best ? F.measure(m, n, best, G3, 9100) : was, keep = !FLOOR && !!best && gap(now) + 2 <= gap(was);
  const res = { about: 'SKIR2 re-draw search (tools/skir2/search_2026_11_11.js)', code, map: m.id, mapNo: f.mapNo, side: f.side, kind: f.kind, name: n.name, band, shieldRule: G.ruleShieldOf(n), shieldOverride: n.shieldOverride == null ? null : +n.shieldOverride, games: G3,
    before: { deck: n.deck, win: was }, pick: { deck: best ? best.deck : n.deck, shield: null, win: now }, keep, draws: draws.length, top: top.map(v => ({ deck: v.deck, w1: v.w1, w2: v.w2 })), sec: Math.round((Date.now() - t0) / 1000) };
  if (keep) n.deck = best.deck; // the map's later fights read the usage it leaves
  fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(path.join(DIR, code + '.json'), JSON.stringify(res) + '\n'); // a --floor probe writes its own --dir (keep is false)
  console.log(`${code} t ${band.t.toFixed(1)} | ${G3}: ${was} -> ${now} ${keep ? 'KEEP' : 'no'} | ${draws.length} draws, best ${best ? best.w2 : '-'} | ${res.sec}s`);
}
if (a[0] === 'run') CODES.forEach(c => { try { search(c); } catch (e) { console.log(c, 'ERROR', e.stack); } });
