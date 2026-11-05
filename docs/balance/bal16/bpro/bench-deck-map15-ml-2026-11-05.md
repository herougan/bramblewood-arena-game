# Focused decks: Map 15 The Long Grass (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool armory,bison-bulldozer,border-collie,carrion-crow,cataphract-destrier,cricket-drummer,hedge-weasel,hedgehog-herbalist,lodge-engineer,pronghorn-racer,raccoon-bandit,shepherds-bark,slow-worm,stoat-cutthroat,swift-fox,talon-archer,tasmanian-devil,thorn-shrike,truffle-piglet --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:flying,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6900 games in 107 s.

- The list (19): Armory, Bison Bulldozer, Border Collie, Carrion Crow, Gilded Roadwarden, Cricket Drummer, Hedge Weasel, Hedgehog Herbalist, Lodge Engineer, Pronghorn Racer, Raccoon Bandit, Shepherd, Slow-worm, Stoat Cutthroat, Swift Fox, Talon Archer, Tasmanian Devil, Thorn Shrike, Truffle Piglet.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8 | 88% (84%-92%) | 0.45 | 0: 11, 1: 9 | 4x Border Collie, 4x Cricket Drummer, 4x Slow-worm, 3x Carrion Crow, 3x Thorn Shrike, 2x Talon Archer | 14 |
| 2 | economy | economy (7 resource makers) | 87% (83%-91%) | 0.45 | 0: 11, 1: 9 | 4x Carrion Crow, 4x Cricket Drummer, 4x Tasmanian Devil, 3x Hedgehog Herbalist, 3x Raccoon Bandit, 2x Stoat Cutthroat | 10 |
| 3 | open | midrange (average 0.8 Lumber) | 83% (79%-88%) | 0.85 | 0: 3, 1: 17 | 4x Border Collie, 4x Tasmanian Devil, 4x Truffle Piglet, 3x Hedgehog Herbalist, 3x Raccoon Bandit, 2x Talon Archer | 0 |
| 4 | family:strike-first | strike-first x10 | 80% (76%-85%) | 1.15 | 0: 6, 1: 11, 4: 3 | 4x Cricket Drummer, 4x Pronghorn Racer, 4x Truffle Piglet, 3x Gilded Roadwarden, 3x Stoat Cutthroat, 2x Slow-worm | 16 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 96% | 88% | 92% | 92% | 88% | 96% | 67% | 71% |
| 2 economy | 96% | 92% | 79% | 88% | 96% | 100% | 100% | 100% | 54% | 63% |
| 3 open | 100% | 96% | 71% | 83% | 92% | 92% | 71% | 96% | 54% | 79% |
| 4 family:strike-first | 92% | 83% | 79% | 75% | 88% | 92% | 96% | 92% | 67% | 42% |
