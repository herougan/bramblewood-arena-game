# Focused decks: Map 18 The Pale Desert (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,armadillo-guard,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,glass-golem,glasswing-moth,grave-grin-hyena,horned-lizard,ibex-rockcaller,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandfish,sandstorm-roc,skull-vulture,squires-mount,thorny-devil,tide-spirit,trapdoor-spider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:poison,big,swarm,open --anchor antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-hyena,fennec-fox,glass-golem,komodo-warlord,moon-jerboa,pale-oryx,quicksand-queen,roadrunner-courier,sand-flinger-antlion,sand-widow,sandstorm-roc,skull-vulture,trapdoor-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9672 games in 117 s.

- The list (29): Antlion Pit, Armadillo Guard, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glass Golem, Glasswing Moth, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Komodo Warlord, Moon Jerboa, Pale Oryx, Quicksand Queen, Roadrunner Courier, Sand-flinger Antlion, Sand Widow, Sandfish, Sandstorm Roc, Skull Vulture, Squire's Mount, Thorny Devil, Tide Seahorse, Trapdoor Spider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber) | 95% (92%-97%) | 0.3 | 0: 14, 1: 6 | 4x Antlion Pit, 4x Glasswing Moth, 4x Grave-Grin Hyena, 4x Sand-flinger Antlion, 2x Ibex Rockcaller, 2x Trapdoor Spider | 12 |
| 2 | open | ranged x7 | 84% (80%-88%) | 0.7 | 0: 6, 1: 14 | 4x Antlion Pit, 4x Dromedary, 4x Sand-flinger Antlion, 3x Armadillo Guard, 3x Eagle-Owl Quartermaster, 2x Tide Seahorse | 0 |
| 3 | family:poison | economy (4 resource makers); poison x9 | 79% (75%-83%) | 1 | 0: 6, 1: 11, 3: 3 | 4x Caustic Scorpion, 4x Dust Hyena, 4x Thorny Devil, 3x Komodo Warlord, 3x Squire's Mount, 2x Trapdoor Spider | 20 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); economy (4 resource makers) | 62% (57%-67%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Dust Hyena, 4x Glasswing Moth, 4x Grave-Grin Hyena, 4x Komodo Warlord, 4x Sandstorm Roc | 20 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 96% | 96% | 96% | 96% | 100% | 100% | 100% | 67% | 88% |
| 2 open | 96% | 96% | 96% | 67% | 92% | 96% | 79% | 96% | 75% | 96% | 58% | 63% |
| 3 family:poison | 100% | 88% | 92% | 46% | 92% | 83% | 79% | 83% | 92% | 83% | 63% | 50% |
| 4 big | 88% | 58% | 79% | 42% | 71% | 75% | 50% | 75% | 79% | 79% | 17% | 29% |
