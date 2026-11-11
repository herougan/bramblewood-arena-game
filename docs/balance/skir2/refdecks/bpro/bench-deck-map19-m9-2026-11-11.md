# Focused decks: Map 19 Basalt Foundry (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,chained-binturong,cinder-gecko,cinder-hornet,ember-revenant,ember-tetra,fire-salamander,grindstone-boar,hellbender,malachite-golem,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7358 games in 72 s.

- The list (14): Anvil Thrush, Chained Binturong, Cinder Gecko, Cinder Hornet, Ember Revenant, Ember Tetra, Fire Salamander, Grindstone Boar, Hellbender, Malachite Golem, Ore-Smelter Mole, Pumice Beetle, Smokescreen Raccoon, Sulfur Vent Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 81% (77%-85%) | 0.4 | 0: 12, 1: 8 | 4x Cinder Gecko, 4x Hellbender, 4x Ore-Smelter Mole, 4x Pumice Beetle, 4x Sulfur Vent Crab | 10 |
| 2 | big | big (15 copies at 1+ Lumber, average 0.9); economy (4 resource makers); evasion x8 | 77% (73%-81%) | 0.95 | 0: 5, 1: 11, 2: 4 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Pumice Beetle, 4x Smokescreen Raccoon, 3x Fire Salamander, 1x Sulfur Vent Crab | 10 |
| 3 | swarm | swarm (14 copies at 0 Lumber); tide x7 | 72% (68%-76%) | 0.3 | 0: 14, 1: 6 | 4x Anvil Thrush, 4x Ember Tetra, 4x Smokescreen Raccoon, 3x Hellbender, 3x Sulfur Vent Crab, 2x Ore-Smelter Mole | 13 |
| 4 | open | big (12 copies at 1+ Lumber, average 0.8); economy (4 resource makers); flying x6 | 71% (67%-76%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cinder Hornet, 4x Fire Salamander, 4x Ore-Smelter Mole, 4x Sulfur Vent Crab, 2x Anvil Thrush, 2x Cinder Gecko | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 100% | 79% | 88% | 83% | 96% | 79% | 96% | 79% | 58% | 96% | 50% | 54% |
| 2 big | 100% | 100% | 88% | 96% | 88% | 75% | 88% | 83% | 79% | 67% | 92% | 13% | 38% |
| 3 swarm | 100% | 100% | 96% | 79% | 79% | 75% | 71% | 67% | 54% | 63% | 96% | 13% | 46% |
| 4 open | 92% | 96% | 75% | 83% | 71% | 79% | 79% | 67% | 79% | 42% | 88% | 25% | 54% |
