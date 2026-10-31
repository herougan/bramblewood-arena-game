# Focused decks: Map 5 The Sunken Grove (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,snapper-hatchling,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6650 games in 92 s.

- The list (13): Alligator Gar, Bog Leech, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Fen Mink, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Snapper Hatchling, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber); tide x8 | 75% (69%-81%) | 0.15 | 0: 17, 1: 3 | 4x Mangrove Mudskipper, 4x Snapper Hatchling, 3x Bog Leech, 3x Caiman Hatchling, 3x Grass Viper, 3x Hedgehog Herbalist | 7 |
| 2 | family:tide | swarm (14 copies at 0 Lumber); economy (4 resource makers); tide x10; bleed x6 | 70% (64%-76%) | 0.3 | 0: 14, 1: 6 | 4x Nutria Reedcutter, 4x Snapper Hatchling, 3x Alligator Gar, 3x Bog Leech, 3x Hedgehog Herbalist, 3x Mangrove Mudskipper | 9 |
| 3 | open | swarm (14 copies at 0 Lumber); tide x7 | 70% (64%-75%) | 0.3 | 0: 14, 1: 6 | 4x Caiman Hatchling, 4x Grass Viper, 4x Mangrove Mudskipper, 3x Alligator Gar, 3x Hedgehog Herbalist, 2x Nutria Reedcutter | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); economy (4 resource makers) | 68% (63%-74%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Bog Leech, 4x Constrictor Coil, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Hedgehog Herbalist, 1x Alligator Gar | 14 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 79% | 75% | 63% | 79% | 50% | 83% |
| 2 family:tide | 83% | 79% | 58% | 38% | 92% | 38% | 100% |
| 3 open | 92% | 58% | 83% | 42% | 96% | 25% | 92% |
| 4 big | 83% | 71% | 88% | 50% | 88% | 13% | 88% |
