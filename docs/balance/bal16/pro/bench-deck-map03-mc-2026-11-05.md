# Focused decks: Map 3 Gannet Cliffs (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool alley-cat,bee-forager,bramble-sprout,cobalt-talon-fledgling,conch-crawler,conch-herald,crimson-wing-recruit,driftwood-crab,duck-paddler,feral-tomcat,fiddler-crab-swarm,fleetfootd,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,mosswing-laborer,oystercatcher,peak-condor,peregrine-stooper,pincushion-urchin,puffin-diver,razorbill,red-billed-chough,river-carp,rock-pool-starfish,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:tide,open --anchor conch-crawler,conch-herald,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,oystercatcher,peak-condor,peregrine-stooper,pincushion-urchin,puffin-diver,razorbill,red-billed-chough --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7300 games in 145 s.

- The list (28): Alley Cat, Bee Forager, Bramble Sprout, Cobalt Fledgling, Conch Crawler, Conch Herald, Crimson Recruit, Driftwood Crab, Duck Paddler, Tomcat, Fiddler Crab Swarm, Fleetfoot'd, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Mosswing, Oystercatcher, Peak Condor, Peregrine Stooper, Pincushion Urchin, Puffin Diver, Razorbill, Red-billed Chough, River Carp, Rock Pool Starfish, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (12 copies at 1 Lumber, average 0.6); tide x12; flying x8 | 84% (80%-88%) | 0.6 | 0: 8, 1: 12 | 4x Bramble Sprout, 4x Conch Crawler, 4x Conch Herald, 4x Hawk Arrowkeeper, 4x Puffin Diver | 11 |
| 2 | family:flying | big (8 copies at 1 Lumber, average 0.4); flying x9; tide x7 | 82% (77%-86%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Driftwood Crab, 4x Hawk Arrowkeeper, 3x Fleetfoot'd, 3x Kittiwake Flock, 2x Gannet Nestweaver | 12 |
| 3 | open | big (9 copies at 1 Lumber, average 0.5); economy (4 resource makers); flying x14; tide x6 | 76% (71%-81%) | 0.45 | 0: 11, 1: 9 | 4x Gannet Nestweaver, 4x Kittiwake Flock, 3x Bramble Sprout, 3x Conch Herald, 3x Puffin Diver, 3x Razorbill | 0 |
| 4 | economy | big (10 copies at 1 Lumber, average 0.5); economy (6 resource makers); flying x16; tide x7 | 70% (65%-75%) | 0.5 | 0: 10, 1: 10 | 4x Cobalt Fledgling, 4x Conch Herald, 4x Gannet Nestweaver, 3x Hawk Arrowkeeper, 3x Puffin Diver, 2x Gull Thief | 10 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 96% | 92% | 88% | 88% | 96% | 100% | 79% | 100% | 33% | 71% |
| 2 family:flying | 83% | 96% | 92% | 88% | 88% | 83% | 71% | 96% | 46% | 75% |
| 3 open | 88% | 71% | 88% | 71% | 79% | 88% | 63% | 100% | 42% | 71% |
| 4 economy | 58% | 75% | 79% | 63% | 75% | 92% | 71% | 100% | 21% | 67% |
