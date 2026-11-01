# Card value per budget point (map02-mb-bpro, 2026-11-01)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map mb --all --games 300` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `ea791085ef41`.

## How it is measured

- 300 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 17-card pool, and one of 5 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 0, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +1.6 + 0.140 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.6 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Conch Herald | uncommon | 1 | 2/13 | inspiring, tide | 19.04 | +62.0 ± 5.6 | +10.3 | 0.54 | 2.0769 | +6.0 | 12.57 |
| Pincushion Urchin | common | 0 | 2/4 | thorns, tide | 14.97 | +44.0 ± 5.8 | +7.3 | 0.49 | 1.8846 | +3.6 | 7.24 |
| Grey Seal Bull | uncommon | 1 | 4/11 | guardian, tide | 23.28 | +36.7 ± 6.3 | +6.1 | 0.26 | 1 | +1.1 | 2.12 |
| Cricket Drummer | common | 0 | 2/7 | - | 12.11 | +25.3 ± 5.3 | +4.2 | 0.35 | 1.3462 | +0.9 | 1.92 |
| Bramble Sprout | common | 0 | 2/7 | - | 11.87 | +24.0 ± 5.3 | +4.0 | 0.34 | 1.3077 | +0.7 | 1.52 |
| Conch Crawler | common | 0 | 1/3 | shell, shield, tide | 14.97 | +26.3 ± 5.7 | +4.4 | 0.29 | 1.1154 | +0.6 | 1.28 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 11.3 | +22.0 ± 5.4 | +3.7 | 0.32 | 1.2308 | +0.4 | 0.93 |
| Fiddler Crab Swarm | common | 0 | 1/8 | crabClaws, tide | 11.75 | +21.0 ± 5.7 | +3.5 | 0.30 | 1.1538 | +0.2 | 0.39 |
| Tide Pool Crab | common | 0 | 1/2 | armor, shield, tide | 12.88 | +20.7 ± 5.6 | +3.4 | 0.27 | 1.0385 | -0.0 | -0.06 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 14.97 | +20.0 ± 5.8 | +3.3 | 0.22 | 0.8462 | -0.4 | -0.89 |
| Oystercatcher | common | 1 | 2/6 | flying, pierce | 17.46 | +20.3 ± 5.9 | +3.4 | 0.19 | 0.7308 | -0.7 | -1.48 |
| Beaver Lumberjack | common | 0 | 3/4 | stockpile | 14.97 | +16.7 ± 5.0 | +2.8 | 0.19 | 0.7308 | -1.0 | -2.34 |
| Tidepool Trapper Crab | common | 0 | 1/7 | crabClaws, hunter, hunterVs | 11.3 | +11.7 ± 5.5 | +1.9 | 0.17 | 0.6538 | -1.3 | -2.78 |
| Sea Turtle Elder | common | 2 | 4/9 | armor, tide | 29.44 | +24.3 ± 6.2 | +4.1 | 0.14 | 0.5385 | -1.8 | -3.43 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 11.3 | +5.7 ± 5.8 | +0.9 | 0.08 | 0.3077 | -2.3 | -4.68 |
| Rock Pool Starfish | common | 0 | 2/1 | regen, tide | 14.97 | +7.0 ± 3.8 | +1.2 | 0.08 | 0.3077 | -2.6 | -8.08 |
| Badger Lumberjack | uncommon | 1 | 1/11 | lumberjack | 18.81 | +6.7 ± 5.4 | +1.1 | 0.06 | 0.2308 | -3.2 | -6.97 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Badger Lumberjack | uncommon | 1 | 1/11 | lumberjack | 18.81 | +6.7 ± 5.4 | +1.1 | 0.06 | 0.2308 | -3.2 | -6.97 |
| Rock Pool Starfish | common | 0 | 2/1 | regen, tide | 14.97 | +7.0 ± 3.8 | +1.2 | 0.08 | 0.3077 | -2.6 | -8.08 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 11.3 | +5.7 ± 5.8 | +0.9 | 0.08 | 0.3077 | -2.3 | -4.68 |
| Sea Turtle Elder | common | 2 | 4/9 | armor, tide | 29.44 | +24.3 ± 6.2 | +4.1 | 0.14 | 0.5385 | -1.8 | -3.43 |
| Tidepool Trapper Crab | common | 0 | 1/7 | crabClaws, hunter, hunterVs | 11.3 | +11.7 ± 5.5 | +1.9 | 0.17 | 0.6538 | -1.3 | -2.78 |
| Beaver Lumberjack | common | 0 | 3/4 | stockpile | 14.97 | +16.7 ± 5.0 | +2.8 | 0.19 | 0.7308 | -1.0 | -2.34 |
| Oystercatcher | common | 1 | 2/6 | flying, pierce | 17.46 | +20.3 ± 5.9 | +3.4 | 0.19 | 0.7308 | -0.7 | -1.48 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 14.97 | +20.0 ± 5.8 | +3.3 | 0.22 | 0.8462 | -0.4 | -0.89 |
| Tide Pool Crab | common | 0 | 1/2 | armor, shield, tide | 12.88 | +20.7 ± 5.6 | +3.4 | 0.27 | 1.0385 | -0.0 | -0.06 |
| Fiddler Crab Swarm | common | 0 | 1/8 | crabClaws, tide | 11.75 | +21.0 ± 5.7 | +3.5 | 0.30 | 1.1538 | +0.2 | 0.39 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 11.3 | +22.0 ± 5.4 | +3.7 | 0.32 | 1.2308 | +0.4 | 0.93 |
| Conch Crawler | common | 0 | 1/3 | shell, shield, tide | 14.97 | +26.3 ± 5.7 | +4.4 | 0.29 | 1.1154 | +0.6 | 1.28 |
| Bramble Sprout | common | 0 | 2/7 | - | 11.87 | +24.0 ± 5.3 | +4.0 | 0.34 | 1.3077 | +0.7 | 1.52 |
| Cricket Drummer | common | 0 | 2/7 | - | 12.11 | +25.3 ± 5.3 | +4.2 | 0.35 | 1.3462 | +0.9 | 1.92 |
| Grey Seal Bull | uncommon | 1 | 4/11 | guardian, tide | 23.28 | +36.7 ± 6.3 | +6.1 | 0.26 | 1 | +1.1 | 2.12 |
| Pincushion Urchin | common | 0 | 2/4 | thorns, tide | 14.97 | +44.0 ± 5.8 | +7.3 | 0.49 | 1.8846 | +3.6 | 7.24 |
| Conch Herald | uncommon | 1 | 2/13 | inspiring, tide | 19.04 | +62.0 ± 5.6 | +10.3 | 0.54 | 2.0769 | +6.0 | 12.57 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Conch Herald | uncommon | 1 | 2/13 | inspiring, tide | 19.04 | +62.0 ± 5.6 | +10.3 | 0.54 | 2.0769 | +6.0 | 12.57 |
| Pincushion Urchin | common | 0 | 2/4 | thorns, tide | 14.97 | +44.0 ± 5.8 | +7.3 | 0.49 | 1.8846 | +3.6 | 7.24 |
| Grey Seal Bull | uncommon | 1 | 4/11 | guardian, tide | 23.28 | +36.7 ± 6.3 | +6.1 | 0.26 | 1 | +1.1 | 2.12 |
| Cricket Drummer | common | 0 | 2/7 | - | 12.11 | +25.3 ± 5.3 | +4.2 | 0.35 | 1.3462 | +0.9 | 1.92 |
| Bramble Sprout | common | 0 | 2/7 | - | 11.87 | +24.0 ± 5.3 | +4.0 | 0.34 | 1.3077 | +0.7 | 1.52 |
| Conch Crawler | common | 0 | 1/3 | shell, shield, tide | 14.97 | +26.3 ± 5.7 | +4.4 | 0.29 | 1.1154 | +0.6 | 1.28 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 11.3 | +22.0 ± 5.4 | +3.7 | 0.32 | 1.2308 | +0.4 | 0.93 |
| Fiddler Crab Swarm | common | 0 | 1/8 | crabClaws, tide | 11.75 | +21.0 ± 5.7 | +3.5 | 0.30 | 1.1538 | +0.2 | 0.39 |
| Tide Pool Crab | common | 0 | 1/2 | armor, shield, tide | 12.88 | +20.7 ± 5.6 | +3.4 | 0.27 | 1.0385 | -0.0 | -0.06 |
| Driftwood Crab | common | 0 | 2/7 | triggers | 14.97 | +20.0 ± 5.8 | +3.3 | 0.22 | 0.8462 | -0.4 | -0.89 |
| Oystercatcher | common | 1 | 2/6 | flying, pierce | 17.46 | +20.3 ± 5.9 | +3.4 | 0.19 | 0.7308 | -0.7 | -1.48 |
| Beaver Lumberjack | common | 0 | 3/4 | stockpile | 14.97 | +16.7 ± 5.0 | +2.8 | 0.19 | 0.7308 | -1.0 | -2.34 |
| Tidepool Trapper Crab | common | 0 | 1/7 | crabClaws, hunter, hunterVs | 11.3 | +11.7 ± 5.5 | +1.9 | 0.17 | 0.6538 | -1.3 | -2.78 |
| Sea Turtle Elder | common | 2 | 4/9 | armor, tide | 29.44 | +24.3 ± 6.2 | +4.1 | 0.14 | 0.5385 | -1.8 | -3.43 |
| Gull Thief | common | 0 | 1/4 | flying, foePlenty, triggers | 11.3 | +5.7 ± 5.8 | +0.9 | 0.08 | 0.3077 | -2.3 | -4.68 |
| Rock Pool Starfish | common | 0 | 2/1 | regen, tide | 14.97 | +7.0 ± 3.8 | +1.2 | 0.08 | 0.3077 | -2.6 | -8.08 |
| Badger Lumberjack | uncommon | 1 | 1/11 | lumberjack | 18.81 | +6.7 ± 5.4 | +1.1 | 0.06 | 0.2308 | -3.2 | -6.97 |
