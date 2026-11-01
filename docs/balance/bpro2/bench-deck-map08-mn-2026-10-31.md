# Focused decks: Map 8 The Glimmer Depths (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool badger-stonemason,blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,giant-cave-huntsman,glimmer-spider,grotto-lobster,lantern-spark-fly,malachite-golem,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,whip-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6734 games in 116 s.

- The list (17): Badger Stonemason, Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Giant Cave Huntsman, Glimmer Spider, Grotto Lobster, Lantern Spark Fly, Malachite Golem, Prospector Mole, Quarry Mole, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (6 resource makers); flying x7 | 86% (81%-90%) | 0.3 | 0: 14, 1: 6 | 4x Lantern Spark Fly, 4x Star-nosed Mole, 3x Badger Stonemason, 3x Grotto Lobster, 3x Prospector Mole, 3x Vampire Bat | 6 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x6; night x6 | 80% (75%-85%) | 0.45 | 0: 11, 1: 9 | 4x Prospector Mole, 4x Star-nosed Mole, 3x Echo Screecher, 3x Giant Cave Huntsman, 3x Grotto Lobster, 3x Vampire Bat | 9 |
| 3 | open | swarm (18 copies at 0 Lumber); economy (4 resource makers); flying x10; night x8 | 79% (73%-84%) | 0.1 | 0: 18, 1: 2 | 4x Lantern Spark Fly, 4x Prospector Mole, 4x Star-nosed Mole, 4x Vampire Bat, 2x Blind Cave Fish, 2x Echo Matriarch | 0 |
| 4 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (6 resource makers) | 74% (68%-80%) | 0.6 | 0: 8, 1: 12 | 4x Lantern Spark Fly, 4x Prospector Mole, 4x Quarry Mole, 3x Giant Cave Huntsman, 3x Grotto Lobster, 2x Badger Stonemason | 12 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 96% | 63% | 96% | 54% | 92% |
| 2 big | 100% | 100% | 88% | 79% | 100% | 33% | 63% |
| 3 open | 83% | 92% | 92% | 63% | 88% | 50% | 83% |
| 4 economy | 88% | 96% | 79% | 58% | 96% | 38% | 63% |
