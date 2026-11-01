# Focused decks: Map 10 The Sunken Depths (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,hagfish-silencer,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,reef-admiral,riptide-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6944 games in 105 s.

- The list (15): Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Hagfish Silencer, Kraken Spawnling, Mangrove Manatee, Nautilus Drifter, Orca Vanguard, Parrotfish, Reef Admiral, Riptide Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); tide x14; economy x7 | 90% (86%-94%) | 0.45 | 0: 11, 1: 9 | 4x Coral Polyp Colony, 4x Parrotfish, 3x Clownfish Scout, 3x Hagfish Silencer, 3x Mangrove Manatee, 3x Nautilus Drifter | 10 |
| 2 | family:tide | economy (4 resource makers); tide x20 | 89% (85%-93%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Coral Polyp Colony, 4x Parrotfish, 4x Riptide Eel, 3x Clownfish Scout, 3x Coral Reef Shark, 2x Reef Admiral | 13 |
| 3 | open | big (3 copies at 3+ Lumber, average 1.3); economy (7 resource makers); tide x8; economy x7 | 88% (84%-92%) | 1.3 | 0: 4, 1: 9, 2: 4, 3: 3 | 4x Coral Polyp Colony, 4x Coral Reef Shark, 3x Blue-ringed Octopus, 3x Hagfish Silencer, 3x Kraken Spawnling, 3x Nautilus Drifter | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); economy (4 resource makers); tide x16; cleave x8 | 69% (64%-75%) | 1.55 | 0: 8, 1: 1, 2: 3, 3: 8 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Coral Reef Shark, 1x Reef Admiral | 10 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 94% | 77% | 85% | 96% | 96% | 75% |
| 2 family:tide | 100% | 96% | 92% | 96% | 77% | 88% | 100% | 63% |
| 3 open | 100% | 96% | 100% | 67% | 88% | 96% | 96% | 63% |
| 4 big | 96% | 79% | 83% | 54% | 75% | 79% | 75% | 13% |
