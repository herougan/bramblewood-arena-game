# Focused decks: Map 5 Gatorback Swamp (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bee-forager,bog-leech,box-turtle,caiman-hatchling,conch-crawler,constrictor-coil,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-snake,marsh-mallow-hare,meadow-frog,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,old-sturgeon,otter-centurion,peat-cutter-vole,planarian-splitter,platypus-spur,pyrenean-desman,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator,tunnel-ant,water-vole --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,bog-leech,caiman-hatchling,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,peat-cutter-vole,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2720 games in 549 s.

- The list (31): Alley Cat, Bee Forager, Bog Leech, Box Turtle, Caiman Hatchling, Conch Crawler, Constrictor Coil, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Marsh-mallow Hare, Meadow Frog, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Old Sturgeon, Otter Centurion, Peat-cutter Vole, Planarian Splitter, Platypus Spur, Pyrenean Desman, Raft Spider, Shoal Shark, Snapstick Turtle, Swamp Alligator, Tunnel Ant, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 83% (79%-88%) | 0.6 | 0: 8, 1: 12 | 4x Caiman Hatchling, 4x Driftwood Crab, 4x Peat-cutter Vole, 4x Planarian Splitter, 4x Raft Spider | 20 |
| 2 | family:tide | swarm (17 copies at 0 Lumber); tide x8; bleed x7 | 77% (72%-82%) | 0.15 | 0: 17, 1: 3 | 4x Bog Leech, 4x Pyrenean Desman, 4x Water Vole, 3x Alley Cat, 3x Planarian Splitter, 2x Box Turtle | 19 |
| 3 | family:armor | swarm (14 copies at 0 Lumber); bleed x10; armor x10 | 71% (66%-76%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Bog Leech, 4x Conch Crawler, 3x Alley Cat, 3x Box Turtle, 3x Driftwood Crab, 3x Old Snapjaw | 19 |
| 4 | open | swarm (16 copies at 0 Lumber); tide x8; heal x8 | 66% (60%-71%) | 0.2 | 0: 16, 1: 4 | 4x Meadow Frog, 4x Mudpuppy, 4x Newt Doctor, 4x Shoal Shark, 3x Otter Centurion, 1x Box Turtle | 0 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 92% | 71% | 92% | 71% | 92% | 58% | 92% | 96% | 79% | 92% |
| 2 family:tide | 83% | 63% | 88% | 63% | 100% | 42% | 83% | 88% | 83% | 75% |
| 3 family:armor | 88% | 58% | 88% | 58% | 83% | 33% | 67% | 100% | 75% | 58% |
| 4 open | 67% | 38% | 79% | 38% | 88% | 46% | 83% | 92% | 54% | 75% |
