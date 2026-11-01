# Focused decks: Map 5 The Sunken Grove (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,anhinga-spearbird,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,snapper-hatchling,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6818 games in 93 s.

- The list (15): Alligator Gar, Anhinga Spearbird, Bog Leech, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Fen Mink, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Old Snapjaw, Snapper Hatchling, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber); tide x9; bleed x6 | 77% (71%-82%) | 0.25 | 0: 15, 1: 5 | 4x Bog Leech, 4x Caiman Hatchling, 4x Snapper Hatchling, 3x Hedgehog Herbalist, 3x Mangrove Mudskipper, 2x Alligator Gar | 9 |
| 2 | open | economy (4 resource makers) | 77% (71%-82%) | 0.65 | 0: 12, 1: 3, 2: 5 | 4x Bog Leech, 4x Caiman Hatchling, 4x Constrictor Coil, 4x Nutria Reedcutter, 3x Hedgehog Herbalist, 1x Old Snapjaw | 0 |
| 3 | family:armor | economy (4 resource makers); armor x10; bleed x6 | 61% (55%-68%) | 0.85 | 0: 10, 1: 3, 2: 7 | 4x Grass Viper, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Alligator Gar, 3x Old Snapjaw, 2x Caiman Hatchling | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); economy (4 resource makers); tide x6 | 58% (52%-65%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 4x Venomlord Serpent, 2x Alligator Gar, 2x Hedgehog Herbalist | 10 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 79% | 96% | 96% | 58% | 92% | 29% | 88% |
| 2 open | 92% | 88% | 92% | 71% | 92% | 25% | 79% |
| 3 family:armor | 79% | 75% | 67% | 67% | 58% | 4% | 79% |
| 4 big | 67% | 83% | 67% | 42% | 71% | 8% | 71% |
