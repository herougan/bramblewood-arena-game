# Focused decks: Map 15 The Long Grass (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool anvil-thrush,bison-bulldozer,border-collie,cataphract-destrier,cricket-drummer,eagle-owl-quartermaster,farm-dog,fire-ant-raft,goose-sentry,grave-grin-hyena,hawthorn-shieldbug,hedge-weasel,ibex-rockcaller,ladybird-guard,land-tiller,mallard-halberdier,mouse-sapper,nightjar-drifter,pronghorn-racer,robin-redbreast,shepherds-bark,thorn-shrike,tide-spirit,truffle-piglet,upside-down-bat,war-hound,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,swarm,open --anchor bison-bulldozer,border-collie,cataphract-destrier,cricket-drummer,fire-ant-raft,goose-sentry,hedge-weasel,land-tiller,mallard-halberdier,mouse-sapper,pronghorn-racer,shepherds-bark,thorn-shrike,truffle-piglet,war-hound --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9180 games in 139 s.

- The list (27): Anvil Thrush, Bison Bulldozer, Border Collie, Gilded Roadwarden, Cricket Drummer, Eagle-Owl Quartermaster, Farm Dog, Fire Ant Raft, Goose Sentry, Grave-Grin Hyena, Hawthorn Shieldbug, Hedge Weasel, Ibex Rockcaller, Ladybird Guard, Land Tiller, Mallard Halberdier, Mouse Sapper, Nightjar Drifter, Pronghorn Racer, Robin Redbreast, Shepherd, Thorn Shrike, Tide Seahorse, Truffle Piglet, Upside-Down Bat, War Hound, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); flying x6; day x6 | 95% (92%-98%) | 0.3 | 0: 14, 1: 6 | 4x Bison Bulldozer, 4x Cricket Drummer, 4x Grave-Grin Hyena, 4x Robin Redbreast, 2x Shepherd, 2x Upside-Down Bat | 17 |
| 2 | open | midrange (average 0.7 Lumber) | 90% (87%-94%) | 0.65 | 0: 7, 1: 13 | 4x Border Collie, 4x Hedge Weasel, 4x Truffle Piglet, 3x Cricket Drummer, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 0 |
| 3 | family:guard | swarm (16 copies at 0 Lumber); guard x8; flying x6 | 87% (83%-91%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Ladybird Guard, 4x Shepherd, 4x Upside-Down Bat, 2x Anvil Thrush, 2x Land Tiller | 17 |
| 4 | family:flying | flying x8 | 85% (81%-89%) | 0.35 | 0: 13, 1: 7 | 4x Anvil Thrush, 4x Border Collie, 4x Upside-Down Bat, 3x Bison Bulldozer, 3x Land Tiller, 2x Grave-Grin Hyena | 16 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 92% | 96% | 100% | 100% | 100% | 100% | 79% | 88% |
| 2 open | 92% | 100% | 92% | 88% | 96% | 100% | 100% | 96% | 75% | 67% |
| 3 family:guard | 92% | 100% | 83% | 88% | 92% | 96% | 88% | 100% | 75% | 54% |
| 4 family:flying | 96% | 100% | 88% | 54% | 100% | 100% | 92% | 96% | 50% | 75% |
