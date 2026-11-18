#!/usr/bin/env node
// Package DATAFIX (2026-11-18), step 5: the Map reference decks (WINRATE_REF_DECKS in arena_app.js) hold no cut card (bal9 JJ24). The reward moves released
// 8 old rewards to "no list"; the reference decks that held them swap those copies to ONE card of the map's own list (MAP + SPECIAL) nearest by stat score,
// inside the map's rarity cap and the card's copy cap, a card the deck already holds first, the K14 rule not applied (a reference deck is not a fight).
//   node tools/datafix5_2026_11_18.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
process.chdir(ROOT);
const LB = require('./lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LP = require('./lib_map_pools.js');
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8');
const m = s.match(/const WINRATE_REF_DECKS = (\{.*\});\n/); const W = JSON.parse(m[1]);
if (JSON.stringify(W) !== m[1]) throw new Error('WINRATE_REF_DECKS is not in JSON.stringify form');
const score = id => G.skirmishCardScore(D[id] || {}), isCut = id => !!D[id] && LP.isOutOfPlay(G, D[id]);
const out = [];
Object.entries(W.road).forEach(([k, deck]) => { const cuts = Object.keys(deck).filter(isCut); if (!cuts.length) return;
  const mp = G.CONQUEST_MAPS.find(x => !x.sub && String(G.mapNumberOf(x.id)) === k), list = [...LP.fightPool(pools, mp.id, null)];
  cuts.forEach(id => { const n = deck[id]; delete deck[id];
    const ok = list.filter(x => D[x] && !isCut(x) && !D[x].token && !D[x].test && !(D[x].effects || {}).leader && D[x].cardType !== 'equipment' && G.roadRarityOk(D[x].rarity, +k, 'boss', mp.id) && (deck[x] || 0) + n <= Math.min(4, G.maxCopiesForRarity(D[x].rarity)));
    ok.sort((a, b) => (deck[b] ? 1 : 0) - (deck[a] ? 1 : 0) || Math.abs(score(a) - score(id)) - Math.abs(score(b) - score(id)));
    if (!ok.length) throw new Error('no home for ' + id + ' on Map ' + k); deck[ok[0]] = (deck[ok[0]] || 0) + n; out.push(`Map ${k}: ${id} x${n} -> ${ok[0]}`); }); });
console.log(out.join('\n') || 'clean');
if (process.argv.includes('apply') && out.length) fs.writeFileSync(APP, s.replace(m[1], JSON.stringify(W)));
