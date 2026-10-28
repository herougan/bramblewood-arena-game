#!/usr/bin/env node
// Package CONTENT2 (2026-10-24): card data for the content pass (docs/action-items.md 10-23 20:50 row 10, the owner's 10-24 13:12 #8).
//   1. Lumber gatherers, one for each main biome of Maps 0-20 that had none in its pools (owner 13:12 #8: "We need more lumber gatherers
//      ... every biome should have its own lumber gatherers"), at different strengths (On Ready / On Play +1 to +3 Lumber, Milling 1),
//      plus three existing gatherers that sat in no pool, now in their biome's pool.
//   2. The Stone loop ("lumber -> stone or just stone+"): two Stone gatherers and a converter, the Badger Stonemason, with the engine's
//      existing Quarry 1 (each turn while Ready: pay 1 Lumber, gain 1 Stone; SK2b). No engine change. Owner call CONTENT2-2.
//   3. The thin sub-factions (lore bible): four Gnawed cards and three Tidefolk cards, awaiting a source (proposed sources: CONTENT2-3).
//   4. Cataphract Destrier is renamed Gilded Roadwarden (id kept); Mirrorhide Mutant gets a Mimic flavour line (C21-2).
// Every new card is priced by the budget (bramblewood-budget.js through tools/skill_costs.js): the largest line on its Attack : Health shape
// that holds both caps at Level 1 and its start level (the rule of tools/refit_pass_2026_10_21.js, its "formula line"); the skills are
// existing ones, priced in canonical/skill-costs.json. Placeholder art: the emoji (prompts in docs/art/content2-2026-10-24-briefs.md).
//   node tools/content2_2026_10_24.js add     append (or reset) the cards, place them, rename, flavour     (idempotent)
//   node tools/forge_curve_2026_10_19.js maps                                     the Map term for the placed cards
//   node tools/content2_2026_10_24.js fit     the formula line for each new card
//   node tools/content2_2026_10_24.js check   exit 1 when a new card is over its budget or off its pool
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const CMD = process.argv[2] || 'check';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); // the budget's world, as tools/refit_pass_2026_10_21.js prices
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const NOTE = '2026-10-24 (package CONTENT2) ';
const L = (on, n, res)=> ({on, do: 'gain', resource: res || 'lumber', amount: n});
const base = {locked: true, test: false, dmgType: 'physical', resist: [], tags: []};
// id, then the card; `place: [map, packTier, why]` puts it in that map's pool (MAP tier) as a pack card; `propose` is an awaiting card's proposed source
const NEW = [
 // ---- lumber gatherers (owner 13:12 #8)
 {id: 'driftwood-crab', name: 'Driftwood Crab', icon: '🦀', cost: 0, wait: 1, attack: 1, health: 6, rarity: 'common', archetypes: ['Coastal', 'Crustacean'], species: ['Crustacean'], animal: 'crab',
  effects: {triggers: [L('onReady', 1)]}, flavor: 'It drags every stick the tide leaves behind up the beach, and nobody has ever asked it why.',
  place: ['mb', 1, 'Pebble Beach (Map 2), coast: the beach had no Lumber gatherer (the owner\'s Driftwood Crab)']},
 {id: 'gannet-nestweaver', name: 'Gannet Nestweaver', icon: '🪶', cost: 0, wait: 1, attack: 1, health: 5, rarity: 'common', archetypes: ['Bird'], species: ['Bird'], animal: 'gannet',
  effects: {flying: true, triggers: [L('onSpawn', 1)]}, flavor: 'Seaweed, feathers, a lost glove. Every ledge on the cliff is somebody\'s nest, and every nest is built from somebody else\'s.',
  place: ['mc', 1, 'Gannet Cliffs (Map 3), cliffs: no Lumber gatherer, and no gannet on the gannets\' cliffs']},
 {id: 'nutria-reedcutter', name: 'Nutria Reedcutter', icon: '🦫', cost: 0, wait: 2, attack: 1, health: 8, rarity: 'common', archetypes: ['Swamp', 'Beaver'], species: ['Rodent'], animal: 'nutria',
  effects: {triggers: [L('onReady', 2)]}, flavor: 'Orange teeth, a flat tail and a raft of cut reeds behind it. The gators let it pass. It is mostly teeth.',
  place: ['mw', 1, 'Gatorback Swamp (Map 5), swamp: no Lumber gatherer']},
 {id: 'redwood-woodpecker', name: 'Redwood Woodpecker', icon: '🐦', cost: 1, wait: 1, attack: 1, health: 7, rarity: 'uncommon', archetypes: ['Bird'], species: ['Bird'], animal: 'woodpecker',
  effects: {milling: 1}, flavor: 'Tok. Tok. Tok. By evening there is a pile of red chips at the foot of the tree, and the tree has not noticed.',
  place: ['mr', 2, 'The Redwood Deep (Map 13), redwood: no Lumber gatherer (the owner\'s Woodpecker); the strongest of the set, Milling 1']},
 {id: 'termite-forager', name: 'Termite Forager', icon: '🐜', cost: 0, wait: 0, attack: 1, health: 4, rarity: 'common', archetypes: ['Savanna', 'Insect'], species: ['Insect'], animal: 'termite',
  effects: {swarm: true, triggers: [L('onReady', 1)]}, flavor: 'We carry the grass home. We build the mound. We do not stop.',
  place: ['m5', 3, 'Savanna Reaches (Map 14), savanna: only an On Kill Lumber card (the owner\'s Termite), beside the Termite Mound']},
 {id: 'cone-cutter-squirrel', name: 'Cone-cutter Squirrel', icon: '🐿️', cost: 0, wait: 1, attack: 2, health: 6, rarity: 'common', archetypes: ['Taiga', 'Chipmunk'], species: ['Rodent'], animal: 'red squirrel',
  effects: {triggers: [L('onSpawn', 2)]}, flavor: 'It drops the pine cones from the top of the tree, then climbs down to see where they went. Every time.',
  place: ['mt', 3, 'The Pinewood Taiga (Map 16), taiga: no Lumber gatherer']},
 {id: 'talus-pika', name: 'Talus Pika', icon: '🐹', cost: 0, wait: 0, attack: 1, health: 5, rarity: 'common', archetypes: ['Tundra', 'Mountain'], species: ['Lagomorph'], animal: 'pika',
  effects: {triggers: [L('onReady', 1)]}, flavor: 'All summer it cuts grass and dries it on the rocks. All winter it sits on the haypile and squeaks at the wolves.',
  place: ['m6', 3, 'Wolfsbane Tundra (Map 17), tundra: no Lumber gatherer (the owner\'s Pika)']},
 {id: 'dune-packrat', name: 'Dune Packrat', icon: '🐀', cost: 1, wait: 1, attack: 1, health: 7, rarity: 'uncommon', archetypes: ['Desert', 'Mouse'], species: ['Rodent'], animal: 'pack rat',
  effects: {triggers: [L('onReady', 3)]}, flavor: 'Its midden is older than the dunes around it: sticks, glass, bones and a key nobody has missed yet.',
  place: ['md', 3, 'The Glass Dunes (Map 18), desert: no Lumber gatherer; a desert woodrat\'s midden, the biggest On Ready (+3)']},
 // ---- the Stone loop (owner 13:12 #8: "the stone making loop (lumber -> stone or just stone+)")
 {id: 'gravel-mole', name: 'Gravel Mole', icon: '🪨', cost: 0, wait: 1, attack: 1, health: 8, rarity: 'common', archetypes: ['Cave', 'Mole'], species: ['Mammal'], animal: 'mole',
  effects: {triggers: [L('onReady', 1, 'stone')]}, flavor: 'It digs for worms and finds gravel. It keeps the gravel. The Hollow Kin pay well for gravel.',
  place: ['m4', 2, 'Caves & Alcoves (Map 8), the Stone map: a Stone gatherer beside the Quarry Mole (Bedrock) and the Dynamite Packrat (1 Stone)']},
 {id: 'badger-stonemason', name: 'Badger Stonemason', icon: '🦡', cost: 1, wait: 1, attack: 1, health: 10, rarity: 'uncommon', archetypes: ['Badger', 'Cave'], species: ['Mustelid'], animal: 'badger',
  effects: {quarry: 1}, flavor: 'Bring it timber and it will give you back a wall. Bring it a lot of timber and it will tell you about its back.',
  place: ['m4', 2, 'Caves & Alcoves (Map 8): the Lumber -> Stone converter (Quarry 1: each turn while Ready, pay 1 Lumber for 1 Stone)']},
 {id: 'pumice-beetle', name: 'Pumice Beetle', icon: '🪲', cost: 1, wait: 1, attack: 2, health: 9, rarity: 'uncommon', archetypes: ['Volcanic', 'Beetle'], species: ['Insect'], animal: 'dung beetle',
  effects: {triggers: [L('onSpawn', 2, 'stone')]}, flavor: 'It rolls the light grey stones down from the vents, one after another, as if it has somewhere to be.',
  place: ['m3', 3, 'Ashen Spurn (Map 19), volcanic: the second Stone gatherer, on the scorched high ground']},
 // ---- the Gnawed (lore bible: rats and shrews who stopped caring what they eat; the Sable Swampmire, the Glass Dunes; Devour, Sap, Pack)
 {id: 'bog-shrew', name: 'Bog Shrew', icon: '🐁', cost: 0, wait: 0, attack: 2, health: 3, rarity: 'common', archetypes: ['Swamp', 'Mouse'], species: ['Mammal'], animal: 'shrew',
  effects: {sap: true}, flavor: 'A shrew must eat every hour or starve. The Gnawed stopped asking what the meal was a long time ago.',
  propose: 'Sable Swampmire (Map 6) Pack 1 pool'},
 {id: 'mire-rat', name: 'Mire Rat', icon: '🐀', cost: 0, wait: 1, attack: 2, health: 6, rarity: 'common', archetypes: ['Swamp', 'Mouse'], species: ['Rodent'], animal: 'rat',
  effects: {pack: 2}, flavor: 'One Mire Rat is a nuisance. Five is the Gnawed, and the Gnawed are always hungry.',
  propose: 'Sable Swampmire (Map 6) Pack 1 pool'},
 {id: 'hollow-belly-rat', name: 'Hollow-belly Rat', icon: '🐀', cost: 1, wait: 1, attack: 2, health: 8, rarity: 'uncommon', archetypes: ['Desert', 'Mouse'], species: ['Rodent'], animal: 'rat',
  effects: {devour: {attack: 2, health: 2}}, flavor: 'The road-folk trade. The Gnawed take. This one took so much it can barely walk, and it is still looking around.',
  propose: 'The Glass Dunes (Map 18) Pack 3 pool'},
 {id: 'gnawed-matriarch', name: 'Gnawed Matriarch', icon: '🐀', cost: 1, wait: 2, attack: 3, health: 10, rarity: 'rare', archetypes: ['Mouse', 'Leader'], species: ['Rodent'], animal: 'rat',
  effects: {pack: 2, packLeader: true}, flavor: 'Every rat in the dunes is one of her children, or was, or will be. She remembers which.',
  propose: 'a Glass Dunes (Map 18) skirmish reward (first clear; Rare is open on skirmishes from Map 10)'},
 // ---- the Tidefolk (lore bible: otters who never came ashore, eels, seals; Coral Current, the Kelp Mangroves; Tide, Wash, Fork)
 {id: 'kelpborn-otter', name: 'Kelpborn Otter', icon: '🌊', cost: 0, wait: 0, attack: 2, health: 6, rarity: 'common', archetypes: ['Ocean', 'Mangrove'], species: ['Mustelid'], animal: 'sea otter',
  effects: {tide: true}, flavor: 'The Tidefolk never came ashore. The Legion calls them a story. They call the Legion "the dry ones".',
  propose: 'The Kelp Mangroves (Map 9) Pack 2 pool'},
 {id: 'conger-eel', name: 'Conger Eel', icon: '🐍', cost: 1, wait: 1, attack: 3, health: 7, rarity: 'uncommon', archetypes: ['Ocean', 'Fish'], species: ['Fish'], animal: 'eel',
  effects: {tide: true, fork: true}, flavor: 'It lives in the wreck the Tidefolk sank. It bites both ways out of the hole at once.',
  propose: 'Coral Current (Map 10) Pack 2 pool'},
 {id: 'selkie-wavebinder', name: 'Selkie Wavebinder', icon: '🦭', cost: 1, wait: 2, attack: 2, health: 10, rarity: 'rare', archetypes: ['Ocean', 'Coastal'], species: ['Pinniped'], animal: 'grey seal',
  effects: {tide: true, wave: true}, flavor: 'Half seal, half song. When the Tidefolk need the sea to move, she asks it, and it does.',
  propose: 'a Coral Current (Map 10) skirmish reward, or the faction pool\'s shared side'},
];
// existing Lumber gatherers that sat in no pool: into their biome's map (their source already named that map, or none)
const EXISTING = {
  'land-tiller': ['ml', 3, 'The Long Grass (Map 15), farm country: its On Ready Lumber card sat in no pool'],
  'coral-polyp-colony': ['m7', 2, 'Coral Current (Map 10), reef: its On Ready Lumber card sat in no pool'],
  'rodent-king': ['mh', 2, 'The Briar Maze (Map 12): its source already named the maze; it sat in no pool'],
};
// a main map's Special list (the editor's "+ Load any card"): N21-2's Leech Pools (5-1) field the Sunken Grove's Bog Leech, as 5-3 already did
const SPECIAL = {mw: ['bog-leech']};
const RENAME = {'cataphract-destrier': 'Gilded Roadwarden'}; // lore bible: medieval knights don't fit; owner's pick from 10-16 (action-items "Rename")
const FLAVOR = {'mirrorhide-mutant': 'Something in the high ground changed it. Now it wears the face of whoever stands beside it, and wears it better.'}; // C21-2: the Twin line, now Mimic

const load = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
// the file's own format: Python's json.dumps(indent=2), non-ASCII escaped as \uXXXX
const save = cs=> fs.writeFileSync(CARDS, JSON.stringify(cs, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const uuidOf = id=>{ const h = crypto.createHash('sha1').update('content2-2026-10-24:' + id).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
function serializePools(d){ // the format tools/fold_map_pools.js writes (as tools/rw5_place_new_cards_2026_10_23.js)
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(subs.length){ lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}${j < subs.length - 1 ? ',' : ''}`)); lines.push('   },'); }
    else lines.push('   "submaps": {},');
    lines.push(`   "special": ${ids(m.special)}`, `  }${comma}`); });
  lines.push(' }', '}'); return lines.join('\n') + '\n';
}

function add(){
  const cs = load(), ids = new Set(NEW.map(c=> c.id));
  const keep = cs.filter(c=> !ids.has(c.id)), old = Object.fromEntries(cs.filter(c=> ids.has(c.id)).map(c=> [c.id, c]));
  let nid = Math.max(...keep.map(c=> c.numericId || 0)) + 1;
  for(const spec of NEW){
    const {place, propose, ...c} = spec, prev = old[c.id];
    const card = Object.assign({}, base, c, {numericId: prev ? prev.numericId : nid++, uuid: uuidOf(c.id)});
    if(prev){ card.attack = prev.attack; card.health = prev.health; } // keep a fitted line on a re-run
    if(place){ card.source = {kind: 'pack', tier: place[1], map: place[0]}; card.creatorNote = NOTE + `placed in Pack ${place[1]}, ${place[0]}: ${place[2]}. Stats by the budget (fit).`; }
    else { card.awaitingSource = true; card.creatorNote = NOTE + `the lore bible's thin sub-faction; awaiting a source, proposed: ${propose} (owner call CONTENT2-3). Stats by the budget (fit).`; }
    if(prev && prev.creatorNote && /Fit:/.test(prev.creatorNote)) card.creatorNote = prev.creatorNote;
    keep.push(card);
  }
  for(const c of keep){
    if(EXISTING[c.id]){ const [map, tier, why] = EXISTING[c.id];
      if(!(c.source && c.source.kind === 'pack' && c.source.map === map && c.source.tier === tier)){ c.source = {kind: 'pack', tier, map}; delete c.awaitingSource;
        c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `(owner 13:12 #8, Lumber gatherers per biome): placed in Pack ${tier}, ${map}: ${why}.`; } }
    if(RENAME[c.id] && c.name !== RENAME[c.id]){ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `renamed ${c.name} -> ${RENAME[c.id]} (the lore bible: no medieval knights; the 10-16 rename, the card's own "gilded" flavour); id kept.`; c.name = RENAME[c.id]; }
    if(FLAVOR[c.id] && c.flavor !== FLAVOR[c.id]){ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + '(C21-2) flavour: the old line ("Now there are two of it") fit Twin, not Mimic.'; c.flavor = FLAVOR[c.id]; }
  }
  save(keep);
  const doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
  const placeAll = Object.assign({}, Object.fromEntries(NEW.filter(c=> c.place).map(c=> [c.id, c.place])), EXISTING);
  Object.entries(placeAll).forEach(([id, [map]])=>{ const e = doc.maps[map] = normalizeEntry(doc.maps[map] || {}); if(!e.cards.includes(id)) e.cards.push(id); });
  Object.entries(SPECIAL).forEach(([map, list])=>{ const e = doc.maps[map] = normalizeEntry(doc.maps[map] || {}); list.forEach(id=>{ if(!e.special.includes(id)) e.special.push(id); }); });
  fs.writeFileSync(POOLS, serializePools(doc));
  console.log('cards:', NEW.length, 'new,', Object.keys(EXISTING).length, 'placed existing; numericIds', NEW.map(c=> keep.find(x=> x.id === c.id).numericId).join(','));
}

function budgetTools(){ const SC = require('./card_retune_2026_10_19.js').SC; const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'))); return {SC, T}; }
function use(SC, T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return {ok: b1.ok && bs.ok && b1.x1 / b1.N <= 1, u: b1.x1 / b1.N, N: b1.N, S: b1.S}; }
function fit(){
  const {SC, T} = budgetTools(), cs = load(), ids = new Set(NEW.map(c=> c.id)), rows = [];
  for(const c of cs){ if(!ids.has(c.id)) continue;
    const spec = NEW.find(x=> x.id === c.id), sA = spec.attack, sH = spec.health; let best = null;
    for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), r = use(SC, T, c, A, H);
      if(r.ok && (!best || r.u > best.u || (r.u === best.u && A + H > best.A + best.H))) best = {A, H, u: r.u, N: r.N, S: r.S}; }
    if(!best){ rows.push(`${c.id}: no legal line`); continue; }
    const was = `${c.attack}/${c.health}`; c.attack = best.A; c.health = best.H;
    c.creatorNote = c.creatorNote.replace(/ Fit: .*$/, '').replace(/ Stats by the budget \(fit\)\.$/, '') + ` Fit: the formula line on its ${sA}:${sH} shape, ${best.A}/${best.H} (${Math.round(best.u * 100)}% of N ${best.N}, S ${Math.round(best.S * 100) / 100}).`;
    rows.push(`${c.id.padEnd(22)} ${was.padStart(6)} -> ${best.A}/${best.H}  ${Math.round(best.u * 100)}% of N ${best.N}  S ${Math.round(best.S * 100) / 100}`); }
  save(cs); rows.forEach(r=> console.log(r));
}
function check(){
  const {SC, T} = budgetTools(), cs = load(), by = Object.fromEntries(cs.map(c=> [c.id, c])), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8')); let bad = 0;
  for(const spec of NEW){ const c = by[spec.id]; if(!c){ console.log('missing', spec.id); bad++; continue; }
    const r = use(SC, T, c, c.attack, c.health); if(!r.ok){ console.log('over budget', spec.id, Math.round(r.u * 100) + '%'); bad++; }
    if(spec.place && !(doc.maps[spec.place[0]].cards || []).includes(spec.id)){ console.log('not in pool', spec.id); bad++; }
    if(!spec.place && !c.awaitingSource){ console.log('should await a source', spec.id); bad++; } }
  const n = cs.map(c=> c.numericId).filter(x=> x != null), dup = n.filter((x, i)=> n.indexOf(x) !== i); if(dup.length){ console.log('duplicate numericId', dup.join(',')); bad++; }
  console.log(bad ? `${bad} problem(s)` : `ok: ${NEW.length} new cards on budget, placed or awaiting`); process.exit(bad ? 1 : 0);
}
if(require.main === module){ if(CMD === 'add') add(); else if(CMD === 'fit') fit(); else check(); }
module.exports = {NEW, EXISTING, RENAME, FLAVOR};
