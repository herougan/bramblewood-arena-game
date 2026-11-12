# Focused decks: Map 13 The Redwood Deep (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool anhinga-spearbird,badger-lumberjack,balloon-archer,beaver-feller,feral-tomcat,grass-snake,grizzly-vanguard,marsh-mallow-hare,monarch-wingblade,owl-nightwatch,pika-hoarder,pine-marten,redwood-woodpecker,sergeant-bramblefox,slow-worm --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:flying,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7128 games in 111 s.

- The list (15): Anhinga Spearbird, Badger Lumberjack, Balloon Archer, Beaver Feller, Tomcat, Grass Snake, Grizzly Vanguard, Marsh-mallow Hare, Monarch Wingblade, Owl Nightwatch, Pika Hoarder, Pine Marten, Redwood Woodpecker, Sergeant Bramblefox, Slow-worm.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x8 | 78% (74%-82%) | 0.6 | 0: 8, 1: 12 | 4x Balloon Archer, 4x Beaver Feller, 4x Owl Nightwatch, 4x Pika Hoarder, 3x Sergeant Bramblefox, 1x Pine Marten | 11 |
| 2 | economy | swarm (15 copies at 0 Lumber); economy (6 resource makers); strike-first x7 | 77% (73%-81%) | 0.25 | 0: 15, 1: 5 | 4x Beaver Feller, 4x Tomcat, 4x Slow-worm, 3x Pika Hoarder, 3x Pine Marten, 2x Redwood Woodpecker | 15 |
| 3 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x8 | 68% (64%-73%) | 0.6 | 0: 8, 1: 12 | 4x Anhinga Spearbird, 4x Tomcat, 4x Pika Hoarder, 3x Badger Lumberjack, 3x Grass Snake, 2x Balloon Archer | 12 |
| 4 | open | big (15 copies at 1+ Lumber, average 0.8); economy (8 resource makers); flying x7 | 66% (61%-71%) | 0.75 | 0: 5, 1: 15 | 4x Anhinga Spearbird, 4x Badger Lumberjack, 4x Beaver Feller, 4x Owl Nightwatch, 3x Monarch Wingblade, 1x Pika Hoarder | 0 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 92% | 75% | 92% | 96% | 83% | 71% | 88% | 100% | 17% | 50% |
| 2 economy | 83% | 83% | 79% | 92% | 92% | 88% | 88% | 75% | 100% | 13% | 54% |
| 3 family:strike-first | 92% | 75% | 50% | 92% | 92% | 75% | 67% | 75% | 92% | 0% | 42% |
| 4 open | 88% | 71% | 58% | 88% | 71% | 71% | 58% | 71% | 100% | 13% | 42% |
