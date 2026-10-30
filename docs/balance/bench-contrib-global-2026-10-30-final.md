# Card value per budget point (global, 2026-10-30)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 200` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `adef00324d96`.

## How it is measured

- 200 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 767-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +6.0 + -0.070 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.7 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Wolf Spider Mother | rare | 1 | 3/10 | brood | 20.58 | +60.3 ± 7.1 | +10.0 | 0.49 | 1.8846 | +5.5 | 9.17 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 21.41 | +58.3 ± 7.1 | +9.7 | 0.45 | 1.7308 | +5.2 | 8.64 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 24.09 | +57.0 ± 7.1 | +9.5 | 0.39 | 1.5 | +5.2 | 8.61 |
| Pike Lancer | rare | 0 | 4/8 | tide | 17.89 | +59.3 ± 6.8 | +9.9 | 0.55 | 2.1154 | +5.1 | 8.9 |
| Royal Guard | superrare | 1 | 4/10 | armor, boomerang | 22.23 | +56.8 ± 7.0 | +9.5 | 0.43 | 1.6538 | +5.0 | 8.47 |
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 17.69 | +57.8 ± 6.8 | +9.6 | 0.54 | 2.0769 | +4.9 | 8.41 |
| Badger Berserker | rare | 1 | 4/16 | - | 24.86 | +54.3 ± 7.0 | +9.0 | 0.36 | 1.3846 | +4.8 | 8.04 |
| Glass Octopus | rare | 1 | 4/13 | corrode, stealth | 25.7 | +53.0 ± 7.5 | +8.8 | 0.34 | 1.3077 | +4.7 | 7.34 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 39.54 | +46.5 ± 7.3 | +7.8 | 0.20 | 0.7692 | +4.6 | 7.35 |
| Two-Headed Calf | rare | 1 | 3/11 | fork | 21.82 | +53.8 ± 7.2 | +9.0 | 0.41 | 1.5769 | +4.5 | 7.41 |
| Siege Rhino | rare | 1 | 5/17 | siege | 32.15 | +48.8 ± 7.5 | +8.1 | 0.25 | 0.9615 | +4.4 | 6.96 |
| Hedge Changeling | uncommon | 0 | 1/7 | changeling, swarm | 16.86 | +55.0 ± 7.2 | +9.2 | 0.54 | 2.0769 | +4.4 | 7.14 |
| Stoat Cutthroat | rare | 1 | 3/12 | backstab, foeScarcity | 22.23 | +52.5 ± 7.2 | +8.8 | 0.39 | 1.5 | +4.3 | 7.1 |
| Ibex Rockcaller | veryrare | 1 | 3/12 | avalanche | 26.32 | +50.7 ± 7.4 | +8.5 | 0.32 | 1.2308 | +4.3 | 6.85 |
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 27.76 | +50.0 ± 6.9 | +8.3 | 0.30 | 1.1538 | +4.3 | 7.31 |
| Ent | rare | 0 | 2/22 | fog | 29.47 | +49.0 ± 7.2 | +8.2 | 0.28 | 1.0769 | +4.3 | 6.96 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 32.98 | +47.3 ± 7.3 | +7.9 | 0.24 | 0.9231 | +4.2 | 6.79 |
| Tide Spirit | rare | 0 | 5/5 | tide | 19.75 | +52.8 ± 7.2 | +8.8 | 0.45 | 1.7308 | +4.2 | 6.85 |
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 27.56 | +49.3 ± 7.1 | +8.2 | 0.30 | 1.1538 | +4.2 | 6.93 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 25.75 | +50.0 ± 7.3 | +8.3 | 0.32 | 1.2308 | +4.2 | 6.66 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bee Drone | uncommon | 0 | 0/1 | flying, triggers | 12.47 | -1.0 ± 4.2 | -0.2 | -0.01 | -0.0385 | -5.3 | -14.9 |
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 19.55 | -0.8 ± 5.7 | -0.1 | -0.01 | -0.0385 | -4.7 | -9.69 |
| Irradiated Glow Wyrm | rare | 1 | 1/18 | poison | 25.7 | -0.5 ± 4.9 | -0.1 | 0.00 | 0 | -4.3 | -10.28 |
| Earthworm | starter | 0 | 0/6 | - | 10.92 | +7.0 ± 4.5 | +1.2 | 0.11 | 0.4231 | -4.1 | -10.59 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +6.8 ± 5.0 | +1.1 | 0.09 | 0.3462 | -4.0 | -9.25 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.4 | +9.3 ± 5.2 | +1.5 | 0.15 | 0.5769 | -3.7 | -8.42 |
| Gale Sprite | common | 1 | 1/8 | evolute | 18.05 | +6.0 ± 5.6 | +1.0 | 0.06 | 0.2308 | -3.7 | -7.78 |
| Duckling | starter | 0 | 1/5 | - | 10.92 | +10.5 ± 5.2 | +1.8 | 0.16 | 0.6154 | -3.5 | -7.82 |
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 22.23 | +6.0 ± 5.3 | +1.0 | 0.04 | 0.1538 | -3.4 | -7.63 |
| Mosswing | starter | 0 | 0/7 | flying | 10.61 | +11.3 ± 4.9 | +1.9 | 0.18 | 0.6923 | -3.4 | -8.02 |
| Lucky Hopper | rare | 1 | 1/17 | - | 19.17 | +7.8 ± 6.3 | +1.3 | 0.07 | 0.2692 | -3.4 | -6.3 |
| Golden Magpie | uncommon | 0 | 1/6 | flying, midas | 16.81 | +9.0 ± 5.9 | +1.5 | 0.09 | 0.3462 | -3.3 | -6.58 |
| Cocoon | uncommon | 0 | 0/1 | chrysalis | 35.05 | +2.0 ± 2.4 | +0.3 | 0.01 | 0.0385 | -3.2 | -15.59 |
| Ford Kingfisher | uncommon | 1 | 0/8 | flying, pounce | 15.78 | +10.3 ± 5.7 | +1.7 | 0.11 | 0.4231 | -3.2 | -6.54 |
| Nest | common | 0 | 0/9 | triggers | 16.4 | +10.0 ± 5.3 | +1.7 | 0.10 | 0.3846 | -3.2 | -6.97 |
| Anvilwhisker Otter | uncommon | 2 | 1/14 | triggers | 25.54 | +6.3 ± 5.3 | +1.0 | 0.04 | 0.1538 | -3.1 | -6.98 |
| Otter Riverguard | common | 2 | 1/14 | armor | 20.79 | +8.3 ± 5.3 | +1.4 | 0.07 | 0.2692 | -3.1 | -6.93 |
| Sheep | starter | 0 | 1/6 | taunt | 10.4 | +13.5 ± 5.8 | +2.3 | 0.22 | 0.8462 | -3.0 | -6.1 |
| Guppy | starter | 0 | 2/2 | tide | 10.4 | +13.5 ± 5.8 | +2.3 | 0.22 | 0.8462 | -3.0 | -6.06 |
| Friar Badger | uncommon | 0 | 2/12 | relic | 20.17 | +9.5 ± 6.0 | +1.6 | 0.08 | 0.3077 | -3.0 | -5.86 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Wolf Spider Mother | rare | 1 | 3/10 | brood | 20.58 | +60.3 ± 7.1 | +10.0 | 0.49 | 1.8846 | +5.5 | 9.17 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 21.41 | +58.3 ± 7.1 | +9.7 | 0.45 | 1.7308 | +5.2 | 8.64 |
| Battlement Heron | rare | 1 | 1/13 | arrow, sentry | 24.09 | +57.0 ± 7.1 | +9.5 | 0.39 | 1.5 | +5.2 | 8.61 |
| Pike Lancer | rare | 0 | 4/8 | tide | 17.89 | +59.3 ± 6.8 | +9.9 | 0.55 | 2.1154 | +5.1 | 8.9 |
| Royal Guard | superrare | 1 | 4/10 | armor, boomerang | 22.23 | +56.8 ± 7.0 | +9.5 | 0.43 | 1.6538 | +5.0 | 8.47 |
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 17.69 | +57.8 ± 6.8 | +9.6 | 0.54 | 2.0769 | +4.9 | 8.41 |
| Badger Berserker | rare | 1 | 4/16 | - | 24.86 | +54.3 ± 7.0 | +9.0 | 0.36 | 1.3846 | +4.8 | 8.04 |
| Glass Octopus | rare | 1 | 4/13 | corrode, stealth | 25.7 | +53.0 ± 7.5 | +8.8 | 0.34 | 1.3077 | +4.7 | 7.34 |
| Old Willow of the Ford | legendary | 1 | 2/21 | onReadyGold, regen | 39.54 | +46.5 ± 7.3 | +7.8 | 0.20 | 0.7692 | +4.6 | 7.35 |
| Two-Headed Calf | rare | 1 | 3/11 | fork | 21.82 | +53.8 ± 7.2 | +9.0 | 0.41 | 1.5769 | +4.5 | 7.41 |
| Siege Rhino | rare | 1 | 5/17 | siege | 32.15 | +48.8 ± 7.5 | +8.1 | 0.25 | 0.9615 | +4.4 | 6.96 |
| Hedge Changeling | uncommon | 0 | 1/7 | changeling, swarm | 16.86 | +55.0 ± 7.2 | +9.2 | 0.54 | 2.0769 | +4.4 | 7.14 |
| Stoat Cutthroat | rare | 1 | 3/12 | backstab, foeScarcity | 22.23 | +52.5 ± 7.2 | +8.8 | 0.39 | 1.5 | +4.3 | 7.1 |
| Ibex Rockcaller | veryrare | 1 | 3/12 | avalanche | 26.32 | +50.7 ± 7.4 | +8.5 | 0.32 | 1.2308 | +4.3 | 6.85 |
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 27.76 | +50.0 ± 6.9 | +8.3 | 0.30 | 1.1538 | +4.3 | 7.31 |
| Ent | rare | 0 | 2/22 | fog | 29.47 | +49.0 ± 7.2 | +8.2 | 0.28 | 1.0769 | +4.3 | 6.96 |
| Ür-Elk | veryrare | 1 | 4/11 | overwhelm, rage | 32.98 | +47.3 ± 7.3 | +7.9 | 0.24 | 0.9231 | +4.2 | 6.79 |
| Tide Spirit | rare | 0 | 5/5 | tide | 19.75 | +52.8 ± 7.2 | +8.8 | 0.45 | 1.7308 | +4.2 | 6.85 |
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 27.56 | +49.3 ± 7.1 | +8.2 | 0.30 | 1.1538 | +4.2 | 6.93 |
| Caldera Snow Leopard | superrare | 1 | 3/15 | pounce | 25.75 | +50.0 ± 7.3 | +8.3 | 0.32 | 1.2308 | +4.2 | 6.66 |
| Squire's Mount | rare | 1 | 4/15 | - | 23.13 | +51.0 ± 7.2 | +8.5 | 0.37 | 1.4231 | +4.2 | 6.78 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 18.72 | +52.3 ± 7.1 | +8.7 | 0.47 | 1.8077 | +4.0 | 6.73 |
| Blue-ringed Octopus | rare | 1 | 2/11 | octolash | 25.28 | +49.0 ± 7.1 | +8.2 | 0.32 | 1.2308 | +4.0 | 6.62 |
| Echidna Quillshot | veryrare | 1 | 3/11 | volley | 27.97 | +46.5 ± 7.3 | +7.8 | 0.28 | 1.0769 | +3.7 | 6.02 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 22.85 | +48.3 ± 7.3 | +8.0 | 0.35 | 1.3462 | +3.7 | 5.89 |
| Nautilus Drifter | rare | 1 | 4/13 | onReadyGold | 28.85 | +45.3 ± 7.2 | +7.5 | 0.26 | 1 | +3.6 | 5.89 |
| Ossuary Lammergeier | superrare | 1 | 3/8 | carrion, flying | 25.33 | +46.8 ± 7.3 | +7.8 | 0.31 | 1.1923 | +3.6 | 5.76 |
| Upside-Down Bat | uncommon | 0 | 2/5 | diurnal, flying | 15.46 | +50.7 ± 7.2 | +8.5 | 0.55 | 2.1154 | +3.6 | 5.82 |
| Prospector Mole | common | 0 | 3/9 | prospector | 17.69 | +49.5 ± 7.2 | +8.3 | 0.47 | 1.8077 | +3.5 | 5.72 |
| Talon Archer | veryrare | 1 | 2/6 | arrow, diurnal, flying | 23.27 | +47.0 ± 7.2 | +7.8 | 0.34 | 1.3077 | +3.5 | 5.69 |
| Tax-Collector Teal | uncommon | 0 | 1/4 | flying, hoard, swipe | 17.43 | +49.5 ± 7.2 | +8.3 | 0.47 | 1.8077 | +3.5 | 5.69 |
| Honeyjoe Brewer | uncommon | 0 | 1/3 | coffee, flying, kinship | 13.5 | +50.7 ± 7.2 | +8.5 | 0.63 | 2.4231 | +3.4 | 5.59 |
| Otter Flag Bearer | uncommon | 0 | 2/9 | inspiring | 16.86 | +48.8 ± 7.1 | +8.1 | 0.48 | 1.8462 | +3.3 | 5.55 |
| Magma Salamander | rare | 1 | 3/12 | fireArrow | 22.03 | +46.3 ± 7.3 | +7.7 | 0.35 | 1.3462 | +3.3 | 5.29 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 24.46 | +45.3 ± 7.4 | +7.5 | 0.31 | 1.1923 | +3.3 | 5.21 |
| Teatime Toad | uncommon | 0 | 4/4 | regen | 18.51 | +47.3 ± 7.1 | +7.9 | 0.43 | 1.6538 | +3.2 | 5.33 |
| Sunspire Sky-Sovereign | heroic | 1 | 2/10 | esprit, espritHp, flying | 24.3 | +44.8 ± 7.3 | +7.5 | 0.31 | 1.1923 | +3.2 | 5.15 |
| Rimefire Salamander | rare | 1 | 2/7 | fireArrow, iceArrow | 23.68 | +45.0 ± 7.0 | +7.5 | 0.32 | 1.2308 | +3.2 | 5.33 |
| Alpine Marmot | common | 0 | 3/9 | guardian | 17.07 | +47.8 ± 7.1 | +8.0 | 0.47 | 1.8077 | +3.2 | 5.28 |
| Ashwing Ptarmigan | rare | 1 | 3/7 | flying | 20.73 | +46.0 ± 7.2 | +7.7 | 0.37 | 1.4231 | +3.1 | 5.13 |
| Sunspire Choirmother | veryrare | 1 | 3/4 | diurnal, diurnalHp, esprit, espritHp, flying | 25.08 | +44.0 ± 7.4 | +7.3 | 0.29 | 1.1154 | +3.1 | 4.94 |
| Dust Hyena | uncommon | 0 | 2/7 | carnage, triggers | 15.36 | +48.0 ± 7.3 | +8.0 | 0.52 | 2 | +3.1 | 4.94 |
| Gatling Hog | rare | 1 | 2/9 | arrow, twinStrike | 20.58 | +45.8 ± 7.2 | +7.6 | 0.37 | 1.4231 | +3.1 | 5.07 |
| Colony | rare | 0 | 0/11 | triggers | 21.61 | +45.0 ± 7.2 | +7.5 | 0.35 | 1.3462 | +3.0 | 5 |
| Otter Centurion | rare | 0 | 3/7 | boomerang | 16.86 | +47.0 ± 6.9 | +7.8 | 0.46 | 1.7692 | +3.0 | 5.14 |
| Redwood Woodpecker | uncommon | 1 | 2/12 | milling | 19.55 | +45.8 ± 7.0 | +7.6 | 0.39 | 1.5 | +3.0 | 5.05 |
| Voidfeather Scout | uncommon | 0 | 2/5 | flying, nocturnal, nocturnalHp | 17.2 | +46.3 ± 6.9 | +7.7 | 0.45 | 1.7308 | +2.9 | 4.98 |
| Howdah Archers | rare | 1 | 3/8 | arrow | 23.89 | +43.3 ± 7.4 | +7.2 | 0.30 | 1.1538 | +2.9 | 4.62 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 14.62 | +47.0 ± 6.9 | +7.8 | 0.54 | 2.0769 | +2.9 | 4.86 |
| Pika Hoarder | common | 0 | 3/15 | scatterbrained | 15.78 | +46.3 ± 6.9 | +7.7 | 0.49 | 1.8846 | +2.8 | 4.81 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 24.66 | +42.5 ± 7.3 | +7.1 | 0.29 | 1.1154 | +2.8 | 4.58 |
| Dune Packrat | uncommon | 1 | 2/11 | triggers | 20.99 | +43.8 ± 6.9 | +7.3 | 0.35 | 1.3462 | +2.8 | 4.75 |
| Clap-net Trapper | common | 0 | 2/11 | triggers | 15.83 | +45.8 ± 7.0 | +7.6 | 0.48 | 1.8462 | +2.8 | 4.6 |
| Gold-throated Acolyte | uncommon | 0 | 2/5 | evasive, flying | 20.74 | +43.5 ± 7.0 | +7.2 | 0.35 | 1.3462 | +2.7 | 4.55 |
| Tiny Cave Dweller | uncommon | 0 | 2/7 | armor | 13.3 | +46.5 ± 7.2 | +7.8 | 0.58 | 2.2308 | +2.7 | 4.39 |
| Balloon Archer | uncommon | 1 | 2/8 | arrow, arrowBramble, flying | 26.73 | +40.8 ± 7.5 | +6.8 | 0.25 | 0.9615 | +2.7 | 4.23 |
| Antlion Pit | uncommon | 1 | 3/13 | trap | 21.82 | +42.8 ± 7.1 | +7.1 | 0.33 | 1.2692 | +2.7 | 4.4 |
| Alley Cat | rare | 0 | 2/2 | bleed, twinStrike | 14.54 | +45.8 ± 7.2 | +7.6 | 0.52 | 2 | +2.7 | 4.36 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 27.76 | +40.0 ± 7.6 | +6.7 | 0.24 | 0.9231 | +2.6 | 4.1 |
| Red Dragon Egg | legendary | 0 | 0/5 | - | 98.81 | +9.5 ± 4.9 | +1.6 | 0.02 | 0.0769 | +2.6 | 6.26 |
| Otter Ferryman | common | 0 | 3/8 | tide | 15.83 | +45.0 ± 7.4 | +7.5 | 0.47 | 1.8077 | +2.6 | 4.14 |
| Inside-Out Hedgehog | uncommon | 0 | 1/11 | thorns | 15.16 | +45.3 ± 7.0 | +7.5 | 0.50 | 1.9231 | +2.6 | 4.38 |
| Riverstone Slinger | rare | 0 | 3/8 | reach | 17.89 | +44.0 ± 7.2 | +7.3 | 0.41 | 1.5769 | +2.6 | 4.26 |
| Optio of the Ford | veryrare | 1 | 4/12 | guardian | 21.2 | +42.5 ± 7.3 | +7.1 | 0.33 | 1.2692 | +2.6 | 4.2 |
| Wolf Pack Runner | rare | 1 | 3/13 | muster | 22.03 | +41.8 ± 7.3 | +7.0 | 0.32 | 1.2308 | +2.5 | 4.05 |
| Newt Doctor | uncommon | 0 | 4/4 | healing | 17.07 | +43.8 ± 7.0 | +7.3 | 0.43 | 1.6538 | +2.5 | 4.19 |
| Shellwright Apprentice | common | 0 | 2/9 | shell | 15.83 | +44.3 ± 7.0 | +7.4 | 0.47 | 1.8077 | +2.5 | 4.19 |
| Pangolin Roller | uncommon | 1 | 5/6 | sturdy | 20.99 | +42.0 ± 7.6 | +7.0 | 0.33 | 1.2692 | +2.5 | 3.84 |
| Mudpuppy | common | 0 | 2/9 | regen | 16.24 | +43.8 ± 7.0 | +7.3 | 0.45 | 1.7308 | +2.4 | 4.09 |
| Talus Pika | common | 0 | 2/7 | triggers | 14.33 | +44.5 ± 7.0 | +7.4 | 0.52 | 2 | +2.4 | 4.09 |
| Hedgehog Herbalist | rare | 1 | 3/15 | herbalist | 21.82 | +41.3 ± 7.2 | +6.9 | 0.32 | 1.2308 | +2.4 | 3.93 |
| Lantern Spark Fly | uncommon | 0 | 2/7 | flying, illuminate | 19.13 | +42.3 ± 7.1 | +7.0 | 0.37 | 1.4231 | +2.4 | 3.97 |
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 30.04 | +37.5 ± 7.5 | +6.3 | 0.21 | 0.8077 | +2.4 | 3.72 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 26.73 | +38.8 ± 7.4 | +6.5 | 0.24 | 0.9231 | +2.4 | 3.74 |
| Otter Shieldback | uncommon | 1 | 4/16 | - | 24.16 | +39.8 ± 7.6 | +6.6 | 0.27 | 1.0385 | +2.4 | 3.64 |
| Planarian Splitter | uncommon | 1 | 3/10 | meiosis | 19.55 | +41.8 ± 7.4 | +7.0 | 0.36 | 1.3846 | +2.4 | 3.75 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 19.75 | +41.5 ± 7.1 | +6.9 | 0.35 | 1.3462 | +2.3 | 3.83 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 22.65 | +40.0 ± 7.2 | +6.7 | 0.29 | 1.1154 | +2.3 | 3.72 |
| Vampire Bat | uncommon | 0 | 2/4 | flying, nocturnal, sap | 17.27 | +42.0 ± 7.1 | +7.0 | 0.41 | 1.5769 | +2.2 | 3.68 |
| Magma Wraith | uncommon | 1 | 1/8 | evasive, fireArrow | 22.23 | +39.8 ± 7.5 | +6.6 | 0.30 | 1.1538 | +2.2 | 3.48 |
| Helmeted Otter | common | 0 | 2/11 | helmet | 15.83 | +42.5 ± 7.0 | +7.1 | 0.45 | 1.7308 | +2.2 | 3.71 |
| Lantern Bearer | uncommon | 0 | 2/7 | flying, illuminate | 16.86 | +41.8 ± 7.1 | +7.0 | 0.41 | 1.5769 | +2.2 | 3.57 |
| Otter Angler | common | 0 | 1/11 | tide, triggers | 15.83 | +42.3 ± 7.1 | +7.0 | 0.44 | 1.6923 | +2.2 | 3.57 |
| Fawn Scout | rare | 0 | 2/8 | canopyCover, keenEye | 16.19 | +41.5 ± 7.0 | +6.9 | 0.43 | 1.6538 | +2.1 | 3.49 |
| Glass Golem | rare | 1 | 8/5 | - | 22.91 | +38.5 ± 7.6 | +6.4 | 0.28 | 1.0769 | +2.1 | 3.19 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 27.97 | +36.0 ± 7.3 | +6.0 | 0.21 | 0.8077 | +2.0 | 3.18 |
| Irradiated Axolotl | uncommon | 1 | 4/11 | triggers | 20.79 | +39.0 ± 7.4 | +6.5 | 0.31 | 1.1923 | +2.0 | 3.13 |
| Nutria Reedcutter | common | 0 | 2/9 | triggers | 18.67 | +39.8 ± 7.0 | +6.6 | 0.35 | 1.3462 | +2.0 | 3.28 |
| Otter Lantern Bearer | uncommon | 0 | 2/12 | illuminate | 16.86 | +40.5 ± 6.8 | +6.8 | 0.40 | 1.5385 | +1.9 | 3.36 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 15.98 | +40.8 ± 7.1 | +6.8 | 0.43 | 1.6538 | +1.9 | 3.2 |
| Sunthroat Courier | common | 0 | 2/6 | espritHp, flying | 16.15 | +40.5 ± 7.2 | +6.8 | 0.42 | 1.6154 | +1.9 | 3.11 |
| Raven Scout | rare | 0 | 2/5 | flying | 14.83 | +40.8 ± 7.3 | +6.8 | 0.46 | 1.7692 | +1.8 | 2.94 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 18.67 | +39.0 ± 7.3 | +6.5 | 0.35 | 1.3462 | +1.8 | 2.94 |
| Border Collie | uncommon | 1 | 3/15 | converge | 21.2 | +37.8 ± 7.3 | +6.3 | 0.30 | 1.1538 | +1.8 | 2.91 |
| Dhole Runner | common | 1 | 2/11 | pack | 19.96 | +38.3 ± 7.5 | +6.4 | 0.32 | 1.2308 | +1.8 | 2.81 |
| Echo Screecher | rare | 1 | 2/8 | flying, nocturnal, onReadyDamage | 20.79 | +37.8 ± 7.4 | +6.3 | 0.30 | 1.1538 | +1.8 | 2.81 |
| Porcupine Roller | common | 0 | 3/3 | thorns | 14.33 | +40.5 ± 7.2 | +6.8 | 0.47 | 1.8077 | +1.8 | 2.88 |
| Dung Beetle | common | 0 | 1/5 | decay | 12.88 | +41.0 ± 7.1 | +6.8 | 0.53 | 2.0385 | +1.7 | 2.89 |
| Thorny Devil | common | 1 | 1/20 | thorns | 24.66 | +35.8 ± 7.3 | +6.0 | 0.24 | 0.9231 | +1.7 | 2.74 |
| The Contradiction | epic | 1 | 2/16 | rage, regen | 30.24 | +33.3 ± 7.5 | +5.5 | 0.18 | 0.6923 | +1.7 | 2.65 |
| Woodland Brawler | veryrare | 1 | 3/14 | - | 25.52 | +35.0 ± 7.3 | +5.8 | 0.23 | 0.8846 | +1.7 | 2.66 |
| Rivergate Recruit | common | 0 | 2/12 | - | 16.62 | +38.8 ± 7.0 | +6.5 | 0.39 | 1.5 | +1.6 | 2.74 |
| Hedgehog Scout | common | 0 | 1/10 | thorns | 13.92 | +39.8 ± 6.9 | +6.6 | 0.48 | 1.8462 | +1.6 | 2.75 |
| Gannet Nestweaver | common | 0 | 1/7 | flying, triggers | 14.79 | +39.3 ± 6.7 | +6.5 | 0.44 | 1.6923 | +1.6 | 2.78 |
| Archerfish | uncommon | 1 | 3/6 | acidBolt | 19.55 | +37.0 ± 7.2 | +6.2 | 0.32 | 1.2308 | +1.6 | 2.54 |
| Bee Forager | starter | 0 | 0/5 | flying, swarm, triggers | 10.4 | +40.8 ± 7.3 | +6.8 | 0.65 | 2.5 | +1.5 | 2.45 |
| Birdlime Dauber | uncommon | 1 | 2/11 | reach, strangle | 19.13 | +37.0 ± 7.1 | +6.2 | 0.32 | 1.2308 | +1.5 | 2.54 |
| Mist-net Otter | common | 0 | 2/10 | reach, web | 15.83 | +38.3 ± 7.2 | +6.4 | 0.40 | 1.5385 | +1.5 | 2.47 |
| Stable Colt | uncommon | 0 | 2/9 | - | 16.13 | +38.0 ± 6.9 | +6.3 | 0.39 | 1.5 | +1.5 | 2.53 |
| Frost Hare Sprinter | common | 0 | 2/5 | evasive | 14.33 | +38.8 ± 7.0 | +6.5 | 0.45 | 1.7308 | +1.5 | 2.47 |
| Mountain Hare | common | 0 | 2/4 | evasive, frostbite | 12.88 | +39.3 ± 7.1 | +6.5 | 0.51 | 1.9615 | +1.5 | 2.42 |
| Shell-Cracker | common | 0 | 2/9 | - | 13.09 | +39.0 ± 6.9 | +6.5 | 0.50 | 1.9231 | +1.4 | 2.43 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 20.37 | +35.8 ± 7.0 | +6.0 | 0.29 | 1.1154 | +1.4 | 2.36 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 12.88 | +39.0 ± 6.8 | +6.5 | 0.50 | 1.9231 | +1.4 | 2.45 |
| Snow Ermine | common | 0 | 2/4 | evasive, frost | 14.33 | +38.3 ± 7.0 | +6.4 | 0.44 | 1.6923 | +1.4 | 2.35 |
| Petal Fletcher | common | 0 | 2/2 | arrow, flying | 12.47 | +39.0 ± 6.8 | +6.5 | 0.52 | 2 | +1.4 | 2.39 |
| Hush-Wing Spy | common | 0 | 3/3 | flying, stealth | 15.83 | +37.5 ± 7.5 | +6.3 | 0.39 | 1.5 | +1.4 | 2.14 |
| Ant Warrior | uncommon | 0 | 2/4 | rage, swarm | 13.92 | +38.0 ± 7.2 | +6.3 | 0.45 | 1.7308 | +1.3 | 2.17 |
| Fox Kit | common | 0 | 2/9 | - | 13.52 | +38.0 ± 6.9 | +6.3 | 0.47 | 1.8077 | +1.3 | 2.21 |
| Tunnel Ant | rare | 1 | 2/9 | ambush, swarm, swarmN | 19.13 | +35.5 ± 7.6 | +5.9 | 0.31 | 1.1923 | +1.3 | 1.99 |
| Truffle Piglet | uncommon | 1 | 2/9 | onReadyGold | 19.55 | +35.3 ± 6.8 | +5.9 | 0.30 | 1.1538 | +1.3 | 2.21 |
| Coral Polyp Colony | common | 0 | 0/9 | onReadyGold, tide | 16.24 | +36.5 ± 6.8 | +6.1 | 0.37 | 1.4231 | +1.2 | 2.13 |
| Dawn Bellringer | uncommon | 1 | 3/3 | diurnal, diurnalHp, flying | 16.1 | +36.5 ± 7.8 | +6.1 | 0.38 | 1.4615 | +1.2 | 1.85 |
| Lyrebird Mimic | uncommon | 1 | 4/8 | confuse | 19.55 | +35.0 ± 7.1 | +5.8 | 0.30 | 1.1538 | +1.2 | 2.03 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 14.79 | +37.0 ± 6.8 | +6.2 | 0.42 | 1.6154 | +1.2 | 2.1 |
| Ferry Toll-Frog | common | 0 | 2/7 | triggers | 12.47 | +38.0 ± 7.0 | +6.3 | 0.51 | 1.9615 | +1.2 | 2.03 |
| Pelican Diver | rare | 1 | 2/9 | flying, triggers | 20.58 | +34.3 ± 7.2 | +5.7 | 0.28 | 1.0769 | +1.2 | 1.92 |
| Abyss Lantern Squid | uncommon | 1 | 3/16 | shock, tide | 24.66 | +32.5 ± 7.7 | +5.4 | 0.22 | 0.8462 | +1.2 | 1.79 |
| Spitting Spider | uncommon | 1 | 4/6 | poisonBolt | 20.99 | +34.0 ± 7.3 | +5.7 | 0.27 | 1.0385 | +1.2 | 1.88 |
| Mangrove Manatee | rare | 1 | 7/7 | guardian, regen, tide | 29.26 | +30.3 ± 7.1 | +5.0 | 0.17 | 0.6538 | +1.1 | 1.86 |
| Apollo Butterfly | uncommon | 0 | 1/8 | flying, thorns | 17.27 | +35.3 ± 6.8 | +5.9 | 0.34 | 1.3077 | +1.1 | 1.93 |
| Pyrenean Desman | uncommon | 0 | 2/10 | tide | 16.03 | +35.8 ± 6.9 | +6.0 | 0.37 | 1.4231 | +1.1 | 1.87 |
| Bombardier Beetle | uncommon | 1 | 3/10 | rocket | 23.42 | +32.5 ± 6.9 | +5.4 | 0.23 | 0.8846 | +1.1 | 1.86 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 22.85 | +32.3 ± 7.3 | +5.4 | 0.24 | 0.9231 | +1.0 | 1.62 |
| Wound Reaver | rare | 1 | 1/14 | bleed, rupture | 22.23 | +32.5 ± 7.6 | +5.4 | 0.24 | 0.9231 | +1.0 | 1.55 |
| Net Thrower | uncommon | 1 | 3/11 | boomerang | 19.13 | +33.8 ± 7.1 | +5.6 | 0.29 | 1.1154 | +1.0 | 1.64 |
| Conch Crawler | common | 0 | 2/2 | shell, shield, tide | 14.79 | +35.5 ± 7.2 | +5.9 | 0.40 | 1.5385 | +1.0 | 1.58 |
| Cone-cutter Squirrel | common | 0 | 2/6 | triggers | 17.69 | +34.3 ± 6.6 | +5.7 | 0.32 | 1.2308 | +1.0 | 1.74 |
| Cave Olm | common | 0 | 1/11 | regen | 16.24 | +34.8 ± 6.7 | +5.8 | 0.36 | 1.3846 | +0.9 | 1.64 |
| Chapel Tortoise | uncommon | 0 | 1/10 | prayer, prayerWard | 20.17 | +33.0 ± 6.8 | +5.5 | 0.27 | 1.0385 | +0.9 | 1.61 |
| Muskrat Reedgatherer | common | 0 | 1/8 | stockpile | 14.79 | +35.3 ± 6.8 | +5.9 | 0.40 | 1.5385 | +0.9 | 1.62 |
| Fire Drake Hatchling | heroic | 2 | 6/11 | fireArrow | 33.96 | +27.0 ± 6.7 | +4.5 | 0.13 | 0.5 | +0.9 | 1.61 |
| Duckling Squadron | common | 0 | 1/9 | flying | 16.73 | +34.3 ± 6.7 | +5.7 | 0.34 | 1.3077 | +0.9 | 1.58 |
| Pack Mule | common | 0 | 1/11 | bounty | 15.57 | +34.8 ± 7.0 | +5.8 | 0.37 | 1.4231 | +0.9 | 1.51 |
| Roadrunner Courier | common | 1 | 3/7 | haste | 16.6 | +34.3 ± 7.3 | +5.7 | 0.34 | 1.3077 | +0.9 | 1.44 |
| Box Turtle | common | 0 | 2/7 | cower | 11.44 | +36.5 ± 7.1 | +6.1 | 0.53 | 2.0385 | +0.9 | 1.47 |
| Marsh Wisp | common | 0 | 2/6 | remember, triggers | 14.79 | +35.0 ± 7.0 | +5.8 | 0.39 | 1.5 | +0.9 | 1.47 |
| Glass Changeling | rare | 1 | 3/7 | changeling, flying | 21.82 | +32.0 ± 7.0 | +5.3 | 0.24 | 0.9231 | +0.9 | 1.47 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 18.67 | +33.3 ± 7.6 | +5.5 | 0.30 | 1.1538 | +0.9 | 1.34 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 15.83 | +34.5 ± 6.6 | +5.8 | 0.36 | 1.3846 | +0.9 | 1.56 |
| Testudo Tortoise | rare | 2 | 4/12 | armor, guardian | 30.45 | +28.0 ± 6.9 | +4.7 | 0.15 | 0.5769 | +0.8 | 1.42 |
| Chipmunk Hoarder | common | 0 | 2/5 | onReadyGold | 16.24 | +34.0 ± 6.8 | +5.7 | 0.35 | 1.3462 | +0.8 | 1.41 |
| Snow Bunting Archer | uncommon | 1 | 2/6 | iceArrow | 20.99 | +32.0 ± 6.9 | +5.3 | 0.25 | 0.9615 | +0.8 | 1.4 |
| Star-nosed Mole | common | 0 | 5/5 | purblind | 13.09 | +35.3 ± 7.2 | +5.9 | 0.45 | 1.7308 | +0.8 | 1.33 |
| Sandfish | common | 1 | 3/11 | invisible | 19.96 | +32.3 ± 7.2 | +5.4 | 0.27 | 1.0385 | +0.8 | 1.3 |
| Snow Owl Sentinel | superrare | 1 | 4/4 | expose, flying, nocturnal | 25.54 | +29.5 ± 7.6 | +4.9 | 0.19 | 0.7308 | +0.7 | 1.15 |
| Glimmer Spider | uncommon | 1 | 3/11 | poison | 20.99 | +31.5 ± 7.3 | +5.3 | 0.25 | 0.9615 | +0.7 | 1.2 |
| Trebuchet Crew | rare | 2 | 0/24 | siege, volley | 34.84 | +25.5 ± 6.8 | +4.3 | 0.12 | 0.4615 | +0.7 | 1.27 |
| Pinecone Sapper | common | 0 | 0/13 | explode | 17.69 | +32.8 ± 6.7 | +5.5 | 0.31 | 1.1923 | +0.7 | 1.26 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 19.94 | +31.8 ± 7.3 | +5.3 | 0.27 | 1.0385 | +0.7 | 1.15 |
| Mangrove Monitor | common | 1 | 3/13 | - | 19.44 | +31.8 ± 6.8 | +5.3 | 0.27 | 1.0385 | +0.7 | 1.15 |
| River Carp | starter | 0 | 2/10 | - | 14.45 | +33.8 ± 6.8 | +5.6 | 0.39 | 1.5 | +0.7 | 1.13 |
| Duck Paddler | starter | 0 | 2/10 | - | 14.45 | +33.8 ± 6.8 | +5.6 | 0.39 | 1.5 | +0.7 | 1.13 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 19.7 | +31.5 ± 7.3 | +5.3 | 0.27 | 1.0385 | +0.7 | 1.05 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 15.16 | +33.3 ± 7.1 | +5.5 | 0.37 | 1.4231 | +0.6 | 1.03 |
| Burrow Rabbit | starter | 0 | 2/10 | - | 14.45 | +33.3 ± 6.8 | +5.5 | 0.38 | 1.4615 | +0.6 | 0.98 |
| Parrotfish | common | 0 | 2/9 | pierce, tide | 16.24 | +32.5 ± 6.9 | +5.4 | 0.33 | 1.2692 | +0.6 | 0.97 |
| Bramblewood Lynx | rare | 1 | 5/7 | - | 21.61 | +30.0 ± 7.3 | +5.0 | 0.23 | 0.8846 | +0.5 | 0.87 |
| Fire Salamander | uncommon | 1 | 3/7 | spitfire | 22.03 | +29.8 ± 6.6 | +5.0 | 0.23 | 0.8846 | +0.5 | 0.94 |
| Pumice Beetle | uncommon | 1 | 3/12 | triggers | 20.99 | +30.3 ± 7.2 | +5.0 | 0.24 | 0.9231 | +0.5 | 0.87 |
| Owl Nightwatch | common | 1 | 1/5 | flying, nocturnal, stealth | 18.51 | +31.0 ± 7.1 | +5.2 | 0.28 | 1.0769 | +0.5 | 0.81 |
| Terrier Pup | common | 0 | 2/8 | - | 12.01 | +33.5 ± 6.7 | +5.6 | 0.46 | 1.7692 | +0.4 | 0.75 |
| Bramble Sprout | common | 0 | 2/8 | - | 12.01 | +33.5 ± 6.7 | +5.6 | 0.46 | 1.7692 | +0.4 | 0.75 |
| Alligator Gar | rare | 1 | 5/5 | armor, bleed, tide | 24.04 | +28.2 ± 7.4 | +4.7 | 0.20 | 0.7692 | +0.4 | 0.67 |
| Kinkajou Lurker | uncommon | 1 | 4/6 | nocturnal, nocturnalGrant | 22.26 | +29.0 ± 7.2 | +4.8 | 0.22 | 0.8462 | +0.4 | 0.67 |
| Caustic Scorpion | uncommon | 1 | 1/18 | poison | 25.7 | +27.3 ± 7.4 | +4.5 | 0.18 | 0.6923 | +0.4 | 0.58 |
| Cricket Drummer | common | 0 | 2/8 | - | 12.22 | +33.0 ± 6.7 | +5.5 | 0.45 | 1.7308 | +0.4 | 0.65 |
| Land Tiller | common | 0 | 1/6 | onReadyGold | 16.19 | +31.3 ± 6.6 | +5.2 | 0.32 | 1.2308 | +0.4 | 0.64 |
| Nectar Sipper | common | 0 | 2/4 | flying | 12.72 | +32.8 ± 7.1 | +5.5 | 0.43 | 1.6538 | +0.4 | 0.6 |
| Field Mouse | common | 0 | 2/8 | - | 12.01 | +33.0 ± 6.7 | +5.5 | 0.46 | 1.7692 | +0.4 | 0.62 |
| Dormouse | common | 0 | 2/8 | - | 12.01 | +33.0 ± 6.7 | +5.5 | 0.46 | 1.7692 | +0.4 | 0.62 |
| Weaver Bird | common | 1 | 3/6 | tangle | 16.6 | +31.0 ± 7.1 | +5.2 | 0.31 | 1.1923 | +0.4 | 0.58 |
| Beaver Lumberjack | common | 0 | 4/4 | stockpile | 14.79 | +31.5 ± 6.9 | +5.3 | 0.35 | 1.3462 | +0.3 | 0.51 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 17.27 | +30.3 ± 6.7 | +5.0 | 0.29 | 1.1154 | +0.3 | 0.48 |
| Trash Panda Trickster | common | 0 | 2/4 | bounty, nocturnal | 12.88 | +32.0 ± 7.2 | +5.3 | 0.41 | 1.5769 | +0.2 | 0.39 |
| Shimmerwing Stag | veryrare | 1 | 2/13 | evasive | 26.73 | +26.0 ± 7.1 | +4.3 | 0.16 | 0.6154 | +0.2 | 0.38 |
| Tasmanian Devil | uncommon | 1 | 1/11 | berserk | 19.55 | +29.0 ± 7.1 | +4.8 | 0.25 | 0.9615 | +0.2 | 0.36 |
| Chipmunk Skirmisher | common | 0 | 2/8 | - | 12.01 | +32.0 ± 6.6 | +5.3 | 0.44 | 1.6923 | +0.2 | 0.32 |
| Mallard Halberdier | rare | 1 | 4/8 | pierce, reach | 24.09 | +26.8 ± 7.0 | +4.5 | 0.19 | 0.7308 | +0.2 | 0.28 |
| Polar Bear | veryrare | 1 | 2/17 | ambush, hibernate | 27.56 | +25.3 ± 7.4 | +4.2 | 0.15 | 0.5769 | +0.2 | 0.27 |
| Otter Guard | uncommon | 1 | 3/6 | arrow | 18.1 | +29.0 ± 7.1 | +4.8 | 0.27 | 1.0385 | +0.1 | 0.2 |
| Inkcloud Squid | common | 0 | 1/8 | evasive, tide | 17.48 | +29.3 ± 6.7 | +4.9 | 0.28 | 1.0769 | +0.1 | 0.19 |
| Bogfire Newt | uncommon | 0 | 1/10 | detonate, poison | 16.03 | +29.5 ± 6.7 | +4.9 | 0.31 | 1.1923 | +0.1 | 0.1 |
| Goose Sentry | rare | 1 | 3/10 | sentry, taunt | 24.09 | +26.0 ± 6.9 | +4.3 | 0.18 | 0.6923 | +0.0 | 0.07 |
| Ember Revenant | epic | 2 | 4/15 | pierce, undead | 29.67 | +23.5 ± 6.5 | +3.9 | 0.13 | 0.5 | +0.0 | 0.05 |
| Mouse Sapper | common | 1 | 3/11 | siege | 18.51 | +28.0 ± 7.1 | +4.7 | 0.25 | 0.9615 | -0.0 | -0.02 |
| Kittiwake Flock | common | 0 | 1/3 | flying, swarm | 11.44 | +31.0 ± 7.0 | +5.2 | 0.45 | 1.7308 | -0.0 | -0.03 |
| Riptide Eel | uncommon | 1 | 9/6 | reload, tide | 19.55 | +27.5 ± 7.7 | +4.6 | 0.23 | 0.8846 | -0.0 | -0.05 |
| Meadow Rabbit | starter | 0 | 4/2 | - | 10.92 | +31.0 ± 7.0 | +5.2 | 0.47 | 1.8077 | -0.1 | -0.1 |
| Ruby-Throat Duelist | rare | 0 | 3/2 | flying, pierce, quick | 17.89 | +28.0 ± 7.0 | +4.7 | 0.26 | 1 | -0.1 | -0.1 |
| Leathery Egg | uncommon | 0 | 0/3 | - | 73.42 | +4.0 ± 4.6 | +0.7 | 0.01 | 0.0385 | -0.1 | -0.26 |
| Tomcat | common | 0 | 3/2 | quick | 11.44 | +30.5 ± 7.1 | +5.1 | 0.44 | 1.6923 | -0.1 | -0.18 |
| Caiman Hatchling | common | 0 | 3/2 | quick | 11.44 | +30.5 ± 7.1 | +5.1 | 0.44 | 1.6923 | -0.1 | -0.18 |
| Hedgerow Shrew | common | 0 | 3/2 | quick | 11.44 | +30.5 ± 7.1 | +5.1 | 0.44 | 1.6923 | -0.1 | -0.18 |
| Acorn Chipmunk | starter | 0 | 3/4 | - | 10.92 | +30.5 ± 6.7 | +5.1 | 0.47 | 1.8077 | -0.1 | -0.26 |
| Cottontail | starter | 0 | 4/2 | - | 10.92 | +30.3 ± 6.9 | +5.0 | 0.46 | 1.7692 | -0.2 | -0.32 |
| Meerkat Wayfarer | common | 0 | 2/5 | inspiring, reach | 14.79 | +28.5 ± 6.5 | +4.8 | 0.32 | 1.2308 | -0.2 | -0.36 |
| Ant Hill | common | 2 | 0/22 | triggers | 28.02 | +22.8 ± 6.8 | +3.8 | 0.14 | 0.5385 | -0.2 | -0.38 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 16.24 | +27.8 ± 7.1 | +4.6 | 0.28 | 1.0769 | -0.2 | -0.37 |
| Pond Trout | starter | 0 | 3/4 | - | 10.92 | +30.0 ± 6.7 | +5.0 | 0.46 | 1.7692 | -0.2 | -0.41 |
| Sunspire Envoy | rare | 1 | 1/8 | esprit, flying | 20.17 | +25.8 ± 7.1 | +4.3 | 0.21 | 0.8077 | -0.3 | -0.47 |
| Pond Duck | starter | 0 | 3/4 | - | 10.92 | +29.5 ± 6.6 | +4.9 | 0.45 | 1.7308 | -0.3 | -0.55 |
| Reefback Turtle | veryrare | 2 | 2/20 | guardian, shell | 29.42 | +21.5 ± 6.8 | +3.6 | 0.12 | 0.4615 | -0.3 | -0.57 |
| Otter Paddler | starter | 0 | 3/4 | - | 10.92 | +29.0 ± 6.6 | +4.8 | 0.44 | 1.6923 | -0.4 | -0.71 |
| Mirror Moth | rare | 1 | 2/5 | evasive, flying, reflect | 21.82 | +24.3 ± 7.1 | +4.0 | 0.19 | 0.7308 | -0.4 | -0.68 |
| Snail Mail | uncommon | 0 | 0/1 | armor, triggers | 22.39 | +24.0 ± 6.3 | +4.0 | 0.18 | 0.6923 | -0.4 | -0.77 |
| Snowshoe Hare | common | 0 | 1/7 | evasive | 14.33 | +26.8 ± 6.3 | +4.5 | 0.31 | 1.1923 | -0.5 | -0.97 |
| Fathom Leviathan | legendary | 4 | 5/25 | supreme, tide, tsunami, wave | 50.5 | +11.3 ± 6.0 | +1.9 | 0.04 | 0.1538 | -0.5 | -1.01 |
| Swordbill Challenger | rare | 0 | 1/6 | counterattack, flying, taunt | 17.89 | +25.3 ± 6.6 | +4.2 | 0.24 | 0.9231 | -0.5 | -0.92 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 25.9 | +21.8 ± 6.8 | +3.6 | 0.14 | 0.5385 | -0.5 | -0.92 |
| Quillguard | rare | 1 | 2/22 | - | 26.76 | +21.3 ± 7.4 | +3.5 | 0.13 | 0.5 | -0.6 | -0.89 |
| Honey Bee | starter | 0 | 2/3 | flying | 10.61 | +28.0 ± 6.6 | +4.7 | 0.44 | 1.6923 | -0.6 | -1.03 |
| Riverside Peddler | common | 0 | 1/7 | bounty | 12.47 | +27.3 ± 6.6 | +4.5 | 0.36 | 1.3846 | -0.6 | -1.03 |
| Goliath Broodmother | legendary | 3 | 4/24 | inspiring, onDeathSpawn | 42.07 | +14.5 ± 5.9 | +2.4 | 0.06 | 0.2308 | -0.6 | -1.15 |
| Meadow Frog | common | 0 | 2/6 | - | 12.01 | +27.3 ± 6.5 | +4.5 | 0.38 | 1.4615 | -0.6 | -1.11 |
| Electric Ray | uncommon | 1 | 3/8 | charge | 20.17 | +23.8 ± 6.9 | +4.0 | 0.20 | 0.7692 | -0.6 | -1.03 |
| Den Bundle | uncommon | 0 | 0/3 | - | 65.01 | +4.5 ± 4.4 | +0.8 | 0.01 | 0.0385 | -0.6 | -1.64 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 24.87 | +21.5 ± 6.5 | +3.6 | 0.14 | 0.5385 | -0.7 | -1.18 |
| Mountain Goat Climber | uncommon | 0 | 1/6 | evasive | 16.81 | +24.8 ± 6.1 | +4.1 | 0.25 | 0.9615 | -0.7 | -1.3 |
| Bog Leech | uncommon | 0 | 1/8 | bleed | 12.68 | +26.5 ± 6.5 | +4.4 | 0.35 | 1.3462 | -0.7 | -1.22 |
| Bramble Hoglet | common | 0 | 1/9 | regen | 13.92 | +26.0 ± 6.5 | +4.3 | 0.31 | 1.1923 | -0.7 | -1.22 |
| Snow Leopard | veryrare | 1 | 2/16 | mountainClimber | 24.51 | +21.5 ± 6.9 | +3.6 | 0.15 | 0.5769 | -0.7 | -1.15 |
| Whip Spider | uncommon | 1 | 3/7 | bleed, sonar | 19.55 | +23.5 ± 7.1 | +3.9 | 0.20 | 0.7692 | -0.7 | -1.15 |
| Pincushion Urchin | common | 0 | 3/3 | thorns, tide | 14.79 | +25.5 ± 6.8 | +4.3 | 0.29 | 1.1154 | -0.7 | -1.21 |
| Stag Knight | common | 2 | 5/16 | - | 26.33 | +20.5 ± 6.2 | +3.4 | 0.13 | 0.5 | -0.7 | -1.34 |
| Thorn Shrike | rare | 1 | 3/3 | bleed, flying | 20.58 | +23.0 ± 6.6 | +3.8 | 0.19 | 0.7308 | -0.7 | -1.26 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 28.38 | +19.5 ± 6.3 | +3.3 | 0.11 | 0.4231 | -0.7 | -1.36 |
| Otter Scout | rare | 0 | 1/13 | - | 15.27 | +25.0 ± 6.6 | +4.2 | 0.27 | 1.0385 | -0.8 | -1.33 |
| Cobalt Fledgling | starter | 0 | 2/3 | flying | 10.61 | +27.0 ± 6.6 | +4.5 | 0.42 | 1.6154 | -0.8 | -1.34 |
| Crimson Wing Duelist Cadet | starter | 0 | 2/4 | diurnal, flying | 15.09 | +25.0 ± 6.6 | +4.2 | 0.28 | 1.0769 | -0.8 | -1.36 |
| Cobalt Talon Skirmisher | starter | 0 | 2/4 | diurnal, flying | 15.09 | +25.0 ± 6.6 | +4.2 | 0.28 | 1.0769 | -0.8 | -1.36 |
| Plains Zebra | uncommon | 0 | 1/6 | evasive | 15.36 | +24.8 ± 6.1 | +4.1 | 0.27 | 1.0385 | -0.8 | -1.5 |
| Marsh Harrier | uncommon | 1 | 3/5 | flying, predator | 18.31 | +23.5 ± 6.7 | +3.9 | 0.21 | 0.8077 | -0.8 | -1.38 |
| Crimson Recruit | starter | 0 | 3/1 | flying | 10.61 | +26.8 ± 6.9 | +4.5 | 0.42 | 1.6154 | -0.8 | -1.35 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 20.99 | +22.3 ± 6.7 | +3.7 | 0.18 | 0.6923 | -0.8 | -1.41 |
| House Cat | common | 0 | 3/3 | - | 12.01 | +26.0 ± 6.4 | +4.3 | 0.36 | 1.3846 | -0.8 | -1.5 |
| Grass Viper | uncommon | 0 | 1/8 | poison | 13.5 | +25.3 ± 6.6 | +4.2 | 0.31 | 1.1923 | -0.8 | -1.47 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 50.29 | +9.5 ± 6.0 | +1.6 | 0.03 | 0.1154 | -0.8 | -1.66 |
| Dhole Matriarch | veryrare | 2 | 4/22 | packLeader | 30.04 | +18.0 ± 6.7 | +3.0 | 0.10 | 0.3846 | -0.9 | -1.5 |
| Robin Redbreast | uncommon | 0 | 2/2 | diurnal, flying | 12.93 | +25.3 ± 6.9 | +4.2 | 0.33 | 1.2692 | -0.9 | -1.48 |
| Rabbit Kit | common | 0 | 2/3 | evasive | 11.44 | +25.8 ± 6.4 | +4.3 | 0.38 | 1.4615 | -0.9 | -1.66 |
| Crossed-Eyes | starter | 0 | 3/3 | - | 10.92 | +26.0 ± 6.4 | +4.3 | 0.40 | 1.5385 | -0.9 | -1.65 |
| Soldier Ant | common | 0 | 2/5 | swarm | 14.79 | +24.3 ± 6.3 | +4.0 | 0.27 | 1.0385 | -0.9 | -1.71 |
| War Elephant | superrare | 3 | 0/28 | armor, arrow, arrowCount | 40.01 | +13.3 ± 6.0 | +2.2 | 0.06 | 0.2308 | -0.9 | -1.86 |
| Nectar Vintner | common | 0 | 2/1 | flying, healing | 12.47 | +25.0 ± 6.6 | +4.2 | 0.33 | 1.2692 | -0.9 | -1.69 |
| Taiga Lynx | rare | 1 | 2/8 | evasive | 19.08 | +22.0 ± 6.8 | +3.7 | 0.19 | 0.7308 | -1.0 | -1.67 |
| Quillback Elder | common | 2 | 5/5 | armor | 25.08 | +19.5 ± 6.6 | +3.3 | 0.13 | 0.5 | -1.0 | -1.73 |
| Field Vole | common | 0 | 1/6 | swarm | 11.44 | +25.3 ± 6.5 | +4.2 | 0.37 | 1.4231 | -1.0 | -1.78 |
| Otter Netmender | common | 0 | 1/8 | armor | 12.47 | +24.8 ± 6.4 | +4.1 | 0.33 | 1.2692 | -1.0 | -1.81 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 11.44 | +25.0 ± 6.6 | +4.2 | 0.36 | 1.3846 | -1.0 | -1.81 |
| Cinder Stoker | common | 0 | 1/11 | heat | 14.33 | +23.8 ± 6.4 | +4.0 | 0.28 | 1.0769 | -1.0 | -1.88 |
| Woodcock Lookout | common | 0 | 1/7 | crepuscular, keenEye | 14.79 | +23.5 ± 6.3 | +3.9 | 0.26 | 1 | -1.0 | -1.91 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake | 53.8 | +6.8 ± 5.8 | +1.1 | 0.02 | 0.0769 | -1.0 | -2.12 |
| Truce Heron | rare | 1 | 2/11 | flying, guardian | 24.04 | +19.5 ± 6.4 | +3.3 | 0.14 | 0.5385 | -1.0 | -1.91 |
| Badger Trench Digger | common | 2 | 4/18 | guardian, lastStand | 28.38 | +17.5 ± 6.5 | +2.9 | 0.10 | 0.3846 | -1.1 | -1.9 |
| Lone Grey Wolf | veryrare | 1 | 2/9 | loneWolf | 27.56 | +17.8 ± 6.1 | +3.0 | 0.11 | 0.4231 | -1.1 | -2.08 |
| Grey Seal Bull | uncommon | 1 | 4/11 | guardian, tide | 22.39 | +20.0 ± 6.5 | +3.3 | 0.15 | 0.5769 | -1.1 | -1.96 |
| Riverbed Diver | uncommon | 1 | 3/6 | evasive | 19.13 | +21.3 ± 6.6 | +3.5 | 0.19 | 0.7308 | -1.1 | -1.96 |
| Hawthorn Shieldbug | common | 1 | 2/12 | armor | 18.51 | +21.5 ± 6.7 | +3.6 | 0.19 | 0.7308 | -1.1 | -1.94 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 18.31 | +21.5 ± 6.8 | +3.6 | 0.20 | 0.7692 | -1.1 | -1.95 |
| Fire Ant Raft | uncommon | 1 | 2/7 | poison, swarm, tide | 18.31 | +21.5 ± 7.2 | +3.6 | 0.20 | 0.7692 | -1.1 | -1.84 |
| Worker Ant | starter | 0 | 1/1 | triggers | 10.4 | +24.8 ± 6.1 | +4.1 | 0.40 | 1.5385 | -1.1 | -2.17 |
| Marshal of Rivergate | epic | 2 | 2/3 | armor, sweep | 29.83 | +16.5 ± 6.3 | +2.8 | 0.09 | 0.3462 | -1.1 | -2.11 |
| Barnacle Bulwark | rare | 2 | 2/21 | armor, guardian | 28.38 | +17.0 ± 6.6 | +2.8 | 0.10 | 0.3846 | -1.1 | -2.04 |
| Cypress Root Lurker | common | 1 | 4/11 | guardian | 20.94 | +20.0 ± 6.5 | +3.3 | 0.16 | 0.6154 | -1.2 | -2.14 |
| Reef Shark | common | 2 | 6/15 | tide | 29.47 | +16.3 ± 6.4 | +2.7 | 0.09 | 0.3462 | -1.2 | -2.17 |
| Warhorse Charger | common | 2 | 4/19 | - | 27.85 | +17.0 ± 6.2 | +2.8 | 0.10 | 0.3846 | -1.2 | -2.26 |
| Goliath Tentacle | epic | 2 | 7/8 | sweep, tide | 35.87 | +13.5 ± 6.3 | +2.3 | 0.06 | 0.2308 | -1.2 | -2.25 |
| Yeti | common | 3 | 5/29 | scare | 44.35 | +9.8 ± 5.8 | +1.6 | 0.04 | 0.1538 | -1.2 | -2.44 |
| Eagle Sharpshooter | common | 2 | 2/6 | arrow, diurnal, flying | 24.09 | +18.5 ± 6.6 | +3.1 | 0.13 | 0.5 | -1.2 | -2.14 |
| Hummingbird Needler | uncommon | 0 | 1/3 | bleed, flying, pierce | 13.5 | +23.0 ± 6.5 | +3.8 | 0.28 | 1.0769 | -1.2 | -2.2 |
| Rivergate Tribune | heroic | 3 | 4/18 | armor, kinship | 33.96 | +14.2 ± 6.1 | +2.4 | 0.07 | 0.2692 | -1.2 | -2.34 |
| Rivergate Drummer | uncommon | 0 | 3/3 | kinRally | 16.86 | +21.5 ± 6.2 | +3.6 | 0.21 | 0.8077 | -1.2 | -2.32 |
| Ash Imp | common | 0 | 2/7 | onSpawnDevilry, sacrifice | 15.98 | +21.8 ± 6.8 | +3.6 | 0.23 | 0.8846 | -1.2 | -2.13 |
| Fleetfoot'd | uncommon | 0 | 2/3 | quick, tide | 12.47 | +23.3 ± 6.3 | +3.9 | 0.31 | 1.1923 | -1.2 | -2.3 |
| Ant Scout | starter | 0 | 1/5 | swarm | 10.4 | +24.0 ± 6.5 | +4.0 | 0.38 | 1.4615 | -1.3 | -2.28 |
| River Bundle | uncommon | 0 | 0/3 | - | 57.14 | +4.0 ± 4.6 | +0.7 | 0.01 | 0.0385 | -1.3 | -3.24 |
| Alpine Swift | common | 0 | 2/3 | flying, quick | 16.24 | +21.5 ± 6.4 | +3.6 | 0.22 | 0.8462 | -1.3 | -2.35 |
| Sleepless Shrew | common | 0 | 2/7 | wakeful | 16.24 | +21.5 ± 6.4 | +3.6 | 0.22 | 0.8462 | -1.3 | -2.35 |
| Octopus Tactician | rare | 2 | 6/7 | sweep, tide | 27.14 | +16.8 ± 6.0 | +2.8 | 0.10 | 0.3846 | -1.3 | -2.49 |
| Dominion Nestguard | common | 1 | 4/4 | flying | 18.46 | +20.3 ± 6.5 | +3.4 | 0.18 | 0.6923 | -1.3 | -2.36 |
| Ash Cloud Condor | rare | 1 | 3/3 | flying, triggers | 23.27 | +18.0 ± 6.3 | +3.0 | 0.13 | 0.5 | -1.3 | -2.49 |
| Golden Eagle Diver | uncommon | 1 | 2/2 | diurnal, flying, pounce | 15.36 | +21.3 ± 7.2 | +3.5 | 0.23 | 0.8846 | -1.4 | -2.25 |
| Riverwing Envoy | uncommon | 0 | 1/6 | esprit | 12.47 | +22.5 ± 6.1 | +3.8 | 0.30 | 1.1538 | -1.4 | -2.64 |
| Gorge Wyrm | common | 3 | 2/26 | earthquake, sweep | 38.92 | +11.0 ± 5.8 | +1.8 | 0.05 | 0.1923 | -1.4 | -2.83 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 19.96 | +19.0 ± 6.5 | +3.2 | 0.16 | 0.6154 | -1.4 | -2.53 |
| Coral Reef Shark | uncommon | 2 | 5/10 | tide | 22.23 | +18.0 ± 6.0 | +3.0 | 0.13 | 0.5 | -1.4 | -2.79 |
| Skull Vulture | uncommon | 1 | 3/3 | daunt, flying, nocturnal | 20.99 | +18.5 ± 6.7 | +3.1 | 0.15 | 0.5769 | -1.4 | -2.52 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 11.44 | +22.5 ± 6.3 | +3.8 | 0.33 | 1.2692 | -1.4 | -2.7 |
| Otter Kit | starter | 0 | 2/5 | - | 10.92 | +22.8 ± 6.3 | +3.8 | 0.35 | 1.3462 | -1.4 | -2.69 |
| Woodpecker Sapper | uncommon | 1 | 4/4 | perforate | 19.55 | +19.0 ± 7.0 | +3.2 | 0.16 | 0.6154 | -1.4 | -2.42 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 29.42 | +14.8 ± 6.0 | +2.5 | 0.08 | 0.3077 | -1.5 | -2.86 |
| Berserker Boar | common | 2 | 3/9 | rage | 21.2 | +18.3 ± 6.5 | +3.0 | 0.14 | 0.5385 | -1.5 | -2.61 |
| The Magnate Duck | epic | 4 | 2/37 | armor, bounty, hoard, king, midas | 49.67 | +5.8 ± 5.8 | +1.0 | 0.02 | 0.0769 | -1.5 | -3.05 |
| Sand Widow | common | 2 | 2/17 | poison | 26.52 | +15.5 ± 6.0 | +2.6 | 0.10 | 0.3846 | -1.5 | -2.98 |
| Fiddler Crab Swarm | common | 0 | 1/8 | crabClaws, tide | 11.85 | +21.8 ± 6.6 | +3.6 | 0.31 | 1.1923 | -1.5 | -2.71 |
| Elderhorn Monarch | common | 3 | 2/30 | onReadyGold | 40.99 | +9.3 ± 5.6 | +1.5 | 0.04 | 0.1538 | -1.5 | -3.23 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 16.86 | +19.5 ± 6.4 | +3.3 | 0.19 | 0.7308 | -1.6 | -2.84 |
| Slow-worm | common | 0 | 1/9 | undead | 14.79 | +20.3 ± 5.9 | +3.4 | 0.23 | 0.8846 | -1.6 | -3.13 |
| Sea Turtle Elder | common | 2 | 4/9 | armor, tide | 28.02 | +14.5 ± 6.2 | +2.4 | 0.09 | 0.3462 | -1.6 | -3 |
| Swift Fox | common | 1 | 3/3 | fastForward | 15.16 | +20.0 ± 6.7 | +3.3 | 0.22 | 0.8462 | -1.6 | -2.81 |
| River Warden | rare | 2 | 4/13 | tide | 22.85 | +16.5 ± 6.1 | +2.8 | 0.12 | 0.4615 | -1.6 | -3.11 |
| Cave Warlord | common | 4 | 6/29 | daunt, onReadyDamage | 47.86 | +5.8 ± 5.8 | +1.0 | 0.02 | 0.0769 | -1.6 | -3.32 |
| Boreal Elk | common | 2 | 5/6 | sweep | 22.65 | +16.5 ± 6.3 | +2.8 | 0.12 | 0.4615 | -1.6 | -3.07 |
| Marshal Tuskwell | epic | 4 | 1/26 | armor, inspiring, overwhelm, vanguard | 44.71 | +7.0 ± 6.0 | +1.2 | 0.03 | 0.1154 | -1.6 | -3.23 |
| Banded Sea Krait | uncommon | 1 | 4/4 | nocturnal, venomous | 19.96 | +17.5 ± 7.4 | +2.9 | 0.15 | 0.5769 | -1.7 | -2.63 |
| Alpine Salamander | common | 1 | 2/10 | regen | 18.51 | +18.0 ± 6.7 | +3.0 | 0.16 | 0.6154 | -1.7 | -2.93 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 19.55 | +17.5 ± 7.1 | +2.9 | 0.15 | 0.5769 | -1.7 | -2.79 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 21.41 | +16.8 ± 6.8 | +2.8 | 0.13 | 0.5 | -1.7 | -2.93 |
| Puffin Diver | common | 1 | 2/5 | dive, flying, tide | 17.69 | +18.3 ± 6.8 | +3.0 | 0.17 | 0.6538 | -1.7 | -2.95 |
| Greenland Shark | rare | 1 | 1/23 | armor, carrion, tide | 31.74 | +12.3 ± 7.0 | +2.0 | 0.06 | 0.2308 | -1.7 | -2.84 |
| Peak Condor | common | 1 | 4/7 | flying, reload | 17.07 | +18.5 ± 6.5 | +3.1 | 0.18 | 0.6923 | -1.7 | -3.1 |
| Mangrove Mudskipper | common | 0 | 1/9 | tide | 12.88 | +20.3 ± 6.2 | +3.4 | 0.26 | 1 | -1.7 | -3.24 |
| Candle Moth | common | 0 | 1/5 | flying, prayer | 15.78 | +19.0 ± 6.5 | +3.2 | 0.20 | 0.7692 | -1.7 | -3.07 |
| Ash Moth | common | 1 | 1/8 | flying, nocturnal | 16.93 | +18.5 ± 6.2 | +3.1 | 0.18 | 0.6923 | -1.7 | -3.25 |
| Komodo Warlord | common | 3 | 1/27 | gash, poison | 38.92 | +9.0 ± 5.7 | +1.5 | 0.04 | 0.1538 | -1.7 | -3.55 |
| Stone Turtle Warden | common | 2 | 4/4 | armor, tide | 23.63 | +15.5 ± 6.2 | +2.6 | 0.11 | 0.4231 | -1.7 | -3.3 |
| Springbok Pronker | common | 1 | 2/12 | prey | 16.6 | +18.5 ± 6.6 | +3.1 | 0.19 | 0.7308 | -1.7 | -3.08 |
| Muskrat Lodgekeeper | uncommon | 1 | 1/7 | bulwark, tide | 22.8 | +15.8 ± 6.4 | +2.6 | 0.12 | 0.4615 | -1.8 | -3.22 |
| Gale Swift | common | 0 | 1/4 | flying, storm | 12.88 | +20.0 ± 6.2 | +3.3 | 0.26 | 1 | -1.8 | -3.33 |
| Minnow Skitter | common | 0 | 1/9 | tide | 12.88 | +19.8 ± 6.2 | +3.3 | 0.26 | 1 | -1.8 | -3.43 |
| Clownfish Scout | common | 0 | 1/9 | tide | 12.88 | +19.8 ± 6.2 | +3.3 | 0.26 | 1 | -1.8 | -3.43 |
| Constrictor Coil | common | 2 | 4/16 | - | 24.81 | +14.5 ± 5.9 | +2.4 | 0.10 | 0.3846 | -1.8 | -3.6 |
| Grizzly Vanguard | common | 2 | 1/19 | sweep | 29.47 | +12.5 ± 5.7 | +2.1 | 0.07 | 0.2692 | -1.8 | -3.77 |
| Quill Volley | rare | 1 | 1/14 | pounce | 19.7 | +16.5 ± 6.4 | +2.8 | 0.14 | 0.5385 | -1.8 | -3.37 |
| Compost Grub | common | 0 | 1/10 | - | 12.01 | +19.8 ± 5.8 | +3.3 | 0.27 | 1.0385 | -1.9 | -3.74 |
| Kraken Spawnling | common | 3 | 2/16 | fork, gash | 28.18 | +12.8 ± 6.0 | +2.1 | 0.08 | 0.3077 | -1.9 | -3.64 |
| Mangrove Kingfisher | rare | 1 | 2/3 | evasive, flying | 17.64 | +17.3 ± 6.4 | +2.9 | 0.16 | 0.6154 | -1.9 | -3.44 |
| Badger Lumberjack | uncommon | 1 | 1/11 | lumberjack | 18.31 | +17.0 ± 6.2 | +2.8 | 0.15 | 0.5769 | -1.9 | -3.57 |
| Booming Bittern | uncommon | 1 | 1/12 | daunt, invisible | 19.34 | +16.5 ± 6.3 | +2.8 | 0.14 | 0.5385 | -1.9 | -3.49 |
| Stoneheart Golem | common | 2 | 3/23 | - | 34.63 | +9.8 ± 5.8 | +1.6 | 0.05 | 0.1923 | -1.9 | -3.83 |
| Gilded Roadwarden | common | 4 | 3/28 | overwhelm, pounce | 42.44 | +6.5 ± 5.5 | +1.1 | 0.03 | 0.1154 | -1.9 | -4.04 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 11.44 | +19.8 ± 6.5 | +3.3 | 0.29 | 1.1154 | -1.9 | -3.45 |
| Cinder Skeleton | common | 1 | 1/7 | requiem, undead | 16.6 | +17.5 ± 6.7 | +2.9 | 0.18 | 0.6923 | -1.9 | -3.34 |
| Water Vole | common | 0 | 1/4 | evasive, tide | 11.44 | +19.8 ± 5.8 | +3.3 | 0.29 | 1.1154 | -1.9 | -3.83 |
| Shepherd | common | 1 | 2/14 | guardian | 19.96 | +16.0 ± 6.1 | +2.7 | 0.13 | 0.5 | -1.9 | -3.68 |
| Daily Post | common | 0 | 1/1 | flying, triggers | 12.47 | +19.3 ± 5.8 | +3.2 | 0.26 | 1 | -1.9 | -3.87 |
| Oystercatcher | common | 1 | 2/6 | flying, pierce | 17.07 | +17.3 ± 6.2 | +2.9 | 0.17 | 0.6538 | -1.9 | -3.6 |
| Alpha Howler | common | 2 | 7/7 | sweep | 30.91 | +11.3 ± 5.7 | +1.9 | 0.06 | 0.2308 | -1.9 | -3.93 |
| Cave Bear | common | 3 | 4/13 | rage, siege | 29.62 | +11.8 ± 5.8 | +2.0 | 0.07 | 0.2692 | -1.9 | -3.94 |
| Speckled Egg | uncommon | 0 | 0/1 | - | 57.14 | +0.0 ± 1.4 | +0.0 | 0.00 | 0 | -1.9 | -16.31 |
| Woodland Egg | common | 0 | 0/2 | - | 48.73 | +3.5 ± 3.2 | +0.6 | 0.01 | 0.0385 | -1.9 | -7.13 |
| Owl Sentinel | common | 1 | 1/10 | flying, keenEye, nocturnal | 20.94 | +15.3 ± 6.0 | +2.5 | 0.12 | 0.4615 | -2.0 | -3.85 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 22.65 | +14.5 ± 5.8 | +2.4 | 0.11 | 0.4231 | -2.0 | -4.02 |
| Old Sturgeon | uncommon | 1 | 1/19 | armor, tide | 27.19 | +12.3 ± 6.6 | +2.0 | 0.08 | 0.3077 | -2.0 | -3.6 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 39.8 | +6.8 ± 5.7 | +1.1 | 0.03 | 0.1154 | -2.0 | -4.19 |
| Eyrie Warden | common | 3 | 3/13 | daunt, flying, onReadyDamage | 32.57 | +9.8 ± 5.6 | +1.6 | 0.05 | 0.1923 | -2.1 | -4.29 |
| Cane Toad | uncommon | 2 | 2/15 | greaterPoison, poison | 24.87 | +13.0 ± 5.7 | +2.2 | 0.09 | 0.3462 | -2.1 | -4.22 |
| Great Barracuda | rare | 1 | 4/4 | quick, tide | 21.2 | +14.5 ± 7.1 | +2.4 | 0.11 | 0.4231 | -2.1 | -3.43 |
| Bee Sentry | starter | 0 | 2/2 | flying, poison | 13.76 | +17.5 ± 6.0 | +2.9 | 0.21 | 0.8077 | -2.1 | -4.14 |
| Tidepool Trapper Crab | common | 0 | 1/7 | crabClaws, hunter, hunterVs | 11.44 | +18.5 ± 6.6 | +3.1 | 0.27 | 1.0385 | -2.1 | -3.73 |
| Rootworm Colony | common | 1 | 4/4 | poison | 18.72 | +15.3 ± 6.8 | +2.5 | 0.14 | 0.5385 | -2.1 | -3.69 |
| Cinder Hornet | common | 2 | 3/3 | flying, stunOnHit | 20.94 | +14.2 ± 6.2 | +2.4 | 0.11 | 0.4231 | -2.1 | -4.04 |
| Fungal Colossus | uncommon | 2 | 2/14 | bloomCopy, onDeathSpawn | 30.5 | +10.0 ± 5.3 | +1.7 | 0.05 | 0.1923 | -2.2 | -4.76 |
| Permafrost Mammoth | common | 3 | 8/8 | frostbite, nocturnal, sweep | 35.67 | +7.8 ± 5.6 | +1.3 | 0.04 | 0.1538 | -2.2 | -4.58 |
| Fishing Cat | rare | 1 | 1/14 | pounce | 20.58 | +14.2 ± 6.0 | +2.4 | 0.12 | 0.4615 | -2.2 | -4.23 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk | 27.56 | +11.0 ± 5.8 | +1.8 | 0.07 | 0.2692 | -2.2 | -4.46 |
| Platypus Spur | uncommon | 1 | 4/4 | venomous | 18.93 | +14.5 ± 6.7 | +2.4 | 0.13 | 0.5 | -2.2 | -3.9 |
| Swamp Alligator | common | 2 | 2/15 | armor | 23.63 | +12.5 ± 5.8 | +2.1 | 0.09 | 0.3462 | -2.2 | -4.51 |
| Violet Vane Fletcher | starter | 0 | 1/5 | flying | 11.67 | +17.5 ± 6.3 | +2.9 | 0.25 | 0.9615 | -2.3 | -4.23 |
| Cunning Vixen | uncommon | 1 | 1/10 | backstab, evasive | 20.58 | +13.8 ± 6.3 | +2.3 | 0.11 | 0.4231 | -2.3 | -4.21 |
| Rimeheart Colossus | epic | 3 | 3/19 | armor, freeze, frostbite, immolation | 36.29 | +7.0 ± 5.6 | +1.2 | 0.03 | 0.1154 | -2.3 | -4.72 |
| Forager Ant | common | 0 | 1/7 | triggers | 11.44 | +17.5 ± 5.8 | +2.9 | 0.25 | 0.9615 | -2.3 | -4.63 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 17.89 | +14.8 ± 6.4 | +2.5 | 0.14 | 0.5385 | -2.3 | -4.18 |
| Conch Herald | uncommon | 1 | 1/11 | inspiring, tide | 18.51 | +14.2 ± 6.2 | +2.4 | 0.13 | 0.5 | -2.3 | -4.39 |
| Dromedary | uncommon | 1 | 2/15 | drought, dry | 24.87 | +11.5 ± 6.9 | +1.9 | 0.08 | 0.3077 | -2.3 | -3.92 |
| Pond Algae | common | 0 | 1/7 | bloomCopy | 14.79 | +15.8 ± 5.5 | +2.6 | 0.18 | 0.6923 | -2.3 | -4.92 |
| Camouflage Frog | common | 1 | 2/6 | evasive, tide | 17.07 | +14.8 ± 6.0 | +2.5 | 0.14 | 0.5385 | -2.3 | -4.6 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 19.96 | +13.5 ± 6.0 | +2.3 | 0.11 | 0.4231 | -2.3 | -4.6 |
| Greyplume Fledgling | starter | 0 | 1/5 | flying | 10.61 | +17.5 ± 6.3 | +2.9 | 0.27 | 1.0385 | -2.3 | -4.38 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 43.04 | +3.5 ± 3.5 | +0.6 | 0.01 | 0.0385 | -2.4 | -7.88 |
| Fennec Fox | uncommon | 1 | 2/12 | dry | 20.99 | +12.8 ± 6.2 | +2.1 | 0.10 | 0.3846 | -2.4 | -4.53 |
| Peregrine Stooper | uncommon | 1 | 1/8 | flying, pounce | 18.72 | +13.8 ± 6.5 | +2.3 | 0.12 | 0.4615 | -2.4 | -4.33 |
| Silver Minnow | starter | 0 | 2/4 | - | 10.92 | +17.0 ± 5.9 | +2.8 | 0.26 | 1 | -2.4 | -4.77 |
| Jaguar Stalker | rare | 1 | 1/15 | quick | 22.85 | +11.8 ± 5.8 | +2.0 | 0.09 | 0.3462 | -2.4 | -4.92 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 17.41 | +14.0 ± 5.9 | +2.3 | 0.13 | 0.5 | -2.4 | -4.88 |
| Water Shrew | common | 0 | 1/6 | venomous | 11.44 | +16.5 ± 5.5 | +2.8 | 0.24 | 0.9231 | -2.4 | -5.25 |
| Chipmunk Cavalry | common | 1 | 3/3 | quick | 13.71 | +15.5 ± 6.7 | +2.6 | 0.19 | 0.7308 | -2.5 | -4.31 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 18.31 | +13.3 ± 6.1 | +2.2 | 0.12 | 0.4615 | -2.5 | -4.79 |
| Snapper Hatchling | common | 0 | 1/7 | tide | 11.44 | +16.0 ± 5.6 | +2.7 | 0.23 | 0.8846 | -2.5 | -5.27 |
| Stalactite Golem | common | 2 | 1/21 | shell | 29.47 | +8.3 ± 5.6 | +1.4 | 0.05 | 0.1923 | -2.5 | -5.31 |
| Orca Vanguard | common | 3 | 7/7 | sweep, tide | 32.57 | +6.8 ± 5.4 | +1.1 | 0.03 | 0.1154 | -2.5 | -5.54 |
| Bee Knight | common | 0 | 1/1 | flying, swarm | 11.44 | +15.8 ± 5.9 | +2.6 | 0.23 | 0.8846 | -2.6 | -5.09 |
| Phoenix Fledgling | common | 2 | 2/10 | cure, flying, renewal | 22.65 | +11.0 ± 5.8 | +1.8 | 0.08 | 0.3077 | -2.6 | -5.17 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 15.16 | +14.0 ± 6.2 | +2.3 | 0.15 | 0.5769 | -2.6 | -4.9 |
| Glacier Yak | common | 3 | 1/17 | freeze, triggers | 27.19 | +8.8 ± 5.5 | +1.5 | 0.05 | 0.1923 | -2.6 | -5.53 |
| Quarry Mole | common | 1 | 2/12 | bedrock, keenSense | 18.72 | +12.3 ± 6.0 | +2.0 | 0.11 | 0.4231 | -2.6 | -5.16 |
| Chipmunk Forager | starter | 0 | 1/8 | - | 10.92 | +15.5 ± 5.5 | +2.6 | 0.24 | 0.9231 | -2.6 | -5.64 |
| Venomlord Serpent | common | 3 | 1/22 | poison | 31.12 | +6.5 ± 5.5 | +1.1 | 0.03 | 0.1154 | -2.7 | -5.74 |
| Iron Warden | epic | 1 | 0/35 | ironWill | 35.46 | +4.5 ± 6.5 | +0.8 | 0.02 | 0.0769 | -2.7 | -4.93 |
| Fumarole Ibex | rare | 1 | 1/12 | mountainClimber, pounce | 22.03 | +10.3 ± 5.9 | +1.7 | 0.08 | 0.3077 | -2.7 | -5.46 |
| Riverworks Bastion | common | 3 | 0/31 | rampart | 32.36 | +5.8 ± 5.9 | +1.0 | 0.03 | 0.1154 | -2.7 | -5.43 |
| Vampire Roost | common | 2 | 0/24 | nocturnal, onDeathSpawn | 30.91 | +6.3 ± 5.3 | +1.0 | 0.03 | 0.1154 | -2.8 | -6.13 |
| Pronghorn Racer | common | 1 | 1/10 | speed | 16.6 | +12.3 ± 6.0 | +2.0 | 0.12 | 0.4615 | -2.8 | -5.49 |
| Red-billed Chough | common | 0 | 2/2 | flying, mountainClimber | 14.79 | +13.0 ± 5.3 | +2.2 | 0.15 | 0.5769 | -2.8 | -6.22 |
| Great Gate | common | 2 | 0/15 | guardian | 21.36 | +9.8 ± 5.3 | +1.6 | 0.08 | 0.3077 | -2.9 | -6.29 |
| Ember Centipede | common | 0 | 2/3 | dry, quick | 17.69 | +11.0 ± 5.5 | +1.8 | 0.10 | 0.3846 | -2.9 | -6.19 |
| Magma Titan | common | 3 | 2/17 | immolation, scar | 29.62 | +5.8 ± 5.4 | +1.0 | 0.03 | 0.1154 | -2.9 | -6.35 |
| Chamois Leaper | uncommon | 1 | 1/10 | mountainClimber, pounce | 20.37 | +9.5 ± 5.6 | +1.6 | 0.08 | 0.3077 | -3.0 | -6.21 |
| Harvest Mouse | starter | 0 | 1/6 | - | 10.92 | +13.5 ± 5.3 | +2.3 | 0.21 | 0.8077 | -3.0 | -6.65 |
| Friar Badger | uncommon | 0 | 2/12 | relic | 20.17 | +9.5 ± 6.0 | +1.6 | 0.08 | 0.3077 | -3.0 | -5.86 |
| Guppy | starter | 0 | 2/2 | tide | 10.4 | +13.5 ± 5.8 | +2.3 | 0.22 | 0.8462 | -3.0 | -6.06 |
| Sheep | starter | 0 | 1/6 | taunt | 10.4 | +13.5 ± 5.8 | +2.3 | 0.22 | 0.8462 | -3.0 | -6.1 |
| Otter Riverguard | common | 2 | 1/14 | armor | 20.79 | +8.3 ± 5.3 | +1.4 | 0.07 | 0.2692 | -3.1 | -6.93 |
| Anvilwhisker Otter | uncommon | 2 | 1/14 | triggers | 25.54 | +6.3 ± 5.3 | +1.0 | 0.04 | 0.1538 | -3.1 | -6.98 |
| Nest | common | 0 | 0/9 | triggers | 16.4 | +10.0 ± 5.3 | +1.7 | 0.10 | 0.3846 | -3.2 | -6.97 |
| Ford Kingfisher | uncommon | 1 | 0/8 | flying, pounce | 15.78 | +10.3 ± 5.7 | +1.7 | 0.11 | 0.4231 | -3.2 | -6.54 |
| Cocoon | uncommon | 0 | 0/1 | chrysalis | 35.05 | +2.0 ± 2.4 | +0.3 | 0.01 | 0.0385 | -3.2 | -15.59 |
| Golden Magpie | uncommon | 0 | 1/6 | flying, midas | 16.81 | +9.0 ± 5.9 | +1.5 | 0.09 | 0.3462 | -3.3 | -6.58 |
| Lucky Hopper | rare | 1 | 1/17 | - | 19.17 | +7.8 ± 6.3 | +1.3 | 0.07 | 0.2692 | -3.4 | -6.3 |
| Mosswing | starter | 0 | 0/7 | flying | 10.61 | +11.3 ± 4.9 | +1.9 | 0.18 | 0.6923 | -3.4 | -8.02 |
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 22.23 | +6.0 ± 5.3 | +1.0 | 0.04 | 0.1538 | -3.4 | -7.63 |
| Duckling | starter | 0 | 1/5 | - | 10.92 | +10.5 ± 5.2 | +1.8 | 0.16 | 0.6154 | -3.5 | -7.82 |
| Gale Sprite | common | 1 | 1/8 | evolute | 18.05 | +6.0 ± 5.6 | +1.0 | 0.06 | 0.2308 | -3.7 | -7.78 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.4 | +9.3 ± 5.2 | +1.5 | 0.15 | 0.5769 | -3.7 | -8.42 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +6.8 ± 5.0 | +1.1 | 0.09 | 0.3462 | -4.0 | -9.25 |
| Earthworm | starter | 0 | 0/6 | - | 10.92 | +7.0 ± 4.5 | +1.2 | 0.11 | 0.4231 | -4.1 | -10.59 |
| Irradiated Glow Wyrm | rare | 1 | 1/18 | poison | 25.7 | -0.5 ± 4.9 | -0.1 | 0.00 | 0 | -4.3 | -10.28 |
| Badger Stonemason | uncommon | 1 | 1/15 | quarry | 19.55 | -0.8 ± 5.7 | -0.1 | -0.01 | -0.0385 | -4.7 | -9.69 |
| Bee Drone | uncommon | 0 | 0/1 | flying, triggers | 12.47 | -1.0 ± 4.2 | -0.2 | -0.01 | -0.0385 | -5.3 | -14.9 |
