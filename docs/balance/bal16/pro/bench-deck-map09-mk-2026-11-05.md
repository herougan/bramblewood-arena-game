# Focused decks: Map 9 The Kelp Mangroves (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mk --pool alley-cat,alligator-gar,banded-sea-krait,booming-bittern,cane-toad,conch-crawler,crocodile-ambusher,fiddler-crab-swarm,fire-ant-raft,giant-cave-huntsman,grey-seal-bull,guppy,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,newt-doctor,old-sturgeon,otter-centurion,pincushion-urchin,planarian-splitter,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:armor,big,open --anchor banded-sea-krait,booming-bittern,cane-toad,conch-crawler,crocodile-ambusher,fiddler-crab-swarm,horseshoe-crab,mangrove-kingfisher,mangrove-manatee,mangrove-monitor,mangrove-mudskipper,proboscis-monkey,reef-shark,sea-turtle-elder,sunbittern-strider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 106 s.

- The list (27): Alley Cat, Alligator Gar, Banded Sea Krait, Booming Bittern, Cane Toad, Conch Crawler, Crocodile Ambusher, Fiddler Crab Swarm, Fire Ant Raft, Giant Cave Huntsman, Grey Seal Bull, Guppy, Horseshoe Crab, Mangrove Kingfisher, Mangrove Manatee, Mangrove Monitor, Mangrove Mudskipper, Newt Doctor, Old Sturgeon, Otter Centurion, Pincushion Urchin, Planarian Splitter, Proboscis Monkey, Reef Shark, Sea Turtle Elder, Sunbittern Strider, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 9-1 skirmish's deck; 9-2 skirmish's deck; 9-3 skirmish's deck; 9-4 skirmish's deck; 9-5 elite's deck; 9-6 elite's deck; 9-7 miniboss's deck; reference starter deck under 9-1's field; reference deck (Map 9) under 9-2's field; expected player deck (expectedPlayerDeck) under 9-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (8 copies at 1+ Lumber, average 0.4); tide x12; armor x8 | 83% (78%-87%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Guppy, 4x Horseshoe Crab, 4x Mangrove Mudskipper, 3x Planarian Splitter, 1x Giant Cave Huntsman | 17 |
| 2 | family:tide | big (8 copies at 1+ Lumber, average 0.5); tide x16; armor x9 | 82% (78%-86%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Alley Cat, 4x Conch Crawler, 4x Mangrove Mudskipper, 3x Alligator Gar, 3x Fire Ant Raft, 2x Sea Turtle Elder | 17 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); tide x8; armor x7 | 80% (76%-85%) | 0.45 | 0: 11, 1: 9 | 4x Fiddler Crab Swarm, 4x Pincushion Urchin, 3x Alley Cat, 3x Horseshoe Crab, 3x Mangrove Kingfisher, 3x Wolf Spider Mother | 0 |
| 4 | big | big (18 copies at 1+ Lumber, average 1.1); tide x9; poison x7 | 63% (58%-69%) | 1.05 | 0: 2, 1: 15, 2: 3 | 4x Banded Sea Krait, 4x Grey Seal Bull, 4x Mangrove Monitor, 3x Alligator Gar, 3x Cane Toad, 2x Guppy | 20 |

## Per opponent

| Deck | fight:9-1 | fight:9-2 | fight:9-3 | fight:9-4 | fight:9-5 | fight:9-6 | fight:9-7 | ref:starter | ref:road9 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 96% | 100% | 100% | 96% | 92% | 71% | 75% | 92% | 71% | 33% |
| 2 family:tide | 100% | 96% | 96% | 79% | 83% | 96% | 92% | 88% | 50% | 42% |
| 3 open | 92% | 96% | 96% | 92% | 92% | 71% | 75% | 100% | 50% | 42% |
| 4 big | 54% | 88% | 79% | 88% | 83% | 71% | 83% | 46% | 29% | 13% |
