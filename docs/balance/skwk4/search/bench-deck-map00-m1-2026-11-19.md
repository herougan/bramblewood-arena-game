# Focused decks: Map 0 Bramblewood Outskirts (2026-11-19)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,earthworm,elder-willow,farm-dog,honey-bee,house-cat,pond-trout,silver-minnow,soldier-ant,thorn-shrike,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skwk4-bpro --focus family:flying,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6600 games in 557 s.

- The list (17): Ant Scout, Bee Forager, Bee Sentry, Chipmunk Forager, Cottontail, Crossed-Eyes, Duck Paddler, Earthworm, Elder Willow, Farm Dog, Honey Bee, House Cat, Pond Trout, Silver Minnow, Soldier Ant, Thorn Shrike, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (20 copies at 0 Lumber) | 92% (87%-96%) | 0 | 0: 20 | 4x Duck Paddler, 4x House Cat, 4x Soldier Ant, 3x Cottontail, 3x Farm Dog, 2x Chipmunk Forager | 11 |
| 2 | open | swarm (16 copies at 0 Lumber) | 86% (81%-92%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Forager, 4x Farm Dog, 4x Pond Trout, 4x Soldier Ant, 4x Thorn Shrike | 0 |
| 3 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 83% (77%-89%) | 0.2 | 0: 16, 1: 4 | 4x Duck Paddler, 4x Honey Bee, 4x Soldier Ant, 4x Thorn Shrike, 3x Crossed-Eyes, 1x Farm Dog | 11 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 swarm | 100% | 96% | 88% | 96% | 88% | 83% |
| 2 open | 92% | 88% | 79% | 83% | 79% | 96% |
| 3 family:flying | 79% | 88% | 71% | 88% | 83% | 88% |
