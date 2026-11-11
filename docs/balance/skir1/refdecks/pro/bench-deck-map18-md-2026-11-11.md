# Focused decks: Map 18 The Glass Dunes (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,armadillo-guard,caustic-scorpion,cunning-vixen,dune-jackal,dune-jackal-scout,dust-hyena,eagle-owl-quartermaster,fennec-fox,glasswing-moth,glimmer-spider,grave-grin-hyena,horned-lizard,ibex-rockcaller,lantern-spark-fly,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,squires-mount,stonedrop-vulture,termite-forager,tide-spirit,upside-down-bat,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor antlion-pit,armadillo-guard,caustic-scorpion,dune-jackal,dune-jackal-scout,dust-hyena,fennec-fox,glasswing-moth,horned-lizard,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,stonedrop-vulture,termite-forager --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2180 games in 273 s.

- The list (28): Antlion Pit, Armadillo Guard, Caustic Scorpion, Cunning Vixen, Dune Jackal, Dune Jackal Scout, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glasswing Moth, Glimmer Spider, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Lantern Spark Fly, Meerkat Sentry, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Spitting Cobra, Squire's Mount, Stonedrop Vulture, Termite Forager, Tide Seahorse, Upside-Down Bat, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (20 copies at 1+ Lumber, average 1.0) | 85% (81%-90%) | 1 | 1: 20 | 4x Cunning Vixen, 4x Fennec Fox, 4x Glimmer Spider, 4x Stonedrop Vulture, 2x Ibex Rockcaller, 2x Meerkat Sentry | 0 |
| 2 | big | big (16 copies at 1+ Lumber, average 0.8) | 84% (80%-88%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Glasswing Moth, 4x Meerkat Sentry, 4x Stonedrop Vulture, 3x Wolf Spider Mother, 1x Ibex Rockcaller | 13 |
| 3 | family:flying | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); flying x12 | 68% (62%-73%) | 0.4 | 0: 12, 1: 8 | 4x Armadillo Guard, 4x Dust Hyena, 4x Lantern Spark Fly, 4x Stonedrop Vulture, 4x Upside-Down Bat | 16 |
| 4 | family:strike-first | big (18 copies at 1+ Lumber, average 0.9); strike-first x10 | 65% (59%-70%) | 0.9 | 0: 2, 1: 18 | 4x Antlion Pit, 4x Cunning Vixen, 4x Fennec Fox, 4x Roadrunner Courier, 2x Savanna Cheetah, 2x Termite Forager | 12 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 83% | 88% | 79% | 96% | 75% | 88% | 100% | 63% | 96% |
| 2 big | 96% | 83% | 96% | 63% | 88% | 63% | 92% | 100% | 71% | 92% |
| 3 family:flying | 83% | 79% | 83% | 42% | 83% | 33% | 54% | 100% | 46% | 71% |
| 4 family:strike-first | 79% | 54% | 83% | 38% | 79% | 25% | 71% | 100% | 33% | 83% |
