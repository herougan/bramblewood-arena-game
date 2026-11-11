# Focused decks: Map 5 Gatorback Swamp (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bog-leech,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,peat-cutter-vole,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:tide,family:bleed,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2980 games in 550 s.

- The list (18): Alley Cat, Bog Leech, Constrictor Coil, Fire Ant Raft, Marsh-mallow Hare, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Peat-cutter Vole, Planarian Splitter, Platypus Spur, Raft Spider, Shoal Shark, Snapstick Turtle, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:bleed | swarm (16 copies at 0 Lumber); bleed x8 | 91% (88%-95%) | 0.4 | 0: 16, 2: 4 | 4x Alley Cat, 4x Bog Leech, 4x Constrictor Coil, 4x Mudpuppy, 4x Muskrat Reedgatherer | 10 |
| 2 | open | swarm (14 copies at 0 Lumber); bleed x10 | 90% (86%-94%) | 0.3 | 0: 14, 1: 6 | 4x Mosquito Cloud, 4x Mudpuppy, 4x Planarian Splitter, 3x Alley Cat, 3x Bog Leech, 2x Fire Ant Raft | 0 |
| 3 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x8 | 88% (84%-91%) | 0.4 | 0: 12, 1: 8 | 4x Bog Leech, 4x Fire Ant Raft, 4x Mudpuppy, 4x Peat-cutter Vole, 4x Shoal Shark | 11 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4); bleed x8 | 84% (80%-89%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Bog Leech, 4x Marsh-mallow Hare, 4x Planarian Splitter, 4x Raft Spider | 10 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:bleed | 100% | 100% | 88% | 96% | 96% | 100% | 79% | 100% | 71% | 83% |
| 2 open | 96% | 100% | 96% | 88% | 100% | 100% | 75% | 100% | 71% | 75% |
| 3 family:tide | 96% | 100% | 88% | 88% | 100% | 100% | 67% | 88% | 67% | 83% |
| 4 big | 92% | 96% | 88% | 75% | 92% | 88% | 88% | 92% | 63% | 71% |
