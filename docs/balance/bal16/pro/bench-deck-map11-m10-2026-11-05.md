# Focused decks: Map 11 Eyrie Heights (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alley-cat,alpine-marmot,alpine-salamander,alpine-swift,anhinga-spearbird,beaver-lumberjack,caiman-hatchling,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,gannet-nestweaver,giant-cave-huntsman,golden-eagle-diver,ibex-rockcaller,kittiwake-flock,marsh-harrier,mountain-hare,newt-doctor,otter-centurion,peak-condor,peregrine-stooper,planarian-splitter,puffin-diver,razorbill,red-billed-chough,swamp-alligator,wolf-spider-mother,woodcock-lookout,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:strike-first,big,open --anchor alpine-marmot,alpine-salamander,alpine-swift,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,red-billed-chough,swamp-alligator,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7800 games in 159 s.

- The list (31): Alley Cat, Alpine Marmot, Alpine Salamander, Alpine Swift, Anhinga Spearbird, Beaver Lumberjack, Caiman Hatchling, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Giant Cave Huntsman, Golden Eagle Diver, Ibex Rockcaller, Kittiwake Flock, Marsh Harrier, Mountain Hare, Newt Doctor, Otter Centurion, Peak Condor, Peregrine Stooper, Planarian Splitter, Puffin Diver, Razorbill, Red-billed Chough, Swamp Alligator, Wolf Spider Mother, Woodcock Lookout, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | strike-first x8 | 90% (86%-93%) | 0.8 | 0: 4, 1: 16 | 4x Chamois Leaper, 4x Chipmunk Hoarder, 4x Golden Eagle Diver, 3x Planarian Splitter, 3x Wound Reaver, 2x Ibex Rockcaller | 16 |
| 2 | open | strike-first x14; flying x10 | 86% (82%-89%) | 0.7 | 0: 6, 1: 14 | 4x Chamois Leaper, 4x Peregrine Stooper, 3x Alpine Swift, 3x Beaver Lumberjack, 3x Giant Cave Huntsman, 3x Peak Condor | 0 |
| 3 | family:flying | economy (4 resource makers); flying x14; strike-first x9 | 86% (82%-89%) | 0.5 | 0: 10, 1: 10 | 4x Gannet Nestweaver, 4x Peak Condor, 3x Alpine Swift, 3x Giant Cave Huntsman, 3x Golden Eagle Diver, 3x Otter Centurion | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4) | 76% (72%-80%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Alpine Salamander, 4x Eyrie Warden, 4x Swamp Alligator, 3x Giant Cave Huntsman, 3x Woodcock Lookout, 2x Ibex Rockcaller | 17 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 96% | 100% | 92% | 83% | 100% | 100% | 100% | 96% | 92% | 96% | 58% | 63% |
| 2 open | 92% | 100% | 75% | 75% | 100% | 100% | 100% | 96% | 92% | 100% | 38% | 63% |
| 3 family:flying | 88% | 98% | 88% | 83% | 92% | 100% | 100% | 96% | 88% | 100% | 29% | 67% |
| 4 big | 79% | 83% | 71% | 71% | 96% | 96% | 96% | 100% | 88% | 92% | 8% | 33% |
