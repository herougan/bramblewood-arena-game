#!/usr/bin/env node
// 2026-10-30 (package DECK1, step 4 of the owner's balancing plan, docs/action-items.md "10-28 21:40": "Several hard optimised decks per map
// with different focuses; at most 6 different cards, at most 4 copies each. Each map has a range: high-cost cards, cost generators, normal
// creatures; maps differ (high average cost, metal ...). We have to think each map through." / "it's easier to make a bad deck than a good
// deck"): the map's PRO decks, rebuilt under the 6/4 rule with a named focus each.
//
//   node tools/opt/deck1_2026_10_30.js plan [--maps 0-20]      per map: its list, the held shortlist, its facts and the focuses -> docs/balance/deck1-2026-10-30.json (plan)
//   node tools/opt/deck1_2026_10_30.js run --map mb [--force]  the focused search (tools/bench/bench.js deck) -> docs/balance/deck1/bench-deck-mapNN-<id>-2026-10-30.json
//   node tools/opt/deck1_2026_10_30.js apply [--dry]           canonical/pro-skirmishes.json: the decks become each map's `pro`, the previous ones go to `history`
//   node tools/opt/deck1_2026_10_30.js check                   every PRO deck: the 6/4 rule, 20 cards, the caps, the map rule (exit 1 on a problem)
//
// The pool of a map ("from that map's current list, plus the cards a player can hold by then, per the existing PRO rules"):
//   - the anchor: the map's current list (canonical/map-pools.json: a main map's MAP tier, a side map's own SUBMAP list) + its SPECIAL tier, within
//     the map's rarity cap, no faction cards (the PRO rules: deckopt mapTruePools' rule). A deck holds at least ANCHOR_MIN (10) of its 20
//     copies from it, so every PRO deck is the map's deck.
//   - the held shortlist: cards a player holds by then under the map-true rule (earlier main maps' lists, the plan's owned cards, open side
//     maps' lists; a side map's parent list), at most HELD_THEME (6) by deckopt's phase-2 relatedness to the map and HELD_STRONG (6) by the
//     measured contribution per copy (docs/balance/bench-contrib-global-2026-10-30-final.json, after RECOST1). A card that is only in a road
//     fight's deck (a card THEME3 cut from the list; the road decks wait for BAL7-3) is not in the pool.
//   - the focuses ("think each map through"): from what the pool supports (tools/bench/deck.js focusesFor), in this priority: the map's
//     resource (stone / metal costs), cost generators + payoff (economy), high cost (big), a swarm of the cheapest cards, the list's main skill
//     family; at most 3, then `open` (the strongest deck at least 6 copies from the focused ones).
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), T3 = require('../bench/deck.js');
const DATE = '2026-10-30', PLAN = path.join(ROOT, 'docs', 'balance', 'deck1-' + DATE + '.json'), OUTDIR = path.join(ROOT, 'docs', 'balance', 'deck1');
const PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), CONTRIB = path.join(ROOT, 'docs', 'balance', 'bench-contrib-global-2026-10-30-final.json');
const RULE = { maxUnique: 6, maxCopies: 4, size: 20 }, ANCHOR_MIN = 10, HELD_THEME = 6, HELD_STRONG = 6, MAX_FOCUS = 3, BUDGET = 12000, FINAL = 24, LEVEL = 1;
const PRIORITY = ['stone/metal', 'economy', 'big', 'swarm']; // then the first skill family

function mapsUpTo20(gm, want) {
  const G = gm.G;
  return G.CONQUEST_MAPS.filter(m => !m.reserved && !m.endless && m.id !== 'mtut' && G.mapNumberOf(m.id) != null && G.mapNumberOf(m.id) <= 20)
    .filter(m => !want || want.has(G.mapNumberOf(m.id)))
    .filter(m => !m.sub || ownSubList(gm, m)) // a side map with its own list
    .sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id) || (a.sub ? 1 : 0) - (b.sub ? 1 : 0) || (a.id < b.id ? -1 : 1));
}
function ownSubList(gm, m) { const pe = gm.pools[m.parent] || {}, l = (pe.submaps || {})[m.id]; return Array.isArray(l) ? l : l && l.cards || null; }
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }
const uniq = a => [...new Set(a)];

// the DECK1 pool rule: the anchor (the map's list + SPECIAL) and what a player holds by then, both under the map-true rule
function deck1Pools(gm, map) {
  const G = gm.G, mt = O.mapTruePools(gm, map, {}, 'map-true'), pe = gm.pools[map.sub ? map.parent : map.id] || {};
  const list = map.sub ? ownSubList(gm, map) : (pe.cards || []), special = pe.special || [];
  const anchorAll = uniq(list.concat(special)).filter(id => O.deckable(gm, id));
  const anchor = anchorAll.filter(id => !mt.rule(id)).sort();
  // held: map-true's extra cards (owned by then, open side maps) and, for a side map, its parent's list; never a card that is the map's only
  // through a road fight's deck
  const parentList = map.sub ? (pe.cards || []) : [];
  const subsOpen = [].concat(...(mt.subsOpen || []).map(s => { const l = (pe.submaps || {})[s]; return Array.isArray(l) ? l : (l && l.cards) || []; }));
  const held = uniq(mt.owned.concat(subsOpen, parentList))
    .filter(id => O.deckable(gm, id) && !mt.rule(id) && !anchor.includes(id)).sort();
  const fightOnly = uniq([].concat(...O.fightsOf(map).map(n => Object.keys(n.deck)))).filter(id => O.deckable(gm, id) && !anchor.includes(id) && !held.includes(id)).sort();
  const rule = id => { const w = mt.rule(id); if (w) return w; if (anchor.includes(id) || held.includes(id)) return null;
    return fightOnly.includes(id) ? 'only in a road fight\'s deck (not on the map\'s list since THEME3, not held by then)' : 'not on the map\'s list and not held by then'; };
  return { mt, list, anchor, anchorDropped: anchorAll.filter(id => mt.rule(id)).map(id => id + ': ' + mt.rule(id)), held, fightOnly, rule, cap: mt.cap, mapNo: mt.mapNo };
}
function deck1Problems(gm, map, deck, pools) {
  const p = pools || deck1Pools(gm, map), out = [];
  const ids = Object.keys(deck).filter(id => deck[id] > 0);
  if (ids.length > RULE.maxUnique) out.push(`${ids.length} different cards (at most ${RULE.maxUnique})`);
  ids.forEach(id => { if (deck[id] > RULE.maxCopies) out.push(`${id} x${deck[id]} (at most ${RULE.maxCopies})`); const w = p.rule(id); if (w) out.push(id + ': ' + w); });
  return out;
}
function loadContrib() { try { const j = JSON.parse(fs.readFileSync(CONTRIB, 'utf8')), m = {}; j.cards.forEach(c => { m[c.id] = c.perCopy; }); return m; } catch (e) { return {}; } }

// ---------------------------------------------------------------- plan: the pool, the facts and the focuses of each map
function planMap(gm, map, rules, contrib) {
  const G = gm.G, p = deck1Pools(gm, map), D = gm.D;
  // the held shortlist: relatedness (deckopt phase 2's rules, over the held cards only) and strength (contribution per copy)
  const pseudo = { mapNo: p.mapNo, core: p.anchor, p1: p.anchor, rule: id => p.held.includes(id) ? null : 'not held by then' };
  // a map whose whole list is over its fights' rarity cap (the Old Bramble: THEME3 Q7 gave it "advanced cards, as if it was Map 21", its
  // fights are still Common) has no anchor: it gets twice the held shortlist and no anchor rule (reported as an owner call)
  const wide = p.anchor.length ? 1 : 2, pseudoCore = p.anchor.length ? p.anchor : p.list.filter(id => O.deckable(gm, id));
  pseudo.core = pseudoCore;
  let theme = []; try { theme = O.candidatesFor(gm, map, pseudo, rules).list.map(r => r.id).slice(0, HELD_THEME * wide); } catch (e) { theme = []; }
  const strong = p.held.filter(id => !theme.includes(id)).sort((a, b) => ((contrib[b] != null ? contrib[b] : -1) - (contrib[a] != null ? contrib[a] : -1)) || (a < b ? -1 : 1)).slice(0, HELD_STRONG * wide);
  const pool = uniq(p.anchor.concat(theme, strong)).sort();
  const all = T3.focusesFor(gm, pool, rules, null), have = id => all.find(f => f.id === id);
  // the focuses must be reachable from the anchor too: a focus that only the held cards carry is the held cards' deck, not the map's
  // and must be fillable under the 4-copy rule (economy 6 copies needs 2+ makers, big 8 needs 2+ costly cards, swarm 14 needs 4+ cheap cards)
  const anchorSet = new Set(p.anchor), room = f => f.cards.reduce((t, id) => t + Math.min(RULE.maxCopies, O.capOf(gm, id)), 0);
  const fit = f => f && f.cards && (!p.anchor.length || f.cards.some(id => anchorSet.has(id))) && room(f) >= f.need;
  const chosen = PRIORITY.map(have).filter(fit); const fam = all.filter(f => /^family:/.test(f.id) && fit(f));
  const focuses = chosen.concat(fam).slice(0, MAX_FOCUS).map(f => f.id).concat(['open']);
  const at = id => T3.attrs(gm, id), A = (p.anchor.length ? p.anchor : pool).map(at), costs = A.map(a => a.cost);
  const facts = { listSize: p.list.length, anchor: p.anchor.length, cost: { min: Math.min(...costs), max: Math.max(...costs), avg: Math.round(costs.reduce((t, c) => t + c, 0) / costs.length * 100) / 100,
    curve: costs.reduce((m, c) => (m[c] = (m[c] || 0) + 1, m), {}) }, generators: A.filter(a => a.gen).map(a => a.id), stoneMetal: A.filter(a => a.stone || a.metal).map(a => a.id + (a.metal ? ' (metal ' + a.metal + ')' : ' (stone ' + a.stone + ')')),
    families: all.filter(f => /^family:/.test(f.id)).map(f => f.id.replace('family:', '') + ' ' + f.cards.length), high: A.filter(a => a.cost >= Math.max(2, Math.max(...costs) - 1)).map(a => a.id) };
  return { id: map.id, num: G.mapNumberOf(map.id), side: map.sub ? map.parent : null, name: map.name, opens: G.mapUnlockNumberOf ? G.mapUnlockNumberOf(map.id) : null, cap: p.cap,
    anchor: p.anchor, anchorMin: p.anchor.length ? ANCHOR_MIN : 0, anchorDropped: p.anchorDropped, heldTheme: theme, heldStrong: strong, pool, fightOnly: p.fightOnly, focuses, focusesAvailable: all.map(f => f.id), facts };
}
function readPlan() { return fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { about: null, maps: {} }; }
function writePlan(j) { fs.writeFileSync(PLAN, JSON.stringify(j, null, 1) + '\n'); }
const ABOUT = 'Package DECK1 (2026-10-30, owner step 4): per map the pool (anchor = its list + SPECIAL; the held shortlist), its facts, the focuses searched, the decks found and their PRO ids. tools/opt/deck1_2026_10_30.js; report docs/balance/deck1-2026-10-30.md.';

function outFileOf(gm, map) { return path.join(OUTDIR, `bench-deck-map${String(gm.G.mapNumberOf(map.id)).padStart(2, '0')}-${map.id}-${DATE}.json`); }

async function main(argv) {
  const cmd = argv[0], a = argv.slice(1), opt = {};
  while (a.length) { const k = a.shift(); if (k === '--maps' || k === '--map') opt.maps = a.shift(); else if (k === '--force') opt.force = true; else if (k === '--dry') opt.dry = true; else if (k === '--budget') opt.budget = +a.shift(); else throw new Error('unknown option ' + k); }
  const gm = O.loadGame(ROOT), G = gm.G, rules = O.loadRules(ROOT);
  if (cmd === 'plan') {
    const j = readPlan(), contrib = loadContrib(); j.about = ABOUT; j.rule = Object.assign({}, RULE, { anchorMin: ANCHOR_MIN, heldTheme: HELD_THEME, heldStrong: HELD_STRONG, level: LEVEL, budget: BUDGET, finalGames: FINAL });
    for (const m of mapsUpTo20(gm, mapRange(opt.maps))) { const old = j.maps[m.id] || {}; j.maps[m.id] = Object.assign(planMap(gm, m, rules, contrib), old.result ? { result: old.result } : {});
      const x = j.maps[m.id]; console.log(`${x.side ? '  side' : 'Map'} ${x.num} ${x.id} ${x.name}: anchor ${x.anchor.length}, pool ${x.pool.length}, cost ${x.facts.cost.min}-${x.facts.cost.max} (avg ${x.facts.cost.avg}), gens ${x.facts.generators.length}, s/m ${x.facts.stoneMetal.length}; focuses ${x.focuses.join(', ')}`); }
    writePlan(j); console.log('-> ' + path.relative(ROOT, PLAN)); return;
  }
  if (cmd === 'run') {
    const j = readPlan(); if (!opt.maps) throw new Error('run --map <id or number>');
    const maps = /^\d+$/.test(opt.maps) ? mapsUpTo20(gm, mapRange(opt.maps)) : [G.CONQUEST_MAPS.find(m => m.id === opt.maps)];
    for (const m of maps) { const x = j.maps[m.id]; if (!x) throw new Error('no plan for ' + m.id + ' (run plan first)'); const f = outFileOf(gm, m);
      if (fs.existsSync(f) && !opt.force) { console.log(m.id + ': done (' + path.relative(ROOT, f) + '); --force re-runs'); continue; }
      await T3.main({ map: m.id, mode: 'map-true', pool: x.pool, anchor: x.anchor.length ? x.anchor : null, anchorMin: x.anchorMin, focus: x.focuses, level: LEVEL, budget: opt.budget || BUDGET, finalGames: FINAL,
        maxUnique: RULE.maxUnique, maxCopies: RULE.maxCopies, size: RULE.size, seed: 'deck1', workers: 2, out: OUTDIR, tag: DATE }); }
    return;
  }
  if (cmd === 'apply') return apply(gm, opt);
  if (cmd === 'check') { const p = checkAll(gm); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ok'); if (p.length) process.exitCode = 1; return; }
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 10).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}

// ---------------------------------------------------------------- apply: the decks become the map's PRO decks
function apply(gm, opt) {
  const G = gm.G, j = readPlan(), file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), ren = P.renamedIds(gm), invalid = [];
  for (const m of mapsUpTo20(gm, mapRange(opt.maps))) {
    const f = outFileOf(gm, m); if (!fs.existsSync(f)) { console.log(m.id + ': no run yet'); continue; }
    const res = JSON.parse(fs.readFileSync(f, 'utf8')), x = j.maps[m.id], pools = deck1Pools(gm, m), field = P.averageField(gm, m);
    const old = file.maps[m.id] || null;
    // the previous decks, checked against the DECK1 rule (the map's current list + held, 6/4) and kept under `history`
    const prevPro = old ? (old.pro || []) : [], prevB = old ? (old.bpro || []) : [];
    prevPro.concat(prevB).forEach(e => { const d = P.renameDeck(e.deck, ren), probs = deck1Problems(gm, m, d, pools), listProbs = probs.filter(s => !/different cards|\(at most \d+\)$/.test(s));
      invalid.push({ map: m.id, id: e.id, kind: /BPRO/.test(e.id) ? 'bpro' : 'pro', cards: Object.keys(d).length, over64: probs.length > listProbs.length, offList: listProbs }); });
    const decks = res.decks.slice(0, 4), prefix = P.proPrefix(gm, m);
    const pro = decks.map((d, i) => { const id = `${prefix}-PRO-${i + 1}`, deck = Object.fromEntries(Object.keys(d.deck).sort().map(k => [k, d.deck[k]]));
      return { id, name: id, focus: d.focus, labels: d.labels, level: LEVEL, leaders: P.leadersFor(gm, m, deck), deck,
        source: { file: path.relative(ROOT, f), mode: 'deck1', tool: res.tool, reproduce: res.reproduce, score: d.score, ci: d.ci, avgLumber: d.avgLumber, generated: res.generated }, h2h: null,
        later: [] }; });
    const entry = old ? JSON.parse(JSON.stringify(old)) : { map: G.mapNumberOf(m.id), side: m.sub ? m.parent : undefined, name: m.name, field: Object.assign({}, field, { summary: P.fieldSummary(gm, field) }), pro: [], bpro: [], replaced: [], skipped: [], notes: [] };
    entry.history = (entry.history || []).concat(prevPro.length ? [{ package: 'DECK1', on: DATE, why: 'replaced by the DECK1 decks (owner step 4: 6 different cards, 4 copies, a focus each)', pro: prevPro }] : []);
    entry.pro = pro; entry.notes = (entry.notes || []).filter(s => !/^DECK1: /.test(s)).concat(['DECK1: ' + pro.length + ' focused decks (' + pro.map(p => p.id + ' ' + p.focus).join(', ') + '); the previous PRO decks are under history']);
    file.maps[m.id] = entry;
    if (x) x.result = { file: path.relative(ROOT, f), pro: pro.map(p => ({ id: p.id, focus: p.focus, labels: p.labels, score: p.source.score, ci: p.source.ci, deck: p.deck, leaders: p.leaders })) };
    console.log(`${m.id}: ${pro.map(p => p.id + ' ' + p.focus + ' ' + p.source.score).join('; ')}`);
  }
  const order = Object.keys(file.maps).sort((a, b) => file.maps[a].map - file.maps[b].map || (file.maps[a].side ? 1 : 0) - (file.maps[b].side ? 1 : 0) || (a < b ? -1 : 1)), maps2 = {}; order.forEach(k => { maps2[k] = file.maps[k]; }); file.maps = maps2;
  file.updated = DATE; file.deck1 = { rule: Object.assign({}, RULE, { anchorMin: ANCHOR_MIN }), tool: 'tools/opt/deck1_2026_10_30.js', note: 'PRO decks of Maps 0-20 and their side maps with their own list rebuilt by DECK1 (owner step 4); BPRO decks unchanged (decision DECK1-2).' };
  j.invalidOld = invalid;
  if (opt.dry) { console.log(JSON.stringify(invalid.filter(v => v.offList.length), null, 1)); return; }
  fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); writePlan(j); console.log('-> ' + path.relative(ROOT, PRO_FILE) + ' (rebuild the game to bake it in)');
}
// every PRO deck (the `pro` lists of Maps 0-20 and their side maps): 20 cards, the rarity and top-rank caps, the 6/4 rule, the DECK1 pool rule
function checkAll(gm) {
  const G = gm.G, file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), out = [];
  Object.keys(file.maps).forEach(id => { const ent = file.maps[id], m = G.CONQUEST_MAPS.find(x => x.id === id); if (!m) { out.push(id + ': no such map'); return; }
    if (G.mapNumberOf(id) > 20) return; const pools = deck1Pools(gm, m);
    (ent.pro || []).forEach(e => { P.deckProblems(gm, e.deck, e.leaders).concat(deck1Problems(gm, m, e.deck, pools)).forEach(p => out.push(`${e.id}: ${p}`));
      if (!e.focus) out.push(e.id + ': no focus'); });
    (ent.bpro || []).forEach(e => P.deckProblems(gm, e.deck, e.leaders).concat(O.mapRuleProblems(gm, m, e.deck, 'bpro')).forEach(p => out.push(`${e.id}: ${p}`))); });
  return out;
}
module.exports = { deck1Pools, deck1Problems, planMap, checkAll, mapsUpTo20, RULE, ANCHOR_MIN };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
