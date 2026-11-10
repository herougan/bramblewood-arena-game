# Side-map thematic cards, Maps 0-20 (package DES3, 2026-11-10)

Design proposal only: no change to `arena_app.js`, `canonical/*`, lists or decks. Owner 2026-11-10 11:57: "we're only tuning submaps later. but you can think about thematic cards already". Judged by card NAME and ART only (project-state section 7, 2026-11-10); skills ignored, 2-3 skills a card strictly. Source data: `tools/lib_map_pools.js` fightPool (each submap fight draws its own list plus SPECIAL), `CONQUEST_MAPS` in `arena_app.js`. Same data in `side-map-cards-2026-11-10.json`.

Rarity key: S starter, C common, U uncommon, R rare, VR very rare, SR super rare, E epic. Adds prefer weak commons/uncommons. Every id was checked against `canonical/cards.json`; every concept name is new. Concept art lines are backgrounded scenes and avoid the banned art words; skills are left to the card pass.

## Summary

| Map | Fits | Off | Add | Concepts |
|---|---|---|---|---|
| Clovermead (`mq`) | 10 | 3 | 6 | 3 |
| Lilypad Reach (`mp`) | 14 | 3 | 10 | 3 |
| Smugglers' Grotto (`mg`) | 13 | 2 | 8 | 2 |
| The Old Bramble (`mo`) | 9 | 4 | 6 | 2 |
| The Sunken Grove (`ms`) | 12 | 1 | 10 | 2 |
| Murgle Mayhem (`mm`) | 6 | 0 | 8 | 2 |
| The Mycelium Deep (`mz`) | 10 | 3 | 9 | 2 |
| The Glimmer Depths (`mn`) | 12 | 3 | 10 | 2 |
| The Sunken Depths (`mj`) | 12 | 3 | 8 | 2 |
| The Aerie Vault (`mv`) | 9 | 4 | 9 | 2 |
| The Undercroft (`muc`) | 10 | 0 | 5 | 2 |
| The Canopy (`my`) | 10 | 4 | 10 | 3 |
| The Ice Hollow (`mi`) | 9 | 2 | 8 | 2 |
| The Pale Desert (`mpd`) | 14 | 0 | 8 | 2 |
| Basalt Foundry (`m9`) | 11 | 3 | 9 | 3 |
| Eye of the Volcano (`me`) | 9 | 2 | 8 | 2 |
| Volcano Lair (`mx`) | 14 | 2 | 8 | 2 |

## Five most important suggestions

1. **Rising Tide (Sunken Grove 5-A-2) and Sky Ambush (Glimmer Depths 8-A-3) both need theme cards the lists lack.** Rising Tide: Horseshoe Crab, Fiddler Crab Swarm, Mangrove Monitor, Roseate Spoonbill, Mudflat Godwit, Signal Crayfish, River Carp (all C/U/S). Sky Ambush: Cave Swiftlet, Oilbird, Fruit Bat, Baby Bat, Voltwing Bat, Glasswing Moth, Nightshade Moth, Glintsnatch Magpie.
2. **Basalt Foundry 19-A-3/7/8 field off-theme heavies** (Tide Seahorse, Quill Volley x3, Beaver Lumberjack x5): replace with Cinder Imp, Ash Imp, Basalt Boar, Grindstone Boar, Ember Centipede (all C).
3. **Pebble Beach side maps (Lilypad Reach, Smugglers' Grotto): the fights already use ducks, carp and crabs the lists lack** (Pond Duck, Duckling, River Carp; Fiddler Crab Swarm, Limpet Clinger, Salvager Hermit Crab for Hermit Row 2-3). Putting them on the lists makes the decks legal and weaker.
4. **The Canopy 14-A-1 Sloth Boughs / 14-A-3 Dart Frogs name sloths and frogs; the list has no sloth** (Hanging Loafer, Canopy Sloth Guardian, Slowpoke Sentinel; Poison Dart Frog, Lotus Frog). The Canopy's rainforest animals are held (project-state 7), so this needs a release.
5. **Fights named for an animal the list lacks:** Old Bramble 0-B-1/2 (ant-and-starter decks vs an all-Rare list: add Bramble Sprout, Bramble Hoglet, Soldier Ant), Pale Desert Meerkat Warrens / Oryx Crossing (Meerkat Sentry, Pale Oryx), Eye of the Volcano Scorched Boars / Vent Crabs (Basalt Boar, Sulfur Vent Crab).

## Clovermead (`mq`)

*A wide clover meadow past the Outskirts — rabbits, bees and mice, and nobody in a hurry.* Thunderstorm on every fight. Fights 1-A-1..5, boss The Old Hare. Meadow animals: rabbits, bees, mice, voles.

| | |
|---|---|
| **Fits** | Lucky Hopper (U), Field Mouse (C), Field Vole (C), Hedgerow Shrew (C), Robin Redbreast (U), Slow-worm (C), Cricket Drummer (C), Ant Hill (C), Bee Forager (S), Cottontail (S) |
| **Off-theme** | Woodcock Lookout (C): woodland bird (Forest tag), not a clover meadow; Bramble Sprout (C): thicket hedgehog; belongs to the Bramble maps; Badger Lumberjack (U): lumber trade, woodland badger; no meadow link |
| **Add** (exist elsewhere) | Meadow Rabbit (S): starter; the rabbits of the blurb; Harvest Mouse (S): starter mouse; the 1-A-4 fight is named Harvest Mice; Honey Bee (S): starter bee; 1-A-3 Puddle Hop / bees; Clover Butterfly (C): common; name says clover; Ladybird Guard (C): common; meadow insect, tanky and cheap; Rabbit Kit (C): common rabbit kit |
| **New concepts** | **Skylark Singer** (skylark, uncommon, support flyer): A skylark mid-song above a sea of clover blossoms, thunderheads on the horizon behind it.<br>**Meadow Grasshopper** (grasshopper, common, cheap attacker): A bright green grasshopper mid-leap over white clover, bees drifting past.<br>**The Old Hare** (hare, rare, boss leader for 1-A-5): A grey-muzzled hare dozing upright in a hollow of long grass, one ear cocked, clover flowers in its fur. |

Note: Clovermead is the cleanest map; the off-theme Woodcock Lookout and Bramble Sprout are still fight staples (1-A-1, 1-A-2, 1-A-3), so the meadow adds above are their natural replacements. The boss has no hare card.

## Lilypad Reach (`mp`)

*A wide, still pond full of lily pads, beaver dams and very territorial ducks.* Pebble Beach side map (counts as Map 2). Every fight Tide + Rain; boss gimmick lodgeMend. Beaver dams, lily pads, ducks.

| | |
|---|---|
| **Fits** | Riverworks Bastion (C), Lodge Engineer (U), Old Sturgeon (U), Water Shrew (C), Box Turtle (C), Muskrat Lodgekeeper (U), Platypus Spur (U), Pyrenean Desman (U), Snapstick Turtle (C), Water Vole (C), Muskrat Reedgatherer (C), Pond Algae (C), Victoria Regia (U), Beaver Lumberjack (C) |
| **Off-theme** | Alley Cat (U): city cat, no pond link; Shoal Shark (U): salt-water coastal shark in a still freshwater pond; Marsh Harrier (U): swamp raptor, borderline; hunts over reeds, so keep only if the Reach gets a bird slot |
| **Add** (exist elsewhere) | Pond Duck (S): starter; the very territorial ducks. Already in 2-A-3/2-A-5 decks but not on the list; Duckling (S): starter; same, already in four decks; Duck Paddler (S): starter 2/10/1 duck; Great Crested Grebe (C): common pond diver; Lotus Frog (U): uncommon; lily pad frog; Mayfly Dancer (C): common pond insect; Dam-Keeper Beaver (C): common beaver; Beaver Builder (C): common beaver, cheap; River Carp (S): starter; already in 2-A-3 and 2-A-6; Puddle Skimmer (U): uncommon pond skater |
| **New concepts** | **Dragonfly Skimmer** (dragonfly, uncommon, flyer, evasive): A blue-green dragonfly skimming above lily pads, droplets trailing from its wings.<br>**Tadpole Shoal** (tadpole, common, swarm filler): A cloud of dark tadpoles wriggling between the stems of a lily pad, sun through green water.<br>**Territorial Swan** (swan, rare, guard bruiser): A white swan with wings half spread guarding a nest of reeds on a still pond. |

Note: Pebble Beach side maps run too hard: the ducks and carp the fights already use (pond-duck, duckling, guppy, river-carp) are not on the list, and the blurb promises ducks while the list has none. The weak starters/commons above would let the fights be rebuilt weaker. Hermit Row 2-3 is a main-map (Pebble Beach) fight: its cheap shore crabs are in the Grotto adds.

## Smugglers' Grotto (`mg`)

*A sea cave under Pebble Beach. Whatever the smugglers left down here, something else has moved in.* Pebble Beach side map (counts as Map 7). No field effect set; boss gimmick inkCloud. Sea cave, smugglers' leavings, Hollow Kin cave dwellers.

| | |
|---|---|
| **Fits** | Octopus Tactician (U), Trash Panda Trickster (C), Open-Ocean Hermit Crab (C), Gull Thief (C), Pincushion Urchin (C), Tide Pool Crab (C), Tidepool Trapper Crab (C), Grey Seal Bull (U), Conch Crawler (C), Conch Herald (U), Gallery Orb-Weaver (U), Driftwood Crab (C), Rock Pool Starfish (C) |
| **Off-theme** | Sea Turtle Elder (C): open-water reef turtle, not a cave animal; Pelican Diver (U): daylight open-water bird; no cave link |
| **Add** (exist elsewhere) | Smuggler Slingrat (U): uncommon; name is the map; Coffer Mimic (U): uncommon hermit crab, a treasure chest in a shell; Salvager Hermit Crab (C): common; scavenges wrecks; Glow-worm (C): common; the Glowing Pool 2-B-3; Moray Ambusher (C): common eel in rock gaps; Raccoon Nightcrew (C): common night raider (thief family with Trash Panda); Fiddler Crab Swarm (C): common; cheap shore crab for Hermit Row 2-3; Limpet Clinger (C): common; cheap shore mollusc for Hermit Row 2-3 |
| **New concepts** | **Barrel Octopus** (octopus, uncommon, ambusher): An octopus peeking out of a split rum barrel half buried in the wet sand of a sea cave, lantern light on its eyes.<br>**Quartermaster Gull** (gull, uncommon, support leader): A one-eyed herring gull perched on a crate of salvage, talons on a rope, in a damp cave mouth. |

Note: Hermit Row 2-3 (Pebble Beach) is too hard for its crab list: swap toward fiddler-crab-swarm, limpet-clinger, salvager-hermit-crab (all weak commons).

## The Old Bramble (`mo`)

*The thorns around the Outskirts are older than the village. Something waited in them for you to grow strong.* Tangled Roots on every fight. 0-B-1..4, boss The Old Bramble (Ent). Thorn thicket round the Outskirts; the list is all Rare+ while fights use starters.

| | |
|---|---|
| **Fits** | Ent (R), Echidna Quillshot (SR), Thorn Shrike (R), Gatling Hog (R), Quillguard (R), Sergeant Bramblefox (R), Bramblewood Lynx (R), Wolf Spider Mother (R), Hedgehog Herbalist (R) |
| **Off-theme** | Taiga Lynx (R): name and art say taiga, not bramble (Bramblewood Lynx covers the cat); Dhole Matriarch (VR): Asian wild dog pack, no thorn link; Shimmerwing Stag (VR): shimmer/glimmer reads cave and crystal maps; Lucky Hopper (U): clover rabbit, Clovermead |
| **Add** (exist elsewhere) | Bramble Sprout (C): common; a bramble-covered hedgehog; Bramble Hoglet (C): common hedgehog; Briarback Hedgehog (C): common; briar-backed; Hazel Coppice (C): common dormouse; a thicket; Soldier Ant (C): common; the ant fights 0-B-1/0-B-2 already lean on ants; Forager Ant (C): common; already in four decks |
| **New concepts** | **Briar Wren** (wren, common, cheap chip attacker): A tiny wren singing from the highest thorn of a briar thicket, red berries around it.<br>**Bramble Ant Queen** (ant, uncommon, swarm support): A large queen ant on a mound of thorns and dry leaves, workers streaming past into a bramble hedge. |

Note: 0-B-1 and 0-B-2 are too hard: both are ant-and-starter decks, so the cheap thorn commons above (all vanilla-friendly) are the natural weak adds. The Ent boss has no thorn-named support card.

## The Sunken Grove (`ms`)

*Where the swamp swallowed an old forest. The trees still stand, up to their necks.* Tide on every fight; swamp fever. 5-A-1..4, boss The Grove Warden. 5-A-2 Gator Hollow carries the Rising Tide boon (needs at least half the deck Tide: sea, shore and river creatures).

| | |
|---|---|
| **Fits** | Grass Viper (U), Snapper Hatchling (C), Constrictor Coil (C), Alligator Gar (R), Fen Mink (U), Mangrove Mudskipper (C), Swamp Alligator (C), Caiman Hatchling (C), Crocodile Ambusher (C), Nutria Reedcutter (C), Venomlord Serpent (C), Anhinga Spearbird (U) |
| **Off-theme** | Hedgehog Herbalist (R): forest hedgehog with herbs; no swamp or drowned-tree link |
| **Add** (exist elsewhere) | Horseshoe Crab (C): common; tidal shore, Rising Tide; Fiddler Crab Swarm (C): common; mangrove shore, Rising Tide; Mangrove Monitor (C): common; mangrove lizard, Rising Tide; Roseate Spoonbill (C): common wading shorebird, Rising Tide; Mudflat Godwit (U): uncommon tidal flats, Rising Tide; Signal Crayfish (C): common river crustacean, Rising Tide; River Carp (S): starter river fish, Rising Tide; Cypress Root Lurker (C): common; the drowned cypress; Matamata (U): uncommon swamp turtle; Mossmother Newt (C): common; moss in the flooded wood |
| **New concepts** | **Egret Wader** (egret, common, shore flyer): A white egret wading between flooded tree trunks, moss hanging to the waterline.<br>**Brackish Stingray** (stingray, uncommon, shore ambusher): A flat grey stingray gliding over the muddy bed between drowned roots, light in green water. |

Note: For 5-A-2: the first eight adds are sea/shore/river by name and art; the boon reads them once ENG42 moves it off skills (project-state section 7). The current swamp list has almost none, so the boon would stay off.

## Murgle Mayhem (`mm`)

*A sinkhole of bog water under the Swampmire that goes down further than anyone has counted. Something down there keeps sending the frogs back up.* Endless dungeon (50 floors, boss The Murgle King, boss adds alligator + crocodile). Deck: Meadow Frog, Bog Leech, Marsh Wisp, Marsh Harrier. Draws its own 6 plus the Swampmire MAP list.

| | |
|---|---|
| **Fits** | Bog Leech (U), Crocodile Ambusher (C), Meadow Frog (C), Puddle Hopper (C), Swamp Alligator (C), Willow-o'-Wisp (U) |
| **Off-theme** | none |
| **Add** (exist elsewhere) | Wisp Newt (C): common; already in the deck, on no list; Poison Dart Croaker (C): common frog (on the Swampmire list); Camouflage Frog (C): common frog (on the Swampmire list); Marsh Gas Toad (C): common toad; Bog Behemoth (C): common 26-health frog, a fit for the boss floors; Cane Toad (U): uncommon toad; Lotus Frog (U): uncommon frog; Mosquito Cloud (C): common; the bog swarm |
| **New concepts** | **Bullfrog Chorister** (bullfrog, common, cheap attacker): A fat bullfrog with throat sac inflated, calling from a bog-water sinkhole rim, reeds and mist.<br>**The Murgle King** (bullfrog, epic, boss leader): An enormous bullfrog wearing a crown of braided reeds, seated on a bog-water throne ringed by smaller frogs. |

Note: 'More frogs. Angrier frogs.' The six own cards fit; the dungeon needs more frog bodies, and a named boss card (The Murgle King).

## The Mycelium Deep (`mz`)

*Under the Morel Hollow, the roots go down a long way, and every root is listening.* Spore Cloud on every fight. 7-A-1..5, boss The Mycelium Mind. Roots, fungus, soil and rot under the Morel Hollow.

| | |
|---|---|
| **Fits** | Rootworm Colony (C), Dung Beetle (U), Fungal Colossus (U), Compost Grub (C), Ant Warrior (U), Planarian Splitter (U), Bombardier Beetle (U), Leafcutter Gardener (C), Truffle Piglet (U), Garden Snail (S) |
| **Off-theme** | Owl Nightwatch (C): surface owl; nothing underground; Wolf Spider Mother (R): surface forest hunter; Hawthorn Shieldbug (C): hedge and tree bug, not soil |
| **Add** (exist elsewhere) | Springtail Hopper (C): common soil springtail; Fungus Gnat Cloud (C): common; the name is the map; Millipede Hauler (U): uncommon; leaf-litter decomposer; Termite Mound (C): common structure; mound and fungus farms; Earthworm (S): starter; soil; Leopard Slug (C): common; damp rot; Pill Bug (U): uncommon; woodlice of the leaf litter; Velvet Worm (U): uncommon; damp-soil hunter; Phoenix Mushrooms (E): epic; name and art are fungal (a boss-tier option) |
| **New concepts** | **Mycelium Mole** (mole, uncommon, tunneller): A pale blind mole digging through a glowing web of white fungal threads, tiny caps blooming.<br>**Cordyceps-Capped Ant** (ant, uncommon, swarm attacker): A worker ant with a thin orange fungal stalk rising from its head, on a mossy root underground. |

Note: Cheap decomposers and fungus names are plentiful elsewhere but on no list; the Mycelium Deep list is mostly beetles and worms.

## The Glimmer Depths (`mn`)

*Below the alcoves the walls start to shine, and things that like shiny things start to gather.* Mirage on every fight. 8-A-1..4, boss The Gem Hoarder. Crystal caves, shiny things. 8-A-3 Shard Gallery carries the Sky Ambush boon (needs at least half the deck winged).

| | |
|---|---|
| **Fits** | Lantern Spark Fly (U), Prospector Mole (C), Echo Screecher (R), Sulfur Cinder Moth (C), Cave Olm (C), Giant Cave Huntsman (R), Quarry Mole (C), Stalactite Pill Bug (C), Vampire Bat (R), Whip Spider (U), Glimmer Spider (U), Malachite Golem (R) |
| **Off-theme** | Grotto Lobster (R): coastal lobster; sea, not crystal cave; Star-nosed Mole (C): river mole; Badger Stonemason (U): mason of walls; no crystal or gem link |
| **Add** (exist elsewhere) | Cave Swiftlet (C): common cave bird, Sky Ambush; Oilbird (U): uncommon cave bird, Sky Ambush; Fruit Bat (C): common bat, Sky Ambush; Baby Bat (C): common bat, Sky Ambush; Voltwing Bat (C): common bat, Sky Ambush; Glasswing Moth (C): common; glassy wings, Sky Ambush; Nightshade Moth (C): common moth, Sky Ambush; Glintsnatch Magpie (U): uncommon; shiny things, Sky Ambush; Magpie Collector (U): uncommon; shiny collector; Glow-worm (C): common; cave lights |
| **New concepts** | **The Gem Hoarder** (jackdaw, rare, boss leader): A black jackdaw on a heap of raw crystals and glass beads in a glittering cavern, a bright stone in its beak.<br>**Prism Bat** (bat, uncommon, flyer, support): A small bat hanging from a crystal spire, its wings scattering rainbow light on the cave wall. |

Note: Sky Ambush 8-A-3: the fight's deck has 7 winged cards of 19 (Sulfur Cinder Moth x4, Echo Screecher x3), under half; for half the deck to read winged by name and art, use the first eight adds (bats, moths, cave birds, a magpie).

## The Sunken Depths (`mj`)

*An otter ferry went down past the reef wall years ago. The current through its hull is faster than anything above.* Crushing Depths on every fight; 10-A-2 Rising Tide boon, 10-A-4/5 High Tide. 10-A-1..5, boss The Ferry's Last Passenger. A sunken otter ferry.

| | |
|---|---|
| **Fits** | Blue-ringed Octopus (R), Orca Vanguard (C), Nautilus Drifter (VR), Kraken Spawnling (C), Coral Reef Shark (U), Riptide Eel (U), Colossal Squid (VR), Coral Polyp Colony (U), Electric Ray (U), Great Barracuda (R), Hagfish Silencer (R), Nudibranch (U) |
| **Off-theme** | Mangrove Manatee (R): shallow-water mangrove sea cow, not deep wreck water; Clownfish Scout (C): bright shallow reef fish; Parrotfish (C): bright shallow reef fish |
| **Add** (exist elsewhere) | Otter Ferryman (C): common; the ferry crew; The Drowned Matriarch (U): uncommon; name says drowned; Abyss Lantern Squid (U): uncommon; deep water (was in these fights once); Inkcloud Squid (C): common squid; Conger Eel (U): uncommon wreck eel; Moray Ambusher (C): common wreck eel; Giant Clam (C): common sea-floor clam; Barnacle Fortress (C): common; the hull |
| **New concepts** | **Anglerfish Lantern** (anglerfish, uncommon, lure ambusher): A deep-sea anglerfish with its glowing lure hanging in the dark window of a sunken ferry cabin.<br>**Wreck Isopod** (giant isopod, common, cheap scavenger): A giant pale isopod crawling across the barnacled deck of a sunken ferry, silt drifting. |

Note: Every card fits except three shallow-reef ones; the map has no otter-ferry crew in its list although the blurb is about an otter ferry.

## The Aerie Vault (`mv`)

*The oldest nests on the mountain, built on top of each other for a thousand springs.* Thunderstorm on every fight; 11-A-1 Sky Ambush boon. 11-A-1..4, boss The Roost Mother. Oldest nests on the mountain, eagles, owls, swifts.

| | |
|---|---|
| **Fits** | Eagle-Owl Quartermaster (R), Eyrie Warden (C), Ibex Rockcaller (VR), Alpine Swift (C), Apollo Butterfly (U), Chamois Leaper (U), Gale Swift (C), Golden Eagle Diver (U), Vigil Owl (R) |
| **Off-theme** | Wound Reaver (R): volcanic lizard, no nest or bird; Alpine Salamander (C): ground amphibian; Chipmunk Hoarder (C): ground rodent; Alpine Marmot (C): ground rodent |
| **Add** (exist elsewhere) | Peak Condor (C): common; high mountain raptor; Peregrine Stooper (U): uncommon cliff falcon; Wallcreeper (C): common cliff bird; Red-billed Chough (C): common cliff crow; Nest Hatchling (C): common; chick in a nest; Great Horned Owl (C): common owl; Hawk Arrowkeeper (C): common hawk; Sparrow Chick (S): starter nestling; Gannet Nestweaver (C): common; the name is nests |
| **New concepts** | **Eaglet Brood** (eagle, common, cheap defender): Two fluffy white eaglets in a huge stick nest on a cliff ledge, mother wing shadowing them.<br>**Aerie Heap** (twigs (structure), uncommon, structure, defender): A vast stack of old twig nests piled on a mountain ledge, eggs and feathers wedged into its layers. |

Note: The Aerie list is half ground mountain animals. Chicks and cliff birds would make it read as a nest.

## The Undercroft (`muc`)

*Vaults under the Arena's sand. Every three floors the doors open onto another land.* Endless dungeon (50 floors, boss The Vault Warden). Its enemy decks are other lands' elite decks (15 lands, 3 floors each); the 93-card list is a mixed pool by design.

| | |
|---|---|
| **Fits** | Stone Turtle Warden (C), Hollow Oath-Keeper (C), Owl Nightwatch (C), Antlion Pit (U), Echo Screecher (R), Cave Olm (C), Giant Cave Huntsman (R), Whip Spider (U), Fungal Colossus (U), Glacier Wolf Pack (C) (sample) |
| **Off-theme** | none |
| **Add** (exist elsewhere) | Great Gate (C): common; a door guard by name; Chapel Tortoise (U): uncommon; slow stone guard; Night Watchman (C): common owl watch; Elder Tortoise (C): common; ancient vault warden; Armadillo Guard (C): common; armoured guard |
| **New concepts** | **Vault Scarab** (scarab, common, cheap attacker): A gold-green scarab beetle on a worn stone threshold under a lantern, sand sifting through the door gap.<br>**Key-Keeper Raven** (raven, uncommon, support): A raven holding a large iron key in its beak on a carved stone ledge in a vault corridor. |

Note: Fits list shows a sample; the list is intentionally many-land and not judged card by card. The theme gap is the Vault Warden himself: vault, door and guard cards.

## The Canopy (`my`)

*Up in the rainforest roof past the savanna's edge — frogs, sloths, drums and a jaguar's path.* Canopy field + rain. 14-A-1..5, boss The Jaguar's Path. Rainforest roof: frogs, sloths, drums, jaguar. Project-state 7: the Canopy's rainforest animals are HELD (RP5, N221-1), so moving cards in needs the owner's release.

| | |
|---|---|
| **Fits** | Hercules Beetle (R), Jaguar Stalker (R), Kinkajou Lurker (U), Weaver Bird (C), Leafcutter Gardener (C), Vampire Bat (R), Lyrebird Mimic (U), Poison Dart Croaker (C), Camouflage Frog (C), Proboscis Monkey (U) |
| **Off-theme** | Pangolin Roller (R): savanna tag; ground anteater; Spitting Cobra (R): savanna cobra, ground snake; Redwood Woodpecker (U): temperate redwood forest; Apollo Butterfly (U): mountain butterfly |
| **Add** (exist elsewhere) | Hanging Loafer (C): common sloth (14-A-1 Sloth Boughs); Canopy Sloth Guardian (C): common sloth, canopy by name (14-A-1); Slowpoke Sentinel (C): common sloth (14-A-1); Slow Loris (C): common; tree dweller (14-A-1); Howler Monkey (U): uncommon; canopy voice (14-A-1); Poison Dart Frog (C): common (14-A-3 Dart Frogs); Lotus Frog (U): uncommon frog (14-A-3); Leaf Chameleon (U): uncommon; leaf dweller (14-A-3); Toucan Courier (C): common (14-A-3); War-Drum Mandrill (C): common; the Drum Circle 14-A-4 |
| **New concepts** | **Harpy Eagle Lookout** (harpy eagle, rare, flyer, top-tier attacker): A harpy eagle perched on the emergent crown of a rainforest tree, mist below, feathered crest raised.<br>**Morpho Butterfly** (morpho butterfly, common, cheap evasive flyer): A blue morpho butterfly resting on a broad green leaf in dappled canopy light, raindrops on the leaf.<br>**Emerald Tree Boa** (tree boa, uncommon, ambusher): An emerald tree boa coiled on a mossy branch high in the rainforest, leaves around its head. |

Note: 14-A-1 and 14-A-3 are too hard: the Boughs and Dart Frogs fights name sloths and frogs while the list has two frogs and no sloths. The whole proposal sits on the held list; the weak sloth and frog commons are the quick fix for the two named fights.

## The Ice Hollow (`mi`)

*A cave of blue ice under the tundra. The cold in here has teeth.* Slippery 30 field; 17-A-1 Snow Veil boon. 17-A-1..4, boss The Hollow King. Blue ice cave under the tundra.

| | |
|---|---|
| **Fits** | Lone Grey Wolf (VR), Snow Ermine (C), Frost Hare Sprinter (C), Ravenous Wolverine (R), Harbor Seal (C), Polar Bear (VR), Snow Bunting Archer (U), Walrus Icebreaker (VR), Talus Pika (C) |
| **Off-theme** | Spitting Spider (U): cave arachnid from warm caves; Greenland Shark (R): deep ocean shark, not an ice cave |
| **Add** (exist elsewhere) | Lemming Swarm (C): common tundra; Harp Seal Pup (C): common ice seal; Ringed Seal (C): common; lives in ice caves; Glacier Wolf Pack (C): common; glacier by name; Icefletch Fox (U): uncommon arctic fox; Frost Thistle Lynx (C): common frost lynx; Ice Petrel (U): uncommon ice bird; Ice-Crevasse Wolf (R): rare; crevasse is ice-cave by name |
| **New concepts** | **Penguin Huddle** (emperor penguin, common, cheap defender): A tight huddle of penguins on blue ice inside a glowing ice cave, frost on their backs.<br>**Ice Worm** (ice worm, common, cheap attacker): A thin black ice worm wriggling out of a crack in a wall of blue glacier ice. |

Note: Fits are mostly right; the map is short of cheap cave-ice creatures and has no ice-cave bat or worm.

## The Pale Desert (`mpd`)

*Past the glass the sand turns white as bone, and so does the sun. No water, no shade, and the horizon never stays where you left it.* Heatwave 1-2 on all nine fights; mirage, sandstorm, quicksand in some. 18-A-1..9 incl. Meerkat Warrens and Oryx Crossing, boss The Quicksand Queen.

| | |
|---|---|
| **Fits** | Quicksand Queen (VR), Skull Vulture (U), Sand Widow (C), Dust Hyena (U), Caustic Scorpion (U), Roadrunner Courier (C), Sandfish (C), Dust-devil Kestrel (VR), Fennec Fox (U), Thorny Devil (U), Antlion Pit (U), Dromedary (U), Dune Packrat (R), Trapdoor Spider (VR) |
| **Off-theme** | none |
| **Add** (exist elsewhere) | Pale Oryx (U): uncommon; Pale by name, the 18-A-7 Oryx Crossing; Meerkat Sentry (C): common; the 18-A-4 Meerkat Warrens; Meerkat Burrower (C): common; Meerkat Warrens; Sand-flinger Antlion (C): common antlion; Moon Jerboa (U): uncommon desert rodent; Horned Lizard (U): uncommon desert lizard; Dune Jackal (C): common; Sandstorm Roc (C): common; the sandstorm |
| **New concepts** | **Sidewinder Viper** (sidewinder, common, cheap attacker): A pale sidewinder leaving looping tracks across bleached white sand, heat haze behind it.<br>**Salt Pan Flamingo** (flamingo, uncommon, flyer support): A lone flamingo standing in a cracked white salt pan under a blazing sun, mirage shimmer around its legs. |

Note: The 14 listed cards all fit. Two named fights (Meerkat Warrens, Oryx Crossing) use neither a meerkat nor an oryx; both exist as cards and are on no list.

## Basalt Foundry (`m9`)

*A furnace of cracked black stone — everything here glows from the inside.* Ashy on every fight; lava spout on 19-A-7..10. 19-A-1..10, boss The Phoenix Ember King. A furnace of cracked black stone.

| | |
|---|---|
| **Fits** | Ember Revenant (VR), Anvilwhisker Otter (U), Ore-Smelter Mole (U), Cinder Gecko (C), Ember Jackal (R), Ashbone Ghoul (C), Fire Salamander (U), Magma Salamander (VR), Ash Cloud Condor (R), Phoenix Fledgling (C), Cinder Stoker (C) |
| **Off-theme** | Tide Seahorse (VR): water seahorse in a furnace (used in 19-A-3/7/8); Quill Volley (R): porcupine with no fire or stone link (used in 19-A-8); Hercules Beetle (R): rainforest beetle |
| **Add** (exist elsewhere) | Cinder Imp (C): common; replace Tide Seahorse in 19-A-3/7/8; Ash Imp (C): common; same; Basalt Boar (C): common; basalt by name; Grindstone Boar (C): common; stone and forge; Ember Centipede (C): common; Cinder Hornet (C): common; Pumice Beetle (U): uncommon volcanic beetle; Ash Moth (C): common; ash; Anvil Thrush (C): common; anvil by name |
| **New concepts** | **Bellows Toad** (toad, common, cheap support): A large toad puffing out its throat like a forge bellows beside glowing slag, soot on its back.<br>**Crucible Tortoise** (tortoise, uncommon, defender): A tortoise with a cracked basalt shell glowing orange along its seams, standing in a foundry channel.<br>**Slag Runner Hare** (hare, common, fast attacker): A soot-black hare sprinting over a cooling lava crust, glowing footprints behind it. |

Note: Hard fights 19-A-3/7/8 field Tide Seahorse (x1-2), Quill Volley (x3) and Beaver Lumberjack (x5), which are off-theme and heavy. Weak fire-named commons above let the decks be rebuilt on-theme and lighter. Basalt Foundry's Ashen Choir (moths, beetles, hummingbirds) also has no moth or beetle in the list besides Ash Moth.

## Eye of the Volcano (`me`)

*Down inside the crater, where the dead keep the fire company and the living learned not to need much.* No map field (sulphur fumes on 20-A-2/20-A-6). 20-A-1..7. The crater floor where the dead keep the fire company.

| | |
|---|---|
| **Fits** | The Contradiction (E), Cinder Stoker (C), Ashbone Ghoul (C), Cinder Skeleton (C), Obsidian Scorpion (R), Ash Cloud Condor (R), Magma Wraith (U), Ossuary Lammergeier (SR), Ash Moth (C) |
| **Off-theme** | Pack Mule (C): generic pack animal; Cave Warlord (C): cave bear war leader; no ash or dead link |
| **Add** (exist elsewhere) | Sulfur Vent Crab (U): uncommon; the 20-A-6 Vent Crabs; Basalt Boar (C): common; the 20-A-5 Scorched Boars; Cinder Imp (C): common; Ash Imp (C): common; Bone Diviner (U): uncommon; bones and the dead; Flagellant Vulture (U): uncommon; the crater scavenger; Brimstone Hound (U): uncommon; Carrion Beetle (U): uncommon; the dead |
| **New concepts** | **Cindergrave Ram** (ram, common, cheap attacker): A charred skeleton of a ram standing in a field of grey ash, embers glowing in its eye sockets.<br>**Kiln Lantern Fox** (fox, uncommon, support): A lean ash-grey fox carrying a small flickering ember lantern in its mouth in a dark crater. |

Note: Two fights are named for animals not on the list: Scorched Boars (no boar) and The Vent Crabs (no crab). The Contradiction (epic polar bear) is the joke by name: it fits ironically as a crater oddity.

## Volcano Lair (`mx`)

*Where the mountain's fire is born. Something vast sleeps in it, and it is waking.* Sulphur Fumes on every fight. 20-B-1..4, final boss The Caldera Wyrm. Where the mountain's fire is born; a sleeping wyrm.

| | |
|---|---|
| **Fits** | Fire Drake Hatchling (H), The Caldera Wyrm (H), Ember Jackal (R), Ember Centipede (C), Magma Salamander (VR), Magma Rhino (C), Cinder Stoker (C), Obsidian Scorpion (R), Ash Cloud Condor (R), Ash Moth (C), Ashbone Ghoul (C), Magma Wraith (U), Granite Ox Golem (R), Salamander Pyromancer (E) |
| **Off-theme** | Tide Seahorse (VR): water seahorse in a fire lair; Pack Mule (C): generic pack animal; no fire link |
| **Add** (exist elsewhere) | Pyroclast Wyrm (C): common dragon; wyrm kin; Cinder Hornet (C): common; Cinder Imp (C): common; Ash Imp (C): common; Brimstone Hound (U): uncommon; Fire Salamander (U): uncommon; Lava Waders (U): uncommon; Phoenix Fledgling (C): common; fire |
| **New concepts** | **Lava Newt** (newt, common, cheap attacker): A bright orange newt crawling over a black basalt ledge above a glowing lava river.<br>**Hoard Warden Tortoise** (tortoise, uncommon, defender): A huge tortoise with a shell of cooled gold-flecked lava standing guard on a heap of treasure in a lair. |

Note: Two off-theme cards (Tide Seahorse x1-2 and Pack Mule x3-5 appear in all four fights). The Caldera Wyrm and Fire Drake Hatchling are the lair's thematic top end already.

## Notes for the owner

- Cards on a list are hard rules (list plus SPECIAL); adds are proposals only. Several adds are on no list today (the unplaced cards), so they would also need a home map and budget check (`docs/workflows/card-data.md`).
- Murgle Mayhem and the Undercroft also draw their parent's MAP list (`PARENT_POOL_SUBS`).
- Balance status: not touched by this package (no deck, list or card changed; road fights in band / within 10 / beyond 20 are unchanged from BAL40: 190 / 203 / 8). Open balance decisions are the ones already in `docs/decisions.json`; the next balance runs are the sub-map tuning the owner said comes later.
