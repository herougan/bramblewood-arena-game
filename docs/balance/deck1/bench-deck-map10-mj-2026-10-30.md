# Focused decks: Map 10 The Sunken Depths (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool alley-cat,blue-ringed-octopus,cleaner-wrasse,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,giant-cave-huntsman,great-barracuda,kraken-spawnling,lionfish,mangrove-manatee,mudpuppy,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,parrotfish,riptide-eel,sawfish,swordfish-spearman,whale-shark,wolf-spider-mother,yellow-bellied-sea-snake --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,riptide-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12768 games in 233 s.

- The list (25): Alley Cat, Blue-ringed Octopus, Cleaner Wrasse, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Giant Cave Huntsman, Great Barracuda, Kraken Spawnling, Lionfish, Mangrove Manatee, Mudpuppy, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Parrotfish, Riptide Eel, Sawfish, Swordfish Spearman, Whale Shark, Wolf Spider Mother, Yellow-bellied Sea Snake.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); tide x10; heal x7 | 94% (91%-97%) | 0.6 | 0: 8, 1: 12 | 4x Coral Polyp Colony, 4x Mudpuppy, 3x Giant Cave Huntsman, 3x Great Barracuda, 3x Mangrove Manatee, 3x Wolf Spider Mother | 0 |
| 2 | economy | economy (7 resource makers); tide x7; economy x7 | 92% (89%-96%) | 0.65 | 0: 7, 1: 13 | 4x Coral Polyp Colony, 4x Electric Ray, 3x Blue-ringed Octopus, 3x Nautilus Drifter, 3x Otter Centurion, 3x Whale Shark | 16 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (6 resource makers); tide x7; cleave x7 | 91% (88%-95%) | 0.6 | 0: 14, 1: 3, 3: 3 | 4x Newt Doctor, 4x Parrotfish, 3x Coral Polyp Colony, 3x Kraken Spawnling, 3x Nautilus Drifter, 3x Otter Centurion | 17 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); tide x13; cleave x11 | 74% (69%-80%) | 1.35 | 0: 9, 1: 3, 3: 8 | 4x Kraken Spawnling, 4x Orca Vanguard, 3x Coral Polyp Colony, 3x Otter Centurion, 3x Parrotfish, 3x Swordfish Spearman | 17 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 83% | 96% | 96% | 100% | 83% |
| 2 economy | 100% | 96% | 100% | 75% | 88% | 96% | 100% | 83% |
| 3 swarm | 100% | 92% | 96% | 79% | 94% | 100% | 96% | 75% |
| 4 big | 96% | 96% | 79% | 58% | 58% | 79% | 71% | 58% |
