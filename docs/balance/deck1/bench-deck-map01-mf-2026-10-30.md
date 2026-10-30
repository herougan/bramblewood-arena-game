# Focused decks: Map 1 Thistlewood (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool acorn-chipmunk,ant-hill,ant-scout,badger-lumberjack,beaver-lumberjack,bee-forager,bee-knight,bramble-sprout,burrow-rabbit,chipmunk-cavalry,chipmunk-forager,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,field-mouse,field-vole,forager-ant,harvest-mouse,hedgerow-shrew,meadow-rabbit,owl-sentinel,pond-duck,pond-trout,river-carp,robin-redbreast,slow-worm,terrier-pup,woodcock-lookout --max-unique 6 --max-copies 4 --budget 24000 --final-games 24 --seed deck1-recheck --focus economy,big,swarm,open --anchor ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 24960 games in 260 s.

- The list (31): Acorn Chipmunk, Ant Hill, Ant Scout, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bee Knight, Bramble Sprout, Burrow Rabbit, Chipmunk Cavalry, Chipmunk Forager, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Field Mouse, Field Vole, Forager Ant, Harvest Mouse, Hedgerow Shrew, Meadow Rabbit, Owl Sentinel, Pond Duck, Pond Trout, River Carp, Robin Redbreast, Slow-worm, Terrier Pup, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (17 copies at 0 Lumber) | 76% (71%-81%) | 0.15 | 0: 17, 1: 3 | 4x Bramble Sprout, 4x Pond Duck, 4x Terrier Pup, 3x Chipmunk Cavalry, 3x Field Mouse, 2x Harvest Mouse | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber); strike-first x8 | 68% (62%-75%) | 0.2 | 0: 16, 1: 4 | 4x Chipmunk Cavalry, 4x Field Mouse, 4x Hedgerow Shrew, 4x Meadow Rabbit, 3x Chipmunk Skirmisher, 1x Ant Scout | 14 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.6); swarm x6 | 54% (47%-60%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Ant Scout, 4x Chipmunk Cavalry, 4x Pond Duck, 2x Bee Forager, 2x Terrier Pup | 11 |
| 4 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); strike-first x8 | 48% (42%-55%) | 0.3 | 0: 14, 1: 6 | 4x Acorn Chipmunk, 4x Beaver Lumberjack, 4x Chipmunk Cavalry, 4x Hedgerow Shrew, 2x Badger Lumberjack, 2x Cricket Drummer | 17 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 88% | 75% | 63% | 92% | 88% | 33% | 88% |
| 2 swarm | 75% | 63% | 54% | 63% | 63% | 83% | 67% | 79% |
| 3 big | 38% | 46% | 54% | 38% | 71% | 67% | 38% | 79% |
| 4 economy | 54% | 54% | 33% | 17% | 46% | 63% | 38% | 83% |
