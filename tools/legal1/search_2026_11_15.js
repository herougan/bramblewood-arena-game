#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): legal-only deck search for one road fight (main or side), extended from SIDE3P's search
// (docs/balance/side3p/search_2026_11_15.js) and SIDE4P's usage-line search. Every candidate passes tools/legal1/lib_legal_2026_11_15.js
// problemsFull(): SKIR1's problems() under SIDE2's holds (Carried x2 on side maps), plus the map lines of tests/skir1 (usage line, two-card
// family, mix), with the decks already accepted for other fights (--fx) in place. The test itself, run on a scratch copy, stays the final gate.
// Round: the deck's 1-copy moves (one card for another pool card; on a side map also one copy out, down to its size - 4) at --g1 games on
// --seed1; then the 2-, 3- and whole-card versions and pairs of the read moves, predicted as sums, the --pred nearest read too; the --top nearest
// re-read at --g2 on --seed2 (the current deck too); keep the best if 1+ point nearer. An illegal start (K14, a held card) is first repaired:
// the offending copies out, refilled from the pool (every legal refill, up to --g1max sampled), the nearest at --g2 kept.
// --levers shield,hp: after the decks, a shieldOverride / hqHp bisection (only fights whose owner decision allowed a lever).
//   node tools/legal1/search_2026_11_15.js --code X [--fx accepted.jsonl] [--accept accepted.jsonl] [--levers shield,hp] [--out file.jsonl] [--g1 60] [--g2 300] [--top 5] [--rounds 6]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('./lib_legal_2026_11_15.js'), L = X.L, G = X.G, D = X.D;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), R = +arg('--rounds', 6), G1 = +arg('--g1', 60), G2 = +arg('--g2', 300), TOP = +arg('--top', 5), PRED = +arg('--pred', 14);
const SEED1 = +arg('--seed1', 11300), SEED2 = +arg('--seed2', 12300), G1MAX = +arg('--g1max', 140), LEVERS = (arg('--levers', '') || '').split(',').filter(Boolean);
const OUT = arg('--out', path.join(ROOT, 'docs', 'balance', 'legal1', 'search-2026-11-15.jsonl'));
const fx = {}; let own = null; if (arg('--fx') && fs.existsSync(arg('--fx'))) fs.readFileSync(arg('--fx'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; if (x.key === code && x.deck) own = x.deck; });
// --from-accepted: a second pass starts from this fight's last accepted deck (the --fx file's own line) instead of the live deck
// --bands: the measure file whose row gives the target and band (2026-11-16, BAL-LEGAL2: the release measure skirmish-pass-b1116-s7300.jsonl)
const band = fs.readFileSync(path.resolve(ROOT, arg('--bands', 'docs/balance/skirmish-pass-b1114r400.jsonl')), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code);
const T = band.target, LO = band.lo, HI = band.hi, { m, n, f } = X.byCode[code];
const legalP = d => X.problemsFull(code, d, fx), legal = d => !legalP(d).length;
let node = Object.assign({}, n); const cache = new Map();
function win(deck, games, seed, nodeOver) { const nn = Object.assign({}, node, nodeOver || {}, { deck }); G.NODE_MAP_HINT.set(nn, m.id);
  const k = L.keyOf(deck) + '|' + games + '|' + seed + '|' + nn.shieldOverride + '|' + nn.hqHp; if (cache.has(k)) return cache.get(k);
  const w = Math.round(G.simulateReferenceFight(m.id, nn, games, { seed0: seed }).win * 1000) / 10; cache.set(k, w); return w; }
const clean = d => { Object.keys(d).forEach(k => { if (!(d[k] > 0)) delete d[k]; }); return d; };
const off = w => Math.abs(w - T), sideMin = Math.max(10, f.S - 4);
const ids0 = d => [...new Set(Object.keys(d).concat(f.pool))];
// moves as {out: {id: k}, in: {id: k}}; applied to a deck
const apply = (d0, mv) => { const d = Object.assign({}, d0); Object.entries(mv.out).forEach(([id, k]) => { d[id] = (d[id] || 0) - k; }); Object.entries(mv.in).forEach(([id, k]) => { d[id] = (d[id] || 0) + k; }); return clean(d); };
const valid = (d0, mv) => Object.entries(mv.out).every(([id, k]) => (d0[id] || 0) >= k);
const label = mv => Object.entries(mv.out).map(([id, k]) => `-${k} ${id}`).concat(Object.entries(mv.in).map(([id, k]) => `+${k} ${id}`)).join(' ');
const add = (o1, o2) => { const o = Object.assign({}, o1); Object.entries(o2).forEach(([id, k]) => { o[id] = (o[id] || 0) + k; }); return o; };
const scale = (mv, k) => ({ out: Object.fromEntries(Object.entries(mv.out).map(([id, v]) => [id, v * k])), in: Object.fromEntries(Object.entries(mv.in).map(([id, v]) => [id, v * k])) });
const log = o => fs.appendFileSync(OUT, JSON.stringify(Object.assign({ code, t: new Date().toISOString() }, o)) + '\n');
let cur = Object.assign({}, a.includes('--from-accepted') && own ? own : n.deck), trail = [];
console.log(code, `target ${T} (${LO}-${HI}) size ${f.S}${f.side ? ' side (min ' + sideMin + ')' : ''} start`, JSON.stringify(cur), 'problems', JSON.stringify(legalP(cur)));
// ---- repair an illegal start ----
if (!legal(cur)) {
  const base = Object.assign({}, cur); let freed = 0;
  Object.keys(base).forEach(id => { if (!f.pool.includes(id)) { freed += base[id]; delete base[id]; } else { const c = (f.U && !f.U.has(id) && !f.L0.includes(id)) ? f.carriedMax : f.cap(id); if (base[id] > c) { freed += base[id] - c; base[id] = c; } } });
  // refills of the freed copies (pruned on the copy caps, Carried copies and the distinct-card count), also with one whole uncapped card
  // out (a deck at its distinct-card limit can only take Carried singles that way); legal() decides
  const pool = f.pool, cands = new Map(), carried = id => f.U && !f.U.has(id) && !f.L0.includes(id);
  const nC = d => Object.keys(d).filter(carried).reduce((t, id) => t + d[id], 0);
  const rec = (d, left, from) => { if (cands.size > 20000) return; if (left === 0) { const k = L.keyOf(d); if (!cands.has(k) && legal(d)) cands.set(k, Object.assign({}, d)); return; }
    for (let i = from; i < pool.length; i++) { const id = pool[i]; const had = d[id] || 0; if (had + 1 > f.cap(id) || (carried(id) && (had + 1 > f.carriedMax || nC(d) >= 6)) || (!had && Object.keys(d).length >= f.dMax)) continue;
      d[id] = had + 1; rec(d, left - 1, i); d[id] = had; if (!had) delete d[id]; } };
  const bases = [[base, freed]].concat(Object.keys(base).filter(id => !f.keep.has(id)).map(id => { const b = Object.assign({}, base); delete b[id]; return [b, freed + base[id]]; }));
  for (const [b0, fr] of bases) for (let shrink = 0; shrink <= (f.side ? Math.min(fr, f.S - sideMin) : 0); shrink++) rec(Object.assign({}, b0), fr - shrink, 0);
  let list = [...cands.values()]; console.log('repair:', freed, 'copies freed,', list.length, 'legal refills');
  if (!list.length) { log({ phase: 'repair', none: true, base, freed }); console.log('RESULT', code, 'NO LEGAL REFILL'); process.exit(0); }
  if (list.length > G1MAX) { const step = list.length / G1MAX; list = Array.from({ length: G1MAX }, (_, i) => list[Math.floor(i * step)]); }
  list = list.map(d => ({ d, w1: win(d, G1, SEED1) })).sort((x, y) => off(x.w1) - off(y.w1));
  const top = list.slice(0, TOP); top.forEach(c => { c.w2 = win(c.d, G2, SEED2); }); top.sort((x, y) => off(x.w2) - off(y.w2));
  console.log('repair top:', top.map(c => `${JSON.stringify(c.d)} ${c.w1}/${c.w2}`).join(' | '));
  log({ phase: 'repair', freed, refills: cands.size, read: list.length, top: top.map(c => ({ deck: c.d, w1: c.w1, w2: c.w2 })) });
  cur = top[0].d; trail.push('repair -> ' + JSON.stringify(cur));
}
// ---- local search ----
let curW = win(cur, G2, SEED2);
console.log('start', JSON.stringify(cur), curW);
for (let r = 1; r <= R && off(curW) > 2.5; r++) {
  const c1 = win(cur, G1, SEED1), seen = new Set([L.keyOf(cur)]), cands = [];
  const push = (mv, kind) => { if (!valid(cur, mv)) return; const d = apply(cur, mv), k = L.keyOf(d); if (seen.has(k)) return; seen.add(k); if (legal(d)) cands.push({ mv, d, kind }); };
  const ids = Object.keys(cur), fresh = f.pool.filter(id => !cur[id]);
  for (const o of ids) {
    // k copies of o for another card (k = 1..4 and all of o)
    for (const i of ids0(cur)) { if (i === o) continue; for (const k of [...new Set([1, 2, 3, 4, cur[o]])]) if (k <= cur[o]) push({ out: { [o]: k }, in: { [i]: k } }, 'swap'); }
    // the whole of o for a new card at up to its cap, the rest on one other card already in the deck (or, on a side map, left out)
    for (const i of fresh) { const c = cur[o], put = Math.min(c, f.cap(i), f.U && !f.U.has(i) && !f.L0.includes(i) ? f.carriedMax : 9), rest = c - put; if (put < 1) continue;
      if (!rest) continue; // = the all-copies swap above
      for (const e of ids) if (e !== o) push({ out: { [o]: c }, in: rest ? { [i]: put, [e]: rest } : { [i]: put } }, 'replace');
      if (f.side && L.size(cur) - rest >= sideMin) push({ out: { [o]: c }, in: { [i]: put } }, 'replace'); }
    // a side deck may shrink (SIDE2-2 e)
    if (f.side) for (const k of [1, 2]) if (cur[o] >= k && L.size(cur) - k >= sideMin) push({ out: { [o]: k }, in: {} }, 'shrink');
  }
  // too many to read: keep the ones whose stat score moves the right way (or not at all), spread over their size
  const sc = d => Object.entries(d).reduce((t, [id, k]) => t + k * G.skirmishCardScore(D[id] || {}), 0), s0 = sc(cur), want = c1 < T ? -1 : 1;
  let read = cands; if (read.length > G1MAX) { const ok = read.filter(c => Math.sign(sc(c.d) - s0) !== -want).sort((x, y) => (sc(x.d) - s0) * want - (sc(y.d) - s0) * want);
    const pick = ok.length > G1MAX ? Array.from({ length: G1MAX }, (_, q) => ok[Math.floor(q * ok.length / G1MAX)]) : ok; read = pick; }
  read.forEach(c => { c.w1 = win(c.d, G1, SEED1); c.e = c.w1 - c1; });
  // pairs of the read moves nearest half the gap, predicted as sums; the --pred nearest read too
  const preds = [], best1 = read.slice().sort((x, y) => Math.abs(c1 + 2 * x.e - T) - Math.abs(c1 + 2 * y.e - T)).slice(0, 12);
  for (let x = 0; x < best1.length; x++) for (let y = x + 1; y < best1.length; y++) { const mv = { out: add(best1[x].mv.out, best1[y].mv.out), in: add(best1[x].mv.in, best1[y].mv.in) };
    if (!valid(cur, mv)) continue; const d = apply(cur, mv), k = L.keyOf(d); if (seen.has(k) || !legal(d)) continue; seen.add(k); preds.push({ mv, d, pred: c1 + best1[x].e + best1[y].e }); }
  preds.sort((x, y) => Math.abs(x.pred - T) - Math.abs(y.pred - T)); const pr = preds.slice(0, PRED); pr.forEach(p => { p.w1 = win(p.d, G1, SEED1); });
  const pool1 = read.concat(pr).sort((x, y) => off(x.w1) - off(y.w1)), top = pool1.slice(0, TOP); top.forEach(c => { c.w2 = win(c.d, G2, SEED2); });
  top.sort((x, y) => off(x.w2) - off(y.w2));
  console.log(`round ${r}: cur ${c1}/${curW}; ${cands.length} legal, ${read.length} read + ${pr.length} predicted (of ${preds.length}); top: ` + top.map(c => `${label(c.mv)} ${c.w1}/${c.w2}`).join(' | '));
  log({ phase: 'round', round: r, from: cur, fromW1: c1, fromW2: curW, read: read.length, predicted: pr.length, top: top.map(c => ({ move: label(c.mv), deck: c.d, w1: c.w1, w2: c.w2 })) });
  const b = top[0]; if (!b || off(b.w2) > off(curW) - 1) { console.log('no nearer move'); break; }
  cur = b.d; curW = b.w2; trail.push(label(b.mv));
}
// ---- levers ----
const lev = {};
if (LEVERS.length && (curW < LO || curW > HI)) {
  const tooEasy = curW > T;
  if (LEVERS.includes('shield')) {
    G.NODE_MAP_HINT.set(node, m.id); const now = G.skirmishCastle(Object.assign({}, node, { deck: cur })).shield;
    let lo = tooEasy ? (+node.shieldOverride || now) : 0, hi = tooEasy ? Math.max(40, (+node.shieldOverride || now) * 6 + 40) : (+node.shieldOverride || now), best = null;
    for (let it = 0; it < 7 && hi - lo > 1; it++) { const s = Math.floor((lo + hi) / 2), w = win(cur, G2, SEED2, { shieldOverride: s }); console.log('shield', s, w);
      if (!best || off(w) < off(best.w)) best = { s, w }; if ((w > T) === tooEasy) lo = s; else hi = s; }
    if (!tooEasy) { const w = win(cur, G2, SEED2, { shieldOverride: 0 }); console.log('shield', 0, w); if (!best || off(w) < off(best.w)) best = { s: 0, w }; }
    if (best && off(best.w) < off(curW) - 1) { lev.shieldOverride = best.s; node.shieldOverride = best.s; curW = best.w; }
  }
  if (LEVERS.includes('hp') && curW < LO) {
    G.NODE_MAP_HINT.set(node, m.id); const hp0 = G.skirmishCastle(Object.assign({}, node, { deck: cur })).hp; let best = null;
    for (let h = hp0 - 1; h >= Math.max(3, hp0 - 10); h--) { const w = win(cur, G2, SEED2, { hqHp: h }); console.log('hqHp', h, w); if (!best || off(w) < off(best.w)) best = { h, w }; if (w >= T) break; }
    if (best && off(best.w) < off(curW) - 1) { lev.hqHp = best.h; node.hqHp = best.h; curW = best.w; }
  }
}
const res = { phase: 'result', key: code, target: T, lo: LO, hi: HI, deck: cur, w2: curW, seed2: SEED2, moves: trail, levers: lev, problems: legalP(cur), fx: Object.keys(fx) };
if (arg('--accept')) fs.appendFileSync(arg('--accept'), JSON.stringify({ key: code, deck: L.keyOf(cur) !== L.keyOf(n.deck) ? cur : null, shieldOverride: lev.shieldOverride != null ? lev.shieldOverride : null, hqHp: lev.hqHp != null ? lev.hqHp : null, tune: { w2: curW, seed2: SEED2, games: G2 }, moves: trail }) + '\n');
log(res); console.log('RESULT', code, JSON.stringify(cur), curW, JSON.stringify(lev), 'moves:', trail.join(' ; '), 'problems:', JSON.stringify(res.problems));
