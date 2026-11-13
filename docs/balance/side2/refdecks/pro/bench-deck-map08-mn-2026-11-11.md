# Focused decks: Map 8 The Glimmer Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool alpine-marmot,barrow-leech-bat,blind-cave-fish,blue-ringed-octopus,bombardier-beetle,cave-olm,dust-hyena,eagle-owl-quartermaster,echo-matriarch,echo-screecher,fruit-bat,gallery-orb-weaver,giant-cave-huntsman,glow-worm,grave-grin-hyena,hawthorn-shieldbug,millipede-hauler,quarry-mole,raft-spider,stalactite-golem,star-nosed-mole,stoat-cutthroat,sulfur-cinder-moth,whip-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor barrow-leech-bat,blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,fruit-bat,gallery-orb-weaver,giant-cave-huntsman,glow-worm,quarry-mole,stalactite-golem,sulfur-cinder-moth,whip-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8834 games in 383 s.

- The list (25): Alpine Marmot, Barrow Leech, Blind Cave Fish, Blue-ringed Octopus, Bombardier Beetle, Cave Olm, Dust Hyena, Eagle-Owl Quartermaster, Echo Matriarch, Echo Screecher, Fruit Bat, Gallery Orb-Weaver, Giant Cave Huntsman, Glow-worm, Grave-Grin Hyena, Hawthorn Shieldbug, Millipede Hauler, Quarry Mole, Raft Spider, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat, Sulfur Cinder Moth, Whip Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x8 | 86% (82%-91%) | 0.6 | 0: 8, 1: 12 | 4x Dust Hyena, 4x Fruit Bat, 4x Hawthorn Shieldbug, 4x Sulfur Cinder Moth, 3x Echo Screecher, 1x Eagle-Owl Quartermaster | 0 |
| 2 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x9; night x6 | 86% (81%-90%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Fruit Bat, 3x Cave Olm, 3x Eagle-Owl Quartermaster, 3x Echo Matriarch, 3x Echo Screecher | 12 |
| 3 | family:armor | big (11 copies at 1+ Lumber, average 0.8); armor x8; guard x8 | 74% (68%-80%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Cave Olm, 4x Hawthorn Shieldbug, 4x Stalactite Pill Bug, 3x Dust Hyena, 3x Echo Matriarch, 2x Glow-worm | 13 |
| 4 | big | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 68% (62%-74%) | 0.45 | 0: 11, 1: 9 | 4x Blind Cave Fish, 4x Dust Hyena, 4x Sulfur Cinder Moth, 3x Blue-ringed Octopus, 3x Star-nosed Mole, 2x Giant Cave Huntsman | 12 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 92% | 96% | 100% | 92% | 96% | 46% | 83% |
| 2 family:flying | 92% | 100% | 100% | 100% | 96% | 42% | 71% |
| 3 family:armor | 83% | 100% | 83% | 79% | 83% | 38% | 50% |
| 4 big | 71% | 79% | 96% | 75% | 79% | 25% | 50% |
