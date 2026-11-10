#!/usr/bin/env node
// 2026-11-11 (package SKIR1, phase C): moves each rebuilt fight onto the road curve (roadCurveTarget / skirmishTargetBand, a challenge fight 10
// points under, as skirmish_pass.js measure reads it) by deck moves inside SKIR1's rules (tools/skir1/lib_fight_2026_11_11.js: the fight's pool,
// size, caps, K14, kept cards, showcase leader, boon) and the map's (a card in at most max(2, half the map's fights); two cards of a family the list
// has only two of never share a fight; a card the map's decks need for the mix is not taken out), plus its Shield override (0 .. the rule, as
// BAL35's tuner; never on the Pale Desert). The bramble's Health, level, rules and leaders are never touched.
// A round (the deck as it stands read at --g2 games, 100, on the tune seeds 11300 + 37g): --cands (12) legal moves: half the ones a weighted line
// through every read so far (win against the deck's stat score, skirmishCardScore) puts nearest the target, half spread from small to large in
// the needed direction; +2 the other way, +2 Shield moves; each at --g1 (24); the --top (2) nearest re-read at --g2; the nearest kept if 1+ point
// nearer. Up to --rounds (4) rounds, stopping within 3 points. Cheap on purpose: the machine was shared with other agents' runs (load 20+ on
// 2 cores). The pick then plays --g3 (200) games on the road seeds (9100 + 37g, the road measure's own games) against the deck as it stands
// (--from <tag>'s row when it has that many games) and is kept only when 2+ points nearer the target there; the road measure re-reads at 400.
//   node tools/skir1/fit_2026_11_11.js run --codes 0-1,... [--shard 0 --shards 2] [--from skir1b400] [--dir fit]   -> docs/balance/skir1/<dir>/<code>.json
//   node tools/skir1/fit_2026_11_11.js apply [--dir fit] [--codes ...]                                              writes the kept picks into arena_app.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require('./lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M;
const a = process.argv.slice(2), CMD = a[0] || 'run', arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CODES = (arg('--codes', '') || '').split(',').filter(Boolean), SH = +arg('--shard', 0), NSH = +arg('--shards', 1);
const G1 = +arg('--g1', 24), G2 = +arg('--g2', 100), G3 = +arg('--g3', 200), NC = +arg('--cands', 12), TOP = +arg('--top', 2), ROUNDS = +arg('--rounds', 4), SEED = +arg('--seed0', 11300);
const DIR = path.join(ROOT, 'docs', 'balance', 'skir1', arg('--dir', 'fit')), FROM = arg('--from', null), SLACK = +arg('--slack', 0);
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const score = id => G.skirmishCardScore(D[id] || {}), dscore = d => Object.entries(d).reduce((t, [id, k]) => t + k * score(id), 0);
const keyOf = L.keyOf, vkey = v => keyOf(v.deck) + '|S' + (v.shield == null ? '=' : v.shield);
const fromRows = (() => { if (!FROM) return {}; const by = {}; try { fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${FROM}.jsonl`), 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); by[r.code] = r; }); } catch (e) {} return by; })();
function find(code) { for (const m of L.maps()) { const n = L.fightsOf(m).find(x => x.key === code); if (n) return { m, n }; } throw new Error('no fight ' + code); }
function bandOf(m, n) { const b = G.skirmishTargetBand(m.id, n), drop = n.challenge && b.curve ? 0.10 : 0; return { t: (b.t - drop) * 100, lo: (b.t - drop - 0.08) * 100, hi: (b.t - drop + 0.08) * 100 }; }
function measure(m, n, v, games, seed0) {
  const nn = Object.assign({}, n, { deck: v.deck }); if (v.shield != null) nn.shieldOverride = v.shield; G.NODE_MAP_HINT.set(nn, m.id);
  const ctx = G.referenceFightSetup(m.id, nn, { seed0 }); let w = 0; for (let g = 0; g < games; g++) if (G.playReferenceGame(ctx, g).win) w++;
  return Math.round(w / games * 1000) / 10;
}
function mapState(m, code) { // the other fights' decks of the map: usage (a fight that keeps the card does not count), the mix kinds they show, the cap
  const fs2 = L.fightsOf(m), F2 = fs2.map(x => L.fight(m, x)), others = fs2.filter(x => x.key !== code), usage = {};
  F2.filter(f => f.code !== code).forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) usage[id] = (usage[id] || 0) + 1; }));
  const listAll = [...new Set([].concat(...F2.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
  return { usage, ucap: Math.max(L.ucapOf(m), Math.max(2, Math.ceil(fs2.length / 2)) + SLACK), others, listAll, pairFam: id => fam[family(id)] === 2 ? family(id) : null }; // --slack: a later pass may let a card into 1 more fight
}
function fit(code) {
  const { m, n } = find(code), f = L.fight(m, n), st = mapState(m, code), band = bandOf(m, n), t0 = Date.now();
  const rule = G.ruleShieldOf(n), ov0 = n.shieldOverride == null || n.shieldOverride === '' ? null : +n.shieldOverride, sMax = Math.max(rule, ov0 || 0);
  const mixOk = d => { const ids = new Set(Object.keys(d)); st.others.forEach(x => Object.keys(x.deck).forEach(id => ids.add(id)));
    return Object.keys(MIN).every(k => { const avail = st.listAll.filter(id => M.kinds(D[id])[k]).length, shown = [...ids].filter(id => D[id] && M.kinds(D[id])[k]).length; return shown >= Math.min(MIN[k], avail) || shown >= curShown(k); }); };
  const shown0 = {}; { const ids = new Set(Object.keys(n.deck)); st.others.forEach(x => Object.keys(x.deck).forEach(id => ids.add(id))); Object.keys(MIN).forEach(k => { shown0[k] = [...ids].filter(id => D[id] && M.kinds(D[id])[k]).length; }); }
  const curShown = k => shown0[k];
  const mapOk = d => Object.keys(d).every(id => n.deck[id] || f.keep.has(id) || (st.usage[id] || 0) + 1 <= st.ucap)
    && Object.keys(d).every(id => { const pf = st.pairFam(id); return !pf || f.keep.has(id) || !Object.keys(d).some(x => x !== id && family(x) === pf); }) && mixOk(d);
  const ok = d => f.legal(d) && mapOk(d);
  const cache = new Map(), T = (v, g, seed) => { const k = vkey(v) + '#' + g + '@' + seed; if (!cache.has(k)) cache.set(k, measure(m, n, v, g, seed)); return cache.get(k); };
  const gap = w => Math.abs(w - band.t);
  const start = { deck: Object.assign({}, n.deck), shield: null };
  // a deck's estimate pools its reads on the tune seeds and the road seeds (each seed set's longest read, weighted by games): a deck that reads
  // within 3 on the tune seeds is checked on the road seeds (--g3) before the fit stops, and rounds go on from the pooled estimate
  const E = v => { let w = 0, g = 0; for (const s of [SEED, 9100]) { let best = 0, bw = 0; for (const [k, val] of cache) { const mm = k.match(/#(\d+)@(\d+)$/); if (k.startsWith(vkey(v) + '#') && +mm[2] === s && +mm[1] > best) { best = +mm[1]; bw = val; } } w += bw * best; g += best; } return g ? Math.round(w / g * 10) / 10 : null; };
  let cur = start, curW = T(cur, G2, SEED); const trail = [{ move: 'start', win: curW }];
  const roadCheck = () => { if (gap(curW) <= 3 && !cache.has(vkey(cur) + '#' + G3 + '@9100')) { T(cur, G3, 9100); curW = E(cur); trail.push({ move: 'road check', win: curW }); } };
  roadCheck();
  // every deck read so far, against its stat score from the start deck: a weighted line w = a + b x guides the next round (the deck the line
  // puts on the target and its neighbours are screened first)
  const pts = [{ x: 0, w: curW, g: G2 }], s00 = dscore(start.deck);
  const line = () => { if (pts.length < 4) return null; let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(p => { sw += p.g; sx += p.g * p.x; sy += p.g * p.w; sxx += p.g * p.x * p.x; sxy += p.g * p.x * p.w; });
    const den = sw * sxx - sx * sx; if (Math.abs(den) < 1e-9) return null; const b = (sw * sxy - sx * sy) / den, a = (sy - b * sx) / sw; return b < -1e-6 ? { a, b } : null; };
  for (let r = 0; r < ROUNDS && gap(curW) > 3; r++) {
    const stronger = curW > band.t, cands = [], d0 = cur.deck, s0 = dscore(d0);
    const push = (d, mv) => { if (ok(d)) cands.push({ v: { deck: d, shield: cur.shield }, mv, delta: dscore(d) - s0, x: dscore(d) - s00 }); };
    const ids = Object.keys(d0);
    for (const x of ids) for (const y of ids) { if (x === y) continue; for (const k of [1, 2]) { if (d0[x] - k < (f.keep.get(x) || 0)) continue; const d = Object.assign({}, d0); d[x] -= k; if (!d[x]) delete d[x]; d[y] += k; push(d, `${x} -${k} -> ${y}`); } }
    for (const x of ids) for (const c of f.pool) { if (d0[c]) continue; for (const k of [...new Set([1, 2, d0[x]])]) { if (k > d0[x] || d0[x] - k < (f.keep.get(x) || 0)) continue; const d = Object.assign({}, d0); d[x] -= k; if (!d[x]) delete d[x]; d[c] = k; push(d, `${x} -${k} -> ${c}`); } }
    const want = cands.filter(c => stronger ? c.delta > 0 : c.delta < 0).sort((p, q) => Math.abs(p.delta) - Math.abs(q.delta)), other = cands.filter(c => !(stronger ? c.delta > 0 : c.delta < 0));
    const pickSpread = (xs, k) => xs.length <= k ? xs : [...Array(k).keys()].map(i => xs[Math.round(i * (xs.length - 1) / (k - 1))]);
    const ln = line(), xs = ln ? (band.t - ln.a) / ln.b : null;
    const guided = xs == null ? [] : want.concat(other).sort((p, q) => Math.abs(p.x - xs) - Math.abs(q.x - xs)).slice(0, Math.ceil(NC / 2));
    const tryList = [...new Set(guided.concat(pickSpread(want, guided.length ? Math.floor(NC / 2) : NC), pickSpread(other.sort((p, q) => Math.abs(p.delta) - Math.abs(q.delta)), 2)))];
    if (m.id !== 'mpd') { const sNow = cur.shield != null ? cur.shield : ov0 != null ? ov0 : rule;
      const svals = stronger ? [Math.ceil((sNow + sMax) / 2), sMax] : [0, Math.floor(sNow / 2)];
      [...new Set(svals)].filter(s => s !== sNow && s >= 0 && s <= sMax).forEach(s => tryList.push({ v: { deck: cur.deck, shield: s }, mv: `shield ${sNow} -> ${s}` })); }
    if (!tryList.length) break;
    tryList.forEach(c => { c.w1 = T(c.v, G1, SEED); if (c.x != null && c.v.shield === cur.shield && cur.shield == null) pts.push({ x: c.x, w: c.w1, g: G1 }); });
    const top = tryList.sort((p, q) => gap(p.w1) - gap(q.w1)).slice(0, TOP); top.forEach(c => { c.w2 = T(c.v, G2, SEED); if (c.x != null && cur.shield == null && c.v.shield == null) pts.push({ x: c.x, w: c.w2, g: G2 }); });
    const best = top.sort((p, q) => gap(p.w2) - gap(q.w2))[0];
    if (!best || gap(best.w2) > gap(curW) - 1) { trail.push({ move: 'no gain', tried: tryList.length }); continue; }
    cur = best.v; curW = E(cur); trail.push({ move: best.mv, win: curW, tried: tryList.length }); roadCheck();
  }
  // the keep rule on the road seeds (9100 + 37g, the road measure's own games), at --g3 games: the deck as it stands (or --from's row at that
  // many games or more) against the pick; the final road measure re-reads every fight at 400
  const changed = vkey(cur) !== vkey(start), fr = fromRows[code];
  const was = fr && fr.games >= G3 ? fr.win : T(start, G3, 9100), now = changed ? T(cur, G3, 9100) : was;
  const keep = changed && was != null && gap(now) + 2 <= gap(was);
  const res = { about: 'SKIR1 fit (tools/skir1/fit_2026_11_11.js)', code, map: m.id, mapNo: f.mapNo, side: f.side, kind: f.kind, name: n.name, band, shieldRule: rule, shieldOverride: ov0, games: G3,
    before: { deck: start.deck, win: was }, pick: { deck: cur.deck, shield: cur.shield, win: now }, keep, slack: SLACK, trail, sec: Math.round((Date.now() - t0) / 1000) };
  // the pick stands in for the deck in this process, so the map's later fights read the usage and mix it leaves (one run fits a whole map)
  if (keep) { n.deck = cur.deck; if (cur.shield != null) n.shieldOverride = cur.shield; }
  fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(path.join(DIR, code + '.json'), JSON.stringify(res) + '\n');
  console.log(`${code} t ${band.t.toFixed(1)} | ${G3}: ${was} -> ${now} ${keep ? 'KEEP' : 'no'} | ${trail.slice(1).map(x => x.move).join('; ')} | ${res.sec}s`);
  return res;
}
if (CMD === 'run') {
  CODES.filter((c, i) => i % NSH === SH).forEach(c => { if (a.includes('--resume') && fs.existsSync(path.join(DIR, c + '.json'))) return; try { fit(c); } catch (e) { console.log(c, 'ERROR', e.message); } });
} else if (CMD === 'apply') {
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), k = 0;
  const files = fs.readdirSync(DIR).filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync(path.join(DIR, x), 'utf8'))).filter(x => x.keep && (!CODES.length || CODES.includes(x.code)));
  for (const x of files) {
    const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${x.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + x.code);
    let line = mm[1]; const cur = JSON.parse((line.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]);
    if (keyOf(cur) !== keyOf(x.before.deck)) { console.log('skip', x.code, '(the deck moved since the fit)'); continue; }
    const deck = Object.fromEntries(Object.keys(x.pick.deck).sort().map(id => [id, x.pick.deck[id]])), what = [];
    if (keyOf(deck) !== keyOf(x.before.deck)) { line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck)); what.push('deck (was ' + JSON.stringify(x.before.deck) + ')'); }
    if (x.pick.shield != null) { what.push('Shield override ' + (x.shieldOverride == null ? 'rule ' + x.shieldRule : x.shieldOverride) + ' -> ' + x.pick.shield);
      line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.pick.shield) : line.replace(/deck:/, `shieldOverride:${x.pick.shield}, deck:`); }
    line = line.replace(/(deck:\{[^}]*\})/, `$1 /* 2026-11-11 (SKIR1 fit): toward the road curve (target ${Math.round(x.band.t * 10) / 10}), ${x.before.win}% -> ${x.pick.win}% at ${x.games} games on the road seeds; ${what.join('; ')} */`);
    s = s.replace(mm[1], line); k++;
  }
  fs.writeFileSync(APP + '.skir1tmp', s); fs.renameSync(APP + '.skir1tmp', APP); console.log('applied', k); // whole file, then renamed (sims may be starting)
}
else if (CMD === 'repair') {
  // fits that ran side by side each read the others' old decks: a card can end up in more of a map's fights than the cap, or two cards of a
  // two-card family in one fight. Each excess copy set moves to the pool card nearest its stat score (a new card, or more copies of one the deck
  // holds) that keeps the fight legal and the map's rules; the fights touched are listed for a re-fit.
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'); const touched = [];
  const maps = L.maps().filter(m => !CODES.length || CODES.includes(m.id));
  for (const m of maps) {
    const fs2 = L.fightsOf(m), ucap = L.ucapOf(m), F2 = fs2.map(x => L.fight(m, x));
    const listAll = [...new Set([].concat(...F2.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
    const pairFam = id => fam[family(id)] === 2 ? family(id) : null;
    const usage = () => { const u = {}; F2.forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) u[id] = (u[id] || 0) + 1; })); return u; };
    const pairBad = (f, d) => Object.keys(d).filter(id => !f.keep.has(id) && pairFam(id) && Object.keys(d).some(x => x !== id && family(x) === pairFam(id)));
    const swap = (f, id, why) => { const d0 = f.n.deck, k = d0[id], u = usage(), opts = [];
      for (const c of f.pool) { if (c === id) continue; const d = Object.assign({}, d0); delete d[id]; d[c] = (d[c] || 0) + k;
        if (!d0[c] && !f.keep.has(c) && (u[c] || 0) + 1 > ucap) continue; if (!f.legal(d) || pairBad(f, d).length) continue; opts.push({ c, d, cost: Math.abs(score(c) - score(id)) }); }
      const best = opts.sort((p, q) => p.cost - q.cost)[0]; if (!best) { console.log('repair: no move for', f.code, id, '(' + why + ')'); return false; }
      const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${f.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re), deck = Object.fromEntries(Object.keys(best.d).sort().map(x => [x, best.d[x]]));
      s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-11 (SKIR1 repair): ${id} x${k} -> ${best.c} (${why}); deck (was ${JSON.stringify(d0)}) */`));
      f.n.deck = best.d; touched.push(f.code); console.log('repair', f.code, id, 'x' + k, '->', best.c, '(' + why + ')'); return true; };
    // a card on no list (out of play; BAL9 JJ24) leaves first, one card at a time (the deck is legal only once every such card is out)
    for (const f of F2) for (const id of Object.keys(f.n.deck).filter(f.cutOut)) { const d = Object.assign({}, f.n.deck), k = d[id]; delete d[id]; const adds = {};
      for (let j = 0; j < k; j++) { // copy by copy: the nearest pool card that stays inside its cap, K14 and the family rule (a new card while under the minimum)
        const ids = Object.keys(d).filter(x => !f.cutOut(x)), want = ids.length < f.dMin;
        const c = f.pool.filter(x => !f.cutOut(x) && (d[x] || 0) + 1 <= f.cap(x) && (d[x] || ids.length < f.dMax) && !(want && d[x]))
          .filter(x => { const e = Object.assign({}, d); e[x] = (e[x] || 0) + 1; return !f.k14(e).length && !pairBad(f, e).length; })
          .sort((a, b) => Math.abs(score(a) - score(id)) - Math.abs(score(b) - score(id)))[0];
        if (!c) break; d[c] = (d[c] || 0) + 1; adds[c] = (adds[c] || 0) + 1; }
      if (L.size(d) !== L.size(f.n.deck) || (!Object.keys(d).some(f.cutOut) && !f.legal(d))) { console.log('repair: no move for', f.code, id, '(on no list)', f.problems(d).join('; ')); continue; }
      const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${f.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re), deck = Object.fromEntries(Object.keys(d).sort().map(x => [x, d[x]]));
      // a showcase SKIR1 pinned on that card goes with it (the Auto leader is the new top card)
      const pinTxt = `showcase:"${id}" /* 2026-11-11 (SKIR1): its Auto showcase leader, pinned */, `;
      s = s.replace(mm[1], mm[1].replace(pinTxt, '').replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-11 (SKIR1 repair): ${id} x${k} -> ${JSON.stringify(adds)} (on no 2026-11-11 list: out of play, BAL9 JJ24${mm[1].includes(pinTxt) ? '; its pinned showcase dropped' : ''}); deck (was ${JSON.stringify(f.n.deck)}) */`));
      f.n.deck = d; touched.push(f.code); console.log('repair', f.code, id, 'x' + k, '->', JSON.stringify(adds), '(on no list)'); }
    for (const f of F2) { const bad = pairBad(f, f.n.deck).sort((x, y) => f.n.deck[x] - f.n.deck[y]); // the smaller copy set first, else its partner
      bad.some(id => pairBad(f, f.n.deck).includes(id) && swap(f, id, 'two of a two-card family in one fight')); }
    for (const [id, k] of Object.entries(usage())) { let over = k - ucap; if (over <= 0) continue;
      for (const f of F2.filter(f => f.n.deck[id] && !f.keep.has(id)).sort((p, q) => p.n.deck[id] - q.n.deck[id])) { if (over <= 0) break; if (swap(f, id, `a card in at most ${ucap} of the map's fights`)) over--; } }
  }
  if (!a.includes('--dry')) { fs.writeFileSync(APP + '.skir1tmp', s); fs.renameSync(APP + '.skir1tmp', APP); } console.log('touched: ' + [...new Set(touched)].join(','));
}
module.exports = { fit, measure, bandOf };
