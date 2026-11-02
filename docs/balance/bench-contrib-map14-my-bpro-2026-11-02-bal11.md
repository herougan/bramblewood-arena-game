# Card value per budget point (map14-my-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map my --all --games 300` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `a6b2986076eb`.

## How it is measured

- 300 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 27-card pool, and one of 5 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3.54, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +5.6 + -0.070 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.6 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Siege Rhino | rare | 1 | 5/17 | siege | 39.52 | +49.0 ± 6.1 | +8.2 | 0.21 | 1.3125 | +5.5 | 10.53 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 25.88 | +51.0 ± 6.0 | +8.5 | 0.33 | 2.0625 | +4.8 | 9.43 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 24.3 | +37.7 ± 5.7 | +6.3 | 0.26 | 1.625 | +2.5 | 5.03 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 32.89 | +31.3 ± 6.2 | +5.2 | 0.16 | 1 | +2.0 | 3.81 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 31.88 | +30.7 ± 5.9 | +5.1 | 0.16 | 1 | +1.8 | 3.66 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 22.6 | +33.7 ± 5.7 | +5.6 | 0.25 | 1.5625 | +1.7 | 3.38 |
| Kinkajou Lurker | uncommon | 1 | 4/6 | nocturnal, nocturnalGrant | 27.43 | +29.7 ± 5.7 | +4.9 | 0.18 | 1.125 | +1.3 | 2.75 |
| House Cat | common | 0 | 3/3 | - | 14.9 | +34.3 ± 5.5 | +5.7 | 0.38 | 2.375 | +1.2 | 2.56 |
| Lyrebird Mimic | uncommon | 1 | 4/7 | confuse | 25.38 | +29.7 ± 5.9 | +4.9 | 0.19 | 1.1875 | +1.2 | 2.38 |
| Redwood Woodpecker | uncommon | 1 | 2/11 | milling | 24.11 | +29.3 ± 5.6 | +4.9 | 0.20 | 1.25 | +1.0 | 2.17 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.96 | +31.7 ± 5.4 | +5.3 | 0.33 | 2.0625 | +0.8 | 1.82 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.51 | +29.0 ± 5.5 | +4.8 | 0.24 | 1.5 | +0.7 | 1.53 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 18.08 | +29.7 ± 5.6 | +4.9 | 0.27 | 1.6875 | +0.6 | 1.35 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 19 | +25.7 ± 5.3 | +4.3 | 0.23 | 1.4375 | +0.1 | 0.11 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 23.1 | +21.3 ± 5.6 | +3.6 | 0.15 | 0.9375 | -0.4 | -0.76 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19 | +22.7 ± 5.4 | +3.8 | 0.20 | 1.25 | -0.4 | -0.97 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.85 | +18.7 ± 5.7 | +3.1 | 0.14 | 0.875 | -0.8 | -1.72 |
| Apollo Butterfly | uncommon | 0 | 1/8 | flying, thorns | 21.33 | +17.7 ± 5.1 | +2.9 | 0.14 | 0.875 | -1.1 | -2.54 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 20.07 | +17.7 ± 5.1 | +2.9 | 0.15 | 0.9375 | -1.2 | -2.77 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.64 | +9.7 ± 5.4 | +1.6 | 0.05 | 0.3125 | -1.6 | -3.5 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Proboscis Monkey | uncommon | 1 | 2/11 | taunt, tide | 24.11 | -7.7 ± 5.5 | -1.3 | -0.05 | -0.3125 | -5.1 | -10.91 |
| Springbok Pronker | common | 1 | 2/12 | prey | 20.51 | +2.0 ± 5.4 | +0.3 | 0.02 | 0.125 | -3.8 | -8.27 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk, guardian | 33.9 | +2.7 ± 5.8 | +0.4 | 0.01 | 0.0625 | -2.7 | -5.47 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 61.7 | -8.3 ± 5.7 | -1.4 | -0.02 | -0.125 | -2.5 | -5.02 |
| Camouflage Frog | common | 1 | 2/5 | evasive, tide | 21.08 | +12.3 ± 5.2 | +2.1 | 0.10 | 0.625 | -2.0 | -4.57 |
| Jaguar Stalker | rare | 1 | 1/15 | quick | 28.15 | +9.7 ± 5.6 | +1.6 | 0.06 | 0.375 | -1.9 | -4.1 |
| Vampire Bat | uncommon | 0 | 2/3 | flying, nocturnal, sap | 21.33 | +14.7 ± 5.4 | +2.4 | 0.11 | 0.6875 | -1.6 | -3.47 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.64 | +9.7 ± 5.4 | +1.6 | 0.05 | 0.3125 | -1.6 | -3.5 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 20.07 | +17.7 ± 5.1 | +2.9 | 0.15 | 0.9375 | -1.2 | -2.77 |
| Apollo Butterfly | uncommon | 0 | 1/8 | flying, thorns | 21.33 | +17.7 ± 5.1 | +2.9 | 0.14 | 0.875 | -1.1 | -2.54 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.85 | +18.7 ± 5.7 | +3.1 | 0.14 | 0.875 | -0.8 | -1.72 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19 | +22.7 ± 5.4 | +3.8 | 0.20 | 1.25 | -0.4 | -0.97 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 23.1 | +21.3 ± 5.6 | +3.6 | 0.15 | 0.9375 | -0.4 | -0.76 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 19 | +25.7 ± 5.3 | +4.3 | 0.23 | 1.4375 | +0.1 | 0.11 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 18.08 | +29.7 ± 5.6 | +4.9 | 0.27 | 1.6875 | +0.6 | 1.35 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.51 | +29.0 ± 5.5 | +4.8 | 0.24 | 1.5 | +0.7 | 1.53 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.96 | +31.7 ± 5.4 | +5.3 | 0.33 | 2.0625 | +0.8 | 1.82 |
| Redwood Woodpecker | uncommon | 1 | 2/11 | milling | 24.11 | +29.3 ± 5.6 | +4.9 | 0.20 | 1.25 | +1.0 | 2.17 |
| Lyrebird Mimic | uncommon | 1 | 4/7 | confuse | 25.38 | +29.7 ± 5.9 | +4.9 | 0.19 | 1.1875 | +1.2 | 2.38 |
| House Cat | common | 0 | 3/3 | - | 14.9 | +34.3 ± 5.5 | +5.7 | 0.38 | 2.375 | +1.2 | 2.56 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Siege Rhino | rare | 1 | 5/17 | siege | 39.52 | +49.0 ± 6.1 | +8.2 | 0.21 | 1.3125 | +5.5 | 10.53 |
| Pangolin Roller | uncommon | 1 | 5/5 | sturdy | 25.88 | +51.0 ± 6.0 | +8.5 | 0.33 | 2.0625 | +4.8 | 9.43 |
| Savanna Cheetah | veryrare | 1 | 4/4 | quick | 24.3 | +37.7 ± 5.7 | +6.3 | 0.26 | 1.625 | +2.5 | 5.03 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 32.89 | +31.3 ± 6.2 | +5.2 | 0.16 | 1 | +2.0 | 3.81 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 31.88 | +30.7 ± 5.9 | +5.1 | 0.16 | 1 | +1.8 | 3.66 |
| Poison Dart Croaker | common | 1 | 3/3 | poison, tide | 22.6 | +33.7 ± 5.7 | +5.6 | 0.25 | 1.5625 | +1.7 | 3.38 |
| Kinkajou Lurker | uncommon | 1 | 4/6 | nocturnal, nocturnalGrant | 27.43 | +29.7 ± 5.7 | +4.9 | 0.18 | 1.125 | +1.3 | 2.75 |
| House Cat | common | 0 | 3/3 | - | 14.9 | +34.3 ± 5.5 | +5.7 | 0.38 | 2.375 | +1.2 | 2.56 |
| Lyrebird Mimic | uncommon | 1 | 4/7 | confuse | 25.38 | +29.7 ± 5.9 | +4.9 | 0.19 | 1.1875 | +1.2 | 2.38 |
| Redwood Woodpecker | uncommon | 1 | 2/11 | milling | 24.11 | +29.3 ± 5.6 | +4.9 | 0.20 | 1.25 | +1.0 | 2.17 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 15.96 | +31.7 ± 5.4 | +5.3 | 0.33 | 2.0625 | +0.8 | 1.82 |
| Weaver Bird | common | 1 | 3/6 | tangle | 20.51 | +29.0 ± 5.5 | +4.8 | 0.24 | 1.5 | +0.7 | 1.53 |
| Hoopoe Herald | common | 0 | 2/13 | nightblind | 18.08 | +29.7 ± 5.6 | +4.9 | 0.27 | 1.6875 | +0.6 | 1.35 |
| Plains Zebra | uncommon | 0 | 1/7 | evasive | 19 | +25.7 ± 5.3 | +4.3 | 0.23 | 1.4375 | +0.1 | 0.11 |
| Grave-Grin Hyena | uncommon | 0 | 2/10 | executioner | 23.1 | +21.3 ± 5.6 | +3.6 | 0.15 | 0.9375 | -0.4 | -0.76 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19 | +22.7 ± 5.4 | +3.8 | 0.20 | 1.25 | -0.4 | -0.97 |
| Mouse Sapper | common | 1 | 3/11 | siege | 22.85 | +18.7 ± 5.7 | +3.1 | 0.14 | 0.875 | -0.8 | -1.72 |
| Apollo Butterfly | uncommon | 0 | 1/8 | flying, thorns | 21.33 | +17.7 ± 5.1 | +2.9 | 0.14 | 0.875 | -1.1 | -2.54 |
| Carrion Crow | common | 0 | 2/4 | flying, scavenge | 20.07 | +17.7 ± 5.1 | +2.9 | 0.15 | 0.9375 | -1.2 | -2.77 |
| Acacia Giraffe | common | 2 | 2/11 | evasive | 32.64 | +9.7 ± 5.4 | +1.6 | 0.05 | 0.3125 | -1.6 | -3.5 |
| Vampire Bat | uncommon | 0 | 2/3 | flying, nocturnal, sap | 21.33 | +14.7 ± 5.4 | +2.4 | 0.11 | 0.6875 | -1.6 | -3.47 |
| Jaguar Stalker | rare | 1 | 1/15 | quick | 28.15 | +9.7 ± 5.6 | +1.6 | 0.06 | 0.375 | -1.9 | -4.1 |
| Camouflage Frog | common | 1 | 2/5 | evasive, tide | 21.08 | +12.3 ± 5.2 | +2.1 | 0.10 | 0.625 | -2.0 | -4.57 |
| Ancient Sloth Titan | common | 3 | 2/31 | bulwark, slow | 61.7 | -8.3 ± 5.7 | -1.4 | -0.02 | -0.125 | -2.5 | -5.02 |
| Marula Elephant | uncommon | 2 | 4/20 | drunk, guardian | 33.9 | +2.7 ± 5.8 | +0.4 | 0.01 | 0.0625 | -2.7 | -5.47 |
| Springbok Pronker | common | 1 | 2/12 | prey | 20.51 | +2.0 ± 5.4 | +0.3 | 0.02 | 0.125 | -3.8 | -8.27 |
| Proboscis Monkey | uncommon | 1 | 2/11 | taunt, tide | 24.11 | -7.7 ± 5.5 | -1.3 | -0.05 | -0.3125 | -5.1 | -10.91 |
