# Focused decks: Map 18 The Pale Desert (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,armadillo-guard,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,glass-golem,glasswing-moth,grave-grin-hyena,horned-lizard,ibex-rockcaller,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandfish,sandstorm-roc,skull-vulture,squires-mount,thorny-devil,tide-spirit,trapdoor-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:poison,big,swarm,open --anchor antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-hyena,fennec-fox,glass-golem,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandstorm-roc,skull-vulture,trapdoor-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3024 games in 538 s.

- The list (29): Antlion Pit, Armadillo Guard, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glass Golem, Glasswing Moth, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Komodo Warlord, Moon Jerboa, Pale Oryx, Quicksand Queen, Roadrunner Courier, Sand-flinger Antlion, Sand Widow, Sandfish, Sandstorm Roc, Skull Vulture, Squire's Mount, Thorny Devil, Tide Seahorse, Trapdoor Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 92% (90%-95%) | 0.3 | 0: 14, 1: 6 | 4x Dromedary, 4x Dust Hyena, 4x Glasswing Moth, 4x Grave-Grin Hyena, 2x Caustic Scorpion, 2x Tide Seahorse | 13 |
| 2 | open | midrange (average 0.5 Lumber) | 87% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Antlion Pit, 4x Glasswing Moth, 4x Pale Oryx, 3x Dust Hyena, 3x Sand-flinger Antlion, 2x Quicksand Queen | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); poison x6 | 69% (64%-74%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Dust Hyena, 4x Glasswing Moth, 4x Komodo Warlord, 4x Sandstorm Roc, 2x Quicksand Queen, 2x Trapdoor Spider | 11 |
| 4 | family:poison | big (8 copies at 2+ Lumber, average 1.1); poison x8 | 64% (58%-69%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Horned Lizard, 4x Sand-flinger Antlion, 4x Sand Widow, 4x Sandstorm Roc, 2x Caustic Scorpion, 2x Trapdoor Spider | 17 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 96% | 100% | 96% | 100% | 92% | 92% | 100% | 100% | 100% | 67% | 71% |
| 2 open | 96% | 96% | 100% | 83% | 92% | 88% | 83% | 96% | 96% | 100% | 46% | 71% |
| 3 big | 79% | 75% | 54% | 88% | 88% | 71% | 63% | 71% | 67% | 96% | 21% | 54% |
| 4 family:poison | 79% | 71% | 75% | 67% | 75% | 58% | 58% | 79% | 71% | 71% | 29% | 29% |
