# Focused decks: Map 14 The Canopy (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7008 games in 139 s.

- The list (16): Apollo Butterfly, Camouflage Frog, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Pangolin Roller, Poison Dart Croaker, Pride Queen, Proboscis Monkey, Redwood Woodpecker, Spitting Cobra, Vampire Bat, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1 Lumber, average 0.7); economy (7 resource makers) | 77% (71%-82%) | 0.65 | 0: 7, 1: 13 | 4x Leafcutter Gardener, 4x Lyrebird Mimic, 4x Pangolin Roller, 3x Hoopoe Herald, 3x Redwood Woodpecker, 2x Hercules Beetle | 9 |
| 2 | open | big (12 copies at 1 Lumber, average 0.6) | 73% (68%-79%) | 0.6 | 0: 8, 1: 12 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Lyrebird Mimic, 4x Pangolin Roller, 4x Weaver Bird | 0 |
| 3 | big | big (10 copies at 1 Lumber, average 0.5); economy (4 resource makers) | 65% (58%-71%) | 0.5 | 0: 10, 1: 10 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Leafcutter Gardener, 3x Hercules Beetle, 3x Jaguar Stalker, 2x Apollo Butterfly | 14 |
| 4 | swarm | swarm (14 copies at 0 Lumber); night x8; flying x7 | 57% (50%-63%) | 0.3 | 0: 14, 1: 6 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Vampire Bat, 3x Apollo Butterfly, 3x Leafcutter Gardener, 2x Pride Queen | 13 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 42% | 79% | 67% | 63% | 83% | 92% | 100% | 88% |
| 2 open | 50% | 63% | 67% | 54% | 79% | 100% | 100% | 75% |
| 3 big | 29% | 71% | 67% | 38% | 67% | 88% | 92% | 67% |
| 4 swarm | 33% | 63% | 46% | 29% | 67% | 96% | 58% | 63% |
