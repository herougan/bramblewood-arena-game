#!/usr/bin/env node
// 2026-10-24 (package PRO, owner 00:28: "Can you add a special hidden skirmish in each map, with the best deck you could make (replacing it
// when you find something better?). It has the field effects of the average skirmish of that map. If there are multiple high elo, form
// multiple. Name them as N-PRO-1, -2 -3 etc."): keeps canonical/pro-skirmishes.json up to date from the deck optimizer's outputs.
//
//   node tools/opt/pro_skirmishes.js                 dry run: what would change, nothing written
//   node tools/opt/pro_skirmishes.js --apply         write canonical/pro-skirmishes.json (then rebuild: python3 assemble_arena.py ...)
//   node tools/opt/pro_skirmishes.js --maps 0-3 --games 400 --files 'docs/balance/opt/deckopt-map*-opt2.json'
//
// Per map (main maps only, by number):
//   - Candidates: the distinct optima of every optimizer output for the map (docs/balance/opt/deckopt-map<NN>-<id>-<tag>.json with an
//     `optima` list; --files narrows them), card ids renamed since the run mapped (CARD_ID_RENAMED in arena_app.js), illegal decks left out
//     (20 cards, the rarity copy caps, the top-rank caps with the leader counted, every card known and deckable).
//   - The field ("the average skirmish of that map"): for every field rule of the map's fights (fightRules: day / night, Mist, Tide, wind,
//     terrain tier, ...) the value most of its fights have (a rule most fights lack is left out); a tie goes to the boss's value (the map's
//     boss, else its last fight).
//   - The leader: from Map 2 (SKIRMISH_LEADER_FROM_MAP) a skirmish leads with its showcase card, so a PRO fight lists the deck's Auto
//     showcase (nodeShowcaseId) as its leader; before Map 2 none.
//   - Head to head: a fair mirror under the PRO fight's own field (both decks at --level, default 1, your bramble on both sides, CPU skill 1,
//     seats swapped every game, no leaders), seeded by (seed, map, the two decks), so a pairing always gives the same result.
//   - The replace rule: PRO-1 is replaced only by a candidate that beats it head to head with p >= --replace-at (0.55) over >= --games
//     (400) games AND a 95% Wilson interval above 50%; the best such candidate wins. The first time a map is filled, PRO-1 is the newest
//     run's optimum.
//   - More PROs ("If there are multiple high elo, form multiple"): every other candidate (and a replaced PRO-1) within --band (100) Elo of
//     PRO-1 head to head and at least --distinct (6) copies apart from every PRO kept, best first, at most --max (4) a map. PRO-2.. are
//     renumbered by Elo, so a link to "3-PRO-2" can name another deck after a run.
// The game reads the file at build time (assemble_arena.py bakes it in as PRO_SKIRMISHES); the fights stay hidden (Admin, the skirmish
// editor, #pro=<id>). Routine: docs/workflows/balance.md "PRO fights".
//
// 2026-10-24 (package PRO2, owner 21:20 #9-#11: "Why is a treant in map 0 pro for example! ... Can we run the PRO ones but with respect to
// the rarity and cards of that map. ALSO, have a BPRO (Basic Pro) - only using cards from that MAP without using cards from outside"):
//   - two kinds (--kind pro|bpro|both, default both). N-PRO-k: the optimizer's map-true runs only (deckopt --mode map-true: the map's own
//     cards + what a player holds by then, within the map's rarity cap, nothing first obtainable later). N-BPRO-k: its bpro runs only (the
//     map's own pool, MAP + SPECIAL + its fight decks, within the cap). A run's mode is its settings.mode (runs before PRO2 are "classic"
//     and are never candidates).
//   - legality adds the map rule (deckopt mapRuleProblems): a candidate that breaks it is skipped, and a PRO / BPRO already in the file
//     that breaks it is dropped to `replaced` (with the reason) before the rule runs, so the map is filled again from the new runs. That is
//     how the OPT2-era PROs (Ents, the Otter Centurion, Bombardier Beetles on Map 0) gave way.
//   - the same replace rule, band, cap of 4 and distinct radius for both kinds; BPRO lives under the map's `bpro`, its ids N-BPRO-k.
'use strict';
const path = require('path'), fs = require('fs');
const O = require('./deckopt.js');
const VERSION = '1.1.0 (2026-10-24, PRO2)';
// 2026-10-24 (PRO2): the two kinds: the optimizer mode each reads, its id label and its list in the map's entry
const KINDS = { pro: { mode: 'map-true', label: 'PRO', list: 'pro' }, bpro: { mode: 'bpro', label: 'BPRO', list: 'bpro' } };
const DEFAULTS = { kind: 'both', rarityCap: 'map', apply: false, maps: null, files: null, games: 400, replaceAt: 0.55, band: 100, max: 4, distinct: 6, level: 1, ai: 1, seed: 'pro', out: null, root: null, quiet: false, json: false };

function parseArgs(argv) {
  const o = Object.assign({}, DEFAULTS), a = argv.slice(), take = () => a.shift();
  while (a.length) { const k = take();
    switch (k) {
      case '--kind': o.kind = take(); break; case '--rarity-cap': o.rarityCap = take(); break;
      case '--apply': o.apply = true; break; case '--dry-run': o.apply = false; break;
      case '--map': case '--maps': o.maps = take(); break; case '--files': o.files = take(); break;
      case '--games': o.games = +take(); break; case '--replace-at': o.replaceAt = +take(); break; case '--band': o.band = +take(); break;
      case '--max': o.max = +take(); break; case '--distinct': o.distinct = +take(); break; case '--level': o.level = +take(); break;
      case '--ai': o.ai = +take(); break; case '--seed': o.seed = take(); break; case '--out': o.out = take(); break; case '--root': o.root = take(); break;
      case '--quiet': o.quiet = true; break; case '--json': o.json = true; break;
      case '--help': case '-h': o.help = true; break;
      default: throw new Error('unknown option ' + k + ' (--help lists them)');
    } }
  if (o.games % 2) o.games++; // seats swap every game: even counts
  if (!['pro', 'bpro', 'both'].includes(o.kind)) throw new Error('--kind pro|bpro|both');
  return o;
}
const HELP = `pro_skirmishes ${VERSION}: the hidden N-PRO-k and N-BPRO-k fights (canonical/pro-skirmishes.json) from the deck optimizer's distinct optima.
  (dry run by default)  --apply        write canonical/pro-skirmishes.json
  --kind pro|bpro|both  N-PRO-k from the map-true runs, N-BPRO-k from the bpro runs (default both)
  --rarity-cap map|skirmish|R          the map rule's cap (default map: the highest of the map's fights; deckopt --rarity-cap)
  --maps 0-3 | 0,2      main map numbers (default: every map with an optimizer output)
  --files GLOB          optimizer outputs to read (default docs/balance/opt/deckopt-map*.json that have distinct optima)
  --games N             head-to-head games a pairing (default 400)        --replace-at P   PRO-1's challenger needs p >= P (default 0.55)
  --band E              keep PROs within E Elo of PRO-1 (default 100)     --max K          at most K a map (default 4)
  --distinct C          PROs at least C copies apart (default 6)          --level L        both decks' card level (default 1)
  --seed S              head-to-head seed (default "pro")                 --json           print the plan as JSON`;

// ---------------------------------------------------------------- small helpers
const r3 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;
const mapNoOf = (gm, map) => gm.G.mapNumberOf(map.id);
function globToRe(g) { return new RegExp('^' + g.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'); }
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else if (/^\d+$/.test(p)) out.add(+p); else throw new Error('--maps takes numbers: ' + p); }); return out; }
function renamedIds(gm) { try { return new Function(gm.B.grab('CARD_ID_RENAMED') + '\nreturn CARD_ID_RENAMED;')(); } catch (e) { return {}; } }
function renameDeck(deck, ren) { const out = {}; Object.keys(deck).forEach(id => { const to = ren[id] || id; out[to] = (out[to] || 0) + deck[id]; }); return out; }
function wilsonElo(p, n) { const ci = O.wilson(p, n); return { p: r3(p), n, ci: [r3(ci[0]), r3(ci[1])], elo: Math.round(O.elo(p, n)), eloCI: [Math.round(O.elo(ci[0], n)), Math.round(O.elo(ci[1], n))] }; }

// a deck the game can field: 20 cards, every card known and deckable, the rarity copy caps, the top-rank caps (the leader counted)
function deckProblems(gm, deck, leaders) {
  const out = [], D = gm.D, size = gm.G.DECK_SIZE || 20;
  if (O.deckTotal(deck) !== size) out.push(`${O.deckTotal(deck)} cards, not ${size}`);
  Object.keys(deck).forEach(id => { const d = D[id];
    if (!d) { out.push('unknown card ' + id); return; }
    if (d.token || d.test || d.hero || d.pool) out.push(id + ' cannot be in a deck');
    if (deck[id] > O.capOf(gm, id)) out.push(`${id} x${deck[id]} over its ${d.rarity} cap ${O.capOf(gm, id)}`); });
  if (!out.length) { try { const over = gm.Budget.deckRankOver(deck, D, leaders || []); if (over.length) out.push('over the top-rank caps: ' + JSON.stringify(over)); } catch (e) { /* an older budget */ } }
  return out;
}

// ---------------------------------------------------------------- the field: "the average skirmish of that map"
function fieldSig(k, v) { if (k === 'terrain') return v ? JSON.stringify({ biome: v.biome, tier: v.tier }) : '-'; return v == null || v === false ? '-' : JSON.stringify(v); }
function averageField(gm, map) {
  const G = gm.G, fights = O.fightsOf(map); if (!fights.length) return null;
  const bossy = fights.filter(n => /boss/.test(n.kind || '')), boss = bossy.length ? bossy[bossy.length - 1] : fights[fights.length - 1];
  const R = fights.map(n => G.fightRules(map.id, n)), keys = [...new Set([].concat(...R.map(r => Object.keys(r))))].sort();
  const rules = {}, why = []; let terrain = null;
  keys.forEach(k => {
    const count = new Map(); R.forEach(r => { const s = fieldSig(k, r[k]); count.set(s, (count.get(s) || 0) + 1); });
    const top = Math.max(...count.values()), tied = [...count.keys()].filter(s => count.get(s) === top);
    const bossSig = fieldSig(k, R[fights.indexOf(boss)][k]);
    const pick = tied.length === 1 ? tied[0] : tied.includes(bossSig) ? bossSig : tied.find(s => R.some(r => fieldSig(k, r[k]) === s));
    if (tied.length > 1) why.push(`${k}: a tie (${tied.join(' / ')}), the boss's (${boss.key})`);
    if (pick === '-') return;
    if (k === 'terrain') terrain = JSON.parse(pick); else rules[k] = JSON.parse(pick);
  });
  return { rules, terrain, fights: fights.map(n => n.key), boss: boss.key, ties: why };
}
function fieldSummary(gm, f) {
  if (!f) return ''; const bits = [];
  Object.keys(f.rules).sort().forEach(k => { const v = f.rules[k]; bits.push(k === 'phase' ? 'phase ' + v : v === true ? k : k + ' ' + (typeof v === 'object' ? JSON.stringify(v) : v)); });
  if (f.terrain) { const t = terrainObjOf(gm)(f.terrain.biome, f.terrain.tier); if (t) bits.push('terrain ' + t.name + ' T' + t.tier + (t.sig ? ' (' + t.sig + ')' : '')); }
  return bits.join(', ');
}
// the PRO fight as the game builds it (arena_app.js proNodeOf keeps the same shape): a skirmish of its map, at the PRO's level
function proNode(gm, map, entry, field) {
  const G = gm.G, rules = Object.assign({}, field.rules);
  const node = { key: entry.id, kind: 'skirmish', name: entry.name, icon: '🏆', pro: true, deck: entry.deck, enemyLevel: entry.level, leaders: (entry.leaders || []).slice(), rules };
  G.NODE_MAP_HINT.set(node, map.id);
  if (field.terrain) rules.terrain = terrainObjOf(gm)(field.terrain.biome, field.terrain.tier) || false;
  else if (G.fightRules(map.id, node).terrain) rules.terrain = false; // the map would give one; the average has none
  return node;
}
// cards a player first gets after this map under the current plan (docs/balance/progression-plan-*.json `first`): the run may predate a
// card's move (RW5 moved the Voidfeather Scout into the Map 5 faction pool after OPT2's runs); reported, the deck is kept
function laterCards(gm, deck, mapNo) { const by = {}; (gm.plan.cards || []).forEach(c => { by[c.id] = c; });
  return Object.keys(deck).filter(id => by[id] && by[id].first != null && by[id].first > mapNo).sort().map(id => ({ id, first: by[id].first })); }
// the game's terrainObj (lib_bramble evaluates it but does not export it)
function terrainObjOf(gm) { if (!gm._terrainObj) gm._terrainObj = new Function(['TERRAIN_BIOMES', 'TERRAIN_TIER_STATS', 'terrainObj'].map(n => gm.B.grab(n)).join('\n') + '\nreturn terrainObj;')(); return gm._terrainObj; }
function leadersFor(gm, map, deck) { const G = gm.G; if (mapNoOf(gm, map) < G.SKIRMISH_LEADER_FROM_MAP) return []; const id = G.nodeShowcaseId({ deck }); return id ? [id] : []; }

// ---------------------------------------------------------------- head to head under the PRO fight's field
function makeH2H(gm, map, field, o) {
  const G = gm.G, probe = proNode(gm, map, { id: 'probe', name: 'probe', deck: {}, level: o.level, leaders: [] }, field);
  const c = G.referenceFightSetup(map.id, probe, { deck: {}, level: o.level });
  const spec = { level: o.level, ai: o.ai, beeTank: false }, cache = new Map();
  return function measure(a, b, games) { // a's score against b: win 1, draw 1/2
    games = games || o.games; const ka = O.deckKey(a), kb = O.deckKey(b), memo = ka + '|' + kb + '|' + games;
    if (cache.has(memo)) return cache.get(memo);
    const ctx = { en: { kind: 'mirror', key: 'pro' }, defs: c.defs, rules: c.rules, mode: c.mode, cpu: c.cpu, sc: c.sc, setup: c.setup, myCastle: c.myCastle, node: probe,
      seedBase: fnv(o.seed + '|' + map.id + '|' + ka + '|vs|' + kb), mineCache: new Map() };
    ctx.oppMine = O.mineFor(gm, ctx.defs, b, o.level);
    let s = 0; for (let g = 0; g < games; g++) s += O.playOne(gm, spec, ctx, a, g);
    const r = wilsonElo(s / games, games); cache.set(memo, r); return r;
  };
}
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------------------------------------------------------------- the rule (pure: measure(a, b) -> {p, n, ci, elo})
// cur: the map's PRO entries now (PRO-1 first); cands: [{deck, source}] from the optimizer, the newest run's optimum first.
// Returns {pro: [{deck, source, h2h}], replaced: [{deck, source, by, h2h}], notes}.
function decide(cur, cands, measure, o) {
  o = Object.assign({}, DEFAULTS, o || {}); const notes = [], key = d => O.deckKey(d.deck);
  const seen = new Set(cur.map(key)), fresh = []; cands.forEach(c => { const k = key(c); if (seen.has(k)) return; seen.add(k); fresh.push(c); });
  let pro1 = cur[0] || null, replaced = [], measured = new Map();
  if (!pro1) { if (!fresh.length) return { pro: [], replaced, notes: ['no candidates'] }; pro1 = fresh.shift(); notes.push('first fill: PRO-1 is the newest run\'s optimum'); }
  else {
    const wins = fresh.map(c => ({ c, r: measure(c.deck, pro1.deck) })).map(x => { measured.set(key(x.c), x.r); return x; })
      .filter(x => x.r.n >= o.games && x.r.p >= o.replaceAt && x.r.ci[0] > 0.5).sort((a, b) => b.r.p - a.r.p);
    if (wins.length) { const w = wins[0]; notes.push(`PRO-1 replaced: the challenger scores ${w.r.p} over ${w.r.n} games [${w.r.ci.join(', ')}]`);
      replaced.push({ deck: pro1.deck, source: pro1.source, by: key(w.c), h2h: w.r }); fresh.splice(fresh.indexOf(w.c), 1); fresh.push(pro1); pro1 = w.c; measured = new Map(); }
    else notes.push('PRO-1 kept: no candidate beats it by the rule (p >= ' + o.replaceAt + ' over >= ' + o.games + ' games, interval above 50%)');
  }
  // every other deck's Elo against PRO-1 (its own score vs PRO-1); an alt kept from before keeps its measure while PRO-1 is the same deck
  const rated = [];
  cur.slice(1).concat(fresh).forEach(c => { if (key(c) === key(pro1) || rated.some(y => key(y.c) === key(c))) return;
    const stored = !replaced.length && c.h2h && c.h2h.vs === key(pro1) && c.h2h.n >= o.games ? c.h2h : null;
    rated.push({ c, r: stored || measured.get(key(c)) || measure(c.deck, pro1.deck) }); });
  rated.sort((a, b) => b.r.elo - a.r.elo || b.r.p - a.r.p);
  const keep = [{ deck: pro1.deck, source: pro1.source, h2h: null }];
  rated.forEach(({ c, r }) => {
    if (keep.length >= o.max) return;
    if (r.elo < -o.band) { notes.push(`left out (${r.elo} Elo below the band): ${key(c).slice(0, 60)}...`); return; }
    const near = keep.find(k => O.dist(k.deck, c.deck) < o.distinct); if (near) { notes.push(`left out (${O.dist(near.deck, c.deck)} copies from a kept PRO): ${key(c).slice(0, 60)}...`); return; }
    keep.push({ deck: c.deck, source: c.source, h2h: Object.assign({ vs: key(pro1) }, r) });
  });
  return { pro: keep, replaced, notes };
}

// ---------------------------------------------------------------- the optimizer outputs
function readRuns(root, o) {
  const dir = path.join(root, 'docs', 'balance', 'opt'); if (!fs.existsSync(dir)) return [];
  const re = o.files ? globToRe(path.basename(o.files)) : /^deckopt-map\d+-.*\.json$/, base = o.files ? path.resolve(root, path.dirname(o.files)) : dir;
  return fs.readdirSync(base).filter(f => re.test(f)).sort().map(f => { const file = path.join(base, f); let j = null; try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return null; }
    return j && Array.isArray(j.optima) && j.optima.length && j.map ? { file: path.relative(root, file), j } : null; }).filter(Boolean)
    .sort((a, b) => String(b.j.generated).localeCompare(String(a.j.generated))); // newest first
}
const runModeOf = r => (r.j.settings && r.j.settings.mode) || 'classic'; // runs before PRO2 have no mode: the classic pool
function candidatesOf(gm, runs, mapId, ren, mode) {
  const out = [];
  runs.filter(r => r.j.map.id === mapId && (mode == null || runModeOf(r) === mode)).forEach(r => r.j.optima.forEach(op => {
    const deck = renameDeck(op.deck, ren), h = r.j.optimaH2H && r.j.optimaH2H[0] && r.j.optimaH2H[0][op.i];
    out.push({ deck, source: { file: r.file, mode: runModeOf(r), optimum: op.i, generated: r.j.generated, version: r.j.version, reproduce: r.j.reproduce, score: op.score, ci: op.ci,
      runElo: op.i === 0 ? 0 : h ? -h.elo : null, renamed: Object.keys(op.deck).filter(id => ren[id]).map(id => id + ' -> ' + ren[id]) } });
  }));
  return out;
}

// ---------------------------------------------------------------- main
function emptyFile() { return { about: ABOUT, version: 2, updated: null, tool: null, rule: null, maps: {} }; }
const ABOUT = 'Hidden PRO fights per main map (package PRO, owner 2026-10-24 00:28; PRO2 21:20). N-PRO-k: the best decks of the deck optimizer\'s map-true runs (the map\'s own cards + what a player holds by then, within the map\'s rarity cap); N-BPRO-k (Basic Pro, under `bpro`): its bpro runs (only the map\'s own pool, within the cap). Written by tools/opt/pro_skirmishes.js --apply; baked into the game by assemble_arena.py (the `pro` list; `bpro` waits for the PRO preview package). Not on the road, no progress, no rewards.';
async function main(argv) {
  const o = parseArgs(argv); if (o.help) { console.log(HELP); return null; }
  const root = path.resolve(o.root || path.join(__dirname, '..', '..')), outFile = path.resolve(root, o.out || path.join('canonical', 'pro-skirmishes.json'));
  const log = o.quiet ? () => {} : s => console.log(s);
  const gm = O.loadGame(root), ren = renamedIds(gm), runs = readRuns(root, o), want = mapRange(o.maps);
  const file = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : emptyFile();
  const mapIds = [...new Set(runs.map(r => r.j.map.id).concat(Object.keys(file.maps || {})))];
  const maps = mapIds.map(id => gm.G.CONQUEST_MAPS.find(m => m.id === id)).filter(m => m && !m.sub).filter(m => !want || want.has(mapNoOf(gm, m))).sort((a, b) => mapNoOf(gm, a) - mapNoOf(gm, b));
  log(`pro_skirmishes ${VERSION}: ${maps.length} map(s), ${runs.length} optimizer output(s), ${o.games} games a pairing, ${o.apply ? 'APPLY' : 'dry run'}`);
  const plan = [], next = JSON.parse(JSON.stringify(file)); next.maps = next.maps || {}; next.about = ABOUT; next.version = 2;
  const kinds = o.kind === 'both' ? ['pro', 'bpro'] : [o.kind];
  for (const map of maps) {
    const no = mapNoOf(gm, map), field = averageField(gm, map); if (!field) continue;
    const old = file.maps[map.id] || {}, today = new Date().toISOString().slice(0, 10);
    const entry = { map: no, name: map.name, field: Object.assign({}, field, { summary: fieldSummary(gm, field) }), pro: old.pro || [], bpro: old.bpro || [],
      replaced: (old.replaced || []).slice(), skipped: (old.skipped || []).filter(x => !kinds.includes(x.kind || 'pro')), notes: (old.notes || []).filter(x => !kinds.some(k => x.startsWith(KINDS[k].label + ': '))) };
    log(`Map ${no} ${map.name} (${map.id}): field ${entry.field.summary || '(none)'}${field.ties.length ? ' [' + field.ties.join('; ') + ']' : ''}; rarity cap ${O.mapRarityCap(gm, map, o.rarityCap)}`);
    for (const kind of kinds) {
      const K = KINDS[kind], t0 = Date.now(), prev = old[K.list] || [], note = s => entry.notes.push(K.label + ': ' + s);
      // the map rule first (PRO2): a deck in the file that breaks it is dropped, so the map is filled again from the new runs
      const cur = [];
      prev.forEach(e => { const deck = renameDeck(e.deck, ren), probs = O.mapRuleProblems(gm, map, deck, K.mode, o.rarityCap).concat(deckProblems(gm, deck, leadersFor(gm, map, deck)));
        if (probs.length) { entry.replaced.push({ kind, id: e.id, deck, source: e.source, dropped: probs, on: today }); note(`${e.id} dropped: ${probs.join('; ')}`); log(`  · ${K.label}: ${e.id} dropped (the map rule): ${probs.join('; ')}`); }
        else cur.push({ deck, source: e.source, h2h: e.h2h }); });
      const cands = [], skipped = [];
      candidatesOf(gm, runs, map.id, ren, K.mode).forEach(c => { const p = deckProblems(gm, c.deck, leadersFor(gm, map, c.deck)).concat(O.mapRuleProblems(gm, map, c.deck, K.mode, o.rarityCap));
        if (p.length) skipped.push({ kind, source: c.source.file + ' #' + c.source.optimum, problems: p }); else cands.push(c); });
      const measure = makeH2H(gm, map, field, o);
      const d = decide(cur, cands, measure, o);
      const list = d.pro.map((x, i) => { const id = `${no}-${K.label}-${i + 1}`;
        return { id, name: id, level: o.level, leaders: leadersFor(gm, map, x.deck), deck: Object.fromEntries(Object.keys(x.deck).sort().map(k => [k, x.deck[k]])), source: x.source, h2h: x.h2h, later: laterCards(gm, x.deck, no) }; });
      const before = prev.map(e => O.deckKey(renameDeck(e.deck, ren))).join(' / '), after = list.map(e => O.deckKey(e.deck)).join(' / ');
      entry[K.list] = list;
      d.replaced.forEach(r => entry.replaced.push({ kind, deck: r.deck, source: r.source, lostTo: r.by, h2h: r.h2h, on: today }));
      entry.skipped = entry.skipped.concat(skipped); d.notes.forEach(note);
      plan.push({ map: map.id, no, kind, changed: before !== after, seconds: Math.round((Date.now() - t0) / 100) / 10, entry });
      list.forEach(e => log(`  ${e.id}: gauntlet ${e.source.score} [${(e.source.ci || []).join(', ')}] (${e.source.file} #${e.source.optimum})${e.h2h ? `, vs ${K.label}-1 ${e.h2h.p} over ${e.h2h.n} = ${e.h2h.elo >= 0 ? '+' : ''}${e.h2h.elo} Elo` : ''}${e.leaders.length ? ', leader ' + e.leaders.join(', ') : ''}${e.later.length ? '; first obtainable later: ' + e.later.map(x => x.id + ' (Map ' + x.first + ')').join(', ') : ''}`));
      d.notes.forEach(n => log(`  · ${K.label}: ${n}`)); skipped.forEach(x => log(`  · ${K.label} skipped ${x.source}: ${x.problems.join('; ')}`));
      log(`  ${K.label}: ${before === after ? 'no change' : prev.length ? 'CHANGED' : 'new'} (${plan[plan.length - 1].seconds} s)`);
    }
    next.maps[map.id] = entry;
  }
  next.updated = new Date().toISOString().slice(0, 10); next.tool = 'tools/opt/pro_skirmishes.js ' + VERSION;
  next.rule = { games: o.games, replaceAt: o.replaceAt, band: o.band, max: o.max, distinct: o.distinct, level: o.level, ai: o.ai, seed: o.seed,
    modes: { pro: KINDS.pro.mode, bpro: KINDS.bpro.mode }, rarityCap: o.rarityCap }; // 2026-10-24 (PRO2): the kinds' optimizer modes and the map rule's cap
  if (o.json) console.log(JSON.stringify(plan, null, 1));
  if (o.apply) { const order = Object.keys(next.maps).sort((a, b) => next.maps[a].map - next.maps[b].map), maps2 = {}; order.forEach(k => { maps2[k] = next.maps[k]; }); next.maps = maps2;
    fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, JSON.stringify(next, null, 1) + '\n'); log('-> ' + path.relative(root, outFile) + ' (rebuild the game to bake it in)'); }
  else log('dry run: nothing written (--apply writes ' + path.relative(root, outFile) + ')');
  return { plan, file: next };
}
module.exports = { VERSION, KINDS, parseArgs, decide, averageField, fieldSummary, proNode, deckProblems, leadersFor, readRuns, candidatesOf, renamedIds, renameDeck, makeH2H, main };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
