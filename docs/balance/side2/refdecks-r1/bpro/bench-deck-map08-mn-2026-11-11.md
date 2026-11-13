# Focused decks: Map 8 The Glimmer Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool barrow-leech-bat,blind-cave-fish,cave-olm,cave-swiftlet,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,lantern-spark-fly,quarry-mole,stalactite-golem,sulfur-cinder-moth --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:night,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 161 s.

- The list (13): Barrow Leech, Blind Cave Fish, Cave Olm, Cave Swiftlet, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Lantern Spark Fly, Quarry Mole, Stalactite Pill Bug, Sulfur Cinder Moth.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x14; night x6 | 81% (76%-86%) | 0.45 | 0: 11, 1: 9 | 4x Cave Swiftlet, 4x Lantern Spark Fly, 3x Blind Cave Fish, 3x Echo Matriarch, 3x Echo Screecher, 3x Gallery Orb-Weaver | 10 |
| 2 | open | big (13 copies at 1+ Lumber, average 0.7); flying x10 | 75% (69%-81%) | 0.65 | 0: 7, 1: 13 | 4x Gallery Orb-Weaver, 4x Lantern Spark Fly, 3x Cave Olm, 3x Echo Screecher, 3x Giant Cave Huntsman, 3x Sulfur Cinder Moth | 0 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); flying x10; night x6 | 73% (67%-79%) | 0.5 | 0: 10, 1: 10 | 4x Glimmer Spider, 4x Lantern Spark Fly, 3x Barrow Leech, 3x Blind Cave Fish, 3x Cave Olm, 3x Echo Matriarch | 13 |
| 4 | family:night | big (20 copies at 1+ Lumber, average 1.0); flying x12; night x9 | 49% (42%-56%) | 1 | 1: 20 | 4x Gallery Orb-Weaver, 4x Glimmer Spider, 3x Barrow Leech, 3x Echo Matriarch, 3x Echo Screecher, 3x Sulfur Cinder Moth | 10 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 92% | 96% | 92% | 92% | 46% | 54% |
| 2 open | 100% | 96% | 83% | 79% | 79% | 42% | 46% |
| 3 big | 92% | 88% | 88% | 71% | 83% | 46% | 46% |
| 4 family:night | 67% | 67% | 58% | 58% | 54% | 17% | 25% |
