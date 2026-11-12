# Focused decks: Map 15 The Long Grass (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool alpine-marmot,anvil-thrush,balloon-archer,blue-ringed-octopus,border-collie,bramblewood-lynx,cataphract-destrier,dust-hyena,eagle-owl-quartermaster,elderhorn-monarch,farm-dog,fawn-scout,grave-grin-hyena,hoopoe-herald,house-cat,ibex-rockcaller,mallard-marauder,mosquito-cloud,nightjar-drifter,otter-centurion,plains-zebra,robin-redbreast,savanna-cheetah,siege-rhino,stoat-cutthroat,sworn-shieldbearer,tasmanian-devil,village-miller,warhorse-charger,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:ranged,big,open --anchor border-collie,bramblewood-lynx,cataphract-destrier,dust-hyena,eagle-owl-quartermaster,elderhorn-monarch,fawn-scout,hoopoe-herald,mallard-marauder,mosquito-cloud,plains-zebra,savanna-cheetah,siege-rhino,stoat-cutthroat,sworn-shieldbearer,tasmanian-devil,village-miller,warhorse-charger --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9320 games in 122 s.

- The list (30): Alpine Marmot, Anvil Thrush, Balloon Archer, Blue-ringed Octopus, Border Collie, Bramblewood Lynx, Gilded Roadwarden, Dust Hyena, Eagle-Owl Quartermaster, Elderhorn Monarch, Farm Dog, Fawn Scout, Grave-Grin Hyena, Hoopoe Herald, House Cat, Ibex Rockcaller, Mallard Marauder, Mosquito Cloud, Nightjar Drifter, Otter Centurion, Plains Zebra, Robin Redbreast, Savanna Cheetah, Siege Rhino, Stoat Cutthroat, Sworn Shieldbearer, Tasmanian Devil, Village Miller, Warhorse Charger, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x11; ranged x7 | 89% (85%-92%) | 0.45 | 0: 11, 1: 9 | 4x Balloon Archer, 4x Mosquito Cloud, 4x Plains Zebra, 3x Fawn Scout, 3x Mallard Marauder, 2x Savanna Cheetah | 20 |
| 2 | family:ranged | flying x13; ranged x9 | 88% (84%-91%) | 0.45 | 0: 11, 1: 9 | 4x Robin Redbreast, 4x Village Miller, 3x Balloon Archer, 3x Eagle-Owl Quartermaster, 3x Fawn Scout, 3x Mallard Marauder | 20 |
| 3 | open | economy (4 resource makers) | 85% (81%-89%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Border Collie, 4x Dust Hyena, 3x Bramblewood Lynx, 3x Otter Centurion, 2x Ibex Rockcaller | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8); strike-first x7 | 53% (48%-59%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Elderhorn Monarch, 4x Robin Redbreast, 3x Stoat Cutthroat, 3x Tasmanian Devil, 2x Siege Rhino | 20 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 100% | 96% | 75% | 100% | 92% | 96% | 100% | 50% | 83% |
| 2 family:ranged | 88% | 100% | 96% | 88% | 100% | 96% | 100% | 96% | 38% | 75% |
| 3 open | 71% | 83% | 100% | 79% | 100% | 96% | 92% | 96% | 63% | 71% |
| 4 big | 58% | 63% | 71% | 33% | 83% | 71% | 54% | 63% | 17% | 21% |
