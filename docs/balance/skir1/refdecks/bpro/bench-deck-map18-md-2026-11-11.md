# Focused decks: Map 18 The Glass Dunes (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,armadillo-guard,caustic-scorpion,dune-jackal,dune-jackal-scout,dust-hyena,fennec-fox,glasswing-moth,horned-lizard,meerkat-sentry,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,stonedrop-vulture,termite-forager --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3180 games in 722 s.

- The list (16): Antlion Pit, Armadillo Guard, Caustic Scorpion, Dune Jackal, Dune Jackal Scout, Dust Hyena, Fennec Fox, Glasswing Moth, Horned Lizard, Meerkat Sentry, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Stonedrop Vulture, Termite Forager.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (20 copies at 1+ Lumber, average 1.0) | 88% (84%-91%) | 1 | 1: 20 | 4x Antlion Pit, 4x Horned Lizard, 4x Sandfish, 3x Caustic Scorpion, 3x Stonedrop Vulture, 2x Savanna Cheetah | 12 |
| 2 | family:poison | big (16 copies at 1+ Lumber, average 1.0); economy (4 resource makers); poison x8 | 75% (70%-80%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Dust Hyena, 4x Sand Widow, 4x Stonedrop Vulture | 12 |
| 3 | open | big (16 copies at 1+ Lumber, average 0.8) | 73% (68%-78%) | 0.8 | 0: 4, 1: 16 | 4x Caustic Scorpion, 4x Dune Jackal Scout, 4x Glasswing Moth, 4x Stonedrop Vulture, 2x Roadrunner Courier, 2x Savanna Cheetah | 0 |
| 4 | family:strike-first | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers); strike-first x8 | 70% (64%-75%) | 0.8 | 0: 4, 1: 16 | 4x Dune Jackal, 4x Dust Hyena, 4x Roadrunner Courier, 4x Stonedrop Vulture, 2x Antlion Pit, 2x Horned Lizard | 14 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 88% | 71% | 96% | 79% | 67% | 100% | 79% | 100% |
| 2 family:poison | 96% | 92% | 54% | 92% | 79% | 79% | 46% | 96% | 50% | 67% |
| 3 open | 100% | 67% | 50% | 88% | 83% | 67% | 50% | 100% | 42% | 88% |
| 4 family:strike-first | 96% | 63% | 46% | 67% | 96% | 58% | 42% | 100% | 42% | 88% |
