# Focused decks: Map 1 Thistlewood (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool acorn-chipmunk,alley-cat,ant-scout,bee-forager,bee-knight,bee-sentry,bramble-sprout,burrow-rabbit,chipmunk-cavalry,chipmunk-forager,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,forager-ant,hedgerow-shrew,honey-bee,house-cat,meadow-rabbit,moonlit-hare,otter-guard,otter-paddler,pack-rat-looter,pond-duck,pond-trout,puddle-skimmer,river-carp,robin-redbreast,soldier-ant,terrier-pup --max-unique 6 --max-copies 4 --budget 3000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:night,open --anchor ant-scout,bee-knight,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,hedgerow-shrew,honey-bee,house-cat,meadow-rabbit,moonlit-hare,pack-rat-looter,puddle-skimmer,robin-redbreast,soldier-ant,terrier-pup --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 4176 games in 489 s.

- The list (32): Acorn Chipmunk, Alley Cat, Ant Scout, Bee Forager, Bee Warden, Bee Sentry, Bramble Sprout, Burrow Rabbit, Chipmunk Cavalry, Chipmunk Forager, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Forager Ant, Hedgerow Shrew, Honey Bee, House Cat, Meadow Rabbit, Moonlit Hare, Otter Guard, Otter Paddler, Pack Rat Looter, Pond Duck, Pond Trout, Puddle Skimmer, River Carp, Robin Redbreast, Soldier Ant, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 83% (78%-88%) | 0.2 | 0: 16, 1: 4 | 4x Pack Rat Looter, 4x Pond Trout, 4x Robin Redbreast, 3x Alley Cat, 3x Cricket Drummer, 2x Burrow Rabbit | 0 |
| 2 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers) | 82% (77%-87%) | 0.2 | 0: 16, 1: 4 | 4x Alley Cat, 4x Chipmunk Cavalry, 4x Forager Ant, 4x Robin Redbreast, 2x Burrow Rabbit, 2x Chipmunk Skirmisher | 11 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); flying x8 | 81% (75%-86%) | 0.3 | 0: 14, 1: 6 | 4x Bee Sentry, 4x Chipmunk Cavalry, 4x Pond Trout, 4x Robin Redbreast, 2x House Cat, 2x Otter Guard | 12 |
| 4 | family:night | swarm (20 copies at 0 Lumber); night x8 | 54% (47%-60%) | 0 | 0: 20 | 4x Alley Cat, 4x Bramble Sprout, 4x Cottontail, 4x Dormouse, 4x Moonlit Hare | 17 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 71% | 92% | 83% | 75% | 63% | 100% | 83% | 96% |
| 2 economy | 88% | 71% | 88% | 75% | 67% | 100% | 79% | 88% |
| 3 family:flying | 71% | 71% | 88% | 88% | 63% | 100% | 75% | 92% |
| 4 family:night | 46% | 33% | 50% | 46% | 38% | 92% | 50% | 75% |
