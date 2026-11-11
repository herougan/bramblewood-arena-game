# Focused decks: Map 1 Clovermead (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-hill,ant-scout,bee-drone,bee-sentry,clover-butterfly,cottontail,cricket-drummer,earthworm,field-mouse,field-vole,harvest-mouse,jackrabbit-sprinter,ladybird-guard,lucky-hopper,meadow-rabbit,robin-redbreast,seed-cache-squirrel,slow-worm --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2592 games in 481 s.

- The list (18): Ant Hill, Ant Scout, Bee Drone, Bee Sentry, Clover Butterfly, Cottontail, Cricket Drummer, Earthworm, Field Mouse, Field Vole, Harvest Mouse, Jackrabbit Sprinter, Ladybird Guard, Lucky Hopper, Meadow Rabbit, Robin Redbreast, Seed-cache Squirrel, Slow-worm.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (15 copies at 0 Lumber); flying x8 | 92% (89%-96%) | 0.25 | 0: 15, 1: 5 | 4x Clover Butterfly, 4x Jackrabbit Sprinter, 4x Ladybird Guard, 4x Robin Redbreast, 3x Cricket Drummer, 1x Lucky Hopper | 13 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4) | 89% (85%-93%) | 0.4 | 0: 12, 1: 8 | 4x Cricket Drummer, 4x Field Mouse, 4x Lucky Hopper, 4x Robin Redbreast, 4x Seed-cache Squirrel | 16 |
| 3 | swarm | swarm (20 copies at 0 Lumber) | 83% (79%-88%) | 0 | 0: 20 | 4x Ant Scout, 4x Bee Sentry, 4x Cricket Drummer, 4x Earthworm, 4x Field Vole | 12 |
| 4 | open | swarm (16 copies at 0 Lumber) | 80% (75%-85%) | 0.2 | 0: 16, 1: 4 | 4x Ant Scout, 4x Bee Drone, 4x Cricket Drummer, 4x Harvest Mouse, 4x Jackrabbit Sprinter | 0 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 100% | 83% | 100% | 96% | 100% | 75% | 92% |
| 2 big | 96% | 96% | 100% | 67% | 79% | 100% | 83% | 92% |
| 3 swarm | 100% | 96% | 83% | 100% | 79% | 92% | 29% | 88% |
| 4 open | 96% | 96% | 83% | 88% | 67% | 96% | 46% | 67% |
