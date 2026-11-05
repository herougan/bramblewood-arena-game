# Focused decks: Map 7 The Morel Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,bee-forager,box-turtle,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fire-ant-raft,forager-ant,fungal-colossus,gannet-nestweaver,hawthorn-shieldbug,leafcutter-gardener,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,sleepless-shrew,slow-worm,truffle-piglet,tunnel-ant,wolf-spider-mother,woodcock-lookout,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:poison,big,open --anchor adder-ambusher,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6966 games in 132 s.

- The list (28): Adder Ambusher, Alley Cat, Bee Forager, Box Turtle, Cane Toad, Compost Grub, Corpse-flower Beetle, Dung Beetle, Earthworm, Fire Ant Raft, Forager Ant, Fungal Colossus, Gannet Nestweaver, Hawthorn Shieldbug, Leafcutter Gardener, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Sleepless Shrew, Slow-worm, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Woodcock Lookout, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8; swarm x7 | 81% (76%-86%) | 0.35 | 0: 13, 1: 7 | 4x Bee Forager, 4x Earthworm, 4x Owl Nightwatch, 3x Tunnel Ant, 3x Woodcock Lookout, 2x Dung Beetle | 13 |
| 2 | open | big (9 copies at 1+ Lumber, average 0.5); evasion x7 | 78% (73%-83%) | 0.45 | 0: 11, 1: 9 | 4x Leafcutter Gardener, 4x Newt Doctor, 4x Owl Nightwatch, 3x Otter Centurion, 3x Tunnel Ant, 2x Adder Ambusher | 0 |
| 3 | big | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x6 | 75% (70%-80%) | 0.6 | 0: 8, 1: 12 | 4x Box Turtle, 4x Gannet Nestweaver, 4x Hawthorn Shieldbug, 3x Adder Ambusher, 3x Wolf Spider Mother, 2x Owl Nightwatch | 16 |
| 4 | family:poison | big (10 copies at 1+ Lumber, average 0.7); poison x8; swarm x8 | 71% (65%-76%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Bee Forager, 4x Cane Toad, 4x Fire Ant Raft, 4x Leafcutter Gardener, 2x Box Turtle, 2x Hawthorn Shieldbug | 16 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 88% | 92% | 96% | 88% | 75% | 92% | 75% | 63% | 63% |
| 2 open | 96% | 96% | 92% | 71% | 58% | 92% | 92% | 63% | 42% |
| 3 big | 100% | 83% | 96% | 83% | 79% | 75% | 88% | 29% | 42% |
| 4 family:poison | 88% | 75% | 92% | 75% | 63% | 83% | 92% | 33% | 38% |
