# Focused decks: Map 20 Eye of the Volcano (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,lantern-spark-fly,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,polar-bear,rimeheart-colossus,skull-vulture,stalactite-golem,the-contradiction,tide-spirit,upside-down-bat,vampire-bat,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ancient-sloth-titan,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,deep-cave-troll,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,rimeheart-colossus,stalactite-golem,the-contradiction,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9400 games in 139 s.

- The list (27): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Lantern Spark Fly, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Ossuary Lammergeier, Pall Wraith, Polar Bear, Rimeheart Mammoth, Skull Vulture, Stalactite Pill Bug, The Contradiction, Tide Seahorse, Upside-Down Bat, Vampire Bat, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x12 | 91% (87%-94%) | 0.5 | 0: 10, 1: 10 | 4x Ash Moth, 4x Lantern Spark Fly, 4x Upside-Down Bat, 3x Cinder Skeleton, 3x Obsidian Scorpion, 2x Tide Seahorse | 12 |
| 2 | family:armor | armor x10; flying x7 | 86% (82%-90%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Stalactite Pill Bug, 4x Upside-Down Bat, 3x Lantern Spark Fly, 3x Obsidian Lich, 3x Obsidian Scorpion, 3x Wolf Spider Mother | 14 |
| 3 | big | big (8 copies at 3+ Lumber, average 1.2); flying x8 | 84% (80%-88%) | 1.2 | 0: 12, 3: 8 | 4x Ancient Sloth Titan, 4x Cave Bear, 4x Lantern Spark Fly, 4x Upside-Down Bat, 2x Ashbone Ghoul, 2x Tide Seahorse | 14 |
| 4 | open | flying x8 | 83% (78%-87%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Lantern Spark Fly, 3x Pall Wraith, 3x Wolf Spider Mother, 2x Magma Wraith | 0 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 88% | 92% | 100% | 100% | 92% | 92% | 100% | 71% | 75% |
| 2 family:armor | 88% | 88% | 96% | 92% | 100% | 96% | 92% | 88% | 71% | 50% |
| 3 big | 92% | 88% | 92% | 92% | 96% | 100% | 96% | 79% | 58% | 46% |
| 4 open | 92% | 79% | 88% | 96% | 96% | 88% | 83% | 96% | 42% | 67% |
