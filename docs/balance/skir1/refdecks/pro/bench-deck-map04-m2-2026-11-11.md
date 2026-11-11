# Focused decks: Map 4 Sunken Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool alley-cat,beaver-feller,beaver-lumberjack,bee-forager,bramble-sprout,conch-crawler,driftwood-crab,drowned-matriarch,duck-paddler,fleetfootd,gannet-nestweaver,grass-snake,kittiwake-flock,meadow-frog,muskrat-lodgekeeper,pincushion-urchin,planarian-splitter,platypus-spur,pond-algae,pond-duck,puffin-diver,river-carp,river-mink,rock-pool-starfish,shoal-shark,slow-worm,snapstick-turtle,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:flying,open --anchor beaver-feller,beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,pond-algae,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew,water-vole --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2000 games in 413 s.

- The list (29): Alley Cat, Beaver Feller, Beaver Lumberjack, Bee Forager, Bramble Sprout, Conch Crawler, Driftwood Crab, The Drowned Matriarch, Duck Paddler, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Kittiwake Flock, Meadow Frog, Muskrat Lodgekeeper, Pincushion Urchin, Planarian Splitter, Platypus Spur, Pond Algae, Pond Duck, Puffin Diver, River Carp, River Mink, Rock Pool Starfish, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (18 copies at 0 Lumber); tide x13 | 82% (77%-87%) | 0.1 | 0: 18, 1: 2 | 4x Fleetfoot'd, 4x Kittiwake Flock, 4x Water Vole, 3x Bramble Sprout, 3x Rock Pool Starfish, 2x The Drowned Matriarch | 16 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); tide x8 | 80% (74%-85%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Beaver Feller, 4x Fleetfoot'd, 4x River Mink, 2x Driftwood Crab, 2x Water Shrew | 16 |
| 3 | family:flying | swarm (16 copies at 0 Lumber); tide x8; flying x8 | 76% (70%-82%) | 0.2 | 0: 16, 1: 4 | 4x Bee Forager, 4x Conch Crawler, 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Pond Algae | 14 |
| 4 | open | swarm (14 copies at 0 Lumber); flying x9; tide x6 | 71% (65%-77%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Beaver Lumberjack, 4x Kittiwake Flock, 3x Puffin Diver, 3x Shoal Shark, 2x Bee Forager | 0 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 75% | 96% | 83% | 79% | 92% | 63% | 75% |
| 2 economy | 71% | 88% | 96% | 79% | 58% | 100% | 67% | 79% |
| 3 family:flying | 79% | 83% | 96% | 58% | 79% | 83% | 54% | 75% |
| 4 open | 83% | 79% | 88% | 63% | 63% | 75% | 46% | 71% |
