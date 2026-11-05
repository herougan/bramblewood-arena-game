# Focused decks: Map 14 The Canopy (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,eagle-owl-quartermaster,fire-ant-raft,grave-grin-hyena,hercules-beetle,hoopoe-herald,ibex-rockcaller,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,meadow-frog,meerkat-burrower,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,robin-redbreast,spitting-cobra,stoat-cutthroat,vampire-bat,walrus-icebreaker,weaver-bird,wolf-spider-mother,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:night,big,open --anchor apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,pride-queen,proboscis-monkey,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6960 games in 164 s.

- The list (27): Apollo Butterfly, Camouflage Frog, Eagle-Owl Quartermaster, Fire Ant Raft, Grave-Grin Hyena, Hercules Beetle, Hoopoe Herald, Ibex Rockcaller, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lyrebird Mimic, Meadow Frog, Meerkat Burrower, Pangolin Roller, Poison Dart Croaker, Pride Queen, Proboscis Monkey, Redwood Woodpecker, Robin Redbreast, Spitting Cobra, Stoat Cutthroat, Vampire Bat, Walrus Icebreaker, Weaver Bird, Wolf Spider Mother, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1 Lumber, average 0.5) | 79% (73%-84%) | 0.45 | 0: 11, 1: 9 | 4x Grave-Grin Hyena, 4x Leafcutter Gardener, 4x Poison Dart Croaker, 3x Hoopoe Herald, 3x Wolf Spider Mother, 2x Walrus Icebreaker | 17 |
| 2 | open | big (13 copies at 1 Lumber, average 0.7); economy (4 resource makers); swarm x7 | 72% (66%-77%) | 0.65 | 0: 7, 1: 13 | 4x Apollo Butterfly, 4x Fire Ant Raft, 4x Redwood Woodpecker, 3x Meadow Frog, 3x Wolf Spider Mother, 2x Hercules Beetle | 0 |
| 3 | family:night | big (10 copies at 1 Lumber, average 0.5); night x8 | 71% (66%-77%) | 0.5 | 0: 10, 1: 10 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Weaver Bird, 4x Woodcock Lookout, 2x Grave-Grin Hyena, 2x Walrus Icebreaker | 20 |
| 4 | family:flying | big (8 copies at 1 Lumber, average 0.4); flying x8; poison x6 | 59% (53%-65%) | 0.4 | 0: 12, 1: 8 | 4x Apollo Butterfly, 4x Hoopoe Herald, 4x Poison Dart Croaker, 4x Robin Redbreast, 2x Fire Ant Raft, 2x Stoat Cutthroat | 14 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 46% | 88% | 67% | 92% | 88% | 92% | 100% | 58% |
| 2 open | 38% | 92% | 42% | 92% | 79% | 100% | 83% | 50% |
| 3 family:night | 42% | 96% | 58% | 67% | 75% | 100% | 88% | 46% |
| 4 family:flying | 17% | 83% | 33% | 63% | 67% | 96% | 79% | 38% |
