# Focused decks: Map 0 Bramblewood Outskirts (2026-11-22)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,earthworm,farm-dog,honey-bee,house-cat,pond-trout,silver-minnow,soldier-ant,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skwk5-bpro --focus family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6288 games in 88 s.

- The list (15): Ant Scout, Bee Forager, Bee Sentry, Chipmunk Forager, Cottontail, Crossed-Eyes, Duck Paddler, Earthworm, Farm Dog, Honey Bee, House Cat, Pond Trout, Silver Minnow, Soldier Ant, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.0 Lumber) | 93% (89%-97%) | 0 | 0: 20 | 4x Duck Paddler, 4x Farm Dog, 4x House Cat, 4x Soldier Ant, 3x Ant Scout, 1x Honey Bee | 0 |
| 2 | family:flying | flying x8 | 73% (66%-80%) | 0 | 0: 20 | 4x Bee Sentry, 4x Farm Dog, 4x Honey Bee, 4x Soldier Ant, 3x Crossed-Eyes, 1x House Cat | 10 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 88% | 96% | 75% |
| 2 family:flying | 92% | 71% | 67% | 75% | 63% | 71% |
