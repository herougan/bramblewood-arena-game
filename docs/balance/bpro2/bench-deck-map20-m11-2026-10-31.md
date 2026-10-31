# Focused decks: Map 20 The Sundered Peak (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,echidna-quillshot,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pumice-beetle,stalactite-golem,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7644 games in 139 s.

- The list (20): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Echidna Quillshot, Fumarole Ibex, Glacier Wolf Pack, Gorge Wyrm, Magma Salamander, Magma Wraith, Ossuary Lammergeier, Pack Mule, Pumice Beetle, Stalactite Golem, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); ranged x9; fire x7 | 78% (74%-82%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Magma Wraith, 4x Pack Mule, 3x Ashbone Ghoul, 3x Magma Salamander, 2x Echidna Quillshot | 0 |
| 2 | economy | economy (8 resource makers) | 74% (70%-78%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Stoker, 4x Pack Mule, 4x Pumice Beetle, 3x Cinder Skeleton, 3x Magma Salamander, 2x Echidna Quillshot | 7 |
| 3 | family:flying | economy (4 resource makers); flying x8 | 53% (47%-58%) | 1 | 0: 8, 1: 8, 3: 4 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cave Bear, 4x Pack Mule, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 13 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); economy (4 resource makers) | 50% (45%-56%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Ancient Sloth Titan, 4x Cave Bear, 4x Pack Mule, 3x Cinder Stoker, 3x Magma Salamander, 2x Woodland Brawler | 10 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 96% | 96% | 40% | 75% | 75% | 92% | 96% | 92% | 75% | 100% | 4% | 92% |
| 2 economy | 88% | 96% | 96% | 33% | 71% | 67% | 77% | 83% | 88% | 67% | 100% | 0% | 100% |
| 3 family:flying | 50% | 75% | 71% | 42% | 50% | 58% | 46% | 54% | 58% | 38% | 71% | 13% | 58% |
| 4 big | 67% | 65% | 54% | 42% | 42% | 46% | 71% | 52% | 46% | 42% | 58% | 4% | 67% |
