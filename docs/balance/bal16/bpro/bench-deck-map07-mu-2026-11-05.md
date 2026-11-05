# Focused decks: Map 7 The Morel Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,cane-toad,corpse-flower-beetle,dung-beetle,earthworm,fungal-colossus,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,slow-worm,truffle-piglet,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6714 games in 155 s.

- The list (15): Adder Ambusher, Cane Toad, Corpse-flower Beetle, Dung Beetle, Earthworm, Fungal Colossus, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Sleepless Shrew, Slow-worm, Truffle Piglet, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber) | 85% (81%-89%) | 0.3 | 0: 14, 1: 6 | 4x Leafcutter Gardener, 4x Slow-worm, 4x Worker Ant, 3x Corpse-flower Beetle, 3x Wolf Spider Mother, 2x Dung Beetle | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 84% (80%-89%) | 0.3 | 0: 14, 1: 6 | 4x Dung Beetle, 4x Leafcutter Gardener, 3x Adder Ambusher, 3x Earthworm, 3x Sleepless Shrew, 3x Wolf Spider Mother | 11 |
| 3 | big | big (12 copies at 1+ Lumber, average 0.6) | 84% (79%-88%) | 0.6 | 0: 8, 1: 12 | 4x Dung Beetle, 4x Hawthorn Shieldbug, 4x Leafcutter Gardener, 3x Owl Nightwatch, 3x Truffle Piglet, 2x Wolf Spider Mother | 12 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 88% | 96% | 75% | 100% | 100% | 75% | 42% |
| 2 swarm | 96% | 100% | 88% | 79% | 88% | 92% | 100% | 50% | 67% |
| 3 big | 100% | 100% | 92% | 92% | 79% | 83% | 92% | 50% | 67% |
