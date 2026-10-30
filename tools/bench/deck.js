// 2026-10-28 (package TOOLS1, T3, owner 10-28 21:40: "3) a good way to optimise a deck out of a list of cards, say, 15 cards"; step 4:
// "multiple difficult optimised decks with different focuses with the rule: No more than 6 unique cards, and max 4 copies per card ... A map
// should have a range of cards that cost high, and cost generators and normal creatures."): several strong decks from a card list, each with
// its own focus, over deckopt's gauntlet (tools/opt/deckopt.js: the map's fight decks and reference decks in a fair mirror under the map's
// fields, at the map's level; --road-weight adds the fights as the game builds them).
//   - The rule: at most --max-unique (6) different cards, at most --max-copies (4) copies of a card (and never above its rarity's cap),
//     --size (20) cards, every card from the list.
//   - Focuses the list supports (--focus picks): open (no constraint); big (8+ copies of the list's costliest cards); economy (6+ copies of
//     Lumber / Stone / Metal makers); stone/metal (6+ copies paid in Stone or Metal); swarm (14+ copies of the cheapest cards); and the two
//     skill families (deckopt's phase2-rules.json) the list holds most of (8+ copies carrying them).
//   - Each focus: seed decks (the best cards by the game's skirmishCardScore within the focus, the open optimum moved into the focus, random
//     legal decks), then a descent: 8 neighbours a step (copies moved between cards, a card swapped for another, a new card in), successive
//     halving (deckopt's) up to 8 games an entry, the best taken when it beats the current deck, restarts from a perturbed best after 3 steps
//     without a gain. All decks share one evaluator and one game record (common seeds). Niching: each focus's deck stays at least --apart (6)
//     copies from the decks found before it, so no two focuses return the same deck (relaxed only when no legal deck that far exists).
//   - Final: every focus's best to --final-games an entry; its score ± 95%, per opponent, its average Lumber, its curve, the skills it
//     carries and labels read from them.
'use strict';
const path = require('path'), fs = require('fs');
const L = require('./lib.js');
const O = L.O;

const GEN_KEYS = ['onReadyGold', 'stockpile', 'lumberjack', 'milling', 'quarry', 'stonecutter', 'prospector', 'felling', 'salvage', 'scavenge', 'coppice', 'driftwood', 'windfall', 'pearlBed', 'heavyMetal', 'smelter', 'bounty', 'midas', 'hoard', 'timber']; // the engine's Gain-resource keywords (bramblewood-engine.js) + the economy family
function attrs(gm, id) {
  const d = gm.D[id], e = d.effects || {}, trig = Array.isArray(e.triggers) ? e.triggers : [];
  const gen = GEN_KEYS.some(k => e[k]) || trig.some(t => t && t.do === 'gain');
  return { id, cost: +d.cost || 0, wait: +d.wait || 0, stone: +d.stoneCost || 0, metal: +d.metalCost || 0, gen, keys: Object.keys(e), score: gm.G.skirmishCardScore(d) };
}
function focusesFor(gm, pool, rules, want) {
  const A = pool.map(id => attrs(gm, id)), costs = A.map(a => a.cost), hi = Math.max(...costs), lo = Math.min(...costs);
  const bigAt = hi >= 2 ? Math.max(1, hi - 1) : hi, F = [{ id: 'open', label: 'open (the strongest deck)', cards: null, need: 0 }];
  const add = (id, label, cards, need) => { if (cards.length >= 1 && cards.length < pool.length) F.push({ id, label, cards, need }); };
  if (hi > lo) add('big', `big (${bigAt}+ Lumber cards)`, A.filter(a => a.cost >= bigAt).map(a => a.id), 8);
  add('economy', 'economy (resource makers)', A.filter(a => a.gen).map(a => a.id), 6);
  add('stone/metal', 'stone / metal costs', A.filter(a => a.stone || a.metal).map(a => a.id), 6);
  if (hi > lo) add('swarm', `swarm (${lo}-Lumber cards)`, A.filter(a => a.cost === lo).map(a => a.id), 14);
  const fam = Object.keys(rules.families).map(f => ({ f, ids: A.filter(a => a.keys.some(k => rules.families[f].includes(k))).map(a => a.id) })).filter(x => x.ids.length >= 2 && x.f !== 'economy' && x.f !== 'swarm')
    .sort((a, b) => b.ids.length - a.ids.length || (a.f < b.f ? -1 : 1)).slice(0, 2);
  fam.forEach(x => add('family:' + x.f, x.f + ' (skill family)', x.ids, 8));
  // 2026-10-30 (package DECK1): the focuses run in the order --focus names them (DECK1 runs the named focuses first and `open` last, so
  // `open` is the strongest deck at least --apart copies from the focused ones instead of a shallow first search they all start from)
  const nameOf = f => [f.id, f.id.replace(/^family:/, '')];
  return want ? want.map(w => F.find(f => nameOf(f).includes(w))).filter(Boolean) : F;
}

// ---------------------------------------------------------------- the deck rule
function rule(gm, o) {
  const U = o.maxUnique || 6, C = o.maxCopies || 4, size = o.size || 20;
  const cap = id => Math.min(C, O.capOf(gm, id));
  const uniq = d => Object.keys(d).filter(k => d[k] > 0).length, tot = O.deckTotal;
  const canAdd = (d, id) => (d[id] || 0) < cap(id) && (d[id] > 0 || uniq(d) < U) && O.canAdd(gm, d, id);
  // 2026-10-30 (package DECK1, owner step 4: the decks are the map's, so they are built "from that map's current list"): --anchor a,b,c
  // (the map's own list) and --anchor-min N: at least N copies of the deck come from the anchor list (0 = no anchor rule)
  const anchor = o.anchor ? new Set(o.anchor) : null, AM = anchor ? (o.anchorMin != null ? o.anchorMin : 10) : 0;
  const anchorCopies = d => anchor ? Object.keys(d).reduce((t, id) => t + (anchor.has(id) ? d[id] : 0), 0) : 0;
  const legal = (d, pool) => tot(d) === size && uniq(d) <= U && Object.keys(d).every(id => d[id] > 0 && d[id] <= cap(id) && pool.includes(id)) && anchorCopies(d) >= AM;
  const focusCopies = (d, f) => f.cards ? Object.keys(d).reduce((t, id) => t + (f.cards.includes(id) ? d[id] : 0), 0) : 0;
  // a legal deck near `deck`: inside the pool and the caps, at most U cards (the fewest copies go), size cards, the focus's minimum
  function repair(deck, pool, rng, f, prefer) {
    const d = {}; Object.keys(deck).sort().forEach(id => { if (pool.includes(id) && deck[id] > 0) d[id] = Math.min(deck[id], cap(id)); });
    while (uniq(d) > U) { const ids = Object.keys(d).sort((a, b) => d[a] - d[b] || rng.next() - 0.5); delete d[ids[0]]; }
    const score = id => (prefer && prefer[id] || 0) + rng.next() * 0.5;
    while (tot(d) > size) { const ids = Object.keys(d).sort((a, b) => score(a) - score(b)); const x = (f && f.cards ? ids.find(id => !f.cards.includes(id)) : null) || ids[0]; if (--d[x] <= 0) delete d[x]; }
    let guard = 0;
    while (tot(d) < size && guard++ < 200) {
      const inFocus = f && f.cards && focusCopies(d, f) < f.need, base = inFocus ? f.cards : pool;
      const cands = base.filter(id => canAdd(d, id)).sort((a, b) => (d[b] ? 1 : 0) - (d[a] ? 1 : 0) || score(b) - score(a)); // fill the cards it holds first
      const id = cands[0] || pool.filter(id => canAdd(d, id)).sort((a, b) => score(b) - score(a))[0];
      if (!id) { const ids = Object.keys(d).sort((a, b) => d[a] - d[b]); if (!ids.length) break; delete d[ids[0]]; continue; } // stuck: free a slot
      d[id] = (d[id] || 0) + 1;
    }
    // the focus: swap non-focus copies for focus copies until it holds its minimum
    guard = 0;
    while (f && f.cards && focusCopies(d, f) < f.need && guard++ < 60) {
      const out = Object.keys(d).filter(id => !f.cards.includes(id)).sort((a, b) => score(a) - score(b))[0]; if (!out) break;
      if (--d[out] <= 0) delete d[out];
      const inn = f.cards.filter(id => canAdd(d, id)).sort((a, b) => (d[b] ? 1 : 0) - (d[a] ? 1 : 0) || score(b) - score(a))[0]; if (!inn) { d[out] = (d[out] || 0) + 1; break; } d[inn] = (d[inn] || 0) + 1;
    }
    // DECK1: the anchor, swapping outside copies for the map's own cards (never below the focus's minimum)
    guard = 0;
    while (anchor && anchorCopies(d) < AM && guard++ < 60) {
      const spare = id => !(f && f.cards && f.cards.includes(id)) || focusCopies(d, f) > f.need;
      const out = Object.keys(d).filter(id => !anchor.has(id) && spare(id)).sort((a, b) => score(a) - score(b))[0]; if (!out) break;
      if (--d[out] <= 0) delete d[out];
      const cands = [...anchor].filter(id => pool.includes(id) && canAdd(d, id)), inF = id => f && f.cards && f.cards.includes(id) ? 1 : 0;
      const inn = cands.sort((a, b) => (d[b] ? 1 : 0) - (d[a] ? 1 : 0) || inF(b) - inF(a) || score(b) - score(a))[0]; if (!inn) { d[out] = (d[out] || 0) + 1; break; } d[inn] = (d[inn] || 0) + 1;
    }
    return d;
  }
  return { U, C, size, cap, uniq, canAdd, legal, focusCopies, anchorCopies, AM, repair };
}
function neighbours(gm, R, deck, pool, rng, f, k) {
  const out = [], seen = new Set([O.deckKey(deck)]); let tries = 0;
  while (out.length < k && tries++ < k * 30) {
    const d = Object.assign({}, deck), ids = Object.keys(d), m = rng.next();
    const x = ids[Math.floor(rng.next() * ids.length)];
    if (m < 0.45) { const n = rng.next() < 0.6 ? 1 : 2, y = ids.filter(id => id !== x)[Math.floor(rng.next() * (ids.length - 1))]; if (!y) continue; for (let i = 0; i < n && d[x] > 1 && (d[y] || 0) < R.cap(y); i++) { d[x]--; d[y]++; } }
    else { const z = pool.filter(id => !d[id]); if (!z.length) continue; const nz = z[Math.floor(rng.next() * z.length)];
      if (m < 0.8) { const n = d[x]; delete d[x]; d[nz] = Math.min(n, R.cap(nz)); } // a card swapped for another
      else { if (R.uniq(d) >= R.U) { delete d[ids.sort((a, b) => d[a] - d[b])[0]]; } const n = 1 + Math.floor(rng.next() * 2); let took = 0; for (const id of Object.keys(d).sort((a, b) => d[b] - d[a])) { while (took < n && d[id] > 1) { d[id]--; took++; } } d[nz] = Math.min(took || 1, R.cap(nz)); } }
    const r = R.repair(d, pool, rng, f), key = O.deckKey(r);
    if (seen.has(key) || !R.legal(r, pool) || (f && f.cards && R.focusCopies(r, f) < f.need)) continue; seen.add(key); out.push(r);
  }
  return out;
}

// ---------------------------------------------------------------- labels: what a deck is, read from its curve and skills
function describe(gm, deck, rules, focus, pool) {
  const ids = Object.keys(deck), A = {}; ids.forEach(id => A[id] = attrs(gm, id));
  const n = O.deckTotal(deck), avg = ids.reduce((t, id) => t + A[id].cost * deck[id], 0) / n, avgWait = ids.reduce((t, id) => t + A[id].wait * deck[id], 0) / n;
  const curve = {}; ids.forEach(id => { curve[A[id].cost] = (curve[A[id].cost] || 0) + deck[id]; });
  const gens = ids.filter(id => A[id].gen).reduce((t, id) => t + deck[id], 0), sm = ids.filter(id => A[id].stone || A[id].metal).reduce((t, id) => t + deck[id], 0);
  const fams = Object.keys(rules.families).map(f => ({ f, n: ids.filter(id => A[id].keys.some(k => rules.families[f].includes(k))).reduce((t, id) => t + deck[id], 0) })).filter(x => x.n >= 6).sort((a, b) => b.n - a.n);
  // big / swarm against the list's own range: 8+ copies of its costliest step, or 14+ of its cheapest
  const pc = (pool || ids).map(id => +gm.D[id].cost || 0), hi = Math.max(...pc), lo = Math.min(...pc), labels = [], top = ids.filter(id => A[id].cost >= (hi >= 2 ? Math.max(1, hi - 1) : hi)).reduce((t, id) => t + deck[id], 0), cheap = curve[lo] || 0;
  if (hi > lo && (top >= 8 || avg >= 1.2)) labels.push(`big (${top} copies at ${hi >= 2 ? Math.max(1, hi - 1) + '+' : hi} Lumber, average ${avg.toFixed(1)})`);
  if (hi > lo && cheap >= 14) labels.push(`swarm (${cheap} copies at ${lo} Lumber)`);
  if (gens >= 4) labels.push(`economy (${gens} resource makers)`);
  if (sm >= 4) labels.push(`stone / metal (${sm} copies)`);
  fams.slice(0, 2).forEach(x => labels.push(`${x.f} x${x.n}`));
  if (!labels.length) labels.push(`midrange (average ${avg.toFixed(1)} Lumber)`);
  return { avgLumber: L.r4(avg), avgWait: L.r4(avgWait), curve, resourceMakers: gens, stoneMetal: sm, families: fams, labels, focus };
}

// ---------------------------------------------------------------- the search
async function main(o) {
  const log = o.quiet ? () => {} : s => console.log(s), gm = O.loadGame(L.ROOT), G = gm.G, t0 = Date.now();
  if (o.map == null) throw new Error('deck: --map N gives the gauntlet (the map\'s fight and reference decks under its fields) and the level');
  const map = O.resolveMap(gm, o.map), fights = O.fightsOf(map), rules = O.loadRules(L.ROOT);
  const pools = O.poolsFor(gm, map, { mode: o.mode || 'bpro', rarityCap: 'map', faction: false, owned: 'plan', submaps: true });
  const pool = (o.pool || pools.p1).filter(id => O.deckable(gm, id)).sort();
  if (o.pool && pool.length < o.pool.length) throw new Error('deck: not deckable: ' + o.pool.filter(id => !pool.includes(id)).join(', '));
  const level = o.level != null ? o.level : G.referenceFightSetup(map.id, fights[0], { deck: {} }).ref.level;
  const R = rule(gm, o), seed = o.seed || 'tools1', rng = O.mulberry(L.fnv(seed + '|deck|' + map.id));
  const entries = O.buildEntries(gm, map, { roadWeight: o.roadWeight != null ? o.roadWeight : 0 }), main = entries.map((e, i) => i).filter(i => !entries[i].neutral && entries[i].weight > 0);
  const ev = new O.Evaluator(L.ROOT, o.workers != null ? o.workers : 2, gm); await ev.setup({ mapId: map.id, level, entries, seed: seed + '|deck', ai: 1, beeTank: false });
  const stats = new O.Stats(entries.length), fit = k => O.fitness(entries, stats.get(k), main);
  const focuses = focusesFor(gm, pool, rules, o.focus), budget = o.budget || 9000, apart = o.apart != null ? o.apart : 6, share = Math.floor(budget / focuses.length);
  const sh = { g0: 2, gmax: 8, keep: 1, top: 1 };
  log(`deck (Map ${G.mapNumberOf(map.id)} ${map.name}, ${pool.length} cards, Level ${level}, at most ${R.U} different cards and ${R.C} copies, ${main.length} gauntlet entries): focuses ${focuses.map(f => f.id).join(', ')}; ${budget} search games`);
  const results = []; let openBest = null;
  for (const f of focuses) {
    const g0 = ev.games, used = () => ev.games - g0;
    // seeds: the focus's best cards by the game's card score; the open optimum moved into the focus; random legal decks
    const byScore = pool.slice().sort((a, b) => attrs(gm, b).score - attrs(gm, a).score || (a < b ? -1 : 1)), pref = {}; byScore.forEach((id, i) => pref[id] = (pool.length - i) / pool.length);
    const seeds = [R.repair({}, pool, rng, f, pref)];
    if (f.cards) { const d = {}; f.cards.slice().sort((a, b) => pref[b] - pref[a]).slice(0, Math.max(2, Math.ceil(f.need / R.C))).forEach(id => d[id] = R.cap(id)); seeds.push(R.repair(d, pool, rng, f, pref)); }
    if (openBest) seeds.push(R.repair(O.deckFromKey(openBest), pool, rng, f, pref));
    while (seeds.length < 6) seeds.push(R.repair({}, pool, rng, f, null));
    // niching (deckopt's distinct optima): a focus's deck keeps at least --apart (6) copies away from the decks found before it
    const prev = results.map(r => O.deckFromKey(r.key)), far = d => prev.every(p => O.dist(d, p) >= apart);
    for (let t = 0; t < 30 && !seeds.some(far) && prev.length; t++) seeds.push(R.repair(neighbours(gm, R, seeds[seeds.length - 1], pool, rng, f, 3).pop() || {}, pool, rng, f, null));
    let ok = O.uniqDecks(seeds.filter(d => R.legal(d, pool) && (!f.cards || R.focusCopies(d, f) >= f.need)));
    const okFar = ok.filter(far); let nearOk = false; if (okFar.length) ok = okFar; else if (prev.length) nearOk = true;
    if (!ok.length) { log(`  ${f.id}: no legal deck holds the focus (${f.need} copies of ${f.cards.length} cards); skipped`); continue; }
    let ranked = await O.halving(ev, stats, entries, main, ok, sh), best = ranked[0].k, cur = best, fail = 0, steps = 0, moves = 0;
    while (used() < share) {
      const nb = neighbours(gm, R, O.deckFromKey(cur), pool, rng, f, 8).filter(d => nearOk || far(d)); if (!nb.length) { if (++fail > 6) break; continue; }
      const r = await O.halving(ev, stats, entries, main, nb, sh); steps++;
      if (r[0].g >= sh.gmax && r[0].f > fit(cur).f) { cur = r[0].k; fail = 0; moves++; } else fail++;
      if (fit(cur).f > fit(best).f && (nearOk || far(O.deckFromKey(cur)))) best = cur;
      if (fail >= 3) { cur = O.deckKey(neighbours(gm, R, O.deckFromKey(best), pool, rng, f, 4).filter(d => nearOk || far(d))[0] || O.deckFromKey(best)); await O.ensure(ev, stats, [O.deckFromKey(cur)], sh.gmax, main); fail = 0; }
    }
    if (f.id === 'open') openBest = best;
    log(`  ${f.id}: ${steps} steps, ${moves} moves, best ${(fit(best).f * 100).toFixed(1)}% (${used()} games, ${Math.round((Date.now() - t0) / 1000)} s)`);
    results.push({ focus: f, key: best, steps, moves, games: used(), apartFromEarlier: prev.length ? Math.min(...prev.map(p => O.dist(O.deckFromKey(best), p))) : null });
  }
  // ---- the final: each focus's best to --final-games an entry
  const FG = Math.max(2, (o.finalGames || 24) + (o.finalGames || 24) % 2);
  await O.ensure(ev, stats, O.uniqDecks(results.map(r => O.deckFromKey(r.key))), FG, main);
  ev.close();
  const merged = []; results.forEach(r => { const m = merged.find(x => x.key === r.key); if (m) m.focuses.push(r.focus.id); else merged.push({ key: r.key, focuses: [r.focus.id], focus: r.focus }); });
  const decks = merged.map(m => { const d = O.deckFromKey(m.key), fz = fit(m.key), st = stats.get(m.key), info = describe(gm, d, rules, m.focuses, pool);
    return { focus: m.focuses.join(' + '), labels: info.labels, deck: d, cards: Object.keys(d).sort((a, b) => d[b] - d[a]).map(id => ({ id, name: gm.D[id].name, copies: d[id], cost: +gm.D[id].cost || 0, rarity: gm.D[id].rarity })),
      score: L.r4(fz.f), ci: [L.r4(fz.f - 1.96 * fz.se), L.r4(fz.f + 1.96 * fz.se)], avgLumber: info.avgLumber, avgWait: info.avgWait, curve: info.curve, resourceMakers: info.resourceMakers, families: info.families,
      perOpponent: main.map(i => ({ entry: entries[i].key, label: entries[i].label, p: st.n[i] ? L.r4(st.s[i] / st.n[i]) : null, n: st.n[i] })),
      copiesApartFromOpen: openBest ? O.dist(d, O.deckFromKey(openBest)) : null }; }).sort((a, b) => b.score - a.score);
  const res = { tool: 'tools/bench/bench.js deck ' + L.VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(),
    map: { id: map.id, num: G.mapNumberOf(map.id), name: map.name }, level, pool, poolNames: pool.map(id => gm.D[id].name),
    rule: { maxUnique: R.U, maxCopies: R.C, size: R.size, anchor: o.anchor || null, anchorMin: R.AM }, settings: { seed, budget, finalGames: FG, roadWeight: o.roadWeight != null ? o.roadWeight : 0, mode: o.mode || 'bpro' },
    gauntlet: main.map(i => ({ key: entries[i].key, label: entries[i].label, weight: L.r4(entries[i].weight) })),
    focuses: focuses.map(f => ({ id: f.id, label: f.label, cards: f.cards, need: f.need })), searches: results.map(r => ({ focus: r.focus.id, steps: r.steps, moves: r.moves, games: r.games, apartFromEarlier: r.apartFromEarlier })), apart,
    seconds: Math.round((Date.now() - t0) / 1000), games: ev.games, decks,
    reproduce: `node tools/bench/bench.js deck --map ${o.map}${o.pool ? ' --pool ' + o.pool.join(',') : ''} --max-unique ${R.U} --max-copies ${R.C} --budget ${budget} --final-games ${FG} --seed ${seed}${o.focus ? ' --focus ' + o.focus.join(',') : ''}${o.anchor ? ' --anchor ' + o.anchor.join(',') + ' --anchor-min ' + R.AM : ''} --level ${level}${o.mode ? ' --mode ' + o.mode : ''}` };
  log(`${decks.length} decks, ${res.games} games in ${res.seconds} s:`);
  decks.forEach(d => log(`  ${(d.score * 100).toFixed(1)}% [${(d.ci[0] * 100).toFixed(1)}-${(d.ci[1] * 100).toFixed(1)}]  ${d.focus}: ${d.labels.join('; ')} | avg ${d.avgLumber} Lumber | ${d.cards.map(c => c.copies + 'x ' + c.name).join(', ')}`));
  if (!o.noSave) { const f = path.join(o.out || path.join(L.ROOT, 'docs', 'balance'), `bench-deck-map${String(res.map.num).padStart(2, '0')}-${map.id}-${o.tag || new Date().toISOString().slice(0, 10)}.json`);
    fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n'); fs.writeFileSync(f.replace(/\.json$/, '.md'), md(res)); log('-> ' + path.relative(L.ROOT, f) + ' (+ .md)'); }
  return res;
}
function md(res) {
  const pc = v => v == null ? '-' : (v * 100).toFixed(0) + '%';
  return [`# Focused decks: Map ${res.map.num} ${res.map.name} (${res.generated.slice(0, 10)})`, '',
    `Package TOOLS1 (T3). \`${res.reproduce}\` (${res.tool}), ${res.games} games in ${res.seconds} s.`, '',
    `- The list (${res.pool.length}): ${res.poolNames.join(', ')}.`,
    `- The rule: at most ${res.rule.maxUnique} different cards, at most ${res.rule.maxCopies} copies (never above a rarity's cap), ${res.rule.size} cards. Level ${res.level}.`,
    `- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): ${res.gauntlet.map(g => g.label.replace(/^vs /, '')).join('; ')}.`,
    `- Score: the mean win rate over the gauntlet, ${res.settings.finalGames} games an entry, 95% interval.`, '',
    '| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |', '|---|---|---|---|---|---|---|---|',
    ...res.decks.map((d, i) => `| ${i + 1} | ${d.focus} | ${d.labels.join('; ')} | ${pc(d.score)} (${pc(d.ci[0])}-${pc(d.ci[1])}) | ${d.avgLumber} | ${Object.keys(d.curve).sort().map(k => k + ': ' + d.curve[k]).join(', ')} | ${d.cards.map(c => c.copies + 'x ' + c.name).join(', ')} | ${d.copiesApartFromOpen == null ? '-' : d.copiesApartFromOpen} |`), '',
    '## Per opponent', '', '| Deck | ' + res.gauntlet.map(g => g.key.replace(/^mirror\|/, '')).join(' | ') + ' |', '|---|' + res.gauntlet.map(() => '---|').join(''),
    ...res.decks.map((d, i) => `| ${i + 1} ${d.focus} | ` + d.perOpponent.map(p => pc(p.p)).join(' | ') + ' |'), ''].join('\n');
}
module.exports = { main, focusesFor, rule, neighbours, describe, attrs, md };
