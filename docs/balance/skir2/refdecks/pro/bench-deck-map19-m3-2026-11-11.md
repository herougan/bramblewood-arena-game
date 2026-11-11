# Focused decks: Map 19 Ashen Spurn (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool alpine-marmot,alpine-salamander,alpine-swift,ashwing-ptarmigan,basalt-boar,cave-swiftlet,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,lantern-spark-fly,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,squires-mount,stalactite-golem,stonedrop-vulture,sulfur-cinder-moth,sulfur-vent-crab,talus-pika,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9252 games in 97 s.

- The list (29): Alpine Marmot, Alpine Salamander, Alpine Swift, Ashwing Ptarmigan, Basalt Boar, Cave Swiftlet, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Lantern Spark Fly, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Squire's Mount, Stalactite Pill Bug, Stonedrop Vulture, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (13 copies at 1+ Lumber, average 0.7) | 90% (86%-93%) | 0.65 | 0: 7, 1: 13 | 4x Alpine Salamander, 4x Chipmunk Hoarder, 4x Fire Salamander, 3x Alpine Marmot, 3x Ashwing Ptarmigan, 2x Ibex Rockcaller | 15 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.6); flying x7 | 85% (81%-90%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Alpine Marmot, 4x Cave Swiftlet, 4x Cinder Stoker, 3x Eagle-Owl Quartermaster, 3x Quillback Elder, 2x Ibex Rockcaller | 0 |
| 3 | family:armor | big (8 copies at 1+ Lumber, average 0.5); armor x8; flying x8 | 85% (80%-89%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Cinder Stoker, 4x Stonedrop Vulture, 4x Sulfur Vent Crab, 4x Upside-Down Bat, 3x Obsidian Scorpion, 1x Stalactite Pill Bug | 16 |
| 4 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x11 | 83% (79%-88%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Alpine Swift, 4x Cinder Stoker, 4x Sulfur Cinder Moth, 3x Ashwing Ptarmigan, 1x Smokescreen Raccoon | 12 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 96% | 96% | 96% | 92% | 100% | 50% | 79% |
| 2 open | 96% | 100% | 88% | 79% | 83% | 83% | 96% | 50% | 92% |
| 3 family:armor | 92% | 92% | 83% | 88% | 92% | 79% | 100% | 63% | 75% |
| 4 family:flying | 92% | 79% | 100% | 79% | 83% | 83% | 100% | 54% | 79% |
