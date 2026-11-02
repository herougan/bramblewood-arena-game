# Focused decks: Map 19 Basalt Foundry (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvilwhisker-otter,ash-cloud-condor,ashbone-ghoul,cinder-gecko,cinder-stoker,ember-jackal,ember-revenant,fire-salamander,hercules-beetle,magma-salamander,ore-smelter-mole,phoenix-fledgling,quill-volley,tide-spirit,yeti-chieftain --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7124 games in 90 s.

- The list (15): Anvilwhisker Otter, Ash Cloud Condor, Ashbone Ghoul, Cinder Gecko, Cinder Stoker, Ember Jackal, Ember Revenant, Fire Salamander, Hercules Beetle, Magma Salamander, Ore-Smelter Mole, Phoenix Fledgling, Quill Volley, Tide Spirit, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (10 copies at 1+ Lumber, average 0.5); fire x7 | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Cinder Stoker, 4x Fire Salamander, 3x Cinder Gecko, 3x Ember Jackal, 3x Magma Salamander, 3x Tide Spirit | 6 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 87% (84%-91%) | 0.3 | 0: 14, 1: 6 | 4x Ashbone Ghoul, 4x Cinder Stoker, 3x Cinder Gecko, 3x Ember Jackal, 3x Hercules Beetle, 3x Tide Spirit | 7 |
| 3 | open | swarm (14 copies at 0 Lumber) | 84% (81%-88%) | 0.3 | 0: 14, 1: 6 | 4x Cinder Gecko, 4x Cinder Stoker, 4x Fire Salamander, 3x Ashbone Ghoul, 3x Tide Spirit, 2x Yeti Chieftain | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 83% | 92% | 92% | 71% | 88% | 96% | 83% | 79% | 92% | 100% | 75% | 88% |
| 2 swarm | 100% | 88% | 88% | 100% | 75% | 83% | 100% | 88% | 63% | 100% | 100% | 71% | 79% |
| 3 open | 100% | 83% | 88% | 92% | 54% | 92% | 83% | 83% | 54% | 96% | 100% | 79% | 92% |
