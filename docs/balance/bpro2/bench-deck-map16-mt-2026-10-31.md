# Focused decks: Map 16 The Pinewood Taiga (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,lunar-howler,pinecone-sapper,redwood-woodpecker,snowshoe-hare,swift-fox,taiga-lynx,wolf-pack-runner,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:cleave,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6980 games in 191 s.

- The list (15): Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Dhole Runner, Lunar Howler, Pinecone Sapper, Redwood Woodpecker, Snowshoe Hare, Swift Fox, Taiga Lynx, Wolf Pack Runner, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (8 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 81% (76%-85%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Cone-cutter Squirrel, 4x Pinecone Sapper, 4x Snowshoe Hare, 3x Dhole Runner, 3x Swift Fox, 2x Dhole Matriarch | 0 |
| 2 | economy | big (14 copies at 1+ Lumber, average 0.8); economy (6 resource makers); swarm x6 | 72% (67%-78%) | 0.8 | 0: 6, 1: 12, 2: 2 | 4x Dhole Runner, 4x Pinecone Sapper, 4x Redwood Woodpecker, 4x Swift Fox, 2x Cone-cutter Squirrel, 2x Dhole Matriarch | 6 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 71% (66%-77%) | 0.4 | 0: 12, 1: 8 | 4x Cone-cutter Squirrel, 4x Pinecone Sapper, 4x Snowshoe Hare, 4x Woodland Caribou, 3x Wolf Pack Runner, 1x Dhole Runner | 7 |
| 4 | family:cleave | big (12 copies at 1+ Lumber, average 1.0); economy (8 resource makers); cleave x8 | 44% (38%-50%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Alpha Howler, 4x Boreal Elk, 4x Cone-cutter Squirrel, 4x Pinecone Sapper, 4x Redwood Woodpecker | 12 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 73% | 88% | 67% | 96% | 92% | 75% | 96% | 67% | 63% |
| 2 economy | 100% | 67% | 67% | 46% | 83% | 88% | 71% | 73% | 63% | 67% |
| 3 big | 92% | 58% | 67% | 54% | 88% | 88% | 71% | 90% | 40% | 67% |
| 4 family:cleave | 67% | 46% | 42% | 38% | 58% | 69% | 42% | 38% | 8% | 38% |
