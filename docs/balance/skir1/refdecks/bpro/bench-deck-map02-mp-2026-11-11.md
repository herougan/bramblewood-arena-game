# Focused decks: Map 2 Lilypad Reach (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool box-turtle,dam-keeper-beaver,lodge-engineer,lotus-frog,mayfly-dancer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,pond-duck,pyrenean-desman,river-carp,snapstick-turtle,victoria-regia,water-shrew --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:tide,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2600 games in 867 s.

- The list (17): Box Turtle, Dam-Keeper Beaver, Lodge Engineer, Lotus Frog, Mayfly Dancer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pond Duck, Pyrenean Desman, River Carp, Snapstick Turtle, Victoria Regia, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x8 | 81% (78%-84%) | 0.2 | 0: 16, 1: 4 | 4x Pyrenean Desman, 4x River Carp, 4x Snapstick Turtle, 3x Box Turtle, 3x Mayfly Dancer, 2x Water Shrew | 17 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4) | 79% (75%-83%) | 0.4 | 0: 12, 1: 8 | 4x Box Turtle, 4x Lotus Frog, 4x Muskrat Reedgatherer, 4x The Old Shell, 4x Pond Duck | 0 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4) | 76% (72%-79%) | 0.4 | 0: 12, 1: 8 | 4x Box Turtle, 4x Muskrat Reedgatherer, 4x Old Sturgeon, 4x Platypus Spur, 4x River Carp | 12 |
| 4 | family:guard | big (9 copies at 1+ Lumber, average 0.5); guard x8 | 65% (61%-69%) | 0.45 | 0: 11, 1: 9 | 4x Dam-Keeper Beaver, 4x Mayfly Dancer, 4x The Old Shell, 4x Pyrenean Desman, 3x Box Turtle, 1x Old Sturgeon | 13 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 83% | 100% | 100% | 92% | 100% | 96% | 100% | 100% | 21% | 17% |
| 2 open | 75% | 100% | 100% | 100% | 100% | 75% | 92% | 92% | 33% | 25% |
| 3 big | 79% | 96% | 100% | 96% | 88% | 100% | 96% | 79% | 8% | 17% |
| 4 family:guard | 63% | 88% | 83% | 96% | 96% | 58% | 88% | 75% | 4% | 0% |
