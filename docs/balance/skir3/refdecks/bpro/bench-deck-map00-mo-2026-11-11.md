# Focused decks: Map 0 The Old Bramble (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool barkplate-beetle,bramble-sprout,bramblewood-lynx,earthworm,elder-willow,ent,farm-dog,house-cat,quill-thorn-boar,quillguard,thorn-shrike --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:spite,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 96 s.

- The list (11): Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Earthworm, Elder Willow, Ent, Farm Dog, House Cat, Quill-Thorn Boar, Quillguard, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber) | 84% (80%-88%) | 0.3 | 0: 14, 1: 6 | 4x Farm Dog, 4x House Cat, 3x Bramblewood Lynx, 3x Earthworm, 3x Ent, 3x Quill-Thorn Boar | 0 |
| 2 | family:spite | swarm (14 copies at 0 Lumber); spite x10 | 82% (78%-87%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Bramble Sprout, 4x Farm Dog, 3x Barkplate Beetle, 3x Ent, 3x House Cat, 3x Quill-Thorn Boar | 7 |
| 3 | swarm | swarm (15 copies at 0 Lumber) | 79% (73%-84%) | 0.25 | 0: 15, 1: 5 | 4x Earthworm, 4x Farm Dog, 4x House Cat, 3x Bramblewood Lynx, 3x Ent, 2x Thorn Shrike | 3 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); spite x6 | 57% (51%-63%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 4x Farm Dog, 3x Bramblewood Lynx, 3x Thorn Shrike, 2x Bramble Sprout | 13 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 100% | 83% | 75% | 100% | 100% | 33% | 96% |
| 2 family:spite | 100% | 75% | 83% | 92% | 100% | 25% | 100% |
| 3 swarm | 100% | 75% | 71% | 92% | 92% | 29% | 92% |
| 4 big | 83% | 42% | 50% | 58% | 88% | 4% | 75% |
