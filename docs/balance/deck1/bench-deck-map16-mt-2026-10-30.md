# Focused decks: Map 16 The Pinewood Taiga (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alley-cat,alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,grave-grin-hyena,ibex-rockcaller,lunar-howler,margay,mountain-hare,muntjac-barker,pinecone-sapper,redwood-woodpecker,snowshoe-hare,squires-mount,stoat-cutthroat,swift-fox,taiga-lynx,wolf-pack-runner,wolf-spider-mother,woodland-caribou,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,lunar-howler,pinecone-sapper,redwood-woodpecker,snowshoe-hare,swift-fox,taiga-lynx,wolf-pack-runner,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 120 s.

- The list (27): Alley Cat, Alpha Howler, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Grave-Grin Hyena, Ibex Rockcaller, Lunar Howler, Margay, Mountain Hare, Muntjac Barker, Pinecone Sapper, Redwood Woodpecker, Snowshoe Hare, Squire's Mount, Stoat Cutthroat, Swift Fox, Taiga Lynx, Wolf Pack Runner, Wolf Spider Mother, Woodland Caribou, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 88% (84%-91%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Grave-Grin Hyena, 4x Swift Fox, 3x Squire's Mount, 3x Wolf Pack Runner, 2x Ibex Rockcaller | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber); evasion x8 | 85% (81%-89%) | 0.2 | 0: 16, 1: 4 | 4x Alley Cat, 4x Mountain Hare, 4x Pinecone Sapper, 4x Snowshoe Hare, 3x Swift Fox, 1x Woodland Caribou | 17 |
| 3 | big | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 81% (77%-85%) | 0.55 | 0: 9, 1: 11 | 4x Cone-cutter Squirrel, 4x Swift Fox, 4x Woodpecker Sapper, 3x Grave-Grin Hyena, 3x Squire's Mount, 2x Pinecone Sapper | 6 |
| 4 | economy | economy (7 resource makers); evasion x7 | 79% (74%-83%) | 0.35 | 0: 13, 1: 7 | 4x Mountain Hare, 4x Redwood Woodpecker, 3x Cone-cutter Squirrel, 3x Grave-Grin Hyena, 3x Snowshoe Hare, 3x Stoat Cutthroat | 14 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 83% | 88% | 100% | 88% | 100% | 100% | 46% | 79% |
| 2 swarm | 92% | 92% | 88% | 92% | 100% | 75% | 96% | 83% | 46% | 88% |
| 3 big | 100% | 79% | 79% | 79% | 100% | 75% | 92% | 96% | 31% | 79% |
| 4 economy | 96% | 83% | 75% | 88% | 88% | 75% | 83% | 92% | 33% | 75% |
