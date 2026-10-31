# Focused decks: Map 16 The Pinewood Taiga (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,fawn-scout,frost-hare-sprinter,pinecone-sapper,redwood-woodpecker,snowshoe-hare,taiga-lynx,wolf-pack-runner,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7320 games in 91 s.

- The list (15): Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Dhole Runner, Fawn Scout, Frost Hare Sprinter, Pinecone Sapper, Redwood Woodpecker, Snowshoe Hare, Taiga Lynx, Wolf Pack Runner, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (8 copies at 1+ Lumber, average 0.5); economy (4 resource makers); evasion x8; swarm x6 | 83% (79%-87%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Cone-cutter Squirrel, 4x Dhole Runner, 4x Frost Hare Sprinter, 4x Snowshoe Hare, 2x Dhole Matriarch, 2x Wolf Pack Runner | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); evasion x7 | 78% (73%-82%) | 0.3 | 0: 14, 1: 6 | 4x Frost Hare Sprinter, 4x Pinecone Sapper, 3x Bramblewood Lynx, 3x Dhole Runner, 3x Fawn Scout, 3x Snowshoe Hare | 10 |
| 3 | economy | big (9 copies at 1+ Lumber, average 0.6); economy (7 resource makers) | 77% (72%-82%) | 0.55 | 0: 11, 1: 7, 2: 2 | 4x Frost Hare Sprinter, 4x Pinecone Sapper, 4x Redwood Woodpecker, 3x Cone-cutter Squirrel, 3x Wolf Pack Runner, 2x Dhole Matriarch | 9 |
| 4 | big | big (12 copies at 1+ Lumber, average 0.7); economy (8 resource makers) | 74% (69%-79%) | 0.7 | 0: 8, 1: 10, 2: 2 | 4x Cone-cutter Squirrel, 4x Dhole Runner, 4x Redwood Woodpecker, 4x Snowshoe Hare, 2x Boreal Elk, 2x Wolf Pack Runner | 6 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 75% | 92% | 100% | 96% | 71% | 88% | 46% | 71% |
| 2 swarm | 100% | 83% | 75% | 75% | 96% | 92% | 58% | 88% | 29% | 81% |
| 3 economy | 92% | 83% | 75% | 77% | 96% | 83% | 71% | 88% | 52% | 50% |
| 4 big | 100% | 71% | 79% | 79% | 92% | 96% | 67% | 63% | 21% | 75% |
