# Focused decks: Map 6 Sable Swampmire (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alligator-gar,booming-bittern,camouflage-frog,constrictor-coil,cypress-root-lurker,fire-ant-raft,heron-hag,lamprey,marsh-harrier,newt-doctor,nutria-reedcutter,poison-dart-croaker,raven-scout,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:poison,family:tide,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6974 games in 91 s.

- The list (15): Adder Ambusher, Alligator Gar, Booming Bittern, Camouflage Frog, Constrictor Coil, Cypress Root Lurker, Fire Ant Raft, The Heron Hag, Lamprey, Marsh Harrier, Newt Doctor, Nutria Reedcutter, Poison Dart Croaker, Raven Scout, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | poison x10; tide x7 | 81% (77%-84%) | 0.65 | 0: 7, 1: 13 | 4x Fire Ant Raft, 4x Newt Doctor, 3x Adder Ambusher, 3x Alligator Gar, 3x The Heron Hag, 3x Raven Scout | 10 |
| 2 | open | poison x6; flying x6 | 80% (77%-83%) | 0.6 | 0: 8, 1: 12 | 4x Newt Doctor, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Booming Bittern, 3x The Heron Hag, 3x Marsh Harrier | 0 |
| 3 | family:tide | tide x10; poison x6 | 75% (71%-79%) | 0.8 | 0: 4, 1: 16 | 4x Lamprey, 4x Nutria Reedcutter, 4x Poison Dart Croaker, 3x Alligator Gar, 3x Camouflage Frog, 2x Adder Ambusher | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3) | 69% (65%-74%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Newt Doctor, 4x Venomlord Serpent, 3x Alligator Gar, 3x Raven Scout, 2x Booming Bittern | 14 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 96% | 96% | 92% | 92% | 92% | 96% | 96% | 96% | 83% | 21% | 29% |
| 2 open | 88% | 88% | 100% | 100% | 96% | 100% | 100% | 96% | 75% | 8% | 29% |
| 3 family:tide | 79% | 92% | 88% | 96% | 75% | 92% | 96% | 92% | 79% | 8% | 29% |
| 4 big | 88% | 79% | 83% | 96% | 63% | 79% | 92% | 96% | 63% | 4% | 21% |
