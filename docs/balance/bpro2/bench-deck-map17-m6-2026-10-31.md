# Focused decks: Map 17 Wolfsbane Tundra (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,beluga,cone-cutter-squirrel,frost-hare-sprinter,glacial-ape-king,harbor-seal,lone-grey-wolf,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,swarm,family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7106 games in 97 s.

- The list (17): Alpha Howler, Beluga, Cone-cutter Squirrel, Frost Hare Sprinter, Glacial Ape-King, Harbor Seal, Lone Grey Wolf, Mountain Hare, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (16 copies at 0 Lumber); economy (4 resource makers); evasion x12; cold x6 | 81% (77%-86%) | 0.2 | 0: 16, 1: 4 | 4x Frost Hare Sprinter, 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 2x Beluga, 2x Walrus Icebreaker | 7 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (8 resource makers); evasion x10 | 81% (76%-85%) | 0.3 | 0: 14, 1: 6 | 4x Cone-cutter Squirrel, 4x Harbor Seal, 4x Snow Ermine, 4x Talus Pika, 2x Frost Hare Sprinter, 2x Ravenous Wolverine | 10 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (8 resource makers); evasion x8; cold x6 | 80% (76%-85%) | 0.2 | 0: 16, 1: 4 | 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 2x Ravenous Wolverine, 2x Walrus Icebreaker | 12 |
| 4 | open | economy (4 resource makers); evasion x11; tide x7 | 69% (63%-74%) | 0.45 | 0: 11, 1: 9 | 4x Harbor Seal, 4x Mountain Hare, 4x Talus Pika, 3x Beluga, 3x Frost Hare Sprinter, 2x Lone Grey Wolf | 0 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 83% | 100% | 92% | 79% | 67% | 88% | 75% | 58% | 88% | 88% | 79% |
| 2 swarm | 79% | 92% | 88% | 83% | 83% | 96% | 58% | 54% | 100% | 75% | 79% |
| 3 economy | 83% | 88% | 88% | 71% | 67% | 83% | 71% | 63% | 100% | 83% | 88% |
| 4 open | 71% | 88% | 83% | 71% | 58% | 88% | 63% | 50% | 63% | 56% | 67% |
