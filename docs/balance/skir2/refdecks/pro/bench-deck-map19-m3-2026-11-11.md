# Focused decks: Map 19 Ashen Spurn (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool alpine-marmot,alpine-salamander,alpine-swift,ashwing-ptarmigan,basalt-boar,cave-swiftlet,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,lantern-spark-fly,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,squires-mount,stalactite-golem,stonedrop-vulture,sulfur-cinder-moth,sulfur-vent-crab,talus-pika,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9126 games in 100 s.

- The list (29): Alpine Marmot, Alpine Salamander, Alpine Swift, Ashwing Ptarmigan, Basalt Boar, Cave Swiftlet, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Lantern Spark Fly, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Squire's Mount, Stalactite Pill Bug, Stonedrop Vulture, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x11 | 94% (91%-97%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Stonedrop Vulture, 4x Upside-Down Bat, 3x Ashwing Ptarmigan, 3x Ember Firefly, 2x Ibex Rockcaller | 19 |
| 2 | big | big (12 copies at 1+ Lumber, average 0.6) | 93% (90%-96%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Stoker, 4x Upside-Down Bat, 3x Obsidian Scorpion, 3x Quillguard, 3x Smokescreen Raccoon, 3x Squire's Mount | 17 |
| 3 | open | big (16 copies at 1+ Lumber, average 1.0) | 86% (81%-90%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Alpine Marmot, 4x Basalt Boar, 4x Cinder Hornet, 4x Fire Salamander, 3x Obsidian Scorpion, 1x Ibex Rockcaller | 0 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.7); armor x9 | 78% (72%-83%) | 0.7 | 0: 8, 1: 10, 2: 2 | 4x Cinder Stoker, 4x Stonedrop Vulture, 4x Sulfur Vent Crab, 3x Obsidian Scorpion, 3x Squire's Mount, 2x Stalactite Pill Bug | 17 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 96% | 100% | 100% | 96% | 88% | 100% | 92% | 88% |
| 2 big | 96% | 100% | 96% | 92% | 92% | 100% | 96% | 75% | 92% |
| 3 open | 100% | 79% | 96% | 100% | 88% | 79% | 100% | 63% | 67% |
| 4 family:armor | 79% | 83% | 92% | 92% | 83% | 67% | 88% | 58% | 58% |
