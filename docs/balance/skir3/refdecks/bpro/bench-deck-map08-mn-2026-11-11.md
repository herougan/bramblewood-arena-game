# Focused decks: Map 8 The Glimmer Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool blind-cave-fish,cave-olm,echo-matriarch,magpie-collector,oilbird,quarry-mole,stalactite-golem,star-nosed-mole,upside-down-bat --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6762 games in 143 s.

- The list (9): Blind Cave Fish, Cave Olm, Echo Matriarch, Magpie Collector, Oilbird, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Upside-Down Bat.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (10 copies at 1+ Lumber, average 0.5); flying x11 | 75% (70%-81%) | 0.5 | 0: 10, 1: 10 | 4x Magpie Collector, 4x Star-nosed Mole, 4x Upside-Down Bat, 3x Echo Matriarch, 3x Oilbird, 2x Cave Olm | 10 |
| 2 | swarm | swarm (16 copies at 0 Lumber); flying x8 | 73% (67%-78%) | 0.2 | 0: 16, 1: 4 | 4x Blind Cave Fish, 4x Cave Olm, 4x Star-nosed Mole, 4x Upside-Down Bat, 3x Magpie Collector, 1x Echo Matriarch | 13 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.5) | 54% (47%-60%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Blind Cave Fish, 4x Cave Olm, 4x Star-nosed Mole, 3x Echo Matriarch, 3x Quarry Mole, 2x Stalactite Pill Bug | 10 |
| 4 | open | big (14 copies at 1+ Lumber, average 0.8); flying x7 | 41% (34%-48%) | 0.85 | 0: 6, 1: 11, 2: 3 | 4x Oilbird, 4x Quarry Mole, 4x Upside-Down Bat, 3x Echo Matriarch, 3x Stalactite Pill Bug, 2x Blind Cave Fish | 0 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 88% | 83% | 92% | 90% | 42% | 42% |
| 2 swarm | 92% | 92% | 71% | 88% | 92% | 25% | 50% |
| 3 big | 71% | 83% | 63% | 67% | 63% | 17% | 13% |
| 4 open | 50% | 54% | 42% | 50% | 58% | 13% | 21% |
