# Focused decks: Map 2 Lilypad Reach (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,bee-forager,box-turtle,conch-crawler,dam-keeper-beaver,driftwood-crab,duckling,fire-ant-raft,fleetfootd,gannet-nestweaver,grass-snake,lodge-engineer,lotus-frog,mayfly-dancer,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-shell,old-sturgeon,platypus-spur,pond-algae,pond-duck,pyrenean-desman,river-carp,river-mink,snapstick-turtle,victoria-regia,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:guard,big,open --anchor box-turtle,dam-keeper-beaver,duckling,lodge-engineer,lotus-frog,mayfly-dancer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,pond-duck,pyrenean-desman,river-carp,snapstick-turtle,victoria-regia,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2600 games in 1128 s.

- The list (30): Alley Cat, Bee Forager, Box Turtle, Conch Crawler, Dam-Keeper Beaver, Driftwood Crab, Duckling, Fire Ant Raft, Fleetfoot'd, Gannet Nestweaver, Grass Snake, Lodge Engineer, Lotus Frog, Mayfly Dancer, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pond Duck, Pyrenean Desman, River Carp, River Mink, Snapstick Turtle, Victoria Regia, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x12; poison x8 | 89% (86%-93%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Platypus Spur, 4x Pyrenean Desman | 16 |
| 2 | family:guard | big (8 copies at 1+ Lumber, average 0.4); guard x8 | 78% (75%-82%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Box Turtle, 4x Dam-Keeper Beaver, 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer | 18 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.7); economy (4 resource makers); tide x6 | 71% (67%-76%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Driftwood Crab, 4x Mayfly Dancer, 3x Box Turtle, 3x Fire Ant Raft, 3x Fleetfoot'd, 3x Lodge Engineer | 20 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4); tide x8 | 71% (67%-76%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Duckling, 4x Snapstick Turtle, 4x Victoria Regia, 2x Alley Cat, 2x Pond Duck | 0 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 71% | 100% | 100% | 96% | 100% | 67% | 58% |
| 2 family:guard | 96% | 100% | 100% | 54% | 100% | 92% | 100% | 88% | 29% | 25% |
| 3 big | 88% | 75% | 96% | 54% | 88% | 88% | 96% | 88% | 25% | 17% |
| 4 open | 79% | 83% | 96% | 42% | 88% | 83% | 96% | 88% | 42% | 17% |
