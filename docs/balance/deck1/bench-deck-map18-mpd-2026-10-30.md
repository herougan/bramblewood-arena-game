# Focused decks: Map 18 The Pale Desert (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,banded-sea-krait,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,frillneck-duelist,gallery-orb-weaver,glasswing-moth,glimmer-spider,grave-grin-hyena,ibex-rockcaller,meerkat-burrower,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,squires-mount,stoat-cutthroat,thorny-devil,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,family:poison,open --anchor antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,thorny-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13248 games in 192 s.

- The list (25): Antlion Pit, Banded Sea Krait, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Frillneck Duelist, Gallery Orb-Weaver, Glasswing Moth, Glimmer Spider, Grave-Grin Hyena, Ibex Rockcaller, Meerkat Burrower, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandfish, Skull Vulture, Squire's Mount, Stoat Cutthroat, Thorny Devil, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 86% (82%-90%) | 0.65 | 0: 7, 1: 13 | 4x Dune Packrat, 4x Grave-Grin Hyena, 4x Roadrunner Courier, 3x Antlion Pit, 3x Dust Hyena, 2x Squire's Mount | 10 |
| 2 | big | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers) | 79% (74%-83%) | 0.8 | 0: 4, 1: 16 | 4x Dust Hyena, 4x Roadrunner Courier, 4x Sandfish, 3x Antlion Pit, 3x Squire's Mount, 2x Ibex Rockcaller | 12 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 79% (74%-83%) | 0.6 | 0: 8, 1: 12 | 4x Antlion Pit, 4x Dune Packrat, 4x Dust Hyena, 4x Glasswing Moth, 3x Stoat Cutthroat, 1x Ibex Rockcaller | 0 |
| 4 | family:poison | big (20 copies at 1+ Lumber, average 1.2); economy (4 resource makers); poison x8 | 62% (57%-68%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Dune Packrat, 4x Glimmer Spider, 4x Sand Widow, 2x Eagle-Owl Quartermaster, 2x Roadrunner Courier | 12 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 92% | 58% | 92% | 96% | 79% | 92% | 75% | 75% | 92% | 100% | 83% | 96% |
| 2 big | 92% | 79% | 79% | 58% | 75% | 100% | 58% | 67% | 83% | 92% | 83% | 79% |
| 3 open | 79% | 71% | 88% | 83% | 63% | 92% | 63% | 67% | 92% | 92% | 67% | 92% |
| 4 family:poison | 46% | 58% | 63% | 67% | 63% | 58% | 46% | 71% | 63% | 83% | 56% | 75% |
