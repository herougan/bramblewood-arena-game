# Focused decks: Map 5 The Sunken Grove (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alley-cat,alligator-gar,alpine-marmot,anaconda-coil,banded-sea-krait,blue-ringed-octopus,bog-leech,caiman-hatchling,constrictor-coil,cottonmouth-matriarch,crocodile-ambusher,eagle-owl-quartermaster,fen-mink,fire-ant-raft,giant-water-bug,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,otter-centurion,snapper-hatchling,swamp-alligator,venomlord-serpent,wolf-spider-mother,yellow-bellied-sea-snake --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:poison,open --anchor alligator-gar,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,snapper-hatchling,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12810 games in 208 s.

- The list (25): Alley Cat, Alligator Gar, Alpine Marmot, Anaconda Coil, Banded Sea Krait, Blue-ringed Octopus, Bog Leech, Caiman Hatchling, Constrictor Coil, Cottonmouth Matriarch, Crocodile Ambusher, Eagle-Owl Quartermaster, Fen Mink, Fire Ant Raft, Giant Water Bug, Grass Viper, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Otter Centurion, Snapper Hatchling, Swamp Alligator, Venomlord Serpent, Wolf Spider Mother, Yellow-bellied Sea Snake.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); ranged x6 | 85% (80%-90%) | 0.3 | 0: 14, 1: 6 | 4x Bog Leech, 4x Grass Viper, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 3x Hedgehog Herbalist, 3x Otter Centurion | 10 |
| 2 | family:poison | poison x8 | 83% (78%-88%) | 0.85 | 0: 11, 1: 5, 3: 4 | 4x Alpine Marmot, 4x Grass Viper, 4x Venomlord Serpent, 3x Alley Cat, 3x Wolf Spider Mother, 2x Hedgehog Herbalist | 16 |
| 3 | open | midrange (average 0.5 Lumber) | 82% (77%-88%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Alpine Marmot, 4x Bog Leech, 4x Mangrove Mudskipper, 3x Blue-ringed Octopus, 3x Eagle-Owl Quartermaster, 2x Constrictor Coil | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers) | 55% (49%-62%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Constrictor Coil, 4x Crocodile Ambusher, 4x Nutria Reedcutter, 3x Fire Ant Raft, 3x Hedgehog Herbalist, 2x Caiman Hatchling | 18 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 63% | 92% | 92% | 96% | 58% | 100% |
| 2 family:poison | 100% | 67% | 92% | 83% | 100% | 46% | 96% |
| 3 open | 83% | 75% | 92% | 79% | 92% | 54% | 100% |
| 4 big | 63% | 33% | 79% | 33% | 58% | 25% | 96% |
