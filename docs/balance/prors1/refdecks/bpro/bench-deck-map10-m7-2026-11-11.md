# Focused decks: Map 10 Coral Current (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool clownfish-scout,conch-crawler,coral-current-eel,coral-reef-shark,crown-of-thorns-star,dolphin-knight,giant-clam,grey-seal-bull,ironclaw-fiddler,krill-swarm,moon-jelly,nautilus-drifter,orca-vanguard,parrotfish,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7680 games in 78 s.

- The list (22): Clownfish Scout, Conch Crawler, Coral Current Eel, Coral Reef Shark, Crown-of-thorns Star, Dolphin Outrider, Giant Clam, Grey Seal Bull, Ironclaw Fiddler, Krill Swarm, Moon Jelly, Nautilus Drifter, Orca Vanguard, Parrotfish, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Bass, Sea Turtle Elder, Tide Seahorse, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber); tide x20 | 96% (94%-98%) | 0.25 | 0: 15, 1: 5 | 4x Conch Crawler, 4x Moon Jelly, 4x Pincushion Urchin, 3x Coral Current Eel, 3x Dolphin Outrider, 2x Reef Admiral | 0 |
| 2 | family:tide | tide x20; armor x7 | 85% (81%-88%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Crown-of-thorns Star, 4x Sea Bass, 4x Sea Turtle Elder, 3x Conch Crawler, 3x Dolphin Outrider, 2x Clownfish Scout | 14 |
| 3 | family:armor | tide x20; armor x8 | 82% (77%-86%) | 0.5 | 0: 10, 1: 10 | 4x Conch Crawler, 4x Giant Clam, 4x Parrotfish, 3x Coral Current Eel, 3x Crown-of-thorns Star, 2x Dolphin Outrider | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.9); tide x20 | 79% (74%-83%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Clownfish Scout, 4x Reef Shark, 4x Sea Turtle Elder, 3x Dolphin Outrider, 3x Pincushion Urchin, 2x Coral Current Eel | 12 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 83% | 71% |
| 2 family:tide | 83% | 96% | 83% | 100% | 96% | 100% | 92% | 96% | 83% | 83% | 71% | 33% |
| 3 family:armor | 88% | 71% | 96% | 100% | 79% | 96% | 88% | 96% | 75% | 83% | 58% | 50% |
| 4 big | 83% | 83% | 96% | 92% | 83% | 100% | 63% | 92% | 75% | 75% | 42% | 63% |
