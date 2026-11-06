#!/usr/bin/env node
// Package PVP1 (2026-11-06, owner 20:28 #5): the 30 PvP test decks (canonical/pvp-test-decks.json, tools/pvp1/pvp1.js). Every deck legal
// under the PvP rule (bramblewood-ghosts.js validateDeck with its leader), in-play cards only, a valid leader, at most 10 copies shared by any
// two decks, the fields the owner asked for, the copy baked into arena_app.js up to date, the Simulator's picker wired, and the headless game
// deterministic (the same seed gives the same result). No search is run.
//   node tests/pvp1-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const P = require(path.join(ROOT, 'tools', 'pvp1', 'pvp1.js')), L = require(path.join(ROOT, 'tools', 'pvp1', 'lib.js'));
const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pvp-test-decks.json'), 'utf8'));
ok(P.check().length === 0, 'pvp1 check: decks legal, varied, baked');
ok(c.decks.length === 30 && new Set(c.decks.map(d => d.id)).size === 30, '30 decks with distinct ids');
c.decks.forEach(d => ok(d.name && d.leader && d.seed && typeof d.gauntletWin === 'number' && d.tribe && Object.values(d.cards).reduce((t, k) => t + k, 0) === 20, d.id + ': id, name, leader, 20 cards, seed, gauntlet win, tribe'));
ok(new Set(c.decks.map(d => d.tribe)).size >= 10, 'at least 10 different main tribes: ' + new Set(c.decks.map(d => d.tribe)).size);
ok(c.decks.every(d => d.code && d.code.startsWith('BWD1:') && JSON.parse(Buffer.from(d.code.slice(5), 'base64').toString('utf8')).l === d.leader), 'each deck has an importable deck code with its leader');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/data-pvp-test-deck="\$\{side\}"/.test(src) && /querySelectorAll\('\[data-pvp-test-deck\]'\)/.test(src), 'the Simulator deck builders offer the PvP test decks');
const a = { deck: c.decks[0].cards, leader: c.decks[0].leader }, b = { deck: c.decks[1].cards, leader: c.decks[1].leader };
ok(L.playRange(a, b, 'pvp1-test', 0, 4) === L.playRange(a, b, 'pvp1-test', 0, 4), 'the headless PvP game is deterministic');
console.log(`pvp1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
