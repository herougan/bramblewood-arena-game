# Focused decks: Map 18 The Pale Desert (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,thorny-devil,trapdoor-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 94 s.

- The list (14): Antlion Pit, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandfish, Skull Vulture, Thorny Devil, Trapdoor Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (14 copies at 1+ Lumber, average 0.7); economy (8 resource makers) | 88% (85%-92%) | 0.7 | 0: 6, 1: 14 | 4x Antlion Pit, 4x Dune Packrat, 4x Dust Hyena, 4x Thorny Devil, 2x Quicksand Queen, 2x Trapdoor Spider | 7 |
| 2 | open | big (17 copies at 1+ Lumber, average 0.8); economy (4 resource makers) | 88% (85%-92%) | 0.85 | 0: 3, 1: 17 | 4x Dune Packrat, 4x Roadrunner Courier, 4x Thorny Devil, 3x Antlion Pit, 3x Trapdoor Spider, 2x Dust-devil Kestrel | 0 |
| 3 | big | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 85% (81%-89%) | 0.7 | 0: 6, 1: 14 | 4x Antlion Pit, 4x Dust Hyena, 4x Thorny Devil, 3x Caustic Scorpion, 3x Dromedary, 2x Trapdoor Spider | 11 |
| 4 | family:poison | big (13 copies at 1+ Lumber, average 0.8); economy (4 resource makers); poison x8 | 83% (79%-87%) | 0.8 | 0: 7, 1: 10, 2: 3 | 4x Dust Hyena, 4x Sandfish, 4x Thorny Devil, 3x Sand Widow, 3x Trapdoor Spider, 2x Caustic Scorpion | 13 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 88% | 88% | 92% | 100% | 92% | 83% | 83% | 92% | 83% | 96% | 79% | 83% |
| 2 open | 96% | 75% | 92% | 100% | 92% | 83% | 92% | 96% | 75% | 100% | 67% | 92% |
| 3 big | 83% | 92% | 100% | 96% | 75% | 88% | 83% | 79% | 79% | 88% | 88% | 75% |
| 4 family:poison | 83% | 83% | 96% | 92% | 71% | 83% | 58% | 83% | 92% | 92% | 79% | 83% |
