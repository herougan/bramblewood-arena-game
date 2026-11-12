# Focused decks: Map 10 The Sunken Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,coral-current-eel,giant-clam,kraken-spawnling,krill-swarm,moon-jelly,orca-vanguard,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6944 games in 92 s.

- The list (11): Blue-ringed Octopus, Coral Current Eel, Giant Clam, Kraken Spawnling, Krill Swarm, Moon Jelly, Orca Vanguard, Reef Admiral, Reef Shark, Riptide Eel, Sea Turtle Elder.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (8 copies at 2+ Lumber, average 1.4); tide x17 | 78% (73%-83%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Krill Swarm, 4x Orca Vanguard, 4x Sea Turtle Elder, 3x Blue-ringed Octopus, 3x Coral Current Eel, 2x Reef Admiral | 12 |
| 2 | open | tide x17 | 65% (59%-71%) | 0.6 | 0: 8, 1: 12 | 4x Giant Clam, 4x Krill Swarm, 4x Moon Jelly, 4x Riptide Eel, 3x Blue-ringed Octopus, 1x Coral Current Eel | 0 |
| 3 | family:armor | big (12 copies at 2+ Lumber, average 1.8); tide x13; armor x8 | 58% (53%-64%) | 1.8 | 1: 8, 2: 8, 3: 4 | 4x Giant Clam, 4x Kraken Spawnling, 4x Reef Shark, 4x Sea Turtle Elder, 3x Blue-ringed Octopus, 1x Reef Admiral | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); tide x20 | 58% (52%-63%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Moon Jelly, 4x Reef Shark, 4x Riptide Eel, 4x Sea Turtle Elder, 2x Krill Swarm, 2x Reef Admiral | 10 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 92% | 92% | 100% | 83% | 90% | 79% | 67% | 25% |
| 2 open | 96% | 79% | 83% | 58% | 73% | 71% | 50% | 8% |
| 3 family:armor | 92% | 79% | 96% | 58% | 58% | 50% | 31% | 0% |
| 4 big | 88% | 90% | 85% | 52% | 67% | 46% | 25% | 8% |
