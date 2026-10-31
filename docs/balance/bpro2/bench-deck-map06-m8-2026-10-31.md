# Focused decks: Map 6 Sable Swampmire (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alligator-gar,bogfire-newt,booming-bittern,camouflage-frog,cane-toad,constrictor-coil,marsh-harrier,marsh-wisp,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7458 games in 87 s.

- The list (14): Adder Ambusher, Alligator Gar, Bogfire Newt, Booming Bittern, Camouflage Frog, Cane Toad, Constrictor Coil, Marsh Harrier, Marsh Wisp, Newt Doctor, Nutria Reedcutter, Poison Dart Croaker, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); poison x6 | 94% (91%-96%) | 0.3 | 0: 14, 1: 6 | 4x Newt Doctor, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Alligator Gar, 3x Bogfire Newt, 3x Raven Scout | 7 |
| 2 | open | economy (4 resource makers); poison x9; tide x9 | 92% (89%-95%) | 0.6 | 0: 8, 1: 12 | 4x Bogfire Newt, 4x Camouflage Frog, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Alligator Gar, 2x Poison Dart Croaker | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); poison x7 | 81% (77%-85%) | 1.05 | 0: 7, 1: 5, 2: 8 | 4x Cane Toad, 4x Constrictor Coil, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Raven Scout, 2x Alligator Gar | 11 |
| 4 | family:poison | poison x11 | 71% (66%-76%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Bogfire Newt, 4x Poison Dart Croaker, 3x Adder Ambusher, 3x Constrictor Coil, 3x Newt Doctor, 3x Raven Scout | 11 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 100% | 96% | 96% | 100% | 88% | 100% | 58% | 92% |
| 2 open | 100% | 96% | 100% | 100% | 96% | 96% | 100% | 83% | 88% | 63% | 96% |
| 3 big | 96% | 100% | 96% | 92% | 71% | 67% | 100% | 71% | 71% | 25% | 100% |
| 4 family:poison | 100% | 88% | 75% | 88% | 71% | 71% | 100% | 25% | 58% | 33% | 71% |
