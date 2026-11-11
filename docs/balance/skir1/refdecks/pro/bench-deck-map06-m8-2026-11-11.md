# Focused decks: Map 6 Sable Swampmire (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alley-cat,alligator-gar,anhinga-spearbird,bee-forager,bone-diviner,booming-bittern,box-turtle,caiman-hatchling,camouflage-frog,constrictor-coil,cypress-root-lurker,driftwood-crab,fire-ant-raft,gannet-nestweaver,grass-viper,heron-hag,lamprey,mosquito-cloud,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,old-sturgeon,otter-centurion,owl-sentinel,pond-algae,raft-spider,sunbittern-strider,venomlord-serpent,water-shrew --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:poison,open --anchor adder-ambusher,alligator-gar,anhinga-spearbird,bone-diviner,booming-bittern,camouflage-frog,constrictor-coil,cypress-root-lurker,grass-viper,heron-hag,lamprey,mosquito-cloud,newt-doctor,nutria-reedcutter,owl-sentinel,pond-algae,sunbittern-strider,venomlord-serpent,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2772 games in 357 s.

- The list (31): Adder Ambusher, Alley Cat, Alligator Gar, Anhinga Spearbird, Bee Forager, Bone Diviner, Booming Bittern, Box Turtle, Caiman Hatchling, Camouflage Frog, Constrictor Coil, Cypress Root Lurker, Driftwood Crab, Fire Ant Raft, Gannet Nestweaver, Grass Viper, The Heron Hag, Lamprey, Mosquito Cloud, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Old Sturgeon, Otter Centurion, Owl Sentinel, Pond Algae, Raft Spider, Sunbittern Strider, Venomlord Serpent, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | swarm (14 copies at 0 Lumber); poison x10 | 93% (90%-96%) | 0.3 | 0: 14, 1: 6 | 4x Box Turtle, 4x Grass Viper, 3x Adder Ambusher, 3x Alley Cat, 3x Caiman Hatchling, 3x The Heron Hag | 13 |
| 2 | open | economy (4 resource makers); guard x7 | 92% (89%-95%) | 0.7 | 0: 6, 1: 14 | 4x Anhinga Spearbird, 4x Box Turtle, 4x Driftwood Crab, 3x Adder Ambusher, 3x Cypress Root Lurker, 2x Otter Centurion | 0 |
| 3 | economy | economy (6 resource makers) | 90% (87%-93%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Alley Cat, 4x Pond Algae, 3x Adder Ambusher, 3x Constrictor Coil, 3x Driftwood Crab, 3x Gannet Nestweaver | 14 |
| 4 | family:flying | swarm (18 copies at 0 Lumber); flying x9; bleed x8 | 85% (81%-88%) | 0.1 | 0: 18, 1: 2 | 4x Alley Cat, 4x Grass Viper, 4x Mosquito Cloud, 3x Caiman Hatchling, 3x Gannet Nestweaver, 2x Owl Sentinel | 20 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 96% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 92% | 63% | 75% |
| 2 open | 96% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 63% | 58% |
| 3 economy | 100% | 100% | 100% | 100% | 79% | 100% | 100% | 100% | 100% | 63% | 46% |
| 4 family:flying | 67% | 100% | 100% | 96% | 92% | 100% | 100% | 100% | 92% | 50% | 38% |
