# Focused decks: Map 14 Savanna Reaches (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,carrion-crow,dust-hyena,grave-grin-hyena,hoopoe-herald,house-cat,marula-elephant,mouse-sapper,pangolin-roller,plains-zebra,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7172 games in 99 s.

- The list (15): Acacia Giraffe, Carrion Crow, Dust Hyena, Grave-Grin Hyena, Hoopoe Herald, House Cat, Marula Elephant, Mouse Sapper, Pangolin Roller, Plains Zebra, Pride Queen, Savanna Cheetah, Spitting Cobra, Springbok Pronker, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 92% (89%-95%) | 0.2 | 0: 16, 1: 4 | 4x Dust Hyena, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 2x Pride Queen, 2x Springbok Pronker | 12 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers) | 88% (84%-91%) | 0.3 | 0: 14, 1: 6 | 4x Dust Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 4x Springbok Pronker, 2x Carrion Crow, 2x Savanna Cheetah | 12 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4) | 88% (84%-91%) | 0.4 | 0: 12, 1: 8 | 4x Hoopoe Herald, 4x House Cat, 4x Mouse Sapper, 4x Springbok Pronker, 2x Carrion Crow, 2x Grave-Grin Hyena | 10 |
| 4 | open | swarm (15 copies at 0 Lumber); economy (8 resource makers) | 84% (80%-89%) | 0.25 | 0: 15, 1: 5 | 4x Carrion Crow, 4x Dust Hyena, 4x Grave-Grin Hyena, 3x House Cat, 3x Mouse Sapper, 2x Savanna Cheetah | 0 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 100% | 100% | 92% | 100% | 96% | 92% | 92% | 63% | 83% |
| 2 economy | 92% | 96% | 96% | 100% | 83% | 92% | 92% | 92% | 96% | 50% | 79% |
| 3 big | 100% | 100% | 92% | 92% | 88% | 96% | 88% | 79% | 100% | 50% | 83% |
| 4 open | 96% | 100% | 83% | 96% | 71% | 88% | 88% | 88% | 88% | 63% | 71% |
