# Focused decks: Map 20 The Sundered Peak (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pit-glutton,pumice-beetle,stalactite-golem,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7696 games in 180 s.

- The list (20): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Fumarole Ibex, Glacier Wolf Pack, Gorge Wyrm, Magma Salamander, Magma Wraith, Ossuary Lammergeier, Pack Mule, Pit Glutton, Pumice Beetle, Stalactite Golem, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers); ranged x7; fire x7 | 75% (71%-80%) | 0.6 | 0: 8, 1: 12 | 4x Ashbone Ghoul, 4x Magma Wraith, 4x Pack Mule, 4x Pumice Beetle, 3x Magma Salamander, 1x Ossuary Lammergeier | 13 |
| 2 | open | midrange (average 0.6 Lumber) | 75% (71%-79%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Stoker, 3x Magma Salamander, 3x Pit Glutton, 2x Woodland Brawler | 0 |
| 3 | family:flying | flying x8 | 67% (62%-71%) | 0.6 | 0: 8, 1: 12 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Magma Wraith, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 8 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.3); economy (4 resource makers); siege x8 | 49% (44%-54%) | 1.25 | 0: 11, 1: 1, 3: 8 | 4x Cinder Stoker, 4x Cave Bear, 4x Gorge Wyrm, 4x Pack Mule, 3x Ashbone Ghoul, 1x Ash Cloud Condor | 13 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 79% | 88% | 98% | 71% | 71% | 67% | 71% | 83% | 83% | 71% | 100% | 8% | 92% |
| 2 open | 83% | 90% | 92% | 58% | 75% | 75% | 71% | 83% | 79% | 67% | 100% | 4% | 96% |
| 3 family:flying | 75% | 92% | 94% | 54% | 54% | 54% | 50% | 71% | 71% | 58% | 100% | 17% | 75% |
| 4 big | 29% | 58% | 67% | 50% | 38% | 54% | 42% | 63% | 71% | 21% | 75% | 13% | 58% |
