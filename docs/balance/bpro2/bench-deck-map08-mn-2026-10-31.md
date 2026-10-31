# Focused decks: Map 8 The Glimmer Depths (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool badger-stonemason,blind-cave-fish,cave-olm,echo-screecher,giant-cave-huntsman,glimmer-spider,lantern-spark-fly,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,whip-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7000 games in 125 s.

- The list (14): Badger Stonemason, Blind Cave Fish, Cave Olm, Echo Screecher, Giant Cave Huntsman, Glimmer Spider, Lantern Spark Fly, Prospector Mole, Quarry Mole, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x11 | 81% (76%-86%) | 0.55 | 0: 9, 1: 11 | 4x Glimmer Spider, 4x Lantern Spark Fly, 4x Prospector Mole, 4x Sulfur Cinder Moth, 3x Echo Screecher, 1x Star-nosed Mole | 9 |
| 2 | open | swarm (15 copies at 0 Lumber); economy (4 resource makers) | 72% (66%-78%) | 0.25 | 0: 15, 1: 5 | 4x Cave Olm, 4x Lantern Spark Fly, 4x Prospector Mole, 3x Blind Cave Fish, 3x Glimmer Spider, 2x Giant Cave Huntsman | 0 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); flying x8 | 70% (64%-76%) | 0.2 | 0: 16, 1: 4 | 4x Lantern Spark Fly, 4x Prospector Mole, 4x Star-nosed Mole, 4x Vampire Bat, 2x Badger Stonemason, 2x Glimmer Spider | 10 |
| 4 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 70% (64%-75%) | 0.2 | 0: 16, 1: 4 | 4x Blind Cave Fish, 4x Lantern Spark Fly, 4x Prospector Mole, 4x Star-nosed Mole, 3x Giant Cave Huntsman, 1x Whip Spider | 7 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 75% | 46% | 100% | 67% | 79% |
| 2 open | 96% | 96% | 79% | 38% | 88% | 42% | 67% |
| 3 economy | 96% | 96% | 63% | 29% | 92% | 46% | 67% |
| 4 swarm | 100% | 96% | 63% | 38% | 92% | 17% | 83% |
