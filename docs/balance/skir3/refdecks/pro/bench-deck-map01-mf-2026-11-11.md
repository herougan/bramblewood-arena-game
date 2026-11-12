# Focused decks: Map 1 Thistlewood (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool acorn-chipmunk,alley-cat,ant-scout,bee-forager,bee-knight,bramble-sprout,burrow-rabbit,chipmunk-cavalry,chipmunk-forager,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,forager-ant,hedgerow-shrew,house-cat,meadow-rabbit,moonlit-hare,otter-guard,otter-paddler,pond-duck,pond-trout,puddle-skimmer,river-carp,robin-redbreast,soldier-ant,terrier-pup,worker-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:night,open --anchor ant-scout,bee-knight,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,hedgerow-shrew,house-cat,meadow-rabbit,moonlit-hare,puddle-skimmer,robin-redbreast,soldier-ant,terrier-pup --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8640 games in 112 s.

- The list (30): Acorn Chipmunk, Alley Cat, Ant Scout, Bee Forager, Bee Warden, Bramble Sprout, Burrow Rabbit, Chipmunk Cavalry, Chipmunk Forager, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Forager Ant, Hedgerow Shrew, House Cat, Meadow Rabbit, Moonlit Hare, Otter Guard, Otter Paddler, Pond Duck, Pond Trout, Puddle Skimmer, River Carp, Robin Redbreast, Soldier Ant, Terrier Pup, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (16 copies at 0 Lumber); economy (8 resource makers) | 80% (74%-85%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Chipmunk Skirmisher, 4x Cricket Drummer, 4x Forager Ant, 3x Cottontail, 1x Otter Paddler | 16 |
| 2 | family:flying | swarm (20 copies at 0 Lumber); economy (4 resource makers); flying x8 | 78% (73%-84%) | 0 | 0: 20 | 4x Bee Forager, 4x Chipmunk Skirmisher, 4x Cricket Drummer, 4x Robin Redbreast, 3x Terrier Pup, 1x Alley Cat | 15 |
| 3 | open | swarm (16 copies at 0 Lumber) | 69% (63%-75%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Sprout, 4x Cricket Drummer, 4x House Cat, 4x Otter Guard, 2x Alley Cat, 2x Bee Warden | 0 |
| 4 | family:night | swarm (16 copies at 0 Lumber); night x8 | 57% (51%-63%) | 0.2 | 0: 16, 1: 4 | 4x Dormouse, 4x Moonlit Hare, 4x Otter Guard, 4x Soldier Ant, 2x House Cat, 2x Terrier Pup | 14 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 71% | 71% | 75% | 83% | 83% | 96% | 63% | 96% |
| 2 family:flying | 71% | 50% | 67% | 92% | 88% | 92% | 75% | 92% |
| 3 open | 50% | 46% | 58% | 71% | 79% | 100% | 63% | 83% |
| 4 family:night | 58% | 25% | 33% | 38% | 71% | 96% | 42% | 96% |
