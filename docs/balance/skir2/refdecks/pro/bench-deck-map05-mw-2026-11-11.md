# Focused decks: Map 5 Gatorback Swamp (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bee-forager,bog-leech,box-turtle,caiman-hatchling,conch-crawler,constrictor-coil,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-snake,marsh-mallow-hare,meadow-frog,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,old-sturgeon,otter-centurion,peat-cutter-vole,planarian-splitter,platypus-spur,pyrenean-desman,raft-spider,shoal-shark,snapstick-turtle,sphagnum-vole,swamp-alligator,tunnel-ant,water-vole --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,bog-leech,caiman-hatchling,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,peat-cutter-vole,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,sphagnum-vole,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9140 games in 105 s.

- The list (32): Alley Cat, Bee Forager, Bog Leech, Box Turtle, Caiman Hatchling, Conch Crawler, Constrictor Coil, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Marsh-mallow Hare, Meadow Frog, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Old Sturgeon, Otter Centurion, Peat-cutter Vole, Planarian Splitter, Platypus Spur, Pyrenean Desman, Raft Spider, Shoal Shark, Snapstick Turtle, Sphagnum Vole, Swamp Alligator, Tunnel Ant, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); bleed x8 | 94% (91%-97%) | 0.2 | 0: 16, 1: 4 | 4x Box Turtle, 4x Caiman Hatchling, 4x Planarian Splitter, 3x Alley Cat, 3x Mosquito Cloud, 2x Bog Leech | 0 |
| 2 | big | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers); swarm x7 | 91% (88%-95%) | 0.7 | 0: 6, 1: 14 | 4x Driftwood Crab, 4x Fire Ant Raft, 3x Alley Cat, 3x Box Turtle, 3x Sphagnum Vole, 3x Tunnel Ant | 14 |
| 3 | family:tide | big (9 copies at 1+ Lumber, average 0.6); armor x9; tide x8 | 86% (82%-90%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Conch Crawler, 4x Mudpuppy, 4x Shoal Shark, 3x Box Turtle, 3x Old Snapjaw, 2x Driftwood Crab | 17 |
| 4 | family:armor | big (8 copies at 1+ Lumber, average 0.4); tide x12; armor x8 | 78% (73%-83%) | 0.4 | 0: 12, 1: 8 | 4x Caiman Hatchling, 4x Conch Crawler, 4x Old Sturgeon, 4x Shoal Shark, 2x Box Turtle, 2x Muskrat Reedgatherer | 14 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 75% | 100% | 100% | 79% | 100% | 92% | 96% |
| 2 big | 100% | 96% | 92% | 88% | 100% | 92% | 79% | 100% | 79% | 88% |
| 3 family:tide | 100% | 96% | 88% | 67% | 88% | 92% | 88% | 96% | 71% | 75% |
| 4 family:armor | 92% | 83% | 83% | 67% | 88% | 92% | 63% | 88% | 58% | 71% |
