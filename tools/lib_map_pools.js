'use strict';
// 2026-10-22 (package DV2, owner 07:41, MP): the shape of canonical/map-pools.json and of the live `__cfg:map-pools:<mapId>` rows.
//   "Break into 3 tiers: MAP, SUBMAP(s) (1 each), SPECIAL. SPECIAL are those you pressed the 'Load any card' button."
// One entry per MAIN map:
//   { "cards": [ids of the MAP tier], "submaps": { "<submapId>": [ids of that submap's own cards] }, "special": [ids added via Load any card] }
// The one SPECIAL list covers the map's submaps' fights too. The old shape (package MP) was
//   { cards, special, submaps: { "<submapId>": { cards, special } } };
// normalizeEntry reads either shape and returns the new one (every special list merged into the map's one `special`). The game's mpClean
// (arena_app.js) does the same for old live rows; keep the two in step.
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
module.exports = {normalizeEntry, uniq};
