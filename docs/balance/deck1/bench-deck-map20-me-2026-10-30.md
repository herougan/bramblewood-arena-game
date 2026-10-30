# Focused decks: Map 20 Eye of the Volcano (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,baby-bat,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,polar-bear,skull-vulture,squires-mount,stalactite-golem,stoat-cutthroat,the-contradiction,vampire-bat,vampire-roost,wolf-spider-mother,woodland-brawler --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:flying,open --anchor ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,stalactite-golem,the-contradiction,vampire-roost,woodland-brawler --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13080 games in 263 s.

- The list (28): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Baby Bat, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Polar Bear, Skull Vulture, Squire's Mount, Stalactite Golem, Stoat Cutthroat, The Contradiction, Vampire Bat, Vampire Roost, Wolf Spider Mother, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 1.1 Lumber) | 83% (78%-88%) | 1.05 | 0: 7, 1: 9, 3: 4 | 4x Ancient Sloth Titan, 4x Grave-Grin Hyena, 3x Ashbone Ghoul, 3x Eagle-Owl Quartermaster, 3x Obsidian Scorpion, 3x Squire's Mount | 0 |
| 2 | swarm | swarm (15 copies at 0 Lumber) | 82% (77%-86%) | 0.55 | 0: 15, 1: 2, 3: 3 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Grave-Grin Hyena, 3x Ancient Sloth Titan, 3x Baby Bat, 2x Ibex Rockcaller | 10 |
| 3 | family:flying | flying x10; night x7 | 81% (77%-86%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Vampire Bat, 3x Ash Cloud Condor, 3x Baby Bat, 3x Obsidian Scorpion, 3x Squire's Mount | 11 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.5) | 55% (50%-60%) | 1.5 | 0: 6, 1: 6, 3: 8 | 4x Ancient Sloth Titan, 4x Ashbone Ghoul, 4x Cave Bear, 3x Squire's Mount, 3x Wolf Spider Mother, 2x Grave-Grin Hyena | 8 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 71% | 63% | 88% | 83% | 79% | 83% | 96% | 83% | 92% |
| 2 swarm | 96% | 92% | 58% | 92% | 83% | 75% | 92% | 100% | 38% | 92% |
| 3 family:flying | 96% | 79% | 67% | 83% | 83% | 71% | 83% | 92% | 63% | 96% |
| 4 big | 79% | 46% | 8% | 42% | 58% | 42% | 58% | 92% | 38% | 88% |
