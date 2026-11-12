# Focused decks: Map 18 The Pale Desert (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,armadillo-guard,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,frillneck-duelist,gallery-orb-weaver,giant-cave-huntsman,grave-grin-hyena,horned-lizard,ibex-rockcaller,roadrunner-courier,sand-widow,sandstorm-roc,stoat-cutthroat,thorny-devil,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:poison,big,open --anchor antlion-pit,armadillo-guard,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-hyena,horned-lizard,roadrunner-courier,sand-widow,sandstorm-roc --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9240 games in 120 s.

- The list (22): Antlion Pit, Armadillo Guard, Barrel Cactus, Caustic Scorpion, Dromedary, Dune Jackal, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Frillneck Duelist, Gallery Orb-Weaver, Giant Cave Huntsman, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Roadrunner Courier, Sand Widow, Sandstorm Roc, Stoat Cutthroat, Thorny Devil, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers); strike-first x10 | 85% (81%-89%) | 0.8 | 0: 4, 1: 16 | 4x Dust Hyena, 4x Horned Lizard, 4x Roadrunner Courier, 3x Giant Cave Huntsman, 3x Stoat Cutthroat, 2x Thorny Devil | 20 |
| 2 | open | big (14 copies at 1+ Lumber, average 0.9) | 82% (77%-86%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Antlion Pit, 4x Armadillo Guard, 4x Grave-Grin Hyena, 4x Sandstorm Roc, 2x Ibex Rockcaller, 2x Upside-Down Bat | 0 |
| 3 | family:poison | big (16 copies at 1+ Lumber, average 1.0); poison x8 | 67% (62%-72%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Gallery Orb-Weaver, 4x Horned Lizard, 4x Sand Widow, 4x Upside-Down Bat, 2x Barrel Cactus, 2x Stoat Cutthroat | 18 |
| 4 | big | big (20 copies at 1+ Lumber, average 1.4); strike-first x6 | 65% (60%-69%) | 1.35 | 1: 13, 2: 7 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Sandstorm Roc, 3x Frillneck Duelist, 3x Giant Cave Huntsman, 2x Ibex Rockcaller | 10 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 100% | 100% | 79% | 83% | 100% | 88% | 71% | 88% | 96% | 96% | 67% | 54% |
| 2 open | 100% | 92% | 88% | 92% | 96% | 79% | 63% | 88% | 83% | 88% | 50% | 63% |
| 3 family:poison | 88% | 79% | 71% | 58% | 88% | 50% | 38% | 88% | 71% | 96% | 46% | 33% |
| 4 big | 96% | 83% | 83% | 83% | 92% | 50% | 42% | 71% | 63% | 75% | 21% | 17% |
