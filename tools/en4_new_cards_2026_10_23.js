#!/usr/bin/env node
// EN4 new cards (2026-10-23, package EN4; owner 22:23 #7 / #10 and 19:27 #4 option B): two cards for each new skill, priced by the formula
// and placed lightly in Maps 0-20's pack pools where they add a decision (owner 22:23 #10: "i felt from Map 0-9, the game felt like it was
// missing abit of strategical depth"). Placements are call EN4-4.
//   Hemorrhage    Great Skua (Map 3, Gannet Cliffs: beside the Razorbill's Bleed), Bloodscent Shark (Map 10, Coral Current: beside the
//                 Kraken Spawnling's and the Colossal Squid's Gash)
//   Greater Poison  Cane Toad (Map 6, Sable Swampmire: the poison swamp), Inland Taipan (Map 18, the Pale Desert's scorpions); both carry
//                 Poison too (owner: "Usually they have both GP and Poison")
//   Shore Up      Oyster Bank (Map 2, Pebble Beach: a 0-Attack wall that braces its neighbours), Musk Ox Matriarch (Map 17, Wolfsbane
//                 Tundra: the herd's ring)
// Each gets the largest line on its Attack:Health shape inside both caps at Level 1 with its map's term (tools/skill_costs.js budget), as
// tools/en3_new_cards_2026_10_23.js fits; source {kind:'pack', tier, map} (Pack 1: Maps 0-6, Pack 2: 7-13, Pack 3: 14-20, RW5) and its
// map's pool (canonical/map-pools.json "cards"). Art: the emoji until painted; NightCafe prompts in docs/art/new-cards-2026-10-23-en4.md.
//   node tools/en4_new_cards_2026_10_23.js           dry run        ... apply     writes cards.json and map-pools.json (skips ids that exist)
//   then: node tools/forge_curve_2026_10_19.js maps; node tools/unit_themes.js
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const tierOf = n=> n <= 6 ? 1 : n <= 13 ? 2 : 3;
const NEW = [
  {id:'great-skua', name:'Great Skua', icon:'🐦', wait:1, shape:[2, 5], rarity:'common', like:'razorbill', animal:'great skua', effects:{flying:true, hemorrhage:true},
   map:'mc', mapN:3, flavor:'It never starts a fight. It finishes the ones already bleeding.', why:'Hemorrhage on a common flyer beside the Razorbill\'s Bleed: Gannet Cliffs (Map 3)'},
  {id:'bloodscent-shark', name:'Bloodscent Shark', icon:'🦈', wait:2, shape:[4, 10], rarity:'uncommon', like:'coral-reef-shark', animal:'shark', effects:{hemorrhage:true},
   map:'m7', mapN:10, flavor:'One drop in the current and it is already turning.', why:'Hemorrhage beside the Gash of the Kraken Spawnling and the Colossal Squid: Coral Current (Map 10)'},
  {id:'cane-toad', name:'Cane Toad', icon:'🐸', wait:2, shape:[2, 12], rarity:'uncommon', like:'poison-dart-croaker', animal:'cane toad', effects:{poison:1, greaterPoison:1},
   map:'m8', mapN:6, flavor:'Whatever bit it once regrets it twice.', why:'Poison + Greater Poison in the poison swamp: Sable Swampmire (Map 6)'},
  {id:'inland-taipan', name:'Inland Taipan', icon:'🐍', wait:2, shape:[3, 9], rarity:'rare', like:'grass-viper', animal:'taipan', effects:{poison:2, greaterPoison:1}, archetypes:['Snake', 'Desert'],
   map:'md', mapN:18, flavor:'The desert keeps few secrets. This is the one it keeps closest.', why:'Poison 2 + Greater Poison beside the scorpions\' Poison: the Pale Desert (Map 18)'},
  {id:'oyster-bank', name:'Oyster Bank', icon:'🦪', wait:1, shape:[0, 13], rarity:'common', like:'giant-clam', animal:'oyster', effects:{shoreUp:true}, archetypes:['Coastal'],
   map:'mb', mapN:2, flavor:'Every wave that breaks on it is one that does not break on you.', why:'Shore Up on a 0-Attack wall: Pebble Beach (Map 2)'},
  {id:'musk-ox-matriarch', name:'Musk Ox Matriarch', icon:'🐂', wait:2, shape:[3, 14], rarity:'uncommon', like:'tundra-musk-ox', animal:'musk ox', effects:{shoreUp:true, armor:1},
   map:'m6', mapN:17, flavor:'When the wolves come, the herd makes a ring. She is the ring.', why:'Shore Up + Armor beside the Tundra Musk Ox: Wolfsbane Tundra (Map 17)'},
];
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1; const out = [], placed = [], refit = [];
for(const s of NEW){
  const had = cards.find(c=> c.id === s.id); if(had && !/package EN4/.test(had.creatorNote || '')){ console.log('exists (not EN4\'s): ' + s.id); continue; }
  const like = cards.find(c=> c.id === s.like) || {};
  const base = {id:s.id, name:s.name, icon:s.icon, cost:s.wait, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false,
    archetypes:s.archetypes || (like.archetypes || []).slice(), species:(like.species || []).slice(), animal:s.animal, dmgType:like.dmgType || 'physical', resist:(like.resist || []).slice(), tags:[],
    effects:s.effects, flavor:s.flavor};
  const fit = Object.assign({}, base, {obtainMap: s.mapN});
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = s.shape[0] === 0 ? 0 : Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(fit, A, H);
    if(b && (!best || b.x1 > best.b.x1)) best = {A, H, b}; }
  if(!best){ console.log('no legal line: ' + s.id); continue; }
  const tier = tierOf(s.mapN);
  base.attack = best.A; base.health = best.H; base.numericId = had ? had.numericId : nid++; base.uuid = uuid5('bramblewood-card:' + s.id);
  base.source = {kind:'pack', tier, map:s.map};
  base.creatorNote = `2026-10-23 (package EN4, owner 22:23 #7 / 19:27 #4 B: a card for the new skill): ${Object.keys(s.effects).join(' + ')}. Priced with the budget (tools/skill_costs.js budget, Level 1, map term Map ${s.mapN}): S ${best.b.S}, N ${best.b.N}, 2A+H+S ${best.b.x1}: ${best.A}/${best.H}. Placed (owner 22:23 #10, call EN4-4) in Pack ${tier}, ${s.map}: ${s.why}. Art: placeholder (the emoji); NightCafe prompt in docs/art/new-cards-2026-10-23-en4.md.`;
  if(had){ if(had.attack !== base.attack || had.health !== base.health || had.creatorNote !== base.creatorNote){ refit.push([had, base]); console.log('re-fit ' + s.id + ': ' + had.attack + '/' + had.health + ' -> ' + base.attack + '/' + base.health); } continue; } // a re-price re-fits it in place (owner 23:45: Greater Poison 2.5)
  out.push(base); placed.push([s.map, s.id]);
  console.log(`${s.id.padEnd(20)} ${s.rarity.padEnd(9)} W${s.wait} ${best.A}/${best.H}  S ${best.b.S}  2A+H+S ${best.b.x1} / N ${best.b.N}  -> Pack ${tier} @ ${s.map} (Map ${s.mapN})`);
}
function serializePools(d){ // the format tools/fold_map_pools.js writes (as tools/rw5_place_new_cards_2026_10_23.js)
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(!subs.length) lines.push('   "submaps": {},'); else { lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(m.special)}`, '  }' + comma); });
  lines.push(' }', '}'); return lines.join('\n') + '\n'; }
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
if(process.argv.includes('apply') && (out.length || refit.length)){
  refit.forEach(([had, b])=>{ had.attack = b.attack; had.health = b.health; had.creatorNote = b.creatorNote; });
  cards.push(...out);
  placed.forEach(([map, id])=>{ const e = doc.maps[map] = normalizeEntry(doc.maps[map] || {}); if(!e.cards.includes(id)) e.cards.push(id); });
  fs.writeFileSync(CARDS, pyDump(cards)); fs.writeFileSync(POOLS, serializePools(doc));
  console.log('applied', out.length, 're-fit', refit.length);
}
module.exports = {NEW};
