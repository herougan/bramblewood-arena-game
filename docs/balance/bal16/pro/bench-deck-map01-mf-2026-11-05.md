# Focused decks: Map 1 Thistlewood (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool acorn-chipmunk,alley-cat,ant-scout,badger-lumberjack,beaver-lumberjack,bee-forager,bee-knight,bee-sentry,bramble-sprout,burrow-rabbit,chipmunk-cavalry,chipmunk-forager,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,field-mouse,field-vole,harvest-mouse,hedgerow-shrew,hollow-belly-rat,honey-bee,meadow-rabbit,owl-sentinel,pond-trout,river-carp,robin-redbreast,slow-worm,terrier-pup,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:night,big,open --anchor ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,hollow-belly-rat,honey-bee,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 106 s.

- The list (32): Acorn Chipmunk, Alley Cat, Ant Scout, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bee Warden, Bee Sentry, Bramble Sprout, Burrow Rabbit, Chipmunk Cavalry, Chipmunk Forager, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Field Mouse, Field Vole, Harvest Mouse, Hedgerow Shrew, Hollow-belly Rat, Honey Bee, Meadow Rabbit, Owl Sentinel, Pond Trout, River Carp, Robin Redbreast, Slow-worm, Terrier Pup, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); swarm x8 | 68% (63%-74%) | 0.2 | 0: 16, 1: 4 | 4x Ant Scout, 4x Bee Forager, 4x Burrow Rabbit, 4x Chipmunk Cavalry, 2x Acorn Chipmunk, 2x Cricket Drummer | 0 |
| 2 | family:flying | swarm (20 copies at 0 Lumber); flying x8; swarm x7 | 65% (59%-71%) | 0 | 0: 20 | 4x Bee Forager, 4x Bee Sentry, 4x Cricket Drummer, 3x Alley Cat, 3x Ant Scout, 2x Chipmunk Skirmisher | 11 |
| 3 | big | big (8 copies at 1 Lumber, average 0.4) | 40% (34%-45%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Dormouse, 4x Hollow-belly Rat, 4x Meadow Rabbit, 2x Pond Trout, 2x River Carp | 16 |
| 4 | family:night | swarm (16 copies at 0 Lumber); ranged x8; night x8 | 31% (26%-37%) | 0.2 | 0: 16, 1: 4 | 4x Ant Scout, 4x Bramble Sprout, 4x Hedgerow Shrew, 4x Owl Sentinel, 4x Woodcock Lookout | 16 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 46% | 42% | 75% | 75% | 79% | 96% | 33% | 100% |
| 2 family:flying | 38% | 50% | 67% | 67% | 75% | 83% | 42% | 100% |
| 3 big | 21% | 8% | 33% | 50% | 21% | 96% | 25% | 63% |
| 4 family:night | 8% | 13% | 29% | 21% | 21% | 83% | 13% | 63% |
