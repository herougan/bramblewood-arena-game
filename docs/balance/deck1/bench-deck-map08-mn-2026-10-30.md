# Focused decks: Map 8 The Glimmer Depths (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool baby-bat,badger-stonemason,blind-cave-fish,blue-ringed-octopus,cave-olm,cave-pseudoscorpion,dynamite-packrat,eagle-owl-quartermaster,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,grave-grin-hyena,guano-beetle,lantern-spark-fly,prospector-mole,quarry-mole,squires-mount,stalactite-golem,star-nosed-mole,stoat-cutthroat,subterraneaner,sulfur-cinder-moth,vampire-bat,whip-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor badger-stonemason,blind-cave-fish,cave-olm,echo-screecher,giant-cave-huntsman,glimmer-spider,lantern-spark-fly,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,whip-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12964 games in 173 s.

- The list (26): Baby Bat, Badger Stonemason, Blind Cave Fish, Blue-ringed Octopus, Cave Olm, Cave Pseudoscorpion, Dynamite Packrat, Eagle-Owl Quartermaster, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Grave-Grin Hyena, Guano Beetle, Lantern Spark Fly, Prospector Mole, Quarry Mole, Squire's Mount, Stalactite Golem, Star-nosed Mole, Stoat Cutthroat, Subterraneaner, Sulfur Cinder Moth, Vampire Bat, Whip Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1+ Lumber, average 0.9); flying x7 | 80% (75%-86%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Lantern Spark Fly, 4x Subterraneaner, 3x Blue-ringed Octopus, 3x Stalactite Golem, 3x Sulfur Cinder Moth, 3x Wolf Spider Mother | 13 |
| 2 | open | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); evasion x6 | 79% (73%-84%) | 0.45 | 0: 11, 1: 9 | 4x Lantern Spark Fly, 4x Prospector Mole, 3x Blind Cave Fish, 3x Gallery Orb-Weaver, 3x Squire's Mount, 3x Subterraneaner | 0 |
| 3 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (7 resource makers) | 78% (72%-84%) | 0.5 | 0: 10, 1: 10 | 4x Prospector Mole, 4x Star-nosed Mole, 4x Subterraneaner, 3x Badger Stonemason, 3x Glimmer Spider, 2x Baby Bat | 13 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); evasion x7 | 77% (71%-83%) | 0.3 | 0: 14, 1: 6 | 4x Prospector Mole, 4x Star-nosed Mole, 4x Subterraneaner, 3x Blind Cave Fish, 3x Lantern Spark Fly, 2x Blue-ringed Octopus | 7 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 79% | 63% | 83% | 67% | 75% |
| 2 open | 100% | 92% | 79% | 63% | 75% | 58% | 83% |
| 3 economy | 100% | 83% | 75% | 63% | 75% | 63% | 88% |
| 4 swarm | 100% | 88% | 67% | 63% | 83% | 46% | 92% |
