# Focused decks: Map 2 Lilypad Reach (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool box-turtle,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7060 games in 213 s.

- The list (10): Box Turtle, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x8 | 74% (70%-78%) | 0.4 | 0: 12, 1: 8 | 4x Box Turtle, 4x Muskrat Reedgatherer, 4x Old Sturgeon, 4x Snapstick Turtle, 4x Water Shrew | 14 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4) | 74% (70%-79%) | 0.4 | 0: 12, 1: 8 | 4x Box Turtle, 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer, 4x Platypus Spur, 4x Pond Algae | 10 |
| 3 | family:armor | big (15 copies at 1+ Lumber, average 0.9); armor x8 | 67% (62%-72%) | 0.9 | 0: 5, 1: 12, 2: 3 | 4x Muskrat Reedgatherer, 4x The Old Shell, 4x Old Sturgeon, 4x Platypus Spur, 3x Lodge Engineer, 1x Water Shrew | 11 |
| 4 | open | big (18 copies at 1+ Lumber, average 1.1); tide x8; guard x6 | 54% (49%-60%) | 1.1 | 0: 2, 1: 14, 2: 4 | 4x Lodge Engineer, 4x Muskrat Lodgekeeper, 4x Platypus Spur, 4x Snapstick Turtle, 2x Box Turtle, 2x The Old Shell | 0 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 83% | 96% | 71% | 96% | 100% | 92% | 92% | 83% | 21% | 8% |
| 2 big | 88% | 92% | 92% | 71% | 96% | 96% | 88% | 71% | 8% | 42% |
| 3 family:armor | 75% | 71% | 75% | 92% | 96% | 83% | 79% | 63% | 29% | 8% |
| 4 open | 54% | 79% | 71% | 46% | 83% | 79% | 67% | 46% | 4% | 13% |
