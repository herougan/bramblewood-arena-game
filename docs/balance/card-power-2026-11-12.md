# Card power, 2026-11-12 (the 11-12 lists)

Every card in play on the 11-12 lists (main Maps 0-21 and their side maps), read as the card editor reads it: **B** (cap 1 score, f x ((3A + H) x m + S)) against **N** at Level 1 for the map where a player first gets it (cardObtainMap). Use = B / N. "Over" breaks a cap; "under" is at or below 60% of N. Formula: `bramblewood-budget.js`. Data: `docs/balance/card-power-2026-11-12.json`. Tool: `node tools/side1/power_2026_11_12.js`.

256 cards: 29 over, 217 in, 10 well under. First map moved with the 11-12 lists: 12.

## Over budget

| Card | Lists | B / N | Use | Margin | Cap 2 | Owner-set |
|---|---|---|---|---|---|---|
| Cricket Drummer (common, 2/7, Map 1) | Map 1, The Old Bramble | 16.96 / 13.16 | 129% | -3.8 | ok |  |
| Worker Ant (starter, 1/6, Map 0) | Map 0, Map 18 | 14.54 / 11.75 | 124% | -2.79 | ok | yes |
| Alley Cat (uncommon, 1/4, Map 1) | Map 5, Map 9 | 17.64 / 14.32 | 123% | -3.32 | ok | yes |
| Armadillo Guard (common, 3/8, Map 14) | Map 18, Map 19 | 21.93 / 19.34 | 113% | -2.59 | ok |  |
| Beaver Lumberjack (common, 3/5, Map 0) | Map 2, Map 3, Map 4, Map 11, Lilypad Reach | 18.62 / 16.72 | 111% | -1.9 | ok | yes |
| Cypress Root Lurker (common, 4/12, Map 0) | Map 6, Map 7, The Sunken Grove | 26.93 / 24.25 | 111% | -2.68 | ok | yes |
| Peak Condor (common, 4/10, Map 0) | Map 3, Map 11, Map 21, The Aerie Vault, Basalt Foundry | 21.98 / 19.87 | 111% | -2.11 | ok | yes |
| Raccoon Nightcrew (common, 3/6, Map 7) | Smugglers' Grotto | 23.77 / 21.5 | 111% | -2.27 | ok |  |
| Fruit Bat (common, 3/8, Map 0) | The Glimmer Depths | 18.2 / 16.72 | 109% | -1.48 | ok |  |
| Glow-worm (common, 2/11, Map 0) | The Glimmer Depths | 18.2 / 16.72 | 109% | -1.48 | ok |  |
| The Caldera Wyrm (heroic, 4/7, Map 20) | Volcano Lair | 30.65 / 28.39 | 108% | -2.26 | ok | yes |
| Ironclaw Fiddler (rare, 7/12, Map 7) | Map 9, Map 10 | 39.78 / 36.8 | 108% | -2.98 | ok |  |
| Muskrat Reedgatherer (common, 1/8, Map 0) | Map 5, Lilypad Reach, The Sunken Grove | 18.06 / 16.72 | 108% | -1.34 | ok |  |
| Crown-of-thorns Star (uncommon, 4/4, Map 7) | Map 10 | 24.3 / 22.67 | 107% | -1.63 | ok |  |
| Beachcomber Sanderling (common, 2/7, Map 0) | Map 2 | 13.75 / 12.92 | 106% | -0.83 | ok | yes |
| Cone-cutter Squirrel (common, 2/5, Map 14) | Map 16, Map 17 | 21.28 / 19.99 | 106% | -1.29 | ok |  |
| Badger Lumberjack (uncommon, 2/11, Map 1) | Map 13, Map 14, Map 18 | 21.85 / 21.27 | 103% | -0.58 | ok | yes |
| Mudpuppy (common, 2/9, Map 0) | Map 5, The Sunken Grove | 17.3 / 16.72 | 103% | -0.58 | ok |  |
| Bee Sentry (starter, 2/5, Map 0) | Map 0 | 15.81 / 15.55 | 102% | -0.26 | ok | yes |
| Cormorant (common, 3/7, Map 0) | Map 3, The Ice Hollow | 17 / 16.72 | 102% | -0.28 | ok |  |
| Pond Algae (common, 1/7, Map 0) | Map 4, Map 6, Lilypad Reach | 17.04 / 16.72 | 102% | -0.32 | ok |  |
| Soldier Ant (common, 2/8, Map 0) | Map 0, Map 1 | 17.13 / 16.72 | 102% | -0.41 | ok | yes |
| Barrel Cactus (rare, 1/18, Map 14) | Map 18, The Pale Desert | 30.08 / 29.85 | 101% | -0.23 | ok |  |
| Bramble Sprout (common, 1/5, Map 0) | Map 1, Map 14, The Old Bramble | 13.08 / 12.92 | 101% | -0.16 | ok | yes |
| Horned Lizard (uncommon, 5/8, Map 14) | Map 18, Map 19, The Pale Desert | 24.49 / 24.31 | 101% | -0.18 | ok |  |
| Matamata (uncommon, 3/13, Map 0) | The Sunken Grove | 25.75 / 25.42 | 101% | -0.33 | ok |  |
| Planarian Splitter (uncommon, 3/8, Map 1) | Map 4, Map 5, Map 7, The Mycelium Deep | 21.55 / 21.27 | 101% | -0.28 | ok |  |
| Walrus Icebreaker (veryrare, 4/17, Map 17) | Map 17, Map 19 | 31.92 / 31.72 | 101% | -0.2 | ok |  |
| Gallery Orb-Weaver (uncommon, 4/7, Map 7) | Map 8, Map 18, The Glimmer Depths | 22.69 / 22.67 | 100% | -0.02 | ok |  |

## Well under (60% of N or less)

| Card | Lists | B / N | Use |
|---|---|---|---|
| Bee Warden (common, 1/2, Map 0) | Map 1 | 5 / 13.57 | 37% |
| Bee Forager (starter, 0/4, Map 0) | Map 0, Clovermead | 5.06 / 11.75 | 43% |
| Sparrow Chick (starter, 1/3, Map 14) | The Aerie Vault | 7.14 / 15.32 | 47% |
| Earthworm (starter, 0/6, Map 0) | Map 0, Map 7, The Old Bramble, The Mycelium Deep | 6 / 12.34 | 49% |
| Dune Jackal (common, 1/1, Map 14) | Map 18, Map 19, The Pale Desert | 10.23 / 19.34 | 53% |
| Granite Ox Golem (rare, 3/17, Map 14) | Basalt Foundry, Volcano Lair | 24.03 / 43.98 | 55% |
| Duckling (starter, 1/4, Map 0) | Map 0 | 7 / 12.34 | 57% |
| Puffin Diver (common, 2/5, Map 3) | Map 3, Map 16 | 11.89 / 20.57 | 58% |
| Alpine Swift (common, 2/3, Map 21) | Map 21 | 12.94 / 21.62 | 60% |
| Anvil Thrush (common, 1/6, Map 7) | Map 11, Map 12, The Aerie Vault | 11.01 / 18.35 | 60% |

## First map moved with the 11-12 lists

Before = the batch before SKIR3 (git b6162b29).

| Card | First map | N | Use | Reading |
|---|---|---|---|---|
| Balloon Archer | 24 -> 7 | 31.02 -> 27.05 | 74% -> 85% | in -> in |
| Lemming Swarm | 14 -> 21 | 16.19 -> 17.83 | 76% -> 69% | in -> in |
| Pumice Beetle | 21 -> 14 | 25.94 -> 24.31 | 86% -> 92% | in -> in |
| Red-billed Chough | 14 -> 21 | 19.99 -> 21.62 | 85% -> 79% | in -> in |
| Siege Rhino | 23 -> 14 | 38.09 -> 35.98 | 92% -> 98% | in -> in |
| Alpine Salamander | 14 -> 21 | 23.14 -> 24.77 | 79% -> 74% | in -> in |
| Alpine Swift | 14 -> 21 | 19.99 -> 21.62 | 65% -> 60% | in -> under |
| Berserker Boar | 7 -> 14 | 25.12 -> 26.76 | 84% -> 79% | in -> in |
| Crocodile Ambusher | 7 -> 0 | 36.19 -> 34.47 | 88% -> 93% | in -> in |
| Elderhorn Monarch | 24 -> 14 | 48.07 -> 45.73 | 89% -> 94% | in -> in |
| Nightshade Moth | 7 -> 14 | 21.33 -> 22.96 | 66% -> 62% | in -> in |
| Monarch Wingblade | 5 -> 7 | 23.37 -> 23.84 | 88% -> 86% | in -> in |

## Skills a map (NEW! cards; light skills and Baby cards not counted)

| Map | Count | Skills | Odd one out |
|---|---|---|---|
| Map 0 Bramblewood Outskirts | 4 **over** | Swarm x2, On Turn Start, Venomous, On Attack | Bee Forager (On Turn Start); Bee Sentry (Venomous); Worker Ant (On Attack) |
| Map 1 Thistlewood | 9 **over** | Thorns, Guardian, Inspiring, On Attack, Quick, Injured, Foraging, Moonborn, Rainrunner | Bramble Sprout (Thorns); Terrier Pup (Guardian); Cricket Drummer (Inspiring); Chipmunk Skirmisher (On Attack) |
| Map 2 Pebble Beach | 12 **over** | Delivery, On Attacked, Guardian, Crab Claws x2, On Kill, Armor, Pierce, Thorns, Echolocation, Inspiring, Driftwood, Shell | Beaver Lumberjack (Delivery); Gull Thief (On Kill); Oystercatcher (Pierce); Pincushion Urchin (Thorns) |
| Map 3 Gannet Cliffs | 14 **over** | Shell, Shield, Reach, Crab Claws, Guardian, Swarm, Dive, Reload, On Spawn, Quick, Cleave, Pounce, Arrow, Scatterbrained | Conch Crawler (Shell, Shield); Cormorant (Reach); Fiddler Crab Swarm (Crab Claws, Guardian); Kittiwake Flock (Swarm) |
| Map 4 Sunken Hollow | 5 **over** | Bloom, Thanatosis x2, Venomous x2, Bulwark, Meiosis | Pond Algae (Bloom); Muskrat Lodgekeeper (Bulwark); Planarian Splitter (Meiosis) |
| Map 5 Gatorback Swamp | 9 **over** | Heal, Bleed x2, Twin Strike, Cure, Regenerate, Delivery, Armor, Swarm, Venomous | Newt Doctor (Heal); Marsh-mallow Hare (Cure); Mudpuppy (Regenerate); Muskrat Reedgatherer (Delivery) |
| Map 6 Sable Swampmire | 11 **over** | Repair, Guardian, Weaken, Armor, Bleed, Evasive, Venomous x2, Pounce, Invisible, Daunt, Delivery | Cypress Root Lurker (Repair, Guardian); Lamprey (Weaken); Alligator Gar (Armor, Bleed); Camouflage Frog (Evasive) |
| Map 7 The Morel Hollow | 15 **over** | Wither, Brood, Swarm, Progeny, On Spawn, Arrow, Venomous, Bloom x2, Regenerate, Scare, On Ready, Armor, Guardian, Meiosis, Thanatosis | Corpse-flower Beetle (Wither); Wolf Spider Mother (Brood); Fungus Gnat Cloud (Swarm); Rot-Swollen Carcass (Progeny, On Spawn) |
| Map 8 Caves & Alcoves | 11 **over** | Keen Sense, Bedrock, Regenerate, Illuminate, On Death, Shell, Guardian, On Ready Damage, Pounce, Web, Venomous | Quarry Mole (Keen Sense, Bedrock); Cave Olm (Regenerate); Sulfur Cinder Moth (Illuminate, On Death); Stalactite Pill Bug (Shell, Guardian) |
| Map 9 The Kelp Mangroves | 10 **over** | Venomous, Skitter, Armor x2, Salt, Relict, Taunt, Bludgeon, Pounce, Shock, Chain Lightning | Banded Sea Krait (Venomous); Mangrove Mudskipper (Skitter); Proboscis Monkey (Taunt); Fishing Cat (Pounce) |
| Map 10 Coral Current | 8 **over** | Reload, Swarm, Venomous x2, Armor, Thorns, Shell, Delivery, Delivery resource | Riptide Eel (Reload); Krill Swarm (Swarm); Sea Turtle Elder (Armor); Giant Clam (Shell, Delivery, Delivery resource) |
| Map 11 Eyrie Heights | 12 **over** | Archer, Pierce, Arrow, Fletcher, On Ready Damage, Daunt, Pounce x3, Mountain Climber, Evasive, Frostbite, Delivery, every turn, Natural Leader | Stonedrop Vulture (Archer); Anvil Thrush (Pierce); Eagle-Owl Quartermaster (Arrow, Fletcher); Eyrie Warden (On Ready Damage, Daunt) |
| Map 12 The Briar Maze | 9 **over** | Fortify (Armor 1), while it lives x2, Thorns x2, Evasive, Backstab, Siege, True Sight, Canopy Cover, Devour, Guardian | Cunning Vixen (Evasive, Backstab); Mouse Sapper (Siege); Fawn Scout (True Sight, Canopy Cover); Hollow-belly Rat (Devour) |
| Map 13 The Redwood Deep | 9 **over** | Cleave, Guardian x2, Lumberjack, Berserk, Milling, Pounce, Arrow, Venomous, Felling | Tasmanian Devil (Berserk); Redwood Woodpecker (Milling); Pine Marten (Pounce); Balloon Archer (Arrow) |
| Map 14 Savanna Reaches | 10 **over** | Evasive x2, Sociable, On Kill, Carnage, Quick, Drunk, Guardian, Banana, Backstab, Foe Scarcity | Meerkat Sentry (Sociable); Dust Hyena (On Kill, Carnage); Savanna Cheetah (Quick); Marula Elephant (Drunk, Guardian) |
| Map 15 The Long Grass | 7 **over** | Speed, Converge, Pounce x2, Loyal, Delivery, every turn, Siege, Stampede | Pronghorn Racer (Speed); Border Collie (Converge); Sworn Shieldbearer (Loyal); Elderhorn Monarch (Delivery, every turn) |
| Map 16 The Pinewood Taiga | 9 **over** | Cleave, Riled, Mountain Climber, Frostbite, On Spawn, Almanac, Evasive x2, Explode, True Sight | Boreal Elk (Cleave, Riled); Woodland Caribou (Mountain Climber, Frostbite); Cone-cutter Squirrel (On Spawn, Almanac); Pinecone Sapper (Explode) |
| Map 17 Wolfsbane Tundra | 10 **over** | Evasive, Frost crystal, Invisible, Freeze x2, On Spawn, Shatter, Bleed, Ambush, Hibernate, Sleep | Snow Ermine (Evasive, Frost crystal); Ringed Seal (Invisible); Ice-Crevasse Wolf (Bleed); Polar Bear (Ambush, Hibernate) |
| Map 18 The Glass Dunes | 9 **over** | Quick x2, Fencing, Blinding, Venomous x2, Trap, Haste, Dry x2, Shield, Thorns | Horned Lizard (Blinding); Antlion Pit (Trap); Roadrunner Courier (Haste); Armadillo Guard (Shield) |
| Map 19 Ashen Spurn | 8 **over** | Rage, Stun, Armor x2, Grit, Smoke Bomb, Spitfire, Venomous, Pounce | Honey Badger Fury (Rage); Cinder Hornet (Stun); Basalt Boar (Grit); Smokescreen Raccoon (Smoke Bomb) |
| Map 20 The Sundered Peak | 8 **over** | Rage x3, Siege, Mountain Climber, Pounce, On Spawn x2, Fire Arrow, Bounty, Stampede | Fumarole Ibex (Mountain Climber, Pounce); Magma Salamander (Fire Arrow); Pack Mule (Bounty); Cave Bear (Siege) |
| Map 21 The Quiet Summit | 8 **over** | Mountain Climber x2, Evasive, Thorns, Quick, Regenerate, Scar, Immolation, Carrion | Mountain Goat Climber (Evasive); Apollo Butterfly (Thorns); Alpine Swift (Quick); Alpine Salamander (Regenerate) |
| The Old Bramble (side, opens after 21) | 4 **over** | Fog, Thorns, Herbalist, Immunity | Ent (Fog); Strangler Vine (Thorns); Hedgehog Herbalist (Herbalist, Immunity) |
| Clovermead (side, opens after 12) | 1 | Guardian |  |
| Lilypad Reach (side, opens after 6) | 4 **over** | Armor, Timbered, Delivery, every turn, Rampart | Old Sturgeon (Armor); Lodge Engineer (Timbered, Delivery, every turn); Riverworks Bastion (Rampart) |
| Smugglers' Grotto (side, opens after 7) | 3 | Bounty, Cleave, Stealth |  |
| The Sunken Grove (side, opens after 13) | 3 | Delivery, Ambush, Armor |  |
| The Mycelium Deep (side, opens after 8) | 5 **over** | Progeny x2, Bloom, Poison Barbs, Rocket, Armor | Rootworm Colony (Poison Barbs); Bombardier Beetle (Rocket); Fungal Colossus (Bloom); Millipede Hauler (Armor) |
| The Glimmer Depths (side, opens after 16) | 3 | Echolocation, Bleed, On Action x2 |  |
| The Sunken Depths (side, opens after 11) | 4 **over** | Octolash, Recoil, Delivery, every turn, Meld | Blue-ringed Octopus (Octolash); Mantis Shrimp (Recoil); Coral Polyp Colony (Delivery, every turn, Meld) |
| The Aerie Vault (side, opens after 15) | 2 | Thorns, Storm |  |
| The Canopy (side, opens after 18) | 3 | Quick, Guardian, Evolute |  |
| The Ice Hollow (side, opens after 21) | 6 **over** | Carrion, Armor, Echolocation, Inspiring, Swarm, Brood | Greenland Shark (Carrion, Armor); Beluga (Echolocation, Inspiring); Lemming Swarm (Swarm, Brood) |
| The Pale Desert (side, opens after 19) | 4 **over** | Dry x2, Pierce, Drought, Tornado | Dust-devil Kestrel (Tornado); Pale Oryx (Pierce); Dromedary (Drought) |
| Basalt Foundry (side, opens after 23) | 5 **over** | Undead, Pierce, Recoil, On Spawn, Friction | Ember Revenant (Undead, Pierce); Granite Ox Golem (Recoil, On Spawn); Grindstone Boar (Friction) |
| Eye of the Volcano (side, opens after 20) | 3 | Lingering, Carrion, Pitchfork |  |
| Volcano Lair (side, opens after 20) | 7 **over** | Armor, On Death, Pounce, Recoil, On Spawn, Scar, Immolation | The Caldera Wyrm (Armor, On Death, Pounce); Granite Ox Golem (Recoil, On Spawn); Magma Rhino (Scar, Immolation) |

## Every card

| Card | Rarity | Stats | First map | B / N | Use | Reading | Lists |
|---|---|---|---|---|---|---|---|
| Acacia Giraffe | common | 2/11 | 14 | 20.06 / 31.14 | 64% | in | Map 14 |
| Adder Ambusher | rare | 2/11 | 6 | 21.75 / 23.61 | 92% | in | Map 6, Map 7 |
| Alley Cat | uncommon | 1/4 | 1 | 17.64 / 14.32 | 123% | over | Map 5, Map 9 |
| Alligator Gar | rare | 5/5 | 5 | 25.72 / 27.75 | 93% | in | Map 6, Map 9 |
| Alpine Marmot | common | 3/9 | 11 | 18 / 19.29 | 93% | in | Map 12, Map 21 |
| Alpine Salamander | common | 2/10 | 21 | 18.3 / 24.77 | 74% | in | Map 21 |
| Alpine Swift | common | 2/3 | 21 | 12.94 / 21.62 | 60% | under | Map 21 |
| Amber Cicada | uncommon | 1/21 | 7 | 27.96 / 32.01 | 87% | in | Map 7, Map 13, The Canopy |
| Anhinga Spearbird | uncommon | 1/12 | 1 | 17.96 / 21.27 | 84% | in | Map 6, Map 13 |
| Ant Scout | starter | 1/5 | 0 | 11.13 / 11.75 | 95% | in | Map 0, Map 1, Map 18 |
| Antlion Pit | uncommon | 3/13 | 18 | 24.98 / 25.24 | 99% | in | Map 18, The Pale Desert |
| Anvil Thrush | common | 1/6 | 7 | 11.01 / 18.35 | 60% | under | Map 11, Map 12, The Aerie Vault |
| Apollo Butterfly | uncommon | 1/8 | 14 | 16.31 / 21.15 | 77% | in | Map 21, The Aerie Vault |
| Arctic Tern | uncommon | 1/8 | 14 | 14.23 / 21.57 | 66% | in | Map 17 |
| Armadillo Guard | common | 3/8 | 14 | 21.93 / 19.34 | 113% | over | Map 18, Map 19 |
| Ash Cloud Condor | rare | 3/4 | 20 | 17.42 / 26.88 | 65% | in | Map 20 |
| Badger Lumberjack | uncommon | 2/11 | 1 | 21.85 / 21.27 | 103% | over | Map 13, Map 14, Map 18 |
| Balloon Archer | uncommon | 2/8 | 7 | 22.97 / 27.05 | 85% | in | Map 13, Map 14, Map 18 |
| Banded Sea Krait | uncommon | 4/3 | 9 | 21.61 / 23.14 | 93% | in | Map 9 |
| Barkplate Beetle | uncommon | 4/13 | 7 | 29.32 / 30.67 | 96% | in | Map 12, Map 18, The Old Bramble |
| Barrel Cactus | rare | 1/18 | 14 | 30.08 / 29.85 | 101% | over | Map 18, The Pale Desert |
| Barrow Leech | rare | 1/8 | 7 | 14.98 / 20.44 | 73% | in | Map 8, Map 12, Map 20, The Glimmer Depths, Volcano Lair |
| Basalt Boar | common | 2/15 | 14 | 21.05 / 23.14 | 91% | in | Map 19, Map 20, Eye of the Volcano, Volcano Lair |
| Beachcomber Sanderling | common | 2/7 | 0 | 13.75 / 12.92 | 106% | over | Map 2 |
| Bear Cub | uncommon | 2/8 | 7 | 14 / 16.51 | 85% | in | Map 13, Map 16 |
| Beaver Feller | common | 2/10 | 7 | 16.73 / 18.35 | 91% | in | Map 13 |
| Beaver Lumberjack | common | 3/5 | 0 | 18.62 / 16.72 | 111% | over | Map 2, Map 3, Map 4, Map 11, Lilypad Reach |
| Bee Forager | starter | 0/4 | 0 | 5.06 / 11.75 | 43% | under | Map 0, Clovermead |
| Bee Warden | common | 1/2 | 0 | 5 / 13.57 | 37% | under | Map 1 |
| Bee Sentry | starter | 2/5 | 0 | 15.81 / 15.55 | 102% | over | Map 0 |
| Beluga | rare | 1/16 | 21 | 24.12 / 31.49 | 77% | in | The Ice Hollow |
| Berserker Boar | common | 3/9 | 14 | 21.01 / 26.76 | 79% | in | Map 20, Eye of the Volcano |
| Blue-ringed Octopus | rare | 2/11 | 11 | 24.14 / 29.15 | 83% | in | The Sunken Depths |
| Bombardier Beetle | uncommon | 3/10 | 7 | 26.68 / 27.05 | 99% | in | The Mycelium Deep |
| Booming Bittern | uncommon | 1/12 | 6 | 18.36 / 22.44 | 82% | in | Map 6, Map 9, Basalt Foundry |
| Border Collie | uncommon | 3/14 | 15 | 23 / 24.54 | 94% | in | Map 15, Map 17 |
| Boreal Elk | common | 5/4 | 14 | 26.16 / 26.76 | 98% | in | Map 16, Map 17 |
| Bramble Sprout | common | 1/5 | 0 | 13.08 / 12.92 | 101% | over | Map 1, Map 14, The Old Bramble |
| Bramblewood Lynx | rare | 5/7 | 7 | 22 / 25.03 | 88% | in | Map 13, Map 15, The Old Bramble |
| Bramblewood Macaque | rare | 4/4 | 14 | 21 / 22.32 | 94% | in | Map 14, The Canopy |
| Briarback Hedgehog | common | 2/11 | 7 | 18.1 / 21.5 | 84% | in | Map 12, Map 17 |
| Brimstone Hound | uncommon | 1/9 | 0 | 16 / 17.88 | 89% | in | Eye of the Volcano |
| Caldera Snow Leopard | superrare | 3/15 | 22 | 28.15 / 29.68 | 95% | in | Map 19 |
| The Caldera Wyrm | heroic | 4/7 | 20 | 30.65 / 28.39 | 108% | over | Volcano Lair |
| Camouflage Frog | common | 2/5 | 0 | 13.48 / 19.87 | 68% | in | Map 6, Map 7, The Canopy |
| Canopy Sloth Guardian | common | 2/15 | 0 | 24 / 27.87 | 86% | in | The Canopy |
| Carrion Beetle | uncommon | 3/11 | 14 | 20 / 24.31 | 82% | in | Eye of the Volcano |
| Gilded Roadwarden | common | 3/28 | 14 | 45.43 / 50.29 | 90% | in | Map 15, Map 17, Map 20, Volcano Lair |
| Caustic Scorpion | uncommon | 1/18 | 18 | 25.75 / 29.62 | 87% | in | Map 18, Map 19, The Pale Desert |
| Cave Olm | common | 1/11 | 7 | 16.3 / 18.35 | 89% | in | Map 8, The Glimmer Depths |
| Chamois Leaper | uncommon | 1/10 | 11 | 19.96 / 23.61 | 85% | in | Map 11, Map 12, The Aerie Vault |
| Chipmunk Cavalry | common | 3/4 | 0 | 15.23 / 16.07 | 95% | in | Map 1, Map 3, Clovermead |
| Chipmunk Forager | starter | 1/8 | 0 | 11 / 12.34 | 89% | in | Map 0, Map 18 |
| Chipmunk Hoarder | common | 2/5 | 7 | 17.65 / 18.35 | 96% | in | Map 11, Map 12 |
| Chipmunk Skirmisher | common | 2/5 | 0 | 11.53 / 12.92 | 89% | in | Map 1 |
| Cinder Gecko | common | 2/5 | 22 | 12.98 / 18.06 | 72% | in | Basalt Foundry |
| Cinder Hornet | common | 3/3 | 14 | 16.5 / 22.96 | 72% | in | Map 19, Map 21, Basalt Foundry, Volcano Lair |
| Clover Butterfly | common | 2/4 | 7 | 11.9 / 14.85 | 80% | in | Clovermead |
| Clownfish Scout | common | 1/9 | 7 | 12.5 / 14.56 | 86% | in | Map 10 |
| Compost Grub | common | 1/10 | 0 | 13 / 13.57 | 96% | in | Map 7, The Mycelium Deep |
| Conch Crawler | common | 1/5 | 0 | 14.8 / 16.72 | 89% | in | Map 3, Map 4, Map 10 |
| Conch Herald | uncommon | 1/11 | 2 | 20.4 / 21.5 | 95% | in | Map 2, Map 3 |
| Cone-cutter Squirrel | common | 2/5 | 14 | 21.28 / 19.99 | 106% | over | Map 16, Map 17 |
| Constrictor Coil | common | 4/16 | 0 | 28 / 29.26 | 96% | in | Map 5, Map 6, The Sunken Grove |
| Coral Current Eel | rare | 3/9 | 7 | 18.5 / 20.04 | 92% | in | Map 10, The Sunken Depths |
| Coral Polyp Colony | uncommon | 0/9 | 7 | 17.98 / 19.52 | 92% | in | The Sunken Depths |
| Cormorant | common | 3/7 | 0 | 17 / 16.72 | 102% | over | Map 3, The Ice Hollow |
| Corpse-flower Beetle | rare | 4/10 | 0 | 25.57 / 26.58 | 96% | in | Map 7, Map 8 |
| Cottontail | starter | 3/1 | 0 | 10 / 12.34 | 81% | in | Map 0, Clovermead |
| Cricket Drummer | common | 2/7 | 1 | 16.96 / 13.16 | 129% | over | Map 1, The Old Bramble |
| Crocodile Ambusher | common | 5/17 | 0 | 32 / 34.47 | 93% | in | Map 6, Map 14, Map 20, The Sunken Grove |
| Crossed-Eyes | starter | 2/2 | 0 | 8 / 12.34 | 65% | in | Map 0 |
| Crown-of-thorns Star | uncommon | 4/4 | 7 | 24.3 / 22.67 | 107% | over | Map 10 |
| Cunning Vixen | uncommon | 1/10 | 12 | 15.67 / 23.84 | 66% | in | Map 12, Map 14 |
| Cypress Root Lurker | common | 4/12 | 0 | 26.93 / 24.25 | 111% | over | Map 6, Map 7, The Sunken Grove |
| Cave Bear | common | 4/13 | 14 | 31.22 / 35.22 | 89% | in | Map 20, Map 21 |
| Dolphin Outrider | rare | 3/9 | 5 | 19.16 / 20.22 | 95% | in | Map 2, Map 4, Map 10 |
| Dormouse | common | 2/5 | 0 | 12.89 / 13.18 | 98% | in | Map 1, Clovermead, The Ice Hollow |
| Driftwood Crab | common | 2/12 | 2 | 19.15 / 20.34 | 94% | in | Map 2, Map 8, Map 9, Smugglers' Grotto |
| Dromedary | uncommon | 2/15 | 14 | 26 / 28.69 | 91% | in | The Pale Desert |
| Duck Paddler | starter | 2/10 | 0 | 16 / 16.33 | 98% | in | Map 0, Map 1, Map 2, Map 4, Lilypad Reach |
| Duckling | starter | 1/4 | 0 | 7 / 12.34 | 57% | under | Map 0 |
| Dune Jackal | common | 1/1 | 14 | 10.23 / 19.34 | 53% | under | Map 18, Map 19, The Pale Desert |
| Dust-devil Kestrel | veryrare | 5/10 | 18 | 26.17 / 31.96 | 82% | in | The Pale Desert |
| Dust Hyena | uncommon | 2/6 | 14 | 14.89 / 17.36 | 86% | in | Map 14, Map 15 |
| Eagle-Owl Quartermaster | rare | 1/6 | 11 | 18.16 / 24.77 | 73% | in | Map 11, Map 15, The Aerie Vault |
| Eagle Sharpshooter | common | 2/6 | 0 | 22.22 / 23.49 | 95% | in | Map 3, Map 11, Map 20, Volcano Lair |
| Earthworm | starter | 0/6 | 0 | 6 / 12.34 | 49% | under | Map 0, Map 7, The Old Bramble, The Mycelium Deep |
| Echo Screecher | rare | 2/5 | 8 | 20.51 / 24.07 | 85% | in | Map 8, Map 20, The Glimmer Depths |
| Elderhorn Monarch | common | 2/30 | 14 | 42.78 / 45.73 | 94% | in | Map 15, Map 17, Map 19 |
| Ember Revenant | veryrare | 4/15 | 23 | 29.5 / 32.36 | 91% | in | Basalt Foundry |
| Ent | rare | 2/22 | 21 | 30.7 / 33.3 | 92% | in | The Old Bramble |
| Eyrie Warden | common | 3/11 | 7 | 31.08 / 38.55 | 81% | in | Map 11, Map 12, Map 21, The Aerie Vault |
| Farm Dog | common | 2/7 | 0 | 13 / 13.57 | 96% | in | Map 0, Map 16, The Old Bramble |
| Fawn Scout | rare | 2/8 | 13 | 14.41 / 18.29 | 79% | in | Map 12, Map 15 |
| Tomcat | common | 1/4 | 0 | 12.82 / 12.92 | 99% | in | Map 3, Map 13 |
| Fiddler Crab Swarm | common | 1/8 | 0 | 11.6 / 12.92 | 90% | in | Map 3, Map 9 |
| Fire Ant Raft | uncommon | 2/7 | 1 | 19.35 / 21.27 | 91% | in | Map 5 |
| Fire Salamander | uncommon | 3/7 | 19 | 23.72 / 25.47 | 93% | in | Map 19, Map 20, Volcano Lair |
| Fishing Cat | rare | 1/14 | 7 | 19.96 / 23.84 | 84% | in | Map 9, The Canopy |
| Frillneck Duelist | rare | 2/15 | 14 | 23.23 / 29.09 | 80% | in | Map 18 |
| Fruit Bat | common | 3/8 | 0 | 18.2 / 16.72 | 109% | over | The Glimmer Depths |
| Fumarole Ibex | rare | 1/12 | 14 | 21.96 / 25.47 | 86% | in | Map 20, Map 21 |
| Fungal Colossus | uncommon | 2/14 | 7 | 33.97 / 35.63 | 95% | in | The Mycelium Deep |
| Fungus Gnat Cloud | common | 1/4 | 7 | 11.46 / 14.56 | 79% | in | Map 7, The Mycelium Deep |
| Gale Swift | common | 1/4 | 14 | 10.13 / 16.19 | 63% | in | The Aerie Vault |
| Gallery Orb-Weaver | uncommon | 4/7 | 7 | 22.69 / 22.67 | 100% | over | Map 8, Map 18, The Glimmer Depths |
| Gannet Nestweaver | common | 1/7 | 0 | 14.49 / 16.72 | 87% | in | Map 3, Map 11 |
| Giant Cave Huntsman | rare | 3/15 | 8 | 28.15 / 28.45 | 99% | in | Map 8, Map 9, The Glimmer Depths |
| Giant Clam | common | 5/4 | 7 | 23.76 / 25.88 | 92% | in | Map 10, The Sunken Depths, The Ice Hollow |
| Glacier Yak | common | 1/17 | 14 | 24.41 / 30.85 | 79% | in | Map 17, Map 19, Map 21, The Ice Hollow |
| Glow-worm | common | 2/11 | 0 | 18.2 / 16.72 | 109% | over | The Glimmer Depths |
| Golden Eagle Diver | uncommon | 2/2 | 3 | 14.84 / 17.94 | 83% | in | Map 11, Map 16, The Aerie Vault |
| Granite Ox Golem | rare | 3/17 | 14 | 24.03 / 43.98 | 55% | under | Basalt Foundry, Volcano Lair |
| Grass Snake | uncommon | 2/10 | 1 | 18 / 21.27 | 85% | in | Map 4, Map 13, The Old Bramble |
| Grass Viper | uncommon | 1/8 | 5 | 13.72 / 15.26 | 90% | in | Map 6 |
| Greenland Shark | rare | 1/23 | 21 | 31.51 / 36.45 | 86% | in | The Ice Hollow |
| Grindstone Boar | common | 3/12 | 23 | 19 / 25.24 | 75% | in | Basalt Foundry |
| Grizzly Vanguard | common | 1/19 | 7 | 27.08 / 34.47 | 79% | in | Map 13, Map 14, Map 16 |
| Gull Thief | common | 1/7 | 0 | 12.69 / 12.92 | 98% | in | Map 2, Map 3, Smugglers' Grotto |
| Hawthorn Shieldbug | common | 2/12 | 7 | 20.33 / 21.5 | 95% | in | Map 7, Map 8, The Mycelium Deep |
| Hedgehog Herbalist | rare | 3/15 | 13 | 24.53 / 25.24 | 97% | in | The Old Bramble |
| Hedgerow Shrew | common | 2/7 | 0 | 12.68 / 12.92 | 98% | in | Map 1, Map 2, Map 12 |
| Hollow-belly Rat | uncommon | 2/12 | 0 | 20 / 21.04 | 95% | in | Map 12, Map 14 |
| Honey Badger Fury | common | 1/6 | 14 | 12.01 / 19.34 | 62% | in | Map 19, Map 20, Map 21, Eye of the Volcano |
| Honey Bee | starter | 1/4 | 0 | 8.33 / 11.99 | 69% | in | Map 0, Map 1, Clovermead |
| Hoopoe Herald | common | 2/12 | 14 | 15.96 / 16.51 | 97% | in | Map 14, Map 15 |
| Horned Lizard | uncommon | 5/8 | 14 | 24.49 / 24.31 | 101% | over | Map 18, Map 19, The Pale Desert |
| Horseshoe Crab | common | 2/9 | 7 | 20.32 / 21.5 | 95% | in | Map 9 |
| House Cat | common | 3/3 | 0 | 12 / 13.57 | 88% | in | Map 0, Map 1 |
| Ice-Crevasse Wolf | rare | 1/16 | 14 | 23.87 / 25.47 | 94% | in | Map 17, Map 18, The Ice Hollow |
| Ironclaw Fiddler | rare | 7/12 | 7 | 39.78 / 36.8 | 108% | over | Map 9, Map 10 |
| Jaguar Stalker | rare | 1/15 | 18 | 20.23 / 26.41 | 77% | in | The Canopy |
| Kinkajou Lurker | uncommon | 4/6 | 18 | 19.75 / 25.74 | 77% | in | The Canopy |
| Kittiwake Flock | common | 1/5 | 0 | 12.65 / 12.92 | 98% | in | Map 3, Map 4, Map 11 |
| Krill Swarm | common | 0/7 | 7 | 10.63 / 14.56 | 73% | in | Map 10, The Sunken Depths |
| Ladybird Guard | common | 1/8 | 7 | 11 / 14.56 | 76% | in | Clovermead |
| Lamprey | common | 2/5 | 0 | 13.64 / 16.07 | 85% | in | Map 6, Map 7 |
| Lemming Swarm | common | 1/3 | 21 | 12.33 / 17.83 | 69% | in | The Ice Hollow |
| Leopard Slug | common | 1/10 | 7 | 15.3 / 18.35 | 83% | in | Map 7, The Mycelium Deep |
| Limpet Clinger | common | 2/4 | 0 | 11.07 / 12.92 | 86% | in | Map 2, Map 3, Smugglers' Grotto, The Ice Hollow |
| Lodge Engineer | uncommon | 3/12 | 1 | 28.22 / 29.27 | 96% | in | Lilypad Reach |
| Lucky Hopper | uncommon | 1/17 | 12 | 20 / 21.04 | 95% | in | Clovermead |
| Magma Salamander | veryrare | 3/11 | 20 | 26.56 / 28.04 | 95% | in | Map 20, Eye of the Volcano, Volcano Lair |
| Magma Rhino | common | 2/17 | 14 | 26.41 / 35.22 | 75% | in | Map 21, Basalt Foundry, Volcano Lair |
| Mallard Marauder | rare | 2/5 | 14 | 14.75 / 21.68 | 68% | in | Map 15, Map 16 |
| Mangrove Monitor | common | 3/12 | 7 | 21 / 22.58 | 93% | in | Map 9 |
| Mangrove Mudskipper | common | 1/7 | 7 | 14 / 14.56 | 96% | in | Map 9 |
| Mantis Shrimp | rare | 4/13 | 7 | 19.12 / 27.46 | 70% | in | The Sunken Depths |
| Marsh-mallow Hare | common | 4/4 | 0 | 16.5 / 16.72 | 99% | in | Map 5, Map 13 |
| Marula Elephant | uncommon | 4/20 | 14 | 28.3 / 32.31 | 88% | in | Map 14 |
| Matamata | uncommon | 3/13 | 0 | 25.75 / 25.42 | 101% | over | The Sunken Grove |
| Meadow Rabbit | starter | 3/2 | 0 | 11 / 12.34 | 89% | in | Map 1 |
| Meerkat Sentry | common | 2/7 | 14 | 19 / 23.14 | 82% | in | Map 14, Map 18 |
| Millipede Hauler | uncommon | 1/16 | 7 | 25.68 / 27.05 | 95% | in | The Mycelium Deep |
| Monarch Wingblade | rare | 3/6 | 7 | 20.57 / 23.84 | 86% | in | Map 13 |
| Moon Jelly | common | 1/3 | 7 | 14.8 / 18.35 | 81% | in | Map 10, The Sunken Depths, The Ice Hollow |
| Moonlit Hare | uncommon | 2/7 | 1 | 15.46 / 18.12 | 85% | in | Map 1, Map 2 |
| Mosquito Cloud | common | 1/4 | 0 | 11.22 / 12.92 | 87% | in | Map 5, Map 6, Map 15, The Canopy |
| Mountain Goat Climber | uncommon | 1/8 | 21 | 12.98 / 18.99 | 68% | in | Map 21 |
| Mountain Hare | common | 2/3 | 7 | 10.81 / 14.56 | 74% | in | Map 11, Map 12, Map 16 |
| Mouse Sapper | common | 3/11 | 7 | 21.07 / 21.5 | 98% | in | Map 12, Map 18 |
| Mudpuppy | common | 2/9 | 0 | 17.3 / 16.72 | 103% | over | Map 5, The Sunken Grove |
| Muskrat Lodgekeeper | uncommon | 1/7 | 4 | 19.23 / 26.35 | 73% | in | Map 4, Map 5, Lilypad Reach |
| Muskrat Reedgatherer | common | 1/8 | 0 | 18.06 / 16.72 | 108% | over | Map 5, Lilypad Reach, The Sunken Grove |
| Newt Doctor | uncommon | 4/3 | 6 | 18.48 / 19.29 | 96% | in | Map 5, Map 6, The Sunken Grove |
| Nightshade Moth | common | 2/2 | 14 | 14.18 / 22.96 | 62% | in | Map 17, Map 20 |
| Nutria Reedcutter | common | 2/7 | 0 | 20.2 / 21.1 | 96% | in | Map 6, Map 9, The Sunken Grove |
| Obsidian Scorpion | rare | 4/4 | 14 | 24.45 / 25.47 | 96% | in | Map 19, Map 20, Basalt Foundry, Eye of the Volcano, Volcano Lair |
| Octopus Tactician | uncommon | 5/7 | 7 | 28.72 / 30.67 | 94% | in | Smugglers' Grotto |
| Old Sturgeon | uncommon | 2/12 | 1 | 22.2 / 30.61 | 73% | in | Lilypad Reach |
| Open-Ocean Hermit Crab | common | 2/2 | 0 | 10.93 / 12.92 | 85% | in | Map 2, Smugglers' Grotto |
| Ossuary Lammergeier | superrare | 3/8 | 20 | 22.91 / 29.21 | 78% | in | Map 21, Eye of the Volcano |
| Owl Sentinel | common | 3/9 | 14 | 23.62 / 27.52 | 86% | in | Map 16 |
| Oystercatcher | common | 2/6 | 0 | 14.58 / 19.87 | 73% | in | Map 2 |
| Pack Mule | common | 1/11 | 20 | 15.8 / 17.59 | 90% | in | Map 20, Map 21 |
| Pale Oryx | uncommon | 2/11 | 14 | 21.23 / 24.31 | 87% | in | The Pale Desert |
| Peak Condor | common | 4/10 | 0 | 21.98 / 19.87 | 111% | over | Map 3, Map 11, Map 21, The Aerie Vault, Basalt Foundry |
| Peat-cutter Vole | common | 2/7 | 7 | 18.25 / 18.35 | 99% | in | The Sunken Grove |
| Peregrine Stooper | uncommon | 2/8 | 3 | 19.62 / 21.74 | 90% | in | Map 3, Map 11, The Aerie Vault |
| Phoenix Mushrooms | epic | 1/8 | 0 | 25.03 / 25.71 | 97% | in | Map 7, The Old Bramble |
| Pika Hoarder | common | 3/13 | 21 | 17.18 / 17.83 | 96% | in | Map 3, Map 11, Map 13, Map 21 |
| Pincushion Urchin | common | 0/6 | 0 | 13.13 / 16.72 | 79% | in | Map 2, Map 10, Smugglers' Grotto, The Ice Hollow |
| Pine Marten | rare | 1/14 | 7 | 19.96 / 23.84 | 84% | in | Map 13 |
| Pinecone Sapper | common | 0/13 | 14 | 18.75 / 19.99 | 94% | in | Map 16, Map 17, Map 19 |
| Plains Zebra | uncommon | 1/7 | 14 | 11.8 / 17.36 | 68% | in | Map 14, Map 15 |
| Planarian Splitter | uncommon | 3/8 | 1 | 21.55 / 21.27 | 101% | over | Map 4, Map 5, Map 7, The Mycelium Deep |
| Platypus Spur | uncommon | 4/4 | 4 | 20.75 / 21.97 | 94% | in | Map 4, Map 5, The Old Bramble |
| Polar Bear | veryrare | 2/17 | 17 | 25.5 / 31.72 | 80% | in | Map 17, Map 19 |
| Pond Algae | common | 1/7 | 0 | 17.04 / 16.72 | 102% | over | Map 4, Map 6, Lilypad Reach |
| Pond Trout | starter | 2/4 | 0 | 10 / 12.34 | 81% | in | Map 0 |
| Proboscis Monkey | uncommon | 2/11 | 7 | 17.9 / 22.67 | 79% | in | Map 9, The Old Bramble, The Canopy |
| Pronghorn Racer | common | 1/10 | 14 | 15.44 / 19.34 | 80% | in | Map 15 |
| Puddle Skimmer | uncommon | 2/6 | 1 | 16 / 18.12 | 88% | in | Map 1, Map 2, Clovermead |
| Puffball Bombardier | uncommon | 1/5 | 7 | 18.76 / 19.52 | 96% | in | Map 7, The Mycelium Deep |
| Puffin Diver | common | 2/5 | 3 | 11.89 / 20.57 | 58% | under | Map 3, Map 16 |
| Pumice Beetle | uncommon | 3/11 | 14 | 22.35 / 24.31 | 92% | in | Map 20, Map 21, Basalt Foundry |
| Quarry Mole | common | 2/12 | 8 | 18.96 / 21.74 | 87% | in | Map 8, Map 12, The Glimmer Depths, Volcano Lair |
| Quill-Thorn Boar | rare | 4/5 | 7 | 23.63 / 23.84 | 99% | in | Map 12, The Old Bramble |
| Quillback Elder | common | 5/5 | 14 | 24.85 / 31.14 | 80% | in | Map 19, Map 20 |
| Quillguard | rare | 2/22 | 12 | 28 / 30.86 | 91% | in | Map 12, Map 18, Map 19 |
| Rabbit Kit | common | 2/2 | 0 | 9.44 / 12.92 | 73% | in | Map 0 |
| Raccoon Nightcrew | common | 3/6 | 7 | 23.77 / 21.5 | 111% | over | Smugglers' Grotto |
| Raft Spider | common | 3/8 | 0 | 17.5 / 19.87 | 88% | in | Map 5, Map 16, Lilypad Reach |
| Red-billed Chough | common | 3/2 | 21 | 17.09 / 21.62 | 79% | in | Map 21 |
| Redwood Woodpecker | uncommon | 2/11 | 7 | 19.46 / 22.67 | 86% | in | Map 13 |
| Reef Shark | common | 6/13 | 7 | 31.5 / 34.47 | 91% | in | Map 10, The Sunken Depths |
| Ringed Seal | common | 1/11 | 14 | 16.14 / 23.14 | 70% | in | Map 17, The Ice Hollow |
| Riptide Eel | uncommon | 6/7 | 7 | 21.3 / 22.67 | 94% | in | Map 10, The Sunken Depths, The Ice Hollow |
| River Carp | starter | 2/10 | 0 | 16 / 16.33 | 98% | in | The Sunken Grove |
| River Mink | uncommon | 3/9 | 1 | 18.5 / 21.27 | 87% | in | Map 4, Map 14 |
| Riverworks Bastion | common | 0/35 | 6 | 35.49 / 45.91 | 77% | in | Lilypad Reach |
| Roadrunner Courier | common | 3/6 | 14 | 17.57 / 19.34 | 91% | in | Map 18, The Pale Desert |
| Robin Redbreast | uncommon | 2/5 | 1 | 14.38 / 14.61 | 98% | in | Map 1, Map 2, Clovermead |
| Rock Pool Starfish | common | 2/7 | 2 | 15.78 / 17.18 | 92% | in | Map 2, Smugglers' Grotto, The Ice Hollow |
| Rootworm Colony | common | 4/4 | 8 | 17.6 / 21.74 | 81% | in | The Mycelium Deep |
| Rot-Swollen Carcass | common | 3/11 | 7 | 25.88 / 33.59 | 77% | in | Map 7, Map 8, The Mycelium Deep |
| Sand Widow | common | 2/17 | 14 | 27.75 / 31.14 | 89% | in | Map 18, Map 20 |
| Savanna Cheetah | veryrare | 4/4 | 14 | 18.23 / 22.85 | 80% | in | Map 14, Map 15, Map 18 |
| Sea Turtle Elder | common | 4/9 | 7 | 26.35 / 34.47 | 76% | in | Map 10, The Sunken Depths |
| Shoal Shark | uncommon | 4/11 | 1 | 23.5 / 25.65 | 92% | in | Map 4, Map 5, The Ice Hollow |
| Siege Rhino | veryrare | 5/17 | 14 | 35.21 / 35.98 | 98% | in | Map 15, Map 16 |
| Silver Minnow | starter | 2/3 | 0 | 9 / 12.34 | 73% | in | Map 0 |
| Slow-worm | common | 1/9 | 0 | 14 / 16.72 | 84% | in | Map 4, Map 13 |
| Smokescreen Raccoon | uncommon | 3/9 | 14 | 20 / 24.31 | 82% | in | Map 19, Map 21, Basalt Foundry |
| Snapstick Turtle | common | 2/12 | 4 | 18.5 / 20.8 | 89% | in | Map 4, Map 5, Lilypad Reach |
| Snow Ermine | common | 2/4 | 14 | 12.92 / 16.19 | 80% | in | Map 17, The Ice Hollow |
| Snow Leopard | veryrare | 2/16 | 21 | 26 / 28.28 | 92% | in | Map 21 |
| Snowshoe Hare | common | 1/7 | 14 | 11.8 / 16.19 | 73% | in | Map 16, Map 17 |
| Soldier Ant | common | 2/8 | 0 | 17.13 / 16.72 | 102% | over | Map 0, Map 1 |
| Sparrow Chick | starter | 1/3 | 14 | 7.14 / 15.32 | 47% | under | The Aerie Vault |
| Stalactite Pill Bug | common | 1/23 | 7 | 26.87 / 34.47 | 78% | in | Map 8, Map 19, Map 20, The Glimmer Depths, Basalt Foundry |
| Star-nosed Mole | common | 5/5 | 8 | 14 / 14.79 | 95% | in | Map 8, Basalt Foundry |
| Stoat Cutthroat | rare | 3/10 | 15 | 23.78 / 25.71 | 92% | in | Map 14, Map 15, Basalt Foundry |
| Stonedrop Vulture | uncommon | 11/11 | 7 | 16.69 / 22.67 | 74% | in | Map 11 |
| Strangler Vine | rare | 1/18 | 0 | 26.08 / 26.58 | 98% | in | The Old Bramble |
| Sulfur Cinder Moth | common | 1/7 | 7 | 13.6 / 17.71 | 77% | in | Map 8, Map 19, The Glimmer Depths |
| Swamp Alligator | common | 2/15 | 0 | 24.7 / 27.87 | 89% | in | Map 5, The Sunken Grove |
| Sworn Shieldbearer | uncommon | 3/10 | 14 | 19.93 / 24.31 | 82% | in | Map 15, Map 16 |
| Taiga Lynx | rare | 2/8 | 16 | 16.52 / 22.15 | 75% | in | Map 16, Map 17 |
| Tasmanian Devil | uncommon | 1/11 | 7 | 17.68 / 22.67 | 78% | in | Map 13, Map 14, Map 15 |
| Terrier Pup | common | 2/5 | 0 | 11 / 12.92 | 85% | in | Map 1 |
| The Gannet Queen | uncommon | 1/15 | 7 | 24.48 / 30.67 | 80% | in | Map 11, Map 13, The Aerie Vault |
| Tide Seahorse | veryrare | 5/5 | 10 | 20.5 / 22.56 | 91% | in | Map 9, Map 10 |
| Trash Panda Trickster | common | 2/3 | 7 | 12.66 / 14.56 | 87% | in | Smugglers' Grotto |
| Upside-Down Bat | uncommon | 2/4 | 13 | 13.04 / 17.47 | 75% | in | Map 16 |
| Ür-Elk | veryrare | 4/11 | 22 | 27.06 / 37.85 | 71% | in | Map 20, Map 21, Eye of the Volcano, Volcano Lair |
| Village Miller | common | 2/7 | 14 | 13 / 17 | 76% | in | Map 15 |
| Voltaic Eel | rare | 1/7 | 7 | 19.33 / 23.66 | 82% | in | Map 9, Map 10 |
| Walrus Icebreaker | veryrare | 4/17 | 17 | 31.92 / 31.72 | 101% | over | Map 17, Map 19 |
| Warhorse Charger | common | 4/19 | 14 | 31 / 32.7 | 95% | in | Map 15, Map 17 |
| Water Shrew | common | 1/6 | 0 | 11.72 / 12.92 | 91% | in | Map 4, Map 6, Lilypad Reach |
| Whip Spider | uncommon | 3/7 | 14 | 19.55 / 24.31 | 80% | in | The Glimmer Depths |
| Wolf Spider Mother | rare | 2/7 | 7 | 19.18 / 23.84 | 80% | in | Map 7, Map 8, The Old Bramble |
| Woodland Caribou | uncommon | 3/8 | 16 | 21.19 / 24.77 | 86% | in | Map 16, Map 17 |
| Worker Ant | starter | 1/6 | 0 | 14.54 / 11.75 | 124% | over | Map 0, Map 18 |
