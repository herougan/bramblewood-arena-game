# Focused decks: Map 10 The Sunken Depths (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,riptide-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6976 games in 99 s.

- The list (13): Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Kraken Spawnling, Mangrove Manatee, Nautilus Drifter, Orca Vanguard, Parrotfish, Riptide Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); tide x13; economy x7 | 95% (92%-98%) | 0.4 | 0: 12, 1: 8 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Electric Ray, 4x Parrotfish, 3x Nautilus Drifter, 1x Mangrove Manatee | 6 |
| 2 | family:tide | economy (6 resource makers); tide x14; economy x6 | 91% (88%-95%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Coral Polyp Colony, 4x Coral Reef Shark, 4x Electric Ray, 3x Clownfish Scout, 3x Mangrove Manatee, 2x Nautilus Drifter | 7 |
| 3 | open | economy (7 resource makers); tide x7; economy x7 | 91% (88%-95%) | 0.95 | 0: 7, 1: 10, 3: 3 | 4x Coral Polyp Colony, 4x Electric Ray, 3x Blue-ringed Octopus, 3x Clownfish Scout, 3x Kraken Spawnling, 3x Nautilus Drifter | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.5); economy (7 resource makers); tide x13; cleave x8 | 78% (73%-84%) | 1.5 | 0: 6, 1: 6, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Mangrove Manatee, 3x Nautilus Drifter, 2x Clownfish Scout | 8 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 96% | 79% | 100% | 100% | 100% | 85% |
| 2 family:tide | 96% | 90% | 92% | 88% | 96% | 100% | 100% | 71% |
| 3 open | 100% | 100% | 100% | 83% | 83% | 96% | 96% | 73% |
| 4 big | 88% | 71% | 73% | 75% | 83% | 92% | 94% | 50% |
