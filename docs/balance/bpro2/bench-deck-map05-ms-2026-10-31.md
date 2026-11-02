# Focused decks: Map 5 The Sunken Grove (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,anhinga-spearbird,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,snapper-hatchling,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6720 games in 95 s.

- The list (15): Alligator Gar, Anhinga Spearbird, Bog Leech, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Fen Mink, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Old Snapjaw, Snapper Hatchling, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber); tide x7; bleed x6 | 77% (72%-83%) | 0.25 | 0: 15, 1: 5 | 4x Caiman Hatchling, 4x Grass Viper, 4x Mangrove Mudskipper, 3x Alligator Gar, 3x Bog Leech, 2x Hedgehog Herbalist | 0 |
| 2 | swarm | swarm (15 copies at 0 Lumber); tide x9; bleed x6 | 76% (70%-81%) | 0.25 | 0: 15, 1: 5 | 4x Bog Leech, 4x Caiman Hatchling, 4x Snapper Hatchling, 3x Hedgehog Herbalist, 3x Mangrove Mudskipper, 2x Alligator Gar | 6 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers); tide x7 | 57% (50%-63%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Constrictor Coil, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 4x Venomlord Serpent, 3x Alligator Gar, 1x Grass Viper | 12 |
| 4 | family:armor | economy (4 resource makers); armor x8; tide x6 | 55% (49%-62%) | 0.7 | 0: 12, 1: 2, 2: 6 | 4x Grass Viper, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Old Snapjaw, 3x Swamp Alligator, 2x Alligator Gar | 10 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 92% | 96% | 75% | 63% | 96% | 29% | 92% |
| 2 swarm | 88% | 96% | 83% | 58% | 96% | 29% | 79% |
| 3 big | 67% | 92% | 50% | 38% | 79% | 8% | 63% |
| 4 family:armor | 71% | 63% | 54% | 54% | 75% | 8% | 63% |
