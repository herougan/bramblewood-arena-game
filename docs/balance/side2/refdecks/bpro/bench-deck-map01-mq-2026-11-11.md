# Focused decks: Map 1 Clovermead (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-scout,bee-forager,chipmunk-cavalry,clover-butterfly,cottontail,dormouse,honey-bee,jackrabbit-sprinter,lucky-hopper,meadow-rabbit,puddle-skimmer,robin-redbreast --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6848 games in 125 s.

- The list (12): Ant Scout, Bee Forager, Chipmunk Cavalry, Clover Butterfly, Cottontail, Dormouse, Honey Bee, Jackrabbit Sprinter, Lucky Hopper, Meadow Rabbit, Puddle Skimmer, Robin Redbreast.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (8 copies at 1 Lumber, average 0.4); strike-first x8; flying x8 | 93% (90%-96%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Clover Butterfly, 4x Dormouse, 4x Jackrabbit Sprinter, 4x Robin Redbreast | 11 |
| 2 | big | big (8 copies at 1 Lumber, average 0.4); strike-first x8; flying x6 | 70% (64%-76%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Honey Bee, 4x Jackrabbit Sprinter, 3x Meadow Rabbit, 3x Puddle Skimmer, 2x Robin Redbreast | 10 |
| 3 | open | swarm (16 copies at 0 Lumber) | 70% (64%-75%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Clover Butterfly, 4x Meadow Rabbit, 4x Puddle Skimmer, 3x Ant Scout, 1x Dormouse | 0 |
| 4 | family:strike-first | big (8 copies at 1 Lumber, average 0.4); strike-first x8; flying x6 | 67% (61%-73%) | 0.4 | 0: 12, 1: 8 | 4x Bee Forager, 4x Chipmunk Cavalry, 4x Jackrabbit Sprinter, 3x Ant Scout, 3x Cottontail, 2x Robin Redbreast | 13 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 96% | 100% | 92% | 100% | 63% | 96% |
| 2 big | 79% | 67% | 67% | 96% | 54% | 92% | 46% | 58% |
| 3 open | 88% | 75% | 63% | 96% | 71% | 88% | 17% | 63% |
| 4 family:strike-first | 88% | 75% | 54% | 92% | 54% | 92% | 21% | 63% |
