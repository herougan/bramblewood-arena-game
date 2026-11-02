# Focused decks: Map 20 The Sundered Peak (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pit-glutton,pumice-beetle,stalactite-golem,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7436 games in 153 s.

- The list (20): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Fumarole Ibex, Glacier Wolf Pack, Gorge Wyrm, Magma Salamander, Magma Wraith, Ossuary Lammergeier, Pack Mule, Pit Glutton, Pumice Beetle, Stalactite Golem, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (8 resource makers) | 79% (75%-82%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Skeleton, 4x Cinder Stoker, 4x Pack Mule, 4x Pumice Beetle, 3x Magma Salamander, 1x Ossuary Lammergeier | 0 |
| 2 | economy | economy (8 resource makers) | 73% (69%-77%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Cinder Stoker, 4x Pack Mule, 4x Pumice Beetle, 3x Pit Glutton, 3x Stalactite Golem, 2x Magma Salamander | 6 |
| 3 | family:flying | flying x8 | 63% (58%-68%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Magma Wraith, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 15 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); siege x8 | 43% (38%-48%) | 1.65 | 0: 8, 1: 3, 2: 1, 3: 4, 4: 4 | 4x Ashbone Ghoul, 4x Cave Warlord, 4x Cinder Stoker, 4x Gorge Wyrm, 3x Magma Salamander, 1x Stalactite Golem | 13 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 92% | 100% | 71% | 77% | 67% | 79% | 88% | 75% | 73% | 100% | 13% | 96% |
| 2 economy | 67% | 88% | 79% | 50% | 71% | 88% | 88% | 83% | 83% | 69% | 92% | 4% | 88% |
| 3 family:flying | 63% | 92% | 92% | 42% | 38% | 54% | 46% | 83% | 71% | 54% | 100% | 17% | 71% |
| 4 big | 35% | 54% | 38% | 29% | 25% | 50% | 48% | 54% | 58% | 46% | 75% | 0% | 50% |
