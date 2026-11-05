# Focused decks: Map 7 The Mycelium Deep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6864 games in 142 s.

- The list (13): Ant Warrior, Bombardier Beetle, Dung Beetle, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6) | 98% (97%-100%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Truffle Piglet | 11 |
| 2 | swarm | swarm (14 copies at 0 Lumber); swarm x6 | 97% (94%-99%) | 0.3 | 0: 14, 1: 6 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Dung Beetle, 4x Sleepless Shrew, 2x Leafcutter Gardener, 2x Wolf Spider Mother | 13 |
| 3 | family:armor | big (11 copies at 1+ Lumber, average 0.6); armor x8 | 90% (86%-94%) | 0.55 | 0: 9, 1: 11 | 4x Garden Snail, 4x Hawthorn Shieldbug, 4x Truffle Piglet, 3x Leafcutter Gardener, 3x Wolf Spider Mother, 2x Ant Warrior | 10 |
| 4 | open | big (15 copies at 1+ Lumber, average 0.8); swarm x7 | 84% (80%-89%) | 0.75 | 0: 5, 1: 15 | 4x Ant Warrior, 4x Hawthorn Shieldbug, 4x Owl Nightwatch, 4x Planarian Splitter, 3x Wolf Spider Mother, 1x Leafcutter Gardener | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 100% | 100% | 100% | 96% | 96% | 96% |
| 2 swarm | 100% | 92% | 100% | 100% | 100% | 100% | 100% | 83% |
| 3 family:armor | 100% | 92% | 100% | 100% | 96% | 96% | 88% | 50% |
| 4 open | 100% | 88% | 92% | 92% | 100% | 88% | 75% | 42% |
