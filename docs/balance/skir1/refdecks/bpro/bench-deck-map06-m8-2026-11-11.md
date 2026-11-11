# Focused decks: Map 6 Sable Swampmire (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alligator-gar,anhinga-spearbird,bone-diviner,booming-bittern,camouflage-frog,constrictor-coil,cypress-root-lurker,grass-viper,heron-hag,lamprey,mosquito-cloud,newt-doctor,nutria-reedcutter,owl-sentinel,pond-algae,sunbittern-strider,venomlord-serpent,water-shrew --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:poison,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2992 games in 451 s.

- The list (19): Adder Ambusher, Alligator Gar, Anhinga Spearbird, Bone Diviner, Booming Bittern, Camouflage Frog, Constrictor Coil, Cypress Root Lurker, Grass Viper, The Heron Hag, Lamprey, Mosquito Cloud, Newt Doctor, Nutria Reedcutter, Owl Sentinel, Pond Algae, Sunbittern Strider, Venomlord Serpent, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | poison x11; flying x7 | 87% (83%-90%) | 0.4 | 0: 12, 1: 8 | 4x Cypress Root Lurker, 4x Grass Viper, 4x Mosquito Cloud, 4x Water Shrew, 3x The Heron Hag, 1x Alligator Gar | 13 |
| 2 | family:flying | flying x11; poison x9 | 83% (79%-86%) | 0.65 | 0: 7, 1: 13 | 4x Mosquito Cloud, 4x Owl Sentinel, 3x Adder Ambusher, 3x The Heron Hag, 3x Lamprey, 3x Water Shrew | 13 |
| 3 | open | midrange (average 0.8 Lumber) | 75% (71%-79%) | 0.8 | 0: 8, 1: 10, 3: 2 | 4x Mosquito Cloud, 4x Newt Doctor, 4x Sunbittern Strider, 3x Adder Ambusher, 3x Cypress Root Lurker, 2x Venomlord Serpent | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); poison x8; guard x8 | 71% (67%-75%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Cypress Root Lurker, 4x Grass Viper, 4x Newt Doctor, 4x Venomlord Serpent, 2x Bone Diviner, 2x Constrictor Coil | 11 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 96% | 100% | 92% | 100% | 96% | 96% | 100% | 92% | 92% | 38% | 54% |
| 2 family:flying | 96% | 100% | 96% | 100% | 79% | 88% | 100% | 96% | 88% | 38% | 29% |
| 3 open | 92% | 92% | 92% | 96% | 67% | 92% | 100% | 75% | 79% | 21% | 25% |
| 4 big | 88% | 88% | 92% | 96% | 54% | 96% | 96% | 58% | 79% | 8% | 25% |
