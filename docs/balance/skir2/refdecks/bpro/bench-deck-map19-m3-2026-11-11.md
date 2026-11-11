# Focused decks: Map 19 Ashen Spurn (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 77 s.

- The list (17): Ashwing Ptarmigan, Basalt Boar, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Honey Badger Fury, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Stalactite Pill Bug, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (14 copies at 1+ Lumber, average 0.7); fire x6 | 91% (87%-94%) | 0.7 | 0: 6, 1: 14 | 4x Basalt Boar, 4x Cinder Stoker, 4x Fire Salamander, 3x Ashwing Ptarmigan, 3x Quillguard, 2x Ember Firefly | 10 |
| 2 | family:flying | big (10 copies at 1+ Lumber, average 0.7); flying x10 | 81% (77%-86%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Talus Pika, 3x Ashwing Ptarmigan, 3x Eagle-Owl Quartermaster, 2x Chipmunk Hoarder | 13 |
| 3 | open | big (13 copies at 1+ Lumber, average 0.7) | 79% (75%-84%) | 0.65 | 0: 7, 1: 13 | 4x Basalt Boar, 4x Talus Pika, 3x Cinder Stoker, 3x Quillguard, 3x Smokescreen Raccoon, 3x Sulfur Cinder Moth | 0 |
| 4 | family:armor | big (14 copies at 1+ Lumber, average 0.9); armor x10 | 78% (73%-82%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Quillback Elder, 4x Sulfur Cinder Moth, 3x Basalt Boar, 3x Cinder Stoker, 3x Obsidian Scorpion, 3x Sulfur Vent Crab | 11 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 100% | 96% | 100% | 92% | 96% | 48% | 83% |
| 2 family:flying | 96% | 63% | 88% | 96% | 83% | 71% | 96% | 54% | 88% |
| 3 open | 88% | 92% | 88% | 100% | 79% | 83% | 100% | 21% | 63% |
| 4 family:armor | 96% | 83% | 92% | 88% | 92% | 71% | 92% | 21% | 67% |
