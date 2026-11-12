# Focused decks: Map 19 Basalt Foundry (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvil-thrush,cinder-gecko,cinder-hornet,fire-salamander,grindstone-boar,hellbender,obsidian-scorpion,ore-smelter-mole,pumice-beetle,smoke-raccoon,sulfur-vent-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7332 games in 92 s.

- The list (11): Anvil Thrush, Cinder Gecko, Cinder Hornet, Fire Salamander, Grindstone Boar, Hellbender, Obsidian Scorpion, Ore-Smelter Mole, Pumice Beetle, Smokescreen Raccoon, Sulfur Vent Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); armor x6 | 81% (77%-85%) | 0.5 | 0: 10, 1: 10 | 4x Fire Salamander, 4x Hellbender, 4x Pumice Beetle, 4x Sulfur Vent Crab, 2x Cinder Gecko, 2x Obsidian Scorpion | 12 |
| 2 | family:evasion | big (8 copies at 1+ Lumber, average 0.4); evasion x8 | 80% (76%-84%) | 0.4 | 0: 12, 1: 8 | 4x Anvil Thrush, 4x Cinder Gecko, 4x Hellbender, 4x Smokescreen Raccoon, 3x Obsidian Scorpion, 1x Ore-Smelter Mole | 11 |
| 3 | economy | big (12 copies at 1+ Lumber, average 0.8); economy (8 resource makers) | 77% (72%-81%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Ore-Smelter Mole, 4x Pumice Beetle, 4x Sulfur Vent Crab | 10 |
| 4 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); evasion x6 | 54% (49%-59%) | 0.6 | 0: 8, 1: 12 | 4x Grindstone Boar, 4x Ore-Smelter Mole, 4x Smokescreen Raccoon, 4x Sulfur Vent Crab, 2x Cinder Gecko, 2x Hellbender | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 92% | 96% | 96% | 71% | 92% | 83% | 88% | 67% | 79% | 92% | 38% | 58% |
| 2 family:evasion | 100% | 96% | 83% | 96% | 83% | 96% | 71% | 88% | 71% | 71% | 96% | 50% | 38% |
| 3 economy | 100% | 83% | 83% | 88% | 71% | 79% | 88% | 79% | 46% | 75% | 96% | 46% | 63% |
| 4 open | 88% | 79% | 50% | 79% | 29% | 33% | 75% | 75% | 13% | 58% | 75% | 17% | 29% |
