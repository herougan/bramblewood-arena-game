# Focused decks: Map 17 Wolfsbane Tundra (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,alpine-marmot,beaver-lumberjack,beluga,blue-ringed-octopus,chamois-leaper,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dust-hyena,eagle-owl-quartermaster,frost-hare-sprinter,grave-grin-hyena,grey-seal-bull,harbor-seal,ibex-rockcaller,lone-grey-wolf,mountain-hare,polar-bear,snow-bunting-archer,snow-ermine,spitting-spider,stoat-cutthroat,taiga-lynx,walrus-icebreaker,water-vole,wolf-spider-mother,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:evasion,family:cold,open --anchor alpha-howler,beaver-lumberjack,beluga,cone-cutter-squirrel,frost-hare-sprinter,harbor-seal,ibex-rockcaller,lone-grey-wolf,mountain-hare,polar-bear,snow-bunting-archer,snow-ermine,spitting-spider,taiga-lynx,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7524 games in 159 s.

- The list (29): Alpha Howler, Alpine Marmot, Beaver Lumberjack, Beluga, Blue-ringed Octopus, Chamois Leaper, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dust Hyena, Eagle-Owl Quartermaster, Frost Hare Sprinter, Grave-Grin Hyena, Grey Seal Bull, Harbor Seal, Ibex Rockcaller, Lone Grey Wolf, Mountain Hare, Polar Bear, Snow Bunting Archer, Snow Ermine, Spitting Spider, Stoat Cutthroat, Taiga Lynx, Walrus Icebreaker, Water Vole, Wolf Spider Mother, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (8 resource makers); cold x9 | 90% (87%-94%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Dust Hyena, 4x Snow Bunting Archer, 3x Wolf Spider Mother, 3x Woodland Caribou, 2x Walrus Icebreaker | 12 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 88% (85%-92%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Cone-cutter Squirrel, 4x Grave-Grin Hyena, 4x Snow Bunting Archer, 2x Blue-ringed Octopus, 2x Ibex Rockcaller | 0 |
| 3 | family:evasion | swarm (16 copies at 0 Lumber); evasion x12; cold x6 | 85% (81%-88%) | 0.2 | 0: 16, 1: 4 | 4x Alpine Marmot, 4x Mountain Hare, 4x Snow Ermine, 4x Water Vole, 2x Walrus Icebreaker, 2x Wolfsbane Alpha | 16 |
| 4 | family:cold | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); cold x10; evasion x8 | 77% (72%-82%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Harbor Seal, 4x Mountain Hare, 4x Woodland Caribou, 2x Lone Grey Wolf, 2x Walrus Icebreaker | 16 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 96% | 92% | 100% | 96% | 92% | 96% | 67% | 100% | 83% | 71% |
| 2 open | 96% | 96% | 100% | 96% | 100% | 92% | 96% | 42% | 96% | 88% | 71% |
| 3 family:evasion | 100% | 100% | 96% | 96% | 100% | 88% | 96% | 50% | 100% | 65% | 42% |
| 4 family:cold | 79% | 88% | 88% | 79% | 100% | 79% | 88% | 50% | 92% | 50% | 54% |
