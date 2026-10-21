# Skirmish theme pass and PvP decks (2026-10-21, package TS2)

Owner (Oct 21): "Recommended cards in each biome to have been assigned to the skirmish. (thematicism is the key, we can change skills and stats later and even images later)"; "More PVP decks maybe, I like PVP to experience some of the cards we made."; "No need for checks or testing, to save tokens."

Source of the recommendations: `docs/map-recommendations-2026-10-21.md` (package RP). Nothing here changes a card's stats, skills or reward; the swaps are only in the enemy decks (`CONQUEST_MAPS` in `arena_app.js`) and in the seeded ghost decks (`bramblewood-ghosts.js`).

## What changed

- **132 fights** got new enemy cards: 114 on the main maps and 18 on side maps.
- Main maps by range: Maps 6-10: 36, Maps 1-5: 19, Maps 11-15: 18, Maps 16-20: 22, Maps 21-24: 19.
- Side maps by parent range: Maps 1-5: 8, Maps 16-20: 5, Maps 6-10: 4, Maps 11-15: 1.
- **Unchanged on purpose:** Map 0 (the owner-edited decks), the tutorial decks (Tutorial, T-2 to T-4), the raid-boss, world-boss and dungeon fights, the Babel Spire, and every fight's boss card (the top-rarity card of each elite and boss deck) and showcase card. Deck sizes, fight kinds and castle Health are as they were.
- **Maps 25-28** (Rainforest Floor, Ant Empire, Carrion Moors, Stormcoast) are not in the game yet (their slots are `Reserved`), so they have no fights to fill; their cards are listed under "Not placed".

### Rules the pass followed

- A recommended existing card that no fight on its map used yet replaced an off-biome card (by the biome tags in `canonical/unit-themes.json`; off-biome first, then neighbouring biomes, an on-biome card only when nothing else fitted). The swap looks for the nearest rarity, wait, cost and rough stat power, so a fight stays about as hard as before; the "relaxed" swaps below are the few where nothing close existed.
- The recommended cards are spread over the map's fights (at most a few swaps per fight), so each appears at least once. Leftover off-biome cards were then replaced by a recommended card (or an on-biome card of the same map) of similar strength.
- Copy limits per rarity and the road's rarity caps (`roadRarityCap`) hold for every card put in. A swapped card takes the old card's copy count (less if its rarity allows fewer).
- Maps 0-5 stay cute: the Kraken Spawnling, Humpback Elder, Reef Manta Glider and any Shark / Whale / Orca were taken out of Maps 1-4. The Map 5 swamp keeps its crocodiles and Bog Behemoth ("Map 5 starts slightly more imposing creatures"). No Shark card is in any fight before Map 8 (the first ones are in Map 9: Reef Shark, Coral Reef Shark).
- Side maps: their one unique card and the player-owned cards they use were kept; only off-biome cards were swapped, for cards of the parent map's recommendations or of the side map's own biome. Clovermead got the explicitly listed meadow cards.

## Per-map fights, cards out and in

`Out → In` is `card ×copies`. *relaxed* = no closer match existed (a bigger step in rarity, wait or cost). The Heroic leader cards (Gannet Queen, Old Snapjaw, Heron Hag, Echo Matriarch, Pride Queen, Yeti Chieftain, Thistle Baron) are listed in "Not placed".

### Map 0: Bramblewood Outskirts  (`m1`)

No change: Map 0 owner-edited.

### Map 1: Thistlewood  (`mf`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 1-1 Hedgerow Scouts | skirmish | Meadow Frog ×4 | Bramble Sprout ×4 |
| 1-2 Cricket Chorus | skirmish | Farm Dog ×4 | Harvest Mouse ×4 |
| 1-3 Burrow Line | skirmish | Fox Kit ×3 | Badger Lumberjack ×3 |
| 1-4 Sapper Hedge | skirmish | Puddle Hopper ×3 | Dormouse ×3 |
| 1-5 The Thistle Baron | elite | Hedgehog Scout ×3 | Compost Grub ×3 |

### Map 2: Pebble Beach  (`mb`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 2-1 Rock Pool Raiders | skirmish | Meadow Frog ×4 | Pincushion Urchin ×4 |
| 2-4 Pelican Point | skirmish | Otter Riverguard ×1, Beaver Builder ×2 | Sea Turtle Elder ×1 *(relaxed)*, Tide Pool Crab ×2 |

### Map 3: Gannet Cliffs  (`mc`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 3-3 Rockfall | skirmish | Tide Pool Crab ×2 | Hawk Arrowkeeper ×2 |
| 3-5 Eagle Stoop | elite | Tide Pool Crab ×4 | Peak Condor ×4 |
| 3-6 Avalanche Pass | elite | Tide Pool Crab ×2 | Peak Condor ×2 |
| 3-7 The Gannet Queen | boss | Tide Pool Crab ×2 | Peak Condor ×2 |

### Map 4: Sunken Hollow  (`m2`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 4-1 Reef Skirmishers | skirmish | Reef Manta Glider ×3, Humpback Elder ×2 | River Mink ×3, Snapstick Turtle ×2 *(relaxed)* |
| 4-2 Tidal Ring | skirmish | Reef Manta Glider ×2, Kraken Spawnling ×2, Open-Ocean Hermit Crab ×2 | Muskrat Lodgekeeper ×2, Snapstick Turtle ×2 *(relaxed)*, Water Vole ×2 |
| 4-3 Cetacean Pod | elite | Open-Ocean Hermit Crab ×2, Kraken Spawnling ×2 | Water Vole ×2, Muskrat Lodgekeeper ×2 *(relaxed)* |
| 4-4 The Kraken's Maw | elite | Beaver Builder ×2, Kraken Spawnling ×1, Humpback Elder ×3, Open-Ocean Hermit Crab ×2 | Platypus Spur ×2, Muskrat Lodgekeeper ×1 *(relaxed)*, Snapstick Turtle ×3 *(relaxed)*, Water Vole ×2 |
| 4-5 The Drowned Colossus | boss | Open-Ocean Hermit Crab ×2, Humpback Elder ×1, Kraken Spawnling ×2 | Snapstick Turtle ×2, Muskrat Lodgekeeper ×1 *(relaxed)*, River Mink ×2 *(relaxed)* |

### Map 5: Gatorback Swamp  (`mw`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 5-1 Leech Pools | skirmish | Bog Behemoth ×3 | Crocodile Ambusher ×3 |
| 5-2 Toad Hollow | skirmish | Anhinga Spearbird ×2 | Grass Snake ×2 |
| 5-3 Cypress Roots | skirmish | Fire Ant Raft ×2 | Swamp Alligator ×2 |

### Map 6: Sable Swampmire  (`m8`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 6-1 Leech Bog | skirmish | Alligator Gar ×2 | Adder Ambusher ×2 |
| 6-2 Mire Ambush | skirmish | Raft Spider ×2 | Poison Dart Croaker ×2 |
| 6-3 Toad Chorus | skirmish | Willow-o'-Wisp ×2 | Newt Doctor ×2 |
| 6-4 Root Snare | skirmish | Swamp Alligator ×2 | Elder Tortoise ×2 |
| 6-5 Venomlord's Coil | elite | Carrion Beetle ×2 | Lotus Frog ×2 |
| 6-6 Crocodile Run | elite | Mire Witch-Heron ×2 | Camouflage Frog ×2 |
| 6-7 Adder Gauntlet | elite | Meadow Frog ×2 | Mayfly Dancer ×2 |

### Map 7: The Morel Hollow  (`mu`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 7-2 Grub Tunnels | skirmish | Tunnel Ant ×1 | Planarian Splitter ×1 |
| 7-3 Web Hollow | skirmish | Beetle Battering-Ram ×1, Bee Forager ×2 | Pine Marten ×1, Leafcutter Gardener ×2 |
| 7-4 Moonlit Gills | skirmish | Tunnel Ant ×3, Beetle Battering-Ram ×1 | Truffle Piglet ×3, Pine Marten ×1 |
| 7-5 The Oath Ring | elite | Beetle Battering-Ram ×2 | Pine Marten ×2 |
| 7-6 The Morel Monarch | boss | Bee Forager ×2 | Owl Nightwatch ×2 |

### Map 8: Caves & Alcoves  (`m4`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 8-1 Roost Flurry | skirmish | Stalactite Golem ×1 | Webspire Sentinel ×1 |
| 8-2 Glowworm Grotto | skirmish | Echo Screecher ×2 | Voltaic Eel ×2 |
| 8-3 Cinder Vents | skirmish | Giant Cave Huntsman ×2, Sulfur Cinder Moth ×2 | Grotto Lobster ×2, Nightshade Moth ×2 |
| 8-4 Echo Chamber | skirmish | Echo Screecher ×2 | Gallery Orb-Weaver ×2 |
| 8-5 Sulfur Vent Path | skirmish | Lantern Spark Fly ×2 | Vampire Bat ×2 |
| 8-6 Glowworm Deep | skirmish | Echo Screecher ×2 | Carrion Fly Swarm ×2 |
| 8-7 The Roost Above | elite | Cave Cricket ×2 | Star-nosed Mole ×2 |
| 8-8 The Stalactite Warden | boss | Glowworm Cluster ×2 | Quarry Mole ×2 |

### Map 9: The Kelp Mangroves  (`mk`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 9-1 Mudflat Skippers | skirmish | Riptide Eel ×2, Tide Pool Crab ×1, Guppy ×4 | Archerfish ×2, Shallows Fry ×1, Minnow Skitter ×4 |
| 9-2 Monitor Roots | skirmish | Guppy ×2, Gull Thief ×2, Tide Pool Crab ×2 | Minnow Skitter ×2, Shallows Fry ×2, Mangrove Mudskipper ×2 |
| 9-3 Kingfisher Dive | skirmish | Coral Current Eel ×2, Tide Pool Crab ×2 | Mangrove Kingfisher ×2, Minnow Skitter ×2 |
| 9-4 Kelp Curtains | skirmish | Tide Pool Crab ×4 | Mudpuppy ×4 |
| 9-5 Moray Den | elite | Electric Ray ×2, Tide Pool Crab ×2 | Fishing Cat ×2, Shallows Fry ×2 |
| 9-6 Drifting Shell | elite | Guppy ×1 | Baby Horned Capybara ×1 |
| 9-7 The Kelp Witch | boss | Electric Ray ×4, Gull Thief ×1, Tide Pool Crab ×2 | Gangrenous Leech ×4, Mangrove Mudskipper ×1, Minnow Skitter ×2 |

### Map 10: Coral Current  (`m7`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 10-1 Clownfish Shoal | skirmish | Glass Octopus ×1, Gull Thief ×2 | Swordfish Spearman ×1, Sulfur Vent Crab ×2 |
| 10-2 Moray Ambush | skirmish | Glass Octopus ×2, Gull Thief ×2 | Great Barracuda ×2, Parrotfish ×2 |
| 10-3 Tide Pool Line | skirmish | Abyss Lantern Squid ×2, Tide Pool Crab ×2, Minnow Skitter ×2 | Lion's Mane Jelly ×2, Parrotfish ×2, Electric Ray ×2 |
| 10-4 Riptide Channel | skirmish | Abyss Lantern Squid ×2, Gull Thief ×2 | Coral Reef Shark ×2, Sulfur Vent Crab ×2 |
| 10-5 Current Split | skirmish | Orca Vanguard ×2 | Kraken Spawnling ×2 |
| 10-6 Reef Shark Pack | elite | Mantis Shrimp ×2, Tide Pool Crab ×2 | Colossal Squid ×2 *(relaxed)*, Clownfish Scout ×2 |
| 10-7 Eel Nest | elite | Gull Thief ×2, Tide Pool Crab ×2 | Sulfur Vent Crab ×2, Clownfish Scout ×2 |
| 10-8 Sea Turtle Elder's Court | elite | Tide Pool Crab ×2 | Clownfish Scout ×2 |
| 10-9 The Orca Vanguard King | boss | Tide Pool Crab ×2, Gull Thief ×2 | Sulfur Vent Crab ×2, Clownfish Scout ×2 |

### Map 11: Eyrie Heights  (`m10`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 11-1 Goat Trail Runners | skirmish | Mountain Goat Climber ×4 | Apollo Butterfly ×4 |
| 11-4 Ridge Fork | skirmish | Chipmunk Stockpiler ×1 | Mountain Hare ×1 |
| 11-6 East Ledge | elite | Stonedrop Vulture ×2 | Balloon Archer ×2 |

### Map 12: The Briar Maze  (`mh`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 12-2 Quill Path | skirmish | Meadow Rabbit ×2 | Cunning Vixen ×2 |
| 12-3 Warren Run | skirmish | Meadow Rabbit ×2 | Mouse Sapper ×2 |
| 12-6 Rodent Court | elite | Meadow Rabbit ×2 | Seed-cache Squirrel ×2 |

### Map 13: The Redwood Deep  (`mr`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 13-2 Fox Run | skirmish | Silverback Brawler ×2 | Elder Willow ×2 *(relaxed)* |
| 13-3 Antler Grove | skirmish | Honey Badger Fury ×2 | Tasmanian Devil ×2 |
| 13-4 Boar Wallow | skirmish | Feral Tuskboar ×1 | Margay ×1 |
| 13-5 Badger Setts | elite | Honey Badger Fury ×2 | Swift Fox ×2 |
| 13-6 Grizzly Ridge | elite | Honey Badger Fury ×1 | Tasmanian Devil ×1 |
| 13-7 The King's Den | elite | Honey Badger Fury ×2 | Swift Fox ×2 |
| 13-8 The Stag-Lord | boss | Honey Badger Fury ×1 | Berserker Boar ×1 |

### Map 14: Savanna Reaches  (`m5`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 14-1 Zebra Stampede | skirmish | Termite Mound ×2 | Meerkat Burrower ×2 |
| 14-3 Howler Canopy | skirmish | Marching Elephant ×1 | Spitting Cobra ×1 |
| 14-5 Giraffe Vanguard | elite | Howler Monkey ×1 | Rabid Jackal ×1 |

### Map 15: The Long Grass  (`ml`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 15-2 Squire Road | skirmish | Squire's Mount ×2 | Stoat Cutthroat ×2 |
| 15-3 Stoat Ambush | skirmish | Buzzed Chipmunk ×2 | Shepherd ×2 |

### Map 16: The Pinewood Taiga  (`mt`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 16-3 Elk Crossing | skirmish | Timber Wolf Pack Leader ×2 | Frost Thistle Lynx ×2 |
| 16-4 Lynx Shadow | skirmish | Tundra Musk Ox ×2 | Boreal Elk ×2 |

### Map 17: Wolfsbane Tundra  (`m6`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 17-2 Frostbitten Pack | skirmish | Taiga Lynx ×3 | Spitting Spider ×3 |
| 17-4 Lynx Ambush | skirmish | Ringed Seal ×2 | Harbor Seal ×2 |
| 17-5 Musk Ox Bulwark | elite | Taiga Lynx ×2 | Frostmoon Howler ×2 |
| 17-7 Alpha Howler's Den | elite | Taiga Lynx ×2, Alpha Howler ×2 | Frostmoon Howler ×2, Permafrost Mammoth ×2 |

### Map 18: The Glass Dunes  (`md`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 18-1 Dune Jackals | skirmish | Cinder Gecko ×2 | Stonedrop Vulture ×2 |
| 18-3 Widow's Web | skirmish | Tarantula Hawk ×2 | Pale Oryx ×2 |
| 18-4 Sandstorm | skirmish | Obsidian Scorpion ×2, Cinder Gecko ×2 | Dust-devil Kestrel ×2, Dune Jackal ×2 |
| 18-6 Komodo Wallow | elite | Rabid Jackal ×2, Cinder Gecko ×2 | Antlion Pit ×2, Sandfish ×2 |
| 18-7 The Sand Widow Queen | boss | Cinder Gecko ×2 | Sandfish ×2 |

### Map 19: Ashen Spurn  (`m3`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 19-1 Badger Warband | skirmish | Badger Trench Digger ×2 | Fire Salamander ×2 |
| 19-2 Quill Line | skirmish | Ash Cloud Condor ×2 | Scree Goat ×2 |
| 19-3 Porcupine Bastion | elite | Chained Binturong ×2 | Glacier Wolf Pack ×2 |
| 19-5 Sky Scraper Sentinel | elite | Vampire Finch ×2 | Phoenix Fledgling ×2 |
| 19-6 The Frost Yeti King | boss | Scraper of Skies ×2 | Magma Titan ×2 *(relaxed)* |

### Map 20: The Sundered Peak  (`m11`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 20-3 Panther Ledge | skirmish | Warhorse Charger ×2 | Basalt Boar ×2 |
| 20-4 Shrine Steps | skirmish | Woodland Brawler ×2, Stable Colt ×1 | Ossuary Lammergeier ×2, Magma Wraith ×1 |
| 20-5 Cave Warlord's Guard | elite | Cataphract Destrier ×1 | Gorge Wyrm ×1 |
| 20-6 The Constrictor Sovereign | elite | Stable Colt ×2 | Magma Wraith ×2 |
| 20-7 The Blessed Avatar | elite | Stable Colt ×2, Warhorse Charger ×1, Cataphract Destrier ×2 | Cinder Skeleton ×2, Cave Bear ×1, Gorge Wyrm ×2 |
| 20-8 The Iron Cataphract | elite | Stable Colt ×2 | Bear Cub ×2 |

### Map 21: The Quiet Summit  (`m21`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 21-1 Thaw Path | skirmish | Snowshoe Hare ×2 | Pika Hoarder ×2 |
| 21-2 Tarn Shore | skirmish | Snowshoe Hare ×4 | Pika Hoarder ×4 |
| 21-3 Cloud Ledge | skirmish | Fumarole Ibex ×2 | Snow Leopard ×2 |
| 21-4 The Avalanche's Wake | elite | Snowshoe Hare ×2 | Pika Hoarder ×2 |
| 21-5 Snow Owl Parliament | elite | Snowshoe Hare ×2 | Pika Hoarder ×2 |
| 21-6 The Cathedral Eagle | boss | Snowshoe Hare ×2 | Pika Hoarder ×2 |

### Map 22: The Rimefire Caldera  (`m22`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 22-1 Snowmelt Switchbacks | skirmish | Badger Berserker ×2 | Ember Jackal ×2 |
| 22-2 Steam Vents | skirmish | Magma Titan ×4 | Gorge Wyrm ×4 *(relaxed)* |
| 22-4 Hailstone Ridge | skirmish | Magma Titan ×4 | Pyroclast Wyrm ×4 |
| 22-5 The Geyser Field | skirmish | Ash Moth ×2 | Cinder Hornet ×2 |

### Map 23: The Goldfeather Siege  (`m23`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 23-1 The Picket Line | skirmish | Warhorse Charger ×2 | Balloon Archer ×2 |
| 23-2 Trench Works | skirmish | Badger Sapper ×2, Stable Colt ×2 | Balloon Archer ×2, Howdah Archers ×2 |
| 23-3 Elephant Road | skirmish | Stable Colt ×4, Chipmunk Hoarder ×2 | Howdah Archers ×4, Balloon Archer ×2 |
| 23-4 Siege Camp | skirmish | Chipmunk Hoarder ×2 | Mouse Sapper ×2 |
| 23-5 Under the Walls | skirmish | Talon Archer ×2, Stable Colt ×2 | Werebadger ×2, Howdah Archers ×2 |
| 23-6 The Elephant Line | elite | Warhorse Charger ×2, Pack Mule ×2, Chipmunk Hoarder ×2 | Badger Trench Digger ×2, Mouse Sapper ×2, Balloon Archer ×2 |
| 23-7 The Barbican | elite | Stable Colt ×4 | Howdah Archers ×4 |
| 23-8 Marshal Tuskwell | boss | Pack Mule ×3, Warhorse Charger ×2, Chipmunk Hoarder ×2, Stable Colt ×2 | Mouse Sapper ×3, Badger Trench Digger ×2, Balloon Archer ×2, Howdah Archers ×2 |

### Map 24: Goldfeather Keep  (`m24`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 24-3 The Counting House | skirmish | Rodent King ×1 | Truce Heron ×1 |

### Clovermead (side map of Map 1)  (`mq`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 1-A-1 Clover Patch | skirmish | Ash Cloud Condor ×2 | Stag Beetle ×2 |
| 1-A-2 Bee Lines | skirmish | Ash Cloud Condor ×1 | Lucky Hopper ×1 |
| 1-A-3 Puddle Hop | skirmish | Puddle Hopper ×1 | Jay Pilferer ×1 |

### Lilypad Reach (side map of Map 2)  (`mp`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 2-A-1 Lily Hop | skirmish | Silver Minnow ×2 | Shallows Fry ×2 |
| 2-A-2 Duck Row | skirmish | Silver Minnow ×3, Blind Cave Fish ×2 | Shallows Fry ×3, Mangrove Mudskipper ×2 |
| 2-A-3 Beaver Dam | skirmish | Blind Cave Fish ×2 | Mayfly Dancer ×2 |
| 2-A-5 Croaker Chorus | elite | Silver Minnow ×1, Blind Cave Fish ×2 | Shallows Fry ×1, Mangrove Mudskipper ×2 |
| 2-A-7 The Lodge Matriarch | boss | Silver Minnow ×2, Blind Cave Fish ×2 | Mudpuppy ×2, Mayfly Dancer ×2 |

### Basalt Foundry (side map of Map 19)  (`m9`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 19-A-5 Ashfall Line | skirmish | Beetle Battering-Ram ×2 | Echidna Quillshot ×2 |
| 19-A-8 Titan's Shadow | elite | Beetle Battering-Ram ×1 | Ash Cloud Condor ×1 |
| 19-A-9 The Pyroclast Wyrm | elite | Beetle Battering-Ram ×3 | Echidna Quillshot ×3 |
| 19-A-10 The Phoenix Ember King | boss | Beetle Battering-Ram ×2 | Ash Cloud Condor ×2 |

### The Sunken Depths (side map of Map 10)  (`mj`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 10-A-2 The Drowned Deck | skirmish | Tide Pool Crab ×2, Minnow Skitter ×2 | Clownfish Scout ×2, Parrotfish ×2 |
| 10-A-3 Cargo Hold | skirmish | Gull Thief ×2 | Sulfur Vent Crab ×2 |
| 10-A-5 The Ferry's Last Passenger | boss | Tide Pool Crab ×2, Gull Thief ×2 | Clownfish Scout ×2, Sulfur Vent Crab ×2 |

### Smugglers' Grotto (side map of Map 2)  (`mg`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Mycelium Deep (side map of Map 7)  (`mz`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 7-A-1 Root Cellar | skirmish | Gorge Wyrm ×1 | Fungal Colossus ×1 |

### The Canopy (side map of Map 14)  (`my`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 14-A-1 Dart Frogs | skirmish | Puddle Hopper ×2 | Slow Loris ×2 |

### Eye of the Volcano (side map of Map 20)  (`me`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### Volcano Lair (side map of Map 20)  (`mx`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Sunken Grove (side map of Map 5)  (`ms`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Glimmer Depths (side map of Map 8)  (`mn`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Aerie Vault (side map of Map 11)  (`mv`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Ice Hollow (side map of Map 17)  (`mi`)

| Fight | Kind | Cards out | Cards in |
|---|---|---|---|
| 17-A-3 The Rime Hall | skirmish | Taiga Lynx ×2 | Frostmoon Howler ×2 |

### The Old Bramble (side map of Map 0)  (`mo`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

### The Pale Desert (side map of Map 18)  (`mpd`)

No change needed: its fights already hold its recommended cards and nothing off-biome.

## Not placed

| Map | Card | Why |
|---|---|---|
| Map 3 Gannet Cliffs | The Gannet Queen | Heroic leader card, this map's boss reward; above the elite / boss rarity cap for an enemy |
| Map 5 Gatorback Swamp | Old Snapjaw | Heroic leader card, the Map 5 boss reward |
| Map 6 Sable Swampmire | The Heron Hag | Heroic leader card, the Map 6 boss reward |
| Map 8 Caves & Alcoves | Echo Matriarch | Heroic leader card, the Map 8 boss reward |
| Map 14 Savanna Reaches | Pride Queen | Heroic leader card, the Map 14 boss reward |
| Map 19 Ashen Spurn | Yeti Chieftain | Heroic leader card, a Map 19 reward |
| Map 21 The Quiet Summit | The Thistle Baron | Heroic, held (`awaitingSource`); above the Map 21 rarity cap |
| Map 0 Bramblewood Outskirts | Farm Dog | Map 0's decks are the owner's own edits and stay as they are |
| Map 0 Bramblewood Outskirts | Terrier Pup | Map 0's decks are the owner's own edits and stay as they are |
| Map 0 Bramblewood Outskirts | Sergeant Bramblefox | Map 0's decks are the owner's own edits and stay as they are |
| Map 0 Bramblewood Outskirts | Acorn Chipmunk | Map 0's decks are the owner's own edits and stay as they are |
| Map 21 The Quiet Summit | The Thistle Baron | Heroic, held (`awaitingSource`); above the Map 21 rarity cap |
| Maps 5, 7 | Spring Rain, Full Moon (field cards) | Field cards are not creatures; enemy decks hold creatures only |
| Maps 25-28 | all their existing cards (Rainforest Floor 15, Ant Empire 7, Carrion Moors 6, Stormcoast 6) | These maps have no fights yet (`Reserved`); the held cards wait for the owner to place them |

## Cards to make

Ideas in the recommendations doc that are not cards yet (not created here). Each one is a plain suggestion from `docs/map-recommendations-2026-10-21.md`.

| Map | Idea | Notes from the recommendations |
|---|---|---|
| 0 Bramblewood Outskirts 🌲 | Hedgerow Sparrow | a plain 2/5 bird that only previews Flying when an enemy has it |
| 0 Bramblewood Outskirts 🌲 | Garden Toad | plain 4/6 |
| 1 Thistlewood 🌼 | Hazel Dormouse Forager | plain, a Lumber-cost 1 version of the Dormouse to show paying Lumber |
| 1 Thistlewood 🌼 | Bramble Woodlouse | Thorns 1 on a 1/9 body, the Thorns introduction on an enemy |
| 2 Pebble Beach 🏖️ | Oystercatcher | a plain shore bird, Flying 3/5 |
| 2 Pebble Beach 🏖️ | Shore Crab Brawler | Crab Claws on a common 3/9 |
| 3 Gannet Cliffs 🦅 | Northern Gannet | Skyfall 2, the map's namesake, common |
| 4 Sunken Hollow 🌊 | Water Shrew Darter | Evasive and Pounce together on a 2/6, the pair's answer card |
| 21 The Quiet Summit 🏔️ | Irish Elk | extinct: Megaloceros, a stronger Boreal Elk with Sweep + Mountain Climber |
| 21 The Quiet Summit 🏔️ | Cave Lion | extinct: a stronger Pride Queen, Pack Leader + Pounce |
| 21 The Quiet Summit 🏔️ | Lammergeier Elder | a stronger Ossuary Lammergeier, Flying + Skyfall |
| 22 The Rimefire Caldera 🌨️ | Woolly Rhino | extinct: a stronger Siege Rhino for the cold, Armor + Siege |
| 23 The Goldfeather Siege ⚔️ | Glyptodont | extinct: an armadillo the size of a cart, a stronger Armadillo Guard with Armor + Shield Call |
| 23 The Goldfeather Siege ⚔️ | Elasmotherium | extinct: the "unicorn" rhino, a stronger Siege Rhino with Pierce + Siege |
| 24 Goldfeather Keep 🏰 | Moa Guard | extinct: a stronger Goose Sentry, Guardian-type body |
| 24 Goldfeather Keep 🏰 | Dodo Steward | extinct: a plain heavy bird with Bounty, the keep's treasurer |
| 26 The Ant Empire 🐜 | Army Ant Column | a stronger Worker Ant with Pack + Rage |
| 26 The Ant Empire 🐜 | Meganeura | extinct: the giant dragonfly, Flying + Quick |
| 26 The Ant Empire 🐜 | Arthropleura | extinct: the giant millipede, Armor + Sweep |
| 27 The Carrion Moors 🦴 | Cave Hyena | extinct: a stronger Dust Hyena, Executioner + Pack |
| 27 The Carrion Moors 🦴 | Haast's Eagle | extinct: a giant eagle, Flying + Pounce |
| 27 The Carrion Moors 🦴 | Bog Body Heron | a stronger Mire Witch-Heron, Poison + Nocturnal |
| 28 Stormcoast ⛈️ | Great Auk | extinct: a heavy flightless seabird, Tide + Armor |
| 28 Stormcoast ⛈️ | Steller's Sea Cow | extinct: a vast sea-cow, a stronger Mangrove Manatee with Tide + Regeneration |
| 28 Stormcoast ⛈️ | Storm Petrel Flock | Flying + Quick |
| 28 Stormcoast ⛈️ | Thunder-ray | a stronger Electric Ray, Chain Lightning + Tide |

**26 cards to make** (Maps 0-2: 6, Map 3-4: 2, Maps 21-24: 8, Maps 26-28: 10).

## New PvP / Async Arena seeded decks

Where they live: `THEMED_GHOSTS` in `bramblewood-ghosts.js`. They join the seeded top-up of the Async Arena stage pools (`buildStagePool`) and the PvP strangers of each rating tier (`seedPvpStrangers`), first, ahead of the generated decks; the offline Raid's stand-in raiders are unchanged. Each is 20 cards, within the rarity copy limits, built only from cards a player can own (a pack, a map reward or Base; no `awaitingSource`, no raid-only, no Easter egg). PvP tiers use stages 0, 1, 2, 4, 5 and 6, so the two stage-3 decks appear in the Async Arena only. The stage of each deck was set from a short headless run against the generated ghosts of every stage (not part of the test suite).

| Stage | Deck (ghost name) | Theme | Cards |
|---|---|---|---|
| 0 | `beach-tide` (Brine the Beachcomber) | Beach tide: gulls, crabs, seals and snails of the shingle | Garden Snail ×3, Gull Thief ×3, Tide Pool Crab ×3, Fiddler Crab Swarm ×3, Shallows Fry ×2, Harbor Seal ×2, Puffin Diver ×2, Conch Crawler ×2 |
| 0 | `whimsy` (Fizz the Prankster) | Whimsy parade: the strangest, silliest creatures in the game | Crossed-Eyes ×3, Trash Panda Trickster ×3, Fleetfoot'd ×3, Sheep ×2, Wrong-Way Salmon ×2, Teatime Toad ×2, Inside-Out Hedgehog ×2, Ferry Toll-Frog ×3 |
| 1 | `cave-dwellers` (Echo Sedge) | Cave dwellers: bats, moles and things that never see the sun | Cave Bat Swarm ×3, Baby Bat ×3, Cave Cricket ×2, Cave Pseudoscorpion ×3, Cave Flitter ×2, Star-nosed Mole ×3, Echo Screecher ×2, Cave Swiftlet ×2 |
| 1 | `dune-raiders` (Dune Teasel) | Desert: jackals, scorpions and glass-dune hunters | Rabid Jackal ×3, Dust Hyena ×3, Hoopoe Herald ×3, Glasswing Moth ×2, Sandfish ×2, Antlion Pit ×2, Horned Lizard ×2, Pale Oryx ×3 |
| 1 | `gatorback-choir` (Fen Nettle) | Swamp: gators, vipers and frogs of the bog | Caiman Hatchling ×3, Snapper Hatchling ×3, Grass Viper ×3, Swamp Alligator ×3, Mangrove Mudskipper ×2, Booming Bittern ×2, Lotus Frog ×2, Constrictor Coil ×2 |
| 2 | `hummingbird-flyers` (Ruby Wren) | Hummingbird flyers: the nectar squadron | Crimson Recruit ×3, Cobalt Fledgling ×3, Nectar Sipper ×3, Violet Vane Fletcher ×3, Sunfeather Scout ×2, Gold-throated Acolyte ×2, Petal Fletcher ×2, Hummingbird Needler ×2 |
| 2 | `otter-faction` (Rivergate Rowan) | Otter faction: the Rivergate guard and its river folk | Otter Kit ×3, Otter Paddler ×3, Otter Netmender ×3, Otter Ferryman ×2, Shellwright Apprentice ×2, Otter Flag Bearer ×2, Otter Angler ×2, Beaver Builder ×3 |
| 3 | `talon-wing` (Kestrel Hollis) | Raptors: hawks, eagles and kestrels | Field Crow ×3, Raven Scout ×3, Echo Keeper ×2, Night Watchman ×2, Owl Fletcher ×2, Red-billed Chough ×2, Peregrine Stooper ×2, Hawk Arrowkeeper ×2, Golden Eagle Diver ×2 |
| 3 | `thorn-hedge` (Bramble Quill) | Thornbound hedge: hedgehogs, porcupines and the briar maze | Hedgehog Scout ×3, Bramble Hoglet ×3, Porcupine Roller ×3, Inside-Out Hedgehog ×2, Quillguard ×2, Thorn Shrike ×2, Seed-cache Squirrel ×2, Mouse Sapper ×3 |
| 4 | `ashfall-legion` (Cinder Marlow) | Volcano: salamanders, wyrms and ember hunters | Cinder Stoker ×3, Cinder Gecko ×3, Ashbone Ghoul ×2, Fire Salamander ×3, Magma Salamander ×3, Ember Jackal ×2, Rimefire Salamander ×1, Pyroclast Wyrm ×1, Phoenix Fledgling ×1, Fire Hawk ×1 |
| 4 | `deep-tide` (Abyssal Aster) | Ocean: cephalopods, jellies and the deep reef | Sea Hare ×3, Krill Swarm ×3, Tide Spirit ×2, Cuttlefish Illusionist ×2, Lion's Mane Jelly ×2, Blue-ringed Octopus ×3, Octopus Tactician ×2, Nautilus Drifter ×2, Colossal Squid ×1 |
| 5 | `frost-pack` (Frostbite Fern) | Frost pack: wolves, foxes and ermine of the tundra | Snow Ermine ×3, Frost Hare Sprinter ×2, Lemming Swarm ×2, Snowshoe Hare ×2, Mountain Hare ×2, Timber Wolf Pack Leader ×2, Wolf Pack Runner ×2, Arctic Fox Raider ×2, Alpha Howler ×1, Lone Grey Wolf ×1, Frostmoon Howler ×1 |
| 5 | `redwood-charge` (Redwood Rook) | Redwood charge: bears, boars and stags | Bear Cub ×3, Fox Kit ×3, Tusked Vanguard ×3, Fawn Scout ×2, Grizzly Vanguard ×2, Stag Knight ×2, Berserker Boar ×2, Bramblewood Lynx ×2, Elderhorn Monarch ×1 |
| 6 | `ant-colony` (Marching Mags) | Ants swarm: workers, scouts and soldiers in numbers | Worker Ant ×3, Ant Scout ×3, Forager Ant ×3, Soldier Ant ×2, Ant Warrior ×2, Fire Ant Raft ×2, Tunnel Ant ×3, Leafcutter Gardener ×2 |
| 6 | `goldfeather-guard` (Gilded Juniper) | Goldfeather guard: the Magnate's duck knights | Pond Duck ×2, Duckling ×3, Duckling Squadron ×2, Pond Paddler ×2, Tax-Collector Teal ×2, Goose Sentry ×2, Mallard Halberdier ×2, Mallard Marauder ×1, Gilded Swan Knight ×1, Iron Warden ×1, Werebadger ×2 |
| 6 | `hive-swarm` (Honeycomb Hazel) | Hive swarm: bees, wasps and butterflies | Honey Bee ×3, Bee Sentry ×3, Bee Forager ×3, Paper Wasp ×3, Bee Knight ×3, Glasswing Butterfly ×2, Tarantula Hawk ×2, Apollo Butterfly ×1 |

**16 decks**: 2 at stage 0, 3 at stage 1, 2 at stage 2, 2 at stage 3, 2 at stage 4, 2 at stage 5, 3 at stage 6.

Decision for the owner: the "Easter-egg fun deck" is built from the silliest ownable cards (the Whimsy Parade: Crossed-Eyes, Trash Panda Trickster, Fleetfoot'd, Sheep and others). The real Easter eggs are not obtainable and the Codex shows them masked, so a ghost deck would reveal them; say if you want them in a ghost deck anyway.
