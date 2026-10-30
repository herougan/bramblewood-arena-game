# Focused decks: Map 3 Gannet Cliffs (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool bee-forager,bramble-sprout,cobalt-talon-fledgling,conch-crawler,conch-herald,crimson-wing-recruit,driftwood-crab,duck-paddler,feral-tomcat,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,mosswing-laborer,oystercatcher,peak-condor,peregrine-stooper,pincushion-urchin,puffin-diver,razorbill,red-billed-chough,river-carp,rock-pool-starfish,terrier-pup --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor conch-crawler,conch-herald,feral-tomcat,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,peak-condor,peregrine-stooper,puffin-diver,razorbill,red-billed-chough --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12920 games in 186 s.

- The list (25): Bee Forager, Bramble Sprout, Cobalt Fledgling, Conch Crawler, Conch Herald, Crimson Recruit, Driftwood Crab, Duck Paddler, Tomcat, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Mosswing, Oystercatcher, Peak Condor, Peregrine Stooper, Pincushion Urchin, Puffin Diver, Razorbill, Red-billed Chough, River Carp, Rock Pool Starfish, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (13 copies at 1 Lumber, average 0.7); flying x10; strike-first x8 | 72% (67%-77%) | 0.65 | 0: 7, 1: 13 | 4x Duck Paddler, 4x Golden Eagle Diver, 4x Peregrine Stooper, 3x Conch Herald, 3x Terrier Pup, 2x Razorbill | 0 |
| 2 | big | big (14 copies at 1 Lumber, average 0.7); flying x16; day x8 | 71% (66%-76%) | 0.7 | 0: 6, 1: 14 | 4x Conch Herald, 4x Golden Eagle Diver, 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 2x Gannet Nestweaver, 2x Razorbill | 11 |
| 3 | economy | big (10 copies at 1 Lumber, average 0.5); economy (8 resource makers); flying x16; strike-first x8 | 64% (59%-69%) | 0.5 | 0: 10, 1: 10 | 4x Driftwood Crab, 4x Gannet Nestweaver, 4x Golden Eagle Diver, 4x Peregrine Stooper, 2x Cobalt Fledgling, 2x Puffin Diver | 12 |
| 4 | swarm | swarm (16 copies at 0 Lumber); flying x10 | 60% (55%-66%) | 0.2 | 0: 16, 1: 4 | 4x Crimson Recruit, 4x Tomcat, 4x Peak Condor, 3x Duck Paddler, 3x Pincushion Urchin, 2x Gannet Nestweaver | 17 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 67% | 83% | 83% | 67% | 83% | 83% | 67% | 88% | 4% | 96% |
| 2 big | 67% | 63% | 79% | 67% | 83% | 67% | 79% | 92% | 13% | 100% |
| 3 economy | 63% | 83% | 71% | 50% | 79% | 75% | 46% | 71% | 4% | 100% |
| 4 swarm | 58% | 54% | 79% | 46% | 71% | 67% | 54% | 75% | 8% | 92% |
