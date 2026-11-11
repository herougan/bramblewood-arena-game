# Focused decks: Map 1 Thistlewood (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool ant-scout,bee-knight,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,cottontail,cricket-drummer,dormouse,duck-paddler,hedgerow-shrew,honey-bee,house-cat,meadow-rabbit,moonlit-hare,pack-rat-looter,puddle-skimmer,robin-redbreast,soldier-ant,terrier-pup --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:flying,family:night,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3072 games in 544 s.

- The list (19): Ant Scout, Bee Warden, Bramble Sprout, Chipmunk Cavalry, Chipmunk Skirmisher, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Hedgerow Shrew, Honey Bee, House Cat, Meadow Rabbit, Moonlit Hare, Pack Rat Looter, Puddle Skimmer, Robin Redbreast, Soldier Ant, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:night | swarm (20 copies at 0 Lumber); night x8 | 88% (84%-92%) | 0 | 0: 20 | 4x Cricket Drummer, 4x Dormouse, 4x Moonlit Hare, 4x Robin Redbreast, 3x Puddle Skimmer, 1x Bramble Sprout | 16 |
| 2 | family:flying | swarm (17 copies at 0 Lumber); flying x8 | 83% (78%-88%) | 0.15 | 0: 17, 1: 3 | 4x Bramble Sprout, 4x Honey Bee, 4x Robin Redbreast, 3x Cricket Drummer, 3x Pack Rat Looter, 2x Bee Warden | 20 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); night x6 | 79% (74%-84%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Dormouse, 4x Hedgerow Shrew, 4x Pack Rat Looter, 2x Chipmunk Skirmisher, 2x Moonlit Hare | 18 |
| 4 | open | swarm (16 copies at 0 Lumber) | 76% (70%-81%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Duck Paddler, 4x Meadow Rabbit, 4x Moonlit Hare, 4x Soldier Ant | 0 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:night | 88% | 63% | 92% | 96% | 100% | 100% | 67% | 100% |
| 2 family:flying | 75% | 67% | 88% | 96% | 83% | 96% | 67% | 92% |
| 3 economy | 63% | 54% | 83% | 88% | 96% | 100% | 54% | 96% |
| 4 open | 67% | 42% | 92% | 83% | 83% | 100% | 46% | 92% |
