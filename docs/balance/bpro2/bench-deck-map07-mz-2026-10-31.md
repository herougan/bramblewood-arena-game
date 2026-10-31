# Focused decks: Map 7 The Mycelium Deep (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,compost-grub,dung-beetle,fungal-colossus,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 86 s.

- The list (13): Ant Warrior, Bombardier Beetle, Compost Grub, Dung Beetle, Fungal Colossus, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (14 copies at 1+ Lumber, average 0.7); economy (8 resource makers) | 82% (77%-87%) | 0.7 | 0: 6, 1: 14 | 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Bombardier Beetle, 3x Wolf Spider Mother, 2x Dung Beetle | 10 |
| 2 | big | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); swarm x7 | 81% (76%-86%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Dung Beetle, 4x Truffle Piglet, 3x Bombardier Beetle, 3x Wolf Spider Mother, 2x Owl Nightwatch | 11 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 77% (71%-82%) | 0.3 | 0: 14, 1: 6 | 4x Compost Grub, 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Sleepless Shrew, 2x Ant Warrior, 2x Wolf Spider Mother | 8 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); swarm x6 | 76% (70%-81%) | 0.45 | 0: 11, 1: 9 | 4x Bombardier Beetle, 4x Compost Grub, 4x Leafcutter Gardener, 3x Ant Warrior, 3x Wolf Spider Mother, 2x Hawthorn Shieldbug | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 88% | 58% | 75% | 71% | 92% | 75% | 100% |
| 2 big | 100% | 83% | 58% | 42% | 83% | 96% | 83% | 100% |
| 3 swarm | 100% | 96% | 54% | 50% | 63% | 96% | 54% | 100% |
| 4 open | 100% | 79% | 38% | 38% | 67% | 96% | 92% | 96% |
