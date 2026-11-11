# Focused decks: Map 7 The Mycelium Deep (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,fungus-gnat-cloud,garden-snail,leafcutter-gardener,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-wyrm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2496 games in 448 s.

- The list (18): Ant Warrior, Bombardier Beetle, Dung Beetle, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Leafcutter Gardener, Leopard Slug, Millipede Hauler, Pill Bug, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Springtail Hopper, Truffle Piglet, Tunnel Wyrm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 88% (84%-92%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Fungus Gnat Cloud, 4x Rootworm Colony, 4x Truffle Piglet | 0 |
| 2 | family:armor | armor x8; swarm x8 | 88% (83%-92%) | 0.4 | 0: 12, 1: 8 | 4x Fungus Gnat Cloud, 4x Millipede Hauler, 4x Pill Bug, 4x Tunnel Wyrm, 2x Dung Beetle, 2x Leopard Slug | 16 |
| 3 | swarm | swarm (16 copies at 0 Lumber) | 86% (82%-91%) | 0.2 | 0: 16, 1: 4 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Leafcutter Gardener, 4x Pill Bug, 4x Sleepless Shrew | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); swarm x16 | 49% (43%-56%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Fungal Colossus, 4x Fungus Gnat Cloud, 4x Millipede Hauler, 4x Rot-Swollen Carcass, 4x Springtail Hopper | 16 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 92% | 92% | 96% | 100% | 63% | 71% |
| 2 family:armor | 100% | 96% | 100% | 96% | 100% | 88% | 63% | 58% |
| 3 swarm | 100% | 88% | 92% | 92% | 83% | 100% | 58% | 79% |
| 4 big | 83% | 63% | 71% | 38% | 58% | 25% | 33% | 25% |
