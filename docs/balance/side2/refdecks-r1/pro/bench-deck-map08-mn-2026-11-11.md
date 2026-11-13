# Focused decks: Map 8 The Glimmer Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool alpine-marmot,barrow-leech-bat,bee-sentry,blind-cave-fish,blue-ringed-octopus,cave-olm,cave-swiftlet,dust-hyena,eagle-owl-quartermaster,echo-matriarch,echo-screecher,fire-ant-raft,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,grave-grin-hyena,hawthorn-shieldbug,lantern-spark-fly,quarry-mole,raft-spider,stalactite-golem,star-nosed-mole,stoat-cutthroat,sulfur-cinder-moth,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:poison,big,open --anchor barrow-leech-bat,blind-cave-fish,cave-olm,cave-swiftlet,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,lantern-spark-fly,quarry-mole,stalactite-golem,sulfur-cinder-moth --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8862 games in 179 s.

- The list (25): Alpine Marmot, Barrow Leech, Bee Sentry, Blind Cave Fish, Blue-ringed Octopus, Cave Olm, Cave Swiftlet, Dust Hyena, Eagle-Owl Quartermaster, Echo Matriarch, Echo Screecher, Fire Ant Raft, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Grave-Grin Hyena, Hawthorn Shieldbug, Lantern Spark Fly, Quarry Mole, Raft Spider, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat, Sulfur Cinder Moth, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x13 | 90% (86%-94%) | 0.45 | 0: 11, 1: 9 | 4x Dust Hyena, 4x Lantern Spark Fly, 3x Barrow Leech, 3x Bee Sentry, 3x Eagle-Owl Quartermaster, 3x Giant Cave Huntsman | 16 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); flying x7; poison x6 | 82% (77%-87%) | 0.4 | 0: 12, 1: 8 | 4x Bee Sentry, 4x Cave Olm, 4x Dust Hyena, 3x Echo Screecher, 3x Giant Cave Huntsman, 2x Fire Ant Raft | 13 |
| 3 | family:poison | swarm (14 copies at 0 Lumber); poison x10; flying x8 | 80% (75%-86%) | 0.3 | 0: 14, 1: 6 | 4x Bee Sentry, 4x Lantern Spark Fly, 3x Alpine Marmot, 3x Gallery Orb-Weaver, 3x Glimmer Spider, 3x Star-nosed Mole | 20 |
| 4 | open | big (13 copies at 1+ Lumber, average 0.7); economy (4 resource makers); flying x7 | 80% (75%-85%) | 0.65 | 0: 7, 1: 13 | 4x Dust Hyena, 4x Sulfur Cinder Moth, 3x Blind Cave Fish, 3x Blue-ringed Octopus, 3x Echo Screecher, 3x Hawthorn Shieldbug | 0 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 96% | 92% | 100% | 67% | 75% |
| 2 big | 100% | 96% | 92% | 88% | 96% | 42% | 58% |
| 3 family:poison | 96% | 92% | 83% | 96% | 96% | 46% | 54% |
| 4 open | 100% | 88% | 100% | 88% | 92% | 42% | 50% |
