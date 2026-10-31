# Focused decks: Map 17 Wolfsbane Tundra (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,cone-cutter-squirrel,frost-hare-sprinter,glacial-ape-king,harbor-seal,lone-grey-wolf,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,swarm,family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7348 games in 92 s.

- The list (14): Alpha Howler, Cone-cutter Squirrel, Frost Hare Sprinter, Glacial Ape-King, Harbor Seal, Lone Grey Wolf, Mountain Hare, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Talus Pika, Walrus Icebreaker.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); evasion x8 | 77% (72%-82%) | 0.45 | 0: 11, 1: 9 | 4x Harbor Seal, 4x Snow Ermine, 4x Talus Pika, 3x Cone-cutter Squirrel, 3x Ravenous Wolverine, 2x Walrus Icebreaker | 10 |
| 2 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers); evasion x13 | 73% (68%-78%) | 0.25 | 0: 15, 1: 5 | 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 3x Frost Hare Sprinter, 3x Ravenous Wolverine, 2x Harbor Seal | 9 |
| 3 | open | economy (4 resource makers); evasion x8; cold x6 | 69% (64%-75%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Snow Bunting Archer, 4x Snow Ermine, 4x Talus Pika, 2x Lone Grey Wolf, 2x Walrus Icebreaker | 0 |
| 4 | family:evasion | evasion x12 | 68% (63%-73%) | 0.5 | 0: 10, 1: 10 | 4x Frost Hare Sprinter, 4x Harbor Seal, 4x Snow Ermine, 3x Ravenous Wolverine, 3x Snow Bunting Archer, 2x Talus Pika | 7 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 83% | 83% | 88% | 67% | 88% | 96% | 63% | 54% | 75% | 83% | 71% |
| 2 swarm | 100% | 88% | 92% | 54% | 71% | 83% | 50% | 54% | 96% | 33% | 83% |
| 3 open | 71% | 88% | 79% | 46% | 63% | 67% | 46% | 50% | 96% | 79% | 79% |
| 4 family:evasion | 75% | 88% | 96% | 67% | 71% | 71% | 46% | 46% | 79% | 50% | 58% |
