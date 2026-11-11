# Focused decks: Map 20 Eye of the Volcano (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,lantern-spark-fly,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,polar-bear,rimeheart-colossus,skull-vulture,squires-mount,stalactite-golem,the-contradiction,tide-spirit,vampire-bat,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ancient-sloth-titan,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,deep-cave-troll,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,rimeheart-colossus,stalactite-golem,the-contradiction,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2460 games in 251 s.

- The list (27): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Lantern Spark Fly, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Ossuary Lammergeier, Pall Wraith, Polar Bear, Rimeheart Mammoth, Skull Vulture, Squire's Mount, Stalactite Pill Bug, The Contradiction, Tide Seahorse, Vampire Bat, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x10 | 79% (75%-84%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Grave-Grin Hyena, 4x Lantern Spark Fly, 4x Stalactite Pill Bug, 3x Obsidian Lich, 3x Obsidian Scorpion, 2x Tide Seahorse | 20 |
| 2 | open | midrange (average 0.8 Lumber) | 78% (73%-83%) | 0.8 | 0: 4, 1: 16 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Skeleton, 3x Squire's Mount, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 0 |
| 3 | family:flying | big (4 copies at 3+ Lumber, average 1.4); flying x9 | 75% (69%-80%) | 1.4 | 0: 4, 1: 12, 4: 4 | 4x Ash Moth, 4x Cave Warlord, 4x Lantern Spark Fly, 4x Magma Wraith, 3x Obsidian Lich, 1x Ossuary Lammergeier | 16 |
| 4 | big | big (8 copies at 3+ Lumber, average 2.0) | 22% (17%-27%) | 2 | 1: 8, 2: 4, 3: 8 | 4x Ancient Sloth Titan, 4x Cave Bear, 4x Vampire Roost, 3x Fire Salamander, 3x Obsidian Scorpion, 2x Ibex Rockcaller | 18 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 92% | 100% | 96% | 67% | 96% | 83% | 83% | 88% | 33% | 54% |
| 2 open | 79% | 92% | 83% | 79% | 92% | 88% | 96% | 88% | 25% | 58% |
| 3 family:flying | 75% | 83% | 88% | 63% | 71% | 71% | 88% | 88% | 71% | 50% |
| 4 big | 13% | 42% | 50% | 21% | 25% | 33% | 21% | 13% | 4% | 0% |
