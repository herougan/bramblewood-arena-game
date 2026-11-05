# Focused decks: Map 20 The Sundered Peak (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool alpine-marmot,alpine-swift,ancient-sloth-titan,apollo-butterfly,ash-cloud-condor,ashbone-ghoul,beaver-lumberjack,cave-warlord,chamois-leaper,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,eyrie-warden,fumarole-ibex,granite-ox-golem,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,pumice-beetle,stalactite-golem,talus-pika,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:flying,family:fire,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7254 games in 174 s.

- The list (26): Alpine Marmot, Alpine Swift, Ancient Sloth Titan, Apollo Butterfly, Ash Cloud Condor, Ashbone Ghoul, Beaver Lumberjack, Cave Warlord, Chamois Leaper, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Eyrie Warden, Fumarole Ibex, Granite Ox Golem, Magma Salamander, Magma Rhino, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Pumice Beetle, Stalactite Pill Bug, Talus Pika, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers) | 75% (71%-79%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Pack Mule, 4x Pumice Beetle, 3x Obsidian Scorpion, 3x Talus Pika, 2x Magma Salamander | 12 |
| 2 | family:flying | flying x8; armor x6 | 67% (62%-71%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Alpine Swift, 4x Apollo Butterfly, 4x Magma Wraith, 3x Obsidian Scorpion, 3x Stalactite Pill Bug, 2x Alpine Marmot | 11 |
| 3 | open | swarm (17 copies at 0 Lumber) | 58% (54%-63%) | 0.15 | 0: 17, 1: 3 | 4x Alpine Marmot, 4x Apollo Butterfly, 4x Beaver Lumberjack, 4x Cinder Stoker, 3x Obsidian Scorpion, 1x Pack Mule | 0 |
| 4 | family:fire | big (6 copies at 3+ Lumber, average 1.3); fire x10; ranged x6 | 58% (53%-63%) | 1.3 | 0: 8, 1: 6, 3: 4, 4: 2 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Magma Rhino, 4x Magma Wraith, 2x Cave Warlord, 2x Magma Salamander | 16 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 67% | 92% | 88% | 63% | 96% | 79% | 46% | 75% | 83% | 63% | 100% | 42% | 83% |
| 2 family:flying | 75% | 88% | 58% | 75% | 88% | 83% | 46% | 46% | 71% | 48% | 100% | 25% | 63% |
| 3 open | 50% | 88% | 58% | 50% | 94% | 67% | 25% | 42% | 58% | 29% | 100% | 33% | 67% |
| 4 family:fire | 50% | 63% | 54% | 50% | 92% | 75% | 33% | 67% | 56% | 58% | 88% | 4% | 63% |
