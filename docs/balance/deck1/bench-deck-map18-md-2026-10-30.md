# Focused decks: Map 18 The Glass Dunes (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,banded-sea-krait,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,glass-golem,glimmer-spider,grave-grin-hyena,hollow-belly-rat,ibex-rockcaller,komodo-warlord,lovebird,meerkat-burrower,mongoose-duelist,monitor-rambler,roadrunner-courier,sand-widow,sandfish,spitting-cobra,squires-mount,stoat-cutthroat,thorny-devil,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,family:poison,open --anchor antlion-pit,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,glass-golem,hollow-belly-rat,komodo-warlord,meerkat-burrower,roadrunner-courier,sand-widow,sandfish,spitting-cobra,thorny-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7640 games in 159 s.

- The list (29): Antlion Pit, Banded Sea Krait, Bison Bulldozer, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glass Golem, Glimmer Spider, Grave-Grin Hyena, Hollow-belly Rat, Ibex Rockcaller, Komodo Warlord, Lovebird, Meerkat Burrower, Mongoose Duelist, Monitor Rambler, Roadrunner Courier, Sand Widow, Sandfish, Spitting Cobra, Squire's Mount, Stoat Cutthroat, Thorny Devil, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 95% (92%-98%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Dust Hyena, 4x Mongoose Duelist, 3x Monitor Rambler, 3x Thorny Devil, 2x Eagle-Owl Quartermaster | 0 |
| 2 | family:poison | big (4 copies at 2+ Lumber, average 1.2); economy (4 resource makers); poison x8 | 86% (82%-90%) | 1.2 | 1: 16, 2: 4 | 4x Caustic Scorpion, 4x Dune Packrat, 4x Mongoose Duelist, 4x Sand Widow, 2x Eagle-Owl Quartermaster, 2x Walrus Icebreaker | 14 |
| 3 | economy | economy (6 resource makers) | 85% (81%-89%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Dromedary, 4x Dust Hyena, 3x Caustic Scorpion, 3x Squire's Mount, 2x Dune Packrat | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.6); poison x8 | 73% (67%-78%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Komodo Warlord, 4x Mongoose Duelist, 4x Sand Widow, 4x Thorny Devil, 2x Bison Bulldozer, 2x Ibex Rockcaller | 13 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 96% | 100% | 92% | 88% | 100% | 92% | 88% |
| 2 family:poison | 100% | 92% | 83% | 67% | 96% | 96% | 75% | 100% | 65% | 88% |
| 3 economy | 96% | 92% | 67% | 88% | 100% | 88% | 92% | 96% | 38% | 96% |
| 4 big | 88% | 88% | 50% | 67% | 96% | 75% | 79% | 79% | 33% | 71% |
