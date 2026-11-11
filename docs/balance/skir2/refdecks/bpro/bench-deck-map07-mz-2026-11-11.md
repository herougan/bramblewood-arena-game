# Focused decks: Map 7 The Mycelium Deep (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,fungus-gnat-cloud,garden-snail,leafcutter-gardener,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-wyrm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7024 games in 132 s.

- The list (18): Ant Warrior, Bombardier Beetle, Dung Beetle, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Leafcutter Gardener, Leopard Slug, Millipede Hauler, Pill Bug, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Springtail Hopper, Truffle Piglet, Tunnel Wyrm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); swarm x7 | 96% (94%-99%) | 0.2 | 0: 16, 1: 4 | 4x Ant Warrior, 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 4x Springtail Hopper, 3x Wolf Spider Mother, 1x Bombardier Beetle | 11 |
| 2 | family:armor | swarm (16 copies at 0 Lumber); armor x8; swarm x8 | 87% (82%-91%) | 0.2 | 0: 16, 1: 4 | 4x Fungus Gnat Cloud, 4x Millipede Hauler, 4x Pill Bug, 4x Sleepless Shrew, 3x Dung Beetle, 1x Leopard Slug | 17 |
| 3 | open | swarm (14 copies at 0 Lumber) | 82% (77%-87%) | 0.3 | 0: 14, 1: 6 | 4x Leafcutter Gardener, 4x Leopard Slug, 4x Springtail Hopper, 4x Tunnel Wyrm, 2x Bombardier Beetle, 2x Dung Beetle | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); swarm x11 | 49% (42%-56%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Fungal Colossus, 4x Rot-Swollen Carcass, 4x Springtail Hopper, 4x Truffle Piglet, 3x Fungus Gnat Cloud, 1x Pill Bug | 16 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 100% | 96% | 100% | 83% | 92% |
| 2 family:armor | 92% | 88% | 100% | 88% | 96% | 96% | 71% | 67% |
| 3 open | 88% | 96% | 88% | 92% | 96% | 83% | 46% | 71% |
| 4 big | 54% | 50% | 75% | 63% | 67% | 42% | 21% | 21% |
