# Card value per budget point (global, 2026-10-31)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 200` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `57eb83233cf4`.

## How it is measured

- 200 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 767-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +6.1 + -0.090 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±7.0 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Eagle-Owl Quartermaster | rare | 1 | 1/8 | arrow, fletcher, flying | 24.19 | +48.8 ± 7.7 | +8.1 | 0.34 | 1.4783 | +4.2 | 6.38 |
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 33.94 | +39.3 ± 7.8 | +6.5 | 0.19 | 0.8261 | +3.5 | 5.2 |
| Prospector Mole | common | 0 | 3/9 | prospector | 19.99 | +44.3 ± 7.4 | +7.4 | 0.37 | 1.6087 | +3.1 | 4.86 |
| Ashbone Ghoul | common | 0 | 2/5 | remember, triggers | 19.99 | +43.8 ± 6.9 | +7.3 | 0.36 | 1.5652 | +3.0 | 5.09 |
| Wolf Spider Mother | rare | 1 | 3/7 | brood | 23.26 | +39.5 ± 7.6 | +6.6 | 0.28 | 1.2174 | +2.6 | 3.96 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 23.72 | +36.8 ± 7.4 | +6.1 | 0.26 | 1.1304 | +2.1 | 3.43 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 25.59 | +33.3 ± 7.5 | +5.5 | 0.22 | 0.9565 | +1.7 | 2.7 |
| Sunthroat Courier | common | 0 | 2/5 | espritHp, flying | 18.24 | +36.3 ± 7.3 | +6.0 | 0.33 | 1.4348 | +1.6 | 2.51 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 18.06 | +36.3 ± 6.9 | +6.0 | 0.33 | 1.4348 | +1.6 | 2.64 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 22.32 | +32.8 ± 7.6 | +5.5 | 0.24 | 1.0435 | +1.4 | 2.09 |
| Fox Kit | common | 0 | 2/9 | - | 15.29 | +34.8 ± 6.9 | +5.8 | 0.38 | 1.6522 | +1.1 | 1.81 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 22.53 | +30.8 ± 7.3 | +5.1 | 0.23 | 1 | +1.0 | 1.67 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 22.26 | +30.5 ± 7.5 | +5.1 | 0.23 | 1 | +1.0 | 1.51 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 21.15 | +30.5 ± 7.4 | +5.1 | 0.24 | 1.0435 | +0.9 | 1.38 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 16.72 | +32.3 ± 6.8 | +5.4 | 0.32 | 1.3913 | +0.8 | 1.36 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +32.8 ± 6.8 | +5.5 | 0.37 | 1.6087 | +0.7 | 1.16 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 17.13 | +30.8 ± 7.2 | +5.1 | 0.30 | 1.3043 | +0.6 | 0.91 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 17.88 | +29.3 ± 6.8 | +4.9 | 0.27 | 1.1739 | +0.4 | 0.64 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 19.52 | +28.0 ± 7.0 | +4.7 | 0.24 | 1.0435 | +0.3 | 0.54 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 28.1 | +23.5 ± 6.9 | +3.9 | 0.14 | 0.6087 | +0.3 | 0.54 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Phoenix Mushrooms | epic | 1 | 1/8 | bloomCopy, meiosis, undead | 25.12 | +2.5 ± 6.0 | +0.4 | 0.02 | 0.087 | -3.4 | -6.79 |
| Cobalt Fledgling | starter | 0 | 1/4 | flying | 11.99 | +13.8 ± 5.9 | +2.3 | 0.19 | 0.8261 | -2.7 | -5.41 |
| Peak Condor | common | 1 | 4/7 | flying, reload | 19.29 | +12.3 ± 7.3 | +2.0 | 0.11 | 0.4783 | -2.3 | -3.75 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 20.22 | +12.0 ± 6.2 | +2.0 | 0.10 | 0.4348 | -2.3 | -4.38 |
| Riptide Eel | uncommon | 1 | 6/7 | reload, tide | 22.09 | +11.8 ± 7.1 | +2.0 | 0.09 | 0.3913 | -2.2 | -3.59 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +13.8 ± 6.6 | +2.3 | 0.11 | 0.4783 | -2.0 | -3.48 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.0 ± 6.8 | +3.0 | 0.23 | 1 | -1.9 | -3.36 |
| Constrictor Coil | common | 2 | 4/16 | - | 28.04 | +10.0 ± 7.1 | +1.7 | 0.06 | 0.2609 | -1.9 | -3.21 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 19.05 | +15.5 ± 6.7 | +2.6 | 0.14 | 0.6087 | -1.8 | -3.18 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 33.24 | +8.5 ± 6.8 | +1.4 | 0.04 | 0.1739 | -1.7 | -2.98 |
| Conch Herald | uncommon | 1 | 1/13 | inspiring, tide | 20.92 | +15.8 ± 7.0 | +2.6 | 0.13 | 0.5652 | -1.6 | -2.7 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 12.92 | +20.8 ± 6.8 | +3.5 | 0.27 | 1.1739 | -1.5 | -2.57 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 48.64 | +2.0 ± 4.1 | +0.3 | 0.01 | 0.0435 | -1.5 | -4.16 |
| Slow-worm | common | 0 | 1/9 | undead | 16.72 | +21.5 ± 6.5 | +3.6 | 0.21 | 0.913 | -1.0 | -1.85 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake | 60.8 | -1.8 ± 5.8 | -0.3 | 0.00 | 0 | -1.0 | -2.02 |
| Otter Netmender | common | 0 | 1/8 | armor | 14.09 | +24.3 ± 6.6 | +4.0 | 0.29 | 1.2609 | -0.8 | -1.4 |
| Red-billed Chough | common | 0 | 3/2 | flying, mountainClimber | 16.72 | +23.0 ± 7.0 | +3.8 | 0.23 | 1 | -0.8 | -1.29 |
| Hawk Arrowkeeper | common | 1 | 2/8 | diurnal, flying | 19.68 | +22.3 ± 7.2 | +3.7 | 0.19 | 0.8261 | -0.6 | -1.03 |
| Nectar Sipper | common | 0 | 2/3 | flying | 14.37 | +25.3 ± 6.7 | +4.2 | 0.29 | 1.2609 | -0.6 | -1.05 |
| Peregrine Stooper | uncommon | 1 | 2/8 | flying, pounce | 21.15 | +22.5 ± 7.0 | +3.8 | 0.18 | 0.7826 | -0.5 | -0.77 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Eagle-Owl Quartermaster | rare | 1 | 1/8 | arrow, fletcher, flying | 24.19 | +48.8 ± 7.7 | +8.1 | 0.34 | 1.4783 | +4.2 | 6.38 |
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 33.94 | +39.3 ± 7.8 | +6.5 | 0.19 | 0.8261 | +3.5 | 5.2 |
| Prospector Mole | common | 0 | 3/9 | prospector | 19.99 | +44.3 ± 7.4 | +7.4 | 0.37 | 1.6087 | +3.1 | 4.86 |
| Ashbone Ghoul | common | 0 | 2/5 | remember, triggers | 19.99 | +43.8 ± 6.9 | +7.3 | 0.36 | 1.5652 | +3.0 | 5.09 |
| Wolf Spider Mother | rare | 1 | 3/7 | brood | 23.26 | +39.5 ± 7.6 | +6.6 | 0.28 | 1.2174 | +2.6 | 3.96 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 23.72 | +36.8 ± 7.4 | +6.1 | 0.26 | 1.1304 | +2.1 | 3.43 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 25.59 | +33.3 ± 7.5 | +5.5 | 0.22 | 0.9565 | +1.7 | 2.7 |
| Sunthroat Courier | common | 0 | 2/5 | espritHp, flying | 18.24 | +36.3 ± 7.3 | +6.0 | 0.33 | 1.4348 | +1.6 | 2.51 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 18.06 | +36.3 ± 6.9 | +6.0 | 0.33 | 1.4348 | +1.6 | 2.64 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 22.32 | +32.8 ± 7.6 | +5.5 | 0.24 | 1.0435 | +1.4 | 2.09 |
| Fox Kit | common | 0 | 2/9 | - | 15.29 | +34.8 ± 6.9 | +5.8 | 0.38 | 1.6522 | +1.1 | 1.81 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 22.53 | +30.8 ± 7.3 | +5.1 | 0.23 | 1 | +1.0 | 1.67 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 22.26 | +30.5 ± 7.5 | +5.1 | 0.23 | 1 | +1.0 | 1.51 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 21.15 | +30.5 ± 7.4 | +5.1 | 0.24 | 1.0435 | +0.9 | 1.38 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 16.72 | +32.3 ± 6.8 | +5.4 | 0.32 | 1.3913 | +0.8 | 1.36 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +32.8 ± 6.8 | +5.5 | 0.37 | 1.6087 | +0.7 | 1.16 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 17.13 | +30.8 ± 7.2 | +5.1 | 0.30 | 1.3043 | +0.6 | 0.91 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 17.88 | +29.3 ± 6.8 | +4.9 | 0.27 | 1.1739 | +0.4 | 0.64 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 19.52 | +28.0 ± 7.0 | +4.7 | 0.24 | 1.0435 | +0.3 | 0.54 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 28.1 | +23.5 ± 6.9 | +3.9 | 0.14 | 0.6087 | +0.3 | 0.54 |
| Ruby-Throat Duelist | rare | 0 | 3/2 | flying, pierce, quick | 20.22 | +27.5 ± 7.4 | +4.6 | 0.23 | 1 | +0.3 | 0.46 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 29.27 | +22.3 ± 7.1 | +3.7 | 0.13 | 0.5652 | +0.2 | 0.36 |
| Inkcloud Squid | common | 0 | 1/8 | evasive, tide | 19.75 | +27.0 ± 7.2 | +4.5 | 0.23 | 1 | +0.2 | 0.28 |
| Field Mouse | common | 0 | 2/7 | - | 13.57 | +30.0 ± 6.7 | +5.0 | 0.37 | 1.6087 | +0.1 | 0.21 |
| Glass Golem | rare | 1 | 6/5 | - | 25.89 | +23.3 ± 7.2 | +3.9 | 0.15 | 0.6522 | +0.1 | 0.15 |
| Box Turtle | common | 0 | 2/7 | cower | 12.92 | +29.8 ± 7.3 | +5.0 | 0.38 | 1.6522 | +0.0 | 0.03 |
| Weaver Bird | common | 1 | 3/6 | tangle | 18.76 | +26.5 ± 7.2 | +4.4 | 0.24 | 1.0435 | +0.0 | 0 |
| Pincushion Urchin | common | 0 | 2/4 | thorns, tide | 16.72 | +26.8 ± 6.7 | +4.5 | 0.27 | 1.1739 | -0.1 | -0.25 |
| Dhole Matriarch | veryrare | 2 | 4/21 | packLeader | 33.94 | +17.3 ± 7.0 | +2.9 | 0.08 | 0.3478 | -0.2 | -0.33 |
| Peregrine Stooper | uncommon | 1 | 2/8 | flying, pounce | 21.15 | +22.5 ± 7.0 | +3.8 | 0.18 | 0.7826 | -0.5 | -0.77 |
| Nectar Sipper | common | 0 | 2/3 | flying | 14.37 | +25.3 ± 6.7 | +4.2 | 0.29 | 1.2609 | -0.6 | -1.05 |
| Hawk Arrowkeeper | common | 1 | 2/8 | diurnal, flying | 19.68 | +22.3 ± 7.2 | +3.7 | 0.19 | 0.8261 | -0.6 | -1.03 |
| Red-billed Chough | common | 0 | 3/2 | flying, mountainClimber | 16.72 | +23.0 ± 7.0 | +3.8 | 0.23 | 1 | -0.8 | -1.29 |
| Otter Netmender | common | 0 | 1/8 | armor | 14.09 | +24.3 ± 6.6 | +4.0 | 0.29 | 1.2609 | -0.8 | -1.4 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake | 60.8 | -1.8 ± 5.8 | -0.3 | 0.00 | 0 | -1.0 | -2.02 |
| Slow-worm | common | 0 | 1/9 | undead | 16.72 | +21.5 ± 6.5 | +3.6 | 0.21 | 0.913 | -1.0 | -1.85 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 48.64 | +2.0 ± 4.1 | +0.3 | 0.01 | 0.0435 | -1.5 | -4.16 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 12.92 | +20.8 ± 6.8 | +3.5 | 0.27 | 1.1739 | -1.5 | -2.57 |
| Conch Herald | uncommon | 1 | 1/13 | inspiring, tide | 20.92 | +15.8 ± 7.0 | +2.6 | 0.13 | 0.5652 | -1.6 | -2.7 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 33.24 | +8.5 ± 6.8 | +1.4 | 0.04 | 0.1739 | -1.7 | -2.98 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 19.05 | +15.5 ± 6.7 | +2.6 | 0.14 | 0.6087 | -1.8 | -3.18 |
| Constrictor Coil | common | 2 | 4/16 | - | 28.04 | +10.0 ± 7.1 | +1.7 | 0.06 | 0.2609 | -1.9 | -3.21 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.0 ± 6.8 | +3.0 | 0.23 | 1 | -1.9 | -3.36 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +13.8 ± 6.6 | +2.3 | 0.11 | 0.4783 | -2.0 | -3.48 |
| Riptide Eel | uncommon | 1 | 6/7 | reload, tide | 22.09 | +11.8 ± 7.1 | +2.0 | 0.09 | 0.3913 | -2.2 | -3.59 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 20.22 | +12.0 ± 6.2 | +2.0 | 0.10 | 0.4348 | -2.3 | -4.38 |
| Peak Condor | common | 1 | 4/7 | flying, reload | 19.29 | +12.3 ± 7.3 | +2.0 | 0.11 | 0.4783 | -2.3 | -3.75 |
| Cobalt Fledgling | starter | 0 | 1/4 | flying | 11.99 | +13.8 ± 5.9 | +2.3 | 0.19 | 0.8261 | -2.7 | -5.41 |
| Phoenix Mushrooms | epic | 1 | 1/8 | bloomCopy, meiosis, undead | 25.12 | +2.5 ± 6.0 | +0.4 | 0.02 | 0.087 | -3.4 | -6.79 |
