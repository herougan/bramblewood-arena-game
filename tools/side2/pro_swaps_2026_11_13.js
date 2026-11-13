#!/usr/bin/env node
// 2026-11-13 (package SIDE2): PRO / BPRO / WPRO decks that hold a card SIDE1's side lists made late (16-PRO-4 Alpine Swift, 18-PRO-2 Apollo
// Butterfly: The Aerie Vault's list no longer holds them, so they are first obtainable on Map 21 and break the map-true rule). LISTFIX3's swap
// (tools/listfix3/decks_2026_11_11.js pro: those copies to the map list's nearest card by Lumber, Wait, 2A+H and rarity; not re-searched), run
// unchanged but for the mark (x.side2) and the record (docs/balance/side2/pro-swaps-2026-11-13.json).
//   node tools/side2/pro_swaps_2026_11_13.js pro [--apply]
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const FILE = path.join(__dirname, '..', 'listfix3', 'decks_2026_11_11.js');
let src = fs.readFileSync(FILE, 'utf8');
const swaps = [
  ["x.listfix3 = `2026-11-11 (LISTFIX3): ${moves.map(v => v.cut + ' x' + v.copies).join(', ')} not allowed here once the cut cards left the lists Claude had put them on (out of play, or not held by this map), swapped for the map list's nearest (Lumber, Wait, 2A+H); not re-searched`;",
   "x.side2 = `2026-11-13 (SIDE2): ${moves.map(v => v.cut + ' x' + v.copies).join(', ')} not allowed here once SIDE1's side lists took them off the side list that made them obtainable in time, swapped for the map list's nearest (Lumber, Wait, 2A+H; LISTFIX3's swap); not re-searched`;"],
  ["const REC = path.join(OUT, 'pro-swaps-2026-11-11.json');", "const REC = path.join(ROOT, 'docs', 'balance', 'side2', 'pro-swaps-2026-11-13.json');"],
  ["about: 'LISTFIX3 PRO / BPRO / WPRO swaps (tools/listfix3/decks_2026_11_11.js pro)'", "about: 'SIDE2 PRO / BPRO / WPRO swaps (tools/side2/pro_swaps_2026_11_13.js running LISTFIX3\\'s pro swap)'"],
  // round 2 (after LIST1): a card LIST1 holds on SPECIAL only for the old fights (the owner dropped it) is swapped out too, and never swapped in
  ["const bad = id => (DD[id] && LP.isOutOfPlay(GG, DD[id])) ||", "const HELD = require(path.join(ROOT, 'tools', 'side2', 'holds_2026_11_13.js')).held; const bad = id => HELD.has(id) || (DD[id] && LP.isOutOfPlay(GG, DD[id])) ||"],
  ["not allowed here once SIDE1's side lists took them off the side list that made them obtainable in time,", "not allowed here once SIDE1's side lists or LIST1's fold of the owner's 11-13 picks took them off (late, out of play, or held on SPECIAL only for the old fights),"],
  // and no Stone card swapped in before Map 21 (Pumice Beetle sits on Map 20's list by the owner's pick, open as LIST1-3)
  ["const opts = cand.filter(c => DD[c] && !bad(c) &&", "const opts = cand.filter(c => DD[c] && !bad(c) && !(M.stone(DD[c]) && GG.mapNumberOf(mid) < 21) &&"],
];
for (const [a, b] of swaps) { if (!src.includes(a)) throw new Error('LISTFIX3 tool changed: ' + a.slice(0, 60)); src = src.split(a).join(b); }
const m = new Module(FILE, module); m.filename = FILE; m.paths = Module._nodeModulePaths(path.dirname(FILE));
process.mainModule = m; require.main = m; m._compile(src, FILE);
