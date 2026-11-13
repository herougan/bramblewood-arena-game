# Focused decks: Map 7 The Mycelium Deep (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,amber-cicada,barkplate-beetle,bee-forager,bombardier-beetle,compost-grub,earthworm,fire-ant-raft,fungal-colossus,fungus-gnat-cloud,garden-snail,hawthorn-shieldbug,leopard-slug,millipede-hauler,mudpuppy,newt-doctor,otter-centurion,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:heal,big,open --anchor bombardier-beetle,compost-grub,earthworm,fungal-colossus,fungus-gnat-cloud,hawthorn-shieldbug,leopard-slug,millipede-hauler,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8848 games in 340 s.

- The list (24): Alley Cat, Amber Cicada, Barkplate Beetle, Bee Forager, Bombardier Beetle, Compost Grub, Earthworm, Fire Ant Raft, Fungal Colossus, Fungus Gnat Cloud, Garden Snail, Hawthorn Shieldbug, Leopard Slug, Millipede Hauler, Mudpuppy, Newt Doctor, Otter Centurion, Planarian Splitter, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:heal | swarm (14 copies at 0 Lumber); heal x8 | 82% (77%-87%) | 0.3 | 0: 14, 1: 6 | 4x Bombardier Beetle, 4x Leopard Slug, 4x Newt Doctor, 3x Fungus Gnat Cloud, 3x Otter Centurion, 2x Amber Cicada | 11 |
| 2 | open | swarm x7 | 82% (77%-87%) | 0.35 | 0: 13, 1: 7 | 4x Amber Cicada, 4x Fungus Gnat Cloud, 4x Leopard Slug, 3x Compost Grub, 3x Wolf Spider Mother, 2x Alley Cat | 0 |
| 3 | family:armor | swarm (16 copies at 0 Lumber); armor x8; heal x7 | 70% (65%-76%) | 0.2 | 0: 16, 1: 4 | 4x Garden Snail, 4x Hawthorn Shieldbug, 4x Mudpuppy, 3x Fungus Gnat Cloud, 3x Leopard Slug, 2x Alley Cat | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); swarm x12; armor x8 | 62% (56%-68%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Alley Cat, 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Millipede Hauler, 4x Rot-Swollen Carcass | 14 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:heal | 96% | 58% | 92% | 83% | 100% | 100% | 54% | 75% |
| 2 open | 96% | 67% | 92% | 88% | 100% | 92% | 58% | 67% |
| 3 family:armor | 100% | 38% | 79% | 67% | 96% | 88% | 38% | 58% |
| 4 big | 100% | 42% | 58% | 46% | 79% | 75% | 42% | 54% |
