# Focused decks: Map 5 Gatorback Swamp (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alligator-gar,anhinga-spearbird,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7020 games in 80 s.

- The list (17): Alligator Gar, Anhinga Spearbird, Bog Leech, Box Turtle, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Fen Mink, Fire Ant Raft, Grass Viper, Muskrat Reedgatherer, Nutria Reedcutter, Old Snapjaw, Snapper Hatchling, Snapstick Turtle, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 88% (84%-92%) | 0.2 | 0: 16, 1: 4 | 4x Bog Leech, 4x Box Turtle, 4x Grass Viper, 4x Muskrat Reedgatherer, 4x Snapstick Turtle | 15 |
| 2 | economy | economy (6 resource makers) | 87% (83%-91%) | 0.35 | 0: 13, 1: 7 | 4x Box Turtle, 4x Fire Ant Raft, 3x Bog Leech, 3x Cypress Root Lurker, 3x Muskrat Reedgatherer, 3x Nutria Reedcutter | 8 |
| 3 | open | economy (5 resource makers); tide x7 | 81% (77%-86%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Box Turtle, 4x Constrictor Coil, 4x Fire Ant Raft, 4x Nutria Reedcutter, 3x Alligator Gar, 1x Muskrat Reedgatherer | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.8); economy (4 resource makers); bleed x7 | 81% (76%-86%) | 0.8 | 0: 12, 2: 8 | 4x Bog Leech, 4x Box Turtle, 4x Constrictor Coil, 4x Muskrat Reedgatherer, 3x Old Snapjaw, 1x Swamp Alligator | 11 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 100% | 79% | 100% | 96% | 96% | 75% | 92% | 58% | 88% |
| 2 economy | 88% | 100% | 75% | 100% | 83% | 100% | 96% | 96% | 42% | 92% |
| 3 open | 83% | 96% | 79% | 100% | 88% | 96% | 75% | 67% | 33% | 96% |
| 4 big | 71% | 92% | 83% | 96% | 88% | 92% | 88% | 71% | 50% | 79% |
