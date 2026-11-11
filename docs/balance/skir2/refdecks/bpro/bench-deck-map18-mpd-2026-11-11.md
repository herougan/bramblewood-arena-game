# Focused decks: Map 18 The Pale Desert (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-hyena,fennec-fox,glass-golem,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandstorm-roc,skull-vulture,trapdoor-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7104 games in 87 s.

- The list (17): Antlion Pit, Caustic Scorpion, Dromedary, Dune Packrat, Dust Hyena, Fennec Fox, Glass Golem, Komodo Warlord, Moon Jerboa, Pale Oryx, Quicksand Queen, Roadrunner Courier, Sand-flinger Antlion, Sand Widow, Sandstorm Roc, Skull Vulture, Trapdoor Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 89% (85%-92%) | 0.5 | 0: 10, 1: 10 | 4x Antlion Pit, 4x Dust Hyena, 4x Pale Oryx, 4x Sand-flinger Antlion, 2x Quicksand Queen, 2x Trapdoor Spider | 0 |
| 2 | family:poison | economy (4 resource makers); poison x9 | 80% (76%-84%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Dust Hyena, 4x Sand-flinger Antlion, 4x Sand Widow, 3x Caustic Scorpion, 3x Dromedary, 2x Trapdoor Spider | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); poison x6 | 73% (68%-77%) | 1.15 | 0: 5, 1: 7, 2: 8 | 4x Antlion Pit, 4x Sand Widow, 4x Sandstorm Roc, 3x Dune Packrat, 3x Dust Hyena, 2x Trapdoor Spider | 11 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 96% | 75% | 96% | 96% | 79% | 96% | 83% | 100% | 63% | 83% |
| 2 family:poison | 100% | 75% | 92% | 63% | 96% | 96% | 83% | 92% | 83% | 96% | 29% | 58% |
| 3 big | 88% | 71% | 96% | 42% | 96% | 92% | 67% | 83% | 75% | 83% | 29% | 54% |
