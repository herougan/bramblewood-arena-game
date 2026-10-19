#!/usr/bin/env node
// The post-balance worklist from the owner's unit picks (2026-10-19, package UC; tools/hub/pull_unit_picks.md).
//   node tools/hub/unit_picks_queue.js picks.json [--json]
// picks.json: the hub's unitPicks documents as ArtifactData returns them (an array of {map, unit, picked, updatedAt}, or of
// {id, data: {...}}), or the tab's Copy JSON ({picks: [...]}). Only picked: true counts. Joins them with canonical/unit-themes.json and
// prints, map by map in road order, what each picked unit still needs (the same rules as the hub's Post-balance queue).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const argv = process.argv.slice(2), file = argv.find(a=> !a.startsWith('--'));
if(!file){ console.error('usage: node tools/hub/unit_picks_queue.js picks.json [--json]'); process.exit(2); }
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8'));
const U = {}; T.units.forEach(u=> U[u.id] = u);
const M = {}; T.maps.forEach(m=> M[m.id] = m);
let raw = JSON.parse(fs.readFileSync(file, 'utf8'));
if(raw && !Array.isArray(raw)) raw = raw.picks || raw.documents || raw.docs || [];
const picks = raw.map(d=> d && d.data && typeof d.data === 'object' ? d.data : d).filter(d=> d && d.picked === true && typeof d.map === 'string' && typeof d.unit === 'string');
const onMap = (u, m)=> (u.maps.home || []).includes(m) || !!(u.maps.fights || {})[m];
function needs(u, m){
  const out = [];
  if(u.status === 'proposed') out.push({k: 'create', t: `create it: a ${u.variant.tier} version of ${u.variant.of} (draft body ${u.body.cost}/${u.body.wait} ${u.body.attack}/${u.body.health}, ${u.rarity}), then its skills`});
  else if(u.status === 'pool') out.push({k: 'place', t: 'place the pool card (a source on this map) and measure it'});
  if(u.status !== 'proposed' && !onMap(u, m)) out.push({k: 'stage', t: `new to this map (it lives on Map ${u.firstMap == null ? '-' : u.firstMap}): fight it at the map's enemy level, or make a later version`});
  if(u.status !== 'proposed' && !u.skills.length) out.push({k: 'skills', t: 'no skills yet: apply them'});
  return out;
}
const unknown = [], rows = [];
picks.forEach(p=>{ const u = U[p.unit]; if(!u || !M[p.map]){ unknown.push(p.map + ':' + p.unit); return; } rows.push({map: p.map, mapNo: M[p.map].no, mapName: M[p.map].name, side: M[p.map].sub, unit: u.id, name: u.name, status: u.status,
  rarity: u.rarity, body: u.body, skills: u.skills, biome: u.biomes[0], family: u.family, faction: u.faction, needs: needs(u, p.map)}); });
rows.sort((a, b)=> (a.mapNo ?? 99) - (b.mapNo ?? 99) || (a.side ? 1 : 0) - (b.side ? 1 : 0) || a.map.localeCompare(b.map) || a.name.localeCompare(b.name));
if(argv.includes('--json')){ console.log(JSON.stringify({rows, unknown}, null, 1)); process.exit(0); }
let cur = null;
rows.forEach(r=>{
  if(r.map !== cur){ cur = r.map; console.log(`\n## Map ${r.mapNo ?? '-'}${r.side ? ' (side)' : ''} · ${r.mapName} (${r.map})`); }
  const sk = r.skills.length ? r.skills.map(s=> s[0] === 'trigger' ? s[1] : s[0] + (s[1] != null ? ' ' + s[1] : '')).join(', ') : 'none';
  console.log(`- ${r.name} [${r.unit}] ${r.status}, ${r.rarity || 'no rarity'}; body ${r.body.cost}/${r.body.wait} ${r.body.attack}/${r.body.health}; skills: ${sk}`);
  r.needs.forEach(n=> console.log(`    - ${n.t}`)); if(!r.needs.length) console.log('    - ready as it is');
});
console.log(`\n${rows.length} picks, ${rows.filter(r=> r.needs.length).length} to work${unknown.length ? '; unknown (not in the catalogue): ' + unknown.join(', ') : ''}`);
