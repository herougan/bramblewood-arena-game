# Focused decks: Map 9 The Kelp Mangroves (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool banded-sea-krait,booming-bittern,cane-toad,conch-crawler,crocodile-ambusher,fiddler-crab-swarm,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7100 games in 108 s.

- The list (15): Banded Sea Krait, Booming Bittern, Cane Toad, Conch Crawler, Crocodile Ambusher, Fiddler Crab Swarm, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Proboscis Monkey, Reef Shark, Sea Turtle Elder, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x15; guard x11 | 87% (83%-91%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Mangrove Manatee, 1x Mangrove Monitor | 10 |
| 2 | family:armor | big (12 copies at 1+ Lumber, average 0.8); tide x12; armor x8 | 73% (68%-78%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Banded Sea Krait, 4x Fiddler Crab Swarm, 4x Mangrove Monitor, 4x Mangrove Mudskipper, 4x Sea Turtle Elder | 12 |
| 3 | open | big (16 copies at 1+ Lumber, average 0.8); tide x6 | 71% (67%-76%) | 0.8 | 0: 4, 1: 16 | 4x Banded Sea Krait, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Horseshoe Crab, 3x Mangrove Kingfisher, 2x Mangrove Manatee | 0 |
| 4 | big | big (13 copies at 1+ Lumber, average 1.1); tide x18; armor x8 | 65% (60%-71%) | 1.05 | 0: 7, 1: 5, 2: 8 | 4x Conch Crawler, 4x Reef Shark, 4x Sea Turtle Elder, 3x Mangrove Manatee, 3x Mangrove Mudskipper, 2x Banded Sea Krait | 13 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 100% | 88% | 92% | 96% | 100% | 92% | 63% | 46% |
| 2 family:armor | 92% | 92% | 92% | 88% | 75% | 75% | 83% | 71% | 38% | 29% |
| 3 open | 83% | 96% | 88% | 79% | 79% | 83% | 67% | 92% | 25% | 21% |
| 4 big | 79% | 96% | 71% | 67% | 75% | 88% | 63% | 75% | 25% | 17% |
