# Focused decks: Map 10 The Sunken Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,coral-current-eel,coral-polyp-colony,giant-clam,krill-swarm,mantis-shrimp,moon-jelly,orca-vanguard,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 79 s.

- The list (12): Blue-ringed Octopus, Coral Current Eel, Coral Polyp Colony, Giant Clam, Krill Swarm, Mantis Shrimp, Moon Jelly, Orca Vanguard, Reef Admiral, Reef Shark, Riptide Eel, Sea Turtle Elder.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x17 | 94% (91%-97%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Coral Polyp Colony, 4x Krill Swarm, 4x Sea Turtle Elder, 3x Blue-ringed Octopus, 3x Coral Current Eel, 2x Reef Admiral | 10 |
| 2 | open | tide x17 | 84% (80%-89%) | 0.7 | 0: 8, 1: 10, 2: 2 | 4x Coral Polyp Colony, 4x Moon Jelly, 4x Riptide Eel, 3x Blue-ringed Octopus, 3x Coral Current Eel, 2x Reef Shark | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); tide x18 | 84% (80%-88%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Coral Polyp Colony, 4x Krill Swarm, 4x Orca Vanguard, 4x Reef Shark, 2x Blue-ringed Octopus, 2x Moon Jelly | 10 |
| 4 | family:armor | big (10 copies at 2+ Lumber, average 1.4); tide x20; armor x8 | 80% (76%-85%) | 1.45 | 0: 4, 1: 6, 2: 7, 3: 3 | 4x Coral Polyp Colony, 4x Giant Clam, 4x Sea Turtle Elder, 3x Orca Vanguard, 3x Reef Shark, 2x Reef Admiral | 14 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 96% | 96% | 100% | 63% |
| 2 open | 88% | 96% | 98% | 96% | 88% | 90% | 77% | 44% |
| 3 big | 100% | 96% | 96% | 100% | 85% | 96% | 77% | 21% |
| 4 family:armor | 100% | 96% | 88% | 96% | 79% | 92% | 71% | 21% |
