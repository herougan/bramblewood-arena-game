#!/usr/bin/env node
// 2026-11-02 (package BAL11, owner 14:26: "as you're running your deck optimisation pass, the goal is to generate a super strong deck but also a
// super weak deck given the map cards, and the field effects. These are for all maps. So maybe for every N-SK, there is a N-WK (weak)."):
// the WPRO decks, the weakest legal decks of each map, beside its BPRO decks (the strongest; tools/opt/bpro2_2026_10_31.js).
//
//   node tools/opt/wpro_2026_11_02.js run [--maps 0-20 | --map mb] [--budget 1600] [--force]   the search -> docs/balance/wpro/wpro-mapNN-<id>-2026-11-02.json
//   node tools/opt/wpro_2026_11_02.js apply [--dry]     canonical/pro-skirmishes.json: each map's `wpro` (N-WPRO-1, -2); the game's N-WK fight draws from them
//   node tools/opt/wpro_2026_11_02.js check             every WPRO deck: 20 cards, the caps, the 6/4 rule, every card on the map's list, no Baby card
//   node tools/opt/wpro_2026_11_02.js summary [--md out.md]   strong (BPRO-1) and weak (WPRO-1) win rates per map
//
// The pool is BPRO's (tools/opt/deck1_2026_10_30.js deck1Pools(map).anchor: the map's list + SPECIAL inside the map's rarity cap, no faction
// card), without Baby cards and eggs. The deck rule is BPRO's (20 cards, at most 6 different cards and 4 copies, the rarity copy caps and the
// top-rank caps: tools/bench/deck.js rule). The gauntlet is BPRO's too (deckopt buildEntries: the map's fight decks and its reference decks in a
// fair mirror under each fight's field, Level 1, the Smart CPU both sides, seats swapped), so the strong and the weak deck are read on one scale.
// The search is BPRO's descent turned round: seeds (the list's lowest card scores, then random legal decks), then neighbours (tools/bench/deck.js)
// under successive halving keeping the LOWER half, first improvement, a restart near the best after 3 misses, until --budget games. The final:
// the weakest deck and the weakest one at least 6 copies from it (WPRO-1, -2), and the map's BPRO-1 for comparison, to 24 games an entry.
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), T3 = require('../bench/deck.js'), D1 = require('./deck1_2026_10_30.js'), B2 = require('./bpro2_2026_10_31.js');
const DATE = '2026-11-02', OUTDIR = path.join(ROOT, 'docs', 'balance', 'wpro'), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const RULE = D1.RULE, BUDGET = 1600, FINAL = 24, LEVEL = 1, APART = 6;
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }
function selectMaps(gm, spec) { if (spec != null && /[a-z]/i.test(String(spec))) { const ids = new Set(String(spec).split(',')); return D1.mapsUpTo20(gm, null).filter(m => ids.has(m.id)); } return D1.mapsUpTo20(gm, mapRange(spec)); }
function poolOf(gm, map) { return D1.deck1Pools(gm, map).anchor.filter(id => !B2.isBabyId(gm, id) && O.deckable(gm, id)).sort(); }
function outFileOf(gm, map) { return path.join(OUTDIR, `wpro-map${String(gm.G.mapNumberOf(map.id)).padStart(2, '0')}-${map.id}-${DATE}.json`); }
const r4 = x => Math.round(x * 10000) / 10000;

async function runMap(gm, map, opt) {
  const G = gm.G, pool = poolOf(gm, map), R = T3.rule(gm, { maxUnique: RULE.maxUnique, maxCopies: RULE.maxCopies, size: RULE.size }), t0 = Date.now();
  const room = pool.reduce((t, id) => t + R.cap(id), 0);
  if (room < RULE.size) return { map: { id: map.id, num: G.mapNumberOf(map.id), name: map.name }, none: `the list cannot fill 20 cards without Baby cards (${pool.length} cards, ${room} copies)`, pool };
  const entries = O.buildEntries(gm, map, { roadWeight: 0 }), main = entries.map((e, i) => i).filter(i => !entries[i].neutral && entries[i].weight > 0);
  const ev = new O.Evaluator(ROOT, 2, gm), seed = 'wpro|' + map.id, rng = O.mulberry(require('../bench/lib.js').fnv(seed));
  await ev.setup({ mapId: map.id, level: LEVEL, entries, seed: seed + '|deck', ai: 1, beeTank: false });
  const stats = new O.Stats(entries.length), fit = d => O.fitness(entries, stats.get(O.deckKey(d)), main).f;
  // successive halving keeping the weaker half
  async function lowHalving(cands) { let alive = O.uniqDecks(cands), g = 2;
    for (;;) { await O.ensure(ev, stats, alive, g, main); alive.sort((a, b) => fit(a) - fit(b)); if (alive.length <= 1 || g >= 8) break; alive = alive.slice(0, Math.max(1, Math.ceil(alive.length / 2))); g = Math.min(8, g * 2); }
    await O.ensure(ev, stats, alive.slice(0, 1), 8, main); return alive; }
  const weakPref = {}; pool.slice().sort((a, b) => T3.attrs(gm, a).score - T3.attrs(gm, b).score || (a < b ? -1 : 1)).forEach((id, i) => weakPref[id] = (pool.length - i) / pool.length);
  const seeds = [R.repair({}, pool, rng, null, weakPref)]; while (seeds.length < 8) seeds.push(R.repair({}, pool, rng, null, null));
  let ranked = await lowHalving(seeds.filter(d => R.legal(d, pool))); if (!ranked.length) { ev.close(); return { map: { id: map.id }, none: 'no legal seed', pool }; }
  let best = ranked[0], cur = best, fail = 0, steps = 0, moves = 0; const budget = opt.budget || BUDGET, seen = [best];
  while (ev.games < budget) {
    const nb = T3.neighbours(gm, R, cur, pool, rng, null, 8); if (!nb.length) { if (++fail > 6) break; continue; }
    const r = await lowHalving(nb); steps++; seen.push(...r);
    if (fit(r[0]) < fit(cur)) { cur = r[0]; fail = 0; moves++; } else fail++;
    if (fit(cur) < fit(best)) best = cur;
    if (fail >= 3) { cur = T3.neighbours(gm, R, best, pool, rng, null, 4)[0] || best; await O.ensure(ev, stats, [cur], 8, main); fail = 0; }
  }
  // the final: the weakest, the weakest at least APART copies from it, and the map's strongest BPRO deck
  const byFit = O.uniqDecks(seen).filter(d => stats.get(O.deckKey(d)).n[main[0]] >= 8).sort((a, b) => fit(a) - fit(b));
  const second = byFit.find(d => O.dist(d, best) >= APART);
  const ent = (JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')).maps || {})[map.id] || {}, strong = (ent.bpro || [])[0] || null;
  const fin = [best].concat(second ? [second] : [], strong ? [strong.deck] : []);
  await O.ensure(ev, stats, fin, FINAL, main); ev.close();
  const isRef = i => /^ref:/.test(entries[i].oppKey || ''), refIdx = main.filter(isRef);
  const rd = d => { const st = stats.get(O.deckKey(d)), f = O.fitness(entries, st, main), rf = O.fitness(entries, st, refIdx.length ? refIdx : main);
    return { deck: Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]])), score: r4(f.f), ci: [r4(f.f - 1.96 * f.se), r4(f.f + 1.96 * f.se)], vsRef: r4(rf.f), refWins: r4(1 - rf.f),
      labels: T3.describe(gm, d, O.loadRules(ROOT), ['weak'], pool).labels, perOpponent: main.map(i => ({ entry: entries[i].key, p: st.n[i] ? r4(st.s[i] / st.n[i]) : null, n: st.n[i] })) }; };
  return { tool: 'tools/opt/wpro_2026_11_02.js', generated: new Date().toISOString(), map: { id: map.id, num: G.mapNumberOf(map.id), name: map.name }, level: LEVEL, pool,
    rule: Object.assign({}, RULE, { noBaby: true }), settings: { seed, budget, finalGames: FINAL, apart: APART }, gauntlet: main.map(i => ({ key: entries[i].key, label: entries[i].label })),
    steps, moves, games: ev.games, seconds: Math.round((Date.now() - t0) / 1000), weak: [rd(best)].concat(second ? [rd(second)] : []), strong: strong ? Object.assign({ id: strong.id }, rd(strong.deck)) : null };
}

function apply(gm, opt) {
  const file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')); let n = 0;
  for (const m of selectMaps(gm, opt.maps)) { const f = outFileOf(gm, m), ent = file.maps[m.id]; if (!ent || !fs.existsSync(f)) continue;
    const res = JSON.parse(fs.readFileSync(f, 'utf8')); if (res.none) { ent.wpro = []; continue; }
    const pre = P.proPrefix(gm, m);
    // the second deck only when it is weak too: at most max(30%, the weakest + 10 points)
    const sorted = res.weak.slice().sort((a, b) => a.score - b.score); // by the final's score (the search picked them at 8 games an entry)
    const weak = sorted.filter((w, i) => i === 0 || w.score <= Math.max(0.3, sorted[0].score + 0.1));
    ent.wpro = weak.map((w, i) => ({ id: `${pre}-WPRO-${i + 1}`, name: `${pre}-WPRO-${i + 1}`, focus: 'weak', labels: w.labels, level: LEVEL, leaders: [], deck: w.deck,
      source: { file: path.relative(ROOT, f), mode: 'wpro', tool: res.tool, score: w.score, ci: w.ci, refWins: w.refWins, generated: res.generated }, h2h: null, later: [] }));
    n++; console.log(`${m.id}: ${ent.wpro.map(w => w.id + ' ' + w.source.score).join('; ')}`); }
  file.wpro = { rule: Object.assign({}, RULE, { noBaby: true }), tool: 'tools/opt/wpro_2026_11_02.js', note: 'BAL11 (owner 11-02 14:26): the weakest legal decks of each map\'s list (no Baby cards), on BPRO\'s gauntlet; the N-WK fight draws from them.' };
  if (opt.dry) return; fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); console.log(n + ' maps -> ' + path.relative(ROOT, PRO_FILE) + ' (rebuild the game to bake it in)');
}
function checkAll(gm) {
  const file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), out = [];
  D1.mapsUpTo20(gm, null).forEach(m => { const ent = file.maps[m.id]; if (!ent) return; const pool = new Set(poolOf(gm, m));
    (ent.wpro || []).forEach(e => { const ids = Object.keys(e.deck); P.deckProblems(gm, e.deck, e.leaders).forEach(p => out.push(`${e.id}: ${p}`));
      if (ids.length > RULE.maxUnique) out.push(`${e.id}: ${ids.length} different cards`); if (O.deckTotal(e.deck) !== RULE.size) out.push(`${e.id}: ${O.deckTotal(e.deck)} cards`);
      ids.forEach(id => { if (e.deck[id] > RULE.maxCopies) out.push(`${e.id}: ${id} x${e.deck[id]}`); if (!pool.has(id)) out.push(`${e.id}: ${id} is not on the map's list (or a Baby card)`); }); }); });
  return out;
}
function summary(gm, opt) {
  const rows = ['| Map | Strong (BPRO-1) deck win | Map reference vs strong | Weak (WPRO-1) deck win | Map reference vs weak | Weak deck |', '|---|---|---|---|---|---|'];
  for (const m of D1.mapsUpTo20(gm, null)) { const f = outFileOf(gm, m); if (!fs.existsSync(f)) continue; const r = JSON.parse(fs.readFileSync(f, 'utf8')), pc = x => x == null ? '-' : Math.round(x * 1000) / 10 + '%';
    if (r.none) { rows.push(`| ${gm.G.mapNumberOf(m.id)} ${m.sub ? m.id + ' ' : ''}${m.name} | - | - | - | - | none: ${r.none} |`); continue; }
    const w = r.weak.slice().sort((a, b) => a.score - b.score)[0], s = r.strong; rows.push(`| ${gm.G.mapNumberOf(m.id)} ${m.sub ? m.id + ' ' : ''}${m.name} | ${s ? pc(s.score) : '-'} | ${s ? pc(s.refWins) : '-'} | ${pc(w.score)} | ${pc(w.refWins)} | ${Object.entries(w.deck).map(([k, v]) => v + 'x ' + (gm.D[k] || {}).name).join(', ')} |`); }
  const txt = rows.join('\n'); if (opt.md) fs.writeFileSync(opt.md, txt + '\n'); console.log(txt);
}
async function main(argv) {
  const cmd = argv[0], a = argv.slice(1), opt = {};
  while (a.length) { const k = a.shift(); if (k === '--maps' || k === '--map') opt.maps = a.shift(); else if (k === '--force') opt.force = true; else if (k === '--dry') opt.dry = true; else if (k === '--budget') opt.budget = +a.shift(); else if (k === '--md') opt.md = a.shift(); else throw new Error('unknown option ' + k); }
  const gm = O.loadGame(ROOT);
  if (cmd === 'run') { fs.mkdirSync(OUTDIR, { recursive: true });
    for (const m of selectMaps(gm, opt.maps)) { const f = outFileOf(gm, m); if (fs.existsSync(f) && !opt.force) continue; const t = Date.now(), res = await runMap(gm, m, opt);
      fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n');
      console.log(`${m.id}: ${res.none ? 'none (' + res.none + ')' : 'weak ' + res.weak.map(w => w.score).join(' / ') + ', strong ' + (res.strong ? res.strong.score : '-') + ', ref vs weak ' + res.weak[0].refWins} (${Math.round((Date.now() - t) / 1000)} s)`); }
    return; }
  if (cmd === 'apply') return apply(gm, opt);
  if (cmd === 'check') { const p = checkAll(gm); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ok'); if (p.length) process.exitCode = 1; return; }
  if (cmd === 'summary') return summary(gm, opt);
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 11).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { poolOf, checkAll, runMap, RULE };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
