#!/usr/bin/env node
// 2026-10-23 (package EN4, the owner 23:45 on RW5's calls: "RW5-3 if there's a reason you want to move them, you can use the new map's budget.
// RW5-7 if it doesn't fit with our new philosophy, move it. Ember Tetra can be a pack 1."):
//   RW5-3  the ten cards RW5 held at their source map. Moved where the earlier side map is the theme-correct home, re-fitted to that map's
//          budget (the largest line on the card's own Attack:Health shape, never above its stats now): Lodge Engineer (a beaver's lodge on the
//          river) to Lilypad Reach (opens at Map 6: Pack 1), Mallard Marauder (a duck pirate) to Smugglers' Grotto (Map 7: Pack 2); side maps of
//          Pebble Beach that count from the map that opens them. Kept (theme already right, KEEP below): Beetle Battering Ram and Siege Rhino (the Goldfeather Siege),
//          Fox Kit (the Redwood Deep), Mudpuppy (9-4's first-clear pack card must stay a Kelp Mangroves card), Cinder Gecko and Cinder Hornet (the Rimefire Caldera's volcanic ash), Mangrove Mudskipper and Minnow
//          Skitter (the Kelp Mangroves' first-clear pack cards).
//   RW5-7  the Mangrove Kingfisher (Rare) was the reward of 9-3, a normal skirmish before Map 10 (owner 22:23 #2: "Normal skirmish rares only
//          start coming in Map 10 onwards"): it is now the reward of 9-6, the Drifting Shell, an elite that already fields it; it stays on Map 9.
//          The Uncommon Banded Sea Krait moves from 9-5 (elite) to 9-3, so Map 9 keeps a skirmish-exclusive card (RW3). tools/map_divvy_2026_10_22.js POOLS says the same, so a re-divvy keeps it.
//   RW5-4  the Ember Tetra (Base, no source) becomes a Pack 1 card of the Sunken Hollow (Map 4, flooded), joins its pool, re-fitted there.
// Then: node tools/forge_curve_2026_10_19.js maps; node tools/unit_themes.js. Idempotent.   node tools/en4_rw5_followups_2026_10_23.js [--dry]
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
const DRY = process.argv.includes('--dry');
// id: [map (a side map: its parent's number), map number, why]
const MOVE = {
  'lodge-engineer':   ['mp', 6, 'RW5-3: a beaver lodge on the river: Lilypad Reach (Pebble Beach\'s side map; it counts as Map 6, where it opens) is the theme, was the Goldfeather Keep (Map 24)'],
  'mallard-marauder': ['mg', 7, 'RW5-3: a duck pirate: Smugglers\' Grotto (Pebble Beach\'s side map; it counts as Map 7, where it opens), was the Goldfeather Keep (Map 24)'],
  'ember-tetra':      ['m2', 4, 'RW5-4 (owner 23:45: "Ember Tetra can be a pack 1."): a small bright fish of the flooded Sunken Hollow (Map 4); was Base with no source'],
};
const KEEP = {'mudpuppy': 'the Kelp Mangroves (9-4\'s first-clear pack card, GD5: a card of that map\'s own pool; Lilypad Reach was the theme)', 'beetle-battering-ram': 'the Goldfeather Siege (a siege engine)', 'siege-rhino': 'the Goldfeather Siege (Siege 4)', 'fox-kit': 'the Redwood Deep (its biome)',
  'cinder-gecko': 'the Rimefire Caldera (volcanic ash)', 'cinder-hornet': 'the Rimefire Caldera (volcanic ash)', 'mangrove-mudskipper': 'the Kelp Mangroves (first-clear pack card)',
  'minnow-skitter': 'the Kelp Mangroves (first-clear pack card)'};
const tierOf = n=> n <= 6 ? 1 : n <= 13 ? 2 : n <= 20 ? 3 : 4;
const fits = (c, A, H, n)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H, obtainMap:n}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
const log = [];
for(const [id, [map, n, why]] of Object.entries(MOVE)){
  const c = cards.find(x=> x.id === id); if(!c){ log.push('missing ' + id); continue; }
  const s = c.source || {}; const done = s.kind === 'pack' && s.map === map;
  const A0 = c.attack, H0 = c.health; let best = fits(c, A0, H0, n) ? {A:A0, H:H0} : null;
  if(!best) for(let k = 1; k >= 0.3 && !best; k -= 0.01){ const A = A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), H = Math.max(1, Math.round(H0 * k)); if(A <= A0 && H <= H0 && fits(c, A, H, n)) best = {A, H}; }
  if(!best){ log.push(`${id}: no legal line at Map ${n}, left`); continue; }
  // a near-miss: keep Attack and take Health off first, when that fits at more points
  for(let h = H0; h >= 1; h--){ if(fits(c, A0, h, n)){ if(2*A0 + h > 2*best.A + best.H) best = {A:A0, H:h}; break; } }
  if(!done){
    c.source = {kind:'pack', tier:tierOf(n), map}; delete c.awaitingSource; c.locked = true;
    c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-10-23 (package EN4): ${why}; Pack ${tierOf(n)}, re-fitted to Map ${n}'s budget: ${A0}/${H0} -> ${best.A}/${best.H}.`;
    c.attack = best.A; c.health = best.H;
  }
  const top = map === 'mp' || map === 'mg' ? 'mb' : map, e = doc.maps[top] = normalizeEntry(doc.maps[top] || {});
  if(top !== map){ e.submaps[map] = e.submaps[map] || []; if(!e.submaps[map].includes(id)) e.submaps[map].push(id); } else if(!e.cards.includes(id)) e.cards.push(id);
  log.push(`${id}: ${done ? '(already) ' : ''}Pack ${tierOf(n)} @ ${map} (Map ${n}), ${A0}/${H0} -> ${c.attack}/${c.health}`);
}
Object.entries(KEEP).forEach(([id, why])=> log.push(`${id}: kept, ${why}`));
// RW5-7
{ const k = cards.find(x=> x.id === 'mangrove-kingfisher'); if(k && k.source && k.source.node === '9-3'){ k.source = Object.assign({}, k.source, {node:'9-6'});
    k.creatorNote = (k.creatorNote ? k.creatorNote + ' ' : '') + '2026-10-23 (package EN4, RW5-7, owner 22:23 #2 / 23:45): the reward of 9-6 (the Drifting Shell, an elite that fields it), was 9-3, a normal skirmish: normal-skirmish Rares start at Map 10.';
    log.push('mangrove-kingfisher: reward 9-3 -> 9-6 (elite)'); } else log.push('mangrove-kingfisher: (already) ' + JSON.stringify(k && k.source));
  const kr = cards.find(x=> x.id === 'banded-sea-krait'); if(kr && kr.source && kr.source.node === '9-5'){ kr.source = Object.assign({}, kr.source, {node:'9-3'});
    kr.creatorNote = (kr.creatorNote ? kr.creatorNote + ' ' : '') + '2026-10-23 (package EN4, RW5-7): the reward of 9-3 (was 9-5), so Map 9 keeps a skirmish-exclusive card while the Rare Kingfisher moves to the elite 9-6.';
    log.push('banded-sea-krait: reward 9-5 -> 9-3'); } }
function serializePools(d){ // the format tools/fold_map_pools.js writes (as tools/rw5_place_new_cards_2026_10_23.js)
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(!subs.length) lines.push('   "submaps": {},'); else { lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(m.special)}`, '  }' + comma); });
  lines.push(' }', '}'); return lines.join('\n') + '\n'; }
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
console.log(log.join('\n'));
if(!DRY){ fs.writeFileSync(CARDS, pyDump(cards)); fs.writeFileSync(POOLS, serializePools(doc)); }
