# Focused decks: Map 9 The Kelp Mangroves (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,anhinga-spearbird,banded-sea-krait,bee-forager,booming-bittern,driftwood-crab,fiddler-crab-swarm,fire-ant-raft,fishing-cat,giant-cave-huntsman,horseshoe-crab,ironclaw-fiddler,limpet-clinger,mangrove-monitor,mangrove-mudskipper,mudpuppy,newt-doctor,nutria-reedcutter,old-sturgeon,otter-centurion,pincushion-urchin,planarian-splitter,proboscis-monkey,raft-spider,voltaic-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,alligator-gar,banded-sea-krait,booming-bittern,driftwood-crab,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,horseshoe-crab,ironclaw-fiddler,mangrove-monitor,mangrove-mudskipper,nutria-reedcutter,proboscis-monkey,voltaic-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9260 games in 163 s.

- The list (27): Alley Cat, Alligator Gar, Anhinga Spearbird, Banded Sea Krait, Bee Forager, Booming Bittern, Driftwood Crab, Fiddler Crab Swarm, Fire Ant Raft, Fishing Cat, Giant Cave Huntsman, Horseshoe Crab, Ironclaw Fiddler, Limpet Clinger, Mangrove Monitor, Mangrove Mudskipper, Mudpuppy, Newt Doctor, Nutria Reedcutter, Old Sturgeon, Otter Centurion, Pincushion Urchin, Planarian Splitter, Proboscis Monkey, Raft Spider, Voltaic Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (15 copies at 0 Lumber); tide x12 | 84% (80%-88%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Alley Cat, 4x Mangrove Mudskipper, 4x Mudpuppy, 3x Pincushion Urchin, 3x Voltaic Eel, 2x Fire Ant Raft | 10 |
| 2 | big | big (11 copies at 1+ Lumber, average 0.7); economy (4 resource makers); tide x13; armor x10 | 83% (78%-87%) | 0.7 | 0: 9, 1: 8, 2: 3 | 4x Driftwood Crab, 4x Fire Ant Raft, 3x Fiddler Crab Swarm, 3x Limpet Clinger, 3x Newt Doctor, 3x Voltaic Eel | 17 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); tide x10 | 83% (78%-87%) | 0.45 | 0: 11, 1: 9 | 4x Mangrove Mudskipper, 4x Pincushion Urchin, 4x Planarian Splitter, 3x Alley Cat, 3x Driftwood Crab, 2x Old Sturgeon | 0 |
| 4 | family:armor | swarm (16 copies at 0 Lumber); economy (4 resource makers); armor x12; guard x8 | 76% (71%-81%) | 0.2 | 0: 16, 1: 4 | 4x Driftwood Crab, 4x Fiddler Crab Swarm, 4x Limpet Clinger, 4x Mudpuppy, 2x Alley Cat, 2x Nutria Reedcutter | 15 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 100% | 92% | 92% | 79% | 71% | 100% | 71% | 42% |
| 2 big | 96% | 96% | 96% | 88% | 83% | 79% | 63% | 92% | 75% | 58% |
| 3 open | 100% | 100% | 100% | 83% | 92% | 83% | 71% | 96% | 50% | 50% |
| 4 family:armor | 96% | 88% | 88% | 83% | 88% | 83% | 63% | 96% | 46% | 29% |
