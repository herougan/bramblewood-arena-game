#!/usr/bin/env node
// 2026-10-23 (package RW5, owner 19:27 item 15: "Those cards in Map 0-6 go into Pack 1. 7-13 go into Pack 2. And 13-20 go into Pack 3.
// There's lava creatures in Pack 1 currently. Submap cards are found in the Pack tier following the maps that unlock them!"; PP-1 default
// 0-6 / 7-13 / 14-20). Fixes HUB3's leftover data mistakes (docs/progression-plan.md, docs/balance/progression-plan-2026-10-23.json) in
// the canonical files:
//   1. every basic-pack card (source {kind:'pack', tier:1..4}) gets the tier of the map where it is first found: Pack 1 Maps 0-6, Pack 2
//      7-13, Pack 3 14-20, 4 after Map 20 (no pack sells tier 4 yet). A side map counts from the map that unlocks it (its parent, or
//      entry.afterMapCleared when later). The Tutorial side map (mtut: its T-2/T-3/T-4 fights sit on Maps 1/8/18) and the endless
//      dungeons (Murgle Mayhem, the Long Burrow, the Undercroft: every map's cards) never set a card's map;
//   2. a card whose source.map disagrees with the first map pool that holds it is re-pointed to that pool's map;
//   3. a pack card with no map and in no pool gets a map by theme (NOMAP below, from canonical/unit-themes.json's biomes) and joins
//      that map's pool;
//   4. a pack card that names a map but is in no pool joins that map's pool (map-pools.json "cards", or the side map's list);
//   5. 7 of the 9 Hummingbird faction cards that came "from the start" as Base go into the faction pool ({kind:'pack', tier:11, side:'tribes'});
//      the Cobalt-talon Fledgling stays Base (it is in the Hummingbird starting deck), the Greyplume Fledgling awaits the owner's placement;
//   6. the junk id ember-tetra-3caj becomes ember-tetra, a Pack 3 card of the Ashen Spurn (Map 19, hot springs).
// Formats are kept: cards.json as json.dumps(indent=2, ASCII), map-pools.json as tools/fold_map_pools.js writes it.
//   node tools/rw5_pack_tiers_2026_10_23.js [--dry]     then: node tools/forge_curve_2026_10_19.js maps
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const DRY = process.argv.includes('--dry');
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json'), THEMES = path.join(ROOT, 'canonical', 'unit-themes.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), poolsDoc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
const byId = {}; cards.forEach(c=> byId[c.id] = c);

const ALL = G.CONQUEST_MAPS, mapById = {}; ALL.forEach(m=> mapById[m.id] = m);
const NOT_TIERING = new Set(['mtut', ...ALL.filter(m=> m.endless || m.tower).map(m=> m.id)]);
const num = id=> G.mapNumberOf(id);
const unlockCache = {};
function unlockNo(id, seen){ // as tools/progression_plan_2026_10_23.js
  if(unlockCache[id] != null) return unlockCache[id];
  const m = mapById[id]; if(!m) return null; if(!m.sub) return (unlockCache[id] = num(id));
  seen = seen || new Set(); if(seen.has(id)) return num(m.parent); seen.add(id);
  const after = m.entry && m.entry.afterMapCleared, p = num(m.parent) || 0;
  return (unlockCache[id] = Math.max(p, after ? (unlockNo(after, seen) || 0) : p));
}
const TIERS = [[1, 0, 6], [2, 7, 13], [3, 14, 20]];
const tierOf = n=> n == null ? null : ((TIERS.find(([, a, b])=> n >= a && n <= b) || [4])[0]);

// 3. no map, no pool: a map by theme (owner: "We can only pick the most thematic to be in each place"). Early, plain woodland and shore
// animals go to Maps 0-5; the woodland ones beyond the first handful go to the Briar Maze's kin maps (Redwood Deep, Long Grass), so Pack 1
// does not swell past its ~30 (the 19:27 targets).
const NOMAP = {
  m1: ['alley-cat', 'paper-wasp'],                                                                        // village edge of the Outskirts
  mf: ['hedgerow-shrew', 'robin-redbreast', 'woodcock-lookout', 'slow-worm'],                              // Thistlewood's hedges
  mb: ['rock-pool-starfish', 'oystercatcher'],                                                            // Pebble Beach
  m2: ['signal-crayfish', 'diving-bell-spider'],                                                          // Sunken Hollow (river)
  mw: ['marsh-harrier', 'raft-spider', 'buzzed-chipmunk'],                                                // Gatorback Swamp (the chipmunk: the swamp's trading post; Maps 0-4 put its budget over, see BUDGET_HOLD)
  m8: ['anaconda-coil'],                                                                                  // Sable Swampmire
  mu: ['fungus-gnat-cloud', 'hawthorn-shieldbug'],                                                        // The Morel Hollow (fungal woodland; Thistlewood put the shieldbug over budget)
  m4: ['cave-pseudoscorpion', 'guano-beetle'],                                                            // Caves & Alcoves
  mn: ['glimmer-spider'],                                                                                 // The Glimmer Depths (side map of Map 8)
  mk: ['electric-catfish', 'elephant-nose-fish', 'proboscis-monkey', 'horseshoe-crab', 'sea-hare', 'limpet-clinger'], // The Kelp Mangroves (the limpet: Pebble Beach put it over budget)
  m7: ['lionfish', 'giant-clam'],                                                                         // Coral Current
  m10: ['alpine-swift', 'alpine-salamander'],                                                             // Eyrie Heights
  mh: ['gatling-hog'],                                                                                    // The Briar Maze
  mr: ['pill-bug', 'leopard-slug', 'red-backed-salamander'],                                              // The Redwood Deep (forest floor)
  ml: ['amber-cicada', 'garden-tiger-moth', 'muntjac-barker', 'anvil-thrush', 'springtail-hopper'],        // The Long Grass (meadow)
  m6: ['musk-ox-calf'],                                                                                   // Wolfsbane Tundra
};
const NOMAP_OF = {}; Object.entries(NOMAP).forEach(([m, ids])=> ids.forEach(id=> NOMAP_OF[id] = m));
// 5.
const HUMMINGBIRDS_TO_FACTION = ['gold-throated-acolyte', 'violet-vane-fletcher', 'sunthroat-courier', 'voidfeather-scout', 'crimson-wing-duelist-cadet', 'cobalt-talon-skirmisher', 'dominion-nestguard']; // the Greyplume Fledgling (HUB3's ninth) is awaitingSource: the owner places it (BX)
// 6. (the source stays as it was, Base: as a Pack 3 card of the Ashen Spurn its 3/7 is over budget, so placing it is the owner's call)
const RENAME = {'ember-tetra-3caj': {to: 'ember-tetra'}};
// 2. held: re-pointing these to their first pool map would put their stats over budget (the budget's Map term, bramblewood-budget.js perMap: the
// pool's side map opens 5-18 maps before the map they are priced for). They keep their source map, so their pack tier is that map's, and
// the hub lists them as an open mismatch for the owner (re-fit them, or take them out of the early side map's pool).
const BUDGET_HOLD = new Set(['beetle-battering-ram', 'fox-kit', 'lodge-engineer', 'mallard-marauder', 'mudpuppy', 'cinder-gecko',
  // and the first-clear pack cards of a map (SKIRMISH_FIRST_PACK_CARDS, GD5: "a card of that map's own pool") that an earlier side map's pool also holds
  'mangrove-mudskipper', 'minnow-skitter', 'cinder-hornet', 'siege-rhino']);

// where each card first sits in the pools (side maps from their unlock map; the Tutorial and the endless dungeons left out)
const pools = poolsDoc.maps;
function firstPool(){
  const at = {};
  Object.entries(pools).forEach(([mid, raw])=>{ const e = normalizeEntry(raw);
    const note = (id, loc)=>{ if(NOT_TIERING.has(loc)) return; const n = unlockNo(loc); if(n == null) return; if(!at[id] || n < at[id].n) at[id] = {n, loc}; };
    (e.cards || []).forEach(id=> note(id, mid)); (e.special || []).forEach(id=> note(id, mid));
    Object.entries(e.submaps || {}).forEach(([sid, ids])=> ids.forEach(id=> note(id, sid)));
  });
  return at;
}
function addToPool(id, loc){
  const m = mapById[loc]; if(!m) return false;
  const top = m.sub ? m.parent : loc, e = pools[top] = normalizeEntry(pools[top] || {});
  if(m.sub){ e.submaps[loc] = e.submaps[loc] || []; if(e.submaps[loc].includes(id)) return false; e.submaps[loc].push(id); }
  else { if(e.cards.includes(id)) return false; e.cards.push(id); }
  return true;
}
const log = {renamed: [], toFaction: [], repointed: [], themed: [], addedToPool: [], tiers: {1: 0, 2: 0, 3: 0, 4: 0}, changedTier: []};

// 6. the rename first, so the rest sees the new id
Object.entries(RENAME).forEach(([from, r])=>{ const c = byId[from]; if(!c) return; if(byId[r.to]) throw new Error(r.to + ' exists already');
  c.id = r.to; delete byId[from]; byId[r.to] = c;
  c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-10-23 (RW5): id was ${from} (a junk suffix from the live card); its source is still unset (Base): as a Pack 3 card of the Ashen Spurn its 3/7 is over budget.`;
  log.renamed.push(from + ' -> ' + r.to); });
// 5.
HUMMINGBIRDS_TO_FACTION.forEach(id=>{ const c = byId[id]; if(!c) return; const s = c.source || {};
  if(s.kind === 'pack' && +s.tier === 11) return; c.source = {kind: 'pack', tier: 11, side: 'tribes'}; c.locked = true; log.toFaction.push(id); });

const live = c=> !c.pool && !c.token && !c.test && !c.unattainable && !c.awaitingSource; // what the HUB3 counts call live
const at = firstPool();
cards.forEach(c=>{
  const s = c.source; if(!s || s.kind !== 'pack') return; const t = Number(s.tier) || 1; if(t === 11 || t === 99) return;
  const fp = at[c.id];
  if(NOMAP_OF[c.id] && !s.map && !fp && live(c)){ s.map = NOMAP_OF[c.id]; if(addToPool(c.id, s.map)) log.addedToPool.push(c.id + ' @' + s.map); log.themed.push(c.id + ' -> ' + s.map); }
  else if(fp){ const smN = s.map ? unlockNo(s.map) : null;
    if(BUDGET_HOLD.has(c.id) && s.map){ log.held = (log.held || []).concat(`${c.id}: keeps ${s.map} (pool ${fp.loc})`); }
    else if(!s.map || tierOf(smN) !== tierOf(fp.n)){ log.repointed.push(`${c.id}: ${s.map || '(none)'} -> ${fp.loc}`); s.map = fp.loc; } }
  else if(s.map && live(c)){ if(addToPool(c.id, s.map)) log.addedToPool.push(c.id + ' @' + s.map); }
  const n = s.map ? unlockNo(s.map) : null, nt = n == null ? 1 : tierOf(n);
  if(nt !== t) log.changedTier.push(`${c.id} ${t}->${nt}`);
  s.tier = nt; log.tiers[nt]++;
});

// checks: no volcanic card in Pack 1, every live pack card has a map
const UT = JSON.parse(fs.readFileSync(THEMES, 'utf8')), BIO = {}; (UT.units || []).forEach(u=> BIO[u.id] = u.biomes || []);
const lavaP1 = cards.filter(c=> live(c) && c.source && c.source.kind === 'pack' && c.source.tier === 1 && (BIO[c.id] || []).includes('volcanic-ash')).map(c=> c.id);
const noMap = cards.filter(c=> live(c) && c.source && c.source.kind === 'pack' && c.source.tier >= 1 && c.source.tier <= 4 && !c.source.map).map(c=> c.id);
// unit-themes.json carries the old id too
let themesTxt = fs.readFileSync(THEMES, 'utf8'); Object.entries(RENAME).forEach(([from, r])=>{ themesTxt = themesTxt.split('"' + from + '"').join('"' + r.to + '"'); });

function serializePools(doc){ // the format tools/fold_map_pools.js writes
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']';
  const lines = ['{', ' "_about": ' + JSON.stringify(doc._about) + ',', ' "maps": {'];
  const maps = Object.keys(doc.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(doc.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(!subs.length) lines.push('   "submaps": {},');
    else { lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(m.special)}`, '  }' + comma); });
  lines.push(' }', '}'); return lines.join('\n') + '\n';
}
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')).replace(/^( *"[^"]*"): /gm, '$1: ') + '\n';
const summary = {held: log.held || [], renamed: log.renamed, toFaction: log.toFaction, repointed: log.repointed, themed: log.themed, addedToPool: log.addedToPool.length, tiers: log.tiers, changedTier: log.changedTier.length, lavaInPack1: lavaP1, liveWithoutMap: noMap};
console.log(JSON.stringify(summary, null, 1));
if(DRY){ console.log('(dry run, nothing written)'); process.exit(0); }
fs.writeFileSync(CARDS, pyDump(cards)); JSON.parse(fs.readFileSync(CARDS, 'utf8'));
fs.writeFileSync(POOLS, serializePools(poolsDoc)); JSON.parse(fs.readFileSync(POOLS, 'utf8'));
fs.writeFileSync(THEMES, themesTxt); JSON.parse(fs.readFileSync(THEMES, 'utf8'));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'rw5-pack-tiers-2026-10-23.json'), JSON.stringify(Object.assign({generated: '2026-10-23', tool: 'node tools/rw5_pack_tiers_2026_10_23.js'}, summary, {changedTierList: log.changedTier, addedToPoolList: log.addedToPool}), null, 1) + '\n');
console.log('wrote canonical/cards.json, canonical/map-pools.json, canonical/unit-themes.json, docs/balance/rw5-pack-tiers-2026-10-23.json');
