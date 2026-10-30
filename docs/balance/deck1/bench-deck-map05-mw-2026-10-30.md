# Focused decks: Map 5 Gatorback Swamp (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,alligator-gar,bee-forager,bog-leech,box-turtle,caiman-hatchling,constrictor-coil,crocodile-ambusher,cypress-root-lurker,dam-keeper-beaver,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,grass-viper,guppy,muskrat-lodgekeeper,muskrat-reedgatherer,nutria-reedcutter,otter-centurion,pyrenean-desman,river-mink,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent,water-vole --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alligator-gar,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,snapper-hatchling,snapstick-turtle,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13580 games in 179 s.

- The list (27): Alley Cat, Alligator Gar, Bee Forager, Bog Leech, Box Turtle, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Dam-Keeper Beaver, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Grass Viper, Guppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Nutria Reedcutter, Otter Centurion, Pyrenean Desman, River Mink, Snapper Hatchling, Snapstick Turtle, Swamp Alligator, Venomlord Serpent, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); bleed x7; tide x6 | 87% (83%-91%) | 0.3 | 0: 14, 1: 6 | 4x Bog Leech, 4x Grass Viper, 4x Snapstick Turtle, 3x Alley Cat, 3x Box Turtle, 2x River Mink | 14 |
| 2 | open | bleed x6 | 83% (79%-87%) | 0.55 | 0: 13, 1: 3, 2: 4 | 4x Caiman Hatchling, 4x Crocodile Ambusher, 3x Alley Cat, 3x Bog Leech, 3x Cypress Root Lurker, 3x Otter Centurion | 0 |
| 3 | economy | economy (8 resource makers) | 82% (78%-86%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Nutria Reedcutter, 4x Snapstick Turtle, 3x Otter Centurion, 1x Dam-Keeper Beaver | 17 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.8); economy (6 resource makers) | 79% (74%-83%) | 0.8 | 0: 12, 2: 8 | 4x Constrictor Coil, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Alley Cat, 3x Box Turtle, 2x Gannet Nestweaver | 17 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 88% | 100% | 96% | 96% | 83% | 100% | 92% | 75% | 46% | 96% |
| 2 open | 96% | 92% | 88% | 83% | 83% | 96% | 92% | 63% | 50% | 88% |
| 3 economy | 88% | 96% | 71% | 92% | 88% | 92% | 100% | 79% | 21% | 96% |
| 4 big | 71% | 92% | 83% | 88% | 88% | 96% | 96% | 63% | 21% | 92% |
