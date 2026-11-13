# Focused decks: Map 1 Clovermead (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool ant-scout,bee-forager,chipmunk-cavalry,clover-butterfly,cottontail,dormouse,honey-bee,ladybird-guard,lucky-hopper,meadow-rabbit,puddle-skimmer,robin-redbreast --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6592 games in 108 s.

- The list (12): Ant Scout, Bee Forager, Chipmunk Cavalry, Clover Butterfly, Cottontail, Dormouse, Honey Bee, Ladybird Guard, Lucky Hopper, Meadow Rabbit, Puddle Skimmer, Robin Redbreast.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); flying x10 | 84% (79%-89%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Clover Butterfly, 4x Meadow Rabbit, 4x Robin Redbreast, 2x Honey Bee, 2x Ladybird Guard | 0 |
| 2 | family:flying | swarm (20 copies at 0 Lumber); flying x8 | 81% (76%-86%) | 0 | 0: 20 | 4x Ant Scout, 4x Clover Butterfly, 4x Dormouse, 4x Ladybird Guard, 4x Robin Redbreast | 10 |
| 3 | big | big (8 copies at 1 Lumber, average 0.4) | 74% (68%-80%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Dormouse, 4x Lucky Hopper, 3x Cottontail, 3x Robin Redbreast, 2x Clover Butterfly | 11 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 88% | 96% | 100% | 67% | 92% | 54% | 88% |
| 2 family:flying | 92% | 79% | 100% | 88% | 58% | 100% | 46% | 88% |
| 3 big | 75% | 63% | 96% | 67% | 54% | 100% | 63% | 75% |
