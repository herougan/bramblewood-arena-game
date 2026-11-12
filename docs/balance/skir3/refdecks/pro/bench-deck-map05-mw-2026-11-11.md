# Focused decks: Map 5 Gatorback Swamp (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bee-forager,bog-leech,box-turtle,conch-crawler,constrictor-coil,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-snake,marsh-mallow-hare,meadow-frog,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,old-sturgeon,otter-centurion,planarian-splitter,platypus-spur,pyrenean-desman,raft-spider,river-mink,shoal-shark,snapstick-turtle,swamp-alligator,tunnel-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,bog-leech,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9000 games in 154 s.

- The list (29): Alley Cat, Bee Forager, Bog Leech, Box Turtle, Conch Crawler, Constrictor Coil, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Marsh-mallow Hare, Meadow Frog, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Old Sturgeon, Otter Centurion, Planarian Splitter, Platypus Spur, Pyrenean Desman, Raft Spider, River Mink, Shoal Shark, Snapstick Turtle, Swamp Alligator, Tunnel Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); tide x8 | 95% (92%-98%) | 0.6 | 0: 8, 1: 12 | 4x Driftwood Crab, 4x Planarian Splitter, 4x Pyrenean Desman, 4x Snapstick Turtle, 2x Bog Leech, 2x Box Turtle | 19 |
| 2 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 93% (89%-96%) | 0.4 | 0: 16, 2: 4 | 4x Alley Cat, 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Mudpuppy, 3x Conch Crawler, 1x Pyrenean Desman | 0 |
| 3 | family:armor | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); armor x8; guard x8 | 91% (87%-94%) | 0.5 | 0: 10, 1: 10 | 4x Alley Cat, 4x Conch Crawler, 4x Driftwood Crab, 4x Planarian Splitter, 2x Bog Leech, 2x Grass Snake | 13 |
| 4 | family:tide | tide x11; bleed x8 | 83% (78%-88%) | 0.35 | 0: 13, 1: 7 | 4x Alley Cat, 4x Mosquito Cloud, 4x Pyrenean Desman, 4x River Mink, 3x Shoal Shark, 1x Box Turtle | 15 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 88% | 96% | 100% | 92% | 96% | 100% | 88% | 96% |
| 2 open | 100% | 100% | 92% | 100% | 96% | 100% | 75% | 100% | 75% | 88% |
| 3 family:armor | 100% | 96% | 96% | 88% | 96% | 100% | 63% | 100% | 83% | 88% |
| 4 family:tide | 92% | 92% | 75% | 67% | 96% | 88% | 75% | 96% | 71% | 79% |
