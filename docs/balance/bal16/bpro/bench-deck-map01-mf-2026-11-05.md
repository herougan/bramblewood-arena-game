# Focused decks: Map 1 Thistlewood (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,hollow-belly-rat,honey-bee,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,family:night,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6880 games in 98 s.

- The list (19): Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Chipmunk Cavalry, Chipmunk Skirmisher, Cottontail, Cricket Drummer, Dormouse, Field Mouse, Field Vole, Hedgerow Shrew, Hollow-belly Rat, Honey Bee, Meadow Rabbit, Owl Sentinel, Robin Redbreast, Slow-worm, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber) | 78% (73%-83%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Cricket Drummer, 4x Field Mouse, 4x Slow-worm, 3x Bramble Sprout, 1x Cottontail | 0 |
| 2 | family:flying | swarm (19 copies at 0 Lumber); flying x8 | 69% (63%-75%) | 0.05 | 0: 19, 1: 1 | 4x Bee Forager, 4x Cricket Drummer, 4x Dormouse, 4x Robin Redbreast, 3x Hedgerow Shrew, 1x Chipmunk Cavalry | 15 |
| 3 | family:night | swarm (16 copies at 0 Lumber); ranged x8; night x8 | 59% (53%-65%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Field Mouse, 4x Owl Sentinel, 4x Woodcock Lookout, 3x Dormouse, 1x Bramble Sprout | 11 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4) | 51% (44%-57%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Sprout, 4x Cricket Drummer, 4x Hollow-belly Rat, 4x Owl Sentinel, 2x Field Vole, 2x Slow-worm | 11 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 54% | 58% | 92% | 96% | 83% | 100% | 42% | 100% |
| 2 family:flying | 46% | 50% | 79% | 79% | 71% | 100% | 42% | 88% |
| 3 family:night | 25% | 42% | 79% | 88% | 54% | 88% | 17% | 79% |
| 4 big | 17% | 29% | 54% | 79% | 38% | 92% | 25% | 71% |
