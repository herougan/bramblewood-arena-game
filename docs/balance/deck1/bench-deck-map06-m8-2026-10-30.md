# Focused decks: Map 6 Sable Swampmire (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,booming-bittern,box-turtle,camouflage-frog,constrictor-coil,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,guppy,heron-hag,lamprey,marsh-harrier,marsh-wisp,meadow-frog,newt-doctor,nutria-reedcutter,otter-centurion,poison-dart-croaker,raven-scout,venomlord-serpent,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,alligator-gar,booming-bittern,camouflage-frog,constrictor-coil,heron-hag,lamprey,marsh-harrier,marsh-wisp,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7348 games in 111 s.

- The list (26): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Booming Bittern, Box Turtle, Camouflage Frog, Constrictor Coil, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Guppy, The Heron Hag, Lamprey, Marsh Harrier, Marsh Wisp, Meadow Frog, Newt Doctor, Nutria Reedcutter, Otter Centurion, Poison Dart Croaker, Raven Scout, Venomlord Serpent, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers); poison x6 | 93% (91%-96%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Newt Doctor, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x The Heron Hag, 2x Camouflage Frog | 17 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 92% (89%-95%) | 0.3 | 0: 14, 1: 6 | 4x Meadow Frog, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Anhinga Spearbird, 3x Newt Doctor, 3x Raven Scout | 20 |
| 3 | open | tide x10; poison x7 | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Fire Ant Raft, 4x Marsh Wisp, 3x Alligator Gar, 3x The Heron Hag, 3x Otter Centurion, 3x Water Vole | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); poison x7 | 77% (73%-81%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Box Turtle, 4x Constrictor Coil, 4x Driftwood Crab, 4x Venomlord Serpent, 3x The Heron Hag, 1x Fen Mink | 17 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 96% | 96% | 83% | 100% | 100% | 100% | 96% | 54% | 100% |
| 2 swarm | 100% | 100% | 100% | 100% | 83% | 100% | 100% | 92% | 83% | 58% | 96% |
| 3 open | 96% | 96% | 100% | 96% | 67% | 100% | 100% | 92% | 92% | 29% | 96% |
| 4 big | 96% | 88% | 75% | 88% | 46% | 96% | 100% | 96% | 71% | 13% | 79% |
