# Focused decks: Map 15 The Long Grass (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool anvil-thrush,bison-bulldozer,border-collie,cricket-drummer,eagle-owl-quartermaster,farm-dog,fire-ant-raft,goose-sentry,grave-grin-hyena,hawthorn-shieldbug,hedge-weasel,ibex-rockcaller,ladybird-guard,land-tiller,mallard-halberdier,mouse-sapper,nightjar-drifter,pronghorn-racer,robin-redbreast,shepherds-bark,squires-mount,thorn-shrike,tide-spirit,truffle-piglet,upside-down-bat,war-hound,warhorse-charger,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,big,open --anchor bison-bulldozer,border-collie,cricket-drummer,fire-ant-raft,goose-sentry,hedge-weasel,land-tiller,mallard-halberdier,mouse-sapper,pronghorn-racer,shepherds-bark,squires-mount,thorn-shrike,truffle-piglet,war-hound,warhorse-charger --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2660 games in 642 s.

- The list (28): Anvil Thrush, Bison Bulldozer, Border Collie, Cricket Drummer, Eagle-Owl Quartermaster, Farm Dog, Fire Ant Raft, Goose Sentry, Grave-Grin Hyena, Hawthorn Shieldbug, Hedge Weasel, Ibex Rockcaller, Ladybird Guard, Land Tiller, Mallard Halberdier, Mouse Sapper, Nightjar Drifter, Pronghorn Racer, Robin Redbreast, Shepherd, Squire's Mount, Thorn Shrike, Tide Seahorse, Truffle Piglet, Upside-Down Bat, War Hound, Warhorse Charger, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | swarm (14 copies at 0 Lumber); guard x9 | 93% (90%-96%) | 0.3 | 0: 14, 1: 6 | 4x Cricket Drummer, 4x Robin Redbreast, 3x Goose Sentry, 3x Hawthorn Shieldbug, 3x Hedge Weasel, 3x Ladybird Guard | 13 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5); flying x6; day x6 | 90% (87%-94%) | 0.5 | 0: 10, 1: 10 | 4x Bison Bulldozer, 4x Border Collie, 4x Grave-Grin Hyena, 4x Upside-Down Bat, 2x Robin Redbreast, 2x Squire's Mount | 17 |
| 3 | open | big (11 copies at 1+ Lumber, average 0.6) | 80% (75%-84%) | 0.55 | 0: 9, 1: 11 | 4x Hedge Weasel, 4x Robin Redbreast, 4x Shepherd, 4x Truffle Piglet, 3x Mallard Halberdier, 1x Grave-Grin Hyena | 0 |
| 4 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x10 | 77% (72%-82%) | 0.45 | 0: 11, 1: 9 | 4x Anvil Thrush, 4x Cricket Drummer, 3x Eagle-Owl Quartermaster, 3x Grave-Grin Hyena, 3x Thorn Shrike, 3x War Hound | 19 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 96% | 100% | 88% | 92% | 100% | 92% | 96% | 96% | 88% | 83% |
| 2 big | 96% | 100% | 92% | 71% | 100% | 100% | 100% | 100% | 83% | 63% |
| 3 open | 88% | 79% | 75% | 71% | 88% | 96% | 88% | 100% | 67% | 46% |
| 4 family:flying | 83% | 79% | 79% | 79% | 96% | 75% | 83% | 96% | 38% | 58% |
