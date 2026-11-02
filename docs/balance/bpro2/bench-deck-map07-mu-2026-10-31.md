# Focused decks: Map 7 The Morel Hollow (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,bogfire-newt,bombardier-beetle,cane-toad,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7092 games in 122 s.

- The list (18): Adder Ambusher, Bogfire Newt, Bombardier Beetle, Cane Toad, Corpse-flower Beetle, Dung Beetle, Earthworm, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Sleepless Shrew, Slow-worm, Truffle Piglet, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1+ Lumber, average 0.7); economy (8 resource makers) | 81% (77%-86%) | 0.65 | 0: 7, 1: 13 | 4x Leafcutter Gardener, 4x Truffle Piglet, 3x Bombardier Beetle, 3x Earthworm, 3x Planarian Splitter, 3x Wolf Spider Mother | 16 |
| 2 | big | big (11 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 76% (71%-81%) | 0.55 | 0: 9, 1: 11 | 4x Bombardier Beetle, 4x Leafcutter Gardener, 4x Planarian Splitter, 3x Dung Beetle, 3x Wolf Spider Mother, 2x Sleepless Shrew | 11 |
| 3 | open | swarm (16 copies at 0 Lumber) | 72% (66%-77%) | 0.2 | 0: 16, 1: 4 | 4x Bogfire Newt, 4x Dung Beetle, 4x Sleepless Shrew, 4x Worker Ant, 2x Bombardier Beetle, 2x Wolf Spider Mother | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); poison x6 | 66% (60%-72%) | 0.3 | 0: 14, 1: 6 | 4x Earthworm, 4x Worker Ant, 3x Adder Ambusher, 3x Bogfire Newt, 3x Dung Beetle, 3x Wolf Spider Mother | 8 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 50% | 96% | 83% | 79% | 67% | 96% | 75% | 88% |
| 2 big | 96% | 67% | 79% | 67% | 71% | 42% | 96% | 79% | 88% |
| 3 open | 100% | 58% | 83% | 54% | 63% | 54% | 100% | 50% | 83% |
| 4 swarm | 92% | 58% | 75% | 71% | 46% | 46% | 83% | 46% | 75% |
