# Focused decks: Map 10 The Sunken Depths (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,alley-cat,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,crown-of-thorns-star,giant-clam,great-barracuda,grey-seal-bull,hagfish-silencer,humpback-elder,kraken-spawnling,krill-swarm,mangrove-manatee,moon-jelly,mudpuppy,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,parrotfish,pincushion-urchin,reef-admiral,riptide-eel,tide-spirit,whale-shark,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cleave,big,open --anchor abyss-lantern-squid,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,giant-clam,great-barracuda,hagfish-silencer,humpback-elder,kraken-spawnling,moon-jelly,nautilus-drifter,orca-vanguard,reef-admiral,riptide-eel,whale-shark --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9040 games in 110 s.

- The list (30): Abyss Lantern Squid, Alley Cat, Barnacle Fortress, Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Conger Eel, Coral Polyp Colony, Crown-of-thorns Star, Giant Clam, Great Barracuda, Grey Seal Bull, Hagfish Silencer, Humpback Elder, Kraken Spawnling, Krill Swarm, Mangrove Manatee, Moon Jelly, Mudpuppy, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Parrotfish, Pincushion Urchin, Reef Admiral, Riptide Eel, Tide Seahorse, Whale Shark, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | tide x18 | 93% (90%-97%) | 0.5 | 0: 10, 1: 10 | 4x Abyss Lantern Squid, 4x Conger Eel, 4x Krill Swarm, 4x Pincushion Urchin, 2x Coral Polyp Colony, 2x Nautilus Drifter | 0 |
| 2 | family:cleave | swarm (15 copies at 0 Lumber); tide x14; cleave x8 | 90% (87%-94%) | 0.25 | 0: 15, 1: 5 | 4x Alley Cat, 4x Clownfish Scout, 4x Parrotfish, 3x Abyss Lantern Squid, 3x Coral Polyp Colony, 2x Nautilus Drifter | 13 |
| 3 | family:tide | tide x20 | 89% (85%-92%) | 0.5 | 0: 10, 1: 10 | 4x Coral Polyp Colony, 4x Crown-of-thorns Star, 3x Clownfish Scout, 3x Krill Swarm, 3x Mangrove Manatee, 3x Whale Shark | 15 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); tide x18 | 79% (75%-84%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Clownfish Scout, 4x Humpback Elder, 4x Orca Vanguard, 3x Krill Swarm, 3x Mangrove Manatee, 2x Nautilus Drifter | 15 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 75% | 100% | 100% | 96% | 75% |
| 2 family:cleave | 100% | 100% | 100% | 58% | 100% | 100% | 100% | 63% |
| 3 family:tide | 100% | 100% | 100% | 79% | 100% | 88% | 92% | 50% |
| 4 big | 100% | 100% | 100% | 33% | 92% | 88% | 83% | 38% |
