# Focused decks: Map 17 Wolfsbane Tundra (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alpha-howler,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,fox-sharpshot,frost-hare-sprinter,glacial-ape-king,grave-grin-hyena,harbor-seal,ibex-rockcaller,lone-grey-wolf,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,squires-mount,stoat-cutthroat,swamp-rabbit,talus-pika,walrus-icebreaker,wolf-spider-mother,woodland-caribou --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,swarm,family:evasion,open --anchor alpha-howler,cone-cutter-squirrel,frost-hare-sprinter,glacial-ape-king,harbor-seal,lone-grey-wolf,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13706 games in 204 s.

- The list (26): Alpha Howler, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Fox Sharpshot, Frost Hare Sprinter, Glacial Ape-King, Grave-Grin Hyena, Harbor Seal, Ibex Rockcaller, Lone Grey Wolf, Mountain Hare, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Squire's Mount, Stoat Cutthroat, Swamp Rabbit, Talus Pika, Walrus Icebreaker, Wolf Spider Mother, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers); cold x6 | 84% (79%-88%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Talus Pika, 4x Woodland Caribou, 3x Cunning Vixen, 3x Wolf Spider Mother, 2x Walrus Icebreaker | 10 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); evasion x10; cold x7 | 82% (78%-87%) | 0.3 | 0: 14, 1: 6 | 4x Mountain Hare, 4x Talus Pika, 3x Frost Hare Sprinter, 3x Snow Ermine, 3x Wolf Spider Mother, 3x Woodland Caribou | 14 |
| 3 | family:evasion | swarm (16 copies at 0 Lumber); economy (4 resource makers); evasion x8; cold x6 | 82% (77%-86%) | 0.2 | 0: 16, 1: 4 | 4x Grave-Grin Hyena, 4x Mountain Hare, 4x Snow Ermine, 4x Talus Pika, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 16 |
| 4 | open | economy (4 resource makers); evasion x7 | 82% (77%-86%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Snow Ermine, 3x Cunning Vixen, 3x Eagle-Owl Quartermaster, 3x Ravenous Wolverine, 3x Wolf Spider Mother | 0 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 79% | 88% | 75% | 71% | 96% | 100% | 92% | 71% | 92% | 79% | 79% |
| 2 swarm | 79% | 96% | 92% | 71% | 83% | 96% | 88% | 58% | 96% | 71% | 75% |
| 3 family:evasion | 83% | 83% | 96% | 67% | 88% | 88% | 79% | 67% | 83% | 79% | 88% |
| 4 open | 100% | 79% | 83% | 63% | 92% | 96% | 75% | 63% | 88% | 83% | 79% |
