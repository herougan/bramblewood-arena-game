# Focused decks: Map 19 Basalt Foundry (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,ash-moth,ashbone-ghoul,badger-berserker,cinder-gecko,cinder-hornet,cinder-skeleton,eagle-owl-quartermaster,ember-centipede,fire-salamander,grave-grin-hyena,grindstone-boar,hellbender,magma-wraith,obsidian-scorpion,ore-smelter-mole,pumice-beetle,rimefire-salamander,smoke-raccoon,stoat-cutthroat,sulfur-vent-crab,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:evasion,open --anchor anvil-thrush,cinder-gecko,cinder-hornet,fire-salamander,grindstone-boar,hellbender,obsidian-scorpion,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9620 games in 112 s.

- The list (23): Anvil Thrush, Ash Moth, Ashbone Ghoul, Badger Berserker, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Eagle-Owl Quartermaster, Ember Centipede, Fire Salamander, Grave-Grin Hyena, Grindstone Boar, Hellbender, Magma Wraith, Obsidian Scorpion, Ore-Smelter Mole, Pumice Beetle, Rimefire Salamander, Smokescreen Raccoon, Stoat Cutthroat, Sulfur Vent Crab, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (18 copies at 1+ Lumber, average 0.9); economy (8 resource makers) | 83% (80%-87%) | 0.9 | 0: 2, 1: 18 | 4x Fire Salamander, 4x Ore-Smelter Mole, 4x Pumice Beetle, 3x Ash Moth, 3x Badger Berserker, 2x Tide Seahorse | 14 |
| 2 | family:evasion | big (13 copies at 1+ Lumber, average 0.7); evasion x8; armor x6 | 83% (79%-86%) | 0.65 | 0: 7, 1: 13 | 4x Grave-Grin Hyena, 4x Magma Wraith, 4x Smokescreen Raccoon, 3x Obsidian Scorpion, 3x Sulfur Vent Crab, 2x Stoat Cutthroat | 11 |
| 3 | open | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers); evasion x7 | 79% (75%-83%) | 0.7 | 0: 6, 1: 14 | 4x Anvil Thrush, 4x Ore-Smelter Mole, 4x Smokescreen Raccoon, 3x Magma Wraith, 3x Stoat Cutthroat, 2x Tide Seahorse | 0 |
| 4 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x8 | 78% (74%-82%) | 0.4 | 0: 12, 1: 8 | 4x Anvil Thrush, 4x Ash Moth, 4x Cinder Gecko, 4x Sulfur Vent Crab, 3x Badger Berserker, 1x Obsidian Scorpion | 16 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 96% | 92% | 100% | 75% | 88% | 96% | 92% | 83% | 75% | 88% | 54% | 50% |
| 2 family:evasion | 100% | 100% | 88% | 100% | 96% | 100% | 83% | 83% | 75% | 54% | 100% | 46% | 50% |
| 3 open | 96% | 96% | 83% | 96% | 71% | 75% | 92% | 79% | 83% | 75% | 92% | 46% | 42% |
| 4 family:flying | 92% | 96% | 92% | 92% | 75% | 88% | 75% | 92% | 67% | 71% | 96% | 29% | 54% |
