# Focused decks: Map 18 The Pale Desert (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-hyena,fennec-fox,glass-golem,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandstorm-roc,skull-vulture,trapdoor-spider --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2496 games in 417 s.

- The list (17): Antlion Pit, Caustic Scorpion, Dromedary, Dune Packrat, Dust Hyena, Fennec Fox, Glass Golem, Komodo Warlord, Moon Jerboa, Pale Oryx, Quicksand Queen, Roadrunner Courier, Sand-flinger Antlion, Sand Widow, Sandstorm Roc, Skull Vulture, Trapdoor Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.8 Lumber) | 89% (86%-92%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Roadrunner Courier, 4x Sand-flinger Antlion, 3x Dune Packrat, 3x Glass Golem, 2x Quicksand Queen | 0 |
| 2 | family:poison | economy (4 resource makers); poison x10 | 80% (75%-84%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Caustic Scorpion, 4x Dromedary, 4x Dust Hyena, 4x Sand Widow, 2x Antlion Pit, 2x Trapdoor Spider | 18 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.2); economy (4 resource makers) | 59% (54%-64%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Antlion Pit, 4x Dust Hyena, 4x Roadrunner Courier, 4x Sand Widow, 4x Sandstorm Roc | 12 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 100% | 88% | 100% | 96% | 100% | 79% | 92% | 100% | 100% | 50% | 67% |
| 2 family:poison | 96% | 92% | 92% | 83% | 100% | 83% | 71% | 79% | 96% | 83% | 25% | 54% |
| 3 big | 88% | 67% | 58% | 38% | 63% | 71% | 25% | 79% | 71% | 79% | 29% | 38% |
