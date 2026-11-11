# Focused decks: Map 18 The Glass Dunes (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool alpine-swift,antlion-pit,armadillo-guard,caustic-scorpion,cunning-vixen,dune-jackal,dune-jackal-scout,dust-hyena,eagle-owl-quartermaster,fennec-fox,glasswing-moth,glimmer-spider,grave-grin-hyena,horned-lizard,ibex-rockcaller,lantern-spark-fly,marula-elephant,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,squires-mount,stonedrop-vulture,termite-forager,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor antlion-pit,armadillo-guard,caustic-scorpion,dune-jackal,dune-jackal-scout,dust-hyena,fennec-fox,glasswing-moth,horned-lizard,marula-elephant,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,stonedrop-vulture,termite-forager --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9340 games in 105 s.

- The list (29): Alpine Swift, Antlion Pit, Armadillo Guard, Caustic Scorpion, Cunning Vixen, Dune Jackal, Dune Jackal Scout, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glasswing Moth, Glimmer Spider, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Lantern Spark Fly, Marula Elephant, Meerkat Sentry, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Spitting Cobra, Squire's Mount, Stonedrop Vulture, Termite Forager, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1+ Lumber, average 0.8); flying x8 | 87% (83%-91%) | 0.8 | 0: 4, 1: 16 | 4x Armadillo Guard, 4x Fennec Fox, 4x Stonedrop Vulture, 4x Upside-Down Bat, 2x Ibex Rockcaller, 2x Wolf Spider Mother | 16 |
| 2 | family:flying | big (19 copies at 1+ Lumber, average 0.9); flying x8; ranged x7 | 85% (80%-89%) | 0.95 | 0: 1, 1: 19 | 4x Antlion Pit, 4x Glimmer Spider, 4x Meerkat Sentry, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 1x Alpine Swift | 13 |
| 3 | open | big (20 copies at 1+ Lumber, average 1.0); ranged x9; flying x7 | 83% (79%-88%) | 1 | 1: 20 | 4x Horned Lizard, 4x Roadrunner Courier, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 3x Squire's Mount, 2x Spitting Cobra | 0 |
| 4 | family:strike-first | big (20 copies at 1+ Lumber, average 1.0); strike-first x8 | 65% (59%-70%) | 1 | 1: 20 | 4x Dune Jackal, 4x Dune Jackal Scout, 4x Roadrunner Courier, 3x Glimmer Spider, 3x Squire's Mount, 2x Horned Lizard | 11 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 88% | 75% | 92% | 67% | 100% | 88% | 92% | 100% | 88% | 83% |
| 2 family:flying | 96% | 75% | 92% | 63% | 88% | 79% | 83% | 100% | 83% | 88% |
| 3 open | 96% | 63% | 88% | 75% | 96% | 71% | 79% | 100% | 79% | 88% |
| 4 family:strike-first | 83% | 63% | 75% | 33% | 83% | 38% | 54% | 100% | 25% | 92% |
