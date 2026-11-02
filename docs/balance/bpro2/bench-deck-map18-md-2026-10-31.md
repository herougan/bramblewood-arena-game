# Focused decks: Map 18 The Glass Dunes (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,glass-golem,hollow-belly-rat,komodo-warlord,meerkat-burrower,roadrunner-courier,sand-widow,sandfish,spitting-cobra,thorny-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7160 games in 129 s.

- The list (17): Antlion Pit, Bison Bulldozer, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Glass Golem, Hollow-belly Rat, Komodo Warlord, Meerkat Burrower, Roadrunner Courier, Sand Widow, Sandfish, Spitting Cobra, Thorny Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 90% (87%-94%) | 1 | 1: 20 | 4x Caustic Scorpion, 4x Dune Packrat, 4x Fennec Fox, 4x Thorny Devil, 2x Antlion Pit, 2x Dromedary | 0 |
| 2 | economy | economy (7 resource makers) | 88% (85%-92%) | 0.85 | 0: 3, 1: 17 | 4x Antlion Pit, 4x Dromedary, 4x Dune Packrat, 4x Thorny Devil, 3x Dust Hyena, 1x Caustic Scorpion | 7 |
| 3 | family:poison | poison x8 | 76% (71%-81%) | 1.05 | 0: 3, 1: 13, 2: 4 | 4x Caustic Scorpion, 4x Dromedary, 4x Sand Widow, 3x Dust Hyena, 3x Thorny Devil, 2x Meerkat Burrower | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); economy (4 resource makers); poison x8 | 57% (52%-63%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Antlion Pit, 4x Dust Hyena, 4x Komodo Warlord, 4x Sand Widow, 4x Thorny Devil | 14 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 100% | 100% | 79% | 88% | 88% | 88% | 100% | 75% | 96% |
| 2 economy | 79% | 96% | 96% | 96% | 79% | 88% | 63% | 100% | 92% | 96% |
| 3 family:poison | 71% | 83% | 96% | 75% | 50% | 75% | 71% | 100% | 54% | 83% |
| 4 big | 71% | 67% | 92% | 21% | 29% | 50% | 42% | 92% | 38% | 71% |
