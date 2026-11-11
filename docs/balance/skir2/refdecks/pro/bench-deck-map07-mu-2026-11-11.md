# Focused decks: Map 7 The Morel Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,amber-cicada,bee-forager,box-turtle,caiman-hatchling,camouflage-frog,compost-grub,corpse-flower-beetle,cottonmouth-matriarch,crocodile-ambusher,cypress-root-lurker,dung-beetle,earthworm,fire-ant-raft,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,mudpuppy,newt-doctor,nightshade-moth,nutria-reedcutter,otter-centurion,planarian-splitter,puffball-bombardier,raft-spider,rot-swollen-carcass,sleepless-shrew,truffle-piglet,tunnel-ant,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:poison,family:evasion,big,open --anchor adder-ambusher,amber-cicada,camouflage-frog,compost-grub,corpse-flower-beetle,crocodile-ambusher,cypress-root-lurker,dung-beetle,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leafcutter-gardener,leopard-slug,nightshade-moth,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9072 games in 119 s.

- The list (33): Adder Ambusher, Alley Cat, Amber Cicada, Bee Forager, Box Turtle, Caiman Hatchling, Camouflage Frog, Compost Grub, Corpse-flower Beetle, Cottonmouth Matriarch, Crocodile Ambusher, Cypress Root Lurker, Dung Beetle, Earthworm, Fire Ant Raft, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leafcutter Gardener, Leopard Slug, Mudpuppy, Newt Doctor, Nightshade Moth, Nutria Reedcutter, Otter Centurion, Planarian Splitter, Puffball Bombardier, Raft Spider, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Tunnel Ant, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | swarm x9; poison x8 | 71% (65%-76%) | 0.45 | 0: 11, 1: 9 | 4x Fire Ant Raft, 4x Leafcutter Gardener, 4x Puffball Bombardier, 3x Box Turtle, 3x Tunnel Ant, 2x Wolf Spider Mother | 20 |
| 2 | open | swarm (15 copies at 0 Lumber) | 66% (60%-71%) | 0.25 | 0: 15, 1: 5 | 4x Caiman Hatchling, 4x Dung Beetle, 4x Fungus Gnat Cloud, 3x Adder Ambusher, 3x Mudpuppy, 2x Amber Cicada | 0 |
| 3 | family:evasion | swarm (14 copies at 0 Lumber); evasion x10; swarm x7 | 65% (59%-71%) | 0.3 | 0: 14, 1: 6 | 4x Caiman Hatchling, 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 3x Camouflage Frog, 3x Tunnel Ant, 2x Box Turtle | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); heal x7 | 29% (24%-34%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Cypress Root Lurker, 4x Newt Doctor, 4x Nightshade Moth, 4x Rot-Swollen Carcass, 3x Leopard Slug, 1x Sleepless Shrew | 20 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 88% | 83% | 63% | 79% | 63% | 67% | 96% | 29% | 71% |
| 2 open | 88% | 67% | 88% | 33% | 50% | 83% | 92% | 17% | 75% |
| 3 family:evasion | 71% | 79% | 58% | 67% | 46% | 75% | 96% | 38% | 58% |
| 4 big | 54% | 25% | 17% | 21% | 21% | 4% | 83% | 8% | 29% |
