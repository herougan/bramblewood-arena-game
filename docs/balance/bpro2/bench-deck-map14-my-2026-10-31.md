# Focused decks: Map 14 The Canopy (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7184 games in 109 s.

- The list (16): Apollo Butterfly, Camouflage Frog, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Pangolin Roller, Poison Dart Croaker, Pride Queen, Proboscis Monkey, Redwood Woodpecker, Spitting Cobra, Vampire Bat, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1 Lumber, average 0.8); economy (4 resource makers) | 77% (72%-83%) | 0.8 | 0: 4, 1: 16 | 4x Hoopoe Herald, 4x Pangolin Roller, 4x Redwood Woodpecker, 4x Weaver Bird, 3x Camouflage Frog, 1x Hercules Beetle | 12 |
| 2 | economy | big (13 copies at 1 Lumber, average 0.7); economy (8 resource makers) | 72% (66%-78%) | 0.65 | 0: 7, 1: 13 | 4x Leafcutter Gardener, 4x Pangolin Roller, 4x Redwood Woodpecker, 3x Hercules Beetle, 3x Hoopoe Herald, 2x Spitting Cobra | 13 |
| 3 | open | big (12 copies at 1 Lumber, average 0.6); economy (4 resource makers) | 56% (50%-62%) | 0.6 | 0: 8, 1: 12 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Poison Dart Croaker, 4x Redwood Woodpecker | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x6 | 54% (47%-60%) | 0.3 | 0: 14, 1: 6 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 3x Apollo Butterfly, 3x Hercules Beetle, 3x Vampire Bat, 3x Weaver Bird | 13 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 42% | 88% | 71% | 67% | 92% | 100% | 83% | 75% |
| 2 economy | 38% | 75% | 54% | 63% | 79% | 88% | 88% | 92% |
| 3 open | 17% | 63% | 33% | 38% | 50% | 96% | 71% | 79% |
| 4 swarm | 13% | 58% | 38% | 42% | 50% | 88% | 67% | 75% |
