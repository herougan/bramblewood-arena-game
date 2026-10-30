# Focused decks: Map 4 Sunken Hollow (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool beaver-lumberjack,bee-forager,box-turtle,bramble-sprout,conch-crawler,driftwood-crab,duck-paddler,duckling,ember-tetra,fire-ant-raft,fleetfootd,gannet-nestweaver,guppy,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pond-duck,pond-trout,pyrenean-desman,river-carp,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor beaver-lumberjack,box-turtle,duckling,fire-ant-raft,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pond-trout,pyrenean-desman,snapstick-turtle,stone-turtle-warden,water-shrew,water-vole --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13328 games in 179 s.

- The list (26): Beaver Lumberjack, Bee Forager, Box Turtle, Bramble Sprout, Conch Crawler, Driftwood Crab, Duck Paddler, Duckling, Ember Tetra, Fire Ant Raft, Fleetfoot'd, Gannet Nestweaver, Guppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pond Duck, Pond Trout, Pyrenean Desman, River Carp, Snapstick Turtle, Stone Turtle Warden, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); tide x16 | 96% (93%-98%) | 0.4 | 0: 12, 1: 8 | 4x Ember Tetra, 4x Fire Ant Raft, 4x Pyrenean Desman, 4x Snapstick Turtle, 2x Duck Paddler, 2x Muskrat Reedgatherer | 10 |
| 2 | open | swarm (14 copies at 0 Lumber); tide x14 | 93% (89%-96%) | 0.3 | 0: 14, 1: 6 | 4x Conch Crawler, 4x Ember Tetra, 4x Pond Algae, 4x Snapstick Turtle, 2x Fire Ant Raft, 2x Gannet Nestweaver | 0 |
| 3 | swarm | swarm (20 copies at 0 Lumber); economy (5 resource makers); tide x8 | 89% (84%-93%) | 0 | 0: 20 | 4x Ember Tetra, 4x Pond Trout, 4x Pyrenean Desman, 3x Bramble Sprout, 3x Gannet Nestweaver, 2x Beaver Lumberjack | 14 |
| 4 | economy | swarm (16 copies at 0 Lumber); economy (9 resource makers); tide x8 | 85% (80%-90%) | 0.2 | 0: 16, 1: 4 | 4x Ember Tetra, 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 3x Beaver Lumberjack, 3x Bramble Sprout, 2x Gannet Nestweaver | 12 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 100% | 100% | 100% | 100% | 75% | 96% |
| 2 open | 96% | 96% | 96% | 100% | 92% | 100% | 79% | 83% |
| 3 swarm | 83% | 96% | 96% | 88% | 83% | 96% | 83% | 83% |
| 4 economy | 92% | 75% | 88% | 100% | 79% | 83% | 83% | 79% |
