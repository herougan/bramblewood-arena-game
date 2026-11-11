# Focused decks: Map 19 Basalt Foundry (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,ash-moth,ashbone-ghoul,ashwing-ptarmigan,badger-berserker,chained-binturong,cinder-gecko,cinder-hornet,eagle-owl-quartermaster,ember-centipede,ember-revenant,ember-tetra,fire-salamander,grave-grin-hyena,grindstone-boar,hellbender,magma-wraith,malachite-golem,obsidian-lich,ore-smelter-mole,pumice-beetle,rimefire-salamander,smoke-raccoon,sulfur-vent-crab,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:armor,open --anchor anvil-thrush,chained-binturong,cinder-gecko,cinder-hornet,ember-revenant,ember-tetra,fire-salamander,grindstone-boar,hellbender,malachite-golem,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9178 games in 100 s.

- The list (26): Anvil Thrush, Ash Moth, Ashbone Ghoul, Ashwing Ptarmigan, Badger Berserker, Chained Binturong, Cinder Gecko, Cinder Hornet, Eagle-Owl Quartermaster, Ember Centipede, Ember Revenant, Ember Tetra, Fire Salamander, Grave-Grin Hyena, Grindstone Boar, Hellbender, Magma Wraith, Malachite Golem, Obsidian Lich, Ore-Smelter Mole, Pumice Beetle, Rimefire Salamander, Smokescreen Raccoon, Sulfur Vent Crab, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 85% (82%-88%) | 0.55 | 0: 9, 1: 11 | 4x Ashbone Ghoul, 4x Ore-Smelter Mole, 4x Pumice Beetle, 3x Badger Berserker, 3x Grave-Grin Hyena, 2x Hellbender | 13 |
| 2 | open | big (13 copies at 1+ Lumber, average 0.8); economy (4 resource makers) | 83% (79%-87%) | 0.8 | 0: 7, 1: 10, 2: 3 | 4x Cinder Gecko, 4x Ore-Smelter Mole, 3x Ashbone Ghoul, 3x Cinder Hornet, 3x Obsidian Lich, 3x Rimefire Salamander | 0 |
| 3 | family:flying | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x8 | 75% (71%-79%) | 0.55 | 0: 9, 1: 11 | 4x Anvil Thrush, 4x Ash Moth, 4x Pumice Beetle, 3x Ashbone Ghoul, 3x Fire Salamander, 2x Grave-Grin Hyena | 17 |
| 4 | family:armor | big (13 copies at 1+ Lumber, average 0.8); armor x10 | 63% (58%-68%) | 0.8 | 0: 7, 1: 10, 2: 3 | 4x Chained Binturong, 4x Sulfur Vent Crab, 3x Badger Berserker, 3x Cinder Gecko, 3x Malachite Golem, 3x Obsidian Lich | 14 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 92% | 100% | 92% | 96% | 88% | 88% | 79% | 88% | 96% | 42% | 46% |
| 2 open | 100% | 100% | 96% | 96% | 96% | 96% | 71% | 88% | 83% | 79% | 88% | 42% | 46% |
| 3 family:flying | 100% | 100% | 96% | 100% | 100% | 75% | 67% | 83% | 79% | 46% | 96% | 8% | 25% |
| 4 family:armor | 92% | 92% | 88% | 88% | 71% | 71% | 67% | 67% | 50% | 33% | 54% | 17% | 33% |
