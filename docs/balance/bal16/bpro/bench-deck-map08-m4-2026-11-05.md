# Focused decks: Map 8 Caves & Alcoves (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,gull-thief,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,family:night,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7326 games in 107 s.

- The list (15): Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Gull Thief, Hollow-belly Rat, Malachite Golem, Octopus Tactician, Pelican Diver, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (13 copies at 1+ Lumber, average 0.7); flying x10; siege x6 | 95% (93%-98%) | 0.65 | 0: 7, 1: 13 | 4x Star-nosed Mole, 4x Sulfur Cinder Moth, 3x Cave Olm, 3x Echo Matriarch, 3x Echo Screecher, 3x Giant Cave Huntsman | 10 |
| 2 | family:night | big (14 copies at 1+ Lumber, average 0.7); night x8; siege x6 | 87% (83%-91%) | 0.7 | 0: 6, 1: 14 | 4x Gallery Orb-Weaver, 4x Hollow-belly Rat, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Echo Screecher, 2x Blind Cave Fish | 13 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x7; night x7 | 84% (80%-88%) | 0.5 | 0: 10, 1: 10 | 4x Blind Cave Fish, 4x Gull Thief, 4x Quarry Mole, 3x Echo Matriarch, 3x Gallery Orb-Weaver, 2x Star-nosed Mole | 12 |
| 4 | open | big (16 copies at 1+ Lumber, average 1.1); armor x7 | 80% (76%-84%) | 1.15 | 0: 4, 1: 9, 2: 7 | 4x Stalactite Pill Bug, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Giant Cave Huntsman, 3x Malachite Golem, 3x Quarry Mole | 0 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 92% | 92% | 96% | 96% | 100% | 100% | 100% | 100% | 92% | 83% |
| 2 family:night | 100% | 83% | 92% | 92% | 79% | 79% | 96% | 100% | 92% | 83% | 63% |
| 3 big | 83% | 88% | 96% | 88% | 92% | 79% | 96% | 90% | 83% | 79% | 50% |
| 4 open | 92% | 71% | 88% | 83% | 96% | 75% | 100% | 96% | 75% | 79% | 25% |
