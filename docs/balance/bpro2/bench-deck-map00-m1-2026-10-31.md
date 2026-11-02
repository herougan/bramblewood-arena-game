# Focused decks: Map 0 Bramblewood Outskirts (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-scout,beaver-lumberjack,bee-forager,bee-sentry,chipmunk-forager,chipmunk-skirmisher,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,honey-bee,house-cat,silver-minnow,soldier-ant,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6336 games in 68 s.

- The list (17): Ant Scout, Beaver Lumberjack, Bee Forager, Bee Sentry, Chipmunk Forager, Chipmunk Skirmisher, Cottontail, Crossed-Eyes, Duck Paddler, Duckling, Earthworm, Honey Bee, House Cat, Silver Minnow, Soldier Ant, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm x12; flying x8 | 78% (72%-85%) | 0 | 0: 20 | 4x Ant Scout, 4x Bee Forager, 4x Honey Bee, 4x Soldier Ant, 2x Chipmunk Skirmisher, 2x Worker Ant | 10 |
| 2 | open | swarm x8 | 70% (63%-77%) | 0 | 0: 20 | 4x Ant Scout, 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Cottontail, 4x Terrier Pup | 0 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 92% | 63% | 54% | 71% | 92% |
| 2 open | 96% | 67% | 63% | 38% | 79% | 79% |
