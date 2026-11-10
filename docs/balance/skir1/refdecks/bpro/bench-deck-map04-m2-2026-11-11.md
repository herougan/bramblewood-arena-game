# Focused decks: Map 4 Sunken Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-feller,beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,pond-algae,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:tide,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3232 games in 515 s.

- The list (17): Beaver Feller, Beaver Lumberjack, Conch Crawler, The Drowned Matriarch, Duck Paddler, Grass Snake, Kittiwake Flock, Muskrat Lodgekeeper, Planarian Splitter, Platypus Spur, Pond Algae, River Mink, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1 Lumber, average 0.4); tide x10 | 79% (73%-84%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Shoal Shark, 4x Water Shrew, 2x Pond Algae, 2x Water Vole | 10 |
| 2 | open | swarm (16 copies at 0 Lumber); tide x8 | 78% (73%-83%) | 0.2 | 0: 16, 1: 4 | 4x Conch Crawler, 4x Kittiwake Flock, 4x Planarian Splitter, 4x Water Shrew, 4x Water Vole | 0 |
| 3 | family:tide | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers); tide x12 | 76% (71%-81%) | 0.4 | 0: 12, 1: 8 | 4x Beaver Feller, 4x Beaver Lumberjack, 4x Conch Crawler, 4x The Drowned Matriarch, 4x Snapstick Turtle | 16 |
| 4 | family:guard | big (8 copies at 1 Lumber, average 0.4); tide x12; guard x8 | 59% (53%-65%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Muskrat Lodgekeeper, 4x Pond Algae, 4x River Mink, 4x Slow-worm | 16 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 88% | 79% | 79% | 100% | 63% | 96% | 58% | 67% |
| 2 open | 75% | 96% | 100% | 88% | 63% | 96% | 46% | 63% |
| 3 family:tide | 67% | 88% | 88% | 100% | 67% | 100% | 42% | 58% |
| 4 family:guard | 42% | 63% | 88% | 88% | 42% | 83% | 29% | 38% |
