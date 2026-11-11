# Focused decks: Map 5 Gatorback Swamp (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bee-forager,bog-leech,box-turtle,conch-crawler,constrictor-coil,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-snake,marsh-mallow-hare,meadow-frog,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,old-sturgeon,otter-centurion,peat-cutter-vole,planarian-splitter,platypus-spur,pyrenean-desman,raft-spider,river-mink,shoal-shark,snapstick-turtle,swamp-alligator,tunnel-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,bog-leech,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,peat-cutter-vole,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9180 games in 149 s.

- The list (30): Alley Cat, Bee Forager, Bog Leech, Box Turtle, Conch Crawler, Constrictor Coil, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Marsh-mallow Hare, Meadow Frog, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Old Sturgeon, Otter Centurion, Peat-cutter Vole, Planarian Splitter, Platypus Spur, Pyrenean Desman, Raft Spider, River Mink, Shoal Shark, Snapstick Turtle, Swamp Alligator, Tunnel Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers); tide x8 | 92% (89%-95%) | 0.55 | 0: 9, 1: 11 | 4x Driftwood Crab, 4x Pyrenean Desman, 4x Shoal Shark, 3x Bog Leech, 3x Planarian Splitter, 2x Mosquito Cloud | 17 |
| 2 | open | swarm (16 copies at 0 Lumber) | 87% (83%-91%) | 0.2 | 0: 16, 1: 4 | 4x Box Turtle, 4x Conch Crawler, 4x Peat-cutter Vole, 4x Planarian Splitter, 2x Alley Cat, 2x Newt Doctor | 0 |
| 3 | family:armor | economy (4 resource makers); bleed x10; armor x10 | 79% (74%-84%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x Bog Leech, 4x Driftwood Crab, 3x Box Turtle, 3x Conch Crawler, 3x Mosquito Cloud, 3x Old Snapjaw | 14 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4) | 78% (74%-83%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Box Turtle, 4x Fire Ant Raft, 4x Grass Snake, 2x Otter Centurion, 2x Peat-cutter Vole | 12 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 96% | 96% | 92% | 100% | 75% | 100% | 83% | 79% |
| 2 open | 100% | 100% | 88% | 75% | 83% | 92% | 71% | 92% | 79% | 92% |
| 3 family:armor | 83% | 96% | 79% | 71% | 92% | 75% | 58% | 96% | 83% | 58% |
| 4 big | 100% | 96% | 71% | 67% | 92% | 79% | 50% | 100% | 58% | 71% |
