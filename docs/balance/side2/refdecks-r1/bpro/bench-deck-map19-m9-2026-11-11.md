# Focused decks: Map 19 Basalt Foundry (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool basalt-boar,cinder-gecko,cinder-hornet,cinder-skeleton,ember-revenant,fire-salamander,grindstone-boar,obsidian-scorpion,pumice-beetle,smoke-raccoon --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6994 games in 153 s.

- The list (10): Basalt Boar, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Ember Revenant, Fire Salamander, Grindstone Boar, Obsidian Scorpion, Pumice Beetle, Smokescreen Raccoon.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | big (16 copies at 1+ Lumber, average 0.8); evasion x8 | 81% (78%-85%) | 0.85 | 0: 4, 1: 15, 2: 1 | 4x Basalt Boar, 4x Cinder Gecko, 4x Fire Salamander, 4x Smokescreen Raccoon, 3x Obsidian Scorpion, 1x Ember Revenant | 11 |
| 2 | big | big (16 copies at 1+ Lumber, average 0.9); economy (4 resource makers) | 78% (74%-82%) | 0.9 | 0: 4, 1: 14, 2: 2 | 4x Basalt Boar, 4x Cinder Gecko, 4x Cinder Skeleton, 4x Pumice Beetle, 2x Cinder Hornet, 2x Obsidian Scorpion | 10 |
| 3 | open | big (20 copies at 1+ Lumber, average 1.2); economy (4 resource makers) | 54% (49%-59%) | 1.2 | 1: 16, 2: 4 | 4x Basalt Boar, 4x Fire Salamander, 4x Grindstone Boar, 4x Pumice Beetle, 2x Cinder Hornet, 2x Ember Revenant | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 100% | 96% | 88% | 92% | 92% | 96% | 83% | 92% | 83% | 79% | 88% | 42% | 29% |
| 2 big | 100% | 96% | 88% | 100% | 83% | 83% | 88% | 88% | 58% | 58% | 100% | 29% | 42% |
| 3 open | 92% | 88% | 54% | 79% | 38% | 58% | 71% | 63% | 29% | 46% | 67% | 8% | 13% |
