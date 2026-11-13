# Focused decks: Map 0 The Old Bramble (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool amber-cicada,barkplate-beetle,bramble-sprout,bramblewood-lynx,dhole-matriarch,eagle-owl-quartermaster,earthworm,elder-willow,ent,farm-dog,grave-grin-hyena,hedgehog-herbalist,ibex-rockcaller,lyrebird-mimic,pond-algae,quill-thorn-boar,quillguard,sergeant-bramblefox,stoat-cutthroat,thorn-shrike,truffle-piglet,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:spite,big,open --anchor barkplate-beetle,bramble-sprout,bramblewood-lynx,earthworm,elder-willow,ent,farm-dog,quill-thorn-boar,quillguard,sergeant-bramblefox,thorn-shrike --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8750 games in 148 s.

- The list (23): Amber Cicada, Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Dhole Matriarch, Eagle-Owl Quartermaster, Earthworm, Elder Willow, Ent, Farm Dog, Grave-Grin Hyena, Hedgehog Herbalist, Ibex Rockcaller, Lyrebird Mimic, Pond Algae, Quill-Thorn Boar, Quillguard, Sergeant Bramblefox, Stoat Cutthroat, Thorn Shrike, Truffle Piglet, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:spite | swarm (16 copies at 0 Lumber); spite x8 | 86% (82%-91%) | 0.4 | 0: 16, 2: 4 | 4x Barkplate Beetle, 4x Bramble Sprout, 4x Grave-Grin Hyena, 4x Upside-Down Bat, 3x Ent, 1x Earthworm | 12 |
| 2 | family:flying | flying x9 | 82% (77%-86%) | 0.45 | 0: 11, 1: 9 | 4x Farm Dog, 4x Lyrebird Mimic, 4x Upside-Down Bat, 3x Ent, 3x Thorn Shrike, 2x Eagle-Owl Quartermaster | 14 |
| 3 | open | midrange (average 0.8 Lumber) | 77% (71%-82%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Barkplate Beetle, 4x Farm Dog, 4x Grave-Grin Hyena, 3x Eagle-Owl Quartermaster, 3x Hedgehog Herbalist, 2x Bramblewood Lynx | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4) | 68% (62%-74%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 4x Truffle Piglet, 3x Grave-Grin Hyena, 3x Sergeant Bramblefox, 2x Ibex Rockcaller | 13 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:spite | 96% | 92% | 79% | 96% | 100% | 46% | 96% |
| 2 family:flying | 96% | 79% | 79% | 100% | 92% | 33% | 92% |
| 3 open | 92% | 67% | 79% | 83% | 100% | 29% | 88% |
| 4 big | 96% | 67% | 54% | 88% | 79% | 21% | 71% |
