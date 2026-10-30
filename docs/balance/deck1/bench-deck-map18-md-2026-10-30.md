# Focused decks: Map 18 The Glass Dunes (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,banded-sea-krait,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,glimmer-spider,grave-grin-hyena,ibex-rockcaller,komodo-warlord,lovebird,meerkat-burrower,mongoose-duelist,monitor-rambler,obsidian-scorpion,roadrunner-courier,sand-widow,sandfish,spitting-cobra,squires-mount,stoat-cutthroat,thorny-devil,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,family:poison,open --anchor antlion-pit,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,komodo-warlord,meerkat-burrower,obsidian-scorpion,roadrunner-courier,sand-widow,sandfish,spitting-cobra,thorny-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13260 games in 264 s.

- The list (28): Antlion Pit, Banded Sea Krait, Bison Bulldozer, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glimmer Spider, Grave-Grin Hyena, Ibex Rockcaller, Komodo Warlord, Lovebird, Meerkat Burrower, Mongoose Duelist, Monitor Rambler, Obsidian Scorpion, Roadrunner Courier, Sand Widow, Sandfish, Spitting Cobra, Squire's Mount, Stoat Cutthroat, Thorny Devil, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 1.0 Lumber) | 99% (97%-100%) | 1 | 1: 20 | 4x Antlion Pit, 4x Roadrunner Courier, 4x Thorny Devil, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 0 |
| 2 | family:poison | poison x9 | 89% (85%-92%) | 1 | 1: 20 | 4x Antlion Pit, 4x Dromedary, 4x Glimmer Spider, 3x Obsidian Scorpion, 3x Wolf Spider Mother, 2x Banded Sea Krait | 13 |
| 3 | economy | economy (8 resource makers) | 85% (81%-89%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Dune Packrat, 4x Dust Hyena, 3x Squire's Mount, 3x Wolf Spider Mother, 2x Roadrunner Courier | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); poison x8; ranged x6 | 75% (71%-80%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Komodo Warlord, 4x Sand Widow, 3x Dust Hyena, 3x Eagle-Owl Quartermaster, 3x Spitting Cobra, 3x Wolf Spider Mother | 14 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 96% | 96% | 100% | 100% | 100% | 100% | 100% |
| 2 family:poison | 100% | 96% | 100% | 92% | 54% | 100% | 71% | 100% | 75% | 100% |
| 3 economy | 100% | 92% | 88% | 79% | 58% | 100% | 71% | 100% | 63% | 100% |
| 4 big | 92% | 75% | 88% | 88% | 38% | 75% | 58% | 96% | 54% | 92% |
