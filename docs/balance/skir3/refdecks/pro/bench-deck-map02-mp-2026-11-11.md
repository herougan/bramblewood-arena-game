# Focused decks: Map 2 Lilypad Reach (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,bee-forager,box-turtle,conch-crawler,driftwood-crab,fire-ant-raft,fleetfootd,gannet-nestweaver,grass-snake,lodge-engineer,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-shell,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,river-mink,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor box-turtle,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9060 games in 255 s.

- The list (22): Alley Cat, Bee Forager, Box Turtle, Conch Crawler, Driftwood Crab, Fire Ant Raft, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Lodge Engineer, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, River Mink, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (11 copies at 1+ Lumber, average 0.6); poison x8 | 93% (89%-96%) | 0.55 | 0: 9, 1: 11 | 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Platypus Spur, 3x Alley Cat, 3x Driftwood Crab, 2x Box Turtle | 10 |
| 2 | open | big (10 copies at 1+ Lumber, average 0.7) | 90% (86%-93%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Fire Ant Raft, 4x Lodge Engineer, 4x Mudpuppy, 4x Muskrat Reedgatherer, 2x Alley Cat, 2x The Old Shell | 0 |
| 3 | family:tide | tide x10 | 83% (80%-87%) | 0.35 | 0: 13, 1: 7 | 4x Box Turtle, 4x Muskrat Lodgekeeper, 3x Alley Cat, 3x Gannet Nestweaver, 3x Old Sturgeon, 3x Pyrenean Desman | 18 |
| 4 | family:armor | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); armor x11; guard x11 | 78% (74%-81%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x The Old Shell, 3x Box Turtle, 3x Conch Crawler, 3x Newt Doctor, 3x Water Shrew | 18 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 96% | 83% | 100% | 100% | 92% | 100% | 75% | 79% |
| 2 open | 92% | 100% | 88% | 88% | 100% | 100% | 92% | 92% | 88% | 58% |
| 3 family:tide | 100% | 96% | 96% | 100% | 100% | 96% | 100% | 88% | 25% | 33% |
| 4 family:armor | 96% | 92% | 79% | 96% | 96% | 96% | 92% | 83% | 33% | 13% |
