# Focused decks: Map 18 The Pale Desert (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,banded-sea-krait,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,fire-ant-raft,gallery-orb-weaver,glimmer-spider,grave-grin-hyena,ibex-rockcaller,meerkat-burrower,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,stoat-cutthroat,thorny-devil,trapdoor-spider,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:poison,family:night,big,open --anchor antlion-pit,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,quicksand-queen,roadrunner-courier,sand-widow,sandfish,skull-vulture,thorny-devil,trapdoor-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 128 s.

- The list (25): Antlion Pit, Banded Sea Krait, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Fire Ant Raft, Gallery Orb-Weaver, Glimmer Spider, Grave-Grin Hyena, Ibex Rockcaller, Meerkat Burrower, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandfish, Skull Vulture, Stoat Cutthroat, Thorny Devil, Trapdoor Spider, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 92% (89%-95%) | 0.6 | 0: 8, 1: 12 | 4x Antlion Pit, 4x Dust Hyena, 4x Grave-Grin Hyena, 3x Dune Packrat, 3x Roadrunner Courier, 2x Walrus Icebreaker | 0 |
| 2 | family:poison | big (15 copies at 1+ Lumber, average 0.8); poison x9 | 90% (86%-93%) | 0.75 | 0: 5, 1: 15 | 4x Antlion Pit, 4x Banded Sea Krait, 4x Thorny Devil, 3x Gallery Orb-Weaver, 3x Grave-Grin Hyena, 2x Trapdoor Spider | 13 |
| 3 | family:night | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); night x8 | 85% (82%-89%) | 0.5 | 0: 10, 1: 10 | 4x Dust Hyena, 4x Grave-Grin Hyena, 4x Meerkat Burrower, 4x Skull Vulture, 2x Thorny Devil, 2x Trapdoor Spider | 12 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); poison x6 | 81% (76%-85%) | 0.5 | 0: 10, 1: 10 | 4x Dromedary, 4x Dust Hyena, 4x Gallery Orb-Weaver, 4x Grave-Grin Hyena, 2x Stoat Cutthroat, 2x Trapdoor Spider | 12 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 100% | 92% | 96% | 96% | 83% | 100% | 88% | 100% | 75% | 83% |
| 2 family:poison | 92% | 88% | 88% | 92% | 92% | 100% | 92% | 92% | 88% | 100% | 83% | 71% |
| 3 family:night | 88% | 96% | 88% | 96% | 79% | 79% | 96% | 88% | 100% | 100% | 63% | 54% |
| 4 big | 83% | 96% | 79% | 79% | 83% | 83% | 88% | 88% | 92% | 96% | 54% | 46% |
