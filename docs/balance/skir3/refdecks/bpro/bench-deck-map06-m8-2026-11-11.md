# Focused decks: Map 6 Sable Swampmire (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m8 --pool adder-ambusher,alligator-gar,anhinga-spearbird,booming-bittern,camouflage-frog,constrictor-coil,crocodile-ambusher,cypress-root-lurker,grass-viper,heron-hag,mosquito-cloud,newt-doctor,nutria-reedcutter,pond-algae,venomlord-serpent,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:poison,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7392 games in 105 s.

- The list (16): Adder Ambusher, Alligator Gar, Anhinga Spearbird, Booming Bittern, Camouflage Frog, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Grass Viper, The Heron Hag, Mosquito Cloud, Newt Doctor, Nutria Reedcutter, Pond Algae, Venomlord Serpent, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 6-1 skirmish's deck; 6-2 skirmish's deck; 6-3 skirmish's deck; 6-4 skirmish's deck; 6-5 elite's deck; 6-6 elite's deck; 6-7 elite's deck; 6-8 miniboss's deck; reference starter deck under 6-1's field; reference deck (Map 6) under 6-2's field; expected player deck (expectedPlayerDeck) under 6-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | swarm (16 copies at 0 Lumber); poison x8 | 86% (83%-89%) | 0.2 | 0: 16, 1: 4 | 4x Cypress Root Lurker, 4x Grass Viper, 4x Mosquito Cloud, 4x Newt Doctor, 4x Water Shrew | 11 |
| 2 | open | poison x7 | 86% (82%-90%) | 0.55 | 0: 9, 1: 11 | 4x Anhinga Spearbird, 4x Cypress Root Lurker, 4x Nutria Reedcutter, 4x Water Shrew, 3x Adder Ambusher, 1x Mosquito Cloud | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber); poison x7 | 85% (82%-88%) | 0.25 | 0: 15, 1: 5 | 4x Grass Viper, 4x Newt Doctor, 4x Nutria Reedcutter, 3x The Heron Hag, 3x Pond Algae, 2x Cypress Root Lurker | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.9) | 68% (63%-72%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Constrictor Coil, 4x Crocodile Ambusher, 4x Newt Doctor, 4x Water Shrew, 2x Alligator Gar, 2x Mosquito Cloud | 15 |

## Per opponent

| Deck | fight:6-1 | fight:6-2 | fight:6-3 | fight:6-4 | fight:6-5 | fight:6-6 | fight:6-7 | fight:6-8 | ref:starter | ref:road6 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 100% | 96% | 96% | 92% | 79% | 100% | 100% | 83% | 96% | 29% | 75% |
| 2 open | 96% | 92% | 96% | 100% | 79% | 96% | 100% | 100% | 83% | 38% | 67% |
| 3 swarm | 100% | 92% | 100% | 100% | 75% | 100% | 100% | 88% | 100% | 25% | 54% |
| 4 big | 92% | 92% | 92% | 92% | 54% | 79% | 92% | 75% | 54% | 17% | 8% |
