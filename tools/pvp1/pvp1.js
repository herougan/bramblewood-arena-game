#!/usr/bin/env node
// 2026-11-06 (package PVP1, owner 20:28 #5: "PVP: Create more varied decks (Slightly optimised) for my experimentation. Create 30 decks.
// Maybe one method is you pick 25 random cards, then optimise a selection of 7 random cards + leader."): 30 varied, slightly optimised
// PvP test decks.
//   node tools/pvp1/pvp1.js build [--workers 2]   search the 30 decks, play the round robin, write canonical/pvp-test-decks.json,
//                                                 docs/balance/pvp1-2026-11-06.json (raw) and .md
//   node tools/pvp1/pvp1.js apply                 bake the decks into arena_app.js (PVP_TEST_DECKS, the Simulator's picker); rebuild after
//   node tools/pvp1/pvp1.js check                 every deck legal, varied, and the baked copy up to date (exit 1 otherwise)
// Each deck (games: tools/pvp1/lib.js, Standard PvP at Level 1, both seats the CPU, leaders dealt):
//   1. seed: 25 different in-play cards, a pure function of the deck's seed ("pvp1-<k>"); deck k draws up to 10 of them from its anchor tribe
//      (the pool's tribes with 8+ cards, one each, most cards first; the last two decks are pure random draws), the rest from the whole pool;
//   2. core: the best 7 of the 25 (4 random cores, then 8 one-card swaps, first improvement), each played as a 20-card deck of those 7 within
//      the copy caps; 3. fill: 10 moves of 2 copies from a deck card to one of the other 18 (or back), first improvement;
//   4. leader: every valid leader the deck allows, by successive halving (1, then 2, then 4 games an opponent); 5. a fresh final measure.
//   Every candidate plays the same seeded games against each gauntlet deck (common random numbers): 2 games an opponent in steps 2-3.
// The gauntlet: the strongest seeded PvP strangers (bramblewood-ghosts.js THEMED_GHOSTS, stages 4-6), Reference-2 (the owner's deck, with
// its leader) and the late maps' PRO-1 decks (canonical/pro-skirmishes.json), each as PvP deals it. Variety: two decks share at most 10 of
// their 20 copies (else the later deck re-seeds).
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const ROOT = L.ROOT, OUT = path.join(ROOT, 'canonical', 'pvp-test-decks.json'), RAW = path.join(ROOT, 'docs', 'balance', 'pvp1-2026-11-06.json'), MD = path.join(ROOT, 'docs', 'balance', 'pvp1-2026-11-06.md');
const APP = path.join(ROOT, 'arena_app.js'), MARK_A = '/*PVP-TEST-DECKS-START*/', MARK_B = '/*PVP-TEST-DECKS-END*/';
const N_DECKS = 30, SEED_CARDS = 25, CORE = 7, ANCHOR_MAX = 10, MAX_SHARED = 10, DECK = 20;
const SEARCH_G = 2, FINAL_G = 8, RR_G = 20; // games an opponent: search, final, round robin a pairing
const total = d => Object.values(d).reduce((t, k) => t + k, 0);
const shared = (a, b) => Object.keys(a).reduce((t, id) => t + Math.min(a[id], b[id] || 0), 0);
const rng = s => { const r = L.O.mulberry(L.fnv(s)); return () => r.next(); };
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuffle = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = v => Math.round(v * 1000) / 10;

// ---------------------------------------------------------------- the gauntlet
function gauntlet() {
  const out = [], add = (id, label, deck, leader) => { if (!L.validate(deck, leader).length) out.push({ id, label, deck, leader: leader || null }); else console.log('  gauntlet: skipped ' + id + ' (' + L.validate(deck, leader).join('; ') + ')'); };
  L.Ghosts.THEMED_GHOSTS.filter(g => g.stage >= 4).forEach(g => add('ghost:' + g.id, g.name + ' (PvP stranger, stage ' + g.stage + ')', g.deck, null));
  const ref2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'ref', 'ref2-owner-main-deck-2026-10-25.json'), 'utf8'));
  add('ref2', 'Reference-2 (the owner\'s Ant Deck)', ref2.counts, ref2.leader);
  const pro = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps, valid = new Set(L.leaders());
  ['m11', 'm21', 'm22', 'm23', 'm24'].forEach(m => { const p = pro[m] && (pro[m].pro || [])[0]; if (!p) return;
    const ld = (p.leaders || []).find(id => valid.has(id) && !p.deck[id]) || null; add('pro:' + p.id, p.id + ' (' + pro[m].name + ')', p.deck, ld); });
  return out;
}

// ---------------------------------------------------------------- deck shapes
// a 20-card deck of `cards` (round robin within the copy caps, the leader's rank counted); null when they cannot fill 20
function fillDeck(gm, cards, leader) {
  const d = {}; let n = 0, moved = true;
  while (n < DECK && moved) { moved = false; for (const id of cards) { if (n >= DECK) break; if (canAdd(gm, d, id, leader)) { d[id] = (d[id] || 0) + 1; n++; moved = true; } } }
  return n === DECK ? d : null;
}
function canAdd(gm, deck, id, leader) { if ((deck[id] || 0) >= gm.G.maxCopiesForRarity(gm.D[id].rarity)) return false; try { return !gm.Budget.deckRankBlock(deck, id, gm.D, leader ? [leader] : []); } catch (e) { return true; } }
// move up to 2 copies from one deck card to `to` (from keeps 1 copy when it is a core card)
function moveCopies(gm, deck, from, to, core) {
  const d = Object.assign({}, deck); let k = 0;
  for (let i = 0; i < 2; i++) { const keep = core.includes(from) ? 1 : 0; if ((d[from] || 0) <= keep) break; d[from]--; if (!d[from]) delete d[from]; if (!canAdd(gm, d, to, null)) { d[from] = (d[from] || 0) + 1; break; } d[to] = (d[to] || 0) + 1; k++; }
  return k ? d : null;
}
// the deck's main tribe (the archetype with most copies; biomes count too) and a word for its curve
function labelOf(gm, deck) {
  const D = gm.D, t = {}; Object.keys(deck).forEach(id => (D[id].archetypes || []).forEach(a => t[a] = (t[a] || 0) + deck[id]));
  const tribe = Object.keys(t).sort((a, b) => t[b] - t[a] || (a < b ? -1 : 1))[0] || 'Mixed';
  const avg = Object.keys(deck).reduce((s, id) => s + (D[id].cost || 0) * deck[id], 0) / DECK, free = Object.keys(deck).reduce((s, id) => s + (D[id].cost ? 0 : deck[id]), 0);
  const shape = free >= 14 ? 'Swarm' : avg >= 1.2 ? 'Heavy' : avg >= 0.8 ? 'Midrange' : 'Tempo';
  const lead = Object.keys(deck).sort((a, b) => deck[b] - deck[a] || (a < b ? -1 : 1))[0];
  return { tribe, tribeCopies: t[tribe] || 0, shape, avgCost: Math.round(avg * 100) / 100, name: tribe + ' ' + shape + ': ' + D[lead].name };
}

// ---------------------------------------------------------------- scoring
async function score(pool, cand, opps, key, games, from) {
  const res = await pool.run(opps.map(o => ({ a: cand, b: { deck: o.deck, leader: o.leader }, key: key + '|' + o.id, from: from || 0, to: (from || 0) + games })));
  return { mean: res.reduce((t, s) => t + s, 0) / (games * opps.length), per: res.map(s => s / games) };
}

async function buildDeck(pool, gm, k, anchor, taken, opps, log) {
  const D = gm.D, all = L.pool();
  for (let attempt = 0; attempt < 6; attempt++) {
    const seed = 'pvp1-' + String(k).padStart(2, '0') + (attempt ? '-r' + attempt : ''), r = rng(seed);
    const tribeCards = anchor ? shuffle(r, all.filter(id => (D[id].archetypes || []).includes(anchor))).slice(0, ANCHOR_MAX) : [];
    const seedCards = tribeCards.concat(shuffle(r, all.filter(id => !tribeCards.includes(id))).slice(0, SEED_CARDS - tribeCards.length)).sort();
    const key = seed, ev = async (deck, leader) => (await score(pool, { deck, leader: leader || null }, opps, key, SEARCH_G)).mean;
    // 2. the core of 7
    let best = null;
    for (let i = 0; i < 4; i++) { const core = shuffle(r, seedCards).slice(0, CORE), deck = fillDeck(gm, core, null); if (!deck) continue; const s = await ev(deck); if (!best || s > best.s) best = { core, deck, s }; }
    if (!best) continue;
    for (let i = 0; i < 8; i++) { const out = pick(r, best.core), into = pick(r, seedCards.filter(id => !best.core.includes(id))), core = best.core.map(id => id === out ? into : id), deck = fillDeck(gm, core, null);
      if (!deck) continue; const s = await ev(deck); if (s > best.s) best = { core, deck, s }; }
    // 3. the fill from the other 18
    const rest = seedCards.filter(id => !best.core.includes(id));
    for (let i = 0; i < 10; i++) { const from = pick(r, Object.keys(best.deck)), to = pick(r, r() < 0.75 ? rest : best.core), deck = from === to ? null : moveCopies(gm, best.deck, from, to, best.core);
      if (!deck) continue; const s = await ev(deck); if (s > best.s) best = Object.assign({}, best, { deck, s }); }
    // 4. the leader (successive halving over every leader the deck allows)
    let field = L.leaders().filter(id => !best.deck[id] && !L.validate(best.deck, id).length).map(id => ({ id, sum: 0, n: 0 }));
    for (const [games, keep] of [[1, 5], [2, 2], [4, 1]]) {
      for (const c of field) { const s = await score(pool, { deck: best.deck, leader: c.id }, opps, key + '|lead', games, c.n); c.sum += s.mean * games; c.n += games; }
      field = field.sort((a, b) => b.sum / b.n - a.sum / a.n).slice(0, keep);
    }
    const leader = field.length ? field[0].id : null;
    if (L.validate(best.deck, leader).length) throw new Error(seed + ': illegal deck ' + L.validate(best.deck, leader).join('; '));
    const clash = taken.find(t => shared(t.cards, best.deck) > MAX_SHARED);
    if (clash) { log(`  ${seed}: shares ${shared(clash.cards, best.deck)} copies with ${clash.id}, re-seeding`); continue; }
    // 5. a fresh measure for the record
    const fin = await score(pool, { deck: best.deck, leader }, opps, key + '|final', FINAL_G);
    const lab = labelOf(gm, best.deck);
    return { id: 'pvp1-' + String(k).padStart(2, '0'), name: lab.name, leader, cards: best.deck, seed, anchor: anchor || 'random', tribe: lab.tribe, shape: lab.shape, avgCost: lab.avgCost,
      gauntletWin: pct(fin.mean), perOpponent: Object.fromEntries(opps.map((o, i) => [o.id, pct(fin.per[i])])), seedCards, core: best.core.slice().sort() };
  }
  throw new Error('deck ' + k + ': no varied deck in 6 seeds');
}

const deckCode = d => 'BWD1:' + Buffer.from(JSON.stringify({ n: d.name.slice(0, 40), c: 'castle', l: d.leader, d: d.cards }), 'utf8').toString('base64'); // arena_app.js encodeDeckCode

async function build(o) {
  const t0 = Date.now(), log = s => console.log(s), gm = L.game(), D = gm.D, all = L.pool(), opps = gauntlet();
  const tribes = {}; all.forEach(id => (D[id].archetypes || []).forEach(a => tribes[a] = (tribes[a] || 0) + 1));
  const anchors = Object.keys(tribes).filter(a => tribes[a] >= 8).sort((a, b) => tribes[b] - tribes[a] || (a < b ? -1 : 1)).slice(0, N_DECKS - 2);
  while (anchors.length < N_DECKS) anchors.push(null);
  log(`PVP1: ${all.length} in-play cards, ${L.leaders().length} leaders, ${opps.length} gauntlet decks, ${o.workers} workers`);
  const pool = new L.Pool(o.workers), decks = [];
  for (let k = 1; k <= N_DECKS; k++) { const d = await buildDeck(pool, gm, k, anchors[k - 1], decks, opps, log); decks.push(d);
    log(`  ${d.id} ${d.name} | ${d.leader} | gauntlet ${d.gauntletWin}% | ${Math.round((Date.now() - t0) / 1000)} s, ${pool.games} games`); }
  const searchGames = pool.games;
  // the round robin: every pair, RR_G games, seats swapped
  const jobs = []; for (let i = 0; i < decks.length; i++) for (let j = i + 1; j < decks.length; j++) jobs.push({ a: { deck: decks[i].cards, leader: decks[i].leader }, b: { deck: decks[j].cards, leader: decks[j].leader }, key: 'pvp1-rr|' + decks[i].id + '|' + decks[j].id, from: 0, to: RR_G, i, j });
  const res = await pool.run(jobs.map(({ a, b, key, from, to }) => ({ a, b, key, from, to }))); pool.close();
  const M = decks.map(() => decks.map(() => null)); jobs.forEach((jb, x) => { M[jb.i][jb.j] = res[x] / RR_G; M[jb.j][jb.i] = 1 - res[x] / RR_G; });
  decks.forEach((d, i) => { const v = M[i].filter(x => x != null); d.fieldWin = pct(v.reduce((t, x) => t + x, 0) / v.length); d.code = deckCode(d); });
  const minShared = []; for (let i = 0; i < decks.length; i++) for (let j = i + 1; j < decks.length; j++) minShared.push(shared(decks[i].cards, decks[j].cards));
  const meta = { version: '1.0.0 (2026-11-06, PVP1)', tool: 'node tools/pvp1/pvp1.js build --workers ' + o.workers, built: new Date().toISOString().slice(0, 10),
    rules: 'Standard PvP: 20 cards, rarity copy caps and top-rank caps with the leader counted (bramblewood-ghosts.js validateDeck), every card at Level 1, the Standard ruleset (day / night cycle), brambles 15 Health, +1 Shield for the second seat, both seats the CPU (skill 1), leaders dealt (G.dealPlayerLeader), seats swapped every other game',
    gauntlet: opps.map(g => ({ id: g.id, label: g.label, leader: g.leader })), search: { seedCards: SEED_CARDS, core: CORE, gamesAnOpponent: SEARCH_G, finalGames: FINAL_G * opps.length, searchGames },
    roundRobin: { gamesAPairing: RR_G, games: jobs.length * RR_G }, maxSharedCopies: Math.max(...minShared), seconds: Math.round((Date.now() - t0) / 1000) };
  const canon = Object.assign({ about: 'PvP test decks for the owner\'s experiments (package PVP1, owner 2026-11-06 20:28 #5). Each: 25 seeded in-play cards, the best core of 7 and a fill from the other 18, and the best leader, by a modest search against the gauntlet. gauntletWin: the final measure against the gauntlet (%); fieldWin: the mean against the other 29 in the round robin (%). code: a deck code for Camp > Import. Built and baked into the game (the Simulator\'s picker) by tools/pvp1/pvp1.js.' }, meta,
    { decks: decks.map(d => ({ id: d.id, name: d.name, leader: d.leader, cards: d.cards, seed: d.seed, gauntletWin: d.gauntletWin, fieldWin: d.fieldWin, tribe: d.tribe, shape: d.shape, anchor: d.anchor, avgCost: d.avgCost, code: d.code })) });
  fs.writeFileSync(OUT, JSON.stringify(canon, null, 1) + '\n');
  fs.writeFileSync(RAW, JSON.stringify(Object.assign({}, meta, { decks, matrix: { ids: decks.map(d => d.id), win: M.map(r => r.map(x => x == null ? null : pct(x))) } }), null, 1) + '\n');
  fs.writeFileSync(MD, report(canon, decks, M, opps));
  log(`wrote ${path.relative(ROOT, OUT)}, ${path.relative(ROOT, RAW)}, ${path.relative(ROOT, MD)} in ${meta.seconds} s (${searchGames} search games, ${meta.roundRobin.games} round-robin games)`);
}

function report(c, decks, M, opps) {
  const D = L.game().D, nm = id => id ? (D[id] || {}).name || id : 'none';
  const byField = decks.slice().sort((a, b) => b.fieldWin - a.fieldWin), over = byField.filter(d => d.fieldWin > 70);
  const vs = (i, best) => { const r = M[i].map((x, j) => [x, j]).filter(e => e[0] != null).sort((a, b) => best ? b[0] - a[0] : a[0] - b[0])[0]; return decks[r[1]].id + ' ' + pct(r[0]) + '%'; };
  const rows = decks.map((d, i) => `| ${d.id} | ${d.name} | ${nm(d.leader)} | ${d.tribe} | ${d.shape} (${d.avgCost}) | ${Object.keys(d.cards).length} | ${d.gauntletWin}% | ${d.fieldWin}% | ${vs(i, true)} | ${vs(i, false)} | \`${d.seed}\` |`);
  return `# PVP1: 30 PvP test decks (2026-11-06)

Owner 2026-11-06 20:28 #5: "PVP: Create more varied decks (Slightly optimised) for my experimentation. Create 30 decks." Data: \`canonical/pvp-test-decks.json\` (raw results and the full win matrix: \`docs/balance/pvp1-2026-11-06.json\`). Tool: \`node tools/pvp1/pvp1.js build --workers 2\`, then \`apply\` (bakes them into the game) and \`check\`.

**In the game:** Camp > Simulator (Admin): each deck builder has a "PvP test deck" picker that loads one into Deck A or B (the Simulator plays without leaders). To play one yourself in PvP, paste its \`code\` from the JSON into Camp > Import; it becomes your deck with its leader.

**How:** each deck seeds 25 different in-play cards from its seed (up to 10 from its anchor tribe, the rest from the whole pool of ${L.pool().length}; the last two are pure random), picks the best core of 7 (4 random cores + 8 swaps), fills from the other 18 (10 moves of 2 copies), then the best of the ${L.leaders().length} valid leaders by successive halving. Search: ${c.search.gamesAnOpponent} games an opponent a candidate, ${c.search.searchGames} games in all (about ${Math.round(c.search.searchGames / decks.length)} a deck); then ${c.search.finalGames} fresh games a deck for the gauntlet win. Games: ${c.rules}.

**Gauntlet (${opps.length}):** ${opps.map(g => g.label + (g.leader ? ' + ' + nm(g.leader) : '')).join('; ')}.

**Variety:** the most copies any two decks share is ${c.maxSharedCopies} of 20 (limit ${MAX_SHARED}).

## Round robin (${c.roundRobin.gamesAPairing} games a pairing, ${c.roundRobin.games} games)
- Best: ${byField.slice(0, 3).map(d => `${d.id} ${d.name} (${nm(d.leader)}) ${d.fieldWin}%`).join('; ')}.
- Worst: ${byField.slice(-3).reverse().map(d => `${d.id} ${d.name} (${nm(d.leader)}) ${d.fieldWin}%`).join('; ')}.
- Over 70% against the field: ${over.length ? over.map(d => `${d.id} ${d.fieldWin}%`).join(', ') : 'none'}.
- Spread: field win ${byField[byField.length - 1].fieldWin}% to ${byField[0].fieldWin}%, gauntlet win ${Math.min(...decks.map(d => d.gauntletWin))}% to ${Math.max(...decks.map(d => d.gauntletWin))}%.

| Id | Name | Leader | Main tribe | Shape (avg Lumber) | Cards | Gauntlet | Field | Best matchup | Worst matchup | Seed |
|---|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

Field: the deck's mean win against the other 29. A 20-game pairing has a 95% interval of about ±22 points, so single matchups are rough; the field and gauntlet means (580 and ${c.search.finalGames} games) are the numbers to read.
`;
}

// ---------------------------------------------------------------- bake / check
function baked() { const c = JSON.parse(fs.readFileSync(OUT, 'utf8')); return c.decks.map(d => ({ id: d.id, name: d.name, leader: d.leader, cards: d.cards })); }
function apply() {
  const src = fs.readFileSync(APP, 'utf8'), a = src.indexOf(MARK_A), b = src.indexOf(MARK_B);
  if (a < 0 || b < a) throw new Error('arena_app.js: no ' + MARK_A + ' .. ' + MARK_B + ' block');
  fs.writeFileSync(APP, src.slice(0, a + MARK_A.length) + JSON.stringify(baked()) + src.slice(b));
  console.log('baked ' + baked().length + ' decks into arena_app.js; rebuild: python3 assemble_arena.py && mv bramblewood-arena.html index.html');
}
function check() {
  const c = JSON.parse(fs.readFileSync(OUT, 'utf8')), errs = [], D = L.game().D, leaders = new Set(L.leaders()), inPlay = new Set(L.pool());
  if (c.decks.length !== N_DECKS) errs.push(c.decks.length + ' decks, want ' + N_DECKS);
  c.decks.forEach(d => { L.validate(d.cards, d.leader).forEach(e => errs.push(d.id + ': ' + e));
    if (!leaders.has(d.leader)) errs.push(d.id + ': leader ' + d.leader + ' is not a valid leader');
    Object.keys(d.cards).forEach(id => { if (!inPlay.has(id)) errs.push(d.id + ': ' + id + ' is not an in-play card'); });
    ['id', 'name', 'seed', 'gauntletWin', 'tribe'].forEach(f => { if (d[f] == null) errs.push(d.id + ': no ' + f); }); });
  for (let i = 0; i < c.decks.length; i++) for (let j = i + 1; j < c.decks.length; j++) { const s = shared(c.decks[i].cards, c.decks[j].cards); if (s > MAX_SHARED) errs.push(`${c.decks[i].id} and ${c.decks[j].id} share ${s} copies`); }
  const src = fs.readFileSync(APP, 'utf8'), a = src.indexOf(MARK_A), b = src.indexOf(MARK_B);
  if (a < 0 || src.slice(a + MARK_A.length, b) !== JSON.stringify(baked())) errs.push('arena_app.js PVP_TEST_DECKS is not up to date: node tools/pvp1/pvp1.js apply');
  errs.forEach(e => console.log('  ✗ ' + e)); console.log(errs.length ? errs.length + ' problems' : 'pvp1 check: ' + c.decks.length + ' decks legal, varied, baked');
  return errs;
}

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2), wi = rest.indexOf('--workers'), workers = wi >= 0 ? +rest[wi + 1] : 2;
  if (cmd === 'build') build({ workers }).catch(e => { console.error(e); process.exit(1); });
  else if (cmd === 'apply') apply();
  else if (cmd === 'check') process.exit(check().length ? 1 : 0);
  else { console.log('usage: node tools/pvp1/pvp1.js build [--workers 2] | apply | check'); process.exit(2); }
}
module.exports = { check, shared, gauntlet, MAX_SHARED, N_DECKS };
