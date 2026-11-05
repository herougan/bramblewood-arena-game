# Focused decks: Map 8 The Glimmer Depths (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool badger-stonemason,blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,giant-cave-huntsman,glimmer-spider,grotto-lobster,lantern-spark-fly,malachite-golem,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,whip-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:flying,family:night,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7000 games in 180 s.

- The list (17): Badger Stonemason, Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Giant Cave Huntsman, Glimmer Spider, Grotto Lobster, Lantern Spark Fly, Malachite Golem, Prospector Mole, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (7 resource makers); flying x10; night x6 | 89% (85%-94%) | 0.45 | 0: 11, 1: 9 | 4x Lantern Spark Fly, 4x Prospector Mole, 3x Badger Stonemason, 3x Echo Matriarch, 3x Grotto Lobster, 3x Vampire Bat | 10 |
| 2 | open | big (13 copies at 1+ Lumber, average 0.7); flying x14; night x6 | 78% (72%-84%) | 0.65 | 0: 7, 1: 13 | 4x Lantern Spark Fly, 4x Sulfur Cinder Moth, 3x Echo Screecher, 3x Giant Cave Huntsman, 3x Grotto Lobster, 3x Vampire Bat | 0 |
| 3 | family:night | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x10; night x8 | 76% (70%-81%) | 0.5 | 0: 10, 1: 10 | 4x Prospector Mole, 4x Star-nosed Mole, 4x Sulfur Cinder Moth, 3x Echo Matriarch, 3x Echo Screecher, 2x Blind Cave Fish | 13 |
| 4 | family:flying | big (9 copies at 1+ Lumber, average 0.6); flying x10; night x6 | 74% (68%-80%) | 0.55 | 0: 11, 1: 7, 2: 2 | 4x Cave Olm, 4x Glimmer Spider, 4x Lantern Spark Fly, 3x Echo Matriarch, 3x Vampire Bat, 2x Malachite Golem | 13 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 92% | 92% | 92% | 67% | 92% |
| 2 open | 83% | 75% | 92% | 92% | 92% | 54% | 58% |
| 3 family:night | 83% | 79% | 92% | 92% | 88% | 29% | 67% |
| 4 family:flying | 92% | 58% | 92% | 88% | 92% | 50% | 50% |
