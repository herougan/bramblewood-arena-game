# Focused decks: Map 7 The Morel Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,alligator-gar,amber-cicada,bee-forager,booming-bittern,caiman-hatchling,camouflage-frog,compost-grub,corpse-flower-beetle,cypress-root-lurker,earthworm,fire-ant-raft,fungus-gnat-cloud,gannet-nestweaver,hawthorn-shieldbug,lamprey,leopard-slug,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,planarian-splitter,puffball-bombardier,raft-spider,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:evasion,swarm,open --anchor adder-ambusher,amber-cicada,camouflage-frog,compost-grub,corpse-flower-beetle,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leopard-slug,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8964 games in 178 s.

- The list (28): Adder Ambusher, Alley Cat, Alligator Gar, Amber Cicada, Bee Forager, Booming Bittern, Caiman Hatchling, Camouflage Frog, Compost Grub, Corpse-flower Beetle, Cypress Root Lurker, Earthworm, Fire Ant Raft, Fungus Gnat Cloud, Gannet Nestweaver, Hawthorn Shieldbug, Lamprey, Leopard Slug, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Planarian Splitter, Puffball Bombardier, Raft Spider, Rot-Swollen Carcass, Sleepless Shrew, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); flying x8; swarm x7 | 77% (72%-82%) | 0.45 | 0: 11, 1: 9 | 4x Fungus Gnat Cloud, 4x Gannet Nestweaver, 4x Hawthorn Shieldbug, 3x Otter Centurion, 3x Wolf Spider Mother, 2x Corpse-flower Beetle | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); flying x7 | 68% (63%-73%) | 0.3 | 0: 14, 1: 6 | 4x Fungus Gnat Cloud, 4x Sleepless Shrew, 3x Bee Forager, 3x Corpse-flower Beetle, 3x Mudpuppy, 3x Planarian Splitter | 14 |
| 3 | family:evasion | swarm (16 copies at 0 Lumber); evasion x8 | 53% (47%-59%) | 0.2 | 0: 16, 1: 4 | 4x Alley Cat, 4x Caiman Hatchling, 4x Fungus Gnat Cloud, 4x Leopard Slug, 3x Camouflage Frog, 1x Booming Bittern | 16 |
| 4 | family:tide | tide x10; poison x7 | 45% (39%-50%) | 0.8 | 0: 4, 1: 16 | 4x Camouflage Frog, 4x Fire Ant Raft, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Corpse-flower Beetle, 2x Alligator Gar | 18 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 67% | 63% | 83% | 50% | 96% | 50% | 88% |
| 2 swarm | 100% | 83% | 54% | 42% | 75% | 38% | 100% | 42% | 79% |
| 3 family:evasion | 83% | 67% | 42% | 33% | 50% | 29% | 92% | 25% | 54% |
| 4 family:tide | 96% | 54% | 54% | 17% | 38% | 13% | 75% | 8% | 50% |
