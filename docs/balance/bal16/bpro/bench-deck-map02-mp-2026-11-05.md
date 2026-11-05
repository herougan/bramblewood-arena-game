# Focused decks: Map 2 Lilypad Reach (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mp --pool alley-cat,box-turtle,lodge-engineer,muskrat-lodgekeeper,muskrat-reedgatherer,old-shell,old-sturgeon,platypus-spur,pond-algae,pyrenean-desman,riverworks-bastion,snapstick-turtle,water-shrew,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6720 games in 229 s.

- The list (14): Alley Cat, Box Turtle, Lodge Engineer, Muskrat Lodgekeeper, Muskrat Reedgatherer, The Old Shell, Old Sturgeon, Platypus Spur, Pond Algae, Pyrenean Desman, Riverworks Bastion, Snapstick Turtle, Water Shrew, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-A-1 skirmish's deck; 2-A-2 skirmish's deck; 2-A-3 skirmish's deck; 2-A-4 skirmish's deck; 2-A-5 elite's deck; 2-A-6 elite's deck; 2-A-7 boss's deck; reference starter deck under 2-A-1's field; reference deck (Map 6) under 2-A-2's field; expected player deck (expectedPlayerDeck) under 2-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | tide x10 | 88% (85%-90%) | 0.4 | 0: 12, 1: 8 | 4x Muskrat Lodgekeeper, 4x Muskrat Reedgatherer, 4x Platypus Spur, 4x Pyrenean Desman, 2x Alley Cat, 2x Water Vole | 0 |
| 2 | family:tide | swarm (20 copies at 0 Lumber); tide x8 | 80% (77%-82%) | 0 | 0: 20 | 4x Box Turtle, 4x Muskrat Reedgatherer, 4x Pyrenean Desman, 4x Water Shrew, 4x Water Vole | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1) | 73% (70%-76%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Lodge Engineer, 4x Pyrenean Desman, 4x Riverworks Bastion, 3x Box Turtle, 3x Muskrat Reedgatherer, 2x The Old Shell | 13 |
| 4 | family:armor | tide x11; armor x8 | 68% (64%-71%) | 0.55 | 0: 9, 1: 11 | 4x Muskrat Reedgatherer, 4x The Old Shell, 4x Old Sturgeon, 4x Pyrenean Desman, 3x Snapstick Turtle, 1x Water Shrew | 12 |

## Per opponent

| Deck | fight:2-A-1 | fight:2-A-2 | fight:2-A-3 | fight:2-A-4 | fight:2-A-5 | fight:2-A-6 | fight:2-A-7 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 17% | 58% |
| 2 family:tide | 92% | 100% | 100% | 100% | 96% | 100% | 96% | 92% | 0% | 21% |
| 3 big | 67% | 100% | 96% | 92% | 92% | 100% | 100% | 79% | 0% | 4% |
| 4 family:armor | 54% | 96% | 100% | 100% | 96% | 71% | 100% | 63% | 0% | 0% |
