# Focused decks: Map 19 Ashen Spurn (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6894 games in 64 s.

- The list (17): Ashwing Ptarmigan, Basalt Boar, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Honey Badger Fury, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Stalactite Pill Bug, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (14 copies at 1+ Lumber, average 0.7); flying x10 | 84% (80%-89%) | 0.7 | 0: 6, 1: 14 | 4x Fire Salamander, 4x Sulfur Cinder Moth, 3x Ashwing Ptarmigan, 3x Cinder Stoker, 3x Eagle-Owl Quartermaster, 3x Talus Pika | 17 |
| 2 | open | big (10 copies at 1+ Lumber, average 0.7) | 82% (77%-87%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Chipmunk Hoarder, 4x Cinder Hornet, 3x Cinder Stoker, 3x Ember Firefly, 3x Obsidian Scorpion, 3x Quillguard | 0 |
| 3 | big | big (20 copies at 1+ Lumber, average 1.1); flying x9 | 80% (76%-85%) | 1.15 | 1: 17, 2: 3 | 4x Basalt Boar, 4x Fire Salamander, 3x Ashwing Ptarmigan, 3x Cinder Hornet, 3x Obsidian Scorpion, 3x Sulfur Cinder Moth | 14 |
| 4 | family:armor | big (14 copies at 1+ Lumber, average 0.9); armor x10 | 78% (74%-83%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Quillback Elder, 4x Sulfur Cinder Moth, 3x Basalt Boar, 3x Cinder Stoker, 3x Obsidian Scorpion, 3x Sulfur Vent Crab | 14 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 83% | 92% | 83% | 92% | 79% | 96% | 67% | 71% |
| 2 open | 96% | 92% | 92% | 88% | 88% | 71% | 96% | 46% | 71% |
| 3 big | 92% | 83% | 96% | 100% | 83% | 71% | 100% | 33% | 63% |
| 4 family:armor | 96% | 83% | 92% | 92% | 92% | 71% | 92% | 21% | 67% |
