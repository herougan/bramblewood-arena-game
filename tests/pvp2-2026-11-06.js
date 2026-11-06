#!/usr/bin/env node
// Package PVP2 (2026-11-06, owner 21:34: "pvp decks -> move them into the actual pvp matches"): the 30 PvP test decks are seeded PvP / Async
// strangers (bramblewood-ghosts.js registerPvpDecks), each with its leader, a stable identity and a stage from its gauntlet win rate; every
// hand-built themed deck is legal (Ashfall Legion kept Magma Salamander x3, over the Very Rare limit of 2); an illegal deck is filtered out.
//   node tests/pvp2-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const G = require(path.join(ROOT, 'bramblewood-ghosts.js'));
const defs = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')).forEach(c => { defs[c.id] = c; });
const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/pvp-test-decks.json'), 'utf8'));
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const isPv = g => /pvp1-/.test(g.id);
const names = () => JSON.stringify([3, 4, 5, 6].map(s => G.themedGhostsFor(defs, s, 0).filter(isPv).map(g => g.name)));

G.THEMED_GHOSTS.forEach(g => ok(!G.validateDeck(defs, g.deck).length, 'themed ' + g.id + ' is legal: ' + G.validateDeck(defs, g.deck).join('; ')));
ok(G.themedGhostsFor(defs, 4, 0).some(g => g.id === 'ashfall-legion'), 'Ashfall Legion is in the stage 4 pool');

ok(/Ghosts\.registerPvpDecks\(PVP_TEST_DECKS\)/.test(app), 'arena_app.js hands PVP_TEST_DECKS to the ghosts module');
ok(/data-pvp-test-deck="\$\{side\}"/.test(app), 'the Simulator picker still reads PVP_TEST_DECKS');
const baked = JSON.parse(app.slice(app.indexOf('/*PVP-TEST-DECKS-START*/') + 24, app.indexOf('/*PVP-TEST-DECKS-END*/')));
ok(baked.length === 30 && baked.every(d => typeof d.gauntletWin === 'number'), 'baked decks carry gauntletWin');
G.registerPvpDecks(baked);

const all = []; for (let s = 0; s <= 6; s++) G.themedGhostsFor(defs, s, 0).forEach(g => all.push(g));
const pv = all.filter(isPv);
ok(pv.length === 30, 'all 30 PvP decks enter the themed pools: ' + pv.length);
ok(new Set(pv.map(g => g.name)).size === 30, '30 distinct ghost names');
pv.forEach(g => { const d = c.decks.find(x => x.id === g.id);
  ok(g.leaders.length === 1 && g.leaders[0] === d.leader && !G.validateDeck(defs, g.deck, g.leaders).length, g.id + ': leader kept and legal');
  ok(g.stage === G.stageFromGauntlet(d.gauntletWin) && g.stage >= 3 && g.stage <= 6, g.id + ': stage ' + g.stage + ' from gauntlet ' + d.gauntletWin); });
const before = names(); G.registerPvpDecks(baked);
ok(before === names(), 'identities are stable across registrations');

// PvP strangers and the Async pool both carry them, with leaders, and every seeded deck passes validateDeck
let seen = 0;
for (let t = 0; t <= 5; t++) for (let e = 0; e < 5; e++) G.seedPvpStrangers(defs, t, 8, e).forEach(g => {
  if (isPv(g)) { seen++; ok(g.leaders.length === 1, g.id + ' stranger has its leader'); }
  ok(!G.validateDeck(defs, g.deck, g.leaders).length, 'tier ' + t + ' ' + g.id + ' legal'); });
ok(seen > 0, 'PvP strangers include test decks: ' + seen);
let asyncSeen = 0;
for (let s = 0; s <= 6; s++) G.buildStagePool(defs, s, [], 0, {}).decks.forEach(g => { if (isPv(g)) asyncSeen++; ok(!G.validateDeck(defs, g.deck, g.leaders).length, 'async stage ' + s + ' ' + g.id + ' legal'); });
ok(asyncSeen > 0, 'the Async pools include test decks: ' + asyncSeen);

// an illegal deck is filtered; a recorded real ghost is never replaced
G.registerPvpDecks([{id: 'bad', name: 'Bad', leader: 'old-shell', cards: Object.assign({}, c.decks[0].cards, {'field-vole': 9}), gauntletWin: 75}]);
ok(!G.themedGhostsFor(defs, 5, 0).some(g => /bad/.test(g.id)), 'an over-cap deck is filtered out');
G.registerPvpDecks(baked);
const rec = Array.from({length: 12}, (_, i) => ({owner: 'p' + i, stage: 4, at: 1e12, deck: G.generateGhostDeck(defs, 4, i), leaders: []}));
const pool = G.buildStagePool(defs, 4, rec, 1e12, {});
ok(pool.real === 12 && pool.seeded === 0, 'recorded real ghosts still fill the pool first');
console.log(`pvp2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
