# Focused decks: Map 10 Coral Current (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool clownfish-scout,conch-crawler,coral-current-eel,coral-polyp-colony,crown-of-thorns-star,dolphin-knight,giant-clam,ironclaw-fiddler,krill-swarm,moon-jelly,nautilus-drifter,orca-vanguard,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-bass,sea-turtle-elder,tide-spirit,voltaic-eel --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3528 games in 413 s.

- The list (20): Clownfish Scout, Conch Crawler, Coral Current Eel, Coral Polyp Colony, Crown-of-thorns Star, Dolphin Outrider, Giant Clam, Ironclaw Fiddler, Krill Swarm, Moon Jelly, Nautilus Drifter, Orca Vanguard, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Bass, Sea Turtle Elder, Tide Seahorse, Voltaic Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x20 | 93% (90%-96%) | 0.2 | 0: 16, 1: 4 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Krill Swarm, 4x Riptide Eel, 3x Dolphin Outrider, 1x Tide Seahorse | 10 |
| 2 | open | swarm (14 copies at 0 Lumber); tide x20; spite x8 | 93% (90%-96%) | 0.3 | 0: 14, 1: 6 | 4x Crown-of-thorns Star, 4x Krill Swarm, 4x Pincushion Urchin, 3x Coral Polyp Colony, 3x Dolphin Outrider, 2x Reef Admiral | 0 |
| 3 | family:armor | tide x20; armor x11 | 83% (79%-87%) | 0.8 | 0: 11, 1: 2, 2: 7 | 4x Clownfish Scout, 4x Conch Crawler, 4x Sea Turtle Elder, 3x Dolphin Outrider, 3x Ironclaw Fiddler, 2x Coral Current Eel | 17 |
| 4 | big | big (10 copies at 2+ Lumber, average 1.0); tide x20 | 82% (78%-86%) | 1 | 0: 10, 2: 10 | 4x Clownfish Scout, 4x Reef Shark, 3x Coral Polyp Colony, 3x Dolphin Outrider, 3x Ironclaw Fiddler, 3x Voltaic Eel | 14 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 96% | 96% | 100% | 100% | 100% | 100% | 88% | 100% | 75% | 63% |
| 2 open | 100% | 100% | 92% | 100% | 100% | 96% | 100% | 96% | 88% | 100% | 79% | 67% |
| 3 family:armor | 96% | 96% | 88% | 79% | 96% | 92% | 100% | 92% | 88% | 75% | 63% | 33% |
| 4 big | 100% | 100% | 83% | 79% | 96% | 96% | 100% | 79% | 63% | 83% | 54% | 50% |
