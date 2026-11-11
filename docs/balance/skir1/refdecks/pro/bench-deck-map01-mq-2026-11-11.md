# Focused decks: Map 1 Clovermead (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alley-cat,alpine-marmot,ant-hill,ant-scout,bee-drone,bee-sentry,clover-butterfly,compost-grub,cottontail,cricket-drummer,dung-beetle,earthworm,field-mouse,field-vole,fire-ant-raft,harvest-mouse,hawthorn-shieldbug,jackrabbit-sprinter,ladybird-guard,leafcutter-gardener,lucky-hopper,meadow-rabbit,mountain-hare,mudpuppy,newt-doctor,nightjar-drifter,planarian-splitter,robin-redbreast,seed-cache-squirrel,slow-worm,water-vole --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,big,open --anchor ant-hill,ant-scout,bee-drone,bee-sentry,clover-butterfly,compost-grub,cottontail,cricket-drummer,earthworm,field-mouse,field-vole,harvest-mouse,jackrabbit-sprinter,ladybird-guard,lucky-hopper,meadow-rabbit,robin-redbreast,seed-cache-squirrel,slow-worm --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2064 games in 705 s.

- The list (31): Alley Cat, Alpine Marmot, Ant Hill, Ant Scout, Bee Drone, Bee Sentry, Clover Butterfly, Compost Grub, Cottontail, Cricket Drummer, Dung Beetle, Earthworm, Field Mouse, Field Vole, Fire Ant Raft, Harvest Mouse, Hawthorn Shieldbug, Jackrabbit Sprinter, Ladybird Guard, Leafcutter Gardener, Lucky Hopper, Meadow Rabbit, Mountain Hare, Mudpuppy, Newt Doctor, Nightjar Drifter, Planarian Splitter, Robin Redbreast, Seed-cache Squirrel, Slow-worm, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber) | 92% (89%-96%) | 0.3 | 0: 14, 1: 6 | 4x Ant Scout, 4x Cricket Drummer, 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 2x Field Vole, 2x Nightjar Drifter | 0 |
| 2 | family:flying | swarm (20 copies at 0 Lumber); flying x8 | 92% (88%-95%) | 0 | 0: 20 | 4x Alley Cat, 4x Bee Drone, 4x Cricket Drummer, 4x Meadow Rabbit, 4x Robin Redbreast | 16 |
| 3 | family:guard | swarm (14 copies at 0 Lumber); guard x8 | 92% (88%-95%) | 0.4 | 0: 14, 1: 4, 2: 2 | 4x Alpine Marmot, 4x Bee Sentry, 4x Cricket Drummer, 4x Hawthorn Shieldbug, 2x Alley Cat, 2x Ant Hill | 12 |
| 4 | big | big (11 copies at 1+ Lumber, average 0.6); flying x6 | 87% (83%-91%) | 0.55 | 0: 9, 1: 11 | 4x Hawthorn Shieldbug, 4x Robin Redbreast, 4x Seed-cache Squirrel, 3x Alley Cat, 3x Planarian Splitter, 2x Bee Drone | 16 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 88% | 96% | 100% | 96% | 71% | 88% |
| 2 family:flying | 96% | 96% | 96% | 88% | 100% | 92% | 79% | 88% |
| 3 family:guard | 100% | 100% | 88% | 96% | 96% | 100% | 58% | 96% |
| 4 big | 100% | 83% | 92% | 92% | 88% | 96% | 58% | 88% |
