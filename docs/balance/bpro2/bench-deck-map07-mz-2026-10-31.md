# Focused decks: Map 7 The Mycelium Deep (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,compost-grub,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7024 games in 89 s.

- The list (14): Ant Warrior, Bombardier Beetle, Compost Grub, Dung Beetle, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); swarm x7 | 90% (86%-94%) | 0.4 | 0: 12, 1: 8 | 4x Ant Warrior, 4x Dung Beetle, 4x Leafcutter Gardener, 3x Bombardier Beetle, 3x Wolf Spider Mother, 2x Owl Nightwatch | 13 |
| 2 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (6 resource makers) | 83% (79%-88%) | 0.55 | 0: 9, 1: 11 | 4x Compost Grub, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Dung Beetle, 3x Wolf Spider Mother, 2x Leafcutter Gardener | 10 |
| 3 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers); swarm x6 | 77% (72%-82%) | 0.25 | 0: 15, 1: 5 | 4x Ant Warrior, 4x Leafcutter Gardener, 4x Sleepless Shrew, 3x Dung Beetle, 3x Hawthorn Shieldbug, 2x Wolf Spider Mother | 18 |
| 4 | open | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 66% (60%-72%) | 0.7 | 0: 6, 1: 14 | 4x Bombardier Beetle, 4x Compost Grub, 4x Rootworm Colony, 4x Truffle Piglet, 2x Ant Warrior, 2x Owl Nightwatch | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 63% | 79% | 83% | 96% | 100% | 100% |
| 2 economy | 100% | 92% | 71% | 50% | 75% | 100% | 83% | 96% |
| 3 swarm | 100% | 96% | 38% | 58% | 50% | 100% | 71% | 100% |
| 4 open | 92% | 71% | 25% | 46% | 50% | 83% | 71% | 88% |
