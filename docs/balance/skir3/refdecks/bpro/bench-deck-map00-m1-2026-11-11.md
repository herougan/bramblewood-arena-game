# Focused decks: Map 0 Bramblewood Outskirts (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,earthworm,farm-dog,honey-bee,house-cat,pond-trout,silver-minnow,soldier-ant,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6396 games in 100 s.

- The list (15): Ant Scout, Bee Forager, Bee Sentry, Chipmunk Forager, Cottontail, Crossed-Eyes, Duck Paddler, Earthworm, Farm Dog, Honey Bee, House Cat, Pond Trout, Silver Minnow, Soldier Ant, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm x8 | 91% (86%-95%) | 0 | 0: 20 | 4x Ant Scout, 4x Farm Dog, 4x Soldier Ant, 3x Duck Paddler, 3x Pond Trout, 2x Worker Ant | 0 |
| 2 | family:flying | flying x8 | 88% (83%-93%) | 0 | 0: 20 | 4x Bee Sentry, 4x Honey Bee, 4x House Cat, 4x Soldier Ant, 3x Duck Paddler, 1x Earthworm | 13 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 88% | 75% | 96% | 100% |
| 2 family:flying | 100% | 88% | 88% | 63% | 96% | 96% |
