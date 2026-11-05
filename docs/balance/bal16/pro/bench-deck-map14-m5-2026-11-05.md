# Focused decks: Map 14 Savanna Reaches (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,alley-cat,alpine-marmot,alpine-swift,anhinga-spearbird,ant-hill,banded-sea-krait,blue-ringed-octopus,carrion-crow,dust-hyena,eagle-owl-quartermaster,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,house-cat,ibex-rockcaller,leafcutter-gardener,marula-elephant,mouse-sapper,otter-centurion,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker,sunbittern-strider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:strike-first,family:flying,open --anchor acacia-giraffe,ant-hill,carrion-crow,dust-hyena,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,house-cat,marula-elephant,mouse-sapper,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7634 games in 137 s.

- The list (26): Acacia Giraffe, Alley Cat, Alpine Marmot, Alpine Swift, Anhinga Spearbird, Ant Hill, Banded Sea Krait, Blue-ringed Octopus, Carrion Crow, Dust Hyena, Eagle-Owl Quartermaster, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, House Cat, Ibex Rockcaller, Leafcutter Gardener, Marula Elephant, Mouse Sapper, Otter Centurion, Pride Queen, Savanna Cheetah, Spitting Cobra, Springbok Pronker, Sunbittern Strider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | swarm (15 copies at 0 Lumber); economy (4 resource makers); strike-first x9 | 87% (84%-91%) | 0.25 | 0: 15, 1: 5 | 4x Alpine Swift, 4x Dust Hyena, 4x Hoopoe Herald, 3x Alpine Marmot, 3x Anhinga Spearbird, 2x Pride Queen | 13 |
| 2 | economy | big (8 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 86% (82%-90%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Alpine Marmot, 4x Carrion Crow, 4x Dust Hyena, 3x Acacia Giraffe, 3x Blue-ringed Octopus, 2x Ibex Rockcaller | 12 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); economy (4 resource makers); guard x8; flying x8 | 81% (77%-85%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Alpine Marmot, 4x Alpine Swift, 4x Carrion Crow, 4x Marula Elephant, 2x Hoopoe Herald, 2x Sunbittern Strider | 15 |
| 4 | open | swarm (15 copies at 0 Lumber) | 80% (76%-84%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Alley Cat, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 3x Acacia Giraffe, 3x Alpine Marmot, 2x Ibex Rockcaller | 0 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 92% | 100% | 92% | 100% | 96% | 96% | 92% | 88% | 100% | 46% | 58% |
| 2 economy | 88% | 96% | 100% | 96% | 71% | 92% | 92% | 88% | 96% | 67% | 67% |
| 3 family:flying | 92% | 100% | 100% | 96% | 92% | 67% | 92% | 79% | 96% | 42% | 33% |
| 4 open | 88% | 96% | 100% | 100% | 79% | 79% | 88% | 92% | 79% | 50% | 29% |
