# Focused decks: Map 7 The Morel Hollow (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,ant-warrior,bogfire-newt,bombardier-beetle,cane-toad,carrion-beetle,compost-grub,cottonmouth-matriarch,dung-beetle,fire-ant-raft,fungal-colossus,garden-snail,giant-water-bug,hawthorn-shieldbug,leafcutter-gardener,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,sleepless-shrew,truffle-piglet,tunnel-ant,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,ant-warrior,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13068 games in 190 s.

- The list (28): Adder Ambusher, Alley Cat, Ant Warrior, Bogfire Newt, Bombardier Beetle, Cane Toad, Carrion Beetle, Compost Grub, Cottonmouth Matriarch, Dung Beetle, Fire Ant Raft, Fungal Colossus, Garden Snail, Giant Water Bug, Hawthorn Shieldbug, Leafcutter Gardener, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Sleepless Shrew, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber); economy (4 resource makers); swarm x7 | 90% (86%-94%) | 0.15 | 0: 17, 1: 3 | 4x Ant Warrior, 4x Leafcutter Gardener, 3x Bogfire Newt, 3x Otter Centurion, 3x Raven Scout, 3x Wolf Spider Mother | 10 |
| 2 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (7 resource makers) | 88% (83%-92%) | 0.45 | 0: 11, 1: 9 | 4x Dung Beetle, 4x Nutria Reedcutter, 3x Alley Cat, 3x Cottonmouth Matriarch, 3x Truffle Piglet, 3x Wolf Spider Mother | 20 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); poison x11; swarm x10 | 82% (77%-87%) | 0.5 | 0: 10, 1: 10 | 4x Ant Warrior, 4x Bogfire Newt, 4x Carrion Beetle, 3x Fire Ant Raft, 3x Tunnel Ant, 2x Dung Beetle | 10 |
| 4 | open | swarm (14 copies at 0 Lumber); economy (4 resource makers); swarm x7 | 81% (77%-86%) | 0.3 | 0: 14, 1: 6 | 4x Ant Warrior, 4x Leafcutter Gardener, 4x Sleepless Shrew, 3x Carrion Beetle, 3x Tunnel Ant, 2x Otter Centurion | 0 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 83% | 88% | 100% | 67% | 92% | 83% | 96% |
| 2 economy | 96% | 96% | 83% | 83% | 92% | 63% | 92% | 83% | 100% |
| 3 big | 100% | 83% | 71% | 92% | 79% | 46% | 79% | 88% | 100% |
| 4 open | 96% | 83% | 67% | 71% | 92% | 71% | 83% | 71% | 100% |
