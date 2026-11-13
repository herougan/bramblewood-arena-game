# Focused decks: Map 18 The Pale Desert (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,barrel-cactus,caustic-scorpion,dune-jackal,dust-devil-kestrel,eagle-owl-quartermaster,frillneck-duelist,gallery-orb-weaver,giant-cave-huntsman,glimmer-spider,grave-grin-hyena,horned-lizard,ibex-rockcaller,nightjar-drifter,quicksand-queen,roadrunner-courier,sand-widow,sandstorm-roc,stoat-cutthroat,sunbittern-strider,thorny-devil,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:poison,big,open --anchor antlion-pit,barrel-cactus,caustic-scorpion,dune-jackal,horned-lizard,nightjar-drifter,quicksand-queen,roadrunner-courier,sand-widow,sandstorm-roc,sunbittern-strider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9264 games in 107 s.

- The list (23): Antlion Pit, Barrel Cactus, Caustic Scorpion, Dune Jackal, Dust-devil Kestrel, Eagle-Owl Quartermaster, Frillneck Duelist, Gallery Orb-Weaver, Giant Cave Huntsman, Glimmer Spider, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Nightjar Drifter, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandstorm Roc, Stoat Cutthroat, Sunbittern Strider, Thorny Devil, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6) | 88% (84%-91%) | 0.6 | 0: 8, 1: 12 | 4x Antlion Pit, 4x Grave-Grin Hyena, 4x Horned Lizard, 4x Upside-Down Bat, 2x Giant Cave Huntsman, 2x Nightjar Drifter | 10 |
| 2 | open | big (16 copies at 1+ Lumber, average 0.8) | 83% (79%-87%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Grave-Grin Hyena, 4x Sunbittern Strider, 3x Giant Cave Huntsman, 3x Thorny Devil, 2x Quicksand Queen | 0 |
| 3 | family:strike-first | big (20 copies at 1+ Lumber, average 1.0); strike-first x11 | 73% (68%-78%) | 1 | 1: 20 | 4x Dune Jackal, 4x Roadrunner Courier, 4x Sunbittern Strider, 3x Giant Cave Huntsman, 3x Thorny Devil, 2x Ibex Rockcaller | 10 |
| 4 | family:poison | big (16 copies at 1+ Lumber, average 1.0); poison x12 | 70% (65%-75%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Caustic Scorpion, 4x Gallery Orb-Weaver, 4x Sand Widow, 4x Upside-Down Bat, 2x Ibex Rockcaller, 2x Quicksand Queen | 18 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 83% | 92% | 100% | 83% | 79% | 88% | 92% | 100% | 67% | 75% |
| 2 open | 96% | 92% | 92% | 83% | 100% | 88% | 79% | 92% | 88% | 83% | 54% | 50% |
| 3 family:strike-first | 88% | 92% | 83% | 71% | 92% | 67% | 58% | 71% | 79% | 88% | 50% | 38% |
| 4 family:poison | 92% | 92% | 83% | 75% | 88% | 67% | 25% | 75% | 71% | 79% | 63% | 33% |
