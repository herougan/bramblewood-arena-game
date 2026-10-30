# Focused decks: Map 9 The Kelp Mangroves (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,anhinga-spearbird,archerfish,banded-sea-krait,booming-bittern,caiman-hatchling,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,giant-cave-huntsman,great-crested-grebe,greater-siren,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,minnow-skitter,mudpuppy,newt-doctor,otter-centurion,pincushion-urchin,reef-shark,shallows-fry,sunbittern-strider,vampire-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:tide,open --anchor archerfish,banded-sea-krait,booming-bittern,caiman-hatchling,crocodile-ambusher,fiddler-crab-swarm,fishing-cat,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,minnow-skitter,mudpuppy,reef-shark,sunbittern-strider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13060 games in 177 s.

- The list (27): Alley Cat, Alligator Gar, Anhinga Spearbird, Archerfish, Banded Sea Krait, Booming Bittern, Caiman Hatchling, Crocodile Ambusher, Fiddler Crab Swarm, Fishing Cat, Giant Cave Huntsman, Great Crested Grebe, Greater Siren, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Minnow Skitter, Mudpuppy, Newt Doctor, Otter Centurion, Pincushion Urchin, Reef Shark, Shallows Fry, Sunbittern Strider, Vampire Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (9 copies at 1+ Lumber, average 0.5); tide x11 | 80% (75%-85%) | 0.45 | 0: 11, 1: 9 | 4x Fiddler Crab Swarm, 4x Minnow Skitter, 3x Alley Cat, 3x Banded Sea Krait, 3x Greater Siren, 3x Wolf Spider Mother | 9 |
| 2 | swarm | swarm (14 copies at 0 Lumber); tide x7; bleed x6 | 80% (75%-85%) | 0.3 | 0: 14, 1: 6 | 4x Minnow Skitter, 4x Mudpuppy, 3x Alley Cat, 3x Alligator Gar, 3x Caiman Hatchling, 3x Wolf Spider Mother | 10 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5); tide x13; armor x7 | 77% (72%-82%) | 0.45 | 0: 11, 1: 9 | 4x Fiddler Crab Swarm, 4x Vampire Bat, 3x Alligator Gar, 3x Mangrove Manatee, 3x Minnow Skitter, 3x Sunbittern Strider | 10 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4); tide x14; armor x7 | 74% (68%-79%) | 0.4 | 0: 12, 1: 8 | 4x Caiman Hatchling, 4x Fiddler Crab Swarm, 4x Minnow Skitter, 3x Alligator Gar, 3x Greater Siren, 2x Giant Cave Huntsman | 0 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 92% | 71% | 71% | 79% | 88% | 92% | 88% | 88% | 67% | 67% |
| 2 swarm | 88% | 63% | 67% | 83% | 92% | 88% | 92% | 83% | 71% | 71% |
| 3 big | 96% | 58% | 88% | 79% | 75% | 88% | 83% | 96% | 42% | 67% |
| 4 open | 79% | 54% | 54% | 75% | 83% | 96% | 75% | 92% | 58% | 71% |
