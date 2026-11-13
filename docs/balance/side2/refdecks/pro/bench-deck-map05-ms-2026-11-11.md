# Focused decks: Map 5 The Sunken Grove (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alley-cat,alligator-gar,alpine-marmot,banded-sea-krait,blue-ringed-octopus,bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,eagle-owl-quartermaster,fire-ant-raft,ironclaw-fiddler,matamata,mosquito-cloud,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,otter-centurion,peat-cutter-vole,raft-spider,river-carp,swamp-alligator,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:bleed,big,open --anchor bog-leech,constrictor-coil,crocodile-ambusher,cypress-root-lurker,matamata,mudpuppy,muskrat-reedgatherer,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,river-carp,swamp-alligator --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8904 games in 198 s.

- The list (25): Alley Cat, Alligator Gar, Alpine Marmot, Banded Sea Krait, Blue-ringed Octopus, Bog Leech, Constrictor Coil, Crocodile Ambusher, Cypress Root Lurker, Eagle-Owl Quartermaster, Fire Ant Raft, Ironclaw Fiddler, Matamata, Mosquito Cloud, Mudpuppy, Muskrat Reedgatherer, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Peat-cutter Vole, Raft Spider, River Carp, Swamp Alligator, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (9 copies at 1+ Lumber, average 0.6); armor x9 | 74% (69%-80%) | 0.55 | 0: 11, 1: 7, 2: 2 | 4x Matamata, 4x Nutria Reedcutter, 4x River Carp, 3x Alligator Gar, 3x Mudpuppy, 2x Ironclaw Fiddler | 14 |
| 2 | open | big (9 copies at 1+ Lumber, average 0.5); guard x8 | 74% (69%-80%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Cypress Root Lurker, 4x Newt Doctor, 3x Alligator Gar, 3x River Carp, 2x Wolf Spider Mother | 0 |
| 3 | big | big (13 copies at 1+ Lumber, average 0.9); armor x9; tide x7 | 67% (61%-73%) | 0.95 | 0: 7, 1: 7, 2: 6 | 4x Fire Ant Raft, 4x Muskrat Reedgatherer, 3x Ironclaw Fiddler, 3x Matamata, 3x Nutria Reedcutter, 3x Old Snapjaw | 20 |
| 4 | family:bleed | swarm (14 copies at 0 Lumber); bleed x11 | 65% (59%-72%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Bog Leech, 4x Matamata, 3x Mosquito Cloud, 3x River Carp, 2x Cypress Root Lurker | 15 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 88% | 92% | 88% | 83% | 79% | 25% | 67% |
| 2 open | 92% | 88% | 75% | 58% | 96% | 33% | 79% |
| 3 big | 88% | 100% | 75% | 75% | 75% | 17% | 38% |
| 4 family:bleed | 67% | 92% | 50% | 71% | 92% | 33% | 54% |
