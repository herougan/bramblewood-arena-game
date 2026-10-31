# Focused decks: Map 5 Gatorback Swamp (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alligator-gar,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7440 games in 93 s.

- The list (15): Alligator Gar, Bog Leech, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Fen Mink, Fire Ant Raft, Grass Viper, Muskrat Reedgatherer, Nutria Reedcutter, Snapper Hatchling, Snapstick Turtle, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers); bleed x7 | 83% (79%-87%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Bog Leech, 4x Muskrat Reedgatherer, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Constrictor Coil, 2x Fire Ant Raft | 10 |
| 2 | open | economy (4 resource makers); tide x8; poison x7 | 83% (79%-87%) | 0.4 | 0: 12, 1: 8 | 4x Bog Leech, 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Snapstick Turtle, 3x Grass Viper, 1x Caiman Hatchling | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber); bleed x7; poison x6 | 83% (78%-87%) | 0.25 | 0: 15, 1: 5 | 4x Bog Leech, 4x Fen Mink, 4x Grass Viper, 3x Alligator Gar, 3x Caiman Hatchling, 2x Fire Ant Raft | 10 |
| 4 | big | big (9 copies at 2+ Lumber, average 0.9); economy (4 resource makers) | 78% (73%-83%) | 0.95 | 0: 11, 2: 8, 3: 1 | 4x Constrictor Coil, 4x Grass Viper, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Bog Leech, 1x Venomlord Serpent | 14 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 79% | 96% | 83% | 100% | 92% | 96% | 92% | 71% | 33% | 92% |
| 2 open | 79% | 100% | 88% | 88% | 83% | 96% | 83% | 88% | 33% | 96% |
| 3 swarm | 75% | 100% | 88% | 92% | 92% | 88% | 71% | 83% | 42% | 96% |
| 4 big | 79% | 96% | 83% | 88% | 79% | 96% | 63% | 79% | 50% | 67% |
