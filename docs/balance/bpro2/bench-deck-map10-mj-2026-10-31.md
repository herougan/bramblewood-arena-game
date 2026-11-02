# Focused decks: Map 10 The Sunken Depths (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,hagfish-silencer,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,reef-admiral,riptide-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6912 games in 105 s.

- The list (15): Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Hagfish Silencer, Kraken Spawnling, Mangrove Manatee, Nautilus Drifter, Orca Vanguard, Parrotfish, Reef Admiral, Riptide Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (6 resource makers); tide x10; economy x6 | 93% (90%-97%) | 0.65 | 0: 7, 1: 13 | 4x Clownfish Scout, 4x Electric Ray, 3x Blue-ringed Octopus, 3x Coral Polyp Colony, 3x Mangrove Manatee, 3x Nautilus Drifter | 0 |
| 2 | family:tide | economy (4 resource makers); tide x17 | 90% (86%-94%) | 0.6 | 0: 8, 1: 12 | 4x Coral Polyp Colony, 4x Parrotfish, 4x Riptide Eel, 3x Electric Ray, 3x Mangrove Manatee, 2x Reef Admiral | 11 |
| 3 | economy | economy (7 resource makers); tide x14; economy x7 | 90% (86%-94%) | 0.45 | 0: 11, 1: 9 | 4x Coral Polyp Colony, 4x Parrotfish, 3x Clownfish Scout, 3x Hagfish Silencer, 3x Mangrove Manatee, 3x Nautilus Drifter | 8 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); economy (7 resource makers); tide x13; cleave x12 | 78% (72%-83%) | 1.4 | 0: 8, 1: 4, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 4x Parrotfish, 3x Nautilus Drifter, 1x Reef Admiral | 14 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 100% | 96% | 85% | 100% | 100% | 71% |
| 2 family:tide | 100% | 96% | 92% | 96% | 85% | 100% | 98% | 54% |
| 3 economy | 100% | 100% | 94% | 77% | 85% | 92% | 96% | 75% |
| 4 big | 100% | 83% | 88% | 75% | 58% | 88% | 90% | 40% |
