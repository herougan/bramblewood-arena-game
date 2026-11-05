# Focused decks: Map 7 The Mycelium Deep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,ant-warrior,bee-forager,bombardier-beetle,compost-grub,dung-beetle,earthworm,fire-ant-raft,forager-ant,fungal-colossus,gannet-nestweaver,garden-snail,hawthorn-shieldbug,leafcutter-gardener,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,rootworm-colony,sleepless-shrew,truffle-piglet,tunnel-ant,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:armor,big,open --anchor ant-warrior,bombardier-beetle,compost-grub,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6960 games in 139 s.

- The list (26): Alley Cat, Ant Warrior, Bee Forager, Bombardier Beetle, Compost Grub, Dung Beetle, Earthworm, Fire Ant Raft, Forager Ant, Fungal Colossus, Gannet Nestweaver, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (15 copies at 0 Lumber); economy (4 resource makers); swarm x12; flying x8 | 96% (94%-99%) | 0.25 | 0: 15, 1: 5 | 4x Bee Forager, 4x Gannet Nestweaver, 4x Leafcutter Gardener, 3x Ant Warrior, 3x Wolf Spider Mother, 2x Fire Ant Raft | 20 |
| 2 | family:armor | swarm (16 copies at 0 Lumber); armor x8; swarm x8 | 94% (91%-97%) | 0.2 | 0: 16, 1: 4 | 4x Ant Warrior, 4x Bee Forager, 4x Garden Snail, 4x Hawthorn Shieldbug, 3x Raven Scout, 1x Forager Ant | 16 |
| 3 | big | big (11 copies at 1+ Lumber, average 0.6); flying x6 | 93% (90%-97%) | 0.55 | 0: 9, 1: 11 | 4x Bombardier Beetle, 4x Truffle Piglet, 3x Alley Cat, 3x Bee Forager, 3x Gannet Nestweaver, 3x Planarian Splitter | 13 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4) | 90% (86%-94%) | 0.4 | 0: 12, 1: 8 | 4x Bombardier Beetle, 4x Hawthorn Shieldbug, 4x Newt Doctor, 3x Alley Cat, 3x Otter Centurion, 2x Compost Grub | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 100% | 100% | 96% | 96% | 92% | 88% |
| 2 family:armor | 100% | 100% | 100% | 100% | 100% | 100% | 96% | 54% |
| 3 big | 100% | 92% | 100% | 96% | 100% | 96% | 92% | 71% |
| 4 open | 96% | 79% | 100% | 100% | 92% | 100% | 83% | 67% |
