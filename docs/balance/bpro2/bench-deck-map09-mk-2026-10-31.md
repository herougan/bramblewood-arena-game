# Focused decks: Map 9 The Kelp Mangroves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7320 games in 98 s.

- The list (15): Archerfish, Banded Sea Krait, Booming Bittern, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Proboscis Monkey, Reef Shark, Sea Turtle Elder, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (13 copies at 1+ Lumber, average 0.7); tide x13; guard x9 | 76% (71%-81%) | 0.65 | 0: 7, 1: 13 | 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Fiddler Crab Swarm, 3x Mangrove Kingfisher, 3x Mangrove Manatee, 3x Proboscis Monkey | 8 |
| 2 | open | big (16 copies at 1+ Lumber, average 0.8); guard x11; tide x11 | 73% (67%-78%) | 0.8 | 0: 4, 1: 16 | 4x Archerfish, 4x Fiddler Crab Swarm, 4x Proboscis Monkey, 3x Mangrove Kingfisher, 3x Mangrove Manatee, 2x Banded Sea Krait | 0 |
| 3 | family:tide | big (14 copies at 1+ Lumber, average 0.7); tide x9; armor x6 | 66% (60%-72%) | 0.7 | 0: 6, 1: 14 | 4x Horseshoe Crab, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Fishing Cat, 3x Mangrove Manatee, 2x Fiddler Crab Swarm | 15 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.7); tide x16; guard x11 | 66% (60%-71%) | 0.65 | 0: 8, 1: 11, 2: 1 | 4x Fiddler Crab Swarm, 4x Horseshoe Crab, 4x Mangrove Mudskipper, 4x Proboscis Monkey, 3x Mangrove Manatee, 1x Sea Turtle Elder | 9 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 71% | 75% | 83% | 92% | 75% | 71% | 71% | 96% | 58% | 71% |
| 2 open | 75% | 75% | 67% | 88% | 79% | 83% | 63% | 88% | 63% | 46% |
| 3 family:tide | 79% | 75% | 58% | 92% | 67% | 54% | 58% | 71% | 63% | 42% |
| 4 family:armor | 54% | 63% | 79% | 75% | 63% | 75% | 58% | 92% | 71% | 29% |
