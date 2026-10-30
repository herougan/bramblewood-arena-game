# Card value per budget point (global, 2026-10-30)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 200` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `1c9efe9ae0ed`.

## How it is measured

- 200 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 767-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +6.0 + -0.070 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.6 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Wolf Spider Mother | rare | 1 | 3/10 | brood | 20.58 | +61.3 ± 7.0 | +10.2 | 0.50 | 1.9231 | +5.6 | 9.39 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 21.41 | +59.3 ± 7.0 | +9.9 | 0.46 | 1.7692 | +5.3 | 9.04 |
| Pike Lancer | rare | 0 | 4/8 | tide | 17.89 | +59.3 ± 7.0 | +9.9 | 0.55 | 2.1154 | +5.1 | 8.64 |
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 17.69 | +59.3 ± 6.8 | +9.9 | 0.56 | 2.1538 | +5.1 | 8.8 |
| Royal Guard | superrare | 1 | 4/10 | armor, boomerang | 22.23 | +57.3 ± 7.0 | +9.5 | 0.43 | 1.6538 | +5.1 | 8.5 |
| Badger Berserker | rare | 1 | 4/16 | - | 24.86 | +55.8 ± 6.9 | +9.3 | 0.37 | 1.4231 | +5.0 | 8.53 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 24.09 | +56.0 ± 7.1 | +9.3 | 0.39 | 1.5 | +5.0 | 8.21 |
| Ent | rare | 0 | 2/22 | fog | 29.47 | +52.5 ± 7.1 | +8.8 | 0.30 | 1.1538 | +4.8 | 7.91 |
| Glass Octopus | rare | 1 | 4/13 | corrode, stealth | 25.7 | +54.0 ± 7.5 | +9.0 | 0.35 | 1.3462 | +4.8 | 7.5 |
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 27.76 | +53.0 ± 6.9 | +8.8 | 0.32 | 1.2308 | +4.7 | 8.02 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 39.54 | +48.0 ± 7.2 | +8.0 | 0.20 | 0.7692 | +4.7 | 7.7 |
| Two-Headed Calf | rare | 1 | 3/11 | fork | 21.82 | +54.3 ± 7.2 | +9.0 | 0.41 | 1.5769 | +4.5 | 7.45 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 32.98 | +49.3 ± 7.5 | +8.2 | 0.25 | 0.9615 | +4.5 | 7.02 |
| Squire's Mount | rare | 1 | 4/15 | - | 23.13 | +53.0 ± 6.9 | +8.8 | 0.38 | 1.4615 | +4.4 | 7.52 |
| Hedge Changeling | uncommon | 0 | 1/7 | changeling, swarm | 16.86 | +55.5 ± 7.0 | +9.3 | 0.55 | 2.1154 | +4.4 | 7.37 |
| Siege Rhino | rare | 1 | 5/17 | siege | 32.15 | +49.3 ± 7.5 | +8.2 | 0.26 | 1 | +4.4 | 6.94 |
| Stoat Cutthroat | rare | 1 | 3/12 | backstab, foeScarcity | 22.23 | +53.0 ± 7.2 | +8.8 | 0.40 | 1.5385 | +4.3 | 7.13 |
| Ibex Rockcaller | veryrare | 1 | 3/12 | avalanche | 26.32 | +50.7 ± 7.3 | +8.5 | 0.32 | 1.2308 | +4.3 | 6.85 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 25.75 | +51.0 ± 7.1 | +8.5 | 0.33 | 1.2692 | +4.3 | 7.08 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 18.72 | +53.8 ± 6.9 | +9.0 | 0.48 | 1.8462 | +4.2 | 7.21 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bee Drone | uncommon | 0 | 0/1 | flying, triggers | 12.47 | +1.5 ± 4.3 | +0.3 | 0.02 | 0.0769 | -4.9 | -13.46 |
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 19.55 | +0.3 ± 5.6 | +0.0 | 0.00 | 0 | -4.6 | -9.73 |
| Ember Centipede | common | 0 | 1/1 | dry, quick | 17.69 | +3.0 ± 3.4 | +0.5 | 0.03 | 0.1154 | -4.3 | -14.97 |
| Earthworm | starter | 0 | 0/6 | - | 10.92 | +7.0 ± 4.5 | +1.2 | 0.11 | 0.4231 | -4.1 | -10.64 |
| Irradiated Glow Wyrm | rare | 1 | 1/18 | poison | 25.7 | +2.0 ± 4.8 | +0.3 | 0.01 | 0.0385 | -3.9 | -9.65 |
| Fleetfoot'd | uncommon | 0 | 1/1 | quick, tide | 12.47 | +7.5 ± 4.7 | +1.3 | 0.10 | 0.3846 | -3.9 | -9.64 |
| Chipmunk Cavalry | common | 1 | 2/2 | quick | 13.71 | +8.0 ± 5.6 | +1.3 | 0.10 | 0.3846 | -3.7 | -7.85 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +8.8 ± 5.2 | +1.5 | 0.11 | 0.4231 | -3.7 | -8.32 |
| Gale Sprite | common | 1 | 1/8 | evolute | 18.05 | +7.5 ± 5.5 | +1.3 | 0.07 | 0.2692 | -3.5 | -7.49 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.4 | +10.8 ± 4.9 | +1.8 | 0.17 | 0.6538 | -3.5 | -8.47 |
| Lucky Hopper | rare | 1 | 1/17 | - | 19.17 | +7.8 ± 5.9 | +1.3 | 0.07 | 0.2692 | -3.4 | -6.73 |
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 22.23 | +7.0 ± 5.3 | +1.2 | 0.05 | 0.1923 | -3.3 | -7.41 |
| Cocoon | uncommon | 0 | 0/1 | chrysalis | 35.05 | +2.0 ± 2.4 | +0.3 | 0.01 | 0.0385 | -3.3 | -16.08 |
| Mosswing | starter | 0 | 0/7 | flying | 10.61 | +12.8 ± 5.0 | +2.1 | 0.20 | 0.7692 | -3.1 | -7.45 |
| Sheep | starter | 0 | 1/6 | taunt | 10.4 | +13.0 ± 5.4 | +2.2 | 0.21 | 0.8077 | -3.1 | -6.81 |
| Duckling | starter | 0 | 1/5 | - | 10.92 | +13.0 ± 5.0 | +2.2 | 0.20 | 0.7692 | -3.1 | -7.22 |
| Nectar Vintner | common | 0 | 1/1 | flying, healing | 12.47 | +12.5 ± 5.4 | +2.1 | 0.17 | 0.6538 | -3.1 | -6.7 |
| Otter Riverguard | common | 2 | 1/14 | armor | 20.79 | +9.3 ± 5.3 | +1.5 | 0.07 | 0.2692 | -3.0 | -6.76 |
| Chamois Leaper | uncommon | 1 | 1/10 | mountainClimber, pounce | 20.37 | +9.5 ± 5.1 | +1.6 | 0.08 | 0.3077 | -3.0 | -7.02 |
| Golden Magpie | uncommon | 0 | 1/4 | flying, midas | 16.81 | +11.0 ± 5.9 | +1.8 | 0.11 | 0.4231 | -3.0 | -6.06 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Wolf Spider Mother | rare | 1 | 3/10 | brood | 20.58 | +61.3 ± 7.0 | +10.2 | 0.50 | 1.9231 | +5.6 | 9.39 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 21.41 | +59.3 ± 7.0 | +9.9 | 0.46 | 1.7692 | +5.3 | 9.04 |
| Pike Lancer | rare | 0 | 4/8 | tide | 17.89 | +59.3 ± 7.0 | +9.9 | 0.55 | 2.1154 | +5.1 | 8.64 |
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 17.69 | +59.3 ± 6.8 | +9.9 | 0.56 | 2.1538 | +5.1 | 8.8 |
| Royal Guard | superrare | 1 | 4/10 | armor, boomerang | 22.23 | +57.3 ± 7.0 | +9.5 | 0.43 | 1.6538 | +5.1 | 8.5 |
| Badger Berserker | rare | 1 | 4/16 | - | 24.86 | +55.8 ± 6.9 | +9.3 | 0.37 | 1.4231 | +5.0 | 8.53 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 24.09 | +56.0 ± 7.1 | +9.3 | 0.39 | 1.5 | +5.0 | 8.21 |
| Ent | rare | 0 | 2/22 | fog | 29.47 | +52.5 ± 7.1 | +8.8 | 0.30 | 1.1538 | +4.8 | 7.91 |
| Glass Octopus | rare | 1 | 4/13 | corrode, stealth | 25.7 | +54.0 ± 7.5 | +9.0 | 0.35 | 1.3462 | +4.8 | 7.5 |
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 27.76 | +53.0 ± 6.9 | +8.8 | 0.32 | 1.2308 | +4.7 | 8.02 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 39.54 | +48.0 ± 7.2 | +8.0 | 0.20 | 0.7692 | +4.7 | 7.7 |
| Two-Headed Calf | rare | 1 | 3/11 | fork | 21.82 | +54.3 ± 7.2 | +9.0 | 0.41 | 1.5769 | +4.5 | 7.45 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 32.98 | +49.3 ± 7.5 | +8.2 | 0.25 | 0.9615 | +4.5 | 7.02 |
| Squire's Mount | rare | 1 | 4/15 | - | 23.13 | +53.0 ± 6.9 | +8.8 | 0.38 | 1.4615 | +4.4 | 7.52 |
| Hedge Changeling | uncommon | 0 | 1/7 | changeling, swarm | 16.86 | +55.5 ± 7.0 | +9.3 | 0.55 | 2.1154 | +4.4 | 7.37 |
| Siege Rhino | rare | 1 | 5/17 | siege | 32.15 | +49.3 ± 7.5 | +8.2 | 0.26 | 1 | +4.4 | 6.94 |
| Stoat Cutthroat | rare | 1 | 3/12 | backstab, foeScarcity | 22.23 | +53.0 ± 7.2 | +8.8 | 0.40 | 1.5385 | +4.3 | 7.13 |
| Ibex Rockcaller | veryrare | 1 | 3/12 | avalanche | 26.32 | +50.7 ± 7.3 | +8.5 | 0.32 | 1.2308 | +4.3 | 6.85 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 25.75 | +51.0 ± 7.1 | +8.5 | 0.33 | 1.2692 | +4.3 | 7.08 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 18.72 | +53.8 ± 6.9 | +9.0 | 0.48 | 1.8462 | +4.2 | 7.21 |
| Tide Spirit | rare | 0 | 5/5 | tide | 19.75 | +53.3 ± 7.2 | +8.9 | 0.45 | 1.7308 | +4.2 | 6.92 |
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 27.56 | +49.8 ± 7.1 | +8.3 | 0.30 | 1.1538 | +4.2 | 6.93 |
| Blue-ringed Octopus | rare | 1 | 2/11 | octolash | 25.28 | +50.0 ± 6.9 | +8.3 | 0.33 | 1.2692 | +4.1 | 6.9 |
| Honeyjoe Brewer | uncommon | 0 | 1/3 | coffee, flying, kinship | 13.5 | +53.3 ± 7.1 | +8.9 | 0.66 | 2.5385 | +3.8 | 6.35 |
| Tax-Collector Teal | uncommon | 0 | 1/4 | flying, hoard, swipe | 17.43 | +51.5 ± 7.1 | +8.6 | 0.49 | 1.8846 | +3.8 | 6.27 |
| Talon Archer | veryrare | 1 | 2/6 | arrow, diurnal, flying | 23.27 | +49.0 ± 6.9 | +8.2 | 0.35 | 1.3462 | +3.8 | 6.37 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 22.85 | +48.8 ± 7.2 | +8.1 | 0.36 | 1.3846 | +3.7 | 6.03 |
| Echidna Quillshot | veryrare | 1 | 3/11 | volley | 27.97 | +46.5 ± 7.2 | +7.8 | 0.28 | 1.0769 | +3.7 | 6 |
| Prospector Mole | common | 0 | 3/9 | prospector | 17.69 | +50.5 ± 7.1 | +8.4 | 0.48 | 1.8462 | +3.6 | 6.03 |
| Ossuary Lammergeier | superrare | 1 | 3/8 | carrion, flying | 25.33 | +47.3 ± 7.2 | +7.9 | 0.31 | 1.1923 | +3.6 | 5.9 |
| Nautilus Drifter | rare | 1 | 4/13 | onReadyGold | 28.85 | +45.8 ± 7.0 | +7.6 | 0.26 | 1 | +3.6 | 6.02 |
| Upside-Down Bat | uncommon | 0 | 2/5 | diurnal, flying | 15.46 | +51.2 ± 7.1 | +8.5 | 0.55 | 2.1154 | +3.6 | 6 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 24.46 | +47.3 ± 7.2 | +7.9 | 0.32 | 1.2308 | +3.5 | 5.84 |
| Teatime Toad | uncommon | 0 | 4/4 | regen | 18.51 | +48.8 ± 7.1 | +8.1 | 0.44 | 1.6923 | +3.4 | 5.67 |
| Colony | rare | 0 | 0/11 | triggers | 21.61 | +47.0 ± 7.2 | +7.8 | 0.36 | 1.3846 | +3.3 | 5.43 |
| Magma Salamander | rare | 1 | 3/12 | fireArrow | 22.03 | +46.8 ± 7.2 | +7.8 | 0.35 | 1.3462 | +3.3 | 5.42 |
| Otter Flag Bearer | uncommon | 0 | 2/9 | inspiring | 16.86 | +48.8 ± 6.9 | +8.1 | 0.48 | 1.8462 | +3.3 | 5.59 |
| Sunspire Sky-Sovereign | heroic | 1 | 2/10 | esprit, espritHp, flying | 24.3 | +45.8 ± 7.2 | +7.6 | 0.31 | 1.1923 | +3.3 | 5.39 |
| Dust Hyena | uncommon | 0 | 2/7 | carnage, triggers | 15.36 | +49.0 ± 7.2 | +8.2 | 0.53 | 2.0385 | +3.2 | 5.25 |
| Redwood Woodpecker | uncommon | 1 | 2/12 | milling | 19.55 | +46.8 ± 6.9 | +7.8 | 0.40 | 1.5385 | +3.1 | 5.32 |
| Gatling Hog | rare | 1 | 2/9 | arrow, twinStrike | 20.58 | +46.3 ± 7.2 | +7.7 | 0.37 | 1.4231 | +3.1 | 5.1 |
| Rimefire Salamander | rare | 1 | 2/7 | fireArrow, iceArrow | 23.68 | +45.0 ± 7.0 | +7.5 | 0.32 | 1.2308 | +3.1 | 5.23 |
| Howdah Archers | rare | 1 | 3/8 | arrow | 23.89 | +44.8 ± 7.3 | +7.5 | 0.31 | 1.1923 | +3.1 | 4.98 |
| Sunspire Choirmother | veryrare | 1 | 3/4 | diurnal, diurnalHp, esprit, espritHp, flying | 25.08 | +44.0 ± 7.3 | +7.3 | 0.29 | 1.1154 | +3.0 | 4.93 |
| Optio of the Ford | veryrare | 1 | 4/12 | guardian | 21.2 | +45.5 ± 7.0 | +7.6 | 0.36 | 1.3846 | +3.0 | 5.08 |
| Otter Centurion | rare | 0 | 3/7 | boomerang | 16.86 | +47.0 ± 6.9 | +7.8 | 0.46 | 1.7692 | +3.0 | 5.07 |
| Alpine Marmot | common | 0 | 3/9 | guardian | 17.07 | +46.8 ± 6.9 | +7.8 | 0.46 | 1.7692 | +3.0 | 5.03 |
| Clap-net Trapper | common | 0 | 2/11 | triggers | 15.83 | +47.3 ± 6.9 | +7.9 | 0.50 | 1.9231 | +3.0 | 5.03 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 14.62 | +47.5 ± 6.9 | +7.9 | 0.54 | 2.0769 | +2.9 | 4.95 |
| Balloon Archer | uncommon | 1 | 2/8 | arrow, arrowBramble, flying | 26.73 | +42.3 ± 7.4 | +7.0 | 0.26 | 1 | +2.9 | 4.57 |
| Pika Hoarder | common | 0 | 3/15 | scatterbrained | 15.78 | +46.8 ± 6.9 | +7.8 | 0.49 | 1.8846 | +2.9 | 4.88 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 24.66 | +43.0 ± 7.0 | +7.2 | 0.29 | 1.1154 | +2.9 | 4.79 |
| Gold-throated Acolyte | uncommon | 0 | 2/5 | evasive, flying | 20.74 | +44.5 ± 7.0 | +7.4 | 0.36 | 1.3846 | +2.8 | 4.75 |
| Mudpuppy | common | 0 | 2/9 | regen | 16.24 | +46.3 ± 6.9 | +7.7 | 0.47 | 1.8077 | +2.8 | 4.79 |
| Riverstone Slinger | rare | 0 | 3/8 | reach | 17.89 | +45.5 ± 6.9 | +7.6 | 0.42 | 1.6154 | +2.8 | 4.78 |
| Shellwright Apprentice | common | 0 | 2/9 | shell | 15.83 | +46.3 ± 6.9 | +7.7 | 0.49 | 1.8846 | +2.8 | 4.74 |
| Inside-Out Hedgehog | uncommon | 0 | 1/11 | thorns | 15.16 | +46.3 ± 6.9 | +7.7 | 0.51 | 1.9615 | +2.8 | 4.67 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 27.76 | +41.0 ± 7.4 | +6.8 | 0.25 | 0.9615 | +2.7 | 4.36 |
| Dune Packrat | uncommon | 1 | 2/11 | triggers | 20.99 | +43.8 ± 6.9 | +7.3 | 0.35 | 1.3462 | +2.7 | 4.67 |
| Wolf Pack Runner | rare | 1 | 3/13 | muster | 22.03 | +43.3 ± 7.2 | +7.2 | 0.33 | 1.2692 | +2.7 | 4.42 |
| Tiny Cave Dweller | uncommon | 0 | 2/7 | armor | 13.3 | +46.5 ± 7.1 | +7.8 | 0.58 | 2.2308 | +2.7 | 4.42 |
| Talus Pika | common | 0 | 2/7 | triggers | 14.33 | +46.0 ± 6.9 | +7.7 | 0.54 | 2.0769 | +2.6 | 4.52 |
| Voidfeather Scout | uncommon | 0 | 2/5 | flying, nocturnal, nocturnalHp | 17.2 | +44.8 ± 6.9 | +7.5 | 0.43 | 1.6538 | +2.6 | 4.5 |
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 30.04 | +39.5 ± 7.5 | +6.6 | 0.22 | 0.8462 | +2.6 | 4.14 |
| Antlion Pit | uncommon | 1 | 3/13 | trap | 21.82 | +42.8 ± 7.0 | +7.1 | 0.33 | 1.2692 | +2.6 | 4.39 |
| Ashwing Ptarmigan | rare | 1 | 3/7 | flying | 20.73 | +43.0 ± 7.3 | +7.2 | 0.35 | 1.3462 | +2.6 | 4.18 |
| Otter Ferryman | common | 0 | 3/8 | tide | 15.83 | +45.0 ± 7.3 | +7.5 | 0.47 | 1.8077 | +2.6 | 4.15 |
| Newt Doctor | uncommon | 0 | 4/4 | healing | 17.07 | +44.3 ± 7.0 | +7.4 | 0.43 | 1.6538 | +2.5 | 4.27 |
| Otter Shieldback | uncommon | 1 | 4/16 | - | 24.16 | +41.3 ± 7.4 | +6.9 | 0.28 | 1.0769 | +2.5 | 4.02 |
| Vampire Bat | uncommon | 0 | 2/4 | flying, nocturnal, sap | 17.27 | +44.0 ± 7.0 | +7.3 | 0.42 | 1.6154 | +2.5 | 4.19 |
| Lantern Spark Fly | uncommon | 0 | 2/7 | flying, illuminate | 19.13 | +42.8 ± 7.1 | +7.1 | 0.37 | 1.4231 | +2.4 | 4.01 |
| Red Dragon Egg | legendary | 0 | 0/5 | - | 98.81 | +10.0 ± 4.8 | +1.7 | 0.02 | 0.0769 | +2.4 | 5.88 |
| Planarian Splitter | uncommon | 1 | 3/10 | meiosis | 19.55 | +42.3 ± 7.1 | +7.0 | 0.36 | 1.3846 | +2.4 | 3.93 |
| Hedgehog Herbalist | rare | 1 | 3/15 | herbalist | 21.82 | +41.3 ± 7.0 | +6.9 | 0.32 | 1.2308 | +2.4 | 3.99 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 26.73 | +38.8 ± 7.4 | +6.5 | 0.24 | 0.9231 | +2.3 | 3.63 |
| Helmeted Otter | common | 0 | 2/11 | helmet | 15.83 | +43.0 ± 6.8 | +7.2 | 0.45 | 1.7308 | +2.3 | 3.87 |
| Glass Golem | rare | 1 | 8/5 | - | 22.91 | +40.0 ± 7.6 | +6.7 | 0.29 | 1.1154 | +2.2 | 3.46 |
| Lantern Bearer | uncommon | 0 | 2/7 | flying, illuminate | 16.86 | +42.3 ± 7.1 | +7.0 | 0.42 | 1.6154 | +2.2 | 3.64 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 19.75 | +41.0 ± 7.1 | +6.8 | 0.35 | 1.3462 | +2.2 | 3.6 |
| Irradiated Axolotl | uncommon | 1 | 4/11 | triggers | 20.79 | +40.5 ± 7.2 | +6.8 | 0.32 | 1.2308 | +2.2 | 3.55 |
| Dung Beetle | common | 0 | 1/5 | decay | 12.88 | +43.5 ± 6.9 | +7.2 | 0.56 | 2.1538 | +2.1 | 3.65 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 22.65 | +39.5 ± 7.2 | +6.6 | 0.29 | 1.1154 | +2.1 | 3.47 |
| Otter Angler | common | 0 | 1/11 | tide, triggers | 15.83 | +42.3 ± 7.1 | +7.0 | 0.44 | 1.6923 | +2.1 | 3.5 |
| Magma Wraith | uncommon | 1 | 1/8 | evasive, fireArrow | 22.23 | +39.3 ± 7.2 | +6.5 | 0.29 | 1.1154 | +2.1 | 3.38 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 15.98 | +41.8 ± 6.8 | +7.0 | 0.44 | 1.6923 | +2.1 | 3.54 |
| Sunthroat Courier | common | 0 | 2/6 | espritHp, flying | 16.15 | +41.5 ± 7.0 | +6.9 | 0.43 | 1.6538 | +2.0 | 3.43 |
| Otter Lantern Bearer | uncommon | 0 | 2/12 | illuminate | 16.86 | +41.0 ± 6.8 | +6.8 | 0.41 | 1.5769 | +2.0 | 3.42 |
| Echo Screecher | rare | 1 | 2/8 | flying, nocturnal, onReadyDamage | 20.79 | +39.3 ± 7.3 | +6.5 | 0.31 | 1.1923 | +2.0 | 3.15 |
| Fawn Scout | rare | 0 | 2/8 | canopyCover, keenEye | 16.19 | +41.0 ± 7.0 | +6.8 | 0.42 | 1.6154 | +1.9 | 3.27 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 27.97 | +36.0 ± 7.2 | +6.0 | 0.21 | 0.8077 | +1.9 | 3.11 |
| Nutria Reedcutter | common | 0 | 2/9 | triggers | 18.67 | +39.8 ± 7.0 | +6.6 | 0.35 | 1.3462 | +1.9 | 3.2 |
| Bee Forager | starter | 0 | 0/5 | flying, swarm, triggers | 10.4 | +42.8 ± 7.1 | +7.1 | 0.69 | 2.6538 | +1.8 | 3.02 |
| Dhole Runner | common | 1 | 2/11 | pack | 19.96 | +38.8 ± 7.4 | +6.5 | 0.32 | 1.2308 | +1.8 | 2.9 |
| Raven Scout | rare | 0 | 2/5 | flying | 14.83 | +40.8 ± 7.1 | +6.8 | 0.46 | 1.7692 | +1.8 | 3 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 12.88 | +41.5 ± 6.8 | +6.9 | 0.54 | 2.0769 | +1.8 | 3.09 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 18.67 | +39.0 ± 7.2 | +6.5 | 0.35 | 1.3462 | +1.8 | 2.91 |
| Rivergate Recruit | common | 0 | 2/12 | - | 16.62 | +39.8 ± 6.9 | +6.6 | 0.40 | 1.5385 | +1.8 | 3.01 |
| Hush-Wing Spy | common | 0 | 3/3 | flying, stealth | 15.83 | +40.0 ± 7.3 | +6.7 | 0.42 | 1.6154 | +1.8 | 2.8 |
| Porcupine Roller | common | 0 | 3/3 | thorns | 14.33 | +40.5 ± 7.1 | +6.8 | 0.47 | 1.8077 | +1.7 | 2.87 |
| Gannet Nestweaver | common | 0 | 1/7 | flying, triggers | 14.79 | +40.3 ± 6.8 | +6.7 | 0.45 | 1.7308 | +1.7 | 2.99 |
| Border Collie | uncommon | 1 | 3/15 | converge | 21.2 | +37.3 ± 7.1 | +6.2 | 0.29 | 1.1154 | +1.7 | 2.74 |
| Mist-net Otter | common | 0 | 2/10 | reach, web | 15.83 | +39.3 ± 7.3 | +6.5 | 0.41 | 1.5769 | +1.6 | 2.61 |
| Archerfish | uncommon | 1 | 3/6 | acidBolt | 19.55 | +37.5 ± 7.1 | +6.3 | 0.32 | 1.2308 | +1.6 | 2.63 |
| Mountain Hare | common | 0 | 2/4 | evasive, frostbite | 12.88 | +40.3 ± 6.9 | +6.7 | 0.52 | 2 | +1.6 | 2.69 |
| Hedgehog Scout | common | 0 | 1/10 | thorns | 13.92 | +39.8 ± 6.8 | +6.6 | 0.48 | 1.8462 | +1.6 | 2.74 |
| Birdlime Dauber | uncommon | 1 | 2/11 | reach, strangle | 19.13 | +37.5 ± 7.1 | +6.3 | 0.33 | 1.2692 | +1.6 | 2.58 |
| Truffle Piglet | uncommon | 1 | 2/9 | onReadyGold | 19.55 | +37.3 ± 6.8 | +6.2 | 0.32 | 1.2308 | +1.6 | 2.66 |
| Ant Warrior | uncommon | 0 | 2/4 | rage, swarm | 13.92 | +39.5 ± 7.2 | +6.6 | 0.47 | 1.8077 | +1.5 | 2.49 |
| Snow Ermine | common | 0 | 2/4 | evasive, frost | 14.33 | +39.3 ± 6.9 | +6.5 | 0.46 | 1.7692 | +1.5 | 2.59 |
| Thorny Devil | common | 1 | 1/20 | thorns | 24.66 | +34.8 ± 7.3 | +5.8 | 0.23 | 0.8846 | +1.5 | 2.39 |
| The Contradiction | epic | 1 | 2/16 | rage, regen | 30.24 | +32.3 ± 7.4 | +5.4 | 0.18 | 0.6923 | +1.5 | 2.29 |
| Stable Colt | uncommon | 0 | 2/9 | - | 16.13 | +38.0 ± 6.9 | +6.3 | 0.39 | 1.5 | +1.4 | 2.46 |
| Frost Hare Sprinter | common | 0 | 2/5 | evasive | 14.33 | +38.8 ± 6.7 | +6.5 | 0.45 | 1.7308 | +1.4 | 2.51 |
| Woodland Brawler | veryrare | 1 | 3/14 | - | 25.52 | +34.0 ± 7.0 | +5.7 | 0.22 | 0.8462 | +1.4 | 2.39 |
| Shell-Cracker | common | 0 | 2/9 | - | 13.09 | +39.0 ± 6.9 | +6.5 | 0.50 | 1.9231 | +1.4 | 2.38 |
| Tunnel Ant | rare | 1 | 2/9 | ambush, swarm, swarmN | 19.13 | +36.5 ± 7.3 | +6.1 | 0.32 | 1.2308 | +1.4 | 2.22 |
| Mangrove Manatee | rare | 1 | 7/7 | guardian, regen, tide | 29.26 | +32.3 ± 6.9 | +5.4 | 0.18 | 0.6923 | +1.4 | 2.35 |
| Ferry Toll-Frog | common | 0 | 2/7 | triggers | 12.47 | +39.0 ± 6.9 | +6.5 | 0.52 | 2 | +1.4 | 2.31 |
| Abyss Lantern Squid | uncommon | 1 | 3/16 | shock, tide | 24.66 | +34.0 ± 7.4 | +5.7 | 0.23 | 0.8846 | +1.4 | 2.17 |
| Spitting Spider | uncommon | 1 | 4/6 | poisonBolt | 20.99 | +35.5 ± 7.0 | +5.9 | 0.28 | 1.0769 | +1.4 | 2.27 |
| Bombardier Beetle | uncommon | 1 | 3/10 | rocket | 23.42 | +34.5 ± 6.7 | +5.8 | 0.25 | 0.9615 | +1.4 | 2.36 |
| Lyrebird Mimic | uncommon | 1 | 4/8 | confuse | 19.55 | +36.0 ± 7.0 | +6.0 | 0.31 | 1.1923 | +1.3 | 2.26 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 14.79 | +38.0 ± 6.9 | +6.3 | 0.43 | 1.6538 | +1.3 | 2.3 |
| Apollo Butterfly | uncommon | 0 | 1/8 | flying, thorns | 17.27 | +36.8 ± 6.7 | +6.1 | 0.35 | 1.3462 | +1.3 | 2.3 |
| Petal Fletcher | common | 0 | 2/2 | arrow, flying | 12.47 | +38.5 ± 6.8 | +6.4 | 0.51 | 1.9615 | +1.3 | 2.23 |
| Wound Reaver | rare | 1 | 1/14 | bleed, rupture | 22.23 | +34.5 ± 7.3 | +5.8 | 0.26 | 1 | +1.3 | 2.05 |
| Fox Kit | common | 0 | 2/9 | - | 13.52 | +38.0 ± 6.9 | +6.3 | 0.47 | 1.8077 | +1.3 | 2.15 |
| Pyrenean Desman | uncommon | 0 | 2/10 | tide | 16.03 | +36.8 ± 6.8 | +6.1 | 0.38 | 1.4615 | +1.2 | 2.12 |
| Cone-cutter Squirrel | common | 0 | 2/6 | triggers | 17.69 | +35.8 ± 6.6 | +6.0 | 0.34 | 1.3077 | +1.2 | 2.07 |
| Coral Polyp Colony | common | 0 | 0/9 | onReadyGold, tide | 16.24 | +36.0 ± 6.8 | +6.0 | 0.37 | 1.4231 | +1.1 | 1.92 |
| Snow Bunting Archer | uncommon | 1 | 2/6 | iceArrow | 20.99 | +34.0 ± 6.8 | +5.7 | 0.27 | 1.0385 | +1.1 | 1.91 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 20.37 | +34.3 ± 7.0 | +5.7 | 0.28 | 1.0769 | +1.1 | 1.86 |
| Dawn Bellringer | uncommon | 1 | 3/3 | diurnal, diurnalHp, flying | 16.1 | +36.0 ± 7.5 | +6.0 | 0.37 | 1.4231 | +1.1 | 1.73 |
| Marsh Wisp | common | 0 | 2/6 | remember, triggers | 14.79 | +36.5 ± 6.9 | +6.1 | 0.41 | 1.5769 | +1.1 | 1.85 |
| Conch Crawler | common | 0 | 2/2 | shell, shield, tide | 14.79 | +36.5 ± 7.1 | +6.1 | 0.41 | 1.5769 | +1.1 | 1.8 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 18.67 | +34.8 ± 7.7 | +5.8 | 0.31 | 1.1923 | +1.1 | 1.64 |
| Cave Olm | common | 0 | 1/11 | regen | 16.24 | +35.8 ± 6.6 | +6.0 | 0.37 | 1.4231 | +1.1 | 1.89 |
| Chipmunk Hoarder | common | 0 | 2/5 | onReadyGold | 16.24 | +35.5 ± 6.8 | +5.9 | 0.36 | 1.3846 | +1.0 | 1.79 |
| River Carp | starter | 0 | 2/10 | - | 14.45 | +36.3 ± 6.8 | +6.0 | 0.42 | 1.6154 | +1.0 | 1.78 |
| Duck Paddler | starter | 0 | 2/10 | - | 14.45 | +36.3 ± 6.8 | +6.0 | 0.42 | 1.6154 | +1.0 | 1.78 |
| Pack Mule | common | 0 | 1/11 | bounty | 15.57 | +35.8 ± 6.9 | +6.0 | 0.38 | 1.4615 | +1.0 | 1.75 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 19.7 | +34.0 ± 7.3 | +5.7 | 0.29 | 1.1154 | +1.0 | 1.65 |
| Net Thrower | uncommon | 1 | 3/11 | boomerang | 19.13 | +34.3 ± 7.0 | +5.7 | 0.30 | 1.1538 | +1.0 | 1.71 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 22.85 | +32.8 ± 7.1 | +5.5 | 0.24 | 0.9231 | +1.0 | 1.7 |
| Glimmer Spider | uncommon | 1 | 3/11 | poison | 20.99 | +33.5 ± 7.0 | +5.6 | 0.27 | 1.0385 | +1.0 | 1.72 |
| Pinecone Sapper | common | 0 | 0/13 | explode | 17.69 | +34.8 ± 6.7 | +5.8 | 0.33 | 1.2692 | +1.0 | 1.75 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 19.94 | +33.8 ± 7.0 | +5.6 | 0.28 | 1.0769 | +1.0 | 1.69 |
| Glass Changeling | rare | 1 | 3/7 | changeling, flying | 21.82 | +33.0 ± 6.8 | +5.5 | 0.25 | 0.9615 | +1.0 | 1.72 |
| Burrow Rabbit | starter | 0 | 2/10 | - | 14.45 | +35.8 ± 6.8 | +6.0 | 0.41 | 1.5769 | +0.9 | 1.65 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 15.83 | +35.0 ± 6.6 | +5.8 | 0.37 | 1.4231 | +0.9 | 1.63 |
| Trebuchet Crew | rare | 2 | 0/24 | siege, volley | 34.84 | +27.0 ± 6.7 | +4.5 | 0.13 | 0.5 | +0.9 | 1.54 |
| Box Turtle | common | 0 | 2/7 | cower | 11.44 | +36.5 ± 7.0 | +6.1 | 0.53 | 2.0385 | +0.9 | 1.47 |
| Parrotfish | common | 0 | 2/9 | pierce, tide | 16.24 | +34.5 ± 6.9 | +5.8 | 0.35 | 1.3462 | +0.9 | 1.47 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 15.16 | +34.8 ± 6.9 | +5.8 | 0.38 | 1.4615 | +0.8 | 1.42 |
| Sandfish | common | 1 | 3/11 | invisible | 19.96 | +32.8 ± 7.1 | +5.5 | 0.27 | 1.0385 | +0.8 | 1.38 |
| Fire Drake Hatchling | heroic | 2 | 6/11 | fireArrow | 33.96 | +27.0 ± 6.7 | +4.5 | 0.13 | 0.5 | +0.8 | 1.43 |
| Chapel Tortoise | uncommon | 0 | 1/10 | prayer, prayerWard | 20.17 | +32.5 ± 6.6 | +5.4 | 0.27 | 1.0385 | +0.8 | 1.42 |
| Muskrat Reedgatherer | common | 0 | 1/8 | stockpile | 14.79 | +34.8 ± 6.7 | +5.8 | 0.39 | 1.5 | +0.8 | 1.4 |
| Pelican Diver | rare | 1 | 2/9 | flying, triggers | 20.58 | +32.3 ± 7.1 | +5.4 | 0.26 | 1 | +0.8 | 1.31 |
| Star-nosed Mole | common | 0 | 5/5 | purblind | 13.09 | +35.3 ± 7.2 | +5.9 | 0.45 | 1.7308 | +0.8 | 1.28 |
| Roadrunner Courier | common | 1 | 3/7 | haste | 16.6 | +33.8 ± 7.1 | +5.6 | 0.34 | 1.3077 | +0.8 | 1.27 |
| Testudo Tortoise | rare | 2 | 4/12 | armor, guardian | 30.45 | +28.0 ± 6.8 | +4.7 | 0.15 | 0.5769 | +0.8 | 1.3 |
| Duckling Squadron | common | 0 | 1/9 | flying | 16.73 | +33.3 ± 6.5 | +5.5 | 0.33 | 1.2692 | +0.7 | 1.25 |
| Owl Nightwatch | common | 1 | 1/5 | flying, nocturnal, stealth | 18.51 | +32.5 ± 7.1 | +5.4 | 0.29 | 1.1154 | +0.7 | 1.15 |
| Alligator Gar | rare | 1 | 5/5 | armor, bleed, tide | 24.04 | +30.3 ± 7.3 | +5.0 | 0.21 | 0.8077 | +0.7 | 1.09 |
| Tasmanian Devil | uncommon | 1 | 1/11 | berserk | 19.55 | +31.5 ± 7.0 | +5.3 | 0.27 | 1.0385 | +0.6 | 0.99 |
| Pumice Beetle | uncommon | 1 | 3/12 | triggers | 20.99 | +30.8 ± 6.8 | +5.1 | 0.24 | 0.9231 | +0.6 | 0.99 |
| Trash Panda Trickster | common | 0 | 2/4 | bounty, nocturnal | 12.88 | +34.0 ± 7.0 | +5.7 | 0.44 | 1.6923 | +0.5 | 0.92 |
| Fire Salamander | uncommon | 1 | 3/7 | spitfire | 22.03 | +30.3 ± 6.4 | +5.0 | 0.23 | 0.8846 | +0.5 | 1.02 |
| Kinkajou Lurker | uncommon | 1 | 4/6 | nocturnal, nocturnalGrant | 22.26 | +30.0 ± 7.1 | +5.0 | 0.22 | 0.8462 | +0.5 | 0.86 |
| Snow Owl Sentinel | superrare | 1 | 4/4 | expose, flying, nocturnal | 25.54 | +28.5 ± 7.3 | +4.8 | 0.19 | 0.7308 | +0.5 | 0.81 |
| Land Tiller | common | 0 | 1/6 | onReadyGold | 16.19 | +32.3 ± 6.6 | +5.4 | 0.33 | 1.2692 | +0.5 | 0.87 |
| Mallard Halberdier | rare | 1 | 4/8 | pierce, reach | 24.09 | +28.7 ± 6.9 | +4.8 | 0.20 | 0.7692 | +0.4 | 0.75 |
| Beaver Lumberjack | common | 0 | 4/4 | stockpile | 14.79 | +32.5 ± 6.8 | +5.4 | 0.37 | 1.4231 | +0.4 | 0.74 |
| Shimmerwing Stag | veryrare | 1 | 2/13 | evasive | 26.73 | +27.5 ± 6.8 | +4.6 | 0.17 | 0.6538 | +0.4 | 0.71 |
| Bramblewood Lynx | rare | 1 | 5/7 | - | 21.61 | +29.5 ± 7.2 | +4.9 | 0.23 | 0.8846 | +0.4 | 0.66 |
| Acorn Chipmunk | starter | 0 | 3/4 | - | 10.92 | +33.5 ± 6.7 | +5.6 | 0.51 | 1.9615 | +0.3 | 0.58 |
| Inkcloud Squid | common | 0 | 1/8 | evasive, tide | 17.48 | +30.8 ± 6.5 | +5.1 | 0.29 | 1.1154 | +0.3 | 0.59 |
| Terrier Pup | common | 0 | 2/8 | - | 12.01 | +33.0 ± 6.7 | +5.5 | 0.46 | 1.7692 | +0.3 | 0.56 |
| Bramble Sprout | common | 0 | 2/8 | - | 12.01 | +33.0 ± 6.7 | +5.5 | 0.46 | 1.7692 | +0.3 | 0.56 |
| Mangrove Monitor | common | 1 | 3/13 | - | 19.44 | +29.8 ± 6.7 | +5.0 | 0.26 | 1 | +0.3 | 0.51 |
| Kittiwake Flock | common | 0 | 1/3 | flying, swarm | 11.44 | +33.0 ± 6.8 | +5.5 | 0.48 | 1.8462 | +0.3 | 0.5 |
| Cricket Drummer | common | 0 | 2/8 | - | 12.22 | +32.5 ± 6.7 | +5.4 | 0.44 | 1.6923 | +0.3 | 0.46 |
| Pond Trout | starter | 0 | 3/4 | - | 10.92 | +33.0 ± 6.7 | +5.5 | 0.50 | 1.9231 | +0.3 | 0.44 |
| Meadow Rabbit | starter | 0 | 4/2 | - | 10.92 | +33.0 ± 7.0 | +5.5 | 0.50 | 1.9231 | +0.3 | 0.42 |
| Field Mouse | common | 0 | 2/8 | - | 12.01 | +32.5 ± 6.7 | +5.4 | 0.45 | 1.7308 | +0.2 | 0.42 |
| Dormouse | common | 0 | 2/8 | - | 12.01 | +32.5 ± 6.7 | +5.4 | 0.45 | 1.7308 | +0.2 | 0.42 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 17.27 | +30.3 ± 6.5 | +5.0 | 0.29 | 1.1154 | +0.2 | 0.4 |
| Pond Duck | starter | 0 | 3/4 | - | 10.92 | +32.5 ± 6.7 | +5.4 | 0.50 | 1.9231 | +0.2 | 0.3 |
| Nectar Sipper | common | 0 | 2/4 | flying | 12.72 | +31.8 ± 6.7 | +5.3 | 0.42 | 1.6154 | +0.2 | 0.28 |
| Caustic Scorpion | uncommon | 1 | 1/18 | poison | 25.7 | +26.3 ± 7.3 | +4.4 | 0.17 | 0.6538 | +0.1 | 0.23 |
| Cottontail | starter | 0 | 4/2 | - | 10.92 | +32.3 ± 6.9 | +5.4 | 0.49 | 1.8846 | +0.1 | 0.22 |
| Riptide Eel | uncommon | 1 | 9/6 | reload, tide | 19.55 | +28.5 ± 7.5 | +4.8 | 0.24 | 0.9231 | +0.1 | 0.14 |
| Otter Paddler | starter | 0 | 3/4 | - | 10.92 | +32.0 ± 6.6 | +5.3 | 0.49 | 1.8846 | +0.1 | 0.14 |
| Chipmunk Skirmisher | common | 0 | 2/8 | - | 12.01 | +31.5 ± 6.6 | +5.3 | 0.44 | 1.6923 | +0.1 | 0.12 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 16.24 | +29.8 ± 6.9 | +5.0 | 0.31 | 1.1923 | +0.1 | 0.12 |
| Ember Revenant | epic | 2 | 4/15 | pierce, undead | 29.67 | +24.0 ± 6.4 | +4.0 | 0.13 | 0.5 | +0.0 | 0.06 |
| Weaver Bird | common | 1 | 3/6 | tangle | 16.6 | +29.3 ± 6.9 | +4.9 | 0.29 | 1.1154 | +0.0 | 0.02 |
| Polar Bear | veryrare | 1 | 2/17 | ambush, hibernate | 27.56 | +24.8 ± 7.3 | +4.1 | 0.15 | 0.5769 | +0.0 | 0.02 |
| Otter Guard | uncommon | 1 | 3/6 | arrow | 18.1 | +28.5 ± 7.1 | +4.8 | 0.26 | 1 | -0.0 | -0.02 |
| Leathery Egg | uncommon | 0 | 0/3 | - | 73.42 | +5.5 ± 4.4 | +0.9 | 0.01 | 0.0385 | -0.1 | -0.19 |
| Goose Sentry | rare | 1 | 3/10 | sentry, taunt | 24.09 | +25.5 ± 6.6 | +4.3 | 0.18 | 0.6923 | -0.1 | -0.18 |
| Mouse Sapper | common | 1 | 3/11 | siege | 18.51 | +27.5 ± 6.8 | +4.6 | 0.25 | 0.9615 | -0.1 | -0.26 |
| Bogfire Newt | uncommon | 0 | 1/10 | detonate, poison | 16.03 | +28.5 ± 6.5 | +4.8 | 0.30 | 1.1538 | -0.1 | -0.27 |
| Ant Hill | common | 2 | 0/22 | triggers | 28.02 | +23.3 ± 6.7 | +3.9 | 0.14 | 0.5385 | -0.2 | -0.35 |
| Meadow Frog | common | 0 | 2/6 | - | 12.01 | +29.8 ± 6.5 | +5.0 | 0.41 | 1.5769 | -0.2 | -0.4 |
| Snowshoe Hare | common | 0 | 1/7 | evasive | 14.33 | +28.7 ± 6.3 | +4.8 | 0.33 | 1.2692 | -0.2 | -0.43 |
| Meerkat Wayfarer | common | 0 | 2/5 | inspiring, reach | 14.79 | +28.5 ± 6.7 | +4.8 | 0.32 | 1.2308 | -0.2 | -0.42 |
| Honey Bee | starter | 0 | 2/3 | flying | 10.61 | +30.0 ± 6.5 | +5.0 | 0.47 | 1.8077 | -0.3 | -0.49 |
| Riverside Peddler | common | 0 | 1/7 | bounty | 12.47 | +29.3 ± 6.6 | +4.9 | 0.39 | 1.5 | -0.3 | -0.48 |
| Bog Leech | uncommon | 0 | 1/8 | bleed | 12.68 | +29.0 ± 6.6 | +4.8 | 0.38 | 1.4615 | -0.3 | -0.54 |
| Mirror Moth | rare | 1 | 2/5 | evasive, flying, reflect | 21.82 | +25.3 ± 6.9 | +4.2 | 0.19 | 0.7308 | -0.3 | -0.51 |
| Quillguard | rare | 1 | 2/22 | - | 26.76 | +22.8 ± 7.3 | +3.8 | 0.14 | 0.5385 | -0.4 | -0.61 |
| Sunspire Envoy | rare | 1 | 1/8 | esprit, flying | 20.17 | +25.3 ± 6.9 | +4.2 | 0.21 | 0.8077 | -0.4 | -0.7 |
| Fathom Leviathan | legendary | 4 | 5/25 | supreme, tide, tsunami, wave | 50.5 | +12.8 ± 6.1 | +2.1 | 0.04 | 0.1538 | -0.4 | -0.82 |
| Cobalt Fledgling | starter | 0 | 2/3 | flying | 10.61 | +29.0 ± 6.4 | +4.8 | 0.46 | 1.7692 | -0.4 | -0.81 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 25.9 | +22.8 ± 6.7 | +3.8 | 0.15 | 0.5769 | -0.4 | -0.77 |
| Crimson Recruit | starter | 0 | 3/1 | flying | 10.61 | +28.7 ± 6.6 | +4.8 | 0.45 | 1.7308 | -0.5 | -0.86 |
| Reefback Turtle | veryrare | 2 | 2/20 | guardian, shell | 29.42 | +21.0 ± 6.6 | +3.5 | 0.12 | 0.4615 | -0.5 | -0.88 |
| Rabbit Kit | common | 0 | 2/3 | evasive | 11.44 | +28.2 ± 6.2 | +4.7 | 0.41 | 1.5769 | -0.5 | -0.94 |
| Robin Redbreast | uncommon | 0 | 2/2 | diurnal, flying | 12.93 | +27.5 ± 6.8 | +4.6 | 0.35 | 1.3462 | -0.5 | -0.92 |
| Bramble Hoglet | common | 0 | 1/9 | regen | 13.92 | +27.0 ± 6.3 | +4.5 | 0.32 | 1.2308 | -0.5 | -1.02 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 28.38 | +21.0 ± 6.3 | +3.5 | 0.12 | 0.4615 | -0.6 | -1.05 |
| Den Bundle | uncommon | 0 | 0/3 | - | 65.01 | +6.0 ± 4.3 | +1.0 | 0.02 | 0.0769 | -0.6 | -1.53 |
| Pincushion Urchin | common | 0 | 3/3 | thorns, tide | 14.79 | +26.5 ± 6.7 | +4.4 | 0.30 | 1.1538 | -0.6 | -1 |
| Marsh Harrier | uncommon | 1 | 3/5 | flying, predator | 18.31 | +25.0 ± 6.5 | +4.2 | 0.23 | 0.8846 | -0.6 | -1.05 |
| Whip Spider | uncommon | 1 | 3/7 | bleed, sonar | 19.55 | +24.5 ± 6.7 | +4.1 | 0.21 | 0.8077 | -0.6 | -1.01 |
| Stag Knight | common | 2 | 5/16 | - | 26.33 | +21.5 ± 6.3 | +3.6 | 0.14 | 0.5385 | -0.6 | -1.16 |
| Ant Scout | starter | 0 | 1/5 | swarm | 10.4 | +28.0 ± 6.5 | +4.7 | 0.45 | 1.7308 | -0.6 | -1.12 |
| Crimson Wing Duelist Cadet | starter | 0 | 2/4 | diurnal, flying | 15.09 | +26.0 ± 6.5 | +4.3 | 0.29 | 1.1154 | -0.6 | -1.16 |
| Cobalt Talon Skirmisher | starter | 0 | 2/4 | diurnal, flying | 15.09 | +26.0 ± 6.5 | +4.3 | 0.29 | 1.1154 | -0.6 | -1.16 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 50.29 | +11.5 ± 5.9 | +1.9 | 0.04 | 0.1538 | -0.7 | -1.3 |
| Thorn Shrike | rare | 1 | 3/3 | bleed, flying | 20.58 | +23.5 ± 6.4 | +3.9 | 0.19 | 0.7308 | -0.7 | -1.24 |
| Grass Viper | uncommon | 0 | 1/8 | poison | 13.5 | +26.3 ± 6.5 | +4.4 | 0.32 | 1.2308 | -0.7 | -1.24 |
| Soldier Ant | common | 0 | 2/5 | swarm | 14.79 | +25.8 ± 6.2 | +4.3 | 0.29 | 1.1154 | -0.7 | -1.32 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 24.87 | +21.5 ± 6.3 | +3.6 | 0.14 | 0.5385 | -0.7 | -1.34 |
| Swordbill Challenger | rare | 0 | 1/6 | counterattack, flying, taunt | 17.89 | +24.3 ± 6.3 | +4.0 | 0.23 | 0.8846 | -0.7 | -1.37 |
| Field Vole | common | 0 | 1/6 | swarm | 11.44 | +26.8 ± 6.6 | +4.5 | 0.39 | 1.5 | -0.8 | -1.34 |
| House Cat | common | 0 | 3/3 | - | 12.01 | +26.5 ± 6.3 | +4.4 | 0.37 | 1.4231 | -0.8 | -1.42 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 11.44 | +26.5 ± 6.6 | +4.4 | 0.39 | 1.5 | -0.8 | -1.41 |
| Snail Mail | uncommon | 0 | 0/1 | armor, triggers | 22.39 | +22.0 ± 6.1 | +3.7 | 0.16 | 0.6154 | -0.8 | -1.55 |
| Goliath Broodmother | legendary | 3 | 4/24 | inspiring, onDeathSpawn | 42.07 | +14.0 ± 5.9 | +2.3 | 0.06 | 0.2308 | -0.8 | -1.61 |
| Mountain Goat Climber | uncommon | 0 | 1/6 | evasive | 16.81 | +24.3 ± 5.9 | +4.0 | 0.24 | 0.9231 | -0.8 | -1.6 |
| Cinder Stoker | common | 0 | 1/11 | heat | 14.33 | +25.3 ± 6.2 | +4.2 | 0.29 | 1.1154 | -0.8 | -1.54 |
| Snow Leopard | veryrare | 1 | 2/16 | mountainClimber | 24.51 | +21.0 ± 6.6 | +3.5 | 0.14 | 0.5385 | -0.8 | -1.46 |
| Crossed-Eyes | starter | 0 | 3/3 | - | 10.92 | +26.5 ± 6.3 | +4.4 | 0.40 | 1.5385 | -0.8 | -1.55 |
| Rivergate Drummer | uncommon | 0 | 3/3 | kinRally | 16.86 | +24.0 ± 6.4 | +4.0 | 0.24 | 0.9231 | -0.8 | -1.54 |
| Quillback Elder | common | 2 | 5/5 | armor | 25.08 | +20.5 ± 6.5 | +3.4 | 0.14 | 0.5385 | -0.9 | -1.55 |
| Otter Scout | rare | 0 | 1/13 | - | 15.27 | +24.5 ± 6.3 | +4.1 | 0.27 | 1.0385 | -0.9 | -1.63 |
| Grey Seal Bull | uncommon | 1 | 4/11 | guardian, tide | 22.39 | +21.5 ± 6.5 | +3.6 | 0.16 | 0.6154 | -0.9 | -1.62 |
| Hummingbird Needler | uncommon | 0 | 1/3 | bleed, flying, pierce | 13.5 | +25.0 ± 6.3 | +4.2 | 0.31 | 1.1923 | -0.9 | -1.67 |
| War Elephant | superrare | 3 | 0/28 | armor, arrow, arrowCount | 40.01 | +14.2 ± 5.9 | +2.4 | 0.06 | 0.2308 | -0.9 | -1.79 |
| Plains Zebra | uncommon | 0 | 1/6 | evasive | 15.36 | +24.3 ± 5.9 | +4.0 | 0.26 | 1 | -0.9 | -1.8 |
| Electric Ray | uncommon | 1 | 3/8 | charge | 20.17 | +22.3 ± 6.5 | +3.7 | 0.18 | 0.6923 | -0.9 | -1.63 |
| Eagle Sharpshooter | common | 2 | 2/6 | arrow, diurnal, flying | 24.09 | +20.5 ± 6.5 | +3.4 | 0.14 | 0.5385 | -0.9 | -1.68 |
| Otter Netmender | common | 0 | 1/8 | armor | 12.47 | +25.3 ± 6.2 | +4.2 | 0.34 | 1.3077 | -0.9 | -1.77 |
| Taiga Lynx | rare | 1 | 2/8 | evasive | 19.08 | +22.5 ± 6.7 | +3.8 | 0.20 | 0.7692 | -0.9 | -1.64 |
| Truce Heron | rare | 1 | 2/11 | flying, guardian | 24.04 | +20.5 ± 6.3 | +3.4 | 0.14 | 0.5385 | -0.9 | -1.75 |
| Woodcock Lookout | common | 0 | 1/7 | crepuscular, keenEye | 14.79 | +24.0 ± 6.1 | +4.0 | 0.27 | 1.0385 | -1.0 | -1.92 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 18.31 | +22.5 ± 6.7 | +3.8 | 0.20 | 0.7692 | -1.0 | -1.76 |
| Fire Ant Raft | uncommon | 1 | 2/7 | poison, swarm, tide | 18.31 | +22.5 ± 7.0 | +3.8 | 0.20 | 0.7692 | -1.0 | -1.69 |
| Yeti | common | 3 | 5/29 | scare | 44.35 | +11.8 ± 5.8 | +2.0 | 0.04 | 0.1538 | -1.0 | -2.06 |
| Ash Imp | common | 0 | 2/7 | onSpawnDevilry, sacrifice | 15.98 | +23.3 ± 6.6 | +3.9 | 0.24 | 0.9231 | -1.0 | -1.81 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 20.99 | +21.3 ± 6.6 | +3.5 | 0.17 | 0.6538 | -1.0 | -1.82 |
| Dhole Matriarch | veryrare | 2 | 4/22 | packLeader | 30.04 | +17.5 ± 6.4 | +2.9 | 0.10 | 0.3846 | -1.0 | -1.9 |
| Riverbed Diver | uncommon | 1 | 3/6 | evasive | 19.13 | +21.8 ± 6.5 | +3.6 | 0.19 | 0.7308 | -1.1 | -1.92 |
| Hawthorn Shieldbug | common | 1 | 2/12 | armor | 18.51 | +22.0 ± 6.6 | +3.7 | 0.20 | 0.7692 | -1.1 | -1.89 |
| Sleepless Shrew | common | 0 | 2/7 | wakeful | 16.24 | +23.0 ± 6.2 | +3.8 | 0.24 | 0.9231 | -1.1 | -2.02 |
| Cypress Root Lurker | common | 1 | 4/11 | guardian | 20.94 | +21.0 ± 6.6 | +3.5 | 0.17 | 0.6538 | -1.1 | -1.92 |
| Gorge Wyrm | common | 3 | 2/26 | earthquake, sweep | 38.92 | +13.5 ± 5.8 | +2.3 | 0.06 | 0.2308 | -1.1 | -2.21 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake | 53.8 | +7.2 ± 5.7 | +1.2 | 0.02 | 0.0769 | -1.1 | -2.33 |
| Skull Vulture | uncommon | 1 | 3/3 | daunt, flying, nocturnal | 20.99 | +20.5 ± 6.6 | +3.4 | 0.16 | 0.6154 | -1.1 | -2.04 |
| Riverwing Envoy | uncommon | 0 | 1/6 | esprit | 12.47 | +24.0 ± 6.2 | +4.0 | 0.32 | 1.2308 | -1.1 | -2.16 |
| Rivergate Tribune | heroic | 3 | 4/18 | armor, kinship | 33.96 | +15.3 ± 6.0 | +2.5 | 0.07 | 0.2692 | -1.1 | -2.23 |
| Barnacle Bulwark | rare | 2 | 2/21 | armor, guardian | 28.38 | +17.5 ± 6.5 | +2.9 | 0.10 | 0.3846 | -1.1 | -2.05 |
| Lone Grey Wolf | veryrare | 1 | 2/9 | loneWolf | 27.56 | +17.8 ± 5.9 | +3.0 | 0.11 | 0.4231 | -1.2 | -2.3 |
| Warhorse Charger | common | 2 | 4/19 | - | 27.85 | +17.5 ± 6.1 | +2.9 | 0.10 | 0.3846 | -1.2 | -2.28 |
| River Bundle | uncommon | 0 | 0/3 | - | 57.14 | +5.5 ± 4.4 | +0.9 | 0.02 | 0.0769 | -1.2 | -3.13 |
| Otter Kit | starter | 0 | 2/5 | - | 10.92 | +24.3 ± 6.3 | +4.0 | 0.37 | 1.4231 | -1.2 | -2.28 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 19.96 | +20.5 ± 6.4 | +3.4 | 0.17 | 0.6538 | -1.2 | -2.23 |
| Woodpecker Sapper | uncommon | 1 | 4/4 | perforate | 19.55 | +20.5 ± 7.0 | +3.4 | 0.17 | 0.6538 | -1.2 | -2.08 |
| Worker Ant | starter | 0 | 1/1 | triggers | 10.4 | +24.3 ± 6.1 | +4.0 | 0.39 | 1.5 | -1.3 | -2.41 |
| Berserker Boar | common | 2 | 3/9 | rage | 21.2 | +19.8 ± 6.4 | +3.3 | 0.16 | 0.6154 | -1.3 | -2.33 |
| Reef Shark | common | 2 | 6/15 | tide | 29.47 | +16.3 ± 6.1 | +2.7 | 0.09 | 0.3462 | -1.3 | -2.45 |
| Dominion Nestguard | common | 1 | 4/4 | flying | 18.46 | +20.8 ± 6.4 | +3.5 | 0.19 | 0.7308 | -1.3 | -2.35 |
| Coral Reef Shark | uncommon | 2 | 5/10 | tide | 22.23 | +19.0 ± 5.9 | +3.2 | 0.14 | 0.5385 | -1.3 | -2.6 |
| Peak Condor | common | 1 | 4/7 | flying, reload | 17.07 | +21.0 ± 6.4 | +3.5 | 0.21 | 0.8077 | -1.3 | -2.44 |
| Ash Cloud Condor | rare | 1 | 3/3 | flying, triggers | 23.27 | +18.5 ± 6.2 | +3.1 | 0.13 | 0.5 | -1.3 | -2.51 |
| Banded Sea Krait | uncommon | 1 | 4/4 | nocturnal, venomous | 19.96 | +19.5 ± 7.3 | +3.3 | 0.16 | 0.6154 | -1.4 | -2.22 |
| Badger Trench Digger | common | 2 | 4/18 | guardian, lastStand | 28.38 | +16.0 ± 6.4 | +2.7 | 0.09 | 0.3462 | -1.4 | -2.56 |
| Fiddler Crab Swarm | common | 0 | 1/8 | crabClaws, tide | 11.85 | +22.8 ± 6.4 | +3.8 | 0.32 | 1.2308 | -1.4 | -2.56 |
| Sea Turtle Elder | common | 2 | 4/9 | armor, tide | 28.02 | +16.0 ± 6.3 | +2.7 | 0.10 | 0.3846 | -1.4 | -2.65 |
| Candle Moth | common | 0 | 1/5 | flying, prayer | 15.78 | +21.0 ± 6.1 | +3.5 | 0.22 | 0.8462 | -1.4 | -2.73 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 29.42 | +15.3 ± 5.9 | +2.5 | 0.09 | 0.3462 | -1.5 | -2.91 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 11.44 | +22.5 ± 6.1 | +3.8 | 0.33 | 1.2692 | -1.5 | -2.8 |
| Greenland Shark | rare | 1 | 1/23 | armor, carrion, tide | 31.74 | +14.2 ± 6.8 | +2.4 | 0.07 | 0.2692 | -1.5 | -2.52 |
| The Magnate Duck | epic | 4 | 2/37 | armor, bounty, hoard, king, midas | 49.67 | +6.8 ± 5.8 | +1.1 | 0.02 | 0.0769 | -1.5 | -3.02 |
| Elderhorn Monarch | common | 3 | 2/30 | onReadyGold | 40.99 | +10.3 ± 5.6 | +1.7 | 0.04 | 0.1538 | -1.5 | -3.15 |
| River Warden | rare | 2 | 4/13 | tide | 22.85 | +17.5 ± 6.3 | +2.9 | 0.13 | 0.5 | -1.5 | -2.86 |
| Alley Cat | rare | 0 | 1/1 | bleed, twinStrike | 14.54 | +20.8 ± 5.9 | +3.5 | 0.24 | 0.9231 | -1.5 | -3.05 |
| Golden Eagle Diver | uncommon | 1 | 2/2 | diurnal, flying, pounce | 15.36 | +20.3 ± 6.8 | +3.4 | 0.22 | 0.8462 | -1.6 | -2.71 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 19.55 | +18.5 ± 6.8 | +3.1 | 0.16 | 0.6154 | -1.6 | -2.74 |
| Komodo Warlord | common | 3 | 1/27 | gash, poison | 38.92 | +10.5 ± 5.8 | +1.8 | 0.04 | 0.1538 | -1.6 | -3.24 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 16.86 | +19.5 ± 6.1 | +3.3 | 0.19 | 0.7308 | -1.6 | -3.05 |
| Ash Moth | common | 1 | 1/8 | flying, nocturnal | 16.93 | +19.5 ± 6.2 | +3.3 | 0.19 | 0.7308 | -1.6 | -3.03 |
| Cave Warlord | common | 4 | 6/29 | daunt, onReadyDamage | 47.86 | +6.8 ± 5.8 | +1.1 | 0.02 | 0.0769 | -1.6 | -3.27 |
| Sand Widow | common | 2 | 2/17 | poison | 26.52 | +15.5 ± 5.9 | +2.6 | 0.10 | 0.3846 | -1.6 | -3.23 |
| Stone Turtle Warden | common | 2 | 4/4 | armor, tide | 23.63 | +16.5 ± 6.1 | +2.8 | 0.12 | 0.4615 | -1.6 | -3.12 |
| Goliath Tentacle | epic | 2 | 6/6 | sweep, tide | 35.87 | +11.5 ± 6.2 | +1.9 | 0.05 | 0.1923 | -1.6 | -3.09 |
| Marshal Tuskwell | epic | 4 | 1/26 | armor, inspiring, overwhelm, vanguard | 44.71 | +7.5 ± 5.7 | +1.3 | 0.03 | 0.1154 | -1.7 | -3.49 |
| Gale Swift | common | 0 | 1/4 | flying, storm | 12.88 | +20.5 ± 5.9 | +3.4 | 0.27 | 1.0385 | -1.7 | -3.37 |
| Muskrat Lodgekeeper | uncommon | 1 | 1/7 | bulwark, tide | 22.8 | +16.3 ± 6.3 | +2.7 | 0.12 | 0.4615 | -1.7 | -3.23 |
| Grizzly Vanguard | common | 2 | 1/19 | sweep | 29.47 | +13.5 ± 5.6 | +2.3 | 0.08 | 0.3077 | -1.7 | -3.64 |
| Clownfish Scout | common | 0 | 1/9 | tide | 12.88 | +20.3 ± 6.1 | +3.4 | 0.26 | 1 | -1.7 | -3.38 |
| Mangrove Mudskipper | common | 0 | 1/9 | tide | 12.88 | +20.3 ± 6.1 | +3.4 | 0.26 | 1 | -1.7 | -3.38 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 21.41 | +16.8 ± 6.5 | +2.8 | 0.13 | 0.5 | -1.7 | -3.15 |
| Booming Bittern | uncommon | 1 | 1/12 | daunt, invisible | 19.34 | +17.5 ± 6.1 | +2.9 | 0.15 | 0.5769 | -1.8 | -3.37 |
| Kraken Spawnling | common | 3 | 2/16 | fork, gash | 28.18 | +13.8 ± 6.0 | +2.3 | 0.08 | 0.3077 | -1.8 | -3.5 |
| Compost Grub | common | 0 | 1/10 | - | 12.01 | +20.3 ± 5.7 | +3.4 | 0.28 | 1.0769 | -1.8 | -3.7 |
| Quill Volley | rare | 1 | 1/14 | pounce | 19.7 | +17.0 ± 6.2 | +2.8 | 0.14 | 0.5385 | -1.8 | -3.46 |
| Slow-worm | common | 0 | 1/7 | undead | 14.79 | +19.0 ± 5.7 | +3.2 | 0.21 | 0.8077 | -1.8 | -3.73 |
| Minnow Skitter | common | 0 | 1/9 | tide | 12.88 | +19.8 ± 6.0 | +3.3 | 0.26 | 1 | -1.8 | -3.58 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 11.44 | +20.3 ± 6.2 | +3.4 | 0.30 | 1.1538 | -1.8 | -3.46 |
| Mangrove Kingfisher | rare | 1 | 2/3 | evasive, flying | 17.64 | +17.8 ± 6.3 | +3.0 | 0.17 | 0.6538 | -1.8 | -3.42 |
| Puffin Diver | common | 1 | 2/5 | dive, flying, tide | 17.69 | +17.8 ± 6.4 | +3.0 | 0.17 | 0.6538 | -1.8 | -3.35 |
| Alpha Howler | common | 2 | 7/7 | sweep | 30.91 | +12.3 ± 5.7 | +2.0 | 0.07 | 0.2692 | -1.8 | -3.81 |
| Old Sturgeon | uncommon | 1 | 1/19 | armor, tide | 27.19 | +13.8 ± 6.5 | +2.3 | 0.08 | 0.3077 | -1.8 | -3.36 |
| Owl Sentinel | common | 1 | 1/10 | flying, keenEye, nocturnal | 20.94 | +16.3 ± 6.1 | +2.7 | 0.13 | 0.5 | -1.9 | -3.57 |
| Constrictor Coil | common | 2 | 4/16 | - | 24.81 | +14.5 ± 5.8 | +2.4 | 0.10 | 0.3846 | -1.9 | -3.84 |
| Swift Fox | common | 1 | 3/3 | fastForward | 15.16 | +18.5 ± 6.4 | +3.1 | 0.20 | 0.7692 | -1.9 | -3.47 |
| Great Barracuda | rare | 1 | 4/4 | quick, tide | 21.2 | +16.0 ± 6.8 | +2.7 | 0.13 | 0.5 | -1.9 | -3.23 |
| Eyrie Warden | common | 3 | 3/13 | daunt, flying, onReadyDamage | 32.57 | +11.3 ± 5.5 | +1.9 | 0.06 | 0.2308 | -1.9 | -4.05 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 39.8 | +8.3 ± 5.6 | +1.4 | 0.03 | 0.1154 | -1.9 | -4 |
| Alpine Salamander | common | 1 | 2/10 | regen | 18.51 | +17.0 ± 6.6 | +2.8 | 0.15 | 0.5769 | -1.9 | -3.36 |
| Gilded Roadwarden | common | 4 | 3/28 | overwhelm, pounce | 42.44 | +7.0 ± 5.4 | +1.2 | 0.03 | 0.1154 | -1.9 | -4.18 |
| Pangolin Roller | uncommon | 1 | 4/4 | sturdy | 20.99 | +15.8 ± 6.5 | +2.6 | 0.13 | 0.5 | -1.9 | -3.47 |
| Cave Bear | common | 3 | 4/13 | rage, siege | 29.62 | +12.3 ± 5.8 | +2.0 | 0.07 | 0.2692 | -1.9 | -3.91 |
| Springbok Pronker | common | 1 | 2/12 | prey | 16.6 | +17.5 ± 6.4 | +2.9 | 0.18 | 0.6923 | -1.9 | -3.57 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 22.65 | +15.0 ± 5.6 | +2.5 | 0.11 | 0.4231 | -1.9 | -4.06 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk | 27.56 | +13.0 ± 5.6 | +2.2 | 0.08 | 0.3077 | -1.9 | -4.12 |
| Tidepool Trapper Crab | common | 0 | 1/7 | crabClaws, hunter, hunterVs | 11.44 | +19.5 ± 6.4 | +3.3 | 0.28 | 1.0769 | -2.0 | -3.59 |
| Hedgerow Shrew | common | 0 | 2/2 | quick | 11.44 | +19.5 ± 6.2 | +3.3 | 0.28 | 1.0769 | -2.0 | -3.73 |
| Dromedary | uncommon | 1 | 2/15 | drought, dry | 24.87 | +14.0 ± 6.9 | +2.3 | 0.09 | 0.3462 | -2.0 | -3.35 |
| Cane Toad | uncommon | 2 | 2/15 | greaterPoison, poison | 24.87 | +14.0 ± 5.7 | +2.3 | 0.09 | 0.3462 | -2.0 | -4.08 |
| Stoneheart Golem | common | 2 | 3/23 | - | 34.63 | +9.8 ± 5.7 | +1.6 | 0.05 | 0.1923 | -2.0 | -4.15 |
| Water Vole | common | 0 | 1/4 | evasive, tide | 11.44 | +19.3 ± 5.6 | +3.2 | 0.28 | 1.0769 | -2.0 | -4.18 |
| Daily Post | common | 0 | 1/1 | flying, triggers | 12.47 | +18.8 ± 5.6 | +3.1 | 0.25 | 0.9615 | -2.0 | -4.23 |
| Violet Vane Fletcher | starter | 0 | 1/5 | flying | 11.67 | +19.0 ± 5.7 | +3.2 | 0.27 | 1.0385 | -2.0 | -4.16 |
| Pond Algae | common | 0 | 1/7 | bloomCopy | 14.79 | +17.8 ± 5.4 | +3.0 | 0.20 | 0.7692 | -2.0 | -4.4 |
| Tomcat | common | 0 | 2/2 | quick | 11.44 | +19.0 ± 6.1 | +3.2 | 0.28 | 1.0769 | -2.0 | -3.92 |
| Caiman Hatchling | common | 0 | 2/2 | quick | 11.44 | +19.0 ± 6.1 | +3.2 | 0.28 | 1.0769 | -2.0 | -3.92 |
| Badger Lumberjack | uncommon | 1 | 1/11 | lumberjack | 18.31 | +16.0 ± 5.9 | +2.7 | 0.15 | 0.5769 | -2.1 | -4.16 |
| Fungal Colossus | uncommon | 2 | 2/14 | bloomCopy, onDeathSpawn | 30.5 | +11.0 ± 5.3 | +1.8 | 0.06 | 0.2308 | -2.1 | -4.64 |
| Woodland Egg | common | 0 | 0/2 | - | 48.73 | +3.5 ± 3.2 | +0.6 | 0.01 | 0.0385 | -2.1 | -7.65 |
| Peregrine Stooper | uncommon | 1 | 1/8 | flying, pounce | 18.72 | +15.8 ± 6.4 | +2.6 | 0.14 | 0.5385 | -2.1 | -3.85 |
| Permafrost Mammoth | common | 3 | 8/8 | frostbite, nocturnal, sweep | 35.67 | +8.8 ± 5.5 | +1.5 | 0.04 | 0.1538 | -2.1 | -4.47 |
| Speckled Egg | uncommon | 0 | 0/1 | - | 57.14 | +0.0 ± 1.4 | +0.0 | 0.00 | 0 | -2.1 | -17.75 |
| Greyplume Fledgling | starter | 0 | 1/5 | flying | 10.61 | +19.0 ± 5.7 | +3.2 | 0.30 | 1.1538 | -2.1 | -4.3 |
| Swamp Alligator | common | 2 | 2/15 | armor | 23.63 | +13.5 ± 5.8 | +2.3 | 0.10 | 0.3846 | -2.1 | -4.32 |
| Fishing Cat | rare | 1 | 1/14 | pounce | 20.58 | +14.8 ± 5.9 | +2.5 | 0.12 | 0.4615 | -2.1 | -4.23 |
| Bee Sentry | starter | 0 | 2/2 | flying, poison | 13.76 | +17.5 ± 5.8 | +2.9 | 0.21 | 0.8077 | -2.1 | -4.34 |
| Jaguar Stalker | rare | 1 | 1/15 | quick | 22.85 | +13.8 ± 5.7 | +2.3 | 0.10 | 0.3846 | -2.1 | -4.45 |
| Bee Knight | common | 0 | 1/1 | flying, swarm | 11.44 | +18.3 ± 5.9 | +3.0 | 0.27 | 1.0385 | -2.2 | -4.35 |
| Rootworm Colony | common | 1 | 4/4 | poison | 18.72 | +15.3 ± 6.6 | +2.5 | 0.14 | 0.5385 | -2.2 | -3.87 |
| Rimeheart Colossus | epic | 3 | 3/19 | armor, freeze, frostbite, immolation | 36.29 | +8.0 ± 5.6 | +1.3 | 0.04 | 0.1538 | -2.2 | -4.61 |
| Oystercatcher | common | 1 | 2/6 | flying, pierce | 17.07 | +15.8 ± 5.9 | +2.6 | 0.15 | 0.5769 | -2.2 | -4.37 |
| Forager Ant | common | 0 | 1/7 | triggers | 11.44 | +18.0 ± 5.5 | +3.0 | 0.26 | 1 | -2.2 | -4.75 |
| Shepherd | common | 1 | 2/14 | guardian | 19.96 | +14.5 ± 5.6 | +2.4 | 0.12 | 0.4615 | -2.2 | -4.65 |
| Alpine Swift | common | 0 | 2/2 | flying, quick | 16.24 | +15.8 ± 5.4 | +2.6 | 0.16 | 0.6154 | -2.3 | -4.91 |
| Conch Herald | uncommon | 1 | 1/11 | inspiring, tide | 18.51 | +14.8 ± 5.8 | +2.5 | 0.13 | 0.5 | -2.3 | -4.63 |
| Cinder Hornet | common | 2 | 3/3 | flying, stunOnHit | 20.94 | +13.8 ± 6.0 | +2.3 | 0.11 | 0.4231 | -2.3 | -4.46 |
| Platypus Spur | uncommon | 1 | 4/4 | venomous | 18.93 | +14.5 ± 6.6 | +2.4 | 0.13 | 0.5 | -2.3 | -4.08 |
| Water Shrew | common | 0 | 1/6 | venomous | 11.44 | +17.5 ± 5.6 | +2.9 | 0.25 | 0.9615 | -2.3 | -4.82 |
| Cunning Vixen | uncommon | 1 | 1/10 | backstab, evasive | 20.58 | +13.8 ± 6.0 | +2.3 | 0.11 | 0.4231 | -2.3 | -4.52 |
| Octopus Tactician | rare | 2 | 5/5 | sweep, tide | 27.14 | +11.0 ± 6.0 | +1.8 | 0.07 | 0.2692 | -2.3 | -4.54 |
| Cinder Skeleton | common | 1 | 1/5 | requiem, undead | 16.6 | +15.0 ± 6.1 | +2.5 | 0.15 | 0.5769 | -2.4 | -4.52 |
| Camouflage Frog | common | 1 | 2/6 | evasive, tide | 17.07 | +14.8 ± 5.8 | +2.5 | 0.14 | 0.5385 | -2.4 | -4.8 |
| Fennec Fox | uncommon | 1 | 2/12 | dry | 20.99 | +13.0 ± 6.0 | +2.2 | 0.10 | 0.3846 | -2.4 | -4.67 |
| Ruby-Throat Duelist | rare | 0 | 2/2 | flying, pierce, quick | 17.89 | +14.2 ± 5.4 | +2.4 | 0.13 | 0.5 | -2.4 | -5.24 |
| Silver Minnow | starter | 0 | 2/4 | - | 10.92 | +17.0 ± 5.7 | +2.8 | 0.26 | 1 | -2.4 | -4.96 |
| Venomlord Serpent | common | 3 | 1/22 | poison | 31.12 | +8.5 ± 5.5 | +1.4 | 0.05 | 0.1923 | -2.5 | -5.27 |
| Marshal of Rivergate | epic | 2 | 1/1 | armor, sweep | 29.83 | +9.0 ± 5.6 | +1.5 | 0.05 | 0.1923 | -2.5 | -5.18 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 19.96 | +13.0 ± 5.7 | +2.2 | 0.11 | 0.4231 | -2.5 | -5.04 |
| Orca Vanguard | common | 3 | 7/7 | sweep, tide | 32.57 | +7.8 ± 5.4 | +1.3 | 0.04 | 0.1538 | -2.5 | -5.41 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 17.41 | +14.0 ± 5.7 | +2.3 | 0.13 | 0.5 | -2.5 | -5.13 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 43.04 | +3.5 ± 3.5 | +0.6 | 0.01 | 0.0385 | -2.5 | -8.31 |
| Phoenix Fledgling | common | 2 | 2/10 | cure, flying, renewal | 22.65 | +11.5 ± 5.7 | +1.9 | 0.08 | 0.3077 | -2.5 | -5.2 |
| Fumarole Ibex | rare | 1 | 1/12 | mountainClimber, pounce | 22.03 | +11.8 ± 5.4 | +2.0 | 0.09 | 0.3462 | -2.5 | -5.54 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 17.89 | +13.3 ± 6.1 | +2.2 | 0.12 | 0.4615 | -2.6 | -4.95 |
| Glacier Yak | common | 3 | 1/17 | freeze, triggers | 27.19 | +9.3 ± 5.4 | +1.5 | 0.06 | 0.2308 | -2.6 | -5.63 |
| Stalactite Golem | common | 2 | 1/21 | shell | 29.47 | +8.3 ± 5.4 | +1.4 | 0.05 | 0.1923 | -2.6 | -5.67 |
| Snapper Hatchling | common | 0 | 1/7 | tide | 11.44 | +15.5 ± 5.4 | +2.6 | 0.23 | 0.8846 | -2.6 | -5.74 |
| Riverworks Bastion | common | 3 | 0/31 | rampart | 32.36 | +6.8 ± 5.9 | +1.1 | 0.03 | 0.1154 | -2.7 | -5.28 |
| Quarry Mole | common | 1 | 2/12 | bedrock, keenSense | 18.72 | +12.3 ± 5.7 | +2.0 | 0.11 | 0.4231 | -2.7 | -5.56 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 18.31 | +12.3 ± 5.8 | +2.0 | 0.11 | 0.4231 | -2.7 | -5.46 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 15.16 | +13.5 ± 6.0 | +2.3 | 0.15 | 0.5769 | -2.7 | -5.31 |
| Red-billed Chough | common | 0 | 2/2 | flying, mountainClimber | 14.79 | +13.5 ± 5.1 | +2.3 | 0.15 | 0.5769 | -2.7 | -6.27 |
| Chipmunk Forager | starter | 0 | 1/8 | - | 10.92 | +15.0 ± 5.3 | +2.5 | 0.23 | 0.8846 | -2.8 | -6.11 |
| Harvest Mouse | starter | 0 | 1/6 | - | 10.92 | +15.0 ± 5.1 | +2.5 | 0.23 | 0.8846 | -2.8 | -6.35 |
| Great Gate | common | 2 | 0/15 | guardian | 21.36 | +10.8 ± 5.3 | +1.8 | 0.08 | 0.3077 | -2.8 | -6.11 |
| Boreal Elk | common | 2 | 4/4 | sweep | 22.65 | +10.0 ± 5.9 | +1.7 | 0.07 | 0.2692 | -2.8 | -5.58 |
| Guppy | starter | 0 | 2/2 | tide | 10.4 | +14.8 ± 5.6 | +2.5 | 0.24 | 0.9231 | -2.8 | -5.9 |
| Magma Titan | common | 3 | 2/17 | immolation, scar | 29.62 | +6.8 ± 5.4 | +1.1 | 0.04 | 0.1538 | -2.9 | -6.2 |
| Iron Warden | epic | 1 | 0/35 | ironWill | 35.46 | +4.3 ± 6.3 | +0.7 | 0.02 | 0.0769 | -2.9 | -5.36 |
| Anvilwhisker Otter | uncommon | 2 | 1/14 | triggers | 25.54 | +8.3 ± 5.4 | +1.4 | 0.05 | 0.1923 | -2.9 | -6.24 |
| Nest | common | 0 | 0/9 | triggers | 16.4 | +12.0 ± 5.4 | +2.0 | 0.12 | 0.4615 | -2.9 | -6.24 |
| Pronghorn Racer | common | 1 | 1/10 | speed | 16.6 | +11.8 ± 5.7 | +2.0 | 0.12 | 0.4615 | -2.9 | -5.96 |
| Vampire Roost | common | 2 | 0/24 | nocturnal, onDeathSpawn | 30.91 | +5.8 ± 5.0 | +1.0 | 0.03 | 0.1154 | -2.9 | -6.87 |
| Friar Badger | uncommon | 0 | 2/9 | relic | 20.17 | +10.0 ± 5.7 | +1.7 | 0.08 | 0.3077 | -2.9 | -6.06 |
| Ford Kingfisher | uncommon | 1 | 0/8 | flying, pounce | 15.78 | +11.8 ± 5.6 | +2.0 | 0.12 | 0.4615 | -3.0 | -6.25 |
| Golden Magpie | uncommon | 0 | 1/4 | flying, midas | 16.81 | +11.0 ± 5.9 | +1.8 | 0.11 | 0.4231 | -3.0 | -6.06 |
| Chamois Leaper | uncommon | 1 | 1/10 | mountainClimber, pounce | 20.37 | +9.5 ± 5.1 | +1.6 | 0.08 | 0.3077 | -3.0 | -7.02 |
| Otter Riverguard | common | 2 | 1/14 | armor | 20.79 | +9.3 ± 5.3 | +1.5 | 0.07 | 0.2692 | -3.0 | -6.76 |
| Nectar Vintner | common | 0 | 1/1 | flying, healing | 12.47 | +12.5 ± 5.4 | +2.1 | 0.17 | 0.6538 | -3.1 | -6.7 |
| Duckling | starter | 0 | 1/5 | - | 10.92 | +13.0 ± 5.0 | +2.2 | 0.20 | 0.7692 | -3.1 | -7.22 |
| Sheep | starter | 0 | 1/6 | taunt | 10.4 | +13.0 ± 5.4 | +2.2 | 0.21 | 0.8077 | -3.1 | -6.81 |
| Mosswing | starter | 0 | 0/7 | flying | 10.61 | +12.8 ± 5.0 | +2.1 | 0.20 | 0.7692 | -3.1 | -7.45 |
| Cocoon | uncommon | 0 | 0/1 | chrysalis | 35.05 | +2.0 ± 2.4 | +0.3 | 0.01 | 0.0385 | -3.3 | -16.08 |
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 22.23 | +7.0 ± 5.3 | +1.2 | 0.05 | 0.1923 | -3.3 | -7.41 |
| Lucky Hopper | rare | 1 | 1/17 | - | 19.17 | +7.8 ± 5.9 | +1.3 | 0.07 | 0.2692 | -3.4 | -6.73 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.4 | +10.8 ± 4.9 | +1.8 | 0.17 | 0.6538 | -3.5 | -8.47 |
| Gale Sprite | common | 1 | 1/8 | evolute | 18.05 | +7.5 ± 5.5 | +1.3 | 0.07 | 0.2692 | -3.5 | -7.49 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +8.8 ± 5.2 | +1.5 | 0.11 | 0.4231 | -3.7 | -8.32 |
| Chipmunk Cavalry | common | 1 | 2/2 | quick | 13.71 | +8.0 ± 5.6 | +1.3 | 0.10 | 0.3846 | -3.7 | -7.85 |
| Fleetfoot'd | uncommon | 0 | 1/1 | quick, tide | 12.47 | +7.5 ± 4.7 | +1.3 | 0.10 | 0.3846 | -3.9 | -9.64 |
| Irradiated Glow Wyrm | rare | 1 | 1/18 | poison | 25.7 | +2.0 ± 4.8 | +0.3 | 0.01 | 0.0385 | -3.9 | -9.65 |
| Earthworm | starter | 0 | 0/6 | - | 10.92 | +7.0 ± 4.5 | +1.2 | 0.11 | 0.4231 | -4.1 | -10.64 |
| Ember Centipede | common | 0 | 1/1 | dry, quick | 17.69 | +3.0 ± 3.4 | +0.5 | 0.03 | 0.1154 | -4.3 | -14.97 |
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 19.55 | +0.3 ± 5.6 | +0.0 | 0.00 | 0 | -4.6 | -9.73 |
| Bee Drone | uncommon | 0 | 0/1 | flying, triggers | 12.47 | +1.5 ± 4.3 | +0.3 | 0.02 | 0.0769 | -4.9 | -13.46 |
