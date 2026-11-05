# Focused decks: Map 14 The Canopy (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6784 games in 178 s.

- The list (16): Apollo Butterfly, Camouflage Frog, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Pangolin Roller, Poison Dart Croaker, Pride Queen, Proboscis Monkey, Redwood Woodpecker, Spitting Cobra, Vampire Bat, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (14 copies at 1 Lumber, average 0.7); economy (4 resource makers) | 74% (69%-80%) | 0.7 | 0: 6, 1: 14 | 4x Lyrebird Mimic, 4x Redwood Woodpecker, 4x Weaver Bird, 3x Hoopoe Herald, 3x Leafcutter Gardener, 2x Pangolin Roller | 0 |
| 2 | big | big (13 copies at 1 Lumber, average 0.7); night x7 | 66% (60%-72%) | 0.65 | 0: 7, 1: 13 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 3x Lyrebird Mimic, 3x Pangolin Roller, 3x Spitting Cobra, 3x Vampire Bat | 12 |
| 3 | family:tide | big (18 copies at 1 Lumber, average 0.9); economy (4 resource makers); tide x8 | 66% (60%-71%) | 0.9 | 0: 2, 1: 18 | 4x Camouflage Frog, 4x Poison Dart Croaker, 4x Redwood Woodpecker, 3x Lyrebird Mimic, 3x Pangolin Roller, 2x Apollo Butterfly | 11 |
| 4 | swarm | swarm (15 copies at 0 Lumber); flying x7 | 66% (60%-71%) | 0.25 | 0: 15, 1: 5 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Leafcutter Gardener, 3x Pangolin Roller, 3x Vampire Bat, 2x Weaver Bird | 10 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 46% | 92% | 58% | 83% | 67% | 88% | 100% | 63% |
| 2 big | 46% | 92% | 54% | 67% | 50% | 96% | 75% | 50% |
| 3 family:tide | 29% | 96% | 33% | 75% | 46% | 88% | 92% | 67% |
| 4 swarm | 42% | 100% | 46% | 75% | 50% | 100% | 75% | 38% |
