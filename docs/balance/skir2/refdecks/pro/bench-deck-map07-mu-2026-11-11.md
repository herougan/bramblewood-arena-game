# Focused decks: Map 7 The Morel Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,amber-cicada,bee-forager,box-turtle,caiman-hatchling,camouflage-frog,compost-grub,corpse-flower-beetle,cottonmouth-matriarch,crocodile-ambusher,cypress-root-lurker,earthworm,fire-ant-raft,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,mudpuppy,newt-doctor,nightshade-moth,nutria-reedcutter,otter-centurion,planarian-splitter,puffball-bombardier,raft-spider,rot-swollen-carcass,sleepless-shrew,truffle-piglet,tunnel-ant,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:poison,family:evasion,big,open --anchor adder-ambusher,amber-cicada,camouflage-frog,compost-grub,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9180 games in 126 s.

- The list (32): Adder Ambusher, Alley Cat, Amber Cicada, Bee Forager, Box Turtle, Caiman Hatchling, Camouflage Frog, Compost Grub, Corpse-flower Beetle, Cottonmouth Matriarch, Crocodile Ambusher, Cypress Root Lurker, Earthworm, Fire Ant Raft, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Mudpuppy, Newt Doctor, Nightshade Moth, Nutria Reedcutter, Otter Centurion, Planarian Splitter, Puffball Bombardier, Raft Spider, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Tunnel Ant, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (17 copies at 0 Lumber) | 69% (63%-75%) | 0.15 | 0: 17, 1: 3 | 4x Fungus Gnat Cloud, 4x Puffball Bombardier, 3x Alley Cat, 3x Box Turtle, 3x Caiman Hatchling, 3x Corpse-flower Beetle | 0 |
| 2 | family:evasion | swarm (14 copies at 0 Lumber); evasion x10; swarm x7 | 64% (58%-70%) | 0.3 | 0: 14, 1: 6 | 4x Caiman Hatchling, 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 3x Camouflage Frog, 3x Tunnel Ant, 2x Nutria Reedcutter | 13 |
| 3 | family:poison | poison x9; swarm x6 | 60% (54%-66%) | 0.4 | 0: 12, 1: 8 | 4x Leafcutter Gardener, 4x Newt Doctor, 4x Puffball Bombardier, 3x Fire Ant Raft, 3x Tunnel Ant, 2x Adder Ambusher | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 39% (33%-45%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Alley Cat, 4x Leafcutter Gardener, 4x Nightshade Moth, 4x Rot-Swollen Carcass, 3x Cottonmouth Matriarch, 1x Corpse-flower Beetle | 16 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 71% | 79% | 63% | 58% | 71% | 100% | 33% | 63% |
| 2 family:evasion | 67% | 75% | 54% | 63% | 54% | 71% | 100% | 25% | 67% |
| 3 family:poison | 79% | 71% | 58% | 54% | 50% | 58% | 100% | 29% | 42% |
| 4 big | 46% | 63% | 46% | 33% | 21% | 38% | 63% | 29% | 13% |
