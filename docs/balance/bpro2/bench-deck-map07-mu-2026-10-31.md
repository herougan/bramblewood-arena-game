# Focused decks: Map 7 The Morel Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 103 s.

- The list (19): Adder Ambusher, Bogfire Newt, Bombardier Beetle, Cane Toad, Compost Grub, Corpse-flower Beetle, Dung Beetle, Earthworm, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Sleepless Shrew, Slow-worm, Truffle Piglet, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 83% (79%-88%) | 0.55 | 0: 9, 1: 11 | 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Dung Beetle, 3x Wolf Spider Mother, 2x Slow-worm | 10 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 80% (75%-84%) | 0.3 | 0: 14, 1: 6 | 4x Leafcutter Gardener, 4x Sleepless Shrew, 4x Worker Ant, 3x Adder Ambusher, 3x Wolf Spider Mother, 2x Bogfire Newt | 17 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 78% (73%-83%) | 0.45 | 0: 11, 1: 9 | 4x Bombardier Beetle, 4x Dung Beetle, 4x Leafcutter Gardener, 4x Owl Nightwatch, 3x Bogfire Newt, 1x Wolf Spider Mother | 15 |
| 4 | open | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 73% (68%-78%) | 0.5 | 0: 10, 1: 10 | 4x Dung Beetle, 4x Garden Snail, 4x Truffle Piglet, 3x Corpse-flower Beetle, 3x Wolf Spider Mother, 2x Compost Grub | 0 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 83% | 96% | 100% | 71% | 63% | 100% | 46% | 92% |
| 2 swarm | 96% | 71% | 96% | 96% | 54% | 58% | 100% | 54% | 92% |
| 3 big | 92% | 54% | 88% | 96% | 83% | 42% | 100% | 50% | 96% |
| 4 open | 100% | 50% | 88% | 96% | 54% | 38% | 83% | 54% | 96% |
