#!/usr/bin/env node
// 2026-11-07 (package CONTENT13, owner 11-06 23:35 #8: "Below the tutorial, add a sub-map (admin only). It has 2 SK decks, one having a
// random assortment of optimised otter faction cards, the other hummingbird faction cards."): the two enemy decks of the Drill Grounds
// (arena_app.js C13_ADMIN_SUBMAPS). Each faction's list is every card whose `archetypes` in canonical/cards.json holds that faction's tag
// ("Otter" / "Hummingbird"), without cards that carry both tags (Riverwing Envoy), tokens, test cards, cards on no source
// (unattainable / awaitingSource) and anything the optimiser cannot deck. The deck is the deck optimiser's (tools/bench/bench.js deck,
// DECK1's focused search over deckopt's gauntlet) `open` focus: at most 6 different cards, at most 4 copies (never above a rarity's cap),
// 20 cards, Level 1, seeded per faction so a run is the same on every machine. The gauntlet is Map 10's fights and reference decks.
//
//   node tools/content13_faction_decks_2026_11_07.js pools            print the two lists
//   node tools/content13_faction_decks_2026_11_07.js run [--budget 3000] [--only otters|hummingbirds]
//                                                                      run the search(es) -> docs/balance/content13/bench-deck-*.json
//   node tools/content13_faction_decks_2026_11_07.js collect            the best deck of each run -> docs/balance/content13/faction-decks-2026-11-07.json
//   node tools/content13_faction_decks_2026_11_07.js check              every deck in arena_app.js's Drill Grounds is legal and faction-pure (exit 1 if not)
//   node tools/content13_faction_decks_2026_11_07.js measure [--games 200]  the Map reference (as the game deals it there) against each deck
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'balance', 'content13');
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const FACTIONS = { otters: { tag: 'Otter', other: 'Hummingbird', seed: 'content13-otters' }, hummingbirds: { tag: 'Hummingbird', other: 'Otter', seed: 'content13-hummingbirds' } };
const GAUNTLET_MAP = 10, LEVEL = 1, RULE = { maxUnique: 6, maxCopies: 4, size: 20 };
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };

function poolOf(fac) {
  const F = FACTIONS[fac];
  return CARDS.filter(c => { const a = c.archetypes || [];
    return a.includes(F.tag) && !a.includes(F.other) && !c.token && !c.test && !c.hero && !c.unattainable && !c.awaitingSource && c.kind !== 'baby'; })
    .map(c => c.id).sort();
}
function deckable(ids) { let O = null; try { O = require('./opt/deckopt.js'); } catch (e) { return ids; }
  const gm = O.loadGame ? O.loadGame(ROOT) : null; return gm && O.deckable ? ids.filter(id => O.deckable(gm, id)) : ids; }
function runFile(fac) { return path.join(OUT, `bench-deck-map${String(GAUNTLET_MAP).padStart(2, '0')}-` + '*' + `-2026-11-07-${fac}.json`); }
function findRun(fac) { if (!fs.existsSync(OUT)) return null; const f = fs.readdirSync(OUT).find(n => n.endsWith(`-2026-11-07-${fac}.json`) && n.startsWith('bench-deck-')); return f ? path.join(OUT, f) : null; }

function cmdFor(fac, budget) {
  return ['tools/bench/bench.js', 'deck', '--map', String(GAUNTLET_MAP), '--pool', deckable(poolOf(fac)).join(','), '--max-unique', String(RULE.maxUnique), '--max-copies', String(RULE.maxCopies),
    '--size', String(RULE.size), '--focus', 'open', '--budget', String(budget), '--final-games', '24', '--seed', FACTIONS[fac].seed, '--level', String(LEVEL), '--workers', '2',
    '--out', path.relative(ROOT, OUT), '--tag', '2026-11-07-' + fac];
}

// The Drill Grounds' decks as the app holds them (plain text: the block between C13_ADMIN_SUBMAPS:BEGIN / END)
function appDecks() {
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), b = src.indexOf('// C13_ADMIN_SUBMAPS:BEGIN'), e = src.indexOf('// C13_ADMIN_SUBMAPS:END');
  if (b < 0 || e < 0) throw new Error('C13_ADMIN_SUBMAPS block not found in arena_app.js');
  const out = [], re = /key:"(SK-\d)"[^\n]*?faction:"(otters|hummingbirds)"[^\n]*?deck:(\{[^}]*\})/g; let m;
  while ((m = re.exec(src.slice(b, e)))) out.push({ key: m[1], faction: m[2], deck: JSON.parse(m[3]) });
  return out;
}
const RARITY_MAX = (() => { const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), m = /const RARITY_MAX_COPIES\s*=\s*(\{[^}]*\})/.exec(src);
  try { return Function('return ' + m[1])(); } catch (e) { return {}; } })();
function problems(fac, deck) {
  const pool = poolOf(fac), byId = Object.fromEntries(CARDS.map(c => [c.id, c])), out = [], ids = Object.keys(deck), tot = ids.reduce((t, id) => t + deck[id], 0);
  if (tot !== RULE.size) out.push(`${tot} cards (want ${RULE.size})`);
  if (ids.length > RULE.maxUnique) out.push(`${ids.length} different cards (at most ${RULE.maxUnique})`);
  ids.forEach(id => { const c = byId[id]; if (!c) { out.push(id + ': not in cards.json'); return; }
    if (!pool.includes(id)) out.push(id + ': not a pure ' + fac + ' card');
    const cap = Math.min(RULE.maxCopies, RARITY_MAX[c.rarity || 'common'] != null ? RARITY_MAX[c.rarity || 'common'] : RULE.maxCopies);
    if (deck[id] > cap) out.push(`${id}: ${deck[id]} copies (cap ${cap})`); });
  return out;
}

function main() {
  const cmd = process.argv[2] || 'pools';
  if (cmd === 'pools') { Object.keys(FACTIONS).forEach(f => console.log(f, poolOf(f).length, poolOf(f).join(', '))); return; }
  if (cmd === 'run') {
    const budget = +arg('--budget', 3000), only = arg('--only', null);
    Object.keys(FACTIONS).filter(f => !only || f === only).forEach(f => { const a = cmdFor(f, budget); console.log('$ node ' + a.join(' '));
      const r = cp.spawnSync(process.execPath, a, { cwd: ROOT, stdio: 'inherit' }); if (r.status) process.exit(r.status); });
    return;
  }
  if (cmd === 'collect') {
    const res = { date: '2026-11-07', package: 'CONTENT13', rule: RULE, level: LEVEL, gauntletMap: GAUNTLET_MAP, decks: {} };
    Object.keys(FACTIONS).forEach(f => { const file = findRun(f); if (!file) throw new Error('no run for ' + f + ' (run first)'); const r = JSON.parse(fs.readFileSync(file, 'utf8')), best = r.decks[0];
      res.decks[f] = { seed: FACTIONS[f].seed, pool: r.pool, deck: best.deck, score: best.score != null ? best.score : best.fit, reproduce: r.reproduce, run: path.relative(ROOT, file), problems: problems(f, best.deck) }; });
    fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'faction-decks-2026-11-07.json'), JSON.stringify(res, null, 1) + '\n');
    console.log(JSON.stringify(Object.fromEntries(Object.entries(res.decks).map(([k, v]) => [k, { deck: v.deck, score: v.score, problems: v.problems }])), null, 1));
    return;
  }
  if (cmd === 'check') {
    const decks = appDecks(); let bad = 0;
    if (decks.length !== 2) { console.log('expected 2 decks, found ' + decks.length); bad++; }
    decks.forEach(d => { const p = problems(d.faction, d.deck); console.log(d.key, d.faction, p.length ? 'PROBLEMS: ' + p.join('; ') : 'ok'); if (p.length) bad++; });
    process.exit(bad ? 1 : 0);
  }
  if (cmd === 'measure') { // the Map reference as the game deals it on the Drill Grounds (G.simulateReferenceFight, the road measure's seeds 9100 + 37g)
    const B = require('./lib_bramble.js'), G = B.G, games = +arg('--games', 200), seed0 = +arg('--seed', 9100);
    const defs = Function('return ' + B.grab('C13_ADMIN_SUBMAPS').replace(/^const C13_ADMIN_SUBMAPS = /, '').replace(/;\s*$/, ''))();
    defs.forEach(m => { if (!G.CONQUEST_MAPS.some(x => x.id === m.id)) G.CONQUEST_MAPS.push(m); });
    const res = {};
    defs.forEach(m => m.nodes.forEach(nd => { G.NODE_MAP_HINT.set(nd, m.id); const ref = G.referenceDeckFor(m.id, nd), r = G.simulateReferenceFight(m.id, nd, games, { seed0 });
      res[nd.key] = { faction: nd.faction, win: Math.round(r.wins / games * 1000) / 10, games, refMap: ref.mapNo, refStage: ref.stage, refLevel: ref.level, enemyLevel: G.roadEnemyLevelExact(nd), shield: G.ruleShieldOf(nd) };
      console.log(nd.key, nd.faction, 'Map reference wins', res[nd.key].win + '%', 'of', games, '| reference', ref.stage, 'Map', ref.mapNo, 'Lv', ref.level, '| enemy Lv', res[nd.key].enemyLevel, 'Shield', res[nd.key].shield); }));
    const f = path.join(OUT, 'faction-decks-2026-11-07.json'); if (fs.existsSync(f)) { const j = JSON.parse(fs.readFileSync(f, 'utf8')); j.mapReference = { seeds: '9100 + 37g', games, results: res }; fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n'); }
    return;
  }
  console.log('commands: pools | run [--budget G] [--only f] | collect | check | measure [--games N]');
}
if (require.main === module) main();
module.exports = { poolOf, problems, appDecks, FACTIONS, RULE, LEVEL };
