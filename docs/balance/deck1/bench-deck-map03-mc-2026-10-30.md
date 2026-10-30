# Focused decks: Map 3 Gannet Cliffs (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool bee-forager,bramble-sprout,cobalt-talon-fledgling,conch-crawler,conch-herald,crimson-wing-recruit,driftwood-crab,duck-paddler,feral-tomcat,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,mosswing-laborer,oystercatcher,peak-condor,peregrine-stooper,pincushion-urchin,puffin-diver,razorbill,red-billed-chough,river-carp,rock-pool-starfish,terrier-pup --max-unique 6 --max-copies 4 --budget 24000 --final-games 24 --seed deck1-recheck --focus economy,big,swarm,open --anchor conch-crawler,conch-herald,feral-tomcat,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,peak-condor,peregrine-stooper,puffin-diver,razorbill,red-billed-chough --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 25320 games in 302 s.

- The list (25): Bee Forager, Bramble Sprout, Cobalt Fledgling, Conch Crawler, Conch Herald, Crimson Recruit, Driftwood Crab, Duck Paddler, Tomcat, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Mosswing, Oystercatcher, Peak Condor, Peregrine Stooper, Pincushion Urchin, Puffin Diver, Razorbill, Red-billed Chough, River Carp, Rock Pool Starfish, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (10 copies at 1 Lumber, average 0.5); flying x14; strike-first x6 | 75% (70%-79%) | 0.5 | 0: 10, 1: 10 | 4x Crimson Recruit, 4x Golden Eagle Diver, 4x Peak Condor, 3x Conch Crawler, 3x Driftwood Crab, 2x Peregrine Stooper | 10 |
| 2 | economy | big (11 copies at 1 Lumber, average 0.6); economy (6 resource makers); flying x12; strike-first x7 | 73% (69%-78%) | 0.55 | 0: 9, 1: 11 | 4x Conch Herald, 4x Driftwood Crab, 4x Peregrine Stooper, 3x Golden Eagle Diver, 3x Kittiwake Flock, 2x Gannet Nestweaver | 15 |
| 3 | open | big (8 copies at 1 Lumber, average 0.4); flying x11; strike-first x7 | 67% (61%-72%) | 0.4 | 0: 12, 1: 8 | 4x Golden Eagle Diver, 4x Peak Condor, 4x River Carp, 3x Tomcat, 3x Gannet Nestweaver, 2x Conch Crawler | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); tide x6; strike-first x6 | 61% (56%-67%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Sprout, 4x Tomcat, 4x Peak Condor, 4x Pincushion Urchin, 2x Conch Crawler, 2x Peregrine Stooper | 11 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 75% | 79% | 71% | 63% | 79% | 83% | 88% | 88% | 21% | 100% |
| 2 economy | 83% | 67% | 92% | 58% | 75% | 88% | 63% | 96% | 13% | 100% |
| 3 open | 63% | 54% | 75% | 67% | 75% | 79% | 54% | 83% | 21% | 96% |
| 4 swarm | 42% | 42% | 63% | 46% | 75% | 83% | 50% | 92% | 21% | 100% |
