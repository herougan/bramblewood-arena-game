# Card value per budget point (map18-mpd-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map mpd --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `f997c1cc804a`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 21-card pool, and one of 9 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 3.72, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +9.9 + -0.170 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.5 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Trapdoor Spider | rare | 0 | 4/7 | poison | 24.51 | +57.2 ± 6.5 | +9.5 | 0.39 | 2.2941 | +3.9 | 6.95 |
| Dune Packrat | uncommon | 1 | 2/11 | triggers | 26.03 | +53.2 ± 6.3 | +8.9 | 0.34 | 2 | +3.5 | 6.47 |
| Thorny Devil | common | 1 | 1/20 | guardian, thorns | 30.54 | +48.0 ± 6.7 | +8.0 | 0.26 | 1.5294 | +3.4 | 5.91 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 34.61 | +42.0 ± 6.5 | +7.0 | 0.20 | 1.1765 | +3.1 | 5.51 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 34.35 | +33.6 ± 6.5 | +5.6 | 0.16 | 0.9412 | +1.6 | 2.95 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19.11 | +46.8 ± 6.7 | +7.8 | 0.41 | 2.4118 | +1.2 | 2.11 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 19.87 | +45.6 ± 6.5 | +7.6 | 0.38 | 2.2353 | +1.1 | 2.05 |
| Dromedary | uncommon | 1 | 2/15 | drought, dry | 30.8 | +34.0 ± 6.6 | +5.7 | 0.18 | 1.0588 | +1.1 | 1.93 |
| Antlion Pit | uncommon | 1 | 3/13 | trap | 27.05 | +37.8 ± 6.4 | +6.3 | 0.23 | 1.3529 | +1.1 | 1.94 |
| Caustic Scorpion | uncommon | 1 | 1/18 | poison | 31.81 | +32.2 ± 6.7 | +5.4 | 0.17 | 1 | +0.9 | 1.66 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 32.07 | +30.6 ± 6.7 | +5.1 | 0.16 | 0.9412 | +0.7 | 1.28 |
| Sandfish | common | 1 | 3/10 | invisible | 24.76 | +27.6 ± 6.2 | +4.6 | 0.19 | 1.1176 | -1.0 | -1.96 |
| Sand Widow | common | 2 | 2/17 | poison | 32.83 | +18.2 ± 6.0 | +3.0 | 0.09 | 0.5294 | -1.2 | -2.36 |
| Glass Golem | rare | 1 | 6/5 | - | 28.4 | +22.6 ± 5.9 | +3.8 | 0.13 | 0.7647 | -1.2 | -2.47 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 26.03 | +22.6 ± 6.1 | +3.8 | 0.14 | 0.8235 | -1.6 | -3.15 |
| Roadrunner Courier | common | 1 | 3/6 | haste | 20.64 | +28.0 ± 6.2 | +4.7 | 0.23 | 1.3529 | -1.7 | -3.14 |
| Fennec Fox | uncommon | 1 | 2/12 | dry | 27.05 | +17.6 ± 6.6 | +2.9 | 0.11 | 0.6471 | -2.3 | -4.12 |
| Skull Vulture | uncommon | 1 | 3/3 | daunt, flying, nocturnal | 26.03 | +17.4 ± 6.5 | +2.9 | 0.11 | 0.6471 | -2.5 | -4.56 |
| Komodo Warlord | common | 3 | 1/27 | gash, poison | 48.07 | -7.6 ± 5.7 | -1.3 | -0.03 | -0.1765 | -2.9 | -5.94 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.76 | +14.0 ± 5.8 | +2.3 | 0.09 | 0.5294 | -3.3 | -6.71 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Hollow-belly Rat | uncommon | 1 | 2/10 | devour | 22.48 | +13.8 ± 5.9 | +2.3 | 0.10 | 0.5882 | -3.7 | -7.42 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.76 | +14.0 ± 5.8 | +2.3 | 0.09 | 0.5294 | -3.3 | -6.71 |
| Komodo Warlord | common | 3 | 1/27 | gash, poison | 48.07 | -7.6 ± 5.7 | -1.3 | -0.03 | -0.1765 | -2.9 | -5.94 |
| Skull Vulture | uncommon | 1 | 3/3 | daunt, flying, nocturnal | 26.03 | +17.4 ± 6.5 | +2.9 | 0.11 | 0.6471 | -2.5 | -4.56 |
| Fennec Fox | uncommon | 1 | 2/12 | dry | 27.05 | +17.6 ± 6.6 | +2.9 | 0.11 | 0.6471 | -2.3 | -4.12 |
| Roadrunner Courier | common | 1 | 3/6 | haste | 20.64 | +28.0 ± 6.2 | +4.7 | 0.23 | 1.3529 | -1.7 | -3.14 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 26.03 | +22.6 ± 6.1 | +3.8 | 0.14 | 0.8235 | -1.6 | -3.15 |
| Glass Golem | rare | 1 | 6/5 | - | 28.4 | +22.6 ± 5.9 | +3.8 | 0.13 | 0.7647 | -1.2 | -2.47 |
| Sand Widow | common | 2 | 2/17 | poison | 32.83 | +18.2 ± 6.0 | +3.0 | 0.09 | 0.5294 | -1.2 | -2.36 |
| Sandfish | common | 1 | 3/10 | invisible | 24.76 | +27.6 ± 6.2 | +4.6 | 0.19 | 1.1176 | -1.0 | -1.96 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 32.07 | +30.6 ± 6.7 | +5.1 | 0.16 | 0.9412 | +0.7 | 1.28 |
| Caustic Scorpion | uncommon | 1 | 1/18 | poison | 31.81 | +32.2 ± 6.7 | +5.4 | 0.17 | 1 | +0.9 | 1.66 |
| Antlion Pit | uncommon | 1 | 3/13 | trap | 27.05 | +37.8 ± 6.4 | +6.3 | 0.23 | 1.3529 | +1.1 | 1.94 |
| Dromedary | uncommon | 1 | 2/15 | drought, dry | 30.8 | +34.0 ± 6.6 | +5.7 | 0.18 | 1.0588 | +1.1 | 1.93 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 19.87 | +45.6 ± 6.5 | +7.6 | 0.38 | 2.2353 | +1.1 | 2.05 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19.11 | +46.8 ± 6.7 | +7.8 | 0.41 | 2.4118 | +1.2 | 2.11 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 34.35 | +33.6 ± 6.5 | +5.6 | 0.16 | 0.9412 | +1.6 | 2.95 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 34.61 | +42.0 ± 6.5 | +7.0 | 0.20 | 1.1765 | +3.1 | 5.51 |
| Thorny Devil | common | 1 | 1/20 | guardian, thorns | 30.54 | +48.0 ± 6.7 | +8.0 | 0.26 | 1.5294 | +3.4 | 5.91 |
| Dune Packrat | uncommon | 1 | 2/11 | triggers | 26.03 | +53.2 ± 6.3 | +8.9 | 0.34 | 2 | +3.5 | 6.47 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Trapdoor Spider | rare | 0 | 4/7 | poison | 24.51 | +57.2 ± 6.5 | +9.5 | 0.39 | 2.2941 | +3.9 | 6.95 |
| Dune Packrat | uncommon | 1 | 2/11 | triggers | 26.03 | +53.2 ± 6.3 | +8.9 | 0.34 | 2 | +3.5 | 6.47 |
| Thorny Devil | common | 1 | 1/20 | guardian, thorns | 30.54 | +48.0 ± 6.7 | +8.0 | 0.26 | 1.5294 | +3.4 | 5.91 |
| Quicksand Queen | veryrare | 1 | 2/19 | tangle, trap | 34.61 | +42.0 ± 6.5 | +7.0 | 0.20 | 1.1765 | +3.1 | 5.51 |
| Dust-devil Kestrel | veryrare | 1 | 5/10 | tornado | 34.35 | +33.6 ± 6.5 | +5.6 | 0.16 | 0.9412 | +1.6 | 2.95 |
| Dust Hyena | uncommon | 0 | 2/6 | carnage, triggers | 19.11 | +46.8 ± 6.7 | +7.8 | 0.41 | 2.4118 | +1.2 | 2.11 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 19.87 | +45.6 ± 6.5 | +7.6 | 0.38 | 2.2353 | +1.1 | 2.05 |
| Dromedary | uncommon | 1 | 2/15 | drought, dry | 30.8 | +34.0 ± 6.6 | +5.7 | 0.18 | 1.0588 | +1.1 | 1.93 |
| Antlion Pit | uncommon | 1 | 3/13 | trap | 27.05 | +37.8 ± 6.4 | +6.3 | 0.23 | 1.3529 | +1.1 | 1.94 |
| Caustic Scorpion | uncommon | 1 | 1/18 | poison | 31.81 | +32.2 ± 6.7 | +5.4 | 0.17 | 1 | +0.9 | 1.66 |
| Spitting Cobra | rare | 1 | 4/7 | twinShot | 32.07 | +30.6 ± 6.7 | +5.1 | 0.16 | 0.9412 | +0.7 | 1.28 |
| Sandfish | common | 1 | 3/10 | invisible | 24.76 | +27.6 ± 6.2 | +4.6 | 0.19 | 1.1176 | -1.0 | -1.96 |
| Sand Widow | common | 2 | 2/17 | poison | 32.83 | +18.2 ± 6.0 | +3.0 | 0.09 | 0.5294 | -1.2 | -2.36 |
| Glass Golem | rare | 1 | 6/5 | - | 28.4 | +22.6 ± 5.9 | +3.8 | 0.13 | 0.7647 | -1.2 | -2.47 |
| Bison Bulldozer | uncommon | 1 | 2/12 | bulldoze | 26.03 | +22.6 ± 6.1 | +3.8 | 0.14 | 0.8235 | -1.6 | -3.15 |
| Roadrunner Courier | common | 1 | 3/6 | haste | 20.64 | +28.0 ± 6.2 | +4.7 | 0.23 | 1.3529 | -1.7 | -3.14 |
| Fennec Fox | uncommon | 1 | 2/12 | dry | 27.05 | +17.6 ± 6.6 | +2.9 | 0.11 | 0.6471 | -2.3 | -4.12 |
| Skull Vulture | uncommon | 1 | 3/3 | daunt, flying, nocturnal | 26.03 | +17.4 ± 6.5 | +2.9 | 0.11 | 0.6471 | -2.5 | -4.56 |
| Komodo Warlord | common | 3 | 1/27 | gash, poison | 48.07 | -7.6 ± 5.7 | -1.3 | -0.03 | -0.1765 | -2.9 | -5.94 |
| Meerkat Burrower | common | 1 | 2/12 | darksight | 24.76 | +14.0 ± 5.8 | +2.3 | 0.09 | 0.5294 | -3.3 | -6.71 |
| Hollow-belly Rat | uncommon | 1 | 2/10 | devour | 22.48 | +13.8 ± 5.9 | +2.3 | 0.10 | 0.5882 | -3.7 | -7.42 |
