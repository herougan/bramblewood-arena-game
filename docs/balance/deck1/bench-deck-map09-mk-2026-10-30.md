# Focused decks: Map 9 The Kelp Mangroves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,great-crested-grebe,guppy,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,moat-snapper,mudpuppy,newt-doctor,otter-centurion,pincushion-urchin,proboscis-monkey,reef-shark,sea-turtle-elder,shallows-fry,sunbittern-strider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus big,swarm,family:tide,open --anchor archerfish,banded-sea-krait,booming-bittern,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6880 games in 89 s.

- The list (27): Alley Cat, Alligator Gar, Archerfish, Banded Sea Krait, Booming Bittern, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Great Crested Grebe, Guppy, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Moat Snapper, Mudpuppy, Newt Doctor, Otter Centurion, Pincushion Urchin, Proboscis Monkey, Reef Shark, Sea Turtle Elder, Shallows Fry, Sunbittern Strider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x14 | 88% (84%-92%) | 0.35 | 0: 13, 1: 7 | 4x Guppy, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Proboscis Monkey, 3x Shallows Fry, 2x Newt Doctor | 16 |
| 2 | big | big (11 copies at 1+ Lumber, average 0.6); tide x12; guard x7 | 88% (84%-91%) | 0.55 | 0: 9, 1: 11 | 4x Archerfish, 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Sunbittern Strider, 3x Mangrove Manatee, 1x Shallows Fry | 10 |
| 3 | swarm | swarm (15 copies at 0 Lumber); tide x12 | 88% (84%-91%) | 0.25 | 0: 15, 1: 5 | 4x Fiddler Crab Swarm, 4x Mangrove Mudskipper, 4x Shallows Fry, 3x Newt Doctor, 3x Wolf Spider Mother, 2x Banded Sea Krait | 13 |
| 4 | open | swarm (14 copies at 0 Lumber); tide x13; heal x7 | 88% (84%-91%) | 0.3 | 0: 14, 1: 6 | 4x Mangrove Mudskipper, 4x Mudpuppy, 3x Alligator Gar, 3x Fiddler Crab Swarm, 3x Mangrove Manatee, 3x Otter Centurion | 0 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 96% | 92% | 96% | 92% | 83% | 96% | 71% | 58% |
| 2 big | 96% | 96% | 96% | 92% | 96% | 96% | 88% | 92% | 67% | 58% |
| 3 swarm | 100% | 100% | 100% | 79% | 100% | 96% | 88% | 92% | 58% | 63% |
| 4 open | 100% | 96% | 96% | 100% | 92% | 100% | 88% | 92% | 58% | 54% |
