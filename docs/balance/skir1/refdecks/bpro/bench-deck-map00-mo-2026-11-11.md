# Focused decks: Map 0 The Old Bramble (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool barkplate-beetle,bramble-sprout,bramblewood-lynx,echidna-quillshot,elder-willow,ent,gatling-hog,hazel-coppice,hedgehog-herbalist,porcupine-roller,quill-thorn-boar,quill-volley,quillguard,shimmerwing-stag,thorn-shrike,thornwood-palisade --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:spite,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1974 games in 329 s.

- The list (16): Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Echidna Quillshot, Elder Willow, Ent, Gatling Hog, Hazel Coppice, Hedgehog Herbalist, Porcupine Roller, Quill-Thorn Boar, Quill Volley, Quillguard, Shimmerwing Stag, Thorn Shrike, Thornwood Palisade.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:spite | spite x11 | 62% (55%-69%) | 0.45 | 0: 11, 1: 9 | 4x Bramble Sprout, 4x Porcupine Roller, 3x Bramblewood Lynx, 3x Ent, 3x Hedgehog Herbalist, 3x Thornwood Palisade | 11 |
| 2 | big | big (8 copies at 2+ Lumber, average 1.2); spite x15 | 60% (53%-66%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Bramble Sprout, 4x Elder Willow, 4x Porcupine Roller, 3x Quill-Thorn Boar, 1x Echidna Quillshot | 12 |
| 3 | open | economy (4 resource makers); spite x8 | 51% (45%-58%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Barkplate Beetle, 4x Bramble Sprout, 4x Hazel Coppice, 3x Bramblewood Lynx, 3x Gatling Hog, 2x Hedgehog Herbalist | 0 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:spite | 67% | 67% | 58% | 50% | 83% | 40% | 71% |
| 2 big | 75% | 58% | 63% | 46% | 92% | 13% | 71% |
| 3 open | 54% | 58% | 50% | 46% | 83% | 0% | 67% |
