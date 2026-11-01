# Focused decks: Map 4 Sunken Hollow (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,box-turtle,drowned-matriarch,duck-paddler,field-vole,fire-ant-raft,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,slow-worm,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7392 games in 100 s.

- The list (17): Beaver Lumberjack, Box Turtle, The Drowned Matriarch, Duck Paddler, Field Vole, Fire Ant Raft, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Slow-worm, Snapstick Turtle, Stone Turtle Warden, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); tide x8 | 90% (85%-94%) | 0.2 | 0: 16, 1: 4 | 4x The Drowned Matriarch, 4x Pond Algae, 4x Pyrenean Desman, 4x Water Shrew, 2x Box Turtle, 2x Slow-worm | 0 |
| 2 | swarm | swarm (15 copies at 0 Lumber); tide x9 | 89% (84%-93%) | 0.25 | 0: 15, 1: 5 | 4x Duck Paddler, 4x Fire Ant Raft, 4x Pond Algae, 4x Pyrenean Desman, 3x Box Turtle, 1x The Drowned Matriarch | 9 |
| 3 | economy | economy (7 resource makers); tide x11 | 83% (78%-88%) | 0.35 | 0: 13, 1: 7 | 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 3x Beaver Lumberjack, 3x Muskrat Lodgekeeper, 2x Box Turtle | 14 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4); tide x12 | 80% (74%-85%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Duck Paddler, 4x Snapstick Turtle, 4x Water Vole, 3x Slow-worm, 1x Muskrat Reedgatherer | 14 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 92% | 96% | 88% | 96% | 71% | 88% |
| 2 swarm | 88% | 100% | 88% | 96% | 75% | 100% | 75% | 88% |
| 3 economy | 96% | 88% | 96% | 92% | 71% | 92% | 46% | 83% |
| 4 big | 83% | 83% | 75% | 83% | 63% | 100% | 71% | 79% |
