# Focused decks: Map 14 The Canopy (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool apollo-butterfly,camouflage-frog,eagle-owl-quartermaster,fire-ant-raft,grave-grin-hyena,hercules-beetle,hoopoe-herald,ibex-rockcaller,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lotus-frog,lovebird,lyrebird-mimic,meerkat-burrower,pangolin-roller,poison-dart-croaker,redwood-woodpecker,spitting-cobra,squires-mount,stag-beetle,stoat-cutthroat,vampire-bat,weaver-bird,wolf-spider-mother,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor apollo-butterfly,camouflage-frog,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,leafcutter-gardener,lyrebird-mimic,pangolin-roller,poison-dart-croaker,redwood-woodpecker,spitting-cobra,vampire-bat,weaver-bird --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13152 games in 235 s.

- The list (26): Apollo Butterfly, Camouflage Frog, Eagle-Owl Quartermaster, Fire Ant Raft, Grave-Grin Hyena, Hercules Beetle, Hoopoe Herald, Ibex Rockcaller, Jaguar Stalker, Kinkajou Lurker, Leafcutter Gardener, Lotus Frog, Lovebird, Lyrebird Mimic, Meerkat Burrower, Pangolin Roller, Poison Dart Croaker, Redwood Woodpecker, Spitting Cobra, Squire's Mount, Stag Beetle, Stoat Cutthroat, Vampire Bat, Weaver Bird, Wolf Spider Mother, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1 Lumber, average 0.7); economy (6 resource makers) | 85% (80%-90%) | 0.65 | 0: 7, 1: 13 | 4x Leafcutter Gardener, 4x Lovebird, 4x Pangolin Roller, 3x Grave-Grin Hyena, 3x Wolf Spider Mother, 2x Redwood Woodpecker | 6 |
| 2 | open | big (9 copies at 1 Lumber, average 0.5); economy (4 resource makers) | 82% (77%-87%) | 0.45 | 0: 11, 1: 9 | 4x Grave-Grin Hyena, 4x Leafcutter Gardener, 4x Pangolin Roller, 3x Hoopoe Herald, 3x Wolf Spider Mother, 2x Hercules Beetle | 0 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 73% (67%-79%) | 0.3 | 0: 14, 1: 6 | 4x Grave-Grin Hyena, 4x Leafcutter Gardener, 3x Hoopoe Herald, 3x Squire's Mount, 3x Vampire Bat, 3x Wolf Spider Mother | 6 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4) | 72% (67%-78%) | 0.4 | 0: 12, 1: 8 | 4x Apollo Butterfly, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Weaver Bird, 2x Ibex Rockcaller, 2x Kinkajou Lurker | 13 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 67% | 92% | 92% | 75% | 92% | 96% | 79% | 88% |
| 2 open | 67% | 92% | 75% | 71% | 79% | 100% | 96% | 75% |
| 3 swarm | 42% | 67% | 79% | 42% | 75% | 92% | 92% | 96% |
| 4 big | 67% | 63% | 79% | 42% | 63% | 92% | 83% | 92% |
