# Focused decks: Map 8 Caves & Alcoves (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,alligator-gar,blind-cave-fish,cave-olm,dung-beetle,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grey-seal-bull,gull-thief,hollow-belly-rat,kittiwake-flock,malachite-golem,newt-doctor,octopus-tactician,old-sturgeon,otter-centurion,pelican-diver,planarian-splitter,puffin-diver,quarry-mole,razorbill,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:tide,big,open --anchor blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,gull-thief,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7656 games in 119 s.

- The list (27): Alley Cat, Alligator Gar, Blind Cave Fish, Cave Olm, Dung Beetle, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Grey Seal Bull, Gull Thief, Hollow-belly Rat, Kittiwake Flock, Malachite Golem, Newt Doctor, Octopus Tactician, Old Sturgeon, Otter Centurion, Pelican Diver, Planarian Splitter, Puffin Diver, Quarry Mole, Razorbill, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (14 copies at 1+ Lumber, average 0.7); flying x10; siege x6 | 88% (85%-92%) | 0.7 | 0: 6, 1: 14 | 4x Hollow-belly Rat, 4x Kittiwake Flock, 4x Planarian Splitter, 3x Echo Matriarch, 3x Echo Screecher, 2x Otter Centurion | 20 |
| 2 | family:flying | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x14 | 86% (82%-90%) | 0.6 | 0: 8, 1: 12 | 4x Grey Seal Bull, 4x Gull Thief, 4x Kittiwake Flock, 4x Sulfur Cinder Moth, 2x Echo Matriarch, 2x Giant Cave Huntsman | 14 |
| 3 | open | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x6 | 83% (79%-87%) | 0.3 | 0: 14, 1: 6 | 4x Cave Olm, 4x Gallery Orb-Weaver, 4x Gull Thief, 4x Star-nosed Mole, 2x Alley Cat, 2x Sulfur Cinder Moth | 0 |
| 4 | family:tide | swarm (14 copies at 0 Lumber); economy (4 resource makers); tide x8 | 76% (71%-81%) | 0.3 | 0: 14, 1: 6 | 4x Blind Cave Fish, 4x Grey Seal Bull, 4x Gull Thief, 3x Newt Doctor, 3x Star-nosed Mole, 2x Giant Cave Huntsman | 13 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 83% | 92% | 96% | 88% | 79% | 96% | 96% | 96% | 75% | 71% |
| 2 family:flying | 92% | 79% | 96% | 92% | 83% | 96% | 92% | 100% | 83% | 83% | 50% |
| 3 open | 96% | 79% | 92% | 79% | 79% | 83% | 96% | 100% | 92% | 79% | 33% |
| 4 family:tide | 79% | 83% | 83% | 83% | 75% | 71% | 100% | 83% | 83% | 63% | 29% |
