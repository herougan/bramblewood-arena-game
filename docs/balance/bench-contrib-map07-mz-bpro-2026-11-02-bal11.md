# Card value per budget point (map07-mz-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map mz --all --games 300` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `a6b2986076eb`.

## How it is measured

- 300 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 28-card pool, and one of 5 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 0, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +4.4 + -0.020 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±5.9 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 29.15 | +64.3 ± 5.4 | +10.7 | 0.37 | 1.6444 | +7.0 | 15.25 |
| Trapdoor Spider | rare | 0 | 4/7 | poison | 20.4 | +44.3 ± 6.0 | +7.4 | 0.36 | 1.6 | +3.5 | 6.84 |
| Bee Forager | starter | 0 | 0/5 | flying, swarm, triggers | 10.17 | +43.0 ± 5.8 | +7.2 | 0.70 | 3.1111 | +3.0 | 6.08 |
| Ant Warrior | uncommon | 0 | 2/3 | rage, swarm | 14.01 | +39.3 ± 6.0 | +6.6 | 0.47 | 2.0889 | +2.5 | 4.92 |
| Wolf Spider Mother | rare | 1 | 2/7 | brood | 21.3 | +37.0 ± 6.2 | +6.2 | 0.29 | 1.2889 | +2.3 | 4.33 |
| Owl Nightwatch | common | 1 | 1/5 | flying, nocturnal, stealth | 19.04 | +37.0 ± 6.4 | +6.2 | 0.32 | 1.4222 | +2.2 | 4.11 |
| Dung Beetle | common | 0 | 1/5 | decay | 12.88 | +36.3 ± 5.6 | +6.1 | 0.47 | 2.0889 | +2.0 | 4.13 |
| Tunnel Ant | rare | 1 | 2/9 | ambush, swarm, swarmN | 19.72 | +35.3 ± 6.6 | +5.9 | 0.30 | 1.3333 | +2.0 | 3.53 |
| Ant Scout | starter | 0 | 1/5 | swarm | 10.17 | +36.3 ± 5.7 | +6.1 | 0.60 | 2.6667 | +1.9 | 3.95 |
| Bombardier Beetle | uncommon | 1 | 3/10 | rocket | 24.41 | +32.3 ± 6.5 | +5.4 | 0.22 | 0.9778 | +1.6 | 2.86 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 12.88 | +33.7 ± 5.6 | +5.6 | 0.44 | 1.9556 | +1.5 | 3.2 |
| Worker Ant | starter | 0 | 1/1 | triggers | 10.17 | +31.7 ± 5.4 | +5.3 | 0.52 | 2.3111 | +1.1 | 2.48 |
| Truffle Piglet | uncommon | 1 | 2/9 | onReadyGold | 20.17 | +28.3 ± 6.4 | +4.7 | 0.23 | 1.0222 | +0.8 | 1.48 |
| Corpse-flower Beetle | rare | 1 | 4/10 | wither | 23.96 | +26.3 ± 6.5 | +4.4 | 0.18 | 0.8 | +0.6 | 1.04 |
| Honey Bee | starter | 0 | 1/4 | flying | 10.37 | +20.7 ± 5.5 | +3.4 | 0.33 | 1.4667 | -0.7 | -1.51 |
| Hawthorn Shieldbug | common | 1 | 2/12 | armor, guardian | 19.04 | +19.0 ± 6.3 | +3.2 | 0.17 | 0.7556 | -0.8 | -1.42 |
| Compost Grub | common | 0 | 1/10 | - | 11.87 | +18.0 ± 5.3 | +3.0 | 0.25 | 1.1111 | -1.1 | -2.49 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 21.07 | +16.0 ± 6.1 | +2.7 | 0.13 | 0.5778 | -1.2 | -2.34 |
| Slow-worm | common | 0 | 1/9 | undead | 14.97 | +16.0 ± 5.6 | +2.7 | 0.18 | 0.8 | -1.4 | -2.83 |
| Bogfire Newt | uncommon | 0 | 1/10 | detonate, poison | 17.68 | +15.3 ± 6.1 | +2.6 | 0.14 | 0.6222 | -1.4 | -2.72 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Fungal Colossus | uncommon | 2 | 2/14 | bloomCopy, onDeathSpawn | 32.15 | -3.3 ± 5.5 | -0.6 | -0.02 | -0.0889 | -4.2 | -8.84 |
| Cane Toad | uncommon | 2 | 2/15 | greaterPoison, poison | 27.35 | -0.3 ± 5.8 | -0.1 | 0.00 | 0 | -3.8 | -7.66 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.17 | +2.3 ± 5.1 | +0.4 | 0.04 | 0.1778 | -3.8 | -8.68 |
| Rootworm Colony | common | 1 | 4/4 | poison | 19.27 | +3.3 ± 6.0 | +0.6 | 0.03 | 0.1333 | -3.4 | -6.63 |
| Earthworm | starter | 0 | 0/7 | - | 10.68 | +5.0 ± 4.0 | +0.8 | 0.08 | 0.3556 | -3.3 | -9.64 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 20.17 | +6.0 ± 6.3 | +1.0 | 0.05 | 0.2222 | -2.9 | -5.42 |
| Sleepless Shrew | common | 0 | 2/7 | wakeful | 16.55 | +11.0 ± 5.5 | +1.8 | 0.11 | 0.4889 | -2.2 | -4.62 |
| Planarian Splitter | uncommon | 1 | 3/8 | meiosis | 20.17 | +11.3 ± 6.2 | +1.9 | 0.09 | 0.4 | -2.0 | -3.82 |
| Bogfire Newt | uncommon | 0 | 1/10 | detonate, poison | 17.68 | +15.3 ± 6.1 | +2.6 | 0.14 | 0.6222 | -1.4 | -2.72 |
| Slow-worm | common | 0 | 1/9 | undead | 14.97 | +16.0 ± 5.6 | +2.7 | 0.18 | 0.8 | -1.4 | -2.83 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 21.07 | +16.0 ± 6.1 | +2.7 | 0.13 | 0.5778 | -1.2 | -2.34 |
| Compost Grub | common | 0 | 1/10 | - | 11.87 | +18.0 ± 5.3 | +3.0 | 0.25 | 1.1111 | -1.1 | -2.49 |
| Hawthorn Shieldbug | common | 1 | 2/12 | armor, guardian | 19.04 | +19.0 ± 6.3 | +3.2 | 0.17 | 0.7556 | -0.8 | -1.42 |
| Honey Bee | starter | 0 | 1/4 | flying | 10.37 | +20.7 ± 5.5 | +3.4 | 0.33 | 1.4667 | -0.7 | -1.51 |
| Corpse-flower Beetle | rare | 1 | 4/10 | wither | 23.96 | +26.3 ± 6.5 | +4.4 | 0.18 | 0.8 | +0.6 | 1.04 |
| Truffle Piglet | uncommon | 1 | 2/9 | onReadyGold | 20.17 | +28.3 ± 6.4 | +4.7 | 0.23 | 1.0222 | +0.8 | 1.48 |
| Worker Ant | starter | 0 | 1/1 | triggers | 10.17 | +31.7 ± 5.4 | +5.3 | 0.52 | 2.3111 | +1.1 | 2.48 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 12.88 | +33.7 ± 5.6 | +5.6 | 0.44 | 1.9556 | +1.5 | 3.2 |
| Bombardier Beetle | uncommon | 1 | 3/10 | rocket | 24.41 | +32.3 ± 6.5 | +5.4 | 0.22 | 0.9778 | +1.6 | 2.86 |
| Ant Scout | starter | 0 | 1/5 | swarm | 10.17 | +36.3 ± 5.7 | +6.1 | 0.60 | 2.6667 | +1.9 | 3.95 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Beetle Battering-Ram | rare | 1 | 4/11 | breach, nocturnal, siege | 29.15 | +64.3 ± 5.4 | +10.7 | 0.37 | 1.6444 | +7.0 | 15.25 |
| Trapdoor Spider | rare | 0 | 4/7 | poison | 20.4 | +44.3 ± 6.0 | +7.4 | 0.36 | 1.6 | +3.5 | 6.84 |
| Bee Forager | starter | 0 | 0/5 | flying, swarm, triggers | 10.17 | +43.0 ± 5.8 | +7.2 | 0.70 | 3.1111 | +3.0 | 6.08 |
| Ant Warrior | uncommon | 0 | 2/3 | rage, swarm | 14.01 | +39.3 ± 6.0 | +6.6 | 0.47 | 2.0889 | +2.5 | 4.92 |
| Wolf Spider Mother | rare | 1 | 2/7 | brood | 21.3 | +37.0 ± 6.2 | +6.2 | 0.29 | 1.2889 | +2.3 | 4.33 |
| Owl Nightwatch | common | 1 | 1/5 | flying, nocturnal, stealth | 19.04 | +37.0 ± 6.4 | +6.2 | 0.32 | 1.4222 | +2.2 | 4.11 |
| Dung Beetle | common | 0 | 1/5 | decay | 12.88 | +36.3 ± 5.6 | +6.1 | 0.47 | 2.0889 | +2.0 | 4.13 |
| Tunnel Ant | rare | 1 | 2/9 | ambush, swarm, swarmN | 19.72 | +35.3 ± 6.6 | +5.9 | 0.30 | 1.3333 | +2.0 | 3.53 |
| Ant Scout | starter | 0 | 1/5 | swarm | 10.17 | +36.3 ± 5.7 | +6.1 | 0.60 | 2.6667 | +1.9 | 3.95 |
| Bombardier Beetle | uncommon | 1 | 3/10 | rocket | 24.41 | +32.3 ± 6.5 | +5.4 | 0.22 | 0.9778 | +1.6 | 2.86 |
| Leafcutter Gardener | common | 0 | 2/5 | triggers | 12.88 | +33.7 ± 5.6 | +5.6 | 0.44 | 1.9556 | +1.5 | 3.2 |
| Worker Ant | starter | 0 | 1/1 | triggers | 10.17 | +31.7 ± 5.4 | +5.3 | 0.52 | 2.3111 | +1.1 | 2.48 |
| Truffle Piglet | uncommon | 1 | 2/9 | onReadyGold | 20.17 | +28.3 ± 6.4 | +4.7 | 0.23 | 1.0222 | +0.8 | 1.48 |
| Corpse-flower Beetle | rare | 1 | 4/10 | wither | 23.96 | +26.3 ± 6.5 | +4.4 | 0.18 | 0.8 | +0.6 | 1.04 |
| Honey Bee | starter | 0 | 1/4 | flying | 10.37 | +20.7 ± 5.5 | +3.4 | 0.33 | 1.4667 | -0.7 | -1.51 |
| Hawthorn Shieldbug | common | 1 | 2/12 | armor, guardian | 19.04 | +19.0 ± 6.3 | +3.2 | 0.17 | 0.7556 | -0.8 | -1.42 |
| Compost Grub | common | 0 | 1/10 | - | 11.87 | +18.0 ± 5.3 | +3.0 | 0.25 | 1.1111 | -1.1 | -2.49 |
| Adder Ambusher | rare | 1 | 2/11 | poison | 21.07 | +16.0 ± 6.1 | +2.7 | 0.13 | 0.5778 | -1.2 | -2.34 |
| Slow-worm | common | 0 | 1/9 | undead | 14.97 | +16.0 ± 5.6 | +2.7 | 0.18 | 0.8 | -1.4 | -2.83 |
| Bogfire Newt | uncommon | 0 | 1/10 | detonate, poison | 17.68 | +15.3 ± 6.1 | +2.6 | 0.14 | 0.6222 | -1.4 | -2.72 |
| Planarian Splitter | uncommon | 1 | 3/8 | meiosis | 20.17 | +11.3 ± 6.2 | +1.9 | 0.09 | 0.4 | -2.0 | -3.82 |
| Sleepless Shrew | common | 0 | 2/7 | wakeful | 16.55 | +11.0 ± 5.5 | +1.8 | 0.11 | 0.4889 | -2.2 | -4.62 |
| Gangrenous Leech | uncommon | 1 | 3/3 | fester, parasite, poison | 20.17 | +6.0 ± 6.3 | +1.0 | 0.05 | 0.2222 | -2.9 | -5.42 |
| Earthworm | starter | 0 | 0/7 | - | 10.68 | +5.0 ± 4.0 | +0.8 | 0.08 | 0.3556 | -3.3 | -9.64 |
| Rootworm Colony | common | 1 | 4/4 | poison | 19.27 | +3.3 ± 6.0 | +0.6 | 0.03 | 0.1333 | -3.4 | -6.63 |
| Garden Snail | starter | 0 | 0/7 | armor, slow | 10.17 | +2.3 ± 5.1 | +0.4 | 0.04 | 0.1778 | -3.8 | -8.68 |
| Cane Toad | uncommon | 2 | 2/15 | greaterPoison, poison | 27.35 | -0.3 ± 5.8 | -0.1 | 0.00 | 0 | -3.8 | -7.66 |
| Fungal Colossus | uncommon | 2 | 2/14 | bloomCopy, onDeathSpawn | 32.15 | -3.3 ± 5.5 | -0.6 | -0.02 | -0.0889 | -4.2 | -8.84 |
