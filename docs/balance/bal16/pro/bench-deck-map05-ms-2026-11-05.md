# Focused decks: Map 5 The Sunken Grove (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alley-cat,alligator-gar,alpine-marmot,anhinga-spearbird,banded-sea-krait,blue-ringed-octopus,bog-leech,booming-bittern,caiman-hatchling,constrictor-coil,crocodile-ambusher,eagle-owl-quartermaster,fen-mink,fire-ant-raft,grass-viper,great-barracuda,guppy,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,old-sturgeon,otter-centurion,snapper-hatchling,swamp-alligator,venomlord-serpent,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:armor,big,open --anchor alligator-gar,anhinga-spearbird,bog-leech,caiman-hatchling,constrictor-coil,crocodile-ambusher,fen-mink,grass-viper,hedgehog-herbalist,mangrove-mudskipper,nutria-reedcutter,old-snapjaw,snapper-hatchling,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6972 games in 136 s.

- The list (27): Alley Cat, Alligator Gar, Alpine Marmot, Anhinga Spearbird, Banded Sea Krait, Blue-ringed Octopus, Bog Leech, Booming Bittern, Caiman Hatchling, Constrictor Coil, Crocodile Ambusher, Eagle-Owl Quartermaster, Fen Mink, Fire Ant Raft, Grass Viper, Great Barracuda, Guppy, Hedgehog Herbalist, Mangrove Mudskipper, Nutria Reedcutter, Old Snapjaw, Old Sturgeon, Otter Centurion, Snapper Hatchling, Swamp Alligator, Venomlord Serpent, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | bleed x7; tide x7 | 76% (71%-81%) | 0.35 | 0: 13, 1: 7 | 4x Bog Leech, 4x Caiman Hatchling, 4x Fire Ant Raft, 3x Alligator Gar, 3x Alpine Marmot, 2x Otter Centurion | 0 |
| 2 | family:tide | swarm (15 copies at 0 Lumber); tide x10 | 74% (69%-80%) | 0.25 | 0: 15, 1: 5 | 4x Alpine Marmot, 4x Grass Viper, 4x Mangrove Mudskipper, 3x Great Barracuda, 3x Snapper Hatchling, 2x Blue-ringed Octopus | 17 |
| 3 | big | big (8 copies at 2+ Lumber, average 0.9) | 45% (39%-52%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Alpine Marmot, 4x Constrictor Coil, 4x Crocodile Ambusher, 3x Mangrove Mudskipper, 3x Nutria Reedcutter, 2x Hedgehog Herbalist | 17 |
| 4 | family:armor | armor x8; tide x8 | 45% (38%-51%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Mangrove Mudskipper, 4x Old Sturgeon, 4x Swamp Alligator, 3x Blue-ringed Octopus, 3x Hedgehog Herbalist, 2x Alpine Marmot | 18 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 96% | 100% | 75% | 67% | 100% | 21% | 75% |
| 2 family:tide | 96% | 100% | 79% | 50% | 92% | 54% | 50% |
| 3 big | 75% | 83% | 42% | 38% | 58% | 13% | 8% |
| 4 family:armor | 75% | 58% | 33% | 29% | 67% | 38% | 13% |
