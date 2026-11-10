# Focused decks: Map 7 The Morel Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,amber-cicada,bee-forager,box-turtle,caiman-hatchling,camouflage-frog,compost-grub,corpse-flower-beetle,cottonmouth-matriarch,crocodile-ambusher,cypress-root-lurker,earthworm,fire-ant-raft,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,mudpuppy,newt-doctor,nightshade-moth,nutria-reedcutter,otter-centurion,planarian-splitter,puffball-bombardier,raft-spider,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:poison,family:flying,big,open --anchor adder-ambusher,amber-cicada,camouflage-frog,compost-grub,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2394 games in 496 s.

- The list (31): Adder Ambusher, Alley Cat, Amber Cicada, Bee Forager, Box Turtle, Caiman Hatchling, Camouflage Frog, Compost Grub, Corpse-flower Beetle, Cottonmouth Matriarch, Crocodile Ambusher, Cypress Root Lurker, Earthworm, Fire Ant Raft, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Mudpuppy, Newt Doctor, Nightshade Moth, Nutria Reedcutter, Otter Centurion, Planarian Splitter, Puffball Bombardier, Raft Spider, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 66% (60%-71%) | 0.2 | 0: 16, 1: 4 | 4x Bee Forager, 4x Box Turtle, 4x Fungus Gnat Cloud, 4x Sleepless Shrew, 4x Truffle Piglet | 12 |
| 2 | open | midrange (average 0.4 Lumber) | 63% (57%-68%) | 0.4 | 0: 12, 1: 8 | 4x Bee Forager, 4x Box Turtle, 4x Leafcutter Gardener, 3x Adder Ambusher, 3x Wolf Spider Mother, 2x Camouflage Frog | 0 |
| 3 | family:poison | poison x9 | 51% (45%-57%) | 0.6 | 0: 8, 1: 12 | 4x Alley Cat, 4x Earthworm, 3x Adder Ambusher, 3x Corpse-flower Beetle, 3x Cottonmouth Matriarch, 3x Fire Ant Raft | 17 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); poison x6 | 33% (28%-39%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Alley Cat, 4x Crocodile Ambusher, 4x Rot-Swollen Carcass, 3x Adder Ambusher, 3x Cottonmouth Matriarch, 2x Mudpuppy | 17 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 58% | 46% | 67% | 96% | 46% | 88% | 96% | 29% | 67% |
| 2 open | 71% | 29% | 83% | 88% | 42% | 79% | 96% | 25% | 54% |
| 3 family:poison | 58% | 25% | 88% | 83% | 21% | 63% | 67% | 21% | 33% |
| 4 big | 29% | 13% | 42% | 83% | 8% | 50% | 38% | 8% | 29% |
