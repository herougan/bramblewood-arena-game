# Focused decks: Map 7 The Morel Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,amber-cicada,camouflage-frog,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,dung-beetle,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7272 games in 90 s.

- The list (20): Adder Ambusher, Amber Cicada, Camouflage Frog, Corpse-flower Beetle, Crocodile Ambusher, Cypress Root Lurker, Dung Beetle, Earthworm, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Nightshade Moth, Planarian Splitter, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | guard x8 | 82% (78%-87%) | 0.4 | 0: 12, 1: 8 | 4x Cypress Root Lurker, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 4x Sleepless Shrew | 10 |
| 2 | family:flying | flying x8; swarm x7 | 79% (74%-84%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Fungus Gnat Cloud, 4x Nightshade Moth, 4x Truffle Piglet, 3x Dung Beetle, 3x Wolf Spider Mother, 2x Leafcutter Gardener | 11 |
| 3 | open | flying x7 | 70% (65%-76%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Fungus Gnat Cloud, 4x Planarian Splitter, 3x Corpse-flower Beetle, 3x Leafcutter Gardener, 3x Nightshade Moth, 3x Sleepless Shrew | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); flying x8 | 41% (35%-47%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Crocodile Ambusher, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Nightshade Moth, 3x Leopard Slug, 1x Sleepless Shrew | 12 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 92% | 92% | 75% | 83% | 79% | 96% | 100% | 38% | 88% |
| 2 family:flying | 88% | 83% | 75% | 88% | 75% | 88% | 100% | 54% | 58% |
| 3 open | 71% | 88% | 67% | 67% | 67% | 88% | 100% | 42% | 46% |
| 4 big | 75% | 54% | 42% | 29% | 33% | 50% | 46% | 8% | 33% |
