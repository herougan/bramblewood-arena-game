# Focused decks: Map 0 The Old Bramble (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool ashbone-ghoul,barkplate-beetle,bramble-sprout,bramblewood-lynx,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,echidna-quillshot,elder-willow,ent,gatling-hog,grave-grin-hyena,hazel-coppice,hedgehog-herbalist,lyrebird-mimic,moon-jerboa,porcupine-roller,quill-thorn-boar,quill-volley,quillguard,seed-cache-squirrel,shimmerwing-stag,squires-mount,thorn-shrike,thornwood-palisade,tide-spirit,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:spite,big,swarm,open --anchor barkplate-beetle,bramble-sprout,bramblewood-lynx,echidna-quillshot,elder-willow,ent,gatling-hog,hazel-coppice,hedgehog-herbalist,porcupine-roller,quill-thorn-boar,quill-volley,quillguard,shimmerwing-stag,thorn-shrike,thornwood-palisade --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2184 games in 520 s.

- The list (28): Ashbone Ghoul, Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Echidna Quillshot, Elder Willow, Ent, Gatling Hog, Grave-Grin Hyena, Hazel Coppice, Hedgehog Herbalist, Lyrebird Mimic, Moon Jerboa, Porcupine Roller, Quill-Thorn Boar, Quill Volley, Quillguard, Seed-cache Squirrel, Shimmerwing Stag, Squire's Mount, Thorn Shrike, Thornwood Palisade, Tide Seahorse, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); spite x7 | 86% (82%-91%) | 0.2 | 0: 16, 1: 4 | 4x Ashbone Ghoul, 4x Dhole Runner, 4x Porcupine Roller, 3x Bramble Sprout, 3x Ent, 2x Tide Seahorse | 20 |
| 2 | family:spite | spite x10 | 83% (78%-88%) | 0.45 | 0: 11, 1: 9 | 4x Grave-Grin Hyena, 4x Porcupine Roller, 3x Ashbone Ghoul, 3x Quill-Thorn Boar, 3x Squire's Mount, 3x Thornwood Palisade | 16 |
| 3 | open | midrange (average 1.0 Lumber) | 73% (67%-79%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Barkplate Beetle, 4x Grave-Grin Hyena, 3x Gatling Hog, 3x Hedgehog Herbalist, 3x Quill Volley, 3x Wolf Spider Mother | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); spite x6 | 73% (67%-78%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 4x Grave-Grin Hyena, 3x Ashbone Ghoul, 3x Truffle Piglet, 2x Porcupine Roller | 12 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 79% | 92% | 100% | 92% | 92% | 54% | 96% |
| 2 family:spite | 88% | 96% | 100% | 83% | 96% | 38% | 79% |
| 3 open | 67% | 83% | 92% | 79% | 88% | 33% | 71% |
| 4 big | 67% | 83% | 96% | 50% | 100% | 25% | 88% |
