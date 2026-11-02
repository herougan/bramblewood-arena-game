# Focused decks: Map 4 Sunken Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,box-turtle,drowned-matriarch,duck-paddler,field-vole,fire-ant-raft,lions-mane-jelly,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,slow-worm,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7072 games in 107 s.

- The list (18): Beaver Lumberjack, Box Turtle, The Drowned Matriarch, Duck Paddler, Field Vole, Fire Ant Raft, Lion's Mane Jelly, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Slow-worm, Snapstick Turtle, Stone Turtle Warden, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); tide x12 | 93% (89%-96%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 4x Snapstick Turtle, 2x Box Turtle, 2x Duck Paddler | 0 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); tide x16 | 88% (83%-92%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Fire Ant Raft, 4x Pyrenean Desman, 4x Water Vole, 2x Duck Paddler, 2x Slow-worm | 10 |
| 3 | swarm | swarm (15 copies at 0 Lumber); tide x12 | 88% (83%-92%) | 0.25 | 0: 15, 1: 5 | 4x Box Turtle, 4x Field Vole, 4x Pyrenean Desman, 3x Muskrat Lodgekeeper, 3x Water Vole, 2x The Drowned Matriarch | 12 |
| 4 | economy | economy (6 resource makers); tide x8 | 65% (59%-72%) | 0.35 | 0: 13, 1: 7 | 4x Beaver Lumberjack, 4x The Drowned Matriarch, 4x Water Vole, 3x Field Vole, 3x Platypus Spur, 2x Muskrat Reedgatherer | 14 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 92% | 92% | 96% | 96% | 100% | 88% | 96% |
| 2 big | 63% | 96% | 92% | 96% | 83% | 100% | 88% | 83% |
| 3 swarm | 63% | 100% | 79% | 96% | 96% | 100% | 79% | 88% |
| 4 economy | 54% | 63% | 71% | 71% | 54% | 92% | 50% | 67% |
