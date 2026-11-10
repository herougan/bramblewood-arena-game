# Focused decks: Map 0 Bramblewood Outskirts (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,earthworm,farm-dog,hazel-coppice,honey-bee,house-cat,nightjar-drifter,silver-minnow,soldier-ant,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6564 games in 926 s.

- The list (16): Ant Scout, Bee Forager, Bee Sentry, Chipmunk Forager, Cottontail, Crossed-Eyes, Duck Paddler, Earthworm, Farm Dog, Hazel Coppice, Honey Bee, House Cat, Nightjar Drifter, Silver Minnow, Soldier Ant, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (20 copies at 0 Lumber); swarm x8 | 91% (87%-95%) | 0 | 0: 20 | 4x Ant Scout, 4x Cottontail, 4x House Cat, 4x Soldier Ant, 3x Bee Sentry, 1x Farm Dog | 13 |
| 2 | open | swarm (20 copies at 0 Lumber) | 90% (86%-95%) | 0 | 0: 20 | 4x Bee Sentry, 4x Chipmunk Forager, 4x Crossed-Eyes, 4x Duck Paddler, 4x Soldier Ant | 0 |
| 3 | family:flying | swarm (20 copies at 0 Lumber); flying x8 | 83% (77%-88%) | 0 | 0: 20 | 4x Bee Forager, 4x Bee Sentry, 4x Farm Dog, 4x Soldier Ant, 3x Worker Ant, 1x Earthworm | 12 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers) | 62% (54%-69%) | 0.4 | 0: 12, 1: 8 | 4x Hazel Coppice, 4x House Cat, 4x Nightjar Drifter, 3x Bee Sentry, 3x Farm Dog, 2x Soldier Ant | 15 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 swarm | 100% | 71% | 79% | 96% | 100% | 100% |
| 2 open | 88% | 71% | 83% | 100% | 100% | 100% |
| 3 family:flying | 88% | 58% | 79% | 100% | 88% | 83% |
| 4 big | 63% | 42% | 38% | 79% | 63% | 88% |
