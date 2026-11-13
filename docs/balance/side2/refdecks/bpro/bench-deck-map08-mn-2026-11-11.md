# Focused decks: Map 8 The Glimmer Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool barrow-leech-bat,blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,fruit-bat,gallery-orb-weaver,giant-cave-huntsman,glow-worm,quarry-mole,stalactite-golem,sulfur-cinder-moth,whip-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:night,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6720 games in 118 s.

- The list (13): Barrow Leech, Blind Cave Fish, Cave Olm, Echo Matriarch, Echo Screecher, Fruit Bat, Gallery Orb-Weaver, Giant Cave Huntsman, Glow-worm, Quarry Mole, Stalactite Pill Bug, Sulfur Cinder Moth, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x8 | 85% (80%-89%) | 0.4 | 0: 12, 1: 8 | 4x Blind Cave Fish, 4x Fruit Bat, 4x Glow-worm, 3x Barrow Leech, 3x Sulfur Cinder Moth, 2x Echo Matriarch | 10 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5) | 79% (74%-84%) | 0.5 | 0: 10, 1: 10 | 4x Fruit Bat, 4x Glow-worm, 4x Whip Spider, 3x Echo Screecher, 3x Giant Cave Huntsman, 2x Blind Cave Fish | 10 |
| 3 | family:night | big (12 copies at 1+ Lumber, average 0.6); flying x8; night x8 | 73% (67%-79%) | 0.6 | 0: 8, 1: 12 | 4x Cave Olm, 4x Gallery Orb-Weaver, 4x Glow-worm, 3x Barrow Leech, 3x Echo Matriarch, 2x Echo Screecher | 13 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.6) | 72% (66%-78%) | 0.55 | 0: 11, 1: 7, 2: 2 | 4x Cave Olm, 4x Fruit Bat, 4x Sulfur Cinder Moth, 3x Giant Cave Huntsman, 3x Glow-worm, 2x Stalactite Pill Bug | 0 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 92% | 96% | 92% | 92% | 50% | 75% |
| 2 big | 88% | 88% | 96% | 79% | 92% | 29% | 83% |
| 3 family:night | 71% | 96% | 92% | 67% | 100% | 38% | 50% |
| 4 open | 83% | 88% | 96% | 67% | 83% | 21% | 67% |
