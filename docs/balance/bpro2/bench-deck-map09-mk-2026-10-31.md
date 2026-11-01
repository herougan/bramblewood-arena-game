# Focused decks: Map 9 The Kelp Mangroves (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7280 games in 97 s.

- The list (15): Archerfish, Banded Sea Krait, Booming Bittern, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Proboscis Monkey, Reef Shark, Sea Turtle Elder, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (12 copies at 1+ Lumber, average 0.6); tide x15; guard x11 | 79% (74%-84%) | 0.6 | 0: 8, 1: 12 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Proboscis Monkey, 4x Sunbittern Strider, 3x Mangrove Manatee, 1x Mangrove Monitor | 7 |
| 2 | family:tide | big (12 copies at 1+ Lumber, average 0.6); tide x11; guard x7 | 76% (71%-81%) | 0.6 | 0: 8, 1: 12 | 4x Banded Sea Krait, 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 3x Mangrove Manatee, 3x Sunbittern Strider, 2x Booming Bittern | 8 |
| 3 | open | big (15 copies at 1+ Lumber, average 0.8); tide x12; guard x11 | 74% (69%-79%) | 0.75 | 0: 5, 1: 15 | 4x Banded Sea Krait, 4x Fiddler Crab Swarm, 4x Mangrove Monitor, 4x Proboscis Monkey, 3x Mangrove Manatee, 1x Mangrove Mudskipper | 0 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.7); tide x13; armor x8 | 59% (53%-65%) | 0.7 | 0: 8, 1: 10, 2: 2 | 4x Fiddler Crab Swarm, 4x Horseshoe Crab, 4x Mangrove Mudskipper, 3x Mangrove Manatee, 3x Mangrove Monitor, 2x Reef Shark | 9 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 79% | 63% | 83% | 100% | 92% | 88% | 79% | 92% | 71% | 46% |
| 2 family:tide | 88% | 63% | 88% | 100% | 83% | 67% | 71% | 83% | 63% | 54% |
| 3 open | 83% | 67% | 83% | 92% | 79% | 88% | 67% | 75% | 67% | 42% |
| 4 family:armor | 58% | 42% | 63% | 83% | 54% | 67% | 46% | 71% | 63% | 46% |
