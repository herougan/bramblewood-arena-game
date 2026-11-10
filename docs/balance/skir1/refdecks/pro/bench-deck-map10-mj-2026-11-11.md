# Focused decks: Map 10 The Sunken Depths (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,alley-cat,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,crown-of-thorns-star,electric-ray,giant-clam,great-barracuda,grey-seal-bull,hagfish-silencer,humpback-elder,kraken-spawnling,krill-swarm,mangrove-manatee,moon-jelly,mudpuppy,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,riptide-eel,tide-spirit,whale-shark,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:cleave,big,open --anchor abyss-lantern-squid,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,giant-clam,great-barracuda,hagfish-silencer,humpback-elder,kraken-spawnling,moon-jelly,nautilus-drifter,orca-vanguard,reef-admiral,riptide-eel,whale-shark --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1904 games in 257 s.

- The list (30): Abyss Lantern Squid, Alley Cat, Barnacle Fortress, Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Conger Eel, Coral Polyp Colony, Crown-of-thorns Star, Electric Ray, Giant Clam, Great Barracuda, Grey Seal Bull, Hagfish Silencer, Humpback Elder, Kraken Spawnling, Krill Swarm, Mangrove Manatee, Moon Jelly, Mudpuppy, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Riptide Eel, Tide Seahorse, Whale Shark, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 3+ Lumber, average 1.7); tide x18 | 93% (90%-96%) | 1.7 | 0: 2, 1: 10, 3: 8 | 4x Abyss Lantern Squid, 4x Grey Seal Bull, 4x Humpback Elder, 4x Orca Vanguard, 2x Coral Polyp Colony, 2x Nautilus Drifter | 18 |
| 2 | open | midrange (average 0.7 Lumber) | 93% (90%-96%) | 0.65 | 0: 7, 1: 13 | 4x Barnacle Fortress, 4x Clownfish Scout, 4x Electric Ray, 3x Blue-ringed Octopus, 3x Otter Centurion, 2x Nautilus Drifter | 0 |
| 3 | family:tide | tide x12 | 93% (90%-96%) | 0.8 | 0: 12, 1: 4, 3: 4 | 4x Alley Cat, 4x Coral Polyp Colony, 4x Humpback Elder, 4x Mudpuppy, 3x Great Barracuda, 1x Giant Clam | 20 |
| 4 | family:cleave | tide x11; cleave x8 | 86% (83%-90%) | 1.05 | 0: 7, 1: 9, 3: 4 | 4x Abyss Lantern Squid, 4x Alley Cat, 4x Orca Vanguard, 3x Hagfish Silencer, 3x Pincushion Urchin, 2x Nautilus Drifter | 18 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 96% | 100% | 100% | 100% | 96% | 88% | 67% |
| 2 open | 100% | 100% | 100% | 100% | 100% | 100% | 83% | 63% |
| 3 family:tide | 100% | 96% | 100% | 96% | 100% | 100% | 96% | 54% |
| 4 family:cleave | 96% | 100% | 96% | 100% | 100% | 83% | 88% | 29% |
