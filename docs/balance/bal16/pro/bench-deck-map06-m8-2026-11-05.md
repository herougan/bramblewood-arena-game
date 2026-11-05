# Focused decks: Map 6 Sable Swampmire (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,booming-bittern,box-turtle,camouflage-frog,constrictor-coil,cypress-root-lurker,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,guppy,heron-hag,lamprey,marsh-harrier,meadow-frog,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,old-sturgeon,otter-centurion,poison-dart-croaker,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:flying,big,open --anchor adder-ambusher,alligator-gar,booming-bittern,camouflage-frog,constrictor-coil,cypress-root-lurker,fire-ant-raft,heron-hag,lamprey,marsh-harrier,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7568 games in 104 s.

- The list (27): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Booming Bittern, Box Turtle, Camouflage Frog, Constrictor Coil, Cypress Root Lurker, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Guppy, The Heron Hag, Lamprey, Marsh Harrier, Meadow Frog, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Old Sturgeon, Otter Centurion, Poison Dart Croaker, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | economy (4 resource makers); flying x14 | 85% (83%-88%) | 0.45 | 0: 11, 1: 9 | 4x Box Turtle, 4x Gannet Nestweaver, 4x Marsh Harrier, 3x The Heron Hag, 3x Raven Scout, 2x Cypress Root Lurker | 16 |
| 2 | open | economy (4 resource makers); tide x7 | 81% (77%-85%) | 0.55 | 0: 9, 1: 11 | 4x Fen Mink, 4x Fire Ant Raft, 4x Gannet Nestweaver, 4x Lamprey, 3x Alligator Gar, 1x Newt Doctor | 0 |
| 3 | family:tide | tide x14; poison x7 | 79% (75%-83%) | 0.5 | 0: 10, 1: 10 | 4x Fire Ant Raft, 4x Guppy, 3x Alligator Gar, 3x Bee Forager, 3x Box Turtle, 3x Poison Dart Croaker | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); economy (4 resource makers); poison x9; flying x6 | 74% (70%-78%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Venomlord Serpent, 3x Adder Ambusher, 3x Otter Centurion, 2x The Heron Hag | 16 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 96% | 100% | 96% | 100% | 100% | 100% | 96% | 13% | 42% |
| 2 open | 92% | 92% | 96% | 96% | 71% | 92% | 92% | 100% | 88% | 25% | 46% |
| 3 family:tide | 83% | 88% | 88% | 100% | 88% | 92% | 83% | 92% | 88% | 29% | 42% |
| 4 big | 83% | 83% | 96% | 92% | 79% | 96% | 92% | 92% | 63% | 21% | 21% |
