# Focused decks: Map 18 The Pale Desert (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,armadillo-guard,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-hyena,horned-lizard,roadrunner-courier,sand-widow,sandstorm-roc --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:poison,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7344 games in 106 s.

- The list (11): Antlion Pit, Armadillo Guard, Barrel Cactus, Caustic Scorpion, Dromedary, Dune Jackal, Dust Hyena, Horned Lizard, Roadrunner Courier, Sand Widow, Sandstorm Roc.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (17 copies at 1+ Lumber, average 0.8); strike-first x8 | 80% (76%-84%) | 0.85 | 0: 3, 1: 17 | 4x Armadillo Guard, 4x Dune Jackal, 4x Roadrunner Courier, 3x Antlion Pit, 3x Dust Hyena, 2x Horned Lizard | 10 |
| 2 | big | big (16 copies at 1+ Lumber, average 1.0); economy (4 resource makers) | 70% (65%-75%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Antlion Pit, 4x Dust Hyena, 4x Horned Lizard, 4x Sandstorm Roc, 3x Barrel Cactus, 1x Caustic Scorpion | 10 |
| 3 | open | big (18 copies at 1+ Lumber, average 1.1) | 70% (65%-75%) | 1.05 | 0: 2, 1: 15, 2: 3 | 4x Antlion Pit, 4x Dromedary, 4x Horned Lizard, 3x Roadrunner Courier, 3x Sand Widow, 2x Dust Hyena | 0 |
| 4 | family:poison | big (16 copies at 1+ Lumber, average 1.0); economy (4 resource makers); poison x8 | 68% (63%-72%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Antlion Pit, 4x Armadillo Guard, 4x Caustic Scorpion, 4x Dust Hyena, 4x Sand Widow | 11 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 88% | 100% | 88% | 71% | 88% | 83% | 33% | 96% | 88% | 100% | 38% | 88% |
| 2 big | 92% | 88% | 75% | 71% | 67% | 67% | 33% | 67% | 92% | 92% | 50% | 46% |
| 3 open | 92% | 75% | 88% | 54% | 83% | 71% | 42% | 71% | 83% | 100% | 33% | 46% |
| 4 family:poison | 92% | 79% | 79% | 50% | 75% | 83% | 33% | 92% | 79% | 83% | 29% | 38% |
