# Focused decks: Map 17 Wolfsbane Tundra (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,beaver-lumberjack,beluga,cone-cutter-squirrel,frost-hare-sprinter,harbor-seal,ibex-rockcaller,lone-grey-wolf,mountain-hare,polar-bear,snow-bunting-archer,snow-ermine,spitting-spider,taiga-lynx,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:evasion,family:cold,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7260 games in 125 s.

- The list (17): Alpha Howler, Beaver Lumberjack, Beluga, Cone-cutter Squirrel, Frost Hare Sprinter, Harbor Seal, Ibex Rockcaller, Lone Grey Wolf, Mountain Hare, Polar Bear, Snow Bunting Archer, Snow Ermine, Spitting Spider, Taiga Lynx, Walrus Icebreaker, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); evasion x11; cold x6 | 91% (88%-94%) | 0.4 | 0: 12, 1: 8 | 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Snow Ermine, 3x Beluga, 3x Taiga Lynx, 2x Walrus Icebreaker | 11 |
| 2 | family:cold | big (8 copies at 1+ Lumber, average 0.4); evasion x12; cold x10 | 83% (78%-87%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Mountain Hare, 4x Snow Ermine, 4x Woodland Caribou, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 10 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); cold x10 | 81% (77%-85%) | 0.4 | 0: 12, 1: 8 | 4x Beaver Lumberjack, 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Snow Bunting Archer, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 14 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4); evasion x11; tide x6 | 79% (75%-83%) | 0.4 | 0: 12, 1: 8 | 4x Beaver Lumberjack, 4x Frost Hare Sprinter, 4x Snow Ermine, 3x Beluga, 3x Harbor Seal, 2x Walrus Icebreaker | 0 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 100% | 100% | 100% | 100% | 100% | 100% | 96% | 67% | 96% | 63% | 83% |
| 2 family:cold | 96% | 96% | 92% | 83% | 100% | 83% | 92% | 63% | 88% | 58% | 58% |
| 3 big | 92% | 92% | 92% | 96% | 92% | 92% | 88% | 50% | 88% | 67% | 46% |
| 4 open | 83% | 96% | 92% | 96% | 92% | 96% | 79% | 33% | 96% | 50% | 58% |
