# Focused decks: Map 9 The Kelp Mangroves (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool archerfish,banded-sea-krait,booming-bittern,caiman-hatchling,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,minnow-skitter,mudpuppy,reef-shark,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7220 games in 107 s.

- The list (15): Archerfish, Banded Sea Krait, Booming Bittern, Caiman Hatchling, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Minnow Skitter, Mudpuppy, Reef Shark, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); tide x11 | 78% (72%-83%) | 0.4 | 0: 12, 1: 8 | 4x Caiman Hatchling, 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Mangrove Manatee, 1x Mangrove Kingfisher | 10 |
| 2 | swarm | swarm (17 copies at 0 Lumber); tide x12; heal x7 | 73% (67%-78%) | 0.15 | 0: 17, 1: 3 | 4x Caiman Hatchling, 4x Fiddler Crab Swarm, 4x Minnow Skitter, 4x Mudpuppy, 3x Mangrove Manatee, 1x Mangrove Mudskipper | 6 |
| 3 | family:tide | big (11 copies at 1+ Lumber, average 0.6); tide x9 | 73% (67%-78%) | 0.55 | 0: 9, 1: 11 | 4x Fiddler Crab Swarm, 4x Mangrove Monitor, 4x Sunbittern Strider, 3x Caiman Hatchling, 3x Mangrove Manatee, 2x Minnow Skitter | 12 |
| 4 | open | swarm (15 copies at 0 Lumber); tide x13; heal x6 | 64% (58%-70%) | 0.25 | 0: 15, 1: 5 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Mudpuppy, 3x Fishing Cat, 3x Minnow Skitter, 2x Mangrove Manatee | 0 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 79% | 79% | 83% | 71% | 88% | 88% | 63% | 92% | 67% | 67% |
| 2 swarm | 79% | 71% | 71% | 63% | 83% | 83% | 71% | 88% | 67% | 54% |
| 3 family:tide | 79% | 75% | 67% | 54% | 83% | 67% | 67% | 92% | 75% | 71% |
| 4 open | 38% | 54% | 63% | 58% | 79% | 75% | 79% | 79% | 63% | 50% |
