# Card value per budget point (map14-m5-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map m5 --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `faa5cc9f27d4`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 16-card pool, and one of 8 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +9.5 + -0.220 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.7 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 23.87 | +47.6 ± 6.5 | +7.9 | 0.33 | 1.375 | +3.6 | 6.53 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 25.42 | +35.6 ± 7.0 | +5.9 | 0.23 | 0.9583 | +1.9 | 3.23 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 31.32 | +26.8 ± 7.2 | +4.5 | 0.14 | 0.5833 | +1.7 | 2.84 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 17.75 | +44.2 ± 6.5 | +7.4 | 0.42 | 1.75 | +1.7 | 3.07 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 18.65 | +43.0 ± 6.9 | +7.2 | 0.38 | 1.5833 | +1.7 | 2.9 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 22.68 | +33.2 ± 6.9 | +5.5 | 0.24 | 1 | +0.9 | 1.58 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.44 | +29.2 ± 6.6 | +4.9 | 0.22 | 0.9167 | +0.2 | 0.39 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 19.7 | +32.2 ± 6.7 | +5.4 | 0.27 | 1.125 | +0.1 | 0.23 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.14 | +30.4 ± 6.6 | +5.1 | 0.25 | 1.0417 | -0.1 | -0.12 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.66 | +34.6 ± 6.7 | +5.8 | 0.37 | 1.5417 | -0.3 | -0.6 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 18.65 | +26.6 ± 5.9 | +4.4 | 0.24 | 1 | -1.0 | -2.07 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk, guardian | 33.31 | +4.6 ± 7.2 | +0.8 | 0.02 | 0.0833 | -1.5 | -2.52 |
| Springbok Pronker | common | 1 | 2/12 | prey | 20.14 | +20.2 ± 6.9 | +3.4 | 0.17 | 0.7083 | -1.8 | -3 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.07 | +3.2 ± 5.8 | +0.5 | 0.02 | 0.0833 | -2.1 | -4.18 |
| House Cat | common | 0 | 3/3 | - | 14.62 | +23.4 ± 5.9 | +3.9 | 0.27 | 1.125 | -2.4 | -4.84 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.18 | +9.4 ± 6.5 | +1.6 | 0.06 | 0.25 | -2.7 | -4.89 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.18 | +9.4 ± 6.5 | +1.6 | 0.06 | 0.25 | -2.7 | -4.89 |
| House Cat | common | 0 | 3/3 | - | 14.62 | +23.4 ± 5.9 | +3.9 | 0.27 | 1.125 | -2.4 | -4.84 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.07 | +3.2 ± 5.8 | +0.5 | 0.02 | 0.0833 | -2.1 | -4.18 |
| Springbok Pronker | common | 1 | 2/12 | prey | 20.14 | +20.2 ± 6.9 | +3.4 | 0.17 | 0.7083 | -1.8 | -3 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk, guardian | 33.31 | +4.6 ± 7.2 | +0.8 | 0.02 | 0.0833 | -1.5 | -2.52 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 18.65 | +26.6 ± 5.9 | +4.4 | 0.24 | 1 | -1.0 | -2.07 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.66 | +34.6 ± 6.7 | +5.8 | 0.37 | 1.5417 | -0.3 | -0.6 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.14 | +30.4 ± 6.6 | +5.1 | 0.25 | 1.0417 | -0.1 | -0.12 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 19.7 | +32.2 ± 6.7 | +5.4 | 0.27 | 1.125 | +0.1 | 0.23 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.44 | +29.2 ± 6.6 | +4.9 | 0.22 | 0.9167 | +0.2 | 0.39 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 22.68 | +33.2 ± 6.9 | +5.5 | 0.24 | 1 | +0.9 | 1.58 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 18.65 | +43.0 ± 6.9 | +7.2 | 0.38 | 1.5833 | +1.7 | 2.9 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 17.75 | +44.2 ± 6.5 | +7.4 | 0.42 | 1.75 | +1.7 | 3.07 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 31.32 | +26.8 ± 7.2 | +4.5 | 0.14 | 0.5833 | +1.7 | 2.84 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 25.42 | +35.6 ± 7.0 | +5.9 | 0.23 | 0.9583 | +1.9 | 3.23 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 23.87 | +47.6 ± 6.5 | +7.9 | 0.33 | 1.375 | +3.6 | 6.53 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 23.87 | +47.6 ± 6.5 | +7.9 | 0.33 | 1.375 | +3.6 | 6.53 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 25.42 | +35.6 ± 7.0 | +5.9 | 0.23 | 0.9583 | +1.9 | 3.23 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 31.32 | +26.8 ± 7.2 | +4.5 | 0.14 | 0.5833 | +1.7 | 2.84 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 17.75 | +44.2 ± 6.5 | +7.4 | 0.42 | 1.75 | +1.7 | 3.07 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 18.65 | +43.0 ± 6.9 | +7.2 | 0.38 | 1.5833 | +1.7 | 2.9 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 22.68 | +33.2 ± 6.9 | +5.5 | 0.24 | 1 | +0.9 | 1.58 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.44 | +29.2 ± 6.6 | +4.9 | 0.22 | 0.9167 | +0.2 | 0.39 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 19.7 | +32.2 ± 6.7 | +5.4 | 0.27 | 1.125 | +0.1 | 0.23 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.14 | +30.4 ± 6.6 | +5.1 | 0.25 | 1.0417 | -0.1 | -0.12 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.66 | +34.6 ± 6.7 | +5.8 | 0.37 | 1.5417 | -0.3 | -0.6 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 18.65 | +26.6 ± 5.9 | +4.4 | 0.24 | 1 | -1.0 | -2.07 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk, guardian | 33.31 | +4.6 ± 7.2 | +0.8 | 0.02 | 0.0833 | -1.5 | -2.52 |
| Springbok Pronker | common | 1 | 2/12 | prey | 20.14 | +20.2 ± 6.9 | +3.4 | 0.17 | 0.7083 | -1.8 | -3 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.07 | +3.2 ± 5.8 | +0.5 | 0.02 | 0.0833 | -2.1 | -4.18 |
| House Cat | common | 0 | 3/3 | - | 14.62 | +23.4 ± 5.9 | +3.9 | 0.27 | 1.125 | -2.4 | -4.84 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.18 | +9.4 ± 6.5 | +1.6 | 0.06 | 0.25 | -2.7 | -4.89 |
