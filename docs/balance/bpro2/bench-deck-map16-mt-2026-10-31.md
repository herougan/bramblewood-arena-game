# Focused decks: Map 16 The Pinewood Taiga (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,lunar-howler,pinecone-sapper,redwood-woodpecker,snowshoe-hare,swift-fox,taiga-lynx,wolf-pack-runner,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:cleave,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6760 games in 85 s.

- The list (15): Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Dhole Runner, Lunar Howler, Pinecone Sapper, Redwood Woodpecker, Snowshoe Hare, Swift Fox, Taiga Lynx, Wolf Pack Runner, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5); evasion x7 | 74% (69%-79%) | 0.45 | 0: 11, 1: 9 | 4x Pinecone Sapper, 4x Snowshoe Hare, 4x Swift Fox, 3x Cone-cutter Squirrel, 3x Taiga Lynx, 2x Woodland Caribou | 7 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 74% (68%-79%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Cone-cutter Squirrel, 4x Pinecone Sapper, 4x Snowshoe Hare, 4x Woodland Caribou, 3x Wolf Pack Runner, 1x Boreal Elk | 0 |
| 3 | economy | big (16 copies at 1+ Lumber, average 0.9); economy (7 resource makers); swarm x6 | 71% (66%-77%) | 0.9 | 0: 4, 1: 14, 2: 2 | 4x Cone-cutter Squirrel, 4x Dhole Runner, 4x Swift Fox, 3x Bramblewood Lynx, 3x Redwood Woodpecker, 2x Dhole Matriarch | 16 |
| 4 | family:cleave | big (10 copies at 1+ Lumber, average 0.9); economy (4 resource makers); cleave x8 | 46% (41%-52%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Alpha Howler, 4x Boreal Elk, 4x Cone-cutter Squirrel, 4x Pinecone Sapper, 2x Snowshoe Hare, 2x Swift Fox | 9 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 94% | 75% | 71% | 58% | 100% | 58% | 96% | 83% | 38% | 67% |
| 2 open | 92% | 63% | 71% | 58% | 85% | 88% | 77% | 85% | 50% | 67% |
| 3 economy | 79% | 75% | 75% | 63% | 83% | 92% | 71% | 67% | 40% | 67% |
| 4 family:cleave | 81% | 50% | 33% | 42% | 67% | 75% | 38% | 35% | 8% | 33% |
