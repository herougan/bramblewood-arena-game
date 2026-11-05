# Focused decks: Map 10 The Sunken Depths (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,hagfish-silencer,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,reef-admiral,riptide-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,family:cleave,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6736 games in 111 s.

- The list (15): Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Hagfish Silencer, Kraken Spawnling, Mangrove Manatee, Nautilus Drifter, Orca Vanguard, Parrotfish, Reef Admiral, Riptide Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x15 | 93% (90%-95%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Coral Reef Shark, 3x Blue-ringed Octopus, 3x Mangrove Manatee, 2x Nautilus Drifter | 10 |
| 2 | open | tide x10 | 93% (90%-95%) | 0.5 | 0: 10, 1: 10 | 4x Clownfish Scout, 4x Electric Ray, 3x Blue-ringed Octopus, 3x Coral Polyp Colony, 3x Hagfish Silencer, 3x Parrotfish | 0 |
| 3 | family:cleave | tide x15; cleave x8 | 89% (86%-92%) | 1 | 0: 8, 1: 8, 3: 4 | 4x Coral Polyp Colony, 4x Orca Vanguard, 4x Parrotfish, 3x Hagfish Silencer, 3x Mangrove Manatee, 2x Nautilus Drifter | 11 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); tide x13; cleave x8 | 86% (83%-89%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Blue-ringed Octopus, 3x Clownfish Scout, 2x Reef Admiral | 11 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 96% | 100% | 100% | 100% | 100% | 100% | 46% |
| 2 open | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 42% |
| 3 family:cleave | 100% | 100% | 100% | 96% | 100% | 96% | 96% | 25% |
| 4 big | 100% | 96% | 100% | 96% | 100% | 92% | 83% | 21% |
