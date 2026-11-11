# Focused decks: Map 19 Ashen Spurn (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool ashwing-ptarmigan,basalt-boar,chipmunk-hoarder,cinder-hornet,cinder-stoker,eagle-owl-quartermaster,ember-wisp,fire-salamander,honey-badger-fury,obsidian-scorpion,quillback-elder,quillguard,smoke-raccoon,sulfur-cinder-moth,sulfur-vent-crab,talus-pika --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:flying,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2934 games in 371 s.

- The list (16): Ashwing Ptarmigan, Basalt Boar, Chipmunk Hoarder, Cinder Hornet, Cinder Stoker, Eagle-Owl Quartermaster, Ember Firefly, Fire Salamander, Honey Badger Fury, Obsidian Scorpion, Quillback Elder, Quillguard, Smokescreen Raccoon, Sulfur Cinder Moth, Sulfur Vent Crab, Talus Pika.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1+ Lumber, average 0.8) | 88% (85%-91%) | 0.8 | 0: 4, 1: 16 | 4x Cinder Stoker, 4x Honey Badger Fury, 3x Fire Salamander, 3x Obsidian Scorpion, 3x Quillguard, 3x Smokescreen Raccoon | 11 |
| 2 | family:flying | big (11 copies at 1+ Lumber, average 0.8); flying x11 | 83% (78%-87%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Sulfur Cinder Moth, 3x Ashwing Ptarmigan, 3x Ember Firefly, 2x Sulfur Vent Crab | 17 |
| 3 | family:armor | big (10 copies at 1+ Lumber, average 0.7); armor x11 | 77% (72%-82%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Quillback Elder, 4x Sulfur Vent Crab, 3x Ashwing Ptarmigan, 3x Chipmunk Hoarder, 3x Ember Firefly, 3x Obsidian Scorpion | 11 |
| 4 | open | big (16 copies at 1+ Lumber, average 0.8); flying x6 | 76% (72%-81%) | 0.8 | 0: 4, 1: 16 | 4x Chipmunk Hoarder, 4x Fire Salamander, 3x Ashwing Ptarmigan, 3x Eagle-Owl Quartermaster, 3x Obsidian Scorpion, 3x Smokescreen Raccoon | 0 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 100% | 100% | 100% | 100% | 92% | 100% | 29% | 75% |
| 2 family:flying | 71% | 92% | 83% | 96% | 100% | 92% | 92% | 50% | 71% |
| 3 family:armor | 79% | 71% | 83% | 100% | 100% | 83% | 96% | 29% | 50% |
| 4 open | 88% | 79% | 83% | 96% | 96% | 79% | 100% | 21% | 46% |
