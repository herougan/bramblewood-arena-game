#!/usr/bin/env node
// 2026-11-12 (package SIDE1, phase A; owner 23:50: "Help me do "yes/no" for the submaps like the maps - then return the SK, WK, and re-card the
// skirmishes ... I want to be strict with 1-3 skills per map"): Claude's Yes / No picks for every side map of Maps 0-21, applied to the side lists.
// The rules, checked here (the run stops on a break):
//   - NEW! at most 3 (a Baby card does not count, as in the Map cards window), Carried at most 8 (the game's ui37Targets for a side map);
//     NEW! = on no main list up to the map the side map opens after; Carried = on one (lib carriedIndex, the window's ui44Split);
//   - the map's skills = the distinct skills of its counted NEW! cards, 1-3; light skills (plain Flying, Tide, Diurnal, Nocturnal ...: the two-skill
//     rule's half-count list) are shown but not counted. Carried cards lean on the same skills (or none);
//   - each fight reward of the side map (a card whose source is this map) is on its list and NEW! (a first-clear card must be on its list, LISTFIX3);
//   - a NEW! card can be had: a pack card, a reward, or a raid card (a card with no source is enemy-only and is no player's unique card);
//   - the owner's cuts stay out (his 11-01 export: cut + cutNow on that side map; House Cat and Armadillo Guard, SKIR3's top-ups, among them);
//   - Rares from Map 10 (G.roadRarityOk at the map the side map opens after);
//   - The Old Bramble keeps the owner's own picks as his flags; the list takes three of them (he picked six NEW! cards; decision SIDE1-1).
// Carried leans on the parent map's own cards: K14 counts them as the side map's own, so a fight may field more than 1 copy (bal7 uniqueOf).
// Writes: docs/design/side-picks-proposal-2026-11-12.json (Yes / No per card, the shape of map-picks-owner-2026-11-12.json), canonical/map-pools.json
// (side lists only), then as SKIR3 did: canonical/cards.json `unattainable` flags (SKIR1's rule; a card back on a list can be had again, one off every
// list cannot) and canonical/card-obtain-maps.json (tools/forge_curve_2026_10_19.js maps, the budget's map for the tools and the hub);
// supabase/proposed/20261112_side1_map_picks.sql (the flags as the owner's, run only on "apply it"); docs/balance/side1/lists-2026-11-12.json (record).
//   node tools/side1/lists_2026_11_12.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib_side1_2026_11_12.js'), { ROOT, J, C } = L;
const DRY = process.argv.includes('--dry');
const P0 = J('canonical/map-pools.json'), P = P0.maps, G = L.lb().G;
// The picks. new: the side map's own cards (Yes, NEW!); carried: Yes, Carried; why: one line per pick or drop; no: cards on the list today (or the
// owner's picks) that go, with why. Theme first (the map's blurb and fight names, docs/design/side-map-cards-2026-11-10.json fits / off).
const PICKS = {
  mo: { theme: 'thorns older than the village (Thorn Path, The Briar Ring, Root Gate)',
    new: { 'ent': 'the 0-B-4 reward; an old tree-owl', 'elder-willow': 'your pick; an old tree', 'thorn-shrike': 'your pick; the butcher bird of the thorns' },
    carried: { 'bramble-sprout': 'Thorns; a bramble hedgehog', 'barkplate-beetle': 'Thorns', 'quill-thorn-boar': 'Thorns', 'quillguard': 'a porcupine', 'bramblewood-lynx': 'Bramblewood by name', 'sergeant-bramblefox': 'Bramblewood by name', 'farm-dog': "Map 0's own: K14 lets a fight field more than 1", 'earthworm': 'Root Gate; Map 0' },
    no: { 'strangler-vine': 'your pick, but it has no source: no player can own it (give it one and it can take Elder Willow\'s place)', 'shimmerwing-stag': 'your pick; over NEW! 3 and a 4th skill (Evasive); it stays a Redwood reward (on The Undercroft list)', 'hedgehog-herbalist': "your pick, but it is The Sunken Grove's 5-A-4 reward (one unique card a map); decision SIDE1-2", 'house-cat': 'you cut it here 11-01 (back by SKIR3\'s top-up)' } },
  mq: { theme: 'a clover meadow: rabbits, bees and mice (Bee Lines, Puddle Hop, The Old Hare)',
    new: { 'lucky-hopper': 'the 1-A-5 reward (The Old Hare)', 'jackrabbit-sprinter': 'Quick; a meadow hare', 'clover-butterfly': 'Clover by name (Flying only)' },
    carried: { 'chipmunk-cavalry': 'Quick; Thistlewood\'s own', 'cottontail': 'a meadow rabbit', 'robin-redbreast': 'Thistlewood\'s own; a field bird', 'dormouse': 'Thistlewood\'s own; a meadow mouse', 'puddle-skimmer': 'Thistlewood\'s own; Puddle Hop, and the map\'s thunderstorm (Rainrunner)', 'honey-bee': 'Bee Lines', 'bee-forager': 'Bee Lines' },
    no: { 'harvest-mouse': 'a starter with no source (no player\'s unique card)', 'ant-hill': 'a 3rd skill line (On Turn Start) for an ant mound', 'bee-sentry': 'a 2nd skill (Venomous) on a carried bee', 'cricket-drummer': 'Inspiring, off the map\'s skills', 'slow-worm': 'off the map\'s skills (Thanatosis)', 'earthworm': 'a soil card, not the meadow\'s' } },
  mp: { theme: 'a still pond of beaver dams (Beaver Dam, The Lodge, The Lodge Matriarch)',
    new: { 'riverworks-bastion': 'the 2-A-7 reward; a beaver dam (Rampart)', 'lodge-engineer': 'The Lodge (Timbered, Delivery)', 'dam-keeper-beaver': 'Beaver Dam (Rampart)' },
    carried: { 'beaver-lumberjack': 'Delivery; Pebble Beach\'s own', 'muskrat-reedgatherer': 'Delivery; a pond muskrat', 'muskrat-lodgekeeper': 'a lodge muskrat', 'duck-paddler': 'Duck Row', 'snapstick-turtle': 'a pond turtle', 'pond-algae': 'the lily pads', 'raft-spider': 'a pond spider', 'water-shrew': 'a pond shrew' },
    no: { 'box-turtle': 'Cower, a 4th skill; a forest turtle', 'old-sturgeon': 'Armor, a 4th skill (2-A-7\'s leader: Phase B keeps or swaps it)', 'platypus-spur': 'Venomous, off the map\'s skills' } },
  mg: { theme: 'a smugglers\' sea cave (Smugglers\' Stash, The Glowing Pool, The Grotto Keeper)',
    new: { 'octopus-tactician': 'the 2-B-4 reward (The Grotto Keeper)', 'raccoon-nightcrew': 'Stealth; the smugglers\' night crew', 'salvager-hermit-crab': 'Salvage: whatever the smugglers left' },
    carried: { 'gull-thief': 'a thief; Pebble Beach\'s own', 'pincushion-urchin': 'Pebble Beach\'s own', 'limpet-clinger': 'Pebble Beach\'s own', 'open-ocean-hermit-crab': 'Pebble Beach\'s own', 'driftwood-crab': 'Pebble Beach\'s own', 'rock-pool-starfish': 'Pebble Beach\'s own; the cave\'s pools' },
    no: { 'trash-panda-trickster': 'Bounty, a 4th skill (it stays on the Tutorial list)', 'glow-worm': 'no source: no player\'s unique card' } },
  ms: { theme: 'a swamp that swallowed a forest (Rotting Roots, Gator Hollow, Moss Weir)',
    new: { 'hedgehog-herbalist': 'the 5-A-4 reward (off theme; decision SIDE1-2)', 'peat-cutter-vole': 'Moss Weir: a peat vole (Delivery)', 'mudflat-godwit': 'a wader (Tide only)', 'snapper-hatchling': 'a Baby (not counted): a swamp turtle' },
    carried: { 'swamp-alligator': 'Gator Hollow; Gatorback\'s own', 'constrictor-coil': 'Gatorback\'s own', 'muskrat-reedgatherer': 'Delivery; Gatorback\'s own', 'mudpuppy': 'Gatorback\'s own', 'newt-doctor': 'Gatorback\'s own', 'nutria-reedcutter': 'Delivery; a swamp nutria', 'cypress-root-lurker': 'Rotting Roots: a drowned-tree alligator', 'crocodile-ambusher': 'a swamp crocodile' },
    no: { 'venomlord-serpent': 'Venomous and Guardian: 4-5 skills with the reward\'s two', 'caiman-hatchling': 'Ambush on a Baby; one Baby is enough', 'anhinga-spearbird': 'Pounce, off the map\'s skills' } },
  mz: { theme: 'roots, worms and fungus under the Morel Hollow (Glowcap Grotto, The Rot Heart, The Mycelium Mind)',
    new: { 'rootworm-colony': 'the 7-A-5 reward (Poison Barbs)', 'fungal-colossus': 'The Mycelium Mind (Progeny, Bloom)', 'tunnel-wyrm': 'a root-tunnel worm, plain' },
    carried: { 'rot-swollen-carcass': 'Progeny; Morel Hollow\'s own', 'puffball-bombardier': 'Bloom; Morel Hollow\'s own', 'fungus-gnat-cloud': 'Morel Hollow\'s own', 'leopard-slug': 'Morel Hollow\'s own', 'compost-grub': 'Morel Hollow\'s own', 'hawthorn-shieldbug': 'Morel Hollow\'s own', 'planarian-splitter': 'a flatworm', 'earthworm': 'Root Cellar' },
    no: { 'millipede-hauler': 'Armor and Progeny: a 4th skill', 'pill-bug': 'Armor, a 4th skill', 'wolf-spider-mother': 'a Rare before Map 10; surface hunter' } },
  mn: { theme: 'shining cave walls and the things that like shiny things (Crystal Stair, The Echo Pool, The Gem Hoarder)',
    new: { 'lantern-spark-fly': 'the 8-A-4 reward (Illuminate)', 'glimmer-spider': 'Glimmer by name (Venomous)', 'cave-swiftlet': 'The Echo Pool (Echolocation)' },
    carried: { 'sulfur-cinder-moth': 'Illuminate; Caves\' own', 'gallery-orb-weaver': 'Venomous; Caves\' own', 'echo-screecher': 'The Echo Pool; Caves\' own', 'stalactite-golem': 'Crystal Stair; Caves\' own', 'cave-olm': 'Caves\' own', 'quarry-mole': 'Caves\' own', 'giant-cave-huntsman': 'Caves\' own', 'barrow-leech-bat': 'Caves\' own' },
    no: { 'oilbird': 'no source', 'magpie-collector': 'On Death, a 4th skill', 'blind-cave-fish': 'Evasive and Darksight: 4-5 skills', 'star-nosed-mole': 'a river mole', 'upside-down-bat': 'Diurnal in a cave' } },
  mj: { theme: 'an otter ferry wreck past the reef wall (The Drowned Deck, Cargo Hold, The Undertow)',
    new: { 'blue-ringed-octopus': 'the 10-A-5 reward (Octolash)', 'kraken-spawnling': 'a young kraken in the wreck\'s hold (Fork, Gash)' },
    carried: { 'riptide-eel': 'Coral Current\'s own', 'coral-current-eel': 'Coral Current\'s own', 'reef-shark': 'Coral Current\'s own', 'moon-jelly': 'Coral Current\'s own', 'sea-turtle-elder': 'Coral Current\'s own', 'krill-swarm': 'Coral Current\'s own', 'giant-clam': 'Coral Current\'s own' },
    no: { 'humpback-elder': 'Inspiring, a 4th skill', 'abyss-lantern-squid': 'Shock, a 4th skill; a raid card', 'coral-polyp-colony': 'a shallow reef card (Delivery, Meld)', 'clownfish-scout': 'a bright shallow reef fish' } },
  mv: { theme: 'the oldest nests on the mountain (Cliff Ledge, The High Roost, The Roost Mother)',
    new: { 'wound-reaver': 'the 11-A-4 reward (off theme: a volcanic lizard; Phase B may swap it)', 'great-horned-owl': 'The High Roost (On Ready damage)', 'sparrow-chick': 'a Baby (not counted): a nest chick' },
    carried: { 'eyrie-warden': 'On Ready damage; Eyrie Heights\' own', 'eagle-owl-quartermaster': 'Eyrie Heights\' own', 'golden-eagle-diver': 'Eyrie Heights\' own', 'the-gannet-queen': 'your Map 11 pick', 'chamois-leaper': 'Cliff Ledge; Eyrie Heights\' own', 'anvil-thrush': 'Eyrie Heights\' own', 'peak-condor': 'a high mountain raptor', 'peregrine-stooper': 'a cliff falcon' },
    no: { 'alpine-swift': 'Quick, a 4th skill (on Map 21\'s list)', 'apollo-butterfly': 'Thorns, a 4th skill (on Map 21\'s list)', 'chipmunk-hoarder': 'a ground rodent' } },
  my: { theme: 'the rainforest roof (Sloth Boughs, Dart Frogs, The Jaguar\'s Path)',
    new: { 'jaguar-stalker': 'the 14-A-5 reward (Quick)', 'kinkajou-lurker': 'the 14-A-3 reward (Nocturnal only)', 'hercules-beetle': 'the 14-A-4 reward (Mighty)' },
    carried: { 'bramblewood-macaque': 'Savanna Reaches\' own; a canopy monkey', 'proboscis-monkey': 'a canopy monkey', 'camouflage-frog': 'Dart Frogs', 'fishing-cat': 'a rainforest cat', 'amber-cicada': 'the canopy\'s drone', 'mosquito-cloud': 'the rain\'s swarm' },
    no: { 'slow-loris': 'held (the Canopy\'s rainforest animals, RP5); no source', 'howler-monkey': 'over NEW! 3 (three rewards)', 'toucan-courier': 'held; no source' } },
  mi: { theme: 'a blue ice cave under the tundra (Frost Tunnel, Glacier Gut, The Hollow King)',
    new: { 'greenland-shark': 'the 17-A-4 reward (Carrion, Armor)', 'frostbitten-wolverine': 'the cold has teeth (Frostbite)', 'harp-seal-pup': 'a Baby (not counted): an ice seal' },
    carried: { 'snow-ermine': 'Wolfsbane\'s own', 'ringed-seal': 'lives in ice caves; Wolfsbane\'s own', 'harbor-seal': 'Wolfsbane\'s own', 'glacier-yak': 'Glacier Gut; Wolfsbane\'s own', 'walrus-icebreaker': 'Wolfsbane\'s own', 'ice-crevasse-wolf': 'a crevasse wolf; Wolfsbane\'s own', 'polar-bear': 'Wolfsbane\'s own' },
    no: { 'lemming-swarm': 'Swarm and Brood: 4-5 skills', 'talus-pika': 'Delivery, a 4th skill', 'snow-owl-sentinel': 'Expose, off the map\'s skills', 'arctic-tern': 'a sky bird in a cave' } },
  mpd: { theme: 'white sand and bone, no water (Bleached Flats, Dust Devils, The Quicksand Queen)',
    new: { 'quicksand-queen': 'the 18-A-9 reward (Trap, Tangleweed)', 'sandstorm-roc': 'Dust Devils (Dry)' },
    carried: { 'antlion-pit': 'Trap; Glass Dunes\' own', 'dune-jackal': 'Mirage Jackals (Dry); Glass Dunes\' own', 'barrel-cactus': 'Dry; Glass Dunes\' own', 'roadrunner-courier': 'Glass Dunes\' own', 'horned-lizard': 'Glass Dunes\' own', 'nightjar-drifter': 'Glass Dunes\' own', 'sunbittern-strider': 'Glass Dunes\' own', 'caustic-scorpion': 'a desert scorpion' },
    no: { 'armadillo-guard': 'you cut it here 11-01 (back by SKIR3\'s top-up)', 'dromedary': 'Drought, a 4th skill', 'sand-widow': 'Venomous, a 4th skill', 'dust-hyena': 'a savanna hyena (On Kill, Carnage)' } },
  m9: { theme: 'a furnace of cracked black stone (Slag Runners, Basalt Vanguard, The Phoenix Ember King)',
    new: { 'ember-revenant': 'the 19-A-10 reward (Undead, Pierce)', 'grindstone-boar': 'Slag Runners (Friction)' },
    carried: { 'fire-salamander': 'Salamander Vents; Ashen Spurn\'s own', 'obsidian-scorpion': 'Ashen Spurn\'s own', 'smoke-raccoon': 'Ashen Spurn\'s own', 'pumice-beetle': 'volcanic', 'cinder-hornet': 'Cinder Swarm', 'cinder-gecko': 'Vent Skitter', 'basalt-boar': 'Basalt Vanguard', 'cinder-skeleton': 'Undead' },
    no: { 'ore-smelter-mole': 'Heavy Metal and Delivery: 5 skills', 'hellbender': 'no source', 'sulfur-vent-crab': 'Eye of the Volcano\'s vent crab', 'anvil-thrush': 'a field bird' } },
  me: { theme: 'the crater, where the dead keep the fire company (The Lich\'s Kiln, Heart of the Mountain, Scorched Boars)',
    new: { 'the-contradiction': 'the 20-A-4 reward (Rage, Regenerate)', 'obsidian-lich': 'The Lich\'s Kiln (Regenerate, Armor)', 'ash-moth': 'ash (Flying, Nocturnal only)' },
    carried: { 'berserker-boar': 'Rage; Scorched Boars; Sundered Peak\'s own', 'basalt-boar': 'Scorched Boars; Sundered Peak\'s own', 'sulfur-vent-crab': 'The Vent Crabs; Sundered Peak\'s own', 'ur-elk': 'Rage; Sundered Peak\'s own', 'magma-salamander': 'Sundered Peak\'s own', 'obsidian-scorpion': 'Armor', 'honey-badger-fury': 'Rage' },
    no: { 'cinder-skeleton': 'Undead and Requiem: 5 skills', 'ashbone-ghoul': 'Remember and On Death: 5 skills' } },
  mx: { theme: 'where the mountain\'s fire is born (Obsidian Run, The Wyrm\'s Antechamber, The Caldera Wyrm)',
    new: { 'caldera-wyrm': 'the 20-B-4 reward (Armor, On Death, Pounce)', 'fire-drake-hatchling': 'the 20-B-4 reward, a Baby (not counted)' },
    carried: { 'magma-salamander': 'Sundered Peak\'s own', 'fumarole-ibex': 'Pounce; Sundered Peak\'s own', 'obsidian-scorpion': 'Obsidian Run (Armor)', 'quillback-elder': 'Armor', 'fire-salamander': 'a fire salamander', 'basalt-boar': 'Sundered Peak\'s own', 'ur-elk': 'Sundered Peak\'s own' },
    no: { 'gorge-wyrm': 'Cleave and Earthquake: 5 skills', 'ember-jackal': 'Frenzy, a 4th skill', 'cinder-stoker': 'Heat, a 4th skill' } },
};
const RECF = path.join(ROOT, 'docs', 'balance', 'side1', 'lists-2026-11-12.json'), OUTF = path.join(ROOT, 'docs', 'design', 'side-picks-proposal-2026-11-12.json');
const OWNER = J('docs/design/map-picks-owner-2026-11-12.json').maps;
const nm = id => (C[id] || {}).name || id;
const counted = id => !L.baby(id);
const errs = [], rec = { about: 'SIDE1 side lists (tools/side1/lists_2026_11_12.js): Claude\'s Yes / No picks, NEW! 3 / Carried 8, 1-3 skills a map', built: '2026-11-12', maps: {} };
const out = { source: 'Claude\'s proposal (package SIDE1, 2026-11-12), for the owner to flip in the Map cards window; not his flags until "apply it" runs supabase/proposed/20261112_side1_map_picks.sql. The Old Bramble keeps his own flags (his 6 picks); its list takes 3 of them.',
  rules: { limits: L.SIDE_LIMIT, skills: '1-3 distinct skills on a side map\'s counted NEW! cards; light skills (plain Flying, Tide, Diurnal, Nocturnal, Crepuscular ...) and Baby cards not counted', carried: 'on a main list up to the map the side map opens after (the window\'s Carried)' }, maps: {} };
const before = {};
L.SIDES.forEach(s => {
  const pk = PICKS[s], par = L.parentOf(s, P), un = L.unlockOf(s), idx = L.carriedIndex(un, P), cuts = L.ownerCuts(s);
  before[s] = P[par].submaps[s].slice();
  const neu = Object.keys(pk.new), car = Object.keys(pk.carried), list = neu.concat(car);
  const bad = m => errs.push(s + ': ' + m);
  list.forEach(id => { if (!C[id]) bad('no card ' + id); });
  neu.forEach(id => { if (idx.has(id)) bad(id + ' is Carried (a main list up to Map ' + un + ' holds it), not NEW!'); const src = (C[id] || {}).source; if (!src || !src.kind) bad(id + ' has no source: no player can own it'); });
  car.forEach(id => { if (!idx.has(id)) bad(id + ' is not on a main list up to Map ' + un + ': not Carried'); });
  const nNew = neu.filter(counted).length; if (nNew < 1 || nNew > L.SIDE_LIMIT.own) bad(`NEW! ${nNew} (1-${L.SIDE_LIMIT.own})`); if (car.length > L.SIDE_LIMIT.carried) bad(`Carried ${car.length} > ${L.SIDE_LIMIT.carried}`);
  const sk = new Map(), light = new Set(); neu.filter(counted).forEach(id => L.skillsOf(C[id]).forEach(x => { if (x.light) light.add(x.label); else sk.set(x.key, x.label); }));
  if (sk.size < 1 || sk.size > 3) bad(`${sk.size} skills (${[...sk.values()].join(', ')})`);
  cuts.concat(['house-cat', 'armadillo-guard']).forEach(id => { if (list.includes(id)) bad(id + ' is an owner cut'); });
  L.CARDS.filter(c => c.source && c.source.kind === 'map' && c.source.id === s).forEach(c => { if (!neu.includes(c.id)) bad('reward ' + c.id + ' (' + c.source.node + ') not on the list as NEW!'); });
  list.forEach(id => { const d = C[id]; if (d && !G.roadRarityOk(d.rarity, un, 'skirmish', s)) bad(id + ' (' + d.rarity + ') breaks the rarity cap at Map ' + un); });
  // carried skills outside the map's (lean, not a rule: recorded)
  const carOff = car.map(id => ({ id, off: L.skillsOf(C[id]).filter(x => !x.light && !sk.has(x.key)).map(x => x.label) })).filter(x => x.off.length);
  const ownerYes = (OWNER[s] || {}).yes || [];
  const no = [...new Set(Object.keys(pk.no || {}).concat(before[s], ownerYes))].filter(id => !list.includes(id) && C[id]);
  const why = Object.assign({}, pk.new, pk.carried); no.forEach(id => { why[id] = (pk.no || {})[id] || 'off the list: theme or skills (not one of the picks)'; });
  out.maps[s] = { name: L.mapName(s), mapNo: G.mapNumberOf(s), side: true, parent: par, unlockAfterNo: un, theme: pk.theme, skills: [...sk.values()], lightSkills: [...light], yes: list, no, why,
    ownerFlags: ownerYes.length ? { yes: ownerYes, note: 'his own flags stay; this proposal does not overwrite them' } : undefined };
  rec.maps[s] = { parent: par, unlockAfterNo: un, neu, car, nNew, nCar: car.length, skills: [...sk.values()], lightSkills: [...light], carriedOffSkills: carOff, before: before[s], after: list,
    dropped: before[s].filter(id => !list.includes(id)), added: list.filter(id => !before[s].includes(id)) };
});
if (errs.length) { console.log('rule breaks:\n  ' + errs.join('\n  ')); process.exit(1); }
L.SIDES.forEach(s => { const r = rec.maps[s]; console.log(`${s.padEnd(4)} ${L.mapName(s).padEnd(20)} after Map ${String(r.unlockAfterNo).padEnd(2)} NEW! ${r.nNew} Carried ${r.nCar}  skills: ${r.skills.join(', ')}${r.lightSkills.length ? ' (+' + r.lightSkills.join(', ') + ')' : ''}  | NEW!: ${r.neu.map(nm).join(', ')}`); });
// apply: the side lists
L.SIDES.forEach(s => { P[L.parentOf(s, P)].submaps[s] = rec.maps[s].after.slice(); });
const listed = new Set(), wasListed = new Set(); const all = (maps, set) => Object.values(maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => set.add(id)));
all(P, listed); all(J('canonical/map-pools.json').maps, wasListed);
rec.leftLists = [...wasListed].filter(id => !listed.has(id)).sort(); rec.newOnLists = [...listed].filter(id => !wasListed.has(id)).sort();
console.log('off every list now:', rec.leftLists.join(' ') || '-'); console.log('back on a list:', rec.newOnLists.join(' ') || '-');
if (DRY) { console.log('dry run'); process.exit(0); }
const { serialize } = require('../fold_map_pools.js');
fs.writeFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), serialize(P0));
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1) + '\n');
// unattainable flags and the obtain maps (SKIR3's code, tools/skir3/lists_2026_11_12.js; a fresh process reads the new lists)
const flagOut = cp.execFileSync(process.execPath, ['-e', `
  const LMP = require('./tools/lib_map_pools.js'), LB = require('./tools/lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G, fs = require('fs');
  const cards = JSON.parse(fs.readFileSync('canonical/cards.json', 'utf8')), listed = new Set();
  Object.values(JSON.parse(fs.readFileSync('canonical/map-pools.json', 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
  const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  console.log(JSON.stringify({ clear, set }));`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const fl = JSON.parse(flagOut.trim().split('\n').pop());
if (fl.clear.length || fl.set.length) {
  const CARDS = J('canonical/cards.json'), byId = {}; CARDS.forEach(c => { byId[c.id] = c; });
  fl.clear.forEach(id => { delete byId[id].unattainable; }); fl.set.forEach(id => { byId[id].unattainable = true; });
  fs.writeFileSync(path.join(ROOT, 'canonical', 'cards.json'), JSON.stringify(CARDS, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
}
rec.flags = { cleared: fl.clear, set: fl.set };
console.log('unattainable cleared:', fl.clear.join(' ') || '-', '| set (left play):', fl.set.join(' ') || '-');
const obt0 = J('canonical/card-obtain-maps.json').maps;
cp.execFileSync(process.execPath, ['tools/forge_curve_2026_10_19.js', 'maps'], { cwd: ROOT, stdio: 'ignore' });
const obt1 = J('canonical/card-obtain-maps.json').maps;
rec.obtainMaps = [...new Set(Object.keys(obt0).concat(Object.keys(obt1)))].filter(id => obt0[id] !== obt1[id]).map(id => ({ id, before: obt0[id] == null ? null : obt0[id], after: obt1[id] == null ? null : obt1[id] }));
console.log('obtain maps moved:', rec.obtainMaps.map(x => `${x.id} ${x.before}->${x.after}`).join(', ') || '-');
// the proposed SQL: each side map's row, as ui37Publish writes it; only where the owner has no flags there yet (The Old Bramble keeps his)
const sql = ['-- 2026-11-12 (package SIDE1, phase A). PROPOSED ONLY: run it only after the owner says "apply it" for this change.',
  '-- Claude\'s side-map Yes picks (docs/design/side-picks-proposal-2026-11-12.json) as the owner\'s Map cards flags (card_overrides rows',
  '-- __cfg:map-picks:<side map>, the shape ui37Publish writes: {kind, mapId, mapNo, yes, no, targets}). A row the owner already filled is left alone',
  '-- (The Old Bramble has his own picks and is not in this file). No flag reads as No in the window, so only the Yes cards are written.'];
L.SIDES.filter(s => !((OWNER[s] || {}).yes || []).length).forEach(s => {
  const m = out.maps[s], data = { kind: 'map-picks', mapId: s, mapNo: m.mapNo, yes: m.yes, no: [], targets: {} };
  sql.push(`insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)\n  values ('__cfg:map-picks:${s}', '${JSON.stringify(data).replace(/'/g, "''")}'::jsonb, false, null, now())\n  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()\n  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;`);
});
fs.writeFileSync(path.join(ROOT, 'supabase', 'proposed', '20261112_side1_map_picks.sql'), sql.join('\n') + '\n');
fs.mkdirSync(path.dirname(RECF), { recursive: true }); fs.writeFileSync(RECF, JSON.stringify(rec, null, 1) + '\n');
console.log('-> canonical/map-pools.json (side lists), ' + path.relative(ROOT, OUTF) + ', supabase/proposed/20261112_side1_map_picks.sql, ' + path.relative(ROOT, RECF) + (fl.clear.length || fl.set.length ? ', canonical/cards.json flags' : '') + ', canonical/card-obtain-maps.json');
