#!/usr/bin/env node
// 2026-11-18 (package SKWK2, owner OWN-1117-3 "build the SK and WK"): each Maps 0-20 map's N-SK / N-WK practice decks (canonical/pro-skirmishes.json)
// brought to docs/evaluation-protocol.md section 3 against the REFIT5 / REFIT6 Map references:
//   - N-SK draws BPRO (else PRO): their win rate against the map's 10 reference-ladder decks in 15-30%, and the Map reference at most 85%
//     against every PRO / BPRO deck (TOO WEAK above);
//   - N-WK draws WPRO: the Map reference at least 50% against each (TOO STRONG below).
// A local descent on one deck at a time, BAL21's (tools/bal21/pro_fix_2026_11_07.js) with a window instead of a cap, inside the deck's own rules:
// BPRO = the map's list (bpro2 planMap pool), PRO = the map-true pool with the list anchor (deck1 planMap), WPRO = the list without Baby cards;
// 20 cards, at most 6 different and 4 copies, the rarity caps, the map rule (deckopt mapRuleProblems), and at most 10 copies shared with any other
// strong deck of the map (PRO + BPRO, BAL16). Moves: 1-2 copies between the deck's cards, 1-2 copies or all of a card to another pool card.
// Each game is pro_ease.js's (the deck as its own PRO fight: proNode, its showcase leader, the PRO rule's CPU), so a reading here is a pro_ease
// reading; tune seeds fnv('skwk2|<id>|<ref>'), validation seeds fnv('skwk2v|<id>|<ref>'), the after-read on pro_ease's own seeds.
//   node docs/balance/skwk2/skwk2_2026_11_18.js rebake [--dry]          stored average fields and PRO / BPRO showcase leaders under today's cards
//   node docs/balance/skwk2/skwk2_2026_11_18.js legal                   every Maps 0-20 deck's rule problems
//   node docs/balance/skwk2/skwk2_2026_11_18.js plan --marks <file>     which decks to tune / drop (from the before marks, scratch marks.js json)
//   node docs/balance/skwk2/skwk2_2026_11_18.js tune --maps m1,mf [--shard 0 --shards 2]   -> docs/balance/skwk2/tune/<mapId>.json
//   node docs/balance/skwk2/skwk2_2026_11_18.js apply [--dry]           the kept decks and drops into canonical/pro-skirmishes.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const O = require(path.join(ROOT, 'tools/opt/deckopt.js')), P = require(path.join(ROOT, 'tools/opt/pro_skirmishes.js')), PE = require(path.join(ROOT, 'tools/opt/pro_ease.js'));
const B2 = require(path.join(ROOT, 'tools/opt/bpro2_2026_10_31.js')), D1 = require(path.join(ROOT, 'tools/opt/deck1_2026_10_30.js')), W = require(path.join(ROOT, 'tools/opt/wpro_2026_11_02.js'));
const T3 = require(path.join(ROOT, 'tools/bench/deck.js'));
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; }, has = k => a.includes(k);
const PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), OUT = path.resolve(arg('--out', path.join(__dirname, 'tune'))), PLAN = path.resolve(arg('--plan', path.join(__dirname, 'plan-2026-11-18.json'))), DATE = '2026-11-18';
const RULE = { maxUnique: 6, maxCopies: 4, size: 20, maxOverlap: 10 };
// the protocol's marks, and the windows the descent aims at (a margin inside them: the screen reads 40 ladder games, the re-read 120)
const BAND = [0.15, 0.30], SK_EASY = 0.85, WK_STRONG = 0.50;
const AIM = { sk: [+arg('--sk-lo', 0.18), +arg('--sk-hi', 0.27)], skRefMax: +arg('--ref-max', 0.78), wk: [0.60, 1], pro: [0, 0.78] }; // pass 2 (SKWK2): --sk-hi / --ref-max widen the aim where the band and the 85% line pull apart
const SCREEN = +arg('--screen', 4), REREAD = +arg('--reread', 12), REF_G = +arg('--ref-games', 40), VAL = +arg('--val', 20), STEPS = +arg('--steps', 6), SAMPLE = +arg('--sample', 24);
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const tot = d => Object.values(d).reduce((t, k) => t + k, 0), keyOf = O.deckKey, ovl = O.overlap, r3 = x => x == null ? null : Math.round(x * 1000) / 1000;
let gm = null; const game = () => gm || (gm = O.loadGame(ROOT));
const readPro = () => JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
const mapsTo20 = g => D1.mapsUpTo20(g, null);
const kindOfId = id => /-WPRO-\d+$/.test(id) ? 'wpro' : /-BPRO-\d+$/.test(id) ? 'bpro' : 'pro';

// ---------------------------------------------------------------- the deck's rules
function rulesFor(g, map, ent, kind, id, start) {
  const rules = O.loadRules(ROOT), cap = O.mapRarityCap(g, map), step = r => g.G.roadRarityStep(r);
  let pool, anchor = null, anchorMin = 0, mode = null;
  if (kind === 'bpro') { pool = B2.planMap(g, map, rules).pool || []; mode = 'bpro'; }
  else if (kind === 'pro') { const d = D1.planMap(g, map, rules, {}); pool = d.pool; anchor = new Set(d.anchor); anchorMin = d.anchor.length ? (d.anchorMin || 10) : 0; mode = 'map-true'; }
  else pool = W.poolOf(g, map);
  // a card's own fault: off the pool (BPRO / WPRO: the list; PRO: the map-true rule, deckopt mapRuleProblems on the card alone)
  const list = new Set(pool), offRule = c => !g.D[c] || !O.deckable(g, c) || step(g.D[c].rarity) > step(cap) || (kind === 'pro' ? O.mapRuleProblems(g, map, { [c]: 1 }, mode).length > 0 : !list.has(c));
  // moves draw on the plan's pool (PRO: deck1's shortlist) plus the deck's own legal cards
  pool = [...new Set(pool.concat(Object.keys(start || {})))].filter(c => !offRule(c));
  const capOf = c => Math.min(RULE.maxCopies, O.capOf(g, c));
  const othersOf = () => kind === 'wpro' ? (ent.wpro || []).filter(x => x.id !== id).map(x => x.deck) : (ent.pro || []).concat(ent.bpro || []).filter(x => x.id !== id).map(x => x.deck);
  const others = othersOf(), was = others.map(o => start ? ovl(start, o) : 0);
  const problems = d => { const out = [], ids = Object.keys(d);
    if (tot(d) !== RULE.size) out.push(tot(d) + ' cards'); if (ids.length > RULE.maxUnique) out.push(ids.length + ' different');
    ids.forEach(c => { if (offRule(c)) out.push(c + ': off the ' + kind + ' pool'); if (d[c] < 1 || d[c] > capOf(c)) out.push(c + ' x' + d[c]); });
    if (anchor && ids.filter(c => anchor.has(c)).reduce((t, c) => t + d[c], 0) < anchorMin) out.push('under ' + anchorMin + ' list copies');
    const lead = kind === 'wpro' ? [] : P.leadersFor(g, map, d); P.deckProblems(g, d, lead).forEach(p => out.push(p));
    if (kind === 'bpro') B2.bproProblems(g, map, d).forEach(p => out.push(p));
    if (mode) O.mapRuleProblems(g, map, d, mode).forEach(p => out.push(p));
    // strong decks share at most 10 copies (BAL16); weak decks 10 apart from each other
    // (no worse than the deck already was: some decks shared more before SKWK2)
    others.forEach((o, i) => { if (ovl(d, o) > Math.max(RULE.maxOverlap, was[i])) out.push('shares ' + ovl(d, o) + ' copies with another deck'); });
    return out; };
  return { pool, capOf, problems, offRule, legal: d => !problems(d).length, kind };
}
function movesOf(R, d) {
  const out = [], ids = Object.keys(d), add = (x, mv) => { if (keyOf(x) !== keyOf(d)) out.push({ d: x, mv }); };
  for (const o of ids) {
    for (const k of [1, 2]) { if (d[o] < k) continue;
      for (const i of ids) { if (i === o || d[i] + k > R.capOf(i)) continue; const x = Object.assign({}, d); x[o] -= k; if (!x[o]) delete x[o]; x[i] += k; add(x, `${o} -${k} -> ${i}`); }
      for (const i of R.pool) { if (d[i] || k > R.capOf(i)) continue; const x = Object.assign({}, d); x[o] -= k; if (!x[o]) delete x[o]; x[i] = k; add(x, `${o} -${k} -> ${i}`); } }
    if (d[o] > 2) for (const i of R.pool) { if (d[i]) continue; const x = Object.assign({}, d), k = d[o]; delete x[o]; x[i] = Math.min(k, R.capOf(i)); let left = k - x[i];
      for (const j of Object.keys(x)) { while (left > 0 && x[j] < R.capOf(j)) { x[j]++; left--; } } if (!left) add(x, `${o} x${k} -> ${i}`); }
  }
  return out.filter(c => R.legal(c.d));
}
// a repair: the copies of every card off the rules go to a pool card (the best on the objective's screen)
function repairs(R, d) {
  const bad = Object.keys(d).filter(c => R.offRule(c)); if (!bad.length) return [];
  const out = [];
  for (const i of R.pool.filter(c => !R.offRule(c))) { const x = Object.assign({}, d); let left = 0; bad.forEach(c => { left += x[c]; delete x[c]; });
    x[i] = Math.min((x[i] || 0) + left, R.capOf(i)); left -= x[i] - (d[i] || 0);
    for (const j of Object.keys(x).sort((p, q) => x[q] - x[p])) { while (left > 0 && x[j] < R.capOf(j)) { x[j]++; left--; } }
    if (!left) out.push({ d: x, mv: `${bad.join('+')} -> ${i}` }); }
  return out;
}

// ---------------------------------------------------------------- the games (pro_ease.js's fight)
function playDeck(g, map, ent, entry, kind, deck, ref, games, seed0) {
  const G = g.G, e2 = Object.assign({}, entry, { deck, leaders: kind === 'wpro' ? [] : P.leadersFor(g, map, deck) }), node = PE.gameProNode(g, map, e2, ent, 1);
  const ctx = G.referenceFightSetup(map.id, node, PE.refOpts(g, map, node, ref, seed0)); let w = 0, l = 0;
  for (let k = 0; k < games; k++) { const r = G.playReferenceGame(ctx, k); if (r.win) w++; else if (r.loss) l++; }
  return { w, l, n: games };
}
function objective(kind, sk) { // what the deck is aimed at
  if (kind === 'wpro') return { metric: 'ref', lo: AIM.wk[0], hi: AIM.wk[1], band: [WK_STRONG, 1] };
  if (sk) return { metric: 'ladder', lo: AIM.sk[0], hi: AIM.sk[1], band: BAND, refMax: AIM.skRefMax, refCut: SK_EASY };
  return { metric: 'ref', lo: AIM.pro[0], hi: AIM.pro[1], band: [0, SK_EASY] };
}
function makeReader(g, map, ent, entry, kind, salt) {
  const ladder = PE.expandRefs(g, ['ladder']), cache = new Map();
  const run = (d, ref, n) => { const k = keyOf(d) + '|' + ref + '|' + n + '|' + salt; if (!cache.has(k)) cache.set(k, playDeck(g, map, ent, entry, kind, d, ref, n, fnv(salt + '|' + entry.id + '|' + ref))); return cache.get(k); };
  return {
    ladder: (d, per) => { let l = 0, n = 0; ladder.forEach(r => { const x = run(d, r, per); l += x.l; n += x.n; }); return l / n; }, // the deck's wins
    ref: (d, n) => run(d, 'map', n).w / n, // the Map reference's wins
    size: () => cache.size,
  };
}
const gapOf = (v, lo, hi) => v < lo ? lo - v : v > hi ? v - hi : 0;

function tuneDeck(g, map, ent, entry, kind, sk, log, orig) { // orig: the deck in the file when the start is a search deck
  const R = rulesFor(g, map, ent, kind, entry.id, entry.deck), ob = objective(kind, sk), T = makeReader(g, map, ent, entry, kind, 'skwk2'), t0 = Date.now();
  const rng = O.mulberry(fnv('skwk2|' + entry.id));
  const score = (d, deep) => { // gap to the aim (+ the SK deck's Map reference cap) at the screen or the re-read
    if (ob.metric === 'ladder') { const v = T.ladder(d, deep ? REREAD : SCREEN); let gp = gapOf(v, ob.lo, ob.hi), rf = null;
      if (deep) { rf = T.ref(d, REF_G); if (rf > ob.refMax) gp += (rf - ob.refMax) * 2; }
      return { v, rf, gap: gp }; }
    const v = T.ref(d, deep ? REF_G + 20 : 24); return { v, rf: v, gap: gapOf(v, ob.lo, ob.hi) }; };
  let cur = Object.assign({}, entry.deck); const trail = [];
  // legality first
  for (let s = 0; s < 3 && !R.legal(cur); s++) {
    const probs = R.problems(cur); let cands = repairs(R, cur).filter(c => R.legal(c.d));
    if (!cands.length) { const ms = movesOf(Object.assign({}, R, { legal: () => true }), cur).filter(c => R.problems(c.d).length < probs.length); cands = ms; }
    if (!cands.length) { log(entry.id, 'cannot repair:', probs.join('; ')); return { id: entry.id, kind, sk, objective: ob, repairFailed: probs, keep: false }; }
    const best = cands.map(c => Object.assign(c, { s: score(c.d, false) })).sort((p, q) => p.s.gap - q.s.gap)[0];
    trail.push({ move: 'repair: ' + best.mv, was: probs }); cur = best.d; log(entry.id, 'repair', best.mv, R.legal(cur) ? 'legal' : 'still: ' + R.problems(cur).join('; '));
  }
  if (!R.legal(cur)) return { id: entry.id, kind, sk, objective: ob, repairFailed: R.problems(cur), keep: false };
  let r = score(cur, true); trail.push({ move: 'start', v: r3(r.v), ref: r3(r.rf), gap: r3(r.gap) }); log(entry.id, kind, sk ? 'SK' : '', ob.metric, 'start', r3(r.v), 'ref', r3(r.rf));
  for (let s = 0; s < STEPS && r.gap > 0; s++) {
    let cands = movesOf(R, cur); for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
    cands = cands.slice(0, SAMPLE);
    const top = cands.map(c => Object.assign(c, { s: score(c.d, false) })).sort((p, q) => p.s.gap - q.s.gap).slice(0, 4).map(c => Object.assign(c, { s2: score(c.d, true) })).sort((p, q) => p.s2.gap - q.s2.gap);
    const best = top[0]; if (!best || best.s2.gap > r.gap - 0.02) { trail.push({ move: 'stop (no move 2+ points nearer)', tried: cands.length }); break; }
    cur = best.d; r = best.s2; trail.push({ move: best.mv, v: r3(r.v), ref: r3(r.rf), gap: r3(r.gap), tried: cands.length }); log(entry.id, s + 1, best.mv, r3(r.v), 'ref', r3(r.rf));
  }
  // validation on fresh seeds, the protocol's own marks (not the aim): kept when in the band or 5+ points nearer than the deck was
  const V = makeReader(g, map, ent, entry, kind, 'skwk2v');
  const val = d => { if (ob.metric === 'ladder') { const v = V.ladder(d, VAL), rf = V.ref(d, REF_G); return { v: r3(v), ref: r3(rf), gap: r3(gapOf(v, ob.band[0], ob.band[1]) + (rf > ob.refCut ? rf - ob.refCut : 0)) }; }
    const v = V.ref(d, REF_G * 2); return { v: r3(v), ref: r3(v), gap: r3(gapOf(v, ob.band[0], ob.band[1])) }; };
  const base = orig || entry.deck, wasLegal = orig ? !Object.keys(orig).some(c => R.offRule(c)) : !R.problems(base).length;
  const before = wasLegal ? val(base) : null, changed = keyOf(cur) !== keyOf(base), after = changed ? val(cur) : before;
  const keep = changed && (!wasLegal || after.gap === 0 || after.gap + 0.05 <= before.gap);
  const res = { id: entry.id, map: map.id, kind, sk, objective: ob, before: { deck: base, legal: wasLegal, val: before }, pick: { deck: cur, val: after, leaders: kind === 'wpro' ? [] : P.leadersFor(g, map, cur) }, keep, trail, readings: T.size(), sec: Math.round((Date.now() - t0) / 1000) };
  log(entry.id, 'validation', JSON.stringify(before), '->', JSON.stringify(after), keep ? 'KEEP' : 'no', res.sec + 's');
  return res;
}

// ---------------------------------------------------------------- the strong search for SK decks the descent cannot lift
// SKIR1's BPRO search (tools/skir1/refdecks_2026_11_11.js run --kind bpro: tools/bench/deck.js's 6/4 focused search over deckopt's gauntlet,
// the list pool, its focuses in the EFFECTS-1 order) on today's cards and references; output docs/balance/skwk2/search/. Its decks are then
// starting points for `tune --from-search` (each still tuned to the band).
async function search() {
  const g = game(), rules = O.loadRules(ROOT), want = (arg('--maps', '') || '').split(',').filter(Boolean), dir = path.join(__dirname, 'search');
  const room = ids => ids.reduce((t, id) => t + Math.min(RULE.maxCopies, O.capOf(g, id)), 0);
  for (const map of mapsTo20(g).filter(m => want.includes(m.id))) {
    const b = B2.planMap(g, map, rules); if (b.none || !(b.pool || []).length) { console.log(map.id + ': no BPRO pool'); continue; }
    const f = path.join(dir, `bench-deck-map${String(g.G.mapNumberOf(map.id)).padStart(2, '0')}-${map.id}-${DATE}.json`); if (fs.existsSync(f) && !has('--force')) continue;
    const all = T3.focusesFor(g, b.pool, rules, null), fit = all.filter(x => x.cards && room(x.cards) >= x.need).map(x => x.id);
    const res = ['stone/metal', 'economy'].filter(x => fit.includes(x)).slice(0, 1), fam = fit.filter(x => /^family:/.test(x)).slice(0, 2), rest = ['big', 'swarm'].filter(x => fit.includes(x));
    const focus = [...new Set(res.concat(fam, rest))].slice(0, 3).concat(['open']), t = Date.now();
    await T3.main({ map: map.id, mode: 'map-true', pool: b.pool, anchor: null, focus, level: 1, budget: +arg('--budget', 6000), finalGames: 24, maxUnique: RULE.maxUnique, maxCopies: RULE.maxCopies, size: RULE.size,
      seed: 'skwk2-bpro', workers: +arg('--workers', 2), out: dir, tag: DATE, quiet: true, apart: 10, avoid: [] });
    console.log(`${map.id}: search done (${Math.round((Date.now() - t) / 1000)} s)`);
  }
}
const searchedDecks = (g, map) => { const f = path.join(__dirname, 'search', `bench-deck-map${String(g.G.mapNumberOf(map.id)).padStart(2, '0')}-${map.id}-${DATE}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).decks.map(d => ({ deck: d.deck, focus: d.focus, score: d.score })) : []; };

// ---------------------------------------------------------------- commands
function rebake(dry) {
  const g = game(), file = readPro(); let nF = 0, nL = 0;
  for (const map of mapsTo20(g)) { const ent = file.maps[map.id]; if (!ent) continue;
    const f = P.averageField(g, map), field = f ? Object.assign({}, f, { summary: P.fieldSummary(g, f) }) : null, h = { package: 'SKWK2', on: DATE };
    if (field && (JSON.stringify(field.rules) !== JSON.stringify((ent.field || {}).rules) || JSON.stringify(field.terrain) !== JSON.stringify((ent.field || {}).terrain))) { h.field = ent.field; ent.field = field; nF++; console.log(`${map.id}: field ${h.field ? h.field.summary : '-'} -> ${field.summary}`); }
    const L = {}; ['pro', 'bpro'].forEach(list => (ent[list] || []).forEach(e => { const l = P.leadersFor(g, map, e.deck); if (JSON.stringify(l) !== JSON.stringify(e.leaders || [])) { L[e.id] = e.leaders || []; console.log(`${e.id}: leader ${(e.leaders || []).join(',') || '-'} -> ${l.join(',') || '-'}`); e.leaders = l; nL++; } }));
    if (Object.keys(L).length) h.leaders = L;
    if (h.field || h.leaders) { h.why = 're-baked after FOLD6 / CARDPOW2 / REFIT5-6 (SKWK2): ' + [h.field ? 'the stored average field (FOLD6 moved Coral Current\'s and Eyrie Heights\' weather)' : '', h.leaders ? 'the showcase leaders under the re-set cards' : ''].filter(Boolean).join(' and ') + '; the previous values are here'; ent.history = (ent.history || []).concat([h]); }
  }
  console.log(`${nF} fields, ${nL} leaders re-baked`); if (!dry) fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n');
}
function legalAll() {
  const g = game(), file = readPro(); let n = 0;
  for (const map of mapsTo20(g)) { const ent = file.maps[map.id]; if (!ent) continue;
    for (const kind of ['pro', 'bpro', 'wpro']) for (const e of ent[kind] || []) { const p = rulesFor(g, map, ent, kind, e.id, e.deck).problems(e.deck); if (p.length) { n++; console.log(e.id + ': ' + p.join('; ')); } } }
  console.log(n + ' decks with problems'); return n;
}
// the plan: from the before marks (scratch marks.js json: per deck mapRef / vsLadder), which decks to tune and which PRO decks to drop
function plan(marksFile) {
  const g = game(), file = readPro(), M = JSON.parse(fs.readFileSync(marksFile, 'utf8')).maps, out = { about: 'SKWK2 plan (docs/balance/skwk2/skwk2_2026_11_18.js plan): per map the decks to tune (SK band 15-30% vs the ladder, Map reference <= 85% / WK >= 50%) and the PRO decks to drop', marks: path.relative(ROOT, marksFile), maps: {} };
  for (const map of mapsTo20(g)) { const ent = file.maps[map.id], m = M[map.id]; if (!ent || !m || !Object.values(m.decks || {}).some(d => d.mapRef != null)) continue;
    const skKind = (ent.bpro || []).length ? 'bpro' : 'pro', row = { tune: [], drop: [], why: {} };
    for (const kind of ['bpro', 'pro', 'wpro']) for (const e of ent[kind] || []) {
      const d = m.decks[e.id] || {}, illegal = rulesFor(g, map, ent, kind, e.id, e.deck).problems(e.deck).filter(p => !/^shares |^under \d+ list copies/.test(p)); // the soft BAL16 rules (overlap, list anchor) alone do not make a deck illegal
      if (kind === skKind) { if (illegal.length || d.vsLadder == null || d.vsLadder < BAND[0] || d.vsLadder > BAND[1] || (d.mapRef != null && d.mapRef > SK_EASY)) { row.tune.push(e.id); row.why[e.id] = { illegal, vsLadder: d.vsLadder, mapRef: d.mapRef }; } }
      else if (kind === 'pro') { if (illegal.length || (d.mapRef != null && d.mapRef > SK_EASY)) { row.drop.push(e.id); row.why[e.id] = { illegal, mapRef: d.mapRef }; } }
      else if (kind === 'wpro') { if (illegal.length || (d.mapRef != null && d.mapRef < WK_STRONG)) { row.tune.push(e.id); row.why[e.id] = { illegal, mapRef: d.mapRef }; } }
    }
    // a PRO deck is dropped (owner 11-07 9b: "remove every too-easy PRO deck") only while one legal PRO deck stays; otherwise it is tuned
    const keepPro = (ent.pro || []).filter(e => !row.drop.includes(e.id));
    if (!keepPro.length && row.drop.length) { const e = row.drop.shift(); row.tune.push(e); }
    if (row.tune.length || row.drop.length) out.maps[map.id] = row;
  }
  fs.writeFileSync(PLAN, JSON.stringify(out, null, 1) + '\n');
  Object.entries(out.maps).forEach(([id, r]) => console.log(id.padEnd(5), 'tune', r.tune.join(',') || '-', '| drop', r.drop.join(',') || '-'));
  console.log(Object.values(out.maps).reduce((t, r) => t + r.tune.length, 0) + ' to tune, ' + Object.values(out.maps).reduce((t, r) => t + r.drop.length, 0) + ' to drop');
}
function tune() {
  const g = game(), pl = JSON.parse(fs.readFileSync(PLAN, 'utf8')), want = (arg('--maps', '') || '').split(',').filter(Boolean), SH = +arg('--shard', 0), SHS = +arg('--shards', 1);
  const ids = Object.keys(pl.maps).filter(id => !want.length || want.includes(id)).filter((id, i) => i % SHS === SH);
  fs.mkdirSync(OUT, { recursive: true });
  for (const mid of ids) {
    const f = path.join(OUT, mid + '.json'), prev = has('--resume') && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; if (prev && prev.drop) continue; // finished
    const file = readPro(), ent = file.maps[mid], map = g.G.CONQUEST_MAPS.find(m => m.id === mid), row = pl.maps[mid], res = { map: mid, generated: null, decks: prev ? prev.decks : [] };
    // a stopped map goes on from its next deck, the finished ones in place as the run left them
    res.decks.forEach(r => { const e = (ent[r.kind] || []).find(x => x.id === r.id); if (e && r.keep) e.deck = r.pick.deck; });
    // dropped PRO decks leave first, so the overlap rule reads the decks that stay; SK decks before WK, each tuned deck replaces its entry
    ent.pro = (ent.pro || []).filter(e => !row.drop.includes(e.id));
    const skKind = (ent.bpro || []).length ? 'bpro' : 'pro';
    const found = has('--from-search') ? searchedDecks(g, map) : [], used = new Set();
    for (const id of row.tune) { if (res.decks.some(r => r.id === id)) continue; const kind = kindOfId(id), e0 = (ent[kind] || []).find(x => x.id === id); if (!e0) continue; let e = e0, seeded = null;
      // --from-search: an SK deck starts from the strong search's best deck the map's rules still allow (overlap with the decks that stay)
      if (found.length && kind === skKind) { const R = rulesFor(g, map, ent, kind, id, null), pick = found.find((d, i) => !used.has(i) && R.legal(d.deck));
        if (pick) { used.add(found.indexOf(pick)); seeded = { deck: pick.deck, focus: pick.focus, score: pick.score }; e = Object.assign({}, e0, { deck: pick.deck }); console.log(id, 'starts from the search deck', pick.focus, pick.score); } }
      const r = tuneDeck(g, map, ent, e, kind, kind === skKind, (...x) => console.log(...x), seeded ? e0.deck : null); if (seeded) r.seeded = seeded; res.decks.push(r); if (r.keep) e0.deck = r.pick.deck;
      res.generated = new Date().toISOString(); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n'); }
    res.drop = row.drop; res.generated = new Date().toISOString(); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n');
  }
}
// the keep rule on the validation reading, re-read here so the per-deck TOO WEAK line weighs as the descent weighs it: an SK deck's gap is its
// distance from the 15-30% band plus twice the Map reference's excess over 85%; kept when that is 0 or 5+ points smaller than the deck in the
// file (an illegal deck is always replaced by its legal repair)
function keepOf(r) {
  if (!r.pick || !r.pick.val || keyOf(r.pick.deck) === keyOf(r.before.deck)) return false; if (!r.before.legal) return true;
  // a deck the Map reference did not beat over 85% is not traded into a TOO WEAK one (the per-deck pill weighs over the per-map band)
  if (r.objective.metric === 'ladder' && r.before.val.ref <= SK_EASY && r.pick.val.ref > SK_EASY) return false;
  const g = v => r.objective.metric === 'ladder' ? gapOf(v.v, BAND[0], BAND[1]) + 2 * Math.max(0, v.ref - SK_EASY) : v.gap;
  const a = g(r.pick.val), b = g(r.before.val); return a < 1e-9 || a + 0.05 <= b + 1e-9;
}
function apply(dry) {
  const g = game(), file = readPro(), pl = JSON.parse(fs.readFileSync(PLAN, 'utf8')), rules = O.loadRules(ROOT); let nT = 0, nD = 0;
  for (const mid of Object.keys(pl.maps)) {
    const f = path.join(OUT, mid + '.json'); if (!fs.existsSync(f)) { console.log(mid + ': no tune result (skipped)'); continue; }
    const res = JSON.parse(fs.readFileSync(f, 'utf8')), ent = file.maps[mid], map = g.G.CONQUEST_MAPS.find(m => m.id === mid), prefix = P.proPrefix(g, map), h = { package: 'SKWK2', on: DATE, why: 'N-SK / N-WK decks brought to the protocol marks against the REFIT5 / REFIT6 Map references (docs/balance/skwk2/)' };
    for (const r of res.decks) { if (!keepOf(r)) continue; const e = (ent[r.kind] || []).find(x => x.id === r.id); if (!e) continue;
      (h.decks = h.decks || {})[r.id] = e.deck; e.deck = r.pick.deck; e.leaders = r.kind === 'wpro' ? [] : P.leadersFor(g, map, e.deck); e.h2h = null;
      try { e.labels = T3.describe(g, e.deck, rules, [e.focus], null).labels; } catch (x) { }
      const pc = v => v == null ? '-' : Math.round(v * 1000) / 10 + '%', ob = r.objective;
      e.skwk2 = (e.skwk2 ? e.skwk2 + ' || pass 2: ' : '') + `2026-11-18 (SKWK2): ${r.kind === 'wpro' ? 'N-WK' : r.sk ? 'N-SK' : 'PRO'} deck ${r.before.legal ? '' : '(off its pool after FOLD6, repaired) '}tuned for ${ob.metric === 'ladder' ? 'its win rate vs the reference ladder (15-30%)' : r.kind === 'wpro' ? 'the Map reference at 50%+' : 'the Map reference at 85% or under'}: ${ob.metric === 'ladder' ? 'vs ladder ' + pc((r.before.val || {}).v) + ' -> ' + pc(r.pick.val.v) + ', Map reference ' + pc((r.before.val || {}).ref) + ' -> ' + pc(r.pick.val.ref) : 'Map reference ' + pc((r.before.val || {}).v) + ' -> ' + pc(r.pick.val.v)} (validation seeds); ${r.trail.filter(t => t.move !== 'start' && !/^stop/.test(t.move)).map(t => t.move).join('; ')} (docs/balance/skwk2/skwk2_2026_11_18.js; not re-searched, its source run is the deck it started from)`;
      nT++; console.log('tuned', r.id, JSON.stringify(r.before.val), '->', JSON.stringify(r.pick.val)); }
    if ((res.drop || []).length) { const dropped = (ent.pro || []).filter(e => res.drop.includes(e.id)); h.droppedPro = dropped.map(e => ({ id: e.id, deck: e.deck, why: 'Map reference over 85% or off its pool (owner 11-07 9b: remove every too-easy PRO deck)' }));
      ent.pro = (ent.pro || []).filter(e => !res.drop.includes(e.id)); ent.pro.forEach((e, i) => { const id = `${prefix}-PRO-${i + 1}`; if (e.id !== id) { (h.renamed = h.renamed || {})[e.id] = id; e.id = id; e.name = id; } }); nD += dropped.length; console.log(mid, 'dropped', res.drop.join(',')); }
    if (h.decks || h.droppedPro) ent.history = (ent.history || []).concat([h]);
  }
  // --drop-wpro: a weak deck the descent could not bring to the 50% line leaves while the map keeps another (bal11-wk: 1-2 a map)
  (arg('--drop-wpro', '') || '').split(',').filter(Boolean).forEach(id => { const mid = Object.keys(file.maps).find(k => (file.maps[k].wpro || []).some(x => x.id === id)), ent = mid && file.maps[mid]; if (!ent || ent.wpro.length < 2) { console.log(id + ': not dropped (the map\'s only WPRO)'); return; }
    const e = ent.wpro.find(x => x.id === id), map = g.G.CONQUEST_MAPS.find(m => m.id === mid), prefix = P.proPrefix(g, map); ent.wpro = ent.wpro.filter(x => x.id !== id);
    const h = { package: 'SKWK2', on: DATE, droppedWpro: [{ id, deck: e.deck, why: 'the Map reference wins under 50% against it and two descents found no legal deck of its list at 50%+ (N-WK TOO STRONG)' }] };
    ent.wpro.forEach((x, i) => { const nid = `${prefix}-WPRO-${i + 1}`; if (x.id !== nid) { (h.renamed = h.renamed || {})[x.id] = nid; x.id = nid; x.name = nid; } }); ent.history = (ent.history || []).concat([h]); console.log('dropped', id); });
  console.log(`${nT} decks tuned, ${nD} PRO decks dropped`); if (!dry) { file.updated = DATE; fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); }
}

// the after-read's follow-up (pro_ease seeds, 40 games): a tuned deck the Map reference now beats over 85% goes back to the deck it replaced
// (--revert), and a PRO / BPRO deck it beats over 85% leaves while its map keeps another of that kind (--drop; owner 11-07 9b: "remove every
// too-easy PRO deck"); ids are renumbered, the old decks under history
function fix() {
  const g = game(), file = readPro(), rev = (arg('--revert', '') || '').split(',').filter(Boolean), drop = (arg('--drop', '') || '').split(',').filter(Boolean), why = arg('--why', 'the SKWK2 after-read (docs/balance/pro-ease-skwk2-2-after.json)');
  for (const [mid, ent] of Object.entries(file.maps)) { const map = g.G.CONQUEST_MAPS.find(m => m.id === mid); if (!map) continue; const prefix = P.proPrefix(g, map), h = { package: 'SKWK2', on: DATE, why: 'follow-up after ' + why };
    for (const kind of ['pro', 'bpro']) { const L = ent[kind] || [];
      for (const e of L.filter(x => rev.includes(x.id))) { const old = (ent.history || []).filter(x => x.package === 'SKWK2' && x.decks && x.decks[e.id])[0]; if (!old) { console.log(e.id + ': nothing to revert to'); continue; }
        (h.reverted = h.reverted || {})[e.id] = e.deck; e.deck = old.decks[e.id]; e.leaders = P.leadersFor(g, map, e.deck); delete e.skwk2; console.log('reverted', e.id); }
      const out = L.filter(x => drop.includes(x.id)); if (!out.length) continue; if (out.length >= L.length) { console.log(mid + ': not dropping every ' + kind + ' deck'); continue; }
      (h.dropped = h.dropped || []).push(...out.map(x => ({ id: x.id, deck: x.deck, why: 'the Map reference wins over 85% against it (N-SK TOO WEAK)' })));
      ent[kind] = L.filter(x => !drop.includes(x.id)); const label = kind === 'pro' ? 'PRO' : 'BPRO';
      ent[kind].forEach((x, i) => { const id = `${prefix}-${label}-${i + 1}`; if (x.id !== id) { (h.renamed = h.renamed || {})[x.id] = id; x.id = id; x.name = id; } }); console.log(mid, 'dropped', out.map(x => x.id).join(',')); }
    if (h.reverted || h.dropped) ent.history = (ent.history || []).concat([h]); }
  fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n');
}
// tests/deck1 holds a map to 2-4 PRO decks (DECK1): where the drops left one, --spec mf:1-PRO-3,... puts a dropped deck back (from history, by its
// id when dropped), in the gauntlet-score order, ids renumbered; then `tune` brings it under the 85% line (plan written to --plan)
function restore() {
  const g = game(), file = readPro(), spec = (arg('--spec', '') || '').split(',').filter(Boolean).map(x => x.split(':')), plan = { about: 'SKWK2 pass 3: a dropped PRO deck back on each map left with one (tests/deck1: 2-4), tuned to the Map reference at 85% or under', maps: {} };
  for (const [mid, oldId] of spec) { const ent = file.maps[mid], map = g.G.CONQUEST_MAPS.find(m => m.id === mid), prefix = P.proPrefix(g, map);
    const got = [].concat(...(ent.history || []).filter(h => h.package === 'SKWK2').map(h => (h.droppedPro || []).concat(h.dropped || []))).filter(x => x.id === oldId).pop();
    const src = [].concat(...(file.maps[mid].history || []).map(h => h.pro || [])).concat(JSON.parse(require('child_process').execFileSync('git', ['show', 'HEAD:canonical/pro-skirmishes.json'], { cwd: ROOT, maxBuffer: 1 << 28 }).toString()).maps[mid].pro).filter(x => x.id === oldId && keyOf(x.deck) === keyOf(got.deck)).pop();
    if (!got || !src) { console.log(mid + ': ' + oldId + ' not found'); continue; }
    const e = JSON.parse(JSON.stringify(src)); e.leaders = P.leadersFor(g, map, e.deck); delete e.history;
    ent.pro.push(e); const lead = ent.pro[0].kept1 ? [ent.pro.shift()] : []; ent.pro.sort((x, y) => (y.source.score || 0) - (x.source.score || 0)); ent.pro = lead.concat(ent.pro);
    const h = { package: 'SKWK2', on: DATE, why: 'restored ' + oldId + ' (tests/deck1: a map keeps 2-4 PRO decks); tuned next', restored: oldId };
    ent.pro.forEach((x, i) => { const id = `${prefix}-PRO-${i + 1}`; if (x.id !== id) { (h.renamed = h.renamed || {})[x.id === oldId && x === e ? oldId + ' (restored)' : x.id] = id; x.id = id; x.name = id; } });
    ent.history = (ent.history || []).concat([h]); plan.maps[mid] = { tune: [e.id], drop: [] }; console.log(mid, 'restored', oldId, 'as', e.id); }
  fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1) + '\n');
}
module.exports = { keepOf, rulesFor, tuneDeck, BAND, SK_EASY, WK_STRONG };
if (require.main === module) {
  if (CMD === 'rebake') rebake(has('--dry'));
  else if (CMD === 'legal') process.exitCode = legalAll() ? 1 : 0;
  else if (CMD === 'plan') plan(path.resolve(arg('--marks')));
  else if (CMD === 'tune') tune();
  else if (CMD === 'apply') apply(has('--dry'));
  else if (CMD === 'fix') fix();
  else if (CMD === 'restore') restore();
  else if (CMD === 'search') search().catch(e => { console.error(e.stack || e); process.exit(1); });
  else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
