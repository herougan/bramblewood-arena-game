# Focused decks: Map 1 Clovermead (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-hill,ant-scout,bee-sentry,cottontail,cricket-drummer,earthworm,harvest-mouse,jackrabbit-sprinter,meadow-rabbit,robin-redbreast,slow-worm --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 98 s.

- The list (11): Ant Hill, Ant Scout, Bee Sentry, Cottontail, Cricket Drummer, Earthworm, Harvest Mouse, Jackrabbit Sprinter, Meadow Rabbit, Robin Redbreast, Slow-worm.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 96% (93%-98%) | 0.2 | 0: 16, 1: 4 | 4x Bee Sentry, 4x Cricket Drummer, 4x Jackrabbit Sprinter, 4x Robin Redbreast, 3x Slow-worm, 1x Ant Scout | 11 |
| 2 | open | swarm (18 copies at 0 Lumber) | 81% (76%-86%) | 0.2 | 0: 18, 2: 2 | 4x Cricket Drummer, 4x Earthworm, 4x Meadow Rabbit, 4x Slow-worm, 2x Ant Hill, 2x Robin Redbreast | 0 |
| 3 | swarm | swarm (16 copies at 0 Lumber) | 78% (72%-83%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Earthworm, 4x Harvest Mouse, 4x Jackrabbit Sprinter, 2x Bee Sentry, 2x Cottontail | 12 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6) | 64% (58%-70%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Earthworm, 4x Jackrabbit Sprinter, 4x Robin Redbreast, 3x Ant Scout, 1x Slow-worm | 11 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 100% | 96% | 100% | 100% | 75% | 96% |
| 2 open | 96% | 88% | 79% | 92% | 83% | 96% | 50% | 67% |
| 3 swarm | 96% | 96% | 79% | 92% | 63% | 88% | 38% | 71% |
| 4 big | 88% | 58% | 75% | 79% | 42% | 79% | 38% | 54% |
