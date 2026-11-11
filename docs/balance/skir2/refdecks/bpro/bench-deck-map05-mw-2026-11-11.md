# Focused decks: Map 5 Gatorback Swamp (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bog-leech,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,peat-cutter-vole,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,sphagnum-vole,swamp-alligator --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:bleed,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 77 s.

- The list (19): Alley Cat, Bog Leech, Constrictor Coil, Fire Ant Raft, Marsh-mallow Hare, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Peat-cutter Vole, Planarian Splitter, Platypus Spur, Raft Spider, Shoal Shark, Snapstick Turtle, Sphagnum Vole, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:bleed | bleed x8; heal x8 | 90% (86%-93%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x Alley Cat, 4x Mudpuppy, 4x Peat-cutter Vole, 4x Sphagnum Vole, 3x Old Snapjaw, 1x Bog Leech | 14 |
| 2 | open | swarm (15 copies at 0 Lumber); bleed x9 | 88% (84%-92%) | 0.3 | 0: 15, 1: 4, 2: 1 | 4x Alley Cat, 4x Bog Leech, 4x Muskrat Reedgatherer, 4x Planarian Splitter, 3x Marsh-mallow Hare, 1x Old Snapjaw | 0 |
| 3 | family:tide | big (9 copies at 1+ Lumber, average 0.5); tide x8; bleed x7 | 83% (78%-87%) | 0.5 | 0: 11, 1: 8, 2: 1 | 4x Bog Leech, 4x Fire Ant Raft, 4x Mudpuppy, 4x Shoal Shark, 3x Alley Cat, 1x Constrictor Coil | 13 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4); tide x8; heal x6 | 79% (74%-84%) | 0.4 | 0: 12, 1: 8 | 4x Marsh-mallow Hare, 4x Muskrat Reedgatherer, 4x Shoal Shark, 4x Snapstick Turtle, 2x Alley Cat, 2x Mudpuppy | 11 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:bleed | 92% | 100% | 92% | 88% | 96% | 92% | 83% | 96% | 88% | 71% |
| 2 open | 92% | 96% | 88% | 83% | 96% | 96% | 83% | 96% | 79% | 75% |
| 3 family:tide | 88% | 96% | 96% | 83% | 83% | 96% | 67% | 96% | 63% | 63% |
| 4 big | 83% | 96% | 79% | 67% | 92% | 75% | 67% | 96% | 54% | 83% |
