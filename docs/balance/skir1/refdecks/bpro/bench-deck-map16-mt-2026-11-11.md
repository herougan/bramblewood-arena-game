# Focused decks: Map 16 The Pinewood Taiga (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,grizzly-vanguard,mountain-hare,owl-nightwatch,pinecone-crossbill,redwood-woodpecker,snowshoe-hare,taiga-lynx,timber-wolf-pack,woodland-caribou --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:evasion,family:cleave,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3340 games in 592 s.

- The list (15): Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Dhole Runner, Grizzly Vanguard, Mountain Hare, Owl Nightwatch, Pinecone Crossbill, Redwood Woodpecker, Snowshoe Hare, Taiga Lynx, Timber Wolf Pack Leader, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers); evasion x10 | 78% (74%-83%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Snowshoe Hare, 3x Berserker Boar, 3x Bramblewood Lynx, 2x Owl Nightwatch | 16 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); evasion x10 | 75% (69%-80%) | 0.3 | 0: 14, 1: 6 | 4x Mountain Hare, 4x Pinecone Crossbill, 4x Redwood Woodpecker, 4x Snowshoe Hare, 2x Cone-cutter Squirrel, 2x Taiga Lynx | 10 |
| 3 | open | big (14 copies at 1+ Lumber, average 1.0); economy (6 resource makers) | 57% (52%-62%) | 1 | 0: 6, 1: 8, 2: 6 | 4x Boreal Elk, 4x Dhole Runner, 4x Pinecone Crossbill, 4x Redwood Woodpecker, 2x Berserker Boar, 2x Cone-cutter Squirrel | 0 |
| 4 | family:cleave | big (10 copies at 1+ Lumber, average 1.0); cleave x8; guard x6 | 40% (35%-45%) | 1 | 0: 10, 2: 10 | 4x Boreal Elk, 4x Grizzly Vanguard, 4x Mountain Hare, 4x Pinecone Crossbill, 2x Dhole Matriarch, 2x Snowshoe Hare | 12 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 92% | 83% | 88% | 92% | 96% | 79% | 67% | 92% | 38% | 58% |
| 2 economy | 79% | 79% | 92% | 83% | 96% | 75% | 63% | 83% | 38% | 58% |
| 3 open | 50% | 38% | 79% | 71% | 83% | 79% | 54% | 88% | 8% | 21% |
| 4 family:cleave | 38% | 17% | 79% | 38% | 67% | 71% | 42% | 46% | 4% | 0% |
