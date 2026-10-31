# Focused decks: Map 0 Bramblewood Outskirts (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool ant-hill,ant-scout,beaver-lumberjack,bee-forager,bee-knight,bee-sentry,chipmunk-skirmisher,cottontail,crossed-eyes,house-cat,owl-sentinel,terrier-pup --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6492 games in 78 s.

- The list (12): Ant Hill, Ant Scout, Beaver Lumberjack, Bee Forager, Bee Knight, Bee Sentry, Chipmunk Skirmisher, Cottontail, Crossed-Eyes, House Cat, Owl Sentinel, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (18 copies at 0 Lumber); swarm x7 | 75% (68%-82%) | 0.2 | 0: 18, 2: 2 | 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Terrier Pup, 3x Ant Scout, 3x Cottontail, 2x Ant Hill | 7 |
| 2 | family:flying | swarm (20 copies at 0 Lumber); swarm x12; flying x8 | 69% (62%-77%) | 0 | 0: 20 | 4x Ant Scout, 4x Bee Forager, 4x Bee Knight, 4x Chipmunk Skirmisher, 4x House Cat | 12 |
| 3 | open | swarm (16 copies at 0 Lumber); swarm x8; flying x8 | 65% (57%-72%) | 0.4 | 0: 16, 2: 4 | 4x Ant Hill, 4x Ant Scout, 4x Bee Forager, 4x Bee Sentry, 4x Terrier Pup | 0 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6); swarm x12; flying x12 | 58% (51%-66%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Ant Scout, 4x Bee Forager, 4x Bee Knight, 4x Owl Sentinel | 8 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 swarm | 88% | 75% | 46% | 71% | 83% | 88% |
| 2 family:flying | 92% | 75% | 54% | 46% | 71% | 79% |
| 3 open | 71% | 67% | 50% | 67% | 54% | 79% |
| 4 big | 71% | 67% | 33% | 46% | 54% | 79% |
