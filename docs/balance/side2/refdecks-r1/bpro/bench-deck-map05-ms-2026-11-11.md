# Focused decks: Map 5 The Sunken Grove (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,hedgehog-herbalist,mudflat-godwit,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,swamp-alligator --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6510 games in 189 s.

- The list (13): Bog Leech, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Hedgehog Herbalist, Mudflat Godwit, Mudpuppy, Muskrat Reedgatherer, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Peat-cutter Vole, Swamp Alligator.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); heal x6 | 93% (90%-97%) | 0.3 | 0: 14, 1: 6 | 4x Bog Leech, 4x Mudpuppy, 4x Peat-cutter Vole, 3x Hedgehog Herbalist, 3x Mudflat Godwit, 2x Newt Doctor | 13 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.5) | 92% (88%-96%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Mudflat Godwit, 4x Mudpuppy, 4x Muskrat Reedgatherer, 4x Nutria Reedcutter, 3x Hedgehog Herbalist, 1x Swamp Alligator | 12 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.8) | 73% (67%-79%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cypress Root Lurker, 4x Mudflat Godwit, 4x Muskrat Reedgatherer, 4x Peat-cutter Vole, 2x Constrictor Coil, 2x Old Snapjaw | 0 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 96% | 96% | 100% | 96% | 83% | 83% |
| 2 big | 100% | 100% | 96% | 88% | 100% | 71% | 92% |
| 3 open | 100% | 75% | 79% | 67% | 88% | 38% | 67% |
