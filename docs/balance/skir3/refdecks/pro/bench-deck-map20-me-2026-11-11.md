# Focused decks: Map 20 Eye of the Volcano (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,cinder-skeleton,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,kinkajou-lurker,lantern-spark-fly,millipede-hauler,obsidian-scorpion,polar-bear,stalactite-golem,stoat-cutthroat,upside-down-bat,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ancient-sloth-titan,ash-moth,ashbone-ghoul,cinder-skeleton,deep-cave-troll,obsidian-scorpion,stalactite-golem,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9180 games in 147 s.

- The list (20): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Cinder Skeleton, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Kinkajou Lurker, Lantern Spark Fly, Millipede Hauler, Obsidian Scorpion, Polar Bear, Stalactite Pill Bug, Stoat Cutthroat, Upside-Down Bat, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x10; flying x8 | 79% (75%-84%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Ash Moth, 4x Millipede Hauler, 4x Stalactite Pill Bug, 4x Upside-Down Bat, 2x Obsidian Scorpion, 2x Stoat Cutthroat | 16 |
| 2 | family:flying | flying x8; armor x7 | 78% (74%-82%) | 0.95 | 0: 8, 1: 5, 2: 7 | 4x Lantern Spark Fly, 4x Stalactite Pill Bug, 4x Upside-Down Bat, 3x Obsidian Scorpion, 3x Vampire Roost, 2x Polar Bear | 10 |
| 3 | open | flying x8 | 76% (72%-81%) | 1.15 | 0: 11, 1: 2, 3: 7 | 4x Cave Bear, 4x Lantern Spark Fly, 4x Upside-Down Bat, 3x Ancient Sloth Titan, 3x Ashbone Ghoul, 2x Polar Bear | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 69% (65%-73%) | 1.05 | 0: 11, 1: 1, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Ashbone Ghoul, 4x Grave-Grin Hyena, 4x Vampire Roost, 3x Upside-Down Bat, 1x Millipede Hauler | 11 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 100% | 67% | 100% | 92% | 79% | 100% | 96% | 67% | 50% | 42% |
| 2 family:flying | 96% | 75% | 100% | 88% | 100% | 100% | 83% | 79% | 33% | 25% |
| 3 open | 88% | 79% | 100% | 67% | 92% | 100% | 83% | 75% | 46% | 33% |
| 4 big | 100% | 58% | 92% | 83% | 92% | 92% | 88% | 67% | 8% | 13% |
