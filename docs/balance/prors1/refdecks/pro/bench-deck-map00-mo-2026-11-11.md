# Focused decks: Map 0 The Old Bramble (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool amber-cicada,ashbone-ghoul,barkplate-beetle,bramble-sprout,bramblewood-lynx,dhole-matriarch,eagle-owl-quartermaster,echidna-quillshot,elder-willow,ent,gatling-hog,grave-grin-hyena,hazel-coppice,hedgehog-herbalist,ibex-rockcaller,lyrebird-mimic,moon-jerboa,porcupine-roller,quill-thorn-boar,quill-volley,quillguard,seed-cache-squirrel,shimmerwing-stag,thorn-shrike,thornwood-palisade,tide-spirit,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:spite,big,swarm,open --anchor barkplate-beetle,bramble-sprout,bramblewood-lynx,echidna-quillshot,elder-willow,ent,gatling-hog,hazel-coppice,hedgehog-herbalist,porcupine-roller,quill-thorn-boar,quill-volley,quillguard,shimmerwing-stag,thorn-shrike,thornwood-palisade --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8736 games in 142 s.

- The list (28): Amber Cicada, Ashbone Ghoul, Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Dhole Matriarch, Eagle-Owl Quartermaster, Echidna Quillshot, Elder Willow, Ent, Gatling Hog, Grave-Grin Hyena, Hazel Coppice, Hedgehog Herbalist, Ibex Rockcaller, Lyrebird Mimic, Moon Jerboa, Porcupine Roller, Quill-Thorn Boar, Quill Volley, Quillguard, Seed-cache Squirrel, Shimmerwing Stag, Thorn Shrike, Thornwood Palisade, Tide Seahorse, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); spite x7 | 90% (86%-94%) | 0.3 | 0: 14, 1: 6 | 4x Grave-Grin Hyena, 4x Porcupine Roller, 3x Bramble Sprout, 3x Ent, 3x Hedgehog Herbalist, 3x Truffle Piglet | 10 |
| 2 | open | spite x8 | 88% (84%-92%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Barkplate Beetle, 4x Bramble Sprout, 4x Grave-Grin Hyena, 3x Ent, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 0 |
| 3 | family:spite | swarm (14 copies at 0 Lumber); spite x10 | 85% (80%-89%) | 0.3 | 0: 14, 1: 6 | 4x Grave-Grin Hyena, 4x Porcupine Roller, 3x Bramble Sprout, 3x Ent, 3x Quill-Thorn Boar, 3x Quill Volley | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 67% (60%-73%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 4x Grave-Grin Hyena, 3x Ashbone Ghoul, 3x Hedgehog Herbalist, 2x Ent | 10 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 96% | 92% | 100% | 58% | 88% |
| 2 open | 92% | 100% | 96% | 92% | 96% | 50% | 92% |
| 3 family:spite | 96% | 96% | 100% | 92% | 92% | 46% | 71% |
| 4 big | 54% | 75% | 79% | 71% | 83% | 25% | 79% |
