# Focused decks: Map 10 Coral Current (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,coral-reef-shark,crown-of-thorns-star,dolphin-knight,giant-clam,grey-seal-bull,ironclaw-fiddler,krill-swarm,moon-jelly,nautilus-drifter,orca-vanguard,parrotfish,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7680 games in 53 s.

- The list (23): Clownfish Scout, Conch Crawler, Coral Current Eel, Coral Polyp Colony, Coral Reef Shark, Crown-of-thorns Star, Dolphin Outrider, Giant Clam, Grey Seal Bull, Ironclaw Fiddler, Krill Swarm, Moon Jelly, Nautilus Drifter, Orca Vanguard, Parrotfish, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Bass, Sea Turtle Elder, Tide Seahorse, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (18 copies at 0 Lumber); tide x20; poison x6 | 95% (93%-98%) | 0.1 | 0: 18, 1: 2 | 4x Clownfish Scout, 4x Moon Jelly, 4x Parrotfish, 3x Dolphin Outrider, 3x Krill Swarm, 2x Crown-of-thorns Star | 0 |
| 2 | family:tide | tide x20 | 92% (89%-95%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x Krill Swarm, 4x Parrotfish, 4x Riptide Eel, 3x Dolphin Outrider, 3x Voltaic Eel, 2x Tide Seahorse | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 0.9); tide x20 | 89% (85%-92%) | 0.95 | 0: 9, 1: 3, 2: 8 | 4x Coral Polyp Colony, 4x Coral Reef Shark, 4x Krill Swarm, 4x Sea Turtle Elder, 3x Coral Current Eel, 1x Parrotfish | 16 |
| 4 | family:armor | tide x20; armor x8 | 86% (82%-90%) | 0.35 | 0: 13, 1: 7 | 4x Clownfish Scout, 4x Conch Crawler, 4x Giant Clam, 3x Coral Current Eel, 3x Dolphin Outrider, 2x Pincushion Urchin | 13 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 100% | 100% | 100% | 100% | 92% | 100% | 96% | 100% | 96% | 71% |
| 2 family:tide | 96% | 88% | 100% | 100% | 100% | 100% | 88% | 100% | 88% | 96% | 71% | 75% |
| 3 big | 96% | 96% | 96% | 100% | 96% | 92% | 96% | 96% | 96% | 88% | 75% | 38% |
| 4 family:armor | 88% | 96% | 100% | 100% | 96% | 100% | 88% | 83% | 88% | 83% | 58% | 54% |
