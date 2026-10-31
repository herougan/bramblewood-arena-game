# Focused decks: Map 1 Clovermead (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,compost-grub,cottontail,cricket-drummer,field-mouse,field-vole,hedgerow-shrew,meadow-rabbit,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6896 games in 74 s.

- The list (15): Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Compost Grub, Cottontail, Cricket Drummer, Field Mouse, Field Vole, Hedgerow Shrew, Meadow Rabbit, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (18 copies at 0 Lumber) | 53% (47%-59%) | 0.2 | 0: 18, 2: 2 | 4x Ant Scout, 4x Bramble Sprout, 4x Cricket Drummer, 4x Field Mouse, 2x Ant Hill, 2x Meadow Rabbit | 6 |
| 2 | open | swarm (16 copies at 0 Lumber); swarm x8 | 53% (46%-59%) | 0.4 | 0: 16, 2: 4 | 4x Ant Hill, 4x Ant Scout, 4x Bee Forager, 4x Bramble Sprout, 4x Cricket Drummer | 0 |
| 3 | family:flying | swarm (20 copies at 0 Lumber); flying x8 | 41% (35%-47%) | 0 | 0: 20 | 4x Bee Forager, 4x Cottontail, 4x Cricket Drummer, 4x Robin Redbreast, 3x Bramble Sprout, 1x Slow-worm | 9 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers); swarm x6 | 35% (28%-41%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Badger Lumberjack, 4x Bee Forager, 4x Compost Grub, 2x Ant Scout, 2x Cricket Drummer | 8 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 33% | 42% | 38% | 42% | 63% | 92% | 29% | 88% |
| 2 open | 54% | 50% | 29% | 29% | 50% | 71% | 46% | 92% |
| 3 family:flying | 33% | 33% | 17% | 17% | 46% | 83% | 17% | 79% |
| 4 big | 33% | 29% | 25% | 17% | 38% | 50% | 25% | 63% |
