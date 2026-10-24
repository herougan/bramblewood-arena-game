#!/usr/bin/env node
// 2026-10-25 (package PRO3, owner 10-24 22:28 #3: "once we are done, we add the cards into the maps, we'll do a new PRO pass per map"):
// the EN8 resource-skill cards (Stonecutter, Prospector, Felling, Salvage, Scavenge, Coppice, Driftwood, the Pearl Bed shellfish) join
// the map card lists where their theme fits (tools/thematic_pass_2026_10_19.js offThemeFor says on theme), all Common (within every
// map's rarity cap). Only maps at or after the card's first map, and side maps opening at or after it, so no card's first obtainable map
// (canonical/card-obtain-maps.json, the budget's Map term) moves. Windfall is a field rule, not a card.
//   node tools/opt/pro3_map_lists_2026_10_25.js [--dry]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
// [card, main map, submap or null, why]
const ADD = [
  ['oyster-bank', 'mc', null, 'Gannet Cliffs (Map 3): oysters on the rocks under the cliffs'],
  ['oyster-bank', 'mk', null, 'The Kelp Mangroves (Map 9): oysters grow on mangrove roots'],
  ['oyster-bank', 'mb', 'mg', "Smugglers' Grotto (Pebble Beach's side map): a sea cave's oyster bed"],
  ['beachcomber-sanderling', 'mc', null, 'Gannet Cliffs (Map 3): a shore bird of the cliff beaches'],
  ['beachcomber-sanderling', 'mk', null, 'The Kelp Mangroves (Map 9): driftwood on the mangrove shore'],
  ['giant-clam', 'm7', 'mj', 'The Sunken Depths (Coral Current\'s side map): reef floor'],
  ['salvager-hermit-crab', 'm7', 'mj', 'The Sunken Depths (Coral Current\'s side map): wrecks to salvage'],
  ['prospector-mole', 'm4', 'mn', 'The Glimmer Depths (Caves & Alcoves\' side map): the glint further down'],
  ['marmot-stonecutter', 'm10', 'mv', 'The Aerie Vault (Eyrie Heights\' side map): alpine scree'],
  ['marmot-stonecutter', 'm11', null, 'The Sundered Peak (Map 20): a mountain of split rock'],
  ['beaver-feller', 'mr', null, 'The Redwood Deep (Map 13): forest to fell'],
  ['carrion-crow', 'ml', null, 'The Long Grass (Map 15): crows over the grassland'],
  ['carrion-crow', 'm5', 'my', 'The Canopy (Savanna Reaches\' side map): a scavenging bird'],
  ['carrion-crow', 'md', 'mpd', 'The Pale Desert (Glass Dunes\' side map): carrion birds of the desert'],
];
function serializePools(d){ // the format tools/fold_map_pools.js writes
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(subs.length){ lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}${j < subs.length - 1 ? ',' : ''}`)); lines.push('   },'); }
    else lines.push('   "submaps": {},');
    lines.push(`   "special": ${ids(m.special)}`, `  }${comma}`); });
  lines.push(' }', '}'); return lines.join('\n') + '\n';
}
const d = JSON.parse(fs.readFileSync(POOLS, 'utf8')); let n = 0;
ADD.forEach(([id, main, sub, why])=>{
  const e = d.maps[main] = normalizeEntry(d.maps[main] || {}); const list = sub ? (e.submaps[sub] = e.submaps[sub] || []) : e.cards;
  if(list.includes(id)){ console.log('has   ', id, main + (sub ? '/' + sub : '')); return; }
  list.push(id); n++; console.log('added ', id, '->', main + (sub ? '/' + sub : ''), '-', why); });
if(!process.argv.includes('--dry')) fs.writeFileSync(POOLS, serializePools(d));
console.log(n, 'added', process.argv.includes('--dry') ? '(dry run)' : '');
