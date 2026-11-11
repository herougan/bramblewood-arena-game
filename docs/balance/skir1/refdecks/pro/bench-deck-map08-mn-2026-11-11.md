# Focused decks: Map 8 The Glimmer Depths (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool alpine-marmot,blind-cave-fish,blue-ringed-octopus,cave-olm,cave-swiftlet,coffer-mimic,dust-hyena,eagle-owl-quartermaster,echo-matriarch,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,glintsnatch-magpie,grave-grin-hyena,grotto-lobster,lantern-spark-fly,magpie-collector,millipede-hauler,oilbird,quarry-mole,squires-mount,stalactite-golem,star-nosed-mole,upside-down-bat,vampire-bat,whip-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor blind-cave-fish,cave-olm,cave-swiftlet,echo-matriarch,glimmer-spider,glintsnatch-magpie,grotto-lobster,lantern-spark-fly,magpie-collector,oilbird,quarry-mole,stalactite-golem,star-nosed-mole,upside-down-bat,vampire-bat,whip-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1960 games in 424 s.

- The list (27): Alpine Marmot, Blind Cave Fish, Blue-ringed Octopus, Cave Olm, Cave Swiftlet, Coffer Mimic, Dust Hyena, Eagle-Owl Quartermaster, Echo Matriarch, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Glintsnatch Magpie, Grave-Grin Hyena, Grotto Lobster, Lantern Spark Fly, Magpie Collector, Millipede Hauler, Oilbird, Quarry Mole, Squire's Mount, Stalactite Pill Bug, Star-nosed Mole, Upside-Down Bat, Vampire Bat, Whip Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x19 | 83% (78%-88%) | 0.4 | 0: 12, 1: 8 | 4x Cave Swiftlet, 4x Lantern Spark Fly, 4x Magpie Collector, 4x Upside-Down Bat, 3x Eagle-Owl Quartermaster, 1x Giant Cave Huntsman | 11 |
| 2 | open | economy (4 resource makers); flying x12 | 80% (75%-86%) | 0.35 | 0: 13, 1: 7 | 4x Cave Olm, 4x Dust Hyena, 4x Magpie Collector, 4x Upside-Down Bat, 3x Echo Matriarch, 1x Cave Swiftlet | 0 |
| 3 | big | big (13 copies at 1+ Lumber, average 0.7); flying x6 | 74% (69%-80%) | 0.65 | 0: 7, 1: 13 | 4x Alpine Marmot, 4x Oilbird, 3x Blue-ringed Octopus, 3x Echo Matriarch, 3x Giant Cave Huntsman, 3x Lantern Spark Fly | 17 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.8); economy (4 resource makers); armor x9; guard x8 | 67% (61%-74%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Alpine Marmot, 4x Dust Hyena, 4x Stalactite Pill Bug, 3x Echo Matriarch, 3x Grotto Lobster, 2x Millipede Hauler | 13 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 88% | 92% | 100% | 83% | 67% | 54% |
| 2 open | 92% | 83% | 96% | 92% | 92% | 50% | 58% |
| 3 big | 88% | 83% | 96% | 96% | 79% | 21% | 58% |
| 4 family:armor | 75% | 71% | 88% | 88% | 83% | 33% | 33% |
