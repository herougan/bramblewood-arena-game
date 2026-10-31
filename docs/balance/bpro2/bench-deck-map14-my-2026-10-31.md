# Focused decks: Map 14 The Canopy (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7008 games in 89 s.

- The list (14): Apollo Butterfly, Camouflage Frog, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Pangolin Roller, Poison Dart Croaker, Redwood Woodpecker, Spitting Cobra, Vampire Bat, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (12 copies at 1 Lumber, average 0.6); economy (6 resource makers) | 85% (80%-90%) | 0.6 | 0: 8, 1: 12 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x Pangolin Roller, 4x Weaver Bird, 2x Kinkajou Lurker, 2x Redwood Woodpecker | 10 |
| 2 | big | big (10 copies at 1 Lumber, average 0.5); economy (4 resource makers) | 83% (78%-88%) | 0.5 | 0: 10, 1: 10 | 4x Leafcutter Gardener, 4x Weaver Bird, 3x Apollo Butterfly, 3x Hercules Beetle, 3x Hoopoe Herald, 3x Lyrebird Mimic | 11 |
| 3 | open | big (12 copies at 1 Lumber, average 0.6) | 73% (67%-79%) | 0.6 | 0: 8, 1: 12 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Pangolin Roller, 3x Hercules Beetle, 3x Spitting Cobra, 2x Kinkajou Lurker | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x6 | 56% (50%-62%) | 0.3 | 0: 14, 1: 6 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 3x Apollo Butterfly, 3x Hercules Beetle, 3x Jaguar Stalker, 3x Vampire Bat | 10 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 79% | 67% | 88% | 75% | 92% | 100% | 92% | 88% |
| 2 big | 75% | 71% | 88% | 67% | 88% | 96% | 88% | 92% |
| 3 open | 63% | 67% | 54% | 75% | 63% | 96% | 96% | 71% |
| 4 swarm | 21% | 54% | 54% | 25% | 58% | 100% | 63% | 71% |
