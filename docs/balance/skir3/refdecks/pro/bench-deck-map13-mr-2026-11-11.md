# Focused decks: Map 13 The Redwood Deep (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool alpine-marmot,anhinga-spearbird,badger-lumberjack,balloon-archer,bear-cub,beaver-feller,blue-ringed-octopus,box-turtle,burrow-rabbit,cunning-vixen,eagle-owl-quartermaster,feral-tomcat,fox-kit,grass-snake,grizzly-vanguard,ibex-rockcaller,lyrebird-mimic,marsh-mallow-hare,monarch-wingblade,mountain-hare,otter-centurion,owl-nightwatch,pika-hoarder,pine-marten,redwood-woodpecker,river-mink,sergeant-bramblefox,slow-worm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:strike-first,open --anchor anhinga-spearbird,badger-lumberjack,balloon-archer,bear-cub,beaver-feller,feral-tomcat,fox-kit,grass-snake,grizzly-vanguard,marsh-mallow-hare,monarch-wingblade,owl-nightwatch,pika-hoarder,pine-marten,redwood-woodpecker,sergeant-bramblefox,slow-worm --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9174 games in 138 s.

- The list (29): Alpine Marmot, Anhinga Spearbird, Badger Lumberjack, Balloon Archer, Bear Cub, Beaver Feller, Blue-ringed Octopus, Box Turtle, Burrow Rabbit, Cunning Vixen, Eagle-Owl Quartermaster, Tomcat, Fox Kit, Grass Snake, Grizzly Vanguard, Ibex Rockcaller, Lyrebird Mimic, Marsh-mallow Hare, Monarch Wingblade, Mountain Hare, Otter Centurion, Owl Nightwatch, Pika Hoarder, Pine Marten, Redwood Woodpecker, River Mink, Sergeant Bramblefox, Slow-worm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | strike-first x8 | 88% (84%-91%) | 0.35 | 0: 13, 1: 7 | 4x Anhinga Spearbird, 4x Bear Cub, 4x Box Turtle, 4x Tomcat, 3x Lyrebird Mimic, 1x Pika Hoarder | 20 |
| 2 | open | big (12 copies at 1+ Lumber, average 0.6); economy (12 resource makers) | 88% (84%-91%) | 0.6 | 0: 8, 1: 12 | 4x Badger Lumberjack, 4x Beaver Feller, 4x Burrow Rabbit, 4x Redwood Woodpecker, 2x Ibex Rockcaller, 2x Monarch Wingblade | 0 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (7 resource makers) | 84% (80%-87%) | 0.2 | 0: 16, 1: 4 | 4x Bear Cub, 4x Beaver Feller, 4x Fox Kit, 4x Pika Hoarder, 3x Badger Lumberjack, 1x Monarch Wingblade | 12 |
| 4 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x8 | 77% (73%-82%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Box Turtle, 4x Pika Hoarder, 3x Balloon Archer, 3x Owl Nightwatch, 2x Monarch Wingblade | 18 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 92% | 100% | 96% | 96% | 96% | 92% | 88% | 100% | 100% | 33% | 71% |
| 2 open | 100% | 96% | 83% | 100% | 92% | 96% | 88% | 100% | 100% | 42% | 67% |
| 3 economy | 83% | 92% | 83% | 100% | 96% | 96% | 96% | 100% | 100% | 17% | 58% |
| 4 family:flying | 83% | 96% | 71% | 75% | 92% | 83% | 67% | 88% | 100% | 33% | 63% |
