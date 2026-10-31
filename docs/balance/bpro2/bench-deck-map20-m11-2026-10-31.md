# Focused decks: Map 20 The Sundered Peak (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,echidna-quillshot,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pumice-beetle,stalactite-golem,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7722 games in 139 s.

- The list (20): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Echidna Quillshot, Fumarole Ibex, Glacier Wolf Pack, Gorge Wyrm, Magma Salamander, Magma Wraith, Ossuary Lammergeier, Pack Mule, Pumice Beetle, Stalactite Golem, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 75% (71%-80%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Ashbone Ghoul, 4x Glacier Wolf Pack, 4x Pack Mule, 3x Cinder Stoker, 3x Magma Salamander, 2x Woodland Brawler | 0 |
| 2 | economy | economy (6 resource makers); ranged x7; fire x7 | 74% (70%-78%) | 0.65 | 0: 7, 1: 13 | 4x Cinder Skeleton, 4x Magma Wraith, 4x Pack Mule, 3x Ashbone Ghoul, 3x Magma Salamander, 2x Pumice Beetle | 10 |
| 3 | family:flying | flying x8 | 67% (63%-72%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Magma Wraith, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 13 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); economy (4 resource makers); siege x8 | 44% (39%-49%) | 1.6 | 0: 8, 1: 4, 3: 4, 4: 4 | 4x Cave Warlord, 4x Cinder Stoker, 4x Gorge Wyrm, 4x Pack Mule, 3x Magma Salamander, 1x Ossuary Lammergeier | 10 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 81% | 88% | 88% | 58% | 79% | 71% | 100% | 83% | 71% | 58% | 96% | 13% | 96% |
| 2 economy | 83% | 92% | 88% | 42% | 67% | 83% | 79% | 100% | 88% | 67% | 100% | 4% | 75% |
| 3 family:flying | 79% | 96% | 100% | 33% | 63% | 71% | 63% | 79% | 67% | 50% | 100% | 4% | 71% |
| 4 big | 67% | 63% | 46% | 17% | 35% | 50% | 35% | 56% | 42% | 21% | 75% | 4% | 58% |
