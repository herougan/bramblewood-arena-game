# Focused decks: Map 9 The Kelp Mangroves (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,banded-sea-krait,booming-bittern,driftwood-crab,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,horseshoe-crab,ironclaw-fiddler,mangrove-monitor,mangrove-mudskipper,nutria-reedcutter,proboscis-monkey,sunbittern-strider,voltaic-eel --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3400 games in 685 s.

- The list (16): Alley Cat, Alligator Gar, Banded Sea Krait, Booming Bittern, Driftwood Crab, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Horseshoe Crab, Ironclaw Fiddler, Mangrove Monitor, Mangrove Mudskipper, Nutria Reedcutter, Proboscis Monkey, Sunbittern Strider, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x11; armor x8 | 89% (86%-92%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Banded Sea Krait, 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 3x Alligator Gar, 1x Driftwood Crab | 11 |
| 2 | big | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers) | 88% (85%-91%) | 0.8 | 0: 4, 1: 16 | 4x Alley Cat, 4x Driftwood Crab, 4x Mangrove Monitor, 4x Sunbittern Strider, 3x Giant Cave Huntsman, 1x Alligator Gar | 16 |
| 3 | family:armor | big (12 copies at 1+ Lumber, average 0.8); armor x10; tide x8 | 82% (78%-86%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Alley Cat, 4x Horseshoe Crab, 4x Nutria Reedcutter, 3x Alligator Gar, 3x Ironclaw Fiddler, 2x Proboscis Monkey | 12 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4); armor x9; tide x8 | 80% (76%-84%) | 0.4 | 0: 12, 1: 8 | 4x Fiddler Crab Swarm, 4x Horseshoe Crab, 4x Mangrove Mudskipper, 4x Nutria Reedcutter, 3x Giant Cave Huntsman, 1x Driftwood Crab | 0 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 100% | 88% | 100% | 96% | 50% | 58% |
| 2 big | 100% | 100% | 100% | 96% | 88% | 96% | 96% | 92% | 83% | 29% |
| 3 family:armor | 100% | 100% | 96% | 92% | 83% | 88% | 100% | 88% | 38% | 33% |
| 4 open | 100% | 100% | 96% | 88% | 88% | 75% | 88% | 96% | 46% | 21% |
