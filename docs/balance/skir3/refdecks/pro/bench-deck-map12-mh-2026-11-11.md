# Focused decks: Map 12 The Briar Maze (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool alley-cat,alpine-marmot,anvil-thrush,balloon-archer,barkplate-beetle,barrow-leech-bat,bison-bulldozer,blue-ringed-octopus,briarback-hedgehog,chamois-leaper,chipmunk-hoarder,cunning-vixen,eagle-owl-quartermaster,eyrie-warden,fawn-scout,harvest-mouse,hawthorn-shieldbug,hollow-belly-rat,ibex-rockcaller,millipede-hauler,mountain-hare,mouse-sapper,mudpuppy,otter-centurion,quarry-mole,quill-thorn-boar,robin-redbreast,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor alpine-marmot,anvil-thrush,barkplate-beetle,barrow-leech-bat,bison-bulldozer,briarback-hedgehog,chamois-leaper,chipmunk-hoarder,cunning-vixen,eyrie-warden,fawn-scout,hollow-belly-rat,mountain-hare,mouse-sapper,quarry-mole,quill-thorn-boar --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9160 games in 178 s.

- The list (28): Alley Cat, Alpine Marmot, Anvil Thrush, Balloon Archer, Barkplate Beetle, Barrow Leech, Bison Bulldozer, Blue-ringed Octopus, Briarback Hedgehog, Chamois Leaper, Chipmunk Hoarder, Cunning Vixen, Eagle-Owl Quartermaster, Eyrie Warden, Fawn Scout, Harvest Mouse, Hawthorn Shieldbug, Hollow-belly Rat, Ibex Rockcaller, Millipede Hauler, Mountain Hare, Mouse Sapper, Mudpuppy, Otter Centurion, Quarry Mole, Quill-Thorn Boar, Robin Redbreast, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (15 copies at 0 Lumber); flying x10; cleave x8 | 90% (87%-94%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Alley Cat, 4x Anvil Thrush, 4x Robin Redbreast, 3x Barkplate Beetle, 3x Fawn Scout, 2x Balloon Archer | 17 |
| 2 | family:armor | armor x9 | 89% (85%-92%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Barkplate Beetle, 4x Briarback Hedgehog, 4x Chipmunk Hoarder, 4x Robin Redbreast, 3x Alley Cat, 1x Millipede Hauler | 20 |
| 3 | open | swarm (14 copies at 0 Lumber); evasion x7; ranged x6 | 78% (73%-83%) | 0.3 | 0: 14, 1: 6 | 4x Mountain Hare, 4x Mudpuppy, 3x Blue-ringed Octopus, 3x Cunning Vixen, 3x Fawn Scout, 3x Otter Centurion | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 77% (72%-81%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Alley Cat, 4x Barkplate Beetle, 4x Eyrie Warden, 4x Mudpuppy, 2x Bison Bulldozer, 2x Ibex Rockcaller | 16 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 79% | 79% | 96% | 88% | 96% | 100% | 83% | 83% |
| 2 family:armor | 96% | 96% | 92% | 75% | 100% | 92% | 96% | 100% | 63% | 79% |
| 3 open | 92% | 100% | 67% | 67% | 92% | 71% | 83% | 96% | 58% | 54% |
| 4 big | 75% | 88% | 79% | 83% | 79% | 83% | 96% | 96% | 25% | 63% |
