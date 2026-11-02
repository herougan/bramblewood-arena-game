# Focused decks: Map 4 Sunken Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,box-turtle,drowned-matriarch,duck-paddler,field-vole,fire-ant-raft,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,slow-worm,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7152 games in 101 s.

- The list (17): Beaver Lumberjack, Box Turtle, The Drowned Matriarch, Duck Paddler, Field Vole, Fire Ant Raft, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Slow-worm, Snapstick Turtle, Stone Turtle Warden, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (18 copies at 0 Lumber); tide x10 | 93% (89%-96%) | 0.1 | 0: 18, 1: 2 | 4x Box Turtle, 4x Pond Algae, 4x Pyrenean Desman, 4x Water Vole, 2x The Drowned Matriarch, 2x Duck Paddler | 6 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); tide x14 | 87% (82%-92%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Duck Paddler, 4x Fire Ant Raft, 4x Water Vole, 2x Box Turtle, 2x Pyrenean Desman | 12 |
| 3 | open | big (8 copies at 1+ Lumber, average 0.6); tide x12 | 87% (82%-92%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Box Turtle, 4x The Drowned Matriarch, 4x Pond Algae, 4x Pyrenean Desman, 4x Stone Turtle Warden | 0 |
| 4 | economy | economy (6 resource makers); tide x11 | 86% (82%-91%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x The Drowned Matriarch, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 3x Box Turtle, 3x Stone Turtle Warden, 2x Beaver Lumberjack | 6 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 96% | 96% | 92% | 92% | 100% | 71% | 96% |
| 2 big | 96% | 83% | 88% | 96% | 88% | 100% | 67% | 79% |
| 3 open | 83% | 96% | 88% | 92% | 83% | 100% | 63% | 92% |
| 4 economy | 88% | 83% | 75% | 88% | 88% | 100% | 75% | 96% |
