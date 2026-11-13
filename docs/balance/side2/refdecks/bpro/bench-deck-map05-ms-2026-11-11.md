# Focused decks: Map 5 The Sunken Grove (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,matamata,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,river-carp,swamp-alligator --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6748 games in 128 s.

- The list (13): Bog Leech, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Matamata, Mudpuppy, Muskrat Reedgatherer, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Peat-cutter Vole, River Carp, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (8 copies at 1+ Lumber, average 0.6); armor x8 | 69% (63%-75%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Matamata, 4x Muskrat Reedgatherer, 4x Peat-cutter Vole, 4x Swamp Alligator, 3x Mudpuppy, 1x Nutria Reedcutter | 11 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); heal x8 | 67% (61%-73%) | 0.4 | 0: 12, 1: 8 | 4x Bog Leech, 4x Cypress Root Lurker, 4x Matamata, 4x Mudpuppy, 4x Newt Doctor | 11 |
| 3 | swarm | swarm (14 copies at 0 Lumber); heal x6 | 61% (54%-67%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Newt Doctor, 4x Nutria Reedcutter, 4x Peat-cutter Vole, 3x Crocodile Ambusher, 3x Matamata, 2x Mudpuppy | 11 |
| 4 | open | midrange (average 0.5 Lumber) | 60% (53%-66%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x Cypress Root Lurker, 4x Muskrat Reedgatherer, 4x Newt Doctor, 4x Peat-cutter Vole, 3x Old Snapjaw, 1x Mudpuppy | 0 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 88% | 79% | 63% | 50% | 100% | 38% | 67% |
| 2 big | 83% | 67% | 83% | 54% | 96% | 13% | 75% |
| 3 swarm | 88% | 71% | 71% | 50% | 83% | 17% | 46% |
| 4 open | 96% | 75% | 46% | 38% | 88% | 8% | 67% |
