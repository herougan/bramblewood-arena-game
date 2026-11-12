# Focused decks: Map 7 The Mycelium Deep (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,amber-cicada,barkplate-beetle,bee-forager,fire-ant-raft,fungal-colossus,fungus-gnat-cloud,garden-snail,hawthorn-shieldbug,leopard-slug,millipede-hauler,mudpuppy,newt-doctor,otter-centurion,pill-bug,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:heal,big,open --anchor fungal-colossus,fungus-gnat-cloud,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8992 games in 210 s.

- The list (21): Alley Cat, Amber Cicada, Barkplate Beetle, Bee Forager, Fire Ant Raft, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Hawthorn Shieldbug, Leopard Slug, Millipede Hauler, Mudpuppy, Newt Doctor, Otter Centurion, Pill Bug, Planarian Splitter, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | armor x8; flying x8 | 82% (77%-87%) | 0.4 | 0: 12, 1: 8 | 4x Bee Forager, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Pill Bug, 2x Truffle Piglet, 2x Wolf Spider Mother | 0 |
| 2 | family:armor | swarm (14 copies at 0 Lumber); armor x12; swarm x6 | 76% (70%-82%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Newt Doctor, 4x Pill Bug, 2x Garden Snail, 2x Millipede Hauler | 12 |
| 3 | family:heal | swarm (17 copies at 0 Lumber); heal x9; poison x7 | 76% (71%-80%) | 0.15 | 0: 17, 1: 3 | 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Mudpuppy, 4x Puffball Bombardier, 3x Fire Ant Raft, 1x Newt Doctor | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); swarm x8 | 71% (66%-76%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Rot-Swollen Carcass, 4x Truffle Piglet, 3x Leopard Slug, 1x Alley Cat | 14 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 75% | 96% | 96% | 63% | 96% | 63% | 75% |
| 2 family:armor | 83% | 79% | 100% | 83% | 58% | 88% | 50% | 67% |
| 3 family:heal | 92% | 54% | 100% | 96% | 88% | 96% | 17% | 63% |
| 4 big | 96% | 46% | 100% | 92% | 46% | 100% | 25% | 67% |
