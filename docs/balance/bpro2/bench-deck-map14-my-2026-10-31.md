# Focused decks: Map 14 The Canopy (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7264 games in 179 s.

- The list (16): Apollo Butterfly, Camouflage Frog, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Pangolin Roller, Poison Dart Croaker, Pride Queen, Proboscis Monkey, Redwood Woodpecker, Spitting Cobra, Vampire Bat, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1 Lumber, average 0.7); economy (8 resource makers) | 82% (77%-87%) | 0.65 | 0: 7, 1: 13 | 4x Leafcutter Gardener, 4x Poison Dart Croaker, 4x Redwood Woodpecker, 3x Hoopoe Herald, 3x Pangolin Roller, 2x Hercules Beetle | 7 |
| 2 | open | big (9 copies at 1 Lumber, average 0.5); economy (4 resource makers) | 80% (74%-85%) | 0.45 | 0: 11, 1: 9 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 3x Apollo Butterfly, 3x Pangolin Roller, 3x Poison Dart Croaker, 3x Spitting Cobra | 0 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x6 | 77% (71%-82%) | 0.3 | 0: 14, 1: 6 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x Lyrebird Mimic, 2x Pangolin Roller, 2x Vampire Bat | 7 |
| 4 | big | big (12 copies at 1 Lumber, average 0.6); economy (4 resource makers) | 71% (66%-77%) | 0.6 | 0: 8, 1: 12 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Leafcutter Gardener, 3x Spitting Cobra, 3x Weaver Bird, 2x Pride Queen | 9 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 58% | 100% | 71% | 75% | 75% | 96% | 92% | 88% |
| 2 open | 50% | 96% | 75% | 75% | 88% | 96% | 83% | 75% |
| 3 swarm | 42% | 100% | 71% | 79% | 79% | 88% | 79% | 75% |
| 4 big | 25% | 92% | 63% | 75% | 75% | 88% | 88% | 67% |
