# Focused decks: Map 1 Thistlewood (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,hollow-belly-rat,honey-bee,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7296 games in 76 s.

- The list (20): Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Chipmunk Cavalry, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Field Mouse, Field Vole, Hedgerow Shrew, Hollow-belly Rat, Honey Bee, Meadow Rabbit, Owl Sentinel, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); strike-first x7 | 83% (79%-88%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Chipmunk Skirmisher, 4x Cricket Drummer, 4x Field Mouse, 3x Hedgerow Shrew, 1x Meadow Rabbit | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber); swarm x8; flying x8 | 82% (77%-88%) | 0.2 | 0: 16, 1: 4 | 4x Ant Scout, 4x Bee Forager, 4x Chipmunk Cavalry, 4x Cricket Drummer, 4x Honey Bee | 12 |
| 3 | big | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers); strike-first x7 | 67% (61%-73%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Chipmunk Cavalry, 4x Field Vole, 3x Field Mouse, 3x Hedgerow Shrew, 2x Cottontail | 10 |
| 4 | family:flying | swarm (16 copies at 0 Lumber); flying x8; swarm x6 | 63% (57%-69%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Dormouse, 4x Field Vole, 4x Honey Bee, 2x Bee Forager, 2x Robin Redbreast | 16 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 96% | 92% | 79% | 92% | 96% | 42% | 88% |
| 2 swarm | 96% | 71% | 71% | 88% | 88% | 83% | 71% | 92% |
| 3 big | 75% | 75% | 50% | 46% | 75% | 96% | 29% | 88% |
| 4 family:flying | 46% | 63% | 50% | 50% | 71% | 88% | 50% | 88% |
