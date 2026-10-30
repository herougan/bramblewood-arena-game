# Focused decks: Map 15 The Long Grass (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool bison-bulldozer,blue-ringed-octopus,border-collie,carrion-crow,cataphract-destrier,dust-hyena,eagle-owl-quartermaster,farm-dog,grave-grin-hyena,hedge-weasel,hedgehog-herbalist,ibex-rockcaller,lodge-engineer,nightjar-drifter,pigeon-peon,pronghorn-racer,raccoon-bandit,robin-redbreast,shepherds-bark,squires-mount,stable-colt,stoat-cutthroat,swift-fox,talon-archer,thorn-shrike,warhorse-charger,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,swarm,family:flying,open --anchor bison-bulldozer,border-collie,carrion-crow,cataphract-destrier,hedge-weasel,hedgehog-herbalist,lodge-engineer,pronghorn-racer,raccoon-bandit,shepherds-bark,squires-mount,stable-colt,stoat-cutthroat,talon-archer,warhorse-charger --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13040 games in 207 s.

- The list (27): Bison Bulldozer, Blue-ringed Octopus, Border Collie, Carrion Crow, Gilded Roadwarden, Dust Hyena, Eagle-Owl Quartermaster, Farm Dog, Grave-Grin Hyena, Hedge Weasel, Hedgehog Herbalist, Ibex Rockcaller, Lodge Engineer, Nightjar Drifter, Pigeon Peon, Pronghorn Racer, Raccoon Bandit, Robin Redbreast, Shepherd, Squire's Mount, Stable Colt, Stoat Cutthroat, Swift Fox, Talon Archer, Thorn Shrike, Warhorse Charger, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 88% (84%-92%) | 0.4 | 0: 12, 1: 8 | 4x Dust Hyena, 4x Grave-Grin Hyena, 4x Stable Colt, 3x Border Collie, 3x Stoat Cutthroat, 2x Talon Archer | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (6 resource makers) | 85% (80%-89%) | 0.3 | 0: 14, 1: 6 | 4x Hedge Weasel, 4x Stable Colt, 3x Dust Hyena, 3x Raccoon Bandit, 3x Squire's Mount, 3x Wolf Spider Mother | 13 |
| 3 | family:flying | economy (4 resource makers); flying x9 | 84% (80%-88%) | 0.6 | 0: 8, 1: 12 | 4x Border Collie, 4x Carrion Crow, 4x Grave-Grin Hyena, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Talon Archer | 11 |
| 4 | economy | economy (6 resource makers); flying x6 | 76% (72%-81%) | 0.55 | 0: 11, 1: 7, 2: 2 | 4x Border Collie, 4x Dust Hyena, 4x Stable Colt, 3x Eagle-Owl Quartermaster, 3x Robin Redbreast, 2x Lodge Engineer | 9 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 88% | 75% | 96% | 96% | 92% | 67% | 96% | 75% | 96% |
| 2 swarm | 100% | 88% | 71% | 75% | 83% | 96% | 63% | 96% | 79% | 96% |
| 3 family:flying | 100% | 83% | 83% | 75% | 100% | 88% | 71% | 100% | 46% | 96% |
| 4 economy | 100% | 92% | 42% | 71% | 88% | 92% | 38% | 96% | 58% | 88% |
