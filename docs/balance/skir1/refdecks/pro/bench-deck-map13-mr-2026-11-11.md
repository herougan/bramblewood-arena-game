# Focused decks: Map 13 The Redwood Deep (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool badger-lumberjack,barkplate-beetle,bear-cub,berserker-boar,blue-ringed-octopus,bramble-hoglet,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,eagle-owl-quartermaster,fawn-scout,fox-kit,grizzly-vanguard,heartwood-treant,ibex-rockcaller,leopard-slug,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,river-mink,robin-redbreast,seed-cache-squirrel,sergeant-bramblefox,stag-knight,tide-spirit,truffle-piglet,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus economy,family:flying,big,open --anchor badger-lumberjack,bear-cub,berserker-boar,bramble-hoglet,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,heartwood-treant,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,sergeant-bramblefox,stag-knight --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2750 games in 466 s.

- The list (30): Badger Lumberjack, Barkplate Beetle, Bear Cub, Berserker Boar, Blue-ringed Octopus, Bramble Hoglet, Chipmunk Skirmisher, Corpse-flower Beetle, Cunning Vixen, Eagle-Owl Quartermaster, Fawn Scout, Fox Kit, Grizzly Vanguard, Heartwood Treant, Ibex Rockcaller, Leopard Slug, Lyrebird Mimic, Owl Nightwatch, Pine Marten, Quill-Thorn Boar, Redwood Woodpecker, River Mink, Robin Redbreast, Seed-cache Squirrel, Sergeant Bramblefox, Stag Champion, Tide Seahorse, Truffle Piglet, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (17 copies at 0 Lumber); flying x8; day x8 | 91% (88%-94%) | 0.15 | 0: 17, 1: 3 | 4x Bramble Hoglet, 4x Robin Redbreast, 4x Upside-Down Bat, 3x Fawn Scout, 3x Sergeant Bramblefox, 2x Fox Kit | 16 |
| 2 | big | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 89% (86%-91%) | 0.55 | 0: 9, 1: 11 | 4x Chipmunk Skirmisher, 4x Seed-cache Squirrel, 4x Truffle Piglet, 3x Fawn Scout, 3x Sergeant Bramblefox, 2x Bramble Hoglet | 20 |
| 3 | economy | big (12 copies at 1+ Lumber, average 1.0); economy (8 resource makers) | 83% (80%-87%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Barkplate Beetle, 4x Bear Cub, 4x Berserker Boar, 4x Chipmunk Skirmisher, 4x Redwood Woodpecker | 12 |
| 4 | open | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x8 | 83% (79%-86%) | 0.5 | 0: 10, 1: 10 | 4x Bear Cub, 4x Owl Nightwatch, 4x Redwood Woodpecker, 4x Robin Redbreast, 2x Corpse-flower Beetle, 2x Tide Seahorse | 0 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 96% | 96% | 100% | 100% | 100% | 100% | 96% | 100% | 54% | 63% |
| 2 big | 96% | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 96% | 33% | 54% |
| 3 economy | 88% | 100% | 96% | 96% | 96% | 96% | 100% | 79% | 100% | 17% | 50% |
| 4 open | 83% | 92% | 92% | 96% | 100% | 92% | 92% | 75% | 100% | 29% | 58% |
