# THEME1: unique cards per map, the 8-11 cut and the mix (proposal, 2026-10-28)

The owner's balancing plan (10-28 21:40), steps 1 and 2: *"uniquely identifying unique cards for each map"* and *"cutting it down to that 8-11 if too big. Note 3-5 cards can be from previous maps, no issue."* With step 4's mix in view: *"A map should have a range of cards that cost high, and cost generators and normal creatures."*

**A proposal. Nothing in `canonical/` changes.** Data: `docs/balance/theme1-proposal-2026-10-28.json`; built by `tools/theme1_proposal_2026_10_28.py`; shown in the hub's 🗺️ Map cards tab under **Proposal**. Decision: THEME1-1.

## How it was built

- Every card gets **one** home: the map whose theme it fits best (its biomes in `unit-themes.json` against the map's), with its present home (its pack map or skirmish map), its place on the list now, the fights that play it and its showcase / first-clear-pack label as tie-breakers. Highest scores are placed first; a card bumped from a full map goes to its next-best map with room.
- Hard limits: a card is never on a map before it is first obtainable (a pack tier's first map: Pack 2 from Map 7, Pack 3 from Map 14), never past the rarity the map reveals. A skirmish reward stays on its own map.
- Unique cap: 8 on a main map; then 3-5 carried cards from earlier maps, 11 in all. Map 0 carries Base cards.
- Side maps (owner 10-28 21:49: *"submaps should have only 1-3 unique cards ... how obviously supposedly a full dwelve into a new location or just additional challenges"*): 3 unique for a full delve, 1 for additional challenges, 2 (a placeholder) where we ask; the rest of the list (8 in all) is carried and parent-map cards. A card that loses its side-map home goes to the parent map if it fits and has room, otherwise pack only or no home yet. A side map's skirmish rewards stay, even over its number.
- The mix: high cost = Lumber 2+ or any Stone / Metal cost; a cost generator = a card that makes Lumber, Stone or Metal (Stockpile, Milling, Quarry, Prospector, Pearl Bed, On Ready / On Kill Lumber ...). Where a map had none, a bumped candidate with one was swapped in, or a carried card brings it.
- The tutorial and the endless dungeons (mtut, mm, muc, mlb) keep their lists.
- A card whose `unit-themes.json` biome misfits its present home stays eligible there (it scores lower); several such tags look wrong (the Farm Dog is "village & keep"), so step 1 also exposes tagging to fix.

### Side maps: delve or challenge (the owner corrects this table)

| Side map | Opens at | Call | Unique | Why |
|---|---|---|---|---|
| Lilypad Reach | 6 | Full delve | 3 | A pond of its own (river, lily pads, beaver dams) off a beach map, 7 fights: a new biome, not more of the beach. |
| Smugglers' Grotto | 7 | **Ask owner** | 2 | A sea cave under Pebble Beach with its own darkness, but only 4 fights and half coast: a new place or the beach's extra challenge? |
| The Mycelium Deep | 8 | Additional challenges | 1 | Under the Morel Hollow, the same fungal biome, 5 fights: more of the parent's hollow. |
| The Sunken Depths | 11 | **Ask owner** | 2 | A sunken ferry with its own pitch dark and Crushing Depths, but the same reef biome as Coral Current, 5 fights. |
| Clovermead | 12 | **Ask owner** | 2 | A meadow opening at Map 12 off Thistlewood (Map 1) with its own Thunderstorm, but the same meadow biome, 5 fights. |
| The Sunken Grove | 13 | Additional challenges | 1 | The swamp swallowing an old forest: the same swamp biome as Gatorback Swamp, 4 fights. |
| The Aerie Vault | 15 | Additional challenges | 1 | The oldest nests on the same mountain as Eyrie Heights, 4 fights. |
| The Glimmer Depths | 16 | **Ask owner** | 2 | Deeper in the same caves as Caves & Alcoves, 4 fights, but a new crystal / shiny theme with its own Mirage. |
| The Canopy | 18 | Full delve | 3 | The rainforest roof: a jungle biome, not the savanna of its parent, with its own High Canopy. |
| The Pale Desert | 19 | Full delve | 3 | Its own biome (the pale desert past the glass), 9 fights. |
| Eye of the Volcano | 20 | **Ask owner** | 2 | Inside the Sundered Peak's crater, same volcanic biome, but 7 fights and its own people (the dead at the fire). |
| Volcano Lair | 20 | Additional challenges | 1 | The Sundered Peak's own finale: the dragon's lair and the world boss, 4 fights. |
| The Old Bramble | 21 | Additional challenges | 1 | A return to the Outskirts' thorns for a late challenge, 4 fights. |
| The Ice Hollow | 21 | Additional challenges | 1 | An ice cave under Wolfsbane Tundra, the same tundra biome, 4 fights. |
| Basalt Foundry | 23 | Full delve | 3 | A furnace city of its own (10 fights, the metal and fire workshops), a full map in size. |

## The numbers (the owner's worry: "our pack size and unique card total")

| | Now | Proposed |
|---|---|---|
| List entries (40 lists) | 613 | 395 |
| Different cards on a list | 509 | 232 (229 unique homes + 3 carried only) |
| Skirmish rewards among the unique | | 108 |
| Pack cards (Packs 1-4) that become **pack only** | | 341 |
| Creatures with **no home yet** (no source, on no list) | | 94 |

| Pack | Maps | Cards | On a list now | Unique on a map | (in its range) | Carried only | Pack only |
|---|---|---|---|---|---|---|---|
| Hedgerow Pouch (tier 1) | Maps 0-6 | 145 | 87 | 32 | 30 | 0 | **113** |
| Tidemire Chest (tier 2) | Maps 7-13 | 154 | 132 | 35 | 34 | 0 | **119** |
| Highcrest Case (tier 3) | Maps 14-20 | 126 | 111 | 33 | 31 | 0 | **93** |
| Pack 4 (tier 4) | Maps 21-27 | 33 | 32 | 17 | 17 | 0 | **16** |
| Faction pool (tier 11) | - | 53 | 3 | 0 | 0 | 0 | **53** |
| Mystery Booster (tier 99) | - | 11 | 0 | 0 | 0 | 0 | **11** |

Plainly: 25 main maps x 8 unique + 15 side maps x 1-3 is about 229 homes, and about 108 of them are skirmish rewards. Packs 1-4 hold 458 cards. So roughly 341 pack cards end up in a pack but on no map. Either the packs shrink to the map lists (each pack about the cards its 7 maps show), or "pack only" is a real class of card (found only in packs), or the caps grow. That is decision THEME1-1's main question.

## Per map, in road order

| Map | No | Now | Proposed | Unique | Carried | Cut | Added | High / Gen / Plain | Avg cost | Mix flags |
|---|---|---|---|---|---|---|---|---|---|---|
| Bramblewood Outskirts | 0 | 25 | 11 | 8 | 3 | 18 | 4 | 1 / 1 / 9 | 0.27 | - |
| Tutorial | 0 | 18 | kept | | | | | | | |
| Thistlewood | 1 | 14 | 11 | 8 | 3 | 6 | 3 | 1 / 1 / 9 | 0.36 | - |
| Pebble Beach | 2 | 15 | 11 | 8 | 3 | 8 | 4 | 1 / 3 / 7 | 0.55 | - |
| Gannet Cliffs | 3 | 15 | 11 | 8 | 3 | 8 | 4 | 1 / 1 / 9 | 0.64 | - |
| Sunken Hollow | 4 | 16 | 11 | 8 | 3 | 8 | 3 | 1 / 2 / 8 | 0.64 | - |
| Gatorback Swamp | 5 | 21 | 11 | 8 | 3 | 14 | 4 | 3 / 2 / 6 | 0.91 | - |
| Sable Swampmire | 6 | 19 | 11 | 8 | 3 | 11 | 3 | 3 / 1 / 7 | 1.09 | - |
| &nbsp;&nbsp;↳ Lilypad Reach | 6 | 20 | 8 | 3 | 5 | 16 | 4 | 2 / 2 / 5 | 1.00 | - |
| Murgle Mayhem | 6 | 6 | kept | | | | | | | |
| The Morel Hollow | 7 | 17 | 11 | 8 | 3 | 9 | 3 | 2 / 2 / 7 | 0.91 | - |
| &nbsp;&nbsp;↳ Smugglers' Grotto | 7 | 12 | 8 | 2 | 6 | 10 | 6 | 2 / 2 / 4 | 0.62 | - |
| Caves & Alcoves | 8 | 26 | 11 | 8 | 3 | 19 | 4 | 2 / 2 / 7 | 0.82 | - |
| &nbsp;&nbsp;↳ The Mycelium Deep | 8 | 10 | 8 | 1 | 7 | 9 | 7 | 1 / 1 / 6 | 0.75 | - |
| The Kelp Mangroves | 9 | 22 | 11 | 8 | 3 | 15 | 4 | 2 / 2 / 8 | 0.82 | - |
| Coral Current | 10 | 23 | 11 | 8 | 3 | 16 | 4 | 2 / 2 / 7 | 1.18 | - |
| Eyrie Heights | 11 | 14 | 11 | 8 | 3 | 6 | 3 | 1 / 1 / 9 | 0.82 | - |
| &nbsp;&nbsp;↳ The Sunken Depths | 11 | 12 | 8 | 2 | 6 | 8 | 4 | 3 / 1 / 4 | 1.62 | - |
| The Undercroft | 11 | 93 | kept | | | | | | | |
| The Briar Maze | 12 | 16 | 11 | 8 | 3 | 8 | 3 | 1 / 1 / 9 | 0.45 | - |
| &nbsp;&nbsp;↳ Clovermead | 12 | 21 | 8 | 2 | 6 | 18 | 5 | 1 / 1 / 6 | 0.50 | - |
| The Redwood Deep | 13 | 18 | 11 | 8 | 3 | 11 | 4 | 2 / 2 / 7 | 0.91 | - |
| &nbsp;&nbsp;↳ The Sunken Grove | 13 | 9 | 8 | 1 | 7 | 7 | 6 | 1 / 1 / 6 | 0.50 | - |
| Savanna Reaches | 14 | 15 | 11 | 8 | 3 | 8 | 4 | 2 / 3 / 7 | 0.73 | - |
| The Long Grass | 15 | 19 | 11 | 8 | 3 | 10 | 2 | 1 / 2 / 8 | 0.91 | - |
| &nbsp;&nbsp;↳ The Aerie Vault | 15 | 7 | 8 | 1 | 7 | 6 | 7 | 1 / 1 / 6 | 0.88 | - |
| The Pinewood Taiga | 16 | 11 | 11 | 8 | 3 | 3 | 3 | 3 / 1 / 7 | 0.91 | - |
| &nbsp;&nbsp;↳ The Glimmer Depths | 16 | 15 | 8 | 2 | 6 | 13 | 6 | 1 / 2 / 5 | 0.75 | - |
| Wolfsbane Tundra | 17 | 14 | 11 | 8 | 3 | 7 | 4 | 2 / 1 / 8 | 1.00 | - |
| The Glass Dunes | 18 | 16 | 11 | 8 | 3 | 8 | 3 | 1 / 2 / 8 | 1.09 | - |
| &nbsp;&nbsp;↳ The Canopy | 18 | 16 | 8 | 3 | 5 | 13 | 5 | 1 / 1 / 6 | 0.75 | - |
| Ashen Spurn | 19 | 12 | 11 | 8 | 3 | 5 | 4 | 2 / 1 / 8 | 1.27 | - |
| &nbsp;&nbsp;↳ The Pale Desert | 19 | 18 | 8 | 3 | 5 | 14 | 4 | 1 / 1 / 6 | 1.00 | - |
| The Sundered Peak | 20 | 17 | 11 | 8 | 3 | 9 | 3 | 1 / 1 / 9 | 1.00 | - |
| &nbsp;&nbsp;↳ Eye of the Volcano | 20 | 11 | 8 | 2 | 6 | 7 | 4 | 1 / 1 / 6 | 0.88 | - |
| &nbsp;&nbsp;↳ Volcano Lair | 20 | 14 | 8 | 2 | 6 | 10 | 4 | 4 / 1 / 3 | 1.38 | 2 unique over its 1 (skirmish rewards) |
| The Quiet Summit | 21 | 9 | 11 | 8 | 3 | 0 | 2 | 2 / 2 / 7 | 0.82 | - |
| &nbsp;&nbsp;↳ The Old Bramble | 21 | 9 | 8 | 1 | 7 | 8 | 7 | 1 / 1 / 6 | 0.50 | - |
| &nbsp;&nbsp;↳ The Ice Hollow | 21 | 11 | 8 | 1 | 7 | 9 | 6 | 1 / 1 / 6 | 1.00 | - |
| The Rimefire Caldera | 22 | 13 | 11 | 8 | 3 | 4 | 2 | 3 / 1 / 7 | 1.36 | - |
| The Long Burrow | 22 | 6 | kept | | | | | | | |
| The Goldfeather Siege | 23 | 12 | 11 | 8 | 3 | 5 | 4 | 5 / 2 / 4 | 1.45 | - |
| &nbsp;&nbsp;↳ Basalt Foundry | 23 | 19 | 8 | 3 | 5 | 15 | 4 | 2 / 1 / 5 | 1.00 | - |
| Goldfeather Keep | 24 | 10 | 11 | 8 | 3 | 1 | 2 | 3 / 3 / 7 | 1.18 | - |

### Map 0: Bramblewood Outskirts (m1)

**Theme.** Meadow & woodland, River & pond. The first tree-line past the castle walls — mostly scouts and stragglers. Field: no field effect. New in its fights: Flying, Armor, Swarm, Quick.

**Unique (8).**
- Chipmunk Skirmisher (Common, map 0-1, cost 0): Meadow & woodland; skirmish reward of 0-1; also fits Thistlewood, Clovermead, The Old Bramble
- Terrier Pup (Common, map 0-4, cost 0): Meadow & woodland; skirmish reward of 0-4; also fits Thistlewood, Clovermead, The Old Bramble
- Beaver Lumberjack (Common, none, cost 0) 🪵: hand call: Stockpile was built for this beaver (ENG9); Map 0 has the river, and "Beavers build for the Legion" (lore bible): Map 0's cost generator; moved from Basalt Foundry; also fits Sunken Hollow, Lilypad Reach, Ashen Spurn, The Sundered Peak
- House Cat (Common, pack 1, cost 0): Meadow & woodland; also fits Thistlewood, Clovermead, The Old Bramble, The Goldfeather Siege
- Tomcat (Common, pack 1, cost 0): Meadow & woodland; also fits Thistlewood, Clovermead, The Old Bramble
- Box Turtle (Common, pack 1, cost 0): Meadow & woodland; moved from Sunken Hollow; also fits Thistlewood, Sunken Hollow, Lilypad Reach, Clovermead
- Chipmunk Cavalry (Common, pack 1, cost 1): Meadow & woodland; added; also fits Thistlewood, Clovermead, The Old Bramble
- Ant Hill (Common, none, cost 2)  💰cost 2: Meadow & woodland; brought in for the mix (high cost); added; also fits Thistlewood, Clovermead, The Old Bramble

**Carried (3).** Duck Paddler (from base); Ant Scout (from base); Bee Forager (from base)

**Cut (18).**
- Duckling (Starter): Base card
- Honey Bee (Starter): Base card
- Pond Duck (Starter): Base card
- Crossed-Eyes (Starter): Base card
- Garden Snail (Starter): Base card
- Silver Minnow (Starter): Base card
- Bee Sentry (Starter): Base card
- River Carp (Starter): Base card
- Forager Ant (Common): Base card
- Cottontail (Starter): Base card
- Meadow Rabbit (Starter): Base card
- Chipmunk Forager (Starter): Base card
- Fox Kit (Common): pack only (Pack 2)
- Otter Kit (Starter): Base card
- Beetle Grunt (Common): pack only (Pack 1)
- Cobalt Fledgling (Starter): Base card
- Farm Dog (Common): pack only (Pack 1)
- Paper Wasp (Common): pack only (Pack 1)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 0.27 (unique 0.38); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 3 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Beaver Lumberjack, Ant Hill), on 4 lists (Box Turtle, Ant Hill).

### Side map: Tutorial (opens at 0, side of Bramblewood Outskirts)

**Theme.** Meadow & woodland. Where every road starts. Come back later: the last three fights here are not gentle. Field: no field effect. New in its fights: Diurnal, Bounty, Dynamite, Counterattack.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 18 cards.

### Map 1: Thistlewood (mf)

**Theme.** Meadow & woodland. Thistle and fern under the first big trees — hedgerows, burrows and a lot of small, busy things. Field: Undergrowth. New in its fights: Bounty, Keen Sense, Lumberjack.

**Unique (8).**
- Cricket Drummer (Common, map 1-1, cost 0): Meadow & woodland; skirmish reward of 1-1; also fits Clovermead, The Old Bramble
- Badger Lumberjack (Uncommon, map 1-5, cost 1) 🪵: Meadow & woodland; skirmish reward of 1-5; also fits Clovermead, The Old Bramble
- Dormouse (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Field Mouse (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Field Vole (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Bramble Sprout (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Hedgerow Shrew (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Robin Redbreast (Uncommon, pack 1, cost 0): Meadow & woodland; also fits Clovermead, The Old Bramble

**Carried (3).** Ant Hill (from Bramblewood Outskirts, added); Box Turtle (from Bramblewood Outskirts, added); Chipmunk Cavalry (from Bramblewood Outskirts, added)

**Cut (6).**
- Compost Grub (Common): pack only (Pack 1)
- Harvest Mouse (Starter): Base card
- Meadow Frog (Common): Base card
- Woodcock Lookout (Common): pack only (Pack 1)
- Slow-worm (Common): pack only (Pack 1)
- Briarback Hedgehog (Common): pack only (Pack 1)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 0.36 (unique 0.12); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill, Box Turtle).

### Map 2: Pebble Beach (mb)

**Theme.** Coast & shore. Where the fields run out into sand — rock pools, gulls and things in shells. Field: Tide. New in its fights: Tide, Crab Claws, Shield, Shell.

**Unique (8).**
- Conch Herald (Uncommon, map 2-4, cost 1): Coast & shore; skirmish reward of 2-4; also fits Smugglers' Grotto
- Fiddler Crab Swarm (Common, map 2-1, cost 0): Coast & shore; skirmish reward of 2-1; also fits Smugglers' Grotto, The Kelp Mangroves
- Grey Seal Bull (Uncommon, map 2-5, cost 1): Coast & shore; skirmish reward of 2-5; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- The Old Shell (Heroic, map 2-5, cost 1): its skirmish reward; skirmish reward of 2-5; moved from Pebble Beach
- Open-Ocean Hermit Crab (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- Pincushion Urchin (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- Gull Thief (Common, pack 1, cost 0) 🪵: Coast & shore; brought in for the mix (generator); also fits Smugglers' Grotto
- Sea Turtle Elder (Common, pack 1, cost 2)  💰cost 2: Coast & shore; brought in for the mix (high cost); also fits Smugglers' Grotto, Coral Current, The Sunken Depths

**Carried (3).** Badger Lumberjack (from Thistlewood, added); Beaver Lumberjack (from Bramblewood Outskirts, added); Bramble Sprout (from Thistlewood, added)

**Cut (8).**
- Tidepool Trapper Crab (Common): pack only (Pack 1)
- Tide Pool Crab (Common): pack only (Pack 1)
- Conch Crawler (Common): pack only (Pack 1)
- Rock Pool Starfish (Common): pack only (Pack 1)
- Oystercatcher (Common): pack only (Pack 1)
- Oyster Bank (Common): pack only (Pack 1)
- Driftwood Crab (Common): pack only (Pack 1)
- Beachcomber Sanderling (Common): pack only (Pack 1)

**Mix.** 11 cards: 1 high-cost (9%), 3 generators (27%), 7 plain (64%); average cost 0.55 (unique 0.62); resources: lumber.

**HUB9 flags.** Resolved: 1 on 4+ lists. Left: theme misfit (Badger Lumberjack, Beaver Lumberjack, Bramble Sprout), no source yet (proposed home: this map's pack tier) (Beaver Lumberjack).

### Map 3: Gannet Cliffs (mc)

**Theme.** Cliffs (sea cliffs, painted cliffs). Where the beach climbs into sheer white cliffs, and every ledge belongs to a bird. Field: no field effect. New in its fights: Diurnal, Reload, Pounce, Mountain Climber.

**Unique (8).**
- Golden Eagle Diver (Uncommon, map 3-7, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-7; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Puffin Diver (Common, map 3-2, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-2; also fits Smugglers' Grotto
- Peregrine Stooper (Uncommon, map 3-5, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-5; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- The Gannet Queen (Heroic, map 3-7, cost 2)  💰cost 2: its skirmish reward; skirmish reward of 3-7; moved from Gannet Cliffs
- Kittiwake Flock (Common, pack 1, cost 0): Cliffs (sea cliffs, painted cliffs); also fits Pebble Beach, Smugglers' Grotto
- Peak Condor (Common, pack 1, cost 1): Cliffs (sea cliffs, painted cliffs); also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Red-billed Chough (Common, pack 1, cost 0): Cliffs (sea cliffs, painted cliffs); also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Gannet Nestweaver (Common, pack 1, cost 0) 🪵: Cliffs (sea cliffs, painted cliffs); brought in for the mix (generator)

**Carried (3).** Chipmunk Skirmisher (from Bramblewood Outskirts, added); Conch Herald (from Pebble Beach, added); Cricket Drummer (from Thistlewood, added)

**Cut (8).**
- Hawk Arrowkeeper (Common): pack only (Pack 1)
- Fulmar Spitter (Uncommon): pack only (Pack 1)
- Razorbill (Uncommon): pack only (Pack 1)
- Mountain Goat Climber (Uncommon): to The Quiet Summit (Map 21)
- Sparrow Chick (Starter): pack only (Pack 1)
- Great Skua (Common): pack only (Pack 1)
- Oyster Bank (Common): pack only (Pack 1)
- Beachcomber Sanderling (Common): pack only (Pack 1)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 0.64 (unique 0.75); resources: lumber.

**HUB9 flags.** Resolved: 2 on 4+ lists, 4 theme misfit. Left: theme misfit (Chipmunk Skirmisher, Conch Herald, Cricket Drummer).

### Map 4: Sunken Hollow (m2)

**Theme.** River & pond. A flooded lowland — reef-runners and things that never surface first. Field: no field effect. New in its fights: Venomous, Bulwark, Cower.

**Unique (8).**
- Snapstick Turtle (Common, map 4-1, cost 1): River & pond; skirmish reward of 4-1; also fits Lilypad Reach
- Muskrat Lodgekeeper (Uncommon, map 4-4, cost 1): River & pond; skirmish reward of 4-4; also fits Lilypad Reach
- Old Sturgeon (Uncommon, map 4-5, cost 1): River & pond; skirmish reward of 4-5; also fits Lilypad Reach
- Platypus Spur (Uncommon, map 4-3, cost 1): River & pond; skirmish reward of 4-3; also fits Lilypad Reach
- The Drowned Matriarch (Heroic, map 4-5, cost 1): its skirmish reward; skirmish reward of 4-5; moved from Sunken Hollow
- Stone Turtle Warden (Common, pack 1, cost 2)  💰cost 2: River & pond; also fits Bramblewood Outskirts, Lilypad Reach
- Water Vole (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Thistlewood, Lilypad Reach, Clovermead
- Muskrat Reedgatherer (Common, pack 1, cost 0) 🪵: River & pond; brought in for the mix (generator); also fits Bramblewood Outskirts, Lilypad Reach

**Carried (3).** Box Turtle (from Bramblewood Outskirts); Beaver Lumberjack (from Bramblewood Outskirts, added); Fiddler Crab Swarm (from Pebble Beach, added)

**Cut (8).**
- Water Shrew (Common): pack only (Pack 1)
- River Mink (Uncommon): pack only (Pack 1)
- Pyrenean Desman (Uncommon): pack only (Pack 1)
- Signal Crayfish (Common): pack only (Pack 1)
- Diving Bell Spider (Uncommon): pack only (Pack 1)
- Pond Algae (Common): pack only (Pack 1)
- Dam-Keeper Beaver (Common): pack only (Pack 1)
- Ember Tetra (Uncommon): pack only (Pack 1)

**Mix.** 11 cards: 1 high-cost (9%), 2 generators (18%), 8 plain (73%); average cost 0.64 (unique 0.88); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Beaver Lumberjack), on 4 lists (Fiddler Crab Swarm).

### Map 5: Gatorback Swamp (mw)

**Theme.** Swamp & bog. A warm, green, very much alive swamp — toads, leeches and logs that open their eyes. Field: Swamp Fever.

**Unique (8).**
- Alligator Gar (Rare, map 5-7, cost 1): Swamp & bog; skirmish reward of 5-7; also fits Sable Swampmire, The Sunken Grove
- Grass Viper (Uncommon, map 5-4, cost 0): Swamp & bog; skirmish reward of 5-4; also fits Sable Swampmire, The Sunken Grove
- Fen Mink (Uncommon, map 5-6, cost 0): Swamp & bog; skirmish reward of 5-6; also fits Sable Swampmire, The Sunken Grove
- Old Snapjaw (Heroic, map 5-7, cost 2)  💰cost 2: its skirmish reward; skirmish reward of 5-7; moved from Gatorback Swamp
- Constrictor Coil (Common, pack 1, cost 2)  💰cost 2: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Snapper Hatchling (Common, pack 1, cost 0): Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Venomlord Serpent (Common, pack 1, cost 3)  💰cost 3: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Nutria Reedcutter (Common, pack 1, cost 0) 🪵: Swamp & bog; brought in for the mix (generator); also fits Bramblewood Outskirts, Sunken Hollow, Sable Swampmire, Lilypad Reach

**Carried (3).** Muskrat Lodgekeeper (from Sunken Hollow, added); Muskrat Reedgatherer (from Sunken Hollow, added); Old Sturgeon (from Sunken Hollow, added)

**Cut (14).**
- Crocodile Ambusher (Common): pack only (Pack 1)
- Swamp Alligator (Common): pack only (Pack 1)
- Caiman Hatchling (Common): pack only (Pack 1)
- Grass Snake (Uncommon): pack only (Pack 1)
- Plague Gnat Cloud (Common): pack only (Pack 1)
- Buzzed Chipmunk (Common): pack only (Pack 1)
- Fire Ant Raft (Uncommon): pack only (Pack 1)
- Anhinga Spearbird (Uncommon): pack only (Pack 1)
- Marsh Harrier (Uncommon): pack only (Pack 1)
- Raft Spider (Common): pack only (Pack 1)
- Moat Snapper (Uncommon): pack only (Pack 1)
- Alley Cat (Rare): pack only (Pack 1)
- Marsh-mallow Hare (Common): pack only (Pack 1)
- Sphagnum Vole (Common): pack only (Pack 1)

**Mix.** 11 cards: 3 high-cost (27%), 2 generators (18%), 6 plain (55%); average cost 0.91 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: none.

### Map 6: Sable Swampmire (m8)

**Theme.** Swamp & bog. A second, blacker wetland — everything here bites first and asks later. Field: Swamp Fever (3 of 8 fights). New in its fights: Remember, Detonate, Invisible, Daunt.

**Unique (8).**
- Booming Bittern (Uncommon, map 6-2, cost 1): Swamp & bog; skirmish reward of 6-2; also fits The Sunken Grove
- Newt Doctor (Uncommon, map 6-5, cost 0): Swamp & bog; skirmish reward of 6-5; also fits Lilypad Reach, The Sunken Grove
- Adder Ambusher (Rare, map 6-8, cost 1): Swamp & bog; skirmish reward of 6-8; also fits The Sunken Grove
- Poison Dart Croaker (Common, map 6-1, cost 1): Swamp & bog; skirmish reward of 6-1; also fits The Sunken Grove
- The Heron Hag (Heroic, map 6-8, cost 1): its skirmish reward; skirmish reward of 6-8; moved from Sable Swampmire
- Marsh Wisp (Common, pack 1, cost 0): Swamp & bog; also fits Gatorback Swamp, The Sunken Grove
- Cane Toad (Uncommon, pack 1, cost 2)  💰cost 2: Swamp & bog; brought in for the mix (high cost); also fits Gatorback Swamp, The Sunken Grove
- Peat-cutter Vole (Common, pack 1, cost 0) 🪵: Swamp & bog; brought in for the mix (generator); also fits Bramblewood Outskirts, Thistlewood, Gatorback Swamp, Clovermead

**Carried (3).** Constrictor Coil (from Gatorback Swamp); Venomlord Serpent (from Gatorback Swamp, added); Alligator Gar (from Gatorback Swamp, added)

**Cut (11).**
- Camouflage Frog (Common): pack only (Pack 1)
- Mire Witch-Heron (Common): pack only (Pack 1)
- Bogfire Newt (Uncommon): pack only (Pack 1)
- Raven Scout (Rare): pack only (Pack 1)
- Carrion Beetle (Uncommon): pack only (Pack 1)
- Lotus Frog (Uncommon): pack only (Pack 1)
- Lamprey (Common): pack only (Pack 1)
- Anaconda Coil (Rare): pack only (Pack 1)
- Cottonmouth Matriarch (Rare): pack only (Pack 1)
- Giant Water Bug (Uncommon): pack only (Pack 1)
- Greater Siren (Rare): pack only (Pack 1)

**Mix.** 11 cards: 3 high-cost (27%), 1 generators (9%), 7 plain (64%); average cost 1.09 (unique 0.75); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: none.

### Side map: Lilypad Reach (opens at 6, side of Pebble Beach)

**Theme.** River & pond. A wide, still pond full of lily pads, beaver dams and very territorial ducks. Field: Rain, Tide. New in its fights: Fragile, On ready gold, Regeneration.

**Side map call:** a full delve into a new location (3 unique). A pond of its own (river, lily pads, beaver dams) off a beach map, 7 fights: a new biome, not more of the beach.

**Unique (3).**
- Riverworks Bastion (Common, map 2-A-7, cost 3)  💰cost 3: River & pond; skirmish reward of 2-A-7
- Lodge Engineer (Uncommon, pack 1, cost 2) 🪵 💰cost 2: River & pond; also fits Sunken Hollow, The Goldfeather Siege, Goldfeather Keep
- Shallows Fry (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Sunken Hollow

**Carried (5).** Old Sturgeon (from Sunken Hollow); Fiddler Crab Swarm (from Pebble Beach, added); Nutria Reedcutter (from Gatorback Swamp, added); Platypus Spur (from Sunken Hollow, added); Snapstick Turtle (from Sunken Hollow, added)

**Cut (16).**
- Beaver Builder (Common): pack only (Pack 1)
- Camouflage Frog (Common): pack only (Pack 1)
- Duckling (Starter): Base card
- Elder Tortoise (Common): pack only (Pack 1)
- Ford Kingfisher (Uncommon): pack only (Pack 11)
- Great Crested Grebe (Common): pack only (Pack 1)
- Guppy (Starter): Base card
- Mangrove Mudskipper (Common): to The Kelp Mangroves (Map 9)
- Mayfly Dancer (Common): pack only (Pack 1)
- Minnow Skitter (Common): pack only (Pack 2)
- Mudpuppy (Common): to The Kelp Mangroves (Map 9)
- Pike Lancer (Rare): pack only (Pack 11)
- Poison Dart Croaker (Common): to Sable Swampmire (Map 6)
- Pond Duck (Starter): Base card
- River Carp (Starter): Base card
- Water Shrew (Common): pack only (Pack 1)

**Mix.** 8 cards: 2 high-cost (25%), 2 generators (25%), 5 plain (62%); average cost 1.00 (unique 1.67); resources: lumber.

**HUB9 flags.** Resolved: 3 listed before it is obtainable. Left: on 4 lists (Fiddler Crab Swarm).

### Side map: Murgle Mayhem (opens at 6, side of Sable Swampmire)

**Theme.** Swamp & bog.  Field: no field effect. New in its fights: Nocturnal.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 6 cards.

### Map 7: The Morel Hollow (mu)

**Theme.** Fungal hollow. A damp hollow under the old oaks, where the mushrooms grow taller than the otters. Field: Spore Cloud. New in its fights: Rage, Decay, Meiosis, Progeny.

**Unique (8).**
- Truffle Piglet (Uncommon, map 7-1, cost 1) 🪵: Fungal hollow; skirmish reward of 7-1; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Wolf Spider Mother (Rare, map 7-6, cost 1): Fungal hollow; skirmish reward of 7-6; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Dung Beetle (Common, pack 2, cost 0): Fungal hollow; also fits The Mycelium Deep
- Leafcutter Gardener (Common, pack 2, cost 0) 🪵: Fungal hollow; also fits The Mycelium Deep, Clovermead, The Canopy, The Old Bramble
- Ant Warrior (Uncommon, pack 2, cost 0): Fungal hollow; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Planarian Splitter (Uncommon, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep
- Fungal Colossus (Common, pack 2, cost 2)  💰cost 2: Fungal hollow; also fits The Mycelium Deep
- Owl Nightwatch (Common, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep

**Carried (3).** Adder Ambusher (from Sable Swampmire, added); Booming Bittern (from Sable Swampmire, added); Cane Toad (from Sable Swampmire, added)

**Cut (9).**
- Compost Grub (Common): pack only (Pack 1)
- Bombardier Beetle (Uncommon): pack only (Pack 2)
- Nightjar Drifter (Common): pack only (Pack 2)
- Pine Marten (Rare): pack only (Pack 2)
- Fungus Gnat Cloud (Common): pack only (Pack 2)
- Hawthorn Shieldbug (Common): pack only (Pack 2)
- Barkplate Beetle (Uncommon): pack only (Pack 2)
- Beaver Feller (Common): pack only (Pack 2)
- Sleepless Shrew (Common): pack only (Pack 2)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 7 plain (64%); average cost 0.91 (unique 0.75); resources: lumber.

**HUB9 flags.** Resolved: 6 theme misfit. Left: none.

### Side map: Smugglers' Grotto (opens at 7, side of Pebble Beach)

**Theme.** Caves & burrows, Coast & shore. A sea cave under Pebble Beach. Whatever the smugglers left down here, something else has moved in. Field: Darkness. New in its fights: Darksight, Cleave.

**Side map call:** ask owner (2 unique). A sea cave under Pebble Beach with its own darkness, but only 4 fights and half coast: a new place or the beach's extra challenge?

**Unique (2).**
- Octopus Tactician (Rare, map 2-B-4, cost 2)  💰cost 2: Caves & burrows; skirmish reward of 2-B-4; also fits Caves & Alcoves, Coral Current, The Sunken Depths, The Glimmer Depths
- Trash Panda Trickster (Common, pack 2, cost 0) 🪵: Caves & burrows; also fits Caves & Alcoves, The Glimmer Depths

**Carried (6).** Open-Ocean Hermit Crab (from Pebble Beach, added); Gull Thief (from Pebble Beach, added); Pincushion Urchin (from Pebble Beach, added); Grey Seal Bull (from Pebble Beach, added); Sea Turtle Elder (from Pebble Beach, added); Fiddler Crab Swarm (from Pebble Beach, added)

**Cut (10).**
- Beaver Builder (Common): pack only (Pack 1)
- Blind Cave Fish (Common): pack only (Pack 2)
- Duckling (Starter): Base card
- Mallard Marauder (Rare): pack only (Pack 2)
- Mayfly Dancer (Common): pack only (Pack 1)
- Otter Riverguard (Common): pack only (Pack 11)
- Pelican Diver (Rare): pack only (Pack 2)
- Shallows Fry (Common): to Lilypad Reach (Map 6)
- Sulfur Vent Crab (Uncommon): pack only (Pack 2)
- Oyster Bank (Common): pack only (Pack 1)

**Mix.** 8 cards: 2 high-cost (25%), 2 generators (25%), 4 plain (50%); average cost 0.62 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 3 theme misfit, 2 on 4+ lists. Left: on 4 lists (Fiddler Crab Swarm).

### Map 8: Caves & Alcoves (m4)

**Theme.** Caves & burrows. Deep beneath the Peak, where sound carries further than light does. Field: Landslide (3 of 8 fights), Darkness. New in its fights: Sonar, Leech, On ready damage, Purblind.

**Unique (8).**
- Echo Screecher (Rare, map 8-8, cost 1): Caves & burrows; skirmish reward of 8-8; also fits The Glimmer Depths
- Giant Cave Huntsman (Rare, map 8-7, cost 1): Caves & burrows; skirmish reward of 8-7; also fits The Glimmer Depths
- Star-nosed Mole (Common, map 8-2, cost 0): Caves & burrows; skirmish reward of 8-2; also fits The Glimmer Depths
- Quarry Mole (Common, map 8-1, cost 1): Caves & burrows; skirmish reward of 8-1; also fits The Glimmer Depths
- Echo Matriarch (Heroic, map 8-8, cost 1): its skirmish reward; skirmish reward of 8-8; moved from Caves & Alcoves
- Cave Olm (Common, pack 2, cost 0): Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Stalactite Golem (Common, pack 2, cost 2)  💰cost 2: Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Badger Stonemason (Uncommon, pack 2, cost 1) 🪨: Caves & burrows; brought in for the mix (generator); also fits Smugglers' Grotto, The Glimmer Depths

**Carried (3).** Octopus Tactician (from Smugglers' Grotto, added); Trash Panda Trickster (from Smugglers' Grotto, added); Ant Warrior (from The Morel Hollow, added)

**Cut (19).**
- Blind Cave Fish (Common): pack only (Pack 2)
- Sulfur Cinder Moth (Common): pack only (Pack 2)
- Nightshade Moth (Common): pack only (Pack 2)
- Vampire Bat (Uncommon): pack only (Pack 2)
- Whip Spider (Uncommon): pack only (Pack 2)
- Coffer Mimic (Uncommon): pack only (Pack 2)
- Subterraneaner (Uncommon): pack only (Pack 2)
- Cave Centipede (Common): pack only (Pack 2)
- Millipede Hauler (Uncommon): pack only (Pack 2)
- Dynamite Packrat (Uncommon): pack only (Pack 2)
- Baby Bat (Common): pack only (Pack 2)
- Vampire Bat Nurse (Uncommon): pack only (Pack 2)
- Gallery Orb-Weaver (Rare): pack only (Pack 2)
- Grotto Lobster (Rare): pack only (Pack 2)
- Ghost Crayfish (Uncommon): pack only (Pack 2)
- Cave Pseudoscorpion (Common): pack only (Pack 2)
- Guano Beetle (Common): pack only (Pack 2)
- Gravel Mole (Common): pack only (Pack 2)
- Prospector Mole (Common): to The Glimmer Depths (Map 16)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 7 plain (64%); average cost 0.82 (unique 0.88); resources: lumber, stone; introduces stone.

### Side map: The Mycelium Deep (opens at 8, side of The Morel Hollow)

**Theme.** Fungal hollow. Under the Morel Hollow, the roots go down a long way, and every root is listening. Field: Darkness. New in its fights: Esprit, Siege, Swarm n, Ambush.

**Side map call:** additional challenges on the parent map (1 unique). Under the Morel Hollow, the same fungal biome, 5 fights: more of the parent's hollow.

**Unique (1).**
- Rootworm Colony (Common, map 7-A-5, cost 1): Fungal hollow; skirmish reward of 7-A-5

**Carried (7).** Dung Beetle (from The Morel Hollow, added); Fungal Colossus (from The Morel Hollow, added); Wolf Spider Mother (from The Morel Hollow, added); Ant Warrior (from The Morel Hollow, added); Planarian Splitter (from The Morel Hollow, added); Leafcutter Gardener (from The Morel Hollow, added); Owl Nightwatch (from The Morel Hollow, added)

**Cut (9).**
- Bee Forager (Starter): Base card
- Beetle Battering-Ram (Rare): pack only (Pack 4)
- Gangrenous Leech (Uncommon): pack only (Pack 2)
- Garden Snail (Starter): Base card
- Honey Bee (Starter): Base card
- Swarm Matriarch (Rare): no home yet
- Trapdoor Spider (Rare): pack only (Pack 2)
- Tunnel Ant (Rare): Base card
- Worker Ant (Starter): Base card

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.75 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 3 theme misfit, 1 no source, 1 on 4+ lists. Left: none.

### Map 9: The Kelp Mangroves (mk)

**Theme.** Mangrove & kelp. Salt water creeps into the swamp — mangrove roots, kelp curtains and smugglers' channels. Field: Tide. New in its fights: Acid Bolt, Diurnal.

**Unique (8).**
- Mangrove Kingfisher (Rare, map 9-6, cost 1): Mangrove & kelp; skirmish reward of 9-6
- Mangrove Manatee (Rare, map 9-7, cost 1): Mangrove & kelp; skirmish reward of 9-7; also fits Coral Current, The Sunken Depths
- Banded Sea Krait (Uncommon, map 9-3, cost 1): Mangrove & kelp; skirmish reward of 9-3; also fits Coral Current, The Sunken Depths
- Mangrove Mudskipper (Common, pack 2, cost 0): Mangrove & kelp
- Mangrove Monitor (Common, pack 2, cost 1): Mangrove & kelp
- Mudpuppy (Common, pack 2, cost 0): Mangrove & kelp; also fits The Sunken Grove
- Reef Shark (Common, pack 2, cost 2)  💰cost 2: Mangrove & kelp; also fits Coral Current, The Sunken Depths
- Nautilus Drifter (Rare, pack 2, cost 1) 🪵: kin: Reef & ocean; brought in for the mix (generator); moved from The Kelp Mangroves; also fits Coral Current, The Sunken Depths

**Carried (3).** Fen Mink (from Gatorback Swamp, added); Grass Viper (from Gatorback Swamp, added); Lodge Engineer (from Lilypad Reach, added)

**Cut (15).**
- Minnow Skitter (Common): pack only (Pack 2)
- Archerfish (Uncommon): pack only (Pack 2)
- Sunbittern Strider (Uncommon): pack only (Pack 2)
- Mudflat Godwit (Uncommon): pack only (Pack 2)
- Electric Catfish (Rare): pack only (Pack 2)
- Elephant-nose Fish (Uncommon): pack only (Pack 2)
- Piranha Shoal (Uncommon): pack only (Pack 2)
- Limpet Clinger (Common): pack only (Pack 2)
- Fishing Cat (Rare): pack only (Pack 2)
- Proboscis Monkey (Uncommon): pack only (Pack 2)
- Horseshoe Crab (Common): pack only (Pack 2)
- Sea Hare (Common): pack only (Pack 2)
- Ironclaw Fiddler (Rare): pack only (Pack 2)
- Oyster Bank (Common): pack only (Pack 1)
- Beachcomber Sanderling (Common): pack only (Pack 1)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 8 plain (73%); average cost 0.82 (unique 0.88); resources: lumber.

**HUB9 flags.** Resolved: 6 theme misfit, 1 on 4+ lists. Left: on 4 lists (Lodge Engineer).

### Map 10: Coral Current (m7)

**Theme.** Reef & ocean. Past the last cliffs, the open sea — deep water, fast currents and the teeth that live in them. Field: Tide. New in its fights: Fork, Gash, Trident, Pierce.

**Unique (8).**
- Colossal Squid (Very Rare, map 10-9, cost 4)  💰cost 4: Reef & ocean; skirmish reward of 10-9; also fits The Sunken Depths
- Electric Ray (Uncommon, map 10-2, cost 1): Reef & ocean; skirmish reward of 10-2; also fits The Sunken Depths
- Great Barracuda (Rare, map 10-6, cost 1): Reef & ocean; skirmish reward of 10-6; also fits The Sunken Depths
- Reef Admiral (Heroic, map 10-9, cost 1): its skirmish reward; skirmish reward of 10-9; moved from Coral Current
- Parrotfish (Common, pack 2, cost 0): Reef & ocean; also fits The Sunken Depths
- Riptide Eel (Uncommon, pack 2, cost 1): Reef & ocean; also fits Smugglers' Grotto, The Sunken Depths
- Coral Reef Shark (Uncommon, pack 2, cost 2)  💰cost 2: Reef & ocean; also fits The Sunken Depths
- Coral Polyp Colony (Common, pack 2, cost 0) 🪵: Reef & ocean; brought in for the mix (generator); also fits The Sunken Depths

**Carried (3).** Banded Sea Krait (from The Kelp Mangroves, added); Mangrove Manatee (from The Kelp Mangroves, added); Nautilus Drifter (from The Kelp Mangroves, added)

**Cut (16).**
- Clownfish Scout (Common): pack only (Pack 2)
- Kraken Spawnling (Common): pack only (Pack 2)
- Lion's Mane Jelly (Uncommon): pack only (Pack 2)
- Swordfish Spearman (Rare): pack only (Pack 2)
- Sawfish (Uncommon): pack only (Pack 2)
- Mantis Shrimp (Rare): pack only (Pack 2)
- Cone Snail (Uncommon): pack only (Pack 2)
- Cleaner Wrasse (Uncommon): pack only (Pack 2)
- Sea Cucumber (Uncommon): pack only (Pack 2)
- Yellow-bellied Sea Snake (Rare): pack only (Pack 2)
- Crown-of-thorns Star (Uncommon): pack only (Pack 2)
- Lionfish (Uncommon): pack only (Pack 2)
- Giant Clam (Common): pack only (Pack 2)
- Whale Shark (Rare): pack only (Pack 2)
- Bloodscent Shark (Uncommon): pack only (Pack 2)
- Salvager Hermit Crab (Common): pack only (Pack 2)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 7 plain (64%); average cost 1.18 (unique 1.25); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: none.

### Map 11: Eyrie Heights (m10)

**Theme.** Mountain & sky. Sheer alpine cliffs above the Foundry’s smoke — the air here belongs to whatever can still fly in it. Field: no field effect. New in its fights: Arrow, Fletcher, Avalanche, Frostbite.

**Unique (8).**
- Alpine Marmot (Common, map 11-1, cost 0): Mountain & sky; skirmish reward of 11-1; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Eagle-Owl Quartermaster (Rare, map 11-2, cost 1): Mountain & sky; skirmish reward of 11-2; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Ibex Rockcaller (Very Rare, map 11-10, cost 1): Mountain & sky; skirmish reward of 11-10; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Chamois Leaper (Uncommon, map 11-9, cost 1): Mountain & sky; skirmish reward of 11-9; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Chipmunk Hoarder (Common, pack 2, cost 0) 🪵: Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Eyrie Warden (Common, pack 2, cost 3)  💰cost 3: Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Mountain Hare (Common, pack 2, cost 0): Mountain & sky; also fits Clovermead, The Aerie Vault, Wolfsbane Tundra, Ashen Spurn
- Apollo Butterfly (Uncommon, pack 2, cost 0): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit

**Carried (3).** Golden Eagle Diver (from Gannet Cliffs, added); Peak Condor (from Gannet Cliffs, added); Peregrine Stooper (from Gannet Cliffs, added)

**Cut (6).**
- Mountain Goat Climber (Uncommon): to The Quiet Summit (Map 21)
- Balloon Archer (Uncommon): pack only (Pack 2)
- Alpine Swift (Common): pack only (Pack 2)
- Alpine Salamander (Common): pack only (Pack 2)
- Marmot Stonecutter (Common): pack only (Pack 2)
- Gale Swift (Common): pack only (Pack 2)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 0.82 (unique 0.75); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: none.

### Side map: The Sunken Depths (opens at 11, side of Coral Current)

**Theme.** Reef & ocean. An otter ferry went down past the reef wall years ago. The current through its hull is faster than anything above. Field: Crushing Depths, Pitch Black. New in its fights: Octolash, Shock, Corrode, Chain Lightning.

**Side map call:** ask owner (2 unique). A sunken ferry with its own pitch dark and Crushing Depths, but the same reef biome as Coral Current, 5 fights.

**Unique (2).**
- Blue-ringed Octopus (Rare, map 10-A-5, cost 1): Reef & ocean; skirmish reward of 10-A-5
- Orca Vanguard (Common, pack 2, cost 3)  💰cost 3: Reef & ocean; also fits Coral Current

**Carried (6).** Parrotfish (from Coral Current, added); Coral Reef Shark (from Coral Current, added); Mangrove Manatee (from The Kelp Mangroves); Nautilus Drifter (from The Kelp Mangroves); Riptide Eel (from Coral Current, added); Colossal Squid (from Coral Current, added)

**Cut (8).**
- Abyss Lantern Squid (Uncommon): keeps its own source (raid)
- Glass Octopus (Rare): keeps its own source (raid)
- Silver Minnow (Starter): Base card
- Sulfur Vent Crab (Uncommon): pack only (Pack 2)
- Vampire Squid (Rare): keeps its own source (raid)
- Voltaic Eel (Rare): pack only (Pack 2)
- Giant Clam (Common): pack only (Pack 2)
- Salvager Hermit Crab (Common): pack only (Pack 2)

**Mix.** 8 cards: 3 high-cost (38%), 1 generators (12%), 4 plain (50%); average cost 1.62 (unique 2.00); resources: lumber.

**HUB9 flags.** Resolved: 3 listed before it is obtainable, 1 on 4+ lists, 2 theme misfit. Left: none.

### Side map: The Undercroft (opens at 11, side of Eyrie Heights)

**Theme.** none.  Field: no field effect. New in its fights: Night-blind, Tangleweed, Executioner, Sturdy.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 93 cards.

### Map 12: The Briar Maze (mh)

**Theme.** Briar maze. Hedges taller than a heron, thorns sharper than a quill — and every turn is a dead end for someone. Field: Grasping Briars. New in its fights: Backstab, Predator, Confuse, Sprout.

**Unique (8).**
- Cunning Vixen (Uncommon, map 12-2, cost 1): Briar maze; skirmish reward of 12-2
- Hedgehog Scout (Common, map 12-5, cost 0): Briar maze; skirmish reward of 12-5
- Quillguard (Rare, map 12-7, cost 1): Briar maze; skirmish reward of 12-7
- Bramble Hoglet (Common, map 12-1, cost 0): Briar maze; skirmish reward of 12-1
- Hedge Weasel (Uncommon, pack 2, cost 0): Briar maze; also fits Clovermead, The Old Bramble
- Lyrebird Mimic (Uncommon, pack 2, cost 1): Briar maze; also fits Clovermead, The Old Bramble
- Quillback Elder (Common, pack 2, cost 2)  💰cost 2: Briar maze; brought in for the mix (high cost); moved from The Briar Maze
- Carrion Crow (Common, pack 2, cost 0) 🪵: kin: Meadow & woodland; brought in for the mix (generator); also fits Clovermead, The Old Bramble

**Carried (3).** Field Mouse (from Thistlewood); Mountain Hare (from Eyrie Heights, added); Dormouse (from Thistlewood, added)

**Cut (8).**
- Mouse Sapper (Common): pack only (Pack 2)
- Seed-cache Squirrel (Common): pack only (Pack 2)
- Thorn Shrike (Rare): pack only (Pack 2)
- Gatling Hog (Rare): pack only (Pack 2)
- Fox Sharpshot (Common): pack only (Pack 2)
- Skunk Gasser (Uncommon): pack only (Pack 2)
- Rodent King (Uncommon): pack only (Pack 2)
- Magpie Collector (Uncommon): pack only (Pack 2)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 0.45 (unique 0.62); resources: lumber.

**HUB9 flags.** Resolved: 8 theme misfit, 1 on 4+ lists. Left: none.

### Side map: Clovermead (opens at 12, side of Thistlewood)

**Theme.** Meadow & woodland. A wide clover meadow past the Outskirts — rabbits, bees and mice, and nobody in a hurry. Field: Thunderstorm. New in its fights: Swipe.

**Side map call:** ask owner (2 unique). A meadow opening at Map 12 off Thistlewood (Map 1) with its own Thunderstorm, but the same meadow biome, 5 fights.

**Unique (2).**
- Lucky Hopper (Rare, map 1-A-5, cost 1): Meadow & woodland; skirmish reward of 1-A-5; also fits The Old Bramble
- Jay Pilferer (Common, pack 2, cost 1) 🪵: Meadow & woodland; brought in for the mix (generator); also fits The Old Bramble

**Carried (6).** House Cat (from Bramblewood Outskirts); Field Mouse (from Thistlewood, added); Field Vole (from Thistlewood, added); Hedgerow Shrew (from Thistlewood, added); Robin Redbreast (from Thistlewood, added); Ant Hill (from Bramblewood Outskirts, added)

**Cut (18).**
- Acorn Chipmunk (Starter): Base card
- Bee Forager (Starter): Base card
- Bee Sentry (Starter): Base card
- Buck Brawler (Common): pack only (Pack 2)
- Burrow Rabbit (Starter): Base card
- Chipmunk Forager (Starter): Base card
- Clover Butterfly (Common): pack only (Pack 2)
- Cottontail (Starter): Base card
- Farm Dog (Common): pack only (Pack 1)
- Field Crow (Common): pack only (Pack 2)
- Honey Bee (Starter): Base card
- Ladybird Guard (Common): pack only (Pack 2)
- Meadow Rabbit (Starter): Base card
- Pigeon Peon (Common): pack only (Pack 2)
- Rabbit Kit (Common): no home yet
- Stag Beetle (Rare): pack only (Pack 2)
- Tunnel Ant (Rare): Base card
- Village Miller (Common): pack only (Pack 2)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.50 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit, 1 no source, 1 on 4+ lists. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill).

### Map 13: The Redwood Deep (mr)

**Theme.** Redwood deep. Trees as wide as castles and as old as the hills — bears, stags and boars rule the red shade. Field: High Canopy. New in its fights: Keen Eye, Fast Forward, Berserk, Perforate.

**Unique (8).**
- Fawn Scout (Rare, map 13-1, cost 0): Redwood deep; skirmish reward of 13-1
- Shimmerwing Stag (Very Rare, map 13-8, cost 1): Redwood deep; skirmish reward of 13-8
- Sergeant Bramblefox (Rare, map 13-2, cost 1): Redwood deep; skirmish reward of 13-2; moved from The Redwood Deep
- Berserker Boar (Common, pack 2, cost 2)  💰cost 2: Redwood deep
- Grizzly Vanguard (Common, pack 2, cost 2)  💰cost 2: Redwood deep
- Bramblewood Lynx (Rare, pack 2, cost 1): Redwood deep; also fits The Pinewood Taiga, The Old Bramble
- Swift Fox (Common, pack 2, cost 1): Redwood deep; also fits Clovermead, The Old Bramble
- Redwood Woodpecker (Uncommon, pack 2, cost 1) 🪵: Redwood deep; brought in for the mix (generator)

**Carried (3).** Bramble Hoglet (from The Briar Maze, added); Carrion Crow (from The Briar Maze, added); Cunning Vixen (from The Briar Maze, added)

**Cut (11).**
- Fox Kit (Common): pack only (Pack 2)
- Stag Knight (Common): pack only (Pack 2)
- Tasmanian Devil (Uncommon): pack only (Pack 2)
- Woodpecker Sapper (Uncommon): pack only (Pack 2)
- Pill Bug (Uncommon): pack only (Pack 2)
- Margay (Rare): pack only (Pack 2)
- Leopard Slug (Common): pack only (Pack 2)
- Red-backed Salamander (Common): pack only (Pack 2)
- Hazel Coppice (Common): pack only (Pack 2)
- Beaver Feller (Common): pack only (Pack 2)
- Hollow Oath-Keeper (Common): pack only (Pack 2)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 7 plain (64%); average cost 0.91 (unique 1.12); resources: lumber.

**HUB9 flags.** Resolved: 7 theme misfit. Left: none.

### Side map: The Sunken Grove (opens at 13, side of Gatorback Swamp)

**Theme.** Swamp & bog. Where the swamp swallowed an old forest. The trees still stand, up to their necks. Field: Swamp Fever. New in its fights: Herbalist.

**Side map call:** additional challenges on the parent map (1 unique). The swamp swallowing an old forest: the same swamp biome as Gatorback Swamp, 4 fights.

**Unique (1).**
- Hedgehog Herbalist (Rare, map 5-A-4, cost 1): Swamp & bog; skirmish reward of 5-A-4; also fits The Old Bramble

**Carried (7).** Snapper Hatchling (from Gatorback Swamp, added); Constrictor Coil (from Gatorback Swamp, added); Grass Viper (from Gatorback Swamp, added); Alligator Gar (from Gatorback Swamp, added); Mangrove Mudskipper (from The Kelp Mangroves); Fen Mink (from Gatorback Swamp, added); Nutria Reedcutter (from Gatorback Swamp, added)

**Cut (7).**
- Baby Horned Capybara (Common): pack only (Pack 2)
- Bog Behemoth (Common): pack only (Pack 2)
- Bog Leech (Uncommon): pack only (Pack 2)
- Echo Keeper (Common): pack only (Pack 2)
- Mosquito Cloud (Common): pack only (Pack 2)
- Puddle Hopper (Common): pack only (Pack 2)
- Swamp Rabbit (Common): pack only (Pack 2)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.50 (unique 1.00); resources: lumber.

### Map 14: Savanna Reaches (m5)

**Theme.** Savanna. Open grassland past the Peak — nothing here hides for long. Field: First Blood. New in its fights: Night-blind, Executioner, Twin Shot, Drunk.

**Unique (8).**
- Grave-Grin Hyena (Uncommon, map 14-2, cost 0): Savanna; skirmish reward of 14-2
- Savanna Cheetah (Very Rare, map 14-8, cost 1): Savanna; skirmish reward of 14-8
- Spitting Cobra (Rare, map 14-6, cost 1): Savanna; skirmish reward of 14-6
- Pride Queen (Heroic, map 14-8, cost 1): its skirmish reward; skirmish reward of 14-8; moved from Savanna Reaches
- Hoopoe Herald (Common, pack 3, cost 0): Savanna
- Weaver Bird (Common, pack 3, cost 1): Savanna
- Dust Hyena (Uncommon, pack 3, cost 0) 🪵: Savanna; also fits The Pale Desert
- Marula Elephant (Uncommon, pack 3, cost 2)  💰cost 2: Savanna; brought in for the mix (high cost)

**Carried (3).** House Cat (from Bramblewood Outskirts, added); Leafcutter Gardener (from The Morel Hollow, added); Lodge Engineer (from Lilypad Reach, added)

**Cut (8).**
- Springbok Pronker (Common): pack only (Pack 3)
- Meerkat Burrower (Common): pack only (Pack 3)
- Pangolin Roller (Uncommon): pack only (Pack 3)
- Monitor Rambler (Uncommon): pack only (Pack 3)
- Mongoose Duelist (Uncommon): pack only (Pack 3)
- Lovebird (Common): pack only (Pack 3)
- Marula Monkey (Common): pack only (Pack 3)
- Termite Forager (Common): pack only (Pack 3)

**Mix.** 11 cards: 2 high-cost (18%), 3 generators (27%), 7 plain (64%); average cost 0.73 (unique 0.75); resources: lumber.

**HUB9 flags.** Resolved: none. Left: on 4 lists (Lodge Engineer).

### Map 15: The Long Grass (ml)

**Theme.** Long grass. Rolling plains and farm country — horses, hounds and village militia on every road. Field: Undergrowth. New in its fights: Bulldoze, Stampede, Converge, Speed.

**Unique (8).**
- Border Collie (Uncommon, map 15-2, cost 1): Long grass; skirmish reward of 15-2; also fits The Goldfeather Siege, Goldfeather Keep
- Stoat Cutthroat (Rare, map 15-3, cost 1): Long grass; skirmish reward of 15-3; also fits The Goldfeather Siege, Goldfeather Keep
- Talon Archer (Very Rare, map 15-7, cost 1): Long grass; skirmish reward of 15-7
- Gilded Roadwarden (Common, pack 3, cost 4)  💰cost 4: Long grass
- Pronghorn Racer (Common, pack 3, cost 1): Long grass; also fits The Old Bramble
- Bison Bulldozer (Uncommon, pack 3, cost 1): Long grass; also fits The Old Bramble
- Raccoon Bandit (Rare, pack 3, cost 0) 🪵: Long grass
- Stable Colt (Uncommon, pack 3, cost 0): Long grass

**Carried (3).** Carrion Crow (from The Briar Maze); Hedge Weasel (from The Briar Maze, added); Hedgehog Herbalist (from The Sunken Grove, added)

**Cut (10).**
- Warhorse Charger (Common): pack only (Pack 3)
- Shepherd (Common): pack only (Pack 3)
- Amber Cicada (Uncommon): pack only (Pack 3)
- Springtail Hopper (Common): pack only (Pack 3)
- Muntjac Barker (Uncommon): pack only (Pack 3)
- Anvil Thrush (Common): pack only (Pack 3)
- Garden Tiger Moth (Common): pack only (Pack 3)
- Land Tiller (Common): to The Goldfeather Siege (Map 23)
- Moonshell Snail (Common): pack only (Pack 3)
- Courier Pigeon (Common): pack only (Pack 3)

**Mix.** 11 cards: 1 high-cost (9%), 2 generators (18%), 8 plain (73%); average cost 0.91 (unique 1.12); resources: lumber.

**HUB9 flags.** Resolved: 8 theme misfit, 1 on 4+ lists. Left: none.

### Side map: The Aerie Vault (opens at 15, side of Eyrie Heights)

**Theme.** Mountain & sky. The oldest nests on the mountain, built on top of each other for a thousand springs. Field: no field effect.

**Side map call:** additional challenges on the parent map (1 unique). The oldest nests on the same mountain as Eyrie Heights, 4 fights.

**Unique (1).**
- Wound Reaver (Rare, map 11-A-4, cost 1): Mountain & sky; skirmish reward of 11-A-4; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair

**Carried (7).** Chipmunk Hoarder (from Eyrie Heights, added); Eagle-Owl Quartermaster (from Eyrie Heights, added); Eyrie Warden (from Eyrie Heights, added); Alpine Marmot (from Eyrie Heights, added); Ibex Rockcaller (from Eyrie Heights, added); Apollo Butterfly (from Eyrie Heights, added); Chamois Leaper (from Eyrie Heights, added)

**Cut (6).**
- Alpine Avalanche (Common): pack only (Pack 3)
- Chipmunk Stockpiler (Common): pack only (Pack 3)
- Golden Eagle Diver (Uncommon): to Gannet Cliffs (Map 3)
- Peak Condor (Common): to Gannet Cliffs (Map 3)
- Rockslide Ram (Uncommon): pack only (Pack 3)
- Marmot Stonecutter (Common): pack only (Pack 2)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.88 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 1 on 4+ lists. Left: none.

### Map 16: The Pinewood Taiga (mt)

**Theme.** Taiga. Endless dark pines on the edge of the snow — lynx, elk and the first of the wolf packs. Field: Frigid (frozen ground). New in its fights: Pack, Pack Leader.

**Unique (8).**
- Woodland Caribou (Uncommon, map 16-3, cost 1): Taiga; skirmish reward of 16-3; also fits The Old Bramble
- Taiga Lynx (Rare, map 16-4, cost 1): Taiga; skirmish reward of 16-4; also fits The Old Bramble
- Dhole Matriarch (Very Rare, map 16-7, cost 2)  💰cost 2: Taiga; skirmish reward of 16-7; also fits The Old Bramble
- Alpha Howler (Common, pack 3, cost 2)  💰cost 2: Taiga; also fits The Old Bramble
- Frost Hare Sprinter (Common, pack 3, cost 0): Taiga; also fits Wolfsbane Tundra, Ashen Spurn, The Old Bramble, The Ice Hollow
- Snowshoe Hare (Common, pack 3, cost 0): Taiga; also fits The Old Bramble
- Trickster Fox (Common, pack 3, cost 1): Taiga; also fits The Old Bramble
- Cone-cutter Squirrel (Common, pack 3, cost 0) 🪵: Taiga; brought in for the mix (generator); also fits The Old Bramble

**Carried (3).** Bramblewood Lynx (from The Redwood Deep, added); Berserker Boar (from The Redwood Deep, added); Fawn Scout (from The Redwood Deep, added)

**Cut (3).**
- Dhole Runner (Common): pack only (Pack 3)
- Boreal Elk (Common): pack only (Pack 3)
- Wolf Pack Runner (Rare): pack only (Pack 3)

**Mix.** 11 cards: 3 high-cost (27%), 1 generators (9%), 7 plain (64%); average cost 0.91 (unique 0.88); resources: lumber.

### Side map: The Glimmer Depths (opens at 16, side of Caves & Alcoves)

**Theme.** Caves & burrows. Below the alcoves the walls start to shine, and things that like shiny things start to gather. Field: Mirage. New in its fights: Prayer.

**Side map call:** ask owner (2 unique). Deeper in the same caves as Caves & Alcoves, 4 fights, but a new crystal / shiny theme with its own Mirage.

**Unique (2).**
- Lantern Spark Fly (Uncommon, map 8-A-4, cost 0): Caves & burrows; skirmish reward of 8-A-4
- Prospector Mole (Common, pack 2, cost 0) 🔩: Caves & burrows; brought in for the mix (generator); also fits Smugglers' Grotto, Caves & Alcoves

**Carried (6).** Echo Screecher (from Caves & Alcoves, added); Badger Stonemason (from Caves & Alcoves, added); Cave Olm (from Caves & Alcoves, added); Giant Cave Huntsman (from Caves & Alcoves, added); Quarry Mole (from Caves & Alcoves, added); Stalactite Golem (from Caves & Alcoves, added)

**Cut (13).**
- Barrow Leech (Rare): pack only (Pack 3)
- Bat Swarmling (-): no home yet
- Beetle Grunt (Common): pack only (Pack 1)
- Cave Bat Swarm (Rare): pack only (Pack 3)
- Cave Cricket (Common): pack only (Pack 3)
- Cave Flitter (Uncommon): pack only (Pack 3)
- Cave Swiftlet (Common): pack only (Pack 3)
- Glowworm Cluster (Common): no home yet
- Monarch Wingblade (Rare): pack only (Pack 3)
- Oilbird (Uncommon): no home yet
- Swarm Matriarch (Rare): no home yet
- Tunnel Ant (Rare): Base card
- Glimmer Spider (Uncommon): pack only (Pack 3)

**Mix.** 8 cards: 1 high-cost (12%), 2 generators (25%), 5 plain (62%); average cost 0.75 (unique 0.00); resources: metal, stone; introduces metal.

**HUB9 flags.** Resolved: 3 no source, 1 on 4+ lists. Left: none.

### Map 17: Wolfsbane Tundra (m6)

**Theme.** Tundra & ice. Frozen ground north of the grassland — the packs here hunt in formation. Field: Frigid (frozen ground), frost (Freezing / Frostbite), Frostbite, Freezing. New in its fights: Earthquake, King, Poison Bolt, Pack Howl.

**Unique (8).**
- Lone Grey Wolf (Very Rare, map 17-2, cost 1): Tundra & ice; skirmish reward of 17-2; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Polar Bear (Very Rare, map 17-6, cost 1): Tundra & ice; skirmish reward of 17-6; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Walrus Icebreaker (Very Rare, map 17-8, cost 1): Tundra & ice; skirmish reward of 17-8; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Wolfsbane Alpha (Heroic, map 17-8, cost 1): its skirmish reward; skirmish reward of 17-8; moved from Wolfsbane Tundra
- Glacial Ape-King (Common, pack 3, cost 4)  💰cost 4: Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Snow Bunting Archer (Uncommon, pack 3, cost 1): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Snow Ermine (Common, pack 3, cost 0): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Talus Pika (Common, pack 3, cost 0) 🪵: Tundra & ice; brought in for the mix (generator); also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit

**Carried (3).** Frost Hare Sprinter (from The Pinewood Taiga, added); Mountain Hare (from Eyrie Heights, added); Alpha Howler (from The Pinewood Taiga, added)

**Cut (7).**
- Harbor Seal (Common): pack only (Pack 3)
- Spitting Spider (Uncommon): pack only (Pack 3)
- Frostmoon Howler (Rare): pack only (Pack 3)
- Ravenous Wolverine (Rare): pack only (Pack 3)
- Beluga (Rare): pack only (Pack 3)
- Musk Ox Calf (Uncommon): pack only (Pack 3)
- Musk Ox Matriarch (Uncommon): pack only (Pack 3)

**Mix.** 11 cards: 2 high-cost (18%), 1 generators (9%), 8 plain (73%); average cost 1.00 (unique 1.12); resources: lumber.

### Map 18: The Glass Dunes (md)

**Theme.** Glass dunes. Heat so fierce the sand turns to glass — scorpions, jackals and things that wait under the dunes. Field: Sandstorm. New in its fights: Dry, Haste, Trap, Tornado.

**Unique (8).**
- Obsidian Scorpion (Rare, map 18-5, cost 1): Glass dunes; skirmish reward of 18-5; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Antlion Pit (Uncommon, map 18-6, cost 1): Glass dunes; skirmish reward of 18-6
- Caustic Scorpion (Uncommon, map 18-2, cost 1): Glass dunes; skirmish reward of 18-2
- Dust-devil Kestrel (Very Rare, map 18-7, cost 1): Glass dunes; skirmish reward of 18-7
- Thorny Devil (Common, map 18-1, cost 1): Glass dunes; skirmish reward of 18-1
- Sandfish (Common, pack 3, cost 1): Glass dunes
- Komodo Warlord (Common, pack 3, cost 3)  💰cost 3: Glass dunes
- Dune Packrat (Uncommon, pack 3, cost 1) 🪵: Glass dunes; brought in for the mix (generator); also fits The Old Bramble

**Carried (3).** Dust Hyena (from Savanna Reaches, added); Bison Bulldozer (from The Long Grass, added); Border Collie (from The Long Grass, added)

**Cut (8).**
- Roadrunner Courier (Common): pack only (Pack 3)
- Fennec Fox (Uncommon): pack only (Pack 3)
- Dromedary (Uncommon): pack only (Pack 3)
- Glasswing Moth (Common): pack only (Pack 3)
- Frillneck Duelist (Rare): pack only (Pack 3)
- Tarantula Hawk (Uncommon): pack only (Pack 3)
- Inland Taipan (Rare): pack only (Pack 3)
- Static Fennec (Uncommon): pack only (Pack 3)

**Mix.** 11 cards: 1 high-cost (9%), 2 generators (18%), 8 plain (73%); average cost 1.09 (unique 1.25); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: on 4+ lists (Obsidian Scorpion), on 4 lists (Dust Hyena), theme misfit (Bison Bulldozer, Border Collie).

### Side map: The Canopy (opens at 18, side of Savanna Reaches)

**Theme.** Jungle canopy. Up in the rainforest roof past the savanna's edge — frogs, sloths, drums and a jaguar's path. Field: High Canopy. New in its fights: Stem, Stem, Feeble, Sun-shy.

**Side map call:** a full delve into a new location (3 unique). The rainforest roof: a jungle biome, not the savanna of its parent, with its own High Canopy.

**Unique (3).**
- Hercules Beetle (Rare, map 14-A-4, cost 1): Jungle canopy; skirmish reward of 14-A-4; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Jaguar Stalker (Rare, map 14-A-5, cost 1): Jungle canopy; skirmish reward of 14-A-5
- Kinkajou Lurker (Uncommon, map 14-A-3, cost 1): Jungle canopy; skirmish reward of 14-A-3

**Carried (5).** Grave-Grin Hyena (from Savanna Reaches, added); Hoopoe Herald (from Savanna Reaches, added); Savanna Cheetah (from Savanna Reaches, added); Marula Elephant (from Savanna Reaches, added); Dust Hyena (from Savanna Reaches, added)

**Cut (13).**
- Ancient Sloth Titan (Common): pack only (Pack 3)
- Aye-aye Prowler (Common): no home yet
- Bramblewood Macaque (Rare): pack only (Pack 3)
- Chilli Parrot (Uncommon): no home yet
- Howler Monkey (Uncommon): pack only (Pack 3)
- Old-Growth Tortoise (Common): no home yet
- Siege Rhino (Rare): to The Goldfeather Siege (Map 23)
- Slow Loris (Common): no home yet
- Slowpoke Sentinel (Common): no home yet
- Termite Mound (Common): pack only (Pack 3)
- Toucan Courier (Common): no home yet
- Velvet Worm (Uncommon): no home yet
- Carrion Crow (Common): to The Briar Maze (Map 12)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.75 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 7 no source, 1 listed before it is obtainable, 3 theme misfit, 1 on 4+ lists. Left: on 4 lists (Dust Hyena).

### Map 19: Ashen Spurn (m3)

**Theme.** Volcanic & ash, Mountain & sky, Tundra & ice. Scorched high ground — only the toughest hides make it this far up. Field: Ash Rain (2 of 6 fights). New in its fights: Spitfire, Landslide, Volley, Scar.

**Unique (8).**
- Echidna Quillshot (Very Rare, map 19-6, cost 1): Volcanic & ash; skirmish reward of 19-6; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Old Bramble
- Fire Salamander (Uncommon, map 19-3, cost 1): Volcanic & ash; skirmish reward of 19-3; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Quill Volley (Rare, map 19-2, cost 1): Volcanic & ash; skirmish reward of 19-2; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Yeti Chieftain (Heroic, map 19-6, cost 1): its skirmish reward; skirmish reward of 19-6; moved from Ashen Spurn; also fits Volcano Lair
- Cinder Stoker (Common, pack 3, cost 0): Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Yeti (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits Wolfsbane Tundra, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Magma Titan (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Pumice Beetle (Uncommon, pack 3, cost 1) 🪨: Volcanic & ash; brought in for the mix (generator); also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera

**Carried (3).** Hercules Beetle (from The Canopy, added); Obsidian Scorpion (from The Glass Dunes, added); Wound Reaver (from The Aerie Vault, added)

**Cut (5).**
- Phoenix Fledgling (Common): pack only (Pack 3)
- Glacier Wolf Pack (Common): pack only (Pack 3)
- Porcupine Roller (Common): pack only (Pack 3)
- Scree Goat (Uncommon): to The Quiet Summit (Map 21)
- Granite Ox Golem (Rare): pack only (Pack 3)

**Mix.** 11 cards: 2 high-cost (18%), 1 generators (9%), 8 plain (73%); average cost 1.27 (unique 1.38); resources: stone.

**HUB9 flags.** Resolved: 2 on 4+ lists. Left: on 4+ lists (Cinder Stoker), on 4 lists (Obsidian Scorpion).

### Side map: The Pale Desert (opens at 19, side of The Glass Dunes)

**Theme.** Pale desert. Past the glass the sand turns white as bone, and so does the sun. No water, no shade, and the horizon never stays where you left it. Field: Heatwave. New in its fights: Rabid, Weakness, Sociable, Full Moon.

**Side map call:** a full delve into a new location (3 unique). Its own biome (the pale desert past the glass), 9 fights.

**Unique (3).**
- Quicksand Queen (Very Rare, map 18-A-9, cost 1): Pale desert; skirmish reward of 18-A-9
- Skull Vulture (Uncommon, pack 3, cost 1): Pale desert
- Sand Widow (Common, pack 3, cost 2)  💰cost 2: Pale desert; also fits The Glass Dunes

**Carried (5).** Dust Hyena (from Savanna Reaches); Caustic Scorpion (from The Glass Dunes, added); Sandfish (from The Glass Dunes, added); Dust-devil Kestrel (from The Glass Dunes, added); Thorny Devil (from The Glass Dunes, added)

**Cut (14).**
- Armadillo Guard (Common): pack only (Pack 3)
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Dune Jackal (Common): pack only (Pack 3)
- Dune Jackal Scout (Common): pack only (Pack 3)
- Horned Lizard (Uncommon): pack only (Pack 3)
- Meerkat Burrower (Common): pack only (Pack 3)
- Meerkat Sentry (Common): pack only (Pack 3)
- Moon Jerboa (Uncommon): pack only (Pack 3)
- Pale Oryx (Uncommon): pack only (Pack 3)
- Rabid Jackal (Uncommon): pack only (Pack 3)
- Sandstorm Roc (Common): pack only (Pack 3)
- Stonedrop Vulture (Uncommon): pack only (Pack 3)
- Trapdoor Spider (Rare): pack only (Pack 2)
- Carrion Crow (Common): to The Briar Maze (Map 12)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 1.00 (unique 1.33); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 2 on 4+ lists, 6 theme misfit. Left: none.

### Map 20: The Sundered Peak (m11)

**Theme.** Volcanic & ash, Mountain & sky. The campaign’s final approach — apex predators, no scouts left to send ahead of you. Ten regions down. One throne left. Field: Heatwave (5 of 11 fights). New in its fights: Fire Arrow, Carrion.

**Unique (8).**
- Ash Cloud Condor (Rare, map 20-2, cost 1): Volcanic & ash; skirmish reward of 20-2; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Magma Wraith (Uncommon, map 20-7, cost 1): Volcanic & ash; skirmish reward of 20-7; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Ossuary Lammergeier (Super Rare, map 20-10, cost 1): Volcanic & ash; skirmish reward of 20-10; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Pack Mule (Common, map 20-1, cost 0) 🪵: Volcanic & ash; skirmish reward of 20-1; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Woodland Brawler (Very Rare, map 20-9, cost 1): Volcanic & ash; skirmish reward of 20-9; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Ashbone Ghoul (Common, pack 3, cost 0): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Cave Warlord (Common, pack 3, cost 4)  💰cost 4: Volcanic & ash; also fits The Glimmer Depths, Ashen Spurn, Eye of the Volcano, Volcano Lair
- Cinder Skeleton (Common, pack 3, cost 1): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera

**Carried (3).** Cinder Stoker (from Ashen Spurn, added); Echidna Quillshot (from Ashen Spurn, added); Fire Salamander (from Ashen Spurn, added)

**Cut (9).**
- Bear Cub (Uncommon): pack only (Pack 3)
- Magma Salamander (Rare): pack only (Pack 3)
- Pall Wraith (Rare): pack only (Pack 3)
- Obsidian Lich (Rare): pack only (Pack 3)
- Ash Moth (Common): pack only (Pack 3)
- Glasswing Butterfly (Rare): pack only (Pack 3)
- Firefly Swarm (Uncommon): pack only (Pack 3)
- Fire Hawk (Rare): pack only (Pack 3)
- Marmot Stonecutter (Common): pack only (Pack 2)

**Mix.** 11 cards: 1 high-cost (9%), 1 generators (9%), 9 plain (82%); average cost 1.00 (unique 1.12); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: on 4 lists (Cinder Stoker).

### Side map: Eye of the Volcano (opens at 20, side of The Sundered Peak)

**Theme.** Volcanic & ash. Down inside the crater, where the dead keep the fire company and the living learned not to need much. Field: Sulphur Fumes (2 of 7 fights). New in its fights: Sacrifice, Grit.

**Side map call:** ask owner (2 unique). Inside the Sundered Peak's crater, same volcanic biome, but 7 fights and its own people (the dead at the fire).

**Unique (2).**
- The Contradiction (Epic, map 20-A-4, cost 1): Volcanic & ash; skirmish reward of 20-A-4; also fits Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Gorge Wyrm (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits Ashen Spurn, The Sundered Peak, Volcano Lair, The Rimefire Caldera

**Carried (6).** Cinder Stoker (from Ashen Spurn); Ashbone Ghoul (from The Sundered Peak, added); Cinder Skeleton (from The Sundered Peak, added); Pack Mule (from The Sundered Peak, added); Obsidian Scorpion (from The Glass Dunes); Ash Cloud Condor (from The Sundered Peak, added)

**Cut (7).**
- Basalt Boar (Common): pack only (Pack 3)
- Blessed Avatar (Common): no home yet
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Cinder Imp (Common): no home yet
- Fumarole Ibex (Rare): pack only (Pack 3)
- Silverback Brawler (Common): pack only (Pack 3)
- Sulfur Vent Crab (Uncommon): pack only (Pack 2)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.88 (unique 2.00); resources: lumber.

**HUB9 flags.** Resolved: 3 on 4+ lists, 2 no source, 1 listed before it is obtainable. Left: on 4+ lists (Cinder Stoker, Obsidian Scorpion), on 4 lists (Pack Mule).

### Side map: Volcano Lair (opens at 20, side of The Sundered Peak)

**Theme.** Volcanic & ash. Where the mountain's fire is born. Something vast sleeps in it, and it is waking. Field: Sulphur Fumes. New in its fights: Frenzy, Stun.

**Side map call:** additional challenges on the parent map (1 unique). The Sundered Peak's own finale: the dragon's lair and the world boss, 4 fights.

**Unique (2).**
- Fire Drake Hatchling (Heroic, map 20-B-4, cost 2)  💰cost 2: Volcanic & ash; skirmish reward of 20-B-4
- The Caldera Wyrm (Heroic, map 20-B-4, cost 0)  💰cost 0: Volcanic & ash; skirmish reward of 20-B-4; moved from Volcano Lair

**Carried (6).** Magma Titan (from Ashen Spurn); Cinder Stoker (from Ashen Spurn); Pack Mule (from The Sundered Peak, added); Obsidian Scorpion (from The Glass Dunes); Cave Warlord (from The Sundered Peak, added); Magma Wraith (from The Sundered Peak, added)

**Cut (10).**
- Basalt Boar (Common): pack only (Pack 3)
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Cinder Hornet (Common): to The Rimefire Caldera (Map 22)
- Cinder Imp (Common): no home yet
- Ember Centipede (Common): pack only (Pack 3)
- Ember Jackal (Rare): pack only (Pack 3)
- Gorge Wyrm (Common): to Eye of the Volcano (Map 20)
- Pyroclast Wyrm (Common): pack only (Pack 3)
- Silverback Brawler (Common): pack only (Pack 3)
- Tide Spirit (Rare): pack only (Pack 3)

**Mix.** 8 cards: 4 high-cost (50%), 1 generators (12%), 3 plain (38%); average cost 1.38 (unique 1.00); resources: lumber, metal, stone. **Flag: 2 unique over its 1 (skirmish rewards).**

**HUB9 flags.** Resolved: 3 on 4+ lists, 2 listed before it is obtainable, 1 no source. Left: on 4+ lists (Cinder Stoker, Obsidian Scorpion), on 4 lists (Pack Mule).

### Map 21: The Quiet Summit (m21)

**Theme.** Mountain & sky. Above the clouds, the storm has passed. The air is thin and still, and everything that lives this high has had all night to rest. Field: Quiet Contemplation (21-6 only) (1 of 6 fights). New in its fights: Scatterbrained, Expose.

**Unique (8).**
- Pika Hoarder (Common, map 21-1, cost 0): Mountain & sky; skirmish reward of 21-1; also fits The Old Bramble, The Rimefire Caldera
- Snow Owl Sentinel (Super Rare, map 21-6, cost 1): Mountain & sky; skirmish reward of 21-6; also fits The Ice Hollow, The Rimefire Caldera
- Snow Leopard (Very Rare, pack 4, cost 1): Mountain & sky; also fits The Rimefire Caldera
- Glacier Yak (Common, pack 4, cost 3)  💰cost 3: Mountain & sky; also fits The Ice Hollow, The Rimefire Caldera
- Eagle Sharpshooter (Common, pack 4, cost 2)  💰cost 2: Mountain & sky; also fits The Rimefire Caldera
- Mountain Goat Climber (Uncommon, pack 1, cost 0): Mountain & sky; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Scree Goat (Uncommon, pack 3, cost 1): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Rimefire Caldera
- Golden Magpie (Uncommon, none, cost 0) 🪵: Mountain & sky; brought in for the mix (generator); added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak

**Carried (3).** Alpine Marmot (from Eyrie Heights); Golden Eagle Diver (from Gannet Cliffs); Talus Pika (from Wolfsbane Tundra, added)

**Mix.** 11 cards: 2 high-cost (18%), 2 generators (18%), 7 plain (64%); average cost 0.82 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 2 on 4+ lists. Left: no source yet (proposed home: this map's pack tier) (Golden Magpie).

### Side map: The Old Bramble (opens at 21, side of Bramblewood Outskirts)

**Theme.** Meadow & woodland, Taiga. The thorns around the Outskirts are older than the village. Something waited in them for you to grow strong. Field: no field effect. New in its fights: Counterattack, Spiteful.

**Side map call:** additional challenges on the parent map (1 unique). A return to the Outskirts' thorns for a late challenge, 4 fights.

**Unique (1).**
- Ent (Rare, map 0-B-4, cost 0): Meadow & woodland; skirmish reward of 0-B-4

**Carried (7).** Tomcat (from Bramblewood Outskirts, added); Terrier Pup (from Bramblewood Outskirts, added); Chipmunk Cavalry (from Bramblewood Outskirts, added); Chipmunk Skirmisher (from Bramblewood Outskirts, added); Dune Packrat (from The Glass Dunes, added); Ant Hill (from Bramblewood Outskirts, added); Box Turtle (from Bramblewood Outskirts, added)

**Cut (8).**
- Burrow Rabbit (Starter): Base card
- Elder Willow (Common): pack only (Pack 4)
- Glacier Wolf Pack (Common): pack only (Pack 3)
- Otter Paddler (Starter): Base card
- Pond Trout (Starter): Base card
- Thornwood Palisade (Rare): pack only (Pack 4)
- Trash Panda Trickster (Common): to Smugglers' Grotto (Map 7)
- Tunnel Ant (Rare): Base card

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 0.50 (unique 0.00); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit, 1 on 4+ lists. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill, Box Turtle).

### Side map: The Ice Hollow (opens at 21, side of Wolfsbane Tundra)

**Theme.** Tundra & ice. A cave of blue ice under the tundra. The cold in here has teeth. Field: Slippery ice. New in its fights: Molting.

**Side map call:** additional challenges on the parent map (1 unique). An ice cave under Wolfsbane Tundra, the same tundra biome, 4 fights.

**Unique (1).**
- Greenland Shark (Rare, map 17-A-4, cost 1): Tundra & ice; skirmish reward of 17-A-4; also fits The Rimefire Caldera

**Carried (7).** Glacial Ape-King (from Wolfsbane Tundra, added); Lone Grey Wolf (from Wolfsbane Tundra, added); Snow Ermine (from Wolfsbane Tundra, added); Frost Hare Sprinter (from The Pinewood Taiga); Polar Bear (from Wolfsbane Tundra, added); Snow Bunting Archer (from Wolfsbane Tundra, added); Talus Pika (from Wolfsbane Tundra, added)

**Cut (9).**
- Alpha Howler (Common): to The Pinewood Taiga (Map 16)
- Arctic Fox Raider (Rare): pack only (Pack 4)
- Arctic Tern (Uncommon): pack only (Pack 4)
- Boreal Elk (Common): pack only (Pack 3)
- Harp Seal Pup (Common): pack only (Pack 4)
- Ice-Crevasse Wolf (Rare): pack only (Pack 4)
- Krill Swarm (Common): pack only (Pack 4)
- Lemming Swarm (Common): pack only (Pack 4)
- Ringed Seal (Common): pack only (Pack 4)

**Mix.** 8 cards: 1 high-cost (12%), 1 generators (12%), 6 plain (75%); average cost 1.00 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: none.

### Map 22: The Rimefire Caldera (m22)

**Theme.** Volcanic & ash, Tundra & ice, Mountain & sky. Still above the clouds, the road crosses a crater that never went cold: snow on black glass, steam from every crack, and things that learned to live in both. Field: Frigid (frozen ground). New in its fights: Ice Bolt.

**Unique (8).**
- Rimefire Salamander (Rare, map 22-2, cost 1): Volcanic & ash; skirmish reward of 22-2; also fits Basalt Foundry
- Caldera Snow Leopard (Super Rare, map 22-8, cost 1): Volcanic & ash; skirmish reward of 22-8; also fits Basalt Foundry
- Ür-Elk (Very Rare, map 22-6, cost 1): Tundra & ice; skirmish reward of 22-6
- Ice Petrel (Uncommon, pack 4, cost 1): Volcanic & ash; also fits Basalt Foundry
- Badger Berserker (Rare, pack 4, cost 1): kin: Caves & burrows
- Cinder Gecko (Common, pack 4, cost 0): Volcanic & ash; also fits Basalt Foundry
- Cinder Hornet (Common, pack 4, cost 2)  💰cost 2: Volcanic & ash; also fits Basalt Foundry
- Permafrost Mammoth (Common, pack 4, cost 3)  💰cost 3: Volcanic & ash; also fits Basalt Foundry

**Carried (3).** Gorge Wyrm (from Eye of the Volcano); Ossuary Lammergeier (from The Sundered Peak, added); Pumice Beetle (from Ashen Spurn, added)

**Cut (4).**
- Fumarole Ibex (Rare): pack only (Pack 3)
- Weathervane Swift (Rare): pack only (Pack 4)
- Ashwing Ptarmigan (Rare): pack only (Pack 4)
- Petrified Tree (Rare): pack only (Pack 4)

**Mix.** 11 cards: 3 high-cost (27%), 1 generators (9%), 7 plain (64%); average cost 1.36 (unique 1.25); resources: stone.

**HUB9 flags.** Resolved: 1 on 4+ lists, 3 theme misfit. Left: none.

### Side map: The Long Burrow (opens at 22, side of The Rimefire Caldera)

**Theme.** Caves & burrows.  Field: no field effect. New in its fights: Friction, Heavy Metal.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 6 cards.

### Map 23: The Goldfeather Siege (m23)

**Theme.** Village & keep. Down from the heights at last, onto churned fields below a golden wall. The Magnate's hired army is camped outside it, and it has elephants. Field: Arrow Slits. New in its fights: Arrow count, Vanguard.

**Unique (8).**
- Testudo Tortoise (Rare, map 23-2, cost 2)  💰cost 2: Village & keep; skirmish reward of 23-2; also fits Goldfeather Keep
- War Elephant (Super Rare, map 23-8, cost 3)  💰cost 3: Village & keep; skirmish reward of 23-8; also fits Goldfeather Keep
- Triumphvirate (Unique, map 23-8, cost 3)  💰cost 3: its skirmish reward; skirmish reward of 23-8; moved from The Goldfeather Siege
- Badger Trench Digger (Common, pack 4, cost 2)  💰cost 2: Village & keep; also fits Goldfeather Keep
- Howdah Archers (Rare, pack 4, cost 1): Village & keep; also fits Goldfeather Keep
- Siege Rhino (Rare, pack 4, cost 1): Village & keep; also fits Goldfeather Keep
- Trebuchet Crew (Rare, pack 4, cost 2)  💰cost 2: Village & keep; also fits Goldfeather Keep
- Land Tiller (Common, pack 3, cost 0) 🪵: Village & keep; brought in for the mix (generator); moved from The Long Grass; also fits The Old Bramble, Goldfeather Keep

**Carried (3).** Pack Mule (from The Sundered Peak); Stoat Cutthroat (from The Long Grass, added); Border Collie (from The Long Grass, added)

**Cut (5).**
- Mouse Sapper (Common): pack only (Pack 2)
- Balloon Archer (Uncommon): pack only (Pack 2)
- Beetle Battering-Ram (Rare): pack only (Pack 4)
- Marching Elephant (Rare): pack only (Pack 4)
- Werebadger (Rare): pack only (Pack 4)

**Mix.** 11 cards: 5 high-cost (45%), 2 generators (18%), 4 plain (36%); average cost 1.45 (unique 1.75); resources: lumber.

**HUB9 flags.** Resolved: 3 theme misfit. Left: none.

### Side map: Basalt Foundry (opens at 23, side of Ashen Spurn)

**Theme.** Volcanic & ash. A furnace of cracked black stone — everything here glows from the inside. Field: Ashy. New in its fights: Core Evil, Chained, Penance, Inherent Darkness.

**Side map call:** a full delve into a new location (3 unique). A furnace city of its own (10 fights, the metal and fire workshops), a full map in size.

**Unique (3).**
- Ember Revenant (Epic, map 19-A-10, cost 2)  💰cost 2: Volcanic & ash; skirmish reward of 19-A-10
- Anvilwhisker Otter (Uncommon, none, cost 2)  💰cost 2: hand call: an otter smith that forges weapons for Stone: the foundry's workshop; added; also fits Sunken Hollow, Lilypad Reach
- Ore-Smelter Mole (Uncommon, pack 1, cost 1) 🔩: hand call: a mole that makes Metal belongs in the foundry: Basalt Foundry introduces Metal; added; also fits Smugglers' Grotto, Caves & Alcoves, The Glimmer Depths

**Carried (5).** Cinder Gecko (from The Rimefire Caldera); Ashbone Ghoul (from The Sundered Peak); Quill Volley (from Ashen Spurn, added); Ash Cloud Condor (from The Sundered Peak); Echidna Quillshot (from Ashen Spurn, added)

**Cut (15).**
- Basalt Boar (Common): pack only (Pack 3)
- Beaver Lumberjack (Common): to Bramblewood Outskirts (Map 0)
- Chained Binturong (Uncommon): no home yet
- Cinder Imp (Common): no home yet
- Ember Jackal (Rare): pack only (Pack 3)
- Flagellant Vulture (Uncommon): no home yet
- Fruit-bat Familiar (Uncommon): no home yet
- Hellbender (Common): no home yet
- Hercules Beetle (Rare): to The Canopy (Map 18)
- Magma Salamander (Rare): pack only (Pack 3)
- Obsidian Scorpion (Rare): to The Glass Dunes (Map 18)
- Pyroclast Wyrm (Common): pack only (Pack 3)
- Sulfur Vent Crab (Uncommon): pack only (Pack 2)
- Tide Spirit (Rare): pack only (Pack 3)
- Vampire Finch (Uncommon): no home yet

**Mix.** 8 cards: 2 high-cost (25%), 1 generators (12%), 5 plain (62%); average cost 1.00 (unique 1.67); resources: metal.

**HUB9 flags.** Resolved: 4 on 4+ lists, 7 no source. Left: no source yet (proposed home: this map's pack tier) (Anvilwhisker Otter), theme misfit (Anvilwhisker Otter).

### Map 24: Goldfeather Keep (m24)

**Theme.** Village & keep. Through the gate at last. Inside the walls everything is gilded, guarded and counted, and the Magnate Duck is waiting at the top of the keep. Field: Arrow Slits. New in its fights: Sentry, Hoard, Taunt, Reach.

**Unique (8).**
- Gilded Swan Knight (Super Rare, map 24-8, cost 1): Village & keep; skirmish reward of 24-8
- Iron Warden (Epic, map 24-6, cost 1): Village & keep; skirmish reward of 24-6
- Battlement Heron (Rare, map 24-5, cost 1): Village & keep; skirmish reward of 24-5
- Duckling Squadron (Common, pack 4, cost 0): Village & keep
- Elderhorn Monarch (Common, pack 4, cost 3) 🪵 💰cost 3: Village & keep
- Mallard Halberdier (Rare, pack 4, cost 1): Village & keep
- Tax-Collector Teal (Uncommon, pack 4, cost 0) 🪵: Village & keep
- Goose Sentry (Rare, pack 4, cost 1): Village & keep

**Carried (3).** Lodge Engineer (from Lilypad Reach); Badger Trench Digger (from The Goldfeather Siege, added); Howdah Archers (from The Goldfeather Siege, added)

**Cut (1).**
- Mallard Marauder (Rare): pack only (Pack 2)

**Mix.** 11 cards: 3 high-cost (27%), 3 generators (27%), 7 plain (64%); average cost 1.18 (unique 1.00); resources: lumber.

## Cards with no home yet (94)

Abbey Goose, Armory, Ash Imp, Ashmantle Fiend, Aye-aye Prowler, Bee Drone, Blackmass Acolyte, Blessed Avatar, Bog Shrew, Bone Diviner, Brimstone Hound, Candle Moth, Canopy Sloth Guardian, Cathedral Eagle, Chained Binturong, Chapel Sparrow, Chapel Tortoise, Chilli Parrot, Cinder Imp, Clinging Leech, Colony, Conger Eel, Corpse-flower Beetle, Dread Bell, Ember Wisp, Flagellant Vulture, Friar Badger, Fruit-bat Familiar, Gale Sprite, Geode Scorpion, Glintsnatch Magpie, Gloom Gibbon, Glowing Gecko, Glowworm Cluster, Gnawed Matriarch, Great Gate, Grovebearer Dragon-Turtle, Hagfish Silencer, Hanging Loafer, Hellbender, Hollow-belly Rat, Hymn Wren, Ice Fish, Kelpborn Otter, Leaf Chameleon, Leopard Seal, Lichen Tortoise, Lurking Dread, Marshal Tuskwell, Mire Rat, Mirrorhide Mutant, Moon Jelly, Mother Carrier, Nest, Oilbird, Old-Growth Tortoise, Phoenix Mushrooms, Pit Glutton, Poison Dart Frog, Puppeteer Imp, Rabbit Kit, Raven Harbinger, Raven Hexcaller, Rimeheart Colossus, Roseate Spoonbill, Salamander Pyromancer, Sanderling, Selkie Wavebinder, Shrine Acolyte, Shrine Bell-Ringer, Shrine High Priest, Slow Loris, Slowpoke Sentinel, Soldier Ant, Sperm Whale Elder, Starfall Owl, Stoneheart Golem, Storm Heron, Stormcaller, Strangler Vine, Supernova Jelly, Swarm Matriarch, Tardigrade, The Sixfold, The Thistle Baron, Thunder Lizard, Tithe Collector, Toucan Courier, Vampire Finch, Velvet Worm, Vigil Owl, Wallcreeper, War-Drum Mandrill, Water Scorpion

Given a home here though they have no source yet (they would join that map's pack tier): Ant Hill, Anvilwhisker Otter, Beaver Lumberjack, Golden Magpie.

## Pack only, by pack

- **Hedgerow Pouch** (113): Acacia Giraffe, Alley Cat, Anaconda Coil, Anhinga Spearbird, Arc Bat, Beachcomber Sanderling, Beaver Builder, Beetle Grunt, Blister Beetle, Bog Revenant, Bogfire Newt, Bramble Gauntlet, Briarback Hedgehog, Buzzed Chipmunk, Caiman Hatchling, Camouflage Frog, Carrion Beetle, Compost Grub, Conch Crawler, Coral Current Eel, Cottonmouth Matriarch, Crocodile Ambusher, Crown Pretender, Cuttlefish Illusionist, Cypress Root Lurker, Dam Wall, Dam-Keeper Beaver, Diving Bell Spider, Dolphin Knight, Driftwood Crab, Eagle Diver, Elder Tortoise, Ember Tetra, Farm Dog, Fire Ant Raft, Frostbitten Wolverine, Fulmar Spitter, Giant Water Bug, Grass Snake, Great Crested Grebe, Great Skua, Greater Siren, Grindstone Boar, Hammerhead Shark, Hawk Arrowkeeper, Heartwood Treant, Honey Badger Fury, Humpback Elder, Ironback Gorilla, Ironmaw Warwolf, Irradiated Couatl, Lamprey, Lotus Frog, Lunar Howler, Malachite Golem, Marsh Gas Toad, Marsh Harrier, Marsh-mallow Hare, Mayfly Dancer, Migration Leader, Mire Witch-Heron, Moat Snapper, Moonlit Hare, Moray Ambusher, Narwhal Lancer, Night Watchman, Owl Fletcher, Owl Sentinel, Oyster Bank, Oystercatcher, Paper Wasp, Parish Sergeant, Plague Gnat Cloud, Plains Zebra, Pond Algae, Pond Paddler, Puddle Changeling, Puddle Skimmer, Puffball Bombardier, Pyrenean Desman, Quarry Troll, Rafflesia, Raft Spider, Rainmaker Frog, Raven Scout, Razorbill, Reef Manta Glider, River Mink, Rock Pool Starfish, Rot-Swollen Carcass, Shieldbearer Hound, Shoal Shark, Signal Crayfish, Slow-worm, Smokescreen Raccoon, Sparrow Chick, Sphagnum Vole, Spring Rain, Static Bat, Swamp Alligator, Sworn Shieldbearer, Tailwind, The Unremembered, Thick Fog, Tide Pool Crab, Tidepool Trapper Crab, Timber Wolf Pack Leader, Voltwing Bat, War Hound, Water Shrew, Weredog, Willow-o'-Wisp, Woodcock Lookout
- **Tidemire Chest** (119): Alpine Salamander, Alpine Swift, Antler Skirmisher, Archerfish, Baby Bat, Baby Horned Capybara, Badger Sapper, Balloon Archer, Barkplate Beetle, Barnacle Fortress, Beaver Feller, Blind Cave Fish, Bloodscent Shark, Boar Rampager, Bog Behemoth, Bog Leech, Bombardier Beetle, Buck Brawler, Carrion Fly Swarm, Cave Centipede, Cave Pseudoscorpion, Cleaner Wrasse, Clover Butterfly, Clownfish Scout, Coffer Mimic, Cone Snail, Crown-of-thorns Star, Dynamite Packrat, Echo Keeper, Electric Catfish, Elephant-nose Fish, Feral Tuskboar, Field Crow, Firetail Trickster, Fishing Cat, Fox Kit, Fox Sharpshot, Fox Warchief, Full Moon, Fungus Gnat Cloud, Gale Swift, Gallery Orb-Weaver, Gangrenous Leech, Gatling Hog, Ghost Crayfish, Giant Clam, Gravel Mole, Grotto Lobster, Guano Beetle, Hawthorn Shieldbug, Hazel Coppice, Hollow Oath-Keeper, Horseshoe Crab, Ironclaw Fiddler, King Maker, Kraken Spawnling, Ladybird Guard, Leopard Slug, Limpet Clinger, Lion's Mane Jelly, Lionfish, Magpie Collector, Mallard Marauder, Mantis Shrimp, Margay, Marmot Stonecutter, Millipede Hauler, Minnow Skitter, Mosquito Cloud, Mouse Sapper, Mudflat Godwit, Nightjar Drifter, Nightshade Moth, Pack Rat Looter, Pelican Diver, Pigeon Peon, Pill Bug, Pine Marten, Piranha Shoal, Proboscis Monkey, Puddle Hopper, Pufferfish Bulwark, Quill-Thorn Boar, Raccoon Warlord, Red-backed Salamander, Rodent King, Salvager Hermit Crab, Sawfish, Sea Cucumber, Sea Hare, Seed-cache Squirrel, Skunk Gasser, Sleepless Shrew, Stag Beetle, Stag Knight, Subterraneaner, Sulfur Cinder Moth, Sulfur Vent Crab, Sunbittern Strider, Swamp Rabbit, Swordfish Spearman, Tasmanian Devil, Thorn Shrike, Thornvine Lasher, Trapdoor Spider, Tunnel Wyrm, Turtle Bastion, Tusked Vanguard, Vampire Bat, Vampire Bat Nurse, Village Miller, Voltaic Eel, War Panther, Warren Scout, Webspire Sentinel, Whale Shark, Whip Spider, Woodpecker Sapper, Yellow-bellied Sea Snake
- **Highcrest Case** (93): Alpine Avalanche, Amber Cicada, Ancient Sloth Titan, Anvil Thrush, Armadillo Guard, Armored Mastiff, Ash Moth, Barrow Leech, Basalt Boar, Bear Cub, Beluga, Blizzard, Bonebreaker, Boreal Elk, Bramblewood Macaque, Cave Bat Swarm, Cave Bear, Cave Cricket, Cave Flitter, Cave Swiftlet, Chipmunk Stockpiler, Courier Pigeon, Dhole Runner, Dromedary, Dune Jackal, Dune Jackal Scout, Ember Centipede, Ember Jackal, Fennec Fox, Fire Hawk, Firefly Swarm, Frillneck Duelist, Frost Thistle Lynx, Frostmoon Howler, Fumarole Ibex, Garden Tiger Moth, Glacier Wolf Pack, Glasswing Butterfly, Glasswing Moth, Glimmer Spider, Granite Ox Golem, Great Horned Owl, Harbor Seal, Heatwave, Horned Lizard, Howler Monkey, Inland Taipan, Jackrabbit Sprinter, Lovebird, Magma Salamander, Marula Monkey, Meerkat Burrower, Meerkat Sentry, Monarch Wingblade, Mongoose Duelist, Monitor Rambler, Moon Jerboa, Moonshell Snail, Muntjac Barker, Musk Ox Calf, Musk Ox Matriarch, Obsidian Lich, Pack Wolf Reaver, Pale Oryx, Pall Wraith, Pangolin Roller, Phoenix Fledgling, Pinecone Sapper, Porcupine Roller, Pyroclast Wyrm, Rabid Jackal, Raccoon Nightcrew, Ravenous Wolverine, Roadrunner Courier, Rockslide Ram, Sandstorm Roc, Scraper of Skies, Shepherd, Silverback Brawler, Spitting Spider, Springbok Pronker, Springtail Hopper, Squire's Mount, Static Fennec, Stonedrop Vulture, Tarantula Hawk, Termite Forager, Termite Mound, Tide Spirit, Tundra Musk Ox, Vampire Roost, Warhorse Charger, Wolf Pack Runner
- **Pack 4** (16): Arctic Fox Raider, Arctic Tern, Ashwing Ptarmigan, Beetle Battering-Ram, Elder Willow, Harp Seal Pup, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Marching Elephant, Petrified Tree, Ringed Seal, The Magnate Duck, Thornwood Palisade, Weathervane Swift, Werebadger
- **Faction pool** (53): Birdlime Dauber, Clap-net Trapper, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Daily Post, Dawn Bellringer, Dominion Nestguard, Ferry Toll-Frog, Ford Kingfisher, Gold-throated Acolyte, Hedge Changeling, Helmeted Otter, Honeyjoe Brewer, Hummingbird Needler, Hush-Wing Spy, Lantern Bearer, Marshal of Rivergate, Mist-net Otter, Nectar Sipper, Nectar Vintner, Net Thrower, Old Willow of the Ford, Optio of the Ford, Otter Angler, Otter Ferryman, Otter Flag Bearer, Otter Lantern Bearer, Otter Netmender, Otter Riverguard, Otter Scout, Otter Shieldback, Petal Fletcher, Pike Lancer, River Warden, Riverbed Diver, Rivergate Drummer, Rivergate Recruit, Rivergate Tribune, Riverside Peddler, Riverstone Slinger, Royal Guard, Ruby-Throat Duelist, Shell-Cracker, Shellwright Apprentice, Sunfeather Scout, Sunspire Choirmother, Sunspire Envoy, Sunspire Sky-Sovereign, Sunthroat Courier, Swordbill Challenger, Truce Heron, Violet Vane Fletcher, Voidfeather Scout
- **Mystery Booster** (11): Glass Changeling, Glass Golem, Inside-Out Hedgehog, Irradiated Axolotl, Irradiated Glow Wyrm, Mirror Moth, Snail Mail, Teatime Toad, Two-Headed Calf, Upside-Down Bat, Wrong-Way Salmon

