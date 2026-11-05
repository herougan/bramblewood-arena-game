# Focused decks: Map 16 The Pinewood Taiga (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,grizzly-vanguard,lunar-howler,owl-nightwatch,redwood-woodpecker,snowshoe-hare,swift-fox,taiga-lynx,tasmanian-devil,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:cleave,family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7020 games in 99 s.

- The list (15): Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Grizzly Vanguard, Lunar Howler, Owl Nightwatch, Redwood Woodpecker, Snowshoe Hare, Swift Fox, Taiga Lynx, Tasmanian Devil, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | big (12 copies at 1+ Lumber, average 0.7); economy (4 resource makers); evasion x8 | 77% (72%-82%) | 0.65 | 0: 8, 1: 11, 2: 1 | 4x Cone-cutter Squirrel, 4x Owl Nightwatch, 4x Snowshoe Hare, 4x Swift Fox, 3x Woodland Caribou, 1x Berserker Boar | 10 |
| 2 | economy | big (16 copies at 1+ Lumber, average 0.9); economy (8 resource makers); evasion x6 | 70% (64%-75%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Cone-cutter Squirrel, 4x Redwood Woodpecker, 3x Boreal Elk, 3x Bramblewood Lynx, 3x Owl Nightwatch, 3x Taiga Lynx | 10 |
| 3 | open | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 65% (59%-70%) | 0.7 | 0: 6, 1: 14 | 4x Cone-cutter Squirrel, 4x Swift Fox, 4x Tasmanian Devil, 3x Bramblewood Lynx, 3x Taiga Lynx, 2x Snowshoe Hare | 0 |
| 4 | family:cleave | big (12 copies at 1+ Lumber, average 1.0); economy (4 resource makers); cleave x8; evasion x6 | 46% (40%-52%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Alpha Howler, 4x Boreal Elk, 4x Cone-cutter Squirrel, 4x Snowshoe Hare, 2x Owl Nightwatch, 2x Tasmanian Devil | 12 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 88% | 63% | 92% | 100% | 88% | 92% | 79% | 88% | 33% | 50% |
| 2 economy | 75% | 46% | 79% | 92% | 75% | 92% | 79% | 88% | 29% | 42% |
| 3 open | 54% | 63% | 79% | 83% | 63% | 92% | 71% | 75% | 29% | 38% |
| 4 family:cleave | 46% | 21% | 67% | 58% | 58% | 71% | 58% | 42% | 8% | 29% |
