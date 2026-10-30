# Card value per budget point (global, 2026-10-30)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 200` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `24f5fbcaaae6`.

## How it is measured

- 200 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 767-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +5.6 + -0.090 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.8 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 33.94 | +39.8 ± 7.8 | +6.6 | 0.20 | 0.8696 | +3.9 | 5.85 |
| Prospector Mole | common | 0 | 3/9 | prospector | 19.99 | +46.3 ± 7.4 | +7.7 | 0.39 | 1.6957 | +3.8 | 5.97 |
| Pangolin Roller | uncommon | 1 | 5/6 | sturdy | 23.72 | +38.0 ± 7.3 | +6.3 | 0.27 | 1.1739 | +2.7 | 4.39 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 25.59 | +33.8 ± 7.1 | +5.6 | 0.22 | 0.9565 | +2.2 | 3.62 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 18.06 | +37.3 ± 7.0 | +6.2 | 0.34 | 1.4783 | +2.1 | 3.57 |
| Sunthroat Courier | common | 0 | 2/5 | espritHp, flying | 18.24 | +36.3 ± 7.2 | +6.0 | 0.33 | 1.4348 | +2.0 | 3.2 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 22.26 | +33.5 ± 7.1 | +5.6 | 0.25 | 1.087 | +1.8 | 3.07 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 22.32 | +32.8 ± 7.3 | +5.5 | 0.24 | 1.0435 | +1.7 | 2.78 |
| Fox Kit | common | 0 | 2/9 | - | 15.29 | +35.8 ± 6.9 | +6.0 | 0.39 | 1.6957 | +1.6 | 2.77 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 22.53 | +31.0 ± 7.2 | +5.2 | 0.23 | 1 | +1.5 | 2.37 |
| Conch Crawler | common | 0 | 2/2 | shell, shield, tide | 16.72 | +32.5 ± 7.0 | +5.4 | 0.32 | 1.3913 | +1.2 | 2.02 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 17.13 | +31.5 ± 7.1 | +5.3 | 0.31 | 1.3478 | +1.1 | 1.78 |
| Gannet Nestweaver | common | 0 | 1/7 | flying, triggers | 16.72 | +31.5 ± 7.0 | +5.3 | 0.31 | 1.3478 | +1.0 | 1.75 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 17.88 | +30.5 ± 6.7 | +5.1 | 0.28 | 1.2174 | +1.0 | 1.71 |
| Weaver Bird | common | 1 | 3/6 | tangle | 18.76 | +29.3 ± 6.9 | +4.9 | 0.26 | 1.1304 | +0.8 | 1.44 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 19.52 | +28.5 ± 6.9 | +4.8 | 0.24 | 1.0435 | +0.8 | 1.34 |
| Ruby-Throat Duelist | rare | 0 | 3/2 | flying, pierce, quick | 20.22 | +28.0 ± 7.5 | +4.7 | 0.23 | 1 | +0.8 | 1.19 |
| Field Mouse | common | 0 | 2/7 | - | 13.57 | +31.3 ± 6.7 | +5.2 | 0.38 | 1.6522 | +0.7 | 1.28 |
| Box Turtle | common | 0 | 2/7 | cower | 12.92 | +31.5 ± 7.4 | +5.3 | 0.41 | 1.7826 | +0.7 | 1.15 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 28.1 | +23.5 ± 6.8 | +3.9 | 0.14 | 0.6087 | +0.7 | 1.2 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 25.12 | +0.8 ± 6.0 | +0.1 | 0.00 | 0 | -3.4 | -6.59 |
| Peak Condor | common | 1 | 3/7 | flying, reload | 19.29 | +10.0 ± 6.5 | +1.7 | 0.09 | 0.3913 | -2.3 | -4.21 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 19.68 | +10.3 ± 5.7 | +1.7 | 0.09 | 0.3913 | -2.2 | -4.62 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 19.68 | +10.3 ± 5.7 | +1.7 | 0.09 | 0.3913 | -2.2 | -4.62 |
| Red-billed Chough | common | 0 | 2/2 | flying, mountainClimber | 16.72 | +12.0 ± 5.5 | +2.0 | 0.12 | 0.5217 | -2.2 | -4.74 |
| Cobalt Fledgling | starter | 0 | 1/4 | flying | 11.99 | +15.3 ± 6.0 | +2.5 | 0.21 | 0.913 | -2.1 | -4.05 |
| Peregrine Stooper | uncommon | 1 | 1/8 | flying, pounce | 21.15 | +11.8 ± 6.4 | +2.0 | 0.09 | 0.3913 | -1.9 | -3.43 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 20.22 | +14.0 ± 6.2 | +2.3 | 0.12 | 0.5217 | -1.6 | -3.01 |
| Constrictor Coil | common | 2 | 4/16 | - | 28.04 | +10.0 ± 6.9 | +1.7 | 0.06 | 0.2609 | -1.6 | -2.67 |
| Conch Herald | uncommon | 1 | 1/11 | inspiring, tide | 20.92 | +14.2 ± 6.4 | +2.4 | 0.11 | 0.4783 | -1.5 | -2.71 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.8 ± 6.7 | +3.1 | 0.24 | 1.0435 | -1.4 | -2.46 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.8 ± 6.7 | +3.1 | 0.24 | 1.0435 | -1.4 | -2.46 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +15.0 ± 6.1 | +2.5 | 0.12 | 0.5217 | -1.4 | -2.64 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +15.0 ± 6.1 | +2.5 | 0.12 | 0.5217 | -1.4 | -2.64 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 33.24 | +9.0 ± 6.8 | +1.5 | 0.05 | 0.2174 | -1.3 | -2.23 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 12.92 | +19.8 ± 6.6 | +3.3 | 0.25 | 1.087 | -1.2 | -2.2 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 48.64 | +2.0 ± 3.9 | +0.3 | 0.01 | 0.0435 | -1.1 | -3.45 |
| Puffin Diver | common | 1 | 2/5 | dive, flying, tide | 19.99 | +17.0 ± 6.5 | +2.8 | 0.14 | 0.6087 | -1.1 | -1.99 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 19.05 | +18.5 ± 6.8 | +3.1 | 0.16 | 0.6957 | -0.9 | -1.6 |
| Riptide Eel | uncommon | 1 | 6/8 | reload, tide | 22.09 | +17.3 ± 7.4 | +2.9 | 0.13 | 0.5652 | -0.9 | -1.39 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Gilded Swan Knight | superrare | 1 | 1/20 | armor, inspiring | 33.94 | +39.8 ± 7.8 | +6.6 | 0.20 | 0.8696 | +3.9 | 5.85 |
| Prospector Mole | common | 0 | 3/9 | prospector | 19.99 | +46.3 ± 7.4 | +7.7 | 0.39 | 1.6957 | +3.8 | 5.97 |
| Pangolin Roller | uncommon | 1 | 5/6 | sturdy | 23.72 | +38.0 ± 7.3 | +6.3 | 0.27 | 1.1739 | +2.7 | 4.39 |
| Ice Petrel | uncommon | 1 | 2/7 | iceBolt | 25.59 | +33.8 ± 7.1 | +5.6 | 0.22 | 0.9565 | +2.2 | 3.62 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 18.06 | +37.3 ± 7.0 | +6.2 | 0.34 | 1.4783 | +2.1 | 3.57 |
| Sunthroat Courier | common | 0 | 2/5 | espritHp, flying | 18.24 | +36.3 ± 7.2 | +6.0 | 0.33 | 1.4348 | +2.0 | 3.2 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 22.26 | +33.5 ± 7.1 | +5.6 | 0.25 | 1.087 | +1.8 | 3.07 |
| Raccoon Bandit | rare | 0 | 3/6 | bounty, nocturnal | 22.32 | +32.8 ± 7.3 | +5.5 | 0.24 | 1.0435 | +1.7 | 2.78 |
| Fox Kit | common | 0 | 2/9 | - | 15.29 | +35.8 ± 6.9 | +6.0 | 0.39 | 1.6957 | +1.6 | 2.77 |
| Sunbittern Strider | uncommon | 1 | 3/10 | diurnal, diurnalGrant | 22.53 | +31.0 ± 7.2 | +5.2 | 0.23 | 1 | +1.5 | 2.37 |
| Conch Crawler | common | 0 | 2/2 | shell, shield, tide | 16.72 | +32.5 ± 7.0 | +5.4 | 0.32 | 1.3913 | +1.2 | 2.02 |
| Wrong-Way Salmon | uncommon | 0 | 1/11 | backstab | 17.13 | +31.5 ± 7.1 | +5.3 | 0.31 | 1.3478 | +1.1 | 1.78 |
| Gannet Nestweaver | common | 0 | 1/7 | flying, triggers | 16.72 | +31.5 ± 7.0 | +5.3 | 0.31 | 1.3478 | +1.0 | 1.75 |
| Sunfeather Scout | common | 0 | 1/4 | flying, onReadyGold | 17.88 | +30.5 ± 6.7 | +5.1 | 0.28 | 1.2174 | +1.0 | 1.71 |
| Weaver Bird | common | 1 | 3/6 | tangle | 18.76 | +29.3 ± 6.9 | +4.9 | 0.26 | 1.1304 | +0.8 | 1.44 |
| Hedge Weasel | uncommon | 0 | 3/5 | predator | 19.52 | +28.5 ± 6.9 | +4.8 | 0.24 | 1.0435 | +0.8 | 1.34 |
| Ruby-Throat Duelist | rare | 0 | 3/2 | flying, pierce, quick | 20.22 | +28.0 ± 7.5 | +4.7 | 0.23 | 1 | +0.8 | 1.19 |
| Field Mouse | common | 0 | 2/7 | - | 13.57 | +31.3 ± 6.7 | +5.2 | 0.38 | 1.6522 | +0.7 | 1.28 |
| Box Turtle | common | 0 | 2/7 | cower | 12.92 | +31.5 ± 7.4 | +5.3 | 0.41 | 1.7826 | +0.7 | 1.15 |
| Lodge Engineer | uncommon | 2 | 3/12 | onReadyGold, timbered | 28.1 | +23.5 ± 6.8 | +3.9 | 0.14 | 0.6087 | +0.7 | 1.2 |
| Tomcat | common | 0 | 3/2 | quick | 12.92 | +30.8 ± 6.7 | +5.1 | 0.40 | 1.7391 | +0.6 | 1.06 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 29.27 | +21.8 ± 6.9 | +3.6 | 0.12 | 0.5217 | +0.5 | 0.85 |
| Glass Golem | rare | 1 | 6/5 | - | 25.89 | +23.5 ± 7.1 | +3.9 | 0.15 | 0.6522 | +0.5 | 0.83 |
| Kittiwake Flock | common | 0 | 1/3 | flying, swarm | 12.92 | +29.8 ± 6.8 | +5.0 | 0.38 | 1.6522 | +0.4 | 0.75 |
| Inkcloud Squid | common | 0 | 1/8 | evasive, tide | 19.75 | +26.0 ± 7.3 | +4.3 | 0.22 | 0.9565 | +0.4 | 0.61 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 16.72 | +27.5 ± 6.8 | +4.6 | 0.27 | 1.1739 | +0.4 | 0.64 |
| Dhole Matriarch | veryrare | 2 | 4/21 | packLeader | 33.94 | +17.3 ± 7.2 | +2.9 | 0.08 | 0.3478 | +0.1 | 0.24 |
| Nectar Sipper | common | 0 | 2/3 | flying | 14.37 | +26.8 ± 6.6 | +4.5 | 0.31 | 1.3478 | +0.1 | 0.09 |
| Pincushion Urchin | common | 0 | 3/3 | thorns, tide | 16.72 | +25.3 ± 7.1 | +4.2 | 0.25 | 1.087 | +0.0 | 0 |
| Otter Netmender | common | 0 | 1/8 | armor | 14.09 | +25.3 ± 6.5 | +4.2 | 0.30 | 1.3043 | -0.2 | -0.4 |
| Slow-worm | common | 0 | 1/9 | undead | 16.72 | +22.8 ± 6.4 | +3.8 | 0.23 | 1 | -0.4 | -0.77 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake | 60.8 | -1.8 ± 5.9 | -0.3 | 0.00 | 0 | -0.7 | -1.45 |
| Golden Eagle Diver | uncommon | 1 | 2/2 | diurnal, flying, pounce | 17.36 | +20.5 ± 7.2 | +3.4 | 0.20 | 0.8696 | -0.7 | -1.19 |
| Riptide Eel | uncommon | 1 | 6/8 | reload, tide | 22.09 | +17.3 ± 7.4 | +2.9 | 0.13 | 0.5652 | -0.9 | -1.39 |
| Fen Mink | uncommon | 0 | 1/10 | hunter, hunterVs | 19.05 | +18.5 ± 6.8 | +3.1 | 0.16 | 0.6957 | -0.9 | -1.6 |
| Puffin Diver | common | 1 | 2/5 | dive, flying, tide | 19.99 | +17.0 ± 6.5 | +2.8 | 0.14 | 0.6087 | -1.1 | -1.99 |
| Roe Pearl | uncommon | 0 | 0/2 | - | 48.64 | +2.0 ± 3.9 | +0.3 | 0.01 | 0.0435 | -1.1 | -3.45 |
| Tide Pool Crab | common | 0 | 1/3 | armor, shield, tide | 12.92 | +19.8 ± 6.6 | +3.3 | 0.25 | 1.087 | -1.2 | -2.2 |
| Crocodile Ambusher | common | 2 | 5/17 | - | 33.24 | +9.0 ± 6.8 | +1.5 | 0.05 | 0.2174 | -1.3 | -2.23 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +15.0 ± 6.1 | +2.5 | 0.12 | 0.5217 | -1.4 | -2.64 |
| Razorbill | uncommon | 1 | 2/5 | bleed, flying | 20.69 | +15.0 ± 6.1 | +2.5 | 0.12 | 0.5217 | -1.4 | -2.64 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.8 ± 6.7 | +3.1 | 0.24 | 1.0435 | -1.4 | -2.46 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 12.92 | +18.8 ± 6.7 | +3.1 | 0.24 | 1.0435 | -1.4 | -2.46 |
| Conch Herald | uncommon | 1 | 1/11 | inspiring, tide | 20.92 | +14.2 ± 6.4 | +2.4 | 0.11 | 0.4783 | -1.5 | -2.71 |
| Constrictor Coil | common | 2 | 4/16 | - | 28.04 | +10.0 ± 6.9 | +1.7 | 0.06 | 0.2609 | -1.6 | -2.67 |
| Snapstick Turtle | common | 1 | 2/12 | tide | 20.22 | +14.0 ± 6.2 | +2.3 | 0.12 | 0.5217 | -1.6 | -3.01 |
| Peregrine Stooper | uncommon | 1 | 1/8 | flying, pounce | 21.15 | +11.8 ± 6.4 | +2.0 | 0.09 | 0.3913 | -1.9 | -3.43 |
| Cobalt Fledgling | starter | 0 | 1/4 | flying | 11.99 | +15.3 ± 6.0 | +2.5 | 0.21 | 0.913 | -2.1 | -4.05 |
| Red-billed Chough | common | 0 | 2/2 | flying, mountainClimber | 16.72 | +12.0 ± 5.5 | +2.0 | 0.12 | 0.5217 | -2.2 | -4.74 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 19.68 | +10.3 ± 5.7 | +1.7 | 0.09 | 0.3913 | -2.2 | -4.62 |
| Hawk Arrowkeeper | common | 1 | 1/8 | diurnal, flying | 19.68 | +10.3 ± 5.7 | +1.7 | 0.09 | 0.3913 | -2.2 | -4.62 |
| Peak Condor | common | 1 | 3/7 | flying, reload | 19.29 | +10.0 ± 6.5 | +1.7 | 0.09 | 0.3913 | -2.3 | -4.21 |
| Phoenix Mushrooms | epic | 1 | 1/10 | bloomCopy, meiosis, undead | 25.12 | +0.8 ± 6.0 | +0.1 | 0.00 | 0 | -3.4 | -6.59 |
