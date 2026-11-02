# Focused decks: Map 6 Sable Swampmire (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,booming-bittern,box-turtle,camouflage-frog,constrictor-coil,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,grass-snake,heron-hag,lamprey,marsh-harrier,marsh-wisp,meadow-frog,newt-doctor,nutria-reedcutter,otter-centurion,poison-dart-croaker,raft-spider,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,alligator-gar,booming-bittern,camouflage-frog,constrictor-coil,heron-hag,lamprey,marsh-harrier,marsh-wisp,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7370 games in 113 s.

- The list (26): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Booming Bittern, Box Turtle, Camouflage Frog, Constrictor Coil, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Grass Snake, The Heron Hag, Lamprey, Marsh Harrier, Marsh Wisp, Meadow Frog, Newt Doctor, Nutria Reedcutter, Otter Centurion, Poison Dart Croaker, Raft Spider, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (10 resource makers) | 95% (93%-98%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Box Turtle, 4x Driftwood Crab, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Constrictor Coil, 2x Gannet Nestweaver | 11 |
| 2 | economy | economy (10 resource makers) | 91% (88%-94%) | 0.5 | 0: 10, 1: 10 | 4x Booming Bittern, 4x Driftwood Crab, 3x Adder Ambusher, 3x Alligator Gar, 3x Gannet Nestweaver, 3x Nutria Reedcutter | 11 |
| 3 | open | economy (8 resource makers); flying x8 | 86% (83%-89%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Marsh Harrier, 4x Nutria Reedcutter, 3x Alligator Gar, 1x Raft Spider | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); economy (4 resource makers); flying x7 | 79% (75%-83%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Venomlord Serpent, 3x Box Turtle, 3x Raven Scout, 2x Otter Centurion | 12 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 100% | 100% | 100% | 100% | 100% | 92% | 100% | 63% | 100% |
| 2 economy | 100% | 100% | 96% | 100% | 92% | 100% | 100% | 88% | 88% | 46% | 92% |
| 3 open | 100% | 88% | 92% | 100% | 67% | 100% | 100% | 79% | 96% | 29% | 96% |
| 4 big | 83% | 96% | 96% | 83% | 67% | 100% | 100% | 75% | 67% | 25% | 79% |
