# THEME2: unique cards per map, the 12-16 / 11-14 lists and the mix (proposal, 2026-10-28)

The owner's balancing plan (10-28 21:40), steps 1 and 2: *"uniquely identifying unique cards for each map"* and the cut, with the sizes the owner set at 22:47: *"side maps -> i meant submaps. For main maps, there can be 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards + 10+ carried over, so 11-14. Don't worry about the other cards."* With step 4's mix in view: *"A map should have a range of cards that cost high, and cost generators and normal creatures."*

**A proposal. Nothing in `canonical/` changes.** Data: `docs/balance/theme2-proposal-2026-10-28.json`; built by `tools/theme2_proposal_2026_10_28.py`; shown in the hub's 🗺️ Map cards tab under **Proposal**. Decision: THEME1-1. It replaces THEME1 (`theme1-proposal-2026-10-28.md`, kept as history).

## How it was built

- Every card gets **one** home: the map whose theme it fits best (its biomes in `unit-themes.json` against the map's), with its present home (its pack map or skirmish map), its place on the list now, the fights that play it and its showcase / first-clear-pack label as tie-breakers. Highest scores are placed first; a card bumped from a full map goes to its next-best map with room.
- Hard limits: a card is never on a map before it is first obtainable (a pack tier's first map: Pack 2 from Map 7, Pack 3 from Map 14), never past the rarity the map reveals. A skirmish reward stays on its own map.
- **Main maps: 8-11 unique + 4-5 carried, 12-16 in all.** The first 8 unique as THEME1; slots 9-11 take only strongly themed cards (the map's own or other biome). Then 5 carried cards from earlier maps (4 beside a full 11), picked for the mix: the best-fitting high-cost card, generator and plain creature first, then by score. Map 0 carries Base cards.
- **Submaps: 1-3 unique + 10 or more carried, 11-14 in all.** THEME1's table below: 3 unique for a full delve, 1 for additional challenges, 2 where we ask. The carried cards come from the parent map and earlier maps and must fit the submap (its biome, another of its biomes or a kin biome); 12 in all where enough fit. A submap's skirmish rewards stay, even over its number.
- The mix: high cost = Lumber 2+ or any Stone / Metal cost; a cost generator = a card that makes Lumber, Stone or Metal (Stockpile, Milling, Quarry, Prospector, Pearl Bed, On Ready / On Kill Lumber ...). Every list has at least one of each; where the unique cards have none, a bumped candidate is swapped in or a carried card brings it.
- "Don't worry about the other cards": cards on no list are simply listed at the end, per old pack. No pack-only or no-home calls.
- The tutorial and the endless dungeons (mtut, mm, muc, mlb) keep their lists.

### Submaps: delve or challenge (the owner corrects this table)

| Submap | Opens at | Call | Unique | Why |
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

## The numbers

| | Now | Proposed |
|---|---|---|
| List entries (40 lists) | 613 | 559 |
| Different cards on a list | 509 | 307 (302 unique homes + 5 carried only) |
| Skirmish rewards among the unique | | 108 |
| Cards on no list (packs, faction pool, Mystery Booster, no-source creatures) | | 426 |

| Old pack | Maps | Cards | On a list now | Unique on a map | (in its range) | Carried only | On no list |
|---|---|---|---|---|---|---|---|
| Hedgerow Pouch (tier 1) | Maps 0-6 | 145 | 87 | 52 | 49 | 0 | 93 |
| Tidemire Chest (tier 2) | Maps 7-13 | 154 | 132 | 56 | 54 | 0 | 98 |
| Highcrest Case (tier 3) | Maps 14-20 | 126 | 111 | 53 | 52 | 0 | 73 |
| Pack 4 (tier 4) | Maps 21-27 | 33 | 32 | 19 | 19 | 0 | 14 |
| Faction pool (tier 11) | - | 53 | 3 | 0 | 0 | 0 | 53 |
| Mystery Booster (tier 99) | - | 11 | 0 | 0 | 0 | 0 | 11 |
| No source (creatures) | - | 98 | 19 | 14 | 0 | 0 | 84 |

## Per map, in road order

| Map | No | Now | Proposed | Unique | Carried | Cut | Added | High / Gen / Plain | Avg cost | Mix flags |
|---|---|---|---|---|---|---|---|---|---|---|
| Bramblewood Outskirts | 0 | 25 | 15 | 10 | 5 | 16 | 6 | 1 / 1 / 13 | 0.33 | - |
| Tutorial | 0 | 18 | kept | | | | | | | |
| Thistlewood | 1 | 14 | 15 | 11 | 4 | 4 | 5 | 1 / 1 / 13 | 0.40 | - |
| Pebble Beach | 2 | 15 | 15 | 11 | 4 | 5 | 5 | 1 / 3 / 11 | 0.40 | - |
| Gannet Cliffs | 3 | 15 | 15 | 10 | 5 | 6 | 6 | 1 / 1 / 13 | 0.60 | - |
| Sunken Hollow | 4 | 16 | 15 | 11 | 4 | 6 | 5 | 1 / 2 / 12 | 0.60 | - |
| Gatorback Swamp | 5 | 21 | 15 | 11 | 4 | 9 | 3 | 6 / 2 / 7 | 1.00 | - |
| Sable Swampmire | 6 | 19 | 15 | 11 | 4 | 8 | 4 | 3 / 2 / 10 | 0.87 | - |
| &nbsp;&nbsp;↳ Lilypad Reach | 6 | 20 | 13 | 3 | 10 | 15 | 8 | 2 / 2 / 10 | 0.69 | - |
| Murgle Mayhem | 6 | 6 | kept | | | | | | | |
| The Morel Hollow | 7 | 17 | 15 | 11 | 4 | 6 | 4 | 2 / 3 / 10 | 0.73 | - |
| &nbsp;&nbsp;↳ Smugglers' Grotto | 7 | 12 | 12 | 2 | 10 | 10 | 10 | 2 / 2 / 8 | 0.50 | - |
| Caves & Alcoves | 8 | 26 | 15 | 11 | 4 | 16 | 5 | 2 / 2 / 11 | 0.80 | - |
| &nbsp;&nbsp;↳ The Mycelium Deep | 8 | 10 | 12 | 1 | 11 | 9 | 11 | 1 / 2 / 9 | 0.75 | - |
| The Kelp Mangroves | 9 | 22 | 15 | 11 | 4 | 12 | 5 | 3 / 2 / 11 | 0.93 | - |
| Coral Current | 10 | 23 | 15 | 11 | 4 | 13 | 5 | 4 / 2 / 9 | 1.27 | - |
| Eyrie Heights | 11 | 14 | 15 | 11 | 4 | 3 | 4 | 1 / 2 / 12 | 0.67 | - |
| &nbsp;&nbsp;↳ The Sunken Depths | 11 | 12 | 12 | 2 | 10 | 8 | 8 | 4 / 2 / 6 | 1.42 | - |
| The Undercroft | 11 | 93 | kept | | | | | | | |
| The Briar Maze | 12 | 16 | 15 | 11 | 4 | 5 | 4 | 2 / 2 / 11 | 0.73 | - |
| &nbsp;&nbsp;↳ Clovermead | 12 | 21 | 12 | 2 | 10 | 18 | 9 | 1 / 1 / 10 | 0.33 | - |
| The Redwood Deep | 13 | 18 | 15 | 11 | 4 | 8 | 5 | 4 / 2 / 9 | 1.07 | - |
| &nbsp;&nbsp;↳ The Sunken Grove | 13 | 9 | 12 | 1 | 11 | 7 | 10 | 4 / 1 / 7 | 0.92 | - |
| Savanna Reaches | 14 | 15 | 15 | 11 | 4 | 5 | 5 | 2 / 3 / 11 | 0.80 | - |
| The Long Grass | 15 | 19 | 15 | 11 | 4 | 8 | 4 | 3 / 3 / 10 | 1.07 | - |
| &nbsp;&nbsp;↳ The Aerie Vault | 15 | 7 | 12 | 1 | 11 | 5 | 10 | 1 / 1 / 10 | 0.75 | - |
| The Pinewood Taiga | 16 | 11 | 15 | 11 | 4 | 0 | 4 | 4 / 2 / 9 | 1.00 | - |
| &nbsp;&nbsp;↳ The Glimmer Depths | 16 | 15 | 12 | 2 | 10 | 13 | 10 | 1 / 2 / 9 | 0.67 | - |
| Wolfsbane Tundra | 17 | 14 | 15 | 11 | 4 | 4 | 5 | 2 / 2 / 11 | 0.93 | - |
| The Glass Dunes | 18 | 16 | 15 | 11 | 4 | 5 | 4 | 1 / 2 / 12 | 1.07 | - |
| &nbsp;&nbsp;↳ The Canopy | 18 | 16 | 13 | 3 | 10 | 13 | 10 | 1 / 1 / 11 | 0.85 | - |
| Ashen Spurn | 19 | 12 | 15 | 11 | 4 | 2 | 5 | 5 / 2 / 8 | 1.40 | - |
| &nbsp;&nbsp;↳ The Pale Desert | 19 | 18 | 13 | 3 | 10 | 14 | 9 | 1 / 2 / 10 | 1.00 | - |
| The Sundered Peak | 20 | 17 | 15 | 11 | 4 | 6 | 4 | 2 / 2 / 11 | 1.00 | - |
| &nbsp;&nbsp;↳ Eye of the Volcano | 20 | 11 | 12 | 2 | 10 | 7 | 8 | 1 / 1 / 10 | 0.83 | - |
| &nbsp;&nbsp;↳ Volcano Lair | 20 | 14 | 12 | 2 | 10 | 10 | 8 | 4 / 1 / 7 | 1.17 | 2 unique over its 1 (skirmish rewards) |
| The Quiet Summit | 21 | 9 | 15 | 11 | 4 | 1 | 7 | 3 / 2 / 10 | 0.80 | - |
| &nbsp;&nbsp;↳ The Old Bramble | 21 | 9 | 12 | 1 | 11 | 7 | 10 | 1 / 1 / 10 | 0.58 | - |
| &nbsp;&nbsp;↳ The Ice Hollow | 21 | 11 | 12 | 1 | 11 | 9 | 10 | 1 / 1 / 10 | 1.00 | - |
| The Rimefire Caldera | 22 | 13 | 15 | 11 | 4 | 3 | 5 | 5 / 1 / 9 | 1.40 | - |
| The Long Burrow | 22 | 6 | kept | | | | | | | |
| The Goldfeather Siege | 23 | 12 | 15 | 11 | 4 | 2 | 5 | 6 / 3 / 7 | 1.33 | - |
| &nbsp;&nbsp;↳ Basalt Foundry | 23 | 19 | 13 | 3 | 10 | 12 | 6 | 3 / 2 / 8 | 0.92 | - |
| Goldfeather Keep | 24 | 10 | 15 | 11 | 4 | 1 | 6 | 5 / 4 / 8 | 1.13 | - |

### Map 0: Bramblewood Outskirts (m1)

**Theme.** Meadow & woodland, River & pond. The first tree-line past the castle walls — mostly scouts and stragglers. Field: no field effect. New in its fights: Flying, Armor, Swarm, Quick.

**Unique (10).**
- Chipmunk Skirmisher (Common, map 0-1, cost 0): Meadow & woodland; skirmish reward of 0-1; also fits Thistlewood, Clovermead, The Old Bramble
- Terrier Pup (Common, map 0-4, cost 0): Meadow & woodland; skirmish reward of 0-4; also fits Thistlewood, Clovermead, The Old Bramble
- Beaver Lumberjack (Common, none, cost 0) 🪵: hand call: Stockpile was built for this beaver (ENG9); Map 0 has the river, and "Beavers build for the Legion" (lore bible): Map 0's cost generator; moved from Basalt Foundry; also fits Sunken Hollow, Lilypad Reach, Ashen Spurn, The Sundered Peak
- House Cat (Common, pack 1, cost 0): Meadow & woodland; also fits Thistlewood, Clovermead, The Old Bramble, The Goldfeather Siege
- Tomcat (Common, pack 1, cost 0): Meadow & woodland; also fits Thistlewood, Clovermead, The Old Bramble
- Chipmunk Cavalry (Common, pack 1, cost 1): Meadow & woodland; added; also fits Thistlewood, Clovermead, The Old Bramble
- Cypress Root Lurker (Common, pack 1, cost 1): Meadow & woodland; moved from Gatorback Swamp; also fits Thistlewood, Gatorback Swamp, Sable Swampmire, Clovermead
- Marsh-mallow Hare (Common, pack 1, cost 0): Meadow & woodland; moved from Gatorback Swamp; also fits Thistlewood, Gatorback Swamp, Sable Swampmire, Clovermead
- Owl Sentinel (Common, pack 1, cost 1): Meadow & woodland; added; also fits Thistlewood, Clovermead, The Old Bramble
- Ant Hill (Common, none, cost 2)  💰cost 2: Meadow & woodland; brought in for the mix (high cost); added; also fits Thistlewood, Clovermead, The Old Bramble

**Carried (5).** Duck Paddler (from base); Ant Scout (from base); Bee Forager (from base); Bee Sentry (from base); Chipmunk Forager (from base)

**Cut (16).**
- Duckling (Starter): Base card
- Honey Bee (Starter): Base card
- Pond Duck (Starter): Base card
- Crossed-Eyes (Starter): Base card
- Garden Snail (Starter): Base card
- Silver Minnow (Starter): Base card
- River Carp (Starter): Base card
- Forager Ant (Common): Base card
- Cottontail (Starter): Base card
- Meadow Rabbit (Starter): Base card
- Fox Kit (Common): on no list
- Otter Kit (Starter): Base card
- Beetle Grunt (Common): on no list
- Cobalt Fledgling (Starter): Base card
- Farm Dog (Common): on no list
- Paper Wasp (Common): on no list

**Mix.** 15 cards: 1 high-cost (7%), 1 generators (7%), 13 plain (87%); average cost 0.33 (unique 0.50); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 3 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Beaver Lumberjack, Ant Hill), on 4 lists (Beaver Lumberjack, Cypress Root Lurker, Marsh-mallow Hare, Ant Hill).

### Submap: Tutorial (opens at 0, side of Bramblewood Outskirts)

**Theme.** Meadow & woodland. Where every road starts. Come back later: the last three fights here are not gentle. Field: no field effect. New in its fights: Diurnal, Bounty, Dynamite, Counterattack.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 18 cards.

### Map 1: Thistlewood (mf)

**Theme.** Meadow & woodland. Thistle and fern under the first big trees — hedgerows, burrows and a lot of small, busy things. Field: Undergrowth. New in its fights: Bounty, Keen Sense, Lumberjack.

**Unique (11).**
- Cricket Drummer (Common, map 1-1, cost 0): Meadow & woodland; skirmish reward of 1-1; also fits Clovermead, The Old Bramble
- Badger Lumberjack (Uncommon, map 1-5, cost 1) 🪵: Meadow & woodland; skirmish reward of 1-5; also fits Clovermead, The Old Bramble
- Dormouse (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Field Mouse (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Field Vole (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Bramble Sprout (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Hedgerow Shrew (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Robin Redbreast (Uncommon, pack 1, cost 0): Meadow & woodland; also fits Clovermead, The Old Bramble
- Slow-worm (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Woodcock Lookout (Common, pack 1, cost 0): Meadow & woodland; also fits Bramblewood Outskirts, Clovermead, The Old Bramble
- Fire Ant Raft (Uncommon, pack 1, cost 1): Meadow & woodland; moved from Gatorback Swamp; also fits Gatorback Swamp, Sable Swampmire, Clovermead, The Sunken Grove

**Carried (4).** Ant Hill (from Bramblewood Outskirts, added); Chipmunk Cavalry (from Bramblewood Outskirts, added); Chipmunk Skirmisher (from Bramblewood Outskirts, added); Cypress Root Lurker (from Bramblewood Outskirts, added)

**Cut (4).**
- Compost Grub (Common): to The Morel Hollow (Map 7)
- Harvest Mouse (Starter): Base card
- Meadow Frog (Common): Base card
- Briarback Hedgehog (Common): on no list

**Mix.** 15 cards: 1 high-cost (7%), 1 generators (7%), 13 plain (87%); average cost 0.40 (unique 0.18); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill, Cypress Root Lurker).

### Map 2: Pebble Beach (mb)

**Theme.** Coast & shore. Where the fields run out into sand — rock pools, gulls and things in shells. Field: Tide. New in its fights: Tide, Crab Claws, Shield, Shell.

**Unique (11).**
- Conch Herald (Uncommon, map 2-4, cost 1): Coast & shore; skirmish reward of 2-4; also fits Smugglers' Grotto
- Fiddler Crab Swarm (Common, map 2-1, cost 0): Coast & shore; skirmish reward of 2-1; also fits Smugglers' Grotto, The Kelp Mangroves
- Grey Seal Bull (Uncommon, map 2-5, cost 1): Coast & shore; skirmish reward of 2-5; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- The Old Shell (Heroic, map 2-5, cost 1): its skirmish reward; skirmish reward of 2-5; moved from Pebble Beach
- Open-Ocean Hermit Crab (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- Pincushion Urchin (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- Tidepool Trapper Crab (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto
- Conch Crawler (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto
- Gull Thief (Common, pack 1, cost 0) 🪵: Coast & shore; also fits Smugglers' Grotto
- Sea Turtle Elder (Common, pack 1, cost 2)  💰cost 2: Coast & shore; also fits Smugglers' Grotto, Coral Current, The Sunken Depths
- Tide Pool Crab (Common, pack 1, cost 0): Coast & shore; also fits Smugglers' Grotto

**Carried (4).** Badger Lumberjack (from Thistlewood, added); Beaver Lumberjack (from Bramblewood Outskirts, added); Bramble Sprout (from Thistlewood, added); Cricket Drummer (from Thistlewood, added)

**Cut (5).**
- Rock Pool Starfish (Common): on no list
- Oystercatcher (Common): on no list
- Oyster Bank (Common): on no list
- Driftwood Crab (Common): on no list
- Beachcomber Sanderling (Common): on no list

**Mix.** 15 cards: 1 high-cost (7%), 3 generators (20%), 11 plain (73%); average cost 0.40 (unique 0.45); resources: lumber.

**HUB9 flags.** Resolved: 1 on 4+ lists. Left: theme misfit (Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Cricket Drummer), no source yet (proposed home: this map's pack tier) (Beaver Lumberjack), on 4 lists (Beaver Lumberjack).

### Map 3: Gannet Cliffs (mc)

**Theme.** Cliffs (sea cliffs, painted cliffs). Where the beach climbs into sheer white cliffs, and every ledge belongs to a bird. Field: no field effect. New in its fights: Diurnal, Reload, Pounce, Mountain Climber.

**Unique (10).**
- Golden Eagle Diver (Uncommon, map 3-7, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-7; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Puffin Diver (Common, map 3-2, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-2; also fits Smugglers' Grotto
- Peregrine Stooper (Uncommon, map 3-5, cost 1): Cliffs (sea cliffs, painted cliffs); skirmish reward of 3-5; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- The Gannet Queen (Heroic, map 3-7, cost 2)  💰cost 2: its skirmish reward; skirmish reward of 3-7; moved from Gannet Cliffs
- Kittiwake Flock (Common, pack 1, cost 0): Cliffs (sea cliffs, painted cliffs); also fits Pebble Beach, Smugglers' Grotto
- Peak Condor (Common, pack 1, cost 1): Cliffs (sea cliffs, painted cliffs); also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Red-billed Chough (Common, pack 1, cost 0): Cliffs (sea cliffs, painted cliffs); also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Fulmar Spitter (Uncommon, pack 1, cost 1): Cliffs (sea cliffs, painted cliffs); also fits Pebble Beach, Smugglers' Grotto
- Razorbill (Uncommon, pack 1, cost 1): Cliffs (sea cliffs, painted cliffs); also fits Pebble Beach, Smugglers' Grotto
- Gannet Nestweaver (Common, pack 1, cost 0) 🪵: Cliffs (sea cliffs, painted cliffs)

**Carried (5).** Conch Crawler (from Pebble Beach, added); Conch Herald (from Pebble Beach, added); Dormouse (from Thistlewood, added); Tomcat (from Bramblewood Outskirts, added); Fiddler Crab Swarm (from Pebble Beach, added)

**Cut (6).**
- Hawk Arrowkeeper (Common): on no list
- Mountain Goat Climber (Uncommon): to The Quiet Summit (Map 21)
- Sparrow Chick (Starter): on no list
- Great Skua (Common): on no list
- Oyster Bank (Common): on no list
- Beachcomber Sanderling (Common): on no list

**Mix.** 15 cards: 1 high-cost (7%), 1 generators (7%), 13 plain (87%); average cost 0.60 (unique 0.80); resources: lumber.

**HUB9 flags.** Resolved: 4 theme misfit, 1 on 4+ lists. Left: on 4+ lists (Golden Eagle Diver), theme misfit (Conch Crawler, Conch Herald, Dormouse, Tomcat, Fiddler Crab Swarm), on 4 lists (Fiddler Crab Swarm).

### Map 4: Sunken Hollow (m2)

**Theme.** River & pond. A flooded lowland — reef-runners and things that never surface first. Field: no field effect. New in its fights: Venomous, Bulwark, Cower.

**Unique (11).**
- Snapstick Turtle (Common, map 4-1, cost 1): River & pond; skirmish reward of 4-1; also fits Lilypad Reach
- Muskrat Lodgekeeper (Uncommon, map 4-4, cost 1): River & pond; skirmish reward of 4-4; also fits Lilypad Reach
- Old Sturgeon (Uncommon, map 4-5, cost 1): River & pond; skirmish reward of 4-5; also fits Lilypad Reach
- Platypus Spur (Uncommon, map 4-3, cost 1): River & pond; skirmish reward of 4-3; also fits Lilypad Reach
- The Drowned Matriarch (Heroic, map 4-5, cost 1): its skirmish reward; skirmish reward of 4-5; moved from Sunken Hollow
- Stone Turtle Warden (Common, pack 1, cost 2)  💰cost 2: River & pond; also fits Bramblewood Outskirts, Lilypad Reach
- Water Shrew (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Lilypad Reach
- Water Vole (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Thistlewood, Lilypad Reach, Clovermead
- Box Turtle (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Thistlewood, Lilypad Reach, Clovermead
- Pyrenean Desman (Uncommon, pack 1, cost 0): River & pond; also fits Lilypad Reach
- Muskrat Reedgatherer (Common, pack 1, cost 0) 🪵: River & pond; brought in for the mix (generator); also fits Bramblewood Outskirts, Lilypad Reach

**Carried (4).** Beaver Lumberjack (from Bramblewood Outskirts, added); Fire Ant Raft (from Thistlewood, added); Marsh-mallow Hare (from Bramblewood Outskirts, added); Cypress Root Lurker (from Bramblewood Outskirts, added)

**Cut (6).**
- River Mink (Uncommon): on no list
- Signal Crayfish (Common): on no list
- Diving Bell Spider (Uncommon): on no list
- Pond Algae (Common): on no list
- Dam-Keeper Beaver (Common): on no list
- Ember Tetra (Uncommon): on no list

**Mix.** 15 cards: 1 high-cost (7%), 2 generators (13%), 12 plain (80%); average cost 0.60 (unique 0.64); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Beaver Lumberjack), on 4 lists (Beaver Lumberjack, Marsh-mallow Hare, Cypress Root Lurker).

### Map 5: Gatorback Swamp (mw)

**Theme.** Swamp & bog. A warm, green, very much alive swamp — toads, leeches and logs that open their eyes. Field: Swamp Fever.

**Unique (11).**
- Alligator Gar (Rare, map 5-7, cost 1): Swamp & bog; skirmish reward of 5-7; also fits Sable Swampmire, The Sunken Grove
- Grass Viper (Uncommon, map 5-4, cost 0): Swamp & bog; skirmish reward of 5-4; also fits Sable Swampmire, The Sunken Grove
- Fen Mink (Uncommon, map 5-6, cost 0): Swamp & bog; skirmish reward of 5-6; also fits Sable Swampmire, The Sunken Grove
- Old Snapjaw (Heroic, map 5-7, cost 2)  💰cost 2: its skirmish reward; skirmish reward of 5-7; moved from Gatorback Swamp
- Constrictor Coil (Common, pack 1, cost 2)  💰cost 2: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Snapper Hatchling (Common, pack 1, cost 0): Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Venomlord Serpent (Common, pack 1, cost 3)  💰cost 3: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Caiman Hatchling (Common, pack 1, cost 0): Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Swamp Alligator (Common, pack 1, cost 2)  💰cost 2: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Crocodile Ambusher (Common, pack 1, cost 2)  💰cost 2: Swamp & bog; also fits Sable Swampmire, The Sunken Grove
- Nutria Reedcutter (Common, pack 1, cost 0) 🪵: Swamp & bog; brought in for the mix (generator); also fits Bramblewood Outskirts, Sunken Hollow, Sable Swampmire, Lilypad Reach

**Carried (4).** Stone Turtle Warden (from Sunken Hollow, added); Muskrat Reedgatherer (from Sunken Hollow, added); Fire Ant Raft (from Thistlewood); Marsh-mallow Hare (from Bramblewood Outskirts)

**Cut (9).**
- Grass Snake (Uncommon): on no list
- Plague Gnat Cloud (Common): on no list
- Buzzed Chipmunk (Common): on no list
- Anhinga Spearbird (Uncommon): on no list
- Marsh Harrier (Uncommon): on no list
- Raft Spider (Common): on no list
- Moat Snapper (Uncommon): on no list
- Alley Cat (Rare): on no list
- Sphagnum Vole (Common): on no list

**Mix.** 15 cards: 6 high-cost (40%), 2 generators (13%), 7 plain (47%); average cost 1.00 (unique 1.09); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: none.

### Map 6: Sable Swampmire (m8)

**Theme.** Swamp & bog. A second, blacker wetland — everything here bites first and asks later. Field: Swamp Fever (3 of 8 fights). New in its fights: Remember, Detonate, Invisible, Daunt.

**Unique (11).**
- Booming Bittern (Uncommon, map 6-2, cost 1): Swamp & bog; skirmish reward of 6-2; also fits The Sunken Grove
- Newt Doctor (Uncommon, map 6-5, cost 0): Swamp & bog; skirmish reward of 6-5; also fits Lilypad Reach, The Sunken Grove
- Adder Ambusher (Rare, map 6-8, cost 1): Swamp & bog; skirmish reward of 6-8; also fits The Sunken Grove
- Poison Dart Croaker (Common, map 6-1, cost 1): Swamp & bog; skirmish reward of 6-1; also fits The Sunken Grove
- The Heron Hag (Heroic, map 6-8, cost 1): its skirmish reward; skirmish reward of 6-8; moved from Sable Swampmire
- Camouflage Frog (Common, pack 1, cost 1): Swamp & bog; also fits Gatorback Swamp, The Sunken Grove
- Marsh Wisp (Common, pack 1, cost 0): Swamp & bog; also fits Gatorback Swamp, The Sunken Grove
- Bogfire Newt (Uncommon, pack 1, cost 0): Swamp & bog; also fits Gatorback Swamp, The Sunken Grove
- Raven Scout (Rare, pack 1, cost 0): Swamp & bog; also fits Gatorback Swamp, The Sunken Grove
- Cane Toad (Uncommon, pack 1, cost 2)  💰cost 2: Swamp & bog; brought in for the mix (high cost); also fits Gatorback Swamp, The Sunken Grove
- Peat-cutter Vole (Common, pack 1, cost 0) 🪵: Swamp & bog; brought in for the mix (generator); also fits Bramblewood Outskirts, Thistlewood, Gatorback Swamp, Clovermead

**Carried (4).** Constrictor Coil (from Gatorback Swamp); Nutria Reedcutter (from Gatorback Swamp, added); Alligator Gar (from Gatorback Swamp, added); Venomlord Serpent (from Gatorback Swamp, added)

**Cut (8).**
- Mire Witch-Heron (Common): on no list
- Carrion Beetle (Uncommon): on no list
- Lotus Frog (Uncommon): on no list
- Lamprey (Common): on no list
- Anaconda Coil (Rare): on no list
- Cottonmouth Matriarch (Rare): on no list
- Giant Water Bug (Uncommon): on no list
- Greater Siren (Rare): on no list

**Mix.** 15 cards: 3 high-cost (20%), 2 generators (13%), 10 plain (67%); average cost 0.87 (unique 0.64); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: none.

### Submap: Lilypad Reach (opens at 6, side of Pebble Beach)

**Theme.** River & pond. A wide, still pond full of lily pads, beaver dams and very territorial ducks. Field: Rain, Tide. New in its fights: Fragile, On ready gold, Regeneration.

**Submap call:** a full delve into a new location (3 unique). A pond of its own (river, lily pads, beaver dams) off a beach map, 7 fights: a new biome, not more of the beach.

**Unique (3).**
- Riverworks Bastion (Common, map 2-A-7, cost 3)  💰cost 3: River & pond; skirmish reward of 2-A-7
- Lodge Engineer (Uncommon, pack 1, cost 2) 🪵 💰cost 2: River & pond; also fits Sunken Hollow, The Goldfeather Siege, Goldfeather Keep
- Shallows Fry (Common, pack 1, cost 0): River & pond; also fits Bramblewood Outskirts, Sunken Hollow

**Carried (10).** Old Sturgeon (from Sunken Hollow); Water Shrew (from Sunken Hollow); Fiddler Crab Swarm (from Pebble Beach, added); Box Turtle (from Sunken Hollow, added); Muskrat Lodgekeeper (from Sunken Hollow, added); Platypus Spur (from Sunken Hollow, added); Pyrenean Desman (from Sunken Hollow, added); Snapstick Turtle (from Sunken Hollow, added); Water Vole (from Sunken Hollow, added); Muskrat Reedgatherer (from Sunken Hollow, added)

**Cut (15).**
- Beaver Builder (Common): on no list
- Camouflage Frog (Common): to Sable Swampmire (Map 6)
- Duckling (Starter): Base card
- Elder Tortoise (Common): on no list
- Ford Kingfisher (Uncommon): on no list
- Great Crested Grebe (Common): on no list
- Guppy (Starter): Base card
- Mangrove Mudskipper (Common): to The Kelp Mangroves (Map 9)
- Mayfly Dancer (Common): on no list
- Minnow Skitter (Common): to The Kelp Mangroves (Map 9)
- Mudpuppy (Common): to The Kelp Mangroves (Map 9)
- Pike Lancer (Rare): on no list
- Poison Dart Croaker (Common): to Sable Swampmire (Map 6)
- Pond Duck (Starter): Base card
- River Carp (Starter): Base card

**Mix.** 13 cards: 2 high-cost (15%), 2 generators (15%), 10 plain (77%); average cost 0.69 (unique 1.67); resources: lumber.

**HUB9 flags.** Resolved: 3 listed before it is obtainable. Left: on 4 lists (Fiddler Crab Swarm).

### Submap: Murgle Mayhem (opens at 6, side of Sable Swampmire)

**Theme.** Swamp & bog.  Field: no field effect. New in its fights: Nocturnal.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 6 cards.

### Map 7: The Morel Hollow (mu)

**Theme.** Fungal hollow. A damp hollow under the old oaks, where the mushrooms grow taller than the otters. Field: Spore Cloud. New in its fights: Rage, Decay, Meiosis, Progeny.

**Unique (11).**
- Truffle Piglet (Uncommon, map 7-1, cost 1) 🪵: Fungal hollow; skirmish reward of 7-1; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Wolf Spider Mother (Rare, map 7-6, cost 1): Fungal hollow; skirmish reward of 7-6; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Dung Beetle (Common, pack 2, cost 0): Fungal hollow; also fits The Mycelium Deep
- Leafcutter Gardener (Common, pack 2, cost 0) 🪵: Fungal hollow; also fits The Mycelium Deep, Clovermead, The Canopy, The Old Bramble
- Ant Warrior (Uncommon, pack 2, cost 0): Fungal hollow; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Planarian Splitter (Uncommon, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep
- Fungal Colossus (Common, pack 2, cost 2)  💰cost 2: Fungal hollow; also fits The Mycelium Deep
- Owl Nightwatch (Common, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep
- Bombardier Beetle (Uncommon, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep
- Hawthorn Shieldbug (Common, pack 2, cost 1): Fungal hollow; also fits The Mycelium Deep, Clovermead, The Old Bramble
- Compost Grub (Common, pack 1, cost 0): Fungal hollow; also fits The Mycelium Deep

**Carried (4).** Cane Toad (from Sable Swampmire, added); Peat-cutter Vole (from Sable Swampmire, added); Adder Ambusher (from Sable Swampmire, added); Bogfire Newt (from Sable Swampmire, added)

**Cut (6).**
- Nightjar Drifter (Common): on no list
- Pine Marten (Rare): on no list
- Fungus Gnat Cloud (Common): on no list
- Barkplate Beetle (Uncommon): on no list
- Beaver Feller (Common): on no list
- Sleepless Shrew (Common): on no list

**Mix.** 15 cards: 2 high-cost (13%), 3 generators (20%), 10 plain (67%); average cost 0.73 (unique 0.73); resources: lumber.

**HUB9 flags.** Resolved: 6 theme misfit. Left: none.

### Submap: Smugglers' Grotto (opens at 7, side of Pebble Beach)

**Theme.** Caves & burrows, Coast & shore. A sea cave under Pebble Beach. Whatever the smugglers left down here, something else has moved in. Field: Darkness. New in its fights: Darksight, Cleave.

**Submap call:** ask owner (2 unique). A sea cave under Pebble Beach with its own darkness, but only 4 fights and half coast: a new place or the beach's extra challenge?

**Unique (2).**
- Octopus Tactician (Rare, map 2-B-4, cost 2)  💰cost 2: Caves & burrows; skirmish reward of 2-B-4; also fits Caves & Alcoves, Coral Current, The Sunken Depths, The Glimmer Depths
- Trash Panda Trickster (Common, pack 2, cost 0) 🪵: Caves & burrows; also fits Caves & Alcoves, The Glimmer Depths

**Carried (10).** Open-Ocean Hermit Crab (from Pebble Beach, added); Gull Thief (from Pebble Beach, added); Pincushion Urchin (from Pebble Beach, added); Tide Pool Crab (from Pebble Beach, added); Tidepool Trapper Crab (from Pebble Beach, added); Grey Seal Bull (from Pebble Beach, added); Sea Turtle Elder (from Pebble Beach, added); Fiddler Crab Swarm (from Pebble Beach, added); Conch Crawler (from Pebble Beach, added); Conch Herald (from Pebble Beach, added)

**Cut (10).**
- Beaver Builder (Common): on no list
- Blind Cave Fish (Common): on no list
- Duckling (Starter): Base card
- Mallard Marauder (Rare): on no list
- Mayfly Dancer (Common): on no list
- Otter Riverguard (Common): on no list
- Pelican Diver (Rare): on no list
- Shallows Fry (Common): to Lilypad Reach (Map 6)
- Sulfur Vent Crab (Uncommon): on no list
- Oyster Bank (Common): on no list

**Mix.** 12 cards: 2 high-cost (17%), 2 generators (17%), 8 plain (67%); average cost 0.50 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 3 theme misfit, 2 on 4+ lists. Left: on 4 lists (Fiddler Crab Swarm).

### Map 8: Caves & Alcoves (m4)

**Theme.** Caves & burrows. Deep beneath the Peak, where sound carries further than light does. Field: Landslide (3 of 8 fights), Darkness. New in its fights: Sonar, Leech, On ready damage, Purblind.

**Unique (11).**
- Echo Screecher (Rare, map 8-8, cost 1): Caves & burrows; skirmish reward of 8-8; also fits The Glimmer Depths
- Giant Cave Huntsman (Rare, map 8-7, cost 1): Caves & burrows; skirmish reward of 8-7; also fits The Glimmer Depths
- Star-nosed Mole (Common, map 8-2, cost 0): Caves & burrows; skirmish reward of 8-2; also fits The Glimmer Depths
- Quarry Mole (Common, map 8-1, cost 1): Caves & burrows; skirmish reward of 8-1; also fits The Glimmer Depths
- Echo Matriarch (Heroic, map 8-8, cost 1): its skirmish reward; skirmish reward of 8-8; moved from Caves & Alcoves
- Cave Olm (Common, pack 2, cost 0): Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Stalactite Golem (Common, pack 2, cost 2)  💰cost 2: Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Sulfur Cinder Moth (Common, pack 2, cost 1): Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Vampire Bat (Uncommon, pack 2, cost 0): Caves & burrows; also fits Smugglers' Grotto, The Sunken Grove, The Glimmer Depths
- Whip Spider (Uncommon, pack 2, cost 1): Caves & burrows; also fits Smugglers' Grotto, The Glimmer Depths
- Badger Stonemason (Uncommon, pack 2, cost 1) 🪨: Caves & burrows; brought in for the mix (generator); also fits Smugglers' Grotto, The Glimmer Depths

**Carried (4).** Octopus Tactician (from Smugglers' Grotto, added); Trash Panda Trickster (from Smugglers' Grotto, added); Ant Warrior (from The Morel Hollow, added); Bombardier Beetle (from The Morel Hollow, added)

**Cut (16).**
- Blind Cave Fish (Common): on no list
- Nightshade Moth (Common): on no list
- Coffer Mimic (Uncommon): on no list
- Subterraneaner (Uncommon): on no list
- Cave Centipede (Common): on no list
- Millipede Hauler (Uncommon): on no list
- Dynamite Packrat (Uncommon): on no list
- Baby Bat (Common): on no list
- Vampire Bat Nurse (Uncommon): on no list
- Gallery Orb-Weaver (Rare): on no list
- Grotto Lobster (Rare): on no list
- Ghost Crayfish (Uncommon): on no list
- Cave Pseudoscorpion (Common): on no list
- Guano Beetle (Common): on no list
- Gravel Mole (Common): on no list
- Prospector Mole (Common): to The Glimmer Depths (Map 16)

**Mix.** 15 cards: 2 high-cost (13%), 2 generators (13%), 11 plain (73%); average cost 0.80 (unique 0.82); resources: lumber, stone; introduces stone.

### Submap: The Mycelium Deep (opens at 8, side of The Morel Hollow)

**Theme.** Fungal hollow. Under the Morel Hollow, the roots go down a long way, and every root is listening. Field: Darkness. New in its fights: Esprit, Siege, Swarm n, Ambush.

**Submap call:** additional challenges on the parent map (1 unique). Under the Morel Hollow, the same fungal biome, 5 fights: more of the parent's hollow.

**Unique (1).**
- Rootworm Colony (Common, map 7-A-5, cost 1): Fungal hollow; skirmish reward of 7-A-5

**Carried (11).** Dung Beetle (from The Morel Hollow, added); Fungal Colossus (from The Morel Hollow, added); Compost Grub (from The Morel Hollow, added); Wolf Spider Mother (from The Morel Hollow, added); Ant Warrior (from The Morel Hollow, added); Planarian Splitter (from The Morel Hollow, added); Hawthorn Shieldbug (from The Morel Hollow, added); Leafcutter Gardener (from The Morel Hollow, added); Owl Nightwatch (from The Morel Hollow, added); Truffle Piglet (from The Morel Hollow, added); Bombardier Beetle (from The Morel Hollow, added)

**Cut (9).**
- Bee Forager (Starter): Base card
- Beetle Battering-Ram (Rare): to The Goldfeather Siege (Map 23)
- Gangrenous Leech (Uncommon): on no list
- Garden Snail (Starter): Base card
- Honey Bee (Starter): Base card
- Swarm Matriarch (Rare): on no list
- Trapdoor Spider (Rare): on no list
- Tunnel Ant (Rare): Base card
- Worker Ant (Starter): Base card

**Mix.** 12 cards: 1 high-cost (8%), 2 generators (17%), 9 plain (75%); average cost 0.75 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 3 theme misfit, 1 no source, 1 on 4+ lists. Left: none.

### Map 9: The Kelp Mangroves (mk)

**Theme.** Mangrove & kelp. Salt water creeps into the swamp — mangrove roots, kelp curtains and smugglers' channels. Field: Tide. New in its fights: Acid Bolt, Diurnal.

**Unique (11).**
- Mangrove Kingfisher (Rare, map 9-6, cost 1): Mangrove & kelp; skirmish reward of 9-6
- Mangrove Manatee (Rare, map 9-7, cost 1): Mangrove & kelp; skirmish reward of 9-7; also fits Coral Current, The Sunken Depths
- Banded Sea Krait (Uncommon, map 9-3, cost 1): Mangrove & kelp; skirmish reward of 9-3; also fits Coral Current, The Sunken Depths
- Mangrove Mudskipper (Common, pack 2, cost 0): Mangrove & kelp
- Archerfish (Uncommon, pack 2, cost 1): Mangrove & kelp
- Mangrove Monitor (Common, pack 2, cost 1): Mangrove & kelp
- Mudpuppy (Common, pack 2, cost 0): Mangrove & kelp; also fits The Sunken Grove
- Reef Shark (Common, pack 2, cost 2)  💰cost 2: Mangrove & kelp; also fits Coral Current, The Sunken Depths
- Sunbittern Strider (Uncommon, pack 2, cost 1): Mangrove & kelp
- Minnow Skitter (Common, pack 2, cost 0): Mangrove & kelp
- Nautilus Drifter (Rare, pack 2, cost 1) 🪵: kin: Reef & ocean; brought in for the mix (generator); moved from The Kelp Mangroves; also fits Coral Current, The Sunken Depths

**Carried (4).** Crocodile Ambusher (from Gatorback Swamp, added); Lodge Engineer (from Lilypad Reach, added); Booming Bittern (from Sable Swampmire, added); Caiman Hatchling (from Gatorback Swamp, added)

**Cut (12).**
- Mudflat Godwit (Uncommon): on no list
- Electric Catfish (Rare): on no list
- Elephant-nose Fish (Uncommon): on no list
- Piranha Shoal (Uncommon): on no list
- Limpet Clinger (Common): on no list
- Fishing Cat (Rare): on no list
- Proboscis Monkey (Uncommon): on no list
- Horseshoe Crab (Common): on no list
- Sea Hare (Common): on no list
- Ironclaw Fiddler (Rare): on no list
- Oyster Bank (Common): on no list
- Beachcomber Sanderling (Common): on no list

**Mix.** 15 cards: 3 high-cost (20%), 2 generators (13%), 11 plain (73%); average cost 0.93 (unique 0.82); resources: lumber.

**HUB9 flags.** Resolved: 6 theme misfit, 1 on 4+ lists. Left: on 6 lists (Lodge Engineer).

### Map 10: Coral Current (m7)

**Theme.** Reef & ocean. Past the last cliffs, the open sea — deep water, fast currents and the teeth that live in them. Field: Tide. New in its fights: Fork, Gash, Trident, Pierce.

**Unique (11).**
- Colossal Squid (Very Rare, map 10-9, cost 4)  💰cost 4: Reef & ocean; skirmish reward of 10-9; also fits The Sunken Depths
- Electric Ray (Uncommon, map 10-2, cost 1): Reef & ocean; skirmish reward of 10-2; also fits The Sunken Depths
- Great Barracuda (Rare, map 10-6, cost 1): Reef & ocean; skirmish reward of 10-6; also fits The Sunken Depths
- Reef Admiral (Heroic, map 10-9, cost 1): its skirmish reward; skirmish reward of 10-9; moved from Coral Current
- Clownfish Scout (Common, pack 2, cost 0): Reef & ocean; also fits The Sunken Depths
- Parrotfish (Common, pack 2, cost 0): Reef & ocean; also fits The Sunken Depths
- Riptide Eel (Uncommon, pack 2, cost 1): Reef & ocean; also fits Smugglers' Grotto, The Sunken Depths
- Coral Reef Shark (Uncommon, pack 2, cost 2)  💰cost 2: Reef & ocean; also fits The Sunken Depths
- Kraken Spawnling (Common, pack 2, cost 3)  💰cost 3: Reef & ocean; also fits The Sunken Depths
- Swordfish Spearman (Rare, pack 2, cost 1): Reef & ocean; also fits The Sunken Depths
- Coral Polyp Colony (Common, pack 2, cost 0) 🪵: Reef & ocean; brought in for the mix (generator); also fits The Sunken Depths

**Carried (4).** Reef Shark (from The Kelp Mangroves, added); Nautilus Drifter (from The Kelp Mangroves, added); Banded Sea Krait (from The Kelp Mangroves, added); Mangrove Manatee (from The Kelp Mangroves, added)

**Cut (13).**
- Lion's Mane Jelly (Uncommon): on no list
- Sawfish (Uncommon): on no list
- Mantis Shrimp (Rare): on no list
- Cone Snail (Uncommon): on no list
- Cleaner Wrasse (Uncommon): on no list
- Sea Cucumber (Uncommon): on no list
- Yellow-bellied Sea Snake (Rare): on no list
- Crown-of-thorns Star (Uncommon): on no list
- Lionfish (Uncommon): on no list
- Giant Clam (Common): on no list
- Whale Shark (Rare): on no list
- Bloodscent Shark (Uncommon): on no list
- Salvager Hermit Crab (Common): on no list

**Mix.** 15 cards: 4 high-cost (27%), 2 generators (13%), 9 plain (60%); average cost 1.27 (unique 1.27); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: none.

### Map 11: Eyrie Heights (m10)

**Theme.** Mountain & sky. Sheer alpine cliffs above the Foundry’s smoke — the air here belongs to whatever can still fly in it. Field: no field effect. New in its fights: Arrow, Fletcher, Avalanche, Frostbite.

**Unique (11).**
- Alpine Marmot (Common, map 11-1, cost 0): Mountain & sky; skirmish reward of 11-1; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Eagle-Owl Quartermaster (Rare, map 11-2, cost 1): Mountain & sky; skirmish reward of 11-2; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Ibex Rockcaller (Very Rare, map 11-10, cost 1): Mountain & sky; skirmish reward of 11-10; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Chamois Leaper (Uncommon, map 11-9, cost 1): Mountain & sky; skirmish reward of 11-9; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Chipmunk Hoarder (Common, pack 2, cost 0) 🪵: Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Eyrie Warden (Common, pack 2, cost 3)  💰cost 3: Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Mountain Hare (Common, pack 2, cost 0): Mountain & sky; also fits Clovermead, The Aerie Vault, Wolfsbane Tundra, Ashen Spurn
- Apollo Butterfly (Uncommon, pack 2, cost 0): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Alpine Salamander (Common, pack 2, cost 1): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Alpine Swift (Common, pack 2, cost 0): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit
- Gale Swift (Common, pack 2, cost 0): Mountain & sky; also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit

**Carried (4).** Gannet Nestweaver (from Gannet Cliffs, added); Golden Eagle Diver (from Gannet Cliffs, added); Peak Condor (from Gannet Cliffs, added); Peregrine Stooper (from Gannet Cliffs, added)

**Cut (3).**
- Mountain Goat Climber (Uncommon): to The Quiet Summit (Map 21)
- Balloon Archer (Uncommon): to The Goldfeather Siege (Map 23)
- Marmot Stonecutter (Common): on no list

**Mix.** 15 cards: 1 high-cost (7%), 2 generators (13%), 12 plain (80%); average cost 0.67 (unique 0.64); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: on 4 lists (Golden Eagle Diver).

### Submap: The Sunken Depths (opens at 11, side of Coral Current)

**Theme.** Reef & ocean. An otter ferry went down past the reef wall years ago. The current through its hull is faster than anything above. Field: Crushing Depths, Pitch Black. New in its fights: Octolash, Shock, Corrode, Chain Lightning.

**Submap call:** ask owner (2 unique). A sunken ferry with its own pitch dark and Crushing Depths, but the same reef biome as Coral Current, 5 fights.

**Unique (2).**
- Blue-ringed Octopus (Rare, map 10-A-5, cost 1): Reef & ocean; skirmish reward of 10-A-5
- Orca Vanguard (Common, pack 2, cost 3)  💰cost 3: Reef & ocean; also fits Coral Current

**Carried (10).** Clownfish Scout (from Coral Current, added); Kraken Spawnling (from Coral Current, added); Parrotfish (from Coral Current, added); Coral Reef Shark (from Coral Current, added); Mangrove Manatee (from The Kelp Mangroves); Nautilus Drifter (from The Kelp Mangroves); Riptide Eel (from Coral Current, added); Colossal Squid (from Coral Current, added); Coral Polyp Colony (from Coral Current, added); Electric Ray (from Coral Current, added)

**Cut (8).**
- Abyss Lantern Squid (Uncommon): on no list
- Glass Octopus (Rare): on no list
- Silver Minnow (Starter): Base card
- Sulfur Vent Crab (Uncommon): on no list
- Vampire Squid (Rare): on no list
- Voltaic Eel (Rare): on no list
- Giant Clam (Common): on no list
- Salvager Hermit Crab (Common): on no list

**Mix.** 12 cards: 4 high-cost (33%), 2 generators (17%), 6 plain (50%); average cost 1.42 (unique 2.00); resources: lumber.

**HUB9 flags.** Resolved: 3 listed before it is obtainable, 1 on 4+ lists, 2 theme misfit. Left: none.

### Submap: The Undercroft (opens at 11, side of Eyrie Heights)

**Theme.** none.  Field: no field effect. New in its fights: Night-blind, Tangleweed, Executioner, Sturdy.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 93 cards.

### Map 12: The Briar Maze (mh)

**Theme.** Briar maze. Hedges taller than a heron, thorns sharper than a quill — and every turn is a dead end for someone. Field: Grasping Briars. New in its fights: Backstab, Predator, Confuse, Sprout.

**Unique (11).**
- Cunning Vixen (Uncommon, map 12-2, cost 1): Briar maze; skirmish reward of 12-2
- Hedgehog Scout (Common, map 12-5, cost 0): Briar maze; skirmish reward of 12-5
- Quillguard (Rare, map 12-7, cost 1): Briar maze; skirmish reward of 12-7
- Bramble Hoglet (Common, map 12-1, cost 0): Briar maze; skirmish reward of 12-1
- Hedge Weasel (Uncommon, pack 2, cost 0): Briar maze; also fits Clovermead, The Old Bramble
- Lyrebird Mimic (Uncommon, pack 2, cost 1): Briar maze; also fits Clovermead, The Old Bramble
- Thorn Shrike (Rare, pack 2, cost 1): Briar maze; also fits Clovermead, The Old Bramble
- Mouse Sapper (Common, pack 2, cost 1): kin: Meadow & woodland; also fits Clovermead, The Old Bramble, The Goldfeather Siege, Goldfeather Keep
- Gatling Hog (Rare, pack 2, cost 1): Briar maze
- Quillback Elder (Common, pack 2, cost 2)  💰cost 2: Briar maze; moved from The Briar Maze
- Carrion Crow (Common, pack 2, cost 0) 🪵: kin: Meadow & woodland; brought in for the mix (generator); also fits Clovermead, The Old Bramble

**Carried (4).** Ant Hill (from Bramblewood Outskirts, added); Badger Lumberjack (from Thistlewood, added); Field Mouse (from Thistlewood); Mountain Hare (from Eyrie Heights, added)

**Cut (5).**
- Seed-cache Squirrel (Common): on no list
- Fox Sharpshot (Common): on no list
- Skunk Gasser (Uncommon): on no list
- Rodent King (Uncommon): on no list
- Magpie Collector (Uncommon): on no list

**Mix.** 15 cards: 2 high-cost (13%), 2 generators (13%), 11 plain (73%); average cost 0.73 (unique 0.73); resources: lumber.

**HUB9 flags.** Resolved: 8 theme misfit, 1 on 4+ lists. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill).

### Submap: Clovermead (opens at 12, side of Thistlewood)

**Theme.** Meadow & woodland. A wide clover meadow past the Outskirts — rabbits, bees and mice, and nobody in a hurry. Field: Thunderstorm. New in its fights: Swipe.

**Submap call:** ask owner (2 unique). A meadow opening at Map 12 off Thistlewood (Map 1) with its own Thunderstorm, but the same meadow biome, 5 fights.

**Unique (2).**
- Lucky Hopper (Rare, map 1-A-5, cost 1): Meadow & woodland; skirmish reward of 1-A-5; also fits The Old Bramble
- Jay Pilferer (Common, pack 2, cost 1) 🪵: Meadow & woodland; brought in for the mix (generator); also fits The Old Bramble

**Carried (10).** House Cat (from Bramblewood Outskirts); Field Mouse (from Thistlewood, added); Field Vole (from Thistlewood, added); Hedgerow Shrew (from Thistlewood, added); Robin Redbreast (from Thistlewood, added); Slow-worm (from Thistlewood, added); Woodcock Lookout (from Thistlewood, added); Bramble Sprout (from Thistlewood, added); Cricket Drummer (from Thistlewood, added); Ant Hill (from Bramblewood Outskirts, added)

**Cut (18).**
- Acorn Chipmunk (Starter): Base card
- Bee Forager (Starter): Base card
- Bee Sentry (Starter): Base card
- Buck Brawler (Common): on no list
- Burrow Rabbit (Starter): Base card
- Chipmunk Forager (Starter): Base card
- Clover Butterfly (Common): on no list
- Cottontail (Starter): Base card
- Farm Dog (Common): on no list
- Field Crow (Common): on no list
- Honey Bee (Starter): Base card
- Ladybird Guard (Common): on no list
- Meadow Rabbit (Starter): Base card
- Pigeon Peon (Common): on no list
- Rabbit Kit (Common): on no list
- Stag Beetle (Rare): on no list
- Tunnel Ant (Rare): Base card
- Village Miller (Common): on no list

**Mix.** 12 cards: 1 high-cost (8%), 1 generators (8%), 10 plain (83%); average cost 0.33 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit, 1 no source, 1 on 4+ lists. Left: no source yet (proposed home: this map's pack tier) (Ant Hill), on 4 lists (Ant Hill).

### Map 13: The Redwood Deep (mr)

**Theme.** Redwood deep. Trees as wide as castles and as old as the hills — bears, stags and boars rule the red shade. Field: High Canopy. New in its fights: Keen Eye, Fast Forward, Berserk, Perforate.

**Unique (11).**
- Fawn Scout (Rare, map 13-1, cost 0): Redwood deep; skirmish reward of 13-1
- Shimmerwing Stag (Very Rare, map 13-8, cost 1): Redwood deep; skirmish reward of 13-8
- Sergeant Bramblefox (Rare, map 13-2, cost 1): Redwood deep; skirmish reward of 13-2; moved from The Redwood Deep
- Berserker Boar (Common, pack 2, cost 2)  💰cost 2: Redwood deep
- Grizzly Vanguard (Common, pack 2, cost 2)  💰cost 2: Redwood deep
- Bramblewood Lynx (Rare, pack 2, cost 1): Redwood deep; also fits The Pinewood Taiga, The Old Bramble
- Swift Fox (Common, pack 2, cost 1): Redwood deep; also fits Clovermead, The Old Bramble
- Tasmanian Devil (Uncommon, pack 2, cost 1): Redwood deep; also fits Clovermead, The Old Bramble
- Stag Knight (Common, pack 2, cost 2)  💰cost 2: Redwood deep
- Woodpecker Sapper (Uncommon, pack 2, cost 1): Redwood deep; also fits Clovermead, The Old Bramble
- Redwood Woodpecker (Uncommon, pack 2, cost 1) 🪵: Redwood deep; brought in for the mix (generator)

**Carried (4).** Quillback Elder (from The Briar Maze, added); Carrion Crow (from The Briar Maze, added); Bramble Hoglet (from The Briar Maze, added); Cunning Vixen (from The Briar Maze, added)

**Cut (8).**
- Fox Kit (Common): on no list
- Pill Bug (Uncommon): on no list
- Margay (Rare): on no list
- Leopard Slug (Common): on no list
- Red-backed Salamander (Common): on no list
- Hazel Coppice (Common): on no list
- Beaver Feller (Common): on no list
- Hollow Oath-Keeper (Common): on no list

**Mix.** 15 cards: 4 high-cost (27%), 2 generators (13%), 9 plain (60%); average cost 1.07 (unique 1.18); resources: lumber.

**HUB9 flags.** Resolved: 7 theme misfit. Left: none.

### Submap: The Sunken Grove (opens at 13, side of Gatorback Swamp)

**Theme.** Swamp & bog. Where the swamp swallowed an old forest. The trees still stand, up to their necks. Field: Swamp Fever. New in its fights: Herbalist.

**Submap call:** additional challenges on the parent map (1 unique). The swamp swallowing an old forest: the same swamp biome as Gatorback Swamp, 4 fights.

**Unique (1).**
- Hedgehog Herbalist (Rare, map 5-A-4, cost 1): Swamp & bog; skirmish reward of 5-A-4; also fits The Old Bramble

**Carried (11).** Grass Viper (from Gatorback Swamp, added); Snapper Hatchling (from Gatorback Swamp, added); Constrictor Coil (from Gatorback Swamp, added); Alligator Gar (from Gatorback Swamp, added); Fen Mink (from Gatorback Swamp, added); Mangrove Mudskipper (from The Kelp Mangroves); Swamp Alligator (from Gatorback Swamp, added); Caiman Hatchling (from Gatorback Swamp, added); Crocodile Ambusher (from Gatorback Swamp, added); Nutria Reedcutter (from Gatorback Swamp, added); Venomlord Serpent (from Gatorback Swamp, added)

**Cut (7).**
- Baby Horned Capybara (Common): on no list
- Bog Behemoth (Common): on no list
- Bog Leech (Uncommon): on no list
- Echo Keeper (Common): on no list
- Mosquito Cloud (Common): on no list
- Puddle Hopper (Common): on no list
- Swamp Rabbit (Common): on no list

**Mix.** 12 cards: 4 high-cost (33%), 1 generators (8%), 7 plain (58%); average cost 0.92 (unique 1.00); resources: lumber.

### Map 14: Savanna Reaches (m5)

**Theme.** Savanna. Open grassland past the Peak — nothing here hides for long. Field: First Blood. New in its fights: Night-blind, Executioner, Twin Shot, Drunk.

**Unique (11).**
- Grave-Grin Hyena (Uncommon, map 14-2, cost 0): Savanna; skirmish reward of 14-2
- Savanna Cheetah (Very Rare, map 14-8, cost 1): Savanna; skirmish reward of 14-8
- Spitting Cobra (Rare, map 14-6, cost 1): Savanna; skirmish reward of 14-6
- Pride Queen (Heroic, map 14-8, cost 1): its skirmish reward; skirmish reward of 14-8; moved from Savanna Reaches
- Hoopoe Herald (Common, pack 3, cost 0): Savanna
- Weaver Bird (Common, pack 3, cost 1): Savanna
- Springbok Pronker (Common, pack 3, cost 1): Savanna
- Dust Hyena (Uncommon, pack 3, cost 0) 🪵: Savanna; also fits The Pale Desert
- Marula Elephant (Uncommon, pack 3, cost 2)  💰cost 2: Savanna
- Pangolin Roller (Uncommon, pack 3, cost 1): Savanna
- Meerkat Burrower (Common, pack 3, cost 1): Savanna; also fits The Glass Dunes

**Carried (4).** Lodge Engineer (from Lilypad Reach, added); Leafcutter Gardener (from The Morel Hollow, added); Mouse Sapper (from The Briar Maze, added); House Cat (from Bramblewood Outskirts, added)

**Cut (5).**
- Monitor Rambler (Uncommon): on no list
- Mongoose Duelist (Uncommon): on no list
- Lovebird (Common): on no list
- Marula Monkey (Common): on no list
- Termite Forager (Common): on no list

**Mix.** 15 cards: 2 high-cost (13%), 3 generators (20%), 11 plain (73%); average cost 0.80 (unique 0.82); resources: lumber.

**HUB9 flags.** Resolved: none. Left: on 6 lists (Lodge Engineer), on 4 lists (House Cat).

### Map 15: The Long Grass (ml)

**Theme.** Long grass. Rolling plains and farm country — horses, hounds and village militia on every road. Field: Undergrowth. New in its fights: Bulldoze, Stampede, Converge, Speed.

**Unique (11).**
- Border Collie (Uncommon, map 15-2, cost 1): Long grass; skirmish reward of 15-2; also fits The Goldfeather Siege, Goldfeather Keep
- Stoat Cutthroat (Rare, map 15-3, cost 1): Long grass; skirmish reward of 15-3; also fits The Goldfeather Siege, Goldfeather Keep
- Talon Archer (Very Rare, map 15-7, cost 1): Long grass; skirmish reward of 15-7
- Gilded Roadwarden (Common, pack 3, cost 4)  💰cost 4: Long grass
- Pronghorn Racer (Common, pack 3, cost 1): Long grass; also fits The Old Bramble
- Bison Bulldozer (Uncommon, pack 3, cost 1): Long grass; also fits The Old Bramble
- Raccoon Bandit (Rare, pack 3, cost 0) 🪵: Long grass
- Stable Colt (Uncommon, pack 3, cost 0): Long grass
- Warhorse Charger (Common, pack 3, cost 2)  💰cost 2: Long grass
- Shepherd (Common, pack 3, cost 1): Long grass
- Squire's Mount (Rare, pack 3, cost 1): Long grass; moved from The Long Grass

**Carried (4).** Lodge Engineer (from Lilypad Reach, added); Carrion Crow (from The Briar Maze); Hedge Weasel (from The Briar Maze, added); Hedgehog Herbalist (from The Sunken Grove, added)

**Cut (8).**
- Amber Cicada (Uncommon): on no list
- Springtail Hopper (Common): on no list
- Muntjac Barker (Uncommon): on no list
- Anvil Thrush (Common): on no list
- Garden Tiger Moth (Common): on no list
- Land Tiller (Common): to The Goldfeather Siege (Map 23)
- Moonshell Snail (Common): on no list
- Courier Pigeon (Common): on no list

**Mix.** 15 cards: 3 high-cost (20%), 3 generators (20%), 10 plain (67%); average cost 1.07 (unique 1.18); resources: lumber.

**HUB9 flags.** Resolved: 8 theme misfit, 1 on 4+ lists. Left: on 6 lists (Lodge Engineer).

### Submap: The Aerie Vault (opens at 15, side of Eyrie Heights)

**Theme.** Mountain & sky. The oldest nests on the mountain, built on top of each other for a thousand springs. Field: no field effect.

**Submap call:** additional challenges on the parent map (1 unique). The oldest nests on the same mountain as Eyrie Heights, 4 fights.

**Unique (1).**
- Wound Reaver (Rare, map 11-A-4, cost 1): Mountain & sky; skirmish reward of 11-A-4; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair

**Carried (11).** Chipmunk Hoarder (from Eyrie Heights, added); Eagle-Owl Quartermaster (from Eyrie Heights, added); Eyrie Warden (from Eyrie Heights, added); Alpine Marmot (from Eyrie Heights, added); Ibex Rockcaller (from Eyrie Heights, added); Alpine Salamander (from Eyrie Heights, added); Alpine Swift (from Eyrie Heights, added); Apollo Butterfly (from Eyrie Heights, added); Chamois Leaper (from Eyrie Heights, added); Gale Swift (from Eyrie Heights, added); Golden Eagle Diver (from Gannet Cliffs)

**Cut (5).**
- Alpine Avalanche (Common): on no list
- Chipmunk Stockpiler (Common): on no list
- Peak Condor (Common): to Gannet Cliffs (Map 3)
- Rockslide Ram (Uncommon): on no list
- Marmot Stonecutter (Common): on no list

**Mix.** 12 cards: 1 high-cost (8%), 1 generators (8%), 10 plain (83%); average cost 0.75 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: none. Left: on 4+ lists (Golden Eagle Diver).

### Map 16: The Pinewood Taiga (mt)

**Theme.** Taiga. Endless dark pines on the edge of the snow — lynx, elk and the first of the wolf packs. Field: Frigid (frozen ground). New in its fights: Pack, Pack Leader.

**Unique (11).**
- Woodland Caribou (Uncommon, map 16-3, cost 1): Taiga; skirmish reward of 16-3; also fits The Old Bramble
- Taiga Lynx (Rare, map 16-4, cost 1): Taiga; skirmish reward of 16-4; also fits The Old Bramble
- Dhole Matriarch (Very Rare, map 16-7, cost 2)  💰cost 2: Taiga; skirmish reward of 16-7; also fits The Old Bramble
- Alpha Howler (Common, pack 3, cost 2)  💰cost 2: Taiga; also fits The Old Bramble
- Frost Hare Sprinter (Common, pack 3, cost 0): Taiga; also fits Wolfsbane Tundra, Ashen Spurn, The Old Bramble, The Ice Hollow
- Snowshoe Hare (Common, pack 3, cost 0): Taiga; also fits The Old Bramble
- Dhole Runner (Common, pack 3, cost 1): Taiga; also fits The Old Bramble
- Trickster Fox (Common, pack 3, cost 1): Taiga; also fits The Old Bramble
- Wolf Pack Runner (Rare, pack 3, cost 1): Taiga; also fits The Old Bramble
- Boreal Elk (Common, pack 3, cost 2)  💰cost 2: Taiga; also fits The Old Bramble
- Cone-cutter Squirrel (Common, pack 3, cost 0) 🪵: Taiga; also fits The Old Bramble

**Carried (4).** Berserker Boar (from The Redwood Deep, added); Redwood Woodpecker (from The Redwood Deep, added); Bramblewood Lynx (from The Redwood Deep, added); Fawn Scout (from The Redwood Deep, added)

**Mix.** 15 cards: 4 high-cost (27%), 2 generators (13%), 9 plain (60%); average cost 1.00 (unique 1.00); resources: lumber.

### Submap: The Glimmer Depths (opens at 16, side of Caves & Alcoves)

**Theme.** Caves & burrows. Below the alcoves the walls start to shine, and things that like shiny things start to gather. Field: Mirage. New in its fights: Prayer.

**Submap call:** ask owner (2 unique). Deeper in the same caves as Caves & Alcoves, 4 fights, but a new crystal / shiny theme with its own Mirage.

**Unique (2).**
- Lantern Spark Fly (Uncommon, map 8-A-4, cost 0): Caves & burrows; skirmish reward of 8-A-4
- Prospector Mole (Common, pack 2, cost 0) 🔩: Caves & burrows; brought in for the mix (generator); also fits Smugglers' Grotto, Caves & Alcoves

**Carried (10).** Echo Screecher (from Caves & Alcoves, added); Sulfur Cinder Moth (from Caves & Alcoves, added); Badger Stonemason (from Caves & Alcoves, added); Cave Olm (from Caves & Alcoves, added); Giant Cave Huntsman (from Caves & Alcoves, added); Quarry Mole (from Caves & Alcoves, added); Stalactite Golem (from Caves & Alcoves, added); Star-nosed Mole (from Caves & Alcoves, added); Vampire Bat (from Caves & Alcoves, added); Whip Spider (from Caves & Alcoves, added)

**Cut (13).**
- Barrow Leech (Rare): on no list
- Bat Swarmling (-): on no list
- Beetle Grunt (Common): on no list
- Cave Bat Swarm (Rare): on no list
- Cave Cricket (Common): on no list
- Cave Flitter (Uncommon): on no list
- Cave Swiftlet (Common): on no list
- Glowworm Cluster (Common): on no list
- Monarch Wingblade (Rare): on no list
- Oilbird (Uncommon): on no list
- Swarm Matriarch (Rare): on no list
- Tunnel Ant (Rare): Base card
- Glimmer Spider (Uncommon): on no list

**Mix.** 12 cards: 1 high-cost (8%), 2 generators (17%), 9 plain (75%); average cost 0.67 (unique 0.00); resources: metal, stone; introduces metal.

**HUB9 flags.** Resolved: 3 no source, 1 on 4+ lists. Left: none.

### Map 17: Wolfsbane Tundra (m6)

**Theme.** Tundra & ice. Frozen ground north of the grassland — the packs here hunt in formation. Field: Frigid (frozen ground), frost (Freezing / Frostbite), Frostbite, Freezing. New in its fights: Earthquake, King, Poison Bolt, Pack Howl.

**Unique (11).**
- Lone Grey Wolf (Very Rare, map 17-2, cost 1): Tundra & ice; skirmish reward of 17-2; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Polar Bear (Very Rare, map 17-6, cost 1): Tundra & ice; skirmish reward of 17-6; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Walrus Icebreaker (Very Rare, map 17-8, cost 1): Tundra & ice; skirmish reward of 17-8; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Wolfsbane Alpha (Heroic, map 17-8, cost 1): its skirmish reward; skirmish reward of 17-8; moved from Wolfsbane Tundra
- Glacial Ape-King (Common, pack 3, cost 4)  💰cost 4: Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Harbor Seal (Common, pack 3, cost 1): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Snow Bunting Archer (Uncommon, pack 3, cost 1): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Snow Ermine (Common, pack 3, cost 0): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Ravenous Wolverine (Rare, pack 3, cost 1): Tundra & ice; also fits Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Spitting Spider (Uncommon, pack 3, cost 1): Tundra & ice; also fits The Glimmer Depths, Ashen Spurn, The Ice Hollow, The Rimefire Caldera
- Talus Pika (Common, pack 3, cost 0) 🪵: Tundra & ice; brought in for the mix (generator); also fits The Aerie Vault, Ashen Spurn, The Sundered Peak, The Quiet Summit

**Carried (4).** Alpha Howler (from The Pinewood Taiga, added); Cone-cutter Squirrel (from The Pinewood Taiga, added); Frost Hare Sprinter (from The Pinewood Taiga, added); Mountain Hare (from Eyrie Heights, added)

**Cut (4).**
- Frostmoon Howler (Rare): on no list
- Beluga (Rare): on no list
- Musk Ox Calf (Uncommon): on no list
- Musk Ox Matriarch (Uncommon): on no list

**Mix.** 15 cards: 2 high-cost (13%), 2 generators (13%), 11 plain (73%); average cost 0.93 (unique 1.09); resources: lumber.

### Map 18: The Glass Dunes (md)

**Theme.** Glass dunes. Heat so fierce the sand turns to glass — scorpions, jackals and things that wait under the dunes. Field: Sandstorm. New in its fights: Dry, Haste, Trap, Tornado.

**Unique (11).**
- Obsidian Scorpion (Rare, map 18-5, cost 1): Glass dunes; skirmish reward of 18-5; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Antlion Pit (Uncommon, map 18-6, cost 1): Glass dunes; skirmish reward of 18-6
- Caustic Scorpion (Uncommon, map 18-2, cost 1): Glass dunes; skirmish reward of 18-2
- Dust-devil Kestrel (Very Rare, map 18-7, cost 1): Glass dunes; skirmish reward of 18-7
- Thorny Devil (Common, map 18-1, cost 1): Glass dunes; skirmish reward of 18-1
- Roadrunner Courier (Common, pack 3, cost 1): Glass dunes
- Sandfish (Common, pack 3, cost 1): Glass dunes
- Komodo Warlord (Common, pack 3, cost 3)  💰cost 3: Glass dunes
- Dromedary (Uncommon, pack 3, cost 1): Glass dunes
- Fennec Fox (Uncommon, pack 3, cost 1): Glass dunes
- Dune Packrat (Uncommon, pack 3, cost 1) 🪵: Glass dunes; also fits The Old Bramble

**Carried (4).** Dust Hyena (from Savanna Reaches, added); Meerkat Burrower (from Savanna Reaches, added); Bison Bulldozer (from The Long Grass, added); Border Collie (from The Long Grass, added)

**Cut (5).**
- Glasswing Moth (Common): on no list
- Frillneck Duelist (Rare): on no list
- Tarantula Hawk (Uncommon): on no list
- Inland Taipan (Rare): on no list
- Static Fennec (Uncommon): on no list

**Mix.** 15 cards: 1 high-cost (7%), 2 generators (13%), 12 plain (80%); average cost 1.07 (unique 1.18); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit. Left: on 4+ lists (Obsidian Scorpion), on 4 lists (Dust Hyena), theme misfit (Bison Bulldozer, Border Collie).

### Submap: The Canopy (opens at 18, side of Savanna Reaches)

**Theme.** Jungle canopy. Up in the rainforest roof past the savanna's edge — frogs, sloths, drums and a jaguar's path. Field: High Canopy. New in its fights: Stem, Stem, Feeble, Sun-shy.

**Submap call:** a full delve into a new location (3 unique). The rainforest roof: a jungle biome, not the savanna of its parent, with its own High Canopy.

**Unique (3).**
- Hercules Beetle (Rare, map 14-A-4, cost 1): Jungle canopy; skirmish reward of 14-A-4; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Jaguar Stalker (Rare, map 14-A-5, cost 1): Jungle canopy; skirmish reward of 14-A-5
- Kinkajou Lurker (Uncommon, map 14-A-3, cost 1): Jungle canopy; skirmish reward of 14-A-3

**Carried (10).** Grave-Grin Hyena (from Savanna Reaches, added); Hoopoe Herald (from Savanna Reaches, added); Savanna Cheetah (from Savanna Reaches, added); Springbok Pronker (from Savanna Reaches, added); Marula Elephant (from Savanna Reaches, added); Pangolin Roller (from Savanna Reaches, added); Spitting Cobra (from Savanna Reaches, added); Weaver Bird (from Savanna Reaches, added); Dust Hyena (from Savanna Reaches, added); Meerkat Burrower (from Savanna Reaches, added)

**Cut (13).**
- Ancient Sloth Titan (Common): on no list
- Aye-aye Prowler (Common): on no list
- Bramblewood Macaque (Rare): on no list
- Chilli Parrot (Uncommon): on no list
- Howler Monkey (Uncommon): on no list
- Old-Growth Tortoise (Common): on no list
- Siege Rhino (Rare): to The Goldfeather Siege (Map 23)
- Slow Loris (Common): on no list
- Slowpoke Sentinel (Common): on no list
- Termite Mound (Common): on no list
- Toucan Courier (Common): on no list
- Velvet Worm (Uncommon): on no list
- Carrion Crow (Common): to The Briar Maze (Map 12)

**Mix.** 13 cards: 1 high-cost (8%), 1 generators (8%), 11 plain (85%); average cost 0.85 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 7 no source, 1 listed before it is obtainable, 3 theme misfit, 1 on 4+ lists. Left: on 4 lists (Dust Hyena).

### Map 19: Ashen Spurn (m3)

**Theme.** Volcanic & ash, Mountain & sky, Tundra & ice. Scorched high ground — only the toughest hides make it this far up. Field: Ash Rain (2 of 6 fights). New in its fights: Spitfire, Landslide, Volley, Scar.

**Unique (11).**
- Echidna Quillshot (Very Rare, map 19-6, cost 1): Volcanic & ash; skirmish reward of 19-6; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Old Bramble
- Fire Salamander (Uncommon, map 19-3, cost 1): Volcanic & ash; skirmish reward of 19-3; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Quill Volley (Rare, map 19-2, cost 1): Volcanic & ash; skirmish reward of 19-2; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Yeti Chieftain (Heroic, map 19-6, cost 1): its skirmish reward; skirmish reward of 19-6; moved from Ashen Spurn; also fits Volcano Lair
- Cinder Stoker (Common, pack 3, cost 0): Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Yeti (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits Wolfsbane Tundra, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Porcupine Roller (Common, pack 3, cost 0): Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Magma Titan (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Glacier Wolf Pack (Common, pack 3, cost 2)  💰cost 2: Volcanic & ash; also fits Wolfsbane Tundra, The Sundered Peak, Eye of the Volcano, Volcano Lair
- Phoenix Fledgling (Common, pack 3, cost 2)  💰cost 2: Volcanic & ash; also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Pumice Beetle (Uncommon, pack 3, cost 1) 🪨: Volcanic & ash; brought in for the mix (generator); also fits The Sundered Peak, Eye of the Volcano, Volcano Lair, The Rimefire Caldera

**Carried (4).** Glacial Ape-King (from Wolfsbane Tundra, added); Talus Pika (from Wolfsbane Tundra, added); Hercules Beetle (from The Canopy, added); Obsidian Scorpion (from The Glass Dunes, added)

**Cut (2).**
- Scree Goat (Uncommon): on no list
- Granite Ox Golem (Rare): on no list

**Mix.** 15 cards: 5 high-cost (33%), 2 generators (13%), 8 plain (53%); average cost 1.40 (unique 1.36); resources: lumber, stone.

**HUB9 flags.** Resolved: 2 on 4+ lists. Left: on 4+ lists (Cinder Stoker), on 4 lists (Talus Pika, Obsidian Scorpion).

### Submap: The Pale Desert (opens at 19, side of The Glass Dunes)

**Theme.** Pale desert. Past the glass the sand turns white as bone, and so does the sun. No water, no shade, and the horizon never stays where you left it. Field: Heatwave. New in its fights: Rabid, Weakness, Sociable, Full Moon.

**Submap call:** a full delve into a new location (3 unique). Its own biome (the pale desert past the glass), 9 fights.

**Unique (3).**
- Quicksand Queen (Very Rare, map 18-A-9, cost 1): Pale desert; skirmish reward of 18-A-9
- Skull Vulture (Uncommon, pack 3, cost 1): Pale desert
- Sand Widow (Common, pack 3, cost 2)  💰cost 2: Pale desert; also fits The Glass Dunes

**Carried (10).** Dust Hyena (from Savanna Reaches); Caustic Scorpion (from The Glass Dunes, added); Roadrunner Courier (from The Glass Dunes, added); Sandfish (from The Glass Dunes, added); Dust-devil Kestrel (from The Glass Dunes, added); Fennec Fox (from The Glass Dunes, added); Thorny Devil (from The Glass Dunes, added); Antlion Pit (from The Glass Dunes, added); Dromedary (from The Glass Dunes, added); Dune Packrat (from The Glass Dunes, added)

**Cut (14).**
- Armadillo Guard (Common): on no list
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Dune Jackal (Common): on no list
- Dune Jackal Scout (Common): on no list
- Horned Lizard (Uncommon): on no list
- Meerkat Burrower (Common): to Savanna Reaches (Map 14)
- Meerkat Sentry (Common): on no list
- Moon Jerboa (Uncommon): on no list
- Pale Oryx (Uncommon): on no list
- Rabid Jackal (Uncommon): on no list
- Sandstorm Roc (Common): on no list
- Stonedrop Vulture (Uncommon): on no list
- Trapdoor Spider (Rare): on no list
- Carrion Crow (Common): to The Briar Maze (Map 12)

**Mix.** 13 cards: 1 high-cost (8%), 2 generators (15%), 10 plain (77%); average cost 1.00 (unique 1.33); resources: lumber.

**HUB9 flags.** Resolved: 1 listed before it is obtainable, 2 on 4+ lists, 6 theme misfit. Left: none.

### Map 20: The Sundered Peak (m11)

**Theme.** Volcanic & ash, Mountain & sky. The campaign’s final approach — apex predators, no scouts left to send ahead of you. Ten regions down. One throne left. Field: Heatwave (5 of 11 fights). New in its fights: Fire Arrow, Carrion.

**Unique (11).**
- Ash Cloud Condor (Rare, map 20-2, cost 1): Volcanic & ash; skirmish reward of 20-2; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Magma Wraith (Uncommon, map 20-7, cost 1): Volcanic & ash; skirmish reward of 20-7; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Ossuary Lammergeier (Super Rare, map 20-10, cost 1): Volcanic & ash; skirmish reward of 20-10; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Pack Mule (Common, map 20-1, cost 0) 🪵: Volcanic & ash; skirmish reward of 20-1; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Woodland Brawler (Very Rare, map 20-9, cost 1): Volcanic & ash; skirmish reward of 20-9; also fits Eye of the Volcano, Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Ashbone Ghoul (Common, pack 3, cost 0): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Cave Warlord (Common, pack 3, cost 4)  💰cost 4: Volcanic & ash; also fits The Glimmer Depths, Ashen Spurn, Eye of the Volcano, Volcano Lair
- Cinder Skeleton (Common, pack 3, cost 1): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Bear Cub (Uncommon, pack 3, cost 0): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Magma Salamander (Rare, pack 3, cost 1): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera
- Ash Moth (Common, pack 3, cost 1): Volcanic & ash; also fits Ashen Spurn, Eye of the Volcano, Volcano Lair, The Rimefire Caldera

**Carried (4).** Glacier Wolf Pack (from Ashen Spurn, added); Pumice Beetle (from Ashen Spurn, added); Cinder Stoker (from Ashen Spurn, added); Echidna Quillshot (from Ashen Spurn, added)

**Cut (6).**
- Pall Wraith (Rare): on no list
- Obsidian Lich (Rare): on no list
- Glasswing Butterfly (Rare): on no list
- Firefly Swarm (Uncommon): on no list
- Fire Hawk (Rare): on no list
- Marmot Stonecutter (Common): on no list

**Mix.** 15 cards: 2 high-cost (13%), 2 generators (13%), 11 plain (73%); average cost 1.00 (unique 1.00); resources: lumber, stone.

**HUB9 flags.** Resolved: 2 theme misfit. Left: on 4 lists (Cinder Stoker).

### Submap: Eye of the Volcano (opens at 20, side of The Sundered Peak)

**Theme.** Volcanic & ash. Down inside the crater, where the dead keep the fire company and the living learned not to need much. Field: Sulphur Fumes (2 of 7 fights). New in its fights: Sacrifice, Grit.

**Submap call:** ask owner (2 unique). Inside the Sundered Peak's crater, same volcanic biome, but 7 fights and its own people (the dead at the fire).

**Unique (2).**
- The Contradiction (Epic, map 20-A-4, cost 1): Volcanic & ash; skirmish reward of 20-A-4; also fits Volcano Lair, The Rimefire Caldera, Basalt Foundry
- Gorge Wyrm (Common, pack 3, cost 3)  💰cost 3: Volcanic & ash; also fits Ashen Spurn, The Sundered Peak, Volcano Lair, The Rimefire Caldera

**Carried (10).** Cinder Stoker (from Ashen Spurn); Ashbone Ghoul (from The Sundered Peak, added); Cinder Skeleton (from The Sundered Peak, added); Pack Mule (from The Sundered Peak, added); Obsidian Scorpion (from The Glass Dunes); Ash Cloud Condor (from The Sundered Peak, added); Bear Cub (from The Sundered Peak, added); Magma Wraith (from The Sundered Peak, added); Ossuary Lammergeier (from The Sundered Peak, added); Ash Moth (from The Sundered Peak, added)

**Cut (7).**
- Basalt Boar (Common): on no list
- Blessed Avatar (Common): on no list
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Cinder Imp (Common): on no list
- Fumarole Ibex (Rare): on no list
- Silverback Brawler (Common): on no list
- Sulfur Vent Crab (Uncommon): on no list

**Mix.** 12 cards: 1 high-cost (8%), 1 generators (8%), 10 plain (83%); average cost 0.83 (unique 2.00); resources: lumber.

**HUB9 flags.** Resolved: 3 on 4+ lists, 2 no source, 1 listed before it is obtainable. Left: on 4+ lists (Cinder Stoker, Obsidian Scorpion), on 4 lists (Ashbone Ghoul, Pack Mule, Ash Cloud Condor).

### Submap: Volcano Lair (opens at 20, side of The Sundered Peak)

**Theme.** Volcanic & ash. Where the mountain's fire is born. Something vast sleeps in it, and it is waking. Field: Sulphur Fumes. New in its fights: Frenzy, Stun.

**Submap call:** additional challenges on the parent map (1 unique). The Sundered Peak's own finale: the dragon's lair and the world boss, 4 fights.

**Unique (2).**
- Fire Drake Hatchling (Heroic, map 20-B-4, cost 2)  💰cost 2: Volcanic & ash; skirmish reward of 20-B-4
- The Caldera Wyrm (Heroic, map 20-B-4, cost 0)  💰cost 0: Volcanic & ash; skirmish reward of 20-B-4; moved from Volcano Lair

**Carried (10).** Magma Salamander (from The Sundered Peak, added); Magma Titan (from Ashen Spurn); Cinder Stoker (from Ashen Spurn); Pack Mule (from The Sundered Peak, added); Obsidian Scorpion (from The Glass Dunes); Cave Warlord (from The Sundered Peak, added); Woodland Brawler (from The Sundered Peak, added); Ash Cloud Condor (from The Sundered Peak, added); Ash Moth (from The Sundered Peak, added); Ashbone Ghoul (from The Sundered Peak, added)

**Cut (10).**
- Basalt Boar (Common): on no list
- Cinder Gecko (Common): to The Rimefire Caldera (Map 22)
- Cinder Hornet (Common): to The Rimefire Caldera (Map 22)
- Cinder Imp (Common): on no list
- Ember Centipede (Common): on no list
- Ember Jackal (Rare): on no list
- Gorge Wyrm (Common): to Eye of the Volcano (Map 20)
- Pyroclast Wyrm (Common): on no list
- Silverback Brawler (Common): on no list
- Tide Spirit (Rare): on no list

**Mix.** 12 cards: 4 high-cost (33%), 1 generators (8%), 7 plain (58%); average cost 1.17 (unique 1.00); resources: lumber, metal, stone. **Flag: 2 unique over its 1 (skirmish rewards).**

**HUB9 flags.** Resolved: 3 on 4+ lists, 2 listed before it is obtainable, 1 no source. Left: on 4+ lists (Cinder Stoker, Obsidian Scorpion), on 4 lists (Pack Mule, Ash Cloud Condor, Ashbone Ghoul).

### Map 21: The Quiet Summit (m21)

**Theme.** Mountain & sky. Above the clouds, the storm has passed. The air is thin and still, and everything that lives this high has had all night to rest. Field: Quiet Contemplation (21-6 only) (1 of 6 fights). New in its fights: Scatterbrained, Expose.

**Unique (11).**
- Pika Hoarder (Common, map 21-1, cost 0): Mountain & sky; skirmish reward of 21-1; also fits The Old Bramble, The Rimefire Caldera
- Snow Owl Sentinel (Super Rare, map 21-6, cost 1): Mountain & sky; skirmish reward of 21-6; also fits The Ice Hollow, The Rimefire Caldera
- Snow Leopard (Very Rare, pack 4, cost 1): Mountain & sky; also fits The Rimefire Caldera
- Glacier Yak (Common, pack 4, cost 3)  💰cost 3: Mountain & sky; also fits The Ice Hollow, The Rimefire Caldera
- Eagle Sharpshooter (Common, pack 4, cost 2)  💰cost 2: Mountain & sky; also fits The Rimefire Caldera
- Mountain Goat Climber (Uncommon, pack 1, cost 0): Mountain & sky; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Candle Moth (Common, none, cost 0): Mountain & sky; added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Chapel Tortoise (Uncommon, none, cost 0): Mountain & sky; added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Friar Badger (Uncommon, none, cost 0): Mountain & sky; added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Gale Sprite (Common, none, cost 1): Mountain & sky; added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak
- Golden Magpie (Uncommon, none, cost 0) 🪵: Mountain & sky; brought in for the mix (generator); added; also fits Eyrie Heights, The Aerie Vault, Ashen Spurn, The Sundered Peak

**Carried (4).** Eyrie Warden (from Eyrie Heights, added); Talus Pika (from Wolfsbane Tundra, added); Alpine Marmot (from Eyrie Heights); Golden Eagle Diver (from Gannet Cliffs)

**Cut (1).**
- Scree Goat (Uncommon): on no list

**Mix.** 15 cards: 3 high-cost (20%), 2 generators (13%), 10 plain (67%); average cost 0.80 (unique 0.73); resources: lumber.

**HUB9 flags.** Resolved: 1 on 4+ lists. Left: on 4+ lists (Golden Eagle Diver), no source yet (proposed home: this map's pack tier) (Candle Moth, Chapel Tortoise, Friar Badger, Gale Sprite, Golden Magpie), on 4 lists (Talus Pika).

### Submap: The Old Bramble (opens at 21, side of Bramblewood Outskirts)

**Theme.** Meadow & woodland, Taiga. The thorns around the Outskirts are older than the village. Something waited in them for you to grow strong. Field: no field effect. New in its fights: Counterattack, Spiteful.

**Submap call:** additional challenges on the parent map (1 unique). A return to the Outskirts' thorns for a late challenge, 4 fights.

**Unique (1).**
- Ent (Rare, map 0-B-4, cost 0): Meadow & woodland; skirmish reward of 0-B-4

**Carried (11).** Owl Sentinel (from Bramblewood Outskirts, added); Terrier Pup (from Bramblewood Outskirts, added); Chipmunk Cavalry (from Bramblewood Outskirts, added); Chipmunk Skirmisher (from Bramblewood Outskirts, added); Tomcat (from Bramblewood Outskirts, added); Glacier Wolf Pack (from Ashen Spurn); Cypress Root Lurker (from Bramblewood Outskirts, added); House Cat (from Bramblewood Outskirts, added); Marsh-mallow Hare (from Bramblewood Outskirts, added); Dune Packrat (from The Glass Dunes, added); Echidna Quillshot (from Ashen Spurn, added)

**Cut (7).**
- Burrow Rabbit (Starter): Base card
- Elder Willow (Common): on no list
- Otter Paddler (Starter): Base card
- Pond Trout (Starter): Base card
- Thornwood Palisade (Rare): on no list
- Trash Panda Trickster (Common): to Smugglers' Grotto (Map 7)
- Tunnel Ant (Rare): Base card

**Mix.** 12 cards: 1 high-cost (8%), 1 generators (8%), 10 plain (83%); average cost 0.58 (unique 0.00); resources: lumber.

**HUB9 flags.** Resolved: 1 theme misfit, 1 on 4+ lists. Left: on 4 lists (Cypress Root Lurker, House Cat, Marsh-mallow Hare).

### Submap: The Ice Hollow (opens at 21, side of Wolfsbane Tundra)

**Theme.** Tundra & ice. A cave of blue ice under the tundra. The cold in here has teeth. Field: Slippery ice. New in its fights: Molting.

**Submap call:** additional challenges on the parent map (1 unique). An ice cave under Wolfsbane Tundra, the same tundra biome, 4 fights.

**Unique (1).**
- Greenland Shark (Rare, map 17-A-4, cost 1): Tundra & ice; skirmish reward of 17-A-4; also fits The Rimefire Caldera

**Carried (11).** Lone Grey Wolf (from Wolfsbane Tundra, added); Snow Ermine (from Wolfsbane Tundra, added); Glacial Ape-King (from Wolfsbane Tundra, added); Frost Hare Sprinter (from The Pinewood Taiga); Ravenous Wolverine (from Wolfsbane Tundra, added); Harbor Seal (from Wolfsbane Tundra, added); Polar Bear (from Wolfsbane Tundra, added); Snow Bunting Archer (from Wolfsbane Tundra, added); Spitting Spider (from Wolfsbane Tundra, added); Walrus Icebreaker (from Wolfsbane Tundra, added); Talus Pika (from Wolfsbane Tundra, added)

**Cut (9).**
- Alpha Howler (Common): to The Pinewood Taiga (Map 16)
- Arctic Fox Raider (Rare): on no list
- Arctic Tern (Uncommon): on no list
- Boreal Elk (Common): to The Pinewood Taiga (Map 16)
- Harp Seal Pup (Common): on no list
- Ice-Crevasse Wolf (Rare): on no list
- Krill Swarm (Common): on no list
- Lemming Swarm (Common): on no list
- Ringed Seal (Common): on no list

**Mix.** 12 cards: 1 high-cost (8%), 1 generators (8%), 10 plain (83%); average cost 1.00 (unique 1.00); resources: lumber.

**HUB9 flags.** Resolved: 2 theme misfit. Left: on 4 lists (Talus Pika).

### Map 22: The Rimefire Caldera (m22)

**Theme.** Volcanic & ash, Tundra & ice, Mountain & sky. Still above the clouds, the road crosses a crater that never went cold: snow on black glass, steam from every crack, and things that learned to live in both. Field: Frigid (frozen ground). New in its fights: Ice Bolt.

**Unique (11).**
- Rimefire Salamander (Rare, map 22-2, cost 1): Volcanic & ash; skirmish reward of 22-2; also fits Basalt Foundry
- Caldera Snow Leopard (Super Rare, map 22-8, cost 1): Volcanic & ash; skirmish reward of 22-8; also fits Basalt Foundry
- Ür-Elk (Very Rare, map 22-6, cost 1): Tundra & ice; skirmish reward of 22-6
- Ice Petrel (Uncommon, pack 4, cost 1): Volcanic & ash; also fits Basalt Foundry
- Badger Berserker (Rare, pack 4, cost 1): kin: Caves & burrows
- Cinder Gecko (Common, pack 4, cost 0): Volcanic & ash; also fits Basalt Foundry
- Cinder Hornet (Common, pack 4, cost 2)  💰cost 2: Volcanic & ash; also fits Basalt Foundry
- Permafrost Mammoth (Common, pack 4, cost 3)  💰cost 3: Volcanic & ash; also fits Basalt Foundry
- Ashwing Ptarmigan (Rare, pack 4, cost 1): Volcanic & ash; also fits Basalt Foundry
- Rimeheart Colossus (Epic, none, cost 3)  💰cost 3: Volcanic & ash; added; also fits Eye of the Volcano, Volcano Lair, Basalt Foundry
- Ash Imp (Common, none, cost 0): Volcanic & ash; added; also fits Ashen Spurn, The Sundered Peak, Eye of the Volcano, Volcano Lair

**Carried (4).** Gorge Wyrm (from Eye of the Volcano); Pumice Beetle (from Ashen Spurn, added); Fire Salamander (from Ashen Spurn, added); Phoenix Fledgling (from Ashen Spurn, added)

**Cut (3).**
- Fumarole Ibex (Rare): on no list
- Weathervane Swift (Rare): on no list
- Petrified Tree (Rare): on no list

**Mix.** 15 cards: 5 high-cost (33%), 1 generators (7%), 9 plain (60%); average cost 1.40 (unique 1.27); resources: stone.

**HUB9 flags.** Resolved: 1 on 4+ lists, 3 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Rimeheart Colossus, Ash Imp).

### Submap: The Long Burrow (opens at 22, side of The Rimefire Caldera)

**Theme.** Caves & burrows.  Field: no field effect. New in its fights: Friction, Heavy Metal.

Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB). 6 cards.

### Map 23: The Goldfeather Siege (m23)

**Theme.** Village & keep. Down from the heights at last, onto churned fields below a golden wall. The Magnate's hired army is camped outside it, and it has elephants. Field: Arrow Slits. New in its fights: Arrow count, Vanguard.

**Unique (11).**
- Testudo Tortoise (Rare, map 23-2, cost 2)  💰cost 2: Village & keep; skirmish reward of 23-2; also fits Goldfeather Keep
- War Elephant (Super Rare, map 23-8, cost 3)  💰cost 3: Village & keep; skirmish reward of 23-8; also fits Goldfeather Keep
- Triumphvirate (Unique, map 23-8, cost 3)  💰cost 3: its skirmish reward; skirmish reward of 23-8; moved from The Goldfeather Siege
- Badger Trench Digger (Common, pack 4, cost 2)  💰cost 2: Village & keep; also fits Goldfeather Keep
- Howdah Archers (Rare, pack 4, cost 1): Village & keep; also fits Goldfeather Keep
- Beetle Battering-Ram (Rare, pack 4, cost 1): Village & keep; also fits Goldfeather Keep
- Siege Rhino (Rare, pack 4, cost 1): Village & keep; also fits Goldfeather Keep
- Trebuchet Crew (Rare, pack 4, cost 2)  💰cost 2: Village & keep; also fits Goldfeather Keep
- Balloon Archer (Uncommon, pack 2, cost 1): Village & keep; also fits Clovermead, The Old Bramble, Goldfeather Keep
- Colony (Rare, none, cost 0): Village & keep; added; also fits Goldfeather Keep
- Land Tiller (Common, pack 3, cost 0) 🪵: Village & keep; brought in for the mix (generator); moved from The Long Grass; also fits The Old Bramble, Goldfeather Keep

**Carried (4).** Lodge Engineer (from Lilypad Reach, added); Pack Mule (from The Sundered Peak); Mouse Sapper (from The Briar Maze); Stoat Cutthroat (from The Long Grass, added)

**Cut (2).**
- Marching Elephant (Rare): on no list
- Werebadger (Rare): on no list

**Mix.** 15 cards: 6 high-cost (40%), 3 generators (20%), 7 plain (47%); average cost 1.33 (unique 1.45); resources: lumber.

**HUB9 flags.** Resolved: 3 theme misfit. Left: no source yet (proposed home: this map's pack tier) (Colony), on 6 lists (Lodge Engineer).

### Submap: Basalt Foundry (opens at 23, side of Ashen Spurn)

**Theme.** Volcanic & ash. A furnace of cracked black stone — everything here glows from the inside. Field: Ashy. New in its fights: Core Evil, Chained, Penance, Inherent Darkness.

**Submap call:** a full delve into a new location (3 unique). A furnace city of its own (10 fights, the metal and fire workshops), a full map in size.

**Unique (3).**
- Ember Revenant (Epic, map 19-A-10, cost 2)  💰cost 2: Volcanic & ash; skirmish reward of 19-A-10
- Anvilwhisker Otter (Uncommon, none, cost 2)  💰cost 2: hand call: an otter smith that forges weapons for Stone: the foundry's workshop; added; also fits Sunken Hollow, Lilypad Reach
- Ore-Smelter Mole (Uncommon, pack 1, cost 1) 🔩: hand call: a mole that makes Metal belongs in the foundry: Basalt Foundry introduces Metal; added; also fits Smugglers' Grotto, Caves & Alcoves, The Glimmer Depths

**Carried (10).** Cinder Gecko (from The Rimefire Caldera); Quill Volley (from Ashen Spurn, added); Ashbone Ghoul (from The Sundered Peak); Magma Salamander (from The Sundered Peak); Ash Cloud Condor (from The Sundered Peak); Fire Salamander (from Ashen Spurn, added); Hercules Beetle (from The Canopy); Phoenix Fledgling (from Ashen Spurn, added); Beaver Lumberjack (from Bramblewood Outskirts); Porcupine Roller (from Ashen Spurn, added)

**Cut (12).**
- Basalt Boar (Common): on no list
- Chained Binturong (Uncommon): on no list
- Cinder Imp (Common): on no list
- Ember Jackal (Rare): on no list
- Flagellant Vulture (Uncommon): on no list
- Fruit-bat Familiar (Uncommon): on no list
- Hellbender (Common): on no list
- Obsidian Scorpion (Rare): to The Glass Dunes (Map 18)
- Pyroclast Wyrm (Common): on no list
- Sulfur Vent Crab (Uncommon): on no list
- Tide Spirit (Rare): on no list
- Vampire Finch (Uncommon): on no list

**Mix.** 13 cards: 3 high-cost (23%), 2 generators (15%), 8 plain (62%); average cost 0.92 (unique 1.67); resources: lumber, metal.

**HUB9 flags.** Resolved: 4 on 4+ lists, 6 no source. Left: no source (Beaver Lumberjack), no source yet (proposed home: this map's pack tier) (Anvilwhisker Otter), theme misfit (Anvilwhisker Otter).

### Map 24: Goldfeather Keep (m24)

**Theme.** Village & keep. Through the gate at last. Inside the walls everything is gilded, guarded and counted, and the Magnate Duck is waiting at the top of the keep. Field: Arrow Slits. New in its fights: Sentry, Hoard, Taunt, Reach.

**Unique (11).**
- Gilded Swan Knight (Super Rare, map 24-8, cost 1): Village & keep; skirmish reward of 24-8
- Iron Warden (Epic, map 24-6, cost 1): Village & keep; skirmish reward of 24-6
- Battlement Heron (Rare, map 24-5, cost 1): Village & keep; skirmish reward of 24-5
- Duckling Squadron (Common, pack 4, cost 0): Village & keep
- Elderhorn Monarch (Common, pack 4, cost 3) 🪵 💰cost 3: Village & keep
- Mallard Halberdier (Rare, pack 4, cost 1): Village & keep
- Tax-Collector Teal (Uncommon, pack 4, cost 0) 🪵: Village & keep
- Goose Sentry (Rare, pack 4, cost 1): Village & keep
- Great Gate (Common, none, cost 2)  💰cost 2: Village & keep; added; also fits The Goldfeather Siege
- Nest (Common, none, cost 0): Village & keep; added; also fits The Goldfeather Siege
- Stoneheart Golem (Common, none, cost 2)  💰cost 2: Village & keep; added; also fits The Goldfeather Siege

**Carried (4).** Lodge Engineer (from Lilypad Reach); Land Tiller (from The Goldfeather Siege, added); Balloon Archer (from The Goldfeather Siege, added); Badger Trench Digger (from The Goldfeather Siege, added)

**Cut (1).**
- Mallard Marauder (Rare): on no list

**Mix.** 15 cards: 5 high-cost (33%), 4 generators (27%), 8 plain (53%); average cost 1.13 (unique 1.09); resources: lumber.

**HUB9 flags.** Resolved: none. Left: no source yet (proposed home: this map's pack tier) (Great Gate, Nest, Stoneheart Golem).

## Cards on no list, by old pack (426)

- **Hedgerow Pouch** (93): Acacia Giraffe, Alley Cat, Anaconda Coil, Anhinga Spearbird, Arc Bat, Beachcomber Sanderling, Beaver Builder, Beetle Grunt, Blister Beetle, Bog Revenant, Bramble Gauntlet, Briarback Hedgehog, Buzzed Chipmunk, Carrion Beetle, Coral Current Eel, Cottonmouth Matriarch, Crown Pretender, Cuttlefish Illusionist, Dam Wall, Dam-Keeper Beaver, Diving Bell Spider, Dolphin Knight, Driftwood Crab, Eagle Diver, Elder Tortoise, Ember Tetra, Farm Dog, Frostbitten Wolverine, Giant Water Bug, Grass Snake, Great Crested Grebe, Great Skua, Greater Siren, Grindstone Boar, Hammerhead Shark, Hawk Arrowkeeper, Heartwood Treant, Honey Badger Fury, Humpback Elder, Ironback Gorilla, Ironmaw Warwolf, Irradiated Couatl, Lamprey, Lotus Frog, Lunar Howler, Malachite Golem, Marsh Gas Toad, Marsh Harrier, Mayfly Dancer, Migration Leader, Mire Witch-Heron, Moat Snapper, Moonlit Hare, Moray Ambusher, Narwhal Lancer, Night Watchman, Owl Fletcher, Oyster Bank, Oystercatcher, Paper Wasp, Parish Sergeant, Plague Gnat Cloud, Plains Zebra, Pond Algae, Pond Paddler, Puddle Changeling, Puddle Skimmer, Puffball Bombardier, Quarry Troll, Rafflesia, Raft Spider, Rainmaker Frog, Reef Manta Glider, River Mink, Rock Pool Starfish, Rot-Swollen Carcass, Shieldbearer Hound, Shoal Shark, Signal Crayfish, Smokescreen Raccoon, Sparrow Chick, Sphagnum Vole, Spring Rain, Static Bat, Sworn Shieldbearer, Tailwind, The Unremembered, Thick Fog, Timber Wolf Pack Leader, Voltwing Bat, War Hound, Weredog, Willow-o'-Wisp
- **Tidemire Chest** (98): Antler Skirmisher, Baby Bat, Baby Horned Capybara, Badger Sapper, Barkplate Beetle, Barnacle Fortress, Beaver Feller, Blind Cave Fish, Bloodscent Shark, Boar Rampager, Bog Behemoth, Bog Leech, Buck Brawler, Carrion Fly Swarm, Cave Centipede, Cave Pseudoscorpion, Cleaner Wrasse, Clover Butterfly, Coffer Mimic, Cone Snail, Crown-of-thorns Star, Dynamite Packrat, Echo Keeper, Electric Catfish, Elephant-nose Fish, Feral Tuskboar, Field Crow, Firetail Trickster, Fishing Cat, Fox Kit, Fox Sharpshot, Fox Warchief, Full Moon, Fungus Gnat Cloud, Gallery Orb-Weaver, Gangrenous Leech, Ghost Crayfish, Giant Clam, Gravel Mole, Grotto Lobster, Guano Beetle, Hazel Coppice, Hollow Oath-Keeper, Horseshoe Crab, Ironclaw Fiddler, King Maker, Ladybird Guard, Leopard Slug, Limpet Clinger, Lion's Mane Jelly, Lionfish, Magpie Collector, Mallard Marauder, Mantis Shrimp, Margay, Marmot Stonecutter, Millipede Hauler, Mosquito Cloud, Mudflat Godwit, Nightjar Drifter, Nightshade Moth, Pack Rat Looter, Pelican Diver, Pigeon Peon, Pill Bug, Pine Marten, Piranha Shoal, Proboscis Monkey, Puddle Hopper, Pufferfish Bulwark, Quill-Thorn Boar, Raccoon Warlord, Red-backed Salamander, Rodent King, Salvager Hermit Crab, Sawfish, Sea Cucumber, Sea Hare, Seed-cache Squirrel, Skunk Gasser, Sleepless Shrew, Stag Beetle, Subterraneaner, Sulfur Vent Crab, Swamp Rabbit, Thornvine Lasher, Trapdoor Spider, Tunnel Wyrm, Turtle Bastion, Tusked Vanguard, Vampire Bat Nurse, Village Miller, Voltaic Eel, War Panther, Warren Scout, Webspire Sentinel, Whale Shark, Yellow-bellied Sea Snake
- **Highcrest Case** (73): Alpine Avalanche, Amber Cicada, Ancient Sloth Titan, Anvil Thrush, Armadillo Guard, Armored Mastiff, Barrow Leech, Basalt Boar, Beluga, Blizzard, Bonebreaker, Bramblewood Macaque, Cave Bat Swarm, Cave Bear, Cave Cricket, Cave Flitter, Cave Swiftlet, Chipmunk Stockpiler, Courier Pigeon, Dune Jackal, Dune Jackal Scout, Ember Centipede, Ember Jackal, Fire Hawk, Firefly Swarm, Frillneck Duelist, Frost Thistle Lynx, Frostmoon Howler, Fumarole Ibex, Garden Tiger Moth, Glasswing Butterfly, Glasswing Moth, Glimmer Spider, Granite Ox Golem, Great Horned Owl, Heatwave, Horned Lizard, Howler Monkey, Inland Taipan, Jackrabbit Sprinter, Lovebird, Marula Monkey, Meerkat Sentry, Monarch Wingblade, Mongoose Duelist, Monitor Rambler, Moon Jerboa, Moonshell Snail, Muntjac Barker, Musk Ox Calf, Musk Ox Matriarch, Obsidian Lich, Pack Wolf Reaver, Pale Oryx, Pall Wraith, Pinecone Sapper, Pyroclast Wyrm, Rabid Jackal, Raccoon Nightcrew, Rockslide Ram, Sandstorm Roc, Scraper of Skies, Scree Goat, Silverback Brawler, Springtail Hopper, Static Fennec, Stonedrop Vulture, Tarantula Hawk, Termite Forager, Termite Mound, Tide Spirit, Tundra Musk Ox, Vampire Roost
- **Pack 4** (14): Arctic Fox Raider, Arctic Tern, Elder Willow, Harp Seal Pup, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Marching Elephant, Petrified Tree, Ringed Seal, The Magnate Duck, Thornwood Palisade, Weathervane Swift, Werebadger
- **Faction pool** (53): Birdlime Dauber, Clap-net Trapper, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Daily Post, Dawn Bellringer, Dominion Nestguard, Ferry Toll-Frog, Ford Kingfisher, Gold-throated Acolyte, Hedge Changeling, Helmeted Otter, Honeyjoe Brewer, Hummingbird Needler, Hush-Wing Spy, Lantern Bearer, Marshal of Rivergate, Mist-net Otter, Nectar Sipper, Nectar Vintner, Net Thrower, Old Willow of the Ford, Optio of the Ford, Otter Angler, Otter Ferryman, Otter Flag Bearer, Otter Lantern Bearer, Otter Netmender, Otter Riverguard, Otter Scout, Otter Shieldback, Petal Fletcher, Pike Lancer, River Warden, Riverbed Diver, Rivergate Drummer, Rivergate Recruit, Rivergate Tribune, Riverside Peddler, Riverstone Slinger, Royal Guard, Ruby-Throat Duelist, Shell-Cracker, Shellwright Apprentice, Sunfeather Scout, Sunspire Choirmother, Sunspire Envoy, Sunspire Sky-Sovereign, Sunthroat Courier, Swordbill Challenger, Truce Heron, Violet Vane Fletcher, Voidfeather Scout
- **Mystery Booster** (11): Glass Changeling, Glass Golem, Inside-Out Hedgehog, Irradiated Axolotl, Irradiated Glow Wyrm, Mirror Moth, Snail Mail, Teatime Toad, Two-Headed Calf, Upside-Down Bat, Wrong-Way Salmon
- **No source (creatures)** (84): Abbey Goose, Armory, Ashmantle Fiend, Aye-aye Prowler, Bee Drone, Blackmass Acolyte, Blessed Avatar, Bog Shrew, Bone Diviner, Brimstone Hound, Canopy Sloth Guardian, Cathedral Eagle, Chained Binturong, Chapel Sparrow, Chilli Parrot, Cinder Imp, Clinging Leech, Conger Eel, Corpse-flower Beetle, Dread Bell, Ember Wisp, Flagellant Vulture, Fruit-bat Familiar, Geode Scorpion, Glintsnatch Magpie, Gloom Gibbon, Glowing Gecko, Glowworm Cluster, Gnawed Matriarch, Grovebearer Dragon-Turtle, Hagfish Silencer, Hanging Loafer, Hellbender, Hollow-belly Rat, Hymn Wren, Ice Fish, Kelpborn Otter, Leaf Chameleon, Leopard Seal, Lichen Tortoise, Lurking Dread, Marshal Tuskwell, Mire Rat, Mirrorhide Mutant, Moon Jelly, Mother Carrier, Oilbird, Old-Growth Tortoise, Phoenix Mushrooms, Pit Glutton, Poison Dart Frog, Puppeteer Imp, Rabbit Kit, Raven Harbinger, Raven Hexcaller, Roseate Spoonbill, Salamander Pyromancer, Sanderling, Selkie Wavebinder, Shrine Acolyte, Shrine Bell-Ringer, Shrine High Priest, Slow Loris, Slowpoke Sentinel, Soldier Ant, Sperm Whale Elder, Starfall Owl, Storm Heron, Stormcaller, Strangler Vine, Supernova Jelly, Swarm Matriarch, Tardigrade, The Sixfold, The Thistle Baron, Thunder Lizard, Tithe Collector, Toucan Courier, Vampire Finch, Velvet Worm, Vigil Owl, Wallcreeper, War-Drum Mandrill, Water Scorpion

On a list though they have no source yet (they would join that map's pack tier): Ant Hill, Anvilwhisker Otter, Ash Imp, Beaver Lumberjack, Candle Moth, Chapel Tortoise, Colony, Friar Badger, Gale Sprite, Golden Magpie, Great Gate, Nest, Rimeheart Colossus, Stoneheart Golem.

