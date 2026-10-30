# Focused decks: Map 2 Lilypad Reach (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool bee-forager,box-turtle,conch-crawler,dam-keeper-beaver,diving-bell-spider,driftwood-crab,duck-paddler,duckling,fiddler-crab-swarm,fleetfootd,gannet-nestweaver,grey-seal-bull,lodge-engineer,moat-snapper,muskrat-lodgekeeper,muskrat-reedgatherer,nutria-reedcutter,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,river-mink,riverworks-bastion,signal-crayfish,snapstick-turtle,tidepool-trapper-crab,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor box-turtle,duckling,fiddler-crab-swarm,grey-seal-bull,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,riverworks-bastion,snapstick-turtle,tidepool-trapper-crab,water-shrew,water-vole --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13140 games in 273 s.

- The list (28): Bee Forager, Box Turtle, Conch Crawler, Dam-Keeper Beaver, Diving Bell Spider, Driftwood Crab, Duck Paddler, Duckling, Fiddler Crab Swarm, Fleetfoot'd, Gannet Nestweaver, Grey Seal Bull, Lodge Engineer, Moat Snapper, Muskrat Lodgekeeper, Muskrat Reedgatherer, Nutria Reedcutter, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, River Mink, Riverworks Bastion, Signal Crayfish, Snapstick Turtle, Tidepool Trapper Crab, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); tide x12; guard x8 | 84% (79%-88%) | 0.6 | 0: 8, 1: 12 | 4x Box Turtle, 4x Gannet Nestweaver, 4x Grey Seal Bull, 4x Muskrat Lodgekeeper, 2x Diving Bell Spider, 2x River Mink | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); tide x13 | 83% (78%-87%) | 0.3 | 0: 14, 1: 6 | 4x Box Turtle, 4x Water Vole, 3x Grey Seal Bull, 3x Pyrenean Desman, 3x River Mink, 3x Tidepool Trapper Crab | 11 |
| 3 | economy | economy (8 resource makers); tide x12 | 81% (77%-86%) | 0.6 | 0: 10, 1: 8, 2: 2 | 4x Diving Bell Spider, 4x Fiddler Crab Swarm, 4x Muskrat Lodgekeeper, 3x Driftwood Crab, 3x Nutria Reedcutter, 2x Lodge Engineer | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.9); economy (8 resource makers) | 66% (60%-71%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Box Turtle, 4x Lodge Engineer, 4x Moat Snapper, 4x Muskrat Reedgatherer, 2x Diving Bell Spider, 2x Fleetfoot'd | 14 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 75% | 75% | 83% | 79% | 100% | 92% | 96% | 63% | 88% |
| 2 swarm | 92% | 83% | 71% | 79% | 88% | 88% | 100% | 96% | 42% | 88% |
| 3 economy | 71% | 67% | 71% | 83% | 83% | 100% | 92% | 92% | 67% | 88% |
| 4 big | 63% | 50% | 50% | 67% | 79% | 88% | 83% | 75% | 33% | 71% |
