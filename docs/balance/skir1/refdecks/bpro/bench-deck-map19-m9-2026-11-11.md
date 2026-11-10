# Focused decks: Map 19 Basalt Foundry (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,chained-binturong,cinder-gecko,cinder-hornet,ember-revenant,ember-tetra,fire-salamander,grindstone-boar,hellbender,malachite-golem,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3024 games in 511 s.

- The list (14): Anvil Thrush, Chained Binturong, Cinder Gecko, Cinder Hornet, Ember Revenant, Ember Tetra, Fire Salamander, Grindstone Boar, Hellbender, Malachite Golem, Ore-Smelter Mole, Pumice Beetle, Smokescreen Raccoon, Sulfur Vent Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 70% (65%-74%) | 0.4 | 0: 12, 1: 8 | 4x Cinder Gecko, 4x Hellbender, 4x Ore-Smelter Mole, 4x Pumice Beetle, 4x Sulfur Vent Crab | 12 |
| 2 | open | big (12 copies at 1+ Lumber, average 0.8); evasion x8 | 69% (65%-74%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Fire Salamander, 4x Hellbender, 4x Smokescreen Raccoon | 0 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 53% (48%-58%) | 0.7 | 0: 11, 1: 4, 2: 5 | 4x Cinder Gecko, 4x Ember Tetra, 4x Ore-Smelter Mole, 3x Anvil Thrush, 3x Malachite Golem, 2x Ember Revenant | 16 |
| 4 | swarm | swarm (16 copies at 0 Lumber); tide x8; cleave x6 | 42% (38%-47%) | 0.3 | 0: 16, 1: 2, 2: 2 | 4x Anvil Thrush, 4x Ember Tetra, 4x Hellbender, 4x Sulfur Vent Crab, 2x Ember Revenant, 2x Smokescreen Raccoon | 14 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 92% | 71% | 92% | 88% | 33% | 42% | 96% | 25% | 100% | 50% | 54% |
| 2 open | 92% | 88% | 75% | 88% | 88% | 42% | 50% | 92% | 42% | 100% | 25% | 50% |
| 3 big | 79% | 63% | 67% | 92% | 71% | 25% | 8% | 79% | 33% | 88% | 13% | 21% |
| 4 swarm | 75% | 46% | 38% | 79% | 67% | 4% | 4% | 58% | 8% | 92% | 13% | 21% |
