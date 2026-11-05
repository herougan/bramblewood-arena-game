# Focused decks: Map 1 Clovermead (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,cottontail,cricket-drummer,field-mouse,field-vole,hedgerow-shrew,lucky-hopper,meadow-rabbit,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6688 games in 85 s.

- The list (15): Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Cottontail, Cricket Drummer, Field Mouse, Field Vole, Hedgerow Shrew, Lucky Hopper, Meadow Rabbit, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (20 copies at 0 Lumber) | 85% (81%-90%) | 0 | 0: 20 | 4x Cricket Drummer, 4x Meadow Rabbit, 4x Slow-worm, 3x Bramble Sprout, 3x Field Mouse, 2x Cottontail | 10 |
| 2 | open | swarm (20 copies at 0 Lumber) | 85% (81%-90%) | 0 | 0: 20 | 4x Bramble Sprout, 4x Cricket Drummer, 4x Field Mouse, 4x Woodcock Lookout, 3x Hedgerow Shrew, 1x Ant Scout | 0 |
| 3 | family:flying | swarm (17 copies at 0 Lumber); flying x8; swarm x7 | 80% (75%-86%) | 0.3 | 0: 17, 2: 3 | 4x Bee Forager, 4x Cricket Drummer, 4x Robin Redbreast, 3x Ant Hill, 3x Ant Scout, 2x Bramble Sprout | 13 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6) | 74% (68%-80%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Cricket Drummer, 4x Field Mouse, 4x Field Vole, 4x Lucky Hopper | 12 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 96% | 83% | 92% | 88% | 96% | 58% | 75% |
| 2 open | 96% | 100% | 96% | 79% | 88% | 100% | 54% | 71% |
| 3 family:flying | 92% | 83% | 79% | 63% | 83% | 96% | 83% | 63% |
| 4 big | 92% | 79% | 75% | 63% | 79% | 88% | 54% | 63% |
