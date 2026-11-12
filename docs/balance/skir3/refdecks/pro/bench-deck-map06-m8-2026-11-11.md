# Focused decks: Map 6 Sable Swampmire (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,booming-bittern,box-turtle,camouflage-frog,constrictor-coil,crocodile-ambusher,cypress-root-lurker,driftwood-crab,fen-mink,fire-ant-raft,gannet-nestweaver,grass-snake,grass-viper,heron-hag,meadow-frog,mosquito-cloud,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,pond-algae,raft-spider,venomlord-serpent,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:poison,family:tide,big,open --anchor adder-ambusher,alligator-gar,anhinga-spearbird,booming-bittern,camouflage-frog,constrictor-coil,crocodile-ambusher,cypress-root-lurker,grass-viper,heron-hag,mosquito-cloud,newt-doctor,nutria-reedcutter,pond-algae,venomlord-serpent,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9218 games in 129 s.

- The list (28): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Booming Bittern, Box Turtle, Camouflage Frog, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Driftwood Crab, Fen Mink, Fire Ant Raft, Gannet Nestweaver, Grass Snake, Grass Viper, The Heron Hag, Meadow Frog, Mosquito Cloud, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Pond Algae, Raft Spider, Venomlord Serpent, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | swarm (17 copies at 0 Lumber); economy (4 resource makers); poison x11 | 92% (90%-95%) | 0.15 | 0: 17, 1: 3 | 4x Alley Cat, 4x Gannet Nestweaver, 4x Grass Viper, 4x Water Shrew, 3x Adder Ambusher, 1x Mosquito Cloud | 16 |
| 2 | family:tide | economy (4 resource makers); tide x10; poison x7 | 84% (81%-88%) | 0.85 | 0: 3, 1: 17 | 4x Camouflage Frog, 4x Driftwood Crab, 4x Fire Ant Raft, 3x The Heron Hag, 3x Newt Doctor, 2x Alligator Gar | 16 |
| 3 | open | economy (4 resource makers) | 84% (81%-87%) | 0.55 | 0: 13, 1: 3, 2: 4 | 4x Constrictor Coil, 4x Gannet Nestweaver, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Otter Centurion, 2x Newt Doctor | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.8) | 79% (75%-83%) | 0.8 | 0: 12, 2: 8 | 4x Alley Cat, 4x Constrictor Coil, 4x Crocodile Ambusher, 4x Grass Viper, 3x Box Turtle, 1x Mudpuppy | 16 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 92% | 71% | 58% |
| 2 family:tide | 100% | 96% | 96% | 100% | 75% | 92% | 100% | 96% | 92% | 50% | 33% |
| 3 open | 100% | 100% | 100% | 96% | 75% | 96% | 100% | 96% | 92% | 29% | 42% |
| 4 big | 100% | 92% | 100% | 88% | 83% | 100% | 100% | 88% | 63% | 38% | 21% |
