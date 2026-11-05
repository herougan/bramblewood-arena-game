# Focused decks: Map 20 Eye of the Volcano (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,stalactite-golem,the-contradiction,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6620 games in 156 s.

- The list (15): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Stalactite Pill Bug, The Contradiction, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | economy (4 resource makers); flying x8 | 84% (80%-88%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Cinder Stoker, 4x Magma Wraith, 4x Pack Mule, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 13 |
| 2 | open | economy (4 resource makers); armor x7 | 82% (78%-86%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Pack Mule, 4x Stalactite Pill Bug, 3x Ashbone Ghoul, 3x Cinder Skeleton, 3x Cinder Stoker, 3x Obsidian Scorpion | 0 |
| 3 | big | big (9 copies at 3+ Lumber, average 1.6); economy (4 resource makers); siege x7 | 63% (58%-68%) | 1.65 | 0: 8, 1: 3, 3: 6, 4: 3 | 4x Cinder Stoker, 4x Cave Bear, 4x Pack Mule, 3x Cave Warlord, 3x Obsidian Scorpion, 2x Ancient Sloth Titan | 10 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 67% | 100% | 92% | 50% | 100% | 100% | 96% | 100% | 58% | 79% |
| 2 open | 88% | 100% | 92% | 88% | 100% | 75% | 100% | 92% | 38% | 46% |
| 3 big | 54% | 71% | 83% | 29% | 96% | 83% | 75% | 79% | 17% | 42% |
