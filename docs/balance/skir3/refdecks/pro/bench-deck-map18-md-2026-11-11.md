# Focused decks: Map 18 The Glass Dunes (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool alpine-marmot,alpine-swift,ant-scout,antlion-pit,anvil-thrush,apollo-butterfly,armadillo-guard,badger-lumberjack,balloon-archer,barkplate-beetle,barrel-cactus,bison-bulldozer,chipmunk-forager,dhole-matriarch,dune-jackal,eagle-owl-quartermaster,fire-ant-raft,gallery-orb-weaver,grave-grin-hyena,horned-lizard,ibex-rockcaller,ice-crevasse-wolf,mouse-sapper,nightjar-drifter,roadrunner-courier,sand-widow,stoat-cutthroat,sunbittern-strider,upside-down-bat,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,big,open --anchor ant-scout,antlion-pit,armadillo-guard,badger-lumberjack,balloon-archer,barkplate-beetle,barrel-cactus,bison-bulldozer,chipmunk-forager,dune-jackal,gallery-orb-weaver,horned-lizard,ice-crevasse-wolf,mouse-sapper,nightjar-drifter,roadrunner-courier,sand-widow,sunbittern-strider,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9240 games in 174 s.

- The list (31): Alpine Marmot, Alpine Swift, Ant Scout, Antlion Pit, Anvil Thrush, Apollo Butterfly, Armadillo Guard, Badger Lumberjack, Balloon Archer, Barkplate Beetle, Barrel Cactus, Bison Bulldozer, Chipmunk Forager, Dhole Matriarch, Dune Jackal, Eagle-Owl Quartermaster, Fire Ant Raft, Gallery Orb-Weaver, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Ice-Crevasse Wolf, Mouse Sapper, Nightjar Drifter, Roadrunner Courier, Sand Widow, Stoat Cutthroat, Sunbittern Strider, Upside-Down Bat, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (13 copies at 1+ Lumber, average 0.8); flying x7 | 93% (89%-96%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Balloon Archer, 4x Barkplate Beetle, 4x Worker Ant, 3x Anvil Thrush, 3x Armadillo Guard, 2x Ibex Rockcaller | 0 |
| 2 | family:flying | big (16 copies at 1+ Lumber, average 0.9); flying x11; ranged x7 | 89% (85%-93%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Apollo Butterfly, 4x Balloon Archer, 4x Bison Bulldozer, 3x Barkplate Beetle, 3x Eagle-Owl Quartermaster, 2x Ibex Rockcaller | 11 |
| 3 | family:guard | big (16 copies at 1+ Lumber, average 1.0); guard x8; spite x7 | 86% (82%-90%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Alpine Marmot, 4x Armadillo Guard, 4x Barkplate Beetle, 3x Barrel Cactus, 3x Ice-Crevasse Wolf, 2x Ibex Rockcaller | 11 |
| 4 | big | big (20 copies at 1+ Lumber, average 1.0); economy (4 resource makers) | 86% (82%-90%) | 1 | 1: 20 | 4x Antlion Pit, 4x Badger Lumberjack, 4x Bison Bulldozer, 3x Balloon Archer, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 15 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 100% | 92% | 96% | 79% | 92% | 100% | 88% | 92% |
| 2 family:flying | 96% | 96% | 96% | 92% | 88% | 88% | 79% | 100% | 75% | 83% |
| 3 family:guard | 96% | 96% | 92% | 88% | 96% | 79% | 88% | 100% | 58% | 71% |
| 4 big | 100% | 96% | 79% | 96% | 92% | 71% | 83% | 100% | 46% | 96% |
