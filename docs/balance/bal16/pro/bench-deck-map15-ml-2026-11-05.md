# Focused decks: Map 15 The Long Grass (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool armory,bison-bulldozer,blue-ringed-octopus,border-collie,carrion-crow,cataphract-destrier,cricket-drummer,cunning-vixen,dust-hyena,eagle-owl-quartermaster,grave-grin-hyena,hawthorn-shieldbug,hedge-weasel,hedgehog-herbalist,hedgerow-shrew,ibex-rockcaller,lodge-engineer,lyrebird-mimic,pronghorn-racer,raccoon-bandit,robin-redbreast,shepherds-bark,slow-worm,stoat-cutthroat,swift-fox,talon-archer,tasmanian-devil,thorn-shrike,truffle-piglet,wolf-spider-mother,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:strike-first,open --anchor armory,bison-bulldozer,border-collie,carrion-crow,cataphract-destrier,cricket-drummer,hedge-weasel,hedgehog-herbalist,lodge-engineer,pronghorn-racer,raccoon-bandit,shepherds-bark,slow-worm,stoat-cutthroat,swift-fox,talon-archer,tasmanian-devil,thorn-shrike,truffle-piglet --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7320 games in 128 s.

- The list (31): Armory, Bison Bulldozer, Blue-ringed Octopus, Border Collie, Carrion Crow, Gilded Roadwarden, Cricket Drummer, Cunning Vixen, Dust Hyena, Eagle-Owl Quartermaster, Grave-Grin Hyena, Hawthorn Shieldbug, Hedge Weasel, Hedgehog Herbalist, Hedgerow Shrew, Ibex Rockcaller, Lodge Engineer, Lyrebird Mimic, Pronghorn Racer, Raccoon Bandit, Robin Redbreast, Shepherd, Slow-worm, Stoat Cutthroat, Swift Fox, Talon Archer, Tasmanian Devil, Thorn Shrike, Truffle Piglet, Wolf Spider Mother, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 90% (86%-94%) | 0.6 | 0: 8, 1: 12 | 4x Cricket Drummer, 4x Slow-worm, 4x Swift Fox, 3x Blue-ringed Octopus, 3x Stoat Cutthroat, 2x Ibex Rockcaller | 0 |
| 2 | family:strike-first | economy (4 resource makers); strike-first x8 | 89% (85%-93%) | 0.5 | 0: 10, 1: 10 | 4x Cricket Drummer, 4x Dust Hyena, 4x Hawthorn Shieldbug, 3x Pronghorn Racer, 3x Stoat Cutthroat, 2x Hedgerow Shrew | 13 |
| 3 | economy | economy (7 resource makers) | 84% (80%-88%) | 0.45 | 0: 11, 1: 9 | 4x Border Collie, 4x Dust Hyena, 4x Grave-Grin Hyena, 3x Hedgehog Herbalist, 3x Raccoon Bandit, 2x Ibex Rockcaller | 18 |
| 4 | family:flying | economy (4 resource makers); flying x10; day x6 | 79% (75%-84%) | 0.4 | 0: 12, 1: 8 | 4x Border Collie, 4x Carrion Crow, 4x Grave-Grin Hyena, 4x Robin Redbreast, 2x Ibex Rockcaller, 2x Talon Archer | 18 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 79% | 92% | 92% | 79% | 100% | 75% | 83% |
| 2 family:strike-first | 96% | 92% | 83% | 96% | 100% | 96% | 83% | 100% | 75% | 71% |
| 3 economy | 96% | 100% | 75% | 67% | 96% | 92% | 88% | 100% | 63% | 67% |
| 4 family:flying | 92% | 96% | 79% | 88% | 100% | 88% | 79% | 88% | 38% | 46% |
