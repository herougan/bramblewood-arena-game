# Focused decks: Map 13 The Redwood Deep (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool badger-lumberjack,barkplate-beetle,bear-cub,berserker-boar,blue-ringed-octopus,bramble-hoglet,bramblewood-lynx,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,eagle-owl-quartermaster,fawn-scout,fox-kit,grizzly-vanguard,heartwood-treant,ibex-rockcaller,leopard-slug,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,river-mink,robin-redbreast,seed-cache-squirrel,sergeant-bramblefox,stag-knight,swift-fox,tasmanian-devil,tide-spirit,truffle-piglet,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,big,open --anchor badger-lumberjack,bear-cub,berserker-boar,bramble-hoglet,bramblewood-lynx,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,heartwood-treant,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,sergeant-bramblefox,stag-knight,swift-fox,tasmanian-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9482 games in 90 s.

- The list (33): Badger Lumberjack, Barkplate Beetle, Bear Cub, Berserker Boar, Blue-ringed Octopus, Bramble Hoglet, Bramblewood Lynx, Chipmunk Skirmisher, Corpse-flower Beetle, Cunning Vixen, Eagle-Owl Quartermaster, Fawn Scout, Fox Kit, Grizzly Vanguard, Heartwood Treant, Ibex Rockcaller, Leopard Slug, Lyrebird Mimic, Owl Nightwatch, Pine Marten, Quill-Thorn Boar, Redwood Woodpecker, River Mink, Robin Redbreast, Seed-cache Squirrel, Sergeant Bramblefox, Stag Champion, Swift Fox, Tasmanian Devil, Tide Seahorse, Truffle Piglet, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (15 copies at 0 Lumber); economy (6 resource makers); flying x8; day x8 | 93% (90%-96%) | 0.25 | 0: 15, 1: 5 | 4x Fox Kit, 4x Robin Redbreast, 4x Upside-Down Bat, 3x Badger Lumberjack, 3x Chipmunk Skirmisher, 2x Ibex Rockcaller | 13 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 91% (88%-94%) | 0.45 | 0: 11, 1: 9 | 4x Badger Lumberjack, 4x Bramble Hoglet, 4x Robin Redbreast, 3x Bramblewood Lynx, 3x Fawn Scout, 2x Ibex Rockcaller | 20 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); flying x8; day x8 | 86% (83%-90%) | 0.3 | 0: 14, 1: 6 | 4x Bear Cub, 4x Robin Redbreast, 4x Swift Fox, 4x Upside-Down Bat, 2x Corpse-flower Beetle, 2x Leopard Slug | 18 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.7) | 82% (79%-85%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Berserker Boar, 4x Fox Kit, 4x Leopard Slug, 4x River Mink, 3x Chipmunk Skirmisher, 1x Sergeant Bramblefox | 0 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 92% | 100% | 92% | 100% | 100% | 96% | 100% | 92% | 96% | 75% | 79% |
| 2 big | 92% | 96% | 100% | 100% | 100% | 92% | 100% | 88% | 100% | 63% | 75% |
| 3 family:flying | 79% | 88% | 88% | 100% | 100% | 92% | 100% | 100% | 100% | 54% | 50% |
| 4 open | 92% | 88% | 92% | 100% | 96% | 96% | 96% | 67% | 100% | 0% | 75% |
