# Focused decks: Map 12 The Briar Maze (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool alpine-marmot,barkplate-beetle,blue-ringed-octopus,bramble-hoglet,briarback-hedgehog,carrion-crow,cunning-vixen,dormouse,eagle-owl-quartermaster,field-vole,fungus-gnat-cloud,harvest-mouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,ibex-rockcaller,lyrebird-mimic,millipede-hauler,mouse-sapper,nightjar-drifter,pack-rat-looter,quill-thorn-boar,quillguard,robin-redbreast,terrier-pup,thorn-shrike,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:armor,open --anchor barkplate-beetle,bramble-hoglet,briarback-hedgehog,carrion-crow,cunning-vixen,dormouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,lyrebird-mimic,mouse-sapper,pack-rat-looter,quill-thorn-boar,quillguard,terrier-pup,thorn-shrike --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2580 games in 774 s.

- The list (28): Alpine Marmot, Barkplate Beetle, Blue-ringed Octopus, Bramble Hoglet, Briarback Hedgehog, Carrion Crow, Cunning Vixen, Dormouse, Eagle-Owl Quartermaster, Field Vole, Fungus Gnat Cloud, Harvest Mouse, Hawthorn Shieldbug, Hedge Weasel, Hedgerow Shrew, Ibex Rockcaller, Lyrebird Mimic, Millipede Hauler, Mouse Sapper, Nightjar Drifter, Pack Rat Looter, Quill-Thorn Boar, Quillguard, Robin Redbreast, Terrier Pup, Thorn Shrike, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x11 | 85% (81%-90%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Bramble Hoglet, 4x Carrion Crow, 4x Robin Redbreast, 3x Barkplate Beetle, 3x Thorn Shrike, 2x Briarback Hedgehog | 20 |
| 2 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (8 resource makers) | 82% (78%-86%) | 0.5 | 0: 10, 1: 10 | 4x Alpine Marmot, 4x Carrion Crow, 4x Pack Rat Looter, 3x Blue-ringed Octopus, 3x Quill-Thorn Boar, 2x Tide Seahorse | 13 |
| 3 | open | big (13 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 78% (73%-83%) | 0.65 | 0: 7, 1: 13 | 4x Dormouse, 4x Lyrebird Mimic, 4x Pack Rat Looter, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Ibex Rockcaller | 0 |
| 4 | family:armor | big (11 copies at 1+ Lumber, average 0.6); armor x8; swarm x8 | 73% (67%-78%) | 0.55 | 0: 9, 1: 11 | 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Hedgerow Shrew, 4x Millipede Hauler, 3x Mouse Sapper, 1x Alpine Marmot | 19 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 92% | 92% | 83% | 88% | 83% | 71% | 100% | 63% | 88% |
| 2 economy | 92% | 79% | 96% | 100% | 88% | 96% | 71% | 100% | 29% | 67% |
| 3 open | 75% | 83% | 83% | 79% | 100% | 88% | 67% | 96% | 50% | 63% |
| 4 family:armor | 58% | 92% | 75% | 71% | 83% | 88% | 75% | 96% | 54% | 33% |
