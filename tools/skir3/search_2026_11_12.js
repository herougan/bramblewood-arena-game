#!/usr/bin/env node
// 2026-11-12 (package SKIR3): a rebuild search for road fights far off their target that SKIR1's fit (1-2 copy moves) and LISTFIX3's jump (1-4 moves)
// could not bring back on the 11-12 lists. Fresh decks from the fight's pool with SKIR1's builder (tools/skir1/build_2026_11_11.js fill / spread: the
// fight's kept cards, then cards drawn by weight, heavier cards weighted up when the fight must get harder, lighter when easier), inside SKIR1's deck
// rules and the map's (usage line, two-card families, no mix kind falling below what the map shows now). Each read at --g1 (24) games on the tune
// seeds (11300 + 37g), the --top (4) nearest at --g2 (100), the 2 nearest at --g3 (200) on the road seeds (9100 + 37g) against the deck as it
// stands; the nearest kept when 2+ points nearer. Deck moves only. SKIR1's fit format, docs/balance/skir3/<dir>/<code>.json, for
// tools/skir3/decks_2026_11_12.js fitapply --dir <dir>.
//   node tools/skir3/search_2026_11_12.js --codes 7-6,19-1 [--n 40] [--dir search] [--slack 0]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const ARGV = process.argv.splice(2, process.argv.length, 'lib'); // build_2026_11_11.js and fit_2026_11_11.js run a command on load: a neutral one
const L = require('../skir1/lib_fight_2026_11_11.js'), B = require('../skir1/build_2026_11_11.js'), F = require('../skir1/fit_2026_11_11.js');
process.argv.splice(2, 1, ...ARGV);
const G = L.G, D = L.D, M = L.M;
const CODES = String(arg('--codes', '')).split(',').filter(Boolean), N = +arg('--n', 40), G1 = +arg('--g1', 24), G2 = +arg('--g2', 100), G3 = +arg('--g3', 200), TOP = +arg('--top', 4), SLACK = +arg('--slack', 0);
const DIR = path.join(ROOT, 'docs', 'balance', 'skir3', arg('--dir', 'search')); fs.mkdirSync(DIR, { recursive: true });
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const score = id => G.skirmishCardScore(D[id] || {}), key = L.keyOf;
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let t = fnv(seed); return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
for (const code of CODES) {
  const m = L.maps().find(x => L.fightsOf(x).some(n => n.key === code)), fl = L.fightsOf(m), n = fl.find(x => x.key === code), f = L.fight(m, n), band = F.bandOf(m, n), t0 = Date.now();
  // the two challenge fights whose boon theme no 11-12 card holds play with the boon off (tools/skir3/refill_2026_11_12.js BOON_OFF, draft SKIR3-3)
  if (['13-4', '20-4'].includes(code)) { const p0 = f.problems; f.problems = d => p0(d).filter(x => !/challenge boon/.test(x)); f.legal = d => !f.problems(d).length; }
  const others = fl.filter(x => x !== n).map(x => L.fight(m, x)), ucap = L.ucapOf(m) + SLACK, use = {};
  others.forEach(o => Object.keys(o.n.deck).forEach(id => { if (!o.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
  const listAll = [...new Set([].concat(f.pool, ...others.map(o => o.pool)))], fam = {}; listAll.forEach(id => { fam[B.family(id)] = (fam[B.family(id)] || 0) + 1; });
  const shownOther = new Set([].concat(...others.map(o => Object.keys(o.n.deck))));
  const shown = d => { const ids = new Set([...shownOther, ...Object.keys(d)]); const o = {}; Object.keys(MIN).forEach(k => { o[k] = [...ids].filter(id => D[id] && M.kinds(D[id])[k]).length; }); return o; };
  const sh0 = shown(n.deck), mixOk = d => { const s = shown(d); return Object.keys(MIN).every(k => s[k] >= Math.min(sh0[k], MIN[k])); };
  const avoid = (d, id) => { const pf = fam[B.family(id)] === 2 ? B.family(id) : null; if (pf && !f.keep.has(id) && Object.keys(d).some(x => x !== id && B.family(x) === pf)) return true; return !f.keep.has(id) && (use[id] || 0) + 1 > ucap; };
  const gap = w => Math.abs(w - band.t), seen = new Map();
  const read = (d, g, s0) => { const k = key(d) + '#' + g + '@' + s0; if (!seen.has(k)) seen.set(k, F.measure(m, n, { deck: d, shield: null }, g, s0)); return seen.get(k); };
  const prev = (() => { let best = null; for (const dir of ['fit', 'fit3', 'jump', 'search']) { const p = path.join(ROOT, 'docs', 'balance', 'skir3', dir, code + '.json'); if (!fs.existsSync(p)) continue; const x = JSON.parse(fs.readFileSync(p, 'utf8'));
    [[x.before.deck, x.before.win], [x.pick.deck, x.pick.win]].forEach(([d, w]) => { if (w != null && key(d) === key(n.deck)) best = w; }); } return best; })();
  const w0 = prev != null ? prev : read(n.deck, G3, 9100), harder = w0 > band.t;
  const R = rng('skir3s|' + code + (arg('--seed', '') ? '|' + arg('--seed', '') : '')), weight = id => Math.pow(Math.max(0.5, score(id)), harder ? 1.5 : -1.5) * (0.6 + 0.8 * R());
  const cands = [], why = { fill: 0, mix: 0, same: 0 };
  for (let i = 0; i < N * 3 && cands.length < N; i++) {
    const k = f.dMin + Math.floor(R() * (f.dMax - f.dMin + 1)), chosen = [...f.keep.keys()], pool = f.pool.filter(id => !chosen.includes(id));
    while (chosen.length < k && pool.length) { const tot = pool.reduce((t, id) => t + weight(id), 0); let x = R() * tot, j = pool.length - 1; for (let q = 0; q < pool.length; q++) { x -= weight(pool[q]); if (x <= 0) { j = q; break; } }
      const id = pool.splice(j, 1)[0]; if (!avoid(Object.fromEntries(chosen.map(y => [y, 1])), id)) chosen.push(id); }
    const d = B.fill(f, B.spread(chosen, f.S, harder ? 0.3 : 0.9), weight, R, avoid);
    if (!d) { why.fill++; if (process.env.SKIR3_DEBUG) console.log('fill:', (B.fill.last || []).join('; ')); continue; } if (!mixOk(d)) { why.mix++; continue; } if (key(d) === key(n.deck) || cands.some(c => key(c.d) === key(d))) { why.same++; continue; }
    cands.push({ d, w1: read(d, G1, 11300) });
  }
  const top = cands.sort((p, q) => gap(p.w1) - gap(q.w1)).slice(0, TOP); top.forEach(c => { c.w2 = read(c.d, G2, 11300); });
  const fin = top.sort((p, q) => gap(p.w2) - gap(q.w2)).slice(0, 2); fin.forEach(c => { c.w3 = read(c.d, G3, 9100); });
  const best = fin.sort((p, q) => gap(p.w3) - gap(q.w3))[0], keep = !!best && gap(best.w3) + 2 <= gap(w0);
  const res = { about: 'SKIR3 rebuild search (tools/skir3/search_2026_11_12.js)', code, map: m.id, mapNo: f.mapNo, side: f.side, kind: f.kind, name: n.name, band, slack: SLACK,
    shieldRule: G.ruleShieldOf(n), shieldOverride: n.shieldOverride == null ? null : +n.shieldOverride, games: G3,
    before: { deck: Object.assign({}, n.deck), win: w0 }, pick: { deck: best ? best.d : n.deck, shield: null, win: best ? best.w3 : w0 }, keep, tried: cands.length,
    top: top.map(c => ({ deck: c.d, w1: c.w1, w2: c.w2, w3: c.w3 })), sec: Math.round((Date.now() - t0) / 1000) };
  if (keep) n.deck = best.d;
  fs.writeFileSync(path.join(DIR, code + '.json'), JSON.stringify(res) + '\n');
  console.log(`${code} t ${band.t.toFixed(1)} | ${G3}: ${w0} -> ${res.pick.win} ${keep ? 'KEEP' : 'no'} | ${cands.length} decks (${JSON.stringify(why)}), top ${top.map(c => c.w1 + '/' + c.w2 + (c.w3 != null ? '/' + c.w3 : '')).join(' ')} | ${res.sec}s`);
}
