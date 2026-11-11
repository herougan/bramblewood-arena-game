# Focused decks: Map 6 Sable Swampmire (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,bone-diviner,booming-bittern,box-turtle,camouflage-frog,constrictor-coil,cypress-root-lurker,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-viper,heron-hag,lamprey,meadow-frog,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,old-sturgeon,otter-centurion,owl-sentinel,pond-algae,raft-spider,sunbittern-strider,venomlord-serpent,water-shrew --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:flying,open --anchor adder-ambusher,alligator-gar,anhinga-spearbird,bone-diviner,booming-bittern,camouflage-frog,constrictor-coil,cypress-root-lurker,grass-viper,heron-hag,lamprey,mosquito-cloud,newt-doctor,nutria-reedcutter,owl-sentinel,pond-algae,sunbittern-strider,venomlord-serpent,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9702 games in 123 s.

- The list (31): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Bone Diviner, Booming Bittern, Box Turtle, Camouflage Frog, Constrictor Coil, Cypress Root Lurker, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Viper, The Heron Hag, Lamprey, Meadow Frog, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Old Sturgeon, Otter Centurion, Owl Sentinel, Pond Algae, Raft Spider, Sunbittern Strider, Venomlord Serpent, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | flying x7 | 96% (94%-98%) | 0.35 | 0: 13, 1: 7 | 4x Box Turtle, 4x Nutria Reedcutter, 4x Owl Sentinel, 3x Adder Ambusher, 3x Gannet Nestweaver, 2x Alley Cat | 0 |
| 2 | family:flying | swarm (15 copies at 0 Lumber); bleed x8; flying x8 | 92% (89%-95%) | 0.25 | 0: 15, 1: 5 | 4x Alley Cat, 4x Box Turtle, 4x Mosquito Cloud, 4x Owl Sentinel, 3x Grass Viper, 1x Raft Spider | 10 |
| 3 | economy | economy (7 resource makers); flying x7; poison x6 | 91% (88%-93%) | 0.45 | 0: 11, 1: 9 | 4x Gannet Nestweaver, 4x Newt Doctor, 3x Adder Ambusher, 3x Driftwood Crab, 3x The Heron Hag, 3x Meadow Frog | 14 |
| 4 | family:tide | tide x8 | 89% (86%-92%) | 0.4 | 0: 12, 1: 8 | 4x Box Turtle, 4x Cypress Root Lurker, 4x Meadow Frog, 4x Newt Doctor, 3x Alligator Gar, 1x Raft Spider | 16 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 100% | 88% | 100% | 100% | 100% | 100% | 83% | 83% |
| 2 family:flying | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 92% | 63% | 63% |
| 3 economy | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 92% | 54% | 54% |
| 4 family:tide | 100% | 100% | 96% | 96% | 92% | 100% | 100% | 100% | 96% | 33% | 67% |
