# Focused decks: Map 0 Bramblewood Outskirts (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,beaver-lumberjack,bee-forager,bee-sentry,chipmunk-forager,chipmunk-skirmisher,cottontail,crossed-eyes,duck-paddler,earthworm,honey-bee,house-cat,silver-minnow,soldier-ant,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6336 games in 94 s.

- The list (16): Ant Scout, Beaver Lumberjack, Bee Forager, Bee Sentry, Chipmunk Forager, Chipmunk Skirmisher, Cottontail, Crossed-Eyes, Duck Paddler, Earthworm, Honey Bee, House Cat, Silver Minnow, Soldier Ant, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm x8 | 73% (66%-80%) | 0 | 0: 20 | 4x Ant Scout, 4x Chipmunk Skirmisher, 4x Crossed-Eyes, 4x Soldier Ant, 4x Terrier Pup | 0 |
| 2 | family:flying | flying x8; swarm x7 | 71% (64%-78%) | 0 | 0: 20 | 4x Bee Forager, 4x Bee Sentry, 4x Chipmunk Skirmisher, 4x House Cat, 3x Ant Scout, 1x Terrier Pup | 12 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 100% | 54% | 75% | 46% | 83% | 79% |
| 2 family:flying | 96% | 63% | 71% | 67% | 46% | 83% |
