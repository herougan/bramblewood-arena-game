# Focused decks: Map 9 The Kelp Mangroves (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool archerfish,banded-sea-krait,booming-bittern,caiman-hatchling,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,minnow-skitter,mudpuppy,reef-shark,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7260 games in 94 s.

- The list (15): Archerfish, Banded Sea Krait, Booming Bittern, Caiman Hatchling, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Minnow Skitter, Mudpuppy, Reef Shark, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber); tide x10; heal x7 | 78% (73%-83%) | 0.3 | 0: 14, 1: 6 | 4x Fiddler Crab Swarm, 4x Mudpuppy, 3x Caiman Hatchling, 3x Mangrove Manatee, 3x Minnow Skitter, 3x Sunbittern Strider | 0 |
| 2 | big | big (12 copies at 1+ Lumber, average 0.6); tide x7; heal x7 | 76% (71%-81%) | 0.6 | 0: 8, 1: 12 | 4x Fiddler Crab Swarm, 4x Mudpuppy, 4x Sunbittern Strider, 3x Banded Sea Krait, 3x Mangrove Manatee, 2x Mangrove Monitor | 6 |
| 3 | swarm | swarm (15 copies at 0 Lumber); tide x15 | 74% (69%-80%) | 0.25 | 0: 15, 1: 5 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Minnow Skitter, 3x Caiman Hatchling, 3x Mangrove Manatee, 2x Mangrove Monitor | 7 |
| 4 | family:tide | big (11 copies at 1+ Lumber, average 0.6); tide x10 | 68% (62%-73%) | 0.55 | 0: 9, 1: 11 | 4x Archerfish, 4x Mangrove Monitor, 4x Mangrove Mudskipper, 3x Mangrove Manatee, 3x Minnow Skitter, 2x Mudpuppy | 12 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 79% | 79% | 75% | 75% | 83% | 67% | 71% | 100% | 75% | 75% |
| 2 big | 79% | 79% | 79% | 75% | 83% | 67% | 71% | 100% | 71% | 54% |
| 3 swarm | 75% | 75% | 63% | 54% | 88% | 79% | 79% | 96% | 67% | 67% |
| 4 family:tide | 50% | 63% | 75% | 54% | 83% | 67% | 67% | 88% | 67% | 63% |
