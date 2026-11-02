# Card value per budget point (map17-m6-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map m6 --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `f997c1cc804a`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 16-card pool, and one of 8 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3.36, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +5.4 + -0.110 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.7 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 33.71 | +43.4 ± 6.4 | +7.2 | 0.21 | 2.625 | +5.5 | 10.11 |
| Talus Pika | common | 0 | 2/7 | triggers | 17.62 | +28.4 ± 6.2 | +4.7 | 0.27 | 3.375 | +1.3 | 2.37 |
| Snow Ermine | common | 0 | 2/4 | evasive, frost | 17.62 | +27.2 ± 5.7 | +4.5 | 0.26 | 3.25 | +1.1 | 2.17 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 65.62 | -5.6 ± 5.6 | -0.9 | -0.01 | -0.125 | +0.8 | 1.74 |
| Cone-cutter Squirrel | common | 0 | 2/6 | triggers | 21.71 | +22.6 ± 5.7 | +3.8 | 0.17 | 2.125 | +0.7 | 1.52 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 22.9 | +21.8 ± 6.1 | +3.6 | 0.16 | 2 | +0.7 | 1.4 |
| Beluga | rare | 1 | 1/16 | inspiring, sonar, tide | 31.7 | +14.2 ± 6.0 | +2.4 | 0.07 | 0.875 | +0.4 | 0.84 |
| Mountain Hare | common | 0 | 2/3 | evasive, frostbite | 15.86 | +23.0 ± 5.6 | +3.8 | 0.24 | 3 | +0.2 | 0.33 |
| Frost Hare Sprinter | common | 0 | 2/4 | evasive | 17.62 | +21.2 ± 5.6 | +3.5 | 0.20 | 2.5 | +0.1 | 0.1 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 26.23 | +13.4 ± 6.0 | +2.2 | 0.09 | 1.125 | -0.3 | -0.61 |
| Lone Grey Wolf | veryrare | 1 | 2/9 | loneWolf | 33.71 | +6.2 ± 5.4 | +1.0 | 0.03 | 0.375 | -0.7 | -1.51 |
| Snow Bunting Archer | uncommon | 1 | 2/6 | iceArrow | 25.73 | +10.0 ± 6.2 | +1.7 | 0.06 | 0.75 | -0.9 | -1.76 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 24.47 | +8.0 ± 5.4 | +1.3 | 0.05 | 0.625 | -1.4 | -3.04 |
| Polar Bear | veryrare | 1 | 2/17 | ambush, hibernate | 33.71 | -4.0 ± 5.6 | -0.7 | -0.02 | -0.25 | -2.4 | -5.03 |
| Spitting Spider | uncommon | 1 | 4/5 | poisonBolt | 25.73 | +0.8 ± 5.6 | +0.1 | 0.01 | 0.125 | -2.5 | -5.16 |
| Alpha Howler | common | 2 | 7/7 | sweep | 37.79 | -7.8 ± 5.7 | -1.3 | -0.03 | -0.375 | -2.6 | -5.32 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Alpha Howler | common | 2 | 7/7 | sweep | 37.79 | -7.8 ± 5.7 | -1.3 | -0.03 | -0.375 | -2.6 | -5.32 |
| Spitting Spider | uncommon | 1 | 4/5 | poisonBolt | 25.73 | +0.8 ± 5.6 | +0.1 | 0.01 | 0.125 | -2.5 | -5.16 |
| Polar Bear | veryrare | 1 | 2/17 | ambush, hibernate | 33.71 | -4.0 ± 5.6 | -0.7 | -0.02 | -0.25 | -2.4 | -5.03 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 24.47 | +8.0 ± 5.4 | +1.3 | 0.05 | 0.625 | -1.4 | -3.04 |
| Snow Bunting Archer | uncommon | 1 | 2/6 | iceArrow | 25.73 | +10.0 ± 6.2 | +1.7 | 0.06 | 0.75 | -0.9 | -1.76 |
| Lone Grey Wolf | veryrare | 1 | 2/9 | loneWolf | 33.71 | +6.2 ± 5.4 | +1.0 | 0.03 | 0.375 | -0.7 | -1.51 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 26.23 | +13.4 ± 6.0 | +2.2 | 0.09 | 1.125 | -0.3 | -0.61 |
| Frost Hare Sprinter | common | 0 | 2/4 | evasive | 17.62 | +21.2 ± 5.6 | +3.5 | 0.20 | 2.5 | +0.1 | 0.1 |
| Mountain Hare | common | 0 | 2/3 | evasive, frostbite | 15.86 | +23.0 ± 5.6 | +3.8 | 0.24 | 3 | +0.2 | 0.33 |
| Beluga | rare | 1 | 1/16 | inspiring, sonar, tide | 31.7 | +14.2 ± 6.0 | +2.4 | 0.07 | 0.875 | +0.4 | 0.84 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 22.9 | +21.8 ± 6.1 | +3.6 | 0.16 | 2 | +0.7 | 1.4 |
| Cone-cutter Squirrel | common | 0 | 2/6 | triggers | 21.71 | +22.6 ± 5.7 | +3.8 | 0.17 | 2.125 | +0.7 | 1.52 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 65.62 | -5.6 ± 5.6 | -0.9 | -0.01 | -0.125 | +0.8 | 1.74 |
| Snow Ermine | common | 0 | 2/4 | evasive, frost | 17.62 | +27.2 ± 5.7 | +4.5 | 0.26 | 3.25 | +1.1 | 2.17 |
| Talus Pika | common | 0 | 2/7 | triggers | 17.62 | +28.4 ± 6.2 | +4.7 | 0.27 | 3.375 | +1.3 | 2.37 |
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 33.71 | +43.4 ± 6.4 | +7.2 | 0.21 | 2.625 | +5.5 | 10.11 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Walrus Icebreaker | veryrare | 1 | 4/17 | freeze, shatter | 33.71 | +43.4 ± 6.4 | +7.2 | 0.21 | 2.625 | +5.5 | 10.11 |
| Talus Pika | common | 0 | 2/7 | triggers | 17.62 | +28.4 ± 6.2 | +4.7 | 0.27 | 3.375 | +1.3 | 2.37 |
| Snow Ermine | common | 0 | 2/4 | evasive, frost | 17.62 | +27.2 ± 5.7 | +4.5 | 0.26 | 3.25 | +1.1 | 2.17 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 65.62 | -5.6 ± 5.6 | -0.9 | -0.01 | -0.125 | +0.8 | 1.74 |
| Cone-cutter Squirrel | common | 0 | 2/6 | triggers | 21.71 | +22.6 ± 5.7 | +3.8 | 0.17 | 2.125 | +0.7 | 1.52 |
| Ravenous Wolverine | rare | 1 | 3/3 | beset, triggers | 22.9 | +21.8 ± 6.1 | +3.6 | 0.16 | 2 | +0.7 | 1.4 |
| Beluga | rare | 1 | 1/16 | inspiring, sonar, tide | 31.7 | +14.2 ± 6.0 | +2.4 | 0.07 | 0.875 | +0.4 | 0.84 |
| Mountain Hare | common | 0 | 2/3 | evasive, frostbite | 15.86 | +23.0 ± 5.6 | +3.8 | 0.24 | 3 | +0.2 | 0.33 |
| Frost Hare Sprinter | common | 0 | 2/4 | evasive | 17.62 | +21.2 ± 5.6 | +3.5 | 0.20 | 2.5 | +0.1 | 0.1 |
| Woodland Caribou | uncommon | 1 | 3/8 | frostbite, mountainClimber | 26.23 | +13.4 ± 6.0 | +2.2 | 0.09 | 1.125 | -0.3 | -0.61 |
| Lone Grey Wolf | veryrare | 1 | 2/9 | loneWolf | 33.71 | +6.2 ± 5.4 | +1.0 | 0.03 | 0.375 | -0.7 | -1.51 |
| Snow Bunting Archer | uncommon | 1 | 2/6 | iceArrow | 25.73 | +10.0 ± 6.2 | +1.7 | 0.06 | 0.75 | -0.9 | -1.76 |
| Harbor Seal | common | 1 | 1/9 | dive, evasive, tide | 24.47 | +8.0 ± 5.4 | +1.3 | 0.05 | 0.625 | -1.4 | -3.04 |
| Polar Bear | veryrare | 1 | 2/17 | ambush, hibernate | 33.71 | -4.0 ± 5.6 | -0.7 | -0.02 | -0.25 | -2.4 | -5.03 |
| Spitting Spider | uncommon | 1 | 4/5 | poisonBolt | 25.73 | +0.8 ± 5.6 | +0.1 | 0.01 | 0.125 | -2.5 | -5.16 |
| Alpha Howler | common | 2 | 7/7 | sweep | 37.79 | -7.8 ± 5.7 | -1.3 | -0.03 | -0.375 | -2.6 | -5.32 |
