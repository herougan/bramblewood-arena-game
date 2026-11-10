# Focused decks: Map 20 The Sundered Peak (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ashbone-ghoul,caldera-snow-leopard,chamois-leaper,chipmunk-hoarder,cinder-hornet,cinder-skeleton,cinder-stoker,constrictor-coil,deep-cave-troll,fumarole-ibex,magma-salamander,magma-wraith,obsidian-scorpion,ossuary-lammergeier,phoenix-fledgling,stalactite-golem,talus-pika,vampire-roost --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3536 games in 721 s.

- The list (20): Ancient Sloth Titan, Ash Cloud Condor, Ashbone Ghoul, Caldera Snow Leopard, Chamois Leaper, Chipmunk Hoarder, Cinder Hornet, Cinder Skeleton, Cinder Stoker, Constrictor Coil, Cave Bear, Fumarole Ibex, Magma Salamander, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Phoenix Fledgling, Stalactite Pill Bug, Talus Pika, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | armor x7; ranged x6 | 64% (60%-69%) | 1.15 | 0: 4, 1: 9, 2: 7 | 4x Ashbone Ghoul, 4x Magma Wraith, 4x Stalactite Pill Bug, 3x Constrictor Coil, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |
| 2 | family:strike-first | strike-first x8; climb x7 | 58% (53%-63%) | 0.6 | 0: 8, 1: 12 | 4x Ashbone Ghoul, 4x Chamois Leaper, 4x Cinder Skeleton, 4x Cinder Stoker, 3x Fumarole Ibex, 1x Caldera Snow Leopard | 16 |
| 3 | big | big (8 copies at 2+ Lumber, average 0.9) | 56% (51%-61%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Cinder Stoker, 4x Phoenix Fledgling, 4x Stalactite Pill Bug, 3x Ashbone Ghoul, 3x Talus Pika, 2x Magma Salamander | 11 |
| 4 | family:flying | flying x8 | 48% (44%-53%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Chipmunk Hoarder, 4x Cinder Hornet, 4x Cinder Stoker, 4x Talus Pika, 3x Ash Cloud Condor, 1x Ossuary Lammergeier | 20 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 67% | 79% | 54% | 79% | 79% | 79% | 83% | 75% | 58% | 71% | 75% | 13% | 25% |
| 2 family:strike-first | 50% | 88% | 50% | 29% | 92% | 63% | 42% | 83% | 50% | 63% | 96% | 13% | 38% |
| 3 big | 29% | 71% | 54% | 42% | 79% | 58% | 63% | 63% | 42% | 79% | 92% | 13% | 42% |
| 4 family:flying | 50% | 54% | 50% | 33% | 92% | 29% | 13% | 25% | 25% | 67% | 96% | 25% | 71% |
