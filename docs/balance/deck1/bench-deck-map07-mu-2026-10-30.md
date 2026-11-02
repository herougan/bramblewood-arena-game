# Focused decks: Map 7 The Morel Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,anaconda-coil,bee-forager,bogfire-newt,bombardier-beetle,cane-toad,carrion-beetle,compost-grub,corpse-flower-beetle,cottonmouth-matriarch,dung-beetle,earthworm,fire-ant-raft,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,sleepless-shrew,slow-worm,truffle-piglet,tunnel-ant,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7074 games in 121 s.

- The list (31): Adder Ambusher, Alley Cat, Anaconda Coil, Bee Forager, Bogfire Newt, Bombardier Beetle, Cane Toad, Carrion Beetle, Compost Grub, Corpse-flower Beetle, Cottonmouth Matriarch, Dung Beetle, Earthworm, Fire Ant Raft, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Sleepless Shrew, Slow-worm, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers); swarm x7 | 93% (90%-96%) | 0.55 | 0: 9, 1: 11 | 4x Bee Forager, 4x Bombardier Beetle, 4x Truffle Piglet, 3x Mudpuppy, 3x Tunnel Ant, 2x Worker Ant | 0 |
| 2 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 84% (80%-89%) | 0.55 | 0: 9, 1: 11 | 4x Bombardier Beetle, 4x Leafcutter Gardener, 4x Nutria Reedcutter, 4x Owl Nightwatch, 3x Corpse-flower Beetle, 1x Sleepless Shrew | 16 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); swarm x7 | 84% (80%-89%) | 0.5 | 0: 10, 1: 10 | 4x Bee Forager, 4x Hawthorn Shieldbug, 4x Slow-worm, 3x Carrion Beetle, 3x Tunnel Ant, 2x Bogfire Newt | 13 |
| 4 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers); poison x7 | 75% (70%-80%) | 0.25 | 0: 15, 1: 5 | 4x Bogfire Newt, 4x Nutria Reedcutter, 4x Sleepless Shrew, 3x Adder Ambusher, 3x Raven Scout, 2x Anaconda Coil | 20 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 96% | 88% | 92% | 100% | 96% | 75% | 96% |
| 2 economy | 96% | 96% | 83% | 71% | 71% | 92% | 100% | 54% | 96% |
| 3 big | 100% | 92% | 92% | 71% | 63% | 92% | 83% | 75% | 92% |
| 4 swarm | 100% | 79% | 79% | 58% | 38% | 83% | 92% | 50% | 96% |
