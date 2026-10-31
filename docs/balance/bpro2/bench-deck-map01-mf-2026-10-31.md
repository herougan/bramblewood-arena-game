# Focused decks: Map 1 Thistlewood (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6944 games in 67 s.

- The list (19): Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Chipmunk Cavalry, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Field Mouse, Field Vole, Hedgerow Shrew, Meadow Rabbit, Owl Sentinel, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (19 copies at 0 Lumber) | 73% (67%-79%) | 0.05 | 0: 19, 1: 1 | 4x Cottontail, 4x Dormouse, 4x Field Vole, 4x Hedgerow Shrew, 3x Chipmunk Skirmisher, 1x Owl Sentinel | 8 |
| 2 | open | swarm (20 copies at 0 Lumber) | 70% (64%-76%) | 0 | 0: 20 | 4x Bramble Sprout, 4x Cottontail, 4x Field Mouse, 4x Field Vole, 4x Hedgerow Shrew | 0 |
| 3 | family:flying | swarm (16 copies at 0 Lumber); swarm x8; flying x8 | 50% (43%-57%) | 0.2 | 0: 16, 1: 4 | 4x Ant Scout, 4x Bee Forager, 4x Chipmunk Cavalry, 4x Cottontail, 4x Robin Redbreast | 16 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6) | 44% (38%-51%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Chipmunk Cavalry, 4x Dormouse, 4x Field Mouse, 2x Ant Scout, 2x Woodcock Lookout | 16 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 71% | 88% | 63% | 58% | 79% | 92% | 38% | 96% |
| 2 open | 75% | 75% | 63% | 54% | 71% | 96% | 29% | 96% |
| 3 family:flying | 42% | 38% | 38% | 42% | 67% | 67% | 46% | 63% |
| 4 big | 38% | 33% | 38% | 17% | 63% | 71% | 21% | 75% |
