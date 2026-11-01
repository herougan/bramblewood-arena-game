# Focused decks: Map 19 Basalt Foundry (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvilwhisker-otter,ash-cloud-condor,ashbone-ghoul,cinder-gecko,cinder-stoker,ember-jackal,ember-revenant,fire-salamander,hercules-beetle,magma-salamander,ore-smelter-mole,phoenix-fledgling,quill-volley,tide-spirit,yeti-chieftain --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6786 games in 103 s.

- The list (15): Anvilwhisker Otter, Ash Cloud Condor, Ashbone Ghoul, Cinder Gecko, Cinder Stoker, Ember Jackal, Ember Revenant, Fire Salamander, Hercules Beetle, Magma Salamander, Ore-Smelter Mole, Phoenix Fledgling, Quill Volley, Tide Spirit, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber) | 88% (85%-92%) | 0.25 | 0: 15, 1: 5 | 4x Ashbone Ghoul, 4x Cinder Gecko, 4x Cinder Stoker, 3x Ember Jackal, 3x Tide Spirit, 2x Magma Salamander | 6 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 79% (75%-83%) | 0.5 | 0: 10, 1: 10 | 4x Cinder Stoker, 4x Ore-Smelter Mole, 3x Cinder Gecko, 3x Ember Jackal, 3x Quill Volley, 3x Tide Spirit | 7 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.7) | 77% (72%-81%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Anvilwhisker Otter, 4x Cinder Gecko, 4x Cinder Stoker, 3x Ember Jackal, 3x Tide Spirit, 2x Hercules Beetle | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 83% | 92% | 100% | 67% | 100% | 100% | 92% | 75% | 92% | 92% | 67% | 92% |
| 2 big | 100% | 58% | 92% | 92% | 63% | 92% | 83% | 79% | 50% | 79% | 96% | 63% | 83% |
| 3 open | 92% | 63% | 100% | 96% | 46% | 71% | 88% | 83% | 50% | 83% | 96% | 54% | 75% |
