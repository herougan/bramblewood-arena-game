#!/usr/bin/env node
// CONTENT8 (2026-11-02): which reference ladder / PRO / BPRO pools now hold the seven newly placed cards. Read-only: it changes no deck.
// The ladder and the PRO decks draw from deckopt's map-true pool (tools/bal13/ladder_2026_11_02.js poolOf), the BPRO decks from the 'bpro' mode
// (the map's own cards only). The Pool reference (ref-pool) and the 5 seeded players (prog) hold what rewards / first-clear cards give, which a
// pack card is not, so they are listed from their baked pool files.
//   node tools/content8_pools_2026_11_02.js
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const O = require('./opt/deckopt.js'), IDS = ['bloodworm', 'moon-jelly', 'lions-mane-jelly', 'pistol-shrimp', 'man-o-war', 'nautiloid', 'supernova-jelly'];
const gm = O.loadGame(ROOT), G = gm.G, pro = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8'));
const poolOf = (map, mode)=> O.poolsFor(gm, map, {mode}).p1.filter(id=> { const d = gm.D[id]; if(!d || !O.deckable(gm, id)) return false; if(d.effects && d.effects.leader) return false;
  return !(!(d.source && d.source.kind) && d.rarity !== 'starter' && G.cardSourceOf(d).kind !== 'base'); });
const rows = [];
for(const id of Object.keys(pro.maps)){ const map = G.CONQUEST_MAPS.find(m=> m.id === id); if(!map) continue;
  const mt = new Set(poolOf(map, 'map-true')); let bp = new Set(); try{ bp = new Set(poolOf(map, 'bpro')); }catch(e){}
  const inMT = IDS.filter(x=> mt.has(x)), inBP = IDS.filter(x=> bp.has(x));
  if(inMT.length || inBP.length) rows.push({id, map:G.mapNumberOf(id), mapTrue:inMT, bpro:inBP}); }
rows.sort((a, b)=> a.map - b.map);
rows.forEach(r=> console.log(`${r.id.padEnd(6)} Map ${String(r.map).padEnd(3)} map-true pool (ladder, PRO): ${r.mapTrue.join(', ') || '-'} | bpro pool: ${r.bpro.join(', ') || '-'}`));
console.log(`${rows.length} of ${Object.keys(pro.maps).length} PRO maps' pools hold at least one of the seven`);
for(const f of ['ref-pool-pools.json', 'ref5-prog-pools.json']){ const s = fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'ref', f), 'utf8'); console.log(f + ': ' + (IDS.filter(x=> s.includes('"' + x + '"')).join(', ') || 'none of the seven')); }
