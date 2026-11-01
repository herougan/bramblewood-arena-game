# Focused decks: Map 7 The Mycelium Deep (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,compost-grub,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7168 games in 79 s.

- The list (14): Ant Warrior, Bombardier Beetle, Compost Grub, Dung Beetle, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (7 resource makers); swarm x7 | 84% (79%-89%) | 0.55 | 0: 9, 1: 11 | 4x Ant Warrior, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Leafcutter Gardener, 3x Wolf Spider Mother, 2x Compost Grub | 8 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 80% (75%-85%) | 0.4 | 0: 12, 1: 8 | 4x Ant Warrior, 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Sleepless Shrew, 3x Hawthorn Shieldbug, 1x Wolf Spider Mother | 0 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 79% (75%-84%) | 0.3 | 0: 14, 1: 6 | 4x Ant Warrior, 4x Compost Grub, 4x Leafcutter Gardener, 3x Bombardier Beetle, 3x Owl Nightwatch, 2x Sleepless Shrew | 7 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4) | 75% (69%-81%) | 0.4 | 0: 12, 1: 8 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Dung Beetle, 4x Garden Snail, 4x Owl Nightwatch | 12 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 71% | 67% | 83% | 79% | 71% | 100% |
| 2 open | 96% | 92% | 46% | 50% | 75% | 96% | 83% | 100% |
| 3 swarm | 100% | 88% | 29% | 63% | 63% | 100% | 92% | 100% |
| 4 big | 96% | 83% | 46% | 54% | 67% | 92% | 67% | 96% |
