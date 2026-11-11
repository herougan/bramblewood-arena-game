# Focused decks: Map 7 The Mycelium Deep (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,amber-cicada,ant-warrior,barkplate-beetle,bee-forager,bombardier-beetle,dung-beetle,fire-ant-raft,fungal-colossus,fungus-gnat-cloud,garden-snail,hawthorn-shieldbug,leafcutter-gardener,leopard-slug,millipede-hauler,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,pill-bug,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-ant,tunnel-wyrm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:armor,family:heal,big,open --anchor ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,fungus-gnat-cloud,garden-snail,leafcutter-gardener,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-wyrm,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2160 games in 459 s.

- The list (30): Alley Cat, Amber Cicada, Ant Warrior, Barkplate Beetle, Bee Forager, Bombardier Beetle, Dung Beetle, Fire Ant Raft, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Leopard Slug, Millipede Hauler, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Pill Bug, Planarian Splitter, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Springtail Hopper, Truffle Piglet, Tunnel Ant, Tunnel Wyrm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:heal | swarm (16 copies at 0 Lumber); heal x8 | 91% (87%-94%) | 0.2 | 0: 16, 1: 4 | 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 4x Leopard Slug, 4x Mudpuppy, 3x Fungus Gnat Cloud, 1x Pill Bug | 17 |
| 2 | family:armor | armor x8; swarm x8 | 86% (82%-90%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ant Warrior, 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 4x Millipede Hauler | 16 |
| 3 | open | swarm x7 | 84% (79%-89%) | 0.65 | 0: 7, 1: 13 | 4x Amber Cicada, 4x Bombardier Beetle, 4x Fungus Gnat Cloud, 3x Alley Cat, 3x Tunnel Ant, 2x Truffle Piglet | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.8); heal x7 | 68% (62%-73%) | 0.8 | 0: 12, 2: 8 | 4x Barkplate Beetle, 4x Fungal Colossus, 4x Leopard Slug, 3x Mudpuppy, 3x Sleepless Shrew, 2x Ant Warrior | 20 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:heal | 100% | 96% | 100% | 100% | 100% | 100% | 54% | 75% |
| 2 family:armor | 100% | 88% | 96% | 100% | 100% | 96% | 38% | 71% |
| 3 open | 92% | 92% | 92% | 83% | 100% | 83% | 67% | 67% |
| 4 big | 88% | 63% | 67% | 88% | 100% | 75% | 17% | 46% |
