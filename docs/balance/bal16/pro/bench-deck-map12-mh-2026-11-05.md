# Focused decks: Map 12 The Briar Maze (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool alpine-marmot,ant-hill,badger-lumberjack,blue-ringed-octopus,bramble-hoglet,carrion-crow,cunning-vixen,dormouse,eagle-owl-quartermaster,field-mouse,field-vole,fire-ant-raft,harvest-mouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,hollow-belly-rat,ibex-rockcaller,leafcutter-gardener,lyrebird-mimic,mouse-sapper,otter-centurion,quill-thorn-boar,quillguard,robin-redbreast,thorn-shrike,truffle-piglet,wolf-spider-mother,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:guard,open --anchor ant-hill,badger-lumberjack,bramble-hoglet,carrion-crow,cunning-vixen,dormouse,field-mouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,hollow-belly-rat,lyrebird-mimic,mouse-sapper,quill-thorn-boar,quillguard,thorn-shrike,woodcock-lookout --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7020 games in 141 s.

- The list (29): Alpine Marmot, Ant Hill, Badger Lumberjack, Blue-ringed Octopus, Bramble Hoglet, Carrion Crow, Cunning Vixen, Dormouse, Eagle-Owl Quartermaster, Field Mouse, Field Vole, Fire Ant Raft, Harvest Mouse, Hawthorn Shieldbug, Hedge Weasel, Hedgerow Shrew, Hollow-belly Rat, Ibex Rockcaller, Leafcutter Gardener, Lyrebird Mimic, Mouse Sapper, Otter Centurion, Quill-Thorn Boar, Quillguard, Robin Redbreast, Thorn Shrike, Truffle Piglet, Wolf Spider Mother, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); economy (4 resource makers); guard x8; flying x8 | 83% (79%-87%) | 0.2 | 0: 16, 1: 4 | 4x Alpine Marmot, 4x Bramble Hoglet, 4x Carrion Crow, 4x Hawthorn Shieldbug, 4x Robin Redbreast | 20 |
| 2 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (6 resource makers) | 83% (78%-87%) | 0.45 | 0: 11, 1: 9 | 4x Carrion Crow, 4x Dormouse, 4x Lyrebird Mimic, 3x Alpine Marmot, 3x Wolf Spider Mother, 2x Badger Lumberjack | 20 |
| 3 | family:guard | big (11 copies at 1+ Lumber, average 0.6); guard x8 | 78% (73%-83%) | 0.55 | 0: 9, 1: 11 | 4x Alpine Marmot, 4x Hawthorn Shieldbug, 4x Hollow-belly Rat, 3x Eagle-Owl Quartermaster, 3x Hedge Weasel, 2x Field Vole | 20 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.5) | 77% (72%-82%) | 0.45 | 0: 11, 1: 9 | 4x Field Mouse, 4x Leafcutter Gardener, 4x Mouse Sapper, 3x Harvest Mouse, 3x Quill-Thorn Boar, 2x Blue-ringed Octopus | 0 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 67% | 92% | 96% | 88% | 100% | 100% | 88% | 96% | 54% | 50% |
| 2 economy | 79% | 79% | 92% | 83% | 92% | 100% | 92% | 100% | 58% | 50% |
| 3 family:guard | 88% | 54% | 88% | 88% | 92% | 96% | 75% | 96% | 42% | 63% |
| 4 open | 71% | 63% | 75% | 96% | 88% | 83% | 92% | 96% | 38% | 67% |
