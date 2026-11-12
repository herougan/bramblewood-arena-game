# Focused decks: Map 10 Coral Current (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool clownfish-scout,conch-crawler,coral-current-eel,crown-of-thorns-star,dolphin-knight,giant-clam,ironclaw-fiddler,krill-swarm,moon-jelly,orca-vanguard,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder,voltaic-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7608 games in 61 s.

- The list (16): Clownfish Scout, Conch Crawler, Coral Current Eel, Crown-of-thorns Star, Dolphin Outrider, Giant Clam, Ironclaw Fiddler, Krill Swarm, Moon Jelly, Orca Vanguard, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Turtle Elder, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber); tide x20; spite x8 | 94% (92%-97%) | 0.2 | 0: 16, 1: 4 | 4x Crown-of-thorns Star, 4x Krill Swarm, 4x Pincushion Urchin, 3x Dolphin Outrider, 3x Moon Jelly, 2x Conch Crawler | 14 |
| 2 | family:armor | swarm (14 copies at 0 Lumber); tide x20; armor x8 | 89% (86%-92%) | 0.3 | 0: 14, 1: 6 | 4x Clownfish Scout, 4x Conch Crawler, 4x Giant Clam, 3x Dolphin Outrider, 3x Krill Swarm, 2x Coral Current Eel | 12 |
| 3 | open | tide x20 | 88% (85%-91%) | 0.85 | 0: 10, 1: 3, 2: 7 | 4x Moon Jelly, 4x Sea Turtle Elder, 3x Clownfish Scout, 3x Coral Current Eel, 3x Dolphin Outrider, 3x Voltaic Eel | 0 |
| 4 | big | big (10 copies at 2+ Lumber, average 1.0); tide x20 | 82% (78%-86%) | 1 | 0: 10, 2: 10 | 4x Clownfish Scout, 4x Reef Shark, 3x Dolphin Outrider, 3x Ironclaw Fiddler, 3x Krill Swarm, 3x Voltaic Eel | 11 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 96% | 100% | 100% | 96% | 100% | 100% | 96% | 88% | 96% | 83% | 79% |
| 2 family:armor | 100% | 96% | 100% | 100% | 100% | 92% | 100% | 92% | 63% | 96% | 71% | 58% |
| 3 open | 100% | 92% | 96% | 100% | 100% | 100% | 96% | 96% | 83% | 83% | 58% | 54% |
| 4 big | 79% | 83% | 100% | 100% | 96% | 96% | 100% | 83% | 67% | 75% | 50% | 54% |
