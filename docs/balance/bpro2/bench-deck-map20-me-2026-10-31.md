# Focused decks: Map 20 Eye of the Volcano (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,stalactite-golem,the-contradiction,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7060 games in 124 s.

- The list (16): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Stalactite Golem, The Contradiction, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 65% (59%-70%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Pack Mule, 3x Obsidian Scorpion, 3x Vampire Roost, 2x Woodland Brawler | 0 |
| 2 | family:flying | economy (4 resource makers); flying x8 | 63% (57%-68%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Cinder Stoker, 4x Magma Wraith, 4x Pack Mule, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 12 |
| 3 | big | big (8 copies at 3+ Lumber, average 1.3); economy (4 resource makers); siege x6 | 42% (36%-48%) | 1.3 | 0: 12, 3: 6, 4: 2 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Cave Bear, 4x Pack Mule, 2x Ancient Sloth Titan, 2x Cave Warlord | 8 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 46% | 46% | 96% | 75% | 58% | 79% | 92% | 13% | 50% |
| 2 family:flying | 88% | 54% | 42% | 54% | 79% | 50% | 71% | 96% | 25% | 71% |
| 3 big | 67% | 33% | 29% | 46% | 58% | 29% | 58% | 54% | 8% | 38% |
