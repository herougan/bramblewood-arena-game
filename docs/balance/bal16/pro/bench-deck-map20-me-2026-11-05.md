# Focused decks: Map 20 Eye of the Volcano (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,lantern-spark-fly,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,polar-bear,skull-vulture,stalactite-golem,stoat-cutthroat,the-contradiction,vampire-bat,vampire-roost,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:night,big,open --anchor ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,stalactite-golem,the-contradiction,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6920 games in 136 s.

- The list (27): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Lantern Spark Fly, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Polar Bear, Skull Vulture, Stalactite Pill Bug, Stoat Cutthroat, The Contradiction, Vampire Bat, Vampire Roost, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x9 | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Cinder Stoker, 4x Fire Salamander, 4x Lantern Spark Fly, 3x Ash Cloud Condor, 3x Obsidian Scorpion, 2x Vampire Bat | 18 |
| 2 | family:night | economy (4 resource makers); flying x8; night x8 | 68% (64%-73%) | 0.5 | 0: 10, 1: 10 | 4x Ash Moth, 4x Grave-Grin Hyena, 4x Pack Mule, 4x Skull Vulture, 2x Ashbone Ghoul, 2x Polar Bear | 13 |
| 3 | open | economy (4 resource makers); guard x8 | 64% (60%-69%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Pack Mule, 4x Stalactite Pill Bug, 3x Grave-Grin Hyena, 3x Vampire Bat, 2x Ibex Rockcaller | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); siege x8 | 54% (49%-59%) | 1.65 | 0: 7, 1: 5, 3: 4, 4: 4 | 4x Cave Warlord, 4x Cave Bear, 4x Lantern Spark Fly, 3x Pack Mule, 3x Stoat Cutthroat, 2x Walrus Icebreaker | 17 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 75% | 92% | 92% | 54% | 100% | 96% | 96% | 100% | 71% | 100% |
| 2 family:night | 50% | 96% | 92% | 33% | 92% | 79% | 100% | 92% | 17% | 33% |
| 3 open | 71% | 88% | 88% | 58% | 96% | 88% | 88% | 50% | 4% | 13% |
| 4 big | 42% | 83% | 79% | 25% | 79% | 50% | 88% | 56% | 8% | 29% |
