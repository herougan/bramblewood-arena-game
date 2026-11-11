# Focused decks: Map 7 The Mycelium Deep (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,amber-cicada,ant-warrior,barkplate-beetle,bee-forager,bombardier-beetle,dung-beetle,fire-ant-raft,fungal-colossus,fungus-gnat-cloud,garden-snail,hawthorn-shieldbug,leafcutter-gardener,leopard-slug,millipede-hauler,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,pill-bug,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-ant,tunnel-wyrm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:heal,big,open --anchor ant-warrior,bombardier-beetle,dung-beetle,fungal-colossus,fungus-gnat-cloud,garden-snail,leafcutter-gardener,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,springtail-hopper,truffle-piglet,tunnel-wyrm,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9168 games in 188 s.

- The list (30): Alley Cat, Amber Cicada, Ant Warrior, Barkplate Beetle, Bee Forager, Bombardier Beetle, Dung Beetle, Fire Ant Raft, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Leopard Slug, Millipede Hauler, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Pill Bug, Planarian Splitter, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Springtail Hopper, Truffle Piglet, Tunnel Ant, Tunnel Wyrm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x9; swarm x8 | 92% (88%-95%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Millipede Hauler, 4x Nutria Reedcutter, 3x Ant Warrior, 1x Pill Bug | 14 |
| 2 | family:heal | swarm (18 copies at 0 Lumber); heal x8 | 91% (87%-94%) | 0.1 | 0: 18, 1: 2 | 4x Dung Beetle, 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Newt Doctor, 2x Amber Cicada, 2x Springtail Hopper | 20 |
| 3 | open | midrange (average 0.4 Lumber) | 85% (81%-90%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Leafcutter Gardener, 4x Nutria Reedcutter, 3x Tunnel Wyrm, 3x Wolf Spider Mother, 2x Millipede Hauler | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); armor x8 | 79% (74%-84%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Nutria Reedcutter, 4x Pill Bug, 4x Rot-Swollen Carcass, 2x Alley Cat, 2x Leafcutter Gardener | 12 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 96% | 100% | 100% | 92% | 100% | 96% | 58% | 92% |
| 2 family:heal | 96% | 100% | 100% | 88% | 100% | 96% | 75% | 71% |
| 3 open | 92% | 100% | 96% | 83% | 96% | 92% | 63% | 63% |
| 4 big | 79% | 92% | 83% | 88% | 100% | 96% | 33% | 63% |
