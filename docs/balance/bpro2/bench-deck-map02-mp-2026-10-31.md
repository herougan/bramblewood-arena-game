# Focused decks: Map 2 Lilypad Reach (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,box-turtle,fiddler-crab-swarm,grey-seal-bull,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,riverworks-bastion,snapstick-turtle,tidepool-trapper-crab,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6840 games in 380 s.

- The list (17): Alley Cat, Box Turtle, Fiddler Crab Swarm, Grey Seal Bull, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Riverworks Bastion, Snapstick Turtle, Tidepool Trapper Crab, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); tide x8 | 84% (80%-88%) | 0.2 | 0: 16, 1: 4 | 4x Box Turtle, 4x Grey Seal Bull, 4x Tidepool Trapper Crab, 4x Water Shrew, 4x Water Vole | 8 |
| 2 | open | economy (8 resource makers); tide x8 | 81% (76%-85%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Grey Seal Bull, 4x Lodge Engineer, 4x Muskrat Reedgatherer, 4x Tidepool Trapper Crab, 4x Water Vole | 0 |
| 3 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); tide x8 | 76% (72%-80%) | 0.4 | 0: 14, 1: 4, 2: 2 | 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 3x Alley Cat, 3x Box Turtle, 2x Lodge Engineer | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); economy (6 resource makers); tide x6 | 53% (48%-59%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Lodge Engineer, 4x Riverworks Bastion, 4x Tidepool Trapper Crab, 4x Water Vole, 2x Muskrat Reedgatherer, 2x Pyrenean Desman | 6 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 88% | 100% | 100% | 54% | 92% | 100% | 83% | 58% | 67% |
| 2 open | 75% | 96% | 96% | 92% | 50% | 88% | 100% | 88% | 50% | 75% |
| 3 economy | 88% | 96% | 100% | 92% | 38% | 92% | 96% | 88% | 8% | 67% |
| 4 big | 58% | 67% | 67% | 83% | 21% | 46% | 71% | 67% | 25% | 29% |
