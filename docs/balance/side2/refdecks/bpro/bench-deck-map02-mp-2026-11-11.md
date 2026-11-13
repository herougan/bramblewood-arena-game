# Focused decks: Map 2 Lilypad Reach (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool beaver-lumberjack,duck-paddler,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,pond-algae,raft-spider,riverworks-bastion,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6940 games in 231 s.

- The list (12): Beaver Lumberjack, Duck Paddler, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Old Sturgeon, Pond Algae, Raft Spider, Riverworks Bastion, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (9 copies at 1+ Lumber, average 0.5); tide x9 | 85% (82%-88%) | 0.45 | 0: 11, 1: 9 | 4x Muskrat Reedgatherer, 4x Raft Spider, 4x Snapstick Turtle, 4x Water Shrew, 3x Beaver Lumberjack, 1x Muskrat Lodgekeeper | 13 |
| 2 | family:guard | big (11 copies at 1+ Lumber, average 0.6); guard x8; tide x7 | 84% (80%-87%) | 0.55 | 0: 9, 1: 11 | 4x Beaver Lumberjack, 4x Duck Paddler, 4x Muskrat Lodgekeeper, 4x The Old Shell, 3x Raft Spider, 1x Water Shrew | 12 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.7); tide x6 | 79% (75%-83%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Beaver Lumberjack, 4x Duck Paddler, 4x Lodge Engineer, 3x Old Sturgeon, 3x Snapstick Turtle, 2x Muskrat Reedgatherer | 10 |
| 4 | open | big (12 copies at 1+ Lumber, average 1.0); guard x8 | 70% (66%-75%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Beaver Lumberjack, 4x Lodge Engineer, 4x Muskrat Reedgatherer, 4x The Old Shell, 4x Riverworks Bastion | 0 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 96% | 100% | 100% | 96% | 96% | 96% | 42% | 29% |
| 2 family:guard | 96% | 83% | 96% | 100% | 100% | 100% | 100% | 92% | 50% | 21% |
| 3 big | 88% | 96% | 96% | 100% | 96% | 79% | 96% | 88% | 29% | 25% |
| 4 open | 92% | 88% | 79% | 100% | 75% | 83% | 88% | 63% | 29% | 8% |
