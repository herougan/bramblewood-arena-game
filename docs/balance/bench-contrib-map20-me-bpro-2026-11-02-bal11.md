# Card value per budget point (map20-me-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map me --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `faa5cc9f27d4`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 23-card pool, and one of 7 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3.9, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +8.3 + -0.140 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.5 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| The Contradiction | epic | 1 | 2/16 | rage, regen | 37.62 | +41.6 ± 6.5 | +6.9 | 0.18 | 1.3846 | +3.9 | 7.07 |
| Ossuary Lammergeier | superrare | 1 | 3/8 | carrion, flying | 31.55 | +45.2 ± 6.6 | +7.5 | 0.24 | 1.8462 | +3.6 | 6.54 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 27.47 | +44.2 ± 6.5 | +7.4 | 0.27 | 2.0769 | +2.9 | 5.25 |
| Magma Salamander | rare | 1 | 3/11 | fireArrow | 27.47 | +44.0 ± 6.6 | +7.3 | 0.27 | 2.0769 | +2.9 | 5.11 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 20 | +48.0 ± 6.2 | +8.0 | 0.40 | 3.0769 | +2.5 | 4.71 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.1 | +44.2 ± 6.3 | +7.4 | 0.33 | 2.5385 | +2.2 | 4.02 |
| Cave Warlord | common | 4 | 6/28 | daunt, onReadyDamage | 59.39 | +8.4 ± 5.7 | +1.4 | 0.02 | 0.1538 | +1.5 | 2.98 |
| Pack Mule | common | 0 | 1/11 | bounty | 19.49 | +41.8 ± 6.4 | +7.0 | 0.36 | 2.7692 | +1.4 | 2.57 |
| Cinder Stoker | common | 0 | 1/11 | heat | 17.95 | +43.0 ± 6.4 | +7.2 | 0.40 | 3.0769 | +1.4 | 2.51 |
| Magma Wraith | uncommon | 1 | 1/8 | evasive, fireArrow | 27.72 | +33.6 ± 6.6 | +5.6 | 0.20 | 1.5385 | +1.2 | 2.11 |
| Woodland Brawler | veryrare | 1 | 3/14 | - | 31.79 | +26.8 ± 6.4 | +4.5 | 0.14 | 1.0769 | +0.6 | 1.13 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 62.39 | -2.0 ± 6.1 | -0.3 | -0.01 | -0.0769 | +0.1 | 0.27 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 36.66 | +15.4 ± 6.6 | +2.6 | 0.07 | 0.5385 | -0.6 | -1.05 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29 | +18.0 ± 6.5 | +3.0 | 0.10 | 0.7692 | -1.2 | -2.23 |
| Gorge Wyrm | common | 3 | 2/26 | earthquake, sweep | 48.34 | -0.8 ± 6.5 | -0.1 | 0.00 | 0 | -1.6 | -2.95 |
| Cave Bear | common | 3 | 4/13 | rage, siege | 36.85 | +8.4 ± 6.8 | +1.4 | 0.04 | 0.3077 | -1.7 | -2.98 |
| Pit Glutton | rare | 1 | 2/11 | devour | 23.89 | +18.4 ± 5.9 | +3.1 | 0.13 | 1 | -1.9 | -3.79 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.19 | +15.6 ± 6.6 | +2.6 | 0.10 | 0.7692 | -2.0 | -3.6 |
| Cinder Skeleton | common | 1 | 1/7 | requiem, undead | 20.76 | +19.4 ± 6.5 | +3.2 | 0.16 | 1.2308 | -2.2 | -3.91 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 28.23 | +9.8 ± 6.0 | +1.6 | 0.06 | 0.4615 | -2.7 | -5.32 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Fumarole Ibex | rare | 1 | 1/12 | mountainClimber, pounce | 27.47 | +2.4 ± 6.5 | +0.4 | 0.01 | 0.0769 | -4.0 | -7.36 |
| Vampire Roost | common | 2 | 0/24 | nocturnal, onDeathSpawn | 38.45 | -2.2 ± 6.0 | -0.4 | -0.01 | -0.0769 | -3.3 | -6.41 |
| Ash Moth | common | 1 | 1/8 | flying, nocturnal | 21.18 | +15.2 ± 6.3 | +2.5 | 0.12 | 0.9231 | -2.8 | -5.25 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 28.23 | +9.8 ± 6.0 | +1.6 | 0.06 | 0.4615 | -2.7 | -5.32 |
| Cinder Skeleton | common | 1 | 1/7 | requiem, undead | 20.76 | +19.4 ± 6.5 | +3.2 | 0.16 | 1.2308 | -2.2 | -3.91 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.19 | +15.6 ± 6.6 | +2.6 | 0.10 | 0.7692 | -2.0 | -3.6 |
| Pit Glutton | rare | 1 | 2/11 | devour | 23.89 | +18.4 ± 5.9 | +3.1 | 0.13 | 1 | -1.9 | -3.79 |
| Cave Bear | common | 3 | 4/13 | rage, siege | 36.85 | +8.4 ± 6.8 | +1.4 | 0.04 | 0.3077 | -1.7 | -2.98 |
| Gorge Wyrm | common | 3 | 2/26 | earthquake, sweep | 48.34 | -0.8 ± 6.5 | -0.1 | 0.00 | 0 | -1.6 | -2.95 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29 | +18.0 ± 6.5 | +3.0 | 0.10 | 0.7692 | -1.2 | -2.23 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 36.66 | +15.4 ± 6.6 | +2.6 | 0.07 | 0.5385 | -0.6 | -1.05 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 62.39 | -2.0 ± 6.1 | -0.3 | -0.01 | -0.0769 | +0.1 | 0.27 |
| Woodland Brawler | veryrare | 1 | 3/14 | - | 31.79 | +26.8 ± 6.4 | +4.5 | 0.14 | 1.0769 | +0.6 | 1.13 |
| Magma Wraith | uncommon | 1 | 1/8 | evasive, fireArrow | 27.72 | +33.6 ± 6.6 | +5.6 | 0.20 | 1.5385 | +1.2 | 2.11 |
| Cinder Stoker | common | 0 | 1/11 | heat | 17.95 | +43.0 ± 6.4 | +7.2 | 0.40 | 3.0769 | +1.4 | 2.51 |
| Pack Mule | common | 0 | 1/11 | bounty | 19.49 | +41.8 ± 6.4 | +7.0 | 0.36 | 2.7692 | +1.4 | 2.57 |
| Cave Warlord | common | 4 | 6/28 | daunt, onReadyDamage | 59.39 | +8.4 ± 5.7 | +1.4 | 0.02 | 0.1538 | +1.5 | 2.98 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.1 | +44.2 ± 6.3 | +7.4 | 0.33 | 2.5385 | +2.2 | 4.02 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 20 | +48.0 ± 6.2 | +8.0 | 0.40 | 3.0769 | +2.5 | 4.71 |
| Magma Salamander | rare | 1 | 3/11 | fireArrow | 27.47 | +44.0 ± 6.6 | +7.3 | 0.27 | 2.0769 | +2.9 | 5.11 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| The Contradiction | epic | 1 | 2/16 | rage, regen | 37.62 | +41.6 ± 6.5 | +6.9 | 0.18 | 1.3846 | +3.9 | 7.07 |
| Ossuary Lammergeier | superrare | 1 | 3/8 | carrion, flying | 31.55 | +45.2 ± 6.6 | +7.5 | 0.24 | 1.8462 | +3.6 | 6.54 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 27.47 | +44.2 ± 6.5 | +7.4 | 0.27 | 2.0769 | +2.9 | 5.25 |
| Magma Salamander | rare | 1 | 3/11 | fireArrow | 27.47 | +44.0 ± 6.6 | +7.3 | 0.27 | 2.0769 | +2.9 | 5.11 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 20 | +48.0 ± 6.2 | +8.0 | 0.40 | 3.0769 | +2.5 | 4.71 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.1 | +44.2 ± 6.3 | +7.4 | 0.33 | 2.5385 | +2.2 | 4.02 |
| Cave Warlord | common | 4 | 6/28 | daunt, onReadyDamage | 59.39 | +8.4 ± 5.7 | +1.4 | 0.02 | 0.1538 | +1.5 | 2.98 |
| Pack Mule | common | 0 | 1/11 | bounty | 19.49 | +41.8 ± 6.4 | +7.0 | 0.36 | 2.7692 | +1.4 | 2.57 |
| Cinder Stoker | common | 0 | 1/11 | heat | 17.95 | +43.0 ± 6.4 | +7.2 | 0.40 | 3.0769 | +1.4 | 2.51 |
| Magma Wraith | uncommon | 1 | 1/8 | evasive, fireArrow | 27.72 | +33.6 ± 6.6 | +5.6 | 0.20 | 1.5385 | +1.2 | 2.11 |
| Woodland Brawler | veryrare | 1 | 3/14 | - | 31.79 | +26.8 ± 6.4 | +4.5 | 0.14 | 1.0769 | +0.6 | 1.13 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 62.39 | -2.0 ± 6.1 | -0.3 | -0.01 | -0.0769 | +0.1 | 0.27 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 36.66 | +15.4 ± 6.6 | +2.6 | 0.07 | 0.5385 | -0.6 | -1.05 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29 | +18.0 ± 6.5 | +3.0 | 0.10 | 0.7692 | -1.2 | -2.23 |
| Gorge Wyrm | common | 3 | 2/26 | earthquake, sweep | 48.34 | -0.8 ± 6.5 | -0.1 | 0.00 | 0 | -1.6 | -2.95 |
| Cave Bear | common | 3 | 4/13 | rage, siege | 36.85 | +8.4 ± 6.8 | +1.4 | 0.04 | 0.3077 | -1.7 | -2.98 |
| Pit Glutton | rare | 1 | 2/11 | devour | 23.89 | +18.4 ± 5.9 | +3.1 | 0.13 | 1 | -1.9 | -3.79 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.19 | +15.6 ± 6.6 | +2.6 | 0.10 | 0.7692 | -2.0 | -3.6 |
| Cinder Skeleton | common | 1 | 1/7 | requiem, undead | 20.76 | +19.4 ± 6.5 | +3.2 | 0.16 | 1.2308 | -2.2 | -3.91 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 28.23 | +9.8 ± 6.0 | +1.6 | 0.06 | 0.4615 | -2.7 | -5.32 |
| Ash Moth | common | 1 | 1/8 | flying, nocturnal | 21.18 | +15.2 ± 6.3 | +2.5 | 0.12 | 0.9231 | -2.8 | -5.25 |
| Vampire Roost | common | 2 | 0/24 | nocturnal, onDeathSpawn | 38.45 | -2.2 ± 6.0 | -0.4 | -0.01 | -0.0769 | -3.3 | -6.41 |
| Fumarole Ibex | rare | 1 | 1/12 | mountainClimber, pounce | 27.47 | +2.4 ± 6.5 | +0.4 | 0.01 | 0.0769 | -4.0 | -7.36 |
