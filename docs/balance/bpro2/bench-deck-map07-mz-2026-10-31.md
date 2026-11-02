# Focused decks: Map 7 The Mycelium Deep (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6976 games in 102 s.

- The list (13): Ant Warrior, Bombardier Beetle, Dung Beetle, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6); economy (5 resource makers) | 81% (76%-86%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Dung Beetle, 1x Leafcutter Gardener | 10 |
| 2 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (7 resource makers) | 80% (75%-85%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 3x Truffle Piglet, 1x Wolf Spider Mother | 8 |
| 3 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers) | 78% (72%-83%) | 0.25 | 0: 15, 1: 5 | 4x Ant Warrior, 4x Dung Beetle, 4x Leafcutter Gardener, 3x Bombardier Beetle, 3x Sleepless Shrew, 2x Hawthorn Shieldbug | 14 |
| 4 | open | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers); swarm x7 | 74% (69%-80%) | 0.8 | 0: 4, 1: 16 | 4x Ant Warrior, 4x Hawthorn Shieldbug, 4x Truffle Piglet, 3x Rootworm Colony, 3x Wolf Spider Mother, 2x Owl Nightwatch | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 79% | 58% | 58% | 75% | 96% | 83% | 100% |
| 2 economy | 100% | 79% | 38% | 58% | 75% | 100% | 88% | 100% |
| 3 swarm | 100% | 79% | 54% | 63% | 54% | 96% | 75% | 100% |
| 4 open | 96% | 83% | 38% | 63% | 63% | 83% | 71% | 100% |
