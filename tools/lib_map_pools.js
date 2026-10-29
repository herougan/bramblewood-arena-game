'use strict';
// 2026-10-22 (package DV2, owner 07:41, MP): the shape of canonical/map-pools.json and of the live `__cfg:map-pools:<mapId>` rows.
//   "Break into 3 tiers: MAP, SUBMAP(s) (1 each), SPECIAL. SPECIAL are those you pressed the 'Load any card' button."
// One entry per MAIN map:
//   { "cards": [ids of the MAP tier], "submaps": { "<submapId>": [ids of that submap's own cards] }, "special": [ids added via Load any card] }
// The one SPECIAL list covers the map's submaps' fights too. The old shape (package MP) was
//   { cards, special, submaps: { "<submapId>": { cards, special } } };
// normalizeEntry reads either shape and returns the new one (every special list merged into the map's one `special`). The game's mpClean
// (arena_app.js) does the same for old live rows; keep the two in step.
// 2026-10-29 LISTFIX1 (decision APPLY1-1; owner 10-28 22:47 "Submaps would be 1-3 cards + 10+ carried over, so 11-14"): a submap's list is its
// WHOLE list (its own cards + the ones it carries, which may also be on the parent's MAP list), and a submap fight draws only that list +
// SPECIAL; a main-map fight MAP + SPECIAL. fightPool is that rule (the game's mapPoolTiers / mapPoolIds). The shape is unchanged, so old files and
// rows still read; an old row's submap list (only the cards not on the parent's list) just gives that submap's fights a smaller pool.
// isOutOfPlay (decision APPLY1-2; owner 22:47 "Don't worry about the other cards"): a card on no map list (of any tier), not in a pack's extras
// and given out by nothing else (G.cardObtainableFrom null) is out of play; budget checks skip it and report it as "unplaced" (PACK1-3).
function uniq(a){ return [...new Set((Array.isArray(a) ? a : []).filter(x=> typeof x === 'string' && x))]; }
function normalizeEntry(p){
  p = p || {};
  const subsIn = p.submaps || {}, subs = {};
  let special = uniq(p.special);
  Object.keys(subsIn).forEach(k=>{
    const s = subsIn[k];
    if(Array.isArray(s)) subs[k] = uniq(s);
    else { subs[k] = uniq(s && s.cards); special = uniq(special.concat(uniq(s && s.special))); }
  });
  return {cards: uniq(p.cards), submaps: subs, special};
}
// the ids a fight draws from: pools = the file's {maps: {...}}, mapId = the fight's map, parentId = its main map when mapId is a submap
function fightPool(pools, mapId, parentId){
  const top = parentId || mapId, e = (pools && pools.maps || {})[top]; if(!e) return null; const n = normalizeEntry(e);
  return new Set((parentId ? (n.submaps[mapId] || []) : n.cards).concat(n.special));
}
// every id on any list of the file (MAP, every SUBMAP, SPECIAL)
function listedIds(pools){ const s = new Set(); Object.values((pools && pools.maps) || {}).forEach(e=>{ const n = normalizeEntry(e); n.cards.concat(n.special).forEach(x=> s.add(x)); Object.values(n.submaps).forEach(l=> l.forEach(x=> s.add(x))); }); return s; }
// G: tools/lib_bramble.js's G (the game's own cardFirstMapList / cardObtainableFrom); d: a card def
function isOutOfPlay(G, d){
  if(!d || d.token || d.test) return false;
  try{ return !G.cardFirstMapList(d) && !(G.packIndex().extra || {})[d.derivedFrom || d.id] && G.cardObtainableFrom(d) == null; }catch(e){ return false; }
}
// 2026-10-29 LISTFIX1: why a budget check holds off on a card: 'unplaced' (out of play, isOutOfPlay), 'pending' (on a list and over its budget
// for its first map: the owner's step 3, docs/balance/listfix1-pending-budget-2026-10-29.json), or '' (check it). Loads tools/lib_bramble.js once.
let LB = null, PEND = null;
function budgetHold(id){
  LB = LB || require('./lib_bramble.js');
  if(!PEND){ try{ PEND = new Set(JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'docs', 'balance', 'listfix1-pending-budget-2026-10-29.json'), 'utf8')).cards.map(c=> c.id)); }catch(e){ PEND = new Set(); } }
  const d = LB.CARD_DEFS_BASELINE[id];
  return d && isOutOfPlay(LB.G, d) ? 'unplaced' : PEND.has(id) ? 'pending' : '';
}
module.exports = {normalizeEntry, uniq, fightPool, listedIds, isOutOfPlay, budgetHold};
