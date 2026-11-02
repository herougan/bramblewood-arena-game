# Card value per budget point (map08-m4-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map m4 --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `faa5cc9f27d4`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 16-card pool, and one of 8 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 0, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +6.5 + -0.110 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.6 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Vampire Bat | uncommon | 0 | 2/3 | flying, nocturnal, sap | 17.68 | +49.6 ± 6.4 | +8.3 | 0.47 | 2.5405 | +3.6 | 6.64 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 25.76 | +40.8 ± 6.7 | +6.8 | 0.26 | 1.4054 | +3.0 | 5.28 |
| Grotto Lobster | rare | 1 | 3/14 | brood, crabClaws | 25.54 | +40.4 ± 7.2 | +6.7 | 0.26 | 1.4054 | +2.9 | 4.74 |
| Echo Screecher | rare | 1 | 2/5 | flying, nocturnal, onReadyDamage | 21.53 | +41.2 ± 6.8 | +6.9 | 0.32 | 1.7297 | +2.6 | 4.54 |
| Star-nosed Mole | common | 0 | 5/5 | purblind | 13.11 | +43.6 ± 6.7 | +7.3 | 0.55 | 2.973 | +2.1 | 3.73 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 31.02 | +23.2 ± 6.9 | +3.9 | 0.12 | 0.6486 | +0.6 | 1.06 |
| Cave Olm | common | 0 | 1/11 | regen | 16.55 | +32.0 ± 6.5 | +5.3 | 0.32 | 1.7297 | +0.6 | 1.02 |
| Pelican Diver | uncommon | 1 | 2/8 | flying, triggers | 20.17 | +22.8 ± 6.1 | +3.8 | 0.19 | 1.027 | -0.6 | -1.14 |
| Gallery Orb-Weaver | uncommon | 1 | 4/7 | poison, web | 20.17 | +22.0 ± 6.9 | +3.7 | 0.18 | 0.973 | -0.7 | -1.23 |
| Whip Spider | uncommon | 1 | 3/7 | bleed, sonar | 21.75 | +20.8 ± 6.6 | +3.5 | 0.16 | 0.8649 | -0.8 | -1.33 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 15.37 | +21.2 ± 6.6 | +3.5 | 0.23 | 1.2432 | -1.4 | -2.45 |
| Octopus Tactician | uncommon | 2 | 5/7 | sweep, tide | 27.35 | +13.0 ± 6.6 | +2.2 | 0.08 | 0.4324 | -1.5 | -2.59 |
| Quarry Mole | common | 1 | 2/12 | bedrock, keenSense | 19.27 | +15.0 ± 6.1 | +2.5 | 0.13 | 0.7027 | -2.0 | -3.81 |
| Hollow-belly Rat | uncommon | 1 | 2/10 | devour | 18.59 | +13.6 ± 6.4 | +2.3 | 0.12 | 0.6486 | -2.3 | -4.24 |
| Malachite Golem | rare | 2 | 2/21 | shell | 33.28 | -0.4 ± 6.9 | -0.1 | 0.00 | 0 | -3.1 | -5.25 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +11.6 ± 4.7 | +1.9 | 0.15 | 0.8108 | -3.2 | -8.11 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +11.6 ± 4.7 | +1.9 | 0.15 | 0.8108 | -3.2 | -8.11 |
| Malachite Golem | rare | 2 | 2/21 | shell | 33.28 | -0.4 ± 6.9 | -0.1 | 0.00 | 0 | -3.1 | -5.25 |
| Hollow-belly Rat | uncommon | 1 | 2/10 | devour | 18.59 | +13.6 ± 6.4 | +2.3 | 0.12 | 0.6486 | -2.3 | -4.24 |
| Quarry Mole | common | 1 | 2/12 | bedrock, keenSense | 19.27 | +15.0 ± 6.1 | +2.5 | 0.13 | 0.7027 | -2.0 | -3.81 |
| Octopus Tactician | uncommon | 2 | 5/7 | sweep, tide | 27.35 | +13.0 ± 6.6 | +2.2 | 0.08 | 0.4324 | -1.5 | -2.59 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 15.37 | +21.2 ± 6.6 | +3.5 | 0.23 | 1.2432 | -1.4 | -2.45 |
| Whip Spider | uncommon | 1 | 3/7 | bleed, sonar | 21.75 | +20.8 ± 6.6 | +3.5 | 0.16 | 0.8649 | -0.8 | -1.33 |
| Gallery Orb-Weaver | uncommon | 1 | 4/7 | poison, web | 20.17 | +22.0 ± 6.9 | +3.7 | 0.18 | 0.973 | -0.7 | -1.23 |
| Pelican Diver | uncommon | 1 | 2/8 | flying, triggers | 20.17 | +22.8 ± 6.1 | +3.8 | 0.19 | 1.027 | -0.6 | -1.14 |
| Cave Olm | common | 0 | 1/11 | regen | 16.55 | +32.0 ± 6.5 | +5.3 | 0.32 | 1.7297 | +0.6 | 1.02 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 31.02 | +23.2 ± 6.9 | +3.9 | 0.12 | 0.6486 | +0.6 | 1.06 |
| Star-nosed Mole | common | 0 | 5/5 | purblind | 13.11 | +43.6 ± 6.7 | +7.3 | 0.55 | 2.973 | +2.1 | 3.73 |
| Echo Screecher | rare | 1 | 2/5 | flying, nocturnal, onReadyDamage | 21.53 | +41.2 ± 6.8 | +6.9 | 0.32 | 1.7297 | +2.6 | 4.54 |
| Grotto Lobster | rare | 1 | 3/14 | brood, crabClaws | 25.54 | +40.4 ± 7.2 | +6.7 | 0.26 | 1.4054 | +2.9 | 4.74 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 25.76 | +40.8 ± 6.7 | +6.8 | 0.26 | 1.4054 | +3.0 | 5.28 |
| Vampire Bat | uncommon | 0 | 2/3 | flying, nocturnal, sap | 17.68 | +49.6 ± 6.4 | +8.3 | 0.47 | 2.5405 | +3.6 | 6.64 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Vampire Bat | uncommon | 0 | 2/3 | flying, nocturnal, sap | 17.68 | +49.6 ± 6.4 | +8.3 | 0.47 | 2.5405 | +3.6 | 6.64 |
| Giant Cave Huntsman | rare | 1 | 3/15 | pounce | 25.76 | +40.8 ± 6.7 | +6.8 | 0.26 | 1.4054 | +3.0 | 5.28 |
| Grotto Lobster | rare | 1 | 3/14 | brood, crabClaws | 25.54 | +40.4 ± 7.2 | +6.7 | 0.26 | 1.4054 | +2.9 | 4.74 |
| Echo Screecher | rare | 1 | 2/5 | flying, nocturnal, onReadyDamage | 21.53 | +41.2 ± 6.8 | +6.9 | 0.32 | 1.7297 | +2.6 | 4.54 |
| Star-nosed Mole | common | 0 | 5/5 | purblind | 13.11 | +43.6 ± 6.7 | +7.3 | 0.55 | 2.973 | +2.1 | 3.73 |
| Stalactite Golem | common | 2 | 1/21 | guardian, shell | 31.02 | +23.2 ± 6.9 | +3.9 | 0.12 | 0.6486 | +0.6 | 1.06 |
| Cave Olm | common | 0 | 1/11 | regen | 16.55 | +32.0 ± 6.5 | +5.3 | 0.32 | 1.7297 | +0.6 | 1.02 |
| Pelican Diver | uncommon | 1 | 2/8 | flying, triggers | 20.17 | +22.8 ± 6.1 | +3.8 | 0.19 | 1.027 | -0.6 | -1.14 |
| Gallery Orb-Weaver | uncommon | 1 | 4/7 | poison, web | 20.17 | +22.0 ± 6.9 | +3.7 | 0.18 | 0.973 | -0.7 | -1.23 |
| Whip Spider | uncommon | 1 | 3/7 | bleed, sonar | 21.75 | +20.8 ± 6.6 | +3.5 | 0.16 | 0.8649 | -0.8 | -1.33 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 15.37 | +21.2 ± 6.6 | +3.5 | 0.23 | 1.2432 | -1.4 | -2.45 |
| Octopus Tactician | uncommon | 2 | 5/7 | sweep, tide | 27.35 | +13.0 ± 6.6 | +2.2 | 0.08 | 0.4324 | -1.5 | -2.59 |
| Quarry Mole | common | 1 | 2/12 | bedrock, keenSense | 19.27 | +15.0 ± 6.1 | +2.5 | 0.13 | 0.7027 | -2.0 | -3.81 |
| Hollow-belly Rat | uncommon | 1 | 2/10 | devour | 18.59 | +13.6 ± 6.4 | +2.3 | 0.12 | 0.6486 | -2.3 | -4.24 |
| Malachite Golem | rare | 2 | 2/21 | shell | 33.28 | -0.4 ± 6.9 | -0.1 | 0.00 | 0 | -3.1 | -5.25 |
| Blind Cave Fish | common | 0 | 1/1 | darksight, evasive, tide | 12.88 | +11.6 ± 4.7 | +1.9 | 0.15 | 0.8108 | -3.2 | -8.11 |
