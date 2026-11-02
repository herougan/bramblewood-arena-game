# Focused decks: Map 8 Caves & Alcoves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 79 s.

- The list (16): Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Grotto Lobster, Hollow-belly Rat, Malachite Golem, Octopus Tactician, Pelican Diver, Quarry Mole, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5); flying x6; night x6 | 88% (84%-91%) | 0.45 | 0: 11, 1: 9 | 4x Cave Olm, 4x Quarry Mole, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Vampire Bat, 2x Giant Cave Huntsman | 10 |
| 2 | family:flying | big (12 copies at 1+ Lumber, average 0.6); flying x14; night x10 | 87% (83%-90%) | 0.6 | 0: 8, 1: 12 | 4x Cave Olm, 4x Sulfur Cinder Moth, 4x Vampire Bat, 3x Echo Matriarch, 3x Echo Screecher, 2x Grotto Lobster | 8 |
| 3 | open | big (13 copies at 1+ Lumber, average 0.7); flying x10; siege x6 | 86% (82%-90%) | 0.65 | 0: 7, 1: 13 | 4x Cave Olm, 4x Pelican Diver, 3x Echo Matriarch, 3x Echo Screecher, 3x Grotto Lobster, 3x Star-nosed Mole | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); night x14; flying x10 | 85% (81%-89%) | 0.3 | 0: 14, 1: 6 | 4x Blind Cave Fish, 4x Cave Olm, 4x Vampire Bat, 3x Echo Matriarch, 3x Echo Screecher, 2x Star-nosed Mole | 8 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 88% | 83% | 92% | 67% | 58% | 96% | 100% | 88% | 100% |
| 2 family:flying | 92% | 92% | 94% | 88% | 79% | 71% | 63% | 96% | 100% | 88% | 92% |
| 3 open | 88% | 96% | 96% | 96% | 67% | 79% | 63% | 92% | 96% | 83% | 96% |
| 4 swarm | 83% | 88% | 96% | 88% | 71% | 65% | 75% | 88% | 96% | 92% | 100% |
