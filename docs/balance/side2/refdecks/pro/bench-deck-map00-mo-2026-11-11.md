# Focused decks: Map 0 The Old Bramble (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool amber-cicada,barkplate-beetle,bramble-sprout,bramblewood-lynx,cricket-drummer,dhole-matriarch,eagle-owl-quartermaster,earthworm,ent,farm-dog,fungus-gnat-cloud,grass-snake,grave-grin-hyena,ibex-rockcaller,lyrebird-mimic,platypus-spur,proboscis-monkey,quill-thorn-boar,river-mink,stoat-cutthroat,strangler-vine,tide-spirit,truffle-piglet,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:spite,big,open --anchor barkplate-beetle,bramble-sprout,bramblewood-lynx,cricket-drummer,earthworm,ent,farm-dog,grass-snake,platypus-spur,proboscis-monkey,quill-thorn-boar,strangler-vine,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8680 games in 143 s.

- The list (25): Amber Cicada, Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Cricket Drummer, Dhole Matriarch, Eagle-Owl Quartermaster, Earthworm, Ent, Farm Dog, Fungus Gnat Cloud, Grass Snake, Grave-Grin Hyena, Ibex Rockcaller, Lyrebird Mimic, Platypus Spur, Proboscis Monkey, Quill-Thorn Boar, River Mink, Stoat Cutthroat, Strangler Vine, Tide Seahorse, Truffle Piglet, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (15 copies at 0 Lumber); flying x8; swarm x7 | 92% (88%-95%) | 0.35 | 0: 15, 1: 3, 2: 2 | 4x Farm Dog, 4x Fungus Gnat Cloud, 4x Upside-Down Bat, 3x Cricket Drummer, 3x Wolf Spider Mother, 2x Barkplate Beetle | 13 |
| 2 | family:spite | big (14 copies at 1+ Lumber, average 0.9); spite x10 | 88% (84%-93%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Truffle Piglet, 3x Quill-Thorn Boar, 3x Strangler Vine, 2x Cricket Drummer | 14 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5) | 86% (81%-91%) | 0.45 | 0: 11, 1: 9 | 4x Amber Cicada, 4x Cricket Drummer, 4x Fungus Gnat Cloud, 3x Bramblewood Lynx, 3x Ent, 2x River Mink | 0 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4) | 81% (76%-86%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Sprout, 4x Lyrebird Mimic, 4x Platypus Spur, 3x Ent, 3x Upside-Down Bat, 2x Tide Seahorse | 17 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 96% | 96% | 96% | 100% | 58% | 100% |
| 2 family:spite | 100% | 79% | 96% | 92% | 100% | 58% | 92% |
| 3 open | 92% | 88% | 88% | 92% | 92% | 71% | 79% |
| 4 big | 88% | 71% | 92% | 96% | 96% | 38% | 88% |
