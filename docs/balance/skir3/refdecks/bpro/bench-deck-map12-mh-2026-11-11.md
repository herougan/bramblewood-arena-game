# Focused decks: Map 12 The Briar Maze (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool alpine-marmot,anvil-thrush,barkplate-beetle,barrow-leech-bat,bison-bulldozer,briarback-hedgehog,chamois-leaper,chipmunk-hoarder,cunning-vixen,eyrie-warden,fawn-scout,hollow-belly-rat,mountain-hare,mouse-sapper,quarry-mole,quill-thorn-boar --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 133 s.

- The list (16): Alpine Marmot, Anvil Thrush, Barkplate Beetle, Barrow Leech, Bison Bulldozer, Briarback Hedgehog, Chamois Leaper, Chipmunk Hoarder, Cunning Vixen, Eyrie Warden, Fawn Scout, Hollow-belly Rat, Mountain Hare, Mouse Sapper, Quarry Mole, Quill-Thorn Boar.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x8 | 74% (69%-79%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Alpine Marmot, 4x Barkplate Beetle, 4x Briarback Hedgehog, 4x Mountain Hare, 3x Fawn Scout, 1x Anvil Thrush | 13 |
| 2 | open | evasion x7 | 70% (65%-76%) | 0.5 | 0: 10, 1: 10 | 4x Mountain Hare, 4x Mouse Sapper, 3x Chipmunk Hoarder, 3x Cunning Vixen, 3x Fawn Scout, 3x Quill-Thorn Boar | 0 |
| 3 | family:flying | big (8 copies at 2+ Lumber, average 1.1); flying x10 | 63% (58%-69%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Anvil Thrush, 4x Barkplate Beetle, 4x Eyrie Warden, 3x Chipmunk Hoarder, 3x Fawn Scout, 2x Barrow Leech | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); spite x7 | 46% (40%-51%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Bison Bulldozer, 4x Eyrie Warden, 3x Alpine Marmot, 3x Quill-Thorn Boar, 2x Chamois Leaper | 17 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 83% | 79% | 75% | 58% | 88% | 96% | 79% | 100% | 25% | 54% |
| 2 open | 79% | 67% | 67% | 67% | 79% | 75% | 75% | 96% | 46% | 54% |
| 3 family:flying | 83% | 75% | 54% | 71% | 58% | 79% | 54% | 96% | 13% | 50% |
| 4 big | 38% | 33% | 63% | 46% | 63% | 75% | 42% | 75% | 0% | 25% |
