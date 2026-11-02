# Focused decks: Map 1 Clovermead (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,compost-grub,cottontail,cricket-drummer,field-mouse,field-vole,hedgerow-shrew,lucky-hopper,meadow-rabbit,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 77 s.

- The list (16): Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Compost Grub, Cottontail, Cricket Drummer, Field Mouse, Field Vole, Hedgerow Shrew, Lucky Hopper, Meadow Rabbit, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber); swarm x8 | 67% (61%-73%) | 0.3 | 0: 17, 2: 3 | 4x Ant Scout, 4x Bee Forager, 4x Cricket Drummer, 3x Ant Hill, 3x Slow-worm, 2x Field Mouse | 11 |
| 2 | open | swarm (17 copies at 0 Lumber) | 63% (56%-69%) | 0.15 | 0: 17, 1: 3 | 4x Bee Forager, 4x Bramble Sprout, 4x Cricket Drummer, 4x Meadow Rabbit, 3x Badger Lumberjack, 1x Ant Scout | 0 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 48% (42%-55%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Badger Lumberjack, 4x Field Mouse, 4x Field Vole, 4x Slow-worm | 17 |
| 4 | family:flying | swarm (17 copies at 0 Lumber); swarm x8; flying x8 | 38% (31%-44%) | 0.3 | 0: 17, 2: 3 | 4x Ant Scout, 4x Bee Forager, 4x Robin Redbreast, 4x Slow-worm, 3x Ant Hill, 1x Hedgerow Shrew | 15 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 63% | 67% | 54% | 54% | 67% | 96% | 50% | 88% |
| 2 open | 58% | 75% | 63% | 46% | 54% | 92% | 29% | 83% |
| 3 big | 38% | 58% | 58% | 38% | 42% | 71% | 4% | 79% |
| 4 family:flying | 38% | 46% | 29% | 13% | 33% | 54% | 25% | 63% |
