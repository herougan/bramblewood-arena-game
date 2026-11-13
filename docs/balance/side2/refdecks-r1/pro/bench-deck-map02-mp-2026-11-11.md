# Focused decks: Map 2 Lilypad Reach (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,beaver-lumberjack,bee-forager,conch-crawler,dam-keeper-beaver,driftwood-crab,duck-paddler,fleetfootd,gannet-nestweaver,grass-snake,lodge-engineer,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-shell,platypus-spur,pond-algae,pyrenean-desman,raft-spider,river-mink,riverworks-bastion,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:guard,big,open --anchor beaver-lumberjack,dam-keeper-beaver,duck-paddler,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,pond-algae,raft-spider,riverworks-bastion,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9240 games in 441 s.

- The list (24): Alley Cat, Beaver Lumberjack, Bee Forager, Conch Crawler, Dam-Keeper Beaver, Driftwood Crab, Duck Paddler, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Lodge Engineer, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, The Old Shell, Platypus Spur, Pond Algae, Pyrenean Desman, Raft Spider, River Mink, Riverworks Bastion, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | big (13 copies at 1+ Lumber, average 0.7); guard x9; armor x7 | 85% (81%-89%) | 0.65 | 0: 7, 1: 13 | 4x Beaver Lumberjack, 4x The Old Shell, 4x Platypus Spur, 3x Alley Cat, 3x Driftwood Crab, 2x Dam-Keeper Beaver | 17 |
| 2 | big | big (11 copies at 1+ Lumber, average 0.6); economy (8 resource makers); armor x8; guard x8 | 85% (81%-88%) | 0.55 | 0: 9, 1: 11 | 4x Driftwood Crab, 4x Gannet Nestweaver, 4x The Old Shell, 3x Raft Spider, 3x Water Shrew, 2x Fleetfoot'd | 15 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); guard x10; tide x9 | 84% (80%-88%) | 0.45 | 0: 11, 1: 9 | 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer, 4x Newt Doctor, 3x Conch Crawler, 3x Driftwood Crab, 2x Raft Spider | 0 |
| 4 | family:tide | big (10 copies at 1+ Lumber, average 0.5); tide x14; guard x10 | 78% (74%-81%) | 0.5 | 0: 10, 1: 10 | 4x Conch Crawler, 4x Dam-Keeper Beaver, 4x Pyrenean Desman, 4x Snapstick Turtle, 2x Alley Cat, 2x Muskrat Lodgekeeper | 15 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 100% | 96% | 92% | 96% | 100% | 92% | 96% | 92% | 38% | 50% |
| 2 big | 92% | 100% | 96% | 96% | 100% | 92% | 100% | 92% | 50% | 29% |
| 3 open | 100% | 88% | 92% | 88% | 100% | 88% | 100% | 92% | 46% | 50% |
| 4 family:tide | 100% | 92% | 96% | 71% | 100% | 96% | 100% | 88% | 17% | 17% |
