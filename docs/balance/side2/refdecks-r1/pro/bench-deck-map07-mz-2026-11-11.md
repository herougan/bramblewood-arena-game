# Focused decks: Map 7 The Mycelium Deep (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,amber-cicada,barkplate-beetle,bee-forager,compost-grub,earthworm,fire-ant-raft,fungal-colossus,fungus-gnat-cloud,hawthorn-shieldbug,leopard-slug,mudpuppy,newt-doctor,otter-centurion,pine-marten,planarian-splitter,puffball-bombardier,river-mink,rootworm-colony,rot-swollen-carcass,sleepless-shrew,truffle-piglet,tunnel-wyrm,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:heal,family:armor,big,open --anchor compost-grub,earthworm,fungal-colossus,fungus-gnat-cloud,hawthorn-shieldbug,leopard-slug,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,tunnel-wyrm --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8848 games in 197 s.

- The list (24): Alley Cat, Amber Cicada, Barkplate Beetle, Bee Forager, Compost Grub, Earthworm, Fire Ant Raft, Fungal Colossus, Fungus Gnat Cloud, Hawthorn Shieldbug, Leopard Slug, Mudpuppy, Newt Doctor, Otter Centurion, Pine Marten, Planarian Splitter, Puffball Bombardier, River Mink, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Truffle Piglet, Tunnel Wyrm, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:heal | swarm (17 copies at 0 Lumber); heal x8 | 81% (76%-85%) | 0.15 | 0: 17, 1: 3 | 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Newt Doctor, 3x Alley Cat, 3x Hawthorn Shieldbug, 2x Otter Centurion | 11 |
| 2 | family:armor | armor x8 | 76% (70%-81%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Barkplate Beetle, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 3x Alley Cat, 3x Compost Grub, 2x Sleepless Shrew | 15 |
| 3 | open | midrange (average 0.4 Lumber) | 63% (56%-69%) | 0.4 | 0: 12, 1: 8 | 4x Fire Ant Raft, 4x Leopard Slug, 4x Tunnel Wyrm, 3x Alley Cat, 3x Otter Centurion, 2x Compost Grub | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 53% (47%-59%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Compost Grub, 4x Rot-Swollen Carcass, 4x Tunnel Wyrm, 2x Alley Cat, 2x Mudpuppy | 12 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:heal | 92% | 71% | 100% | 92% | 88% | 96% | 29% | 79% |
| 2 family:armor | 83% | 67% | 100% | 88% | 63% | 92% | 42% | 71% |
| 3 open | 88% | 58% | 75% | 67% | 42% | 92% | 21% | 58% |
| 4 big | 63% | 29% | 92% | 58% | 33% | 92% | 21% | 38% |
