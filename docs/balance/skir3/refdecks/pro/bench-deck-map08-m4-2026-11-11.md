# Focused decks: Map 8 Caves & Alcoves (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,alligator-gar,barkplate-beetle,barrow-leech-bat,bee-forager,blind-cave-fish,cave-olm,corpse-flower-beetle,driftwood-crab,echo-matriarch,echo-screecher,fire-ant-raft,fungus-gnat-cloud,gallery-orb-weaver,giant-cave-huntsman,hawthorn-shieldbug,mudpuppy,muskrat-lodgekeeper,newt-doctor,otter-centurion,planarian-splitter,quarry-mole,raft-spider,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor barrow-leech-bat,blind-cave-fish,cave-olm,corpse-flower-beetle,driftwood-crab,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,hawthorn-shieldbug,quarry-mole,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9614 games in 144 s.

- The list (28): Alley Cat, Alligator Gar, Barkplate Beetle, Barrow Leech, Bee Forager, Blind Cave Fish, Cave Olm, Corpse-flower Beetle, Driftwood Crab, Echo Matriarch, Echo Screecher, Fire Ant Raft, Fungus Gnat Cloud, Gallery Orb-Weaver, Giant Cave Huntsman, Hawthorn Shieldbug, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Otter Centurion, Planarian Splitter, Quarry Mole, Raft Spider, Rot-Swollen Carcass, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x10; night x6 | 95% (92%-97%) | 0.45 | 0: 11, 1: 9 | 4x Fungus Gnat Cloud, 4x Star-nosed Mole, 3x Alley Cat, 3x Echo Matriarch, 3x Echo Screecher, 3x Giant Cave Huntsman | 10 |
| 2 | family:armor | economy (4 resource makers); armor x8; guard x8 | 92% (89%-95%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Mudpuppy, 4x Star-nosed Mole | 16 |
| 3 | open | swarm (14 copies at 0 Lumber); flying x13; night x6 | 85% (81%-89%) | 0.3 | 0: 14, 1: 6 | 4x Blind Cave Fish, 4x Fungus Gnat Cloud, 3x Alley Cat, 3x Barrow Leech, 3x Bee Forager, 3x Echo Matriarch | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); armor x12; guard x8 | 83% (79%-87%) | 1.15 | 0: 5, 1: 7, 2: 8 | 4x Barkplate Beetle, 4x Driftwood Crab, 4x Mudpuppy, 4x Stalactite Pill Bug, 3x Giant Cave Huntsman, 1x Cave Olm | 20 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 92% | 100% | 88% | 100% | 100% | 96% | 100% | 83% | 88% |
| 2 family:armor | 96% | 96% | 79% | 100% | 88% | 100% | 100% | 96% | 100% | 67% | 92% |
| 3 open | 92% | 83% | 83% | 100% | 63% | 88% | 92% | 88% | 96% | 67% | 83% |
| 4 big | 96% | 96% | 88% | 100% | 71% | 100% | 88% | 71% | 96% | 54% | 50% |
