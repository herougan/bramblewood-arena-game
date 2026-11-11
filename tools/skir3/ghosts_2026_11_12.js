#!/usr/bin/env node
// 2026-11-12 (package SKIR3): the themed PvP / Async Arena ghost decks (bramblewood-ghosts.js THEMED_GHOSTS: "Every card is one a player can own")
// that hold a card out of play (tools/lib_map_pools.js isOutOfPlay: on no map list, no other source; most since the 11-12 lists, some before): each
// such card's copies go to the in-play card nearest it that shares an archetype with it (else with the deck), not in the deck yet: the same rarity
// first, then the closest stat score (skirmishCardScore); within the rarity's copy cap (a lower cap gives its spare copies to the deck's own cards).
// Deck size and stage kept; not re-measured.   node tools/skir3/ghosts_2026_11_12.js [--apply]   -> bramblewood-ghosts.js, docs/balance/skir3/ghosts-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), FILE = path.join(ROOT, 'bramblewood-ghosts.js');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js'), GH = require(FILE);
let src = fs.readFileSync(FILE, 'utf8');
const RANK = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'legendary', 'mythic'], rk = r => Math.max(0, RANK.indexOf(r));
const out = id => !D[id] || LP.isOutOfPlay(G, D[id]);
const owned = id => { const d = D[id]; return d && !d.token && !d.test && !d.pool && !d.hero && !d.easterEgg && !d.raid && !d.awaitingSource && !d.hidden && !d.darkSummon && d.cardType !== 'materia' && d.cardType !== 'equipment' && d.cardType !== 'spell' && !out(id) && !G.isUnattainable(d); };
const POOL = Object.keys(D).filter(owned), score = id => G.skirmishCardScore(D[id] || {}), cap = id => G.maxCopiesForRarity((D[id] || {}).rarity);
const arch = id => new Set((D[id] || {}).archetypes || []);
const rows = [];
const THEMED = (src.match(/const THEMED_GHOSTS = \[([\s\S]*?)\n\];/) || [])[1] || '';
for (const line of THEMED.split('\n').filter(l => /deck:\{/.test(l))) {
  const deck = JSON.parse(line.match(/deck:(\{[^}]*\})/)[1]), bad = Object.keys(deck).filter(out); if (!bad.length) continue;
  const id = (THEMED.split('\n')[THEMED.split('\n').indexOf(line) - 1].match(/id:'([^']+)'/) || [])[1];
  const deckArch = new Set([].concat(...Object.keys(deck).filter(x => !out(x)).map(x => [...arch(x)])));
  const d = Object.assign({}, deck), moves = [];
  for (const b of bad) { const k = d[b]; delete d[b]; const ba = arch(b);
    const shares = x => [...arch(x)].some(a => ba.has(a)) ? 2 : [...arch(x)].some(a => deckArch.has(a)) ? 1 : 0;
    const c = POOL.filter(x => !d[x] && x !== b && shares(x) > 0).sort((p, q) => shares(q) - shares(p) || Math.abs(rk(D[p].rarity) - rk(D[b].rarity)) - Math.abs(rk(D[q].rarity) - rk(D[b].rarity)) || Math.abs(score(p) - score(b)) - Math.abs(score(q) - score(b)) || (p < q ? -1 : 1));
    const to = c[0]; if (!to) { moves.push(`${b} x${k}: no in-play card shares its archetype`); d[b] = k; continue; }
    d[to] = Math.min(k, cap(to)); let left = k - d[to];
    for (const x of Object.keys(d)) while (left > 0 && d[x] < cap(x) && !out(x)) { d[x]++; left--; }
    moves.push(`${b} x${k} -> ${to} x${d[to]}` + (k - d[to] > 0 ? ` (+${k - d[to]} to the deck's own)` : '')); }
  const total = Object.values(d).reduce((t, x) => t + x, 0);
  rows.push({ id, before: deck, after: d, moves, total }); console.log(`${id}: ${moves.join('; ')} (${total} cards)`);
  if (process.argv.includes('--apply') && total === Object.values(deck).reduce((t, x) => t + x, 0)) {
    src = src.replace(line, line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(d)) + ` // 2026-11-12 (SKIR3): ${bad.join(', ')} out of play on the 11-12 lists (or before): ${moves.join('; ')}`);
  }
}
if (process.argv.includes('--apply')) { fs.writeFileSync(FILE, src); fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'ghosts-2026-11-12.json'), JSON.stringify({ about: 'SKIR3 themed ghost deck swaps (tools/skir3/ghosts_2026_11_12.js)', rows }, null, 1) + '\n'); }
console.log(rows.length, 'decks', process.argv.includes('--apply') ? 'written' : '(dry run)');
