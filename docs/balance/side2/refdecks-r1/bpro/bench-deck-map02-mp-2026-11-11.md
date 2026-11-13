# Focused decks: Map 2 Lilypad Reach (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool beaver-lumberjack,dam-keeper-beaver,duck-paddler,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,pond-algae,raft-spider,riverworks-bastion,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:guard,family:tide,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7100 games in 242 s.

- The list (12): Beaver Lumberjack, Dam-Keeper Beaver, Duck Paddler, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Pond Algae, Raft Spider, Riverworks Bastion, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | big (12 copies at 1+ Lumber, average 0.6); guard x8; tide x8 | 83% (79%-86%) | 0.6 | 0: 8, 1: 12 | 4x Beaver Lumberjack, 4x Dam-Keeper Beaver, 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer, 4x Raft Spider | 12 |
| 2 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x8 | 80% (76%-84%) | 0.4 | 0: 12, 1: 8 | 4x Duck Paddler, 4x Muskrat Reedgatherer, 4x Raft Spider, 4x Snapstick Turtle, 4x Water Shrew | 12 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.6) | 80% (77%-83%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Beaver Lumberjack, 4x Duck Paddler, 4x Lodge Engineer, 4x The Old Shell, 4x Water Shrew | 12 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.6) | 51% (46%-57%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Beaver Lumberjack, 4x Duck Paddler, 4x Pond Algae, 4x Raft Spider, 4x Riverworks Bastion | 0 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 92% | 96% | 100% | 75% | 100% | 92% | 100% | 100% | 46% | 25% |
| 2 family:tide | 92% | 92% | 88% | 79% | 96% | 92% | 96% | 83% | 54% | 29% |
| 3 big | 92% | 96% | 83% | 96% | 100% | 100% | 96% | 88% | 50% | 0% |
| 4 open | 63% | 71% | 58% | 42% | 83% | 63% | 58% | 58% | 17% | 0% |
