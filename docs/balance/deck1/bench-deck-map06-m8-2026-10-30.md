# Focused decks: Map 6 Sable Swampmire (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,bogfire-newt,booming-bittern,box-turtle,caiman-hatchling,camouflage-frog,cane-toad,constrictor-coil,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-snake,marsh-harrier,marsh-wisp,meadow-frog,newt-doctor,nutria-reedcutter,otter-centurion,poison-dart-croaker,raft-spider,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,alligator-gar,bogfire-newt,booming-bittern,camouflage-frog,cane-toad,constrictor-coil,marsh-harrier,marsh-wisp,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13970 games in 206 s.

- The list (26): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Bogfire Newt, Booming Bittern, Box Turtle, Caiman Hatchling, Camouflage Frog, Cane Toad, Constrictor Coil, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Marsh Harrier, Marsh Wisp, Meadow Frog, Newt Doctor, Nutria Reedcutter, Otter Centurion, Poison Dart Croaker, Raft Spider, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); flying x6 | 89% (86%-92%) | 0.3 | 0: 14, 1: 6 | 4x Bogfire Newt, 4x Box Turtle, 3x Grass Snake, 3x Marsh Harrier, 3x Otter Centurion, 3x Raven Scout | 12 |
| 2 | open | economy (4 resource makers) | 88% (85%-91%) | 0.5 | 0: 10, 1: 10 | 4x Grass Snake, 4x Meadow Frog, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Marsh Harrier, 2x Otter Centurion | 0 |
| 3 | economy | economy (6 resource makers); poison x11 | 86% (82%-89%) | 0.55 | 0: 13, 1: 3, 2: 4 | 4x Bogfire Newt, 4x Cane Toad, 4x Driftwood Crab, 3x Adder Ambusher, 3x Raven Scout, 2x Gannet Nestweaver | 17 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0) | 63% (58%-67%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Box Turtle, 4x Constrictor Coil, 4x Venomlord Serpent, 3x Alley Cat, 3x Bee Forager, 2x Raven Scout | 20 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 100% | 79% | 92% | 92% | 96% | 92% | 33% | 100% |
| 2 open | 100% | 100% | 100% | 100% | 92% | 92% | 96% | 88% | 83% | 29% | 92% |
| 3 economy | 100% | 100% | 100% | 100% | 88% | 92% | 96% | 75% | 75% | 21% | 96% |
| 4 big | 92% | 83% | 83% | 88% | 54% | 42% | 79% | 46% | 38% | 8% | 75% |
