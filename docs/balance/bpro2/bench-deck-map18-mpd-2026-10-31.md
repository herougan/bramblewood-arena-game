# Focused decks: Map 18 The Pale Desert (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,thorny-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7440 games in 89 s.

- The list (13): Antlion Pit, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandfish, Skull Vulture, Thorny Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1+ Lumber, average 0.8); economy (6 resource makers) | 74% (69%-79%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Dust Hyena, 4x Roadrunner Courier, 4x Sandfish, 2x Dune Packrat, 2x Quicksand Queen | 8 |
| 2 | economy | big (16 copies at 1+ Lumber, average 0.8); economy (8 resource makers) | 72% (67%-77%) | 0.8 | 0: 4, 1: 16 | 4x Dromedary, 4x Dune Packrat, 4x Dust Hyena, 4x Roadrunner Courier, 2x Quicksand Queen, 2x Thorny Devil | 8 |
| 3 | family:poison | big (16 copies at 1+ Lumber, average 1.0); economy (7 resource makers); poison x8 | 61% (56%-67%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Caustic Scorpion, 4x Dust Hyena, 4x Roadrunner Courier, 4x Sand Widow, 3x Dune Packrat, 1x Dromedary | 9 |
| 4 | open | big (20 copies at 1+ Lumber, average 1.0); economy (4 resource makers) | 61% (56%-66%) | 1 | 1: 20 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Dune Packrat, 4x Roadrunner Courier, 2x Quicksand Queen, 2x Thorny Devil | 0 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 75% | 71% | 75% | 79% | 75% | 83% | 54% | 54% | 71% | 100% | 71% | 75% |
| 2 economy | 71% | 54% | 88% | 54% | 67% | 88% | 75% | 50% | 71% | 100% | 71% | 79% |
| 3 family:poison | 50% | 58% | 67% | 58% | 54% | 83% | 38% | 46% | 75% | 75% | 63% | 67% |
| 4 open | 63% | 42% | 88% | 71% | 67% | 50% | 50% | 67% | 58% | 83% | 38% | 58% |
