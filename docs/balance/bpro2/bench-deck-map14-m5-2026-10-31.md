# Focused decks: Map 14 Savanna Reaches (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool dust-hyena,grave-grin-hyena,hoopoe-herald,house-cat,leafcutter-gardener,lodge-engineer,marula-elephant,meerkat-burrower,mouse-sapper,pangolin-roller,plains-zebra,savanna-cheetah,spitting-cobra,springbok-pronker,weaver-bird --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7282 games in 95 s.

- The list (15): Dust Hyena, Grave-Grin Hyena, Hoopoe Herald, House Cat, Leafcutter Gardener, Lodge Engineer, Marula Elephant, Meerkat Burrower, Mouse Sapper, Pangolin Roller, Plains Zebra, Savanna Cheetah, Spitting Cobra, Springbok Pronker, Weaver Bird.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x Mouse Sapper, 4x Weaver Bird, 2x Grave-Grin Hyena, 2x Savanna Cheetah | 0 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5) | 84% (80%-88%) | 0.5 | 0: 10, 1: 10 | 4x Hoopoe Herald, 4x Mouse Sapper, 4x Pangolin Roller, 4x Plains Zebra, 2x Dust Hyena, 2x Savanna Cheetah | 10 |
| 3 | economy | swarm (15 copies at 0 Lumber); economy (7 resource makers) | 78% (74%-82%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Hoopoe Herald, 4x House Cat, 4x Leafcutter Gardener, 3x Grave-Grin Hyena, 3x Lodge Engineer, 2x Savanna Cheetah | 8 |
| 4 | swarm | swarm (15 copies at 0 Lumber); economy (7 resource makers) | 77% (72%-81%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Leafcutter Gardener, 3x Dust Hyena, 3x Marula Elephant, 2x Savanna Cheetah | 8 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 100% | 100% | 96% | 83% | 100% | 96% | 63% | 100% | 54% | 79% |
| 2 big | 100% | 100% | 92% | 96% | 79% | 96% | 71% | 67% | 92% | 50% | 83% |
| 3 economy | 71% | 100% | 96% | 75% | 75% | 100% | 71% | 71% | 92% | 29% | 79% |
| 4 swarm | 83% | 96% | 88% | 83% | 83% | 100% | 71% | 42% | 96% | 33% | 67% |
