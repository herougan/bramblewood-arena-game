# Focused decks: Map 5 The Sunken Grove (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,anhinga-spearbird,bog-leech,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:armor,family:bleed,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6762 games in 135 s.

- The list (13): Alligator Gar, Anhinga Spearbird, Bog Leech, Constrictor Coil, Crocodile Ambusher, Fen Mink, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Old Snapjaw, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:bleed | bleed x10; tide x7 | 56% (50%-62%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Bog Leech, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Old Snapjaw, 2x Anhinga Spearbird | 13 |
| 2 | family:armor | bleed x9; armor x9 | 52% (46%-59%) | 0.9 | 0: 8, 1: 6, 2: 6 | 4x Bog Leech, 4x Grass Viper, 4x Swamp Alligator, 3x Alligator Gar, 3x Hedgehog Herbalist, 2x Old Snapjaw | 12 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); armor x7 | 43% (37%-49%) | 1.05 | 0: 7, 1: 5, 2: 8 | 4x Constrictor Coil, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Alligator Gar, 3x Grass Viper, 2x Anhinga Spearbird | 14 |
| 4 | open | tide x7; armor x6 | 36% (29%-42%) | 1.15 | 0: 8, 1: 5, 2: 3, 3: 4 | 4x Fen Mink, 4x Mangrove Mudskipper, 4x Venomlord Serpent, 3x Alligator Gar, 3x Swamp Alligator, 2x Hedgehog Herbalist | 0 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:bleed | 88% | 92% | 58% | 25% | 88% | 13% | 29% |
| 2 family:armor | 75% | 88% | 58% | 46% | 63% | 21% | 17% |
| 3 big | 75% | 88% | 33% | 29% | 63% | 8% | 8% |
| 4 open | 58% | 63% | 29% | 13% | 63% | 13% | 13% |
