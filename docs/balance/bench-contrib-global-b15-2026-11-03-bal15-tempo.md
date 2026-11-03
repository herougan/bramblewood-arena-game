# Card value per budget point (global-b15, 2026-11-03)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 400` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `aedaa997c3ce`.

## How it is measured

- 400 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 777-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +6.2 + -0.090 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.0 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Salamander Pyromancer | epic | 1 | 2/12 | fireball | 35.05 | +45.3 ± 5.4 | +7.5 | 0.22 | 1.2941 | +4.7 | 10.33 |
| Siege Rhino | veryrare | 1 | 5/17 | siege | 38.09 | +42.8 ± 5.1 | +7.1 | 0.19 | 1.1176 | +4.6 | 10.44 |
| Trapdoor Spider | veryrare | 0 | 4/7 | poison | 23.49 | +50.5 ± 5.1 | +8.4 | 0.36 | 2.1176 | +4.5 | 10.34 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 45.27 | +36.9 ± 5.4 | +6.2 | 0.14 | 0.8235 | +4.3 | 9.41 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 29.68 | +44.0 ± 5.2 | +7.3 | 0.25 | 1.4706 | +4.0 | 9.01 |
| Badger Berserker | rare | 1 | 4/16 | - | 28.71 | +43.6 ± 5.2 | +7.3 | 0.25 | 1.4706 | +3.8 | 8.65 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 37.85 | +36.3 ± 5.3 | +6.0 | 0.16 | 0.9412 | +3.5 | 7.75 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 21.68 | +45.0 ± 5.2 | +7.5 | 0.35 | 2.0588 | +3.4 | 7.65 |
| Ent | rare | 0 | 2/22 | fog | 33.3 | +37.5 ± 5.5 | +6.3 | 0.19 | 1.1176 | +3.2 | 6.92 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 27.81 | +40.1 ± 5.1 | +6.7 | 0.24 | 1.4118 | +3.2 | 7.24 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 28.45 | +39.1 ± 5.3 | +6.5 | 0.23 | 1.3529 | +3.0 | 6.78 |
| Nautilus Drifter | veryrare | 1 | 4/13 | onReadyGold | 35.05 | +33.0 ± 5.4 | +5.5 | 0.16 | 0.9412 | +2.7 | 5.76 |
| Tide Seahorse | veryrare | 0 | 5/5 | tide | 23.49 | +39.3 ± 5.4 | +6.5 | 0.28 | 1.6471 | +2.6 | 5.65 |
| Dolphin Knight | rare | 0 | 3/9 | tide | 20.22 | +41.0 ± 5.1 | +6.8 | 0.34 | 2 | +2.6 | 5.93 |
| Pike Lancer | rare | 0 | 3/9 | tide | 20.22 | +41.0 ± 5.1 | +6.8 | 0.34 | 2 | +2.6 | 5.93 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 28.22 | +35.9 ± 5.4 | +6.0 | 0.21 | 1.2353 | +2.5 | 5.41 |
| Howdah Archers | rare | 1 | 3/8 | arrow | 27.58 | +35.4 ± 5.2 | +5.9 | 0.21 | 1.2353 | +2.4 | 5.34 |
| Beetle Battering-Ram | veryrare | 1 | 3/9 | breach, nocturnal, siege | 33.12 | +32.1 ± 5.4 | +5.3 | 0.16 | 0.9412 | +2.3 | 5.08 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 32.19 | +32.5 ± 5.4 | +5.4 | 0.17 | 1 | +2.3 | 5 |
| Riverstone Slinger | rare | 0 | 3/8 | reach | 20.22 | +38.3 ± 5.0 | +6.4 | 0.32 | 1.8824 | +2.1 | 4.99 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 24.31 | -6.0 ± 4.5 | -1.0 | -0.04 | -0.2353 | -4.9 | -12.62 |
| Riverworks Bastion | common | 3 | 0/31 | rampart | 38.32 | -12.0 ± 4.6 | -2.0 | -0.05 | -0.2941 | -4.5 | -11.67 |
| Malachite Golem | rare | 2 | 2/21 | shell | 36.8 | -10.3 ± 4.5 | -1.7 | -0.05 | -0.2941 | -4.4 | -11.55 |
| Vigil Owl | rare | 0 | 4/3 | nocturnal, relic | 19.05 | +0.3 ± 4.1 | +0.0 | 0.00 | 0 | -4.3 | -12.46 |
| Armory | rare | 1 | 0/16 | weaponMaster | 22.21 | +1.3 ± 4.8 | +0.2 | 0.01 | 0.0588 | -3.9 | -9.51 |
| Venomlord Serpent | common | 3 | 1/22 | guardian, poison | 36.92 | -6.4 ± 4.6 | -1.1 | -0.03 | -0.1765 | -3.7 | -9.48 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 22.67 | +4.5 ± 5.1 | +0.8 | 0.03 | 0.1765 | -3.3 | -7.58 |
| Lunar Howler | rare | 1 | 5/2 | moonborn | 29.85 | +0.5 ± 4.4 | +0.1 | 0.00 | 0 | -3.3 | -8.62 |
| Permafrost Mammoth | common | 3 | 8/7 | frostbite, nocturnal, sweep | 42.06 | -6.3 ± 4.9 | -1.0 | -0.02 | -0.1176 | -3.2 | -7.73 |
| Pronghorn Racer | common | 1 | 1/10 | speed | 19.34 | +6.9 ± 4.5 | +1.1 | 0.06 | 0.3529 | -3.2 | -8.33 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 26.76 | +5.0 ± 4.5 | +0.8 | 0.03 | 0.1765 | -2.8 | -7.37 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 21.27 | +9.0 ± 4.6 | +1.5 | 0.07 | 0.4118 | -2.6 | -6.82 |
| Stoneheart Tortoise | common | 2 | 3/23 | - | 40.36 | -1.6 ± 4.5 | -0.3 | -0.01 | -0.0588 | -2.6 | -6.78 |
| Banded Sea Krait | uncommon | 1 | 4/3 | nocturnal, venomous | 23.14 | +9.3 ± 4.9 | +1.5 | 0.07 | 0.4118 | -2.4 | -5.86 |
| Harvest Mouse | starter | 0 | 1/6 | - | 12.34 | +16.0 ± 3.8 | +2.7 | 0.22 | 1.2941 | -2.3 | -7.13 |
| Constrictor Coil | common | 2 | 4/16 | - | 29.26 | +6.8 ± 4.8 | +1.1 | 0.04 | 0.2353 | -2.3 | -5.49 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 23.14 | +10.9 ± 5.1 | +1.8 | 0.08 | 0.4706 | -2.2 | -4.97 |
| Iron Badger | epic | 1 | 0/35 | ironWill | 40.65 | +0.9 ± 4.8 | +0.1 | 0.00 | 0 | -2.2 | -5.27 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 47.31 | -2.5 ± 4.4 | -0.4 | -0.01 | -0.0588 | -2.1 | -5.58 |
| Rootworm Colony | common | 1 | 4/4 | poison | 21.74 | +12.1 ± 4.5 | +2.0 | 0.09 | 0.5294 | -2.1 | -5.45 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Salamander Pyromancer | epic | 1 | 2/12 | fireball | 35.05 | +45.3 ± 5.4 | +7.5 | 0.22 | 1.2941 | +4.7 | 10.33 |
| Siege Rhino | veryrare | 1 | 5/17 | siege | 38.09 | +42.8 ± 5.1 | +7.1 | 0.19 | 1.1176 | +4.6 | 10.44 |
| Trapdoor Spider | veryrare | 0 | 4/7 | poison | 23.49 | +50.5 ± 5.1 | +8.4 | 0.36 | 2.1176 | +4.5 | 10.34 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 45.27 | +36.9 ± 5.4 | +6.2 | 0.14 | 0.8235 | +4.3 | 9.41 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 29.68 | +44.0 ± 5.2 | +7.3 | 0.25 | 1.4706 | +4.0 | 9.01 |
| Badger Berserker | rare | 1 | 4/16 | - | 28.71 | +43.6 ± 5.2 | +7.3 | 0.25 | 1.4706 | +3.8 | 8.65 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 37.85 | +36.3 ± 5.3 | +6.0 | 0.16 | 0.9412 | +3.5 | 7.75 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 21.68 | +45.0 ± 5.2 | +7.5 | 0.35 | 2.0588 | +3.4 | 7.65 |
| Ent | rare | 0 | 2/22 | fog | 33.3 | +37.5 ± 5.5 | +6.3 | 0.19 | 1.1176 | +3.2 | 6.92 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 27.81 | +40.1 ± 5.1 | +6.7 | 0.24 | 1.4118 | +3.2 | 7.24 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 28.45 | +39.1 ± 5.3 | +6.5 | 0.23 | 1.3529 | +3.0 | 6.78 |
| Nautilus Drifter | veryrare | 1 | 4/13 | onReadyGold | 35.05 | +33.0 ± 5.4 | +5.5 | 0.16 | 0.9412 | +2.7 | 5.76 |
| Tide Seahorse | veryrare | 0 | 5/5 | tide | 23.49 | +39.3 ± 5.4 | +6.5 | 0.28 | 1.6471 | +2.6 | 5.65 |
| Dolphin Knight | rare | 0 | 3/9 | tide | 20.22 | +41.0 ± 5.1 | +6.8 | 0.34 | 2 | +2.6 | 5.93 |
| Pike Lancer | rare | 0 | 3/9 | tide | 20.22 | +41.0 ± 5.1 | +6.8 | 0.34 | 2 | +2.6 | 5.93 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 28.22 | +35.9 ± 5.4 | +6.0 | 0.21 | 1.2353 | +2.5 | 5.41 |
| Howdah Archers | rare | 1 | 3/8 | arrow | 27.58 | +35.4 ± 5.2 | +5.9 | 0.21 | 1.2353 | +2.4 | 5.34 |
| Beetle Battering-Ram | veryrare | 1 | 3/9 | breach, nocturnal, siege | 33.12 | +32.1 ± 5.4 | +5.3 | 0.16 | 0.9412 | +2.3 | 5.08 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 32.19 | +32.5 ± 5.4 | +5.4 | 0.17 | 1 | +2.3 | 5 |
| Riverstone Slinger | rare | 0 | 3/8 | reach | 20.22 | +38.3 ± 5.0 | +6.4 | 0.32 | 1.8824 | +2.1 | 4.99 |
| Ossuary Lammergeier | superrare | 1 | 3/8 | carrion, flying | 29.21 | +33.0 ± 5.3 | +5.5 | 0.19 | 1.1176 | +2.1 | 4.67 |
| Colony | rare | 0 | 0/11 | triggers | 24.42 | +35.5 ± 5.0 | +5.9 | 0.24 | 1.4118 | +2.1 | 4.85 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 30.79 | +31.6 ± 5.3 | +5.3 | 0.17 | 1 | +2.0 | 4.51 |
| Dune Packrat | rare | 1 | 2/11 | triggers | 25.47 | +33.3 ± 5.3 | +5.5 | 0.22 | 1.2941 | +1.8 | 3.98 |
| Hedgehog Herbalist | rare | 1 | 3/15 | herbalist | 25.24 | +33.1 ± 5.4 | +5.5 | 0.22 | 1.2941 | +1.8 | 3.79 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 31.96 | +29.3 ± 5.5 | +4.9 | 0.15 | 0.8824 | +1.7 | 3.71 |
| Fox Kit | common | 0 | 2/9 | - | 15.29 | +38.5 ± 5.1 | +6.4 | 0.42 | 2.4706 | +1.7 | 3.94 |
| Otter Shieldback | uncommon | 1 | 4/15 | - | 27.91 | +30.3 ± 5.3 | +5.0 | 0.18 | 1.0588 | +1.5 | 3.4 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 22.85 | +33.0 ± 5.2 | +5.5 | 0.24 | 1.4118 | +1.5 | 3.4 |
| Mangrove Manatee | rare | 1 | 7/7 | guardian, regen, tide | 33.65 | +26.8 ± 5.3 | +4.5 | 0.13 | 0.7647 | +1.5 | 3.26 |
| Glass Octopus | rare | 1 | 4/7 | corrode, stealth | 29.62 | +28.5 ± 5.3 | +4.8 | 0.16 | 0.9412 | +1.4 | 3.1 |
| Fawn Scout | rare | 0 | 2/8 | canopyCover, keenEye | 18.29 | +34.8 ± 5.2 | +5.8 | 0.32 | 1.8824 | +1.4 | 3.1 |
| Sunspire Sky-Sovereign | heroic | 1 | 2/9 | esprit, espritHp, flying | 28.04 | +29.3 ± 5.3 | +4.9 | 0.17 | 1 | +1.4 | 3.02 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 22.32 | +32.3 ± 5.4 | +5.4 | 0.24 | 1.4118 | +1.3 | 2.87 |
| Upside-Down Bat | uncommon | 0 | 2/4 | diurnal, flying | 17.47 | +35.0 ± 5.0 | +5.8 | 0.33 | 1.9412 | +1.3 | 3.09 |
| Shellwright Apprentice | common | 0 | 2/9 | shell | 17.88 | +33.8 ± 5.0 | +5.6 | 0.31 | 1.8235 | +1.2 | 2.73 |
| Raven Scout | rare | 0 | 2/5 | flying | 16.76 | +34.0 ± 4.8 | +5.7 | 0.34 | 2 | +1.1 | 2.65 |
| Gold-throated Acolyte | uncommon | 0 | 2/5 | evasive, flying | 23.43 | +30.0 ± 5.2 | +5.0 | 0.21 | 1.2353 | +1.1 | 2.36 |
| Tunnel Ant | rare | 1 | 2/9 | ambush, swarm, swarmN | 22.21 | +30.4 ± 5.3 | +5.1 | 0.23 | 1.3529 | +1.0 | 2.24 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 26.41 | +27.1 ± 5.2 | +4.5 | 0.17 | 1 | +0.9 | 1.96 |
| Tiny Cave Dweller | uncommon | 0 | 2/6 | armor | 15.02 | +33.5 ± 4.9 | +5.6 | 0.37 | 2.1765 | +0.8 | 2.02 |
| Bramblewood Lynx | rare | 1 | 5/7 | - | 25.03 | +27.6 ± 5.0 | +4.6 | 0.18 | 1.0588 | +0.8 | 1.89 |
| Pangolin Roller | rare | 1 | 5/5 | sturdy | 25.47 | +27.3 ± 5.1 | +4.5 | 0.18 | 1.0588 | +0.8 | 1.81 |
| Marshal of Rivergate | epic | 2 | 4/9 | armor, sweep | 34.87 | +21.8 ± 5.4 | +3.6 | 0.10 | 0.5882 | +0.8 | 1.69 |
| Corpse-flower Beetle | rare | 1 | 4/10 | wither | 26.58 | +26.5 ± 5.0 | +4.4 | 0.17 | 1 | +0.8 | 1.8 |
| Ashwing Ptarmigan | rare | 1 | 3/6 | flying | 24.02 | +27.1 ± 5.0 | +4.5 | 0.19 | 1.1176 | +0.6 | 1.49 |
| Otter Centurion | rare | 0 | 3/5 | boomerang | 19.05 | +29.6 ± 4.9 | +4.9 | 0.26 | 1.5294 | +0.6 | 1.38 |
| Land Tiller | common | 0 | 1/6 | onReadyGold | 18.29 | +29.6 ± 4.7 | +4.9 | 0.27 | 1.5882 | +0.5 | 1.26 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +31.6 ± 5.0 | +5.3 | 0.36 | 2.1176 | +0.5 | 1.12 |
| Cricket Drummer | common | 0 | 2/7 | - | 13.82 | +31.9 ± 4.8 | +5.3 | 0.38 | 2.2353 | +0.4 | 1.11 |
| Duckling Squadron | common | 0 | 1/9 | flying | 18.9 | +28.9 ± 4.8 | +4.8 | 0.25 | 1.4706 | +0.4 | 1.06 |
| Snow Owl Sentinel | superrare | 1 | 4/4 | expose, flying, nocturnal | 29.44 | +22.8 ± 5.5 | +3.8 | 0.13 | 0.7647 | +0.4 | 0.88 |
| Mountain Goat Climber | uncommon | 0 | 1/8 | evasive | 18.99 | +28.2 ± 4.7 | +4.7 | 0.25 | 1.4706 | +0.3 | 0.86 |
| Pack Mule | common | 0 | 1/11 | bounty | 17.59 | +29.0 ± 5.1 | +4.8 | 0.27 | 1.5882 | +0.3 | 0.77 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 23.61 | +25.4 ± 5.3 | +4.2 | 0.18 | 1.0588 | +0.3 | 0.67 |
| Alligator Gar | rare | 1 | 5/5 | armor, bleed, tide | 27.75 | +23.0 ± 5.3 | +3.8 | 0.14 | 0.8235 | +0.3 | 0.65 |
| Ant Warrior | uncommon | 0 | 2/3 | rage, swarm | 15.72 | +29.5 ± 5.0 | +4.9 | 0.31 | 1.8235 | +0.2 | 0.56 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 21.68 | +26.0 ± 5.0 | +4.3 | 0.20 | 1.1765 | +0.2 | 0.52 |
| Royal Guard | superrare | 1 | 3/6 | triggers | 25.71 | +23.3 ± 4.9 | +3.9 | 0.15 | 0.8824 | +0.1 | 0.36 |
| Gatling Hog | rare | 1 | 2/6 | arrow, twinStrike | 23.84 | +24.1 ± 5.0 | +4.0 | 0.17 | 1 | +0.1 | 0.26 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 21.15 | +25.6 ± 5.0 | +4.3 | 0.20 | 1.1765 | +0.1 | 0.26 |
| Otter Scout | rare | 0 | 1/13 | - | 17.25 | +27.5 ± 4.7 | +4.6 | 0.27 | 1.5882 | +0.1 | 0.12 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 26.88 | +21.9 ± 5.1 | +3.6 | 0.14 | 0.8235 | +0.0 | 0.07 |
| Echo Screecher | rare | 1 | 2/5 | flying, nocturnal, onReadyDamage | 24.07 | +23.5 ± 5.1 | +3.9 | 0.16 | 0.9412 | +0.0 | 0.07 |
| Coral Polyp Colony | uncommon | 0 | 0/9 | onReadyGold, tide | 19.52 | +26.1 ± 5.1 | +4.3 | 0.22 | 1.2941 | +0.0 | 0.07 |
| Hagfish Silencer | rare | 1 | 3/12 | nullify | 22.21 | +24.1 ± 5.1 | +4.0 | 0.18 | 1.0588 | -0.0 | -0.09 |
| Chapel Tortoise | uncommon | 0 | 1/10 | prayer, prayerWard | 22.79 | +23.1 ± 5.2 | +3.9 | 0.17 | 1 | -0.2 | -0.36 |
| Goose Sentry | rare | 1 | 3/10 | sentry, taunt | 27.81 | +20.1 ± 5.2 | +3.4 | 0.12 | 0.7059 | -0.2 | -0.4 |
| Testudo Tortoise | rare | 2 | 4/12 | armor, guardian | 35.57 | +15.6 ± 5.1 | +2.6 | 0.07 | 0.4118 | -0.2 | -0.44 |
| Quillguard | rare | 1 | 2/22 | - | 30.86 | +18.3 ± 5.4 | +3.0 | 0.10 | 0.5882 | -0.2 | -0.43 |
| Otter Paddler | starter | 0 | 3/3 | - | 12.34 | +28.7 ± 4.8 | +4.8 | 0.39 | 2.2941 | -0.2 | -0.52 |
| Pond Duck | starter | 0 | 3/3 | - | 12.34 | +28.5 ± 4.7 | +4.8 | 0.38 | 2.2353 | -0.3 | -0.62 |
| Bee Forager | starter | 0 | 0/5 | flying, swarm, triggers | 11.75 | +28.6 ± 5.2 | +4.8 | 0.41 | 2.4118 | -0.3 | -0.64 |
| Archerfish | uncommon | 1 | 3/5 | acidBolt | 22.67 | +22.3 ± 4.7 | +3.7 | 0.16 | 0.9412 | -0.3 | -0.78 |
| Ember Revenant | veryrare | 2 | 4/15 | pierce, undead | 32.36 | +16.5 ± 5.1 | +2.8 | 0.08 | 0.4706 | -0.4 | -0.81 |
| Swordbill Challenger | rare | 0 | 1/8 | counterattack, flying, taunt | 20.22 | +23.3 ± 5.3 | +3.9 | 0.19 | 1.1176 | -0.4 | -0.82 |
| Vampire Bat | rare | 0 | 2/3 | flying, nocturnal, sap | 20.69 | +23.0 ± 5.2 | +3.8 | 0.19 | 1.1176 | -0.4 | -0.86 |
| Cottontail | starter | 0 | 2/5 | - | 12.34 | +26.3 ± 4.5 | +4.4 | 0.35 | 2.0588 | -0.6 | -1.61 |
| Glass Changeling | rare | 1 | 3/6 | changeling, flying | 25.24 | +18.4 ± 5.0 | +3.1 | 0.12 | 0.7059 | -0.7 | -1.66 |
| Robin Redbreast | uncommon | 0 | 2/2 | diurnal, flying | 14.61 | +24.0 ± 4.6 | +4.0 | 0.27 | 1.5882 | -0.8 | -1.97 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 29.27 | +15.4 ± 4.8 | +2.6 | 0.09 | 0.5294 | -0.8 | -2.04 |
| Beluga | rare | 1 | 1/16 | inspiring, sonar, tide | 29.85 | +14.8 ± 5.1 | +2.5 | 0.08 | 0.4706 | -0.9 | -2.05 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 24.31 | +17.9 ± 5.1 | +3.0 | 0.12 | 0.7059 | -0.9 | -2.02 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 63.13 | -4.8 ± 4.3 | -0.8 | -0.01 | -0.0588 | -1.0 | -2.65 |
| Pincushion Urchin | common | 0 | 2/4 | thorns, tide | 16.72 | +21.3 ± 4.8 | +3.5 | 0.21 | 1.2353 | -1.0 | -2.54 |
| Meadow Rabbit | starter | 0 | 3/2 | - | 12.34 | +23.6 ± 4.6 | +3.9 | 0.32 | 1.8824 | -1.1 | -2.71 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 33.24 | +11.3 ± 4.9 | +1.9 | 0.06 | 0.3529 | -1.1 | -2.73 |
| Compost Grub | common | 0 | 1/10 | - | 13.57 | +22.1 ± 4.7 | +3.7 | 0.27 | 1.5882 | -1.2 | -2.96 |
| Thorn Shrike | rare | 1 | 3/3 | bleed, flying | 23.84 | +16.0 ± 5.0 | +2.7 | 0.11 | 0.6471 | -1.2 | -2.89 |
| Sunspire Envoy | rare | 1 | 1/8 | esprit, flying | 23.37 | +16.1 ± 5.3 | +2.7 | 0.11 | 0.6471 | -1.3 | -2.81 |
| The Magnate Duck | epic | 4 | 2/37 | armor, bounty, hoard, king, midas | 58.46 | -4.1 ± 4.1 | -0.7 | -0.01 | -0.0588 | -1.3 | -3.74 |
| Mangrove Kingfisher | rare | 1 | 2/4 | evasive, flying | 20.51 | +17.0 ± 4.8 | +2.8 | 0.14 | 0.8235 | -1.4 | -3.43 |
| Dhole Matriarch | veryrare | 2 | 4/21 | guardian, packLeader | 35.11 | +8.3 ± 4.9 | +1.4 | 0.04 | 0.2353 | -1.5 | -3.5 |
| Violet Vane Fletcher | starter | 0 | 1/5 | flying | 13.18 | +20.6 ± 4.4 | +3.4 | 0.26 | 1.5294 | -1.5 | -3.93 |
| Goliath Tentacle | epic | 2 | 7/8 | sweep, tide | 41.71 | +4.3 ± 4.8 | +0.7 | 0.02 | 0.1176 | -1.5 | -3.66 |
| Quill Volley | rare | 1 | 1/14 | pounce | 22.85 | +14.1 ± 4.7 | +2.4 | 0.10 | 0.5882 | -1.7 | -4.16 |
| Octopus Tactician | uncommon | 2 | 5/7 | sweep, tide | 30.67 | +9.5 ± 4.7 | +1.6 | 0.05 | 0.2941 | -1.7 | -4.18 |
| River Warden | rare | 2 | 4/12 | tide | 26.99 | +11.1 ± 4.9 | +1.8 | 0.07 | 0.4118 | -1.8 | -4.21 |
| Ruby-Throat Duelist | rare | 0 | 3/2 | flying, pierce, quick | 20.22 | +14.6 ± 4.8 | +2.4 | 0.12 | 0.7059 | -1.8 | -4.43 |
| Hummingbird Needler | uncommon | 0 | 1/3 | bleed, flying, pierce | 15.26 | +17.1 ± 4.9 | +2.9 | 0.19 | 1.1176 | -1.9 | -4.49 |
| Alpine Salamander | common | 1 | 2/10 | regen | 21.5 | +13.5 ± 4.8 | +2.3 | 0.10 | 0.5882 | -1.9 | -4.59 |
| Goliath Broodmother | legendary | 3 | 4/24 | inspiring, onDeathSpawn | 49.29 | -2.5 ± 4.8 | -0.4 | -0.01 | -0.0588 | -1.9 | -4.64 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 24.77 | +11.3 ± 4.8 | +1.9 | 0.08 | 0.4706 | -1.9 | -4.71 |
| Cinder Hornet | common | 2 | 3/3 | flying, stunOnHit | 24.83 | +11.1 ± 4.6 | +1.8 | 0.07 | 0.4118 | -2.0 | -5 |
| Platypus Spur | uncommon | 1 | 4/4 | venomous | 21.97 | +12.1 ± 4.5 | +2.0 | 0.09 | 0.5294 | -2.1 | -5.37 |
| Rootworm Colony | common | 1 | 4/4 | poison | 21.74 | +12.1 ± 4.5 | +2.0 | 0.09 | 0.5294 | -2.1 | -5.45 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 47.31 | -2.5 ± 4.4 | -0.4 | -0.01 | -0.0588 | -2.1 | -5.58 |
| Iron Badger | epic | 1 | 0/35 | ironWill | 40.65 | +0.9 ± 4.8 | +0.1 | 0.00 | 0 | -2.2 | -5.27 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 23.14 | +10.9 ± 5.1 | +1.8 | 0.08 | 0.4706 | -2.2 | -4.97 |
| Constrictor Coil | common | 2 | 4/16 | - | 29.26 | +6.8 ± 4.8 | +1.1 | 0.04 | 0.2353 | -2.3 | -5.49 |
| Harvest Mouse | starter | 0 | 1/6 | - | 12.34 | +16.0 ± 3.8 | +2.7 | 0.22 | 1.2941 | -2.3 | -7.13 |
| Banded Sea Krait | uncommon | 1 | 4/3 | nocturnal, venomous | 23.14 | +9.3 ± 4.9 | +1.5 | 0.07 | 0.4118 | -2.4 | -5.86 |
| Stoneheart Tortoise | common | 2 | 3/23 | - | 40.36 | -1.6 ± 4.5 | -0.3 | -0.01 | -0.0588 | -2.6 | -6.78 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 21.27 | +9.0 ± 4.6 | +1.5 | 0.07 | 0.4118 | -2.6 | -6.82 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 26.76 | +5.0 ± 4.5 | +0.8 | 0.03 | 0.1765 | -2.8 | -7.37 |
| Pronghorn Racer | common | 1 | 1/10 | speed | 19.34 | +6.9 ± 4.5 | +1.1 | 0.06 | 0.3529 | -3.2 | -8.33 |
| Permafrost Mammoth | common | 3 | 8/7 | frostbite, nocturnal, sweep | 42.06 | -6.3 ± 4.9 | -1.0 | -0.02 | -0.1176 | -3.2 | -7.73 |
| Lunar Howler | rare | 1 | 5/2 | moonborn | 29.85 | +0.5 ± 4.4 | +0.1 | 0.00 | 0 | -3.3 | -8.62 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 22.67 | +4.5 ± 5.1 | +0.8 | 0.03 | 0.1765 | -3.3 | -7.58 |
| Venomlord Serpent | common | 3 | 1/22 | guardian, poison | 36.92 | -6.4 ± 4.6 | -1.1 | -0.03 | -0.1765 | -3.7 | -9.48 |
| Armory | rare | 1 | 0/16 | weaponMaster | 22.21 | +1.3 ± 4.8 | +0.2 | 0.01 | 0.0588 | -3.9 | -9.51 |
| Vigil Owl | rare | 0 | 4/3 | nocturnal, relic | 19.05 | +0.3 ± 4.1 | +0.0 | 0.00 | 0 | -4.3 | -12.46 |
| Malachite Golem | rare | 2 | 2/21 | shell | 36.8 | -10.3 ± 4.5 | -1.7 | -0.05 | -0.2941 | -4.4 | -11.55 |
| Riverworks Bastion | common | 3 | 0/31 | rampart | 38.32 | -12.0 ± 4.6 | -2.0 | -0.05 | -0.2941 | -4.5 | -11.67 |
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 24.31 | -6.0 ± 4.5 | -1.0 | -0.04 | -0.2353 | -4.9 | -12.62 |
