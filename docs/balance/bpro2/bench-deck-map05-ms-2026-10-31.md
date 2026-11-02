# Focused decks: Map 5 The Sunken Grove (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,anhinga-spearbird,bog-leech,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6930 games in 117 s.

- The list (13): Alligator Gar, Anhinga Spearbird, Bog Leech, Constrictor Coil, Crocodile Ambusher, Fen Mink, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Old Snapjaw, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); bleed x6 | 68% (63%-74%) | 0.45 | 0: 11, 1: 9 | 4x Grass Viper, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Anhinga Spearbird, 3x Bog Leech, 3x Hedgehog Herbalist | 0 |
| 2 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers) | 62% (55%-69%) | 0.35 | 0: 15, 1: 3, 2: 2 | 4x Fen Mink, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Bog Leech, 3x Hedgehog Herbalist, 2x Old Snapjaw | 10 |
| 3 | family:armor | economy (4 resource makers); armor x9; tide x7 | 61% (55%-68%) | 0.9 | 0: 8, 1: 6, 2: 6 | 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Hedgehog Herbalist, 3x Old Snapjaw, 3x Swamp Alligator | 10 |
| 4 | big | big (10 copies at 2+ Lumber, average 1.1); economy (4 resource makers); tide x6 | 48% (42%-55%) | 1.1 | 0: 8, 1: 2, 2: 10 | 4x Crocodile Ambusher, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Constrictor Coil, 3x Old Snapjaw, 2x Alligator Gar | 14 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 83% | 96% | 71% | 50% | 88% | 13% | 79% |
| 2 swarm | 75% | 71% | 42% | 38% | 96% | 42% | 71% |
| 3 family:armor | 88% | 88% | 58% | 50% | 71% | 13% | 63% |
| 4 big | 50% | 88% | 29% | 42% | 75% | 4% | 50% |
