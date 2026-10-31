# Focused decks: Map 19 Basalt Foundry (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvilwhisker-otter,ash-cloud-condor,ashbone-ghoul,cinder-gecko,ember-jackal,fire-salamander,hercules-beetle,magma-salamander,ore-smelter-mole,phoenix-fledgling,quill-volley,tide-spirit --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6604 games in 68 s.

- The list (12): Anvilwhisker Otter, Ash Cloud Condor, Ashbone Ghoul, Cinder Gecko, Ember Jackal, Fire Salamander, Hercules Beetle, Magma Salamander, Ore-Smelter Mole, Phoenix Fledgling, Quill Volley, Tide Spirit.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 85% (81%-88%) | 0.5 | 0: 10, 1: 10 | 4x Ashbone Ghoul, 4x Cinder Gecko, 4x Ore-Smelter Mole, 3x Ember Jackal, 3x Magma Salamander, 2x Tide Spirit | 0 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.5) | 85% (81%-88%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Cinder Gecko, 3x Hercules Beetle, 3x Magma Salamander, 3x Quill Volley, 3x Tide Spirit | 7 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 92% | 100% | 88% | 96% | 58% | 83% | 92% | 75% | 96% | 42% | 88% |
| 2 big | 100% | 100% | 92% | 100% | 79% | 100% | 71% | 75% | 96% | 71% | 88% | 54% | 75% |
