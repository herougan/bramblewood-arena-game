# Focused decks: Map 16 The Pinewood Taiga (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alley-cat,alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,fawn-scout,frost-hare-sprinter,grave-grin-hyena,ibex-rockcaller,margay,mountain-hare,muntjac-barker,pinecone-sapper,redwood-woodpecker,snowshoe-hare,squires-mount,stoat-cutthroat,swamp-rabbit,taiga-lynx,wolf-pack-runner,wolf-spider-mother,woodland-caribou,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,fawn-scout,frost-hare-sprinter,pinecone-sapper,redwood-woodpecker,snowshoe-hare,taiga-lynx,wolf-pack-runner,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13100 games in 190 s.

- The list (27): Alley Cat, Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Fawn Scout, Frost Hare Sprinter, Grave-Grin Hyena, Ibex Rockcaller, Margay, Mountain Hare, Muntjac Barker, Pinecone Sapper, Redwood Woodpecker, Snowshoe Hare, Squire's Mount, Stoat Cutthroat, Swamp Rabbit, Taiga Lynx, Wolf Pack Runner, Wolf Spider Mother, Woodland Caribou, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (16 copies at 1+ Lumber, average 0.8); economy (8 resource makers); swarm x6 | 91% (88%-95%) | 0.8 | 0: 4, 1: 16 | 4x Cone-cutter Squirrel, 4x Redwood Woodpecker, 3x Dhole Runner, 3x Stoat Cutthroat, 3x Wolf Pack Runner, 3x Wolf Spider Mother | 15 |
| 2 | swarm | swarm (16 copies at 0 Lumber); evasion x12 | 90% (87%-94%) | 0.25 | 0: 16, 1: 3, 2: 1 | 4x Frost Hare Sprinter, 4x Mountain Hare, 4x Pinecone Sapper, 4x Snowshoe Hare, 3x Wolf Spider Mother, 1x Dhole Matriarch | 12 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); ranged x6 | 88% (84%-91%) | 0.45 | 0: 11, 1: 9 | 4x Cone-cutter Squirrel, 4x Grave-Grin Hyena, 3x Eagle-Owl Quartermaster, 3x Fawn Scout, 3x Squire's Mount, 3x Wolf Pack Runner | 10 |
| 4 | open | swarm (15 copies at 0 Lumber); evasion x8 | 85% (81%-89%) | 0.25 | 0: 15, 1: 5 | 4x Grave-Grin Hyena, 4x Mountain Hare, 4x Snowshoe Hare, 3x Fawn Scout, 3x Wolf Pack Runner, 2x Stoat Cutthroat | 0 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 96% | 92% | 92% | 100% | 96% | 96% | 88% | 58% | 96% |
| 2 swarm | 98% | 100% | 85% | 92% | 100% | 88% | 92% | 100% | 67% | 83% |
| 3 big | 100% | 96% | 92% | 96% | 100% | 79% | 96% | 92% | 42% | 88% |
| 4 open | 100% | 88% | 83% | 96% | 100% | 83% | 92% | 88% | 50% | 71% |
