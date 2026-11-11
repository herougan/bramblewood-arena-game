# Focused decks: Map 4 Sunken Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-feller,beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,pond-algae,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7072 games in 147 s.

- The list (16): Beaver Feller, Beaver Lumberjack, Conch Crawler, The Drowned Matriarch, Duck Paddler, Grass Snake, Kittiwake Flock, Muskrat Lodgekeeper, Planarian Splitter, Platypus Spur, Pond Algae, River Mink, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (9 copies at 1 Lumber, average 0.5); tide x13 | 80% (75%-85%) | 0.45 | 0: 11, 1: 9 | 4x Conch Crawler, 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Shoal Shark, 3x Beaver Lumberjack, 1x Muskrat Lodgekeeper | 12 |
| 2 | family:guard | big (8 copies at 1 Lumber, average 0.4); tide x12; guard x8 | 76% (71%-81%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Kittiwake Flock, 4x Muskrat Lodgekeeper, 4x River Mink, 3x Duck Paddler, 1x Beaver Feller | 12 |
| 3 | big | big (12 copies at 1 Lumber, average 0.6); economy (4 resource makers); tide x8 | 72% (66%-78%) | 0.6 | 0: 8, 1: 12 | 4x Beaver Feller, 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Planarian Splitter, 4x Snapstick Turtle | 12 |
| 4 | open | big (8 copies at 1 Lumber, average 0.4); economy (4 resource makers); tide x12 | 68% (62%-74%) | 0.4 | 0: 12, 1: 8 | 4x Beaver Feller, 4x Conch Crawler, 4x Duck Paddler, 4x Shoal Shark, 4x Snapstick Turtle | 0 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 75% | 100% | 100% | 63% | 58% | 100% | 79% | 67% |
| 2 family:guard | 83% | 96% | 100% | 58% | 63% | 96% | 33% | 79% |
| 3 big | 75% | 79% | 100% | 54% | 58% | 96% | 42% | 71% |
| 4 open | 71% | 79% | 92% | 50% | 46% | 100% | 38% | 71% |
