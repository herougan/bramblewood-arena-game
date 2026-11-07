#!/usr/bin/env node
// CONTENT17 (2026-11-07, owner 23:55: "More Claude recommendations per map (maybe up to 15 per map), in case I need to switch out themes ...
// I noticed I can't fit arrow-ers in Maps 0-20 much ... Yeti: so where are the yeti hunters?"):
//   1  up to 15 Claude picks per map and submap of Maps 0-20 (unlock order), grouped by theme: the map's current theme first, then 2-3
//      alternative sub-themes that fit the biome and docs/lore-bible.md. Existing cards on no list (or only on maps past 20) come first;
//      where nothing fits, a new card (NEW below). Every map has at least one ranged pick (canonical/skill-delivery.json: a skill whose
//      delivery is "ranged", or one in "swing" that makes the unit's own swing ranged, e.g. Reach for a thrown trident or harpoon).
//   2  canonical/claude-new-cards.json "content17": {mapId: {name, groups: [{theme, current, picks: [{id, why, delivery, source}]}]}}, shown
//      by the admin Map cards window's "Claude New" section (arena_app.js ui22McClaudeNew) under small theme headings. THEME5's and
//      SKILLREC1's picks are kept (tools/ui22_claude_new_2026_11_04.py keeps this key).
//   3  the new cards: appended to canonical/cards.json with awaitingSource + unattainable, on no list (out of play until the owner places
//      them, docs/workflows/card-data.md; as tools/content7_cards_2026_11_02.js). Each gets the largest line on its Attack:Health shape inside
//      both caps at Level 1 with its proposed map's term and its rarity (tools/skill_costs.js budget, the bramblewood-budget.js N). No existing
//      card is edited. Art: the emoji until the owner draws it; prompts in docs/art-style-prompts.md (CONTENT17).
//   node tools/content17_2026_11_07.js            dry run (prices and checks; writes nothing)
//   node tools/content17_2026_11_07.js apply      appends the new cards (skips ids that exist) and writes the content17 key   (idempotent)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), CNEW = path.join(ROOT, 'canonical', 'claude-new-cards.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const POOLS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
const DELIV = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-delivery.json'), 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }

// Maps 0-20 and their submaps in unlock order (canonical/map-review.json's order; the Tutorial's extra list, the endless dungeons and the
// tower draw from many maps and are left out). mapN = the map term a card proposed for that map is priced with (a submap: its parent's
// number, the lower and so the stricter term).
const MAPS = [
  ['m1', 'Bramblewood Outskirts', 0], ['mtut', 'Tutorial', 0], ['mf', 'Thistlewood', 1], ['mb', 'Pebble Beach', 2], ['mc', 'Gannet Cliffs', 3],
  ['m2', 'Sunken Hollow', 4], ['mw', 'Gatorback Swamp', 5], ['m8', 'Sable Swampmire', 6], ['mp', 'Lilypad Reach', 2], ['mu', 'The Morel Hollow', 7],
  ['mg', "Smugglers' Grotto", 2], ['m4', 'Caves & Alcoves', 8], ['mz', 'The Mycelium Deep', 7], ['mk', 'The Kelp Mangroves', 9], ['m7', 'Coral Current', 10],
  ['m10', 'Eyrie Heights', 11], ['mj', 'The Sunken Depths', 10], ['mh', 'The Briar Maze', 12], ['mq', 'Clovermead', 1], ['mr', 'The Redwood Deep', 13],
  ['ms', 'The Sunken Grove', 5], ['m5', 'Savanna Reaches', 14], ['ml', 'The Long Grass', 15], ['mv', 'The Aerie Vault', 11], ['mt', 'The Pinewood Taiga', 16],
  ['mn', 'The Glimmer Depths', 8], ['m6', 'Wolfsbane Tundra', 17], ['md', 'The Glass Dunes', 18], ['my', 'The Canopy', 14], ['m3', 'Ashen Spurn', 19],
  ['mpd', 'The Pale Desert', 18], ['m11', 'The Sundered Peak', 20], ['me', 'Eye of the Volcano', 20], ['mx', 'Volcano Lair', 20],
];

// New cards (on no list). map = the map it is proposed for (its first pick), mapN = that map's term.
const NEW = [
  {id:'trident-caiman', name:'Trident Caiman', icon:'🐊', rarity:'uncommon', cost:1, wait:2, shape:[4, 10], species:['Reptile'], animal:'caiman', archetypes:['Swamp', 'Reptile'],
   effects:{reach:true, pierce:1}, map:'mw', flavor:'It found the fork in a sunken boat and learned to throw it. Then it learned to fetch it back.'},
  {id:'peat-smoke-shaman', name:'Peat-smoke Shaman', icon:'🐸', rarity:'uncommon', cost:1, wait:1, shape:[1, 9], species:['Amphibian'], animal:'toad', archetypes:['Swamp', 'Frog'],
   effects:{healing:1, cure:1}, map:'mw', flavor:'It hums over a smouldering pot of peat. The smoke smells awful, and the wounds close anyway.'},
  {id:'matamata', name:'Matamata', icon:'🐢', rarity:'uncommon', cost:1, wait:2, shape:[3, 13], species:['Reptile'], animal:'matamata turtle', archetypes:['Swamp', 'Turtle'],
   effects:{ambush:2, armor:1}, map:'mw', flavor:'It looks like a heap of dead leaves. Then the heap opens its mouth, and the river goes in.'},
  {id:'bog-lungfish', name:'Bog Lungfish', icon:'🐟', rarity:'common', cost:0, wait:1, shape:[2, 9], species:['Fish'], animal:'lungfish', archetypes:['Swamp', 'Fish'],
   effects:{regen:1, tide:true}, map:'ms', flavor:'When the bog dries up, it wraps itself in mud and waits. It has waited out kings.'},
  {id:'mossmother-newt', name:'Mossmother Newt', icon:'🦎', rarity:'common', cost:0, wait:1, shape:[1, 7], species:['Amphibian'], animal:'newt', archetypes:['Swamp', 'Newt'],
   effects:{healing:1}, map:'ms', flavor:'She packs moss into every cut and tells you it was your own fault.'},
  {id:'reed-dart-bittern', name:'Reed-dart Bittern', icon:'🐦', rarity:'uncommon', cost:1, wait:1, shape:[2, 6], species:['Bird'], animal:'bittern', archetypes:['Swamp', 'Bird'],
   effects:{arrow:1, stealth:true}, map:'m8', flavor:'It stands as still as a reed. Then one of the reeds flies at you.'},
  {id:'shoebill', name:'Shoebill', icon:'🐦', rarity:'rare', cost:1, wait:2, shape:[4, 12], species:['Bird'], animal:'shoebill', archetypes:['Swamp', 'Bird'],
   effects:{stunOnHit:1}, map:'m8', flavor:'It can stand and stare for an hour. Nothing in the bog has ever won the staring contest.'},
  {id:'hoatzin', name:'Hoatzin', icon:'🐦', rarity:'uncommon', cost:0, wait:1, shape:[2, 6], species:['Bird'], animal:'hoatzin', archetypes:['Swamp', 'Bird'],
   effects:{flying:true, poisonGas:1}, map:'m8', flavor:'Everything downwind calls it the stinkbird. Its chicks climb with claws on their wings.'},
  {id:'shell-drop-gull', name:'Shell-drop Gull', icon:'🕊️', rarity:'common', cost:0, wait:1, shape:[1, 5], species:['Bird'], animal:'gull', archetypes:['Coastal', 'Bird'],
   effects:{flying:true, arrow:1}, map:'mb', flavor:'It drops shells on the rocks to crack them. It does not much mind what is under the rocks.'},
  {id:'smuggler-slingrat', name:'Smuggler Slingrat', icon:'🐀', rarity:'uncommon', cost:1, wait:1, shape:[2, 7], species:['Rodent'], animal:'rat', archetypes:['Mouse', 'Coastal'],
   effects:{arrow:1, stealth:true}, map:'mg', flavor:'Sells you the lantern, then shoots it out. Everything has a price, friend, even the dark.'},
  {id:'tidefolk-harpooner', name:'Tidefolk Harpooner', icon:'🦭', rarity:'rare', cost:1, wait:2, shape:[3, 11], species:['Pinniped'], animal:'grey seal', archetypes:['Ocean', 'Mangrove'],
   effects:{reach:true, tide:true}, map:'mk', flavor:'The Tidefolk throw from below the surface. The dry ones never see the arm.'},
  {id:'snapgun-shrimp', name:'Snapgun Shrimp', icon:'🦐', rarity:'common', cost:0, wait:1, shape:[1, 5], species:['Crustacean'], animal:'pistol shrimp', archetypes:['Coral Reef', 'Ocean'],
   effects:{shockBolt:1}, map:'m7', flavor:'One snap makes a bubble hotter than a forge. It pops two fish away.'},
  {id:'quill-flinger-porcupine', name:'Quill-flinger Porcupine', icon:'🦔', rarity:'uncommon', cost:1, wait:1, shape:[2, 9], species:['Rodent'], animal:'porcupine', archetypes:['Porcupine'],
   effects:{arrow:1, thorns:1}, map:'mh', flavor:'Porcupines cannot throw their quills, everyone says. This one never heard.'},
  {id:'acorn-pelter-squirrel', name:'Acorn-pelter Squirrel', icon:'🐿️', rarity:'common', cost:0, wait:1, shape:[1, 4], species:['Rodent'], animal:'red squirrel', archetypes:['Chipmunk', 'Forest'],
   effects:{arrow:1}, map:'m1', flavor:'It has a whole tree of ammunition and a very good memory for faces.'},
  {id:'pinecone-crossbill', name:'Pinecone Crossbill', icon:'🐦', rarity:'common', cost:0, wait:1, shape:[1, 6], species:['Bird'], animal:'crossbill', archetypes:['Taiga', 'Bird'],
   effects:{flying:true, arrow:1}, map:'mt', flavor:'Its crossed beak was made for prising open pinecones. Dropping them on wolves came later.'},
  {id:'yeti-tracker', name:'Yeti Tracker', icon:'🦡', rarity:'uncommon', cost:1, wait:1, shape:[2, 9], species:['Mustelid'], animal:'wolverine', archetypes:['Tundra'],
   effects:{keenEye:true, bola:1}, map:'m6', flavor:'It reads a yeti track like a letter: how big, how hungry, how long ago.'},
  {id:'icefletch-fox', name:'Icefletch Fox', icon:'🦊', rarity:'uncommon', cost:1, wait:1, shape:[2, 6], species:['Canid'], animal:'arctic fox', archetypes:['Tundra', 'Fox'],
   effects:{iceArrow:1, evasive:true}, map:'m6', flavor:'Its shafts are icicles snapped from the eaves. They melt away; the cold stays in.'},
  {id:'yeti-snarer', name:'Yeti Snarer', icon:'🐆', rarity:'rare', cost:1, wait:2, shape:[3, 12], species:['Felid'], animal:'snow leopard', archetypes:['Tundra', 'Mountain'],
   effects:{lasso:2, pounce:1}, map:'m6', flavor:'The yeti hunters bring rope, patience and one snow leopard who has done this before.'},
  {id:'sand-flinger-antlion', name:'Sand-flinger Antlion', icon:'🐜', rarity:'common', cost:0, wait:1, shape:[2, 6], species:['Insect'], animal:'antlion', archetypes:['Desert', 'Insect'],
   effects:{arrow:1}, map:'md', flavor:'It flicks sand at anything on the slope until the slope gives way.'},
  {id:'stonecracker-vulture', name:'Stonecracker Vulture', icon:'🦅', rarity:'uncommon', cost:1, wait:1, shape:[2, 8], species:['Bird'], animal:'vulture', archetypes:['Desert', 'Vulture'],
   effects:{flying:true, arrow:2}, map:'mpd', flavor:'Too small to crack an egg by force, so it carries a stone. Then it found other things to crack.'},
];
const MAPN = Object.fromEntries(MAPS.map(m=> [m[0], m[2]]));

// The picks: [theme, current?, [[id, why], ...]] per map. The first group is the map's current theme ("more of the same").
const PICKS = {
  m1: [
    ['Meadow critters (current)', true, [['rabbit-kit', 'a second, quicker rabbit for the warren'], ['field-crow', 'a cheap flyer for the fields'], ['pill-bug', 'a small armoured bug beside the ants'], ['beetle-grunt', 'an armoured beetle grunt'], ['ladybird-guard', 'a Guardian bug for the meadow'], ['clover-butterfly', 'a flyer from the clover edge']]],
    ['Woodland edge scouts', false, [['acorn-pelter-squirrel', 'new: an early arrow-er from the first trees'], ['owl-fletcher', 'a night owl that shoots, for the tree-line'], ['warren-scout', 'a rabbit scout that spots hidden foes'], ['bear-cub', 'a sturdy cub for the woods'], ['beaver-builder', 'a builder beside the Lumberjack'], ['chipmunk-stockpiler', 'a chipmunk that earns Bounty']]],
    ['Farmyard friends', false, [['farm-dog', 'a dog friend of both peoples'], ['village-miller', 'a road-folk miller mouse'], ['pigeon-peon', 'a village pigeon flyer']]],
  ],
  mtut: [
    ['Teaching cards (current)', true, [['sparrow-chick', 'the plainest flyer to teach Flying'], ['rabbit-kit', 'teaches Evasive'], ['pill-bug', 'teaches Armor'], ['beetle-grunt', 'a plain armoured body']]],
    ['First shots (ranged)', false, [['acorn-pelter-squirrel', 'new: teaches a shot every upkeep'], ['owl-fletcher', 'a shot from a flyer']]],
    ['Late-tutorial bruisers', false, [['bear-cub', 'a bigger body for the hard last fights'], ['armored-mastiff', 'a slow, heavy dog for the last fights']]],
  ],
  mf: [
    ['Hedgerow small folk (current)', true, [['hazel-coppice', 'a hazel stool the dormice tend'], ['red-backed-salamander', 'a small regenerating salamander'], ['leopard-slug', 'a slow, regenerating slug'], ['fungus-gnat-cloud', 'a swarm for the damp fern'], ['jay-pilferer', 'a jay that steals Lumber']]],
    ['Night shift (owls and moths)', false, [['owl-fletcher', 'a shooting owl for the first big trees'], ['night-watchman', 'a village owl, stronger at night'], ['nightjar-drifter', 'a dusk bird'], ['moonlit-hare', 'a hare that waits for the moon'], ['garden-tiger-moth', 'a night moth']]],
    ['Woodland marksmen (ranged)', false, [['acorn-pelter-squirrel', 'new: acorns from the canopy'], ['fox-sharpshot', 'a fox that snipes the weakest'], ['muntjac-barker', 'a deer that barks at what comes close (Sentry)']]],
  ],
  mb: [
    ['Rock pools (current)', true, [['limpet-clinger', 'a limpet with a Shell'], ['barnacle-fortress', 'an armoured barnacle wall'], ['salvager-hermit-crab', 'a crab that salvages'], ['beachcomber-sanderling', 'a sanderling that finds driftwood'], ['oyster-bank', 'an oyster bank that shores up']]],
    ['Mudflat waders', false, [['shell-drop-gull', 'new: drops shells on what is below (ranged)'], ['mudflat-godwit', 'a wader that gives Tide'], ['great-skua', 'a skua that makes wounds bleed'], ['bloodworm', 'a four-jawed worm of the flats']]],
    ['Tidefolk on the shore', false, [['kelpborn-otter', 'a Tidefolk otter, not the Legion'], ['conger-eel', 'a Tidefolk eel with Fork'], ['selkie-wavebinder', 'half seal, half song']]],
  ],
  mc: [
    ['Ledge seabirds (current)', true, [['arctic-tern', 'a tern that fights by day'], ['great-skua', 'the pirate of the ledges'], ['fulmar-spitter', 'a fulmar that spits oil (far: The Undercroft only)'], ['anvil-thrush', 'a thrush that cracks shells on stones']]],
    ['Stone-droppers (ranged)', false, [['stonedrop-vulture', 'the cliff bird that drops stones'], ['eagle-sharpshooter', 'an eagle that shoots from the air (far: Tutorial / Map 21)'], ['shell-drop-gull', 'new: shells dropped from the cliff top'], ['scree-goat', 'a goat that starts a landslide']]],
    ['Cliff climbers', false, [['mountain-goat-climber', 'a sure-footed goat (far: Map 21)'], ['marmot-stonecutter', 'a marmot that cuts stone'], ['pika-hoarder', 'a pika in the cracks (far: Map 21)'], ['mirrorhide-mutant', 'a strange goat that mimics']]],
  ],
  m2: [
    ['River and pond (current)', true, [['river-mink', 'a mink of the banks'], ['signal-crayfish', 'an armoured crayfish'], ['great-crested-grebe', 'a diving grebe'], ['diving-bell-spider', 'a spider that lives underwater'], ['grass-snake', 'a snake that plays dead'], ['shallows-fry', 'cheap fry in the shallows']]],
    ['Shockers and spitters (ranged)', false, [['electric-catfish', 'a catfish with a Shock Bolt'], ['voltaic-eel', 'an eel whose lightning jumps'], ['archerfish', 'spits at insects over the water (far: The Undercroft only)']]],
    ['Strange pond life', false, [['tardigrade', 'the water bear that will not die'], ['mayfly-dancer', 'a mayfly that lives for one fight'], ['puddle-skimmer', 'a pond skater that runs in the rain'], ['elephant-nose-fish', 'a fish that senses through the mud'], ['lotus-frog', 'a frog that blooms']]],
  ],
  mw: [
    ['Gators and snakes (current)', true, [['trident-caiman', 'new: a caiman that throws a fork (ranged, Reach)'], ['anaconda-coil', 'a strangling anaconda'], ['cottonmouth-matriarch', 'a venom matriarch'], ['raft-spider', 'a spider that rides the water']]],
    ['Strange bog animals', false, [['matamata', 'new: a turtle that looks like dead leaves'], ['greater-siren', 'an eel-like salamander'], ['hellbender', 'a giant salamander'], ['giant-water-bug', 'a venomous water bug'], ['bog-revenant', 'a bog turtle that remembers']]],
    ['Bog shamans and herbalists', false, [['peat-smoke-shaman', 'new: a toad who heals and cures with peat smoke'], ['marsh-mallow-hare', 'a hare that cures Venom with marsh-mallow'], ['sphagnum-vole', 'a vole that packs wounds with moss'], ['mudpuppy', 'a regenerating mudpuppy']]],
    ['Swamp sharpshooters (ranged)', false, [['archerfish', 'spits from the water (far: The Undercroft only)'], ['reed-dart-bittern', 'new: a bittern that shoots from the reeds']]],
  ],
  m8: [
    ['Biters and venom (current)', true, [['clinging-leech', 'a leech parasite'], ['mosquito-cloud', 'a cloud that makes wounds bleed'], ['bog-shrew', 'a Gnawed shrew that saps'], ['mire-rat', 'a Gnawed rat of the pack'], ['carrion-beetle', 'a beetle that festers wounds']]],
    ['Strange bog animals', false, [['shoebill', 'new: the stare that stuns'], ['hoatzin', 'new: the stinkbird'], ['the-unremembered', 'a heron the bog forgot'], ['marsh-wisp', 'a newt that glows and remembers'], ['marsh-gas-toad', 'a toad full of marsh gas']]],
    ['Bog shamans and herbalists', false, [['peat-smoke-shaman', 'new: heals and cures with peat smoke'], ['mossmother-newt', 'new: a moss-packing healer'], ['sphagnum-vole', 'a moss healer vole']]],
    ['Marsh lights (ranged)', false, [['reed-dart-bittern', 'new: shoots from the reeds'], ['firefly-swarm', 'marsh lights that throw a Fire Bolt']]],
  ],
  mp: [
    ['Ponds and dams (current)', true, [['dam-keeper-beaver', 'a beaver that builds a rampart'], ['beaver-builder', 'a beaver builder'], ['great-crested-grebe', 'a diving grebe'], ['lotus-frog', 'a frog that blooms on the pads'], ['puddle-skimmer', 'a pond skater']]],
    ['Territorial ducks', false, [['goose-sentry', 'a goose on watch (ranged, Sentry)'], ['pond-paddler', 'a pond duck'], ['mallard-marauder', 'a pouncing mallard'], ['migration-leader', 'the duck at the front of the V'], ['duckling-squadron', 'ducklings in a line (far: Map 24)']]],
    ['Reed-bank marksmen (ranged)', false, [['mallard-halberdier', 'a mallard with a long reach (far: Map 24)'], ['battlement-heron', 'a heron that shoots and keeps watch (far: Map 24)'], ['electric-catfish', 'a catfish with a Shock Bolt']]],
  ],
  mu: [
    ['Fungal hollow (current)', true, [['leopard-slug', 'a slug among the mushrooms'], ['fungus-gnat-cloud', 'fungus gnats'], ['millipede-hauler', 'an armoured millipede'], ['springtail-hopper', 'a springtail in the leaf litter'], ['velvet-worm', 'a velvet worm with sticky slime']]],
    ['Spore shooters (ranged)', false, [['puffball-bombardier', 'a toad that shoots puffball spores'], ['firefly-swarm', 'fireflies under the oaks']]],
    ['Rot and recyclers', false, [['carrion-beetle', 'a festering carrion beetle'], ['guano-beetle', 'a beetle that eats what falls'], ['rot-swollen-carcass', 'maggots that burst into more'], ['amber-cicada', 'a cicada that scares']]],
    ['Oak hollow night', false, [['owl-fletcher', 'a shooting owl in the old oaks'], ['glowworm-cluster', 'glowworms that pray'], ['skunk-gasser', 'a skunk with poison gas']]],
  ],
  mg: [
    ['Sea cave (current)', true, [['salvager-hermit-crab', 'a crab that salvages wreckage'], ['coffer-mimic', 'a hermit crab in a chest'], ['sea-hare', 'a sea slug with ink'], ['moray-ambusher', 'an eel in the rocks']]],
    ['Smugglers (road-folk)', false, [['smuggler-slingrat', 'new: a smuggler rat with a sling (ranged)'], ['pack-rat-looter', 'a looting pack rat'], ['raccoon-nightcrew', 'a raccoon thief crew'], ['smoke-raccoon', 'a raccoon with a smoke bomb'], ['glintsnatch-magpie', 'a magpie that disarms']]],
    ['Grotto Tidefolk', false, [['kelpborn-otter', 'a Tidefolk otter'], ['conger-eel', 'the eel in the wreck the Tidefolk sank'], ['selkie-wavebinder', 'a Tidefolk seal']]],
  ],
  m4: [
    ['Caves and burrows (current)', true, [['cave-cricket', 'an evasive cave cricket'], ['cave-pseudoscorpion', 'a venomous pseudoscorpion'], ['ghost-crayfish', 'a blind armoured crayfish'], ['subterraneaner', 'a mole that ambushes from below'], ['gravel-mole', 'a Hollow Kin mole that digs gravel']]],
    ['Storm bats (ranged)', false, [['voltwing-bat', 'a bat that sparks'], ['static-bat', 'a bigger spark bat'], ['arc-bat', 'the strongest spark bat'], ['bolas-spider', 'a spider that throws a sticky bola']]],
    ['Hollow Kin deep', false, [['gorge-wyrm', 'a worm whose quake hits everything (ranged)'], ['cave-swiftlet', 'a swiftlet that hunts by sound'], ['guano-beetle', 'a guano beetle'], ['quarry-troll', 'a donkey quarry hand that sees in the dark']]],
  ],
  mz: [
    ['Root network (current)', true, [['velvet-worm', 'a velvet worm in the roots'], ['millipede-hauler', 'a millipede hauler'], ['leopard-slug', 'a slug on the roots'], ['red-backed-salamander', 'a salamander under the bark']]],
    ['Spore shooters (ranged)', false, [['puffball-bombardier', 'a toad that shoots spores'], ['firefly-swarm', 'fireflies in the dark']]],
    ['Listening dark', false, [['glowworm-cluster', 'glowworms on the ceiling'], ['cave-cricket', 'a cricket that hears you coming'], ['tunnel-wyrm', 'a worm in the tunnels'], ['subterraneaner', 'a mole that ambushes']]],
  ],
  mk: [
    ['Mangrove and kelp (current)', true, [['fishing-cat', 'a cat that fishes the roots'], ['sea-hare', 'a sea slug with ink'], ['kelpborn-otter', 'a Tidefolk otter'], ['ironclaw-fiddler', 'a big fiddler crab'], ['yellow-bellied-sea-snake', 'a venomous sea snake']]],
    ['Tidefolk raiders', false, [['tidefolk-harpooner', 'new: a seal that throws a harpoon from below (ranged, Reach)'], ['conger-eel', 'a Tidefolk eel'], ['selkie-wavebinder', 'a Tidefolk seal']]],
    ['Mangrove marksmen (ranged)', false, [['archerfish', 'the mangrove spitter (far: The Undercroft only)'], ['voltaic-eel', 'an eel whose lightning jumps']]],
    ['Night bays', false, [['night-algae', 'algae that light the bay at night'], ['bobbit-worm', 'a worm that snaps from the sand'], ['mudflat-godwit', 'a wader of the mud']]],
  ],
  m7: [
    ['Reef and ocean (current)', true, [['lionfish', 'a venomous lionfish'], ['cone-snail', 'a cone snail with a toxin'], ['cleaner-wrasse', 'a fish that cures'], ['crown-of-thorns-star', 'a thorny starfish'], ['giant-clam', 'a giant clam'], ['pistol-shrimp', 'a shrimp whose snap stuns'], ['nautiloid', 'the oldest hunter of the Current']]],
    ['Open-water hunters', false, [['hammerhead-shark', 'a hammerhead'], ['bloodscent-shark', 'a shark that smells blood'], ['sawfish', 'a sawfish that breaches'], ['leopard-seal', 'a predator seal'], ['whale-shark', 'a gentle giant with armour']]],
    ['Reef gunners (ranged)', false, [['snapgun-shrimp', 'new: a pistol shrimp whose bubble hits at range'], ['voltaic-eel', 'an eel whose lightning jumps']]],
  ],
  m10: [
    ['Mountain and sky (current)', true, [['mountain-goat-climber', 'a climbing goat (far: Map 21)'], ['snow-leopard', 'a mountain cat (far: Map 21)'], ['pika-hoarder', 'a pika (far: Map 21)'], ['anvil-thrush', 'a thrush that cracks shells'], ['weathervane-swift', 'a swift that breaks fields']]],
    ['Stone-droppers (ranged)', false, [['stonedrop-vulture', 'drops stones from the heights'], ['eagle-sharpshooter', 'an eagle that shoots (far: Tutorial / Map 21)']]],
    ['Raptor strike', false, [['eagle-diver', 'a diving eagle'], ['raven-harbinger', 'a raven of ill omen'], ['great-horned-owl', 'a great horned owl']]],
  ],
  mj: [
    ['Wreck reef (current)', true, [['moray-ambusher', 'an eel in the hull'], ['man-o-war', 'a drifting man o\' war'], ['bobbit-worm', 'a worm in the sand of the wreck'], ['sea-cucumber', 'a sea cucumber'], ['cone-snail', 'a cone snail']]],
    ['Deep strangers', false, [['sperm-whale-elder', 'a whale that brings a Tsunami (ranged; Epic, a side map may exceed the road ladder)'], ['cuttlefish-illusionist', 'an evasive cuttlefish'], ['greenland-shark', 'the oldest shark (far: The Ice Hollow)'], ['swordfish-spearman', 'a swordfish with a Trident (melee) (far: The Undercroft only)']]],
    ['Wreck gunners (ranged)', false, [['snapgun-shrimp', 'new: a bubble from the hull'], ['tidefolk-harpooner', 'new: the Tidefolk who sank the ferry']]],
  ],
  mh: [
    ['Briar maze (current)', true, [['briarback-hedgehog', 'a hedgehog with bramble armour'], ['barkplate-beetle', 'a thorny bark beetle'], ['porcupine-roller', 'a rolling porcupine (far: The Undercroft only)'], ['hedgehog-scout', 'a thorny hedgehog scout (far: The Undercroft only)'], ['stag-beetle', 'a stag beetle that sweeps']]],
    ['Quill shooters (ranged)', false, [['quill-flinger-porcupine', 'new: a porcupine that flings its quills'], ['gatling-hog', 'a hedgehog that shoots twice (far: The Old Bramble)'], ['fox-sharpshot', 'a fox that snipes in the maze']]],
    ['Greenhood Band (thieves)', false, [['jay-pilferer', 'a jay that steals Lumber'], ['glintsnatch-magpie', 'a magpie that disarms'], ['smoke-raccoon', 'a raccoon with a smoke bomb'], ['raccoon-nightcrew', 'a raccoon crew'], ['king-maker', 'a fox that hunts kings']]],
  ],
  mq: [
    ['Clover meadow (current)', true, [['clover-butterfly', 'a clover butterfly'], ['rabbit-kit', 'a rabbit kit'], ['jackrabbit-sprinter', 'a quick jackrabbit'], ['ladybird-guard', 'a ladybird Guardian'], ['paper-wasp', 'a paper wasp']]],
    ['Hive and honey', false, [['colony', 'an ant colony'], ['nest', 'a wasp nest'], ['swarm-matriarch', 'a bee matriarch'], ['bee-drone', 'a bee drone']]],
    ['Haymaking village', false, [['balloon-archer', 'a mouse archer in a balloon (ranged) (far: Map 24)'], ['village-miller', 'a miller mouse'], ['farm-dog', 'a farm dog'], ['buzzed-chipmunk', 'a chipmunk on coffee']]],
  ],
  mr: [
    ['Redwood giants (current)', true, [['bear-cub', 'a bear cub'], ['woodland-brawler', 'a woodland bear'], ['stag-knight', 'a great stag'], ['antler-skirmisher', 'a young stag'], ['boar-rampager', 'a sweeping boar'], ['pine-marten', 'a pouncing marten']]],
    ['Treetop shooters (ranged)', false, [['owl-fletcher', 'a shooting owl in the red shade'], ['fox-sharpshot', 'a sniping fox'], ['muntjac-barker', 'a barking deer (Sentry)']]],
    ['Old-growth spirits', false, [['heartwood-treant', 'a tree that walks'], ['lichen-tortoise', 'a tortoise grown over with lichen'], ['amber-cicada', 'a cicada in the amber'], ['werebadger', 'a badger that changes']]],
  ],
  ms: [
    ['Gators and snakes (current)', true, [['trident-caiman', 'new: a caiman that throws a fork (ranged, Reach)'], ['anaconda-coil', 'a strangling anaconda'], ['cottonmouth-matriarch', 'a venom matriarch']]],
    ['Strange bog animals', false, [['matamata', 'new: a leaf-heap turtle'], ['bog-lungfish', 'new: waits out the drought in mud'], ['greater-siren', 'an eel-like salamander'], ['bog-revenant', 'a bog turtle that remembers']]],
    ['Bog shamans and herbalists', false, [['mossmother-newt', 'new: a moss-packing healer'], ['peat-smoke-shaman', 'new: peat-smoke healing'], ['marsh-mallow-hare', 'a marsh-mallow curer']]],
    ['Drowned-forest shooters (ranged)', false, [['archerfish', 'spits from between the trunks (far: The Undercroft only)'], ['reed-dart-bittern', 'new: shoots from the reeds']]],
  ],
  m5: [
    ['Savanna (current)', true, [['plains-zebra', 'an evasive zebra'], ['meerkat-sentry', 'a sociable meerkat'], ['termite-mound', 'an armoured termite mound'], ['termite-forager', 'a termite that delivers'], ['marching-elephant', 'a marching elephant'], ['rabid-jackal', 'a rabid jackal']]],
    ['Thrown fruit and stones (ranged)', false, [['howdah-archers', 'langur archers (far: Maps 23-24)'], ['bramblewood-macaque', 'a macaque that throws bananas'], ['stonecracker-vulture', 'new: a vulture that drops stones']]],
    ['Grass-fire hunters', false, [['fire-hawk', 'a kite that spreads fire'], ['mongoose-duelist', 'a mongoose that defies'], ['marula-monkey', 'a monkey on fermented fruit']]],
  ],
  ml: [
    ['Farm country (current)', true, [['farm-dog', 'a farm dog'], ['war-hound', 'a war hound'], ['armored-mastiff', 'an armoured mastiff'], ['squires-mount', 'a riding horse'], ['stable-colt', 'a colt (far: The Undercroft only)'], ['warhorse-charger', 'a warhorse (far: The Undercroft only)']]],
    ['Village militia marksmen (ranged)', false, [['balloon-archer', 'a mouse archer in a balloon (far: Map 24)'], ['goose-sentry', 'a goose on watch (Sentry)'], ['trebuchet-crew', 'a beaver siege crew (Volley)'], ['mallard-halberdier', 'a mallard with a long reach (far: Map 24)'], ['muntjac-barker', 'a barking deer (Sentry)']]],
    ['Hedge and harvest', false, [['sworn-shieldbearer', 'a stoat sworn to its leader'], ['parish-sergeant', 'a badger with a banner'], ['village-miller', 'a miller mouse'], ['land-tiller', 'a mouse that tills (far: Map 24)']]],
  ],
  mv: [
    ['Old nests (current)', true, [['weathervane-swift', 'a swift on the old nests'], ['great-horned-owl', 'a great horned owl'], ['magpie-collector', 'a magpie with a hoard']]],
    ['Stone-droppers (ranged)', false, [['stonedrop-vulture', 'drops stones on the nest-raiders'], ['eagle-sharpshooter', 'an eagle that shoots (far: Tutorial / Map 21)'], ['owl-fletcher', 'a shooting owl']]],
    ['Nest guardians', false, [['snow-owl-sentinel', 'a snowy owl sentinel (far: Map 21)'], ['raven-hexcaller', 'a raven that hexes'], ['bone-diviner', 'a raven that reads bones']]],
  ],
  mt: [
    ['Taiga (current)', true, [['timber-wolf-pack', 'a timber wolf pack'], ['wolf-pack-runner', 'a mustering wolf'], ['trickster-fox', 'a trickster fox'], ['pinecone-sapper', 'a pangolin that explodes like a pinecone'], ['frostmoon-howler', 'a howling wolf (far: The Undercroft only)']]],
    ['Pine marksmen (ranged)', false, [['pinecone-crossbill', 'new: drops pinecones on wolves'], ['owl-fletcher', 'a shooting owl in the pines'], ['snow-bunting-archer', 'a bunting with Ice Arrow from the snow edge']]],
    ['Bears and elk', false, [['bear-cub', 'a bear cub'], ['woodland-brawler', 'a woodland bear'], ['ur-elk', 'a huge old elk (far: Map 22)'], ['musk-ox-calf', 'a musk ox calf']]],
  ],
  mn: [
    ['Shiny caves (current)', true, [['geode-scorpion', 'a scorpion that crystallises'], ['glowworm-cluster', 'glowworms'], ['coffer-mimic', 'a mimic chest'], ['ore-smelter-mole', 'a mole that smelts (far: Maps 19-A / 22 / 24)']]],
    ['Storm bats (ranged)', false, [['static-bat', 'a spark bat'], ['arc-bat', 'a big spark bat'], ['bolas-spider', 'a bola-throwing spider']]],
    ['Collectors', false, [['glintsnatch-magpie', 'a magpie that snatches'], ['magpie-collector', 'a magpie collector'], ['pack-rat-looter', 'a looting pack rat']]],
  ],
  m6: [
    ['Tundra packs (current)', true, [['ice-crevasse-wolf', 'a crevasse wolf'], ['arctic-fox-raider', 'an arctic fox raider'], ['frostbitten-wolverine', 'a frostbiting wolverine'], ['tundra-musk-ox', 'a thorny musk ox'], ['lemming-swarm', 'a lemming swarm']]],
    ['Yeti hunters (ranged)', false, [['yeti-tracker', 'new: the wolverine who reads yeti tracks (Bola)'], ['icefletch-fox', 'new: ice arrows from the tundra'], ['yeti-snarer', 'new: the snow leopard with the rope (Lasso)'], ['ice-petrel', 'a petrel with an Ice Bolt (far: Map 22)']]],
    ['Sea-ice coast', false, [['ringed-seal', 'a seal under the ice'], ['harp-seal-pup', 'a harp seal pup'], ['krill-swarm', 'krill'], ['musk-ox-matriarch', 'a musk ox that shores up the herd'], ['arctic-tern', 'an arctic tern']]],
  ],
  md: [
    ['Glass dunes (current)', true, [['dune-jackal', 'a quick jackal'], ['dune-jackal-scout', 'an armoured jackal scout'], ['glasswing-moth', 'a glasswing moth'], ['horned-lizard', 'a lizard that blinds'], ['armadillo-guard', 'an armadillo with a shield'], ['inland-taipan', 'the most venomous snake']]],
    ['Sand-throwers (ranged)', false, [['sand-flinger-antlion', 'new: flicks sand down the slope'], ['stonecracker-vulture', 'new: drops stones']]],
    ['Night desert', false, [['moon-jerboa', 'a jerboa of the full moon'], ['glowing-gecko', 'a glowing gecko'], ['pale-oryx', 'a pale oryx'], ['frillneck-duelist', 'a frilled lizard duelist']]],
  ],
  my: [
    ['Jungle canopy (current)', true, [['poison-dart-frog', 'a poison dart frog'], ['leaf-chameleon', 'an invisible chameleon'], ['slow-loris', 'a slow loris'], ['aye-aye-prowler', 'an aye-aye'], ['chilli-parrot', 'a parrot with chilli'], ['glasswing-butterfly', 'a ghostly glasswing']]],
    ['Fruit throwers (ranged)', false, [['howler-monkey', 'a monkey with a bananarang'], ['bramblewood-macaque', 'a macaque that throws bananas'], ['howdah-archers', 'langur archers (far: Maps 23-24)']]],
    ['Drums and stranglers', false, [['war-drum-mandrill', 'a drumming mandrill'], ['strangler-vine', 'a strangler vine'], ['margay', 'a shadow margay'], ['gloom-gibbon', 'a gibbon in the shade']]],
  ],
  m3: [
    ['Volcanic and ash (current)', true, [['obsidian-lich', 'an armoured obsidian lizard'], ['sulfur-vent-crab', 'a vent crab'], ['ashwing-ptarmigan', 'a ptarmigan of ash and snow'], ['basalt-boar', 'a basalt boar (far: The Long Burrow)'], ['cinder-hornet', 'a stunning hornet (far: Map 22)']]],
    ['Yeti and its hunters', false, [['yeti-snarer', 'new: the snow leopard who snares yeti (Lasso)'], ['yeti-tracker', 'new: the wolverine tracker (Bola)'], ['icefletch-fox', 'new: ice arrows'], ['glacier-yak', 'a yak that freezes (far: Maps 21-22)']]],
    ['Fire-and-ice shooters (ranged)', false, [['rimefire-salamander', 'fire and ice arrows (far: Map 22)'], ['firefly-swarm', 'a firefly Fire Bolt'], ['pyroclast-wyrm', 'a wyrm with a Fire Arrow']]],
  ],
  mpd: [
    ['Pale desert (current)', true, [['dune-jackal', 'a quick jackal'], ['pale-oryx', 'a pale oryx'], ['horned-lizard', 'a lizard that blinds'], ['meerkat-sentry', 'a meerkat sentry'], ['glasswing-moth', 'a glasswing moth']]],
    ['Stone and sand throwers (ranged)', false, [['stonecracker-vulture', 'new: drops stones on the pale sands'], ['sand-flinger-antlion', 'new: flicks sand']]],
    ['Venom and sting', false, [['inland-taipan', 'a taipan'], ['geode-scorpion', 'a crystal scorpion'], ['tarantula-hawk', 'a tarantula hawk']]],
  ],
  m11: [
    ['Apex volcanic (current)', true, [['ember-revenant', 'an undead ember boar (far: Map 19-A)'], ['phoenix-fledgling', 'a phoenix chick (far: Maps 19-A / 22)'], ['caldera-snow-leopard', 'a caldera snow leopard (far: Map 22)'], ['basalt-boar', 'a basalt boar (far: The Long Burrow)']]],
    ['Fire shooters (ranged)', false, [['pyroclast-wyrm', 'a wyrm with a Fire Arrow'], ['firefly-swarm', 'a firefly Fire Bolt'], ['rimefire-salamander', 'fire and ice arrows (far: Map 22)'], ['stonedrop-vulture', 'drops stones from the crown']]],
    ['Mountain crown', false, [['snow-leopard', 'a mountain cat (far: Map 21)'], ['ur-elk', 'a huge old elk (far: Map 22)'], ['glacier-yak', 'a freezing yak (far: Maps 21-22)']]],
  ],
  me: [
    ['Ash dead (current)', true, [['ember-revenant', 'an undead ember boar (far: Map 19-A)'], ['pall-wraith', 'a raven that casts darkness'], ['ash-imp', 'an ash imp'], ['cinder-imp', 'a cinder imp']]],
    ['Fire shooters (ranged)', false, [['firefly-swarm', 'a firefly Fire Bolt'], ['pyroclast-wyrm', 'a wyrm with a Fire Arrow']]],
    ['The living who need little', false, [['cinder-gecko', 'a cinder gecko (far: Maps 19-A / 22)'], ['ashwing-ptarmigan', 'an ash ptarmigan'], ['sulfur-vent-crab', 'a vent crab']]],
  ],
  mx: [
    ['Dragon lair (current)', true, [['pyroclast-wyrm', 'a young wyrm with a Fire Arrow (ranged)'], ['obsidian-lich', 'an obsidian lizard'], ['cinder-hornet', 'a stunning hornet (far: Map 22)']]],
    ['Lair shooters (ranged)', false, [['firefly-swarm', 'a firefly Fire Bolt'], ['rimefire-salamander', 'fire and ice arrows (far: Map 22)'], ['thunder-lizard', 'a lizard with Dragon Lightning (Epic; a side map may exceed the road ladder)']]],
    ['Lair guardians', false, [['basalt-boar', 'a basalt boar (far: The Long Burrow)'], ['ember-revenant', 'an undead ember boar (far: Map 19-A)'], ['phoenix-fledgling', 'a phoenix chick (far: Maps 19-A / 22)']]],
  ],
};

module.exports = {NEW, PICKS, MAPS};
if(require.main !== module) return; // required (tests): the data only

const isRangedFx = fx=> Object.keys(fx || {}).some(k=> DELIV.delivery[k] === 'ranged' || (DELIV.swing || []).includes(k));
const deliveryOf = c=> isRangedFx(c.effects) ? 'ranged' : (Number(c.attack) > 0 ? 'melee' : 'none');
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
function priceNew(s){
  const base = {id:s.id, name:s.name, icon:s.icon, cost:s.cost, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false, archetypes:s.archetypes.slice(), species:s.species.slice(), animal:s.animal};
  Object.assign(base, {dmgType:'physical', resist:[], tags:[], effects:JSON.parse(JSON.stringify(s.effects)), flavor:s.flavor});
  const mapN = MAPN[s.map], fit = Object.assign({}, base, {obtainMap:mapN});
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(fit, A, H);
    if(b && (!best || b.x1 > best.b.x1 || (b.x1 === best.b.x1 && Math.abs(A / H - s.shape[0] / s.shape[1]) < Math.abs(best.A / best.H - s.shape[0] / s.shape[1])))) best = {A, H, b}; }
  return {base, best, mapN};
}

const by = Object.fromEntries(cards.map(c=> [c.id, c])), newIds = new Set(NEW.map(s=> s.id));
const parent = {}; Object.entries(POOLS).forEach(([k, e])=> Object.keys(e.submaps || {}).forEach(s=> parent[s] = k));
const ownLists = m=>{ const top = parent[m] || m, e = POOLS[top] || {}; return new Set([].concat(e.cards || [], e.special || [], ...Object.values(e.submaps || {}))); };
const problems = [], report = [];
// 1. the new cards
const priced = NEW.map(s=>{ const p = priceNew(s); if(!p.best) problems.push('no legal line: ' + s.id);
  if(Object.keys(s.effects).length > 2) problems.push('more than two skills: ' + s.id);
  if(by[s.id] && !by[s.id].awaitingSource) problems.push('id taken by a live card: ' + s.id);
  return Object.assign(p, {s}); });
priced.forEach(({s, best, mapN})=> best && report.push(`${s.id.padEnd(24)} ${s.rarity.padEnd(9)} L${s.cost} W${s.wait} ${best.A}/${best.H}  S ${(+best.b.S).toFixed(2)}  2A+H+S ${(+best.b.x1).toFixed(2)} / N ${(+best.b.N).toFixed(2)}  ${Object.keys(s.effects).join('+')}  ${isRangedFx(s.effects) ? 'RANGED' : 'melee'}  -> ${s.map} (Map ${mapN})`));
const defOf = id=> by[id] || (priced.find(p=> p.s.id === id) || {}).base;
// 2. the picks
const out = {};
MAPS.forEach(([m, name])=>{
  const groups = PICKS[m]; if(!groups){ problems.push('no picks: ' + m); return; }
  const lists = ownLists(m), seen = new Set(); let n = 0;
  out[m] = {name, groups: groups.map(([theme, current, picks])=> ({theme, current: !!current, picks: picks.map(([id, why])=>{
    const c = defOf(id); if(!c){ problems.push(`${m}: unknown card ${id}`); return null; }
    if(lists.has(id)) problems.push(`${m}: ${id} is already on this map's lists`);
    if(seen.has(id)) problems.push(`${m}: ${id} twice`); seen.add(id); n++;
    return {id, why, delivery: deliveryOf(c), source: newIds.has(id) ? 'new' : 'existing'};
  }).filter(Boolean)}))};
  if(n > 15) problems.push(`${m}: ${n} picks (max 15)`);
  if(!out[m].groups.some(g=> g.picks.some(p=> p.delivery === 'ranged'))) problems.push(`${m}: no ranged pick`);
});
NEW.forEach(s=>{ if(!Object.values(out).some(e=> e.groups.some(g=> g.picks.some(p=> p.id === s.id)))) problems.push('new card on no map: ' + s.id); });
console.log(report.join('\n'));
MAPS.forEach(([m, name])=>{ const e = out[m]; if(!e) return; const all = e.groups.flatMap(g=> g.picks);
  console.log(`${m.padEnd(4)} ${name.padEnd(24)} ${all.length} picks, ${e.groups.length} groups, ${all.filter(p=> p.delivery === 'ranged').length} ranged, ${all.filter(p=> p.source === 'new').length} new  | ` + e.groups.map(g=> `${g.theme} ${g.picks.length}`).join(' / ')); });
if(problems.length){ console.log('PROBLEMS:\n  ' + problems.join('\n  ')); process.exitCode = 1; }

const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
if(process.argv.includes('apply') && !problems.length){
  let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1, added = 0;
  priced.forEach(({s, base, best, mapN})=>{
    if(by[s.id]) return;
    base.attack = best.A; base.health = best.H; base.numericId = nid++; base.uuid = uuid5('bramblewood-card:' + s.id);
    base.awaitingSource = true; base.unattainable = true;
    base.creatorNote = `2026-11-07 (package CONTENT17, owner 23:55: "More Claude recommendations per map ... I can't fit arrow-ers in Maps 0-20 much ... where are the yeti hunters?"): unlisted Claude pick; proposed home ${MAPS.find(x=> x[0] === s.map)[1]} (Map ${mapN} term), shown in that map's Map cards window under Claude New (canonical/claude-new-cards.json content17). Priced with the budget (tools/skill_costs.js budget, Level 1, rarity ${s.rarity}, map term Map ${mapN}): S ${(+best.b.S).toFixed(2)}, N ${(+best.b.N).toFixed(2)}, 2A + H + S ${(+best.b.x1).toFixed(2)}: ${best.A}/${best.H}. ${isRangedFx(s.effects) ? 'Ranged (canonical/skill-delivery.json). ' : ''}Skills from existing keywords only. Art: the emoji until drawn; prompt in docs/art-style-prompts.md (CONTENT17).`;
    cards.push(base); added++;
  });
  if(added) fs.writeFileSync(CARDS, pyDump(cards));
  const cn = JSON.parse(fs.readFileSync(CNEW, 'utf8'));
  cn.content17 = Object.assign({_about: 'CONTENT17 (2026-11-07, owner 23:55): up to 15 Claude picks per map and submap of Maps 0-20, grouped by theme (current = the map\'s theme now; the others are alternatives to swap in). delivery: melee / ranged / none (canonical/skill-delivery.json); source: existing card or new (awaitingSource, on no list). Built by tools/content17_2026_11_07.js.'}, out);
  fs.writeFileSync(CNEW, JSON.stringify(cn, null, 1) + '\n');
  // JSON.stringify moves the number-like skillrec labels ("0", "1", ...) ahead of "0-T": the UI22 builder rewrites the file in its own order and keeps content17
  require('child_process').execFileSync('python3', [path.join(ROOT, 'tools', 'ui22_claude_new_2026_11_04.py')], {stdio: 'inherit'});
  console.log(`applied: ${added} new cards appended, content17 written for ${Object.keys(out).length} maps`);
}
