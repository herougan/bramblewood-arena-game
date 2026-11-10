# Focused decks: Map 19 Basalt Foundry (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,ash-moth,ashbone-ghoul,ashwing-ptarmigan,badger-berserker,chained-binturong,cinder-gecko,cinder-hornet,eagle-owl-quartermaster,ember-centipede,ember-revenant,ember-tetra,fire-salamander,grave-grin-hyena,grindstone-boar,hellbender,magma-wraith,malachite-golem,obsidian-lich,ore-smelter-mole,pumice-beetle,rimefire-salamander,smoke-raccoon,sulfur-vent-crab,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:armor,open --anchor anvil-thrush,chained-binturong,cinder-gecko,cinder-hornet,ember-revenant,ember-tetra,fire-salamander,grindstone-boar,hellbender,malachite-golem,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2592 games in 234 s.

- The list (26): Anvil Thrush, Ash Moth, Ashbone Ghoul, Ashwing Ptarmigan, Badger Berserker, Chained Binturong, Cinder Gecko, Cinder Hornet, Eagle-Owl Quartermaster, Ember Centipede, Ember Revenant, Ember Tetra, Fire Salamander, Grave-Grin Hyena, Grindstone Boar, Hellbender, Magma Wraith, Malachite Golem, Obsidian Lich, Ore-Smelter Mole, Pumice Beetle, Rimefire Salamander, Smokescreen Raccoon, Sulfur Vent Crab, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (14 copies at 0 Lumber); flying x8 | 75% (71%-79%) | 0.3 | 0: 14, 1: 6 | 4x Anvil Thrush, 4x Ash Moth, 4x Cinder Gecko, 4x Hellbender, 2x Rimefire Salamander, 2x Tide Seahorse | 14 |
| 2 | open | evasion x8; tide x6 | 70% (66%-74%) | 0.35 | 0: 13, 1: 7 | 4x Cinder Gecko, 4x Ember Tetra, 4x Smokescreen Raccoon, 3x Ashwing Ptarmigan, 3x Grave-Grin Hyena, 2x Tide Seahorse | 0 |
| 3 | economy | big (16 copies at 1+ Lumber, average 1.0); economy (8 resource makers) | 60% (56%-65%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Ashbone Ghoul, 4x Cinder Hornet, 4x Ore-Smelter Mole, 4x Pumice Beetle, 3x Wolf Spider Mother, 1x Magma Wraith | 20 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.8); armor x10 | 60% (55%-65%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Cinder Gecko, 4x Sulfur Vent Crab, 3x Badger Berserker, 3x Chained Binturong, 3x Malachite Golem, 3x Obsidian Lich | 16 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 100% | 96% | 96% | 54% | 46% | 92% | 54% | 96% | 38% | 38% |
| 2 open | 100% | 96% | 79% | 100% | 83% | 29% | 54% | 100% | 54% | 92% | 25% | 29% |
| 3 economy | 96% | 96% | 79% | 88% | 83% | 21% | 17% | 83% | 25% | 88% | 29% | 21% |
| 4 family:armor | 92% | 75% | 71% | 75% | 71% | 33% | 38% | 79% | 13% | 75% | 50% | 46% |
