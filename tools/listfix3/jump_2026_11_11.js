#!/usr/bin/env node
// 2026-11-11 (package LISTFIX3): a wider deck search for the road fights SKIR1's fit (1-2 copy moves) could not bring back after the cut cards left
// their lists (Map 16 lost the Dhole Runner, its weak filler). Random walks of 1-4 legal moves (up to 4 copies each) from the deck as it stands,
// inside SKIR1's deck rules (tools/skir1/lib_fight_2026_11_11.js) and the map's (usage line, two-card families, THEME8's mix minimum as tests/skir1
// reads it); deck moves only (no Shield). Each walk read at --g1 (48) games on the tune seeds (11300 + 37g), the --top (6) nearest at --g3 (200) on
// the road seeds (9100 + 37g) against the deck as it stands; the nearest is kept when 2+ points nearer, written in SKIR1's fit format to
// docs/balance/listfix3/<dir>/<code>.json for tools/listfix3/decks_2026_11_11.js fitapply.
//   node tools/listfix3/jump_2026_11_11.js --codes 16-7,16-6 [--walks 120] [--dir fit3] [--seed 7]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M, F = require('../skir1/fit_2026_11_11.js');
const CODES = String(arg('--codes', '')).split(',').filter(Boolean), WALKS = +arg('--walks', 120), G1 = +arg('--g1', 48), G3 = +arg('--g3', 200), TOP = +arg('--top', 6);
const DIR = path.join(ROOT, 'docs', 'balance', 'listfix3', arg('--dir', 'fit3'));
const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
let seed = +arg('--seed', 7); const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }, pick = xs => xs[Math.floor(rnd() * xs.length)];
fs.mkdirSync(DIR, { recursive: true });
for (const code of CODES) {
  const m = L.maps().find(x => L.fightsOf(x).some(n => n.key === code)), fl = L.fightsOf(m), n = fl.find(x => x.key === code), f = L.fight(m, n), band = F.bandOf(m, n), t0 = Date.now();
  const others = fl.filter(x => x !== n).map(x => L.fight(m, x)), ucap = L.ucapOf(m), use = {};
  others.forEach(o => Object.keys(o.n.deck).forEach(id => { if (!o.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
  const listAll = [...new Set([].concat(f.pool, ...others.map(o => o.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
  const shownOther = new Set([].concat(...others.map(o => Object.keys(o.n.deck))));
  const mixOk = d => Object.keys(MIN).every(k => { const av = listAll.filter(id => M.kinds(D[id])[k]).length, sh = [...new Set([...shownOther, ...Object.keys(d)])].filter(id => M.kinds(D[id])[k]).length; return sh >= Math.min(MIN[k], av); });
  const ok = d => f.legal(d) && mixOk(d) && Object.keys(d).every(id => f.keep.has(id) || (use[id] || 0) + 1 <= ucap)
    && !Object.keys(d).some(id => !f.keep.has(id) && fam[family(id)] === 2 && Object.keys(d).some(x => x !== id && family(x) === family(id)));
  const start = Object.assign({}, n.deck), gap = w => Math.abs(w - band.t), seen = new Map(), key = L.keyOf;
  const read = (d, g, s0) => { const k = key(d) + '#' + g + '@' + s0; if (!seen.has(k)) seen.set(k, F.measure(m, n, { deck: d, shield: null }, g, s0)); return seen.get(k); };
  const w0 = read(start, G3, 9100), cands = [];
  for (let i = 0; i < WALKS; i++) { let d = Object.assign({}, start);
    for (let s = 1 + Math.floor(rnd() * 4); s > 0; s--) for (let tries = 0; tries < 30; tries++) {
      const x = pick(Object.keys(d)), y = pick(f.pool), k = 1 + Math.floor(rnd() * Math.min(4, d[x] - (f.keep.get(x) || 0)));
      if (x === y || !(k >= 1)) continue; const e = Object.assign({}, d); e[x] -= k; if (!e[x]) delete e[x]; e[y] = (e[y] || 0) + k; if (ok(e)) { d = e; break; } }
    if (key(d) !== key(start) && !cands.some(c => key(c.d) === key(d))) cands.push({ d, w1: read(d, G1, 11300) }); }
  const top = cands.sort((p, q) => gap(p.w1) - gap(q.w1)).slice(0, TOP); top.forEach(c => { c.w3 = read(c.d, G3, 9100); });
  const best = top.sort((p, q) => gap(p.w3) - gap(q.w3))[0], keep = !!best && gap(best.w3) + 2 <= gap(w0);
  const res = { about: 'LISTFIX3 jump search (tools/listfix3/jump_2026_11_11.js)', code, map: m.id, mapNo: f.mapNo, side: f.side, kind: f.kind, name: n.name, band, shieldRule: G.ruleShieldOf(n), shieldOverride: n.shieldOverride == null ? null : +n.shieldOverride, games: G3,
    before: { deck: start, win: w0 }, pick: { deck: best ? best.d : start, shield: null, win: best ? best.w3 : w0 }, keep, walks: cands.length, top: top.map(c => ({ deck: c.d, w1: c.w1, w3: c.w3 })), sec: Math.round((Date.now() - t0) / 1000) };
  if (keep) n.deck = best.d; // a later fight of the same map reads the usage this one leaves
  fs.writeFileSync(path.join(DIR, code + '.json'), JSON.stringify(res) + '\n');
  console.log(`${code} t ${band.t.toFixed(1)} | ${G3}: ${w0} -> ${res.pick.win} ${keep ? 'KEEP' : 'no'} | ${cands.length} walks, top ${top.map(c => c.w1 + '/' + c.w3).join(' ')} | ${res.sec}s`);
}
