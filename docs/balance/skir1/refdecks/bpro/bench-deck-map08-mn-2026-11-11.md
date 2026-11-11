# Focused decks: Map 8 The Glimmer Depths (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool blind-cave-fish,cave-olm,cave-swiftlet,echo-matriarch,glimmer-spider,glintsnatch-magpie,grotto-lobster,lantern-spark-fly,magpie-collector,oilbird,quarry-mole,stalactite-golem,star-nosed-mole,upside-down-bat,vampire-bat,whip-spider --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2142 games in 423 s.

- The list (16): Blind Cave Fish, Cave Olm, Cave Swiftlet, Echo Matriarch, Glimmer Spider, Glintsnatch Magpie, Grotto Lobster, Lantern Spark Fly, Magpie Collector, Oilbird, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Upside-Down Bat, Vampire Bat, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x11 | 79% (74%-85%) | 0.2 | 0: 16, 1: 4 | 4x Blind Cave Fish, 4x Lantern Spark Fly, 4x Oilbird, 4x Upside-Down Bat, 3x Vampire Bat, 1x Cave Olm | 18 |
| 2 | swarm | swarm (14 copies at 0 Lumber); flying x10 | 71% (65%-77%) | 0.3 | 0: 14, 1: 6 | 4x Cave Olm, 4x Lantern Spark Fly, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Glintsnatch Magpie, 2x Blind Cave Fish | 10 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5); flying x10; night x6 | 66% (60%-72%) | 0.45 | 0: 11, 1: 9 | 4x Star-nosed Mole, 4x Upside-Down Bat, 3x Echo Matriarch, 3x Grotto Lobster, 3x Quarry Mole, 3x Vampire Bat | 10 |
| 4 | open | big (12 copies at 1+ Lumber, average 0.6); flying x11 | 58% (52%-65%) | 0.6 | 0: 8, 1: 12 | 4x Cave Swiftlet, 4x Glintsnatch Magpie, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Grotto Lobster, 2x Oilbird | 0 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 83% | 83% | 83% | 100% | 96% | 38% | 71% |
| 2 swarm | 83% | 79% | 92% | 92% | 83% | 33% | 33% |
| 3 big | 75% | 58% | 83% | 88% | 83% | 25% | 50% |
| 4 open | 63% | 75% | 67% | 79% | 75% | 25% | 25% |
