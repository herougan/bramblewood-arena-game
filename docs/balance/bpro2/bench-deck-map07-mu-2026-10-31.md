# Focused decks: Map 7 The Morel Hollow (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,ant-warrior,bogfire-newt,bombardier-beetle,cane-toad,compost-grub,dung-beetle,fungal-colossus,garden-snail,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6984 games in 87 s.

- The list (16): Adder Ambusher, Ant Warrior, Bogfire Newt, Bombardier Beetle, Cane Toad, Compost Grub, Dung Beetle, Fungal Colossus, Garden Snail, Hawthorn Shieldbug, Leafcutter Gardener, Owl Nightwatch, Planarian Splitter, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers) | 83% (78%-88%) | 0.25 | 0: 15, 1: 5 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Dung Beetle, 4x Leafcutter Gardener, 3x Compost Grub, 1x Hawthorn Shieldbug | 8 |
| 2 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (7 resource makers) | 78% (73%-83%) | 0.6 | 0: 8, 1: 12 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Hawthorn Shieldbug, 4x Truffle Piglet, 3x Leafcutter Gardener, 1x Garden Snail | 11 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 77% (72%-82%) | 0.5 | 0: 10, 1: 10 | 4x Ant Warrior, 4x Leafcutter Gardener, 4x Owl Nightwatch, 3x Bombardier Beetle, 3x Hawthorn Shieldbug, 2x Compost Grub | 9 |
| 4 | open | big (11 copies at 1+ Lumber, average 0.6) | 74% (69%-80%) | 0.55 | 0: 9, 1: 11 | 4x Ant Warrior, 4x Bombardier Beetle, 4x Dung Beetle, 4x Owl Nightwatch, 3x Adder Ambusher, 1x Garden Snail | 0 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 92% | 71% | 83% | 92% | 83% | 75% | 92% | 63% | 96% |
| 2 economy | 92% | 46% | 88% | 92% | 83% | 46% | 88% | 71% | 100% |
| 3 big | 88% | 58% | 83% | 96% | 83% | 67% | 88% | 42% | 92% |
| 4 open | 75% | 67% | 71% | 92% | 88% | 38% | 88% | 63% | 88% |
