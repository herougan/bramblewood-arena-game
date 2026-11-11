# Focused decks: Map 4 Sunken Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool alley-cat,beaver-feller,beaver-lumberjack,bee-forager,bramble-sprout,conch-crawler,driftwood-crab,drowned-matriarch,duck-paddler,fleetfootd,gannet-nestweaver,grass-snake,kittiwake-flock,meadow-frog,muskrat-lodgekeeper,pincushion-urchin,planarian-splitter,platypus-spur,pond-algae,pond-duck,puffin-diver,river-carp,river-mink,rock-pool-starfish,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:flying,open --anchor beaver-feller,beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,pond-algae,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9152 games in 187 s.

- The list (28): Alley Cat, Beaver Feller, Beaver Lumberjack, Bee Forager, Bramble Sprout, Conch Crawler, Driftwood Crab, The Drowned Matriarch, Duck Paddler, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Kittiwake Flock, Meadow Frog, Muskrat Lodgekeeper, Pincushion Urchin, Planarian Splitter, Platypus Spur, Pond Algae, Pond Duck, Puffin Diver, River Carp, River Mink, Rock Pool Starfish, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x13; cleave x7 | 90% (86%-94%) | 0.2 | 0: 16, 1: 4 | 4x The Drowned Matriarch, 4x Duck Paddler, 4x Rock Pool Starfish, 3x Alley Cat, 3x Fleetfoot'd, 2x Conch Crawler | 11 |
| 2 | family:flying | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x8; flying x8 | 88% (83%-92%) | 0.2 | 0: 16, 1: 4 | 4x Duck Paddler, 4x Gannet Nestweaver, 4x Kittiwake Flock, 4x Pincushion Urchin, 4x Snapstick Turtle | 18 |
| 3 | open | big (8 copies at 1 Lumber, average 0.4); economy (6 resource makers); tide x10; armor x8 | 78% (73%-83%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Conch Crawler, 4x Driftwood Crab, 4x The Drowned Matriarch, 2x Beaver Feller, 2x Pincushion Urchin | 0 |
| 4 | economy | big (8 copies at 1 Lumber, average 0.4); economy (6 resource makers); flying x8 | 75% (69%-81%) | 0.4 | 0: 12, 1: 8 | 4x Gannet Nestweaver, 4x Kittiwake Flock, 4x Shoal Shark, 4x Slow-worm, 2x Driftwood Crab, 2x Grass Snake | 18 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 100% | 92% | 83% | 100% | 71% | 75% |
| 2 family:flying | 83% | 100% | 100% | 92% | 71% | 100% | 75% | 79% |
| 3 open | 67% | 100% | 100% | 63% | 54% | 100% | 54% | 88% |
| 4 economy | 71% | 96% | 100% | 58% | 67% | 88% | 54% | 67% |
