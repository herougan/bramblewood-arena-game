# Focused decks: Map 8 The Glimmer Depths (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool alpine-marmot,badger-stonemason,blind-cave-fish,blue-ringed-octopus,bombardier-beetle,cave-olm,dung-beetle,dust-hyena,eagle-owl-quartermaster,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,grave-grin-hyena,grotto-lobster,hawthorn-shieldbug,lantern-spark-fly,malachite-golem,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,stoat-cutthroat,sulfur-cinder-moth,vampire-bat,whip-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:armor,open --anchor badger-stonemason,blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,giant-cave-huntsman,glimmer-spider,grotto-lobster,lantern-spark-fly,malachite-golem,prospector-mole,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,whip-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6944 games in 165 s.

- The list (28): Alpine Marmot, Badger Stonemason, Blind Cave Fish, Blue-ringed Octopus, Bombardier Beetle, Cave Olm, Dung Beetle, Dust Hyena, Eagle-Owl Quartermaster, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Grave-Grin Hyena, Grotto Lobster, Hawthorn Shieldbug, Lantern Spark Fly, Malachite Golem, Prospector Mole, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat, Sulfur Cinder Moth, Vampire Bat, Whip Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x10; armor x6 | 89% (85%-93%) | 0.6 | 0: 8, 1: 12 | 4x Dust Hyena, 4x Lantern Spark Fly, 3x Eagle-Owl Quartermaster, 3x Grotto Lobster, 3x Hawthorn Shieldbug, 3x Sulfur Cinder Moth | 10 |
| 2 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (7 resource makers); swarm x6 | 85% (81%-90%) | 0.45 | 0: 11, 1: 9 | 4x Prospector Mole, 4x Star-nosed Mole, 3x Bombardier Beetle, 3x Dust Hyena, 3x Grotto Lobster, 3x Wolf Spider Mother | 14 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); flying x10 | 84% (79%-89%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Lantern Spark Fly, 4x Sulfur Cinder Moth, 3x Bombardier Beetle, 3x Dust Hyena, 2x Echo Screecher | 0 |
| 4 | family:armor | big (9 copies at 1+ Lumber, average 0.6); economy (8 resource makers); armor x9; guard x7 | 81% (76%-86%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Dust Hyena, 4x Hawthorn Shieldbug, 4x Prospector Mole, 3x Stalactite Pill Bug, 3x Vampire Bat, 2x Grotto Lobster | 17 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 92% | 100% | 100% | 100% | 58% | 75% |
| 2 economy | 100% | 96% | 100% | 92% | 92% | 46% | 71% |
| 3 open | 100% | 83% | 100% | 96% | 96% | 50% | 63% |
| 4 family:armor | 92% | 96% | 92% | 96% | 88% | 33% | 71% |
