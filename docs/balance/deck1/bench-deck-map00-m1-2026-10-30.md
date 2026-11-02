# Focused decks: Map 0 Bramblewood Outskirts (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool acorn-chipmunk,ant-scout,beaver-lumberjack,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-forager,chipmunk-skirmisher,cobalt-talon-fledgling,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,forager-ant,honey-bee,house-cat,meadow-frog,meadow-rabbit,meerkat-wayfarer,otter-paddler,pond-duck,pond-trout,river-carp,silver-minnow,soldier-ant,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus family:flying,open --anchor ant-scout,beaver-lumberjack,bee-forager,bee-sentry,chipmunk-forager,chipmunk-skirmisher,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,honey-bee,house-cat,silver-minnow,soldier-ant,terrier-pup,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6252 games in 71 s.

- The list (29): Acorn Chipmunk, Ant Scout, Beaver Lumberjack, Bee Forager, Bee Knight, Bee Sentry, Burrow Rabbit, Chipmunk Forager, Chipmunk Skirmisher, Cobalt Fledgling, Cottontail, Crossed-Eyes, Duck Paddler, Duckling, Earthworm, Forager Ant, Honey Bee, House Cat, Meadow Frog, Meadow Rabbit, Meerkat Wayfarer, Otter Paddler, Pond Duck, Pond Trout, River Carp, Silver Minnow, Soldier Ant, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm x9; flying x8 | 78% (71%-84%) | 0 | 0: 20 | 4x Ant Scout, 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Honey Bee, 3x Terrier Pup, 1x Soldier Ant | 15 |
| 2 | open | midrange (average 0.0 Lumber) | 73% (67%-79%) | 0 | 0: 20 | 4x Duck Paddler, 4x River Carp, 4x Terrier Pup, 4x Worker Ant, 2x Bee Sentry, 2x Chipmunk Skirmisher | 0 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 67% | 75% | 58% | 83% | 92% |
| 2 open | 100% | 71% | 67% | 33% | 92% | 75% |
