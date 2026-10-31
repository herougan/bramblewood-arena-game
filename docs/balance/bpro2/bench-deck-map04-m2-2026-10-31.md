# Focused decks: Map 4 Sunken Hollow (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,box-turtle,duckling,fire-ant-raft,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pond-trout,pyrenean-desman,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 87 s.

- The list (15): Beaver Lumberjack, Box Turtle, Duckling, Fire Ant Raft, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pond Trout, Pyrenean Desman, Snapstick Turtle, Stone Turtle Warden, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (18 copies at 0 Lumber); tide x6 | 92% (89%-96%) | 0.1 | 0: 18, 1: 2 | 4x Box Turtle, 4x Pond Algae, 4x Pond Trout, 4x Pyrenean Desman, 2x Beaver Lumberjack, 2x Snapstick Turtle | 10 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); tide x16 | 90% (85%-94%) | 0.4 | 0: 12, 1: 8 | 4x Fire Ant Raft, 4x Pyrenean Desman, 4x Snapstick Turtle, 4x Water Vole, 3x Box Turtle, 1x Duckling | 8 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); tide x12 | 82% (77%-87%) | 0.2 | 0: 16, 1: 4 | 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 4x Water Vole, 2x Beaver Lumberjack, 2x Box Turtle | 14 |
| 4 | open | swarm (16 copies at 0 Lumber); tide x8 | 78% (72%-83%) | 0.2 | 0: 16, 1: 4 | 4x Box Turtle, 4x Duckling, 4x Pond Trout, 4x Snapstick Turtle, 4x Water Vole | 0 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 96% | 100% | 92% | 96% | 67% | 92% |
| 2 big | 92% | 83% | 92% | 96% | 79% | 100% | 79% | 96% |
| 3 economy | 79% | 92% | 83% | 83% | 71% | 92% | 58% | 96% |
| 4 open | 79% | 63% | 83% | 83% | 58% | 100% | 71% | 83% |
