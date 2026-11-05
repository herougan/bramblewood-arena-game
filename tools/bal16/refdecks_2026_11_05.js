#!/usr/bin/env node
// 2026-11-05 (package BAL16, decision REFDECK-1, owner 11-05 08:08: "a. please create new map reference decks with unique optimised deck ideas -
// there's a bigger card pool now. b. create weak deck ideas."): new PRO / BPRO (strong) and WPRO (weak) decks for Maps 0-24 and their side maps
// with their own list, after CONTENT10's lists (THEME6-1 counts).
//   node tools/bal16/refdecks_2026_11_05.js plan [--maps 0-24]              pools and focuses per map -> docs/balance/bal16/refdecks-plan-2026-11-05.json
//   node tools/bal16/refdecks_2026_11_05.js run --kind bpro|pro|wpro [--maps 0-24 | --map mb] [--force] [--budget N]
//                                                                           the searches -> docs/balance/bal16/<kind>/...
//   node tools/bal16/refdecks_2026_11_05.js apply [--dry]                    canonical/pro-skirmishes.json: each map's pro / bpro / wpro (old ones to history)
//   node tools/bal16/refdecks_2026_11_05.js check                            the rules below on every map's new decks (exit 1 on a problem)
//
// The rules (docs/evaluation-protocol.md section 1, unchanged): BPRO = the map's list only (deck1Pools anchor, no Baby / egg); PRO = the map-true
// pool (the list + what a player holds by then, at least 10 copies from the list); both 20 cards, at most 6 different cards, 4 copies, the
// rarity copy caps, the map's rarity cap, no faction card; Level 1; the gauntlet is deckopt's (the map's fight decks and reference decks in a
// fair mirror under each fight's field, Smart CPU). What BAL16 adds:
//   - distinct plans: no two of a map's strong decks (PRO and BPRO together) share more than half their cards (an overlap of at most 10 of
//     20 copies = at least 10 copies apart). The BPRO focuses search 10 copies apart; the PRO search keeps 10 copies from the new BPRO decks
//     too (tools/bench/deck.js o.avoid); apply drops a deck that still shares more than 10 copies with a stronger one.
//   - active skills and synergies first (EFFECTS-1, owner 11-04 23:17: "Stronger effects > stronger stats"): the focuses are the map's
//     resource plan (stone / metal or economy) and then its two biggest skill families before big / swarm; at most 3 focuses, then `open`.
//   - weak plans (WPRO): two distinct weak decks a map, 10 copies apart, each a named plan: "low" (the list's weakest cards, BAL11's descent
//     to the weakest) and "top-heavy" (seeded from the list's costliest cards with no Lumber makers: slow, nothing on the board early). The
//     search keeps the LOWER half (wpro_2026_11_02.js's descent turned round), 1,600 games a plan.
//   - Maps 21-24 get entries (their field is the map's average field, pro_skirmishes.js averageField).
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('../opt/deckopt.js'), P = require('../opt/pro_skirmishes.js'), T3 = require('../bench/deck.js'), D1 = require('../opt/deck1_2026_10_30.js'), B2 = require('../opt/bpro2_2026_10_31.js');
const BL = require('../bench/lib.js');
const DATE = '2026-11-05', DIR = path.join(ROOT, 'docs', 'balance', 'bal16'), PLAN = path.join(DIR, `refdecks-plan-${DATE}.json`), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const RULE = { maxUnique: 6, maxCopies: 4, size: 20 }, APART = 10, MAX_OVERLAP = 10, LEVEL = 1, FINAL = 24, HARD_GAP = 0.15, MAXMAP = 24;
const BUDGET = { bpro: 6000, pro: 8000, wpro: 1600 };
const uniq = a => [...new Set(a)];
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }
function ownSubList(gm, m) { const pe = gm.pools[m.parent] || {}, l = (pe.submaps || {})[m.id]; return Array.isArray(l) ? l : l && l.cards || null; }
function mapsUpTo(gm, want) {
  const G = gm.G;
  return G.CONQUEST_MAPS.filter(m => !m.reserved && !m.endless && !m.tower && !/^mtut/.test(m.id) && G.mapNumberOf(m.id) != null && G.mapNumberOf(m.id) <= MAXMAP)
    .filter(m => !want || want.has(G.mapNumberOf(m.id))).filter(m => !m.sub || ownSubList(gm, m)).filter(m => (m.nodes || []).some(n => n.deck && Object.keys(n.deck).length))
    .sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id) || (a.sub ? 1 : 0) - (b.sub ? 1 : 0) || (a.id < b.id ? -1 : 1));
}
function selectMaps(gm, spec) { if (spec != null && /[a-z]/i.test(String(spec))) { const ids = new Set(String(spec).split(',')); return mapsUpTo(gm, null).filter(m => ids.has(m.id)); } return mapsUpTo(gm, mapRange(spec)); }
const isBaby = (gm, id) => /^egg-/.test(id) || ((gm.D[id] || {}).kind === 'baby');
const ovl = (a, b) => O.overlap(a, b);
const outFile = (gm, kind, m) => path.join(DIR, kind, `${kind}-map${String(gm.G.mapNumberOf(m.id)).padStart(2, '0')}-${m.id}-${DATE}.json`);
const benchFile = (gm, kind, m) => path.join(DIR, kind, `bench-deck-map${String(gm.G.mapNumberOf(m.id)).padStart(2, '0')}-${m.id}-${DATE}.json`);

// EFFECTS-1 order: the map's resource plan first, then its skill families, then big / swarm
function orderFocuses(avail, fitIds) {
  const res = ['stone/metal', 'economy'].filter(f => fitIds.includes(f)).slice(0, 1), fam = fitIds.filter(f => /^family:/.test(f)).slice(0, 2), rest = ['big', 'swarm'].filter(f => fitIds.includes(f));
  return uniq(res.concat(fam, rest)).slice(0, 3).concat(['open']);
}
function planAll(gm, spec) {
  const rules = O.loadRules(ROOT), j = fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { maps: {} };
  j.about = 'BAL16 (2026-11-05, REFDECK-1): per map the BPRO pool (the list), the PRO pool (list + held), the focuses (EFFECTS-1 order) and the weak plans; tools/bal16/refdecks_2026_11_05.js';
  j.rule = Object.assign({}, RULE, { apart: APART, maxOverlap: MAX_OVERLAP, level: LEVEL, budget: BUDGET, finalGames: FINAL });
  let contrib = {}; try { JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bench-contrib-global-2026-10-30-final.json'), 'utf8')).cards.forEach(c => { contrib[c.id] = c.perCopy; }); } catch (e) { }
  for (const m of selectMaps(gm, spec)) {
    const b = B2.planMap(gm, m, rules), d = D1.planMap(gm, m, rules, contrib), room = ids => ids.reduce((t, id) => t + Math.min(RULE.maxCopies, O.capOf(gm, id)), 0);
    const all = b.pool && b.pool.length ? T3.focusesFor(gm, b.pool, rules, null) : [];
    const fitB = all.filter(f => f.cards && room(f.cards) >= f.need).map(f => f.id);
    const allP = T3.focusesFor(gm, d.pool, rules, null), anchor = new Set(d.anchor);
    const fitP = allP.filter(f => f.cards && room(f.cards) >= f.need && (!d.anchor.length || f.cards.some(id => anchor.has(id)))).map(f => f.id);
    const wpool = (b.pool || []).filter(id => !isBaby(gm, id) && O.deckable(gm, id));
    j.maps[m.id] = { id: m.id, num: gm.G.mapNumberOf(m.id), side: m.sub ? m.parent : null, name: m.name, cap: b.cap,
      bpro: b.none ? { none: b.none, pool: b.pool || [] } : { pool: b.pool, focuses: orderFocuses(all, fitB) },
      pro: { pool: d.pool, anchor: d.anchor, anchorMin: d.anchorMin, focuses: orderFocuses(allP, fitP) },
      wpro: room(wpool) >= RULE.size ? { pool: wpool, plans: ['low', 'top-heavy'] } : { none: `the list cannot fill 20 cards without Baby cards (${wpool.length} cards)`, pool: wpool } };
    const x = j.maps[m.id]; console.log(`${x.side ? '  side' : 'Map'} ${x.num} ${m.id} ${m.name}: BPRO ${x.bpro.none ? 'none (' + x.bpro.none + ')' : x.bpro.pool.length + ' cards, ' + x.bpro.focuses.join(', ')}; PRO ${x.pro.pool.length} cards, ${x.pro.focuses.join(', ')}; WPRO ${x.wpro.none ? 'none' : x.wpro.pool.length + ' cards'}`);
  }
  fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(PLAN, JSON.stringify(j, null, 1) + '\n'); return j;
}

// ---- the weak search (tools/opt/wpro_2026_11_02.js runMap, with a plan's seeds and decks to keep APART from)
async function weakMap(gm, map, pool, plan, avoid, budget) {
  const G = gm.G, R = T3.rule(gm, RULE), t0 = Date.now();
  const entries = O.buildEntries(gm, map, { roadWeight: 0 }), main = entries.map((e, i) => i).filter(i => !entries[i].neutral && entries[i].weight > 0);
  const ev = new O.Evaluator(ROOT, 2, gm), seed = 'bal16-wpro|' + plan + '|' + map.id, rng = O.mulberry(BL.fnv(seed));
  await ev.setup({ mapId: map.id, level: LEVEL, entries, seed: seed + '|deck', ai: 1, beeTank: false });
  const stats = new O.Stats(entries.length), fit = d => O.fitness(entries, stats.get(O.deckKey(d)), main).f, far = d => avoid.every(a => O.dist(d, a) >= APART);
  async function lowHalving(cands) { let alive = O.uniqDecks(cands), g = 2;
    for (;;) { await O.ensure(ev, stats, alive, g, main); alive.sort((a, b) => fit(a) - fit(b)); if (alive.length <= 1 || g >= 8) break; alive = alive.slice(0, Math.max(1, Math.ceil(alive.length / 2))); g = Math.min(8, g * 2); }
    await O.ensure(ev, stats, alive.slice(0, 1), 8, main); return alive; }
  const at = id => T3.attrs(gm, id), pref = {};
  if (plan === 'top-heavy') { // the costliest cards first, Lumber makers last
    pool.slice().sort((a, b) => ((at(b).gen ? -10 : 0) + at(b).cost) - ((at(a).gen ? -10 : 0) + at(a).cost) || (a < b ? -1 : 1)).forEach((id, i) => pref[id] = (pool.length - i) / pool.length);
  } else pool.slice().sort((a, b) => at(a).score - at(b).score || (a < b ? -1 : 1)).forEach((id, i) => pref[id] = (pool.length - i) / pool.length);
  const seeds = [R.repair({}, pool, rng, null, pref)]; let tries = 0; while (seeds.length < 8 && tries++ < 60) { const d = R.repair({}, pool, rng, null, tries < 20 ? pref : null); if (far(d)) seeds.push(d); }
  let ranked = await lowHalving(seeds.filter(d => R.legal(d, pool) && far(d)).concat(far(seeds[0]) ? [] : [])); if (!ranked.length) ranked = await lowHalving(seeds.filter(d => R.legal(d, pool)));
  if (!ranked.length) { ev.close(); return { none: 'no legal seed' }; }
  let best = ranked[0], cur = best, fail = 0, steps = 0;
  while (ev.games < budget) {
    const nb = T3.neighbours(gm, R, cur, pool, rng, null, 8).filter(far); if (!nb.length) { if (++fail > 6) break; continue; }
    const r = await lowHalving(nb); steps++;
    if (fit(r[0]) < fit(cur)) { cur = r[0]; fail = 0; } else fail++;
    if (fit(cur) < fit(best) && far(cur)) best = cur;
    if (fail >= 3) { cur = T3.neighbours(gm, R, best, pool, rng, null, 4).filter(far)[0] || best; await O.ensure(ev, stats, [cur], 8, main); fail = 0; }
  }
  await O.ensure(ev, stats, [best], FINAL, main); ev.close();
  const isRef = i => /^ref:/.test(entries[i].oppKey || ''), refIdx = main.filter(isRef), st = stats.get(O.deckKey(best)), f = O.fitness(entries, st, main), rf = O.fitness(entries, st, refIdx.length ? refIdx : main);
  const r4 = x => Math.round(x * 10000) / 10000;
  return { plan, deck: Object.fromEntries(Object.keys(best).sort().map(k => [k, best[k]])), score: r4(f.f), ci: [r4(f.f - 1.96 * f.se), r4(f.f + 1.96 * f.se)], refWins: r4(1 - rf.f),
    labels: T3.describe(gm, best, O.loadRules(ROOT), ['weak ' + plan], pool).labels, apartFrom: avoid.map(a => O.dist(best, a)), steps, games: ev.games, seconds: Math.round((Date.now() - t0) / 1000) };
}

async function run(gm, opt) {
  const j = JSON.parse(fs.readFileSync(PLAN, 'utf8')), kind = opt.kind; if (!['bpro', 'pro', 'wpro'].includes(kind)) throw new Error('--kind bpro|pro|wpro');
  fs.mkdirSync(path.join(DIR, kind), { recursive: true }); const t0 = Date.now();
  for (const m of selectMaps(gm, opt.maps)) {
    const x = j.maps[m.id]; if (!x) throw new Error('no plan for ' + m.id); const e = x[kind];
    if (e.none) { console.log(`${m.id}: no ${kind} (${e.none})`); continue; }
    if (opt.minutes && (Date.now() - t0) / 60000 > opt.minutes) { console.log('stopping after ' + opt.minutes + ' minutes; re-run to go on'); break; }
    const t = Date.now();
    if (kind === 'wpro') { const f = outFile(gm, 'wpro', m); if (fs.existsSync(f) && !opt.force) continue; const decks = [];
      for (const plan of e.plans) { const r = await weakMap(gm, m, e.pool, plan, decks.map(d => d.deck), opt.budget || BUDGET.wpro); if (!r.none) decks.push(r); }
      fs.writeFileSync(f, JSON.stringify({ tool: 'tools/bal16/refdecks_2026_11_05.js', generated: new Date().toISOString(), map: { id: m.id, num: x.num, name: m.name }, pool: e.pool, rule: RULE, apart: APART, decks }, null, 1) + '\n');
      console.log(`${m.id}: weak ${decks.map(d => d.plan + ' ' + d.score).join(' / ')} (${Math.round((Date.now() - t) / 1000)} s)`); continue; }
    const f = benchFile(gm, kind, m); if (fs.existsSync(f) && !opt.force) continue;
    let avoid = [];
    if (kind === 'pro') { const bf = benchFile(gm, 'bpro', m); if (fs.existsSync(bf)) avoid = JSON.parse(fs.readFileSync(bf, 'utf8')).decks.map(d => d.deck); }
    await T3.main({ map: m.id, mode: 'map-true', pool: e.pool, anchor: kind === 'pro' && e.anchor.length ? e.anchor : null, anchorMin: kind === 'pro' ? e.anchorMin : undefined, focus: e.focuses, level: LEVEL,
      budget: opt.budget || BUDGET[kind], finalGames: FINAL, maxUnique: RULE.maxUnique, maxCopies: RULE.maxCopies, size: RULE.size, seed: 'bal16-' + kind, workers: 2, out: path.join(DIR, kind), tag: DATE, quiet: true, apart: APART, avoid });
    console.log(`${m.id}: ${kind} done (${Math.round((Date.now() - t) / 1000)} s)`);
  }
}

// ---- apply
function pickStrong(res, kept) { // hard decks (BPRO / PRO's floor rule), then the overlap rule against the ones kept before
  const best = res.decks[0].score, floor = Math.max(0.5, best - HARD_GAP), out = [], left = [];
  res.decks.forEach((d, i) => { const why = !(i < 2 || d.score >= floor) ? `under ${Math.round(floor * 1000) / 10}%` : kept.concat(out).some(k => ovl(k.deck, d.deck) > MAX_OVERLAP) ? `shares more than ${MAX_OVERLAP} copies with a stronger deck` : out.length >= 4 ? 'a fifth deck' : null;
    if (why) left.push({ focus: d.focus, score: d.score, why }); else out.push(d); });
  return { out, left };
}
function apply(gm, opt) {
  const G = gm.G, j = JSON.parse(fs.readFileSync(PLAN, 'utf8')), file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), report = [];
  for (const m of selectMaps(gm, opt.maps)) {
    const x = j.maps[m.id]; if (!x) continue; const prefix = P.proPrefix(gm, m), old = file.maps[m.id];
    const field = P.averageField(gm, m); if (!old && !field) { console.log(m.id + ': no field'); continue; }
    const entry = old ? JSON.parse(JSON.stringify(old)) : { map: G.mapNumberOf(m.id), side: m.sub ? m.parent : undefined, name: m.name, field: Object.assign({}, field, { summary: P.fieldSummary(gm, field) }), pro: [], bpro: [], replaced: [], skipped: [], notes: [], history: [], wpro: [] };
    const hist = { package: 'BAL16', on: DATE, why: 'replaced by BAL16\'s decks (REFDECK-1: the bigger CONTENT10 lists, distinct plans, EFFECTS-1)' };
    const mk = (kind, d, i, extra) => { const id = `${prefix}-${kind.toUpperCase()}-${i + 1}`, deck = Object.fromEntries(Object.keys(d.deck).sort().map(k => [k, d.deck[k]]));
      return Object.assign({ id, name: id, focus: d.focus, labels: d.labels, level: LEVEL, leaders: kind === 'wpro' ? [] : P.leadersFor(gm, m, deck), deck }, extra(d, id)); };
    const row = { map: m.id, num: x.num, name: m.name };
    // BPRO
    let bpro = [], pro = [], wpro = [];
    const bf = benchFile(gm, 'bpro', m);
    if (!x.bpro.none && fs.existsSync(bf)) { const res = JSON.parse(fs.readFileSync(bf, 'utf8')), pk = pickStrong(res, []); row.bproLeft = pk.left;
      bpro = pk.out.map((d, i) => mk('bpro', d, i, d => ({ source: { file: path.relative(ROOT, bf), mode: 'bpro2', package: 'BAL16', tool: res.tool, reproduce: res.reproduce, score: d.score, ci: d.ci, avgLumber: d.avgLumber, generated: res.generated }, h2h: null, later: [] }))); }
    const pf = benchFile(gm, 'pro', m);
    if (fs.existsSync(pf)) { const res = JSON.parse(fs.readFileSync(pf, 'utf8')), pk = pickStrong(res, bpro); row.proLeft = pk.left;
      pro = pk.out.map((d, i) => mk('pro', d, i, d => ({ source: { file: path.relative(ROOT, pf), mode: 'deck1', package: 'BAL16', tool: res.tool, reproduce: res.reproduce, score: d.score, ci: d.ci, avgLumber: d.avgLumber, generated: res.generated }, h2h: null, later: [] }))); }
    const wf = outFile(gm, 'wpro', m);
    if (fs.existsSync(wf)) { const res = JSON.parse(fs.readFileSync(wf, 'utf8'));
      wpro = res.decks.slice().sort((a, b) => a.score - b.score).map((d, i) => mk('wpro', Object.assign({ focus: 'weak ' + d.plan }, d), i, d => ({ source: { file: path.relative(ROOT, wf), mode: 'wpro', package: 'BAL16', plan: d.plan, tool: res.tool, score: d.score, ci: d.ci, refWins: d.refWins, generated: res.generated }, h2h: null, later: [] }))); }
    const prev = {}; ['pro', 'bpro', 'wpro'].forEach(k => { if ((k === 'pro' ? pro : k === 'bpro' ? bpro : wpro).length && (entry[k] || []).length) prev[k] = entry[k]; });
    if (Object.keys(prev).length) entry.history = (entry.history || []).concat([Object.assign({}, hist, prev)]);
    if (pro.length) entry.pro = pro; if (bpro.length || x.bpro.none) entry.bpro = bpro; if (wpro.length) entry.wpro = wpro;
    entry.notes = (entry.notes || []).filter(s => !/^BAL16: /.test(s)).concat([`BAL16: ${pro.length} PRO, ${bpro.length} BPRO (${x.bpro.none ? 'none: ' + x.bpro.none : 'distinct plans, at most ' + MAX_OVERLAP + ' shared copies'}), ${wpro.length} WPRO (weak plans ${wpro.map(w => w.source.plan).join(', ')}); the previous decks are under history`]);
    file.maps[m.id] = entry; Object.assign(row, { pro: pro.map(p => ({ id: p.id, focus: p.focus, score: p.source.score, labels: p.labels })), bpro: bpro.map(p => ({ id: p.id, focus: p.focus, score: p.source.score, labels: p.labels })), wpro: wpro.map(p => ({ id: p.id, plan: p.source.plan, score: p.source.score, labels: p.labels })) });
    report.push(row); console.log(`${m.id}: PRO ${pro.map(p => p.focus + ' ' + p.source.score).join(', ')} | BPRO ${bpro.map(p => p.focus + ' ' + p.source.score).join(', ')} | WPRO ${wpro.map(p => p.source.plan + ' ' + p.source.score).join(', ')}`);
  }
  const order = Object.keys(file.maps).sort((a, b) => file.maps[a].map - file.maps[b].map || (file.maps[a].side ? 1 : 0) - (file.maps[b].side ? 1 : 0) || (a < b ? -1 : 1)), maps2 = {}; order.forEach(k => { maps2[k] = file.maps[k]; }); file.maps = maps2;
  file.updated = DATE; file.bal16 = { rule: Object.assign({}, RULE, { apart: APART, maxOverlap: MAX_OVERLAP }), tool: 'tools/bal16/refdecks_2026_11_05.js', note: 'BAL16 (REFDECK-1, 2026-11-05): PRO / BPRO / WPRO decks of Maps 0-24 and their side maps rebuilt from the CONTENT10 lists; a map\'s strong decks share at most 10 of 20 copies; focuses in EFFECTS-1 order; two weak plans (low, top-heavy).' };
  fs.writeFileSync(path.join(DIR, `refdecks-${DATE}.json`), JSON.stringify({ about: 'BAL16 reference decks per map (apply report)', maps: report }, null, 1) + '\n');
  if (opt.dry) return; fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); console.log('-> ' + path.relative(ROOT, PRO_FILE) + ' (rebuild the game to bake it in)');
}
function check(gm) {
  const file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), j = JSON.parse(fs.readFileSync(PLAN, 'utf8')), out = [];
  for (const m of mapsUpTo(gm, null)) { const e = file.maps[m.id], x = j.maps[m.id]; if (!e || !x) continue;
    const strong = (e.pro || []).concat(e.bpro || []).filter(d => d.source && d.source.package === 'BAL16');
    strong.forEach((a, i) => strong.slice(i + 1).forEach(b => { if (ovl(a.deck, b.deck) > MAX_OVERLAP) out.push(`${a.id} / ${b.id}: share ${ovl(a.deck, b.deck)} copies`); }));
    const chk = (d, pool) => { const ids = Object.keys(d.deck); P.deckProblems(gm, d.deck, d.leaders).forEach(p => out.push(`${d.id}: ${p}`)); if (ids.length > RULE.maxUnique) out.push(`${d.id}: ${ids.length} different cards`);
      if (O.deckTotal(d.deck) !== RULE.size) out.push(`${d.id}: ${O.deckTotal(d.deck)} cards`); ids.forEach(id => { if (d.deck[id] > RULE.maxCopies) out.push(`${d.id}: ${id} x${d.deck[id]}`); if (pool && !pool.includes(id)) out.push(`${d.id}: ${id} not in its pool`); }); };
    (e.bpro || []).filter(d => d.source && d.source.package === 'BAL16').forEach(d => chk(d, x.bpro.pool));
    (e.pro || []).filter(d => d.source && d.source.package === 'BAL16').forEach(d => chk(d, x.pro.pool));
    (e.wpro || []).filter(d => d.source && d.source.package === 'BAL16').forEach(d => chk(d, x.wpro.pool)); }
  return out;
}
async function main(argv) {
  const cmd = argv[0], a = argv.slice(1), opt = {};
  while (a.length) { const k = a.shift(); if (k === '--maps' || k === '--map') opt.maps = a.shift(); else if (k === '--kind') opt.kind = a.shift(); else if (k === '--force') opt.force = true; else if (k === '--dry') opt.dry = true; else if (k === '--budget') opt.budget = +a.shift(); else if (k === '--minutes') opt.minutes = +a.shift(); else throw new Error('unknown option ' + k); }
  const gm = O.loadGame(ROOT);
  if (cmd === 'plan') return planAll(gm, opt.maps);
  if (cmd === 'run') return run(gm, opt);
  if (cmd === 'apply') return apply(gm, opt);
  if (cmd === 'check') { const p = check(gm); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ok'); if (p.length) process.exitCode = 1; return; }
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 10).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { mapsUpTo, check, MAX_OVERLAP, APART };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
