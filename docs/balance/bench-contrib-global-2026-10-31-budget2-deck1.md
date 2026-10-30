# Card value per budget point (global, 2026-10-30)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --all --games 200` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `24f5fbcaaae6`.

## How it is measured

- 200 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 767-card pool, and one of 410 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 1, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +0.4 + 0.370 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±7.2 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 19.99 | +56.0 ± 7.0 | +9.3 | 0.47 | 1.2703 | +1.6 | 2.62 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 24.19 | +56.8 ± 7.3 | +9.5 | 0.39 | 1.0541 | +0.2 | 0.27 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 21.15 | +46.8 ± 7.3 | +7.8 | 0.37 | 1 | -0.4 | -0.63 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +31.8 ± 6.7 | +5.3 | 0.36 | 0.973 | -0.5 | -0.84 |
| Wolf Spider Mother | rare | 1 | 3/9 | brood | 23.26 | +48.5 ± 7.2 | +8.1 | 0.35 | 0.9459 | -0.9 | -1.43 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Wolf Spider Mother | rare | 1 | 3/9 | brood | 23.26 | +48.5 ± 7.2 | +8.1 | 0.35 | 0.9459 | -0.9 | -1.43 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +31.8 ± 6.7 | +5.3 | 0.36 | 0.973 | -0.5 | -0.84 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 21.15 | +46.8 ± 7.3 | +7.8 | 0.37 | 1 | -0.4 | -0.63 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 24.19 | +56.8 ± 7.3 | +9.5 | 0.39 | 1.0541 | +0.2 | 0.27 |
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 19.99 | +56.0 ± 7.0 | +9.3 | 0.47 | 1.2703 | +1.6 | 2.62 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ashbone Ghoul | common | 0 | 2/7 | remember, triggers | 19.99 | +56.0 ± 7.0 | +9.3 | 0.47 | 1.2703 | +1.6 | 2.62 |
| Eagle-Owl Quartermaster | rare | 1 | 1/10 | arrow, fletcher, flying | 24.19 | +56.8 ± 7.3 | +9.5 | 0.39 | 1.0541 | +0.2 | 0.27 |
| Grave-Grin Hyena | uncommon | 0 | 2/14 | executioner | 21.15 | +46.8 ± 7.3 | +7.8 | 0.37 | 1 | -0.4 | -0.63 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 14.56 | +31.8 ± 6.7 | +5.3 | 0.36 | 0.973 | -0.5 | -0.84 |
| Wolf Spider Mother | rare | 1 | 3/9 | brood | 23.26 | +48.5 ± 7.2 | +8.1 | 0.35 | 0.9459 | -0.9 | -1.43 |
