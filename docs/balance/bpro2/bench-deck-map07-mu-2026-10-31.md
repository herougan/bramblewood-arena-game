# Focused decks: Map 7 The Morel Hollow (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7272 games in 112 s.

- The list (19): Adder Ambusher, Bogfire Newt, Bombardier Beetle, Cane Toad, Compost Grub, Corpse-flower Beetle, Dung Beetle, Earthworm, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Sleepless Shrew, Slow-worm, Truffle Piglet, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (11 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 84% (79%-88%) | 0.55 | 0: 9, 1: 11 | 4x Leafcutter Gardener, 4x Owl Nightwatch, 4x Truffle Piglet, 3x Dung Beetle, 3x Wolf Spider Mother, 2x Slow-worm | 12 |
| 2 | open | big (9 copies at 1+ Lumber, average 0.5) | 75% (70%-79%) | 0.45 | 0: 11, 1: 9 | 4x Bogfire Newt, 4x Slow-worm, 3x Bombardier Beetle, 3x Corpse-flower Beetle, 3x Leafcutter Gardener, 3x Wolf Spider Mother | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber) | 70% (65%-75%) | 0.25 | 0: 15, 1: 5 | 4x Compost Grub, 4x Dung Beetle, 4x Slow-worm, 3x Corpse-flower Beetle, 3x Sleepless Shrew, 2x Wolf Spider Mother | 11 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.5) | 68% (62%-73%) | 0.5 | 0: 10, 1: 10 | 4x Compost Grub, 4x Planarian Splitter, 4x Worker Ant, 3x Corpse-flower Beetle, 3x Wolf Spider Mother, 2x Leafcutter Gardener | 12 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 83% | 96% | 100% | 71% | 63% | 100% | 50% | 92% |
| 2 open | 96% | 42% | 75% | 96% | 67% | 29% | 88% | 88% | 92% |
| 3 swarm | 96% | 50% | 92% | 96% | 46% | 25% | 83% | 54% | 88% |
| 4 big | 100% | 54% | 83% | 92% | 58% | 21% | 75% | 58% | 67% |
