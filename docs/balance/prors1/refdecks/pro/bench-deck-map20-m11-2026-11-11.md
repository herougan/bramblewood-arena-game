# Focused decks: Map 20 The Sundered Peak (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-snow-leopard,chamois-leaper,chipmunk-hoarder,cinder-hornet,cinder-skeleton,cinder-stoker,constrictor-coil,deep-cave-troll,eagle-owl-quartermaster,ember-centipede,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,magma-salamander,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,phoenix-fledgling,stalactite-golem,stonedrop-vulture,talus-pika,tide-spirit,upside-down-bat,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:ranged,big,open --anchor ancient-sloth-titan,ash-cloud-condor,ashbone-ghoul,caldera-snow-leopard,chamois-leaper,chipmunk-hoarder,cinder-hornet,cinder-skeleton,cinder-stoker,constrictor-coil,deep-cave-troll,fumarole-ibex,magma-salamander,magma-wraith,obsidian-scorpion,ossuary-lammergeier,phoenix-fledgling,stalactite-golem,talus-pika,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9594 games in 201 s.

- The list (32): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Caldera Snow Leopard, Chamois Leaper, Chipmunk Hoarder, Cinder Hornet, Cinder Skeleton, Cinder Stoker, Constrictor Coil, Cave Bear, Eagle-Owl Quartermaster, Ember Centipede, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Magma Salamander, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Ossuary Lammergeier, Pall Wraith, Phoenix Fledgling, Stalactite Pill Bug, Stonedrop Vulture, Talus Pika, Tide Seahorse, Upside-Down Bat, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x11 | 83% (79%-87%) | 0.8 | 0: 4, 1: 16 | 4x Chamois Leaper, 4x Stonedrop Vulture, 4x Upside-Down Bat, 3x Ash Cloud Condor, 3x Obsidian Scorpion, 2x Ibex Rockcaller | 16 |
| 2 | family:ranged | ranged x8; flying x6 | 78% (74%-82%) | 0.4 | 0: 12, 1: 8 | 4x Ashbone Ghoul, 4x Chipmunk Hoarder, 4x Cinder Stoker, 4x Stonedrop Vulture, 2x Eagle-Owl Quartermaster, 2x Magma Salamander | 12 |
| 3 | open | midrange (average 1.1 Lumber) | 66% (61%-71%) | 1.05 | 0: 6, 1: 7, 2: 7 | 4x Ashbone Ghoul, 4x Constrictor Coil, 4x Stonedrop Vulture, 3x Fumarole Ibex, 3x Stalactite Pill Bug, 2x Tide Seahorse | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 65% (61%-69%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Chipmunk Hoarder, 4x Fire Salamander, 4x Stalactite Pill Bug, 4x Vampire Roost, 2x Cinder Skeleton, 2x Ibex Rockcaller | 17 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 92% | 88% | 83% | 92% | 79% | 75% | 75% | 79% | 100% | 46% | 71% |
| 2 family:ranged | 100% | 88% | 79% | 67% | 88% | 92% | 58% | 67% | 88% | 79% | 96% | 33% | 83% |
| 3 open | 83% | 88% | 71% | 54% | 79% | 96% | 67% | 75% | 67% | 50% | 75% | 25% | 29% |
| 4 big | 88% | 96% | 83% | 67% | 71% | 71% | 54% | 75% | 46% | 88% | 83% | 8% | 17% |
