# Focused decks: Map 1 Clovermead (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alpine-marmot,ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,compost-grub,cottontail,cricket-drummer,dung-beetle,field-mouse,field-vole,fire-ant-raft,hawthorn-shieldbug,hedgerow-shrew,leafcutter-gardener,meadow-rabbit,mountain-hare,mudpuppy,newt-doctor,nightjar-drifter,planarian-splitter,robin-redbreast,slow-worm,vampire-bat,water-vole,woodcock-lookout --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ant-hill,ant-scout,badger-lumberjack,bee-forager,bramble-sprout,compost-grub,cottontail,cricket-drummer,field-mouse,field-vole,hedgerow-shrew,meadow-rabbit,robin-redbreast,slow-worm,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13120 games in 185 s.

- The list (27): Alpine Marmot, Ant Hill, Ant Scout, Badger Lumberjack, Bee Forager, Bramble Sprout, Compost Grub, Cottontail, Cricket Drummer, Dung Beetle, Field Mouse, Field Vole, Fire Ant Raft, Hawthorn Shieldbug, Hedgerow Shrew, Leafcutter Gardener, Meadow Rabbit, Mountain Hare, Mudpuppy, Newt Doctor, Nightjar Drifter, Planarian Splitter, Robin Redbreast, Slow-worm, Vampire Bat, Water Vole, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber) | 77% (71%-82%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Sprout, 4x Cricket Drummer, 4x Mudpuppy, 4x Planarian Splitter, 2x Hawthorn Shieldbug, 2x Slow-worm | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber) | 68% (62%-73%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Field Vole, 4x Hawthorn Shieldbug, 3x Field Mouse, 3x Slow-worm, 2x Vampire Bat | 12 |
| 3 | economy | economy (6 resource makers) | 67% (61%-73%) | 0.35 | 0: 13, 1: 7 | 4x Field Mouse, 4x Planarian Splitter, 3x Badger Lumberjack, 3x Bramble Sprout, 3x Leafcutter Gardener, 3x Meadow Rabbit | 13 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.5); swarm x6; flying x6 | 48% (42%-55%) | 0.5 | 0: 10, 1: 10 | 4x Bramble Sprout, 4x Hawthorn Shieldbug, 3x Badger Lumberjack, 3x Bee Forager, 3x Fire Ant Raft, 3x Vampire Bat | 14 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 79% | 79% | 75% | 63% | 79% | 96% | 50% | 92% |
| 2 swarm | 63% | 67% | 71% | 54% | 79% | 100% | 13% | 96% |
| 3 economy | 71% | 75% | 63% | 42% | 75% | 96% | 29% | 88% |
| 4 big | 29% | 63% | 33% | 29% | 50% | 75% | 17% | 92% |
