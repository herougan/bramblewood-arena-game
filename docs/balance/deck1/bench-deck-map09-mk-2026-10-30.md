# Focused decks: Map 9 The Kelp Mangroves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,guppy,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,muskrat-lodgekeeper,newt-doctor,otter-centurion,pincushion-urchin,proboscis-monkey,puffin-diver,reef-shark,sea-turtle-elder,sunbittern-strider,vampire-bat,water-vole,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus big,swarm,family:tide,open --anchor archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7120 games in 89 s.

- The list (27): Alley Cat, Alligator Gar, Archerfish, Banded Sea Krait, Booming Bittern, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Guppy, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Muskrat Lodgekeeper, Newt Doctor, Otter Centurion, Pincushion Urchin, Proboscis Monkey, Puffin Diver, Reef Shark, Sea Turtle Elder, Sunbittern Strider, Vampire Bat, Water Vole, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); tide x10 | 91% (87%-94%) | 0.3 | 0: 14, 1: 6 | 4x Fiddler Crab Swarm, 4x Newt Doctor, 4x Sunbittern Strider, 3x Guppy, 3x Pincushion Urchin, 2x Archerfish | 13 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5); tide x16; armor x7 | 88% (84%-91%) | 0.5 | 0: 10, 1: 10 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Alligator Gar, 3x Mangrove Manatee, 2x Water Vole | 14 |
| 3 | family:tide | swarm (18 copies at 0 Lumber); tide x13; guard x6 | 88% (84%-91%) | 0.1 | 0: 18, 1: 2 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Vampire Bat, 3x Newt Doctor, 3x Water Vole, 2x Proboscis Monkey | 15 |
| 4 | open | big (10 copies at 1+ Lumber, average 0.5); tide x11 | 81% (76%-85%) | 0.5 | 0: 10, 1: 10 | 4x Pincushion Urchin, 4x Proboscis Monkey, 4x Sunbittern Strider, 3x Otter Centurion, 3x Water Vole, 2x Mangrove Monitor | 0 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 92% | 100% | 100% | 96% | 88% | 96% | 96% | 96% | 67% | 79% |
| 2 big | 100% | 96% | 92% | 100% | 96% | 96% | 96% | 92% | 67% | 46% |
| 3 family:tide | 96% | 100% | 96% | 92% | 83% | 100% | 92% | 92% | 42% | 83% |
| 4 open | 83% | 100% | 88% | 92% | 75% | 88% | 83% | 96% | 54% | 50% |
