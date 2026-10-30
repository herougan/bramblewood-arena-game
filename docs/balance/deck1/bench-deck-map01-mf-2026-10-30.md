# Focused decks: Map 1 Thistlewood (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool acorn-chipmunk,ant-hill,ant-scout,badger-lumberjack,beaver-lumberjack,bee-forager,bee-knight,bramble-sprout,burrow-rabbit,chipmunk-cavalry,chipmunk-forager,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,duck-paddler,field-mouse,field-vole,forager-ant,harvest-mouse,hedgerow-shrew,meadow-rabbit,owl-sentinel,pond-duck,pond-trout,river-carp,robin-redbreast,slow-worm,terrier-pup,woodcock-lookout --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,compost-grub,cottontail,cricket-drummer,dormouse,field-mouse,field-vole,hedgerow-shrew,meadow-rabbit,owl-sentinel,robin-redbreast,slow-worm,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13008 games in 161 s.

- The list (31): Acorn Chipmunk, Ant Hill, Ant Scout, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bee Knight, Bramble Sprout, Burrow Rabbit, Chipmunk Cavalry, Chipmunk Forager, Chipmunk Skirmisher, Compost Grub, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Field Mouse, Field Vole, Forager Ant, Harvest Mouse, Hedgerow Shrew, Meadow Rabbit, Owl Sentinel, Pond Duck, Pond Trout, River Carp, Robin Redbreast, Slow-worm, Terrier Pup, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber) | 65% (59%-71%) | 0.15 | 0: 17, 1: 3 | 4x Bramble Sprout, 4x Chipmunk Skirmisher, 4x Field Mouse, 4x River Carp, 3x Chipmunk Cavalry, 1x Burrow Rabbit | 15 |
| 2 | open | swarm (20 copies at 0 Lumber) | 65% (59%-72%) | 0 | 0: 20 | 4x Bee Forager, 4x Cricket Drummer, 4x Hedgerow Shrew, 3x Bramble Sprout, 3x Forager Ant, 2x Chipmunk Skirmisher | 0 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.6); strike-first x6 | 49% (43%-56%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Hill, 4x Chipmunk Cavalry, 4x River Carp, 3x Burrow Rabbit, 3x Pond Trout, 2x Hedgerow Shrew | 18 |
| 4 | economy | swarm (17 copies at 0 Lumber); economy (7 resource makers) | 30% (24%-36%) | 0.15 | 0: 17, 1: 3 | 4x Acorn Chipmunk, 4x Beaver Lumberjack, 4x Bee Forager, 4x Cricket Drummer, 3x Badger Lumberjack, 1x Terrier Pup | 12 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 54% | 79% | 54% | 50% | 88% | 92% | 21% | 83% |
| 2 open | 58% | 67% | 67% | 46% | 58% | 79% | 50% | 96% |
| 3 big | 46% | 50% | 38% | 33% | 63% | 63% | 42% | 63% |
| 4 economy | 17% | 29% | 29% | 13% | 46% | 29% | 25% | 54% |
