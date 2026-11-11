# Focused decks: Map 10 Coral Current (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool alley-cat,banded-sea-krait,clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,crown-of-thorns-star,dolphin-knight,giant-cave-huntsman,giant-clam,grey-seal-bull,horseshoe-crab,ironclaw-fiddler,krill-swarm,limpet-clinger,mangrove-manatee,moon-jelly,mudpuppy,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,rock-pool-starfish,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,crown-of-thorns-star,dolphin-knight,giant-clam,ironclaw-fiddler,krill-swarm,moon-jelly,nautilus-drifter,orca-vanguard,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3072 games in 358 s.

- The list (32): Alley Cat, Banded Sea Krait, Clownfish Scout, Conch Crawler, Coral Current Eel, Coral Polyp Colony, Crown-of-thorns Star, Dolphin Outrider, Giant Cave Huntsman, Giant Clam, Grey Seal Bull, Horseshoe Crab, Ironclaw Fiddler, Krill Swarm, Limpet Clinger, Mangrove Manatee, Moon Jelly, Mudpuppy, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Rock Pool Starfish, Sea Bass, Sea Turtle Elder, Tide Seahorse, Voltaic Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (18 copies at 0 Lumber); tide x16; armor x7 | 90% (87%-93%) | 0.2 | 0: 18, 2: 2 | 4x Alley Cat, 4x Krill Swarm, 4x Limpet Clinger, 3x Conch Crawler, 3x Dolphin Outrider, 2x Reef Shark | 10 |
| 2 | open | tide x14; armor x8 | 88% (85%-91%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Conch Crawler, 4x Limpet Clinger, 3x Alley Cat, 3x Coral Current Eel, 3x Giant Cave Huntsman, 3x Voltaic Eel | 0 |
| 3 | big | big (10 copies at 2+ Lumber, average 1.1); tide x16; armor x7 | 72% (68%-77%) | 1.1 | 0: 8, 1: 2, 2: 10 | 4x Alley Cat, 4x Limpet Clinger, 4x Reef Shark, 3x Ironclaw Fiddler, 3x Voltaic Eel, 2x Riptide Eel | 10 |
| 4 | family:armor | tide x13; armor x11 | 61% (57%-66%) | 1 | 0: 3, 1: 14, 2: 3 | 4x Giant Clam, 4x Horseshoe Crab, 3x Coral Current Eel, 3x Ironclaw Fiddler, 3x Krill Swarm, 3x Wolf Spider Mother | 17 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 96% | 100% | 100% | 88% | 75% | 100% | 88% | 88% | 46% |
| 2 open | 100% | 96% | 100% | 100% | 100% | 96% | 92% | 79% | 100% | 88% | 50% | 54% |
| 3 big | 100% | 88% | 92% | 75% | 100% | 88% | 42% | 63% | 96% | 58% | 29% | 38% |
| 4 family:armor | 75% | 88% | 67% | 67% | 100% | 83% | 38% | 50% | 96% | 33% | 17% | 25% |
