# Focused decks: Map 19 Basalt Foundry (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool ash-moth,ashbone-ghoul,badger-berserker,basalt-boar,cinder-gecko,cinder-hornet,cinder-skeleton,eagle-owl-quartermaster,ember-centipede,ember-revenant,fire-salamander,grave-grin-hyena,grindstone-boar,magma-wraith,obsidian-lich,obsidian-scorpion,pumice-beetle,rimefire-salamander,smoke-raccoon,stoat-cutthroat,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:flying,big,open --anchor basalt-boar,cinder-gecko,cinder-hornet,cinder-skeleton,ember-revenant,fire-salamander,grindstone-boar,obsidian-scorpion,pumice-beetle,smoke-raccoon --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9620 games in 103 s.

- The list (22): Ash Moth, Ashbone Ghoul, Badger Berserker, Basalt Boar, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Eagle-Owl Quartermaster, Ember Centipede, Ember Revenant, Fire Salamander, Grave-Grin Hyena, Grindstone Boar, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Pumice Beetle, Rimefire Salamander, Smokescreen Raccoon, Stoat Cutthroat, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (13 copies at 1+ Lumber, average 0.7); strike-first x6 | 85% (82%-88%) | 0.65 | 0: 7, 1: 13 | 4x Fire Salamander, 4x Grave-Grin Hyena, 4x Smokescreen Raccoon, 3x Ember Centipede, 3x Stoat Cutthroat, 2x Cinder Skeleton | 0 |
| 2 | big | big (15 copies at 1+ Lumber, average 0.8); economy (4 resource makers) | 81% (77%-85%) | 0.75 | 0: 5, 1: 15 | 4x Ash Moth, 4x Fire Salamander, 4x Pumice Beetle, 3x Grave-Grin Hyena, 3x Obsidian Scorpion, 2x Tide Seahorse | 13 |
| 3 | family:evasion | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); evasion x8 | 79% (75%-83%) | 0.5 | 0: 10, 1: 10 | 4x Cinder Gecko, 4x Ember Centipede, 4x Pumice Beetle, 4x Smokescreen Raccoon, 2x Ashbone Ghoul, 2x Fire Salamander | 11 |
| 4 | family:flying | big (15 copies at 1+ Lumber, average 0.9); flying x8 | 76% (72%-80%) | 0.95 | 0: 5, 1: 11, 2: 4 | 4x Ash Moth, 4x Basalt Boar, 4x Cinder Hornet, 3x Fire Salamander, 3x Grave-Grin Hyena, 2x Cinder Gecko | 14 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 96% | 96% | 96% | 88% | 88% | 88% | 75% | 96% | 54% | 33% |
| 2 big | 100% | 100% | 96% | 100% | 83% | 100% | 79% | 71% | 92% | 63% | 96% | 38% | 38% |
| 3 family:evasion | 100% | 100% | 88% | 100% | 88% | 79% | 88% | 83% | 75% | 50% | 100% | 21% | 58% |
| 4 family:flying | 92% | 96% | 83% | 92% | 92% | 88% | 79% | 92% | 79% | 50% | 92% | 25% | 33% |
