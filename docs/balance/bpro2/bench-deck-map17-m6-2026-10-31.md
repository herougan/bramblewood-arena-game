# Focused decks: Map 17 Wolfsbane Tundra (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,beluga,cone-cutter-squirrel,frost-hare-sprinter,glacial-ape-king,harbor-seal,lone-grey-wolf,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,swarm,family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7150 games in 145 s.

- The list (17): Alpha Howler, Beluga, Cone-cutter Squirrel, Frost Hare Sprinter, Glacial Ape-King, Harbor Seal, Lone Grey Wolf, Mountain Hare, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (8 resource makers); evasion x10 | 80% (76%-85%) | 0.3 | 0: 14, 1: 6 | 4x Cone-cutter Squirrel, 4x Harbor Seal, 4x Snow Ermine, 4x Talus Pika, 2x Frost Hare Sprinter, 2x Ravenous Wolverine | 6 |
| 2 | economy | swarm (16 copies at 0 Lumber); economy (8 resource makers); evasion x8; cold x6 | 80% (75%-85%) | 0.2 | 0: 16, 1: 4 | 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 2x Ravenous Wolverine, 2x Walrus Icebreaker | 8 |
| 3 | family:evasion | swarm (16 copies at 0 Lumber); economy (4 resource makers); evasion x12; cold x8 | 79% (75%-84%) | 0.2 | 0: 16, 1: 4 | 4x Frost Hare Sprinter, 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 2x Snow Bunting Archer, 2x Walrus Icebreaker | 9 |
| 4 | open | swarm (15 copies at 0 Lumber); economy (8 resource makers); evasion x7 | 72% (67%-77%) | 0.25 | 0: 15, 1: 5 | 4x Cone-cutter Squirrel, 4x Snow Ermine, 4x Talus Pika, 3x Beluga, 3x Frost Hare Sprinter, 2x Lone Grey Wolf | 0 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 79% | 92% | 88% | 83% | 83% | 96% | 58% | 54% | 100% | 71% | 79% |
| 2 economy | 83% | 88% | 88% | 71% | 67% | 83% | 71% | 63% | 100% | 79% | 88% |
| 3 family:evasion | 79% | 96% | 88% | 58% | 63% | 75% | 75% | 58% | 100% | 92% | 88% |
| 4 open | 79% | 79% | 92% | 54% | 63% | 75% | 67% | 46% | 92% | 67% | 79% |
