# Focused decks: Map 0 Bramblewood Outskirts (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,beaver-lumberjack,bee-forager,bee-sentry,chipmunk-forager,chipmunk-skirmisher,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,honey-bee,house-cat,silver-minnow,soldier-ant,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6432 games in 166 s.

- The list (17): Ant Scout, Beaver Lumberjack, Bee Forager, Bee Sentry, Chipmunk Forager, Chipmunk Skirmisher, Cottontail, Crossed-Eyes, Duck Paddler, Duckling, Earthworm, Honey Bee, House Cat, Silver Minnow, Soldier Ant, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm x7; flying x6 | 73% (66%-80%) | 0 | 0: 20 | 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Earthworm, 3x Ant Scout, 3x House Cat, 2x Honey Bee | 0 |
| 2 | family:flying | swarm x9; flying x8 | 67% (60%-74%) | 0 | 0: 20 | 4x Bee Forager, 4x Honey Bee, 4x Worker Ant, 3x Ant Scout, 3x Duckling, 2x Soldier Ant | 11 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 100% | 58% | 75% | 46% | 71% | 88% |
| 2 family:flying | 96% | 58% | 58% | 42% | 67% | 79% |
