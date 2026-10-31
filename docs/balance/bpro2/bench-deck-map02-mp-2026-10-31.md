# Focused decks: Map 2 Lilypad Reach (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool box-turtle,duckling,fiddler-crab-swarm,grey-seal-bull,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,riverworks-bastion,snapstick-turtle,tidepool-trapper-crab,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7300 games in 119 s.

- The list (16): Box Turtle, Duckling, Fiddler Crab Swarm, Grey Seal Bull, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Riverworks Bastion, Snapstick Turtle, Tidepool Trapper Crab, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); tide x12 | 83% (79%-88%) | 0.2 | 0: 16, 1: 4 | 4x Grey Seal Bull, 4x Pyrenean Desman, 4x Tidepool Trapper Crab, 4x Water Shrew, 4x Water Vole | 8 |
| 2 | economy | swarm (15 copies at 0 Lumber); economy (6 resource makers); tide x7 | 81% (76%-86%) | 0.35 | 0: 15, 1: 3, 2: 2 | 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 4x Tidepool Trapper Crab, 3x Box Turtle, 3x Grey Seal Bull, 2x Lodge Engineer | 9 |
| 3 | open | economy (4 resource makers); tide x8 | 75% (70%-80%) | 0.4 | 0: 12, 1: 8 | 4x Grey Seal Bull, 4x Muskrat Reedgatherer, 4x Platypus Spur, 4x Tidepool Trapper Crab, 4x Water Vole | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); tide x9 | 54% (48%-60%) | 1.05 | 0: 11, 1: 1, 2: 4, 3: 4 | 4x Fiddler Crab Swarm, 4x Lodge Engineer, 4x Pyrenean Desman, 4x Riverworks Bastion, 3x Box Turtle, 1x Snapstick Turtle | 20 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 83% | 75% | 67% | 79% | 75% | 100% | 96% | 92% | 79% | 88% |
| 2 economy | 71% | 67% | 71% | 75% | 75% | 100% | 100% | 100% | 75% | 75% |
| 3 open | 79% | 63% | 42% | 63% | 50% | 100% | 100% | 100% | 79% | 75% |
| 4 big | 42% | 42% | 38% | 58% | 38% | 83% | 83% | 88% | 38% | 33% |
