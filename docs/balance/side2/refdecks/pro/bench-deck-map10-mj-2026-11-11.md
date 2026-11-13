# Focused decks: Map 10 The Sunken Depths (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool alley-cat,blue-ringed-octopus,colossal-squid,coral-current-eel,coral-polyp-colony,crown-of-thorns-star,electric-ray,giant-clam,great-barracuda,krill-swarm,mangrove-manatee,mantis-shrimp,moon-jelly,mudpuppy,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cleave,big,open --anchor blue-ringed-octopus,coral-current-eel,coral-polyp-colony,giant-clam,krill-swarm,mantis-shrimp,moon-jelly,orca-vanguard,reef-admiral,reef-shark,riptide-eel,sea-turtle-elder --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6832 games in 116 s.

- The list (24): Alley Cat, Blue-ringed Octopus, Colossal Squid, Coral Current Eel, Coral Polyp Colony, Crown-of-thorns Star, Electric Ray, Giant Clam, Great Barracuda, Krill Swarm, Mangrove Manatee, Mantis Shrimp, Moon Jelly, Mudpuppy, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Reef Shark, Riptide Eel, Sea Turtle Elder, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | tide x13 | 95% (92%-97%) | 0.6 | 0: 8, 1: 12 | 4x Coral Polyp Colony, 4x Electric Ray, 4x Krill Swarm, 3x Blue-ringed Octopus, 3x Coral Current Eel, 2x Crown-of-thorns Star | 0 |
| 2 | family:tide | swarm (14 copies at 0 Lumber); tide x14 | 89% (85%-92%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Coral Polyp Colony, 4x Krill Swarm, 4x Riptide Eel, 2x Blue-ringed Octopus, 2x Tide Seahorse | 10 |
| 3 | family:cleave | swarm (14 copies at 0 Lumber); tide x14; cleave x8 | 87% (83%-91%) | 0.8 | 0: 14, 2: 2, 3: 4 | 4x Alley Cat, 4x Coral Polyp Colony, 4x Orca Vanguard, 4x Pincushion Urchin, 2x Mudpuppy, 2x Reef Shark | 16 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 63% |
| 2 family:tide | 96% | 100% | 94% | 100% | 100% | 96% | 92% | 33% |
| 3 family:cleave | 88% | 92% | 96% | 100% | 96% | 98% | 92% | 33% |
