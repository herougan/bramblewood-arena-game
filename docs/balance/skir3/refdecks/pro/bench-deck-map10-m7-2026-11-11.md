# Focused decks: Map 10 Coral Current (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool alley-cat,alligator-gar,banded-sea-krait,clownfish-scout,conch-crawler,coral-current-eel,crown-of-thorns-star,dolphin-knight,giant-cave-huntsman,giant-clam,horseshoe-crab,ironclaw-fiddler,krill-swarm,limpet-clinger,mangrove-manatee,moon-jelly,mudpuppy,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,rock-pool-starfish,sea-turtle-elder,voltaic-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:armor,big,open --anchor clownfish-scout,conch-crawler,coral-current-eel,crown-of-thorns-star,dolphin-knight,giant-clam,ironclaw-fiddler,krill-swarm,moon-jelly,orca-vanguard,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder,voltaic-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9696 games in 77 s.

- The list (28): Alley Cat, Alligator Gar, Banded Sea Krait, Clownfish Scout, Conch Crawler, Coral Current Eel, Crown-of-thorns Star, Dolphin Outrider, Giant Cave Huntsman, Giant Clam, Horseshoe Crab, Ironclaw Fiddler, Krill Swarm, Limpet Clinger, Mangrove Manatee, Moon Jelly, Mudpuppy, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Rock Pool Starfish, Sea Turtle Elder, Voltaic Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x15 | 96% (94%-98%) | 0.2 | 0: 16, 1: 4 | 4x Clownfish Scout, 4x Krill Swarm, 4x Mudpuppy, 4x Riptide Eel, 3x Dolphin Outrider, 1x Alley Cat | 20 |
| 2 | open | tide x14; armor x7 | 92% (89%-95%) | 0.45 | 0: 11, 1: 9 | 4x Conch Crawler, 4x Pincushion Urchin, 3x Coral Current Eel, 3x Giant Cave Huntsman, 3x Limpet Clinger, 3x Wolf Spider Mother | 0 |
| 3 | family:armor | tide x14; armor x10 | 88% (85%-91%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Limpet Clinger, 4x Riptide Eel, 3x Dolphin Outrider, 3x Horseshoe Crab, 3x Ironclaw Fiddler, 3x Newt Doctor | 17 |
| 4 | big | big (9 copies at 2+ Lumber, average 0.9); tide x16; armor x6 | 86% (82%-89%) | 0.9 | 0: 11, 2: 9 | 4x Alley Cat, 4x Pincushion Urchin, 3x Dolphin Outrider, 3x Ironclaw Fiddler, 3x Sea Turtle Elder, 3x Voltaic Eel | 16 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 96% | 79% | 79% |
| 2 open | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 92% | 100% | 100% | 58% | 54% |
| 3 family:armor | 100% | 96% | 92% | 92% | 100% | 100% | 100% | 100% | 79% | 88% | 58% | 50% |
| 4 big | 96% | 100% | 92% | 92% | 100% | 96% | 100% | 96% | 83% | 83% | 46% | 46% |
