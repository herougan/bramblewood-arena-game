# Focused decks: Map 8 Caves & Alcoves (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7260 games in 84 s.

- The list (16): Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Grotto Lobster, Hollow-belly Rat, Malachite Golem, Octopus Tactician, Pelican Diver, Quarry Mole, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (9 copies at 1+ Lumber, average 0.5); flying x7; night x7 | 89% (86%-93%) | 0.45 | 0: 11, 1: 9 | 4x Cave Olm, 4x Vampire Bat, 3x Echo Matriarch, 3x Grotto Lobster, 3x Hollow-belly Rat, 3x Star-nosed Mole | 0 |
| 2 | family:flying | big (8 copies at 1+ Lumber, average 0.4); night x11; flying x9 | 86% (82%-90%) | 0.4 | 0: 12, 1: 8 | 4x Blind Cave Fish, 4x Star-nosed Mole, 4x Vampire Bat, 3x Echo Matriarch, 3x Grotto Lobster, 2x Pelican Diver | 7 |
| 3 | swarm | swarm (14 copies at 0 Lumber); night x9; flying x7 | 84% (80%-88%) | 0.3 | 0: 14, 1: 6 | 4x Cave Olm, 4x Star-nosed Mole, 4x Vampire Bat, 3x Echo Matriarch, 3x Giant Cave Huntsman, 2x Blind Cave Fish | 6 |
| 4 | big | big (12 copies at 1+ Lumber, average 0.6) | 83% (78%-87%) | 0.6 | 0: 8, 1: 12 | 4x Cave Olm, 4x Gallery Orb-Weaver, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Grotto Lobster, 2x Sulfur Cinder Moth | 7 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 96% | 79% | 88% | 92% | 58% | 96% | 100% | 88% | 100% |
| 2 family:flying | 88% | 83% | 88% | 88% | 83% | 75% | 67% | 88% | 100% | 88% | 100% |
| 3 swarm | 83% | 92% | 92% | 88% | 79% | 58% | 63% | 100% | 96% | 75% | 100% |
| 4 big | 96% | 92% | 79% | 67% | 71% | 71% | 58% | 96% | 100% | 79% | 100% |
