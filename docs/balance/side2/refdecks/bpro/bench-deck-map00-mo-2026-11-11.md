# Focused decks: Map 0 The Old Bramble (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool barkplate-beetle,bramble-sprout,bramblewood-lynx,cricket-drummer,earthworm,ent,farm-dog,grass-snake,platypus-spur,proboscis-monkey,quill-thorn-boar,strangler-vine,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:spite,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6664 games in 123 s.

- The list (13): Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Cricket Drummer, Earthworm, Ent, Farm Dog, Grass Snake, Platypus Spur, Proboscis Monkey, Quill-Thorn Boar, Strangler Vine, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:spite | swarm (14 copies at 0 Lumber); spite x10 | 92% (89%-95%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Barkplate Beetle, 4x Bramble Sprout, 4x Cricket Drummer, 4x Farm Dog, 2x Ent, 2x Quill-Thorn Boar | 10 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 86% (82%-90%) | 0.3 | 0: 14, 1: 6 | 4x Cricket Drummer, 4x Earthworm, 4x Farm Dog, 3x Bramblewood Lynx, 3x Proboscis Monkey, 2x Ent | 11 |
| 3 | big | big (13 copies at 1+ Lumber, average 0.7) | 79% (73%-84%) | 0.65 | 0: 7, 1: 13 | 4x Cricket Drummer, 4x Platypus Spur, 3x Bramblewood Lynx, 3x Ent, 3x Strangler Vine, 3x Wolf Spider Mother | 13 |
| 4 | open | big (10 copies at 1+ Lumber, average 0.5); spite x7 | 76% (71%-81%) | 0.5 | 0: 10, 1: 10 | 4x Bramble Sprout, 4x Cricket Drummer, 4x Grass Snake, 3x Bramblewood Lynx, 3x Quill-Thorn Boar, 2x Earthworm | 0 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:spite | 100% | 100% | 100% | 100% | 100% | 46% | 100% |
| 2 swarm | 96% | 96% | 96% | 96% | 96% | 29% | 92% |
| 3 big | 96% | 75% | 88% | 83% | 92% | 38% | 79% |
| 4 open | 88% | 63% | 88% | 88% | 96% | 17% | 96% |
