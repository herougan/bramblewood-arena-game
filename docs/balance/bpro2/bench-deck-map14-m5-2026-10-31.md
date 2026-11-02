# Focused decks: Map 14 Savanna Reaches (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,carrion-crow,dust-hyena,grave-grin-hyena,hoopoe-herald,house-cat,leafcutter-gardener,marula-elephant,mouse-sapper,pangolin-roller,plains-zebra,pride-queen,savanna-cheetah,spitting-cobra,springbok-pronker,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7194 games in 88 s.

- The list (16): Acacia Giraffe, Carrion Crow, Dust Hyena, Grave-Grin Hyena, Hoopoe Herald, House Cat, Leafcutter Gardener, Marula Elephant, Mouse Sapper, Pangolin Roller, Plains Zebra, Pride Queen, Savanna Cheetah, Spitting Cobra, Springbok Pronker, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber) | 92% (89%-95%) | 0.3 | 0: 14, 1: 6 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 4x Weaver Bird, 2x Carrion Crow, 2x Pride Queen | 12 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 89% (85%-93%) | 0.4 | 0: 12, 1: 8 | 4x Carrion Crow, 4x Grave-Grin Hyena, 4x Leafcutter Gardener, 4x Pangolin Roller, 2x Pride Queen, 2x Savanna Cheetah | 0 |
| 3 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (10 resource makers) | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Leafcutter Gardener, 4x Pangolin Roller, 4x Weaver Bird, 3x Carrion Crow, 3x Dust Hyena, 2x Savanna Cheetah | 7 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.5); economy (6 resource makers) | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x Pangolin Roller, 4x Springbok Pronker, 2x Dust Hyena, 2x Pride Queen | 10 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 100% | 83% | 96% | 100% | 96% | 79% | 96% | 79% | 88% |
| 2 open | 88% | 100% | 100% | 100% | 88% | 92% | 79% | 79% | 100% | 67% | 88% |
| 3 economy | 100% | 100% | 88% | 88% | 88% | 83% | 79% | 79% | 92% | 67% | 100% |
| 4 big | 100% | 96% | 100% | 100% | 71% | 96% | 88% | 71% | 96% | 63% | 83% |
