# Focused decks: Map 10 Coral Current (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool alley-cat,alligator-gar,archerfish,banded-sea-krait,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,giant-cave-huntsman,great-barracuda,horseshoe-crab,ironclaw-fiddler,kraken-spawnling,mangrove-manatee,mudpuppy,newt-doctor,open-ocean-hermit-crab,orca-vanguard,otter-centurion,parrotfish,pincushion-urchin,reef-shark,riptide-eel,sea-hare,swordfish-spearman,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:tide,open --anchor banded-sea-krait,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-shark,riptide-eel,swordfish-spearman --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13608 games in 132 s.

- The list (27): Alley Cat, Alligator Gar, Archerfish, Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Giant Cave Huntsman, Great Barracuda, Horseshoe Crab, Ironclaw Fiddler, Kraken Spawnling, Mangrove Manatee, Mudpuppy, Newt Doctor, Open-Ocean Hermit Crab, Orca Vanguard, Otter Centurion, Parrotfish, Pincushion Urchin, Reef Shark, Riptide Eel, Sea Hare, Swordfish Spearman, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | economy (4 resource makers); tide x12 | 89% (86%-92%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Reef Shark, 3x Giant Cave Huntsman, 3x Wolf Spider Mother, 2x Sea Hare | 18 |
| 2 | open | swarm (14 copies at 0 Lumber); tide x13; cleave x7 | 79% (75%-83%) | 0.3 | 0: 14, 1: 6 | 4x Parrotfish, 4x Riptide Eel, 4x Sea Hare, 3x Alley Cat, 3x Pincushion Urchin, 2x Mangrove Manatee | 0 |
| 3 | swarm | swarm (14 copies at 0 Lumber); tide x15 | 72% (68%-77%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Clownfish Scout, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 3x Archerfish, 3x Reef Shark, 2x Sea Hare | 14 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); cleave x11; tide x8 | 71% (66%-75%) | 1.65 | 0: 3, 1: 9, 3: 8 | 4x Kraken Spawnling, 4x Orca Vanguard, 4x Riptide Eel, 3x Alley Cat, 3x Wolf Spider Mother, 2x Archerfish | 13 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 100% | 100% | 100% | 100% | 92% | 88% | 100% | 79% | 96% | 33% | 88% |
| 2 open | 96% | 96% | 88% | 100% | 100% | 88% | 75% | 83% | 63% | 88% | 8% | 67% |
| 3 swarm | 75% | 92% | 92% | 92% | 83% | 79% | 54% | 92% | 46% | 83% | 8% | 71% |
| 4 big | 96% | 100% | 83% | 88% | 79% | 92% | 54% | 83% | 67% | 54% | 13% | 42% |
