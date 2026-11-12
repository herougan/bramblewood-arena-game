# Focused decks: Map 5 Gatorback Swamp (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,bog-leech,constrictor-coil,fire-ant-raft,marsh-mallow-hare,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,muskrat-reedgatherer,newt-doctor,old-snapjaw,planarian-splitter,platypus-spur,raft-spider,shoal-shark,snapstick-turtle,swamp-alligator --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:bleed,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7680 games in 107 s.

- The list (17): Alley Cat, Bog Leech, Constrictor Coil, Fire Ant Raft, Marsh-mallow Hare, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Newt Doctor, Old Snapjaw, Planarian Splitter, Platypus Spur, Raft Spider, Shoal Shark, Snapstick Turtle, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x8 | 88% (84%-92%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Mudpuppy, 4x Muskrat Reedgatherer, 4x Raft Spider, 4x Shoal Shark | 12 |
| 2 | family:bleed | swarm (15 copies at 0 Lumber); bleed x14 | 86% (82%-90%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Bog Leech, 4x Mosquito Cloud, 4x Mudpuppy, 3x Alley Cat, 3x Old Snapjaw, 2x Planarian Splitter | 11 |
| 3 | open | big (8 copies at 1+ Lumber, average 0.5); bleed x8 | 85% (81%-89%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Alley Cat, 4x Mosquito Cloud, 4x Muskrat Reedgatherer, 4x Planarian Splitter, 3x Fire Ant Raft, 1x Swamp Alligator | 0 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.8); bleed x11 | 61% (55%-67%) | 0.75 | 0: 12, 1: 1, 2: 7 | 4x Alley Cat, 4x Bog Leech, 4x Constrictor Coil, 4x Newt Doctor, 3x Old Snapjaw, 1x Fire Ant Raft | 15 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 92% | 83% | 88% | 96% | 92% | 79% | 100% | 79% | 75% |
| 2 family:bleed | 88% | 96% | 88% | 88% | 100% | 96% | 67% | 96% | 75% | 71% |
| 3 open | 100% | 88% | 83% | 88% | 92% | 92% | 58% | 96% | 67% | 88% |
| 4 big | 88% | 79% | 75% | 42% | 75% | 54% | 46% | 58% | 50% | 46% |
