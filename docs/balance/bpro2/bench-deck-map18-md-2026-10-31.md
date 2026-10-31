# Focused decks: Map 18 The Glass Dunes (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,komodo-warlord,meerkat-burrower,obsidian-scorpion,roadrunner-courier,sand-widow,sandfish,spitting-cobra,thorny-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:poison,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7460 games in 132 s.

- The list (16): Antlion Pit, Bison Bulldozer, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Komodo Warlord, Meerkat Burrower, Obsidian Scorpion, Roadrunner Courier, Sand Widow, Sandfish, Spitting Cobra, Thorny Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 1.0 Lumber) | 88% (84%-91%) | 1 | 1: 20 | 4x Dromedary, 4x Fennec Fox, 4x Thorny Devil, 3x Antlion Pit, 3x Bison Bulldozer, 2x Obsidian Scorpion | 0 |
| 2 | family:poison | big (4 copies at 2+ Lumber, average 1.2); poison x9 | 79% (75%-84%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Sand Widow, 4x Thorny Devil, 3x Dromedary, 3x Obsidian Scorpion, 2x Caustic Scorpion | 8 |
| 3 | economy | economy (8 resource makers) | 69% (64%-74%) | 0.8 | 0: 4, 1: 16 | 4x Dromedary, 4x Dune Packrat, 4x Dust Hyena, 4x Roadrunner Courier, 3x Antlion Pit, 1x Sandfish | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.6); economy (4 resource makers); poison x13 | 49% (43%-54%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Dune Packrat, 4x Komodo Warlord, 4x Sand Widow, 3x Dromedary, 3x Obsidian Scorpion, 2x Caustic Scorpion | 15 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 100% | 79% | 67% | 88% | 83% | 100% | 67% | 96% |
| 2 family:poison | 92% | 92% | 96% | 75% | 42% | 88% | 79% | 96% | 50% | 83% |
| 3 economy | 83% | 71% | 88% | 25% | 54% | 67% | 63% | 100% | 42% | 96% |
| 4 big | 83% | 63% | 79% | 25% | 4% | 46% | 50% | 63% | 25% | 50% |
