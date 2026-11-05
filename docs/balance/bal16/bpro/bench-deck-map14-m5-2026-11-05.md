# Focused decks: Map 14 Savanna Reaches (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,ant-hill,carrion-crow,dust-hyena,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,house-cat,marula-elephant,mouse-sapper,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:strike-first,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7458 games in 115 s.

- The list (14): Acacia Giraffe, Ant Hill, Carrion Crow, Dust Hyena, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, House Cat, Marula Elephant, Mouse Sapper, Pride Queen, Savanna Cheetah, Spitting Cobra, Springbok Pronker.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x8 | 89% (86%-92%) | 0.6 | 0: 8, 1: 12 | 4x Golden Eagle Diver, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Mouse Sapper, 2x Pride Queen, 2x Savanna Cheetah | 12 |
| 2 | economy | swarm (15 copies at 0 Lumber); economy (7 resource makers) | 86% (82%-89%) | 0.25 | 0: 15, 1: 5 | 4x Carrion Crow, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 3x Dust Hyena, 3x Spitting Cobra, 2x Pride Queen | 11 |
| 3 | open | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 85% (81%-89%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Acacia Giraffe, 4x Dust Hyena, 4x Hoopoe Herald, 4x House Cat, 2x Pride Queen, 2x Savanna Cheetah | 0 |
| 4 | family:flying | big (12 copies at 1+ Lumber, average 0.8); economy (8 resource makers); flying x8; strike-first x6 | 71% (66%-76%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Ant Hill, 4x Carrion Crow, 4x Dust Hyena, 4x Golden Eagle Diver, 2x Pride Queen, 2x Springbok Pronker | 14 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 88% | 100% | 100% | 100% | 96% | 100% | 96% | 100% | 96% | 67% | 42% |
| 2 economy | 88% | 96% | 100% | 100% | 88% | 92% | 96% | 83% | 100% | 54% | 46% |
| 3 open | 83% | 96% | 92% | 96% | 79% | 100% | 96% | 79% | 92% | 71% | 50% |
| 4 family:flying | 67% | 79% | 79% | 83% | 71% | 88% | 83% | 79% | 71% | 46% | 38% |
