# Focused decks: Map 18 The Glass Dunes (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool alpine-swift,antlion-pit,armadillo-guard,caustic-scorpion,cunning-vixen,dune-jackal,dune-jackal-scout,dust-hyena,eagle-owl-quartermaster,fennec-fox,glasswing-moth,glimmer-spider,grave-grin-hyena,horned-lizard,ibex-rockcaller,lantern-spark-fly,marula-elephant,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,stonedrop-vulture,termite-forager,tide-spirit,upside-down-bat,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor antlion-pit,armadillo-guard,caustic-scorpion,dune-jackal,dune-jackal-scout,dust-hyena,fennec-fox,glasswing-moth,horned-lizard,marula-elephant,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,stonedrop-vulture,termite-forager --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9180 games in 151 s.

- The list (29): Alpine Swift, Antlion Pit, Armadillo Guard, Caustic Scorpion, Cunning Vixen, Dune Jackal, Dune Jackal Scout, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glasswing Moth, Glimmer Spider, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Lantern Spark Fly, Marula Elephant, Meerkat Sentry, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Spitting Cobra, Stonedrop Vulture, Termite Forager, Tide Seahorse, Upside-Down Bat, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (20 copies at 1+ Lumber, average 1.0) | 90% (87%-93%) | 1 | 1: 20 | 4x Armadillo Guard, 4x Fennec Fox, 4x Horned Lizard, 4x Roadrunner Courier, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 12 |
| 2 | family:flying | big (16 copies at 1+ Lumber, average 0.8); flying x8 | 84% (79%-88%) | 0.8 | 0: 4, 1: 16 | 4x Fennec Fox, 4x Lantern Spark Fly, 4x Roadrunner Courier, 4x Stonedrop Vulture, 2x Glimmer Spider, 2x Ibex Rockcaller | 14 |
| 3 | open | big (16 copies at 1+ Lumber, average 0.8) | 83% (79%-87%) | 0.8 | 0: 4, 1: 16 | 4x Caustic Scorpion, 4x Glasswing Moth, 4x Meerkat Sentry, 4x Roadrunner Courier, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 0 |
| 4 | family:strike-first | big (16 copies at 1+ Lumber, average 0.8); strike-first x8 | 70% (65%-76%) | 0.8 | 0: 4, 1: 16 | 4x Cunning Vixen, 4x Glimmer Spider, 4x Roadrunner Courier, 4x Stonedrop Vulture, 3x Glasswing Moth, 1x Termite Forager | 13 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 92% | 96% | 92% | 96% | 88% | 92% | 100% | 50% | 96% |
| 2 family:flying | 100% | 75% | 83% | 75% | 88% | 83% | 67% | 100% | 69% | 96% |
| 3 open | 100% | 88% | 88% | 50% | 100% | 88% | 88% | 100% | 42% | 88% |
| 4 family:strike-first | 92% | 67% | 71% | 33% | 92% | 67% | 46% | 100% | 50% | 88% |
