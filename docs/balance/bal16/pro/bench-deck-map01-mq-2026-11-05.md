# Focused decks: Map 1 Clovermead (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alley-cat,alpine-marmot,ant-hill,ant-scout,badger-lumberjack,bee-forager,bee-knight,bramble-sprout,compost-grub,cottontail,cricket-drummer,dung-beetle,field-mouse,field-vole,fire-ant-raft,hawthorn-shieldbug,hedgerow-shrew,leafcutter-gardener,lucky-hopper,meadow-rabbit,mountain-hare,newt-doctor,nutria-reedcutter,planarian-splitter,robin-redbreast,slow-worm,water-vole,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:guard,big,open --anchor ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,compost-grub,cottontail,cricket-drummer,field-mouse,field-vole,hedgerow-shrew,lucky-hopper,meadow-rabbit,robin-redbreast,slow-worm,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6928 games in 112 s.

- The list (28): Alley Cat, Alpine Marmot, Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bee Warden, Bramble Sprout, Compost Grub, Cottontail, Cricket Drummer, Dung Beetle, Field Mouse, Field Vole, Fire Ant Raft, Hawthorn Shieldbug, Hedgerow Shrew, Leafcutter Gardener, Lucky Hopper, Meadow Rabbit, Mountain Hare, Newt Doctor, Nutria Reedcutter, Planarian Splitter, Robin Redbreast, Slow-worm, Water Vole, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | swarm (16 copies at 0 Lumber); guard x8 | 90% (87%-94%) | 0.2 | 0: 16, 1: 4 | 4x Alpine Marmot, 4x Hawthorn Shieldbug, 4x Meadow Rabbit, 3x Bramble Sprout, 3x Cottontail, 2x Newt Doctor | 11 |
| 2 | family:flying | flying x8; swarm x7 | 82% (77%-87%) | 0.35 | 0: 13, 1: 7 | 4x Bee Forager, 4x Hawthorn Shieldbug, 4x Robin Redbreast, 3x Fire Ant Raft, 3x Nutria Reedcutter, 2x Cricket Drummer | 13 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); guard x8 | 77% (71%-82%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Hawthorn Shieldbug, 4x Robin Redbreast, 3x Bramble Sprout, 3x Newt Doctor, 2x Nutria Reedcutter | 14 |
| 4 | open | swarm (14 copies at 0 Lumber); guard x6 | 77% (71%-82%) | 0.4 | 0: 14, 1: 4, 2: 2 | 4x Ant Scout, 4x Cottontail, 4x Hawthorn Shieldbug, 4x Nutria Reedcutter, 2x Alpine Marmot, 2x Ant Hill | 0 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 100% | 92% | 100% | 100% | 96% | 100% | 46% | 88% |
| 2 family:flying | 88% | 100% | 88% | 92% | 79% | 100% | 46% | 63% |
| 3 big | 92% | 83% | 83% | 92% | 75% | 96% | 25% | 67% |
| 4 open | 96% | 92% | 88% | 83% | 79% | 88% | 33% | 54% |
