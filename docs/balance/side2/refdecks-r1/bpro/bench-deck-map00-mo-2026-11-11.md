# Focused decks: Map 0 The Old Bramble (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool barkplate-beetle,bramble-sprout,bramblewood-lynx,earthworm,elder-willow,ent,farm-dog,quill-thorn-boar,quillguard,sergeant-bramblefox,thorn-shrike --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:spite,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5362 games in 170 s.

- The list (11): Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Earthworm, Elder Willow, Ent, Farm Dog, Quill-Thorn Boar, Quillguard, Sergeant Bramblefox, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:spite | spite x10 | 85% (80%-89%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Bramble Sprout, 4x Farm Dog, 3x Barkplate Beetle, 3x Ent, 3x Quill-Thorn Boar, 3x Sergeant Bramblefox | 10 |
| 2 | open | spite x7 | 69% (63%-75%) | 0.6 | 0: 8, 1: 12 | 4x Bramble Sprout, 4x Earthworm, 3x Bramblewood Lynx, 3x Quill-Thorn Boar, 3x Sergeant Bramblefox, 3x Thorn Shrike | 0 |
| 3 | swarm | swarm (14 copies at 0 Lumber) | 65% (60%-71%) | 0.3 | 0: 14, 1: 6 | 4x Earthworm, 4x Farm Dog, 3x Bramble Sprout, 3x Ent, 3x Quillguard, 3x Thorn Shrike | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 64% (58%-69%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 3x Bramblewood Lynx, 3x Earthworm, 3x Ent, 3x Farm Dog | 14 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:spite | 100% | 75% | 88% | 100% | 100% | 33% | 96% |
| 2 open | 92% | 58% | 58% | 88% | 96% | 21% | 71% |
| 3 swarm | 92% | 58% | 46% | 92% | 96% | 17% | 58% |
| 4 big | 88% | 54% | 33% | 92% | 92% | 8% | 79% |
