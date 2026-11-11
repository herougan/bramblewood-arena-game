# Focused decks: Map 10 Coral Current (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool alley-cat,alligator-gar,banded-sea-krait,clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,coral-reef-shark,crown-of-thorns-star,dolphin-knight,giant-cave-huntsman,giant-clam,grey-seal-bull,horseshoe-crab,ironclaw-fiddler,krill-swarm,limpet-clinger,mangrove-manatee,moon-jelly,mudpuppy,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,parrotfish,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,rock-pool-starfish,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,coral-reef-shark,crown-of-thorns-star,dolphin-knight,giant-clam,grey-seal-bull,ironclaw-fiddler,krill-swarm,moon-jelly,nautilus-drifter,orca-vanguard,parrotfish,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9336 games in 61 s.

- The list (35): Alley Cat, Alligator Gar, Banded Sea Krait, Clownfish Scout, Conch Crawler, Coral Current Eel, Coral Polyp Colony, Coral Reef Shark, Crown-of-thorns Star, Dolphin Outrider, Giant Cave Huntsman, Giant Clam, Grey Seal Bull, Horseshoe Crab, Ironclaw Fiddler, Krill Swarm, Limpet Clinger, Mangrove Manatee, Moon Jelly, Mudpuppy, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Parrotfish, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Rock Pool Starfish, Sea Bass, Sea Turtle Elder, Tide Seahorse, Voltaic Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (15 copies at 0 Lumber); tide x15 | 94% (92%-97%) | 0.25 | 0: 15, 1: 5 | 4x Alley Cat, 4x Clownfish Scout, 4x Limpet Clinger, 4x Riptide Eel, 3x Dolphin Outrider, 1x Giant Cave Huntsman | 11 |
| 2 | family:armor | swarm (17 copies at 0 Lumber); tide x20; armor x8 | 88% (85%-92%) | 0.15 | 0: 17, 1: 3 | 4x Clownfish Scout, 4x Conch Crawler, 4x Limpet Clinger, 3x Krill Swarm, 3x Mangrove Manatee, 2x Dolphin Outrider | 13 |
| 3 | open | tide x15 | 88% (84%-91%) | 0.35 | 0: 13, 1: 7 | 4x Clownfish Scout, 4x Krill Swarm, 4x Mudpuppy, 4x Riptide Eel, 3x Grey Seal Bull, 1x Alley Cat | 0 |
| 4 | big | big (9 copies at 2+ Lumber, average 0.9); tide x20 | 80% (76%-84%) | 0.9 | 0: 11, 2: 9 | 4x Parrotfish, 4x Pincushion Urchin, 4x Reef Shark, 3x Dolphin Outrider, 3x Voltaic Eel, 2x Ironclaw Fiddler | 20 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 92% | 88% | 96% | 75% | 83% |
| 2 family:armor | 88% | 100% | 100% | 96% | 100% | 92% | 96% | 75% | 79% | 96% | 67% | 71% |
| 3 open | 100% | 96% | 96% | 96% | 96% | 100% | 92% | 88% | 83% | 88% | 54% | 63% |
| 4 big | 92% | 88% | 100% | 88% | 92% | 92% | 79% | 83% | 79% | 83% | 54% | 33% |
