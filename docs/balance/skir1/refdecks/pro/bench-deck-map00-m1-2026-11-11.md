# Focused decks: Map 0 Bramblewood Outskirts (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool acorn-chipmunk,ant-scout,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-forager,cobalt-talon-fledgling,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,farm-dog,forager-ant,hazel-coppice,honey-bee,house-cat,meadow-frog,meadow-rabbit,meerkat-wayfarer,nightjar-drifter,otter-paddler,pond-duck,pond-trout,rabbit-kit,river-carp,silver-minnow,soldier-ant,worker-ant --max-unique 6 --max-copies 4 --budget 3000 --final-games 24 --seed skir1-pro --focus economy,family:flying,big,open --anchor ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,farm-dog,hazel-coppice,honey-bee,house-cat,nightjar-drifter,rabbit-kit,silver-minnow,soldier-ant,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3660 games in 554 s.

- The list (30): Acorn Chipmunk, Ant Scout, Bee Forager, Bee Warden, Bee Sentry, Burrow Rabbit, Chipmunk Forager, Cobalt Fledgling, Cottontail, Crossed-Eyes, Duck Paddler, Duckling, Earthworm, Farm Dog, Forager Ant, Hazel Coppice, Honey Bee, House Cat, Meadow Frog, Meadow Rabbit, Meerkat Wayfarer, Nightjar Drifter, Otter Paddler, Pond Duck, Pond Trout, Rabbit Kit, River Carp, Silver Minnow, Soldier Ant, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (20 copies at 0 Lumber); flying x8 | 88% (84%-93%) | 0 | 0: 20 | 4x Bee Sentry, 4x Honey Bee, 4x Otter Paddler, 3x Farm Dog, 3x Pond Duck, 2x Burrow Rabbit | 13 |
| 2 | open | swarm (20 copies at 0 Lumber) | 77% (71%-83%) | 0 | 0: 20 | 4x Bee Sentry, 4x Earthworm, 4x Farm Dog, 4x Rabbit Kit, 2x Ant Scout, 2x Duck Paddler | 0 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers) | 56% (49%-63%) | 0.2 | 0: 16, 1: 4 | 4x Acorn Chipmunk, 4x Hazel Coppice, 4x House Cat, 4x River Carp, 2x Forager Ant, 2x Honey Bee | 20 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers) | 43% (36%-50%) | 0.4 | 0: 12, 1: 8 | 4x Crossed-Eyes, 4x Hazel Coppice, 4x Meerkat Wayfarer, 4x Nightjar Drifter, 2x Bee Sentry, 2x Duck Paddler | 16 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 54% | 88% | 96% | 92% | 100% |
| 2 open | 88% | 38% | 75% | 88% | 88% | 88% |
| 3 economy | 42% | 17% | 38% | 92% | 75% | 75% |
| 4 big | 29% | 17% | 25% | 63% | 58% | 67% |
