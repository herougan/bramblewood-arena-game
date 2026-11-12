# Focused decks: Map 4 Sunken Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool alley-cat,beaver-lumberjack,bee-forager,bramble-sprout,conch-crawler,driftwood-crab,drowned-matriarch,duck-paddler,fleetfootd,gannet-nestweaver,grass-snake,kittiwake-flock,meadow-frog,muskrat-lodgekeeper,pincushion-urchin,planarian-splitter,platypus-spur,pond-duck,puffin-diver,river-carp,river-mink,rock-pool-starfish,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:flying,big,open --anchor beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8976 games in 154 s.

- The list (26): Alley Cat, Beaver Lumberjack, Bee Forager, Bramble Sprout, Conch Crawler, Driftwood Crab, The Drowned Matriarch, Duck Paddler, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Kittiwake Flock, Meadow Frog, Muskrat Lodgekeeper, Pincushion Urchin, Planarian Splitter, Platypus Spur, Pond Duck, Puffin Diver, River Carp, River Mink, Rock Pool Starfish, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x11; cleave x6 | 92% (89%-96%) | 0.2 | 0: 16, 1: 4 | 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Rock Pool Starfish, 3x Fleetfoot'd, 3x Water Shrew, 2x Alley Cat | 12 |
| 2 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x10; flying x8 | 92% (89%-96%) | 0.2 | 0: 16, 1: 4 | 4x Gannet Nestweaver, 4x Kittiwake Flock, 4x Rock Pool Starfish, 4x Snapstick Turtle, 2x Pincushion Urchin, 2x Slow-worm | 0 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); economy (8 resource makers); flying x8; armor x7 | 87% (83%-91%) | 0.3 | 0: 14, 1: 6 | 4x Driftwood Crab, 4x Gannet Nestweaver, 4x Kittiwake Flock, 3x Conch Crawler, 3x Water Shrew, 2x The Drowned Matriarch | 12 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers) | 84% (79%-89%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Planarian Splitter, 3x Alley Cat, 3x Beaver Lumberjack, 2x Fleetfoot'd | 16 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 92% | 100% | 100% | 75% | 96% | 83% | 92% |
| 2 open | 100% | 100% | 100% | 92% | 75% | 100% | 79% | 92% |
| 3 family:flying | 100% | 96% | 100% | 96% | 79% | 100% | 63% | 63% |
| 4 big | 92% | 83% | 100% | 92% | 67% | 96% | 63% | 79% |
