# Focused decks: Map 7 The Morel Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,amber-cicada,camouflage-frog,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6876 games in 114 s.

- The list (19): Adder Ambusher, Amber Cicada, Camouflage Frog, Corpse-flower Beetle, Crocodile Ambusher, Cypress Root Lurker, Earthworm, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Nightshade Moth, Planarian Splitter, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8; guard x7 | 70% (64%-75%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Cypress Root Lurker, 4x Fungus Gnat Cloud, 4x Nightshade Moth, 3x Hawthorn Shieldbug, 3x Leafcutter Gardener, 2x Wolf Spider Mother | 15 |
| 2 | open | midrange (average 0.8 Lumber) | 67% (61%-73%) | 0.8 | 0: 4, 1: 16 | 4x Leafcutter Gardener, 4x Planarian Splitter, 4x Truffle Piglet, 3x Adder Ambusher, 3x Wolf Spider Mother, 2x Lamprey | 0 |
| 3 | family:guard | guard x8 | 59% (54%-65%) | 0.6 | 0: 8, 1: 12 | 4x Cypress Root Lurker, 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 4x Leopard Slug, 3x Truffle Piglet, 1x Lamprey | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); swarm x8; flying x8 | 42% (35%-48%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Fungus Gnat Cloud, 4x Nightshade Moth, 4x Rot-Swollen Carcass, 3x Leopard Slug, 3x Truffle Piglet, 2x Corpse-flower Beetle | 17 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 83% | 75% | 58% | 71% | 83% | 54% | 100% | 29% | 75% |
| 2 open | 92% | 79% | 63% | 67% | 67% | 54% | 96% | 25% | 63% |
| 3 family:guard | 88% | 75% | 63% | 42% | 25% | 63% | 100% | 8% | 71% |
| 4 big | 54% | 38% | 54% | 50% | 33% | 42% | 58% | 13% | 33% |
