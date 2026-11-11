# Focused decks: Map 15 The Long Grass (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool anvil-thrush,bison-bulldozer,border-collie,cataphract-destrier,cricket-drummer,eagle-owl-quartermaster,farm-dog,fire-ant-raft,goose-sentry,grave-grin-hyena,hawthorn-shieldbug,hedge-weasel,ibex-rockcaller,ladybird-guard,land-tiller,mallard-halberdier,mouse-sapper,nightjar-drifter,pronghorn-racer,robin-redbreast,shepherds-bark,squires-mount,thorn-shrike,tide-spirit,truffle-piglet,upside-down-bat,war-hound,warhorse-charger,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,swarm,open --anchor bison-bulldozer,border-collie,cataphract-destrier,cricket-drummer,fire-ant-raft,goose-sentry,hedge-weasel,land-tiller,mallard-halberdier,mouse-sapper,pronghorn-racer,shepherds-bark,squires-mount,thorn-shrike,truffle-piglet,war-hound,warhorse-charger --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9240 games in 99 s.

- The list (29): Anvil Thrush, Bison Bulldozer, Border Collie, Gilded Roadwarden, Cricket Drummer, Eagle-Owl Quartermaster, Farm Dog, Fire Ant Raft, Goose Sentry, Grave-Grin Hyena, Hawthorn Shieldbug, Hedge Weasel, Ibex Rockcaller, Ladybird Guard, Land Tiller, Mallard Halberdier, Mouse Sapper, Nightjar Drifter, Pronghorn Racer, Robin Redbreast, Shepherd, Squire's Mount, Thorn Shrike, Tide Seahorse, Truffle Piglet, Upside-Down Bat, War Hound, Warhorse Charger, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8; day x8 | 97% (94%-99%) | 0.4 | 0: 12, 1: 8 | 4x Land Tiller, 4x Robin Redbreast, 4x Upside-Down Bat, 3x Bison Bulldozer, 3x Squire's Mount, 2x Ibex Rockcaller | 15 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 96% (94%-99%) | 0.3 | 0: 14, 1: 6 | 4x Cricket Drummer, 4x Hedge Weasel, 4x Robin Redbreast, 3x Border Collie, 3x Squire's Mount, 2x Grave-Grin Hyena | 11 |
| 3 | open | midrange (average 0.4 Lumber) | 87% (83%-91%) | 0.4 | 0: 12, 1: 8 | 4x Cricket Drummer, 4x Hedge Weasel, 4x Land Tiller, 4x Mouse Sapper, 3x War Hound, 1x Squire's Mount | 0 |
| 4 | family:guard | guard x11 | 85% (80%-89%) | 0.35 | 0: 13, 1: 7 | 4x Cricket Drummer, 4x Ladybird Guard, 4x Shepherd, 4x Upside-Down Bat, 3x Goose Sentry, 1x Tide Seahorse | 16 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 100% | 96% | 96% | 100% | 100% | 100% | 88% | 88% |
| 2 swarm | 100% | 96% | 100% | 88% | 100% | 100% | 96% | 100% | 92% | 92% |
| 3 open | 96% | 83% | 79% | 71% | 100% | 88% | 92% | 96% | 83% | 79% |
| 4 family:guard | 96% | 79% | 96% | 83% | 96% | 83% | 75% | 100% | 67% | 71% |
