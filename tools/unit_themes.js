#!/usr/bin/env node
// Units by theme (2026-10-19, package UC; owner 08:49: "To move forward, let's separate the units thematically? Then we pick and choose,
// then do post-balancing — meaning we apply skills post-facto. Dangerous versions of a biome monster can come later in the game.").
//
// Writes canonical/unit-themes.json: every creature card (live and pool) tagged with
//   biomes   (habitat; the first is the main one)    family (insect, bird, mammal, …; sub = its species)
//   faction  (the lore bible's peoples and sub-factions, or the wild)    size (tiny … colossal, swarm)    stage (road stage 1-4)
//   body     (its stats without skills: Lumber, Wait, Attack, Health, damage type, resists) and, apart, its current skills
//   maps     (home: where it is earned or was made for; fights: the enemy decks it is in, with copies)
//   variant  (an existing later / younger version of another card) and proposed later variants ("Dire" / "Elder" / "Ancient")
// The tags come from heuristics (map biomes, archetypes, species, names, emoji) and the hand-checked table MANUAL below, which wins.
// The hub's 🗂 Units by theme tab (tools/hub/units_tab.js) reads the file; the owner's picks per map live in the hub's db
// (collection "unitPicks"); tools/hub/pull_unit_picks.md says how Claude reads them for the post-balance step.
//
//   node tools/unit_themes.js            write canonical/unit-themes.json and print the counts
//   node tools/unit_themes.js --review   also print every unit's tags and where each came from (for hand-checking)
//   node tools/unit_themes.js --check    exit 1 when the file on disk is not what the tool would write now
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'canonical', 'unit-themes.json');
const argv = process.argv.slice(2);
const B = require('./lib_bramble.js'), G = B.G;
const SC = require('./skill_costs.js'), SCT = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
// the road's rarity ladder, read from arena_app.js so it stays in step (ROAD_RARITY_STEPS / _ALIAS)
const RSTEPS = new Function(B.grab('ROAD_RARITY_STEPS') + '\nreturn ROAD_RARITY_STEPS;')(), RALIAS = new Function(B.grab('ROAD_RARITY_ALIAS') + '\nreturn ROAD_RARITY_ALIAS;')();
const rarStep = r=>{ r = r || 'common'; const i = RSTEPS.indexOf(RALIAS[r] || r); return i < 0 ? 0 : i; };
const RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
// Animals (2026-10-19, package UT): each card's `animal` / `subtype` (python3 tools/animal_tags.py) and the animal's kind (its group)
// from that tool's report, so the units can be grouped by animal as well as by theme.
const ATAGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8'));
const AGROUP = {}; ATAGS.cards.forEach(r=>{ if(r.animal) AGROUP[r.animal] = r.group; });

// ---------- the vocabularies ----------
// Biomes in road order. kin: where a later, dangerous version of one of its creatures could live when the biome has no later map.
const BIOMES = [
  ['meadow-forest', '🌳', 'Meadow & woodland', ['redwood', 'long-grass', 'maze-briar']],
  ['river', '🏞️', 'River & pond', ['mangrove', 'swamp']],
  ['coast', '🐚', 'Coast & shore', ['mangrove', 'reef-ocean', 'caves']],
  ['cliffs', '🪨', 'Cliffs (sea cliffs, painted cliffs)', ['mountain-sky']],
  ['swamp', '🪷', 'Swamp & bog', ['mangrove', 'fungal']],
  ['fungal', '🍄', 'Fungal hollow', ['caves']],
  ['caves', '🦇', 'Caves & burrows', ['volcanic-ash']],
  ['mangrove', '🌿', 'Mangrove & kelp', ['reef-ocean']],
  ['reef-ocean', '🪸', 'Reef & ocean', []],
  ['mountain-sky', '🏔️', 'Mountain & sky', ['volcanic-ash']],
  ['maze-briar', '🌹', 'Briar maze', ['redwood']],
  ['redwood', '🪵', 'Redwood deep', ['taiga']],
  ['savanna', '🦒', 'Savanna', ['jungle', 'village-keep']],
  ['jungle', '🌴', 'Jungle canopy', ['volcanic-ash']],
  ['long-grass', '🌾', 'Long grass', ['village-keep']],
  ['taiga', '🌲', 'Taiga', ['tundra-ice']],
  ['tundra-ice', '🧊', 'Tundra & ice', ['volcanic-ash']],
  ['desert-glass', '🏜️', 'Glass dunes', ['pale-desert']],
  ['pale-desert', '🦴', 'Pale desert', ['volcanic-ash']],
  ['volcanic-ash', '🌋', 'Volcanic & ash', []],
  ['village-keep', '🏰', 'Village & keep', []],
].map(([id, icon, label, kin])=> ({id, icon, label, kin}));
const BIOME = {}; BIOMES.forEach(b=> BIOME[b.id] = b);
// Each map's biome (the main one; THEMES in tools/thematic_pass_2026_10_19.js names the identities). MAP_BIOMES_MORE: maps with a
// second identity; a card earned there takes the one its own types match, else the main one.
const MAP_BIOMES_MORE = {m1:['river'], m3:['mountain-sky', 'tundra-ice'], m11:['mountain-sky'], m22:['tundra-ice', 'mountain-sky'], mg:['coast'], mo:['taiga']};
const MAP_BIOME = {m1:'meadow-forest', mtut:'meadow-forest', mo:'meadow-forest', mf:'meadow-forest', mq:'meadow-forest', mb:'coast', mp:'river', mg:'caves',
  mc:'cliffs', m2:'river', mw:'swamp', ms:'swamp', m8:'swamp', mm:'swamp', mu:'fungal', mz:'fungal', m4:'caves', mn:'caves', mk:'mangrove', m7:'reef-ocean', mj:'reef-ocean',
  m10:'mountain-sky', mv:'mountain-sky', mh:'maze-briar', mr:'redwood', m5:'savanna', my:'jungle', ml:'long-grass', mt:'taiga', m6:'tundra-ice', mi:'tundra-ice',
  md:'desert-glass', mpd:'pale-desert', m3:'volcanic-ash', m9:'volcanic-ash', m11:'volcanic-ash', me:'volcanic-ash', mx:'volcanic-ash', m21:'mountain-sky',
  m22:'volcanic-ash', mlb:'caves', m23:'village-keep', m24:'village-keep'};
// Archetypes that say where a creature lives.
const ARCH_BIOME = {River:'river', Pond:'river', Otter:'river', Beaver:'river', Coastal:'coast', Ocean:'reef-ocean', 'Coral Reef':'reef-ocean', Cetacean:'reef-ocean',
  Cephalopod:'reef-ocean', Leviathan:'reef-ocean', Mangrove:'mangrove', Swamp:'swamp', Cave:'caves', Bat:'caves', Mole:'caves', Mountain:'mountain-sky', Eagle:'mountain-sky',
  Tundra:'tundra-ice', Frost:'tundra-ice', Taiga:'taiga', Savanna:'savanna', Elephant:'savanna', Rhino:'savanna', Rainforest:'jungle', Sloth:'jungle', Desert:'desert-glass',
  Volcanic:'volcanic-ash', Imp:'volcanic-ash', Devil:'volcanic-ash', Fiend:'volcanic-ash', Dragon:'volcanic-ash', Field:'meadow-forest', Forest:'meadow-forest',
  Flora:'meadow-forest', Mouse:'meadow-forest', Rabbit:'meadow-forest', Bee:'meadow-forest', Ants:'meadow-forest', Hedgehog:'maze-briar', Porcupine:'maze-briar',
  Horse:'long-grass', Village:'village-keep', Hummingbird:'cliffs' /* the lore bible: nests woven into painted cliffs */};
// Only when nothing else says where it lives (unplaced pack and design cards): the type's usual ground.
const FALLBACK_BIOME = [['Raven', 'swamp' /* the night swamp's ravens */], ['Duck', 'river'], ['Chipmunk', 'meadow-forest'], ['Wolf', 'taiga'], ['Dog', 'village-keep'], ['Cat', 'village-keep'],
  ['Structure', 'village-keep'], ['Traveller', 'long-grass' /* the road */], ['Raccoon', 'meadow-forest'], ['Badger', 'meadow-forest'], ['Sheep', 'meadow-forest'], ['Bovine', 'meadow-forest'],
  ['Bat', 'caves'], ['Ape', 'jungle'], ['Primate', 'jungle'], ['Frog', 'swamp'], ['Amphibian', 'swamp'], ['Fish', 'river'], ['Turtle', 'meadow-forest'], ['Beetle', 'meadow-forest'],
  ['Insect', 'meadow-forest'], ['Mollusc', 'meadow-forest'], ['Bird', 'meadow-forest'], ['Canid', 'meadow-forest'], ['Feline', 'village-keep'], ['Worm', 'meadow-forest'], ['Annelid', 'meadow-forest'], ['Erinaceid', 'maze-briar']];
// Name words that say where a creature lives (only used when the map and the archetypes say nothing more).
const NAME_BIOME = [[/\b(cave|cavern|grotto|stalact|glowworm|guano|burrow)/i, 'caves'], [/\b(glass|dune|sand|scorpion|desert)/i, 'desert-glass'],
  [/\b(ash|cinder|ember|magma|lava|basalt|obsidian|volcan|caldera|fumarole|forge|slag)/i, 'volcanic-ash'], [/\b(frost|snow|ice|rime|glacier|glacial|arctic|polar|tundra|permafrost)/i, 'tundra-ice'],
  [/\b(reef|coral|kelp|abyss|deep-sea|fathom|leviathan|whale|squid|octopus|shark)/i, 'reef-ocean'], [/\b(mangrove)/i, 'mangrove'],
  [/\b(swamp|bog|marsh|fen|mire|bayou|gator|alligator|leech)/i, 'swamp'], [/\b(river|brook|pond|stream|ford|lily|rivergate)/i, 'river'],
  [/\b(alpine|mountain|peak|crag|summit|eyrie|aerie|condor|sky|gale|storm)/i, 'mountain-sky'], [/\b(cliff|gannet|puffin|kittiwake|fulmar)/i, 'cliffs'],
  [/\b(briar|thorn|bramble|hedge)\b/i, 'maze-briar'], [/\b(redwood)/i, 'redwood'], [/\b(pine|taiga|lynx)/i, 'taiga'], [/\b(savanna|lion|zebra|gazelle|hyena)/i, 'savanna'],
  [/\b(jungle|canopy|rainforest)/i, 'jungle'], [/\b(morel|fungal|fungus|mushroom|spore|mycel|puffball|toadstool|truffle)/i, 'fungal'],
  [/\b(shore|beach|tide|tidepool|shingle|gull|crab|seal)/i, 'coast'], [/\b(meadow|field|clover|garden|hedgerow|farm)/i, 'meadow-forest']];

const FAMILIES = [
  ['insect', '🐞', 'Insect'], ['arachnid', '🕷️', 'Arachnid'], ['myriapod', '🐛', 'Myriapod'], ['crustacean', '🦀', 'Crustacean'], ['mollusc', '🐌', 'Mollusc'],
  ['sea-invertebrate', '⭐', 'Sea invertebrate'], ['worm', '🪱', 'Worm'], ['fish', '🐟', 'Fish'], ['amphibian', '🐸', 'Amphibian'], ['reptile', '🦎', 'Reptile'],
  ['bird', '🐦', 'Bird'], ['mammal', '🐾', 'Mammal'], ['plant', '🌿', 'Plant'], ['fungus', '🍄', 'Fungus'], ['elemental', '🔥', 'Elemental'],
  ['spirit-undead', '👻', 'Spirit / undead'], ['fiend', '👺', 'Fiend / imp'], ['dragon', '🐉', 'Dragon'], ['construct', '🗿', 'Construct / structure'], ['changeling', '🫧', 'Changeling'],
].map(([id, icon, label])=> ({id, icon, label}));
const SPECIES_FAMILY = {Insect:'insect', Arachnid:'arachnid', Myriapod:'myriapod', Crustacean:'crustacean', Mollusc:'mollusc', Cnidarian:'sea-invertebrate', Echinoderm:'sea-invertebrate',
  Annelid:'worm', Fish:'fish', Amphibian:'amphibian', Reptile:'reptile', Bird:'bird', Plant:'plant', Undead:'spirit-undead', Dragon:'dragon', Elemental:'elemental'};
const MAMMALS = ['Mustelid', 'Rodent', 'Canid', 'Primate', 'Bat', 'Lagomorph', 'Felid', 'Feline', 'Bovine', 'Cervid', 'Suid', 'Ursid', 'Cetacean', 'Procyonid', 'Equid', 'Xenarthran',
  'Pinniped', 'Erinaceid', 'Herpestid', 'Megafauna', 'Hyaenid', 'Mammal'];
MAMMALS.forEach(s=> SPECIES_FAMILY[s] = 'mammal');
// The Elemental species is a grab bag: its names say what each one is.
const ELEMENTAL_NAME = [[/\b(fungal|puffball|morel|mushroom|spore|mycel|toadstool)/i, 'fungus'], [/\b(ent|willow|sprout|vine|treant|lasher|root|pinecone|rafflesia)\b/i, 'plant'],
  [/\b(golem|warden|troll|dummy|shield|stoneheart)\b/i, 'construct'], [/\b(imp|fiend|sixfold|glutton|tithe|blackmass|puppeteer|dread bell)\b/i, 'fiend'],
  [/\b(wisp|spirit|revenant|wraith|unremembered|echo|lurking|reaver|oath-keeper|acolyte|priest|bell-ringer|avatar)\b/i, 'spirit-undead']];

const ELEMENTAL_ICON = [[/🍄/u, 'fungus'], [/🌳|🌲|🌱|🌿|🌰|🌺|🌸|🪴/u, 'plant'], [/🗿|🪨|🛡️|🫙/u, 'construct'], [/👻|💀|🧟|🕯️|👁️/u, 'spirit-undead'], [/😈|👺|👹/u, 'fiend']];
const FACTIONS = [
  ['otters', '🦦', 'Otters · the Rivergate Legion'], ['hummingbirds', '🐦', 'Hummingbirds · the Sunfeather Tribes'], ['goldfeather', '🪙', 'Goldfeather · the Magnate\'s court'],
  ['ecclesia', '⛪', 'The Ecclesia (shrine and chapel)'], ['ashen-choir', '🕯️', 'The Ashen Choir (cult, imps, devils)'], ['greenhood', '🏹', 'The Greenhood Band'],
  ['hollow-kin', '🕳️', 'The Hollow Kin'], ['gnawed', '🦷', 'The Gnawed'], ['tidefolk', '🌊', 'The Tidefolk'], ['road-folk', '🎒', 'Road-folk (mice, rats, raccoons)'],
  ['supporting-folk', '🔨', 'Supporting folk (badgers, beavers, rabbits…)'], ['dogs-cats', '🐕', 'Dogs and cats (friends of both)'], ['hives', '🐝', 'The hives (ants, bees, wasps)'],
  ['great-beasts', '🐉', 'Great beasts (Dragons, Leviathans, Fiends)'], ['spirits', '👻', 'Spirits and the restless dead'], ['beasts', '🐺', 'Beasts (hunters)'], ['wild', '🍃', 'Wild creatures'],
].map(([id, icon, label])=> ({id, icon, label}));

// Road stages: the owner's "later in the game". The variant tiers below move a creature one, two or three stages on.
const STAGES = [{id:1, label:'Early', maps:[0, 5]}, {id:2, label:'Mid', maps:[6, 11]}, {id:3, label:'Late', maps:[12, 17]}, {id:4, label:'End', maps:[18, 24]}];
const stageOf = n=> n == null ? null : n <= 5 ? 1 : n <= 11 ? 2 : n <= 17 ? 3 : 4;
// The variant convention. A later, dangerous version of a creature lives on a later map of its biome (or a kin biome), costs more
// Lumber (and Wait), and its rarity steps up (capped by the road's skirmish cap of its map). Its skills are not copied: they are
// applied in the post-balance step, like every picked unit's.
// 2026-10-19 (package UT, owner 09:52: "Dire and Elder are internal naming. And I think we can't do 1.4x, 1.5x etc. They should balance
// based on N, based on their rarity and resource requirement. Unless this are non-player units."):
//   - a player-obtainable variant's body comes from the budget N of its rarity, Lumber and Wait (tools/skill_costs.js budget(), the
//     shared helper: package BF changes the formula, this follows it): 2A+H fills FIT of N (the rest is room for its skills), split
//     in its base's Attack : Health shape, and A·H stays under FIT of N2. bodyFromN below.
//   - non-player units (the raid's boss units and raid bosses: NON_PLAYER below; an enemy-only variant would be one too) keep
//     multipliers: nonPlayerMult. The old multiplier draft of each player variant is kept as variant.multDraft, for comparison.
//   - "Dire" / "Elder" / "Ancient" are internal ids (the id prefix, variant.tier); the name a player sees is a thematic name,
//     a proposal (NAME_PROPOSALS, nameProposal: true) for the owner to keep or change.
const VARIANT_TIERS = [
  {id:'dire', prefix:'Dire', stages:1, rarity:1, lumber:1, wait:0, nonPlayerMult:{attack:1.4, health:1.5}},
  {id:'elder', prefix:'Elder', stages:2, rarity:2, lumber:1, wait:1, nonPlayerMult:{attack:1.8, health:2.0}},
  {id:'ancient', prefix:'Ancient', stages:3, rarity:3, lumber:2, wait:1, nonPlayerMult:{attack:2.3, health:2.6}},
];
const FIT = 0.8;
// Thematic names for the proposed variants (2026-10-19, package UT): proposals, flagged nameProposal in the json. A variant missing
// here falls back to its later map's name + its base's name (also a proposal).
const NAME_PROPOSALS = {
  'dire-cave-olm': 'Peakroot Olm', 'dire-cave-pseudoscorpion': 'Shardclaw Pseudoscorpion', 'elder-whip-spider': 'Grandmother Whip Spider', 'dire-oilbird': 'Crag Oilbird',
  'dire-sulfur-vent-crab': 'Glimmer Vent Crab', 'elder-ghost-crayfish': 'Old Pale Crayfish', 'dire-blind-cave-fish': 'Glimmerdeep Cavefish', 'dire-glowworm-cluster': 'Starceiling Glowworms',
  'elder-sulfur-cinder-moth': 'Grand Cinder Moth', 'dire-cave-bat-swarm': 'Peak Bat Cloud', 'elder-echo-screecher': 'Grey Echo-Screecher', 'dire-octopus-tactician': 'Glimmer Octopus Admiral',
  'dire-millipede-hauler': 'Ironcoil Millipede', 'dire-golden-eagle-diver': 'Stormdiver Eagle', 'elder-peak-condor': 'Grand Summit Condor', 'dire-alpine-avalanche': 'Eyrie Snowslide',
  'dire-mountain-goat-climber': 'Ledgehorn Goat', 'dire-gull-thief': 'Kelp Gull Corsair', 'elder-pelican-diver': 'Old Floe Pelican', 'dire-tide-pool-crab': 'Kelpshell Crab',
  'elder-fiddler-crab-swarm': 'Grand Fiddler Host', 'dire-riptide-eel': 'Undertow Eel', 'dire-grey-seal-bull': 'Breakwater Seal Bull', 'dire-conch-crawler': 'Spiral-Fort Conch',
  'dire-pincushion-urchin': 'Needlebed Urchin', 'dire-caustic-scorpion': 'Bone-Dune Scorpion', 'dire-trapdoor-spider': 'Alcove Trapdoor Spider', 'elder-wolf-spider-mother': 'Old Brood Wolf Spider',
  'dire-nightjar-drifter': 'Alcove Nightjar', 'dire-fungal-colossus': 'Deepcap Colossus', 'dire-nightshade-moth': 'Gloamshade Moth', 'elder-monarch-wingblade': 'Old Monarch Bladewing',
  'dire-truffle-piglet': 'Deep-Truffle Hog', 'dire-bramble-sprout': 'Thornshoot Sprout', 'dire-hollow-oath-keeper': 'Rootbound Oath-Keeper', 'dire-compost-grub': 'Mouldering Grub',
  'elder-gangrenous-leech': 'Old Bloat Leech', 'dire-toucan-courier': 'Cloudbeak Toucan', 'dire-ironback-gorilla': 'Peakbreaker Gorilla', 'dire-rafflesia': 'Carrion Bloom',
  'dire-sunbittern-strider': 'Coral Sunbittern', 'elder-mudflat-godwit': 'Old Tideflat Godwit', 'dire-horseshoe-crab': 'Coralplate Horseshoe Crab', 'dire-mangrove-mudskipper': 'Current Mudskipper',
  'elder-reef-shark': 'Scarred Reef Shark', 'dire-mangrove-manatee': 'Current Sea-Cow', 'elder-proboscis-monkey': 'Grand Proboscis Monkey', 'dire-nautilus-drifter': 'Deepchamber Nautilus',
  'dire-mangrove-monitor': 'Reefwalker Monitor', 'dire-tide-spirit': 'Current Spirit', 'dire-puddle-hopper': 'Bramble Bog-Hopper', 'elder-meadow-frog': 'Old Meadow Croaker',
  'dire-robin-redbreast': 'Thornbreast Robin', 'elder-field-crow': 'Old Bramble Crow', 'dire-puffball-bombardier': 'Sporeburst Puffball', 'dire-tunnel-ant': 'Rootdelve Ant',
  'elder-cricket-drummer': 'Old Bramble Drummer', 'dire-pine-marten': 'Shadowbough Marten', 'elder-dormouse': 'Grand Dormouse', 'dire-leopard-slug': 'Oldwood Leopard Slug',
  'dire-ent': 'Bramblewatch Ent', 'elder-heartwood-treant': 'Old Heartwood', 'dire-slow-worm': 'Brambleshade Slow-worm', 'dire-alpine-salamander': 'Summit Salamander',
  'dire-eagle-owl-quartermaster': 'Summit Eagle-Owl', 'elder-eyrie-warden': 'Grand Eyrie Warden', 'dire-apollo-butterfly': 'Summit Apollo', 'dire-alpine-marmot': 'Summit Marmot',
  'elder-chamois-leaper': 'Old Summit Chamois', 'dire-wound-reaver': 'Scarstone Reaver', 'dire-stonedrop-vulture': 'Rimefire Stonedrop', 'dire-open-ocean-hermit-crab': 'Sunken Hermit Crab',
  'dire-clownfish-scout': 'Sunken Clownfish', 'elder-coral-reef-shark': 'Old Wreck Shark', 'elder-narwhal-lancer': 'Grand Narwhal', 'dire-kraken-spawnling': 'Kraken Yearling',
  'dire-camouflage-frog': 'Mossveil Frog', 'elder-lotus-frog': 'Old Lotus Frog', 'dire-diving-bell-spider': 'Kelp Bell Spider', 'dire-pond-paddler': 'Bramble Pond Drake',
  'elder-ford-kingfisher': 'Old Ford Kingfisher', 'dire-signal-crayfish': 'Kelp Signal Crayfish', 'dire-reef-manta-glider': 'Kelp Manta', 'elder-minnow-skitter': 'Old Silverside',
  'dire-mayfly-dancer': 'Kelp Mayfly', 'dire-muskrat-lodgekeeper': 'Rootlodge Muskrat', 'elder-pyrenean-desman': 'Old Brook Desman', 'dire-cuttlefish-illusionist': 'Mirage Cuttlefish',
  'dire-grass-snake': 'Kelp Water Snake', 'dire-bogfire-newt': 'Mangrove Bogfire Newt', 'elder-bog-behemoth': 'Old Mangrove Behemoth', 'dire-raft-spider': 'Kelp Raft Spider',
  'dire-raven-scout': 'Mangrove Raven', 'elder-anhinga-spearbird': 'Old Anhinga', 'dire-alligator-gar': 'Swampmire Gar', 'dire-willow-o-wisp': "Mangrove-o'-Wisp",
  'elder-fire-ant-raft': 'Grand Fire Ant Raft', 'dire-fen-mink': 'Swampmire Mink', 'dire-cypress-root-lurker': 'Swampmire Root Lurker', 'dire-constrictor-coil': 'Swampmire Constrictor',
  'elder-venomlord-serpent': 'Venom Patriarch', 'dire-marsh-wisp': 'Mangrove Wisp', 'elder-echo-keeper': 'Old Echo Keeper', 'dire-bog-leech': 'Swampmire Leech',
  'dire-lunar-howler': 'Tundra Moon Howler', 'dire-glacier-wolf-pack': 'Rimefire Wolf Pack', 'elder-frostbitten-wolverine': 'Old Rimefire Wolverine', 'dire-ash-cloud-condor': 'Peak Ash Condor',
  'dire-gorge-wyrm': 'Peak Gorge Wyrm',
};
// Non-player units (2026-10-19, package UT): they may keep multipliers. The raid's boss units (arena_app.js buildRaidFullFight: a
// part's biggest card, +1 Attack, Health ×(1.5 + 1.5·r), Epic, and 100 Health on a fresh raid, RaidM.bossHpBonus) and the async
// raid bosses (canonical/raid-bosses.json: decks of existing cards behind a big bramble). Listed in the json under nonPlayer.
const RAID_BOSS_UNIT_MULT = {attack: '+1', health: '×(1.5 + 1.5·r), r = the part\'s Health still standing', rarity: 'epic', fresh: 'bossHpBonusMax Health on a fresh raid (RaidM.bossHpBonus)'};
// Not proposed, only recognised: a younger, smaller version (Kit, Pup, Calf, Cub, Hatchling, Baby) of a creature.
const YOUNG_TIER = {id:'young', prefix:'Kit / Pup / Calf / Cub / Hatchling', stages:-1, proposable:false};
// Cards already in the game that are such versions, hand-checked: [card, the earlier / adult card it is a version of (null: none in
// the game yet), tier]. The tier is what the name says (Elder / Old = elder; Ancient / Titan = ancient; Dire, Greater, Alpha, Matriarch,
// King, Warlord = dire); the base is the same kind of creature on an earlier or the same map.
const EXISTING_VARIANTS = [
  ['sea-turtle-elder', null, 'elder'], ['humpback-elder', null, 'elder'], ['sperm-whale-elder', null, 'elder'], ['elder-tortoise', null, 'elder'],
  ['old-growth-tortoise', 'elder-tortoise', 'elder'], ['grovebearer-dragon-turtle', 'old-growth-tortoise', 'ancient'], ['quillback-elder', 'porcupine-roller', 'elder'],
  ['old-snapjaw', 'snapper-hatchling', 'elder'], ['old-sturgeon', null, 'elder'], ['old-willow-of-the-ford', null, 'elder'], ['elder-willow', null, 'elder'],
  ['ancient-sloth-titan', 'canopy-sloth-guardian', 'ancient'], ['greater-siren', null, 'dire'], ['glacial-ape-king', null, 'dire'],
  ['alpha-howler', 'timber-wolf-pack', 'dire'], ['wolfsbane-alpha', 'alpha-howler', 'dire'], ['dhole-matriarch', 'dhole-runner', 'dire'],
  ['cottonmouth-matriarch', null, 'dire'], ['swarm-matriarch', 'honey-bee', 'dire'], ['rodent-king', 'field-mouse', 'dire'],
  ['raccoon-warlord', 'trash-panda-trickster', 'dire'], ['komodo-warlord', 'monitor-rambler', 'dire'], ['cave-warlord', 'grizzly-vanguard', 'dire'],
  ['giant-cave-huntsman', null, 'dire'], ['giant-water-bug', null, 'dire'], ['great-barracuda', null, 'dire'],
  ['otter-kit', 'otter-centurion', 'young'], ['fox-kit', 'trickster-fox', 'young'], ['bear-cub', 'grizzly-vanguard', 'young'], ['rabbit-kit', 'meadow-rabbit', 'young'],
  ['terrier-pup', 'war-hound', 'young'], ['harp-seal-pup', null, 'young'], ['musk-ox-calf', 'tundra-musk-ox', 'young'], ['caiman-hatchling', null, 'young'],
  ['snapper-hatchling', 'old-snapjaw', 'young'], ['fire-drake-hatchling', null, 'young'], ['baby-bat', null, 'young'], ['baby-horned-capybara', null, 'young'],
  ['worker-ant', 'ant-warrior', 'young' /* promotes to it (promotesTo) */],
];

// ---------- hand-checked tags (they win over the heuristics). Each row says why it was needed. ----------
const MANUAL = {
  'moray-ambusher': {family: 'fish', why: 'cards.json species says Cnidarian; a moray is an eel'},
  'horseshoe-crab': {family: 'crustacean', faction: 'wild', why: 'species Arachnid (true, a chelicerate) but it reads and plays as a crab, not a hunter'},
  'tunnel-wyrm': {family: 'worm', faction: 'beasts', why: 'a giant worm (🪱) with the Dragon species; not one of the ranked great beasts'},
  'gorge-wyrm': {family: 'worm', faction: 'beasts', why: 'a giant worm (🪱) with the Dragon species; not one of the ranked great beasts'},
  'thunder-lizard': {family: 'reptile', faction: 'beasts', why: '"Not a dragon. Do not tell it that."'},
  'irradiated-couatl': {biomes: ['jungle'], why: 'the feathered serpent of the old songs; no map, no habitat type'},
  'irradiated-axolotl': {biomes: ['river'], why: 'an axolotl (lake / river), not a swamp frog'},
  'irradiated-glow-wyrm': {biomes: ['caves'], why: '"the tunnel it leaves behind is lit for a week"'},
  'stoneheart-golem': {biomes: ['village-keep'], why: '"assembled from castle rubble"; no map, no type'},
  'pike-lancer': {faction: 'otters', why: 'the lore bible: the Legion tames fish, "pike lancers, carp couriers"'},
  'missingno': {biomes: ['long-grass'], family: 'construct', faction: 'spirits', why: 'the glitch: "it has been in the tall grass the whole time"'},
  'wandering-mage': {faction: 'dogs-cats', why: 'a cat in a starry hat: house-sized cats are friends of both peoples'},
  'rodent-king': {faction: 'road-folk', why: 'the lore bible: the rat road-gang boss, "king of the road"'},
  'caldera-wyrm': {stage: 4, why: 'the Map 20 world boss (no fight deck lists it)'},
  'red-dragon': {stage: 4, why: 'first of the great beasts: the end game'}, 'white-dragon': {stage: 4, why: 'first of the great beasts: the end game'},
  'blue-dragon': {stage: 4, why: 'first of the great beasts: the end game'}, 'green-dragon': {stage: 4, why: 'first of the great beasts: the end game'},
  'black-dragon': {stage: 4, why: 'first of the great beasts: the end game'},
  'old-willow-of-the-ford': {biomes: ['river', 'meadow-forest'], why: 'the willow of the ford: a river tree'},
  'sea-turtle-elder': {biomes: ['coast', 'reef-ocean'], why: 'checked: Pebble Beach\'s old turtle'},
  'ember-jackal': {faction: 'beasts', why: 'a volcano jackal with the Dog type: a beast, not a village dog'},
};

// ---------- the cards ----------
const NOT_UNITS = c=> c.test || c.field || c.eggKind || ['materia', 'equipment', 'spell'].includes(c.cardType) || c.hallOfFame;
const units = RAW.filter(c=> !NOT_UNITS(c));
const byId = {}; RAW.forEach(c=> byId[c.id] = c);
const typesOf = c=> [...(c.archetypes || []), ...(c.species || [])];
// where each live card fights (enemy decks) and where it is earned
const FIGHTS = {};
const MAPNO = {}; B.MAPS.forEach(m=>{ MAPNO[m.id] = G.mapNumberOf(m.id); });
const nodeNo = {};
for(const m of B.MAPS){ if(m.reserved || m.tower) continue;
  for(const n of m.nodes || []){ const no = G.nodeMapNumber(n); nodeNo[m.id + '|' + n.key] = no;
    if(!n.deck || n.kind === 'tutorial') continue;
    for(const [id, k] of Object.entries(n.deck)){ const f = FIGHTS[id] = FIGHTS[id] || {}; f[m.id] = (f[m.id] || 0) + (+k || 1); (FIGHTS[id + '#no'] = FIGHTS[id + '#no'] || []).push(no); } } }
const mapNoOf = (mapId, node)=> nodeNo[mapId + '|' + node] != null ? nodeNo[mapId + '|' + node] : MAPNO[mapId];

function skillsOf(c){
  const out = [];
  Object.entries(c.effects || {}).forEach(([k, v])=>{
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(t) out.push(['trigger', t.on + '→' + t.do + (t.amount != null ? ' ' + t.amount : '') + (t.defId ? ' ' + t.defId : '')]); }); return; }
    // an object value (e.g. Sleep {chance, duration}) reads as "chance 50, duration 2"
    const obj = x=> Array.isArray(x) ? x.join('/') : Object.entries(x).map(([a, b])=> a + ' ' + (b && typeof b === 'object' ? JSON.stringify(b) : b)).join(', ');
    out.push([k, typeof v === 'number' ? v : (v === true ? null : (typeof v === 'string' ? v : v && typeof v === 'object' ? obj(v) : String(v)))]);
  });
  return out;
}
function bodyOf(c){ return {cost: c.cost || 0, wait: c.wait || 0, attack: c.attack || 0, health: c.health || 0, dmg: c.dmgType || 'physical', resist: (c.resist || []).slice()}; }
function sizeOf(c){
  if(/\b(swarm|swarmling|cloud|flock|colony|pack|raft|horde|school|chorus|pod|herd)\b/i.test(c.name)) return 'swarm';
  const s = 2 * (c.attack || 0) + (c.health || 0);
  let z = s < 8 ? 0 : s < 16 ? 1 : s < 28 ? 2 : s < 42 ? 3 : s < 60 ? 4 : 5;
  if(/\b(giant|great|titan|colossus|leviathan|behemoth|elephant|whale|mammoth|wyrm)\b/i.test(c.name)) z = Math.max(z, 3);
  if(/\b(kit|pup|calf|cub|hatchling|sprout|swarmling|tiny|mite|gnat)\b/i.test(c.name)) z = Math.min(z, 1);
  return ['tiny', 'small', 'medium', 'large', 'huge', 'colossal'][z];
}
function familyOf(c){
  const sp = c.species || [], why = [];
  if(sp.includes('Undead')) return ['spirit-undead', 'species Undead'];
  if(sp.includes('Dragon') || (c.archetypes || []).includes('Dragon')) return ['dragon', 'Dragon'];
  const real = sp.find(s=> s !== 'Elemental');
  if(real && SPECIES_FAMILY[real]) return [SPECIES_FAMILY[real], 'species ' + real];
  if(sp.includes('Elemental')){ for(const [re, f] of ELEMENTAL_NAME) if(re.test(c.name)) return [f, 'Elemental, name'];
    for(const [re, f] of ELEMENTAL_ICON) if(re.test(c.icon || '')) return [f, 'Elemental, emoji'];
    if((c.archetypes || []).includes('Flora')) return ['plant', 'Elemental + Flora'];
    return ['elemental', 'species Elemental']; }
  if((c.archetypes || []).includes('Structure')) return ['construct', 'Structure'];
  if(/changeling/i.test(c.id)) return ['changeling', 'name'];
  return [null, 'no species'];
}
const WILD_CAT = /\b(lynx|panther|leopard|jaguar|cheetah|lion|tiger|margay|ocelot|serval|caracal|fishing cat|wildcat|puma|cougar)\b/i;
const HUNTER_NAME = /\b(shark|croc|crocodile|gator|alligator|caiman|monitor|komodo|viper|cobra|python|adder|mamba|krait|anaconda|scorpion|spider|tarantula|lynx|leopard|lion|tiger|jaguar|panther|hyena|jackal|wolf|marten|mink|weasel|stoat|ermine|wolverine|barracuda|pike|orca|hawk|falcon|kestrel|harrier|peregrine|shrike|eagle|owl|kraken|eel|moray|piranha)\b/i;
function factionOf(c, ctx, family){
  const A = new Set(typesOf(c)), n = c.name, has = (...xs)=> xs.some(x=> A.has(x)), home = ctx.home, seen = ctx.seen, fl = c.flavor || '';
  // only the Otters themselves are the Legion's (the lore people). 2026-10-19 (package UT, owner 09:52: "The starter cards are not
  // Otters. Just considered as 'Base'."): the old 'otters' card faction is 'base' now, so the starter fish (minnow, trout, carp) are no
  // longer counted as the Legion's tamed fish; a Base card is marked base: true instead.
  if(A.has('Otter')) return ['otters', 'Otter type'];
  if(A.has('Hummingbird') || (c.faction === 'hummingbirds' && family === 'bird')) return ['hummingbirds', A.has('Hummingbird') ? 'Hummingbird type' : 'Hummingbird starter'];
  if(c.creatureRank || has('Dragon', 'Leviathan', 'Dragon-Turtle')) return ['great-beasts', 'creature rank / Dragon'];
  if(/goldfeather|magnate/i.test(n + ' ' + fl) || home.some(m=> m === 'm23' || m === 'm24')) return ['goldfeather', 'earned on the Goldfeather maps'];
  if(A.has('Ecclesia')) return ['ecclesia', 'Ecclesia type'];
  if(has('Devil', 'Imp', 'Fiend') || /\b(choir|cultist)\b/i.test(n)) return ['ashen-choir', 'Devil / Imp type'];
  if(/\b(shrine|chapel|abbey|priest|acolyte|bell-ringer|avatar|friar|cathedral)\b/i.test(n)) return ['ecclesia', 'shrine name'];
  if(['spirit-undead', 'elemental'].includes(family) || (family === 'construct' && !A.has('Structure'))) return ['spirits', 'spirit / elemental / golem'];
  if(/greenhood/i.test(n + ' ' + fl) || (home.some(m=> m === 'mh' || m === 'mr') && (has('Fox', 'Mouse', 'Raccoon') || /\b(magpie|jay|rat)\b/i.test(n)))) return ['greenhood', 'fox / mouse / raccoon of the Briar Maze or Redwood'];
  if(/tidefolk/i.test(n + ' ' + fl) || (seen.some(m=> m === 'mk' || m === 'm7' || m === 'mj') && (/\beels?\b/i.test(n) || (c.species || []).includes('Pinniped')))) return ['tidefolk', 'eel / seal of the Current or the Mangroves'];
  if(/hollow kin/i.test(fl) || (A.has('Cave') && (has('Mole', 'Bat') || /\b(salamander|olm|mole|bat)\b/i.test(n)))) return ['hollow-kin', 'Cave + mole / bat / salamander'];
  if(/gnawed/i.test(n + ' ' + fl) || (/\b(rat|shrew)\b/i.test(n) && home.some(m=> m === 'm8' || m === 'md'))) return ['gnawed', 'rat / shrew on the Swampmire or Dunes'];
  if(has('Ants', 'Bee') || /\b(ant|bee|wasp|hornet|termite)s?\b/i.test(n)) return ['hives', 'Ants / Bee'];
  if(has('Raccoon', 'Traveller') || /\b(rat|packrat|mouse|raccoon|peddler|miller|tiller)\b/i.test(n) || (A.has('Mouse') && A.has('Village'))) return ['road-folk', 'mouse / rat / raccoon'];
  if((has('Dog', 'Cat') || /\b(hound|dog|terrier|collie|mastiff|cat)\b/i.test(n)) && !WILD_CAT.test(n) && !/\b(jackal|hyena|wolf|dhole)\b/i.test(n)) return ['dogs-cats', 'Dog / Cat'];
  if(has('Badger', 'Beaver', 'Rabbit', 'Chipmunk', 'Porcupine', 'Hedgehog', 'Sloth', 'Turtle', 'Sheep', 'Mole', 'Village')) return ['supporting-folk', 'craft folk type'];
  const sp = c.species || [], vert = ['mammal', 'bird', 'reptile', 'fish', 'amphibian', 'arachnid'].includes(family);
  if(has('Wolf', 'Fox', 'Bear', 'Snake', 'Arachnid', 'Eagle', 'Vulture', 'Owl', 'Raven') || sp.some(s=> ['Felid', 'Canid', 'Ursid', 'Hyaenid'].includes(s)) || (vert && HUNTER_NAME.test(n)))
    return ['beasts', 'hunter type / name'];
  return ['wild', 'default'];
}

function tag(c){
  const status = c.pool ? 'pool' : 'live', src = c.source || {}, why = {};
  const home = [];
  if(c.pool && c.poolMap) home.push(c.poolMap);
  if((src.kind === 'map' || src.kind === 'secret') && src.id) home.push(src.id);
  const fights = FIGHTS[c.id] || {};
  // the stage: the earliest map it is earned on or fights on (base cards and starters: the start)
  // (where it lives on the road comes first; a pack card that fights nowhere takes its pack's tier, the map that pack opens on)
  const nos = [];
  if((src.kind === 'map' || src.kind === 'secret') && src.id) nos.push(mapNoOf(src.id, src.node));
  if(c.pool && c.poolMap) nos.push(MAPNO[c.poolMap]);
  (FIGHTS[c.id + '#no'] || []).forEach(n=> nos.push(n));
  const okNos = nos.filter(n=> n != null);
  let firstMap = okNos.length ? Math.min(...okNos) : null;
  if(firstMap == null && src.kind === 'pack' && src.tier != null && src.tier < 99) firstMap = +src.tier;
  if(firstMap == null && (src.kind === 'base' || c.rarity === 'starter' || c.basic || c.faction)) firstMap = 0;
  if(src.kind === 'raid') firstMap = 24;
  let stage = stageOf(firstMap);
  // biomes: home map, archetypes, name, then the maps it fights on
  const bio = [];
  const add = (b, w)=>{ if(b && BIOME[b] && !bio.includes(b)){ bio.push(b); why[b] = w; } };
  const archB = (c.archetypes || []).map(a=> ARCH_BIOME[a]).filter(Boolean);
  home.forEach(m=>{ const opts = [MAP_BIOME[m]].concat(MAP_BIOMES_MORE[m] || []); add(opts.find(b=> archB.includes(b)) || opts[0], 'home map ' + m); });
  (c.archetypes || []).forEach(a=> add(ARCH_BIOME[a], 'type ' + a));
  if(!bio.length) for(const [re, b] of NAME_BIOME) if(re.test(c.name)){ add(b, 'name'); break; }
  const fb = {}; let fTot = 0; Object.entries(fights).forEach(([m, k])=>{ const b = MAP_BIOME[m]; if(b){ fb[b] = (fb[b] || 0) + k; fTot += k; } });
  const fTop = Object.entries(fb).sort((a, b)=> b[1] - a[1])[0];
  if(fTop && (!bio.length || fTop[1] >= fTot * 0.5)) add(fTop[0], 'fights mostly on ' + fTop[0]);
  if(src.kind === 'raid') add('reef-ocean', 'raid (the deep)');
  if(!bio.length){ const T = typesOf(c); for(const [t, b] of FALLBACK_BIOME) if(T.includes(t)){ add(b, 'usual ground of ' + t); break; } }
  const [family, famWhy] = familyOf(c);
  const [faction, facWhy] = factionOf(c, {home, seen: home.concat(Object.keys(fights))}, family);
  const row = {id: c.id, name: c.name, icon: c.icon || '', status, rarity: c.rarity || null, biomes: bio, family, sub: (c.species || []).filter(s=> s !== 'Elemental')[0] || (c.species || [])[0] || null,
    animal: c.animal || null, animalGroup: c.animal ? (AGROUP[c.animal] || c.animal) : null, subtype: c.subtype || null, // 2026-10-19 (package UT)
    faction, size: sizeOf(c), stage, firstMap, body: bodyOf(c), skills: skillsOf(c), types: typesOf(c),
    maps: {home: [...new Set(home)], fights}, source: src.kind || null};
  if(c.token) row.token = true;
  if(c.unattainable) row.enemyOnly = true;
  if(c.hidden) row.hidden = true;
  if(c.pool) row.poolSlot = c.poolSlot || null;
  if(c.faction === 'base') row.base = true; // 2026-10-19 (package UT): a Base card (skirmish rewards, not packs); was starterDeck 'otters'
  else if(c.faction) row.starterDeck = c.faction;
  if((c.archetypes || []).includes('Structure')) row.structure = true;
  if(c.creatureRank) row.rank = c.creatureRank;
  row.why = {biome: bio.map(b=> why[b]).join('; '), family: famWhy, faction: facWhy};
  const man = MANUAL[c.id];
  if(man){ const fields = [];
    ['biomes', 'family', 'faction', 'size', 'stage'].forEach(f=>{ if(man[f] !== undefined){ row[f] = man[f]; fields.push(f); } });
    row.manual = fields; row.why.manual = man.why || ''; }
  return row;
}

let rows = units.map(tag);
const ROW = {}; rows.forEach(r=> ROW[r.id] = r);

// ---------- variants already in the game ----------
const variantsFound = [];
EXISTING_VARIANTS.forEach(([id, of, tier])=>{ const r = ROW[id]; if(!r) return; const base = ROW[of] ? of : null;
  r.variant = {tier, of: base, kind: 'existing', audience: r.enemyOnly ? 'enemy-only' : 'player'}; variantsFound.push([id, base, tier]); }); // audience (2026-10-19, package UT)

// ---------- proposed later variants: 1-2 per biome + family where an early creature exists ----------
// Where a biome's dangerous versions live later on the road, in order (its own later maps first, then kin ground). Hand-picked from
// the maps' identities (tools/thematic_pass_2026_10_19.js THEMES): e.g. the cave creatures' later home is the Sundered Peak, the Cave
// Warlord's mountain; the meadow's is the Old Bramble, the first forest (a come-back fight after Map 17).
const LATER = {'meadow-forest': ['mo', 'mr'], river: ['mk', 'mo'], coast: ['mk', 'm7', 'mj', 'm6'], cliffs: ['m10', 'm21'], swamp: ['m8', 'ms', 'mk'], fungal: ['mz', 'm4', 'mn'],
  caves: ['mn', 'm11'], mangrove: ['m7', 'mj'], 'reef-ocean': ['mj'], 'mountain-sky': ['m21', 'm22'], 'maze-briar': ['mr', 'mo'], redwood: ['mt', 'mo'], savanna: ['my', 'm23'],
  jungle: ['m11'], 'long-grass': ['m23'], taiga: ['m6', 'mi', 'm22'], 'tundra-ice': ['m22', 'm21'], 'desert-glass': ['mpd', 'm22'], 'pale-desert': ['m22'],
  'volcanic-ash': ['m11', 'me', 'mx', 'm22'], 'village-keep': ['m24']};
const MAPINFO = {}; B.MAPS.forEach(m=>{ MAPINFO[m.id] = {id: m.id, no: m.id === 'mo' ? 17 : MAPNO[m.id], name: m.name, sub: !!m.sub}; });
// the first later map whose stage is at least the tier's; else the latest later map after the base's own
function targetMap(biome, baseNo, stagesOn){
  const want = Math.min(4, stageOf(baseNo) + stagesOn), list = (LATER[biome] || []).map(id=> MAPINFO[id]).filter(m=> m && m.no > baseNo);
  return list.find(m=> stageOf(m.no) >= want) || list.sort((a, b)=> b.no - a.no)[0] || null;
}
const usage = r=> Object.values(r.maps.fights).reduce((a, b)=> a + b, 0);
const hasVariant = new Set(); rows.forEach(r=>{ if(r.variant && r.variant.of) hasVariant.add(r.variant.of); });
// The old draft body (until 2026-10-19; kept for non-player units and as variant.multDraft, the "before"): the base × the tier's
// multipliers, then fitted under budget v3 at its rarity with room left for skills (FIT); never under base + 10% (up to +3 Lumber).
function fitBody(base, tier, rarity){
  const A0 = Math.max(1, Math.round(base.attack * tier.nonPlayerMult.attack)), H0 = Math.max(1, Math.round(base.health * tier.nonPlayerMult.health));
  const floorA = Math.max(1, base.attack), floorH = Math.max(1, Math.ceil(base.health * 1.1));
  let out = null;
  for(let extra = 0; extra <= 3 && !out; extra++){
    let A = A0, H = H0; const d = {cost: base.cost + tier.lumber + extra, wait: base.wait + tier.wait, attack: A, health: H, rarity, effects: {}, source: {kind: 'map'}};
    const b0 = SCT.budget(d), lim1 = b0.N * FIT, lim2 = b0.N2 * FIT; let fitted = false;
    for(let k = 0; k < 300 && (2 * A + H > lim1 || A * H > lim2); k++){ fitted = true; if(H > floorH && (H >= A * 2 || A <= floorA)) H--; else if(A > floorA) A--; else break; }
    if(2 * A + H > lim1 || A * H > lim2){ if(extra < 3) continue; }
    d.attack = A; d.health = H; const b = SCT.budget(d);
    out = {body: {cost: d.cost, wait: d.wait, attack: A, health: H, dmg: base.dmg, resist: base.resist.slice()}, N: b.N, x1: b.x1, fitted, extraLumber: extra, ok: b.ok,
      eff: {attack: base.attack ? Math.round(A / base.attack * 100) / 100 : null, health: base.health ? Math.round(H / base.health * 100) / 100 : null}};
  }
  return out;
}
// A player variant's body from N (2026-10-19, package UT): the budget of its rarity, Lumber (base + the tier's) and Wait, from the shared
// helper SCT.budget (N and N2: whatever formula tools/skill_costs.js holds). 2A+H takes FIT of N (the rest is room for its skills),
// split in the base's own shape (its Attack share of 2A+H), and A·H stays under FIT of N2. A base with 0 Attack (a wall) keeps 0.
// A dangerous version should not come out smaller than its base: when N at the tier's Lumber is too small for that, it pays up to 3
// more Lumber; if even that is not enough (an over-budget base), it is kept and flagged belowBase for the owner.
function bodyFromN(base, tier, rarity){
  const share = base.attack > 0 ? (2 * base.attack) / Math.max(1, 2 * base.attack + base.health) : 0; // the base's Attack share of 2A+H
  let out = null;
  for(let extra = 0; extra <= 3; extra++){
    const d = {cost: base.cost + tier.lumber + extra, wait: base.wait + tier.wait, attack: 0, health: 0, rarity, effects: {}, source: {kind: 'map'}};
    const b0 = SCT.budget(d), T1 = b0.N * FIT, T2 = b0.N2 * FIT;
    let A = base.attack > 0 ? Math.max(1, Math.floor(T1 * share / 2)) : 0, H = Math.max(1, Math.floor(T1 - 2 * A));
    for(let k = 0; k < 500 && A * H > T2; k++){ if(A > 1 && 2 * A > H) A--; else if(H > 1) H--; else break; } // the product limit: trim the bigger side
    d.attack = A; d.health = H; const b = SCT.budget(d);
    out = {body: {cost: d.cost, wait: d.wait, attack: A, health: H, dmg: base.dmg, resist: base.resist.slice()}, N: b.N, N2: b.N2, x1: b.x1, x2: b.x2, ok: b.ok, extraLumber: extra,
      belowBase: A < base.attack || H < base.health,
      eff: {attack: base.attack ? Math.round(A / base.attack * 100) / 100 : null, health: base.health ? Math.round(H / base.health * 100) / 100 : null}};
    if(!out.belowBase) break;
  }
  return out;
}
const SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'colossal'];
const MONSTERS = ['beasts', 'wild', 'hives', 'spirits', 'hollow-kin', 'tidefolk', 'gnawed']; // "a biome monster": not the peoples' folk
const proposed = [];
const groups = {};
rows.forEach(r=>{ if(r.status !== 'live' || r.token || r.hidden || !r.biomes.length || !r.family) return; const k = r.biomes[0] + '|' + r.family; (groups[k] = groups[k] || []).push(r); });
Object.keys(groups).sort().forEach(k=>{
  const [biome, family] = k.split('|');
  if(['construct', 'changeling', 'dragon', 'fiend'].includes(family)) return;
  const early = groups[k].filter(r=> r.stage != null && r.stage <= 2 && r.firstMap != null && !r.variant && !hasVariant.has(r.id) && MONSTERS.includes(r.faction)
    && ['common', 'uncommon', 'rare'].includes(r.rarity) && !/^the /i.test(r.name) && r.body.health > 0 && !r.types.includes('Leader'));
  if(!early.length) return;
  early.sort((a, b)=> usage(b) - usage(a) || (2 * b.body.attack + b.body.health) - (2 * a.body.attack + a.body.health) || a.name.localeCompare(b.name));
  const tiers = groups[k].length >= 3 && early.length >= 2 ? [[early[0], VARIANT_TIERS[0]], [early[1], VARIANT_TIERS[1]]] : [[early[0], VARIANT_TIERS[0]]];
  tiers.forEach(([base, tier])=>{
    const m = targetMap(biome, base.firstMap, tier.stages); if(!m) return;
    const id = tier.id + '-' + base.id; if(byId[id] || ROW[id]) return;
    const cap = G.roadRarityCap(m.no, 'skirmish'), rStep = Math.min(rarStep(base.rarity) + tier.rarity, rarStep(cap)), rarity = RSTEPS[rStep];
    const f = bodyFromN(base.body, tier, rarity), old = fitBody(base.body, tier, rarity); // 2026-10-19 (package UT): the body from N; the old multiplier draft beside it
    const mb = MAP_BIOME[m.id], bios = base.biomes.slice(); if(mb && !bios.includes(mb)) bios.push(mb);
    const nameP = NAME_PROPOSALS[id] || ((m.name || '').replace(/^The /, '').split(/\s+/)[0] + ' ' + base.name);
    const row = {id, name: nameP, internalName: tier.prefix + ' ' + base.name, nameProposal: true, icon: base.icon, status: 'proposed', rarity, biomes: bios,
      family: base.family, sub: base.sub, animal: base.animal, animalGroup: base.animalGroup, subtype: base.subtype,
      faction: base.faction, size: base.size === 'swarm' ? 'swarm' : SIZES[Math.min(5, SIZES.indexOf(base.size) + (tier.stages > 1 ? 2 : 1))],
      stage: stageOf(m.no), firstMap: m.no, body: f.body, skills: [], types: base.types.slice(), maps: {home: [m.id], fights: {}}, source: null,
      variant: {tier: tier.id, of: base.id, kind: 'proposed', audience: 'player', statsFrom: 'N', lumber: tier.lumber + f.extraLumber, wait: tier.wait, rarityStep: tier.rarity, eff: f.eff,
        N: f.N, N2: f.N2, x1: f.x1, x2: f.x2, budgetOk: f.ok, belowBase: f.belowBase || undefined, fit: FIT,
        multDraft: {mult: tier.nonPlayerMult, cost: old.body.cost, wait: old.body.wait, attack: old.body.attack, health: old.body.health},
        baseSkills: base.skills, map: m.id, mapName: m.name, mapNo: m.no},
      why: {biome: base.name + '\'s ground, later on ' + m.name + ' (Map ' + m.no + ')', family: 'from ' + base.name, faction: 'from ' + base.name}};
    proposed.push(row);
  });
});

// ---------- non-player units (2026-10-19, package UT): they keep their multipliers ----------
// The raid's boss units: a part's biggest card (by Attack + Health), grown (RAID_BOSS_UNIT_MULT), under its own name (RAID_BOSS_UNIT_NAMES
// in arena_app.js, else "Great <name>"). None has art of its own yet: each shows its base card's art (docs/art/raid-elder-art-brief.md).
const RAIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), RAID_BOSSES = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raid-bosses.json'), 'utf8'));
const RBU_NAMES = new Function(B.grab('RAID_BOSS_UNIT_NAMES') + '\nreturn RAID_BOSS_UNIT_NAMES;')();
const nonPlayer = [];
RAIDS.forEach(raid=> (raid.parts || []).forEach(p=>{
  const deck = (p.fight || {}).deck || {}, ids = Object.keys(deck).filter(id=> byId[id]).sort((a, b)=> ((byId[b].attack || 0) + (byId[b].health || 0)) - ((byId[a].attack || 0) + (byId[a].health || 0)));
  if(!ids.length) return; const base = byId[ids[0]], uid = base.id + '~boss';
  let row = nonPlayer.find(x=> x.id === uid);
  if(!row){ row = {id: uid, name: RBU_NAMES[base.id] || ('Great ' + base.name.replace(/^(The|A) /, '')), kind: 'raid-boss-unit', audience: 'non-player', raid: raid.id, parts: [], of: base.id,
    animal: base.animal || null, subtype: base.subtype || null, statsFrom: 'multipliers', mult: RAID_BOSS_UNIT_MULT, bossHpBonusMax: raid.bossHpBonusMax || null,
    body: {cost: base.cost || 0, wait: base.wait || 0, attack: (base.attack || 0) + 1, health: {fresh: Math.max(raid.bossHpBonusMax || 0, Math.round((base.health || 1) * 3)), nearlyDown: Math.round((base.health || 1) * 1.5)}},
    art: {ownArt: false, uses: 'art/cards/' + base.id + '.png'}}; nonPlayer.push(row); }
  row.parts.push(p.id); }));
RAID_BOSSES.forEach(rb=> nonPlayer.push({id: rb.id, name: rb.name, kind: 'raid-boss', audience: 'non-player', statsFrom: 'its deck of live cards behind a ' + rb.hqHp + '-Health bramble (strength ' + rb.strength + ')',
  deck: rb.deck, art: {ownArt: !!rb.art, uses: rb.art || null}}));

// ---------- write ----------
const count = (list, f)=>{ const n = {}; list.forEach(r=> [].concat(f(r)).forEach(v=>{ if(v != null) n[v] = (n[v] || 0) + 1; })); return n; };
const live = rows.filter(r=> r.status === 'live'), pool = rows.filter(r=> r.status === 'pool');
const out = {
  generated: '2026-10-19', tool: 'tools/unit_themes.js',
  note: 'Every creature card (live and pool) tagged by theme and by animal, and proposed later variants (status "proposed"; not in cards.json). body = stats without skills; skills are applied in the post-balance step. A proposed variant is player-obtainable (variant.audience "player"): its body comes from the budget N of its rarity, Lumber and Wait (tools/skill_costs.js), its name is a thematic proposal (nameProposal; internalName is the Dire / Elder id name) and variant.multDraft is the old multiplier draft. Non-player units (the raid\'s boss units, raid bosses) keep multipliers: nonPlayer. Picks per map: the hub\'s db, collection unitPicks (tools/hub/pull_unit_picks.md).',
  vocab: {biomes: BIOMES, families: FAMILIES, factions: FACTIONS, stages: STAGES, sizes: ['tiny', 'small', 'medium', 'large', 'huge', 'colossal', 'swarm'],
    variantTiers: VARIANT_TIERS.concat([YOUNG_TIER]), variantFit: FIT, variantStats: 'player variants: N-based (bodyFromN); non-player units: nonPlayerMult', mapBiome: MAP_BIOME, mapBiomesMore: MAP_BIOMES_MORE,
    subtypes: ATAGS.subtypes, animalGroups: [...new Set(rows.map(r=> r.animalGroup).filter(Boolean))].sort()},
  maps: B.MAPS.filter(m=> !m.reserved && !m.tower).map(m=> ({id: m.id, no: m.id === 'mo' ? 17 : MAPNO[m.id], name: m.name, sub: !!m.sub, parent: m.parent || null, biome: MAP_BIOME[m.id] || null})),
  counts: {units: rows.length, live: live.length, pool: pool.length, proposed: proposed.length, manual: rows.filter(r=> r.manual).length, existingVariants: variantsFound.length,
    biomeFrom: count(rows, r=> r.manual && r.manual.includes('biomes') ? 'manual' : /^home map/.test(r.why.biome) ? 'home map' : /^type/.test(r.why.biome) ? 'type'
      : /^name/.test(r.why.biome) ? 'name' : /^fights/.test(r.why.biome) ? 'fights' : /^usual ground/.test(r.why.biome) ? 'fallback' : 'other'),
    biome: count(rows, r=> r.biomes[0]), family: count(rows, r=> r.family), faction: count(rows, r=> r.faction),
    animalGroup: count(rows, r=> r.animalGroup), subtype: count(rows, r=> r.subtype), base: rows.filter(r=> r.base).length, nonPlayer: nonPlayer.length,
    belowBase: proposed.filter(r=> r.variant.belowBase).length},
  units: rows.concat(proposed),
  nonPlayer,
};
const text = JSON.stringify(out, null, 1) + '\n';
if(argv.includes('--check')){ const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : ''; if(now !== text){ console.error('canonical/unit-themes.json is out of date: run node tools/unit_themes.js'); process.exit(1); } console.log('unit-themes.json up to date'); process.exit(0); }
fs.writeFileSync(OUT, text);
console.log(`units ${rows.length} (live ${live.length}, pool ${pool.length}) + proposed ${proposed.length}; hand-tagged ${out.counts.manual}; existing variants ${variantsFound.length}`);
console.log('biome:', JSON.stringify(out.counts.biome)); console.log('family:', JSON.stringify(out.counts.family)); console.log('faction:', JSON.stringify(out.counts.faction));
const noBio = rows.filter(r=> !r.biomes.length), noFam = rows.filter(r=> !r.family);
if(noBio.length) console.log('NO BIOME:', noBio.map(r=> r.id).join(', '));
if(noFam.length) console.log('NO FAMILY:', noFam.map(r=> r.id).join(', '));
if(argv.includes('--review')) rows.concat(proposed).forEach(r=> console.log([r.id, r.name, r.icon, r.status, r.rarity, r.biomes.join('/'), r.family + (r.sub ? '(' + r.sub + ')' : ''), r.faction, r.size, 'S' + r.stage, 'm' + r.firstMap,
  (r.variant ? r.variant.kind + ':' + r.variant.tier + '<' + r.variant.of : ''), (r.manual ? 'MANUAL' : ''), JSON.stringify(r.why)].join(' | ')));
