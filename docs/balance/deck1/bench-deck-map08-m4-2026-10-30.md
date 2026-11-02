# Focused decks: Map 8 Caves & Alcoves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,alligator-gar,bee-forager,blind-cave-fish,bombardier-beetle,cave-olm,dung-beetle,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,newt-doctor,octopus-tactician,otter-centurion,pelican-diver,pincushion-urchin,planarian-splitter,puffin-diver,quarry-mole,rock-pool-starfish,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus big,swarm,family:flying,open --anchor blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7260 games in 78 s.

- The list (28): Alley Cat, Alligator Gar, Bee Forager, Blind Cave Fish, Bombardier Beetle, Cave Olm, Dung Beetle, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Grotto Lobster, Hollow-belly Rat, Malachite Golem, Newt Doctor, Octopus Tactician, Otter Centurion, Pelican Diver, Pincushion Urchin, Planarian Splitter, Puffin Diver, Quarry Mole, Rock Pool Starfish, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5); flying x10; night x7 | 98% (96%-100%) | 0.45 | 0: 11, 1: 9 | 4x Dung Beetle, 4x Vampire Bat, 3x Bee Forager, 3x Echo Matriarch, 3x Giant Cave Huntsman, 3x Wolf Spider Mother | 14 |
| 2 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x16; night x7 | 92% (89%-95%) | 0.4 | 0: 12, 1: 8 | 4x Bee Forager, 4x Newt Doctor, 4x Vampire Bat, 3x Echo Screecher, 3x Sulfur Cinder Moth, 2x Puffin Diver | 17 |
| 3 | open | big (10 copies at 1+ Lumber, average 0.5); siege x6; flying x6 | 92% (89%-95%) | 0.5 | 0: 10, 1: 10 | 4x Quarry Mole, 4x Star-nosed Mole, 3x Dung Beetle, 3x Echo Matriarch, 3x Echo Screecher, 3x Otter Centurion | 0 |
| 4 | swarm | swarm (17 copies at 0 Lumber); flying x7; night x7 | 88% (85%-92%) | 0.15 | 0: 17, 1: 3 | 4x Alley Cat, 4x Newt Doctor, 4x Vampire Bat, 3x Echo Screecher, 3x Star-nosed Mole, 2x Otter Centurion | 12 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 83% | 100% | 100% | 100% | 100% | 100% | 96% | 100% | 96% | 100% |
| 2 family:flying | 100% | 71% | 96% | 100% | 100% | 96% | 88% | 96% | 100% | 71% | 100% |
| 3 open | 100% | 71% | 96% | 96% | 96% | 92% | 96% | 92% | 92% | 83% | 100% |
| 4 swarm | 100% | 67% | 83% | 92% | 96% | 88% | 83% | 88% | 100% | 75% | 100% |
