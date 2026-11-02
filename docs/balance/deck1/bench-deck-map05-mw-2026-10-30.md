# Focused decks: Map 5 Gatorback Swamp (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,alligator-gar,anhinga-spearbird,bee-forager,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,dam-keeper-beaver,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,grass-viper,guppy,muskrat-lodgekeeper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,otter-centurion,pyrenean-desman,river-mink,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alligator-gar,anhinga-spearbird,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 107 s.

- The list (28): Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Bog Leech, Box Turtle, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Dam-Keeper Beaver, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Grass Viper, Guppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Pyrenean Desman, River Mink, Snapper Hatchling, Snapstick Turtle, Swamp Alligator, Venomlord Serpent, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (6 resource makers) | 82% (78%-86%) | 0.4 | 0: 12, 1: 8 | 4x Anhinga Spearbird, 4x Fen Mink, 4x Fire Ant Raft, 4x Nutria Reedcutter, 2x Bog Leech, 2x Driftwood Crab | 16 |
| 2 | open | economy (4 resource makers) | 80% (76%-84%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Anhinga Spearbird, 4x Gannet Nestweaver, 4x Grass Viper, 4x Pyrenean Desman, 4x Swamp Alligator | 0 |
| 3 | swarm | swarm (17 copies at 0 Lumber) | 78% (73%-82%) | 0.3 | 0: 17, 2: 3 | 4x Bog Leech, 4x Box Turtle, 4x Grass Viper, 4x Water Vole, 3x Swamp Alligator, 1x Guppy | 13 |
| 4 | big | big (9 copies at 2+ Lumber, average 1.1); bleed x7; flying x7 | 61% (57%-66%) | 1.05 | 0: 11, 2: 6, 3: 3 | 4x Bee Forager, 4x Bog Leech, 3x Constrictor Coil, 3x Gannet Nestweaver, 3x Old Snapjaw, 3x Venomlord Serpent | 17 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 71% | 96% | 100% | 88% | 54% | 96% | 31% | 88% |
| 2 open | 100% | 100% | 79% | 88% | 92% | 96% | 25% | 96% | 42% | 79% |
| 3 swarm | 100% | 100% | 79% | 83% | 88% | 88% | 21% | 75% | 67% | 79% |
| 4 big | 100% | 88% | 50% | 88% | 88% | 75% | 13% | 29% | 13% | 71% |
