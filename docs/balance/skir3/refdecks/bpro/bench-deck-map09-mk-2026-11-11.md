# Focused decks: Map 9 The Kelp Mangroves (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,banded-sea-krait,booming-bittern,driftwood-crab,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,horseshoe-crab,ironclaw-fiddler,mangrove-monitor,mangrove-mudskipper,nutria-reedcutter,proboscis-monkey,voltaic-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7400 games in 107 s.

- The list (15): Alley Cat, Alligator Gar, Banded Sea Krait, Booming Bittern, Driftwood Crab, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Horseshoe Crab, Ironclaw Fiddler, Mangrove Monitor, Mangrove Mudskipper, Nutria Reedcutter, Proboscis Monkey, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); armor x11; tide x11 | 85% (81%-89%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Fiddler Crab Swarm, 4x Horseshoe Crab, 4x Mangrove Mudskipper, 3x Alligator Gar, 1x Giant Cave Huntsman | 12 |
| 2 | big | big (14 copies at 1+ Lumber, average 0.8); economy (4 resource makers); tide x8; guard x7 | 85% (81%-89%) | 0.85 | 0: 6, 1: 11, 2: 3 | 4x Alley Cat, 4x Banded Sea Krait, 4x Driftwood Crab, 3x Proboscis Monkey, 3x Voltaic Eel, 2x Mangrove Mudskipper | 14 |
| 3 | open | big (16 copies at 1+ Lumber, average 0.9); economy (4 resource makers); armor x10; tide x10 | 80% (76%-85%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Driftwood Crab, 4x Mangrove Mudskipper, 3x Alligator Gar, 3x Booming Bittern, 3x Giant Cave Huntsman, 3x Ironclaw Fiddler | 0 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.6); armor x10; guard x7 | 80% (76%-84%) | 0.6 | 0: 8, 1: 12 | 4x Fiddler Crab Swarm, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Banded Sea Krait, 3x Driftwood Crab, 3x Giant Cave Huntsman | 11 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 88% | 92% | 96% | 83% | 88% | 100% | 63% | 46% |
| 2 big | 100% | 100% | 92% | 88% | 88% | 88% | 83% | 92% | 63% | 58% |
| 3 open | 100% | 100% | 88% | 92% | 88% | 79% | 79% | 88% | 50% | 42% |
| 4 family:armor | 100% | 100% | 100% | 88% | 96% | 67% | 67% | 96% | 50% | 38% |
