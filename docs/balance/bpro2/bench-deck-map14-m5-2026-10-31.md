# Focused decks: Map 14 Savanna Reaches (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,carrion-crow,dust-hyena,grave-grin-hyena,hoopoe-herald,house-cat,leafcutter-gardener,marula-elephant,mouse-sapper,pangolin-roller,plains-zebra,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7018 games in 92 s.

- The list (15): Acacia Giraffe, Carrion Crow, Dust Hyena, Grave-Grin Hyena, Hoopoe Herald, House Cat, Leafcutter Gardener, Marula Elephant, Mouse Sapper, Pangolin Roller, Plains Zebra, Pride Queen, Savanna Cheetah, Spitting Cobra, Springbok Pronker.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 90% (87%-94%) | 0.4 | 0: 12, 1: 8 | 4x Hoopoe Herald, 4x House Cat, 4x Leafcutter Gardener, 4x Mouse Sapper, 2x Pride Queen, 2x Savanna Cheetah | 14 |
| 2 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 89% (86%-93%) | 0.2 | 0: 16, 1: 4 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x Plains Zebra, 2x Pride Queen, 2x Savanna Cheetah | 7 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 85% (81%-89%) | 0.45 | 0: 11, 1: 9 | 4x Leafcutter Gardener, 4x Plains Zebra, 4x Springbok Pronker, 3x Grave-Grin Hyena, 3x Pangolin Roller, 2x Pride Queen | 0 |
| 4 | economy | swarm (16 copies at 0 Lumber); economy (8 resource makers) | 85% (81%-89%) | 0.2 | 0: 16, 1: 4 | 4x Carrion Crow, 4x Dust Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 2x Mouse Sapper, 2x Pride Queen | 14 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 79% | 100% | 100% | 88% | 92% | 96% | 88% | 79% | 100% | 88% | 83% |
| 2 swarm | 88% | 96% | 100% | 79% | 88% | 100% | 88% | 88% | 100% | 71% | 88% |
| 3 open | 96% | 100% | 96% | 75% | 79% | 96% | 79% | 71% | 92% | 58% | 96% |
| 4 economy | 83% | 100% | 100% | 75% | 83% | 96% | 83% | 71% | 92% | 67% | 83% |
