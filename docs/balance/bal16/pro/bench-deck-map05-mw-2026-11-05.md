# Focused decks: Map 5 Gatorback Swamp (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alley-cat,alligator-gar,anhinga-spearbird,bee-forager,bog-leech,box-turtle,conch-crawler,constrictor-coil,crocodile-ambusher,cypress-root-lurker,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,grass-viper,guppy,muskrat-lodgekeeper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,old-sturgeon,otter-centurion,platypus-spur,pond-algae,pyrenean-desman,snapstick-turtle,swamp-alligator,water-vole --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:armor,big,open --anchor alligator-gar,anhinga-spearbird,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,pond-algae,snapstick-turtle,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7440 games in 148 s.

- The list (28): Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Bog Leech, Box Turtle, Conch Crawler, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Grass Viper, Guppy, Muskrat Lodgekeeper, Muskrat Reedgatherer, Nutria Reedcutter, Old Snapjaw, Old Sturgeon, Otter Centurion, Platypus Spur, Pond Algae, Pyrenean Desman, Snapstick Turtle, Swamp Alligator, Water Vole.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (14 copies at 0 Lumber); tide x8; swarm x7 | 76% (72%-80%) | 0.3 | 0: 14, 1: 6 | 4x Box Turtle, 4x Fire Ant Raft, 4x Pyrenean Desman, 3x Bee Forager, 3x Gannet Nestweaver, 2x Anhinga Spearbird | 16 |
| 2 | open | tide x7 | 65% (60%-70%) | 0.35 | 0: 13, 1: 7 | 4x Box Turtle, 4x Grass Viper, 4x Muskrat Lodgekeeper, 4x Nutria Reedcutter, 3x Alligator Gar, 1x Driftwood Crab | 0 |
| 3 | family:armor | swarm (16 copies at 0 Lumber); economy (4 resource makers); armor x8; tide x6 | 63% (58%-68%) | 0.3 | 0: 16, 1: 2, 2: 2 | 4x Box Turtle, 4x Conch Crawler, 4x Gannet Nestweaver, 4x Grass Viper, 2x Alligator Gar, 2x Old Snapjaw | 10 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.6) | 59% (54%-64%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Cypress Root Lurker, 4x Swamp Alligator, 3x Bog Leech, 3x Box Turtle, 3x Grass Viper, 3x Muskrat Reedgatherer | 14 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 92% | 100% | 46% | 88% | 88% | 100% | 79% | 100% | 33% | 33% |
| 2 open | 79% | 96% | 42% | 88% | 83% | 96% | 42% | 79% | 25% | 25% |
| 3 family:armor | 88% | 96% | 38% | 83% | 83% | 83% | 50% | 71% | 21% | 17% |
| 4 big | 75% | 96% | 46% | 71% | 63% | 83% | 33% | 88% | 17% | 21% |
