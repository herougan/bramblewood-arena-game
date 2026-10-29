# Focused decks: Map 12 The Briar Maze (2026-10-28)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map 12 --max-unique 6 --max-copies 4 --budget 9000 --final-games 24 --seed tools1` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8900 games in 371 s.

- The list (16): Bramble Hoglet, Carrion Crow, Cunning Vixen, Field Mouse, Fox Sharpshot, Gatling Hog, Hedge Weasel, Hedgehog Scout, Lyrebird Mimic, Magpie Collector, Mouse Sapper, Quillguard, Rodent King, Seed-cache Squirrel, Skunk Gasser, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 3.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 79% (74%-84%) | 0.4 | 0: 12, 1: 8 | 4x Carrion Crow, 4x Seed-cache Squirrel, 4x Skunk Gasser, 3x Bramble Hoglet, 3x Hedgehog Scout, 2x Field Mouse | 7 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.6); economy (7 resource makers) | 78% (74%-83%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Field Mouse, 4x Hedgehog Scout, 4x Rodent King, 4x Skunk Gasser, 3x Carrion Crow, 1x Bramble Hoglet | 0 |
| 3 | economy | big (11 copies at 1+ Lumber, average 0.8); economy (8 resource makers) | 76% (71%-81%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Bramble Hoglet, 4x Carrion Crow, 4x Rodent King, 4x Skunk Gasser, 3x Gatling Hog, 1x Field Mouse | 7 |
| 4 | swarm | swarm (14 copies at 0 Lumber) | 68% (62%-73%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Hoglet, 4x Cunning Vixen, 4x Field Mouse, 4x Hedgehog Scout, 2x Gatling Hog, 2x Hedge Weasel | 11 |
| 5 | family:flying | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x8 | 68% (62%-73%) | 0.5 | 0: 10, 1: 10 | 4x Carrion Crow, 4x Magpie Collector, 4x Skunk Gasser, 3x Field Mouse, 3x Hedge Weasel, 2x Gatling Hog | 10 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 67% | 96% | 83% | 83% | 83% | 92% | 83% | 92% | 38% | 75% |
| 2 open | 83% | 96% | 75% | 83% | 88% | 83% | 88% | 79% | 33% | 75% |
| 3 economy | 71% | 92% | 79% | 88% | 63% | 88% | 83% | 88% | 25% | 83% |
| 4 swarm | 58% | 92% | 67% | 63% | 63% | 88% | 83% | 71% | 25% | 71% |
| 5 family:flying | 58% | 83% | 58% | 79% | 71% | 79% | 88% | 75% | 13% | 71% |
