# Focused decks: Map 6 Sable Swampmire (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alligator-gar,booming-bittern,camouflage-frog,constrictor-coil,heron-hag,lamprey,marsh-harrier,marsh-wisp,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7084 games in 87 s.

- The list (14): Adder Ambusher, Alligator Gar, Booming Bittern, Camouflage Frog, Constrictor Coil, The Heron Hag, Lamprey, Marsh Harrier, Marsh Wisp, Newt Doctor, Nutria Reedcutter, Poison Dart Croaker, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | economy (4 resource makers); poison x10; flying x6 | 92% (89%-95%) | 0.65 | 0: 7, 1: 13 | 4x Nutria Reedcutter, 4x Poison Dart Croaker, 3x Adder Ambusher, 3x The Heron Hag, 3x Lamprey, 3x Raven Scout | 7 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x6 | 90% (87%-93%) | 0.3 | 0: 14, 1: 6 | 4x Newt Doctor, 4x Nutria Reedcutter, 3x The Heron Hag, 3x Lamprey, 3x Marsh Wisp, 3x Raven Scout | 7 |
| 3 | open | economy (4 resource makers); tide x7; poison x6 | 81% (78%-85%) | 0.45 | 0: 11, 1: 9 | 4x Newt Doctor, 4x Nutria Reedcutter, 4x Poison Dart Croaker, 3x Alligator Gar, 3x Raven Scout, 2x The Heron Hag | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); economy (4 resource makers); poison x6 | 78% (74%-83%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Nutria Reedcutter, 4x Venomlord Serpent, 3x Alligator Gar, 3x Raven Scout, 2x The Heron Hag | 8 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 96% | 96% | 96% | 100% | 92% | 83% | 100% | 92% | 96% | 63% | 96% |
| 2 swarm | 100% | 96% | 96% | 100% | 92% | 100% | 100% | 83% | 92% | 38% | 92% |
| 3 open | 96% | 100% | 100% | 100% | 67% | 67% | 100% | 75% | 83% | 25% | 83% |
| 4 big | 92% | 96% | 92% | 96% | 71% | 71% | 92% | 67% | 79% | 25% | 83% |
