# Focused decks: Map 7 The Morel Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,amber-cicada,camouflage-frog,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:flying,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3024 games in 700 s.

- The list (18): Adder Ambusher, Amber Cicada, Camouflage Frog, Corpse-flower Beetle, Crocodile Ambusher, Cypress Root Lurker, Earthworm, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Nightshade Moth, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | guard x8 | 71% (66%-76%) | 0.6 | 0: 8, 1: 12 | 4x Cypress Root Lurker, 4x Earthworm, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Truffle Piglet | 11 |
| 2 | open | swarm x7 | 67% (61%-72%) | 0.4 | 0: 12, 1: 8 | 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Puffball Bombardier, 4x Sleepless Shrew, 3x Wolf Spider Mother, 1x Cypress Root Lurker | 0 |
| 3 | family:flying | flying x8 | 59% (53%-65%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 4x Nightshade Moth, 3x Adder Ambusher, 3x Corpse-flower Beetle, 2x Leopard Slug | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 25% (19%-30%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Crocodile Ambusher, 4x Lamprey, 4x Leafcutter Gardener, 4x Nightshade Moth, 3x Wolf Spider Mother, 1x Corpse-flower Beetle | 17 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 83% | 83% | 96% | 67% | 71% | 42% | 100% | 13% | 83% |
| 2 open | 75% | 88% | 71% | 58% | 71% | 58% | 100% | 13% | 67% |
| 3 family:flying | 54% | 63% | 54% | 54% | 71% | 67% | 92% | 21% | 58% |
| 4 big | 42% | 42% | 21% | 13% | 17% | 17% | 42% | 8% | 21% |
