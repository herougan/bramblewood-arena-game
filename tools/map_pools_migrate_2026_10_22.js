#!/usr/bin/env node
// 2026-10-22 (package DV2, owner 07:41, MP): migrates canonical/map-pools.json from the old shape
//   { cards, special, submaps: { <id>: { cards, special } } }   (package MP)
// to the owner's three tiers (MAP, one list per SUBMAP, one SPECIAL per main map):
//   { cards, submaps: { <id>: [ids] }, special: [ids] }
// Each submap's cards become its list; every existing `special` list, the map's and each submap's, merges into the map's one `special`.
// Safe to run twice (the new shape passes through unchanged).  node tools/map_pools_migrate_2026_10_22.js [--dry]
const fs = require('fs'), path = require('path');
const {normalizeEntry} = require('./lib_map_pools.js'), {serialize} = require('./fold_map_pools.js');
const FILE = path.join(__dirname, '..', 'canonical', 'map-pools.json');
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let moved = 0, subs = 0;
Object.keys(doc.maps).forEach(id=>{
  const old = doc.maps[id], oldSpecial = (old.special || []).length + Object.values(old.submaps || {}).reduce((a, s)=> a + ((s && !Array.isArray(s) && s.special) || []).length, 0);
  const next = normalizeEntry(old); moved += oldSpecial; subs += Object.keys(next.submaps).length;
  if(next.special.length !== new Set([].concat(old.special || [], ...Object.values(old.submaps || {}).map(s=> (s && !Array.isArray(s) && s.special) || []))).size) throw new Error('special lists lost cards on ' + id);
  doc.maps[id] = next;
});
doc._about = 'Per-map card pools (owner 2026-10-22). One entry per main map, three tiers: "cards" (the MAP tier), "submaps" (each side map\'s own cards, one list each) and "special" (the cards added through a skirmish deck editor\'s + Load any card; one list for the map and its submaps\' fights). A main-map fight draws from cards + special; a submap fight from cards + that submap + special. Shape: tools/lib_map_pools.js. Fold the admin\'s live edits back with tools/fold_map_pools.js.';
console.log(`${Object.keys(doc.maps).length} maps, ${subs} submaps, ${moved} special entries merged into the maps' special lists`);
if(!process.argv.includes('--dry')) fs.writeFileSync(FILE, serialize(doc)); // one list per line, as the fold tool writes it
