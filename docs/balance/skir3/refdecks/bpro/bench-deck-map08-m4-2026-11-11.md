# Focused decks: Map 8 Caves & Alcoves (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool barrow-leech-bat,blind-cave-fish,cave-olm,corpse-flower-beetle,driftwood-crab,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,hawthorn-shieldbug,quarry-mole,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7150 games in 112 s.

- The list (16): Barrow Leech, Blind Cave Fish, Cave Olm, Corpse-flower Beetle, Driftwood Crab, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Hawthorn Shieldbug, Quarry Mole, Rot-Swollen Carcass, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x10; night x6 | 97% (95%-99%) | 0.65 | 0: 7, 1: 13 | 4x Star-nosed Mole, 4x Sulfur Cinder Moth, 3x Cave Olm, 3x Driftwood Crab, 3x Echo Matriarch, 3x Echo Screecher | 10 |
| 2 | family:armor | economy (4 resource makers); armor x8; guard x8 | 91% (88%-94%) | 0.85 | 0: 3, 1: 17 | 4x Driftwood Crab, 4x Hawthorn Shieldbug, 3x Cave Olm, 3x Echo Screecher, 3x Giant Cave Huntsman, 3x Wolf Spider Mother | 10 |
| 3 | open | flying x10; night x6 | 87% (84%-91%) | 1 | 1: 20 | 4x Hawthorn Shieldbug, 4x Sulfur Cinder Moth, 3x Corpse-flower Beetle, 3x Echo Matriarch, 3x Echo Screecher, 3x Giant Cave Huntsman | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); armor x7; guard x7 | 84% (80%-88%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Rot-Swollen Carcass, 4x Stalactite Pill Bug, 3x Driftwood Crab, 3x Echo Matriarch, 3x Giant Cave Huntsman, 3x Star-nosed Mole | 14 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 96% | 100% | 96% | 100% | 100% | 100% | 100% | 96% | 81% |
| 2 family:armor | 100% | 96% | 96% | 100% | 100% | 96% | 100% | 88% | 100% | 67% | 58% |
| 3 open | 100% | 96% | 96% | 100% | 83% | 92% | 100% | 90% | 88% | 75% | 42% |
| 4 big | 96% | 96% | 79% | 92% | 79% | 79% | 100% | 88% | 96% | 67% | 54% |
