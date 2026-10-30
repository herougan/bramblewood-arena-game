# Focused decks: Map 0 Bramblewood Outskirts (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool acorn-chipmunk,ant-hill,ant-scout,beaver-lumberjack,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-skirmisher,cottontail,crimson-wing-recruit,crossed-eyes,forager-ant,greyplume-fledgling,harvest-mouse,house-cat,meadow-frog,meerkat-wayfarer,otter-paddler,owl-sentinel,pond-trout,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:flying,open --anchor ant-hill,ant-scout,beaver-lumberjack,bee-forager,bee-knight,bee-sentry,chipmunk-skirmisher,cottontail,crossed-eyes,house-cat,owl-sentinel,terrier-pup --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12876 games in 147 s.

- The list (23): Acorn Chipmunk, Ant Hill, Ant Scout, Beaver Lumberjack, Bee Forager, Bee Knight, Bee Sentry, Burrow Rabbit, Chipmunk Skirmisher, Cottontail, Crimson Recruit, Crossed-Eyes, Forager Ant, Greyplume Fledgling, Harvest Mouse, House Cat, Meadow Frog, Meerkat Wayfarer, Otter Paddler, Owl Sentinel, Pond Trout, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (18 copies at 0 Lumber) | 79% (73%-85%) | 0.1 | 0: 18, 1: 2 | 4x Chipmunk Skirmisher, 4x Otter Paddler, 4x Terrier Pup, 3x Burrow Rabbit, 3x Pond Trout, 2x Owl Sentinel | 0 |
| 2 | swarm | swarm (19 copies at 0 Lumber); swarm x7 | 69% (61%-76%) | 0.1 | 0: 19, 2: 1 | 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Crossed-Eyes, 4x Terrier Pup, 3x Ant Scout, 1x Ant Hill | 12 |
| 3 | family:flying | swarm (20 copies at 0 Lumber); swarm x9; flying x8 | 67% (59%-74%) | 0 | 0: 20 | 4x Bee Forager, 4x Bee Knight, 4x Chipmunk Skirmisher, 4x Forager Ant, 3x Pond Trout, 1x Ant Scout | 13 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6); flying x7 | 42% (35%-50%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Forager Ant, 4x Owl Sentinel, 3x Bee Forager, 3x House Cat, 2x Ant Scout | 18 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 96% | 83% | 63% | 50% | 100% | 83% |
| 2 swarm | 75% | 67% | 75% | 46% | 71% | 79% |
| 3 family:flying | 79% | 79% | 50% | 67% | 54% | 71% |
| 4 big | 42% | 46% | 46% | 21% | 38% | 63% |
