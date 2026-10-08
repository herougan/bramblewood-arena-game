# Card stage plan (2026-10-08)

Goal: decide which cards each early Conquest stage introduces, so the owner can then set power levels. Scope is the beginner pool of about 60 cards: today's 44 plus the 11 new critters, plus up to 5 extras.

Sources read: `canonical/cards.json`, `CONQUEST_MAPS` and `cardSourceOf()` / `nodeRewardCardIds()` in `arena_app.js`, `TUTORIAL_REWARD_IDS`, `buildFactionStarterDeck()`.

## 1. How we count today's 44

`cardSourceOf()` decides where a card comes from. A card is free from the start ("base") if it is a Starter, flagged `basic`, is `wandering-traveller`, or has `locked:false`. Node rewards are the cards whose `source` is `{kind:'map', id, node}`.

| Group | Cards | Count |
|---|---|---|
| Faction Basics (`basic:true`, Starter) | 20 Otter-side (otters, bees, ants, fish, ducks, rabbits, chipmunks) + 10 Hummingbirds | 30 |
| Other base cards (`locked:false` or special-cased) | otter-centurion, bee-knight, bee-drone, forager-ant, soldier-ant, wandering-traveller | 6 |
| Tutorial rewards (`TUTORIAL_REWARD_IDS`) | river-warden, sunspire-envoy, quarry-mole | 3 |
| Map 1 node rewards | feral-tomcat (1-1), chipmunk-cavalry (1-2), owl-nightwatch (1-3), otter-riverguard + shepherds-bark (1-4) | 5 |
| **Total** | | **44** |

This matches the owner's "44 unlocked". It is our best reading; live `card_overrides` could differ slightly.

Not counted (later or other sources): Map 2 rewards (5), Map 3 rewards (6), Map 4 rewards (5), Maps 5 to 11 have no reward cards yet, and 33 cards come from Tier 1 packs.

Note: a card with id `field-mouse` already exists in `cards.json` (1/5, +1 Gold on spawn, locked, no source). The other session should reuse or replace it, not add a duplicate.

## 2. Proposed pool: 60 cards

| Block | Cards | Count |
|---|---|---|
| Today's 44 | as above | 44 |
| New critters (other session) | field-mouse, garden-snail, hedgehog-scout, meadow-frog, pill-bug, sparrow-chick, rabbit-kit, beetle-grunt, earthworm, dormouse, guppy | 11 |
| Extras: Map 2's existing rewards | jackrabbit-sprinter, cuttlefish-illusionist, migration-leader, rootworm-colony, reef-manta-glider | 5 |
| **Total** | | **60** |

The 5 "extras" are already-built cards, so reaching 60 needs no new art. Scope ends at the Map 2 boss: Tutorial + 4 Map 1 nodes + 5 Map 2 nodes = 10 stages.

How the 60 split:

- **30 Basics** stay the starter grant after the tutorial (your faction's set, as `buildFactionStarterDeck()` does today). They appear in enemy decks freely but are not counted as a stage's new cards.
- **30 stage cards** are introduced one stage at a time: 5 in the tutorial, then 2 to 4 per node.

Principle: **meet it, then earn it.** Each node's enemy deck fields its new cards, and a first clear rewards them.

## 3. Stage by stage

Power band: 1 = weakest filler, 5 = a boss-level threat for this pool. These are starting guesses from current stats for the owner to tune. "New" means a new critter whose stats are not final yet, so its role is a suggestion.

### Tutorial (Map 1, lone node, castle HP 20)

- **Today:** player plays 2 copies of each Wait-0 Basic of their faction. Rival plays its 3 weakest Basics (one flier). Rewards: river-warden, sunspire-envoy, quarry-mole.
- **Proposed:** exactly 1 basic leader + 1 uncommon + 3 commons. The player keeps all 5 afterwards.

| Slot | Card id | Name | Rarity (proposed) | Role / keyword | Power |
|---|---|---|---|---|---|
| Leader | otter-centurion | Otter Centurion | Starter (today unset) | Sturdy Wait 1 front-liner, 3/9 | 2 |
| Uncommon | bee-drone | Bee Drone | Uncommon (today unset) | Flying; spawns a swarmling when attacked | 2 |
| Common | rabbit-kit | Rabbit Kit | Common (new) | Plain attacker, teaches attacking | 1 |
| Common | sparrow-chick | Sparrow Chick | Common (new) | Flying, teaches Flying | 1 |
| Common | garden-snail | Garden Snail | Common (new) | High health, low attack wall | 1 |

- Leader: Otter Centurion is a real card, base-available today, character-like ("first through the gate"), and has no special rules to explain. Hummingbird pick: use **dominion-nestguard** (Starter, 4/9 flying) as the mirror leader. No new leader card is needed.
- Move today's tutorial rewards: river-warden to 1-4, sunspire-envoy to 2-5, quarry-mole to 2-3.

### Map 1: Bramblewood Outskirts

#### 1-1 Otter Patrol (skirmish, HP 16)

- **Enemy today:** otter-kit x4, otter-paddler x4, honey-bee x4. **Reward today:** feral-tomcat.
- **Suggested enemy:** otter-kit x4, guppy x4, bee-knight x2, feral-tomcat x2.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| guppy | Guppy | Common (new) | Cheap fish filler, river theme | 1 |
| bee-knight | Bee Knight | Common (today unset) | Flying 2/3 | 1 |
| feral-tomcat | Feral Tomcat | Common | Quick 3/5 | 2 |

#### 1-2 Scorpion Ambush (skirmish, HP 20)

- **Enemy today:** worker-ant x4, tunnel-ant x4, ant-scout x2, caustic-scorpion x1. **Reward today:** chipmunk-cavalry.
- **Suggested enemy:** keep, but add pill-bug x3 and soldier-ant x2 (scorpion stays as the enemy-only "big bug").

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| forager-ant | Forager Ant | Common (today unset) | Ant filler 1/4 | 1 |
| soldier-ant | Soldier Ant | Common (today unset) | Wait 1 ant, 3/8 | 2 |
| pill-bug | Pill Bug | Common (new) | Armor-style roller, tanky | 1 |
| chipmunk-cavalry | Chipmunk Cavalry | Common | Quick, Cost 1, 4/9 | 3 |

#### 1-3 Raccoon Heist (skirmish, HP 20)

- **Enemy today:** trash-panda-trickster x4, meadow-rabbit x3, pond-trout x3, raccoon-nightcrew x1. **Reward today:** owl-nightwatch.
- **Suggested enemy:** trash-panda-trickster x3, dormouse x3, field-mouse x3, hedgehog-scout x2, raccoon-nightcrew x1. Night thieves fit mice and a night owl.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| dormouse | Dormouse | Common (new) | Sleepy, slow but sturdy (maybe Wait 1) | 1 |
| field-mouse | Field Mouse | Common (new) | +1 Gold on spawn, teaches resources | 1 |
| hedgehog-scout | Hedgehog Scout | Common (new) | Thorns-lite defender | 2 |
| owl-nightwatch | Owl Nightwatch | Common | Stealth, Flying, Cost 1 | 3 |

#### 1-4 Frost Vanguard (boss, HP 30, Plains Terrace)

- **Enemy today:** glacier-wolf-pack x3, quillback-elder x2, pond-duck x4. **Reward today:** otter-riverguard, shepherds-bark.
- **Suggested enemy:** keep today's deck (tuned to ~59% for a rebuilt deck).

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| otter-riverguard | Otter Riverguard | Common | Armor, Cost 2, 5/20 | 3 |
| shepherds-bark | Shepherd's Bark | Common | Guardian, 4/16 | 3 |
| river-warden | River Warden | Rare | Otter finisher, 5/15 (was a tutorial reward) | 4 |

### Map 2: Sunken Hollow

#### 2-1 Reef Skirmishers (skirmish, HP 26)

- **Enemy today:** open-ocean-hermit-crab x4, pond-trout x4, silver-minnow x2, reef-manta-glider x1. **Reward today:** jackrabbit-sprinter.
- **Suggested enemy:** add meadow-frog x3 in place of 2 trout.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| meadow-frog | Meadow Frog | Common (new) | Amphibian bridge card, maybe a small dodge | 1 |
| jackrabbit-sprinter | Jackrabbit Sprinter | Common | Quick, Cost 1, 5/8 | 3 |

#### 2-2 Tidal Ring (skirmish, HP 28)

- **Enemy today:** otter-riverguard x2, shrine-bell-ringer x4, open-ocean-hermit-crab x4. **Reward today:** cuttlefish-illusionist.
- **Suggested enemy:** add beetle-grunt x3.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| beetle-grunt | Beetle Grunt | Common (new) | Plain mid body, armored shell | 2 |
| cuttlefish-illusionist | Cuttlefish Illusionist | Common | Evasive, 3/12 | 3 |

#### 2-3 Cetacean Pod (elite, HP 34)

- **Enemy today:** reef-manta-glider x2, open-ocean-hermit-crab x4, river-carp x3, pond-trout x2. **Reward today:** migration-leader.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| migration-leader | Migration Leader | Common | Flying, 3/12 | 3 |
| quarry-mole | Quarry Mole | Common | Wait 1 wall, 2/10 (was a tutorial reward) | 2 |

#### 2-4 The Kraken's Maw (elite, HP 38)

- **Enemy today:** kraken-spawnling x1, open-ocean-hermit-crab x4, river-carp x3, pond-trout x3. **Reward today:** rootworm-colony.
- **Suggested enemy:** add earthworm x3 in place of trout.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| earthworm | Earthworm | Common (new) | Cheapest filler; pairs with Rootworm | 1 |
| rootworm-colony | Rootworm Colony | Common | Poison, 3/14 | 3 |

#### 2-5 The Drowned Colossus (boss, HP 40)

- **Enemy today:** kraken-spawnling x1, humpback-elder x1, reef-manta-glider x1, open-ocean-hermit-crab x4, river-carp x3. **Reward today:** reef-manta-glider.

| Card id | Name | Rarity | Role / keyword | Power |
|---|---|---|---|---|
| reef-manta-glider | Reef Manta Glider | Common | Evasive, Cost 2, 5/16 | 4 |
| sunspire-envoy | Sunspire Envoy | Rare | Hummingbird finisher, Esprit, Flying (was a tutorial reward) | 4 |
| wandering-traveller | Wandering Traveller | Common (today unset) | Draws a card on spawn, 6/7 | 4 |

### Count check

| Stage | New cards |
|---|---|
| Tutorial | 5 |
| 1-1 / 1-2 / 1-3 / 1-4 | 3 / 4 / 4 / 3 |
| 2-1 / 2-2 / 2-3 / 2-4 / 2-5 | 2 / 2 / 2 / 2 / 3 |
| Stage cards total | 30 |
| Basics (starter grant) | 30 |
| **Pool total** | **60** |

### Basics (starter grant, not stage-gated)

| Family | Card ids | Power |
|---|---|---|
| Otters | otter-kit, otter-paddler, otter-guard | 1, 1, 2 |
| Bees (Flying) | honey-bee, bee-forager, bee-sentry | 1, 1, 2 |
| Ants | worker-ant, tunnel-ant, ant-scout | 1, 1, 2 |
| Fish | silver-minnow, pond-trout, river-carp | 1, 1, 2 |
| Ducks (Flying) | duckling, pond-duck, duck-paddler | 1, 1, 2 |
| Rabbits | meadow-rabbit, cottontail, burrow-rabbit | 1, 1, 2 |
| Chipmunks | chipmunk-forager, acorn-chipmunk | 1, 1 |
| Hummingbirds (Flying) | cobalt-talon-fledgling, crimson-wing-recruit, mosswing-laborer, gold-throated-acolyte, violet-vane-fletcher | 1 each |
| Hummingbirds, Wait 1 (Flying) | sunthroat-courier, voidfeather-scout, crimson-wing-duelist-cadet, cobalt-talon-skirmisher, dominion-nestguard | 2, 2, 2, 2, 2 (Nestguard is the Hummingbird leader) |

## 4. Later stages (outside the beginner 60, unchanged)

Map 3 onward keeps today's decks. Map 3 and Map 4 already have reward cards. Maps 5 to 11 have none yet, so they are the natural home for pack cards or a second wave.


#### Map 3: The Ashen Peak

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 3-1 Badger Warband | skirmish | Badger Trench Digger x4, Honey Badger Fury x2, Quillback Elder x4 | Pack Rat Looter |
| 3-2 Quill Line | skirmish | Quillback Elder x4, Honey Badger Fury x3, Badger Trench Digger x3 | Camouflage Frog |
| 3-3 Porcupine Bastion | elite | Quillback Elder x6, Porcupine Roller x2, Canopy Sloth Guardian x2 | Slowpoke Sentinel |
| 3-4 Sky Marks | elite | Eagle Sharpshooter x4, Sandstorm Roc x4, Scraper of Skies x2 | Duckling Squadron |
| 3-5 Sky Scraper Sentinel | elite | Scraper of Skies x2, Eagle Sharpshooter x4, Sandstorm Roc x4 | Canopy Sloth Guardian |
| 3-6 The Frost Yeti King | boss | Yeti x4, Glacier Wolf Pack x4, Frost Hare Sprinter x2 | Glacier Wolf Pack |

#### Map 4: Caves & Alcoves

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 4-1 Roost Flurry | skirmish | Cave Flitter x4, Bat Swarmling x5, Cave Bat Swarm x3 | none |
| 4-2 Glowworm Grotto | skirmish | Glowworm Cluster x2, Blind Cave Fish x4, Barrow Leech x4 | Blind Cave Fish |
| 4-3 Cinder Vents | skirmish | Sulfur Cinder Moth x6, Cave Bat Swarm x2, Barrow Leech x2 | none |
| 4-4 Echo Chamber | skirmish | Echo Screecher x3, Cave Flitter x6 | Sulfur Cinder Moth |
| 4-5 Sulfur Vent Path | skirmish | Sulfur Cinder Moth x6, Cave Bat Swarm x2, Barrow Leech x2 | none |
| 4-6 Glowworm Deep | skirmish | Glowworm Cluster x2, Blind Cave Fish x4, Barrow Leech x4 | Echo Screecher |
| 4-7 The Roost Above | elite | Vampire Roost x2, Echo Screecher x5, Bat Swarmling x2 | Vampire Roost |
| 4-8 The Stalactite Warden | boss | Stalactite Golem x1, Deep Cave Troll x4, Echo Screecher x3 | Stalactite Golem |
| m4-raid The Deep Troll King | raidboss | Deep Cave Troll x6, Stalactite Golem x2, Vampire Roost x1 | none |

#### Map 5: Savanna Reaches

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 5-1 Zebra Stampede | skirmish | Plains Zebra x4, Dust Hyena x4, Howler Monkey x2 | none |
| 5-2 Hyena Chorus | skirmish | Dust Hyena x4, Jaguar Stalker x3, Toucan Courier x3 | none |
| 5-3 Howler Canopy | skirmish | Howler Monkey x4, Toucan Courier x4, Dust Hyena x2 | none |
| 5-4 Toucan Watch | skirmish | Toucan Courier x4, Jaguar Stalker x3, Plains Zebra x3 | none |
| 5-5 Giraffe Vanguard | elite | Acacia Giraffe x3, Savanna Cheetah x4, Plains Zebra x3 | none |
| 5-6 Jaguar Run | elite | Jaguar Stalker x4, Savanna Cheetah x3, Dust Hyena x3 | none |
| 5-7 The Cheetah Matriarch | elite | Savanna Cheetah x4, Jaguar Stalker x4, Dust Hyena x2 | none |
| 5-8 The Savanna Warlord | boss | Acacia Giraffe x2, Savanna Cheetah x4, Jaguar Stalker x4 | none |

#### Map 6: Wolfsbane Tundra

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 6-1 Ice Fang Patrol | skirmish | Ice-Crevasse Wolf x4, Arctic Fox Raider x4, Snowshoe Hare x2 | none |
| 6-2 Frostbitten Pack | skirmish | Timber Wolf Pack Leader x4, Boreal Elk x3, Taiga Lynx x3 | none |
| 6-3 Snowshoe Line | skirmish | Snowshoe Hare x4, Arctic Fox Raider x4, Ice-Crevasse Wolf x2 | none |
| 6-4 Lynx Ambush | skirmish | Taiga Lynx x4, Boreal Elk x3, Timber Wolf Pack Leader x3 | none |
| 6-5 Musk Ox Bulwark | elite | Tundra Musk Ox x4, Permafrost Mammoth x2, Glacier Yak x3 | none |
| 6-6 Glacier Herd | elite | Glacier Yak x4, Permafrost Mammoth x3, Tundra Musk Ox x3 | none |
| 6-7 Alpha Howler's Den | elite | Alpha Howler x4, Ice-Crevasse Wolf x4, Arctic Fox Raider x2 | none |
| 6-8 The Glacial Ape-King | boss | Glacial Ape-King x2, Permafrost Mammoth x3, Tundra Musk Ox x3 | none |

#### Map 7: Coral Current

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 7-1 Clownfish Shoal | skirmish | Clownfish Scout x4, Tide Pool Crab x4, Gull Thief x4 | none |
| 7-2 Moray Ambush | skirmish | Moray Ambusher x4, Riptide Eel x4, Coral Current Eel x2 | none |
| 7-3 Tide Pool Line | skirmish | Tide Pool Crab x4, Gull Thief x4, Clownfish Scout x2 | none |
| 7-4 Riptide Channel | skirmish | Riptide Eel x4, Coral Current Eel x4, Moray Ambusher x2 | none |
| 7-5 Current Split | skirmish | Coral Polyp Colony x3, Clownfish Scout x3, Tide Pool Crab x3 | none |
| 7-6 Reef Shark Pack | elite | Coral Reef Shark x4, Orca Vanguard x2, Moray Ambusher x3 | none |
| 7-7 Eel Nest | elite | Riptide Eel x4, Coral Current Eel x4, Moray Ambusher x2 | none |
| 7-8 Sea Turtle Elder's Court | elite | Sea Turtle Elder x3, Coral Polyp Colony x3, Coral Reef Shark x3 | none |
| 7-9 The Orca Vanguard King | boss | Orca Vanguard x4, Coral Reef Shark x3, Moray Ambusher x2 | none |

#### Map 8: Sable Swampmire

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 8-1 Leech Bog | skirmish | Bog Leech x4, Gangrenous Leech x4, Marsh Gas Toad x2 | none |
| 8-2 Mire Ambush | skirmish | Swamp Alligator x3, Mire Witch-Heron x4, Cypress Root Lurker x3 | none |
| 8-3 Toad Chorus | skirmish | Marsh Gas Toad x4, Bog Leech x4, Gangrenous Leech x2 | none |
| 8-4 Root Snare | skirmish | Cypress Root Lurker x4, Mire Witch-Heron x3, Adder Ambusher x3 | none |
| 8-5 Venomlord's Coil | elite | Venomlord Serpent x2, Constrictor Coil x3, Adder Ambusher x4 | none |
| 8-6 Crocodile Run | elite | Crocodile Ambusher x4, Swamp Alligator x3, Constrictor Coil x3 | none |
| 8-7 Adder Gauntlet | elite | Adder Ambusher x4, Venomlord Serpent x3, Constrictor Coil x3 | none |
| 8-8 The Alligator King | boss | Swamp Alligator x4, Crocodile Ambusher x3, Venomlord Serpent x2 | none |
| m8-raid Wound Reaver's Domain | raidboss | Wound Reaver x3, Gangrenous Leech x4, Swamp Alligator x3 | none |

#### Map 9: Basalt Foundry

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 9-1 Cinder Swarm | skirmish | Cinder Hornet x4, Ember Jackal x4, Sulfur Vent Crab x2 | none |
| 9-2 Salamander Vents | skirmish | Magma Salamander x4, Obsidian Scorpion x4, Ash Cloud Condor x2 | none |
| 9-3 Vent Skitter | skirmish | Sulfur Vent Crab x4, Obsidian Scorpion x4, Cinder Hornet x2 | none |
| 9-4 Ashfall Line | skirmish | Ash Cloud Condor x4, Ember Jackal x4, Obsidian Scorpion x2 | none |
| 9-5 Basalt Vanguard | elite | Basalt Boar x3, Magma Titan x2, Ember Jackal x3 | none |
| 9-6 Titan's Shadow | elite | Magma Titan x3, Basalt Boar x3, Ember Jackal x3 | none |
| 9-7 The Pyroclast Wyrm | elite | Pyroclast Wyrm x3, Magma Titan x2, Basalt Boar x3 | none |
| 9-8 The Phoenix Ember King | boss | Phoenix Fledgling x3, Magma Titan x3, Pyroclast Wyrm x2 | none |

#### Map 10: Eyrie Heights

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 10-1 Goat Trail Runners | skirmish | Mountain Goat Climber x4, Peak Condor x4, Golden Eagle Diver x2 | none |
| 10-2 Avalanche Ridge | skirmish | Alpine Avalanche x3, Rockslide Ram x4, Mountain Goat Climber x3 | none |
| 10-3 Cliffside Herd | skirmish | Mountain Goat Climber x4, Rockslide Ram x4, Peak Condor x2 | none |
| 10-4 Ridge Fork | skirmish | Golden Eagle Diver x4, Peak Condor x4, Eyrie Warden x2 | none |
| 10-5 West Ledge | elite | Golden Eagle Diver x4, Peak Condor x3, Mountain Goat Climber x3 | none |
| 10-6 East Ledge | elite | Rockslide Ram x4, Mountain Goat Climber x3, Alpine Avalanche x3 | none |
| 10-7 Eyrie Wardens | elite | Eyrie Warden x3, Golden Eagle Diver x3, Peak Condor x3 | none |
| 10-8 Summit Approach | elite | Alpine Avalanche x4, Rockslide Ram x4, Eyrie Warden x2 | none |
| 10-9 The Condor Sovereign | elite | Peak Condor x4, Eyrie Warden x3, Golden Eagle Diver x3 | none |
| 10-10 The Avalanche Colossus | boss | Alpine Avalanche x4, Rockslide Ram x4, Eyrie Warden x2 | none |

#### Map 11: The Sundered Peak

| Node | Kind | Enemy deck today | Rewards today |
|---|---|---|---|
| 11-1 Silverback Watch | skirmish | Silverback Brawler x4, War Panther x4, Bramblewood Lynx x2 | none |
| 11-2 Grizzly Frontier | skirmish | Grizzly Vanguard x4, Woodland Brawler x4, Bear Cub x2 | none |
| 11-3 Cave Warlord's Guard | elite | Cave Warlord x2, Grizzly Vanguard x3, Silverback Brawler x3 | none |
| 11-4 The Constrictor Sovereign | elite | Constrictor Coil x4, Venomlord Serpent x3, Strangler Vine x3 | none |
| 11-5 The Blessed Avatar | elite | Blessed Avatar x4, Shrine High Priest x3, Hollow Oath-Keeper x3 | none |
| 11-6 The Iron Cataphract | elite | Cataphract Destrier x4, Warhorse Charger x4, Stable Colt x2 | none |
| 11-7 The Ancient Sloth Titan | boss | Ancient Sloth Titan x3, Hanging Loafer x3, Cave Warlord x2 | none |
| 11-8 The Cave Warlord | finalboss | Cave Warlord x4, Grizzly Vanguard x3, Silverback Brawler x3 | none |

## 5. Open questions

1. **Starter grant.** Keep giving the 20 / 10 faction Basics after the tutorial? Or gate Basic families by stage too (smaller start, slower unlocks)? This plan keeps the grant.
2. **Hummingbird players** get only 10 Basics vs 20 for Otters. Should Hummingbird pickers also get the 11 neutral critters early to even this out?
3. **Leader rarity.** OK to flag Otter Centurion as Starter (Base) so "basic leader" is literally true? Same for Dominion Nestguard (already Starter).
4. **Bee Drone as the one Uncommon.** No card is Uncommon today. Fine to promote it, or would a new critter make a better first Uncommon?
5. **Tutorial rewards.** Moving river-warden, sunspire-envoy and quarry-mole off the tutorial means existing players already own them. Fine?
6. **field-mouse id clash** with the existing locked card. Reuse it?
7. **Enemy decks.** The suggested decks change win rates. Re-run `tools/difficulty_curve.js` after edits (the code was not touched in this pass).
8. **Cards with no rarity set** (bee-knight, soldier-ant, forager-ant, wandering-traveller, otter-centurion, bee-drone) render as Common. Set them explicitly when tuning power.
