# Focused decks: Map 4 Sunken Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,conch-crawler,drowned-matriarch,duck-paddler,grass-snake,kittiwake-flock,muskrat-lodgekeeper,planarian-splitter,platypus-spur,river-mink,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 136 s.

- The list (14): Beaver Lumberjack, Conch Crawler, The Drowned Matriarch, Duck Paddler, Grass Snake, Kittiwake Flock, Muskrat Lodgekeeper, Planarian Splitter, Platypus Spur, River Mink, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1 Lumber, average 0.4); tide x8 | 82% (77%-87%) | 0.4 | 0: 12, 1: 8 | 4x Duck Paddler, 4x Kittiwake Flock, 4x Shoal Shark, 4x Water Shrew, 3x The Drowned Matriarch, 1x Muskrat Lodgekeeper | 11 |
| 2 | family:guard | big (9 copies at 1 Lumber, average 0.5); tide x13; guard x8 | 82% (77%-87%) | 0.45 | 0: 11, 1: 9 | 4x Conch Crawler, 4x The Drowned Matriarch, 4x Kittiwake Flock, 4x Muskrat Lodgekeeper, 3x Beaver Lumberjack, 1x Shoal Shark | 12 |
| 3 | big | big (12 copies at 1 Lumber, average 0.6); tide x8 | 76% (71%-81%) | 0.6 | 0: 8, 1: 12 | 4x Beaver Lumberjack, 4x The Drowned Matriarch, 4x Duck Paddler, 4x Grass Snake, 4x River Mink | 19 |
| 4 | open | big (12 copies at 1 Lumber, average 0.6); tide x7 | 76% (70%-81%) | 0.6 | 0: 8, 1: 12 | 4x Kittiwake Flock, 4x Planarian Splitter, 4x Platypus Spur, 4x Shoal Shark, 3x Conch Crawler, 1x Duck Paddler | 0 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 92% | 96% | 92% | 58% | 92% | 54% | 79% |
| 2 family:guard | 88% | 92% | 100% | 83% | 63% | 100% | 63% | 71% |
| 3 big | 83% | 96% | 96% | 75% | 54% | 100% | 29% | 75% |
| 4 open | 88% | 92% | 92% | 75% | 46% | 92% | 54% | 67% |
