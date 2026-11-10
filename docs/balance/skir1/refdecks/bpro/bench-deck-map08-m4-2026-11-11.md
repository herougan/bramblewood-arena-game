# Focused decks: Map 8 Caves & Alcoves (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool barrow-leech-bat,blind-cave-fish,cave-olm,corpse-flower-beetle,driftwood-crab,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,hawthorn-shieldbug,quarry-mole,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:flying,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3212 games in 599 s.

- The list (17): Barrow Leech, Blind Cave Fish, Cave Olm, Corpse-flower Beetle, Driftwood Crab, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Hawthorn Shieldbug, Quarry Mole, Rot-Swollen Carcass, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | economy (4 resource makers); flying x11 | 97% (95%-99%) | 0.7 | 0: 6, 1: 14 | 4x Driftwood Crab, 4x Sulfur Cinder Moth, 4x Upside-Down Bat, 3x Echo Matriarch, 3x Giant Cave Huntsman, 2x Cave Olm | 10 |
| 2 | family:armor | economy (4 resource makers); armor x8; guard x8 | 94% (92%-97%) | 0.6 | 0: 8, 1: 12 | 4x Cave Olm, 4x Driftwood Crab, 4x Hawthorn Shieldbug, 4x Star-nosed Mole, 4x Sulfur Cinder Moth | 20 |
| 3 | open | flying x10; night x6 | 84% (80%-88%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Stalactite Pill Bug, 4x Upside-Down Bat, 3x Barrow Leech, 3x Corpse-flower Beetle, 3x Echo Matriarch, 3x Giant Cave Huntsman | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 64% (59%-69%) | 1.05 | 0: 11, 1: 1, 2: 4, 3: 4 | 4x Rot-Swollen Carcass, 4x Stalactite Pill Bug, 4x Star-nosed Mole, 4x Upside-Down Bat, 3x Blind Cave Fish, 1x Driftwood Crab | 12 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 83% | 92% |
| 2 family:armor | 100% | 100% | 100% | 96% | 96% | 100% | 96% | 92% | 96% | 83% | 79% |
| 3 open | 96% | 92% | 100% | 88% | 92% | 88% | 100% | 92% | 75% | 56% | 46% |
| 4 big | 88% | 83% | 96% | 63% | 63% | 67% | 88% | 71% | 54% | 21% | 13% |
