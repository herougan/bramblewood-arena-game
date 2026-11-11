# Focused decks: Map 18 The Glass Dunes (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,armadillo-guard,caustic-scorpion,dune-jackal,dune-jackal-scout,dust-hyena,fennec-fox,glasswing-moth,horned-lizard,marula-elephant,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,stonedrop-vulture,termite-forager --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7280 games in 88 s.

- The list (17): Antlion Pit, Armadillo Guard, Caustic Scorpion, Dune Jackal, Dune Jackal Scout, Dust Hyena, Fennec Fox, Glasswing Moth, Horned Lizard, Marula Elephant, Meerkat Sentry, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Stonedrop Vulture, Termite Forager.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (20 copies at 1+ Lumber, average 1.0); strike-first x8 | 86% (82%-90%) | 1 | 1: 20 | 4x Armadillo Guard, 4x Meerkat Sentry, 4x Roadrunner Courier, 4x Stonedrop Vulture, 2x Dune Jackal, 2x Savanna Cheetah | 14 |
| 2 | open | big (20 copies at 1+ Lumber, average 1.0) | 85% (81%-90%) | 1 | 1: 20 | 4x Antlion Pit, 4x Fennec Fox, 4x Horned Lizard, 4x Stonedrop Vulture, 2x Sandfish, 2x Savanna Cheetah | 0 |
| 3 | big | big (14 copies at 1+ Lumber, average 0.7) | 77% (73%-82%) | 0.7 | 0: 6, 1: 14 | 4x Glasswing Moth, 4x Horned Lizard, 4x Roadrunner Courier, 4x Stonedrop Vulture, 2x Armadillo Guard, 2x Dust Hyena | 12 |
| 4 | family:guard | big (20 copies at 1+ Lumber, average 1.2); guard x8 | 60% (54%-65%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Armadillo Guard, 4x Horned Lizard, 4x Marula Elephant, 4x Roadrunner Courier | 12 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 92% | 79% | 96% | 67% | 100% | 92% | 67% | 100% | 69% | 100% |
| 2 open | 100% | 71% | 88% | 79% | 100% | 88% | 71% | 100% | 67% | 92% |
| 3 big | 88% | 83% | 92% | 46% | 92% | 83% | 46% | 100% | 52% | 92% |
| 4 family:guard | 83% | 50% | 67% | 29% | 79% | 46% | 42% | 100% | 33% | 67% |
