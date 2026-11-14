#!/usr/bin/env node
// 2026-11-14 (package SKW2, decision SKW1-5 a: "measure it properly first (at bramble 15) before any re-fit"). Measurement only: writes
// nothing but its own raw file docs/balance/skw2/skw2-2026-11-14.jsonl (one line per measured point, every game's result kept).
//
//   node tools/skw2/skw2.js run [--games G] [--workers 2]   play what the jsonl lacks (resumes), G games a road fight a point (default 64)
//   node tools/skw2/skw2.js report                         estimates, bootstrap intervals, tables (prints; writes skw2-summary.json)
//   node tools/skw2/skw2.js speed                          a few games, games a second (no file written)
//
// What it measures: the exchange rate of +1 Attack in Health points (the budget prices it at DEFAULTS.attackWeight = 3), and of Shield.
//   - Context: the road as the game builds it (G.referenceFightSetup, G.playReferenceGame: the CPU decks, leaders, field, bramble Shield
//     layers, seeds seed0 + 37g) for every road fight of Maps 3, 8, 13 and 18 (deckopt's fightsOf), your seat = the Map reference deck of
//     that map at its referencePlayerLevel (no leader), both brambles' Health set to 15 (the road's BRAMBLE_SCALE line; Map 8's CPU
//     brambles are 11-13 as built, raised to 15 here). A win is a win (the road's count; a draw is not a win).
//   - The unit: 5 copies of one common (the copy cap) replace 5 copies of the reference deck (always the same 5 on a map: one at a time
//     from the card with the most copies), levelled with the deck by the game. Variants change those copies only: base, +1 Attack, +3
//     Shield (effects.shield), +h Health. Every variant plays the same games (the same fight, seed and deck order): differences are paired.
//   - Bisection on h: h = 6 first, then the midpoint of the bracket that holds the +1 Attack gain (isotonic fit of gain(h), gain(0) = 0),
//     doubling when no measured h reaches it, 4 Health points at most. The estimate: the h where the isotonic gain curve meets the +1
//     Attack gain (linear between measured points; beyond the last one along the line through the origin, flagged '>').
//   - 95% intervals: bootstrap over games (stratified by fight; the same resample for every variant of a unit), 1000 resamples.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const L = require(path.join(ROOT, 'tools', 'bench', 'lib.js'));
const VERSION = '1.0.0 (2026-11-14, SKW2)';
const OUT = path.join(ROOT, 'docs', 'balance', 'skw2'), RAW = path.join(OUT, 'skw2-2026-11-14.jsonl'), SUM = path.join(OUT, 'skw2-summary.json');
const MAPS = [3, 8, 13, 18], K = 5, BRAMBLE = 15, H0 = 6, HMAX_POINTS = 4, SHIELD = 3, BOOT = 1000;
// 17 commons; cost = Lumber + Wait (common Lumber stops at 4, so the 1-6 spread is the two together; the budget prices them 2.5 and 3 a point).
// Per cost: a sturdy body, a fragile one (Health <= 5) and one between, vanilla or a passive that does not touch Attack or Health where one exists.
const UNITS = ['rivergate-recruit', 'otter-ferryman', 'jackrabbit-sprinter', 'hollow-oath-keeper', 'raft-spider', 'dominion-nestguard',
  'pufferfish-bulwark', 'berserker-boar', 'boreal-elk', 'warhorse-charger', 'stag-knight', 'fox-warchief', 'stoneheart-golem', 'war-panther',
  'alpha-howler', 'humpback-elder', 'orca-vanguard'];

// ---------------------------------------------------------------- the setup (shared by the workers)
function restOf(gm, mapNo) { // the Map reference deck less the K copies the unit takes
  const G = gm.G, map = O.resolveMap(gm, mapNo), fights = O.fightsOf(map), ref = G.referenceDeckFor(map.id, fights[0]), d = Object.assign({}, ref.deck);
  for (let n = 0; n < K; n++) { let best = null; Object.keys(d).forEach(id => { if (d[id] > 0 && (best == null || d[id] > d[best])) best = id; }); d[best]--; if (!d[best]) delete d[best]; }
  return { map, fights, level: ref.level, refDeck: ref.deck, rest: d };
}
const vKey = v => v.dA ? 'a' + v.dA : v.dH ? 'h' + v.dH : v.sh ? 's' + v.sh : 'base';
function makePlayer(gm) {
  const G = gm.G, setups = new Map(), rests = new Map();
  return function play(mapNo, unit, v, fi, g0, g1) {
    if (!rests.has(mapNo)) rests.set(mapNo, restOf(gm, mapNo));
    const R = rests.get(mapNo), sk = mapNo + '|' + unit + '|' + fi; let c = setups.get(sk);
    if (!c) {
      const deck = Object.assign({ [unit]: K }, R.rest); // the unit first: the same deck order for every variant
      c = G.referenceFightSetup(R.map.id, R.fights[fi], { deck, level: R.level, noLeader: true });
      c.myCastle = Object.assign({}, c.myCastle, { health: BRAMBLE }); c.sc = Object.assign({}, c.sc, { character: Object.assign({}, c.sc.character, { health: BRAMBLE }) });
      setups.set(sk, c);
    }
    const key = vKey(v); let ctx = c;
    if (key !== 'base') {
      const mine = {};
      Object.keys(c.mine).forEach(id => { const d = c.defs[id]; if (id !== unit && !(d && d.derivedFrom === unit)) { mine[id] = c.mine[id]; return; }
        const vid = id + '~skw2' + key;
        if (!c.defs[vid]) { const o = Object.assign({}, d, { id: vid, effects: Object.assign({}, d.effects || {}) });
          if (v.dA) o.attack += v.dA; if (v.dH) o.health += v.dH; if (v.sh) o.effects.shield = (+o.effects.shield || 0) + v.sh; c.defs[vid] = o; }
        mine[vid] = c.mine[id]; });
      ctx = Object.assign({}, c, { mine });
    }
    let s = ''; for (let g = g0; g < g1; g++) { const r = G.playReferenceGame(ctx, g); s += r.win ? '1' : r.loss ? '0' : 'h'; }
    return s;
  };
}
if (!isMainThread && workerData && workerData.skw2) {
  const gm = O.loadGame(ROOT), play = makePlayer(gm);
  parentPort.on('message', m => { try { parentPort.postMessage({ id: m.id, s: play(m.map, m.unit, m.v, m.fi, m.g0, m.g1) }); } catch (e) { parentPort.postMessage({ id: m.id, err: String(e && e.stack || e) }); } });
}

// ---------------------------------------------------------------- statistics
const score = ch => ch === '1' ? 1 : 0;
function pav(ys) { // isotonic (non-decreasing) fit, equal weights
  const b = []; ys.forEach(y => { b.push({ s: y, n: 1 }); while (b.length > 1 && b[b.length - 2].s / b[b.length - 2].n > b[b.length - 1].s / b[b.length - 1].n) { const t = b.pop(); b[b.length - 1].s += t.s; b[b.length - 1].n += t.n; } });
  const out = []; b.forEach(x => { for (let i = 0; i < x.n; i++) out.push(x.s / x.n); }); return out;
}
// h where the gain curve (points hs, gains gs, plus (0, 0)) meets target t: {h, cens}
function invert(hs, gs, t) {
  const H = [0].concat(hs), Y = pav([0].concat(gs)); if (!(t > 0)) return { h: 0, cens: '<' };
  for (let i = 1; i < H.length; i++) if (Y[i] >= t) { const y0 = Y[i - 1], y1 = Y[i]; return { h: y1 > y0 ? H[i - 1] + (t - y0) / (y1 - y0) * (H[i] - H[i - 1]) : H[i - 1], cens: '' }; }
  const hm = H[H.length - 1], ym = Y[Y.length - 1]; return { h: ym > 0 ? Math.min(60, t / ym * hm) : 60, cens: '>' };
}
const quant = (a, p) => { const v = a.filter(x => isFinite(x)).sort((x, y) => x - y); return v.length ? v[Math.min(v.length - 1, Math.max(0, Math.round(p * (v.length - 1))))] : null; };
const median = a => quant(a, 0.5);
const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;

// ---------------------------------------------------------------- the raw file
function loadRaw() {
  const pts = new Map(); if (!fs.existsSync(RAW)) return pts;
  fs.readFileSync(RAW, 'utf8').split('\n').filter(Boolean).forEach(l => { const p = JSON.parse(l); if (p.type === 'point' && p.fp === L.fingerprint() && p.k === K) pts.set(p.map + '|' + p.unit + '|' + p.v, p); });
  return pts;
}
// the next Health point of a unit-map, or null when its bisection is done
function nextH(pts, mapNo, unit, G) {
  const get = k => pts.get(mapNo + '|' + unit + '|' + k); const b = get('base'), a = get('a1'); if (!b || !a) return null;
  const hs = [...pts.values()].filter(p => p.map === mapNo && p.unit === unit && /^h\d+$/.test(p.v)).map(p => +p.v.slice(1)).sort((x, y) => x - y);
  if (!hs.length) return H0; if (hs.length >= HMAX_POINTS) return null;
  const m = s => { let t = 0; for (let i = 0; i < s.length; i++) t += score(s[i]); return t / s.length; };
  const gA = m(a.s) - m(b.s), gs = hs.map(h => m(get('h' + h).s) - m(b.s)), Y = pav([0].concat(gs)), H = [0].concat(hs);
  if (!(gA > 0)) return null; // +1 Attack measured no gain: nothing to match
  let up = H.findIndex((h, i) => i > 0 && Y[i] >= gA);
  if (up < 0) { const n = Math.min(24, 2 * H[H.length - 1]); return hs.includes(n) ? null : n; }
  const lo = H[up - 1], hi = H[up], mid = Math.round((lo + hi) / 2); return hi - lo <= 1 || hs.includes(mid) || mid === 0 ? null : mid;
}

async function run(opt) {
  fs.mkdirSync(OUT, { recursive: true });
  const gm = O.loadGame(ROOT), plan = {}; MAPS.forEach(n => { const R = restOf(gm, n); plan[n] = { nf: R.fights.length, level: R.level, rest: R.rest, refDeck: R.refDeck, fights: R.fights.map(f => f.key) }; });
  const G = opt.games, ws = [], q = [], cb = new Map(); let seq = 0, played = 0; const t0 = Date.now();
  for (let k = 0; k < opt.workers; k++) { const w = new Worker(__filename, { workerData: { skw2: true } }); w.idle = true;
    w.on('message', m => { const c = cb.get(m.id); cb.delete(m.id); w.idle = true; if (m.err) { console.error(m.err); process.exit(2); } c(m.s); pump(); }); w.on('error', e => { console.error(e); process.exit(2); }); ws.push(w); }
  function pump() { for (const w of ws) { if (!q.length) return; if (!w.idle) continue; const t = q.shift(), id = ++seq; w.idle = false; cb.set(id, t.done); w.postMessage(Object.assign({ id }, t.msg)); } }
  const playPoint = (mapNo, unit, v) => Promise.all(Array.from({ length: plan[mapNo].nf }, (x, fi) => new Promise(res => { q.push({ msg: { map: mapNo, unit, v, fi, g0: 0, g1: G }, done: s => { played += s.length; res(s); } }); pump(); })))
    .then(parts => { const p = { type: 'point', tool: VERSION, fp: L.fingerprint(), k: K, bramble: BRAMBLE, map: mapNo, level: plan[mapNo].level, unit, v: vKey(v), gamesPerFight: G, fights: plan[mapNo].fights, s: parts.join('') };
      fs.appendFileSync(RAW, JSON.stringify(p) + '\n'); return p; });
  let pts = loadRaw(); const vOf = k => k === 'base' ? {} : k[0] === 'a' ? { dA: +k.slice(1) } : k[0] === 's' ? { sh: +k.slice(1) } : { dH: +k.slice(1) };
  const units = opt.units || UNITS;
  for (let round = 0; round < 1 + HMAX_POINTS; round++) {
    const todo = [];
    MAPS.forEach(n => units.forEach(u => {
      if (round === 0) ['base', 'a1', 's' + SHIELD].forEach(k => { if (!pts.has(n + '|' + u + '|' + k)) todo.push([n, u, k]); });
      else { const h = nextH(pts, n, u, G); if (h != null && !pts.has(n + '|' + u + '|h' + h)) todo.push([n, u, 'h' + h]); }
    }));
    if (round === 0) MAPS.forEach(n => units.forEach(u => { if (![...pts.keys()].some(k => k.startsWith(n + '|' + u + '|h'))) todo.push([n, u, 'h' + H0]); }));
    console.log(`round ${round}: ${todo.length} points (${todo.reduce((t, x) => t + plan[x[0]].nf * G, 0)} games)`);
    const lastLog = { t: Date.now() };
    await Promise.all(todo.map(([n, u, k]) => playPoint(n, u, vOf(k)).then(p => { pts.set(n + '|' + u + '|' + k, p);
      if (Date.now() - lastLog.t > 120000) { lastLog.t = Date.now(); console.log(`  ${played} games, ${(played / ((Date.now() - t0) / 1000)).toFixed(1)}/s`); } })));
  }
  ws.forEach(w => w.terminate());
  console.log(`played ${played} games in ${Math.round((Date.now() - t0) / 60000)} min (${(played / Math.max(1, (Date.now() - t0) / 1000)).toFixed(1)}/s)`);
}

// ---------------------------------------------------------------- the report
function report() {
  const pts = loadRaw(), gm = O.loadGame(ROOT), byUM = new Map();
  pts.forEach(p => { const k = p.map + '|' + p.unit; if (!byUM.has(k)) byUM.set(k, { map: p.map, unit: p.unit, level: p.level, n: p.s.length, pts: {} }); byUM.get(k).pts[p.v] = p.s; });
  const ums = [...byUM.values()].filter(u => u.pts.base && u.pts.a1 && Object.keys(u.pts).some(k => /^h/.test(k)));
  // one bootstrap index set per map (stratified by fight), shared by every variant of a unit on that map
  const idxOf = new Map();
  MAPS.forEach(n => { const u = ums.find(x => x.map === n); if (!u) return; const p = pts.get(n + '|' + u.unit + '|base'), G = p.gamesPerFight, nf = p.fights.length, rng = mulberry(0x5eed + n), sets = [];
    for (let b = 0; b < BOOT; b++) { const a = new Uint32Array(G * nf); for (let f = 0; f < nf; f++) for (let j = 0; j < G; j++) a[f * G + j] = f * G + Math.floor(rng() * G); sets.push(a); } idxOf.set(n, sets); });
  const mean = (s, ix) => { let t = 0; if (ix) { for (let i = 0; i < ix.length; i++) t += score(s[ix[i]]); return t / ix.length; } for (let i = 0; i < s.length; i++) t += score(s[i]); return t / s.length; };
  const est = (u, ix) => { const b = mean(u.pts.base, ix), gA = mean(u.pts.a1, ix) - b, hs = Object.keys(u.pts).filter(k => /^h\d+$/.test(k)).map(k => +k.slice(1)).sort((x, y) => x - y),
    gs = hs.map(h => mean(u.pts['h' + h], ix) - b), gS = u.pts['s' + SHIELD] ? mean(u.pts['s' + SHIELD], ix) - b : null;
    let sxy = 0, sxx = 0; hs.forEach((h, i) => { sxy += h * gs[i]; sxx += h * h; }); const slope = sxy / sxx;
    return { base: b, gA, hs, gs, slope, w: invert(hs, gs, gA), wLin: slope > 0 ? gA / slope : null, sh: gS == null ? null : invert(hs, gs, gS).h / SHIELD, gS }; };
  const rows = ums.map(u => { const d = gm.D[u.unit], e = est(u, null), bs = idxOf.get(u.map).map(ix => est(u, ix));
    return { map: u.map, level: u.level, unit: u.unit, cost: (d.cost || 0) + (d.wait || 0), lumber: d.cost || 0, wait: d.wait || 0, attack: d.attack, health: d.health, effects: Object.keys(d.effects || {}),
      games: u.n, base: r2(100 * e.base), gainA: r2(100 * e.gA), gainALo: r2(100 * quant(bs.map(x => x.gA), 0.025)), gainAHi: r2(100 * quant(bs.map(x => x.gA), 0.975)),
      hs: e.hs, gainsH: e.gs.map(g => r2(100 * g)), w: r2(e.w.h), cens: e.w.cens, wLo: r2(quant(bs.map(x => x.w.h), 0.025)), wHi: r2(quant(bs.map(x => x.w.h), 0.975)), wLin: r2(e.wLin),
      gainS: e.gS == null ? null : r2(100 * e.gS), shieldH: r2(e.sh), shieldLo: r2(quant(bs.map(x => x.sh), 0.025)), shieldHi: r2(quant(bs.map(x => x.sh), 0.975)), _bs: bs, _u: u }; });
  // pooled: ratio of the mean +1 Attack gain to the mean Health slope (per point, through the origin), over a group, bootstrap over games
  const pooled = grp => { if (!grp.length) return null; const f = sel => { let a = 0, s = 0; grp.forEach(r => { const x = sel(r); a += x.gA; s += x.slope; }); return s > 0 ? a / s : null; };
    const m = f(r => est(r._u, null)), bs = []; for (let b = 0; b < BOOT; b += 4) bs.push(f(r => r._bs[b])); // every 4th resample (speed)
    const med = median(grp.map(r => r.w)), bm = []; const rng = mulberry(77 + grp.length); for (let b = 0; b < 400; b++) { const pick = grp.map(() => grp[Math.floor(rng() * grp.length)]); bm.push(median(pick.map(r => r._bs[b].w.h))); }
    return { n: grp.length, pooled: r2(m), pooledLo: r2(quant(bs, 0.025)), pooledHi: r2(quant(bs, 0.975)), median: r2(med), medLo: r2(quant(bm, 0.025)), medHi: r2(quant(bm, 0.975)), q1: r2(quant(grp.map(r => r.w), 0.25)), q3: r2(quant(grp.map(r => r.w), 0.75)),
      shieldMedian: r2(median(grp.map(r => r.shieldH).filter(x => x != null))), gainA: r2(grp.reduce((t, r) => t + r.gainA, 0) / grp.length) }; };
  const band = c => c <= 2 ? '1-2' : c <= 4 ? '3-4' : '5-6', frag = r => r.health <= 5 ? 'fragile (H<=5)' : r.health <= 12 ? 'mid (H 6-12)' : 'sturdy (H>=13)';
  const groups = { all: pooled(rows) }; ['1-2', '3-4', '5-6'].forEach(b => groups['cost ' + b] = pooled(rows.filter(r => band(r.cost) === b)));
  MAPS.forEach(n => groups['map ' + n] = pooled(rows.filter(r => r.map === n))); ['fragile (H<=5)', 'mid (H 6-12)', 'sturdy (H>=13)'].forEach(f => groups[f] = pooled(rows.filter(r => frag(r) === f)));
  // does w depend on cost or Health? Spearman rho (per unit, median over maps) with a permutation p
  const per = UNITS.map(u => { const rr = rows.filter(r => r.unit === u); return rr.length ? { unit: u, cost: rr[0].cost, health: rr[0].health, attack: rr[0].attack, w: median(rr.map(r => r.w)) } : null; }).filter(Boolean);
  const rank = a => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); let i = 0; while (i < o.length) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2; i = j + 1; } return r; };
  const rho = (x, y) => { const a = rank(x), b = rank(y), n = a.length, ma = (n - 1) / 2; let s = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { s += (a[i] - ma) * (b[i] - ma); sa += (a[i] - ma) ** 2; sb += (b[i] - ma) ** 2; } return s / Math.sqrt(sa * sb); };
  const spear = (x, y) => { const r0 = rho(x, y), rng = mulberry(991); let hit = 0; for (let t = 0; t < 2000; t++) { const yy = y.slice(); for (let i = yy.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [yy[i], yy[j]] = [yy[j], yy[i]]; } if (Math.abs(rho(x, yy)) >= Math.abs(r0)) hit++; } return { rho: r2(r0), p: r2(hit / 2000) }; };
  const dep = { cost: spear(per.map(p => p.cost), per.map(p => p.w)), health: spear(per.map(p => p.health), per.map(p => p.w)), attack: spear(per.map(p => p.attack), per.map(p => p.w)),
    healthAll: spear(rows.map(r => r.health), rows.map(r => r.w)), costAll: spear(rows.map(r => r.cost), rows.map(r => r.w)) };
  // the shape: w against the unit's printed Health / Attack (the product law A x H gives w = H / A); log-log fit on the uncensored w > 0,
  // the Rage unit out (+Health delays its Rage: its Health gain is negative by rule, not by worth)
  const shp = rows.filter(r => r.unit !== 'berserker-boar'), ha = r => r.health / Math.max(1, r.attack), fin = shp.filter(r => !r.cens && r.w > 0);
  { const lx = fin.map(r => Math.log(ha(r))), ly = fin.map(r => Math.log(r.w)), n = lx.length, mx = lx.reduce((a, b) => a + b, 0) / n, my = ly.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (lx[i] - mx) * (ly[i] - my); sxx += (lx[i] - mx) ** 2; } const b = sxy / sxx;
    dep.shape = { rhoHA: spear(shp.map(ha), shp.map(r => r.w)), fit: 'w = ' + r2(Math.exp(my - b * mx)) + ' x (H/A)^' + r2(b), n, medianAllNoRage: r2(median(shp.map(r => r.w))),
      bands: [[0, 1.2], [1.2, 3], [3, 99]].map(([lo, hi]) => { const g = shp.filter(r => ha(r) >= lo && ha(r) < hi); return { ha: lo + '-' + hi, n: g.length, median: r2(median(g.map(r => r.w))) }; }) }; }
  const out = { tool: 'tools/skw2/skw2.js ' + VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(), budgetAttackWeight: gm.Budget.DEFAULTS.attackWeight, budgetShieldPerHealth: gm.Budget.DEFAULTS.shieldPerHealth,
    design: { maps: MAPS, copies: K, bramble: BRAMBLE, h0: H0, hPoints: HMAX_POINTS, shield: SHIELD, boot: BOOT }, groups, dependence: dep, perUnit: per.map(p => Object.assign(p, { w: r2(p.w) })),
    rows: rows.map(r => { const o = Object.assign({}, r); delete o._bs; delete o._u; return o; }) };
  fs.writeFileSync(SUM, JSON.stringify(out, null, 1));
  console.log('group\tn\tpooled [95%]\tmedian [95%]\tIQR\tshield H/pt\tmean gain +1A');
  Object.keys(groups).forEach(k => { const g = groups[k]; if (g) console.log(`${k}\t${g.n}\t${g.pooled} [${g.pooledLo}, ${g.pooledHi}]\t${g.median} [${g.medLo}, ${g.medHi}]\t${g.q1}-${g.q3}\t${g.shieldMedian}\t${g.gainA}`); });
  console.log('dependence (Spearman rho, p):', JSON.stringify(dep));
  console.log('map\tunit\tcost\tA/H\tbase\tgain+1A [95%]\th points:gains\tw [95%]\twLin\tshieldH/pt');
  rows.sort((a, b) => a.map - b.map || a.cost - b.cost).forEach(r => console.log(`${r.map}\t${r.unit}\t${r.cost}\t${r.attack}/${r.health}\t${r.base}\t${r.gainA} [${r.gainALo}, ${r.gainAHi}]\t${r.hs.map((h, i) => h + ':' + r.gainsH[i]).join(' ')}\t${r.cens}${r.w} [${r.wLo}, ${r.wHi}]\t${r.wLin}\t${r.shieldH}`));
}

async function speed() {
  const gm = O.loadGame(ROOT), play = makePlayer(gm); let n = 0; const t0 = Date.now();
  MAPS.forEach(m => { [{}, { dA: 1 }, { dH: 6 }, { sh: 3 }].forEach(v => { const s = play(m, 'stag-knight', v, 0, 0, 10); n += s.length; console.log(m, vKey(v), s); }); });
  console.log(`${n} games, ${(n / ((Date.now() - t0) / 1000)).toFixed(1)}/s on one thread`);
}

if (isMainThread && require.main === module) {
  const a = process.argv.slice(2), cmd = a[0], opt = { games: 64, workers: Math.max(1, Math.min(os.cpus().length, 2)), units: null };
  for (let i = 1; i < a.length; i++) { if (a[i] === '--games') opt.games = +a[++i]; else if (a[i] === '--workers') opt.workers = +a[++i]; else if (a[i] === '--units') opt.units = a[++i].split(','); }
  if (cmd === 'run') run(opt).catch(e => { console.error(e); process.exit(1); });
  else if (cmd === 'report') report();
  else if (cmd === 'speed') speed().catch(e => { console.error(e); process.exit(1); });
  else { console.log('usage: node tools/skw2/skw2.js run [--games 64] [--workers 2] [--units a,b] | report | speed'); }
}
