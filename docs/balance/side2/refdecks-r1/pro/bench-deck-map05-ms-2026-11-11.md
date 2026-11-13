# Focused decks: Map 5 The Sunken Grove (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alley-cat,alligator-gar,alpine-marmot,banded-sea-krait,blue-ringed-octopus,bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,eagle-owl-quartermaster,fire-ant-raft,hedgehog-herbalist,ironclaw-fiddler,mosquito-cloud,mudflat-godwit,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,otter-centurion,peat-cutter-vole,raft-spider,snapper-hatchling,swamp-alligator,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:bleed,big,open --anchor bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,hedgehog-herbalist,mudflat-godwit,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,snapper-hatchling,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8918 games in 360 s.

- The list (26): Alley Cat, Alligator Gar, Alpine Marmot, Banded Sea Krait, Blue-ringed Octopus, Bog Leech, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Eagle-Owl Quartermaster, Fire Ant Raft, Hedgehog Herbalist, Ironclaw Fiddler, Mosquito Cloud, Mudflat Godwit, Mudpuppy, Muskrat Reedgatherer, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Peat-cutter Vole, Raft Spider, Snapper Hatchling, Swamp Alligator, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (10 copies at 1+ Lumber, average 0.5); tide x8 | 86% (82%-91%) | 0.5 | 0: 10, 1: 10 | 4x Mudflat Godwit, 4x Peat-cutter Vole, 4x Snapper Hatchling, 3x Blue-ringed Octopus, 3x Wolf Spider Mother, 2x Muskrat Reedgatherer | 0 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.5) | 85% (80%-89%) | 0.45 | 0: 11, 1: 9 | 4x Nutria Reedcutter, 4x Peat-cutter Vole, 3x Blue-ringed Octopus, 3x Eagle-Owl Quartermaster, 3x Hedgehog Herbalist, 3x Mudpuppy | 13 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); tide x8; bleed x6 | 83% (78%-89%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Mudflat Godwit, 4x Snapper Hatchling, 3x Alley Cat, 3x Bog Leech, 2x Hedgehog Herbalist | 12 |
| 4 | family:bleed | swarm (14 copies at 0 Lumber); bleed x8 | 81% (76%-86%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Bog Leech, 4x Mudpuppy, 4x Raft Spider, 2x Hedgehog Herbalist, 2x Nutria Reedcutter | 20 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 88% | 96% | 100% | 58% | 71% |
| 2 big | 100% | 96% | 100% | 88% | 96% | 42% | 71% |
| 3 family:tide | 96% | 83% | 92% | 71% | 100% | 63% | 79% |
| 4 family:bleed | 96% | 92% | 96% | 75% | 100% | 33% | 75% |
