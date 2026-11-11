# Focused decks: Map 19 Ashen Spurn (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,lantern-spark-fly,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,squires-mount,stonedrop-vulture,sulfur-cinder-moth,sulfur-vent-crab,talus-pika,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2088 games in 252 s.

- The list (28): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Ashwing Ptarmigan, Basalt Boar, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Lantern Spark Fly, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Squire's Mount, Stonedrop Vulture, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5); flying x10 | 85% (81%-90%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Lantern Spark Fly, 3x Alpine Marmot, 3x Ashwing Ptarmigan, 3x Basalt Boar, 3x Stonedrop Vulture | 14 |
| 2 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 85% (80%-89%) | 0.2 | 0: 16, 1: 4 | 4x Cinder Stoker, 4x Stonedrop Vulture, 4x Upside-Down Bat, 3x Ember Firefly, 3x Talus Pika, 2x Tide Seahorse | 15 |
| 3 | open | big (11 copies at 1+ Lumber, average 0.8) | 76% (71%-81%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Alpine Marmot, 4x Basalt Boar, 4x Quillback Elder, 3x Alpine Salamander, 3x Ember Firefly, 2x Tide Seahorse | 0 |
| 4 | family:armor | big (13 copies at 1+ Lumber, average 0.8); armor x10 | 71% (65%-76%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Grave-Grin Hyena, 4x Quillback Elder, 4x Stonedrop Vulture, 3x Obsidian Scorpion, 3x Sulfur Vent Crab, 2x Smokescreen Raccoon | 16 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 75% | 96% | 83% | 63% | 92% | 100% | 83% | 79% |
| 2 family:flying | 96% | 83% | 92% | 79% | 83% | 83% | 100% | 58% | 88% |
| 3 open | 96% | 79% | 100% | 75% | 63% | 83% | 96% | 25% | 67% |
| 4 family:armor | 96% | 46% | 92% | 83% | 46% | 71% | 96% | 46% | 63% |
