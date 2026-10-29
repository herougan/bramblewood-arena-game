#!/usr/bin/env node
// 2026-10-29 LISTFIX1: the skirmish decks that field a card off their fight's pool (a main-map fight: MAP + SPECIAL; a submap fight: its
// SUBMAP + SPECIAL, the LISTFIX1 rule, decision APPLY1-1). The decks are NOT rebuilt here (the owner's step 4, its own package); the
// deck-vs-pool checks (content2 ...) report these instead of failing. The game does not check a deck against its map list (only the
// Map cards editor and the deck editors mark such a card with a ⚠), so an off-pool deck card plays as before.
//   node docs/balance/listfix1-decks-2026-10-29.js [--write]   -> docs/balance/listfix1-decks-2026-10-29.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const L = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const fights = [];
G.CONQUEST_MAPS.forEach(m=>{
  const pool = L.fightPool(pools, m.id, m.sub ? m.parent : null); if(!pool) return;
  (m.nodes || []).forEach(n=>{ const ids = Object.keys(n.deck || {}).filter(id=> (n.deck[id] | 0) > 0); if(!ids.length) return;
    const off = ids.filter(id=> !pool.has(id)); if(!off.length) return;
    fights.push({map: m.id, mapName: m.name, sub: !!m.sub, parent: m.sub ? m.parent : null, key: n.key, name: n.name, kind: n.kind || 'skirmish',
      cards: ids.length, off: off.map(id=> ({id, copies: n.deck[id], onSomeList: !!G.cardFirstMapList(D[id]), outOfPlay: !!(D[id] && L.isOutOfPlay(G, D[id]))}))}); });
});
// 2026-10-29 RELFIX3: decks over the copy ladder because a list package re-ranked a card (THEME3 Q5: Fungal Colossus Common -> Uncommon, so 7-A-1's
// 5 copies are one over Uncommon's 4). Also step 4 (decks not touched here); bal2's ladder check reads this list and reports.
const overCopies = [];
G.CONQUEST_MAPS.forEach(m=>{ if(m.tower) return; (m.nodes || []).forEach(n=> Object.entries(n.deck || {}).forEach(([id, k])=>{ const d = D[id]; if(d && n.kind !== 'tutorial' && k > G.maxCopiesForRarity(d.rarity)) overCopies.push({map: m.id, key: n.key, id, copies: k, max: G.maxCopiesForRarity(d.rarity), rarity: d.rarity}); })); });
const copies = fights.reduce((a, f)=> a + f.off.reduce((s, o)=> s + o.copies, 0), 0);
const out = {_about: 'LISTFIX1 (2026-10-29): fights whose deck holds a card off the fight\'s pool (main map: MAP + SPECIAL; submap: its SUBMAP + SPECIAL). '
  + 'Not rebuilt (the owner\'s step 4). The deck-vs-pool checks read this list and report instead of failing. Built by node docs/balance/listfix1-decks-2026-10-29.js --write.',
  built: '2026-10-29', fights: fights.length, offCopies: copies, byMap: fights.reduce((a, f)=>{ a[f.map] = (a[f.map] || 0) + 1; return a; }, {}), list: fights, overCopies};
console.log(`${fights.length} fights hold a card off their pool (${copies} copies); ${overCopies.length} deck rows over the copy ladder: ${overCopies.map(o=> o.key + ' ' + o.id + ' x' + o.copies).join(', ')}`);
if(process.argv.includes('--write')){ fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'listfix1-decks-2026-10-29.json'), JSON.stringify(out, null, 1) + '\n'); console.log('wrote docs/balance/listfix1-decks-2026-10-29.json'); }
