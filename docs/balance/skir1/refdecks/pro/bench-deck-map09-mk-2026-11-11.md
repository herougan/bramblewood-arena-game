# Focused decks: Map 9 The Kelp Mangroves (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,anhinga-spearbird,banded-sea-krait,booming-bittern,driftwood-crab,dung-beetle,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,grey-seal-bull,horseshoe-crab,ironclaw-fiddler,mangrove-monitor,mangrove-mudskipper,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,old-sturgeon,otter-centurion,pincushion-urchin,planarian-splitter,proboscis-monkey,raft-spider,sunbittern-strider,voltaic-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor alley-cat,alligator-gar,banded-sea-krait,booming-bittern,driftwood-crab,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,horseshoe-crab,ironclaw-fiddler,mangrove-monitor,mangrove-mudskipper,nutria-reedcutter,proboscis-monkey,sunbittern-strider,voltaic-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2420 games in 412 s.

- The list (28): Alley Cat, Alligator Gar, Anhinga Spearbird, Banded Sea Krait, Booming Bittern, Driftwood Crab, Dung Beetle, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Grey Seal Bull, Horseshoe Crab, Ironclaw Fiddler, Mangrove Monitor, Mangrove Mudskipper, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Old Sturgeon, Otter Centurion, Pincushion Urchin, Planarian Splitter, Proboscis Monkey, Raft Spider, Sunbittern Strider, Voltaic Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6) | 93% (90%-95%) | 0.6 | 0: 8, 1: 12 | 4x Dung Beetle, 4x Nutria Reedcutter, 4x Planarian Splitter, 4x Sunbittern Strider, 3x Giant Cave Huntsman, 1x Alligator Gar | 0 |
| 2 | family:tide | big (20 copies at 1+ Lumber, average 1.1); economy (4 resource makers); tide x10; guard x8 | 86% (82%-90%) | 1.15 | 1: 17, 2: 3 | 4x Driftwood Crab, 4x Grey Seal Bull, 3x Alligator Gar, 3x Giant Cave Huntsman, 3x Planarian Splitter, 3x Voltaic Eel | 13 |
| 3 | family:armor | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); armor x11; guard x9 | 82% (78%-86%) | 0.6 | 0: 8, 1: 12 | 4x Driftwood Crab, 4x Dung Beetle, 4x Fiddler Crab Swarm, 4x Planarian Splitter, 3x Alligator Gar, 1x Muskrat Lodgekeeper | 11 |
| 4 | big | big (16 copies at 1+ Lumber, average 0.9); strike-first x7; armor x6 | 73% (68%-78%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Anhinga Spearbird, 4x Dung Beetle, 3x Alligator Gar, 3x Booming Bittern, 3x Giant Cave Huntsman, 3x Ironclaw Fiddler | 12 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 71% | 58% |
| 2 family:tide | 100% | 100% | 100% | 88% | 92% | 88% | 100% | 83% | 67% | 42% |
| 3 family:armor | 100% | 92% | 96% | 88% | 92% | 79% | 96% | 100% | 54% | 25% |
| 4 big | 96% | 96% | 88% | 75% | 88% | 88% | 83% | 58% | 33% | 25% |
