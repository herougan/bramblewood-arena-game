#!/usr/bin/env node
// 2026-10-23 (package RW5, owner 22:23 #10: "The new cards youve added so far, any worth introducing in Map 0-20 (lightly)? ... from Map 0-9, the
// game felt like it was missing abit of strategical depth"): the new cards awaiting a source that add a new decision (protecting your bramble,
// Bloom, Tide) go lightly into Maps 0-9's pack pools: one or two a map, the plain-but-new ones earliest. Each gets source {kind:'pack', tier,
// map}, loses awaitingSource, joins its map's pool (canonical/map-pools.json "cards"). Their budget was priced at Map 0, so a later map only
// adds room. Idempotent.   node tools/rw5_place_new_cards_2026_10_23.js [--dry]   then: node tools/forge_curve_2026_10_19.js maps
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
// id: [map, tier, why]
const PLACE = {
  'briarback-hedgehog': ['mf', 1, 'Bramble Armor (EN3) on a plain common: the first card that protects your bramble, Thistlewood (Map 1)'],
  'dam-keeper-beaver': ['m2', 1, 'Rampart (EN3): takes half the bramble\'s damage; a river beaver for the Sunken Hollow (Map 4)'],
  'pond-algae': ['m2', 1, 'Bloom (BL): the first bloom card, Wet & Sunny; a pond plant for the Sunken Hollow (Map 4)'],
  'moat-snapper': ['mw', 1, 'Rampart + Armor (EN3): a sturdier bramble guard for the Gatorback Swamp (Map 5)'],
  'barkplate-beetle': ['mu', 2, 'Bramble Armor + Thorns (EN3): the Morel Hollow\'s woodland floor (Map 7)'],
  'ironclaw-fiddler': ['mk', 2, 'Tide + Bludgeon + Armor (EN2): a Rare crab for the Kelp Mangroves\' tides (Map 9)'],
};
const out = [];
cards.forEach(c=>{ const p = PLACE[c.id]; if(!p) return; const [map, tier, why] = p;
  if(!(c.source && c.source.kind === 'pack' && c.source.map === map)){ c.source = {kind: 'pack', tier, map}; delete c.awaitingSource; c.locked = true;
    c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-10-23 (RW5, owner 22:23 #10): placed in Pack ${tier}, ${map}: ${why}.`; out.push(`${c.id} -> Pack ${tier} @ ${map}`); }
  const e = doc.maps[map] = normalizeEntry(doc.maps[map] || {}); if(!e.cards.includes(c.id)) e.cards.push(c.id); });
function serializePools(d){ // the format tools/fold_map_pools.js writes
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(!subs.length) lines.push('   "submaps": {},'); else { lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(m.special)}`, '  }' + comma); });
  lines.push(' }', '}'); return lines.join('\n') + '\n'; }
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
console.log(out.length ? out.join('\n') : '(nothing to place)');
if(process.argv.includes('--dry')) process.exit(0);
fs.writeFileSync(CARDS, pyDump(cards)); fs.writeFileSync(POOLS, serializePools(doc));
module.exports = {PLACE};
