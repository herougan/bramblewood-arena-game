#!/usr/bin/env node
// mapcards_caps.js: the rarity caps of every map list for the hub's 🗺️ Map cards tab (tools/hub/mapcards_data.py runs this).
// 2026-10-28 (package HUB9, owner 10-28 16:43): the caps are the game's own (`roadRarityCap`, `roadRevealedCap`, `mapNumberOf`,
// `mapUnlockNumberOf` in arena_app.js, loaded through tools/lib_bramble.js), never retyped. Prints JSON: {mapId: {no, reveal, skirmish, elite, boss, ...}}.
// Usage: node tools/hub/mapcards_caps.js <mapId>...
'use strict';
const path = require('path');
const B = require(path.join(__dirname, '..', 'lib_bramble.js')), G = B.G;
const out = {};
process.argv.slice(2).forEach(id=>{
  const n = G.mapNumberOf(id), un = G.mapUnlockNumberOf ? G.mapUnlockNumberOf(id) : n;
  const no = un != null ? un : n;
  out[id] = {no, reveal: G.roadRevealedCap(no), skirmish: G.roadRarityCap(no, 'skirmish', id), elite: G.roadRarityCap(no, 'elite', id), boss: G.roadRarityCap(no, 'boss', id)};
});
process.stdout.write(JSON.stringify(out));
