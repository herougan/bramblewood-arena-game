# Focused decks: Map 2 Lilypad Reach (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,bee-forager,box-turtle,conch-crawler,driftwood-crab,duck-paddler,fire-ant-raft,fleetfootd,gannet-nestweaver,guppy,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,nutria-reedcutter,old-shell,old-sturgeon,platypus-spur,pond-algae,pond-trout,pyrenean-desman,river-carp,riverworks-bastion,snapstick-turtle,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:armor,big,open --anchor alley-cat,box-turtle,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,riverworks-bastion,snapstick-turtle,water-shrew,water-vole --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7240 games in 221 s.

- The list (25): Alley Cat, Bee Forager, Box Turtle, Conch Crawler, Driftwood Crab, Duck Paddler, Fire Ant Raft, Fleetfoot'd, Gannet Nestweaver, Guppy, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, Nutria Reedcutter, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pond Trout, Pyrenean Desman, River Carp, Riverworks Bastion, Snapstick Turtle, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | tide x8 | 87% (84%-90%) | 0.4 | 0: 12, 1: 8 | 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Snapstick Turtle, 3x Duck Paddler, 3x Gannet Nestweaver, 2x Box Turtle | 0 |
| 2 | family:tide | swarm (16 copies at 0 Lumber); tide x11 | 80% (77%-83%) | 0.2 | 0: 16, 1: 4 | 4x Fleetfoot'd, 4x Platypus Spur, 4x Water Vole, 3x Conch Crawler, 3x Gannet Nestweaver, 2x Box Turtle | 15 |
| 3 | family:armor | swarm (14 copies at 0 Lumber); tide x16; armor x8 | 79% (77%-81%) | 0.3 | 0: 14, 1: 6 | 4x Conch Crawler, 4x Nutria Reedcutter, 4x Old Sturgeon, 4x Pyrenean Desman, 2x Fleetfoot'd, 2x Muskrat Lodgekeeper | 20 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0) | 65% (60%-69%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Lodge Engineer, 4x Riverworks Bastion, 4x Water Shrew, 3x River Carp, 3x Water Vole, 2x Gannet Nestweaver | 18 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 38% | 38% |
| 2 family:tide | 100% | 100% | 88% | 100% | 96% | 100% | 96% | 88% | 8% | 21% |
| 3 family:armor | 96% | 100% | 96% | 100% | 96% | 96% | 100% | 96% | 0% | 13% |
| 4 big | 63% | 92% | 83% | 100% | 83% | 79% | 96% | 50% | 0% | 0% |
