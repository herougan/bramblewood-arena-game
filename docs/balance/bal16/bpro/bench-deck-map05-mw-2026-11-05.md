# Focused decks: Map 5 Gatorback Swamp (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mw --pool alligator-gar,anhinga-spearbird,bog-leech,box-turtle,constrictor-coil,crocodile-ambusher,cypress-root-lurker,fen-mink,fire-ant-raft,grass-viper,muskrat-reedgatherer,nutria-reedcutter,old-snapjaw,pond-algae,snapstick-turtle,swamp-alligator --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:armor,family:bleed,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7440 games in 142 s.

- The list (16): Alligator Gar, Anhinga Spearbird, Bog Leech, Box Turtle, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Fen Mink, Fire Ant Raft, Grass Viper, Muskrat Reedgatherer, Nutria Reedcutter, Old Snapjaw, Pond Algae, Snapstick Turtle, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-1 skirmish's deck; 5-2 skirmish's deck; 5-3 skirmish's deck; 5-4 skirmish's deck; 5-5 elite's deck; 5-6 elite's deck; 5-7 boss's deck; reference starter deck under 5-1's field; reference deck (Map 5) under 5-2's field; expected player deck (expectedPlayerDeck) under 5-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.7); poison x8 | 68% (63%-72%) | 0.7 | 0: 11, 1: 4, 2: 5 | 4x Box Turtle, 4x Crocodile Ambusher, 4x Fire Ant Raft, 4x Grass Viper, 3x Bog Leech, 1x Old Snapjaw | 16 |
| 2 | family:bleed | big (8 copies at 1+ Lumber, average 0.8); bleed x8; armor x8 | 65% (60%-70%) | 0.75 | 0: 12, 1: 1, 2: 7 | 4x Bog Leech, 4x Muskrat Reedgatherer, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Old Snapjaw, 1x Alligator Gar | 14 |
| 3 | open | big (8 copies at 1+ Lumber, average 0.7) | 60% (54%-66%) | 0.65 | 0: 12, 1: 3, 2: 5 | 4x Constrictor Coil, 4x Grass Viper, 4x Muskrat Reedgatherer, 4x Pond Algae, 3x Alligator Gar, 1x Swamp Alligator | 0 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.8); armor x8 | 50% (45%-56%) | 0.85 | 0: 8, 1: 7, 2: 5 | 4x Anhinga Spearbird, 4x Box Turtle, 4x Muskrat Reedgatherer, 4x Swamp Alligator, 3x Alligator Gar, 1x Old Snapjaw | 12 |

## Per opponent

| Deck | fight:5-1 | fight:5-2 | fight:5-3 | fight:5-4 | fight:5-5 | fight:5-6 | fight:5-7 | ref:starter | ref:road5 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 75% | 92% | 54% | 96% | 79% | 88% | 54% | 88% | 17% | 33% |
| 2 family:bleed | 83% | 100% | 42% | 88% | 71% | 75% | 46% | 92% | 21% | 33% |
| 3 open | 71% | 83% | 50% | 75% | 67% | 83% | 38% | 75% | 29% | 29% |
| 4 family:armor | 54% | 75% | 21% | 71% | 54% | 79% | 38% | 79% | 21% | 13% |
