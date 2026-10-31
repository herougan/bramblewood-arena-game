#!/usr/bin/env node
// 2026-10-24 (package PRO, owner 00:28: "Can you add a special hidden skirmish in each map, with the best deck you could make (replacing it
// when you find something better?). It has the field effects of the average skirmish of that map. If there are multiple high elo, form
// multiple. Name them as N-PRO-1, -2 -3 etc."): the hidden PRO fights.
//   (2026-10-24, package PRO2: N-PRO-k from map-true runs and N-BPRO-k from bpro runs, both within the map's rarity cap; section 2 also
//   checks the map rule drops an old deck that breaks it)
//   1. data: canonical/pro-skirmishes.json covers Maps 0-3; ids N-PRO-k in order, 1-4 a map; every deck legal on today's cards (20 cards,
//      copy caps, top-rank caps with the leader); Level 1; leaders only from Map 2 (the deck's showcase); the field is still the map's
//      average (recomputed); PRO-2.. within the Elo band over >= the rule's games, kept apart; each deck is an optimum of its source run;
//   2. the tool's rule (decide() with a stub head-to-head): replace only at p >= 0.55 over >= 400 games with the interval above 50%, the
//      band, the cap of 4, the distinct radius, the first fill; a real dry run writes nothing, --apply --out writes the same shape, and a
//      pairing gives the same result twice (seeded);
//   3. wiring: the build bakes the file in once; texts in the 12 packs; owner calls PRO-1 / PRO-2; the routine in the balance workflow;
//   4. browser: not on the road (no map's nodes, no map node on screen), the admin list (every PRO, a Fight button that starts it), the
//      skirmish editor's row, the deep link (#pro=3-PRO-1 starts it, no Energy, the hash cleared), a won PRO fight pays nothing and records
//      no progress, and Play again stays a free PRO fight.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const P = require(path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js')), O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ---- 1. data
const FILE = 'canonical/pro-skirmishes.json', data = JSON.parse(rd(FILE));
const gm = O.loadGame(ROOT), G = gm.G, ren = P.renamedIds(gm);
// 2026-10-24 (package PRO2, owner 21:20 #9-#11): two kinds per map, N-PRO-k (the optimizer's map-true runs) and N-BPRO-k (its bpro runs,
// under `bpro`): both within the map's rarity cap (no Ent / Alley Cat / Otter Centurion on Map 0), PRO cards obtainable by the map, BPRO
// cards all from the map's own pool (MAP + SPECIAL + its fight decks); each deck from a run of its own mode
ok(['m1', 'mf', 'mb', 'mc'].every(id=> data.maps[id] && data.maps[id].pro.length >= 1), '1. Maps 0-3 each have a PRO fight');
ok(['m1', 'mf', 'mb', 'mc'].every(id=> data.maps[id] && (data.maps[id].bpro || []).length >= 1), '1. Maps 0-3 each have a BPRO fight');
const rule = data.rule || {};
ok(rule.games >= 400 && rule.replaceAt === 0.55 && rule.band === 100 && rule.max === 4 && rule.level === 1, '1. the rule recorded: 400 games, 55%, 100 Elo, 4 a map, Level 1 ' + JSON.stringify(rule));
ok(rule.modes && rule.modes.pro === 'map-true' && rule.modes.bpro === 'bpro' && rule.rarityCap === 'map', '1. the kinds\' modes and the map rule\'s cap recorded ' + JSON.stringify({modes: rule.modes, cap: rule.rarityCap}));
const KINDS = [['pro', 'PRO', 'map-true'], ['bpro', 'BPRO', 'bpro']];
Object.keys(data.maps).forEach(mid=>{
  const ent = data.maps[mid], map = G.CONQUEST_MAPS.find(m=> m.id === mid), no = G.mapNumberOf(mid);
  // 2026-10-25 (PRO3): a side map has its own entry too (ent.side = its parent, ids N-L-PRO-k from its fight codes, its own pool = the parent's
  // MAP tier + its SUBMAP list + SPECIAL + its fight decks)
  ok(map && ent.map === no && (map.sub ? ent.side === map.parent : !ent.side), `1. ${mid} is ${map && map.sub ? 'a side map of' : 'main map'} ${no}`);
  const pk = map.sub ? map.parent : mid, sub = map.sub ? ((gm.pools[pk] || {}).submaps || {})[mid] || [] : [], prefix = P.proPrefix(gm, map);
  const cap = O.mapRarityCap(gm, map), pool = gm.pools[pk] || {}, own = new Set((pool.cards || []).concat(pool.special || [], Array.isArray(sub) ? sub : (sub.cards || []), ...O.fightsOf(map).map(n=> Object.keys(n.deck))));
  KINDS.forEach(([list, label, mode])=>{ const L = ent[list] || [];
  // 2026-10-31 (SKILL2, DECK1-2): a map whose list has nothing inside its cap (the Old Bramble) has no BPRO deck (noted in the entry)
  const noB = list === 'bpro' && !L.length && (ent.notes || []).some(s=> /^SKILL2 BPRO: none/.test(s));
  ok(noB || (L.length >= 1 && L.length <= 4), `1. ${mid}: 1-4 ${label} fights (${L.length})`);
  L.forEach((e, i)=>{
    ok(e.id === `${prefix}-${label}-${i + 1}` && e.name === e.id, `1. ${mid}: id ${e.id} is ${prefix}-${label}-${i + 1}`);
    ok(e.level === 1, `1. ${e.id}: Level 1`);
    const lead = no >= G.SKIRMISH_LEADER_FROM_MAP ? [G.nodeShowcaseId({deck: e.deck})] : [];
    ok(JSON.stringify(e.leaders) === JSON.stringify(lead), `1. ${e.id}: leaders ${JSON.stringify(e.leaders)} (the map rule: ${JSON.stringify(lead)})`);
    const probs = P.deckProblems(gm, e.deck, e.leaders);
    ok(!probs.length, `1. ${e.id}: a legal deck on today's cards (${probs.join('; ')})`);
    const over = Object.keys(e.deck).filter(id=> G.roadRarityStep(gm.D[id].rarity) > G.roadRarityStep(cap));
    ok(!over.length, `1. ${e.id}: no card over Map ${no}'s rarity cap ${cap} (${over.join(', ')})`);
    if(list === 'bpro') ok(Object.keys(e.deck).every(id=> own.has(id)), `1. ${e.id}: every card from Map ${no}'s own pool (${Object.keys(e.deck).filter(id=> !own.has(id)).join(', ')})`);
    const mr = O.mapRuleProblems(gm, map, e.deck, mode);
    ok(!mr.length, `1. ${e.id}: the ${mode} map rule (${mr.join('; ')})`);
    // 2026-10-30 (package DECK1, owner step 4): the PRO decks of Maps 0-20 and their side maps are DECK1's focused decks (tools/opt/deck1_2026_10_30.js;
    // its own checks: tests/deck1-2026-10-30.js): from a DECK1 search run (tools/bench/bench.js deck, map-true pool), no head-to-head, ordered by
    // their gauntlet score; the optimum / Elo checks below are for decks from optimizer runs
    // 2026-10-31 (package SKILL2, DECK1-2): the BPRO decks are SKILL2's focused decks from the map's list only (tools/opt/bpro2_2026_10_31.js;
    // its own checks: tests/skill2-2026-10-31.js), the same shape as DECK1's
    const d1 = (list === 'pro' && e.source && e.source.mode === 'deck1') || (list === 'bpro' && e.source && e.source.mode === 'bpro2');
    if(d1){ ok(fs.existsSync(path.join(ROOT, e.source.file)), `1. ${e.id}: its DECK1 run exists (${e.source.file})`);
      const run = fs.existsSync(path.join(ROOT, e.source.file)) ? JSON.parse(rd(e.source.file)) : {decks: []};
      ok((run.decks || []).some(x=> O.deckKey(x.deck) === O.deckKey(e.deck) && x.score === e.source.score) && (run.settings || {}).mode === 'map-true', `1. ${e.id}: the deck is a deck of its DECK1 run`);
      ok(e.focus && e.h2h == null, `1. ${e.id}: a focus (${e.focus}), no head-to-head`);
      if(i > 0) ok(e.source.score <= L[i - 1].source.score, `1. ${e.id}: ordered by the gauntlet score`);
      return; }
    ok(e.source && e.source.mode === mode, `1. ${e.id}: from a ${mode} run (${e.source && e.source.mode})`);
    ok(e.source && fs.existsSync(path.join(ROOT, e.source.file)), `1. ${e.id}: its source run exists (${e.source && e.source.file})`);
    if(e.source && fs.existsSync(path.join(ROOT, e.source.file))){ const run = JSON.parse(rd(e.source.file)), op = (run.optima || []).find(x=> x.i === e.source.optimum);
      ok(op && O.deckKey(P.renameDeck(op.deck, ren)) === O.deckKey(e.deck) && op.score === e.source.score && (run.settings || {}).mode === mode, `1. ${e.id}: the deck is optimum #${e.source.optimum} of its ${mode} run`); }
    if(i === 0) ok(e.h2h == null, `1. ${e.id}: ${label}-1 has no head-to-head of its own`);
    else { ok(e.h2h && e.h2h.n >= rule.games && e.h2h.elo >= -rule.band && e.h2h.vs === O.deckKey(L[0].deck), `1. ${e.id}: within ${rule.band} Elo of ${label}-1 over >= ${rule.games} games (${e.h2h && e.h2h.elo}, n ${e.h2h && e.h2h.n})`);
      ok(L.slice(0, i).every(x=> O.dist(x.deck, e.deck) >= rule.distinct), `1. ${e.id}: at least ${rule.distinct} copies from the ${label}s above it`);
      if(i > 1) ok(e.h2h.elo <= L[i - 1].h2h.elo, `1. ${e.id}: ordered by Elo`); }
  }); });
  const f = P.averageField(gm, map);
  // 2026-10-24 (package EN5): fightRules marks every fight on a forest map rules.woods (Canopy Cover); the PRO file predates it, and a PRO
  // fight goes through fightRules as it starts, so it is under the trees anyway: compared without it (refreshed with the next pro_skirmishes --apply)
  if(f.rules && !(ent.field.rules || {}).woods) delete f.rules.woods;
  // 2026-10-24 (package EN8): the same for EN8's flags (the CPU's lethal guard from Map 1, Driftwood's beach, Windfall on the windy maps)
  if(f.rules) ['aiGuardLethal', 'beachMap', 'windfall'].forEach(k=>{ if(!(ent.field.rules || {})[k]) delete f.rules[k]; });
  // 2026-10-28 (package CONTENT4, L2): the same for a map's own field effect (mapField on its CONQUEST_MAPS entry), added after the PRO file;
  // compared without it until the next pro_skirmishes --apply
  { const mp = G.CONQUEST_MAPS ? G.CONQUEST_MAPS.find(x=> x.id === mid) : null; if(f.rules && mp && mp.mapField) Object.keys(mp.mapField).forEach(k=>{ if(!(ent.field.rules || {})[k]) delete f.rules[k]; }); }
  ok(JSON.stringify(f.rules) === JSON.stringify(ent.field.rules) && JSON.stringify(f.terrain) === JSON.stringify(ent.field.terrain), `1. ${mid}: the field is still the map's average (${ent.field.summary})`);
});
// the average itself: Map 3's fights (3-1 no terrain, 3-2..3-4 tier I, 3-5..3-7 tier II) tie I / II, so the boss's (the ender, 3-7) tier II wins
{ const f = P.averageField(gm, G.CONQUEST_MAPS.find(m=> m.id === 'mc'));
  ok(f.rules.wind === 'windy' && f.rules.phase === 'cycle' && !f.rules.highTide && f.terrain && f.terrain.tier === 2 && f.boss === '3-7' && f.ties.length === 1, '1. Map 3: wind and day / night (all fights), no High Tide (3 of 7), terrain tie -> the boss\'s tier II ' + JSON.stringify(f));
  const f0 = P.averageField(gm, G.CONQUEST_MAPS.find(m=> m.id === 'm1'));
  ok(f0.rules.misty === true && f0.rules.phase === 'off' && f0.terrain === null, '1. Map 0: Mist, no day / night, no terrain (2 of 4 fights have none) ' + JSON.stringify(f0)); }

// ---- 2. the rule, with a stub head-to-head
{ const D = k=> { const d = {}; for(let i = 0; i < 20; i++){ const id = 'c' + ((i + k * 7) % 40); d[id] = (d[id] || 0) + 1; } return d; }; // decks k copies apart-ish
  const A = {deck: D(0), source: {file: 'a'}}, B = {deck: D(1), source: {file: 'b'}}, C = {deck: D(2), source: {file: 'c'}};
  const stub = table=> (a, b)=>{ const r = table[O.deckKey(a) + '|' + O.deckKey(b)]; if(r) return r; const back = table[O.deckKey(b) + '|' + O.deckKey(a)]; if(back) return {p: 1 - back.p, n: back.n, ci: [1 - back.ci[1], 1 - back.ci[0]], elo: -back.elo}; return {p: 0.5, n: 400, ci: [0.45, 0.55], elo: 0}; };
  const r = (p, nn)=>{ const ci = O.wilson(p, nn); return {p, n: nn, ci, elo: Math.round(O.elo(p, nn))}; };
  const K = (x, y)=> O.deckKey(x.deck) + '|' + O.deckKey(y.deck);
  let d = P.decide([], [A, B], stub({[K(B, A)]: r(0.45, 400)}), {});
  ok(d.pro[0].deck === A.deck && d.pro.length === 2 && d.pro[1].h2h.elo === r(0.45, 400).elo, '2. first fill: PRO-1 is the newest optimum, the other within the band follows');
  d = P.decide([A], [B], stub({[K(B, A)]: r(0.56, 400)}), {});
  ok(O.deckKey(d.pro[0].deck) === O.deckKey(B.deck) && d.replaced.length === 1 && O.deckKey(d.pro[1].deck) === O.deckKey(A.deck), '2. 56% over 400 with the interval above 50%: replaced; the old PRO-1 stays as PRO-2 (within the band)');
  d = P.decide([A], [B], stub({[K(B, A)]: r(0.54, 400)}), {});
  ok(O.deckKey(d.pro[0].deck) === O.deckKey(A.deck) && !d.replaced.length, '2. 54% over 400: kept');
  d = P.decide([A], [B], stub({[K(B, A)]: r(0.56, 200)}), {});
  ok(O.deckKey(d.pro[0].deck) === O.deckKey(A.deck) && !d.replaced.length, '2. 56% over 200 games (fewer than the rule): kept');
  d = P.decide([A], [B], stub({[K(B, A)]: r(0.55, 400)}), {});
  ok(d.replaced.length === 1, '2. exactly 55% over 400: replaced (its interval ' + JSON.stringify(O.wilson(0.55, 400).map(x=> Math.round(x * 1000) / 1000)) + ' is above 50%)');
  d = P.decide([A], [B], stub({[K(B, A)]: r(0.56, 100)}), {games: 100});
  ok(!d.replaced.length, '2. with --games 100, 56% over 100: the interval reaches below 50%, kept (' + JSON.stringify(O.wilson(0.56, 100).map(x=> Math.round(x * 1000) / 1000)) + ')');
  d = P.decide([A], [B, C], stub({[K(B, A)]: r(0.35, 400), [K(C, A)]: r(0.4, 400)}), {});
  ok(d.pro.length === 2 && O.deckKey(d.pro[1].deck) === O.deckKey(C.deck), '2. the band: within 100 Elo kept, below it left out (' + r(0.35, 400).elo + ', ' + r(0.4, 400).elo + ')');
  const many = [1, 2, 3, 4, 5, 6].map(k=> ({deck: D(k), source: {}}));
  d = P.decide([A], many, stub({}), {});
  ok(d.pro.length === 4, '2. never more than 4 a map (' + d.pro.length + ')');
  const near = {deck: Object.assign({}, A.deck), source: {}}; { const ks = Object.keys(near.deck); near.deck[ks[0]]--; if(!near.deck[ks[0]]) delete near.deck[ks[0]]; near.deck.zz = 1; }
  d = P.decide([A], [near], stub({}), {});
  ok(d.pro.length === 1 && d.notes.some(x=> /copies from a kept PRO/.test(x)), '2. a deck 1 copy from PRO-1 is not a second PRO');
  d = P.decide([A, {deck: B.deck, source: {}, h2h: Object.assign({vs: O.deckKey(A.deck)}, r(0.47, 400))}], [], ()=>{ throw new Error('measured again'); }, {});
  ok(d.pro.length === 2 && d.pro[1].h2h.p === 0.47, '2. a kept PRO-2 keeps its measure while PRO-1 is the same deck (no games)'); }
// the real tool: a dry run writes nothing; --apply --out writes the file's shape; a pairing is seeded
{ const before = rd(FILE), tmp = path.join(os.tmpdir(), 'pro-test-' + process.pid + '.json');
  const out = cp.execFileSync(process.execPath, [path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js'), '--maps', '0', '--games', '4'], {cwd: ROOT, encoding: 'utf8'});
  ok(/dry run: nothing written/.test(out) && /0-PRO-1/.test(out) && /0-BPRO-1/.test(out) && rd(FILE) === before, '2. a dry run prints the plan (PRO and BPRO) and writes nothing');
  cp.execFileSync(process.execPath, [path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js'), '--maps', '0', '--games', '4', '--apply', '--out', tmp, '--quiet'], {cwd: ROOT, encoding: 'utf8'});
  const t = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.rmSync(tmp, {force: true});
  ok(t.maps.m1 && t.maps.m1.pro[0].id === '0-PRO-1' && t.maps.m1.field && t.rule.games === 4 && rd(FILE) === before, '2. --apply --out writes that file only');
  ok(t.maps.m1.bpro && t.maps.m1.bpro[0] && t.maps.m1.bpro[0].id === '0-BPRO-1', '2. --apply --out writes the BPRO list too (PRO2)');
  // 2026-10-24 (PRO2): an old PRO that breaks the map rule (the OPT2-era 0-PRO-3 with 2 Ents) is dropped to `replaced` with its reason
  { const old = JSON.parse(before), tmp2 = path.join(os.tmpdir(), 'pro-test-old-' + process.pid + '.json');
    old.maps.m1.pro = [{id: '0-PRO-1', name: '0-PRO-1', level: 1, leaders: [], deck: {'beetle-grunt': 5, 'duck-paddler': 4, ent: 2, 'feral-tomcat': 5, 'fox-kit': 1, 'honey-bee': 2, 'otter-guard': 1}, source: {file: 'old'}, h2h: null, later: []}];
    fs.writeFileSync(tmp2, JSON.stringify(old));
    cp.execFileSync(process.execPath, [path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js'), '--maps', '0', '--kind', 'pro', '--games', '4', '--apply', '--out', tmp2, '--quiet'], {cwd: ROOT, encoding: 'utf8'});
    const t2 = JSON.parse(fs.readFileSync(tmp2, 'utf8')); fs.rmSync(tmp2, {force: true});
    const dr = (t2.maps.m1.replaced || []).find(x=> x.kind === 'pro' && x.dropped && x.deck.ent);
    ok(dr && dr.dropped.some(x=> /^ent: rare is over the map's rarity cap \(common\)/.test(x)) && dr.dropped.some(x=> /^otter-guard: /.test(x)) && !t2.maps.m1.pro.some(e=> e.deck.ent) && t2.maps.m1.pro.length >= 1, '2. an old PRO with Ents is dropped by the map rule (reasons kept) and the map refilled from the map-true runs ' + JSON.stringify(dr && dr.dropped)); }
  ok(/--apply/.test(cp.execFileSync(process.execPath, [path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js'), '--help'], {encoding: 'utf8'})), '2. --help');
  const map = G.CONQUEST_MAPS.find(m=> m.id === 'mc'), f = P.averageField(gm, map), opts = Object.assign(P.parseArgs([]), {games: 6});
  const e = data.maps.mc.pro[0], runJ = JSON.parse(rd(e.source.file)), runOpt = runJ.optima || runJ.decks /* 2026-10-30 (DECK1): a DECK1 run lists `decks` */, other = (runOpt[1] || runOpt[0]).deck; // 2026-10-24 (PRO2): a short run may end with one optimum
  const m1 = P.makeH2H(gm, map, f, opts)(P.renameDeck(other, ren), e.deck), m2 = P.makeH2H(gm, map, f, opts)(P.renameDeck(other, ren), e.deck);
  ok(m1.n === 6 && JSON.stringify(m1) === JSON.stringify(m2), '2. a head-to-head pairing gives the same result twice (seeded) ' + JSON.stringify(m1)); }

// ---- 3. wiring
const app = rd('arena_app.js'), asm = rd('assemble_arena.py');
ok((app.match(/__PRO_SKIRMISHES__/g) || []).length === 1 && /__PRO_SKIRMISHES__/.test(asm) && /canonical\/pro-skirmishes\.json/.test(asm), '3. the build bakes canonical/pro-skirmishes.json in (one placeholder)');
ok(fs.existsSync(path.join(ROOT, 'index.html')) && /"0-PRO-1"/.test(rd('index.html')) && /"0-BPRO-1"/.test(rd('index.html')), '3. the built page has the PRO and BPRO fights (BPRO: 2026-10-25, PL2)');
// 2026-10-25 (PRO3): the key also takes a side map's own PRO fights (N-L-PRO-k, e.g. 2-B-PRO-1)
{ const re = new RegExp(app.match(/const PRO_KEY_RE = \/(.*?)\/;/)[1]); ok(re.test('3-PRO-1') && re.test('12-BPRO-4') && re.test('2-B-PRO-1') && re.test('20-A-BPRO-2') && !re.test('2-BB-PRO-1') && !re.test('PRO-1'), '3. PRO keys: N-PRO-k, N-BPRO-k and a side map\'s N-L-PRO-k (PRO3)'); }
ok(/function proEntriesOf\(ent\)\{ return ent \? \(ent\.pro \|\| \[\]\)\.concat\(ent\.bpro \|\| \[\]\)/.test(app) && /out\[mid\]\["bpro"\]/.test(asm), '3. N-BPRO-k keys, both kinds listed, the build bakes bpro (2026-10-25, PL2)');
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')), keys = ['ui.pro-title', 'ui.pro-admin-sub', 'ui.pro-fight', 'ui.pro-copy-link', 'ui.pro-link-copied', 'ui.pro-score', 'ui.pro-vs1', 'ui.pro-leader', 'ui.pro-editor', 'ui.pro-result', 'ui.pro-unknown', 'ui.pro-busy', 'ui.pro-tutorial-first', 'ui.pro-map', 'ui.pro-none'];
  const T = TXT.TEXT || (TXT.BramblewoodTexts && TXT.BramblewoodTexts.TEXT) || null, src = rd('bramblewood-texts.js');
  keys.forEach(k=>{ const m = new RegExp('"' + k.replace(/[.-]/g, '\\$&') + '": "([^"]+)"').exec(src); ok(!!m, '3. text ' + k);
    if(m) ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const pack = JSON.parse(rd('lang/' + c + '.json')); ok(typeof pack[m[1]] === 'string' && pack[m[1]].length > 0, `3. ${c}: "${m[1].slice(0, 30)}"`); }); });
  void T; }
{ const dec = JSON.parse(rd('docs/decisions.json')).items;
  const p1 = dec.find(x=> x.id === 'PRO-1'), p2 = dec.find(x=> x.id === 'PRO-2');
  ok(p1 && /Reveal PRO fights to players after a map's boss/.test(p1.title) && /^No/.test(p1.default), '3. owner call PRO-1: reveal after the boss, default No');
  ok(p2 && p2.default, '3. owner call PRO-2: a win\'s reward'); }
ok(/pro_skirmishes\.js --apply/.test(rd('docs/workflows/balance.md')) && /## PRO fights/.test(rd('docs/workflows/balance.md')), '3. the routine in docs/workflows/balance.md');
ok(/^## 2026-10-2[34] \(package PRO/m.test(rd('docs/CHANGELOG.md')), '3. CHANGELOG entry');
ok(/tests\/pro-2026-10-23\.js/.test(rd('tests/run-all.sh')) && /tests\/e2e\/pro_2026_10_23\.py/.test(rd('tests/run-all.sh')), '3. run-all.sh lists the test and its e2e');

// ---- 4. browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
    + "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  const open = async hash=>{ const ctx = await b.newContext({viewport: {width: 1366, height: 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT + "window.__proSetup = true;");
    // the deck: the tutorial's otters (a legal deck) before the deep link fires (load + 1.5 s)
    await pg.addInitScript("window.addEventListener('load', ()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current: 40, lastRegenAt: Date.now()}); }catch(e){ window.__setupErr = String(e); } });");
    await pg.goto(URL + (hash || ''), {waitUntil: 'domcontentloaded', timeout: 90000}); await pg.waitForTimeout(3500); return [ctx, pg]; };
  try{
    // ---- the deep link
    { const [ctx, pg] = await open('#pro=3-PRO-1');
      // 2026-10-25 (package PL2, PRO-UI): a PRO / BPRO click opens the fight's panel; its Fight button (#cnpFightBtn) starts it
      const pv = await pg.evaluate("({sel: conquestSelectedNodeKey, map: conquestSelectedMap, panel: !!document.querySelector('#conquestNodePanel:not([hidden]) #cnpFightBtn'), ms: !!matchState})");
      // (a player whose Map 3 is not open yet has no panel there to show: the link starts the fight as before, pl2ProPreview)
      ok((pv.sel === '3-PRO-1' && pv.map === 'mc' && pv.panel && !pv.ms) || pv.ms, '4. #pro=3-PRO-1 opens its fight panel first, or starts it on a map not open yet (PL2) ' + JSON.stringify(pv));
      if(!pv.ms){ await pg.click('#cnpFightBtn'); await pg.waitForTimeout(1500); }
      const r = await pg.evaluate("({ms: !!matchState, pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest), map: matchState && matchState.conquestNode && matchState.conquestNode.mapId, hash: location.hash, energy: currentEnergy(), err: window.__setupErr || null, lead: matchState && (matchState.players[2].reserveLeaders || []).slice(), ai: matchState && matchState.aiLevel})");
      ok(r.ms && r.pro === '3-PRO-1' && r.admin && r.map === 'mc', '4. #pro=3-PRO-1 starts that PRO fight of Map 3 ' + JSON.stringify(r));
      ok(r.hash === '' && r.energy === 40, '4. the link is cleared and the fight used no Energy ' + JSON.stringify({hash: r.hash, energy: r.energy}));
      ok(JSON.stringify(r.lead) === JSON.stringify(data.maps.mc.pro[0].leaders) && r.ai === 1, '4. its leader (the deck\'s showcase) and the Smart CPU ' + JSON.stringify({lead: r.lead, ai: r.ai}));
      await ctx.close(); }
    { const [ctx, pg] = await open();
      // ---- hidden from the road
      const road = await pg.evaluate("(async()=>{ const inNodes = CONQUEST_MAPS.some(m=> (m.nodes || []).some(n=> /PRO/.test(n.key) || n.pro)); playSubTab = 'conquest'; switchTab('play'); conquestSelectedMap = 'mc'; renderPlay(); await new Promise(r=> setTimeout(r, 700));"
        + " const els = [...document.querySelectorAll('[data-node-key],[data-key]')].map(e=> e.dataset.nodeKey || e.dataset.key); return {inNodes, onMap: els.filter(k=> /PRO/.test(k || '')), mapNodes: els.length, found: !!findConquestNode('mc', '3-PRO-1'), other: !!findConquestNode('mf', '3-PRO-1')}; })()");
      ok(!road.inNodes && !road.onMap.length && road.found && !road.other, '4. no map lists a PRO fight and none is drawn on the map; findConquestNode finds it on its own map only ' + JSON.stringify(road));
      // ---- the admin list
      const adm = await pg.evaluate("(async()=>{ switchTab('admin'); renderAdmin(); await new Promise(r=> setTimeout(r, 300)); const p = document.getElementById('adminProFights'); return {shown: !!p, rows: p ? [...p.querySelectorAll('.pro-row')].map(r=> r.dataset.proKey) : [], fights: p ? p.querySelectorAll('[data-pro-start]').length : 0, links: p ? p.querySelectorAll('[data-pro-copy]').length : 0}; })()");
      const all = [].concat(...Object.values(data.maps).map(m=> m.pro.concat(m.bpro || []).map(e=> e.id))); // + BPRO (2026-10-25, PL2)
      // 2026-10-25 (package PREF): each map also lists its X-REF fight (a row with Fight, no Copy link), last in the map's block
      const xrefs = Object.values(data.maps).map(m=> (m.pro.concat(m.bpro || [])[0] || {id: ''}).id.replace(/-B?PRO-\d+$/, '') + '-REF');
      ok(adm.shown && JSON.stringify(adm.rows.filter(k=> !/-REF$/.test(k))) === JSON.stringify(all) && JSON.stringify(adm.rows.filter(k=> /-REF$/.test(k))) === JSON.stringify(xrefs) && adm.fights === all.length + xrefs.length && adm.links === all.length, '4. Admin lists every PRO fight with Fight and Copy link, and each map\'s X-REF ' + JSON.stringify(adm));
      const before = await pg.evaluate("JSON.stringify({p: loadConquestProgress(), cur: myCurrencies, xp: (typeof loadXp === 'function' ? loadXp() : null), cards: (typeof myUnlockedCardIds !== 'undefined' ? [...myUnlockedCardIds].length : null), energy: currentEnergy()})");
      await pg.click('#adminProFights [data-pro-start="0-PRO-1"]'); await pg.waitForTimeout(900); await pg.click('#cnpFightBtn'); await pg.waitForTimeout(1200); // 2026-10-25 (package PL2, PRO-UI): a PRO / BPRO click opens the fight's panel; its Fight button (#cnpFightBtn) starts it
      const st = await pg.evaluate("({pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest), tab: currentTab, energy: currentEnergy()})");
      ok(st.pro === '0-PRO-1' && st.admin && st.tab === 'play' && st.energy === 40, '4. Admin\'s Fight starts 0-PRO-1, free ' + JSON.stringify(st));
      // ---- a won PRO fight pays nothing
      await pg.evaluate("(()=>{ window.__pro = matchState; matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; resolveRound(); })()");
      for(let i = 0; i < 60; i++){ if(await pg.evaluate("!!(window.__pro.over && document.getElementById('wlPrimaryBtn'))")) break; await pg.waitForTimeout(250); }
      await pg.waitForTimeout(1500);
      const after = await pg.evaluate("JSON.stringify({p: loadConquestProgress(), cur: myCurrencies, xp: (typeof loadXp === 'function' ? loadXp() : null), cards: (typeof myUnlockedCardIds !== 'undefined' ? [...myUnlockedCardIds].length : null), energy: currentEnergy()})");
      const res = await pg.evaluate("({won: __pro.winner === 1, note: (document.querySelector('.wl-pro-note') || {}).textContent || '', rank: __pro.conquestRankEarned || null, cards: __pro.conquestCardsEarned || [], reward: __pro.conquestRewardEarned || null, again: (document.getElementById('wlPrimaryBtn') || {outerHTML: ''}).outerHTML})");
      ok(res.won && /PRO fight/.test(res.note) && !res.rank && !res.cards.length && !res.reward, '4. the win shows the PRO note, no rank, no cards, no reward ' + JSON.stringify(Object.assign({}, res, {again: undefined})));
      ok(before === after, '4. progress, currencies, XP, cards and Energy are as they were ' + (before === after ? '' : before.slice(0, 300) + ' -> ' + after.slice(0, 300)));
      ok(!/data-energy-cost/.test(res.again), '4. Play again shows no Energy cost');
      await pg.click('#wlPrimaryBtn').catch(()=>{}); await pg.waitForTimeout(1200);
      const again = await pg.evaluate("({pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest), over: matchState && matchState.over, energy: currentEnergy()})");
      ok(again.pro === '0-PRO-1' && again.admin && !again.over && again.energy === 40, '4. Play again is the same free PRO fight ' + JSON.stringify(again));
      // ---- the skirmish editor's row
      const ed = await pg.evaluate("(async()=>{ endMatch(); switchTab('play'); openSkirmishEditor('mc', '3-2'); await new Promise(r=> setTimeout(r, 300)); const f = document.querySelector('#skirmishEditorOverlay .pro-editor'); return {shown: !!f, keys: f ? [...f.querySelectorAll('[data-pro-start]')].map(b=> b.dataset.proStart) : []}; })()");
      ok(ed.shown && JSON.stringify(ed.keys) === JSON.stringify(data.maps.mc.pro.concat(data.maps.mc.bpro || []).map(e=> e.id)), '4. the skirmish editor shows its map\'s PRO and BPRO fights ' + JSON.stringify(ed));
      await pg.click('#skirmishEditorOverlay [data-pro-start="3-PRO-1"]'); await pg.waitForTimeout(900); if(!(await pg.evaluate('!!matchState'))){ await pg.click('#cnpFightBtn'); await pg.waitForTimeout(1000); } /* (Map 3 not open yet for this player: it starts at once) */ // 2026-10-25 (package PL2, PRO-UI): a PRO / BPRO click opens the fight's panel; its Fight button (#cnpFightBtn) starts it
      const fromEd = await pg.evaluate("({pro: matchState && matchState.proFight, overlay: (document.getElementById('skirmishEditorOverlay') || {}).hidden})");
      ok(fromEd.pro === '3-PRO-1' && fromEd.overlay === true, '4. its Fight button closes the editor and starts the fight ' + JSON.stringify(fromEd));
      const unknown = await pg.evaluate("(()=>{ endMatch(); return startProFight('9-PRO-9'); })()");
      ok(unknown === false, '4. an unknown PRO key starts nothing');
      await ctx.close(); }
    ok(!errs.length, '4. no page errors ' + errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw', e && e.stack || e); }).then(()=>{
  console.log(fail ? `pro: ${fail}/${n} FAILED` : `pro: all ${n} passed`); process.exit(fail ? 1 : 0); });
