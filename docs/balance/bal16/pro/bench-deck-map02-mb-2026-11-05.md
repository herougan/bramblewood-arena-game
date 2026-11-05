# Focused decks: Map 2 Pebble Beach (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool alley-cat,badger-lumberjack,beaver-lumberjack,bee-forager,bramble-sprout,burrow-rabbit,cobalt-talon-fledgling,conch-herald,cricket-drummer,crimson-wing-recruit,driftwood-crab,duck-paddler,fleetfootd,gull-thief,guppy,moon-jelly,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,river-carp,robin-redbreast,rock-pool-starfish,terrier-pup,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:tide,family:flying,open --anchor badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-herald,cricket-drummer,driftwood-crab,gull-thief,moon-jelly,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7024 games in 92 s.

- The list (25): Alley Cat, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bramble Sprout, Burrow Rabbit, Cobalt Fledgling, Conch Herald, Cricket Drummer, Crimson Recruit, Driftwood Crab, Duck Paddler, Fleetfoot'd, Gull Thief, Guppy, Moon Jelly, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, River Carp, Robin Redbreast, Rock Pool Starfish, Terrier Pup, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (14 copies at 0 Lumber); rally x8 | 87% (83%-91%) | 0.3 | 0: 14, 1: 6 | 4x Conch Herald, 4x Cricket Drummer, 4x Duck Paddler, 3x Alley Cat, 3x Burrow Rabbit, 2x Oystercatcher | 0 |
| 2 | family:tide | swarm (16 copies at 0 Lumber); tide x12 | 73% (68%-79%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Sprout, 4x Conch Herald, 4x Crimson Recruit, 4x Fleetfoot'd, 4x Moon Jelly | 16 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x8 | 69% (64%-74%) | 0.3 | 0: 14, 1: 6 | 4x Badger Lumberjack, 4x Cricket Drummer, 4x Pincushion Urchin, 4x Robin Redbreast, 2x Crimson Recruit, 2x Oystercatcher | 14 |
| 4 | economy | big (8 copies at 1 Lumber, average 0.4); economy (6 resource makers); tide x11 | 64% (58%-70%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Conch Herald, 4x Open-Ocean Hermit Crab, 3x Duck Paddler, 3x Guppy, 2x Gull Thief | 13 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 92% | 71% | 100% | 42% | 92% |
| 2 family:tide | 100% | 83% | 88% | 88% | 58% | 92% | 21% | 58% |
| 3 family:flying | 92% | 83% | 100% | 71% | 50% | 100% | 4% | 50% |
| 4 economy | 75% | 79% | 88% | 79% | 21% | 88% | 25% | 58% |
