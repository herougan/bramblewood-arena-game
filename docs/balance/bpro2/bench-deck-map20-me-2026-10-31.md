# Focused decks: Map 20 Eye of the Volcano (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,stalactite-golem,the-contradiction,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6660 games in 147 s.

- The list (16): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Stalactite Golem, The Contradiction, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 73% (67%-78%) | 0.4 | 0: 12, 1: 8 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Pack Mule, 3x Cinder Skeleton, 3x Obsidian Scorpion, 2x Ash Cloud Condor | 0 |
| 2 | family:flying | economy (4 resource makers); flying x8 | 53% (47%-58%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Cinder Stoker, 4x Magma Wraith, 4x Pack Mule, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 10 |
| 3 | big | big (8 copies at 3+ Lumber, average 1.3); economy (4 resource makers) | 41% (35%-47%) | 1.25 | 0: 11, 1: 1, 3: 8 | 4x Ancient Sloth Titan, 4x Ashbone Ghoul, 4x Cave Bear, 4x Pack Mule, 3x Cinder Stoker, 1x Ossuary Lammergeier | 9 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 50% | 54% | 75% | 67% | 88% | 79% | 100% | 50% | 71% |
| 2 family:flying | 58% | 33% | 13% | 50% | 58% | 42% | 83% | 96% | 25% | 71% |
| 3 big | 58% | 13% | 25% | 63% | 50% | 38% | 67% | 58% | 8% | 29% |
