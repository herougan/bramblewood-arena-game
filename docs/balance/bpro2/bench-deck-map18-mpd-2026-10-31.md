# Focused decks: Map 18 The Pale Desert (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,thorny-devil,trapdoor-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7560 games in 102 s.

- The list (14): Antlion Pit, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandfish, Skull Vulture, Thorny Devil, Trapdoor Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (14 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 89% (85%-92%) | 0.7 | 0: 6, 1: 14 | 4x Dune Packrat, 4x Thorny Devil, 3x Antlion Pit, 3x Dromedary, 3x Dust Hyena, 3x Trapdoor Spider | 8 |
| 2 | big | big (13 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 88% (84%-91%) | 0.65 | 0: 7, 1: 13 | 4x Antlion Pit, 4x Dust Hyena, 4x Roadrunner Courier, 4x Thorny Devil, 3x Trapdoor Spider, 1x Caustic Scorpion | 9 |
| 3 | open | big (13 copies at 1+ Lumber, average 0.8); economy (4 resource makers); poison x6 | 81% (76%-85%) | 0.8 | 0: 7, 1: 10, 2: 3 | 4x Dust Hyena, 4x Sandfish, 4x Thorny Devil, 3x Sand Widow, 3x Trapdoor Spider, 2x Dromedary | 0 |
| 4 | family:poison | big (13 copies at 1+ Lumber, average 0.8); economy (8 resource makers); poison x8 | 80% (75%-84%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Dune Packrat, 4x Dust Hyena, 4x Sand Widow, 4x Thorny Devil, 3x Trapdoor Spider, 1x Caustic Scorpion | 6 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 92% | 79% | 100% | 100% | 92% | 96% | 88% | 83% | 79% | 96% | 79% | 79% |
| 2 big | 79% | 83% | 96% | 96% | 75% | 96% | 75% | 92% | 88% | 92% | 79% | 100% |
| 3 open | 79% | 83% | 100% | 96% | 75% | 83% | 58% | 83% | 71% | 92% | 63% | 83% |
| 4 family:poison | 79% | 75% | 96% | 100% | 75% | 75% | 79% | 96% | 67% | 88% | 50% | 79% |
