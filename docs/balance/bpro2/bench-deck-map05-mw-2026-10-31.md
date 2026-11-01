# Focused decks: Map 5 Gatorback Swamp (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alligator-gar,anhinga-spearbird,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,snapstick-turtle,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7060 games in 92 s.

- The list (16): Alligator Gar, Anhinga Spearbird, Bog Leech, Box Turtle, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Fen Mink, Fire Ant Raft, Grass Viper, Muskrat Reedgatherer, Nutria Reedcutter, Old Snapjaw, Snapstick Turtle, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (15 copies at 0 Lumber); economy (8 resource makers) | 86% (82%-90%) | 0.3 | 0: 15, 1: 4, 2: 1 | 4x Bog Leech, 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 4x Nutria Reedcutter, 3x Box Turtle, 1x Swamp Alligator | 16 |
| 2 | swarm | swarm (16 copies at 0 Lumber); poison x8 | 86% (82%-90%) | 0.2 | 0: 16, 1: 4 | 4x Bog Leech, 4x Box Turtle, 4x Fen Mink, 4x Fire Ant Raft, 4x Grass Viper | 12 |
| 3 | big | big (9 copies at 2+ Lumber, average 0.9); economy (4 resource makers); armor x7; bleed x6 | 78% (74%-83%) | 0.9 | 0: 11, 2: 9 | 4x Grass Viper, 4x Muskrat Reedgatherer, 4x Swamp Alligator, 3x Bog Leech, 3x Old Snapjaw, 2x Constrictor Coil | 14 |
| 4 | open | economy (4 resource makers) | 77% (73%-82%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Cypress Root Lurker, 4x Fen Mink, 4x Grass Viper, 4x Nutria Reedcutter, 2x Constrictor Coil, 2x Crocodile Ambusher | 0 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 79% | 92% | 83% | 100% | 96% | 100% | 79% | 100% | 42% | 92% |
| 2 swarm | 83% | 96% | 83% | 96% | 88% | 100% | 71% | 100% | 50% | 96% |
| 3 big | 58% | 92% | 88% | 96% | 88% | 96% | 83% | 79% | 38% | 67% |
| 4 open | 79% | 92% | 79% | 96% | 92% | 96% | 75% | 67% | 17% | 79% |
