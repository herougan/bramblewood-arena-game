# Focused decks: Map 7 The Morel Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,alley-cat,bee-forager,bogfire-newt,bombardier-beetle,box-turtle,cane-toad,compost-grub,corpse-flower-beetle,driftwood-crab,dung-beetle,earthworm,fire-ant-raft,fungal-colossus,gannet-nestweaver,garden-snail,hawthorn-shieldbug,leafcutter-gardener,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,sleepless-shrew,slow-worm,truffle-piglet,tunnel-ant,wolf-spider-mother,woodcock-lookout,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor adder-ambusher,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7002 games in 109 s.

- The list (31): Adder Ambusher, Alley Cat, Bee Forager, Bogfire Newt, Bombardier Beetle, Box Turtle, Cane Toad, Compost Grub, Corpse-flower Beetle, Driftwood Crab, Dung Beetle, Earthworm, Fire Ant Raft, Fungal Colossus, Gannet Nestweaver, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Sleepless Shrew, Slow-worm, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Woodcock Lookout, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers); evasion x7 | 91% (88%-95%) | 0.55 | 0: 9, 1: 11 | 4x Bombardier Beetle, 4x Dung Beetle, 4x Nutria Reedcutter, 4x Owl Nightwatch, 3x Tunnel Ant, 1x Bee Forager | 12 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 88% (84%-92%) | 0.4 | 0: 12, 1: 8 | 4x Dung Beetle, 4x Leafcutter Gardener, 4x Nutria Reedcutter, 3x Adder Ambusher, 3x Wolf Spider Mother, 2x Corpse-flower Beetle | 0 |
| 3 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); poison x7; swarm x7 | 85% (81%-90%) | 0.3 | 0: 14, 1: 6 | 4x Bee Forager, 4x Bogfire Newt, 4x Leafcutter Gardener, 3x Adder Ambusher, 3x Tunnel Ant, 2x Driftwood Crab | 13 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); swarm x7 | 84% (80%-88%) | 0.3 | 0: 14, 1: 6 | 4x Bee Forager, 4x Leafcutter Gardener, 3x Box Turtle, 3x Compost Grub, 3x Fire Ant Raft, 3x Hawthorn Shieldbug | 16 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 92% | 100% | 83% | 71% | 100% | 100% | 79% | 96% |
| 2 open | 96% | 96% | 92% | 75% | 79% | 96% | 96% | 71% | 96% |
| 3 economy | 100% | 92% | 92% | 75% | 67% | 88% | 96% | 63% | 96% |
| 4 swarm | 96% | 92% | 92% | 88% | 58% | 100% | 96% | 42% | 92% |
