# Focused decks: Map 0 Bramblewood Outskirts (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m1 --pool acorn-chipmunk,ant-scout,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-forager,cobalt-talon-fledgling,cottontail,crossed-eyes,duck-paddler,duckling,earthworm,farm-dog,forager-ant,honey-bee,house-cat,meadow-frog,meadow-rabbit,meerkat-wayfarer,otter-paddler,pond-duck,pond-trout,rabbit-kit,river-carp,silver-minnow,soldier-ant,worker-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,open --anchor ant-scout,bee-forager,bee-sentry,chipmunk-forager,cottontail,crossed-eyes,duck-paddler,earthworm,farm-dog,honey-bee,house-cat,pond-trout,rabbit-kit,silver-minnow,soldier-ant,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8280 games in 122 s.

- The list (28): Acorn Chipmunk, Ant Scout, Bee Forager, Bee Warden, Bee Sentry, Burrow Rabbit, Chipmunk Forager, Cobalt Fledgling, Cottontail, Crossed-Eyes, Duck Paddler, Duckling, Earthworm, Farm Dog, Forager Ant, Honey Bee, House Cat, Meadow Frog, Meadow Rabbit, Meerkat Wayfarer, Otter Paddler, Pond Duck, Pond Trout, Rabbit Kit, River Carp, Silver Minnow, Soldier Ant, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-1 skirmish's deck; 0-2 skirmish's deck; 0-3 skirmish's deck; 0-4 skirmish's deck; reference starter deck under 0-1's field; expected player deck (expectedPlayerDeck) under 0-2's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.0 Lumber) | 92% (88%-96%) | 0 | 0: 20 | 4x Bee Sentry, 4x Farm Dog, 4x Soldier Ant, 4x Worker Ant, 2x Acorn Chipmunk, 2x Cottontail | 0 |
| 2 | family:flying | flying x8 | 85% (79%-90%) | 0 | 0: 20 | 4x Bee Sentry, 4x Farm Dog, 4x Honey Bee, 3x Meadow Frog, 3x Pond Duck, 2x Soldier Ant | 10 |

## Per opponent

| Deck | fight:0-1 | fight:0-2 | fight:0-3 | fight:0-4 | ref:starter | ref:expected |
|---|---|---|---|---|---|---|
| 1 open | 100% | 88% | 100% | 67% | 100% | 100% |
| 2 family:flying | 88% | 71% | 88% | 67% | 100% | 96% |
