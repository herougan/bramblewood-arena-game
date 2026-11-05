# Focused decks: Map 4 Sunken Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool alley-cat,beaver-lumberjack,drowned-matriarch,duck-paddler,field-vole,lions-mane-jelly,muskrat-lodgekeeper,platypus-spur,pond-algae,pyrenean-desman,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 143 s.

- The list (14): Alley Cat, Beaver Lumberjack, The Drowned Matriarch, Duck Paddler, Field Vole, Lion's Mane Jelly, Muskrat Lodgekeeper, Platypus Spur, Pond Algae, Pyrenean Desman, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1 Lumber, average 0.4); tide x12 | 81% (76%-86%) | 0.4 | 0: 12, 1: 8 | 4x Duck Paddler, 4x Field Vole, 4x Pyrenean Desman, 4x Shoal Shark, 3x The Drowned Matriarch, 1x Muskrat Lodgekeeper | 13 |
| 2 | family:tide | big (10 copies at 1 Lumber, average 0.5); tide x14; cleave x6 | 80% (74%-85%) | 0.5 | 0: 10, 1: 10 | 4x The Drowned Matriarch, 4x Muskrat Lodgekeeper, 4x Pyrenean Desman, 4x Slow-worm, 2x Alley Cat, 2x Shoal Shark | 10 |
| 3 | open | big (8 copies at 1 Lumber, average 0.4); tide x8; cleave x8 | 73% (68%-78%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x The Drowned Matriarch, 4x Platypus Spur, 4x Pond Algae, 4x Pyrenean Desman | 0 |
| 4 | family:poison | poison x8; tide x6 | 72% (66%-78%) | 0.35 | 0: 13, 1: 7 | 4x Lion's Mane Jelly, 4x Water Shrew, 3x The Drowned Matriarch, 3x Duck Paddler, 3x Pond Algae, 3x Pyrenean Desman | 11 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 88% | 83% | 100% | 79% | 96% | 46% | 58% |
| 2 family:tide | 96% | 79% | 79% | 96% | 79% | 96% | 50% | 63% |
| 3 open | 79% | 96% | 83% | 88% | 79% | 96% | 29% | 33% |
| 4 family:poison | 96% | 79% | 71% | 92% | 67% | 88% | 46% | 38% |
