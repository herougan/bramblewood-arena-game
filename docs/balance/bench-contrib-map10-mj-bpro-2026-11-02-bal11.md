# Card value per budget point (map10-mj-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map mj --all --games 300` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `33d0ac584cd8`.

## How it is measured

- 300 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 22-card pool, and one of 5 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +3.9 + 0.020 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.1 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nautilus Drifter | rare | 1 | 4/13 | onReadyGold | 34.87 | +54.2 ± 5.2 | +9.0 | 0.26 | 1.7333 | +4.5 | 10.27 |
| Mangrove Manatee | rare | 1 | 7/7 | guardian, regen, tide | 35.36 | +52.2 ± 5.1 | +8.7 | 0.25 | 1.6667 | +4.2 | 9.61 |
| Coral Polyp Colony | common | 0 | 0/9 | onReadyGold, tide | 19.7 | +49.8 ± 5.2 | +8.3 | 0.42 | 2.8 | +4.1 | 9.18 |
| Parrotfish | common | 0 | 2/9 | pierce, tide | 19.7 | +36.8 ± 5.0 | +6.1 | 0.31 | 2.0667 | +1.9 | 4.49 |
| Abyss Lantern Squid | uncommon | 1 | 3/16 | shock, tide | 29.83 | +35.8 ± 5.4 | +6.0 | 0.20 | 1.3333 | +1.5 | 3.3 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 29.58 | +33.8 ± 5.1 | +5.6 | 0.19 | 1.2667 | +1.2 | 2.77 |
| Blue-ringed Octopus | rare | 1 | 2/11 | octolash | 30.58 | +30.2 ± 4.8 | +5.0 | 0.16 | 1.0667 | +0.6 | 1.43 |
| Glass Octopus | rare | 1 | 4/9 | corrode, stealth | 31.08 | +26.8 ± 5.6 | +4.5 | 0.14 | 0.9333 | +0.0 | 0.02 |
| Clownfish Scout | common | 0 | 1/9 | tide | 15.66 | +24.8 ± 5.0 | +4.1 | 0.26 | 1.7333 | -0.0 | -0.05 |
| Electric Ray | uncommon | 1 | 3/8 | charge | 24.42 | +24.5 ± 5.3 | +4.1 | 0.17 | 1.1333 | -0.3 | -0.56 |
| Reef Shark | common | 2 | 6/13 | tide | 35.61 | +25.7 ± 5.2 | +4.3 | 0.12 | 0.8 | -0.3 | -0.61 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 34.31 | +24.8 ± 5.2 | +4.1 | 0.12 | 0.8 | -0.4 | -0.85 |
| Hagfish Silencer | rare | 1 | 3/12 | nullify | 23.18 | +22.8 ± 5.2 | +3.8 | 0.16 | 1.0667 | -0.5 | -1.12 |
| Coral Reef Shark | uncommon | 2 | 4/10 | tide | 26.91 | +22.0 ± 5.0 | +3.7 | 0.14 | 0.9333 | -0.7 | -1.66 |
| Banded Sea Krait | uncommon | 1 | 4/3 | nocturnal, venomous | 24.18 | +20.3 ± 5.2 | +3.4 | 0.14 | 0.9333 | -0.9 | -2.1 |
| Silver Minnow | starter | 0 | 2/4 | - | 13.31 | +17.8 ± 5.0 | +3.0 | 0.22 | 1.4667 | -1.1 | -2.69 |
| Riptide Eel | uncommon | 1 | 6/7 | reload, tide | 23.68 | +16.3 ± 4.7 | +2.7 | 0.11 | 0.7333 | -1.6 | -3.94 |
| Kraken Spawnling | common | 3 | 2/16 | fork, gash | 34.06 | +17.2 ± 4.7 | +2.9 | 0.08 | 0.5333 | -1.7 | -4.12 |
| Great Barracuda | rare | 1 | 4/4 | quick, tide | 25.67 | +13.3 ± 5.1 | +2.2 | 0.09 | 0.6 | -2.1 | -4.92 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 48.04 | +14.8 ± 4.7 | +2.5 | 0.05 | 0.3333 | -2.3 | -5.78 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Orca Vanguard | common | 3 | 7/7 | sweep, tide | 39.34 | +9.2 ± 5.0 | +1.5 | 0.04 | 0.2667 | -3.1 | -7.27 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 13.92 | +7.0 ± 4.5 | +1.2 | 0.08 | 0.5333 | -2.9 | -7.66 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 48.04 | +14.8 ± 4.7 | +2.5 | 0.05 | 0.3333 | -2.3 | -5.78 |
| Great Barracuda | rare | 1 | 4/4 | quick, tide | 25.67 | +13.3 ± 5.1 | +2.2 | 0.09 | 0.6 | -2.1 | -4.92 |
| Kraken Spawnling | common | 3 | 2/16 | fork, gash | 34.06 | +17.2 ± 4.7 | +2.9 | 0.08 | 0.5333 | -1.7 | -4.12 |
| Riptide Eel | uncommon | 1 | 6/7 | reload, tide | 23.68 | +16.3 ± 4.7 | +2.7 | 0.11 | 0.7333 | -1.6 | -3.94 |
| Silver Minnow | starter | 0 | 2/4 | - | 13.31 | +17.8 ± 5.0 | +3.0 | 0.22 | 1.4667 | -1.1 | -2.69 |
| Banded Sea Krait | uncommon | 1 | 4/3 | nocturnal, venomous | 24.18 | +20.3 ± 5.2 | +3.4 | 0.14 | 0.9333 | -0.9 | -2.1 |
| Coral Reef Shark | uncommon | 2 | 4/10 | tide | 26.91 | +22.0 ± 5.0 | +3.7 | 0.14 | 0.9333 | -0.7 | -1.66 |
| Hagfish Silencer | rare | 1 | 3/12 | nullify | 23.18 | +22.8 ± 5.2 | +3.8 | 0.16 | 1.0667 | -0.5 | -1.12 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 34.31 | +24.8 ± 5.2 | +4.1 | 0.12 | 0.8 | -0.4 | -0.85 |
| Reef Shark | common | 2 | 6/13 | tide | 35.61 | +25.7 ± 5.2 | +4.3 | 0.12 | 0.8 | -0.3 | -0.61 |
| Electric Ray | uncommon | 1 | 3/8 | charge | 24.42 | +24.5 ± 5.3 | +4.1 | 0.17 | 1.1333 | -0.3 | -0.56 |
| Clownfish Scout | common | 0 | 1/9 | tide | 15.66 | +24.8 ± 5.0 | +4.1 | 0.26 | 1.7333 | -0.0 | -0.05 |
| Glass Octopus | rare | 1 | 4/9 | corrode, stealth | 31.08 | +26.8 ± 5.6 | +4.5 | 0.14 | 0.9333 | +0.0 | 0.02 |
| Blue-ringed Octopus | rare | 1 | 2/11 | octolash | 30.58 | +30.2 ± 4.8 | +5.0 | 0.16 | 1.0667 | +0.6 | 1.43 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 29.58 | +33.8 ± 5.1 | +5.6 | 0.19 | 1.2667 | +1.2 | 2.77 |
| Abyss Lantern Squid | uncommon | 1 | 3/16 | shock, tide | 29.83 | +35.8 ± 5.4 | +6.0 | 0.20 | 1.3333 | +1.5 | 3.3 |
| Parrotfish | common | 0 | 2/9 | pierce, tide | 19.7 | +36.8 ± 5.0 | +6.1 | 0.31 | 2.0667 | +1.9 | 4.49 |
| Coral Polyp Colony | common | 0 | 0/9 | onReadyGold, tide | 19.7 | +49.8 ± 5.2 | +8.3 | 0.42 | 2.8 | +4.1 | 9.18 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nautilus Drifter | rare | 1 | 4/13 | onReadyGold | 34.87 | +54.2 ± 5.2 | +9.0 | 0.26 | 1.7333 | +4.5 | 10.27 |
| Mangrove Manatee | rare | 1 | 7/7 | guardian, regen, tide | 35.36 | +52.2 ± 5.1 | +8.7 | 0.25 | 1.6667 | +4.2 | 9.61 |
| Coral Polyp Colony | common | 0 | 0/9 | onReadyGold, tide | 19.7 | +49.8 ± 5.2 | +8.3 | 0.42 | 2.8 | +4.1 | 9.18 |
| Parrotfish | common | 0 | 2/9 | pierce, tide | 19.7 | +36.8 ± 5.0 | +6.1 | 0.31 | 2.0667 | +1.9 | 4.49 |
| Abyss Lantern Squid | uncommon | 1 | 3/16 | shock, tide | 29.83 | +35.8 ± 5.4 | +6.0 | 0.20 | 1.3333 | +1.5 | 3.3 |
| Swordfish Spearman | rare | 1 | 3/14 | trident | 29.58 | +33.8 ± 5.1 | +5.6 | 0.19 | 1.2667 | +1.2 | 2.77 |
| Blue-ringed Octopus | rare | 1 | 2/11 | octolash | 30.58 | +30.2 ± 4.8 | +5.0 | 0.16 | 1.0667 | +0.6 | 1.43 |
| Glass Octopus | rare | 1 | 4/9 | corrode, stealth | 31.08 | +26.8 ± 5.6 | +4.5 | 0.14 | 0.9333 | +0.0 | 0.02 |
| Clownfish Scout | common | 0 | 1/9 | tide | 15.66 | +24.8 ± 5.0 | +4.1 | 0.26 | 1.7333 | -0.0 | -0.05 |
| Electric Ray | uncommon | 1 | 3/8 | charge | 24.42 | +24.5 ± 5.3 | +4.1 | 0.17 | 1.1333 | -0.3 | -0.56 |
| Reef Shark | common | 2 | 6/13 | tide | 35.61 | +25.7 ± 5.2 | +4.3 | 0.12 | 0.8 | -0.3 | -0.61 |
| Vampire Squid | rare | 2 | 4/14 | bleed | 34.31 | +24.8 ± 5.2 | +4.1 | 0.12 | 0.8 | -0.4 | -0.85 |
| Hagfish Silencer | rare | 1 | 3/12 | nullify | 23.18 | +22.8 ± 5.2 | +3.8 | 0.16 | 1.0667 | -0.5 | -1.12 |
| Coral Reef Shark | uncommon | 2 | 4/10 | tide | 26.91 | +22.0 ± 5.0 | +3.7 | 0.14 | 0.9333 | -0.7 | -1.66 |
| Banded Sea Krait | uncommon | 1 | 4/3 | nocturnal, venomous | 24.18 | +20.3 ± 5.2 | +3.4 | 0.14 | 0.9333 | -0.9 | -2.1 |
| Silver Minnow | starter | 0 | 2/4 | - | 13.31 | +17.8 ± 5.0 | +3.0 | 0.22 | 1.4667 | -1.1 | -2.69 |
| Riptide Eel | uncommon | 1 | 6/7 | reload, tide | 23.68 | +16.3 ± 4.7 | +2.7 | 0.11 | 0.7333 | -1.6 | -3.94 |
| Kraken Spawnling | common | 3 | 2/16 | fork, gash | 34.06 | +17.2 ± 4.7 | +2.9 | 0.08 | 0.5333 | -1.7 | -4.12 |
| Great Barracuda | rare | 1 | 4/4 | quick, tide | 25.67 | +13.3 ± 5.1 | +2.2 | 0.09 | 0.6 | -2.1 | -4.92 |
| Colossal Squid | veryrare | 4 | 4/23 | fork, gash, tide | 48.04 | +14.8 ± 4.7 | +2.5 | 0.05 | 0.3333 | -2.3 | -5.78 |
| Open-Ocean Hermit Crab | common | 0 | 2/2 | armor, crabClaws, tide | 13.92 | +7.0 ± 4.5 | +1.2 | 0.08 | 0.5333 | -2.9 | -7.66 |
| Orca Vanguard | common | 3 | 7/7 | sweep, tide | 39.34 | +9.2 ± 5.0 | +1.5 | 0.04 | 0.2667 | -3.1 | -7.27 |
