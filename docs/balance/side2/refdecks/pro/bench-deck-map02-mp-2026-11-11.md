# Focused decks: Map 2 Lilypad Reach (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,beaver-lumberjack,bee-forager,conch-crawler,driftwood-crab,duck-paddler,fleetfootd,gannet-nestweaver,grass-snake,lodge-engineer,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-shell,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,raft-spider,river-mink,riverworks-bastion,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:guard,open --anchor beaver-lumberjack,duck-paddler,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,pond-algae,raft-spider,riverworks-bastion,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8920 games in 269 s.

- The list (24): Alley Cat, Beaver Lumberjack, Bee Forager, Conch Crawler, Driftwood Crab, Duck Paddler, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Lodge Engineer, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Raft Spider, River Mink, Riverworks Bastion, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (10 copies at 1+ Lumber, average 0.7); economy (6 resource makers); tide x6 | 86% (83%-89%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Driftwood Crab, 4x Duck Paddler, 4x Lodge Engineer, 4x Pyrenean Desman, 2x Gannet Nestweaver, 2x Snapstick Turtle | 20 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); tide x11 | 86% (83%-89%) | 0.4 | 0: 12, 1: 8 | 4x Mudpuppy, 4x Muskrat Lodgekeeper, 4x Raft Spider, 3x Beaver Lumberjack, 3x Fleetfoot'd, 2x Bee Forager | 0 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); tide x8 | 85% (81%-89%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Alley Cat, 4x Lodge Engineer, 4x Water Shrew, 3x Conch Crawler, 3x Pyrenean Desman, 2x Raft Spider | 18 |
| 4 | family:guard | swarm (14 copies at 0 Lumber); armor x8; guard x8 | 84% (80%-88%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Beaver Lumberjack, 4x Conch Crawler, 4x The Old Shell, 2x Muskrat Reedgatherer, 2x Platypus Spur | 17 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 100% | 100% | 100% | 100% | 100% | 96% | 42% | 33% |
| 2 open | 96% | 100% | 96% | 100% | 96% | 100% | 100% | 96% | 33% | 42% |
| 3 family:tide | 100% | 92% | 92% | 100% | 88% | 92% | 100% | 88% | 54% | 46% |
| 4 family:guard | 96% | 83% | 100% | 100% | 100% | 88% | 100% | 88% | 46% | 38% |
