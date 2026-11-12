# Focused decks: Map 5 The Sunken Grove (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alley-cat,alligator-gar,alpine-marmot,anhinga-spearbird,blue-ringed-octopus,bog-leech,booming-bittern,caiman-hatchling,cypress-root-lurker,eagle-owl-quartermaster,fire-ant-raft,mosquito-cloud,mudflat-godwit,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,old-snapjaw,otter-centurion,peat-cutter-vole,raft-spider,snapper-hatchling,swamp-alligator,venomlord-serpent,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:bleed,big,open --anchor anhinga-spearbird,bog-leech,caiman-hatchling,cypress-root-lurker,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,snapper-hatchling,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8862 games in 155 s.

- The list (24): Alley Cat, Alligator Gar, Alpine Marmot, Anhinga Spearbird, Blue-ringed Octopus, Bog Leech, Booming Bittern, Caiman Hatchling, Cypress Root Lurker, Eagle-Owl Quartermaster, Fire Ant Raft, Mosquito Cloud, Mudflat Godwit, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Peat-cutter Vole, Raft Spider, Snapper Hatchling, Swamp Alligator, Venomlord Serpent, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:bleed | swarm (14 copies at 0 Lumber); bleed x12 | 80% (75%-86%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Bog Leech, 4x Mosquito Cloud, 4x Mudflat Godwit, 2x Peat-cutter Vole, 2x Wolf Spider Mother | 14 |
| 2 | open | midrange (average 0.5 Lumber) | 76% (71%-81%) | 0.5 | 0: 10, 1: 10 | 4x Alley Cat, 4x Cypress Root Lurker, 4x Raft Spider, 3x Newt Doctor, 3x Peat-cutter Vole, 2x Blue-ringed Octopus | 0 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); tide x10; bleed x6 | 75% (69%-81%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Caiman Hatchling, 4x Mudflat Godwit, 4x Snapper Hatchling, 2x Bog Leech, 2x Raft Spider | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); guard x11 | 38% (32%-44%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Alpine Marmot, 4x Swamp Alligator, 4x Venomlord Serpent, 3x Alley Cat, 3x Cypress Root Lurker, 2x Bog Leech | 14 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:bleed | 100% | 92% | 79% | 88% | 96% | 58% | 50% |
| 2 open | 100% | 83% | 88% | 63% | 100% | 17% | 79% |
| 3 family:tide | 100% | 92% | 58% | 71% | 96% | 54% | 54% |
| 4 big | 92% | 58% | 8% | 13% | 63% | 4% | 29% |
