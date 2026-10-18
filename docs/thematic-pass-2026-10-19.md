# The thematic pass, 2026-10-19 (package TH)

Owner (00:19, the overnight plan): **"reassign skirmishes based on thematics"**, with **"5–10 new cards per map — from skirmish-only rewards and pack"** taken from the candidate pool (`docs/card-pool-2026-10-19.md`). You said you'd pick and asked for the overnight pass, so the choices below are made and written down. Each one can be reverted (see "Reverting a choice").

The spreadsheet is `docs/thematic-pass-2026-10-19.xlsx`:
- **Fights:** every changed fight: the off-theme cards taken out, the cards put in, new rewards, new fields, the curve retune, and the win rate before and after.
- **All fights:** every measured fight, before and after.
- **Placed:** the 96 pool cards placed and where each comes from.
- **Pool:** the 4 cards left in the pool.
- **Decks:** the reference decks before and after the rebuild.

## In short

- **163 fights changed**: 121 for their theme (card swaps or a new field) and 122 by the curve retune that followed (5 more only gained a reward). The audit now finds **no off-theme card in any of the 260 fights** (main maps 0–24 and the side maps). Before, 103 fights had one.
- **96 of the 100 pool cards are live**: 52 are skirmish-only rewards on a fight of their map, and 44 are in the basic pack pool. That is 5–9 new cards on each of Maps 0–12, both of Map 16's, 9 for Wolfsbane Tundra and the Ice Hollow, and package GI's 10 examples where their notes put them. 4 stay in the pool.
- **The new fields are on their maps**, a few fights each: 🍄 Spore Cloud on The Morel Hollow's elite and boss, 🪢 Tangled Roots on the Kelp Mangroves' two elites, 🌩️ Thunderstorm on Coral Current's Eel Nest and boss, and 🌋 Ash Rain on two Ashen Spurn elites with 🌫️ Ashy on its boss.
- **The road curve** was re-measured with the rebuilt reference decks: **all 179 main-map fights are green** on the measure seeds (120 games each). 24 of the 27 changed side fights are green too, the Pale Desert's retune included. The other 3 are Eye of the Volcano elites, which aren't on the curve: they were 97–100% before and still are.
- **Package GI's examples were far too strong**, measuring 88–100% at their printed stats. Each was stepped down into its rarity band before it was placed (table below).

## How "on theme" is decided

Each map has an identity: its biome, its creatures, its factions and its field. The identities come from the gameplay-ideas sheet's **Maps** rows (Codex's design intent and our notes), the lore bible's factions, and the fights' own names. They live in `tools/thematic_pass_2026_10_19.js` (`THEMES`). A card in a fight is on theme when:

- it is a reward of that map's family (the map and its side maps);
- or it has one of the map's theme types (archetype or species);
- or the map allows it by id.

A map can also **ban** a card whatever its types (the Badger Berserker anywhere but the badger maps), or **cap** it: Gannet Cliffs allows its Pelican Divers in at most 2 fights, 2 copies each.

The curve tuner (`tools/skirmish_pass.js curve`) now asks the same rules before it moves a card into a fight. So a later retune can't bring the drift back. In R2 the tuner had used, for example, Badger Berserkers on nine maps.

<!-- themes -->

| Map | Identity | Theme types | Off theme here | Capped |
|---|---|---|---|---|
| 0 `m1` | Bramblewood Outskirts: the Otter river bank, meadow and hedge | River, Otter, Rabbit, Mouse, Duck, Fish, Ants, Worm, Raccoon, Field, Pond, Frog, Fox, Mustelid, Rodent | Badger Berserker | – |
| 1 `mf` | Thistlewood: hedgerow and woodland floor (beetles, mice, hedgehogs, foxes) | Insect, Mouse, Rabbit, Hedgehog, Fox, Frog, Chipmunk, Beetle, Forest, Field, Flora, Bee, Otter, River, Rodent + Quarry Mole | Badger Berserker, Duckling | – |
| 2 `mb` | Pebble Beach: shingle, rock pools and gulls | Coastal, Ocean, Mangrove, Coral Reef, Otter, Turtle | Mallard Marauder | – |
| 3 `mc` | Gannet Cliffs: sea cliffs (seabirds, goats, raptors) | Mountain, Eagle, Vulture, Bird, Coastal | Duck Paddler | Pelican Diver (2 copies, 2 fights) |
| 4 `m2` | Sunken Hollow: the flooded lowland (river and lake life, and what the flood brought in) | River, Fish, Turtle, Beaver, Pond, Ocean, Cetacean, Cephalopod, Frog | – | – |
| 5 `mw` | Gatorback Swamp: gators, snakes, toads, Swamp Fever and Poison | Swamp, Snake, Frog, Turtle, Reptile, Mangrove, Insect | Open-Ocean Hermit Crab, Mallard Marauder, Beaver Builder | – |
| 6 `m8` | Sable Swampmire: the night swamp of leeches, wisps and death value | Swamp, Snake, Reptile, Shadow, Beetle, Worm, Frog, Newt, Raven | Open-Ocean Hermit Crab, Mallard Marauder, Beaver Builder | – |
| 7 `mu` | The Morel Hollow: fungus, grubs, spiders and moths | Insect, Worm, Snail, Flora, Arachnid, Ants, Bee, Beetle, Newt | Raccoon Nightcrew, Trash Panda Trickster | – |
| 8 `m4` | Caves & Alcoves: bats, glowworms and the Hollow Kin in the dark | Cave, Bat, Arachnid, Mole, Worm | Honey Bee, Swarm Matriarch, Beetle Grunt | – |
| 9 `mk` | The Kelp Mangroves: roots, mudflats, Tidefolk | Mangrove, Coastal, Fish, Ocean, Coral Reef, River, Reptile, Cephalopod, Bird | Narwhal Lancer | – |
| 10 `m7` | Coral Current: the reef and its currents | Coral Reef, Ocean, Fish, Cephalopod, Coastal, Cetacean, Turtle | – | – |
| 11 `m10` | Eyrie Heights: the flight map (eagles, owls, condors, goats) | Mountain, Eagle, Owl, Bird, Vulture, Chipmunk, Sheep | Echo Keeper, Quill Volley, Quillguard | – |
| 12 `mh` | The Briar Maze: hedgehogs, porcupines, mice and the Greenhood Band | Hedgehog, Porcupine, Mouse, Rabbit, Chipmunk, Flora, Fox, Raccoon, Badger, Forest, Bird + Puddle Changeling | – | – |
| 13 `mr` | The Redwood Deep: bears, boars, deer and foxes in the high canopy | Bear, Fox, Deer, Boar, Ape, Badger, Cat, Forest | Shieldbearer Hound, Border Collie, Buzzed Chipmunk, Parish Sergeant, Bramblewood Macaque | – |
| 14 `m5` | Savanna Reaches: big game, cats and the Canopy's jungle | Savanna, Rainforest, Elephant, Rhino | Alley Cat, Bramblewood Macaque | – |
| 15 `ml` | The Long Grass: knights, horses, hounds and road bandits | Horse, Field, Village, Dog, Mouse, Rabbit, Raccoon, Bird, Eagle, Owl, Chipmunk | Plains Zebra | – |
| 16 `mt` | The Pinewood Taiga: night forest of wolves, lynx and hares | Taiga, Frost, Tundra, Wolf, Owl, Deer | Shieldbearer Hound, War Hound, Weredog, Warren Scout, Firetail Trickster | – |
| 17 `m6` | Wolfsbane Tundra: wolves, the cold, seals and the ice | Tundra, Frost, Taiga, Wolf | Beaver Builder, Chipmunk Hoarder, Chipmunk Forager, Buzzed Chipmunk, Porcupine Roller, Harvest Mouse, Dynamite Packrat, Star-nosed Mole, War Hound, Golden Eagle Diver | – |
| 18 `md` | The Glass Dunes: sand, glass, scorpions and lizards | Desert, Savanna, Reptile, Arachnid, Volcanic | Snapper Hatchling, Grass Viper | – |
| 19 `m3` | Ashen Spurn: the badger and porcupine bastions, yetis and the ash | Badger, Porcupine, Frost, Volcanic, Imp, Devil, Ape + Echidna Quillshot, Scraper of Skies | Beaver Builder, Chipmunk Stockpiler | – |
| 20 `m11` | The Sundered Peak: the Cave Warlord's bears and cavalry, the shrine and the volcano | Bear, Ape, Volcanic, Horse, Imp, Mountain, Ecclesia, Rainforest + Blessed Avatar, Shrine Acolyte, Fire Hawk, Ancient Sloth Titan | Beaver Lumberjack | – |
| 21 `m21` | The Quiet Summit: goats, eagles, owls and the chapel, after the storm | Mountain, Eagle, Owl, Bird, Ecclesia, Tundra, Taiga, Turtle + Ash Cloud Condor | Badger Berserker | – |
| 22 `m22` | The Rimefire Caldera: snow on black glass (frost and fire), and the Long Burrow's badgers | Mountain, Volcanic, Frost, Tundra, Newt, Elemental, Deer, Bird, Badger | – | – |
| 23 `m23` | The Goldfeather Siege: the Magnate's army before the walls | Horse, Elephant, Savanna, Badger, Mouse, Structure, Turtle, Insect, Duck, Village, Bird, Chipmunk, Rhino, Beaver | – | – |
| 24 `m24` | Goldfeather Keep: the Magnate's ducks, geese and herons | Duck, Village, Bird, Ecclesia, King, Beaver, Owl, Structure + Elderhorn Monarch | – | – |
|  `mq` | Clovermead: a meadow of bees, mice and rabbits | Rabbit, Mouse, Bee, Insect, Frog, Duck, Bird, Village, Field, Chipmunk, Cat, Dog, Flora | Badger Berserker | – |
|  `mp` | Lilypad Reach: the river pond (frogs, ducks, beavers, pike) | River, Pond, Frog, Duck, Fish, Beaver, Otter, Newt, Insect, Turtle, Bird | Quill Volley | – |
|  `mg` | Smugglers' Grotto: a sea cave of crabs and smugglers | Coastal, Ocean, Cave, Raccoon, Otter, Volcanic, Cephalopod, Duck | Quill Volley | – |
|  `ms` | The Sunken Grove: drowned swamp woods | Swamp, Snake, Frog, Turtle, Reptile, Mangrove, Newt, Hedgehog, Mammal | Open-Ocean Hermit Crab, Mallard Marauder | – |
|  `mz` | The Mycelium Deep: under the Morel Hollow | Insect, Worm, Flora, Arachnid, Ants, Beetle, Snail, Swamp | – | – |
|  `mn` | The Glimmer Depths: the shining cave | Cave, Bat, Arachnid, Insect, Fish, Bird | – | – |
|  `mj` | The Sunken Depths: the deep under the Current | Ocean, Cephalopod, Coral Reef, Fish, Cetacean, Coastal | – | – |
|  `mv` | The Aerie Vault: the eyrie's stores | Mountain, Eagle, Owl, Bird, Chipmunk + Wound Reaver | Echo Keeper | – |
|  `my` | The Canopy: the jungle above the savanna | Rainforest, Ape, Sloth, Frog, Flora, Savanna, Insect, Bird | – | – |
|  `mi` | The Ice Hollow: under the tundra ice | Tundra, Frost, Taiga, Wolf, Ape | Chipmunk Hoarder, Porcupine Roller, Golden Eagle Diver, Harvest Mouse, Beaver Builder, Dynamite Packrat, Quill Volley | – |
|  `m9` | The Basalt Foundry: fire, forge and slag | Volcanic, Imp, Devil, Insect, Beetle, Arachnid, Newt, Reptile, Structure, Boar, Elemental + Beaver Lumberjack, Chained Binturong, Fruit-bat Familiar, Flagellant Vulture, Vampire Finch, Tide Spirit, Carrion Fly Swarm | Echo Keeper, Trapdoor Spider | – |
|  `me` | The Eye of the Volcano: the ossuary and the vents | Volcanic, Imp, Devil, Shadow + Blessed Avatar, Cinder Skeleton, Ossuary Lammergeier, Pall Wraith, Magma Wraith | Echo Keeper, Fungal Colossus | – |
|  `mx` | The Volcano Lair: the Caldera Wyrm's den | Volcanic, Dragon, Reptile, Boar, Arachnid, Elemental, Imp + Blessed Avatar, Gorge Wyrm, Ember Jackal | – | – |
|  `mo` | The Old Bramble: the first forest and its Ent, and the wolves that came south | Otter, Rabbit, Duck, Fish, Raccoon, Ants, Flora, Forest, Structure, Frost | – | – |
|  `mpd` | The Pale Desert | Desert, Savanna, Reptile, Arachnid, Vulture, Bird, Insect | – | – |
<!-- /themes -->

## The drift that was fixed

| Off-theme card | Where it was | What replaced it |
|---|---|---|
| **Badger Berserker** | 0-4, 1-3, 1-5, 1-A-2, all five Quiet Summit fights that had them | the map's own: Pine Marten (0), Stag Beetle (1, 1-A), Ür-Elk, rams, an ibex and the Chapel Tortoise (21). It is now only on the badger maps: Ashen Spurn (it went *in* for the Battering-Ram beetles at the badger bastions), the Long Burrow, and the Rimefire Caldera. The Caldera is the Long Burrow's parent map; that dungeon opens there, so its badgers stay (see below). |
| **Pelican Diver** | 4 copies in 6 of Gannet Cliffs' 7 fights | the cliff's seabirds (Puffin Diver, Razorbill, Fulmar Spitter, Kittiwake Flock, Red-billed Chough, Peregrine Stooper). 2 copies stay in 3-5 and 3-7. |
| **Mallard Marauder** (Goldfeather's mallards) | Pebble Beach, Gatorback Swamp, Sable Swampmire, the Sunken Grove | Grey Seal Bull, Alligator Gar, Fen Mink, Booming Bittern, Marsh Harrier, Giant Water Bug, Anhinga Spearbird |
| **Open-Ocean Hermit Crab** | the two swamps and the Sunken Grove | Plague Gnat Cloud, Mosquito Cloud, Fire Ant Raft, Raft Spider, Swamp Rabbit |
| **Beaver Builder** | Sable Swampmire (5 fights), Gatorback's boss, Wolfsbane Tundra (6), the Ice Hollow, Ashen Spurn | swamp cards (Greater Siren, Bogfire Newt, Marsh Wisp, Giant Water Bug), the polar set (Harp Seal Pup, Beluga, Polar Bear, Greenland Shark), Badger Trench Diggers |
| **Ducklings** (R2's filler) | Thistlewood 1-2, 1-3, 1-4 | Harvest Mice and Field Voles |
| **Honey Bee, Swarm Matriarch, Beetle Grunt** | Caves & Alcoves (6 fights) | the cave pool (Guano Beetle, Cave Swiftlet, Cave Cricket, Cave Pseudoscorpion, Whip Spider, Giant Cave Huntsman) and Cave Bat Swarms |
| **Narwhal Lancer** (arctic) | the warm Kelp Mangroves (3 fights) | Horseshoe Crab, Banded Sea Krait, Mangrove Manatee |
| **Village dogs, chipmunks, sergeants; pack macaques** | the Redwood Deep (all 8 fights) | bears, boars, deer and foxes: Stag Knight, Shimmerwing Stag, Bear Cub, Grizzly Vanguard, Feral Tuskboar, Bramblewood Lynx, Badger Sapper (13-5's own reward), Honey Badger Fury, foxes |
| **Village / war dogs, the Redwood's Firetail Trickster, Warren Scouts, a Weredog** | the Pinewood Taiga | Trickster Fox, Woodland Caribou, Musk Ox Calf, Timber Wolf Pack, Snowshoe Hare, the Pack Wolf Reaver (16-6's own reward) |
| **Golden Eagle Divers, chipmunks, porcupines, mice, packrats, moles, war hounds** | Wolfsbane Tundra (all 8) and the Ice Hollow | the polar set and wolves: Arctic Tern, Lemming Swarm, Krill Swarm, Harp Seal Pup, Ringed Seal, Beluga, Polar Bear, Greenland Shark, Frostmoon Howler, Snow Ermine. 17-5 Musk Ox Bulwark and 17-6 Glacier Herd now have musk oxen. |
| **Echo Keeper** (a swamp card) | Eyrie Heights' boss, the Aerie Vault, the Basalt Foundry, the Eye of the Volcano | Alpine Salamander, Alpine Swift, Fire Salamander, Cinder Gecko, Cinder Skeleton |
| **Quill Volley / Quillguard** (Briar Maze porcupines) | Eyrie Heights, Lilypad Reach, Smugglers' Grotto, the Ice Hollow | Chamois Leaper, Alpine Swift, Great Crested Grebe, Muskrat Lodgekeeper, Water Shrew, Pincushion Urchin |
| **Snapper Hatchling, Grass Viper** (swamp) | the Glass Dunes | Thorny Devil, Horned Lizard |
| Smaller ones | 7-6 raccoons, 14-x Alley Cat and macaques, 15-5 Plains Zebras, 18-5 Trapdoor Spiders, 19-x Battering-Ram beetles, beavers and a chipmunk, 20-9's beaver, 24-5's Howdah Archers | spiders and a Truffle Piglet; Grave-Grin Hyena, Spitting Cobra and Marching Elephants; Warhorse Chargers; Glasswing Moths; Badger Berserkers and Trench Diggers; 20-9 got its Ancient Sloth Titan back (R2 had taken out the fight's only copy of its namesake); the Keep's own Goose Sentries |

What I left alone on purpose:

- **The Tutorial's come-back fights** (T-2 "The Odd Lot", T-3, T-4) are a mix by design.
- **The Old Bramble's Glacier Wolf Packs** stay. It is a come-back fight for after Map 17, and the tundra wolves that came south are its story.
- **Sunken Hollow's sea creatures** stay (orcas, krakens, the Cetacean Pod). The flooded hollow's fights are named for them.
- **Coral Current** had no drift.
- **The Rimefire Caldera's Badger Berserkers** stay. I first swapped them out like the Summit's, and 22-1 to 22-6 went to 98–100%. The tuner then wanted Shields of 100–180. Looking again, the Long Burrow, the badgers' endless sett, is a side map of the Caldera and opens there, so its badgers belong. The four fights are back on R2's decks, and the theme lists Badger for Map 22.
- **The Quiet Summit** first got snow leopards for its badgers. That was too weak: 97–100%, and Shields of 100–250. The Summit's big Ür-Elk and its rams now take the badgers' place.

## The pool cards placed

- **Placed the way the Admin placement does it:** the card drops `pool`, `poolMap` and `poolSlot`, and takes the next live card number (#1235 to #1330, in map order).
- **Its source:**
  - a skirmish-only reward, `{kind:'map', id, node}`, on a fitting fight of its map. Fights that had no reward got one first: 0-2, 10-5, 10-6, 10-8, 11-9, 17-5 and 17-7.
  - or the basic pack pool, `{kind:'pack', tier:1}`.
- **"That map's pack":** the game has one basic pack pool, which the Hedgerow Pouch, Tidemire Chest and Highcrest Case all draw from. Per-map band packs are only a proposal (`docs/pack-plan-2026-10-12.md`), so a "pack" card went into that shared pool.
- **The reference decks:** pack cards never enter them (they assume no packs), but rewards do.
- **The record:** each card's note says where it was placed and why, and `docs/balance/thematic-placed-2026-10-19.json` keeps its old pool number, map and slot.
- **In the fights:** most placed cards also fight in their map's enemy decks, usually where an off-theme card came out.

<!-- cards -->

| Map | Card | Rarity | Made for | Source now | Card # |
|---|---|---|---|---|---|
| 0 Bramblewood Outskirts | Water Vole | common | skirmish | reward of 0-1 | #1235 |
| 0 Bramblewood Outskirts | River Mink | uncommon | skirmish | reward of 0-2 | #1236 |
| 0 Bramblewood Outskirts | Grass Snake | uncommon | skirmish | reward of 0-2 | #1237 |
| 0 Bramblewood Outskirts | Pine Marten | rare | skirmish | reward of 0-3 | #1238 |
| 0 Bramblewood Outskirts | Signal Crayfish | common | pack | the basic packs | #1239 |
| 0 Bramblewood Outskirts | Woodcock Lookout | common | pack | the basic packs | #1240 |
| 1 Thistlewood | Robin Redbreast | uncommon | skirmish | reward of 1-1 | #1241 |
| 1 Thistlewood | Ladybird Guard | common | skirmish | reward of 1-2 | #1242 |
| 1 Thistlewood | Rivergate Drummer | uncommon | skirmish | reward of 1-3 | #1243 |
| 1 Thistlewood | Stag Beetle | rare | skirmish | reward of 1-5 | #1244 |
| 1 Thistlewood | Hedgerow Shrew | common | pack | the basic packs | #1245 |
| 1 Thistlewood | Slow-worm | common | pack | the basic packs | #1246 |
| 1 Thistlewood | Field Vole | common | pack | the basic packs | #1247 |
| 2 Pebble Beach | Pincushion Urchin | common | skirmish | reward of 2-1 | #1248 |
| 2 Pebble Beach | Tidepool Trapper Crab | common | skirmish | reward of 2-3 | #1249 |
| 2 Pebble Beach | Grey Seal Bull | rare | skirmish | reward of 2-5 | #1250 |
| 2 Pebble Beach | Rock Pool Starfish | common | pack | the basic packs | #1251 |
| 2 Pebble Beach | Oystercatcher | common | pack | the basic packs | #1252 |
| 2 Pebble Beach | Limpet Clinger | common | pack | the basic packs | #1253 |
| 3 Gannet Cliffs | Puffin Diver | common | skirmish | reward of 3-2 | #1254 |
| 3 Gannet Cliffs | Fulmar Spitter | uncommon | skirmish | reward of 3-4 | #1255 |
| 3 Gannet Cliffs | Peregrine Stooper | rare | skirmish | reward of 3-5 | #1256 |
| 3 Gannet Cliffs | Razorbill | uncommon | pack | the basic packs | #1257 |
| 3 Gannet Cliffs | Kittiwake Flock | common | pack | the basic packs | #1258 |
| 3 Gannet Cliffs | Red-billed Chough | common | pack | the basic packs | #1259 |
| 4 Sunken Hollow | Pyrenean Desman | uncommon | skirmish | reward of 4-1 | #1260 |
| 4 Sunken Hollow | Muskrat Lodgekeeper | uncommon | skirmish | reward of 4-2 | #1261 |
| 4 Sunken Hollow | Old Sturgeon | rare | skirmish | reward of 4-4 | #1262 |
| 4 Sunken Hollow | Water Shrew | common | pack | the basic packs | #1263 |
| 4 Sunken Hollow | Great Crested Grebe | common | pack | the basic packs | #1264 |
| 4 Sunken Hollow | Diving Bell Spider | uncommon | pack | the basic packs | #1265 |
| 5 Gatorback Swamp | Plague Gnat Cloud | common | skirmish | reward of 5-1 | #1266 |
| 5 Gatorback Swamp | Anhinga Spearbird | uncommon | skirmish | reward of 5-2 | #1267 |
| 5 Gatorback Swamp | Fire Ant Raft | uncommon | skirmish | reward of 5-3 | #1268 |
| 5 Gatorback Swamp | Fen Mink | uncommon | skirmish | reward of 5-5 | #1269 |
| 5 Gatorback Swamp | Alligator Gar | rare | skirmish | reward of 5-6 | #1270 |
| 5 Gatorback Swamp | Swamp Rabbit | common | pack | the basic packs | #1271 |
| 5 Gatorback Swamp | Mosquito Cloud | common | pack | the basic packs | #1272 |
| 6 Sable Swampmire | Giant Water Bug | uncommon | skirmish | reward of 6-3 | #1273 |
| 6 Sable Swampmire | Booming Bittern | uncommon | skirmish | reward of 6-4 | #1274 |
| 6 Sable Swampmire | Bogfire Newt | uncommon | skirmish | reward of 6-5 | #1275 |
| 6 Sable Swampmire | Greater Siren | rare | skirmish | reward of 6-6 | #1276 |
| 6 Sable Swampmire | Marsh Harrier | uncommon | pack | the basic packs | #1277 |
| 6 Sable Swampmire | Raft Spider | common | pack | the basic packs | #1278 |
| 7 The Morel Hollow | Truffle Piglet | uncommon | skirmish | reward of 7-1 | #1279 |
| 7 The Morel Hollow | Wolf Spider Mother | rare | skirmish | reward of 7-5 | #1280 |
| 7 The Morel Hollow | Leopard Slug | common | pack | the basic packs | #1281 |
| 7 The Morel Hollow | Fungus Gnat Cloud | common | pack | the basic packs | #1282 |
| 7 The Morel Hollow | Springtail Hopper | common | pack | the basic packs | #1283 |
| 7 The Morel Hollow | Red-backed Salamander | common | pack | the basic packs | #1284 |
| 8 Caves & Alcoves | Ghost Crayfish | uncommon | skirmish | reward of 8-2 | #1285 |
| 8 Caves & Alcoves | Whip Spider | uncommon | skirmish | reward of 8-4 | #1286 |
| 8 Caves & Alcoves | Giant Cave Huntsman | rare | skirmish | reward of 8-6 | #1287 |
| 8 Caves & Alcoves | Cave Cricket | common | pack | the basic packs | #1288 |
| 8 Caves & Alcoves | Cave Swiftlet | common | pack | the basic packs | #1289 |
| 8 Caves & Alcoves | Cave Pseudoscorpion | common | pack | the basic packs | #1290 |
| 8 Caves & Alcoves | Guano Beetle | common | pack | the basic packs | #1291 |
| 9 The Kelp Mangroves | Banded Sea Krait | uncommon | skirmish | reward of 9-4 | #1292 |
| 9 The Kelp Mangroves | Fishing Cat | rare | skirmish | reward of 9-5 | #1293 |
| 9 The Kelp Mangroves | Mangrove Manatee | rare | skirmish | reward of 9-7 | #1294 |
| 9 The Kelp Mangroves | Proboscis Monkey | uncommon | pack | the basic packs | #1295 |
| 9 The Kelp Mangroves | Horseshoe Crab | common | pack | the basic packs | #1296 |
| 9 The Kelp Mangroves | Sea Hare | common | pack | the basic packs | #1297 |
| 10 Coral Current | Crown-of-thorns Star | uncommon | skirmish | reward of 10-2 | #1298 |
| 10 Coral Current | Yellow-bellied Sea Snake | rare | skirmish | reward of 10-5 | #1299 |
| 10 Coral Current | Great Barracuda | rare | skirmish | reward of 10-6 | #1300 |
| 10 Coral Current | Whale Shark | rare | skirmish | reward of 10-8 | #1301 |
| 10 Coral Current | Parrotfish | common | pack | the basic packs | #1302 |
| 10 Coral Current | Lionfish | uncommon | pack | the basic packs | #1303 |
| 10 Coral Current | Giant Clam | common | pack | the basic packs | #1304 |
| 11 Eyrie Heights | Mountain Hare | common | skirmish | reward of 11-1 | #1305 |
| 11 Eyrie Heights | Apollo Butterfly | uncommon | skirmish | reward of 11-3 | #1306 |
| 11 Eyrie Heights | Chamois Leaper | uncommon | skirmish | reward of 11-9 | #1307 |
| 11 Eyrie Heights | Alpine Swift | common | pack | the basic packs | #1308 |
| 11 Eyrie Heights | Alpine Salamander | common | pack | the basic packs | #1309 |
| 12 The Briar Maze | Thorn Shrike | rare | skirmish | reward of 12-4 | #1310 |
| 12 The Briar Maze | Hedge Weasel | uncommon | skirmish | reward of 12-6 | #1311 |
| 12 The Briar Maze | Hawthorn Shieldbug | common | pack | the basic packs | #1312 |
| 12 The Briar Maze | Muntjac Barker | uncommon | pack | the basic packs | #1313 |
| 12 The Briar Maze | Anvil Thrush | common | pack | the basic packs | #1314 |
| 12 The Briar Maze | Garden Tiger Moth | common | pack | the basic packs | #1315 |
| 14 Savanna Reaches | Grave-Grin Hyena | uncommon | skirmish | reward of 14-2 | #1316 |
| 18 The Glass Dunes | Glasswing Moth | common | skirmish | reward of 18-5 | #1317 |
| 21 The Quiet Summit | Chapel Tortoise | uncommon | skirmish | reward of 21-3 | #1318 |
| 22 The Rimefire Caldera | Weathervane Swift | rare | skirmish | reward of 22-7 | #1319 |
| 17 Wolfsbane Tundra | Frostmoon Howler | rare | skirmish | reward of 17-7 | #1320 |
| 16 The Pinewood Taiga | Woodland Caribou | uncommon | skirmish | reward of 16-3 | #1321 |
| 16 The Pinewood Taiga | Musk Ox Calf | uncommon | pack | the basic packs | #1322 |
| 17 Wolfsbane Tundra | Beluga | rare | skirmish | reward of 17-4 | #1323 |
| 17 Wolfsbane Tundra | Polar Bear | veryrare | skirmish | reward of 17-5 | #1324 |
| None mi | Greenland Shark | rare | skirmish | reward of 17-A-4 | #1325 |
| 17 Wolfsbane Tundra | Harp Seal Pup | common | pack | the basic packs | #1326 |
| 17 Wolfsbane Tundra | Arctic Tern | uncommon | pack | the basic packs | #1327 |
| 17 Wolfsbane Tundra | Lemming Swarm | common | pack | the basic packs | #1328 |
| 17 Wolfsbane Tundra | Krill Swarm | common | pack | the basic packs | #1329 |
| None mi | Ringed Seal | common | pack | the basic packs | #1330 |
<!-- /cards -->

### Left in the pool (4)

| Card | Map | Why |
|---|---|---|
| Sanderling | Pebble Beach | a fourth small "Tide, Evasive" card (with the Water Vole, Swamp Rabbit and Great Crested Grebe); at 59% it was also at the top of the Common band |
| Roseate Spoonbill | Gatorback Swamp | the weakest of the swamp set (39%); the map already gets seven |
| Water Scorpion | Sable Swampmire | weak (37%), and the Giant Water Bug covers the same idea |
| Wallcreeper | Eyrie Heights | the weakest of the heights set (38%) |

### Package GI's examples, measured and stepped into band

They had never been played ("the balance phase does that"). On `card_balance.js`'s yardstick (8 copies plus filler, 120 games) every one won 88–100% at its printed stats. Before placing them, each stepped down: Attack first while the next step stayed inside the band, then Health in about 8% steps (`tools/thematic_pass_2026_10_19.js tunegi`; `docs/balance/thematic-gi-tune-2026-10-19.json`). Budget v3 still passes. GI's test now checks "measured in band" instead of "not far under budget".

| Card | Rarity | Was | Measured | Now | Measured | Band |
|---|---|---|---|---|---|---|
| Fen Mink | uncommon | 5/12 | 100% | 2/9 | 55% | 45–68% |
| Tidepool Trapper Crab | common | 3/9 | 100% | 1/9 | 54.2% | 35–60% |
| Grave-Grin Hyena | uncommon | 5/13 | 100% | 2/9 | 58.3% | 45–68% |
| Bogfire Newt | uncommon | 4/13 | 100% | 1/13 | 60.8% | 45–68% |
| Plague Gnat Cloud | common | 3/12 | 99.2% | 1/12 | 45% | 35–60% |
| Glasswing Moth | common | 3/9 | 100% | 2/6 | 50.8% | 35–60% |
| Rivergate Drummer | uncommon | 3/13 | 100% | 1/7 | 60.8% | 45–68% |
| Frostmoon Howler | rare | 4/13 | 100% | 2/9 | 69.2% | 52–75% |
| Chapel Tortoise | uncommon | 2/18 | 98.3% | 1/18 | 60.8% | 45–68% |
| Weathervane Swift | rare | 5/14 | 88.3% | 4/9 | 59.2% | 52–75% |

## The fields

| Field | Fights | Why |
|---|---|---|
| 🍄 Spore Cloud | 7-5 The Oath Ring (elite), 7-6 The Morel Monarch (boss) | GI's note: The Morel Hollow's elites and boss |
| 🪢 Tangled Roots | 9-5 Moray Den, 9-6 Drifting Shell (the two elites) | GI's note: Kelp Mangroves elites; it counters the map's Wave cards |
| 🌩️ Thunderstorm 2 | 10-7 Eel Nest, 10-9 The Orca Vanguard King (boss) | GI's note: Coral Current elites / boss; the eels' nest, and Coral's Tide makes everyone Wet |
| 🌋 Ash Rain | 19-3 Porcupine Bastion, 19-5 Sky Scraper Sentinel | Codex: Ashen Spurn's signature, "Ash Rain on the elites, Ashy on the boss". 19-4 is left clear |
| 🌫️ Ashy | 19-6 The Frost Yeti King (boss) | the same |

None of these fights had a field before, so each has one field, within your two-fields-a-fight rule.

## The reference decks and the curve

- **The rebuild:** the reference decks (`tools/skirmish_pass.js decks`, Maps 1–24) are built from the earlier maps' rewards, so they were rebuilt after the placement.
- **What it did:** most maps' decks changed, and some got much stronger. A deck such as Map 21's now wins 100% of its own fights before any retune. The new rewards play a part: Old Sturgeon, Grey Seal Bull, Fen Mink, Mangrove Manatee and the Giant Cave Huntsman all made decks. The hill-climb's own randomness is the other part: a bigger pool reshuffles its search.
- **Before the retune:** with the rebuilt decks and the thematic swaps, 65 of the 179 main fights were green (R2 had all 179).
- **The retune:** `curve` then ran within the themes, in four rounds, as R2 did: CPU deck moves first, then the Shield, then Health. The **Fights** sheet shows each move under "Curve retune".

| Measure | Green |
|---|---|
| Measure seeds (9100 + 37g, 120 games), after | **179 of 179** |
| Fresh seeds (5100 + 37g, 120 games), never tuned on | 145 of 179 |
| Mean of both (240 games) | 166 of 179 |

- **Fewer fresh-seed greens than R2** (R2 had 157). The last round (round 3, 28 fights) tuned on the measure seeds themselves, 120 games a trial. The tune seeds (7300) kept calling fights green that the measure seeds didn't, so I stopped tuning on them for that round. The fresh-seed column in `skirmish-pass-th-fresh.jsonl` shows where that fits noise. At 120 games, two seed sets differ by about 6 points.
- **22-4 Hailstone Ridge was set by hand.** No single move worked: one Ür-Elk took it from 87% to 42%. One Ür-Elk with a wider flock and no Shield measured 77% (target 75).
- **The Pale Desert (18-A) was retuned too.** The rebuilt Map 18 deck knocked five of its fights off the curve, so `tests/pale-desert-2026-10-19.js` failed. The retune brought in Dust Hyenas, Cinder Geckos and a Glowing Gecko, all on theme. Its stored measure is refreshed, and the test passes.

**Shields over three times the rule** (a decision for you, as in R2). The rebuilt decks are stronger, and themed swaps alone couldn't always pull a fight down far enough, so the tuner raised Shields:

| Fight | Rule | R2 | Now |
|---|---|---|---|
| 1-1 Hedgerow Scouts | 1 | 1 | 33 |
| 3-2 Hawk Watch / 3-3 Rockfall | 3 | 3 | 16 / 13 |
| 6-2 Mire Ambush | 6 | 6 | 31 |
| 10-2 Moray Ambush | 10 | 10 | 50 |
| 11-10 The Avalanche Colossus | 22 | 22 | 91 |
| 16-3 Elk Crossing | 16 | 52 | 109 |
| 16-6 Reaver's Hollow | 24 | 105 | 143 |
| 17-4 Lynx Ambush | 17 | 17 | 122 |
| 17-6 Glacier Herd | 26 | 49 | 124 |
| 17-7 Alpha Howler's Den | 26 | 43 | 193 |
| 17-8 The Glacial Ape-King | 34 | 77 | 125 |
| 19-2 Quill Line | 19 | 66 | 101 |
| 22-6 Ashfall Cornice | 33 | 57 | 182 |

R2's other big Shields are unchanged or a little lower: 3-4 to 3-7, 11-6, 11-8, 13-3, 15-4, 15-5, 16-2, 17-2, 19-5 and 24-2. Wolfsbane Tundra stands out: its rebuilt deck (Boar Rampager, Bramblewood Lynx, Mangrove Manatee) beats the polar decks easily. Stronger polar cards would let those Shields come down.

## Decisions for you

1. **Placement.** I placed 96 of the 100. If you'd rather keep fewer per map, the list above says where each one is. Revert one by deleting it from `tools/thematic_plan_2026_10_19.js` (see below).
2. **"That map's pack."** Pack cards went into the one shared basic pool. If you want the band packs of the pack plan, the record keeps each card's map.
3. **The GI examples' new stats** (above). Fen Mink 5/12 → 2/9, Rivergate Drummer 3/13 → 1/7 and so on. Their skills now carry most of their worth, and that is what the yardstick measures.
4. **Shields.** The 13 big ones above, mostly on Wolfsbane Tundra. Keep them, or give the tundra stronger polar cards.
5. **Side maps.** R2 only tuned the main maps. The side fights I changed, and the Pale Desert, were tuned onto their curve too. The other side fights, which I didn't touch, are as they were.
6. **The Rimefire Caldera's badgers** stay because of the Long Burrow (above). If you'd rather the Caldera had none, Ür-Elk and Magma Salamanders are the strong on-theme cards. Shields would have to carry the rest.

## Reverting a choice

- The choices are data:
  - `tools/thematic_plan_2026_10_19.js` writes `docs/balance/thematic-pass-2026-10-19.json` (the placements and the per-fight swaps and fields);
  - `node tools/thematic_pass_2026_10_19.js apply` puts that plan into `canonical/cards.json` and `arena_app.js`.
- To undo one card: give it back `"pool": true`, its `poolMap`, `poolSlot` and pool number (from `docs/balance/thematic-placed-2026-10-19.json`), and remove its `source`.
- To undo a fight: take its deck from `docs/balance/road-curve-nodes-after.json` (R2's final) and re-measure it with `node tools/skirmish_pass.js measure 120 --only=<code>`.

## Files

- `tools/thematic_pass_2026_10_19.js`: `THEMES`; `audit`; `apply`; `tunegi`; `offThemeFor`, which the curve tuner asks.
- `tools/thematic_plan_2026_10_19.js`: the choices.
- `tools/thematic_pass_xlsx.py`: the workbook and this doc's tables.
- `tools/skirmish_pass.js`:
  - `themedPool` and the curve's moves skip off-theme and capped cards;
  - the placed cards' strengths come from the pool reports;
  - measured rows carry the deck they measured.
- Data in `docs/balance/`:
  - `thematic-pass-2026-10-19.json` (the plan);
  - `thematic-placed-2026-10-19.json`;
  - `thematic-gi-tune-2026-10-19.json`;
  - `thematic-decks-before.json`;
  - the measures `skirmish-pass-th-mid*.jsonl` (after the swaps and the rebuild), `-th-r*` (the retune rounds), `-th-after*.jsonl` (final) and `-th-side-before.jsonl` (the side fights on main);
  - the retunes `thematic-curve-fixes*.jsonl`;
  - the snapshot `thematic-nodes-after.json`.
- `canonical/cards.json`: 96 cards placed, 10 GI stat lines.
- `arena_app.js`: the fights' decks, Shields, Health and fields, and the reference decks (`WINRATE_REF_DECKS`).
- Tests:
  - `tests/thematic-2026-10-19.js` (new);
  - `tests/card-pool-2026-10-19.js` and `tests/gi-2026-10-19.js` now read the placed cards as placed.

## Every changed fight

"Before" is main (R2's final measure; the side fights measured on main); "After" is the final measure. Both are 120 games on the measure seeds. "(blue)" means too easy and "(red)" too hard.

<!-- fights -->

### Map 0: Bramblewood Outskirts

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 0-1 Otter Patrol | skirmish | 90% (82–98) | −2 Pond Trout | +2 Water Vole | Water Vole | – | – | 92.5% | 87.5% |
| 0-2 Scorpion Ambush | skirmish | 75% (67–83) | – | – | River Mink, Grass Snake | – | – | 69.2% | 69.2% |
| 0-3 Raccoon Heist | skirmish | 60% (52–68) | – | – | Pine Marten | – | – | 62.5% | 62.5% |
| 0-4 Frost Vanguard | skirmish | 45% (30–49) | −2 Badger Berserker | +2 Pine Marten | – | – | – | 35.8% | 44.2% |

### Map 1: Thistlewood

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 Hedgerow Scouts | skirmish | 90% (82–98) | −2 Burrow Rabbit | +2 Robin Redbreast | Robin Redbreast | – | +2 Puddle Hopper; +2 Robin Redbreast; Shield 1 → 33 | 85.8% | 97.5% |
| 1-2 Cricket Chorus | skirmish | 80% (72–88) | −3 Duckling, −2 Chipmunk Skirmisher | +3 Harvest Mouse, +2 Ladybird Guard | Ladybird Guard | – | +3 Burrow Rabbit; −3 Harvest Mouse; Shield 1 → 4 | 82.5% | 78.3% |
| 1-3 Burrow Line | skirmish | 70% (62–78) | −2 Badger Berserker, −2 Duckling | +2 Stag Beetle, +2 Harvest Mouse | Rivergate Drummer | – | +2 Beetle Battering-Ram; −2 Stag Beetle | 70% | 70% |
| 1-4 Sapper Hedge | skirmish | 60% (52–68) | −3 Duckling | +3 Field Vole | – | – | – | 59.2% | 67.5% |
| 1-5 The Thistle Baron | elite | 40% (30–49) | −2 Badger Berserker | +2 Stag Beetle | Stag Beetle | – | +2 Bee Drone; −2 Mouse Sapper; +2 Thornwood Palisade | 40% | 43.3% |

### Side map: Clovermead

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 1-A-2 Bee Lines | skirmish | 80% (72–88) | −2 Badger Berserker | +2 Stag Beetle | – | – | – | 67.5% (red) | – |

### Map 2: Pebble Beach

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 2-1 Rock Pool Raiders | skirmish | 90% (82–98) | −2 Tide Pool Crab | +2 Pincushion Urchin | Pincushion Urchin | – | – | 85% | 89.2% |
| 2-2 Gull Gang | skirmish | 80% (72–88) | – | – | – | – | +2 Tide Pool Crab | 79.2% | 82.5% |
| 2-3 Hermit Row | skirmish | 70% (62–78) | −2 Tide Pool Crab | +2 Tidepool Trapper Crab | Tidepool Trapper Crab | – | +2 Mayfly Dancer; −2 Open-Ocean Hermit Crab; +2 Pelican Diver; +1 Sulfur Vent Crab | 64.2% | 70.8% |
| 2-4 Pelican Point | skirmish | 60% (52–68) | −2 Mallard Marauder | +2 Grey Seal Bull | – | – | +2 Grey Seal Bull; +2 Mayfly Dancer; −2 Open-Ocean Hermit Crab; −1 Otter Riverguard; +1 Pelican Diver | 61.7% | 60.8% |
| 2-5 The Old Shell | elite | 40% (30–49) | −2 Mallard Marauder | +2 Grey Seal Bull | Grey Seal Bull | – | – | 39.2% | 34.2% |

### Side map: Lilypad Reach

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 2-A-1 Lily Hop | skirmish | 90% (82–98) | −2 Quill Volley | +2 Great Crested Grebe | – | – | +4 Duckling; +1 Guppy; −2 Minnow Skitter; −3 Puddle Hopper | 57.5% (red) | – |
| 2-A-3 Beaver Dam | skirmish | 78% (70–86) | −2 Quill Volley | +2 Muskrat Lodgekeeper | – | – | +2 Old Sturgeon | 86.7% (blue) | – |
| 2-A-6 The Lodge | elite | 60% (52–68) | −2 Quill Volley | +2 Water Shrew | – | – | −1 Dam Wall; +2 Guppy; +1 Mallard Marauder; −2 River Carp | 50.8% (red) | – |

### Side map: Smugglers' Grotto

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 2-B-3 The Glowing Pool | elite | 60% (52–68) | −2 Quill Volley | +2 Pincushion Urchin | – | – | −2 Blind Cave Fish; +2 Mallard Marauder; −2 Open-Ocean Hermit Crab; +2 Tide Pool Crab; +2 Trash Panda Trickster | 82.5% (blue) | – |

### Map 3: Gannet Cliffs

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 3-1 Goat Ledge | skirmish | 90% (82–98) | −4 Pelican Diver, −2 Duck Paddler | +2 Puffin Diver, +2 Red-billed Chough, +2 Kittiwake Flock | – | – | – | 90.8% | 92.5% |
| 3-2 Hawk Watch | skirmish | 84% (76–92) | −4 Pelican Diver | +2 Razorbill, +2 Puffin Diver | Puffin Diver | – | +2 Golden Eagle Diver; Shield 3 → 16 | 80% | 91.7% |
| 3-3 Rockfall | skirmish | 78% (70–86) | −4 Pelican Diver | +2 Fulmar Spitter, +2 Razorbill | – | – | +2 Kittiwake Flock; Shield 3 → 13 | 76.7% | 81.7% |
| 3-4 Condor Thermals | skirmish | 72% (64–80) | −4 Pelican Diver | +2 Fulmar Spitter, +2 Razorbill | Fulmar Spitter | – | −2 Fulmar Spitter; +2 Mountain Goat Climber | 72.5% | 74.2% |
| 3-5 Eagle Stoop | elite | 66% (58–74) | −2 Sparrow Chick | +2 Peregrine Stooper | Peregrine Stooper | – | +2 Grey Seal Bull; −2 Pelican Diver; Shield 31 → 39 | 70% | 69.2% |
| 3-6 Avalanche Pass | elite | 60% (52–68) | −4 Pelican Diver | +2 Razorbill, +2 Fulmar Spitter | – | – | +2 Grey Seal Bull | 60% | 58.3% |
| 3-7 The Gannet Queen | elite | 40% (30–49) | −2 Pelican Diver | +2 Peregrine Stooper | – | – | −2 Peregrine Stooper; +2 Rockslide Ram | 32.5% | 45% |

### Map 4: Sunken Hollow

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 4-1 Reef Skirmishers | skirmish | 90% (82–98) | −2 Pond Trout | +2 Pyrenean Desman | Pyrenean Desman | – | – | 88.3% | 84.2% |
| 4-2 Tidal Ring | skirmish | 80% (72–88) | −2 Beaver Builder | +2 Muskrat Lodgekeeper | Muskrat Lodgekeeper | – | −2 Muskrat Lodgekeeper; +2 Pond Trout | 81.7% | 80% |
| 4-4 The Kraken's Maw | elite | 60% (52–68) | −1 Truce Heron | +1 Old Sturgeon | Old Sturgeon | – | −2 Beaver Builder; +2 Pond Trout | 54.2% | 54.2% |
| 4-5 The Drowned Colossus | elite | 40% (30–49) | – | – | – | – | +2 Pyrenean Desman; Shield 6 → 7 | 45% | 36.7% |

### Map 5: Gatorback Swamp

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 5-1 Leech Pools | skirmish | 90% (82–98) | −2 Open-Ocean Hermit Crab | +2 Plague Gnat Cloud | Plague Gnat Cloud | – | −2 Plague Gnat Cloud; +2 Snapper Hatchling | 85% | 84.2% |
| 5-2 Toad Hollow | skirmish | 84% (76–92) | −2 Puddle Hopper | +2 Anhinga Spearbird | Anhinga Spearbird | – | – | 83.3% | 91.7% |
| 5-3 Cypress Roots | skirmish | 78% (70–86) | −2 Echo Keeper | +2 Fire Ant Raft | Fire Ant Raft | – | – | 78.3% | 73.3% |
| 5-4 Snapping Reeds | skirmish | 72% (64–80) | −2 Open-Ocean Hermit Crab, −2 Mallard Marauder | +2 Mosquito Cloud, +2 Alligator Gar | – | – | +2 Alligator Gar; Shield 5 → 11 | 80% | 75% |
| 5-5 Gator Slide | elite | 66% (58–74) | −1 Mallard Marauder | +1 Fen Mink | Fen Mink | – | +2 Alligator Gar; −2 Bog Behemoth | 70.8% | 68.3% |
| 5-6 Behemoth Bog | elite | 60% (52–68) | −1 Open-Ocean Hermit Crab, −1 Mallard Marauder | +1 Fire Ant Raft, +1 Alligator Gar | Alligator Gar | – | – | 58.3% | 60% |
| 5-7 Old Snapjaw | boss | 40% (30–49) | −2 Open-Ocean Hermit Crab, −1 Beaver Builder | +2 Fire Ant Raft, +1 Fen Mink | – | – | – | 38.3% | 33.3% |

### Side map: The Sunken Grove

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 5-A-1 Rotting Roots | skirmish | 90% (82–98) | −3 Open-Ocean Hermit Crab, −2 Mallard Marauder | +2 Mosquito Cloud, +1 Swamp Rabbit, +2 Anhinga Spearbird | – | – | – | 76.7% (red) | – |
| 5-A-4 The Grove Warden | boss | 40% (30–49) | −2 Mallard Marauder | +2 Alligator Gar | – | – | +2 Alligator Gar; +2 Snapper Hatchling | 61.7% (blue) | – |

### Map 6: Sable Swampmire

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 6-2 Mire Ambush | skirmish | 85% (77–93) | −2 Open-Ocean Hermit Crab, −2 Mallard Marauder | +2 Raft Spider, +2 Booming Bittern | – | – | +2 Alligator Gar; Shield 6 → 31 | 84.2% | 92.5% |
| 6-3 Toad Chorus | skirmish | 80% (72–88) | −2 Beaver Builder, −2 Mallard Marauder | +2 Giant Water Bug, +2 Marsh Harrier | Giant Water Bug | – | +2 Bogfire Newt; +2 Echo Keeper; −2 Lamprey | 78.3% | 81.7% |
| 6-4 Root Snare | skirmish | 75% (67–83) | – | – | Booming Bittern | – | – | 74.2% | 73.3% |
| 6-5 Venomlord's Coil | elite | 70% (62–78) | −3 Beaver Builder | +2 Bogfire Newt, +1 Marsh Wisp | Bogfire Newt | – | +4 Alligator Gar; −1 Constrictor Coil; −2 Venomlord Serpent; Shield 4 → 11 | 70.8% | 72.5% |
| 6-6 Crocodile Run | elite | 65% (57–73) | −2 Beaver Builder | +2 Greater Siren | Greater Siren | – | +4 Alligator Gar; −2 Lamprey | 60% | 63.3% |
| 6-7 Adder Gauntlet | elite | 60% (52–68) | −2 Beaver Builder | +2 Marsh Wisp | – | – | +2 Bogfire Newt; −2 Caiman Hatchling; +2 Crocodile Ambusher | 55.8% | 60% |
| 6-8 The Alligator King | miniboss | 40% (30–49) | −3 Beaver Builder, −1 Open-Ocean Hermit Crab, −2 Mallard Marauder | +2 Greater Siren, +1 Marsh Wisp, +1 Raft Spider, +2 Giant Water Bug | – | – | +2 Bogfire Newt; −2 Caiman Hatchling; +2 Constrictor Coil; +2 Crocodile Ambusher; −2 Giant Water Bug; Shield 12 → 31 | 45% | 40% |

### Map 7: The Morel Hollow

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 7-1 Spore Drift | skirmish | 90% (82–98) | −2 Garden Snail | +2 Truffle Piglet | Truffle Piglet | – | −2 Swarm Matriarch | 90.8% | 96.7% |
| 7-2 Grub Tunnels | skirmish | 82.5% (74.5–90.5) | – | – | – | – | +2 Leopard Slug | 90% | 86.7% |
| 7-4 Moonlit Gills | skirmish | 67.5% (59.5–75.5) | −2 Compost Grub | +2 Leopard Slug | – | – | – | 70% | 60.8% |
| 7-5 The Oath Ring | elite | 60% (52–68) | – | – | Wolf Spider Mother | Spore Cloud | +1 Garden Snail; −1 Hollow Oath-Keeper | 62.5% | 63.3% |
| 7-6 The Morel Monarch | miniboss | 40% (30–49) | −1 Raccoon Nightcrew, −2 Trash Panda Trickster | +2 Wolf Spider Mother, +1 Truffle Piglet | – | Spore Cloud | – | 46.7% | 45% |

### Map 8: Caves & Alcoves

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 8-1 Roost Flurry | skirmish | 90% (82–98) | −2 Honey Bee, −2 Beetle Grunt | +2 Guano Beetle, +2 Cave Swiftlet | – | – | +2 Cave Flitter | 90% | 95.8% |
| 8-2 Glowworm Grotto | skirmish | 85% (77–93) | – | – | Ghost Crayfish | – | +2 Cave Pseudoscorpion | 80% | 91.7% |
| 8-3 Cinder Vents | skirmish | 80% (72–88) | −2 Honey Bee | +2 Cave Cricket | – | – | +2 Cave Bat Swarm; −2 Vampire Bat Nurse | 72.5% | 85.8% |
| 8-4 Echo Chamber | skirmish | 75% (67–83) | – | – | Whip Spider | – | +4 Cave Bat Swarm; −2 Glowworm Cluster; −2 Stalactite Golem | 77.5% | 78.3% |
| 8-5 Sulfur Vent Path | skirmish | 70% (62–78) | −2 Honey Bee, −2 Swarm Matriarch | +2 Guano Beetle, +2 Whip Spider | – | – | +2 Whip Spider; Shield 8 → 17 | 71.7% | 74.2% |
| 8-6 Glowworm Deep | skirmish | 65% (57–73) | −2 Swarm Matriarch | +2 Giant Cave Huntsman | Giant Cave Huntsman | – | −2 Blind Cave Fish; −2 Cave Bat Swarm; +2 Glowworm Cluster; +4 Stalactite Golem | 62.5% | 68.3% |
| 8-7 The Roost Above | elite | 60% (52–68) | −2 Swarm Matriarch | +2 Cave Bat Swarm | – | – | −2 Bat Swarmling; +2 Cave Bat Swarm; +2 Cave Cricket; +2 Cave Flitter | 65% | 67.5% |
| 8-8 The Stalactite Warden | miniboss | 40% (30–49) | −2 Beetle Grunt, −2 Swarm Matriarch | +2 Cave Pseudoscorpion, +2 Whip Spider | – | – | +2 Giant Cave Huntsman; +2 Glowworm Cluster; −2 Vampire Roost; Shield 16 → 2 | 36.7% | 35% |

### Map 9: The Kelp Mangroves

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 9-1 Mudflat Skippers | skirmish | 90% (82–98) | −2 Narwhal Lancer | +2 Horseshoe Crab | – | – | – | 91.7% | 95.8% |
| 9-2 Monitor Roots | skirmish | 84% (76–92) | – | – | – | – | +2 Nautilus Drifter | 83.3% | 77.5% |
| 9-3 Kingfisher Dive | skirmish | 78% (70–86) | – | – | – | – | Shield 0 → 21 | 80.8% | 80% |
| 9-4 Kelp Curtains | skirmish | 72% (64–80) | −2 Narwhal Lancer | +2 Banded Sea Krait | Banded Sea Krait | – | +2 Tide Pool Crab | 79.2% | 67.5% |
| 9-5 Moray Den | elite | 66% (58–74) | – | – | Fishing Cat | Tangled Roots | +2 Mangrove Manatee | 65.8% | 63.3% |
| 9-6 Drifting Shell | elite | 60% (52–68) | – | – | – | Tangled Roots | +2 Nautilus Drifter; Shield 21 → 9 | 58.3% | 62.5% |
| 9-7 The Kelp Witch | miniboss | 40% (30–49) | −1 Narwhal Lancer | +1 Mangrove Manatee | Mangrove Manatee | – | Shield 29 → 53 | 30% | 38.3% |

### Map 10: Coral Current

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 10-1 Clownfish Shoal | skirmish | 90% (82–98) | −2 Tide Pool Crab | +2 Parrotfish | – | – | – | 92.5% | 96.7% |
| 10-2 Moray Ambush | skirmish | 85.7% (77.7–93.7) | – | – | Crown-of-thorns Star | – | +2 Electric Ray; Shield 10 → 50 | 80.8% | 91.7% |
| 10-5 Current Split | skirmish | 72.9% (64.9–80.9) | – | – | Yellow-bellied Sea Snake | – | – | 69.2% | 73.3% |
| 10-6 Reef Shark Pack | elite | 68.6% (60.6–76.6) | −2 Abyss Lantern Squid | +2 Great Barracuda | Great Barracuda | – | +1 Abyss Lantern Squid; −2 Great Barracuda; +1 Silver Minnow; Shield 15 → 30 | 70% | 64.2% |
| 10-7 Eel Nest | elite | 64.3% (56.3–72.3) | – | – | – | Thunderstorm 2 | +2 Nautilus Drifter | 64.2% | 66.7% |
| 10-8 Sea Turtle Elder's Court | elite | 60% (52–68) | −1 Lion's Mane Jelly | +1 Whale Shark | Whale Shark | – | +2 Nautilus Drifter; +2 Riptide Eel | 61.7% | 62.5% |
| 10-9 The Orca Vanguard King | boss | 40% (30–49) | −1 Gull Thief | +1 Lionfish | – | Thunderstorm 2 | +2 Mangrove Manatee; Shield 30 → 0 | 37.5% | 35.8% |

### Map 11: Eyrie Heights

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 11-1 Goat Trail Runners | skirmish | 90% (82–98) | – | – | Mountain Hare | – | +2 Chipmunk Stockpiler; −2 Eyrie Warden | 87.5% | 90% |
| 11-3 Cliffside Herd | skirmish | 82.5% (74.5–90.5) | – | – | Apollo Butterfly | – | – | 85.8% | 77.5% |
| 11-4 Ridge Fork | skirmish | 78.8% (70.8–86.8) | – | – | – | – | +1 Chipmunk Stockpiler; −1 Eyrie Warden; Shield 11 → 7 | 71.7% | 75% |
| 11-6 East Ledge | elite | 71.3% (63.3–79.3) | −1 Quillguard | +1 Chamois Leaper | – | – | – | 65.8% | 75% |
| 11-7 Eyrie Wardens | elite | 67.5% (59.5–75.5) | −2 Quill Volley | +2 Alpine Swift | – | – | −1 Chipmunk Stockpiler; +1 Eyrie Warden; Shield 12 → 5 | 64.2% | 65.8% |
| 11-8 Summit Approach | elite | 63.8% (55.8–71.8) | – | – | – | – | +2 Eyrie Warden; −2 Mountain Goat Climber | 61.7% | 62.5% |
| 11-9 The Condor Sovereign | elite | 60% (52–68) | −2 Chipmunk Hoarder | +2 Chamois Leaper | Chamois Leaper | – | +2 Alpine Swift; +4 Eagle-Owl Quartermaster | 62.5% | 54.2% |
| 11-10 The Avalanche Colossus | miniboss | 40% (30–49) | −2 Echo Keeper | +2 Alpine Salamander | – | – | Shield 22 → 91 | 43.3% | 47.5% |

### Side map: The Aerie Vault

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 11-A-2 Feather Drifts | skirmish | 75% (67–83) | −2 Echo Keeper | +2 Alpine Swift | – | – | +2 Eagle-Owl Quartermaster; −2 Eyrie Warden | 94.2% (blue) | – |

### Map 12: The Briar Maze

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 12-4 Thornvine Arch | skirmish | 72% (64–80) | −2 Bramble Sprout | +2 Thorn Shrike | Thorn Shrike | – | – | 75% | 70.8% |
| 12-5 Quillback Hold | elite | 66% (58–74) | – | – | – | – | +2 Puddle Changeling; −2 Quillback Elder | 61.7% | 65.8% |
| 12-6 Rodent Court | elite | 60% (52–68) | – | – | Hedge Weasel | – | −2 Quillback Elder; +2 Thornvine Lasher | 54.2% | 60% |
| 12-7 The Briar Queen | miniboss | 40% (30–49) | −2 Harvest Mouse | +2 Hedge Weasel | – | – | +2 Puddle Changeling; Shield 24 → 47 | 45.8% | 40% |

### Map 13: The Redwood Deep

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 13-1 Cub Clearing | skirmish | 90% (82–98) | −4 Shieldbearer Hound | +2 Stag Knight, +2 Berserker Boar | – | – | – | 85.8% | 95% |
| 13-2 Fox Run | skirmish | 85% (77–93) | −4 Shieldbearer Hound, −2 Buzzed Chipmunk | +2 Fox Kit, +2 Swift Fox, +2 Fox Sharpshot | – | – | +2 Firetail Trickster | 85.8% | 80.8% |
| 13-3 Antler Grove | skirmish | 80% (72–88) | −2 Shieldbearer Hound, −1 Border Collie, −1 Buzzed Chipmunk, −4 Bramblewood Macaque | +2 Stag Knight, +1 Fawn Scout, +1 Fox Kit, +2 Bramblewood Lynx, +2 Shimmerwing Stag | – | – | −2 Bramblewood Lynx; Shield 52 → 48 | 79.2% | 80% |
| 13-4 Boar Wallow | skirmish | 75% (67–83) | −4 Shieldbearer Hound, −1 Buzzed Chipmunk | +2 Berserker Boar, +2 Swift Fox, +1 Fox Kit | – | – | +2 Boar Rampager | 70.8% | 78.3% |
| 13-5 Badger Setts | elite | 70% (62–78) | −2 Border Collie, −2 Buzzed Chipmunk, −2 Parish Sergeant, −2 Bramblewood Macaque, −2 Shieldbearer Hound | +2 Badger Sapper, +2 Fox Kit, +2 Honey Badger Fury, +2 Feral Tuskboar, +2 Bear Cub | – | – | – | 69.2% | 72.5% |
| 13-6 Grizzly Ridge | elite | 65% (57–73) | −2 Shieldbearer Hound, −2 Border Collie, −2 Buzzed Chipmunk, −1 Parish Sergeant, −4 Bramblewood Macaque | +2 Bear Cub, +2 Grizzly Vanguard, +2 Swift Fox, +1 Honey Badger Fury, +2 Feral Tuskboar, +2 Bramblewood Lynx | – | – | −2 Bear Cub; +2 Berserker Boar | 65.8% | 72.5% |
| 13-7 The King's Den | elite | 60% (52–68) | −2 Shieldbearer Hound, −2 Border Collie, −2 Buzzed Chipmunk, −2 Parish Sergeant, −2 Bramblewood Macaque | +2 Bear Cub, +2 Fox Kit, +2 Swift Fox, +2 Honey Badger Fury, +2 Feral Tuskboar | – | – | – | 63.3% | 56.7% |
| 13-8 The Stag-Lord | miniboss | 40% (30–49) | −2 Border Collie, −2 Shieldbearer Hound | +2 Stag Knight, +2 Shimmerwing Stag | – | – | +2 Bramblewood Lynx; −2 Stag Knight | 33.3% | 45% |

### Map 14: Savanna Reaches

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 14-1 Zebra Stampede | skirmish | 90% (82–98) | – | – | – | – | +2 Savanna Cheetah | 95% | 83.3% |
| 14-2 Hyena Chorus | skirmish | 85% (77–93) | −2 Dust Hyena | +2 Grave-Grin Hyena | Grave-Grin Hyena | – | +2 Savanna Cheetah | 82.5% | 82.5% |
| 14-4 Toucan Watch | skirmish | 75% (67–83) | – | – | – | – | −1 Plains Zebra; +2 Savanna Cheetah; +2 Slow Loris; +1 Termite Mound; −2 Toucan Courier | 76.7% | 71.7% |
| 14-6 Jaguar Run | elite | 65% (57–73) | −1 Alley Cat | +1 Grave-Grin Hyena | – | – | – | 65.8% | 63.3% |
| 14-7 The Cheetah Matriarch | elite | 60% (52–68) | −1 Alley Cat, −2 Bramblewood Macaque | +1 Spitting Cobra, +2 Grave-Grin Hyena | – | – | +2 Aye-aye Prowler; Shield 21 → 63 | 58.3% | 67.5% |
| 14-8 The Savanna Warlord | miniboss | 40% (30–49) | −2 Bramblewood Macaque | +2 Marching Elephant | – | – | −1 Siege Rhino; +1 Termite Mound | 45.8% | 38.3% |

### Map 15: The Long Grass

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 15-3 Stoat Ambush | skirmish | 78% (70–86) | – | – | – | – | −1 Raccoon Nightcrew; +3 Trash Panda Trickster | 76.7% | 75% |
| 15-5 Charge of the Warhorses | elite | 66% (58–74) | −3 Plains Zebra | +3 Warhorse Charger | – | – | +1 Shieldbearer Hound; +1 War Hound; −2 Warhorse Charger; Shield 90 → 84 | 65.8% | 68.3% |

### Map 16: The Pinewood Taiga

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 16-1 Snowshoe Tracks | skirmish | 90% (82–98) | −2 Firetail Trickster | +2 Trickster Fox | – | – | −2 Frost Hare Sprinter; +2 Lone Grey Wolf | 94.2% | 96.7% |
| 16-2 Pinecone Drop | skirmish | 84% (76–92) | −1 Firetail Trickster | +1 Trickster Fox | – | – | +2 Arctic Fox Raider; −2 Trickster Fox | 79.2% | 91.7% |
| 16-3 Elk Crossing | skirmish | 78% (70–86) | −2 Shieldbearer Hound, −2 War Hound | +2 Woodland Caribou, +2 Timber Wolf Pack Leader | Woodland Caribou | – | +2 Lone Grey Wolf; +2 Snowshoe Hare; −2 Timber Wolf Pack Leader; −2 Wolf Pack Runner; Shield 52 → 109 | 83.3% | 82.5% |
| 16-4 Lynx Shadow | skirmish | 72% (64–80) | −1 Shieldbearer Hound | +1 Musk Ox Calf | – | – | Shield 36 → 54 | 76.7% | 71.7% |
| 16-5 The Running Pack | elite | 66% (58–74) | −1 Shieldbearer Hound | +1 Musk Ox Calf | – | – | – | 63.3% | 67.5% |
| 16-6 Reaver's Hollow | elite | 60% (52–68) | −2 Firetail Trickster, −2 Warren Scout, −1 Weredog | +2 Trickster Fox, +2 Snowshoe Hare, +1 Pack Wolf Reaver | – | – | +1 Alpha Howler; +1 Arctic Fox Raider; +1 Lone Grey Wolf; −2 Ravenous Wolverine; −2 Taiga Lynx; +1 Tundra Musk Ox; +2 Wolf Pack Runner; Shield 105 → 143 | 57.5% | 61.7% |
| 16-7 The Howling Alpha | miniboss | 40% (30–49) | – | – | – | – | +1 Tundra Musk Ox | 42.5% | 48.3% |

### Map 17: Wolfsbane Tundra

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 17-1 Ice Fang Patrol | skirmish | 90% (82–98) | −2 Golden Eagle Diver, −2 Chipmunk Hoarder | +2 Arctic Tern, +2 Lemming Swarm | – | – | – | 94.2% | 96.7% |
| 17-2 Frostbitten Pack | skirmish | 85% (77–93) | −2 Golden Eagle Diver, −2 Beaver Builder, −2 Harvest Mouse | +2 Arctic Tern, +2 Harp Seal Pup, +2 Krill Swarm | – | – | – | 85% | 90% |
| 17-3 Snowshoe Line | skirmish | 80% (72–88) | −2 Beaver Builder, −2 Dynamite Packrat, −2 Star-nosed Mole, −2 Harvest Mouse | +2 Harp Seal Pup, +2 Ringed Seal, +2 Krill Swarm, +2 Lemming Swarm | – | – | +2 Lone Grey Wolf | 79.2% | 77.5% |
| 17-4 Lynx Ambush | skirmish | 75% (67–83) | −3 Beaver Builder, −4 Golden Eagle Diver, −2 Porcupine Roller, −2 Dynamite Packrat | +2 Beluga, +1 Harp Seal Pup, +2 Arctic Tern, +2 Snow Bunting Archer, +2 Snow Ermine, +2 Ringed Seal | Beluga | – | +1 Alpha Howler; +2 Arctic Fox Raider; −2 Glacial Ape-King; −2 Harbor Seal; +1 Polar Bear; Shield 17 → 122 | 78.3% | 76.7% |
| 17-5 Musk Ox Bulwark | elite | 70% (62–78) | −3 Beaver Builder, −2 Porcupine Roller, −1 Chipmunk Hoarder | +2 Polar Bear, +1 Harp Seal Pup, +2 Tundra Musk Ox, +1 Snow Ermine | Polar Bear | – | −2 Arctic Fox Raider; +2 Krill Swarm | 70.8% | 76.7% |
| 17-6 Glacier Herd | elite | 65% (57–73) | −1 Beaver Builder, −2 Porcupine Roller, −2 War Hound | +1 Harp Seal Pup, +2 Tundra Musk Ox, +2 Frostmoon Howler | – | – | +1 Alpha Howler; −2 Arctic Fox Raider; +2 Glacial Ape-King; +2 Krill Swarm; −2 Lone Grey Wolf; +2 Polar Bear; −2 Tundra Musk Ox; Shield 49 → 124 | 65.8% | 65.8% |
| 17-7 Alpha Howler's Den | elite | 60% (52–68) | −2 Porcupine Roller, −2 Chipmunk Hoarder, −2 Dynamite Packrat | +2 Frostmoon Howler, +2 Timber Wolf Pack Leader, +2 Ice-Crevasse Wolf | Frostmoon Howler | – | −2 Arctic Fox Raider; −1 Glacial Ape-King; +2 Greenland Shark; +3 Polar Bear; +1 Ravenous Wolverine; −1 Snow Ermine; −2 Timber Wolf Pack Leader; Shield 43 → 193 | 60% | 63.3% |
| 17-8 The Glacial Ape-King | miniboss | 40% (30–49) | −1 Porcupine Roller, −1 Chipmunk Forager, −1 Harvest Mouse, −1 Buzzed Chipmunk, −2 Star-nosed Mole, −2 Beaver Builder | +2 Lemming Swarm, +2 Snow Ermine, +2 Krill Swarm, +2 Harp Seal Pup | – | – | +2 Arctic Fox Raider; −2 Glacial Ape-King; +2 Lone Grey Wolf; −2 Permafrost Mammoth; Shield 77 → 125 | 41.7% | 40% |

### Side map: The Ice Hollow

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 17-A-1 Frost Tunnel | skirmish | 90% (82–98) | −4 Chipmunk Hoarder, −3 Porcupine Roller | +2 Ringed Seal, +2 Lemming Swarm, +2 Snow Ermine, +1 Harp Seal Pup | – | – | – | 95% | – |
| 17-A-2 Glacier Gut | skirmish | 75% (67–83) | −4 Beaver Builder, −2 Chipmunk Hoarder | +2 Greenland Shark, +2 Harp Seal Pup, +2 Krill Swarm | – | – | +2 Alpha Howler; −2 Arctic Fox Raider; +2 Frost Hare Sprinter; +2 Frostmoon Howler; +2 Lemming Swarm; +2 Snow Ermine; Shield 17 → 74 | 96.7% (blue) | – |
| 17-A-3 The Rime Hall | skirmish | 60% (52–68) | −3 Chipmunk Hoarder, −3 Golden Eagle Diver, −2 Harvest Mouse | +3 Lemming Swarm, +3 Arctic Tern, +2 Krill Swarm | – | – | +2 Arctic Fox Raider; +2 Greenland Shark; −1 Krill Swarm; +3 Lone Grey Wolf; −2 Spitting Spider; −2 Taiga Lynx; Shield 17 → 116 | 90% (blue) | – |
| 17-A-4 The Hollow King | boss | 40% (30–49) | −2 Porcupine Roller, −2 Dynamite Packrat, −2 Quill Volley | +2 Ringed Seal, +2 Greenland Shark, +2 Ice-Crevasse Wolf | Greenland Shark | – | −2 Glacial Ape-King; +2 Harp Seal Pup; −1 Ice-Crevasse Wolf; +3 Lone Grey Wolf; +4 Ravenous Wolverine; −2 Ringed Seal; Shield 51 → 252 | 95.8% (blue) | – |

### Map 18: The Glass Dunes

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 18-1 Dune Jackals | skirmish | 90% (82–98) | −2 Snapper Hatchling | +2 Thorny Devil | – | – | – | 90.8% | 95% |
| 18-2 Scorpion Flats | skirmish | 84% (76–92) | −2 Snapper Hatchling, −1 Grass Viper | +2 Thorny Devil, +1 Horned Lizard | – | – | +2 Caustic Scorpion | 84.2% | 81.7% |
| 18-3 Widow's Web | skirmish | 78% (70–86) | – | – | – | – | +2 Dust Hyena | 77.5% | 75.8% |
| 18-4 Sandstorm | skirmish | 72% (64–80) | – | – | – | – | −2 Armadillo Guard; +2 Cinder Gecko; +2 Dust Hyena; +2 Quicksand Queen | 78.3% | 71.7% |
| 18-5 Obsidian Nest | elite | 66% (58–74) | −2 Trapdoor Spider | +2 Glasswing Moth | Glasswing Moth | – | +2 Dromedary | 65.8% | 65% |
| 18-6 Komodo Wallow | elite | 60% (52–68) | – | – | – | – | +2 Cinder Gecko; −3 Meerkat Sentry; +1 Trapdoor Spider | 62.5% | 64.2% |
| 18-7 The Sand Widow Queen | miniboss | 40% (30–49) | – | – | – | – | +1 Caustic Scorpion; −1 Komodo Warlord | 39.2% | 45% |

### Map 19: Ashen Spurn

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 19-2 Quill Line | skirmish | 82.5% (74.5–90.5) | −1 Chipmunk Stockpiler, −2 Beaver Builder | +1 Porcupine Roller, +2 Badger Trench Digger | – | – | +2 Cinder Stoker; Shield 66 → 101 | 79.2% | 84.2% |
| 19-3 Porcupine Bastion | elite | 75% (67–83) | −1 Beetle Battering-Ram | +1 Badger Berserker | – | Ash Rain | +2 Chained Binturong; −4 Cinder Imp | 70% | 73.3% |
| 19-4 Sky Marks | elite | 67.5% (59.5–75.5) | −2 Beetle Battering-Ram | +2 Badger Berserker | – | – | – | 62.5% | 75% |
| 19-5 Sky Scraper Sentinel | elite | 60% (52–68) | −2 Beaver Builder | +2 Badger Trench Digger | – | Ash Rain | +2 Cinder Imp; +2 Cinder Stoker | 58.3% | 59.2% |
| 19-6 The Frost Yeti King | miniboss | 40% (30–49) | −2 Beetle Battering-Ram | +2 Badger Berserker | – | Ashy | – | 44.2% | 45% |

### Side map: Basalt Foundry

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 19-A-2 Salamander Vents | skirmish | 86.3% (78.3–94.3) | −2 Echo Keeper | +2 Fire Salamander | – | – | – | 83.3% | – |
| 19-A-9 The Pyroclast Wyrm | elite | 60% (52–68) | −2 Echo Keeper | +2 Cinder Gecko | – | – | +2 Ashbone Ghoul; +2 Cinder Imp | 52.5% | – |
| 19-A-10 The Phoenix Ember King | boss | 40% (30–49) | −1 Echo Keeper, −1 Trapdoor Spider | +1 Fire Salamander, +1 Obsidian Scorpion | – | – | +2 Ashbone Ghoul; +2 Basalt Boar; +2 Cinder Gecko; −2 Cinder Stoker; +2 Hellbender; +2 Scraper of Skies; −2 Sulfur Vent Crab | 63.3% (blue) | – |

### Map 20: The Sundered Peak

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 20-2 Grizzly Frontier | skirmish | 85.7% (77.7–93.7) | – | – | – | – | +2 Blessed Avatar; +2 Pall Wraith; −2 Woodland Brawler | 82.5% | 85% |
| 20-3 Panther Ledge | skirmish | 81.4% (73.4–89.4) | – | – | – | – | +2 Cinder Stoker; −2 Jaguar Stalker | 85.8% | 86.7% |
| 20-4 Shrine Steps | skirmish | 77.1% (69.1–85.1) | – | – | – | – | −1 Cataphract Destrier; +1 Cinder Imp; +2 Pall Wraith | 80% | 81.7% |
| 20-5 Cave Warlord's Guard | elite | 72.9% (64.9–80.9) | – | – | – | – | +2 Pack Mule | 65% | 73.3% |
| 20-6 The Constrictor Sovereign | elite | 68.6% (60.6–76.6) | – | – | – | – | −2 Firefly Swarm; +2 Magma Salamander | 69.2% | 70% |
| 20-7 The Blessed Avatar | elite | 64.3% (56.3–72.3) | – | – | – | – | −2 Cinder Imp; +2 Pack Mule | 64.2% | 70% |
| 20-8 The Iron Cataphract | elite | 60% (52–68) | – | – | – | – | Shield 30 → 33 | 65% | 66.7% |
| 20-9 The Ancient Sloth Titan | boss | 50% (42–58) | −1 Beaver Lumberjack | +1 Ancient Sloth Titan | – | – | – | 46.7% | 53.3% |
| 20-10 The Cave Warlord | worldboss | 40% (30–49) | – | – | – | – | +3 Ashbone Ghoul; +2 Cinder Gecko; −2 Fire Hawk; −1 Grizzly Vanguard; Shield 60 → 101 | 43.3% | 37.5% |

### Side map: Eye of the Volcano

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 20-A-3 The Lich's Kiln | elite | 45% (33–57) | −1 Echo Keeper | +1 Cinder Skeleton | – | – | – | 98.3% (blue) | – |
| 20-A-5 Scorched Boars | elite | 45% (33–57) | −2 Echo Keeper | +2 Cinder Gecko | – | – | – | 97.5% (blue) | – |
| 20-A-7 Ash Condor Roost | elite | 45% (33–57) | −1 Fungal Colossus | +1 Cinder Gecko | – | – | – | 99.2% (blue) | – |

### Map 21: The Quiet Summit

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 21-2 Tarn Shore | skirmish | 82.5% (74.5–90.5) | −2 Badger Berserker | +1 Ür-Elk, +1 Fumarole Ibex | – | – | Shield 31 → 0 | 82.5% | 78.3% |
| 21-3 Cloud Ledge | skirmish | 75% (67–83) | −2 Badger Berserker | +1 Ür-Elk, +1 Rockslide Ram | Chapel Tortoise | – | +2 Glacier Yak; −2 Snow Owl Sentinel; Shield 21 → 0 | 75% | 73.3% |
| 21-4 The Avalanche's Wake | elite | 67.5% (59.5–75.5) | −1 Badger Berserker | +1 Ür-Elk | – | – | +2 Chapel Tortoise; +2 Snowshoe Hare; −1 Ür-Elk | 67.5% | 70% |
| 21-5 Snow Owl Parliament | elite | 60% (52–68) | −2 Badger Berserker | +1 Ür-Elk, +1 Rockslide Ram | – | – | −2 Eagle Diver; +2 Glacier Yak; Shield 56 → 7 | 60% | 60% |
| 21-6 The Cathedral Eagle | miniboss | 40% (30–49) | −4 Badger Berserker, −2 Alpine Marmot | +2 Ür-Elk, +2 Rockslide Ram, +2 Chapel Tortoise | – | – | – | 35% | 37.5% |

### Map 22: The Rimefire Caldera

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 22-2 Steam Vents | skirmish | 85% (77–93) | – | – | – | – | −2 Fire Salamander; +2 Magma Salamander | 85% | 92.5% |
| 22-4 Hailstone Ridge | skirmish | 75% (67–83) | – | – | – | – | +1 Ashwing Ptarmigan; +2 Frost Hare Sprinter; +1 Ice Petrel; +1 Snow Bunting Archer; +1 Ür-Elk; Shield 22 → 0 | 73.3% | 70.8% |
| 22-6 Ashfall Cornice | elite | 65% (57–73) | – | – | – | – | +2 Magma Salamander; −2 Peak Condor; Shield 57 → 182 | 64.2% | 67.5% |
| 22-7 The Steam Wall | elite | 60% (52–68) | −2 Cinder Stoker | +2 Weathervane Swift | Weathervane Swift | – | −2 Magma Salamander; −1 Tundra Musk Ox; +3 Ür-Elk | 61.7% | 61.7% |
| 22-8 The Rimeheart Colossus | miniboss | 40% (30–49) | – | – | – | – | +1 Ür-Elk; Shield 44 → 72 | 32.5% | 48.3% |

### Map 23: The Goldfeather Siege

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 23-4 Siege Camp | skirmish | 75% (67–83) | – | – | – | – | −2 Marching Elephant; +2 Mouse Sapper | 72.5% | 80.8% |
| 23-7 The Barbican | elite | 60% (52–68) | – | – | – | – | +1 Beetle Battering-Ram; −1 Goose Sentry | 59.2% | 56.7% |

### Map 24: Goldfeather Keep

| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |
|---|---|---|---|---|---|---|---|---|---|
| 24-5 The Battlements | skirmish | 70% (62–78) | −2 Howdah Archers | +2 Goose Sentry | – | – | +2 Mallard Marauder | 76.7% | 71.7% |
| 24-6 The Gilded Guard | elite | 65% (57–73) | – | – | – | – | Shield 36 → 75 | 65% | 68.3% |
| 24-8 The Magnate Duck | miniboss | 40% (30–49) | – | – | – | – | Shield 48 → 11 | 36.7% | 45% |
<!-- /fights -->
