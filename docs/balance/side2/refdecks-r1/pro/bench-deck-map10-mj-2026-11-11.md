# Focused decks: Map 10 The Sunken Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool alley-cat,blue-ringed-octopus,colossal-squid,coral-current-eel,crown-of-thorns-star,electric-ray,giant-cave-huntsman,giant-clam,great-barracuda,kraken-spawnling,krill-swarm,mangrove-manatee,moon-jelly,mudpuppy,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cleave,big,open --anchor blue-ringed-octopus,coral-current-eel,giant-clam,kraken-spawnling,krill-swarm,moon-jelly,orca-vanguard,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8896 games in 109 s.

- The list (23): Alley Cat, Blue-ringed Octopus, Colossal Squid, Coral Current Eel, Crown-of-thorns Star, Electric Ray, Giant Cave Huntsman, Giant Clam, Great Barracuda, Kraken Spawnling, Krill Swarm, Mangrove Manatee, Moon Jelly, Mudpuppy, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Turtle Elder, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cleave | tide x10; cleave x8 | 90% (86%-94%) | 0.85 | 0: 11, 1: 5, 3: 4 | 4x Alley Cat, 4x Krill Swarm, 4x Orca Vanguard, 3x Giant Cave Huntsman, 3x Mudpuppy, 2x Giant Clam | 12 |
| 2 | family:tide | swarm (16 copies at 0 Lumber); tide x10; heal x7 | 87% (83%-91%) | 0.2 | 0: 16, 1: 4 | 4x Krill Swarm, 4x Mudpuppy, 4x Riptide Eel, 3x Alley Cat, 3x Newt Doctor, 2x Moon Jelly | 11 |
| 3 | open | swarm (14 copies at 0 Lumber); tide x13 | 82% (77%-87%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Krill Swarm, 3x Coral Current Eel, 3x Great Barracuda, 3x Moon Jelly, 3x Otter Centurion | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); tide x12; cleave x8 | 60% (54%-66%) | 1.6 | 0: 4, 1: 8, 3: 8 | 4x Kraken Spawnling, 4x Krill Swarm, 4x Orca Vanguard, 4x Riptide Eel, 2x Electric Ray, 2x Giant Cave Huntsman | 16 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:cleave | 100% | 100% | 100% | 79% | 92% | 100% | 96% | 54% |
| 2 family:tide | 100% | 96% | 100% | 92% | 88% | 92% | 90% | 38% |
| 3 open | 100% | 88% | 100% | 83% | 90% | 79% | 77% | 42% |
| 4 big | 92% | 63% | 90% | 54% | 75% | 67% | 35% | 4% |
