# Focused decks: Map 18 The Pale Desert (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-devil-kestrel,horned-lizard,pale-oryx,roadrunner-courier,sand-widow --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:poison,family:strike-first,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7272 games in 83 s.

- The list (10): Antlion Pit, Barrel Cactus, Caustic Scorpion, Dromedary, Dune Jackal, Dust-devil Kestrel, Horned Lizard, Pale Oryx, Roadrunner Courier, Sand Widow.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | big (20 copies at 1+ Lumber, average 1.2); swarm (16 copies at 1 Lumber); poison x8 | 69% (65%-74%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Dromedary, 4x Horned Lizard, 4x Sand Widow | 5 |
| 2 | swarm | big (20 copies at 1+ Lumber, average 1.0); swarm (20 copies at 1 Lumber) | 63% (59%-68%) | 1 | 1: 20 | 4x Caustic Scorpion, 4x Dromedary, 4x Pale Oryx, 4x Roadrunner Courier, 2x Antlion Pit, 2x Barrel Cactus | 9 |
| 3 | open | big (20 copies at 1+ Lumber, average 1.0); swarm (20 copies at 1 Lumber) | 63% (58%-68%) | 1 | 1: 20 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Horned Lizard, 3x Barrel Cactus, 3x Dromedary, 2x Dust-devil Kestrel | 0 |
| 4 | family:strike-first | big (20 copies at 1+ Lumber, average 1.0); swarm (20 copies at 1 Lumber); strike-first x8 | 60% (55%-66%) | 1 | 1: 20 | 4x Antlion Pit, 4x Dune Jackal, 4x Horned Lizard, 4x Pale Oryx, 4x Roadrunner Courier | 12 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 96% | 75% | 79% | 71% | 58% | 96% | 83% | 63% | 79% | 83% | 13% | 33% |
| 2 swarm | 88% | 75% | 92% | 67% | 29% | 92% | 83% | 71% | 63% | 75% | 17% | 8% |
| 3 open | 92% | 67% | 83% | 83% | 50% | 92% | 67% | 58% | 54% | 83% | 13% | 17% |
| 4 family:strike-first | 83% | 63% | 88% | 42% | 46% | 71% | 58% | 63% | 54% | 83% | 38% | 38% |
